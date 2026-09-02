import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.ts";

export type AcademyAccessStatus = "loading" | "anonymous" | "inactive" | "active" | "unavailable" | "development_preview";

type EntitlementRow = { access_status: string | null; expires_at: string | null };

function isCurrentlyActive(row: EntitlementRow | null): boolean {
  if (!row || row.access_status !== "active") return false;
  if (!row.expires_at) return true;
  return new Date(row.expires_at).getTime() > Date.now();
}

/**
 * Paid access is database-backed. Browser progress, URL parameters and
 * localStorage are never accepted as proof of payment.
 *
 * VITE_ACADEMY_DEV_PREVIEW=true is only a local/development preview escape
 * hatch so the complete UI can be inspected before payment infrastructure is
 * connected. Do not set it in production.
 */
export function useAcademyAccess() {
  const [status, setStatus] = useState<AcademyAccessStatus>("loading");
  const [isMember, setIsMember] = useState(false);

  const reload = useCallback(async () => {
    if (import.meta.env.DEV && import.meta.env.VITE_ACADEMY_DEV_PREVIEW === "true") {
      setIsMember(true);
      setStatus("development_preview");
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setIsMember(false);
      setStatus("anonymous");
      return;
    }

    const { data, error } = await supabase
      .from("academy_entitlements")
      .select("access_status, expires_at")
      .eq("user_id", user.id)
      .eq("product", "curio_ai_ml_academy")
      .maybeSingle();

    if (error) {
      setIsMember(false);
      setStatus("unavailable");
      return;
    }

    const active = isCurrentlyActive((data ?? null) as EntitlementRow | null);
    setIsMember(active);
    setStatus(active ? "active" : "inactive");
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  return { isMember, status, loading: status === "loading", reload };
}
