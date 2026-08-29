
import type { ReactNode } from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useEffect, useState } from "react";

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


  useEffect(() => {

    if (
      authLoading ||
      !session?.user
    ) {
      return;
    }

    let mounted = true;


    const checkProfile = async () => {

      setCheckingProfile(true);
      setProfileError("");


      try {

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
            session.user.id
          )
          .single();


        if (error) {
          throw error;
        }


        if (!mounted) {
          return;
        }


        setOnboardingCompleted(
          Boolean(
            data?.onboarding_completed
          )
        );


      } catch (error) {

        console.error(
          "CURIO: Unable to check onboarding status:",
          error
        );


        if (mounted) {

          setProfileError(
            "We couldn't verify your learning profile. Please refresh and try again."
          );

        }

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

  if (authLoading || checkingProfile) {

    return (
      <div className="auth-loading-screen">

        <div className="auth-loading-spinner" />

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
      <div className="auth-loading-screen">

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


  return (
    <>
      {children}
    </>
  );
}


export default OnboardingRoute;
