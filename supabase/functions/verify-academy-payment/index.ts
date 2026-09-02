import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
 * Convert a string into bytes.
 */
function textToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

/*
 * Convert ArrayBuffer into hexadecimal.
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/*
 * Verify Razorpay signature.
 *
 * Razorpay signature format:
 *
 * HMAC_SHA256(
 *   razorpay_order_id + "|" + razorpay_payment_id,
 *   RAZORPAY_KEY_SECRET
 * )
 */
async function generateRazorpaySignature(
  orderId: string,
  paymentId: string,
  razorpayKeySecret: string,
): Promise<string> {
  const secretBytes = textToBytes(razorpayKeySecret);
  const secretBuffer = new ArrayBuffer(secretBytes.byteLength);
  new Uint8Array(secretBuffer).set(secretBytes);

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

  const payload = `${orderId}|${paymentId}`;

  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    (() => {
      const payloadBytes = textToBytes(payload);
      const payloadBuffer = new ArrayBuffer(payloadBytes.byteLength);
      new Uint8Array(payloadBuffer).set(payloadBytes);
      return payloadBuffer;
    })(),
  );

  return bufferToHex(signature);
}

/*
 * Timing-safe string comparison.
 */
function secureCompare(
  first: string,
  second: string,
): boolean {
  if (first.length !== second.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < first.length; index += 1) {
    result |=
      first.charCodeAt(index) ^
      second.charCodeAt(index);
  }

  return result === 0;
}

