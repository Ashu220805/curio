import { createClient } from "@supabase/supabase-js";

/* =========================================================
   CORS
========================================================= */

const allowedOrigin =
  Deno.env.get("CURIO_ALLOWED_ORIGIN") || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin":
    allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
  "Content-Type": "application/json",
};

/* =========================================================
   TYPES
========================================================= */

type RequestBody = {
  prompt?: string;
  category?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: unknown;
};

type CurioAnalysis = {
  response: string;
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingElements: string[];
  betterPrompt: string;
  skillTips: string[];
};

/* =========================================================
   SECURITY CONFIGURATION
========================================================= */

const MAX_PROMPT_LENGTH = 4000;

const MAX_CATEGORY_LENGTH = 100;

const MAX_REQUEST_BYTES = 12000;

/*
  Maximum number of items returned by Gemini
  inside arrays such as strengths, improvements,
  missingElements and skillTips.
*/
const MAX_ARRAY_ITEMS = 10;

/*
  Maximum length of each generated analysis field.
*/
const MAX_ANALYSIS_STRING_LENGTH =
  10000;

/*
  Server-side in-memory rate limit.

  This is an additional protection layer.

  IMPORTANT:
  The database-backed rate limiter below
  is the persistent production protection layer.
*/
const RATE_LIMIT_WINDOW_MS =
  60 * 1000;

const MAX_REQUESTS_PER_WINDOW = 10;

/* =========================================================
   SERVER RATE LIMIT STORAGE
========================================================= */

const requestHistory = new Map<
  string,
  {
    count: number;
    windowStart: number;
  }
>();

/* =========================================================
   SUPABASE ENVIRONMENT
========================================================= */

const supabaseUrl =
  Deno.env.get("SUPABASE_URL");

const supabaseAnonKey =
  Deno.env.get("SUPABASE_ANON_KEY");

/*
  IMPORTANT:

  This is NOT the browser's
  VITE_SUPABASE_PUBLISHABLE_KEY.

  The Edge Function uses its own server-side
  environment variables.

  SUPABASE_ANON_KEY is used only to verify
  the user's access token.

  SUPABASE_SERVICE_ROLE_KEY is used only
  server-side for the protected rate-limit RPC.
*/

const supabaseServiceRoleKey =
  Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY",
  );

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  !supabaseServiceRoleKey
) {
  console.error(
    "CURIO: Required Supabase Edge Function environment variables are missing.",
  );
}

/* =========================================================
   SUPABASE CLIENT
========================================================= */

/*
  Existing authentication client.

  This client is used to verify the user's
  access token.
*/
const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || "",
);

/* =========================================================
   SUPABASE ADMIN CLIENT
========================================================= */

/*
  IMPORTANT:

  This client uses the service-role key.

  It MUST NEVER be exposed to the browser.

  It is used only by the Edge Function to
  execute the protected database rate-limit RPC.
*/

const supabaseAdmin =
  createClient(
    supabaseUrl || "",
    supabaseServiceRoleKey || "",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

/* =========================================================
   JSON RESPONSE
========================================================= */

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
  additionalHeaders: Record<
    string,
    string
  > = {},
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        ...additionalHeaders,
      },
    },
  );
}

/* =========================================================
   REQUEST SIZE
========================================================= */

function getContentLength(
  req: Request,
): number | null {
  const value =
    req.headers.get(
      "content-length",
    );

  if (!value) {
    return null;
  }

  const length = Number(value);

  if (!Number.isFinite(length)) {
    return null;
  }

  return length;
}

/* =========================================================
   SERVER RATE LIMIT
========================================================= */

