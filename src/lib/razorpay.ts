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

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const scriptUrl =
      "https://checkout.razorpay.com/v1/checkout.js";

    const existingScript =
      document.querySelector<HTMLScriptElement>(
        `script[src="${scriptUrl}"]`,
      );

    if (existingScript) {
      const checkExistingScript = () => {
        resolve(Boolean(window.Razorpay));
      };

      existingScript.addEventListener(
        "load",
        checkExistingScript,
        { once: true },
      );

      existingScript.addEventListener(
        "error",
        () => resolve(false),
        { once: true },
      );

      return;
    }

    const script =
      document.createElement("script");

    script.src = scriptUrl;
    script.async = true;

    script.onload = () => {
      resolve(Boolean(window.Razorpay));
    };

    script.onerror = () => {
      resolve(false);
    };

    document.head.appendChild(script);
  });
}