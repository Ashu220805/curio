const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  notes?: Record<string, unknown>;
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
}

/*
 * Convert Uint8Array safely to ArrayBuffer.
 *
 * This avoids TypeScript BufferSource errors in Deno.
 */
function toArrayBuffer(
  value: Uint8Array,
): ArrayBuffer {
  return value.buffer.slice(
    value.byteOffset,
    value.byteOffset + value.byteLength,
  ) as ArrayBuffer;
}

/*
 * Verify Razorpay HMAC SHA256 signature.
 *
 * Razorpay signature formula:
 *
 * HMAC_SHA256(
 *   razorpay_order_id + "|" + razorpay_payment_id,
 *   RAZORPAY_KEY_SECRET
 * )
 */
async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder();

  const secretBytes = encoder.encode(secret);

  const secretBuffer = toArrayBuffer(secretBytes);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    secretBuffer,
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const message =
    `${orderId}|${paymentId}`;

  const messageBytes =
    encoder.encode(message);

  const messageBuffer =
    toArrayBuffer(messageBytes);

  const signatureBuffer =
    await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      messageBuffer,
    );

  const calculatedSignature =
    Array.from(
      new Uint8Array(signatureBuffer),
    )
      .map((byte) =>
        byte
          .toString(16)
          .padStart(2, "0")
      )
      .join("");

  return calculatedSignature === signature;
}

/*
 * Read and validate the request body without using
 * unsafe TypeScript assertions.
 */
function parseVerifyPaymentRequest(
  value: unknown,
): VerifyPaymentRequest | null {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  const record =
    value as Record<string, unknown>;

  const paymentId =
    record["razorpay_payment_id"];

  const orderId =
    record["razorpay_order_id"];

  const signature =
    record["razorpay_signature"];

  if (
    typeof paymentId !== "string" ||
    paymentId.length === 0
  ) {
    return null;
  }

  if (
    typeof orderId !== "string" ||
    orderId.length === 0
  ) {
    return null;
  }

  if (
    typeof signature !== "string" ||
    signature.length === 0
  ) {
    return null;
  }

  return {
    razorpay_payment_id:
      paymentId,

    razorpay_order_id:
      orderId,

    razorpay_signature:
      signature,
  };
}

/*
 * Read Razorpay payment response safely.
 */
function parseRazorpayPayment(
  value: unknown,
): RazorpayPayment | null {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  const record =
    value as Record<string, unknown>;

  const id =
    record["id"];

  const orderId =
    record["order_id"];

  const amount =
    record["amount"];

  const currency =
    record["currency"];

  const status =
    record["status"];

  const notesValue =
    record["notes"];

  let notes:
    | Record<string, unknown>
    | undefined;

  if (
    typeof notesValue === "object" &&
    notesValue !== null
  ) {
    notes =
      notesValue as Record<
        string,
        unknown
      >;
  }

  if (
    typeof id !== "string" ||
    typeof orderId !== "string" ||
    typeof amount !== "number" ||
    typeof currency !== "string" ||
    typeof status !== "string"
  ) {
    return null;
  }

  return {
    id,
    order_id:
      orderId,
    amount,
    currency,
    status,
    notes,
  };
}

