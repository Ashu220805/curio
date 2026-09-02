export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface RazorpayModalOptions {
  ondismiss?: () => void;
}

export interface RazorpayTheme {
  color?: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  prefill?: RazorpayPrefill;

  handler: (
    response: RazorpayPaymentResponse,
  ) => void | Promise<void>;

  modal?: RazorpayModalOptions;

  theme?: RazorpayTheme;
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

  var Razorpay: RazorpayConstructor | undefined;
}

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

let razorpayScriptPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay || globalThis.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise<boolean>((resolve) => {
    const existingScript =
      document.querySelector<HTMLScriptElement>(
        `script[src="${RAZORPAY_SCRIPT_URL}"]`,
      );

    if (existingScript) {
      const checkRazorpay = () => {
        resolve(Boolean(window.Razorpay || globalThis.Razorpay));
      };

      existingScript.addEventListener(
        "load",
        checkRazorpay,
        { once: true },
      );

      existingScript.addEventListener(
        "error",
        () => {
          razorpayScriptPromise = null;
          resolve(false);
        },
        { once: true },
      );

      return;
    }

    const script = document.createElement("script");

    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      const loaded = Boolean(
        window.Razorpay || globalThis.Razorpay,
      );

      if (!loaded) {
        razorpayScriptPromise = null;
      }

      resolve(loaded);
    };

    script.onerror = () => {
      razorpayScriptPromise = null;
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return razorpayScriptPromise;
}

export function getRazorpayConstructor():
  | RazorpayConstructor
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.Razorpay ?? globalThis.Razorpay ?? null;
}