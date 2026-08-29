import type { ReactNode } from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.ts";


// =========================================================
// TYPES
// =========================================================

interface ProtectedRouteProps {
  children: ReactNode;
  allowGuest?: boolean;
}


// =========================================================
// PROTECTED ROUTE
// =========================================================

function ProtectedRoute({
  children,
  allowGuest = false,
}: ProtectedRouteProps) {

  const {
    session,
    loading,
  } = useAuth();

  const location = useLocation();


  // =======================================================
  // GUEST MODE
  // =======================================================

  let isGuest = false;

  try {

    isGuest =
      sessionStorage.getItem(
        "curio_guest",
      ) === "true";

  } catch (error) {

    console.error(
      "CURIO: Unable to access guest session:",
      error,
    );

  }


  // =======================================================
  // AUTHENTICATION LOADING
  //
  // IMPORTANT:
  // Do not redirect while Supabase is still checking
  // whether an existing session is available.
  // =======================================================

  if (loading) {

    return (
      <div
        className="auth-loading-screen"
        role="status"
        aria-live="polite"
        aria-label="Loading CURIO"
      >

        <div
          className="auth-loading-spinner"
          aria-hidden="true"
        />

        <p>
          Loading CURIO...
        </p>

      </div>
    );
  }


  // =======================================================
  // GUEST ACCESS
  //
  // Guest users can access only routes explicitly marked
  // with allowGuest.
  // =======================================================

  if (
    allowGuest &&
    isGuest
  ) {

    return (
      <>
        {children}
      </>
    );
  }


  // =======================================================
  // AUTHENTICATION REQUIRED
  //
  // No Supabase session means the user is not authenticated.
  // Send them to Login and remember where they came from.
  // =======================================================

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


  // =======================================================
  // AUTHENTICATED USER
  // =======================================================

  return (
    <>
      {children}
    </>
  );
}


export default ProtectedRoute;