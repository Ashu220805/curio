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
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL is not configured.");
    }

    if (!supabaseAnonKey) {
      throw new Error("SUPABASE_ANON_KEY is not configured.");
    }

    if (!razorpayKeyId) {
      throw new Error("RAZORPAY_KEY_ID is not configured.");
    }

    if (!razorpayKeySecret) {
      throw new Error("RAZORPAY_KEY_SECRET is not configured.");
    }

    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse(
        {
          success: false,
          error: "You must be signed in before purchasing Academy access.",
        },
        401,
      );
    }

    const accessToken = authorization.replace("Bearer ", "").trim();

    if (!accessToken) {
      return jsonResponse(
        {
          success: false,
          error: "Invalid authentication token.",
        },
        401,
      );
    }

    /*
     * Verify the authenticated CURIO user.
     */
    const userResponse = await fetch(
      `${supabaseUrl}/auth/v1/user`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: supabaseAnonKey,
        },
      },
    );

    if (!userResponse.ok) {
      const errorText = await userResponse.text();

      console.error(
        "Supabase user verification failed:",
        userResponse.status,
        errorText,
      );

      return jsonResponse(
        {
          success: false,
          error: "Your login session is invalid or has expired. Please sign in again.",
        },
        401,
      );
    }

    const user = await userResponse.json();

    if (
      !user ||
      typeof user !== "object" ||
      !("id" in user) ||
      typeof user.id !== "string" ||
      !user.id
    ) {
      return jsonResponse(
        {
          success: false,
          error: "Unable to identify the signed-in user.",
        },
        401,
      );
    }

    /*
     * Academy test payment.
     *
     * Razorpay expects the amount in paise.
     *
     * ₹1 = 100 paise.
     */
    const amount = 100;
    const currency = "INR";

    const timestamp = Date.now();

    const receipt = `curio_${user.id.slice(0, 10)}_${timestamp}`;

    const razorpayAuthorization = `Basic ${btoa(
      `${razorpayKeyId}:${razorpayKeySecret}`,
    )}`;

    /*
     * Create the Razorpay order.
     *
     * Razorpay returns an order ID.
     * It does not return a checkout URL.
     */
    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          Authorization: razorpayAuthorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt,
          notes: {
            user_id: user.id,
            product: "curio_ai_ml_academy",
            plan_name: "academy_pro",
            source: "curio_web_app",
          },
        }),
      },
    );

    const responseText = await razorpayResponse.text();

    let razorpayOrder: Record<string, unknown> = {};

    try {
      const parsed = JSON.parse(responseText);

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        razorpayOrder = parsed as Record<string, unknown>;
      }
    } catch {
      console.error(
        "Unable to parse Razorpay response:",
        responseText,
      );
    }

    if (!razorpayResponse.ok) {
      console.error(
        "Razorpay order creation failed:",
        razorpayOrder,
      );

      const razorpayError =
        razorpayOrder.error &&
        typeof razorpayOrder.error === "object"
          ? razorpayOrder.error as Record<string, unknown>
          : null;

      const description =
        razorpayError &&
        typeof razorpayError.description === "string"
          ? razorpayError.description
          : "Unable to create Razorpay payment order.";

      return jsonResponse(
        {
          success: false,
          error: description,
        },
        razorpayResponse.status >= 400 &&
          razorpayResponse.status < 600
          ? razorpayResponse.status
          : 500,
      );
    }

    if (
      typeof razorpayOrder.id !== "string" ||
      !razorpayOrder.id
    ) {
      console.error(
        "Razorpay did not return a valid order ID:",
        razorpayOrder,
      );

      throw new Error(
        "Payment service did not return a valid Razorpay order.",
      );
    }

    /*
     * Return everything required by the React frontend
     * to open Razorpay Standard Checkout.
     */
    return jsonResponse(
      {
        success: true,

        keyId: razorpayKeyId,

        orderId: razorpayOrder.id,

        amount:
          typeof razorpayOrder.amount === "number"
            ? razorpayOrder.amount
            : amount,

        currency:
          typeof razorpayOrder.currency === "string"
            ? razorpayOrder.currency
            : currency,

        receipt:
          typeof razorpayOrder.receipt === "string"
            ? razorpayOrder.receipt
            : receipt,

        planName: "academy_pro",

        displayAmount: "₹1",

        productName: "CURIO AI / ML Academy",

        userId: user.id,
      },
      200,
    );
  } catch (error) {
    console.error(
      "create-academy-checkout unexpected error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unexpected payment service error.";

    return jsonResponse(
      {
        success: false,
        error: message,
      },
      500,
    );
  }
});