import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase.ts";

export function useAuth() {
  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    // -----------------------------------------
    // GET INITIAL SESSION
    // -----------------------------------------
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Failed to get authentication session:",
            error.message
          );
        }

        if (mounted) {
          setSession(session);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Authentication initialization error:",
          error
        );

        if (mounted) {
          setSession(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // -----------------------------------------
    // LISTEN FOR AUTH CHANGES
    // -----------------------------------------
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) {
          return;
        }

        setSession(newSession);
        setLoading(false);
      }
    );

    // -----------------------------------------
    // CLEANUP
    // -----------------------------------------
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user: session?.user ?? null,
    loading,
  };
}