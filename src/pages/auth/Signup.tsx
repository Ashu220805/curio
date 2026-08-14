import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { supabase } from "../../lib/supabase";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreedToTerms) {
      setError(
        "Please agree to the Terms of Service and Privacy Policy."
      );
      return;
    }

    setIsLoading(true);

    try {
      const {
        data,
        error: signUpError,
      } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        /*
          =========================================
          SUCCESSFUL SIGN UP
          =========================================

          If email confirmation is enabled in Supabase,
          data.session will normally be null.

          In either case, we don't automatically log
          the user into CURIO.

          Instead we send the user to Sign In.
        */

        navigate("/login", {
          replace: true,
          state: {
            signupSuccess: true,
            emailConfirmationRequired: !data.session,
            email: email.trim().toLowerCase(),
          },
        });

        return;
      }

      setError(
        "Unable to create your account. Please try again."
      );
    } catch (error) {
      console.error("CURIO signup error:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to create your account. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="signup-card">

        {/* =========================================
            CURIO BRANDING
        ========================================== */}

        <div className="auth-right-brand signup-brand">

          <img
            src="/curio-symbol.png"
            alt="CURIO symbol"
            className="auth-right-logo"
          />

          <div className="auth-right-brand-name">
            CURIO
          </div>

          <div className="auth-right-tagline">
            <span>LEARN</span>
            <i>•</i>
            <span>UNDERSTAND</span>
            <i>•</i>
            <span>GROW</span>
          </div>

        </div>

        {/* =========================================
            HEADING
        ========================================== */}

        <div className="login-heading signup-heading">

          <h2>Create your account</h2>

          <p>
            Start your AI learning journey with CURIO.
          </p>

        </div>

        {/* =========================================
            ERROR
        ========================================== */}

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* =========================================
            SIGN UP FORM
        ========================================== */}

        <form
          onSubmit={handleSubmit}
          noValidate
        >

          {/* NAME */}

          <div className="auth-field signup-field">

            <label htmlFor="signup-name">
              Full name
            </label>

            <div className="input-wrapper">

              <span
                className="input-icon"
                aria-hidden="true"
              >
                ●
              </span>

              <input
                id="signup-name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                autoComplete="name"
                required
              />

            </div>

          </div>

          {/* EMAIL */}

          <div className="auth-field signup-field">

            <label htmlFor="signup-email">
              Email address
            </label>

            <div className="input-wrapper">

              <span
                className="input-icon"
                aria-hidden="true"
              >
                ✉
              </span>

              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />

            </div>

          </div>

          {/* PASSWORD */}

          <div className="auth-field signup-field">

            <label htmlFor="signup-password">
              Password
            </label>

            <div className="input-wrapper">

              <span
                className="input-icon password-lock-icon"
                aria-hidden="true"
              >
                🔒
              </span>

              <input
                id="signup-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Create a password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                title={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                ◉
              </button>

            </div>

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="auth-field signup-field">

            <label htmlFor="signup-confirm-password">
              Confirm password
            </label>

            <div className="input-wrapper">

              <span
                className="input-icon password-lock-icon"
                aria-hidden="true"
              >
                🔒
              </span>

              <input
                id="signup-confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) => !previous
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                title={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                ◉
              </button>

            </div>

          </div>

          {/* =========================================
              TERMS AGREEMENT
          ========================================== */}

          <div className="terms-checkbox">

            <input
              id="signup-terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(event) =>
                setAgreedToTerms(
                  event.target.checked
                )
              }
            />

            <label htmlFor="signup-terms">

              I agree to CURIO's{" "}

              <button
                type="button"
                className="terms-link"
                onClick={() => {}}
              >
                Terms of Service
              </button>{" "}

              and{" "}

              <button
                type="button"
                className="terms-link"
                onClick={() => {}}
              >
                Privacy Policy
              </button>
              .

            </label>

          </div>

          {/* =========================================
              CREATE ACCOUNT
          ========================================== */}

          <button
            type="submit"
            className="curio-signin-button signup-submit-button"
            disabled={isLoading}
          >

            <span>
              {isLoading
                ? "Creating account..."
                : "Create account"}
            </span>

            {!isLoading && (
              <span className="button-arrow">
                →
              </span>
            )}

          </button>

        </form>

        {/* =========================================
            SOCIAL DIVIDER
        ========================================== */}

        <div className="auth-divider signup-divider">

          <span />

          <p>
            or continue with
          </p>

          <span />

        </div>

        {/* =========================================
            GOOGLE / MICROSOFT / APPLE
            UI ONLY FOR NOW
        ========================================== */}

        <div className="social-login-grid">

          <button
            type="button"
            className="social-login-button"
            aria-label="Continue with Google"
          >
            <strong className="google-icon">
              G
            </strong>

            Google
          </button>

          <button
            type="button"
            className="social-login-button"
            aria-label="Continue with Microsoft"
          >
            <strong className="microsoft-icon">
              ▦
            </strong>

            Microsoft
          </button>

          <button
            type="button"
            className="social-login-button"
            aria-label="Continue with Apple"
          >
            <strong className="apple-icon">
              ●
            </strong>

            Apple
          </button>

        </div>

        {/* =========================================
            SIGN IN
        ========================================== */}

        <p className="auth-switch signup-switch">

          Already have an account?{" "}

          <Link to="/login">
            Sign in
          </Link>

        </p>

      </div>
    </AuthLayout>
  );
}

export default SignUp;