Deno.serve(async (req) => {
  /*
   * Handle CORS preflight.
   */
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  /*
   * Only POST requests are allowed.
   */
  if (req.method !== "POST") {
    return jsonResponse(
      {
        success: false,
        error: "Method not allowed.",
      },
      405,
    );
  }

  try {
    /*
     * Environment variables.
     */
    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const supabaseAnonKey =
      Deno.env.get("SUPABASE_ANON_KEY");

    const supabaseServiceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const razorpayKeySecret =
      Deno.env.get("RAZORPAY_KEY_SECRET");

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
          error:
            "Payment verification service is not configured correctly.",
        },
        500,
      );
    }

    /*
     * Verify Authorization header.
     */
    const authorization =
      req.headers.get("Authorization");

    if (!authorization) {
      return jsonResponse(
        {
          success: false,
          error:
            "You must be signed in before verifying payment.",
        },
        401,
      );
    }

    /*
     * Create a client using the user's JWT.
     *
     * This allows us to identify the current user.
     */
    const authClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
      },
    );

    const {
      data: {
        user,
      },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      console.error(
        "Unable to verify authenticated user:",
        userError,
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Your login session could not be verified.",
        },
        401,
      );
    }

    /*
     * Read payment information.
     */
    const body =
      await req.json() as Record<string, unknown>;

    const razorpayPaymentId =
      typeof body.razorpay_payment_id === "string"
        ? body.razorpay_payment_id
        : "";

    const razorpayOrderId =
      typeof body.razorpay_order_id === "string"
        ? body.razorpay_order_id
        : "";

    const razorpaySignature =
      typeof body.razorpay_signature === "string"
        ? body.razorpay_signature
        : "";

    if (
      !razorpayPaymentId ||
      !razorpayOrderId ||
      !razorpaySignature
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Incomplete payment verification data.",
        },
        400,
      );
    }

    /*
     * Verify that Razorpay actually knows about this order.
     *
     * This prevents someone from manually submitting
     * a fake order ID.
     */
    const razorpayKeyId =
      Deno.env.get("RAZORPAY_KEY_ID");

    if (!razorpayKeyId) {
      return jsonResponse(
        {
          success: false,
          error:
            "Razorpay configuration is incomplete.",
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
     * Fetch payment directly from Razorpay.
     */
    const razorpayPaymentResponse =
      await fetch(
        `https://api.razorpay.com/v1/payments/${razorpayPaymentId}`,
        {
          headers: {
            Authorization:
              razorpayAuthorization,
          },
        },
      );

    const razorpayPayment =
      await razorpayPaymentResponse.json();

    if (!razorpayPaymentResponse.ok) {
      console.error(
        "Unable to fetch Razorpay payment:",
        razorpayPayment,
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Unable to verify payment with Razorpay.",
        },
        400,
      );
    }

    /*
     * Ensure payment belongs to this order.
     */
    if (
      razorpayPayment.order_id !==
      razorpayOrderId
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Payment does not belong to the supplied order.",
        },
        400,
      );
    }

    /*
     * Verify payment status.
     *
     * captured is the preferred final state.
     * authorized is accepted because capture
     * may be automatic depending on Razorpay settings.
     */
    const paymentStatus =
      typeof razorpayPayment.status === "string"
        ? razorpayPayment.status
        : "";

    if (
      paymentStatus !== "captured" &&
      paymentStatus !== "authorized"
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Payment has not been successfully completed.",
        },
        400,
      );
    }

    /*
     * Verify Razorpay checkout signature.
     */
    const expectedSignature =
      await generateRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpayKeySecret,
      );

    const signatureIsValid =
      secureCompare(
        expectedSignature,
        razorpaySignature,
      );

    if (!signatureIsValid) {
      console.error(
        "Invalid Razorpay payment signature.",
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Payment signature verification failed.",
        },
        400,
      );
    }

    /*
     * Verify expected amount.
     *
     * ₹1 = 100 paise.
     */
    const expectedAmount = 100;

    if (
      razorpayPayment.amount !==
      expectedAmount
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Payment amount does not match the Academy membership price.",
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
          error:
            "Payment currency is invalid.",
        },
        400,
      );
    }

    /*
     * Use the Service Role ONLY inside
     * this Edge Function.
     *
     * Never expose this key in React.
     */
    const adminClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    /*
     * Check whether this payment has
     * already been processed.
     *
     * This prevents duplicate memberships.
     */
    const {
      data: existingMembership,
      error: existingMembershipError,
    } = await adminClient
      .from("academy_memberships")
      .select(
        "id, status",
      )
      .eq(
        "provider_payment_id",
        razorpayPaymentId,
      )
      .maybeSingle();

    if (existingMembershipError) {
      console.error(
        "Membership lookup error:",
        existingMembershipError,
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Unable to verify existing membership records.",
        },
        500,
      );
    }

    /*
     * Payment was already processed.
     */
    if (existingMembership) {
      return jsonResponse(
        {
          success: true,
          alreadyVerified: true,
          membershipId:
            existingMembership.id,
          message:
            "This payment has already activated Academy access.",
        },
        200,
      );
    }

    /*
     * Check if user already has an active
     * membership.
     */
    const {
      data: activeMembership,
      error: activeMembershipError,
    } = await adminClient
      .from("academy_memberships")
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

    if (activeMembershipError) {
      console.error(
        "Active membership lookup error:",
        activeMembershipError,
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Unable to check current Academy access.",
        },
        500,
      );
    }

    /*
     * Create or update membership.
     *
     * We insert a new auditable payment record.
     */
    const now =
      new Date().toISOString();

    const membershipPayload = {
      user_id: user.id,
      status: "active",
      plan_name:
        "CURIO AI / ML Academy PRO",
      amount: expectedAmount,
      currency: "INR",
      payment_provider: "razorpay",
      provider_order_id:
        razorpayOrderId,
      provider_payment_id:
        razorpayPaymentId,
      activated_at: now,
      expires_at: null,
      created_at: now,
      updated_at: now,
    };

    /*
     * If the user already has an active
     * membership, do not duplicate access.
     *
     * The payment still remains valid,
     * but the current system returns
     * the existing access.
     */
    if (activeMembership) {
      return jsonResponse(
        {
          success: true,
          alreadyMember: true,
          membershipId:
            activeMembership.id,
          message:
            "Academy access is already active for this account.",
        },
        200,
      );
    }

    /*
     * Insert verified membership.
     */
    const {
      data: newMembership,
      error: insertError,
    } = await adminClient
      .from("academy_memberships")
      .insert(
        membershipPayload,
      )
      .select(
        "id, user_id, status, plan_name, activated_at",
      )
      .single();

    if (insertError) {
      console.error(
        "Unable to activate membership:",
        insertError,
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Payment was verified, but Academy access could not be activated. Please contact support with your payment ID.",
        },
        500,
      );
    }

    /*
     * SUCCESS.
     *
     * Only after this point should
     * the frontend unlock Academy PRO.
     */
    return jsonResponse(
      {
        success: true,
        alreadyVerified: false,
        membership:
          newMembership,
        message:
          "Payment verified successfully. Academy PRO access is now active.",
      },
      200,
    );
  } catch (error) {
    console.error(
      "verify-academy-payment error:",
      error,
    );

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected payment verification error.",
      },
      500,
    );
  }
});