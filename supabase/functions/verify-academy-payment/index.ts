import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VerifyPaymentBody {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
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
 * Convert an ArrayBuffer into a hexadecimal string.
 *
 * Razorpay signatures use HMAC SHA256.
 */
function arrayBufferToHex(
  buffer: ArrayBuffer,
): string {
  const bytes = new Uint8Array(buffer);

  return Array.from(bytes)
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}

/*
 * Timing-safe-ish string comparison.
 *
 * Avoids a simple early-return comparison.
 */
function safeCompare(
  first: string,
  second: string,
): boolean {
  if (first.length !== second.length) {
    return false;
  }

  let result = 0;

  for (
    let index = 0;
    index < first.length;
    index += 1
  ) {
    result |=
      first.charCodeAt(index) ^
      second.charCodeAt(index);
  }

  return result === 0;
}

/*
 * Generate the Razorpay payment signature locally.
 *
 * Razorpay formula:
 *
 * HMAC_SHA256(
 *   razorpay_order_id + "|" + razorpay_payment_id,
 *   RAZORPAY_KEY_SECRET
 * )
 */
async function createExpectedSignature(
  orderId: string,
  paymentId: string,
  keySecret: string,
): Promise<string> {
  const encoder =
    new TextEncoder();

  const secretKey =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(keySecret),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign"],
    );

  const message =
    `${orderId}|${paymentId}`;

  const signature =
    await crypto.subtle.sign(
      "HMAC",
      secretKey,
      encoder.encode(message),
    );

  return arrayBufferToHex(
    signature,
  );
}

