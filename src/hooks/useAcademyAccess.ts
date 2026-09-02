import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type AcademyAccessStatus =
  | "loading"
  | "guest"
  | "free"
  | "active"
  | "error";

export interface AcademyMembership {
  id: string;
  user_id: string;
  status: string;
  plan_name: string;
  amount: number;
  currency: string;
  payment_provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  activated_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useAcademyAccess() {
  const [accessStatus, setAccessStatus] =
    useState<AcademyAccessStatus>("loading");

  const [membership, setMembership] =
    useState<AcademyMembership | null>(null);

  const refreshAccess = useCallback(async () => {
    try {
      setAccessStatus("loading");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Unable to read authenticated user:", userError);
        setAccessStatus("error");
        return;
      }

      if (!user) {
        setMembership(null);
        setAccessStatus("guest");
        return;
      }

      const { data, error } = await supabase
        .from("academy_memberships")
        .select(`
          id,
          user_id,
          status,
          plan_name,
          amount,
          currency,
          payment_provider,
          provider_order_id,
          provider_payment_id,
          activated_at,
          expires_at,
          created_at,
          updated_at
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) {
        console.error("Unable to load Academy membership:", error);
        setMembership(null);
        setAccessStatus("error");
        return;
      }

      if (!data) {
        setMembership(null);
        setAccessStatus("free");
        return;
      }

      const now = new Date();

      if (
        data.expires_at &&
        new Date(data.expires_at) < now
      ) {
        setMembership(data);
        setAccessStatus("free");
        return;
      }

      setMembership(data);
      setAccessStatus("active");
    } catch (error) {
      console.error("Unexpected Academy access error:", error);

      setMembership(null);
      setAccessStatus("error");
    }
  }, []);

  useEffect(() => {
    void refreshAccess();
  }, [refreshAccess]);

  return {
    accessStatus,
    membership,
    hasAcademyAccess: accessStatus === "active",
    isLoading: accessStatus === "loading",
    refreshAccess,
  };
}