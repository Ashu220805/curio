export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  prefill?: {
    name?: string;
    email?: string;
  };

  handler: (
    response: RazorpayPaymentResponse,
  ) => void | Promise<void>;

  modal?: {
    ondismiss?: () => void;
  };

  theme?: {
    color?: string;
  };
}

export interface RazorpayInstance {
  open: () => void;
}

export interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

/*
 * Extend globalThis with Razorpay's browser SDK.
 */
declare global {
  var Razorpay: RazorpayConstructor | undefined;
}

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

/*
 * Load the Razorpay Checkout SDK once.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    /*
     * This library only works in the browser.
     */
    if (typeof document === "undefined") {
      resolve(false);
      return;
    }

    /*
     * Razorpay is already available.
     */
    if (globalThis.Razorpay) {
      resolve(true);
      return;
    }

    /*
     * Check whether another call already added the script.
     */
    const existingScript =
      document.querySelector<HTMLScriptElement>(
        `script[src="${RAZORPAY_SCRIPT_URL}"]`,
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => {
          resolve(Boolean(globalThis.Razorpay));
        },
        {
          once: true,
        },
      );

      existingScript.addEventListener(
        "error",
        () => {
          resolve(false);
        },
        {
          once: true,
        },
      );

      return;
    }

    /*
     * Create and load Razorpay Checkout.
     */
    const script =
      document.createElement("script");

    script.src =
      RAZORPAY_SCRIPT_URL;

    script.async =
      true;

    script.onload =
      () => {
        resolve(
          Boolean(globalThis.Razorpay),
        );
      };

    script.onerror =
      () => {
        resolve(false);
      };

    document.head.appendChild(script);
  });
}