Deno.serve(
  async (req: Request): Promise<Response> => {
    /*
     * CORS preflight.
     */
    if (
      req.method === "OPTIONS"
    ) {
      return new Response(
        "ok",
        {
          headers:
            corsHeaders,
        },
      );
    }

    if (
      req.method !== "POST"
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            "Method not allowed.",
        },
        405,
      );
    }

    try {
      const supabaseUrl =
        Deno.env.get(
          "SUPABASE_URL",
        );

      const supabaseAnonKey =
        Deno.env.get(
          "SUPABASE_ANON_KEY",
        );

      const supabaseServiceRoleKey =
        Deno.env.get(
          "SUPABASE_SERVICE_ROLE_KEY",
        );

      const razorpayKeyId =
        Deno.env.get(
          "RAZORPAY_KEY_ID",
        );

      const razorpayKeySecret =
        Deno.env.get(
          "RAZORPAY_KEY_SECRET",
        );

      if (
        !supabaseUrl ||
        !supabaseAnonKey ||
        !supabaseServiceRoleKey ||
        !razorpayKeyId ||
        !razorpayKeySecret
      ) {
        console.error(
          "Missing required environment variables.",
        );

        return jsonResponse(
          {
            success: false,
            message:
              "Payment verification service is not configured correctly.",
          },
          500,
        );
      }

      /*
       * Verify Authorization header.
       */
      const authorization =
        req.headers.get(
          "Authorization",
        );

      if (
        !authorization
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "You must be signed in.",
          },
          401,
        );
      }

      /*
       * Identify current Supabase user.
       */
      const userResponse =
        await fetch(
          `${supabaseUrl}/auth/v1/user`,
          {
            headers: {
              Authorization:
                authorization,

              apikey:
                supabaseAnonKey,
            },
          },
        );

      if (
        !userResponse.ok
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Invalid user session.",
          },
          401,
        );
      }

      const userData:
        unknown =
          await userResponse.json();

      if (
        typeof userData !==
          "object" ||
        userData === null
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Unable to identify user.",
          },
          401,
        );
      }

      const userRecord =
        userData as Record<
          string,
          unknown
        >;

      const userId =
        userRecord["id"];

      if (
        typeof userId !==
          "string" ||
        userId.length === 0
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Unable to identify user.",
          },
          401,
        );
      }

      /*
       * Parse request body.
       */
      let requestBody:
        unknown;

      try {
        requestBody =
          await req.json();
      } catch {
        return jsonResponse(
          {
            success: false,
            message:
              "Invalid request body.",
          },
          400,
        );
      }

      const paymentRequest =
        parseVerifyPaymentRequest(
          requestBody,
        );

      if (
        !paymentRequest
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Payment information is incomplete.",
          },
          400,
        );
      }

      const {
        razorpay_payment_id:
          paymentId,

        razorpay_order_id:
          orderId,

        razorpay_signature:
          signature,
      } =
        paymentRequest;

      /*
       * Verify the Razorpay signature first.
       */
      const signatureValid =
        await verifyRazorpaySignature(
          orderId,
          paymentId,
          signature,
          razorpayKeySecret,
        );

      if (
        !signatureValid
      ) {
        console.error(
          "Invalid Razorpay signature.",
        );

        return jsonResponse(
          {
            success: false,
            membershipActive:
              false,
            message:
              "Payment signature verification failed.",
          },
          400,
        );
      }

      /*
       * Fetch the payment directly from Razorpay.
       *
       * This ensures that we don't trust only
       * browser-provided information.
       */
      const razorpayAuthorization =
        "Basic " +
        btoa(
          `${razorpayKeyId}:${razorpayKeySecret}`,
        );

      const paymentResponse =
        await fetch(
          `https://api.razorpay.com/v1/payments/${paymentId}`,
          {
            headers: {
              Authorization:
                razorpayAuthorization,
            },
          },
        );

      const razorpayData:
        unknown =
          await paymentResponse.json();

      if (
        !paymentResponse.ok
      ) {
        console.error(
          "Unable to fetch Razorpay payment:",
          razorpayData,
        );

        return jsonResponse(
          {
            success: false,
            membershipActive:
              false,
            message:
              "Unable to verify payment with Razorpay.",
          },
          400,
        );
      }

      const razorpayPayment =
        parseRazorpayPayment(
          razorpayData,
        );

      if (
        !razorpayPayment
      ) {
        return jsonResponse(
          {
            success: false,
            membershipActive:
              false,
            message:
              "Invalid payment information returned by Razorpay.",
          },
          400,
        );
      }

      /*
       * Critical consistency checks.
       */
      if (
        razorpayPayment.id !==
          paymentId
      ) {
        return jsonResponse(
          {
            success: false,
            membershipActive:
              false,
            message:
              "Payment ID verification failed.",
          },
          400,
        );
      }

      if (
        razorpayPayment.order_id !==
          orderId
      ) {
        return jsonResponse(
          {
            success: false,
            membershipActive:
              false,
            message:
              "Payment order verification failed.",
          },
          400,
        );
      }

      /*
       * Razorpay successful payment status.
       */
      if (
        razorpayPayment.status !==
          "captured" &&
        razorpayPayment.status !==
          "authorized"
      ) {
        return jsonResponse(
          {
            success: false,
            membershipActive:
              false,
            message:
              `Payment is not successful. Current status: ${razorpayPayment.status}`,
          },
          400,
        );
      }

      /*
       * Validate the user ID stored in Razorpay notes.
       *
       * This prevents one user from submitting another
       * user's payment ID.
       */
      const paymentUserId =
        razorpayPayment
          .notes?.["user_id"];

      if (
        paymentUserId !==
          userId
      ) {
        console.error(
          "Payment user does not match authenticated user.",
          {
            authenticatedUser:
              userId,

            paymentUser:
              paymentUserId,
          },
        );

        return jsonResponse(
          {
            success: false,
            membershipActive:
              false,
            message:
              "Payment does not belong to the current user.",
          },
          403,
        );
      }

      /*
       * Activate Academy membership.
       *
       * The user_id column must have a UNIQUE constraint.
       *
       * This UPSERT ensures repeated verification does not
       * create duplicate memberships.
       */
      const membershipPayload = {
        user_id:
          userId,

        status:
          "active",

        plan_name:
          "AI/ML Academy",

        amount:
          razorpayPayment.amount,

        currency:
          razorpayPayment.currency,

        payment_provider:
          "razorpay",

        provider_order_id:
          orderId,

        provider_payment_id:
          paymentId,

        activated_at:
          new Date().toISOString(),

        updated_at:
          new Date().toISOString(),
      };

      const membershipResponse =
        await fetch(
          `${supabaseUrl}/rest/v1/academy_memberships?on_conflict=user_id`,
          {
            method:
              "POST",

            headers: {
              Authorization:
                `Bearer ${supabaseServiceRoleKey}`,

              apikey:
                supabaseServiceRoleKey,

              "Content-Type":
                "application/json",

              Prefer:
                "resolution=merge-duplicates,return=representation",
            },

            body:
              JSON.stringify([
                membershipPayload,
              ]),
          },
        );

      const membershipData:
        unknown =
          await membershipResponse
            .json();

      if (
        !membershipResponse.ok
      ) {
        console.error(
          "Membership activation failed:",
          membershipData,
        );

        return jsonResponse(
          {
            success: false,
            membershipActive:
              false,
            message:
              "Payment was verified but Academy membership could not be activated.",
          },
          500,
        );
      }

      /*
       * Success.
       */
      return jsonResponse(
        {
          success: true,

          membershipActive:
            true,

          message:
            "Payment verified and Academy access activated.",

          paymentId:
            paymentId,

          orderId:
            orderId,
        },
        200,
      );
    } catch (
      error
    ) {
      console.error(
        "verify-academy-payment error:",
        error,
      );

      return jsonResponse(
        {
          success: false,

          membershipActive:
            false,

          message:
            error instanceof Error
              ? error.message
              : "Unexpected payment verification error.",
        },
        500,
      );
    }
  },
);