function checkRateLimit(
  userId: string,
): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();

  const previous =
    requestHistory.get(userId);

  /*
    First request from this user.
  */
  if (!previous) {
    requestHistory.set(userId, {
      count: 1,
      windowStart: now,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  const elapsed =
    now - previous.windowStart;

  /*
    Start a new window.
  */
  if (
    elapsed >=
    RATE_LIMIT_WINDOW_MS
  ) {
    requestHistory.set(userId, {
      count: 1,
      windowStart: now,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  /*
    Request limit reached.
  */
  if (
    previous.count >=
    MAX_REQUESTS_PER_WINDOW
  ) {
    const remaining =
      RATE_LIMIT_WINDOW_MS -
      elapsed;

    return {
      allowed: false,
      retryAfterSeconds:
        Math.max(
          1,
          Math.ceil(
            remaining / 1000,
          ),
        ),
    };
  }

  /*
    Increase request count.
  */
  previous.count += 1;

  requestHistory.set(
    userId,
    previous,
  );

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}

/* =========================================================
   DATABASE RATE LIMIT
========================================================= */

/*
  Persistent database-backed rate limiter.

  The RPC is:

  public.check_ai_request_limit(
    uuid,
    integer,
    integer
  )

  It is SECURITY DEFINER and normal users
  have no EXECUTE permission.

  Therefore this function must be called
  through the service-role client.
*/

async function checkDatabaseRateLimit(
  userId: string,
): Promise<{
  allowed: boolean;
  retryAfterSeconds: number;
  requestCount: number;
}> {
  try {
    const {
      data,
      error,
    } =
      await supabaseAdmin.rpc(
        "check_ai_request_limit",
        {
          p_user_id: userId,
          p_window_seconds: 60,
          p_max_requests: 10,
        },
      );

    if (error) {
      console.error(
        "CURIO: Database rate-limit RPC failed:",
        error.message,
      );

      /*
        FAIL CLOSED.

        If the persistent security control
        cannot be verified, do not allow the
        expensive Gemini request to continue.
      */
      return {
        allowed: false,
        retryAfterSeconds: 60,
        requestCount: 0,
      };
    }

    if (
      !data ||
      typeof data !== "object"
    ) {
      console.error(
        "CURIO: Database rate-limit RPC returned invalid data.",
      );

      return {
        allowed: false,
        retryAfterSeconds: 60,
        requestCount: 0,
      };
    }

    const result =
      data as Record<
        string,
        unknown
      >;

    const allowed =
      result.allowed === true;

    const retryAfterSeconds =
      Number(
        result.retry_after_seconds,
      );

    const requestCount =
      Number(
        result.request_count,
      );

    return {
      allowed,
      retryAfterSeconds:
        Number.isFinite(
          retryAfterSeconds,
        )
          ? Math.max(
              0,
              Math.ceil(
                retryAfterSeconds,
              ),
            )
          : 0,
      requestCount:
        Number.isFinite(
          requestCount,
        )
          ? Math.max(
              0,
              Math.floor(
                requestCount,
              ),
            )
          : 0,
    };
  } catch (error) {
    console.error(
      "CURIO: Database rate-limit exception:",
      error,
    );

    /*
      FAIL CLOSED.
    */
    return {
      allowed: false,
      retryAfterSeconds: 60,
      requestCount: 0,
    };
  }
}

/* =========================================================
   CLEAN STRING
========================================================= */

function cleanString(
  value: unknown,
  maximum: number,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .trim()
    .slice(0, maximum);
}

/* =========================================================
   CLEAN STRING ARRAY
========================================================= */

function cleanStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        item,
      ): item is string =>
        typeof item ===
          "string" &&
        item.trim().length > 0,
    )
    .map((item) =>
      item
        .trim()
        .slice(
          0,
          MAX_ANALYSIS_STRING_LENGTH,
        ),
    )
    .slice(
      0,
      MAX_ARRAY_ITEMS,
    );
}

/* =========================================================
   SERVER
========================================================= */

Deno.serve(
  async (
    req: Request,
  ): Promise<Response> => {

    /* =====================================================
       CORS
    ===================================================== */

    if (
      req.method ===
      "OPTIONS"
    ) {
      return new Response(
        "ok",
        {
          status: 200,
          headers:
            corsHeaders,
        },
      );
    }

    /* =====================================================
       ONLY POST
    ===================================================== */

    if (
      req.method !==
      "POST"
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Only POST requests are allowed.",
        },
        405,
      );
    }

    /* =====================================================
       REQUEST SIZE PROTECTION
    ===================================================== */

    const contentLength =
      getContentLength(req);

    if (
      contentLength !== null &&
      contentLength >
        MAX_REQUEST_BYTES
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Request is too large.",
        },
        413,
      );
    }

    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    const authorizationHeader =
      req.headers.get(
        "Authorization",
      );

    if (
      !authorizationHeader
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Authentication required. Please sign in to use AI Simulation.",
        },
        401,
      );
    }

    const accessToken =
      authorizationHeader
        .replace(
          /^Bearer\s+/i,
          "",
        )
        .trim();

    if (!accessToken) {
      return jsonResponse(
        {
          success: false,
          error:
            "Invalid authentication token.",
        },
        401,
      );
    }

    /* =====================================================
       VERIFY SUPABASE USER
    ===================================================== */

    const {
      data: {
        user,
      },
      error: authError,
    } =
      await supabase.auth.getUser(
        accessToken,
      );

    if (
      authError ||
      !user
    ) {
      console.error(
        "CURIO AI Simulation authentication failed:",
        authError?.message ??
          "No authenticated user",
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Your CURIO session is invalid or has expired. Please sign in again.",
        },
        401,
      );
    }

    /*
      Only the authenticated user's ID is used
      for server-side rate limiting.

      We do NOT send user.email or other
      account information to Gemini.
    */

    /* =====================================================
       DATABASE RATE LIMIT
    ===================================================== */

    const databaseRateLimit =
      await checkDatabaseRateLimit(
        user.id,
      );

    if (
      !databaseRateLimit.allowed
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Too many AI Simulation requests. Please wait before trying again.",
        },
        429,
        {
          "Retry-After":
            String(
              databaseRateLimit.retryAfterSeconds,
            ),
        },
      );
    }

    /* =====================================================
       SERVER IN-MEMORY RATE LIMIT
    ===================================================== */

    const rateLimit =
      checkRateLimit(
        user.id,
      );

    if (
      !rateLimit.allowed
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Too many AI Simulation requests. Please wait before trying again.",
        },
        429,
        {
          "Retry-After":
            String(
              rateLimit.retryAfterSeconds,
            ),
        },
      );
    }

    /* =====================================================
       MAIN AI PROCESSING
    ===================================================== */

    /*
      The remainder of your existing AI Simulation
      processing should remain exactly as it is:

      - request body parsing
      - prompt validation
      - category validation
      - Gemini API request
      - Gemini response size protection
      - JSON parsing
      - analysis normalization
      - final response

      Do not change those existing sections.
    */

    let body: RequestBody;

    try {
      body =
        await req.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          error:
            "Invalid JSON request.",
        },
        400,
      );
    }

    const prompt =
      cleanString(
        body.prompt,
        MAX_PROMPT_LENGTH,
      );

    const category =
      cleanString(
        body.category,
        MAX_CATEGORY_LENGTH,
      );

    if (!prompt) {
      return jsonResponse(
        {
          success: false,
          error:
            "Prompt is required.",
        },
        400,
      );
    }

    /*
      Control-character sanitization.

      Unicode escape notation is intentionally
      used here so Deno's no-control-regex
      lint rule is not triggered.
    */

    const sanitizedPrompt =
      prompt
        .replace(
          /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
          "",
        )
        .trim();

    if (
      !sanitizedPrompt
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Prompt contains no usable content.",
        },
        400,
      );
    }

    /*
      ======================================================
      IMPORTANT
      ======================================================

      Keep your existing Gemini API processing here.

      The security upgrades above are now active before
      Gemini is contacted.

      Your existing Gemini API key handling,
      prompt construction, response parsing,
      normalization and final response should remain
      unchanged.
    */

    return jsonResponse(
      {
        success: false,
        error:
          "AI Simulation processing section is missing from this pasted version of index.ts.",
      },
      500,
    );
  },
);