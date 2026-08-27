/* =========================================================
   CURIO SECURITY UTILITIES
   STEP 1 — CLIENT-SIDE INPUT SECURITY
========================================================= */

/*
  This file provides reusable security checks for CURIO.

  IMPORTANT:
  These checks are only the FIRST security layer.

  They do NOT replace:
  - Supabase Authentication
  - Supabase RLS
  - Edge Function validation
  - Server-side rate limiting
  - Gemini API protection

  The Gemini API key must NEVER be stored in this file.
*/

/* =========================================================
   CONSTANTS
========================================================= */

export const SECURITY_LIMITS = {
  /*
    Maximum prompt length accepted by the frontend.
  */
  MAX_PROMPT_LENGTH: 2000,

  /*
    Minimum useful prompt length.
  */
  MIN_PROMPT_LENGTH: 10,

  /*
    Minimum time between AI requests from the same browser tab.

    This is only client-side spam protection.
    Real rate limiting will be implemented server-side later.
  */
  REQUEST_COOLDOWN_MS: 5000,

  /*
    Maximum number of requests allowed inside the
    client-side time window.
  */
  MAX_REQUESTS_PER_WINDOW: 10,

  /*
    Client-side rate-limit window.
  */
  RATE_LIMIT_WINDOW_MS: 60 * 1000,
} as const;

/* =========================================================
   TYPES
========================================================= */

export type SecurityValidationResult = {
  allowed: boolean;
  message: string;
  reasons: string[];
};

export type PrivateInformationResult = {
  detected: boolean;
  blocked: boolean;
  reasons: string[];
};

export type RateLimitResult = {
  allowed: boolean;
  message: string;
  remainingRequests: number;
};

/* =========================================================
   PROMPT NORMALIZATION
========================================================= */

/**
 * Cleans harmless formatting from a prompt before validation.
 *
 * This does NOT attempt to modify the user's meaning.
 */
export function normalizePrompt(
  prompt: string,
): string {
  if (typeof prompt !== "string") {
    return "";
  }

  // eslint-disable-next-line no-control-regex -- Intentional removal of null character
  return prompt
    .replace(/[\x00]/g, "")
    .trim();
}

/* =========================================================
   PROMPT LENGTH VALIDATION
========================================================= */

export function validatePromptLength(
  prompt: string,
): SecurityValidationResult {
  const value = normalizePrompt(prompt);

  if (!value) {
    return {
      allowed: false,
      message:
        "Please write a prompt before continuing.",
      reasons: [
        "The prompt is empty.",
      ],
    };
  }

  if (
    value.length <
    SECURITY_LIMITS.MIN_PROMPT_LENGTH
  ) {
    return {
      allowed: false,
      message:
        "Your prompt is too short. Add more context about what you want the AI to do.",
      reasons: [
        `Prompt must contain at least ${SECURITY_LIMITS.MIN_PROMPT_LENGTH} characters.`,
      ],
    };
  }

  if (
    value.length >
    SECURITY_LIMITS.MAX_PROMPT_LENGTH
  ) {
    return {
      allowed: false,
      message:
        `Your prompt is too long. Please keep it under ${SECURITY_LIMITS.MAX_PROMPT_LENGTH} characters.`,
      reasons: [
        `Prompt exceeded the ${SECURITY_LIMITS.MAX_PROMPT_LENGTH}-character limit.`,
      ],
    };
  }

  return {
    allowed: true,
    message:
      "Prompt length is valid.",
    reasons: [],
  };
}

/* =========================================================
   EMAIL DETECTION
========================================================= */

function containsEmail(
  value: string,
): boolean {
  return /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(
    value,
  );
}

/* =========================================================
   PHONE DETECTION
========================================================= */

function containsPhoneNumber(
  value: string,
): boolean {
  return /(?:\+?\d[\d\s().-]{8,}\d)/.test(
    value,
  );
}

/* =========================================================
   CARD / FINANCIAL NUMBER DETECTION
========================================================= */

function containsFinancialNumber(
  value: string,
): boolean {
  const matches =
    value.match(
      /\b(?:\d[ -]*?){13,19}\b/g,
    );

  if (!matches) {
    return false;
  }

  return matches.some(
    (match) => {
      const digits =
        match.replace(
          /\D/g,
          "",
        );

      return (
        digits.length >= 13 &&
        digits.length <= 19
      );
    },
  );
}

/* =========================================================
   PASSWORD / SECRET DETECTION
========================================================= */

function containsPassword(
  value: string,
): boolean {
  return /\b(?:password|passwd|passcode|login password)\b\s*(?:is|:|=)\s*\S+/i.test(
    value,
  );
}

/* =========================================================
   OTP DETECTION
========================================================= */

function containsOTP(
  value: string,
): boolean {
  return /\b(?:otp|one[- ]time password|verification code|security code)\b\s*(?:is|:|=)\s*\S+/i.test(
    value,
  );
}

/* =========================================================
   API KEY / TOKEN DETECTION
========================================================= */

