import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { supabase } from "../../lib/supabase";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");


  const location = useLocation();
  const navigate = useNavigate();


  /*
    =========================================
    SIGNUP SUCCESS MESSAGE
  =========================================
  */


  const signupState = location.state as
    | {
        signupSuccess?: boolean;
        emailConfirmationRequired?: boolean;
        email?: string;
      }
    | null;


  const signupSuccess =
    signupState?.signupSuccess === true;


  const emailConfirmationRequired =
    signupState?.emailConfirmationRequired === true;


  const signupEmail = signupState?.email || "";


  /*
    =========================================
    NORMAL SUPABASE LOGIN
  =========================================
  */


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();


    setError("");


    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }


    if (!password) {
      setError("Please enter your password.");
      return;
    }


    setIsLoading(true);


    try {
      const {
        data,
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });


      if (signInError) {
        throw signInError;
      }


      if (data.user) {
        console.log(
          "CURIO user signed in:",
          data.user.id
        );


        /*
          =========================================
          LOGIN SUCCESS
          =========================================

          Authentication is successful.

          The guest session is removed so that
          the authenticated user's profile is
          displayed on the dashboard.
        */


        console.log("CURIO login successful.");


        /*
          =========================================
          REMOVE GUEST MODE
          =========================================

          If this browser was previously being used
          as a guest, make sure the authenticated
          account takes priority.
        */


        sessionStorage.removeItem("curio_guest");


        /*
          =========================================
          DASHBOARD
          =========================================
        */


        navigate("/dashboard");
      }
    } catch (error) {
      console.error("CURIO login error:", error);


      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to sign in. Please check your credentials."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };


  /*
    =========================================
    CONTINUE AS GUEST
  =========================================
  */


  const handleGuestContinue = () => {
    setError("");


    /*
      Store guest mode only for this browser session.

      This does NOT create a Supabase account.

      The Dashboard will use this flag to display
      the Guest profile instead of the authenticated
      user's profile.
    */


    sessionStorage.setItem("curio_guest", "true");


    console.log("CURIO guest mode enabled.");


    /*
      Send guest user to the dashboard.
    */


    navigate("/dashboard");
  };


  return (
    <AuthLayout>
      <div className="login-card">


        {/* =========================================
            CURIO BRANDING — RIGHT SIDE
        ========================================== */}


        <div className="auth-right-brand">


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
            SIGN IN INTRO
        ========================================== */}


        <div className="login-heading">


          <h2>Sign in</h2>


          <p>
            Sign in to continue your learning journey.
          </p>


        </div>


        {/* =========================================
            SIGNUP SUCCESS
        ========================================== */}


        {signupSuccess && (
          <div
            className="auth-success"
            role="status"
          >
            <strong>
              Account created successfully!
            </strong>


            {emailConfirmationRequired ? (
              <p>
                Please check your email
                {signupEmail
                  ? ` (${signupEmail})`
                  : ""}
                {" "}and confirm your account before
                signing in.
              </p>
            ) : (
              <p>
                Your account is ready. You can now
                sign in.
              </p>
            )}
          </div>
        )}


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
            LOGIN FORM
        ========================================== */}


        <form
          onSubmit={handleSubmit}
          noValidate
        >


          {/* EMAIL */}


          <div className="auth-field">


            <label htmlFor="login-email">
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
                id="login-email"
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


          <div className="auth-field">


            <label htmlFor="login-password">
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
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
              />


              {/* PASSWORD VISIBILITY BUTTON */}


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


          {/* FORGOT PASSWORD */}


          <div className="forgot-password-row">


            <button
              type="button"
              className="forgot-password"
              onClick={() =>
                setError(
                  "Password recovery will be connected with Supabase later."
                )
              }
            >
              Forgot password?
            </button>


          </div>


          {/* SIGN IN */}


          <button
            type="submit"
            className="curio-signin-button"
            disabled={isLoading}
          >


            <span>
              {isLoading
                ? "Signing in..."
                : "Sign in"}
            </span>


            {!isLoading && (
              <span className="button-arrow">
                →
              </span>
            )}


          </button>


        </form>


        {/* =========================================
            DIVIDER
        ========================================== */}


        <div className="auth-divider">


          <span />


          <p>
            or continue with
          </p>


          <span />


        </div>


        {/* =========================================
            SOCIAL LOGIN
            VISUAL ONLY FOR NOW
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
            CONTINUE AS GUEST
        ========================================== */}


        <div className="continue-guest-wrapper">


          <button
            type="button"
            className="continue-guest-button"
            onClick={handleGuestContinue}
          >


            <span>
              Continue as Guest
            </span>


            <span className="guest-button-arrow">
              →
            </span>


          </button>


        </div>


        {/* =========================================
            SIGN UP
        ========================================== */}


        <p className="auth-switch">


          Don't have an account?{" "}


          <Link to="/signup">
            Sign up
          </Link>


        </p>


      </div>
    </AuthLayout>
  );
}


export default Login;