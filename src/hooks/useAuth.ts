import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase.ts";

export function useAuth() {
  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [isGuest, setIsGuest] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    // -----------------------------------------
    // CHECK GUEST MODE
    // -----------------------------------------
    const checkGuestMode = () => {
      try {
        const guest =
          sessionStorage.getItem(
            "curio_guest"
          ) === "true";

        if (mounted) {
          setIsGuest(guest);
        }
      } catch (error) {
        console.error(
          "Failed to check CURIO guest mode:",
          error
        );

        if (mounted) {
          setIsGuest(false);
        }
      }
    };

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

        if (!mounted) {
          return;
        }

        setSession(session);

        /*
         * A real Supabase session always takes
         * priority over guest mode.
         */
        if (session) {
          try {
            sessionStorage.removeItem(
              "curio_guest"
            );
          } catch (error) {
            console.error(
              "Failed to clear guest mode:",
              error
            );
          }

          setIsGuest(false);
        } else {
          checkGuestMode();
        }

        setLoading(false);
      } catch (error) {
        console.error(
          "Authentication initialization error:",
          error
        );

        if (mounted) {
          setSession(null);
          checkGuestMode();
          setLoading(false);
        }
      }
    };

    void getInitialSession();

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

        if (newSession) {
          /*
           * Authenticated user:
           * guest mode must be disabled.
           */
          try {
            sessionStorage.removeItem(
              "curio_guest"
            );
          } catch (error) {
            console.error(
              "Failed to clear guest mode:",
              error
            );
          }

          setIsGuest(false);
        } else {
          /*
           * No authenticated session.
           * Check whether the user is a guest.
           */
          checkGuestMode();
        }

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

    // -----------------------------------------
    // GUEST INFORMATION
    // -----------------------------------------
    isGuest,

    // A user is allowed to use CURIO when they
    // are either authenticated OR a guest.
    isAuthenticated:
      Boolean(session) || isGuest,
  };
}