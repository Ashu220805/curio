import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return new Response(
        JSON.stringify({
          error: "You must be signed in before purchasing Academy access.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(
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

    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Invalid user session.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    /*
      Check existing membership.
    */

    const { data: membership } = await adminClient
      .from("academy_memberships")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership?.status === "active") {
      return new Response(
        JSON.stringify({
          alreadyActive: true,
          message: "Your AI/ML Academy membership is already active.",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    /*
      ₹1 = 100 paise.
    */

    const amount = 100;

    const razorpayKeyId =
      Deno.env.get("RAZORPAY_KEY_ID");

    const razorpayKeySecret =
      Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error(
        "Razorpay environment variables are missing.",
      );
    }

    const credentials =
      `${razorpayKeyId}:${razorpayKeySecret}`;

    const basicAuth =
      "Basic " + btoa(credentials);

    /*
      Create Razorpay order.
    */

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",

        headers: {
          Authorization: basicAuth,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          amount,

          currency: "INR",

          receipt:
            `curio_${user.id.slice(0, 12)}_${Date.now()}`,

          notes: {
            user_id: user.id,

            product:
              "CURIO AI/ML Academy",

            plan:
              "academy_access",
          },
        }),
      },
    );

    const razorpayOrder =
      await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error(razorpayOrder);

      throw new Error(
        razorpayOrder?.error?.description ||
          "Unable to create Razorpay order.",
      );
    }

    /*
      Create pending membership.
    */

    await adminClient
      .from("academy_memberships")
      .upsert(
        {
          user_id: user.id,

          status: "pending",

          plan_name:
            "AI/ML Academy",

          amount,

          currency: "INR",

          payment_provider:
            "razorpay",

          provider_order_id:
            razorpayOrder.id,
        },
        {
          onConflict: "user_id",
        },
      );

    /*
      Store transaction.
    */

    await adminClient
      .from("payment_transactions")
      .upsert(
        {
          user_id: user.id,

          provider:
            "razorpay",

          provider_order_id:
            razorpayOrder.id,

          amount,

          currency:
            "INR",

          status:
            "created",
        },
        {
          onConflict:
            "provider_order_id",
        },
      );

    return new Response(
      JSON.stringify({
        orderId:
          razorpayOrder.id,

        amount,

        currency:
          "INR",

        keyId:
          razorpayKeyId,

        userEmail:
          user.email,

        product:
          "CURIO AI/ML Academy",
      }),
      {
        status: 200,

        headers: {
          ...corsHeaders,

          "Content-Type":
            "application/json",
        },
      },
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Unable to start checkout.",
      }),
      {
        status: 500,

        headers: {
          ...corsHeaders,

          "Content-Type":
            "application/json",
        },
      },
    );
  }
});