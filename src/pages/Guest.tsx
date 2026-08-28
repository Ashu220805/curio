import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase.ts";

function Guest() {
  const navigate = useNavigate();

  /* =========================================
     GUEST MODE STATE
  ========================================== */

  const [isStarting, setIsStarting] =
    useState(false);

  /* =========================================
     START EXPLORING AS GUEST
  ========================================== */

  const handleStartExploring =
    async () => {
      /*
        Prevent multiple clicks from creating
        multiple navigation/session operations.
      */

      if (isStarting) {
        return;
      }

      setIsStarting(true);

      try {
        /*
          Remove the existing Supabase session
          from THIS browser/device.

          We use local scope because Guest Mode
          should not globally revoke the user's
          sessions on other devices.
        */

        const {
          error,
        } =
          await supabase.auth.signOut({
            scope: "local",
          });

        if (error) {
          console.warn(
            "CURIO guest mode sign-out warning:",
            error.message,
          );
        }

        /*
          Remove any old guest state first.
          This guarantees a clean transition.
        */

        sessionStorage.removeItem(
          "curio_guest",
        );

        /*
          Enable Guest Mode for this browser tab.
        */

        sessionStorage.setItem(
          "curio_guest",
          "true",
        );

        /*
          Navigate directly to the CURIO dashboard.
        */

        navigate(
          "/dashboard",
          {
            replace: true,
          },
        );
      } catch (error) {
        console.error(
          "CURIO guest mode error:",
          error,
        );

        /*
          If Supabase sign-out has a temporary
          problem, still enter Guest Mode.

          Guest Mode itself is controlled by
          sessionStorage.

          Protected database operations and
          authenticated Edge Functions still
          require a valid Supabase session.
        */

        try {
          sessionStorage.removeItem(
            "curio_guest",
          );

          sessionStorage.setItem(
            "curio_guest",
            "true",
          );
        } catch (storageError) {
          console.error(
            "CURIO guest storage error:",
            storageError,
          );
        }

        navigate(
          "/dashboard",
          {
            replace: true,
          },
        );
      } finally {
        setIsStarting(false);
      }
    };

  /* =========================================
     GO TO SIGN IN
  ========================================== */

  const handleSignIn = () => {
    /*
      Make sure the authentication flow
      does not accidentally remain in Guest Mode.
    */

    try {
      sessionStorage.removeItem(
        "curio_guest",
      );
    } catch (error) {
      console.error(
        "CURIO: Unable to clear Guest Mode:",
        error,
      );
    }
  };

  /* =========================================
     GO TO SIGN UP
  ========================================== */

  const handleSignUp = () => {
    /*
      Remove Guest Mode before creating
      a CURIO account.
    */

    try {
      sessionStorage.removeItem(
        "curio_guest",
      );
    } catch (error) {
      console.error(
        "CURIO: Unable to clear Guest Mode:",
        error,
      );
    }
  };

  /* =========================================
     UI
  ========================================== */

  return (
    <main className="guest-page">

      <div className="guest-container">

        {/* =========================================
            CURIO BRANDING
        ========================================== */}

        <div className="guest-brand">

          <img
            src="/curio-symbol.png"
            alt="CURIO symbol"
            className="guest-logo"
          />

          <div className="guest-brand-name">
            CURIO
          </div>

          <div className="guest-tagline">
            <span>LEARN</span>
            <span>•</span>
            <span>UNDERSTAND</span>
            <span>•</span>
            <span>GROW</span>
          </div>

        </div>

        {/* =========================================
            MAIN CONTENT
        ========================================== */}

        <section className="guest-content">

          <p className="guest-eyebrow">
            EXPLORE CURIO
          </p>

          <h1>
            Start learning
            <br />
            <span>
              without an account.
            </span>
          </h1>

          <p className="guest-description">
            Explore CURIO's AI-learning
            experience as a guest. You can
            discover the platform and begin
            learning before creating your
            account.
          </p>

          {/* =========================================
              ACTIONS
          ========================================== */}

          <div className="guest-actions">

            <button
              type="button"
              className="guest-primary-button"
              onClick={
                handleStartExploring
              }
              disabled={isStarting}
              aria-busy={isStarting}
            >

              {isStarting
                ? "Starting..."
                : "Start exploring"}

              {!isStarting && (
                <span>
                  →
                </span>
              )}

            </button>

            <Link
              to="/login"
              className="guest-login-button"
              onClick={
                handleSignIn
              }
            >
              Sign in
            </Link>

          </div>

          <p className="guest-note">
            Some learning progress and
            personalized features require a
            CURIO account.
          </p>

        </section>

        {/* =========================================
            SIMPLE FEATURE CARDS
        ========================================== */}

        <section
          className="guest-features"
          aria-label="Guest features"
        >

          <article className="guest-feature-card">

            <div className="guest-feature-number">
              01
            </div>

            <h2>
              Learn
            </h2>

            <p>
              Explore the fundamentals of AI
              through simple,
              beginner-friendly lessons.
            </p>

          </article>

          <article className="guest-feature-card">

            <div className="guest-feature-number">
              02
            </div>

            <h2>
              Understand
            </h2>

            <p>
              Discover how AI tools work and
              how to use them responsibly.
            </p>

          </article>

          <article className="guest-feature-card">

            <div className="guest-feature-number">
              03
            </div>

            <h2>
              Grow
            </h2>

            <p>
              Build practical AI skills that
              you can use in your everyday
              learning.
            </p>

          </article>

        </section>

        {/* =========================================
            CREATE ACCOUNT
        ========================================== */}

        <div className="guest-signup">

          <span>
            Want to save your progress?
          </span>

          <Link
            to="/signup"
            onClick={
              handleSignUp
            }
          >
            Create an account
          </Link>

        </div>

      </div>

    </main>
  );
}

export default Guest;