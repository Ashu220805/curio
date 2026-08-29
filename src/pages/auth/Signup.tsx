
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout.tsx";
import { supabase } from "../../lib/supabase.ts";
import "./Signup.css";

/* =========================================================
   TYPES
   ========================================================= */

type PasswordCheck = {
  label: string;
  passed: boolean;
};


/* =========================================================
   CONSTANTS
   ========================================================= */

const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


/* =========================================================
   SIGN UP
   ========================================================= */

function SignUp() {

  const navigate = useNavigate();


  /* =======================================================
     BASIC ACCOUNT INFORMATION
     ======================================================= */

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");


  /* =======================================================
     LEARNER PROFILE INFORMATION
     ======================================================= */

  const [age, setAge] = useState("");
  const [learnerType, setLearnerType] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [aiExperience, setAiExperience] = useState("");
  const [learningGoal, setLearningGoal] = useState("");


  /* =======================================================
     PASSWORD
     ======================================================= */

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  /* =======================================================
     FORM STATE
     ======================================================= */

  const [agreedToTerms, setAgreedToTerms] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  /* =======================================================
     PASSWORD STRENGTH
     ======================================================= */

  const passwordChecks = useMemo<PasswordCheck[]>(
    () => [
      {
        label: "At least 8 characters",
        passed: password.length >= MIN_PASSWORD_LENGTH,
      },
      {
        label: "Contains an uppercase letter",
        passed: /[A-Z]/.test(password),
      },
      {
        label: "Contains a lowercase letter",
        passed: /[a-z]/.test(password),
      },
      {
        label: "Contains a number",
        passed: /\d/.test(password),
      },
    ],
    [password]
  );

  const passwordScore =
    passwordChecks.filter(
      (check) => check.passed
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
     ERROR HELPERS
     ======================================================= */

  const clearError = () => {
    if (error) {
      setError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };


  /* =======================================================
     SUBMIT
     ======================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    if (isLoading) {
      return;
    }

    setError("");
    setSuccessMessage("");


    /* =====================================================
       BASIC INFORMATION
       ===================================================== */

    const cleanName = name.trim();
    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (cleanName.length < 2) {
      setError(
        "Please enter a valid name."
      );
      return;
    }

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }


    /* =====================================================
       LEARNER PROFILE
       ===================================================== */

    if (!age.trim()) {
      setError(
        "Please enter your age."
      );
      return;
    }

    const numericAge = Number(age);

    if (
      !Number.isInteger(numericAge) ||
      numericAge < 10 ||
      numericAge > 100
    ) {
      setError(
        "Please enter a valid age between 10 and 100."
      );
      return;
    }

    if (!learnerType) {
      setError(
        "Please tell us which learner type best describes you."
      );
      return;
    }

    if (!educationLevel) {
      setError(
        "Please select your education level."
      );
      return;
    }

    if (!aiExperience) {
      setError(
        "Please select your current AI experience."
      );
      return;
    }

    if (!learningGoal) {
      setError(
        "Please select what you want to learn with CURIO."
      );
      return;
    }


    /* =====================================================
       PASSWORD
       ===================================================== */

    if (!password) {
      setError(
        "Please create a password."
      );
      return;
    }

    if (
      password.length <
      MIN_PASSWORD_LENGTH
    ) {
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
        "Please confirm your password."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }


    /* =====================================================
       TERMS
       ===================================================== */

    if (!agreedToTerms) {
      setError(
        "Please agree to the Terms of Service and Privacy Policy."
      );
      return;
    }


    /* =====================================================
       CREATE ACCOUNT
       ===================================================== */

    setIsLoading(true);

    try {

      /*
       * Supabase Auth is the source of truth for the
       * authentication account.
       *
       * Learner information is also stored in user metadata
       * so the information is available immediately after
       * account creation.
       *
       * Our profiles table remains the application-level
       * learner profile and will be connected through the
       * finalized profile/onboarding flow.
       */

      const {
        data,
        error: signUpError,
      } = await supabase.auth.signUp({

        email: cleanEmail,

        password,

        options: {

          data: {

            full_name: cleanName,

            age: numericAge,

            learner_type: learnerType,

            education_level:
              educationLevel,

            ai_experience:
              aiExperience,

            learning_goal:
              learningGoal,

          },

        },

      });


      /* ===================================================
         SUPABASE ERROR
         =================================================== */

      if (signUpError) {

        const message =
          signUpError.message
            .toLowerCase();

        if (
          message.includes(
            "already registered"
          ) ||
          message.includes(
            "already exists"
          ) ||
          message.includes(
            "user already registered"
          )
        ) {
          setError(
            "An account with this email already exists. Please sign in instead."
          );

          return;
        }

        if (
          message.includes(
            "password"
          )
        ) {
          setError(
            "Your password does not meet the account security requirements."
          );

          return;
        }

        if (
          message.includes(
            "email"
          )
        ) {
          setError(
            "Please check your email address and try again."
          );

          return;
        }

        throw signUpError;
      }


      /* ===================================================
         USER CREATED
         =================================================== */

      if (!data.user) {

        setError(
          "CURIO could not complete your account creation. Please try again."
        );

        return;
      }


      /* ===================================================
         EMAIL CONFIRMATION
         =================================================== */

      if (!data.session) {

        /*
         * Email confirmation is enabled.
         *
         * Do not manually create a session here.
         * Supabase will authenticate the user after
         * successful email verification and login.
         */

        navigate(
          "/login",
          {
            replace: true,

            state: {

              signupSuccess: true,

              emailConfirmationRequired:
                true,

              email: cleanEmail,

            },

          }
        );

        return;
      }


      /* ===================================================
         SESSION AVAILABLE
         =================================================== */

      /*
       * If email confirmation is disabled and Supabase
       * gives us a session immediately, the user is already
       * authenticated.
       *
       * The next stage of CURIO will route this user through
       * onboarding before reaching the dashboard.
       */

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );

    } catch (signupError) {

      console.error(
        "CURIO signup error:",
        signupError
      );


      if (
        signupError instanceof Error
      ) {

        setError(
          signupError.message ||
          "Unable to create your account. Please try again."
        );

      } else {

        setError(
          "Unable to create your account. Please try again."
        );

      }

    } finally {

      setIsLoading(false);

    }
  };


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <AuthLayout>

      <div className="signup-card">


        {/* =================================================
            CURIO BRAND
        ================================================= */}

        <div className="auth-right-brand signup-brand">

          <img
            src="/curio-symbol.png"
            alt="CURIO"
            className="auth-right-logo"
          />

          <div className="auth-right-brand-name">
            CURIO
          </div>

          <div className="auth-right-tagline">

            <span>LEARN</span>

            <i aria-hidden="true">
              •
            </i>

            <span>UNDERSTAND</span>

            <i aria-hidden="true">
              •
            </i>

            <span>GROW</span>

          </div>

        </div>


        {/* =================================================
            HEADING
        ================================================= */}

        <div className="login-heading signup-heading">

          <h2>
            Create your account
          </h2>

          <p>
            Start your AI learning journey
            with CURIO.
          </p>

          <p>
            A few details help us build a
            learning experience that fits you.
          </p>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            className="auth-error"
            role="alert"
            aria-live="assertive"
          >

            {error}

          </div>

        )}


        {/* =================================================
            SUCCESS
        ================================================= */}

        {successMessage && (

          <div
            className="auth-success"
            role="status"
            aria-live="polite"
          >

            {successMessage}

          </div>

        )}


        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          noValidate
        >


          {/* ===============================================
              ABOUT YOU
          ================================================ */}

          <div className="signup-profile-section">

            <div className="signup-section-heading">

              <h3>
                About you
              </h3>

              <p>
                Help CURIO understand where
                you're starting from.
              </p>

            </div>


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
                  onChange={(event) => {
                    setName(event.target.value);
                    clearError();
                  }}
                  autoComplete="name"
                  maxLength={100}
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
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearError();
                  }}
                  autoComplete="email"
                  inputMode="email"
                  maxLength={254}
                  required
                />

              </div>

            </div>


            {/* AGE */}

            <div className="auth-field signup-field">

              <label htmlFor="signup-age">
                Age
              </label>

              <div className="input-wrapper">

                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  🎂
                </span>

                <input
                  id="signup-age"
                  type="number"
                  min="10"
                  max="100"
                  placeholder="Your age"
                  value={age}
                  onChange={(event) => {
                    setAge(event.target.value);
                    clearError();
                  }}
                  autoComplete="off"
                  inputMode="numeric"
                  required
                />

              </div>

            </div>


            {/* LEARNER TYPE */}

            <div className="auth-field signup-field">

              <label htmlFor="signup-learner-type">
                Which best describes you?
              </label>

              <div className="input-wrapper">

                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  👤
                </span>

                <select
                  id="signup-learner-type"
                  value={learnerType}
                  onChange={(event) => {
                    setLearnerType(event.target.value);
                    clearError();
                  }}
                  className="signup-profile-select"
                  required
                >

                  <option value="">
                    Select your learner type
                  </option>

                  <option value="school_student">
                    School student
                  </option>

                  <option value="undergraduate">
                    Undergraduate student
                  </option>

                  <option value="postgraduate">
                    Postgraduate student
                  </option>

                  <option value="researcher">
                    Researcher
                  </option>

                  <option value="working_professional">
                    Working professional
                  </option>

                  <option value="teacher_educator">
                    Teacher / Educator
                  </option>

                  <option value="entrepreneur_freelancer">
                    Entrepreneur / Freelancer
                  </option>

                  <option value="senior_citizen">
                    Senior citizen
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

              </div>

            </div>


            {/* EDUCATION */}

            <div className="auth-field signup-field">

              <label htmlFor="signup-education">
                Current education level
              </label>

              <div className="input-wrapper">

                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  🎓
                </span>

                <select
                  id="signup-education"
                  value={educationLevel}
                  onChange={(event) => {
                    setEducationLevel(event.target.value);
                    clearError();
                  }}
                  className="signup-profile-select"
                  required
                >

                  <option value="">
                    Select your education level
                  </option>

                  <option value="school">
                    School education
                  </option>

                  <option value="higher_secondary">
                    Higher secondary
                  </option>

                  <option value="undergraduate">
                    Undergraduate
                  </option>

                  <option value="postgraduate">
                    Postgraduate
                  </option>

                  <option value="doctorate">
                    Doctorate / PhD
                  </option>

                  <option value="professional">
                    Professional qualification
                  </option>

                  <option value="not_currently_studying">
                    Not currently studying
                  </option>

                  <option value="prefer_not_to_say">
                    Prefer not to say
                  </option>

                </select>

              </div>

            </div>

          </div>


          {/* ===============================================
              AI STARTING POINT
          ================================================ */}

          <div className="signup-profile-section">

            <div className="signup-section-heading">

              <h3>
                Your AI starting point
              </h3>

              <p>
                There is no right or wrong answer.
                CURIO is built for beginners and
                experienced AI users.
              </p>

            </div>


            {/* AI EXPERIENCE */}

            <div className="auth-field signup-field">

              <label htmlFor="signup-ai-experience">
                How comfortable are you with AI?
              </label>

              <div className="input-wrapper">

                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  🤖
                </span>

                <select
                  id="signup-ai-experience"
                  value={aiExperience}
                  onChange={(event) => {
                    setAiExperience(event.target.value);
                    clearError();
                  }}
                  className="signup-profile-select"
                  required
                >

                  <option value="">
                    Select your AI experience
                  </option>

                  <option value="complete_beginner">
                    I'm completely new to AI
                  </option>

                  <option value="basic">
                    I know the basics
                  </option>

                  <option value="regular_user">
                    I use AI regularly
                  </option>

                  <option value="advanced_user">
                    I understand AI tools well
                  </option>

                  <option value="technical">
                    I have technical / AI knowledge
                  </option>

                </select>

              </div>

            </div>


            {/* LEARNING GOAL */}

            <div className="auth-field signup-field">

              <label htmlFor="signup-learning-goal">
                What do you want to learn with CURIO?
              </label>

              <div className="input-wrapper">

                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  🎯
                </span>

                <select
                  id="signup-learning-goal"
                  value={learningGoal}
                  onChange={(event) => {
                    setLearningGoal(event.target.value);
                    clearError();
                  }}
                  className="signup-profile-select"
                  required
                >

                  <option value="">
                    Choose your main goal
                  </option>

                  <option value="ai_basics">
                    Understand AI basics
                  </option>

                  <option value="prompting">
                    Learn better prompting
                  </option>

                  <option value="ai_tools">
                    Learn how to use AI tools
                  </option>

                  <option value="ai_safety">
                    Learn AI safety and ethics
                  </option>

                  <option value="verification">
                    Learn how to verify AI answers
                  </option>

                  <option value="ai_career">
                    Prepare for an AI career
                  </option>

                  <option value="programming">
                    Learn programming for AI
                  </option>

                  <option value="machine_learning">
                    Learn Machine Learning
                  </option>

                  <option value="deep_ai">
                    Learn AI in depth
                  </option>

                  <option value="exploration">
                    Explore what AI can do
                  </option>

                </select>

              </div>

            </div>

          </div>


          {/* ===============================================
              PRIVACY NOTE
          ================================================ */}

          <div className="signup-profile-note">

            <span aria-hidden="true">
              💡
            </span>

            <p>
              CURIO uses these details to
              understand your learning needs
              and improve your experience.
              See our{" "}

              <Link to="/privacy">
                Privacy Policy
              </Link>

              {" "}for more information.
            </p>

          </div>


          {/* ===============================================
              PASSWORD
          ================================================ */}

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
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearError();
                }}
                autoComplete="new-password"
                maxLength={128}
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
                {showPassword
                  ? "◉"
                  : "○"}
              </button>

            </div>


            {/* PASSWORD STRENGTH */}

            {password.length > 0 && (

              <div
                className="signup-password-strength"
                aria-live="polite"
              >

                <div className="signup-password-bars">

                  {[1, 2, 3, 4].map(
                    (level) => (

                      <span
                        key={level}
                        className={
                          level <= passwordScore
                            ? "active"
                            : ""
                        }
                      />

                    )
                  )}

                </div>

                <span>
                  {passwordStrength}
                </span>

              </div>

            )}


            {/* PASSWORD REQUIREMENTS */}

            {password.length > 0 && (

              <div className="signup-password-requirements">

                {passwordChecks.map(
                  (check) => (

                    <span
                      key={check.label}
                      className={
                        check.passed
                          ? "passed"
                          : ""
                      }
                    >

                      {check.passed
                        ? "✓"
                        : "○"}

                      {" "}

                      {check.label}

                    </span>

                  )
                )}

              </div>

            )}

          </div>


          {/* ===============================================
              CONFIRM PASSWORD
          ================================================ */}

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
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value
                  );
                  clearError();
                }}
                autoComplete="new-password"
                maxLength={128}
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
                {showConfirmPassword
                  ? "◉"
                  : "○"}
              </button>

            </div>


            {confirmPassword.length > 0 && (

              <div
                className={
                  password === confirmPassword
                    ? "signup-password-match matched"
                    : "signup-password-match"
                }
                aria-live="polite"
              >

                {password === confirmPassword
                  ? "✓ Passwords match"
                  : "Passwords do not match"}

              </div>

            )}

          </div>


          {/* ===============================================
              TERMS
          ================================================ */}

          <div className="terms-checkbox">

            <input
              id="signup-terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(event) => {
                setAgreedToTerms(
                  event.target.checked
                );
                clearError();
              }}
              required
            />

            <label htmlFor="signup-terms">

              I agree to CURIO's{" "}

              <Link
                to="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="terms-link"
              >
                Terms of Service
              </Link>

              and

              <Link
                to="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="terms-link"
              >
                Privacy Policy
              </Link>

              .

            </label>

          </div>


          {/* ===============================================
              CREATE ACCOUNT
          ================================================ */}

          <button
            type="submit"
            className="curio-signin-button signup-submit-button"
            disabled={isLoading}
            aria-busy={isLoading}
          >

            <span>

              {isLoading
                ? "Creating account..."
                : "Create account"}

            </span>

            {!isLoading && (

              <span
                className="button-arrow"
                aria-hidden="true"
              >
                →
              </span>

            )}

          </button>


        </form>


        {/* =================================================
            SOCIAL DIVIDER
        ================================================= */}

        <div className="auth-divider signup-divider">

          <span />

          <p>
            or continue with
          </p>

          <span />

        </div>


        {/* =================================================
            SOCIAL PROVIDERS
            UI ONLY — PROVIDERS NOT CONNECTED YET
        ================================================= */}

        <div className="social-login-grid">

          <button
            type="button"
            className="social-login-button"
            aria-label="Continue with Google"
            disabled
            title="Google sign-in will be available soon"
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
            disabled
            title="Microsoft sign-in will be available soon"
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
            disabled
            title="Apple sign-in will be available soon"
          >

            <strong className="apple-icon">
              ●
            </strong>

            Apple

          </button>

        </div>


        {/* =================================================
            LOGIN
        ================================================= */}

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