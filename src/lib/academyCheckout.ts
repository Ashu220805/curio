import { supabase } from "./supabase";
import {
  loadRazorpayScript,
  type RazorpayPaymentResponse,
} from "./razorpay";

interface CheckoutResponse {
  success: boolean;
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  userId: string;
}

interface CheckoutResult {
  paymentId: string;
  orderId: string;
  signature: string;
}

export async function startAcademyCheckout(): Promise<CheckoutResult> {
  const razorpayLoaded = await loadRazorpayScript();

  if (!razorpayLoaded) {
    throw new Error(
      "Unable to load the Razorpay payment service. Please refresh and try again.",
    );
  }

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
        "Unable to start the payment service.",
    );
  }

  if (!data) {
    throw new Error(
      "No payment information was returned by the payment service.",
    );
  }

  if (
    !data.success ||
    !data.keyId ||
    !data.orderId ||
    !data.amount ||
    !data.currency
  ) {
    throw new Error(
      "Invalid payment information was returned by the payment service.",
    );
  }

  return new Promise<CheckoutResult>((resolve, reject) => {
    const RazorpayConstructor = globalThis.Razorpay;

    if (!RazorpayConstructor) {
      reject(
        new Error(
          "Razorpay checkout is unavailable. Please refresh and try again.",
        ),
      );
      return;
    }

    const razorpay = new RazorpayConstructor({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "CURIO Academy",
      description: "CURIO AI / ML Academy PRO Membership",
      order_id: data.orderId,

      handler: async (
        response: RazorpayPaymentResponse,
      ) => {
        resolve({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });
      },

      modal: {
        ondismiss: () => {
          reject(
            new Error(
              "Payment was cancelled before completion.",
            ),
          );
        },
      },
    });

    razorpay.open();
  });
}