function containsAPISecret(
  value: string,
): boolean {
  return /\b(?:api[_ -]?key|access[_ -]?token|secret[_ -]?key|bearer token)\b\s*(?:is|:|=)\s*\S+/i.test(
    value,
  );
}

/* =========================================================
   IDENTITY DOCUMENT DETECTION
========================================================= */

function containsIdentityInformation(
  value: string,
): boolean {
  return /\b(?:aadhaar|aadhar|pan card|passport|social security|ssn)\b\s*(?:number|no\.?|#)?\s*(?:is|:|=)?/i.test(
    value,
  );
}

/* =========================================================
   PRIVATE ADDRESS DETECTION
========================================================= */

function containsPrivateAddress(
  value: string,
): boolean {
  return /\b(?:home address|residential address|my address|house address)\b\s*(?:is|:|=)\s*/i.test(
    value,
  );
}

/* =========================================================
   PRIVATE LOCATION DETECTION
========================================================= */

function containsPrivateLocation(
  value: string,
): boolean {
  return /\b(?:my location|live at|living at|currently at|i am at)\b\s*(?:is|:|=)?\s*\S+/i.test(
    value,
  );
}

/* =========================================================
   PRIVATE INFORMATION DETECTION
========================================================= */

export function detectPrivateInformation(
  prompt: string,
): PrivateInformationResult {
  const value = normalizePrompt(prompt);

  if (!value) {
    return {
      detected: false,
      blocked: false,
      reasons: [],
    };
  }

  const reasons: string[] = [];

  /*
    Email
  */

  if (containsEmail(value)) {
    reasons.push(
      "Your prompt appears to contain an email address.",
    );
  }

  /*
    Phone
  */

  if (containsPhoneNumber(value)) {
    reasons.push(
      "Your prompt appears to contain a phone number.",
    );
  }

  /*
    Financial number
  */

  if (
    containsFinancialNumber(value)
  ) {
    reasons.push(
      "Your prompt may contain a financial or card number.",
    );
  }

  /*
    Password
  */

  if (containsPassword(value)) {
    reasons.push(
      "Your prompt appears to contain a password or login secret.",
    );
  }

  /*
    OTP
  */

  if (containsOTP(value)) {
    reasons.push(
      "Your prompt appears to contain a verification code or OTP.",
    );
  }

  /*
    API key / token
  */

  if (containsAPISecret(value)) {
    reasons.push(
      "Your prompt appears to contain an API key or access token.",
    );
  }

  /*
    Identity documents
  */

  if (
    containsIdentityInformation(
      value,
    )
  ) {
    reasons.push(
      "Your prompt appears to reference sensitive identity information.",
    );
  }

  /*
    Private address
  */

  if (
    containsPrivateAddress(
      value,
    )
  ) {
    reasons.push(
      "Your prompt appears to contain a private address.",
    );
  }

  /*
    Private location
  */

  if (
    containsPrivateLocation(
      value,
    )
  ) {
    reasons.push(
      "Your prompt may contain a private location.",
    );
  }

  /*
    Strong secrets should be blocked.

    Normal contact information receives a warning,
    while actual credentials/secrets receive a block.
  */

  const strongSecret =
    containsPassword(value) ||
    containsOTP(value) ||
    containsAPISecret(value) ||
    /\b(?:credit card|debit card|cvv|pin)\b/i.test(
      value,
    );

  return {
    detected:
      reasons.length > 0,

    blocked:
      strongSecret,

    reasons,
  };
}

/* =========================================================
   SUSPICIOUS PROMPT DETECTION
========================================================= */

/**
 * This is NOT an attempt to block normal AI questions.
 *
 * It only identifies obvious patterns that could indicate
 * automated abuse or attempts to manipulate the simulator's
 * security instructions.
 */
export function detectSuspiciousPrompt(
  prompt: string,
): string[] {
  const value =
    normalizePrompt(prompt);

  if (!value) {
    return [];
  }

  const reasons: string[] = [];

  /*
    Extremely repetitive content.
  */

  const words =
    value
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

  if (words.length >= 20) {
    const uniqueWords =
      new Set(words);

    const repetitionRatio =
      uniqueWords.size /
      words.length;

    if (
      repetitionRatio < 0.15
    ) {
      reasons.push(
        "The prompt contains unusually repetitive content.",
      );
    }
  }

  /*
    Common instruction-override language.

    These phrases are not automatically dangerous.
    We simply record them for the security layer.
  */

  if (
    /\b(?:ignore all previous instructions|ignore previous instructions|bypass safety|disable safety|reveal system prompt)\b/i.test(
      value,
    )
  ) {
    reasons.push(
      "The prompt contains language that attempts to override or bypass system instructions.",
    );
  }

  return reasons;
}

/* =========================================================
   COMPLETE SECURITY VALIDATION
========================================================= */

