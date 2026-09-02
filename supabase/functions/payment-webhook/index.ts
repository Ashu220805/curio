import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const encoder = new TextEncoder();

async function verifySignature(
  payload: string,
  signature: string,
  secret: string,
) {
  const key = await crypto.subtle.importKey(
    "raw",

    encoder.encode(secret),

    {
      name: "HMAC",

      hash: "SHA-256",
    },

    false,

    ["verify"],
  );

  const signatureBytes =
    Uint8Array.from(
      signature.match(/.{1,2}/g)?.map(
        (byte) =>
          parseInt(byte, 16),
      ) || [],
    );

  return await crypto.subtle.verify(
    "HMAC",

    key,

    signatureBytes,

    encoder.encode(payload),
  );
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        "Method not allowed",
        {
          status: 405,
        },
      );
    }

    const signature =
      req.headers.get(
        "x-razorpay-signature",
      );

    if (!signature) {
      return new Response(
        "Missing Razorpay signature",
        {
          status: 401,
        },
      );
    }

    const rawBody =
      await req.text();

    const webhookSecret =
      Deno.env.get(
        "RAZORPAY_WEBHOOK_SECRET",
      );

    if (!webhookSecret) {
      throw new Error(
        "Webhook secret is not configured.",
      );
    }

    const isValid =
      await verifySignature(
        rawBody,

        signature,

        webhookSecret,
      );

    if (!isValid) {
      return new Response(
        "Invalid webhook signature",
        {
          status: 401,
        },
      );
    }

    const event =
      JSON.parse(rawBody);

    const supabaseUrl =
      Deno.env.get(
        "SUPABASE_URL",
      )!;

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY",
      )!;

    const supabase =
      createClient(
        supabaseUrl,
        serviceRoleKey,
      );

    /*
      Payment captured.
    */

    if (
      event.event ===
      "payment.captured"
    ) {
      const payment =
        event.payload.payment.entity;

      const orderId =
        payment.order_id;

      /*
        Find transaction.
      */

      const {
        data: transaction,
      } = await supabase
        .from(
          "payment_transactions",
        )
        .select("*")
        .eq(
          "provider_order_id",
          orderId,
        )
        .maybeSingle();

      if (!transaction) {
        console.error(
          "Unknown payment order:",
          orderId,
        );

        return new Response(
          "Order not found",
          {
            status: 404,
          },
        );
      }

      /*
        Verify amount.
      */

      if (
        payment.amount !==
        transaction.amount
      ) {
        console.error(
          "Amount mismatch",
        );

        return new Response(
          "Amount verification failed",
          {
            status: 400,
          },
        );
      }

      /*
        Activate transaction.
      */

      await supabase
        .from(
          "payment_transactions",
        )
        .update({
          provider_payment_id:
            payment.id,

          status:
            "paid",

          raw_payload:
            event,
        })
        .eq(
          "provider_order_id",
          orderId,
        );

      /*
        Unlock Academy.
      */

      await supabase
        .from(
          "academy_memberships",
        )
        .update({
          status:
            "active",

          provider_payment_id:
            payment.id,

          activated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "user_id",
          transaction.user_id,
        );

      console.log(
        `Academy activated for user ${transaction.user_id}`,
      );
    }

    /*
      Payment failed.
    */

    if (
      event.event ===
      "payment.failed"
    ) {
      const payment =
        event.payload.payment.entity;

      if (payment.order_id) {
        await supabase
          .from(
            "payment_transactions",
          )
          .update({
            status:
              "failed",

            raw_payload:
              event,
          })
          .eq(
            "provider_order_id",
            payment.order_id,
          );
      }
    }

    return new Response(
      JSON.stringify({
        received: true,
      }),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/json",
        },
      },
    );
  } catch (error) {
    console.error(error);

    return new Response(
      "Webhook processing failed",
      {
        status: 500,
      },
    );
  }
});