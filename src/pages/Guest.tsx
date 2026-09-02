import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase.ts";
import "./Guest.css";

function Guest() {
  const navigate = useNavigate();

  const [isStarting, setIsStarting] = useState(false);

  /* =========================================================
     START EXPLORING AS GUEST
     ========================================================= */

  const handleStartExploring = async () => {
    if (isStarting) {
      return;
    }

    setIsStarting(true);

    try {
      /*
        Clear the current Supabase session locally.
        This does not revoke sessions on other devices.
      */

      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) {
        console.warn(
          "CURIO guest mode sign-out warning:",
          error.message,
        );
      }

      /*
        Clear any previous guest state.
      */

      sessionStorage.removeItem("curio_guest");

      /*
        Enable guest mode for this browser tab.
      */

      sessionStorage.setItem("curio_guest", "true");

      /*
        Open CURIO's learning experience.
      */

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      /*
        Guest mode should still work even if
        Supabase sign-out has a temporary problem.
      */

      console.error(
        "CURIO guest mode error:",
        error,
      );

      try {
        sessionStorage.removeItem("curio_guest");
        sessionStorage.setItem("curio_guest", "true");
      } catch (storageError) {
        console.error(
          "CURIO guest storage error:",
          storageError,
        );
      }

      navigate("/dashboard", {
        replace: true,
      });
    } finally {
      setIsStarting(false);
    }
  };

  /* =========================================================
     CLEAR GUEST MODE
     ========================================================= */

  const clearGuestMode = () => {
    try {
      sessionStorage.removeItem("curio_guest");
    } catch (error) {
      console.error(
        "CURIO: Unable to clear Guest Mode:",
        error,
      );
    }
  };

  /* =========================================================
     UI
     ========================================================= */

  return (
    <main className="guest-page">
      <div className="guest-container">

        {/* =====================================================
            BRAND
        ===================================================== */}

        <header className="guest-brand">
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
            <span className="guest-tagline-dot">•</span>
            <span>UNDERSTAND</span>
            <span className="guest-tagline-dot">•</span>
            <span>GROW</span>
          </div>
        </header>


        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          className="guest-content"
          aria-labelledby="guest-heading"
        >
          <p className="guest-eyebrow">
            EXPLORE CURIO
          </p>

          <h1
            id="guest-heading"
            className="guest-heading"
          >
            Start learning
            <br />
            <span>without an account.</span>
          </h1>

          <p className="guest-description">
            Explore CURIO&apos;s AI-learning experience as a guest.
            Discover the platform, learn the fundamentals and begin
            building your AI understanding before creating an account.
          </p>


          {/* ===================================================
              ACTIONS
          =================================================== */}

          <div className="guest-actions">

            <button
              type="button"
              className="guest-primary-button"
              onClick={handleStartExploring}
              disabled={isStarting}
              aria-busy={isStarting}
            >
              <span>
                {isStarting
                  ? "Starting..."
                  : "Start exploring"}
              </span>

              {!isStarting && (
                <span
                  className="guest-button-arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              )}
            </button>


            <Link
              to="/login"
              className="guest-login-button"
              onClick={clearGuestMode}
            >
              Sign in
            </Link>

          </div>


          <p className="guest-note">
            Some learning progress and personalized features
            require a CURIO account.
          </p>
        </section>


        {/* =====================================================
            FEATURE CARDS
        ===================================================== */}

        <section
          className="guest-features"
          aria-label="CURIO features"
        >

          {/* Learn */}

          <article className="guest-feature-card">
            <div className="guest-feature-top">
              <span className="guest-feature-number">
                01
              </span>

              <span
                className="guest-feature-arrow"
                aria-hidden="true"
              >
                ↗
              </span>
            </div>

            <div
              className="guest-feature-icon"
              aria-hidden="true"
            >
              ◇
            </div>

            <h2>
              Learn
            </h2>

            <p>
              Explore the fundamentals of AI through simple,
              beginner-friendly lessons.
            </p>
          </article>


          {/* Understand */}

          <article className="guest-feature-card">
            <div className="guest-feature-top">
              <span className="guest-feature-number">
                02
              </span>

              <span
                className="guest-feature-arrow"
                aria-hidden="true"
              >
                ↗
              </span>
            </div>

            <div
              className="guest-feature-icon"
              aria-hidden="true"
            >
              ◎
            </div>

            <h2>
              Understand
            </h2>

            <p>
              Discover how AI tools work and how to use them
              thoughtfully and responsibly.
            </p>
          </article>


          {/* Grow */}

          <article className="guest-feature-card">
            <div className="guest-feature-top">
              <span className="guest-feature-number">
                03
              </span>

              <span
                className="guest-feature-arrow"
                aria-hidden="true"
              >
                ↗
              </span>
            </div>

            <div
              className="guest-feature-icon"
              aria-hidden="true"
            >
              CURIO
            </div>

            <h2>
              Grow
            </h2>

            <p>
              Build practical AI skills that you can use in
              everyday learning and real-world situations.
            </p>
          </article>

        </section>


        {/* =====================================================
            CREATE ACCOUNT
        ===================================================== */}

        <section
          className="guest-signup"
          aria-label="Create a CURIO account"
        >
          <span>
            Want to save your progress?
          </span>

          <Link
            to="/signup"
            onClick={clearGuestMode}
          >
            Create an account
          </Link>
        </section>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="guest-footer">

          <div className="guest-footer-brand">

            <img
              src="/curio-symbol.png"
              alt="CURIO symbol"
              className="guest-footer-logo"
            />

            <div className="guest-footer-name">
              CURIO
            </div>

          </div>


          <p className="guest-footer-tagline">
            LEARN <span>•</span> UNDERSTAND <span>•</span> GROW
          </p>


          {/* =================================================
              LEGAL NAVIGATION

              These must match the routes in App.tsx:
              /terms
              /privacy
          ================================================= */}

          <nav
            className="guest-footer-links"
            aria-label="Legal navigation"
          >
            <Link to="/terms">
              Terms &amp; Conditions
            </Link>

            <span
              className="guest-footer-divider"
              aria-hidden="true"
            >
              •
            </span>

            <Link to="/privacy">
              Privacy Policy
            </Link>
          </nav>


          <p className="guest-footer-copyright">
            © 2026 CURIO. Built for better AI understanding.
          </p>

        </footer>

      </div>
    </main>
  );
}

export default Guest;