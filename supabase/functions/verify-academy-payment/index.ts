import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VerifyPaymentRequest {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  captured?: boolean;
  notes?: Record<string, string>;
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
 * Convert a Uint8Array into a plain ArrayBuffer.
 *
 * This avoids the Deno TypeScript error:
 * Uint8Array<ArrayBufferLike> is not assignable to BufferSource
 */
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);

  new Uint8Array(buffer).set(bytes);

  return buffer;
}

/*
 * Convert binary data to lowercase hexadecimal.
 */
function bytesToHex(bytes: Uint8Array): string {
  let result = "";

  for (const byte of bytes) {
    result += byte.toString(16).padStart(2, "0");
  }

  return result;
}

/*
 * Constant-time string comparison.
 *
 * Used for comparing Razorpay signatures safely.
 */
function secureCompare(
  first: string,
  second: string,
): boolean {
  if (first.length !== second.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < first.length; index += 1) {
    difference |=
      first.charCodeAt(index) ^
      second.charCodeAt(index);
  }

  return difference === 0;
}

/*
 * Generate Razorpay HMAC SHA256 signature.
 *
 * Razorpay signature formula:
 *
 * HMAC_SHA256(
 *   razorpay_order_id + "|" + razorpay_payment_id,
 *   RAZORPAY_KEY_SECRET
 * )
 */
async function generateRazorpaySignature(
  orderId: string,
  paymentId: string,
  keySecret: string,
): Promise<string> {
  const encoder = new TextEncoder();

  const secretBytes = encoder.encode(keySecret);

  const cryptoKey =
    await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(secretBytes),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign"],
    );

  const payload =
    `${orderId}|${paymentId}`;

  const payloadBytes =
    encoder.encode(payload);

  const signatureBuffer =
    await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      toArrayBuffer(payloadBytes),
    );

  return bytesToHex(
    new Uint8Array(signatureBuffer),
  );
}

/*
 * Retrieve the payment directly from Razorpay.
 *
 * This provides an additional server-side verification layer.
 */
