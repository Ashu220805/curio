import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { FormEvent } from "react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../lib/supabase.ts";

import { useAuth } from "../../hooks/useAuth.ts";

import "./Onboarding.css";


/* =========================================================
   TYPES
   ========================================================= */

type LearningPreferences = {
  visual: boolean;
  step_by_step: boolean;
  practice_first: boolean;
  simple_explanations: boolean;
  real_world_examples: boolean;
  audio_supported: boolean;
  calm_experience: boolean;
  session_length: string;
};


type PreferenceCardProps = {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
};


/* =========================================================
   DEFAULT PREFERENCES
   ========================================================= */

const DEFAULT_PREFERENCES: LearningPreferences = {
  visual: false,
  step_by_step: false,
  practice_first: false,
  simple_explanations: false,
  real_world_examples: false,
  audio_supported: false,
  calm_experience: false,
  session_length: "",
};


/* =========================================================
   PREFERENCE CARD
   ========================================================= */

function PreferenceCard({
  icon,
  title,
  description,
  selected,
  onClick,
}: PreferenceCardProps) {

  return (
    <button
      type="button"
      className={`onboarding-preference-card ${
        selected
          ? "selected"
          : ""
      }`}
      onClick={onClick}
      aria-pressed={selected}
    >

      <span
        className="onboarding-preference-icon"
        aria-hidden="true"
      >
        {icon}
      </span>

      <span className="onboarding-preference-content">

        <strong>
          {title}
        </strong>

        <small>
          {description}
        </small>

      </span>

      <span
        className="onboarding-selection"
        aria-hidden="true"
      >
        {selected ? "OK" : ""}
      </span>

    </button>
  );
}


/* =========================================================
   ONBOARDING
   ========================================================= */

