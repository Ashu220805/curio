import { supabase } from "./supabase.ts";

type CheckoutResponse = { url?: string };

export async function startAcademyCheckout(): Promise<string> {
  const { data, error } = await supabase.functions.invoke<CheckoutResponse>(
    "create-academy-checkout",
    { body: { product: "curio_ai_ml_academy" } },
  );
  if (error) throw new Error(error.message || "Unable to start checkout.");
  if (!data?.url) throw new Error("Checkout URL was not returned by the payment service.");
  return data.url;
}
