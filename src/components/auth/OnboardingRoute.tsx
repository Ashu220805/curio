import type { ReactNode } from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../../lib/supabase.ts";

import { useAuth } from "../../hooks/useAuth.ts";


interface OnboardingRouteProps {
  children: ReactNode;
}


function OnboardingRoute({
  children,
}: OnboardingRouteProps) {

  const {
    session,
    loading: authLoading,
  } = useAuth();

  const location = useLocation();


  const [
    checkingProfile,
    setCheckingProfile,
  ] = useState(true);

  const [
    onboardingCompleted,
    setOnboardingCompleted,
  ] = useState(false);

  const [
    profileError,
    setProfileError,
  ] = useState("");


  /* =======================================================
     CHECK PROFILE / ONBOARDING STATUS
     ======================================================= */

  useEffect(() => {

    /*
     * Authentication is still being initialized.
     *
     * Do not query profiles until Supabase has finished
     * determining whether a session exists.
     */
    if (authLoading) {
      return;
    }


    /*
     * No authenticated user.
     *
     * ProtectedRoute normally handles this case, but this
     * guard keeps OnboardingRoute safe when used elsewhere.
     */
    if (!session?.user) {

      setCheckingProfile(false);

      return;
    }


    let mounted = true;


    const checkProfile = async () => {

      if (!mounted) {
        return;
      }


      setCheckingProfile(true);
      setProfileError("");


      try {

        const userId =
          session.user.id;


        /*
         * Make sure the current authenticated session is
         * still valid before querying the profile.
         */
        const {
          data: {
            session: currentSession,
          },
          error: sessionError,
        } =
          await supabase.auth.getSession();


        if (sessionError) {

          throw sessionError;

        }


        /*
         * If the session disappeared between the initial
         * auth check and this query, don't attempt a profile
         * request.
         */
        if (!currentSession?.user) {

          if (mounted) {

            setOnboardingCompleted(false);
            setCheckingProfile(false);

          }

          return;
        }


        /*
         * Fetch ONLY the field required by this route.
         *
         * This keeps the query small and avoids exposing
         * unnecessary profile information.
         */
        const {
          data,
          error,
        } = await supabase
          .from("profiles")
          .select(
            "onboarding_completed"
          )
          .eq(
            "id",
            userId
          )
          .maybeSingle();


        /*
         * IMPORTANT:
         *
         * maybeSingle() is intentionally used instead of
         * single().
         *
         * If a profile does not exist yet, Supabase returns
         * null instead of treating it as a fatal error.
         */
        if (error) {

          console.error(
            "CURIO: Profile status query failed:",
            {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint,
            }
          );


          throw error;

        }


        if (!mounted) {
          return;
        }


        /*
         * Profile exists.
         */
        if (data) {

          setOnboardingCompleted(
            data.onboarding_completed === true
          );

        }


        /*
         * Profile does not exist.
         *
         * The signup trigger normally creates the profile.
         *
         * If it doesn't exist yet, treat onboarding as
         * incomplete rather than allowing the user directly
         * into the dashboard.
         */
        else {

          setOnboardingCompleted(false);

        }


      } catch (error) {

        console.error(
          "CURIO: Unable to check onboarding status:",
          error
        );


        if (!mounted) {
          return;
        }


        /*
         * Give the user a useful message instead of exposing
         * raw Supabase errors in the UI.
         */
        const message =
          error instanceof Error
            ? error.message
            : "";


        if (
          message
            .toLowerCase()
            .includes("permission")
        ) {

          setProfileError(
            "CURIO couldn't access your learning profile. Please sign in again."
          );

        } else {

          setProfileError(
            "We couldn't verify your learning profile. Please refresh and try again."
          );

        }


        setOnboardingCompleted(false);

      } finally {

        if (mounted) {

          setCheckingProfile(false);

        }

      }

    };


    void checkProfile();


    return () => {

      mounted = false;

    };

  }, [
    authLoading,
    session,
  ]);


  /* =======================================================
     AUTH LOADING
     ======================================================= */

  if (
    authLoading ||
    checkingProfile
  ) {

    return (
      <div
        className="auth-loading-screen"
        role="status"
        aria-live="polite"
      >

        <div
          className="auth-loading-spinner"
          aria-hidden="true"
        />

        <p>
          Preparing your CURIO experience...
        </p>

      </div>
    );

  }


  /* =======================================================
     NOT AUTHENTICATED
     ======================================================= */

  if (!session) {

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );

  }


  /* =======================================================
     PROFILE ERROR
     ======================================================= */

  if (profileError) {

    return (
      <div
        className="auth-loading-screen"
        role="alert"
      >

        <p>
          {profileError}
        </p>

      </div>
    );

  }


  /* =======================================================
     ONBOARDING NOT COMPLETE
     ======================================================= */

  if (!onboardingCompleted) {

    return (
      <Navigate
        to="/onboarding"
        replace
        state={{
          from: location,
        }}
      />
    );

  }


  /* =======================================================
     ONBOARDING COMPLETE
     ======================================================= */

  return (
    <>
      {children}
    </>
  );

}


export default OnboardingRoute;