function Onboarding() {

  const navigate = useNavigate();

  const {
    session,
    loading: authLoading,
  } = useAuth();


  /* =======================================================
     STATE
     ======================================================= */

  const [
    preferences,
    setPreferences,
  ] = useState<LearningPreferences>(
    DEFAULT_PREFERENCES
  );

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    currentStep,
    setCurrentStep,
  ] = useState(1);


  /* =======================================================
     LOAD EXISTING PROFILE
     ======================================================= */

  useEffect(() => {

    if (
      authLoading ||
      !session?.user
    ) {
      return;
    }

    let mounted = true;

    const loadProfile = async () => {

      setProfileLoading(true);
      setError("");

      try {

        const {
          data,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "onboarding_completed, learning_preferences"
          )
          .eq(
            "id",
            session.user.id
          )
          .single();


        if (profileError) {
          throw profileError;
        }


        if (!mounted) {
          return;
        }


        if (
          data?.onboarding_completed
        ) {

          navigate(
            "/dashboard",
            {
              replace: true,
            }
          );

          return;
        }


        if (
          data?.learning_preferences &&
          typeof data.learning_preferences ===
            "object"
        ) {

          setPreferences({
            ...DEFAULT_PREFERENCES,
            ...(data.learning_preferences as Partial<LearningPreferences>),
          });

        }

      } catch (profileError) {

        console.error(
          "CURIO: Unable to load onboarding profile:",
          profileError
        );

        if (mounted) {

          setError(
            "We couldn't load your learning profile. Please refresh and try again."
          );

        }

      } finally {

        if (mounted) {
          setProfileLoading(false);
        }

      }

    };


    void loadProfile();


    return () => {
      mounted = false;
    };

  }, [
    authLoading,
    session,
    navigate,
  ]);


  /* =======================================================
     PREFERENCE COUNT
     ======================================================= */

  const selectedPreferenceCount =
    useMemo(() => {

      return [
        preferences.visual,
        preferences.step_by_step,
        preferences.practice_first,
        preferences.simple_explanations,
        preferences.real_world_examples,
        preferences.audio_supported,
        preferences.calm_experience,
      ].filter(Boolean).length;

    }, [preferences]);


  /* =======================================================
     TOGGLE PREFERENCE
     ======================================================= */

  const togglePreference = (
    key:
      | "visual"
      | "step_by_step"
      | "practice_first"
      | "simple_explanations"
      | "real_world_examples"
      | "audio_supported"
      | "calm_experience"
  ) => {

    setPreferences((previous) => ({
      ...previous,

      [key]:
        !previous[key],

    }));

    setError("");
  };


  /* =======================================================
     NEXT STEP
     ======================================================= */

  const handleNext = () => {

    setError("");

    if (
      currentStep === 1 &&
      selectedPreferenceCount === 0
    ) {

      setError(
        "Choose at least one learning preference so CURIO can personalize your experience."
      );

      return;
    }

    setCurrentStep(2);
  };


  /* =======================================================
     PREVIOUS STEP
     ======================================================= */

  const handleBack = () => {

    setError("");

    setCurrentStep(1);
  };


  /* =======================================================
     COMPLETE ONBOARDING
     ======================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    if (
      saving ||
      !session?.user
    ) {
      return;
    }


    if (!preferences.session_length) {

      setError(
        "Choose a learning session length."
      );

      return;
    }


    setSaving(true);
    setError("");


    try {

      const {
        error: updateError,
      } = await supabase
        .from("profiles")
        .update({

          learning_preferences:
            preferences,

          onboarding_completed:
            true,

        })
        .eq(
          "id",
          session.user.id
        );


      if (updateError) {
        throw updateError;
      }


      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );

    } catch (updateError) {

      console.error(
        "CURIO: Unable to save onboarding:",
        updateError
      );

      setError(
        "We couldn't save your learning profile. Please try again."
      );

    } finally {

      setSaving(false);

    }
  };


  /* =======================================================
     AUTH REDIRECT
     ======================================================= */

  if (!authLoading && !session) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  /* =======================================================
     LOADING
     ======================================================= */

  if (
    authLoading ||
    profileLoading
  ) {

    return (
      <div className="onboarding-loading">

        <div
          className="onboarding-loading-mark"
          aria-hidden="true"
        >

          <img
            src="/curio-symbol.png"
            alt=""
          />

        </div>

        <div className="onboarding-spinner" />

        <p>
          Preparing your CURIO experience...
        </p>

      </div>
    );
  }


  /* =======================================================
     MAIN UI
     ======================================================= */

  return (

    <main className="onboarding-page">

      <div className="onboarding-background-glow onboarding-glow-one" />

      <div className="onboarding-background-glow onboarding-glow-two" />


      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="onboarding-header">

        <div className="onboarding-brand">

          <img
            src="/curio-symbol.png"
            alt="CURIO"
            className="onboarding-brand-symbol"
          />

          <div>

            <strong>
              CURIO
            </strong>

            <span>
              LEARN • UNDERSTAND • GROW
            </span>

          </div>

        </div>

        <div className="onboarding-step-indicator">

          Step {currentStep} of 2

        </div>

      </header>


      {/* ===================================================
          PROGRESS
      =================================================== */}

      <div className="onboarding-progress-wrapper">

        <div className="onboarding-progress-track">

          <div
            className="onboarding-progress-value"
            style={{
              width:
                currentStep === 1
                  ? "50%"
                  : "100%",
            }}
          />

        </div>

      </div>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <section className="onboarding-container">

        <div className="onboarding-intro">

          <span className="onboarding-eyebrow">
            PERSONALIZE YOUR LEARNING
          </span>

          <h1>
            Let's make CURIO work for you.
          </h1>

          <p>
            Your answers help us adapt lessons,
            practice and explanations to the
            way you learn best.
          </p>

        </div>


        {error && (

          <div
            className="onboarding-error"
            role="alert"
          >
            {error}
          </div>

        )}


        <form
          onSubmit={handleSubmit}
          className="onboarding-form"
        >


          {/* ===============================================
              STEP 1
          ================================================ */}

          {currentStep === 1 && (

            <section className="onboarding-section">

              <div className="onboarding-section-heading">

                <div>

                  <span>
                    01
                  </span>

                  <h2>
                    How do you prefer to learn?
                  </h2>

                </div>

                <p>
                  Choose everything that sounds
                  useful to you.
                </p>

              </div>


              <div className="onboarding-preferences-grid">

                <PreferenceCard
                  icon="◈"
                  title="Visual"
                  description="Images, diagrams and visual examples."
                  selected={preferences.visual}
                  onClick={() =>
                    togglePreference("visual")
                  }
                />

                <PreferenceCard
                  icon="→"
                  title="Step-by-step"
                  description="Clear instructions one step at a time."
                  selected={preferences.step_by_step}
                  onClick={() =>
                    togglePreference("step_by_step")
                  }
                />

                <PreferenceCard
                  icon="CURIO"
                  title="Practice first"
                  description="Learn by doing and experimenting."
                  selected={preferences.practice_first}
                  onClick={() =>
                    togglePreference("practice_first")
                  }
                />

                <PreferenceCard
                  icon="Aa"
                  title="Simple explanations"
                  description="Clear language without unnecessary complexity."
                  selected={preferences.simple_explanations}
                  onClick={() =>
                    togglePreference(
                      "simple_explanations"
                    )
                  }
                />

                <PreferenceCard
                  icon="◎"
                  title="Real-world examples"
                  description="Connect concepts to everyday situations."
                  selected={preferences.real_world_examples}
                  onClick={() =>
                    togglePreference(
                      "real_world_examples"
                    )
                  }
                />

                <PreferenceCard
                  icon="◖"
                  title="Audio supported"
                  description="Use audio when it helps you understand."
                  selected={preferences.audio_supported}
                  onClick={() =>
                    togglePreference(
                      "audio_supported"
                    )
                  }
                />

                <PreferenceCard
                  icon="~"
                  title="Calm experience"
                  description="A focused, low-distraction learning experience."
                  selected={preferences.calm_experience}
                  onClick={() =>
                    togglePreference(
                      "calm_experience"
                    )
                  }
                />

              </div>


              <div className="onboarding-selection-summary">

                <span>
                  {selectedPreferenceCount}
                </span>

                {selectedPreferenceCount === 1
                  ? " preference selected"
                  : " preferences selected"}

              </div>


              <div className="onboarding-actions">

                <button
                  type="button"
                  className="onboarding-primary-button"
                  onClick={handleNext}
                >
                  Continue
                  <span aria-hidden="true">
                    →
                  </span>
                </button>

              </div>

            </section>

          )}


          {/* ===============================================
              STEP 2
          ================================================ */}

          {currentStep === 2 && (

            <section className="onboarding-section">

              <div className="onboarding-section-heading">

                <div>

                  <span>
                    02
                  </span>

                  <h2>
                    Choose your learning pace.
                  </h2>

                </div>

                <p>
                  We'll use this to shape your
                  learning sessions.
                </p>

              </div>


              <div className="onboarding-session-options">

                <button
                  type="button"
                  className={`onboarding-session-card ${
                    preferences.session_length ===
                    "5_10"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {

                    setPreferences(
                      (previous) => ({
                        ...previous,
                        session_length:
                          "5_10",
                      })
                    );

                    setError("");
                  }}
                  aria-pressed={
                    preferences.session_length ===
                    "5_10"
                  }
                >

                  <strong>
                    5–10 min
                  </strong>

                  <span>
                    Quick learning sessions
                  </span>

                  <small>
                    Good for busy days
                  </small>

                </button>


                <button
                  type="button"
                  className={`onboarding-session-card ${
                    preferences.session_length ===
                    "10_20"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {

                    setPreferences(
                      (previous) => ({
                        ...previous,
                        session_length:
                          "10_20",
                      })
                    );

                    setError("");
                  }}
                  aria-pressed={
                    preferences.session_length ===
                    "10_20"
                  }
                >

                  <strong>
                    10–20 min
                  </strong>

                  <span>
                    Focused learning sessions
                  </span>

                  <small>
                    A balanced pace
                  </small>

                </button>


                <button
                  type="button"
                  className={`onboarding-session-card ${
                    preferences.session_length ===
                    "20_30"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {

                    setPreferences(
                      (previous) => ({
                        ...previous,
                        session_length:
                          "20_30",
                      })
                    );

                    setError("");
                  }}
                  aria-pressed={
                    preferences.session_length ===
                    "20_30"
                  }
                >

                  <strong>
                    20–30 min
                  </strong>

                  <span>
                    Deep focused sessions
                  </span>

                  <small>
                    More practice in one sitting
                  </small>

                </button>


                <button
                  type="button"
                  className={`onboarding-session-card ${
                    preferences.session_length ===
                    "30_plus"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {

                    setPreferences(
                      (previous) => ({
                        ...previous,
                        session_length:
                          "30_plus",
                      })
                    );

                    setError("");
                  }}
                  aria-pressed={
                    preferences.session_length ===
                    "30_plus"
                  }
                >

                  <strong>
                    30+ min
                  </strong>

                  <span>
                    Extended learning sessions
                  </span>

                  <small>
                    For longer study periods
                  </small>

                </button>

              </div>


              {/* PROFILE PREVIEW */}

              <div className="onboarding-preview">

                <div className="onboarding-preview-icon">
                  CURIO
                </div>

                <div>

                  <span>
                    YOUR CURIO PROFILE
                  </span>

                  <h3>
                    Ready to learn your way.
                  </h3>

                  <p>
                    CURIO will use these preferences
                    to personalize your learning
                    experience. You can change them
                    later.
                  </p>

                </div>

              </div>


              <div className="onboarding-actions">

                <button
                  type="button"
                  className="onboarding-secondary-button"
                  onClick={handleBack}
                  disabled={saving}
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  className="onboarding-primary-button"
                  disabled={saving}
                  aria-busy={saving}
                >

                  {saving
                    ? "Saving..."
                    : "Start learning"}

                  {!saving && (

                    <span aria-hidden="true">
                      →
                    </span>

                  )}

                </button>

              </div>

            </section>

          )}

        </form>

      </section>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="onboarding-footer">

        <span>
          Your learning preferences are private
          and belong to your CURIO profile.
        </span>

        <span>
          © {new Date().getFullYear()} CURIO
        </span>

      </footer>

    </main>
  );
}


export default Onboarding;
