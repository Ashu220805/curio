import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../lib/supabase.ts";

import "./Login.css";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

function getAuthErrorMessage(
  error: unknown
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    const message = (
      error as { message?: unknown }
    ).message;

    if (typeof message === "string") {
      return message;
    }
  }

  return "Unable to sign in. Please try again.";
}


function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState =
    location.state as LocationState | null;

  const redirectPath =
    locationState?.from?.pathname ||
    "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [keepSignedIn, setKeepSignedIn] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [guestLoading, setGuestLoading] =
    useState(false);

  const [forgotLoading, setForgotLoading] =
    useState(false);

  /*
   * -------------------------------------------------------
   * CLEAR OLD GUEST MODE WHEN LOGIN PAGE OPENS
   * -------------------------------------------------------
   */

  useEffect(() => {
    try {
      sessionStorage.removeItem("curio_guest");
    } catch (storageError) {
      console.warn(
        "CURIO: Unable to clear guest mode.",
        storageError
      );
    }
  }, []);

  /*
   * -------------------------------------------------------
   * EMAIL VALIDATION
   * -------------------------------------------------------
   */

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value.trim()
    );
  };

  /*
   * -------------------------------------------------------
   * SIGN IN
   * -------------------------------------------------------
   */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim();
    const normalizedEmail =
      cleanEmail.toLowerCase();

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Your password must contain at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * Remove guest mode before authenticating.
       */
      try {
        sessionStorage.removeItem(
          "curio_guest"
        );
      } catch (storageError) {
        console.warn(
          "CURIO: Unable to clear guest mode.",
          storageError
        );
      }

      const {
        data,
        error: signInError,
      } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (signInError) {
        throw signInError;
      }

      if (!data.session) {
        throw new Error(
          "Authentication completed without an active session."
        );
      }

      /*
       * Supabase is configured to persist sessions
       * in your supabase.ts configuration.
       *
       * keepSignedIn is therefore kept as a UX
       * preference without changing Supabase's
       * authentication mechanism here.
       */
      void keepSignedIn;

      navigate(redirectPath, {
        replace: true,
      });
    } catch (signInError) {
      console.error(
        "CURIO: Sign-in failed:",
        signInError
      );

      const message =
        getAuthErrorMessage(signInError);

      const lowerMessage =
        message.toLowerCase();

      /*
       * Convert common Supabase messages into
       * cleaner user-facing messages.
       */
      if (
        lowerMessage.includes(
          "invalid login credentials"
        )
      ) {
        setError(
          "Incorrect email or password. If you don't remember it, use Forgot password."
        );

        /*
         * Clear only the password after a failed
         * credential check. The email stays visible.
         */
        setPassword("");
      } else if (
        lowerMessage.includes(
          "email not confirmed"
        )
      ) {
        setError(
          "Please confirm your email address before signing in."
        );
      } else if (
        lowerMessage.includes(
          "too many requests"
        ) ||
        lowerMessage.includes(
          "rate limit"
        )
      ) {
        setError(
          "Too many sign-in attempts. Please wait a moment and try again."
        );
      } else if (
        lowerMessage.includes(
          "failed to fetch"
        ) ||
        lowerMessage.includes(
          "network"
        )
      ) {
        setError(
          "Unable to reach CURIO right now. Please check your internet connection and try again."
        );
      } else {
        setError(
          "Unable to sign in right now. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * -------------------------------------------------------
   * GUEST MODE
   * -------------------------------------------------------
   */

  const handleGuestMode = () => {
    setError("");
    setSuccess("");
    setGuestLoading(true);

    try {
      sessionStorage.setItem(
        "curio_guest",
        "true"
      );

      navigate("/guest", {
        replace: true,
      });
    } catch (storageError) {
      console.error(
        "CURIO: Guest mode could not be enabled:",
        storageError
      );

      setError(
        "Guest mode could not be started. Please check your browser settings."
      );

      setGuestLoading(false);
    }
  };

  /*
   * -------------------------------------------------------
   * FORGOT PASSWORD
   * -------------------------------------------------------
   */

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    const cleanEmail = email.trim();
    const normalizedEmail =
      cleanEmail.toLowerCase();

    if (!cleanEmail) {
      setError(
        "Enter your email address first."
      );
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    setForgotLoading(true);

    try {
      const {
        error: resetError,
      } =
        await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo:
              `${globalThis.location.origin}/reset-password`,
          }
        );

      if (resetError) {
        throw resetError;
      }

      setSuccess(
        "Password reset instructions have been sent to your email."
      );
    } catch (resetError) {
      console.error(
        "CURIO: Password reset failed:",
        resetError
      );

      const message =
        getAuthErrorMessage(resetError);

      if (
        message
          .toLowerCase()
          .includes("too many requests")
      ) {
        setError(
          "Too many reset requests. Please wait a moment and try again."
        );
      } else {
        setError(
          "Unable to send password reset instructions. Please try again."
        );
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="login-page">
      {/* ==================================================
          BACKGROUND DECORATION
      =================================================== */}

      <div
        className="login-background-orb login-background-orb-one"
        aria-hidden="true"
      />

      <div
        className="login-background-orb login-background-orb-two"
        aria-hidden="true"
      />

      <div
        className="login-background-grid"
        aria-hidden="true"
      />

      {/* ==================================================
          BRAND
      =================================================== */}

      <header className="login-brand">
        <Link
          to="/login"
          className="login-brand-link"
          aria-label="CURIO home"
        >
          <div className="login-brand-symbol">
            <img
              src="/curio-symbol.png"
              alt=""
            />
          </div>

          <div className="login-brand-copy">
            <span className="login-brand-name">
              CURIO
            </span>

            <span className="login-brand-tagline">
              LEARN&nbsp; • &nbsp;UNDERSTAND&nbsp; • &nbsp;GROW
            </span>
          </div>
        </Link>
      </header>

      {/* ==================================================
          MAIN CONTENT
      =================================================== */}

      <section className="login-layout">
        {/* ==================================================
            LOGIN CARD
        =================================================== */}

        <div className="login-card">
          <div className="login-card-accent" />

          <div className="login-card-content">
            <div className="login-eyebrow">
              <span className="login-eyebrow-dot" />
              WELCOME BACK
            </div>

            <h1 className="login-title">
              Continue your
              <br />
              <span>learning journey.</span>
            </h1>

            <p className="login-description">
              Sign in to continue learning,
              practicing and building your AI
              skills with CURIO.
            </p>

            {/* ==================================================
                STATUS MESSAGES
            =================================================== */}

            {error && (
              <div
                className="login-message login-message-error"
                role="alert"
              >
                <span className="login-message-icon">
                  !
                </span>

                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                className="login-message login-message-success"
                role="status"
              >
                <span className="login-message-icon">
                  ✓
                </span>

                <span>{success}</span>
              </div>
            )}

            {/* ==================================================
                FORM
            =================================================== */}

            <form
              className="login-form"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* EMAIL */}

              <div className="login-field">
                <label
                  htmlFor="curio-email"
                  className="login-label"
                >
                  Email address
                </label>

                <div className="login-input-wrapper">
                  <span
                    className="login-input-icon"
                    aria-hidden="true"
                  >
                    @
                  </span>

                  <input
                    id="curio-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    inputMode="email"
                    spellCheck={false}
                    disabled={loading}
                    className="login-input"
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="login-field">
                <div className="login-label-row">
                  <label
                    htmlFor="curio-password"
                    className="login-label"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="login-forgot"
                    onClick={
                      handleForgotPassword
                    }
                    disabled={
                      forgotLoading ||
                      loading
                    }
                  >
                    {forgotLoading
                      ? "Sending..."
                      : "Forgot password?"}
                  </button>
                </div>

                <div className="login-input-wrapper">
                  <span
                    className="login-input-icon login-password-icon"
                    aria-hidden="true"
                  >
                    •
                  </span>

                  <input
                    id="curio-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="login-input login-password-input"
                  />

                  <button
                    type="button"
                    className="login-show-password"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              {/* KEEP SIGNED IN */}

              <label className="login-checkbox">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(event) =>
                    setKeepSignedIn(
                      event.target.checked
                    )
                  }
                  disabled={loading}
                />

                <span className="login-checkbox-box">
                  ✓
                </span>

                <span>
                  Keep me signed in
                </span>
              </label>

              {/* SIGN IN */}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Signing in..."
                    : "Sign in"}
                </span>

                {!loading && (
                  <span aria-hidden="true">
                    →
                  </span>
                )}

                {loading && (
                  <span
                    className="login-button-spinner"
                    aria-hidden="true"
                  />
                )}
              </button>
            </form>

            {/* ==================================================
                DIVIDER
            =================================================== */}

            <div className="login-divider">
              <span />
              <strong>OR</strong>
              <span />
            </div>

            {/* ==================================================
                GUEST
            =================================================== */}

            <button
              type="button"
              className="login-guest-button"
              onClick={handleGuestMode}
              disabled={guestLoading}
            >
              <span>
                {guestLoading
                  ? "Opening CURIO..."
                  : "Continue as Guest"}
              </span>

              {!guestLoading && (
                <span aria-hidden="true">
                  →
                </span>
              )}
            </button>

            <p className="login-guest-note">
              Explore CURIO without creating an
              account. Your personal progress
              won't be saved.
            </p>

            {/* ==================================================
                SIGN UP
            =================================================== */}

            <p className="login-signup">
              Don't have a CURIO account?

              <Link to="/signup">
                Create one
              </Link>
            </p>

            {/* ==================================================
                LEGAL
            =================================================== */}

            <p className="login-legal">
  By continuing, you agree to CURIO's{" "}
  <Link to="/terms">
    Terms & Conditions
  </Link>{" "}
  and{" "}
  <Link to="/privacy">
    Privacy Policy
  </Link>
  .
</p>
          </div>
        </div>

        {/* ==================================================
            RIGHT PANEL
        =================================================== */}

        <aside className="login-feature-panel">
          <div
            className="login-panel-glow login-panel-glow-one"
            aria-hidden="true"
          />

          <div
            className="login-panel-glow login-panel-glow-two"
            aria-hidden="true"
          />

          <div className="login-feature-content">
            <div className="login-feature-eyebrow">
              <span className="login-feature-dot" />
              CURIO AI LITERACY
            </div>

            <h2 className="login-feature-title">
              Learn AI.
              <br />
              <span>Don't just use it.</span>
            </h2>

            <p className="login-feature-description">
              CURIO helps you understand AI
              through guided learning, practical
              challenges and real-world
              verification.
            </p>

            <div className="login-feature-grid">
              <div className="login-feature-step">
                <span>01</span>
                <strong>Learn</strong>
              </div>

              <div className="login-feature-step">
                <span>02</span>
                <strong>Practice</strong>
              </div>

              <div className="login-feature-step">
                <span>03</span>
                <strong>Apply</strong>
              </div>

              <div className="login-feature-step">
                <span>04</span>
                <strong>Master</strong>
              </div>
            </div>

            <div className="login-feature-flow">
              <span>WATCH</span>
              <b>→</b>
              <span>SEE</span>
              <b>→</b>
              <span>PRACTICE</span>
              <b>→</b>
              <span>VERIFY</span>
              <b>→</b>
              <span>MASTER</span>
            </div>
          </div>

          <div className="login-feature-footer">
            <span>CURIO</span>
            <span>AI LITERACY PLATFORM</span>
          </div>
        </aside>
      </section>

      {/* ==================================================
          FOOTER
      =================================================== */}

      <footer className="login-footer">
        <span>© 2026 CURIO</span>
        <span>Built for better AI understanding.</span>

        <div className="login-footer-links">
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

export default Login;