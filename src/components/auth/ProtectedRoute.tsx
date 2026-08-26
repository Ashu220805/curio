import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.ts";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const {
    session,
    loading,
  } = useAuth();

  const location = useLocation();

  // -----------------------------------------
  // AUTHENTICATION CHECK IN PROGRESS
  // -----------------------------------------
  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />

        <p>
          Loading CURIO...
        </p>
      </div>
    );
  }

  // -----------------------------------------
  // USER NOT AUTHENTICATED
  // -----------------------------------------
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

  // -----------------------------------------
  // USER AUTHENTICATED
  // -----------------------------------------
  return (
    <>
      {children}
    </>
  );
}

export default ProtectedRoute;