import { supabase } from "./supabase.ts";

import {
  loadRazorpayScript,
  type RazorpayPaymentResponse,
  type RazorpayConstructor,
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

/*
 * Get Razorpay safely.
 *
 * Do not directly use:
 *
 * globalThis.Razorpay
 *
 * unless Razorpay has been declared on the global type.
 */
function getRazorpayConstructor(): RazorpayConstructor | null {
  const globalWithRazorpay = globalThis as typeof globalThis & {
    Razorpay?: RazorpayConstructor;
  };

  return globalWithRazorpay.Razorpay ?? null;
}

export async function startAcademyCheckout(): Promise<CheckoutResult> {
  /*
   * STEP 1
   * Get the authenticated Supabase session.
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
      "You must sign in before purchasing Academy access.",
    );
  }

  /*
   * STEP 2
   * Load Razorpay Checkout script.
   */

  const razorpayLoaded = await loadRazorpayScript();

  if (!razorpayLoaded) {
    throw new Error(
      "Unable to load Razorpay Checkout. Please refresh and try again.",
    );
  }

  /*
   * STEP 3
   * Create the Razorpay Order using the Supabase Edge Function.
   *
   * The frontend NEVER creates the order itself because
   * RAZORPAY_KEY_SECRET must remain on the server.
   */

  const {
    data: checkoutData,
    error: checkoutError,
  } = await supabase.functions.invoke<CheckoutResponse>(
    "create-academy-checkout",
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  if (checkoutError) {
    throw new Error(
      checkoutError.message ||
        "Unable to create the Razorpay payment order.",
    );
  }

  if (!checkoutData) {
    throw new Error(
      "Payment service returned no checkout information.",
    );
  }

  /*
   * STEP 4
   * Validate the order returned by Supabase.
   */

  if (
    checkoutData.success !== true ||
    typeof checkoutData.keyId !== "string" ||
    checkoutData.keyId.trim().length === 0 ||
    typeof checkoutData.orderId !== "string" ||
    checkoutData.orderId.trim().length === 0 ||
    typeof checkoutData.amount !== "number" ||
    !Number.isFinite(checkoutData.amount) ||
    checkoutData.amount <= 0 ||
    typeof checkoutData.currency !== "string" ||
    checkoutData.currency.trim().length === 0
  ) {
    console.error(
      "Invalid checkout response:",
      checkoutData,
    );

    throw new Error(
      "The payment service returned an invalid checkout order.",
    );
  }

  /*
   * STEP 5
   * Get Razorpay constructor safely.
   */

  const RazorpayConstructor =
    getRazorpayConstructor();

  if (!RazorpayConstructor) {
    throw new Error(
      "Razorpay Checkout is unavailable. Please refresh and try again.",
    );
  }

  /*
   * STEP 6
   * Open Razorpay.
   */

  return new Promise<CheckoutResult>(
    (resolve, reject) => {
      let settled = false;
      let paymentHandlerStarted = false;

      /*
       * Helper functions prevent resolving/rejecting
       * the Promise multiple times.
       */

      const resolveOnce = (
        result: CheckoutResult,
      ) => {
        if (settled) {
          return;
        }

        settled = true;

        resolve(result);
      };

      const rejectOnce = (
        error: Error,
      ) => {
        if (settled) {
          return;
        }

        settled = true;

        reject(error);
      };

      try {
        const razorpay =
          new RazorpayConstructor({
            key: checkoutData.keyId,

            amount: checkoutData.amount,

            currency: checkoutData.currency,

            name: "CURIO Academy",

            description:
              "CURIO AI / ML Academy PRO Membership",

            order_id:
              checkoutData.orderId,

            prefill: {
              email:
                session.user.email ?? "",
            },

            /*
             * Razorpay calls this after successful payment.
             */

            handler: async (
              response: RazorpayPaymentResponse,
            ) => {
              paymentHandlerStarted = true;

              try {
                /*
                 * Validate Razorpay response before sending
                 * it to the verification Edge Function.
                 */

                if (
                  !response ||
                  typeof response.razorpay_payment_id !== "string" ||
                  response.razorpay_payment_id.length === 0 ||
                  typeof response.razorpay_order_id !== "string" ||
                  response.razorpay_order_id.length === 0 ||
                  typeof response.razorpay_signature !== "string" ||
                  response.razorpay_signature.length === 0
                ) {
                  throw new Error(
                    "Razorpay returned incomplete payment information.",
                  );
                }

                /*
                 * Security check:
                 *
                 * Make sure the order returned by Razorpay
                 * is the same order created for this checkout.
                 */

                if (
                  response.razorpay_order_id !==
                  checkoutData.orderId
                ) {
                  throw new Error(
                    "The payment response does not match the checkout order.",
                  );
                }

                /*
                 * STEP 7
                 *
                 * Verify the payment on the SERVER.
                 *
                 * The Edge Function should:
                 *
                 * 1. Verify Razorpay signature.
                 * 2. Fetch/check payment if necessary.
                 * 3. Confirm successful payment.
                 * 4. Activate academy_memberships.
                 *
                 * Never activate membership only from
                 * frontend payment success.
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
                  console.error(
                    "Payment verification error:",
                    verificationError,
                  );

                  throw new Error(
                    verificationError.message ||
                      "Payment verification failed.",
                  );
                }

                if (!verificationData) {
                  throw new Error(
                    "The payment verification service returned no response.",
                  );
                }

                if (
                  verificationData.success !== true
                ) {
                  throw new Error(
                    verificationData.message ||
                      "Payment verification was unsuccessful.",
                  );
                }

                if (
                  verificationData.membershipActive !== true
                ) {
                  throw new Error(
                    verificationData.message ||
                      "Payment was verified, but Academy access could not be activated.",
                  );
                }

                /*
                 * STEP 8
                 *
                 * Payment and membership activation succeeded.
                 */

                resolveOnce({
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
                console.error(
                  "Academy payment verification failed:",
                  verificationFailure,
                );

                rejectOnce(
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
                /*
                 * Razorpay can close its modal after the
                 * successful handler has started.
                 *
                 * Do NOT mark payment as cancelled in that case.
                 */

                if (
                  paymentHandlerStarted ||
                  settled
                ) {
                  return;
                }

                rejectOnce(
                  new Error(
                    "Payment was cancelled before completion.",
                  ),
                );
              },
            },

            theme: {
              color: "#111827",
            },
          });

        razorpay.open();
      } catch (
        checkoutFailure
      ) {
        rejectOnce(
          checkoutFailure instanceof Error
            ? checkoutFailure
            : new Error(
                "Unable to open Razorpay Checkout.",
              ),
        );
      }
    },
  );
}