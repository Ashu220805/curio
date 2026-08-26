import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.ts";
import { runAISimulation } from "../../lib/aiSimulator.ts";
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

  const [isGuest, setIsGuest] = useState(false);

  /*
    =========================================
    USER
  =========================================
  */

  const [_userName, setUserName] = useState("User");

  /*
    =========================================
    PROMPT
  =========================================
  */

  const [prompt, setPrompt] = useState("");

  const [analysis, setAnalysis] =
    useState<AnalysisResult | null>(null);

  /*
    =========================================
    UI STATES
  =========================================
  */

  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [
    showImprovedPrompt,
    setShowImprovedPrompt,
  ] = useState(false);

  /*
    =========================================
    CURIO MEDIATOR
  =========================================

    The mediator checks the prompt BEFORE
    sending it to the AI simulation.

    Private information is detected locally
    in the browser.
  =========================================
  */

  const [
    mediatorStatus,
    setMediatorStatus,
  ] = useState<"idle" | "warning" | "blocked">(
    "idle",
  );

  const [
    mediatorMessage,
    setMediatorMessage,
  ] = useState("");

  const [
    mediatorDetails,
    setMediatorDetails,
  ] = useState<string[]>([]);

  /*
    =========================================
    LOAD USER
  =========================================
  */

  useEffect(() => {
    const loadUser = async () => {
      const guest =
        sessionStorage.getItem("curio_guest") ===
        "true";

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

    void loadUser();
  }, [navigate]);

  /*
    =========================================
    CURIO MEDIATOR
    =========================================

    FIRST VERSION

    Checks for common private/sensitive
    information before the prompt is sent
    to the AI simulation.

    This check happens locally.
  =========================================
  */

  const checkMediator = (
    text: string,
  ): {
    status: "safe" | "warning" | "blocked";
    message: string;
    details: string[];
  } => {
    const value = text.trim();

    const findings: string[] = [];

    /*
      =========================================
      EMAIL
      =========================================
    */

    if (
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(
        value,
      )
    ) {
      findings.push(
        "Your prompt appears to contain an email address.",
      );
    }

    /*
      =========================================
      PHONE NUMBER
      =========================================
    */

    if (
      /(?:\+?\d[\d\s().-]{8,}\d)/.test(value)
    ) {
      findings.push(
        "Your prompt appears to contain a phone number.",
      );
    }

    /*
      =========================================
      CREDIT / DEBIT CARD
      =========================================
    */

    if (
      /\b(?:\d[ -]*?){13,19}\b/.test(value)
    ) {
      findings.push(
        "Your prompt may contain a card or financial number.",
      );
    }

    /*
      =========================================
      PASSWORD
      =========================================
    */

    if (
      /\b(password|passwd|passcode|login password|secret key)\b\s*(is|:|=)/i.test(
        value,
      )
    ) {
      findings.push(
        "Your prompt appears to contain a password or secret.",
      );
    }

    /*
      =========================================
      OTP
      =========================================
    */

    if (
      /\b(?:otp|one[- ]time password|verification code|security code)\b\s*(is|:|=)/i.test(
        value,
      )
    ) {
      findings.push(
        "Your prompt appears to contain a verification code.",
      );
    }

    /*
      =========================================
      API KEYS / TOKENS
      =========================================
    */

    if (
      /\b(?:api[_ -]?key|access[_ -]?token|secret[_ -]?key|bearer token)\b\s*(is|:|=)/i.test(
        value,
      )
    ) {
      findings.push(
        "Your prompt appears to contain an API key or access token.",
      );
    }

    /*
      =========================================
      SENSITIVE IDENTITY INFORMATION
      =========================================
    */

    if (
      /\b(?:aadhaar|pan card|passport|social security|ssn)\b\s*(number|no\.?|#)?\s*(is|:|=)?/i.test(
        value,
      )
    ) {
      findings.push(
        "Your prompt appears to reference sensitive identity information.",
      );
    }

    /*
      =========================================
      PRIVATE ADDRESS
      =========================================
    */

    if (
      /\b(?:home address|residential address|my address|house address)\b\s*(is|:|=)/i.test(
        value,
      )
    ) {
      findings.push(
        "Your prompt appears to contain a private address.",
      );
    }

    /*
      =========================================
      PERSONAL INFORMATION COMBINATION
      =========================================
    */

    if (
      /\b(?:my|our)\b.{0,30}\b(?:address|phone|email|location)\b/i.test(
        value,
      )
    ) {
      findings.push(
        "Your prompt may contain personally identifying information.",
      );
    }

    /*
      =========================================
      STRONG SECRET INDICATORS
      =========================================
    */

    const strongSecret =
      /\b(?:password|otp|one[- ]time password|api[_ -]?key|access[_ -]?token|secret key|credit card|debit card|cvv|pin)\b/i.test(
        value,
      );

    /*
      =========================================
      BLOCK SENSITIVE SECRETS
      =========================================
    */

    if (strongSecret) {
      return {
        status: "blocked",

        message:
          "CURIO stopped this prompt because it may contain private or sensitive information.",

        details: findings,
      };
    }

    /*
      =========================================
      WARNING
      =========================================
    */

    if (findings.length > 0) {
      return {
        status: "warning",

        message:
          "CURIO noticed information that may be private. Review your prompt before sending it.",

        details: findings,
      };
    }

    /*
      =========================================
      SAFE
      =========================================
    */

    return {
      status: "safe",

      message:
        "Your prompt looks safe to continue.",

      details: [],
    };
  };

  /*
    =========================================
    RUN AI SIMULATION
    =========================================

    The actual AI request is handled by:

      lib/aiSimulation.ts

    This keeps the frontend clean and ensures
    the OpenAI/API key stays on the server.
  =========================================
  */

  const runSimulation = async () => {
    setErrorMessage("");
    setAnalysis(null);
    setShowImprovedPrompt(false);

    /*
      Reset mediator state
    */

    setMediatorStatus("idle");
    setMediatorMessage("");
    setMediatorDetails([]);

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
      CURIO MEDIATOR
      =========================================

      IMPORTANT:

      This happens BEFORE the prompt reaches
      the AI simulation.
    */

    const mediator = checkMediator(prompt);

    if (mediator.status === "blocked") {
      setMediatorStatus("blocked");

      setMediatorMessage(mediator.message);

      setMediatorDetails(mediator.details);

      return;
    }

    if (mediator.status === "warning") {
      setMediatorStatus("warning");

      setMediatorMessage(mediator.message);

      setMediatorDetails(mediator.details);

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
        AI SIMULATOR SERVICE
        =========================================

        Do NOT call supabase.functions.invoke()
        directly here.

        lib/aiSimulation.ts handles:
        - authentication
        - Edge Function
        - response validation
        - normalization
        - errors
      */

      const simulatorResult =
        await runAISimulation({
          prompt: prompt.trim(),
          category: "Prompting Practice",
        });

      /*
        =========================================
        SERVICE RESPONSE
        =========================================

        runAISimulation() returns:

        {
          response: string,
          analysis: {
            score,
            clarity,
            context,
            specificity,
            goal,
            outputFormat,
            strengths,
            improvements,
            tip,
            improvedPrompt
          }
        }
      */

      const result =
        simulatorResult.analysis;

      /*
        =========================================
        NORMALIZE FOR EXISTING UI
        =========================================

        The existing UI expects:

        feedback
        missing
        suggestions
        response
        answer
        skillTips

        We map the service response into that
        existing structure without changing
        your UI.
      */

      const missing: string[] = [];

      if (result.clarity < 60) {
        missing.push(
          "Clear and understandable instructions.",
        );
      }

      if (result.context < 60) {
        missing.push(
          "More context about the task or situation.",
        );
      }

      if (result.specificity < 60) {
        missing.push(
          "More specific details about what you want.",
        );
      }

      if (result.goal < 60) {
        missing.push(
          "A clearly defined goal or desired outcome.",
        );
      }

      if (result.outputFormat < 60) {
        missing.push(
          "A clear description of the desired output format.",
        );
      }

      const suggestions =
        result.improvements.length > 0
          ? result.improvements
          : [];

      const feedback =
        result.tip ||
        "Review the score and try improving the weaker parts of your prompt.";

      setAnalysis({
        score: result.score,

        accuracy: result.score,

        feedback,

        strengths: result.strengths,

        missing,

        suggestions,

        improvedPrompt:
          result.improvedPrompt,

        response:
          simulatorResult.response,

        answer:
          simulatorResult.response,

        skillTips: [
          `Clarity: ${result.clarity}/100`,
          `Context: ${result.context}/100`,
          `Specificity: ${result.specificity}/100`,
          `Goal: ${result.goal}/100`,
          `Output format: ${result.outputFormat}/100`,
        ],
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
            ).message ??
              "Unable to connect to the AI simulation. Please try again.",
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

    /*
      Reset mediator
    */

    setMediatorStatus("idle");
    setMediatorMessage("");
    setMediatorDetails([]);
  };

  /*
    =========================================
    USE IMPROVED PROMPT
    =========================================
  */

  const useImprovedPrompt = () => {
    if (analysis?.improvedPrompt) {
      setPrompt(analysis.improvedPrompt);

      setShowImprovedPrompt(false);

      globalThis.scrollTo({
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
          <span>🧠</span>

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
                setPrompt(event.target.value)
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
              <span>⚠️</span>

              <p>{errorMessage}</p>
            </div>
          )}

          {/* =====================================
              CURIO MEDIATOR
          ====================================== */}

          {mediatorStatus !== "idle" && (
            <div
              className={
                mediatorStatus === "blocked"
                  ? "ai-simulation-mediator ai-simulation-mediator-blocked"
                  : "ai-simulation-mediator ai-simulation-mediator-warning"
              }
            >
              <div className="ai-simulation-mediator-icon">
                {mediatorStatus === "blocked"
                  ? "🛡️"
                  : "⚠️"}
              </div>

              <div className="ai-simulation-mediator-content">
                <span className="ai-simulation-mediator-label">
                  CURIO MEDIATOR
                </span>

                <h3>
                  {mediatorStatus ===
                  "blocked"
                    ? "Prompt stopped for your safety"
                    : "Please review your prompt"}
                </h3>

                <p>
                  {mediatorMessage}
                </p>

                {mediatorDetails.length >
                  0 && (
                  <ul>
                    {mediatorDetails.map(
                      (
                        detail,
                        index,
                      ) => (
                        <li
                          key={`${detail}-${index}`}
                        >
                          {detail}
                        </li>
                      ),
                    )}
                  </ul>
                )}

                <div className="ai-simulation-mediator-help">
                  <strong>
                    What should you do?
                  </strong>

                  <p>
                    Remove private information
                    such as passwords, OTPs,
                    financial details, contact
                    information, or sensitive
                    identity information.
                  </p>
                </div>

                <button
                  type="button"
                  className="ai-simulation-mediator-edit"
                  onClick={() => {
                    setMediatorStatus(
                      "idle",
                    );

                    setMediatorMessage("");

                    setMediatorDetails([]);
                  }}
                >
                  Edit my prompt
                </button>
              </div>
            </div>
          )}

          <div className="ai-simulation-prompt-actions">
            <button
              type="button"
              className="ai-simulation-clear-button"
              onClick={clearSimulation}
              disabled={
                isLoading || !prompt
              }
            >
              Clear
            </button>

            <button
              type="button"
              className="ai-simulation-run-button"
              onClick={runSimulation}
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

                  <span>/100</span>
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
                  <span>✓</span>

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
                  <span>!</span>

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

                      <span>→</span>
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
                  <strong>01</strong>

                  <h3>
                    Write
                  </h3>

                  <p>
                    Write your prompt naturally.
                  </p>
                </div>

                <div>
                  <strong>02</strong>

                  <h3>
                    Analyse
                  </h3>

                  <p>
                    CURIO identifies what's
                    helping or hurting your prompt.
                  </p>
                </div>

                <div>
                  <strong>03</strong>

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