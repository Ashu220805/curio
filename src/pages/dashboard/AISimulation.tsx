import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.ts";
import "./AiSimulation.css";

type AnalysisResult = {
  score?: number;
  accuracy?: number;
  feedback?: string;
  strengths?: string[];
  missing?: string[];
  suggestions?: string[];
  improvedPrompt?: string;
  response?: string;
  answer?: string;
  skillTips?: string[];
};

function AISimulation() {
  const navigate = useNavigate();

  /*
    =========================================
    GUEST MODE
  =========================================
  */

  const [isGuest, setIsGuest] =
    useState(false);

  /*
    =========================================
    USER
  =========================================
  */

  const [_userName, setUserName] =
    useState("User");

  /*
    =========================================
    PROMPT
  =========================================
  */

  const [prompt, setPrompt] =
    useState("");

  const [analysis, setAnalysis] =
    useState<AnalysisResult | null>(null);

  /*
    =========================================
    UI STATES
  =========================================
  */

  const [isLoading, setIsLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    showImprovedPrompt,
    setShowImprovedPrompt,
  ] = useState(false);

  /*
    =========================================
    LOAD USER
  =========================================
  */

  useEffect(() => {
    const loadUser = async () => {
      const guest =
        sessionStorage.getItem(
          "curio_guest",
        ) === "true";

      setIsGuest(guest);

      if (guest) {
        setUserName("Guest");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";

      setUserName(fullName);
    };

    loadUser();
  }, [navigate]);

  /*
    =========================================
    RUN AI SIMULATION
  =========================================
  */

  const runSimulation = async () => {
    setErrorMessage("");
    setAnalysis(null);
    setShowImprovedPrompt(false);

    if (!prompt.trim()) {
      setErrorMessage(
        "Write a prompt first. Try asking the AI to solve a specific problem.",
      );
      return;
    }

    if (prompt.trim().length < 10) {
      setErrorMessage(
        "Your prompt is too short. Add more context about what you want the AI to do.",
      );
      return;
    }

    /*
      =========================================
      GUEST PROTECTION
      =========================================
    */

    if (isGuest) {
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      /*
        =========================================
        SUPABASE EDGE FUNCTION
        =========================================
      */

      const {
        data,
        error: functionError,
      } =
        await supabase.functions.invoke(
          "ai-simulation",
          {
            body: {
              prompt:
                prompt.trim(),

              category:
                "Prompting Practice",
            },
          },
        );

      if (functionError) {
        throw functionError;
      }

      if (!data) {
        throw new Error(
          "The AI simulation returned no response.",
        );
      }

      /*
        =========================================
        EDGE FUNCTION RESULT
        =========================================
      */

      if (data.success === false) {
        throw new Error(
          data.error ||
            "The AI simulation failed.",
        );
      }

      const result =
        data.result ||
        data.analysis ||
        data;

      /*
        =========================================
        NORMALIZE RESULT
        =========================================
      */

      setAnalysis({
        score:
          result.score ??
          result.accuracy ??
          0,

        accuracy:
          result.accuracy ??
          result.score ??
          0,

        feedback:
          result.feedback ??
          result.summary ??
          result.message ??
          "",

        strengths:
          Array.isArray(
            result.strengths,
          )
            ? result.strengths
            : [],

        missing:
          Array.isArray(
            result.missing,
          )
            ? result.missing
            : Array.isArray(
                result.missingElements,
              )
            ? result.missingElements
            : [],

        suggestions:
          Array.isArray(
            result.suggestions,
          )
            ? result.suggestions
            : Array.isArray(
                result.improvements,
              )
            ? result.improvements
            : [],

        improvedPrompt:
          result.improvedPrompt ||
          result.betterPrompt ||
          result.improved_prompt ||
          "",

        response:
          result.response ||
          result.answer ||
          result.aiResponse ||
          "",

        answer:
          result.answer ||
          result.response ||
          "",

        skillTips:
          Array.isArray(
            result.skillTips,
          )
            ? result.skillTips
            : [],
      });
    } catch (error) {
      console.error(
        "CURIO AI Simulation error:",
        error,
      );

      if (
        error &&
        typeof error === "object" &&
        "message" in error
      ) {
        setErrorMessage(
          String(
            (
              error as {
                message?: string;
              }
            ).message,
          ),
        );
      } else {
        setErrorMessage(
          "Unable to connect to the AI simulation. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /*
    =========================================
    CLEAR SIMULATION
  =========================================
  */

  const clearSimulation = () => {
    setPrompt("");
    setAnalysis(null);
    setErrorMessage("");
    setShowImprovedPrompt(false);
  };

  /*
    =========================================
    USE IMPROVED PROMPT
  =========================================
  */

  const useImprovedPrompt = () => {
    if (analysis?.improvedPrompt) {
      setPrompt(
        analysis.improvedPrompt,
      );

      setShowImprovedPrompt(false);

      globalThis.globalThis?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /*
    =========================================
    SCORE
  =========================================
  */

  const score = Math.max(
    0,
    Math.min(
      100,
      Number(
        analysis?.score ??
          analysis?.accuracy ??
          0,
      ),
    ),
  );

  const getScoreLabel = () => {
    if (score >= 90) {
      return "Excellent prompt";
    }

    if (score >= 75) {
      return "Strong prompt";
    }

    if (score >= 50) {
      return "Good start";
    }

    if (score >= 25) {
      return "Needs improvement";
    }

    return "Beginner prompt";
  };

  /*
    =========================================
    GUEST LOCK SCREEN
  =========================================
  */

  if (isGuest) {
    return (
      <div className="ai-simulation-page">
        <div className="ai-simulation-locked">

          <div className="ai-simulation-lock-icon">
            🔒
          </div>

          <span className="ai-simulation-eyebrow">
            AI SIMULATION
          </span>

          <h1>
            Practice prompting with AI
          </h1>

          <p>
            Build real prompting skills by
            writing prompts, receiving AI
            feedback and improving your
            prompts step by step.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            className="ai-simulation-primary-button"
          >
            Sign in to unlock
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="ai-simulation-secondary-button"
          >
            Back to Dashboard
          </button>

        </div>
      </div>
    );
  }

  /*
    =========================================
    MAIN PAGE
  =========================================
  */

  return (
    <div className="ai-simulation-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="ai-simulation-header">

        <div>

          <button
            type="button"
            className="ai-simulation-back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          <span className="ai-simulation-eyebrow">
            CURIO • AI SIMULATION
          </span>

          <h1>
            Learn to talk to AI.
            <br />
            <span>
              One prompt at a time.
            </span>
          </h1>

          <p>
            Write a prompt, see how the AI
            responds, and understand exactly
            how you can make your prompt
            stronger.
          </p>

        </div>

        <div className="ai-simulation-header-badge">

          <span>
            🧠
          </span>

          <div>

            <strong>
              Prompt Coach
            </strong>

            <small>
              Learn • Try • Improve
            </small>

          </div>

        </div>

      </header>


      {/* =====================================
          MAIN WORKSPACE
      ====================================== */}

      <main className="ai-simulation-workspace">

        {/* ===================================
            PROMPT AREA
        ==================================== */}

        <section className="ai-simulation-prompt-card">

          <div className="ai-simulation-card-heading">

            <div>

              <span className="ai-simulation-step">
                STEP 01
              </span>

              <h2>
                Write your prompt
              </h2>

              <p>
                Tell the AI what you want it
                to do. Don't worry about being
                perfect.
              </p>

            </div>

            <div className="ai-simulation-prompt-icon">
              💬
            </div>

          </div>


          <div className="ai-simulation-input-wrapper">

            <textarea
              value={prompt}
              onChange={(event) =>
                setPrompt(
                  event.target.value,
                )
              }
              placeholder="Example: Explain photosynthesis to a Class 10 student using a simple real-life example."
              maxLength={4000}
              disabled={isLoading}
            />

            <div className="ai-simulation-input-footer">

              <span>
                {prompt.length}/4000
              </span>

              <span>
                💡 Be specific about your goal.
              </span>

            </div>

          </div>


          {/* ERROR */}

          {errorMessage && (
            <div className="ai-simulation-error">

              <span>
                ⚠️
              </span>

              <p>
                {errorMessage}
              </p>

            </div>
          )}


          <div className="ai-simulation-prompt-actions">

            <button
              type="button"
              className="ai-simulation-clear-button"
              onClick={
                clearSimulation
              }
              disabled={
                isLoading ||
                !prompt
              }
            >
              Clear
            </button>

            <button
              type="button"
              className="ai-simulation-run-button"
              onClick={
                runSimulation
              }
              disabled={
                isLoading ||
                !prompt.trim()
              }
            >

              {isLoading ? (
                <>
                  <span className="ai-simulation-spinner" />
                  Analysing prompt...
                </>
              ) : (
                <>
                  Analyse my prompt
                  <span>→</span>
                </>
              )}

            </button>

          </div>

        </section>


        {/* ===================================
            ANALYSIS
        ==================================== */}

        {analysis && (

          <section className="ai-simulation-results">

            {/* =================================
                SCORE
            ================================== */}

            <div
              className="ai-simulation-score-card"
              style={
                {
                  "--score": score,
                } as React.CSSProperties
              }
            >

              <div className="ai-simulation-score-left">

                <span className="ai-simulation-step">
                  STEP 02
                </span>

                <h2>
                  Your prompt score
                </h2>

                <p>
                  {getScoreLabel()}
                </p>

              </div>


              <div className="ai-simulation-score-circle">

                <div>

                  <strong>
                    {score}
                  </strong>

                  <span>
                    /100
                  </span>

                </div>

              </div>

            </div>


            {/* =================================
                FEEDBACK
            ================================== */}

            {analysis.feedback && (

              <div className="ai-simulation-feedback-card">

                <div className="ai-simulation-result-icon">
                  💡
                </div>

                <div>

                  <span>
                    COACH FEEDBACK
                  </span>

                  <h3>
                    Here's what I noticed
                  </h3>

                  <p>
                    {analysis.feedback}
                  </p>

                </div>

              </div>

            )}


            {/* =================================
                STRENGTHS / MISSING
            ================================== */}

            <div className="ai-simulation-analysis-grid">

              <div className="ai-simulation-analysis-card">

                <div className="ai-simulation-analysis-title">

                  <span>
                    ✓
                  </span>

                  <h3>
                    What's working
                  </h3>

                </div>

                {analysis.strengths &&
                analysis.strengths.length >
                  0 ? (

                  <ul>

                    {analysis.strengths.map(
                      (
                        item,
                        index,
                      ) => (

                        <li
                          key={`${item}-${index}`}
                        >
                          {item}
                        </li>

                      ),
                    )}

                  </ul>

                ) : (

                  <p className="ai-simulation-empty">
                    Your prompt doesn't have
                    clear strengths identified
                    yet.
                  </p>

                )}

              </div>


              <div className="ai-simulation-analysis-card">

                <div className="ai-simulation-analysis-title">

                  <span>
                    !
                  </span>

                  <h3>
                    What is missing
                  </h3>

                </div>

                {analysis.missing &&
                analysis.missing.length >
                  0 ? (

                  <ul>

                    {analysis.missing.map(
                      (
                        item,
                        index,
                      ) => (

                        <li
                          key={`${item}-${index}`}
                        >
                          {item}
                        </li>

                      ),
                    )}

                  </ul>

                ) : (

                  <p className="ai-simulation-empty">
                    Great! No major missing
                    elements were detected.
                  </p>

                )}

              </div>

            </div>


            {/* =================================
                SUGGESTIONS
            ================================== */}

            {analysis.suggestions &&
            analysis.suggestions.length >
              0 && (

              <div className="ai-simulation-suggestions-card">

                <div className="ai-simulation-section-title">

                  <span>
                    STEP 03
                  </span>

                  <h2>
                    Make your prompt stronger
                  </h2>

                  <p>
                    These changes can make
                    your instructions clearer
                    and more useful.
                  </p>

                </div>


                <div className="ai-simulation-suggestions-list">

                  {analysis.suggestions.map(
                    (
                      suggestion,
                      index,
                    ) => (

                      <div
                        className="ai-simulation-suggestion"
                        key={`${suggestion}-${index}`}
                      >

                        <div>
                          {index + 1}
                        </div>

                        <p>
                          {suggestion}
                        </p>

                      </div>

                    ),
                  )}

                </div>

              </div>

            )}


            {/* =================================
                IMPROVED PROMPT
            ================================== */}

            {analysis.improvedPrompt && (

              <div className="ai-simulation-improved-card">

                <div className="ai-simulation-section-title">

                  <span>
                    STEP 04
                  </span>

                  <h2>
                    See a stronger version
                  </h2>

                  <p>
                    Compare your original prompt
                    with a more structured version.
                  </p>

                </div>


                <button
                  type="button"
                  className="ai-simulation-show-button"
                  onClick={() =>
                    setShowImprovedPrompt(
                      (previous) =>
                        !previous,
                    )
                  }
                >

                  {showImprovedPrompt
                    ? "Hide improved prompt"
                    : "Show improved prompt"}

                  <span>
                    {showImprovedPrompt
                      ? "↑"
                      : "↓"}
                  </span>

                </button>


                {showImprovedPrompt && (

                  <div className="ai-simulation-improved-prompt">

                    <div className="ai-simulation-code-header">

                      <span>
                        ✨ CURIO SUGGESTED PROMPT
                      </span>

                    </div>

                    <p>
                      {analysis.improvedPrompt}
                    </p>


                    <button
                      type="button"
                      onClick={
                        useImprovedPrompt
                      }
                      className="ai-simulation-use-button"
                    >
                      Use this prompt
                      <span>
                        →
                      </span>
                    </button>

                  </div>

                )}

              </div>

            )}


            {/* =================================
                AI RESPONSE
            ================================== */}

            {(analysis.response ||
              analysis.answer) && (

              <div className="ai-simulation-response-card">

                <div className="ai-simulation-section-title">

                  <span>
                    AI RESPONSE
                  </span>

                  <h2>
                    What the AI would answer
                  </h2>

                </div>


                <div className="ai-simulation-response">

                  <div className="ai-simulation-response-avatar">
                    ✨
                  </div>

                  <div>
                    {analysis.response ||
                      analysis.answer}
                  </div>

                </div>

              </div>

            )}

          </section>

        )}


        {/* =====================================
            EMPTY STATE
        ====================================== */}

        {!analysis &&
          !isLoading && (

            <section className="ai-simulation-how-it-works">

              <div>

                <span>
                  HOW IT WORKS
                </span>

                <h2>
                  Don't just use AI.
                  <br />
                  Learn how to use it well.
                </h2>

              </div>


              <div className="ai-simulation-how-grid">

                <div>

                  <strong>
                    01
                  </strong>

                  <h3>
                    Write
                  </h3>

                  <p>
                    Write your prompt naturally.
                  </p>

                </div>


                <div>

                  <strong>
                    02
                  </strong>

                  <h3>
                    Analyse
                  </h3>

                  <p>
                    CURIO identifies what's
                    helping or hurting your prompt.
                  </p>

                </div>


                <div>

                  <strong>
                    03
                  </strong>

                  <h3>
                    Improve
                  </h3>

                  <p>
                    Apply the feedback and try
                    again.
                  </p>

                </div>

              </div>

            </section>

          )}

      </main>

    </div>
  );
}

export default AISimulation;