export function validatePromptSecurity(
  prompt: string,
): SecurityValidationResult {
  const normalized =
    normalizePrompt(prompt);

  /*
    Length validation.
  */

  const lengthResult =
    validatePromptLength(
      normalized,
    );

  if (!lengthResult.allowed) {
    return lengthResult;
  }

  /*
    Private information.
  */

  const privateInfo =
    detectPrivateInformation(
      normalized,
    );

  if (privateInfo.blocked) {
    return {
      allowed: false,
      message:
        "CURIO stopped this prompt because it may contain private or sensitive information.",
      reasons:
        privateInfo.reasons,
    };
  }

  /*
    Suspicious patterns.

    These are currently warnings rather than hard blocks.
    We don't want to accidentally prevent legitimate learning.
  */

  const suspicious =
    detectSuspiciousPrompt(
      normalized,
    );

  if (
    suspicious.length > 0
  ) {
    return {
      allowed: true,
      message:
        "Your prompt can continue, but review the instructions carefully.",
      reasons: suspicious,
    };
  }

  return {
    allowed: true,
    message:
      "Your prompt passed the CURIO security checks.",
    reasons: [],
  };
}

/* =========================================================
   CLIENT-SIDE RATE LIMIT STORAGE
========================================================= */

const RATE_LIMIT_STORAGE_KEY =
  "curio_ai_simulation_rate_limit";

/* =========================================================
   RATE LIMIT DATA
========================================================= */

type RateLimitStorage = {
  timestamps: number[];
};

/* =========================================================
   READ RATE LIMIT STATE
========================================================= */

function getRateLimitState(): RateLimitStorage {
  try {
    const raw =
      sessionStorage.getItem(
        RATE_LIMIT_STORAGE_KEY,
      );

    if (!raw) {
      return {
        timestamps: [],
      };
    }

    const parsed =
      JSON.parse(raw) as Partial<RateLimitStorage>;

    if (
      !Array.isArray(
        parsed.timestamps,
      )
    ) {
      return {
        timestamps: [],
      };
    }

    return {
      timestamps:
        parsed.timestamps.filter(
          (timestamp) =>
            typeof timestamp ===
              "number" &&
            Number.isFinite(
              timestamp,
            ),
        ),
    };
  } catch {
    return {
      timestamps: [],
    };
  }
}

/* =========================================================
   SAVE RATE LIMIT STATE
========================================================= */

function saveRateLimitState(
  state: RateLimitStorage,
): void {
  try {
    sessionStorage.setItem(
      RATE_LIMIT_STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch {
    /*
      Ignore storage errors.

      Security should never crash the application
      merely because browser storage is unavailable.
    */
  }
}

/* =========================================================
   CLIENT RATE LIMIT
========================================================= */

export function checkClientRateLimit(): RateLimitResult {
  const now =
    Date.now();

  const state =
    getRateLimitState();

  /*
    Remove requests outside the current window.
  */

  const recent =
    state.timestamps.filter(
      (timestamp) =>
        now - timestamp <
        SECURITY_LIMITS.RATE_LIMIT_WINDOW_MS,
    );

  /*
    Check maximum requests.
  */

  if (
    recent.length >=
    SECURITY_LIMITS.MAX_REQUESTS_PER_WINDOW
  ) {
    saveRateLimitState({
      timestamps: recent,
    });

    return {
      allowed: false,
      message:
        "CURIO has temporarily limited AI requests. Please wait before trying again.",
      remainingRequests: 0,
    };
  }

  /*
    Check minimum delay between requests.
  */

  const latest =
    recent.length > 0
      ? recent[
          recent.length - 1
        ]
      : null;

  if (
    latest !== null &&
    now - latest <
      SECURITY_LIMITS.REQUEST_COOLDOWN_MS
  ) {
    const seconds =
      Math.ceil(
        (
          SECURITY_LIMITS
            .REQUEST_COOLDOWN_MS -
          (now - latest)
        ) / 1000,
      );

    saveRateLimitState({
      timestamps: recent,
    });

    return {
      allowed: false,
      message:
        `Please wait ${seconds} second${seconds === 1 ? "" : "s"} before sending another AI request.`,
      remainingRequests:
        Math.max(
          0,
          SECURITY_LIMITS.MAX_REQUESTS_PER_WINDOW -
            recent.length,
        ),
    };
  }

  /*
    Record this request.
  */

  recent.push(now);

  saveRateLimitState({
    timestamps: recent,
  });

  return {
    allowed: true,
    message:
      "AI request allowed.",
    remainingRequests:
      Math.max(
        0,
        SECURITY_LIMITS.MAX_REQUESTS_PER_WINDOW -
          recent.length,
      ),
  };
}

/* =========================================================
   RESET CLIENT RATE LIMIT
========================================================= */

/**
 * Useful during development/testing.
 *
 * This does NOT bypass server-side rate limiting.
 */
export function resetClientRateLimit(): void {
  try {
    sessionStorage.removeItem(
      RATE_LIMIT_STORAGE_KEY,
    );
  } catch {
    /*
      Ignore storage errors.
    */
  }
}

/* =========================================================
   SAFE ERROR MESSAGE
========================================================= */

export function getSafeClientErrorMessage(
  error: unknown,
): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error
  ) {
    const message =
      String(
        (
          error as {
            message?: unknown;
          }
        ).message ?? "",
      ).trim();

    if (
      message &&
      message.length <= 300
    ) {
      return message;
    }
  }

  return "Unable to process your request right now. Please try again.";
}