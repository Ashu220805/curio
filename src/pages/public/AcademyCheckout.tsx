import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useDocumentMeta,
} from "../../hooks/useDocumentMeta.ts";

import {
  useAuth,
} from "../../hooks/useAuth.ts";

import {
  useAcademyAccess,
} from "../../hooks/useAcademyAccess.ts";

import {
  startAcademyCheckout,
} from "../../lib/academyCheckout.ts";

import "./Academy.css";
import "./AcademyCheckout.css";

export default function AcademyCheckout() {
  useDocumentMeta(
    "CURIO Academy PRO Membership",
    "Secure CURIO Academy membership checkout.",
  );

  const navigate =
    useNavigate();

  const {
    user,
    loading: authLoading,
  } =
    useAuth();

  const {
    accessStatus,
    hasAcademyAccess,
    isLoading,
    refreshAccess,
  } =
    useAcademyAccess();

  const [
    starting,
    setStarting,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState("");

  const beginCheckout =
    async () => {
      setMessage("");
      setSuccessMessage("");

      if (!user) {
        setMessage(
          "Please sign in before purchasing Academy access.",
        );

        return;
      }

      if (hasAcademyAccess) {
        navigate(
          "/academy",
          {
            replace: true,
          },
        );

        return;
      }

      setStarting(true);

      try {
        await startAcademyCheckout();

        setSuccessMessage(
          "Payment verified successfully. Activating your CURIO Academy PRO access…",
        );

        /*
         * Reload membership from Supabase.
         */
        await refreshAccess();

        /*
         * Small delay gives React state time to update.
         */
        window.setTimeout(
          () => {
            navigate(
              "/academy",
              {
                replace: true,
              },
            );
          },
          900,
        );
      } catch (
        error
      ) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Payment could not be completed.",
        );
      } finally {
        setStarting(false);
      }
    };

  const statusLabel =
    authLoading ||
    isLoading
      ? "Checking your account…"
      : hasAcademyAccess
        ? "PRO membership active"
        : user
          ? "Ready for secure payment"
          : "Sign in required";

  return (
    <main
      className="checkout-page"
    >
      <header
        className="academy-topbar"
      >
        <Link
          to="/academy"
          className="academy-brand"
        >
          <img
            src="/curio-symbol.png"
            alt=""
          />

          <span>
            CURIO
          </span>

          <small>
            AI / ML ACADEMY · PRO
          </small>
        </Link>

        <div
          className="academy-header-center"
        >
          <span>
            Secure membership access
          </span>

          <div
            className="academy-progress"
          >
            <i
              style={{
                width:
                  "100%",
              }}
            />
          </div>

          <small>
            Server verified
          </small>
        </div>

        <nav
          className="academy-nav"
        >
          <Link
            to="/academy"
          >
            Back to Academy
          </Link>

          {user && (
            <Link
              to="/dashboard"
            >
              Dashboard
            </Link>
          )}
        </nav>
      </header>

      <section
        className="checkout-layout"
      >
        <div
          className="checkout-copy"
        >
          <span
            className="academy-kicker"
          >
            CURIO ACADEMY · PRO MEMBERSHIP
          </span>

          <h1>
            One Academy.
            One structured path.
            ₹1 to test the full experience.
          </h1>

          <p>
            The current ₹1 price is being used
            for payment integration testing.
            Academy access is activated only
            after Razorpay payment verification
            succeeds on the server.
          </p>

          <div
            className="checkout-includes"
          >
            <article>
              <b>
                01
              </b>

              <div>
                <strong>
                  Full serial curriculum
                </strong>

                <span>
                  Python, mathematics,
                  data, machine learning,
                  deep learning, LLMs,
                  generative AI and
                  production systems.
                </span>
              </div>
            </article>

            <article>
              <b>
                02
              </b>

              <div>
                <strong>
                  Teaching, not redirects
                </strong>

                <span>
                  Definitions,
                  distinctions,
                  diagrams,
                  code walkthroughs,
                  common mistakes,
                  recall and practice
                  inside CURIO.
                </span>
              </div>
            </article>

            <article>
              <b>
                03
              </b>

              <div>
                <strong>
                  Server-backed access
                </strong>

                <span>
                  Supabase Auth identifies
                  the learner and Razorpay
                  payment verification controls
                  the membership entitlement.
                </span>
              </div>
            </article>
          </div>
        </div>

        <aside
          className="checkout-card"
        >
          <span
            className="section-label"
          >
            CURRENT OFFER
          </span>

          <div
            className="checkout-price"
          >
            <span>
              ₹
            </span>

            <strong>
              1
            </strong>

            <small>
              test price
            </small>
          </div>

          <p
            className="checkout-status"
          >
            <b>
              {statusLabel}
            </b>

            <span>
              Access status:
              {" "}
              {accessStatus}
            </span>
          </p>

          <ul>
            <li>
              {hasAcademyAccess
                ? "Full Academy already active"
                : "Unlock all Academy modules"}
            </li>

            <li>
              Full serial lessons
              and concept maps
            </li>

            <li>
              Code walkthroughs
              and practice checkpoints
            </li>

            <li>
              Membership linked
              to your CURIO account
            </li>
          </ul>

          {hasAcademyAccess ? (
            <Link
              className="checkout-primary"
              to="/academy"
            >
              Open full Academy →
            </Link>
          ) : !user ? (
            <Link
              className="checkout-primary"
              to="/login"
            >
              Sign in to continue →
            </Link>
          ) : (
            <button
              type="button"
              className="checkout-primary checkout-button"
              disabled={
                starting ||
                authLoading ||
                isLoading
              }
              onClick={() => {
                void beginCheckout();
              }}
            >
              {starting
                ? "Processing payment…"
                : "Continue to secure ₹1 payment →"}
            </button>
          )}

          {message && (
            <p
              className="checkout-message"
              role="alert"
            >
              {message}
            </p>
          )}

          {successMessage && (
            <p
              className="checkout-success"
              role="status"
            >
              {successMessage}
            </p>
          )}

          <small
            className="checkout-fineprint"
          >
            Payment success inside the browser
            does not automatically unlock access.
            CURIO verifies the Razorpay payment
            on the server before activating
            your Academy membership.
          </small>
        </aside>
      </section>

      <section
        className="checkout-security checkout-security-wide"
      >
        <div>
          <span
            className="section-label"
          >
            PAYMENT & ACCESS ARCHITECTURE
          </span>

          <h2>
            Who paid,
            what they bought
            and why access is active
            should always be auditable.
          </h2>

          <p>
            A frontend button,
            local storage value
            or URL parameter cannot
            make a user a paid member.
          </p>
        </div>

        <div
          className="security-grid"
        >
          <article>
            <strong>
              1. Supabase Auth
            </strong>

            <p>
              The signed-in user
              provides the stable
              CURIO user ID.
            </p>
          </article>

          <article>
            <strong>
              2. Order Creation
            </strong>

            <p>
              A Supabase Edge Function
              creates the Razorpay order
              using server-side credentials.
            </p>
          </article>

          <article>
            <strong>
              3. Payment Verification
            </strong>

            <p>
              Razorpay payment ID,
              order ID and signature
              are verified on the server.
            </p>
          </article>

          <article>
            <strong>
              4. Membership Activation
            </strong>

            <p>
              Only verified payments
              create active Academy access
              inside the membership table.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}