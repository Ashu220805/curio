import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../lib/supabase.ts";

import "./ResetPassword.css";


/* =========================================================
   CONSTANTS
   ========================================================= */

const MIN_PASSWORD_LENGTH = 8;

const PASSWORD_RULES = [
  {
    label: "At least 8 characters",
    test: (value: string) =>
      value.length >= MIN_PASSWORD_LENGTH,
  },
  {
    label: "Contains an uppercase letter",
    test: (value: string) =>
      /[A-Z]/.test(value),
  },
  {
    label: "Contains a lowercase letter",
    test: (value: string) =>
      /[a-z]/.test(value),
  },
  {
    label: "Contains a number",
    test: (value: string) =>
      /\d/.test(value),
  },
];


/* =========================================================
   ERROR HELPER
   ========================================================= */

function getErrorMessage(
  error: unknown
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    const message = (
      error as {
        message?: unknown;
      }
    ).message;

    if (typeof message === "string") {
      return message;
    }
  }

  return "";
}


/* =========================================================
   RESET PASSWORD
   ========================================================= */

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [recoveryReady, setRecoveryReady] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  /* =======================================================
     RECOVERY SESSION
     ======================================================= */

  useEffect(() => {
    let mounted = true;

    const checkRecoverySession =
      async () => {
        try {
          /*
           * Supabase Auth processes the recovery
           * URL and exposes the recovery session
           * through getSession().
           */
          const {
            data,
            error: sessionError,
          } =
            await supabase.auth.getSession();

          if (sessionError) {
            throw sessionError;
          }

          if (!mounted) {
            return;
          }

          setRecoveryReady(
            Boolean(data.session)
          );
        } catch (sessionError) {
          console.error(
            "CURIO: Recovery session check failed:",
            sessionError
          );

          if (mounted) {
            setRecoveryReady(false);
            setError(
              "This password reset link could not be verified. Please request a new reset link."
            );
          }
        } finally {
          if (mounted) {
            setCheckingSession(false);
          }
        }
      };

    void checkRecoverySession();

    /*
     * A recovery email can establish the session
     * asynchronously after the page has loaded.
     */
    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) {
            return;
          }

          if (
            event ===
              "PASSWORD_RECOVERY" ||
            Boolean(session)
          ) {
            setRecoveryReady(
              Boolean(session)
            );
            setCheckingSession(false);
          }
        }
      );

    return () => {
      mounted = false;

      authListener.subscription.unsubscribe();
    };
  }, []);


  /* =======================================================
     PASSWORD RULES
     ======================================================= */

  const passwordChecks = useMemo(
    () =>
      PASSWORD_RULES.map((rule) => ({
        label: rule.label,
        passed: rule.test(password),
      })),
    [password]
  );

  const passwordScore =
    passwordChecks.filter(
      (rule) => rule.passed
    ).length;

  const passwordStrength =
    password.length === 0
      ? ""
      : passwordScore <= 1
        ? "Weak"
        : passwordScore <= 3
          ? "Good"
          : "Strong";


  /* =======================================================
     SUBMIT
     ======================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setSuccess("");

    if (!recoveryReady) {
      setError(
        "Your password reset session is missing or expired. Please request a new reset link."
      );
      return;
    }

    if (!password) {
      setError(
        "Please create a new password."
      );
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        "Your password must contain at least 8 characters."
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError(
        "Your password must contain at least one uppercase letter."
      );
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError(
        "Your password must contain at least one lowercase letter."
      );
      return;
    }

    if (!/\d/.test(password)) {
      setError(
        "Your password must contain at least one number."
      );
      return;
    }

    if (!confirmPassword) {
      setError(
        "Please confirm your new password."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const {
        error: updateError,
      } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        throw updateError;
      }

      setPassword("");
      setConfirmPassword("");

      setSuccess(
        "Your password has been updated successfully. Redirecting to login..."
      );

      /*
       * End the recovery session so the user returns
       * through the normal Login → Onboarding flow.
       */
      await supabase.auth.signOut();

      globalThis.setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            passwordResetSuccess: true,
          },
        });
      }, 900);
    } catch (updateError) {
      console.error(
        "CURIO: Password update failed:",
        updateError
      );

      const message =
        getErrorMessage(updateError)
          .toLowerCase();

      if (
        message.includes(
          "same password"
        )
      ) {
        setError(
          "Please choose a new password different from your current password."
        );
      } else if (
        message.includes(
          "password"
        )
      ) {
        setError(
          "The new password could not be accepted. Please check the password requirements and try again."
        );
      } else {
        setError(
          "Unable to update your password. Please request a new reset link and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };


  /* =======================================================
     RENDER
     ======================================================= */

  if (checkingSession) {
    return (
      <main
        className="reset-password-page"
        role="status"
        aria-live="polite"
      >
        <div className="reset-password-background-orb reset-password-background-orb-one" />
        <div className="reset-password-background-orb reset-password-background-orb-two" />
        <div className="reset-password-background-grid" />

        <div className="reset-password-loading">
          <div
            className="reset-password-spinner"
            aria-hidden="true"
          />
          <p>
            Verifying your password reset...
          </p>
        </div>
      </main>
    );
  }


  return (
    <main className="reset-password-page">
      <div
        className="reset-password-background-orb reset-password-background-orb-one"
        aria-hidden="true"
      />

      <div
        className="reset-password-background-orb reset-password-background-orb-two"
        aria-hidden="true"
      />

      <div
        className="reset-password-background-grid"
        aria-hidden="true"
      />

      {/* ==================================================
          BRAND
      =================================================== */}

      <header className="reset-password-brand">
        <Link
          to="/login"
          className="reset-password-brand-link"
          aria-label="CURIO home"
        >
          <div className="reset-password-brand-symbol">
            <img
              src="/curio-symbol.png"
              alt=""
            />
          </div>

          <div className="reset-password-brand-copy">
            <span className="reset-password-brand-name">
              CURIO
            </span>

            <span className="reset-password-brand-tagline">
              LEARN&nbsp; • &nbsp;UNDERSTAND&nbsp; • &nbsp;GROW
            </span>
          </div>
        </Link>
      </header>


      {/* ==================================================
          CONTENT
      =================================================== */}

      <section className="reset-password-layout">
        <div className="reset-password-card">
          <div className="reset-password-card-accent" />

          <div className="reset-password-card-content">

            <div className="reset-password-eyebrow">
              <span className="reset-password-eyebrow-dot" />
              ACCOUNT SECURITY
            </div>

            <h1 className="reset-password-title">
              Create a new
              <br />
              <span>password.</span>
            </h1>

            <p className="reset-password-description">
              Choose a strong password to
              secure your CURIO account and
              continue your learning journey.
            </p>


            {!recoveryReady && (
              <div
                className="reset-password-message reset-password-message-error"
                role="alert"
              >
                <span className="reset-password-message-icon">
                  !
                </span>

                <span>
                  {error ||
                    "This password reset link is missing or has expired."}
                </span>
              </div>
            )}


            {recoveryReady && error && (
              <div
                className="reset-password-message reset-password-message-error"
                role="alert"
                aria-live="assertive"
              >
                <span className="reset-password-message-icon">
                  !
                </span>

                <span>{error}</span>
              </div>
            )}


            {success && (
              <div
                className="reset-password-message reset-password-message-success"
                role="status"
                aria-live="polite"
              >
                <span className="reset-password-message-icon">
                  ✓
                </span>

                <span>{success}</span>
              </div>
            )}


            {recoveryReady && !success && (
              <form
                className="reset-password-form"
                onSubmit={handleSubmit}
                noValidate
              >

                {/* NEW PASSWORD */}

                <div className="reset-password-field">
                  <label
                    htmlFor="curio-new-password"
                    className="reset-password-label"
                  >
                    New password
                  </label>

                  <div className="reset-password-input-wrapper">
                    <span
                      className="reset-password-input-icon"
                      aria-hidden="true"
                    >
                      •
                    </span>

                    <input
                      id="curio-new-password"
                      name="new-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) => {
                        setPassword(
                          event.target.value
                        );
                        setError("");
                      }}
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="reset-password-input"
                      autoFocus
                    />

                    <button
                      type="button"
                      className="reset-password-show-button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                      disabled={loading}
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>
                </div>


                {/* CONFIRM PASSWORD */}

                <div className="reset-password-field">
                  <label
                    htmlFor="curio-confirm-password"
                    className="reset-password-label"
                  >
                    Confirm new password
                  </label>

                  <div className="reset-password-input-wrapper">
                    <span
                      className="reset-password-input-icon"
                      aria-hidden="true"
                    >
                      •
                    </span>

                    <input
                      id="curio-confirm-password"
                      name="confirm-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(event) => {
                        setConfirmPassword(
                          event.target.value
                        );
                        setError("");
                      }}
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="reset-password-input"
                    />

                    <button
                      type="button"
                      className="reset-password-show-button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) =>
                            !current
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmed password"
                          : "Show confirmed password"
                      }
                      disabled={loading}
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>
                </div>


                {/* PASSWORD REQUIREMENTS */}

                <div className="reset-password-requirements">
                  <div className="reset-password-requirements-heading">
                    Password requirements
                    {passwordStrength && (
                      <span
                        className={`reset-password-strength reset-password-strength-${passwordStrength.toLowerCase()}`}
                      >
                        {passwordStrength}
                      </span>
                    )}
                  </div>

                  <div className="reset-password-rules">
                    {passwordChecks.map(
                      (rule) => (
                        <div
                          key={rule.label}
                          className={
                            rule.passed
                              ? "reset-password-rule reset-password-rule-passed"
                              : "reset-password-rule"
                          }
                        >
                          <span
                            className="reset-password-rule-icon"
                            aria-hidden="true"
                          >
                            {rule.passed
                              ? "✓"
                              : "○"}
                          </span>

                          <span>
                            {rule.label}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>


                {/* SUBMIT */}

                <button
                  type="submit"
                  className="reset-password-submit"
                  disabled={
                    loading ||
                    !recoveryReady
                  }
                >
                  <span>
                    {loading
                      ? "Updating password..."
                      : "Update password"}
                  </span>

                  {!loading && (
                    <span aria-hidden="true">
                      →
                    </span>
                  )}

                  {loading && (
                    <span
                      className="reset-password-button-spinner"
                      aria-hidden="true"
                    />
                  )}
                </button>

              </form>
            )}


            {!recoveryReady && (
              <div className="reset-password-expired-actions">
                <Link
                  to="/login"
                  className="reset-password-back-button"
                >
                  <span aria-hidden="true">
                    ←
                  </span>
                  Back to login
                </Link>

                <p>
                  Request a new password reset
                  email from the login page.
                </p>
              </div>
            )}

          </div>
        </div>


        {/* ==================================================
            RIGHT PANEL
        =================================================== */}

        <aside className="reset-password-feature-panel">
          <div
            className="reset-password-panel-glow reset-password-panel-glow-one"
            aria-hidden="true"
          />

          <div
            className="reset-password-panel-glow reset-password-panel-glow-two"
            aria-hidden="true"
          />

          <div className="reset-password-feature-content">

            <div className="reset-password-feature-eyebrow">
              <span className="reset-password-feature-dot" />
              CURIO ACCOUNT SECURITY
            </div>

            <h2 className="reset-password-feature-title">
              Your account.
              <br />
              <span>Your learning.</span>
            </h2>

            <p className="reset-password-feature-description">
              Keep your CURIO account protected
              with a password you can remember
              and trust.
            </p>

            <div className="reset-password-feature-grid">
              <div className="reset-password-feature-step">
                <span>01</span>
                <strong>Secure</strong>
              </div>

              <div className="reset-password-feature-step">
                <span>02</span>
                <strong>Learn</strong>
              </div>

              <div className="reset-password-feature-step">
                <span>03</span>
                <strong>Practice</strong>
              </div>

              <div className="reset-password-feature-step">
                <span>04</span>
                <strong>Grow</strong>
              </div>
            </div>

            <div className="reset-password-feature-flow">
              <span>SECURE</span>
              <b>→</b>
              <span>LEARN</span>
              <b>→</b>
              <span>PRACTICE</span>
              <b>→</b>
              <span>GROW</span>
            </div>

          </div>

          <div className="reset-password-feature-footer">
            <span>CURIO</span>
            <span>AI LITERACY PLATFORM</span>
          </div>
        </aside>
      </section>


      {/* ==================================================
          FOOTER
      =================================================== */}

      <footer className="reset-password-footer">
        <span>© 2026 CURIO</span>

        <span>
          Built for better AI understanding.
        </span>

        <div className="reset-password-footer-links">
          <Link to="/terms">
            Terms
          </Link>

          <Link to="/privacy">
            Privacy
          </Link>
        </div>
      </footer>
    </main>
  );
}


export default ResetPassword;
