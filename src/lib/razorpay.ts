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
 * Tell TypeScript that Razorpay Checkout
 * attaches itself to globalThis.
 */
declare global {
  var Razorpay: RazorpayConstructor | undefined;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
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

    const scriptUrl =
      "https://checkout.razorpay.com/v1/checkout.js";

    /*
     * Check whether the script was already
     * added to the page.
     */
    const existingScript =
      document.querySelector<HTMLScriptElement>(
        `script[src="${scriptUrl}"]`,
      );

    if (existingScript) {
      /*
       * Script may have loaded between the
       * previous check and this point.
       */
      if (globalThis.Razorpay) {
        resolve(true);
        return;
      }

      existingScript.addEventListener(
        "load",
        () => {
          resolve(
            typeof globalThis.Razorpay !==
              "undefined",
          );
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
     * Create Razorpay Checkout script.
     */
    const script =
      document.createElement("script");

    script.src = scriptUrl;
    script.async = true;

    script.onload = () => {
      resolve(
        typeof globalThis.Razorpay !==
          "undefined",
      );
    };

    script.onerror = () => {
      resolve(false);
    };

    document.head.appendChild(script);
  });
}