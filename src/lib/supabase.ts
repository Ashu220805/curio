import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// =========================================
// ENVIRONMENT VARIABLE CHECKS
// =========================================

if (!supabaseUrl) {
  throw new Error(
    "Missing VITE_SUPABASE_URL environment variable."
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable."
  );
}

// =========================================
// SUPABASE CLIENT
// =========================================

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);