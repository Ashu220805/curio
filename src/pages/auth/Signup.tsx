import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.tsx";
import { supabase } from "../../lib/supabase.ts";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [learnerType, setLearnerType] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [aiExperience, setAiExperience] = useState("");
  const [learningGoal, setLearningGoal] = useState("");

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

    /* =========================================
       BASIC ACCOUNT VALIDATION
    ========================================== */

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    /* =========================================
       LEARNER PROFILE VALIDATION
    ========================================== */

    if (!age.trim()) {
      setError("Please enter your age.");
      return;
    }

    const numericAge = Number(age);

    if (
      !Number.isInteger(numericAge) ||
      numericAge < 10 ||
      numericAge > 100
    ) {
      setError("Please enter a valid age between 10 and 100.");
      return;
    }

    if (!learnerType) {
      setError("Please tell us who you are.");
      return;
    }

    if (!educationLevel) {
      setError("Please select your education level.");
      return;
    }

    if (!aiExperience) {
      setError("Please select your current AI experience.");
      return;
    }

    if (!learningGoal) {
      setError("Please select what you want to learn with CURIO.");
      return;
    }

    /* =========================================
       PASSWORD VALIDATION
    ========================================== */

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

    /* =========================================
       TERMS VALIDATION
    ========================================== */

    if (!agreedToTerms) {
      setError(
        "Please agree to the Terms of Service and Privacy Policy."
      );
      return;
    }

    setIsLoading(true);

    try {
      /* =========================================
         CURIO ACCOUNT CREATION
         
         Existing Supabase authentication is kept.
         Learner information is added to metadata.
      ========================================== */

      const {
        data,
        error: signUpError,
      } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            /* Existing information */
            full_name: name.trim(),

            /* =====================================
               CURIO LEARNER PROFILE
            ===================================== */

            age: numericAge,
            learner_type: learnerType,
            education_level: educationLevel,
            ai_experience: aiExperience,
            learning_goal: learningGoal,
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

          If email confirmation is enabled in
          Supabase, data.session will normally
          be null.

          We keep the existing CURIO behaviour:
          the user is sent to Sign In rather than
          being automatically logged in.
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

          <p>
            Tell us a little about yourself so CURIO
            can understand how to guide your learning.
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

          {/* =========================================
              BASIC INFORMATION
          ========================================== */}

          <div className="signup-profile-section">

            <div className="signup-section-heading">
              <h3>About you</h3>

              <p>
                This helps us understand who CURIO is
                helping and design better learning
                experiences.
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
                  onChange={(event) =>
                    setAge(event.target.value)
                  }
                  autoComplete="off"
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
                  onChange={(event) =>
                    setLearnerType(event.target.value)
                  }
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

            {/* EDUCATION LEVEL */}

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
                  onChange={(event) =>
                    setEducationLevel(event.target.value)
                  }
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

          {/* =========================================
              AI EXPERIENCE
          ========================================== */}

          <div className="signup-profile-section">

            <div className="signup-section-heading">

              <h3>Your AI starting point</h3>

              <p>
                There is no right or wrong answer.
                CURIO is designed for beginners as
                well as experienced AI users.
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
                  onChange={(event) =>
                    setAiExperience(event.target.value)
                  }
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
                  onChange={(event) =>
                    setLearningGoal(event.target.value)
                  }
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

          {/* =========================================
              PROFILE INFORMATION NOTE
          ========================================== */}

          <div className="signup-profile-note">

            <span aria-hidden="true">
              💡
            </span>

            <p>
              CURIO will use this information to
              understand its learners and improve
              personalized learning experiences.
              You can always review how your
              information is used through CURIO's
              privacy policy.
            </p>

          </div>

          {/* =========================================
              PASSWORD
          ========================================== */}

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

          {/* =========================================
              CONFIRM PASSWORD
          ========================================== */}

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