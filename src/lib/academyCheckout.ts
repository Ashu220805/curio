import { supabase } from "./supabase.ts";
import {
  loadRazorpayScript,
  type RazorpayPaymentResponse,
} from "./razorpay.ts";

interface CheckoutResponse {
  success: boolean;
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  userId: string;
}

export interface CheckoutResult {
  paymentId: string;
  orderId: string;
  signature: string;
}

export async function startAcademyCheckout(): Promise<CheckoutResult> {
  /*
   * 1. Make sure Razorpay Checkout JS is available.
   */
  const razorpayLoaded = await loadRazorpayScript();

  if (!razorpayLoaded) {
    throw new Error(
      "Unable to load Razorpay Checkout. Please refresh and try again.",
    );
  }

  /*
   * 2. Get the current authenticated user session.
   */
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (!session) {
    throw new Error(
      "You must be signed in before purchasing Academy access.",
    );
  }

  /*
   * 3. Ask the Supabase Edge Function to create a Razorpay Order.
   */
  const { data, error } =
    await supabase.functions.invoke<CheckoutResponse>(
      "create-academy-checkout",
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

  if (error) {
    throw new Error(
      error.message ||
        "Unable to create the Razorpay payment order.",
    );
  }

  if (!data) {
    throw new Error(
      "No payment information was returned by the payment service.",
    );
  }

  /*
   * Razorpay order information validation.
   *
   * amount can theoretically be 0, so check explicitly rather
   * than using !data.amount.
   */
  if (
    data.success !== true ||
    !data.keyId ||
    !data.orderId ||
    typeof data.amount !== "number" ||
    data.amount <= 0 ||
    !data.currency
  ) {
    throw new Error(
      "Invalid payment information was returned by the payment service.",
    );
  }

  /*
   * 4. Open the Razorpay Checkout popup.
   */
  return new Promise<CheckoutResult>((resolve, reject) => {
    const RazorpayConstructor = globalThis.Razorpay;

    if (!RazorpayConstructor) {
      reject(
        new Error(
          "Razorpay Checkout is unavailable. Please refresh and try again.",
        ),
      );
      return;
    }

    let completed = false;

    const razorpay = new RazorpayConstructor({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,

      name: "CURIO Academy",
      description:
        "CURIO AI / ML Academy PRO Membership",

      order_id: data.orderId,

      handler: (
        response: RazorpayPaymentResponse,
      ) => {
        completed = true;

        resolve({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });
      },

      modal: {
        ondismiss: () => {
          /*
           * Don't reject after a successful payment handler
           * has already completed.
           */
          if (!completed) {
            reject(
              new Error(
                "Payment was cancelled before completion.",
              ),
            );
          }
        },
      },
    });

    razorpay.open();
  });
}