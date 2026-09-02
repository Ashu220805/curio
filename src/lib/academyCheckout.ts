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

interface VerifyPaymentResponse {
  success: boolean;
  membershipActive?: boolean;
  message?: string;
}

export interface CheckoutResult {
  paymentId: string;
  orderId: string;
  signature: string;
}

export async function startAcademyCheckout(): Promise<CheckoutResult> {
  /*
   * Prevent checkout if the user is not authenticated.
   */
  const {
    data: {
      session,
    },
    error: sessionError,
  } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(
      sessionError.message,
    );
  }

  if (!session) {
    throw new Error(
      "You must sign in before purchasing Academy access.",
    );
  }

  /*
   * Load Razorpay only when payment begins.
   */
  const razorpayLoaded =
    await loadRazorpayScript();

  if (!razorpayLoaded) {
    throw new Error(
      "Unable to load Razorpay Checkout. Please refresh and try again.",
    );
  }

  /*
   * Create a secure Razorpay order on the server.
   */
  const {
    data,
    error,
  } =
    await supabase.functions.invoke<CheckoutResponse>(
      "create-academy-checkout",
      {
        headers: {
          Authorization:
            `Bearer ${session.access_token}`,
        },
      },
    );

  if (error) {
    throw new Error(
      error.message ||
        "Unable to create the payment order.",
    );
  }

  if (!data) {
    throw new Error(
      "Payment service returned no order information.",
    );
  }

  if (
    data.success !== true ||
    typeof data.keyId !== "string" ||
    data.keyId.length === 0 ||
    typeof data.orderId !== "string" ||
    data.orderId.length === 0 ||
    typeof data.amount !== "number" ||
    data.amount <= 0 ||
    typeof data.currency !== "string" ||
    data.currency.length === 0
  ) {
    throw new Error(
      "The payment service returned an invalid checkout order.",
    );
  }

  /*
   * Open Razorpay Checkout.
   */
  return new Promise<CheckoutResult>(
    (resolve, reject) => {
      const RazorpayConstructor =
        window.Razorpay;

      if (!RazorpayConstructor) {
        reject(
          new Error(
            "Razorpay Checkout is unavailable.",
          ),
        );

        return;
      }

      let completed = false;

      const razorpay =
        new RazorpayConstructor({
          key: data.keyId,

          amount: data.amount,

          currency: data.currency,

          name:
            "CURIO Academy",

          description:
            "CURIO AI / ML Academy PRO Membership",

          order_id:
            data.orderId,

          prefill: {
            email:
              session.user.email ?? "",
          },

          handler: async (
            response:
              RazorpayPaymentResponse,
          ) => {
            completed = true;

            try {
              /*
               * IMPORTANT:
               * Razorpay success is NOT trusted by itself.
               *
               * Send the signature to Supabase for verification.
               */
              const {
                data: verificationData,
                error: verificationError,
              } =
                await supabase.functions.invoke<VerifyPaymentResponse>(
                  "verify-academy-payment",
                  {
                    headers: {
                      Authorization:
                        `Bearer ${session.access_token}`,
                    },

                    body: {
                      razorpay_payment_id:
                        response.razorpay_payment_id,

                      razorpay_order_id:
                        response.razorpay_order_id,

                      razorpay_signature:
                        response.razorpay_signature,
                    },
                  },
                );

              if (verificationError) {
                throw new Error(
                  verificationError.message ||
                    "Payment verification failed.",
                );
              }

              if (
                !verificationData ||
                verificationData.success !== true ||
                verificationData.membershipActive !== true
              ) {
                throw new Error(
                  verificationData?.message ||
                    "Payment was received but Academy access could not yet be activated.",
                );
              }

              resolve({
                paymentId:
                  response.razorpay_payment_id,

                orderId:
                  response.razorpay_order_id,

                signature:
                  response.razorpay_signature,
              });
            } catch (
              verificationFailure
            ) {
              reject(
                verificationFailure instanceof Error
                  ? verificationFailure
                  : new Error(
                      "Payment verification failed.",
                    ),
              );
            }
          },

          modal: {
            ondismiss: () => {
              if (!completed) {
                reject(
                  new Error(
                    "Payment was cancelled.",
                  ),
                );
              }
            },
          },

          theme: {
            color:
              "#111827",
          },
        });

      razorpay.open();
    },
  );
}