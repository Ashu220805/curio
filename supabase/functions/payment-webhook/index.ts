const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

async function createHmacHex(
  secret: string,
  message: string,
): Promise<string> {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message),
  );

  return Array.from(
    new Uint8Array(signature),
  )
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      {
        error: "Method not allowed",
      },
      405,
    );
  }

  try {
    const webhookSecret =
      Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

    if (!webhookSecret) {
      return jsonResponse(
        {
          error:
            "Webhook secret is not configured.",
        },
        500,
      );
    }

    const signature = req.headers.get(
      "x-razorpay-signature",
    );

    if (!signature) {
      return jsonResponse(
        {
          error:
            "Missing Razorpay webhook signature.",
        },
        400,
      );
    }

    /*
     * IMPORTANT:
     * Read the raw body BEFORE JSON parsing.
     */
    const rawBody = await req.text();

    const expectedSignature =
      await createHmacHex(
        webhookSecret,
        rawBody,
      );

    if (signature !== expectedSignature) {
      console.error(
        "Invalid Razorpay webhook signature.",
      );

      return jsonResponse(
        {
          error: "Invalid webhook signature.",
        },
        401,
      );
    }

    const event = JSON.parse(rawBody);

    console.log(
      "Razorpay webhook event:",
      event.event,
    );

    /*
     * For now, accept valid events.
     *
     * Next we connect this to:
     *
     * academy_memberships
     * payment_transactions
     */

    return jsonResponse({
      received: true,
      event: event.event,
    });
  } catch (error) {
    console.error(
      "payment-webhook error:",
      error,
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed.",
      },
      500,
    );
  }
});