async function getRazorpayPayment(
  paymentId: string,
  keyId: string,
  keySecret: string,
): Promise<RazorpayPayment> {
  const credentials =
    btoa(
      `${keyId}:${keySecret}`,
    );

  const response =
    await fetch(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization:
            `Basic ${credentials}`,
          "Content-Type":
            "application/json",
        },
      },
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Unable to verify payment with Razorpay: ${errorText}`,
    );
  }

  const payment =
    await response.json() as RazorpayPayment;

  return payment;
}

Deno.serve(
  async (request: Request): Promise<Response> => {
    /*
     * Handle CORS preflight.
     */
    if (request.method === "OPTIONS") {
      return new Response(
        "ok",
        {
          headers:
            corsHeaders,
        },
      );
    }

    /*
     * Only POST requests are allowed.
     */
    if (request.method !== "POST") {
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
        !supabaseServiceRoleKey
      ) {
        throw new Error(
          "Supabase environment variables are missing.",
        );
      }

      if (
        !razorpayKeyId ||
        !razorpayKeySecret
      ) {
        throw new Error(
          "Razorpay environment variables are missing.",
        );
      }

      /*
       * Read Authorization header.
       */
      const authorization =
        request.headers.get(
          "Authorization",
        );

      if (!authorization) {
        return jsonResponse(
          {
            success: false,
            message:
              "Missing authorization token.",
          },
          401,
        );
      }

      /*
       * Client authenticated with the user's JWT.
       */
      const authClient =
        createClient(
          supabaseUrl,
          supabaseAnonKey,
          {
            global: {
              headers: {
                Authorization:
                  authorization,
              },
            },
            auth: {
              persistSession:
                false,
              autoRefreshToken:
                false,
            },
          },
        );

      /*
       * Get the currently authenticated user.
       */
      const {
        data:
          {
            user,
          },
        error:
          userError,
      } =
        await authClient.auth.getUser();

      if (
        userError ||
        !user
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Invalid or expired user session.",
          },
          401,
        );
      }

      /*
       * Parse request body.
       */
      const body =
        await request.json() as VerifyPaymentRequest;

      const paymentId =
        body
          .razorpay_payment_id
          ?.trim();

      const orderId =
        body
          .razorpay_order_id
          ?.trim();

      const razorpaySignature =
        body
          .razorpay_signature
          ?.trim();

      if (
        !paymentId ||
        !orderId ||
        !razorpaySignature
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Payment verification information is incomplete.",
          },
          400,
        );
      }

      /*
       * Verify the Razorpay signature.
       */
      const expectedSignature =
        await generateRazorpaySignature(
          orderId,
          paymentId,
          razorpayKeySecret,
        );

      const signatureValid =
        secureCompare(
          expectedSignature,
          razorpaySignature,
        );

      if (!signatureValid) {
        return jsonResponse(
          {
            success: false,
            message:
              "Invalid Razorpay payment signature.",
          },
          400,
        );
      }

      /*
       * Verify the payment directly with Razorpay.
       */
      const razorpayPayment =
        await getRazorpayPayment(
          paymentId,
          razorpayKeyId,
          razorpayKeySecret,
        );

      /*
       * Payment ID must match.
       */
      if (
        razorpayPayment.id !==
        paymentId
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Razorpay payment ID does not match.",
          },
          400,
        );
      }

      /*
       * Order ID must match.
       */
      if (
        razorpayPayment.order_id !==
        orderId
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Razorpay order ID does not match.",
          },
          400,
        );
      }

      /*
       * Payment must be captured.
       *
       * Razorpay may return:
       * status = "captured"
       * or captured = true
       */
      const paymentCaptured =
        razorpayPayment.status ===
          "captured" ||
        razorpayPayment.captured ===
          true;

      if (!paymentCaptured) {
        return jsonResponse(
          {
            success: false,
            message:
              `Payment is not captured yet. Current status: ${razorpayPayment.status}`,
          },
          400,
        );
      }

      /*
       * Validate payment amount.
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
              "Payment amount does not match the Academy membership price.",
          },
          400,
        );
      }

      /*
       * Validate currency.
       */
      if (
        razorpayPayment.currency
          .toUpperCase() !==
        "INR"
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "Payment currency does not match the Academy membership.",
          },
          400,
        );
      }

      /*
       * IMPORTANT:
       * Validate the user ID stored in the Razorpay payment notes.
       *
       * The create-academy-checkout function should have stored:
       *
       * user_id: user.id
       */
      const paymentUserId =
        razorpayPayment.notes
          ?.user_id;

      if (
        paymentUserId &&
        paymentUserId !==
          user.id
      ) {
        return jsonResponse(
          {
            success: false,
            message:
              "This payment belongs to another user account.",
          },
          403,
        );
      }

      /*
       * Use service role for membership database operations.
       *
       * Service role bypasses RLS.
       *
       * NEVER expose this key in frontend code.
       */
      const adminClient =
        createClient(
          supabaseUrl,
          supabaseServiceRoleKey,
          {
            auth: {
              persistSession:
                false,
              autoRefreshToken:
                false,
            },
          },
        );

      /*
       * Check whether this payment was already processed.
       *
       * This prevents duplicate membership records if the
       * browser calls verification more than once.
       */
      const {
        data:
          existingMembership,
        error:
          existingError,
      } =
        await adminClient
          .from(
            "academy_memberships",
          )
          .select(
            "id, user_id, status",
          )
          .eq(
            "provider_payment_id",
            paymentId,
          )
          .maybeSingle();

      if (existingError) {
        throw new Error(
          `Unable to check existing membership: ${existingError.message}`,
        );
      }

      /*
       * Payment was already processed.
       */
      if (existingMembership) {
        if (
          existingMembership.user_id !==
          user.id
        ) {
          return jsonResponse(
            {
              success: false,
              message:
                "This payment has already been linked to another account.",
            },
            403,
          );
        }

        /*
         * Make sure existing membership is active.
         */
        if (
          existingMembership.status !==
          "active"
        ) {
          const {
            error:
              reactivateError,
          } =
            await adminClient
              .from(
                "academy_memberships",
              )
              .update(
                {
                  status:
                    "active",
                  activated_at:
                    new Date()
                      .toISOString(),
                  updated_at:
                    new Date()
                      .toISOString(),
                },
              )
              .eq(
                "id",
                existingMembership.id,
              );

          if (
            reactivateError
          ) {
            throw new Error(
              `Unable to activate existing membership: ${reactivateError.message}`,
            );
          }
        }

        return jsonResponse(
          {
            success: true,
            membershipActive: true,
            alreadyProcessed: true,
            message:
              "Academy membership is already active.",
          },
        );
      }

      /*
       * Check whether this user already has an active membership.
       */
      const {
        data:
          activeMembership,
        error:
          activeMembershipError,
      } =
        await adminClient
          .from(
            "academy_memberships",
          )
          .select(
            "id",
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
        throw new Error(
          `Unable to check user membership: ${activeMembershipError.message}`,
        );
      }

      /*
       * If user already has active membership,
       * do not create another one.
       */
      if (
        activeMembership
      ) {
        return jsonResponse(
          {
            success: true,
            membershipActive: true,
            alreadyProcessed: true,
            message:
              "Academy membership is already active.",
          },
        );
      }

      /*
       * Create the membership.
       *
       * amount is stored in paise because Razorpay uses
       * the smallest currency unit.
       */
      const now =
        new Date()
          .toISOString();

      const {
        error:
          insertError,
      } =
        await adminClient
          .from(
            "academy_memberships",
          )
          .insert(
            {
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

              created_at:
                now,

              updated_at:
                now,
            },
          );

      if (
        insertError
      ) {
        throw new Error(
          `Unable to activate Academy membership: ${insertError.message}`,
        );
      }

      /*
       * Success.
       */
      return jsonResponse(
        {
          success: true,
          membershipActive: true,
          message:
            "Payment verified and Academy membership activated successfully.",
        },
      );
    } catch (
      error
    ) {
      console.error(
        "verify-academy-payment error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Payment verification failed.";

      return jsonResponse(
        {
          success: false,
          membershipActive: false,
          message,
        },
        500,
      );
    }
  },
);