Deno.serve(
  async (req) => {
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

    /*
     * Only POST is allowed.
     */
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
      /*
       * Environment variables.
       */
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

      const razorpayKeySecret =
        Deno.env.get(
          "RAZORPAY_KEY_SECRET",
        );

      if (
        !supabaseUrl ||
        !supabaseAnonKey ||
        !supabaseServiceRoleKey ||
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
       * Require authenticated user.
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
              "You must be signed in before verifying a payment.",
          },
          401,
        );
      }

      /*
       * Verify the Supabase user token.
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

      const user =
        await userResponse.json();

      if (
        !user ||
        typeof user.id !== "string"
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Unable to identify the signed-in user.",
          },
          401,
        );
      }

      /*
       * Read request body.
       */
      const body =
        (await req.json()) as VerifyPaymentBody;

      const paymentId =
        body
          ?.razorpay_payment_id
          ?.trim();

      const orderId =
        body
          ?.razorpay_order_id
          ?.trim();

      const signature =
        body
          ?.razorpay_signature
          ?.trim();

      if (
        !paymentId ||
        !orderId ||
        !signature
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Payment ID, order ID and signature are required.",
          },
          400,
        );
      }

      /*
       * Verify that the order really belongs to CURIO.
       *
       * We query Razorpay directly using the server secret.
       */
      const razorpayKeyId =
        Deno.env.get(
          "RAZORPAY_KEY_ID",
        );

      if (
        !razorpayKeyId
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Razorpay is not configured correctly.",
          },
          500,
        );
      }

      const razorpayAuthorization =
        "Basic " +
        btoa(
          `${razorpayKeyId}:${razorpayKeySecret}`,
        );

      /*
       * Fetch the Razorpay order.
       */
      const orderResponse =
        await fetch(
          `https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`,
          {
            headers: {
              Authorization:
                razorpayAuthorization,
            },
          },
        );

      if (
        !orderResponse.ok
      ) {
        console.error(
          "Unable to retrieve Razorpay order.",
          await orderResponse.text(),
        );

        return jsonResponse(
          {
            success: false,
            message:
              "Unable to verify the Razorpay order.",
          },
          400,
        );
      }

      const razorpayOrder =
        await orderResponse.json();

      /*
       * IMPORTANT:
       *
       * Confirm the order metadata belongs
       * to the currently logged-in CURIO user.
       */
      const orderUserId =
        razorpayOrder
          ?.notes
          ?.user_id;

      const product =
        razorpayOrder
          ?.notes
          ?.product;

      if (
        orderUserId !== user.id
      ) {
        console.error(
          "Order user mismatch.",
          {
            authenticatedUser:
              user.id,

            orderUserId,
          },
        );

        return jsonResponse(
          {
            success: false,
            message:
              "This payment order does not belong to the current CURIO account.",
          },
          403,
        );
      }

      if (
        product !==
        "curio_ai_ml_academy"
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "This Razorpay order is not a CURIO Academy order.",
          },
          400,
        );
      }

      /*
       * Verify Razorpay payment signature.
       */
      const expectedSignature =
        await createExpectedSignature(
          orderId,
          paymentId,
          razorpayKeySecret,
        );

      if (
        !safeCompare(
          expectedSignature,
          signature,
        )
      ) {
        console.error(
          "Invalid Razorpay payment signature.",
        );

        return jsonResponse(
          {
            success: false,
            message:
              "Payment signature verification failed.",
          },
          400,
        );
      }

      /*
       * Fetch payment from Razorpay.
       *
       * This ensures the payment ID exists
       * and is associated with the order.
       */
      const paymentResponse =
        await fetch(
          `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
          {
            headers: {
              Authorization:
                razorpayAuthorization,
            },
          },
        );

      if (
        !paymentResponse.ok
      ) {
        console.error(
          "Unable to retrieve Razorpay payment.",
          await paymentResponse.text(),
        );

        return jsonResponse(
          {
            success: false,
            message:
              "Unable to verify the Razorpay payment.",
          },
          400,
        );
      }

      const razorpayPayment =
        await paymentResponse.json();

      /*
       * Ensure payment belongs to this order.
       */
      if (
        razorpayPayment.order_id !==
        orderId
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Payment does not belong to the supplied order.",
          },
          400,
        );
      }

      /*
       * Payment must be successful.
       *
       * Razorpay may report "authorized"
       * before capture in some flows.
       *
       * For this current implementation,
       * captured is the safest state.
       */
      if (
        razorpayPayment.status !==
        "captured"
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              `Payment is not captured yet. Current status: ${String(razorpayPayment.status)}`,
          },
          400,
        );
      }

      /*
       * Confirm ₹1 test amount.
       *
       * Razorpay stores money in paise.
       *
       * ₹1 = 100 paise.
       */
      if (
        razorpayPayment.amount !==
        100
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Unexpected payment amount.",
          },
          400,
        );
      }

      if (
        razorpayPayment.currency !==
        "INR"
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Unexpected payment currency.",
          },
          400,
        );
      }

      /*
       * Create Supabase admin client.
       *
       * Service role is required because
       * this is the trusted server that
       * activates paid memberships.
       */
      const adminSupabase =
        createClient(
          supabaseUrl,
          supabaseServiceRoleKey,
          {
            auth: {
              autoRefreshToken:
                false,

              persistSession:
                false,
            },
          },
        );

      /*
       * Prevent duplicate payment activation.
       */
      const {
        data:
          existingMembership,
        error:
          existingMembershipError,
      } =
        await adminSupabase
          .from(
            "academy_memberships",
          )
          .select(
            "id, status, provider_payment_id",
          )
          .eq(
            "provider_payment_id",
            paymentId,
          )
          .maybeSingle();

      if (
        existingMembershipError
      ) {
        console.error(
          "Unable to check existing membership.",
          existingMembershipError,
        );

        return jsonResponse(
          {
            success: false,
            message:
              "Unable to check existing payment records.",
          },
          500,
        );
      }

      /*
       * Payment was already processed.
       *
       * Return success instead of creating
       * another membership.
       */
      if (
        existingMembership
      ) {
        return jsonResponse(
          {
            success: true,

            membershipActive:
              existingMembership.status ===
              "active",

            message:
              existingMembership.status ===
              "active"
                ? "Academy membership is already active."
                : "This payment has already been processed.",
          },
        );
      }

      /*
       * Check whether the user already has
       * an active Academy membership.
       *
       * This prevents accidental duplicate
       * membership rows.
       */
      const {
        data:
          activeMembership,
        error:
          activeMembershipError,
      } =
        await adminSupabase
          .from(
            "academy_memberships",
          )
          .select(
            "id, status",
          )
          .eq(
            "user_id",
            user.id,
          )
          .eq(
            "status",
            "active",
          )
          .maybeSingle();

      if (
        activeMembershipError
      ) {
        console.error(
          "Unable to check active membership.",
          activeMembershipError,
        );

        return jsonResponse(
          {
            success: false,
            message:
              "Unable to check Academy membership.",
          },
          500,
        );
      }

      /*
       * User already has access.
       *
       * Do not create another membership.
       */
      if (
        activeMembership
      ) {
        return jsonResponse(
          {
            success: true,

            membershipActive:
              true,

            message:
              "Academy membership is already active.",
          },
        );
      }

      /*
       * Activate Academy membership.
       */
      const now =
        new Date()
          .toISOString();

      const {
        error:
          insertMembershipError,
      } =
        await adminSupabase
          .from(
            "academy_memberships",
          )
          .insert({
            user_id:
              user.id,

            status:
              "active",

            plan_name:
              "academy_pro",

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
              now,

            expires_at:
              null,
          });

      if (
        insertMembershipError
      ) {
        console.error(
          "Unable to activate membership.",
          insertMembershipError,
        );

        return jsonResponse(
          {
            success: false,
            message:
              "Payment was verified but Academy access could not be saved.",
          },
          500,
        );
      }

      /*
       * SUCCESS
       */
      return jsonResponse(
        {
          success: true,

          membershipActive:
            true,

          message:
            "Payment verified and CURIO Academy PRO access activated.",
        },
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