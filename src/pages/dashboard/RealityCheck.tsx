import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { useLessonProgress } from "../../hooks/useLessonProgress.ts";
import "./Reality.css";

/* =========================================================
   TYPES
========================================================= */

type RealitySection =
  | "pause"
  | "verify"
  | "context"
  | "evidence"
  | "manipulation"
  | "ai-content"
  | "compare"
  | "decide";

type Section = {
  id: RealitySection;
  number: string;
  title: string;
  shortTitle: string;
};

/* =========================================================
   SECTIONS
========================================================= */

const SECTIONS: Section[] = [
  {
    id: "pause",
    number: "01",
    title: "Pause before reacting",
    shortTitle: "Pause",
  },
  {
    id: "verify",
    number: "02",
    title: "Verify the source",
    shortTitle: "Verify",
  },
  {
    id: "context",
    number: "03",
    title: "Check the context",
    shortTitle: "Context",
  },
  {
    id: "evidence",
    number: "04",
    title: "Find the evidence",
    shortTitle: "Evidence",
  },
  {
    id: "manipulation",
    number: "05",
    title: "Spot manipulation",
    shortTitle: "Manipulation",
  },
  {
    id: "ai-content",
    number: "06",
    title: "AI-generated content",
    shortTitle: "AI Content",
  },
  {
    id: "compare",
    number: "07",
    title: "Compare information",
    shortTitle: "Compare",
  },
  {
    id: "decide",
    number: "08",
    title: "Decide using evidence",
    shortTitle: "Decide",
  },
];

/* =========================================================
   FINAL QUESTIONS
========================================================= */

const FINAL_QUESTIONS = [
  {
    question:
      "You see a surprising post online. What should you do first?",
    options: [
      "Share it immediately",
      "Believe it because many people liked it",
      "Pause and look at the information carefully",
      "Assume it is false",
    ],
    answer: 2,
    explanation:
      "A strong reality-check habit begins with a pause. Don't react before understanding what you are seeing.",
  },
  {
    question:
      "Which source gives you stronger evidence?",
    options: [
      "An anonymous post with no evidence",
      "A source that provides verifiable information",
      "A message forwarded by a friend",
      "A dramatic headline",
    ],
    answer: 1,
    explanation:
      "A source that provides information you can verify gives you a stronger basis for making a decision.",
  },
  {
    question:
      "Why does context matter?",
    options: [
      "It makes every claim true",
      "It helps you understand what happened and what information may be missing",
      "It guarantees that a post is genuine",
      "It means you never need another source",
    ],
    answer: 1,
    explanation:
      "Context can change how information should be understood. A cropped image or sentence may not tell the complete story.",
  },
  {
    question:
      "Which is the strongest approach when checking an important claim?",
    options: [
      "Trust the first result you see",
      "Check multiple reliable sources and compare the evidence",
      "Trust the most emotional explanation",
      "Choose the explanation you already agree with",
    ],
    answer: 1,
    explanation:
      "Comparing reliable sources reduces the chance of making a decision based on incomplete or misleading information.",
  },
  {
    question:
      "What is the best response when you cannot verify a claim?",
    options: [
      "Share it anyway",
      "Treat it as definitely true",
      "Treat it cautiously and avoid presenting it as established fact",
      "Add more dramatic details",
    ],
    answer: 2,
    explanation:
      "When evidence is insufficient, uncertainty is the responsible position. You don't need to decide that something is true or false immediately.",
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

function RealityCheck() {
  const navigate = useNavigate();

  /*
    IMPORTANT:
    Reality Check uses LESSON ID 2.

    Total sections = 8.
  */

  const {
    progress,
    loading: progressLoading,
    saving,
    error: progressError,
    updateProgress,
    markComplete,
  } = useLessonProgress(2, SECTIONS.length);

  /* =======================================================
     CURRENT PAGE
  ======================================================= */

  const [currentPage, setCurrentPage] = useState(1);

  /*
    Local interaction state.
    These are temporary answers for the current visit.
  */

  const [pauseAnswer, setPauseAnswer] = useState("");
  const [sourceAnswer, setSourceAnswer] = useState("");
  const [contextAnswer, setContextAnswer] = useState("");
  const [evidenceAnswer, setEvidenceAnswer] = useState("");
  const [manipulationAnswer, setManipulationAnswer] = useState("");
  const [aiContentAnswer, setAiContentAnswer] = useState("");
  const [compareAnswer, setCompareAnswer] = useState("");

  const [finalAnswers, setFinalAnswers] = useState<number[]>(
    Array(FINAL_QUESTIONS.length).fill(-1)
  );

  const [finalSubmitted, setFinalSubmitted] = useState(false);
  const [finalPassed, setFinalPassed] = useState(false);
  const [completed, setCompleted] = useState(false);

  /* =======================================================
     RESTORE DATABASE PROGRESS
  ======================================================= */

  useEffect(() => {
    if (progressLoading) return;

    if (!progress) {
      setCurrentPage(1);
      setCompleted(false);
      return;
    }

    const savedCompleted = Math.min(
      Math.max(Number(progress.completedSections) || 0, 0),
      SECTIONS.length
    );

    /*
      Reality Check supports both progress formats that may exist in
      older Supabase rows:

      1. current_section = NEXT page to open
      2. current_section = LAST completed page

      When current_section <= completed_sections, the row is using
      the second format, so resume from the next page. Otherwise the
      row is already storing the next page.
    */
    const rawCurrent = Number(progress.currentSection) || 0;

    let resumePage = 1;

    if (savedCompleted >= SECTIONS.length || progress.completed) {
      resumePage = SECTIONS.length;
    } else if (rawCurrent <= savedCompleted) {
      resumePage = savedCompleted + 1;
    } else {
      resumePage = rawCurrent;
    }

    resumePage = Math.min(
      Math.max(resumePage, 1),
      SECTIONS.length
    );

    setCurrentPage(resumePage);
    setCompleted(Boolean(progress.completed));

    if (progress.completed) {
      setFinalPassed(true);
      setFinalSubmitted(true);
    }
  }, [progress, progressLoading]);

  /* =======================================================
     CALCULATED PROGRESS
  ======================================================= */

  const completedSections =
    progress?.completedSections ?? 0;

  const progressPercentage = Math.min(
    100,
    Math.round(
      (completedSections / SECTIONS.length) * 100
    )
  );

  const currentSectionIndex = currentPage - 1;

  const currentSection =
    SECTIONS[currentSectionIndex];

  /*
    A page is unlocked if:
    - it is already completed
    - OR it is the next page after completed progress
  */

  const furthestUnlockedPage = Math.min(
    completedSections + 1,
    SECTIONS.length
  );

  /* =======================================================
     FINAL SCORE
  ======================================================= */

  const finalScore = useMemo(() => {
    return FINAL_QUESTIONS.reduce(
      (score, question, index) => {
        return (
          score +
          (finalAnswers[index] === question.answer
            ? 1
            : 0)
        );
      },
      0
    );
  }, [finalAnswers]);

  const finalPercentage = Math.round(
    (finalScore / FINAL_QUESTIONS.length) * 100
  );

  /* =======================================================
     SCROLL TO TOP
  ======================================================= */

  const scrollTop = () => {
    globalThis.scrollTo?.({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     CHECK PAGE ACCESS
  ======================================================= */

  const canOpenPage = (pageNumber: number) => {
    if (completed) return true;

    return pageNumber <= furthestUnlockedPage;
  };

  /* =======================================================
     OPEN PAGE
  ======================================================= */

  const openPage = (pageNumber: number) => {
    if (!canOpenPage(pageNumber)) return;

    setCurrentPage(pageNumber);
    scrollTop();
  };

  /* =======================================================
     SAVE PROGRESS
  ======================================================= */

  const saveCurrentProgress = async (
    nextPage: number,
    completedCount: number
  ) => {
    const result = await Promise.resolve(
      updateProgress(nextPage, completedCount)
    );

    return Boolean(result);
  };

  /* =======================================================
     NEXT PAGE
  ======================================================= */

  const goNext = async () => {
    if (currentPage >= SECTIONS.length || saving) {
      return;
    }

    const nextPage = Math.min(
      currentPage + 1,
      SECTIONS.length
    );

    const newCompletedCount = Math.min(
      Math.max(completedSections, currentPage),
      SECTIONS.length
    );

    /*
      Save the NEXT page, not the page being left.
      This makes the database row unambiguous:

      current_section = page to resume
      completed_sections = number of finished pages
    */
    const success = await saveCurrentProgress(
      nextPage,
      newCompletedCount
    );

    if (!success) return;

    setCurrentPage(nextPage);
    scrollTop();
  };

  /* =======================================================
     PREVIOUS PAGE
  ======================================================= */

  const goPrevious = () => {
    if (currentPage <= 1 || saving) {
      return;
    }

    setCurrentPage((page) => Math.max(page - 1, 1));
    scrollTop();
  };

  /* =======================================================
     COMPLETE FINAL LESSON
  ======================================================= */

  const completeRealityCheck = async () => {
    if (!finalPassed || saving) return;

    const success = await markComplete();

    if (!success) return;

    setCompleted(true);
    setCurrentPage(SECTIONS.length);
    scrollTop();
  };

  /* =======================================================
     FINAL QUIZ
  ======================================================= */

  const submitFinalChallenge = () => {
    if (
      finalAnswers.some(
        (answer) => answer === -1
      )
    ) {
      return;
    }

    setFinalSubmitted(true);

    if (finalScore >= 4) {
      setFinalPassed(true);
    } else {
      setFinalPassed(false);
    }
  };

  /* =======================================================
     RETRY FINAL QUIZ
  ======================================================= */

  const retryFinalChallenge = () => {
    setFinalAnswers(
      Array(FINAL_QUESTIONS.length).fill(-1)
    );

    setFinalSubmitted(false);
    setFinalPassed(false);
  };

  /* =======================================================
     PAGE ANSWER VALIDATION
  ======================================================= */

  const pageReady = () => {
    switch (currentSection?.id) {
      case "pause":
        return pauseAnswer === "pause";

      case "verify":
        return sourceAnswer === "verify";

      case "context":
        return contextAnswer === "context";

      case "evidence":
        return evidenceAnswer === "evidence";

      case "manipulation":
        return manipulationAnswer === "manipulation";

      case "ai-content":
        return aiContentAnswer === "careful";

      case "compare":
        return compareAnswer === "compare";

      case "decide":
        return finalPassed;

      default:
        return false;
    }
  };

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (progressLoading) {
    return (
      <main className="reality-page reality-loading-page">
        <div className="reality-loading">
          <div className="reality-loading-spinner" />
          <h2>Loading your Reality Check...</h2>
          <p>
            Restoring your saved learning progress.
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="reality-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="reality-header">

        <div className="reality-brand">

          <button
            type="button"
            className="reality-back-button"
            onClick={() => navigate("/learn")}
            aria-label="Back to learning"
          >
            ←
          </button>

          <div className="reality-logo-mark">
            🧠
          </div>

          <div>
            <strong>CURIO</strong>
            <span>
              Reality Check · Digital Reality Literacy
            </span>
          </div>

        </div>

        <div className="reality-header-progress">

          <div className="reality-progress-heading">
            <span>AI THINKING SKILL</span>
            <strong>
              {progressPercentage}%
            </strong>
          </div>

          <div className="reality-progress-track">
            <div
              className="reality-progress-fill"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>

        </div>

      </header>

      {/* ===================================================
          SAVE ERROR
      =================================================== */}

      {progressError && (
        <div className="reality-error-banner">
          <strong>Unable to save your progress.</strong>
          <span>
            Please check your connection and try again.
          </span>
        </div>
      )}

      {/* ===================================================
          MAIN LAYOUT
      =================================================== */}

      <div className="reality-layout">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="reality-sidebar">

          <div className="reality-sidebar-heading">
            YOUR JOURNEY
          </div>

          <div className="reality-section-list">

            {SECTIONS.map(
              (item, index) => {
                const pageNumber = index + 1;

                const unlocked =
                  canOpenPage(pageNumber);

                const isCompleted =
                  completedSections >= pageNumber;

                const isActive =
                  currentPage === pageNumber;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() =>
                      openPage(pageNumber)
                    }
                    className={[
                      "reality-section-button",
                      isActive
                        ? "active"
                        : "",
                      isCompleted
                        ? "completed"
                        : "",
                      !unlocked
                        ? "locked"
                        : "",
                    ].join(" ")}
                  >

                    <span className="reality-section-number">
                      {item.number}
                    </span>

                    <span className="reality-section-text">
                      <strong>
                        {item.shortTitle}
                      </strong>
                      <small>
                        {item.title}
                      </small>
                    </span>

                    <span className="reality-section-status">
                      {isCompleted
                        ? "✓"
                        : !unlocked
                        ? "🔒"
                        : ""}
                    </span>

                  </button>
                );
              }
            )}

          </div>

        </aside>

        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="reality-content">

          {/* =================================================
              HERO
          ================================================= */}

          <div className="reality-hero">

            <span className="reality-kicker">
              🛡 DIGITAL REALITY LITERACY
            </span>

            <h1>
              Seeing is no
              <br />
              longer
              <br />
              <em>enough.</em>
            </h1>

            <p>
              AI can now generate images, videos,
              voices and text that look convincing.
              At the same time, human-created content
              can be edited, cropped, manipulated or
              presented without its original context.
            </p>

            <div className="reality-hero-principle">

              <span>🧠</span>

              <div>
                <strong>
                  Reality Check is not about
                  distrusting everything.
                </strong>

                <p>
                  It is about learning how to pause,
                  verify, find evidence and make
                  better decisions.
                </p>
              </div>

            </div>

          </div>

          {/* =================================================
              STEP INDICATOR
          ================================================= */}

          <div className="reality-step-indicator">

            <span>
              STEP {currentSection.number}
            </span>

            <strong>
              {currentSection.title}
            </strong>

            <small>
              {completedSections} /{" "}
              {SECTIONS.length} completed
            </small>

          </div>

          {/* =================================================
              PAGE 1
          ================================================= */}

          {currentSection.id === "pause" && (
            <article className="reality-card">

              <span className="reality-card-label">
                01 · PAUSE
              </span>

              <h2>
                Don't react yet.
              </h2>

              <p className="reality-lead">
                The first skill of digital reality
                literacy is surprisingly simple:
                <strong> pause.</strong>
              </p>

              <div className="reality-explanation">

                <div className="reality-icon">
                  ⏸
                </div>

                <div>
                  <h3>
                    Your first reaction is not
                    always your best decision.
                  </h3>

                  <p>
                    A dramatic headline, shocking
                    image or emotional message can
                    make you want to react immediately.
                    Before you like, share, comment or
                    believe it, give yourself a moment
                    to think.
                  </p>
                </div>

              </div>

              <div className="reality-example-grid">

                <div>
                  <span>⚡</span>
                  <strong>
                    Something shocking
                  </strong>
                  <p>
                    "You won't believe what happened!"
                  </p>
                </div>

                <div>
                  <span>⏸</span>
                  <strong>
                    Pause
                  </strong>
                  <p>
                    Ask yourself what you actually know.
                  </p>
                </div>

                <div>
                  <span>🔎</span>
                  <strong>
                    Check
                  </strong>
                  <p>
                    Look for evidence before reacting.
                  </p>
                </div>

              </div>

              <h3>
                What should you do first?
              </h3>

              <div className="reality-choice-grid">

                <button
                  type="button"
                  className={
                    pauseAnswer === "share"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setPauseAnswer("share")
                  }
                >
                  Share it immediately
                </button>

                <button
                  type="button"
                  className={
                    pauseAnswer === "pause"
                      ? "selected correct"
                      : ""
                  }
                  onClick={() =>
                    setPauseAnswer("pause")
                  }
                >
                  Pause and look carefully
                </button>

              </div>

              {pauseAnswer === "pause" && (
                <div className="reality-success">
                  ✓ Correct. Pausing gives you
                  space to think before reacting.
                </div>
              )}

              {pauseAnswer === "share" && (
                <div className="reality-warning">
                  Not quite. Don't let a strong
                  emotional reaction replace checking.
                </div>
              )}

              <button
                type="button"
                className="reality-primary-button"
                disabled={!pageReady() || saving}
                onClick={goNext}
              >
                {saving
                  ? "Saving..."
                  : "Continue → Verify"}
              </button>

            </article>
          )}

          {/* =================================================
              PAGE 2
          ================================================= */}

          {currentSection.id === "verify" && (
            <article className="reality-card">

              <span className="reality-card-label">
                02 · VERIFY
              </span>

              <h2>
                Find out where the information
                came from.
              </h2>

              <p className="reality-lead">
                Before trusting a claim, examine
                its source.
              </p>

              <div className="reality-explanation">

                <div className="reality-icon">
                  🔎
                </div>

                <div>
                  <h3>
                    Ask: "Who is saying this?"
                  </h3>

                  <p>
                    A source gives you important
                    information about where a claim
                    originated. Check whether you
                    can identify the person,
                    organisation or publication
                    behind the information.
                  </p>
                </div>

              </div>

              <div className="reality-checklist">

                <div>
                  <span>01</span>
                  <strong>
                    Identify the source
                  </strong>
                  <p>
                    Who created or published it?
                  </p>
                </div>

                <div>
                  <span>02</span>
                  <strong>
                    Check the date
                  </strong>
                  <p>
                    Is the information current?
                  </p>
                </div>

                <div>
                  <span>03</span>
                  <strong>
                    Look for evidence
                  </strong>
                  <p>
                    Does the source support its claim?
                  </p>
                </div>

              </div>

              <h3>
                Which is stronger?
              </h3>

              <div className="reality-choice-grid">

                <button
                  type="button"
                  className={
                    sourceAnswer === "anonymous"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setSourceAnswer("anonymous")
                  }
                >
                  Anonymous post with no evidence
                </button>

                <button
                  type="button"
                  className={
                    sourceAnswer === "verify"
                      ? "selected correct"
                      : ""
                  }
                  onClick={() =>
                    setSourceAnswer("verify")
                  }
                >
                  Source with information you can verify
                </button>

              </div>

              {sourceAnswer === "verify" && (
                <div className="reality-success">
                  ✓ Correct. A claim is stronger
                  when its source and evidence
                  can be checked.
                </div>
              )}

              {sourceAnswer === "anonymous" && (
                <div className="reality-warning">
                  Look again. An unsupported
                  anonymous claim gives you less
                  evidence to work with.
                </div>
              )}

              <button
                type="button"
                className="reality-primary-button"
                disabled={!pageReady() || saving}
                onClick={goNext}
              >
                {saving
                  ? "Saving..."
                  : "Continue → Context"}
              </button>

            </article>
          )}

          {/* =================================================
              PAGE 3
          ================================================= */}

          {currentSection.id === "context" && (
            <article className="reality-card">

              <span className="reality-card-label">
                03 · CONTEXT
              </span>

              <h2>
                Ask what might be missing.
              </h2>

              <p className="reality-lead">
                Information can be technically real
                and still be misleading when its
                context is removed.
              </p>

              <div className="reality-context-comparison">

                <div className="context-box">
                  <span>
                    WITHOUT CONTEXT
                  </span>

                  <strong>
                    "This person said this!"
                  </strong>

                  <p>
                    But when? Why? What happened
                    before and after?
                  </p>
                </div>

                <div className="context-arrow">
                  →
                </div>

                <div className="context-box strong">
                  <span>
                    WITH CONTEXT
                  </span>

                  <strong>
                    Full statement + situation
                  </strong>

                  <p>
                    You can understand what the
                    information actually means.
                  </p>
                </div>

              </div>

              <div className="reality-explanation">

                <div className="reality-icon">
                  🧩
                </div>

                <div>
                  <h3>
                    Context completes the picture.
                  </h3>

                  <p>
                    A cropped image, shortened quote,
                    old video or isolated statistic
                    can create a very different
                    impression from the complete
                    information.
                  </p>
                </div>

              </div>

              <h3>
                Which approach is better?
              </h3>

              <div className="reality-choice-grid">

                <button
                  type="button"
                  className={
                    contextAnswer === "headline"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setContextAnswer("headline")
                  }
                >
                  Judge only from the headline
                </button>

                <button
                  type="button"
                  className={
                    contextAnswer === "context"
                      ? "selected correct"
                      : ""
                  }
                  onClick={() =>
                    setContextAnswer("context")
                  }
                >
                  Look for the surrounding context
                </button>

              </div>

              {contextAnswer === "context" && (
                <div className="reality-success">
                  ✓ Correct. Context helps you
                  understand what the information
                  actually represents.
                </div>
              )}

              {contextAnswer === "headline" && (
                <div className="reality-warning">
                  A headline is only one part of
                  the information. Look deeper.
                </div>
              )}

              <button
                type="button"
                className="reality-primary-button"
                disabled={!pageReady() || saving}
                onClick={goNext}
              >
                {saving
                  ? "Saving..."
                  : "Continue → Evidence"}
              </button>

            </article>
          )}

          {/* =================================================
              PAGE 4
          ================================================= */}

          {currentSection.id === "evidence" && (
            <article className="reality-card">

              <span className="reality-card-label">
                04 · EVIDENCE
              </span>

              <h2>
                Don't just ask "Is it true?"
                Ask "What supports it?"
              </h2>

              <p className="reality-lead">
                Good reality checking is based on
                evidence rather than confidence.
              </p>

              <div className="reality-evidence-grid">

                <div>
                  <span>💬</span>
                  <strong>
                    Claim
                  </strong>
                  <p>
                    Someone says something happened.
                  </p>
                </div>

                <div>
                  <span>🔎</span>
                  <strong>
                    Evidence
                  </strong>
                  <p>
                    Look for information that supports
                    or challenges the claim.
                  </p>
                </div>

                <div>
                  <span>🧠</span>
                  <strong>
                    Reasoning
                  </strong>
                  <p>
                    Decide what the evidence actually
                    tells you.
                  </p>
                </div>

              </div>

              <div className="reality-highlight">
                <strong>
                  Confidence is not evidence.
                </strong>

                <p>
                  A person can sound completely certain
                  and still be wrong.
                </p>
              </div>

              <h3>
                Which approach is strongest?
              </h3>

              <div className="reality-choice-grid">

                <button
                  type="button"
                  className={
                    evidenceAnswer === "confidence"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setEvidenceAnswer("confidence")
                  }
                >
                  Trust whoever sounds most confident
                </button>

                <button
                  type="button"
                  className={
                    evidenceAnswer === "evidence"
                      ? "selected correct"
                      : ""
                  }
                  onClick={() =>
                    setEvidenceAnswer("evidence")
                  }
                >
                  Look for supporting evidence
                </button>

              </div>

              {evidenceAnswer === "evidence" && (
                <div className="reality-success">
                  ✓ Correct. Evidence gives you
                  something you can examine rather
                  than simply trusting confidence.
                </div>
              )}

              {evidenceAnswer === "confidence" && (
                <div className="reality-warning">
                  Confidence does not guarantee
                  accuracy. Look for evidence.
                </div>
              )}

              <button
                type="button"
                className="reality-primary-button"
                disabled={!pageReady() || saving}
                onClick={goNext}
              >
                {saving
                  ? "Saving..."
                  : "Continue → Manipulation"}
              </button>

            </article>
          )}

          {/* =================================================
              PAGE 5
          ================================================= */}

          {currentSection.id === "manipulation" && (
            <article className="reality-card">

              <span className="reality-card-label">
                05 · MANIPULATION
              </span>

              <h2>
                Real does not always mean
                reliable.
              </h2>

              <p className="reality-lead">
                A genuine photo or video can still
                be edited, cropped, rearranged or
                presented in a misleading way.
              </p>

              <div className="reality-manipulation-list">

                <div>
                  <span>✂️</span>
                  <div>
                    <strong>
                      Cropping
                    </strong>
                    <p>
                      Removing surrounding information
                      can change what a scene appears to
                      mean.
                    </p>
                  </div>
                </div>

                <div>
                  <span>🎞️</span>
                  <div>
                    <strong>
                      Editing
                    </strong>
                    <p>
                      Parts of a recording can be removed
                      or rearranged.
                    </p>
                  </div>
                </div>

                <div>
                  <span>🕰️</span>
                  <div>
                    <strong>
                      Old content
                    </strong>
                    <p>
                      Genuine content can be presented
                      as though it happened recently.
                    </p>
                  </div>
                </div>

              </div>

              <div className="reality-highlight">
                <strong>
                  Don't only ask "Is this real?"
                </strong>

                <p>
                  Also ask "Is this being presented
                  accurately?"
                </p>
              </div>

              <h3>
                What should you check?
              </h3>

              <div className="reality-choice-grid">

                <button
                  type="button"
                  className={
                    manipulationAnswer === "appearance"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setManipulationAnswer("appearance")
                  }
                >
                  Only whether it looks real
                </button>

                <button
                  type="button"
                  className={
                    manipulationAnswer === "manipulation"
                      ? "selected correct"
                      : ""
                  }
                  onClick={() =>
                    setManipulationAnswer(
                      "manipulation"
                    )
                  }
                >
                  Source, context and how it is presented
                </button>

              </div>

              {manipulationAnswer ===
                "manipulation" && (
                <div className="reality-success">
                  ✓ Correct. Authenticity and context
                  both matter.
                </div>
              )}

              {manipulationAnswer === "appearance" && (
                <div className="reality-warning">
                  Something can look genuine and
                  still be misleading.
                </div>
              )}

              <button
                type="button"
                className="reality-primary-button"
                disabled={!pageReady() || saving}
                onClick={goNext}
              >
                {saving
                  ? "Saving..."
                  : "Continue → AI Content"}
              </button>

            </article>
          )}

          {/* =================================================
              PAGE 6
          ================================================= */}

          {currentSection.id === "ai-content" && (
            <article className="reality-card">

              <span className="reality-card-label">
                06 · AI CONTENT
              </span>

              <h2>
                AI-generated content can look
                convincing.
              </h2>

              <p className="reality-lead">
                Images, videos, voices and text can
                now be generated or modified using AI.
              </p>

              <div className="reality-ai-grid">

                <div>
                  <span>🖼️</span>
                  <strong>
                    Images
                  </strong>
                  <p>
                    Synthetic or edited images can
                    appear realistic.
                  </p>
                </div>

                <div>
                  <span>🎙️</span>
                  <strong>
                    Voices
                  </strong>
                  <p>
                    Audio can be generated or altered.
                  </p>
                </div>

                <div>
                  <span>🎥</span>
                  <strong>
                    Video
                  </strong>
                  <p>
                    Video can be manipulated or generated.
                  </p>
                </div>

                <div>
                  <span>✍️</span>
                  <strong>
                    Text
                  </strong>
                  <p>
                    AI can produce convincing written
                    content.
                  </p>
                </div>

              </div>

              <div className="reality-explanation">

                <div className="reality-icon">
                  🤔
                </div>

                <div>
                  <h3>
                    Don't rely on appearance alone.
                  </h3>

                  <p>
                    The fact that something looks,
                    sounds or reads convincingly does
                    not automatically prove that it is
                    accurate.
                  </p>
                </div>

              </div>

              <h3>
                What is the safest approach?
              </h3>

              <div className="reality-choice-grid">

                <button
                  type="button"
                  className={
                    aiContentAnswer === "trust"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setAiContentAnswer("trust")
                  }
                >
                  Trust it because it looks convincing
                </button>

                <button
                  type="button"
                  className={
                    aiContentAnswer === "careful"
                      ? "selected correct"
                      : ""
                  }
                  onClick={() =>
                    setAiContentAnswer("careful")
                  }
                >
                  Check the source and supporting evidence
                </button>

              </div>

              {aiContentAnswer === "careful" && (
                <div className="reality-success">
                  ✓ Correct. Convincing appearance
                  is not enough evidence.
                </div>
              )}

              {aiContentAnswer === "trust" && (
                <div className="reality-warning">
                  Something can be convincing without
                  being accurate.
                </div>
              )}

              <button
                type="button"
                className="reality-primary-button"
                disabled={!pageReady() || saving}
                onClick={goNext}
              >
                {saving
                  ? "Saving..."
                  : "Continue → Compare"}
              </button>

            </article>
          )}

          {/* =================================================
              PAGE 7
          ================================================= */}

          {currentSection.id === "compare" && (
            <article className="reality-card">

              <span className="reality-card-label">
                07 · COMPARE
              </span>

              <h2>
                One source is rarely the whole
                picture.
              </h2>

              <p className="reality-lead">
                When something matters, compare
                information instead of stopping at
                the first answer.
              </p>

              <div className="reality-compare-flow">

                <div>
                  <span>01</span>
                  <strong>
                    Find the claim
                  </strong>
                  <p>
                    What exactly is being said?
                  </p>
                </div>

                <div className="reality-flow-arrow">
                  →
                </div>

                <div>
                  <span>02</span>
                  <strong>
                    Find other sources
                  </strong>
                  <p>
                    What do independent sources say?
                  </p>
                </div>

                <div className="reality-flow-arrow">
                  →
                </div>

                <div>
                  <span>03</span>
                  <strong>
                    Compare evidence
                  </strong>
                  <p>
                    Where does the evidence agree
                    or disagree?
                  </p>
                </div>

              </div>

              <div className="reality-highlight">
                <strong>
                  Compare, don't just collect.
                </strong>

                <p>
                  Seeing many sources is useful only
                  when you actually examine what they
                  are saying and where their information
                  comes from.
                </p>
              </div>

              <h3>
                What is the strongest habit?
              </h3>

              <div className="reality-choice-grid">

                <button
                  type="button"
                  className={
                    compareAnswer === "first"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setCompareAnswer("first")
                  }
                >
                  Trust the first result
                </button>

                <button
                  type="button"
                  className={
                    compareAnswer === "compare"
                      ? "selected correct"
                      : ""
                  }
                  onClick={() =>
                    setCompareAnswer("compare")
                  }
                >
                  Compare reliable sources
                </button>

              </div>

              {compareAnswer === "compare" && (
                <div className="reality-success">
                  ✓ Correct. Comparing information
                  helps you make a better-supported
                  judgment.
                </div>
              )}

              {compareAnswer === "first" && (
                <div className="reality-warning">
                  The first result is not automatically
                  the best or most accurate source.
                </div>
              )}

              <button
                type="button"
                className="reality-primary-button"
                disabled={!pageReady() || saving}
                onClick={goNext}
              >
                {saving
                  ? "Saving..."
                  : "Continue → Final Challenge"}
              </button>

            </article>
          )}

          {/* =================================================
              PAGE 8
          ================================================= */}

          {currentSection.id === "decide" && (
            <article className="reality-card">

              <span className="reality-card-label">
                08 · DECIDE
              </span>

              <h2>
                Act on evidence.
              </h2>

              <p className="reality-lead">
                You have learned the Reality Check
                loop:
              </p>

              <div className="reality-final-loop">

                <div>
                  <span>01</span>
                  <strong>
                    PAUSE
                  </strong>
                  <p>
                    Don't react immediately.
                  </p>
                </div>

                <div>
                  <span>02</span>
                  <strong>
                    VERIFY
                  </strong>
                  <p>
                    Check where information came from.
                  </p>
                </div>

                <div>
                  <span>03</span>
                  <strong>
                    FIND EVIDENCE
                  </strong>
                  <p>
                    Look for support for the claim.
                  </p>
                </div>

                <div>
                  <span>04</span>
                  <strong>
                    CHECK CONTEXT
                  </strong>
                  <p>
                    Look for what may be missing.
                  </p>
                </div>

                <div>
                  <span>05</span>
                  <strong>
                    COMPARE
                  </strong>
                  <p>
                    Check other reliable information.
                  </p>
                </div>

                <div>
                  <span>06</span>
                  <strong>
                    DECIDE
                  </strong>
                  <p>
                    Act according to the evidence.
                  </p>
                </div>

              </div>

              {!finalSubmitted && (
                <>
                  <div className="reality-final-heading">
                    <h3>
                      Final Reality Check
                    </h3>

                    <p>
                      Answer all five questions.
                      You need at least 4/5 to
                      complete this area.
                    </p>
                  </div>

                  <div className="reality-final-questions">

                    {FINAL_QUESTIONS.map(
                      (question, index) => {

                        const selected =
                          finalAnswers[index];

                        return (
                          <div
                            key={question.question}
                            className="reality-final-question"
                          >

                            <div className="reality-question-title">
                              <span>
                                {index + 1}
                              </span>

                              <h4>
                                {question.question}
                              </h4>
                            </div>

                            <div className="reality-final-options">

                              {question.options.map(
                                (
                                  option,
                                  optionIndex
                                ) => (
                                  <button
                                    type="button"
                                    key={option}
                                    className={
                                      selected ===
                                      optionIndex
                                        ? "selected"
                                        : ""
                                    }
                                    onClick={() =>
                                      setFinalAnswers(
                                        (previous) => {
                                          const next =
                                            [...previous];

                                          next[index] =
                                            optionIndex;

                                          return next;
                                        }
                                      )
                                    }
                                  >
                                    <span>
                                      {String.fromCharCode(
                                        65 +
                                          optionIndex
                                      )}
                                    </span>

                                    <strong>
                                      {option}
                                    </strong>
                                  </button>
                                )
                              )}

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                  <button
                    type="button"
                    className="reality-primary-button"
                    disabled={
                      finalAnswers.some(
                        (answer) => answer === -1
                      )
                    }
                    onClick={
                      submitFinalChallenge
                    }
                  >
                    Check My Answers →
                  </button>
                </>
              )}

              {finalSubmitted && (
                <div className="reality-final-result">

                  <div
                    className={
                      finalPassed
                        ? "reality-result-icon success"
                        : "reality-result-icon fail"
                    }
                  >
                    {finalPassed
                      ? "✓"
                      : "↻"}
                  </div>

                  <h3>
                    {finalPassed
                      ? `Excellent! ${finalScore}/5`
                      : `Not quite yet — ${finalScore}/5`}
                  </h3>

                  <p>
                    You scored{" "}
                    {finalPercentage}%.
                  </p>

                  <div className="reality-explanations">

                    {FINAL_QUESTIONS.map(
                      (question, index) => {

                        const correct =
                          finalAnswers[index] ===
                          question.answer;

                        return (
                          <div
                            key={question.question}
                            className={
                              correct
                                ? "correct"
                                : "wrong"
                            }
                          >
                            <strong>
                              {correct
                                ? "✓ Correct"
                                : "✕ Review"}
                            </strong>

                            <p>
                              {question.explanation}
                            </p>
                          </div>
                        );
                      }
                    )}

                  </div>

                  {!finalPassed ? (
                    <button
                      type="button"
                      className="reality-secondary-button"
                      onClick={
                        retryFinalChallenge
                      }
                    >
                      Try Again ↻
                    </button>
                  ) : (
                    <>
                      <div className="reality-completion-card">

                        <div>
                          ✓
                        </div>

                        <section>
                          <strong>
                            Reality Check complete!
                          </strong>

                          <p>
                            You now have a practical
                            framework for pausing,
                            verifying, checking context,
                            finding evidence and making
                            informed decisions.
                          </p>
                        </section>

                      </div>

                      {!completed && (
                        <button
                          type="button"
                          className="reality-primary-button"
                          disabled={saving}
                          onClick={
                            completeRealityCheck
                          }
                        >
                          {saving
                            ? "Saving completion..."
                            : "Complete Reality Check ✓"}
                        </button>
                      )}

                      {completed && (
                        <button
                          type="button"
                          className="reality-secondary-button"
                          onClick={() =>
                            navigate("/learn")
                          }
                        >
                          Return to Learning Path →
                        </button>
                      )}
                    </>
                  )}

                </div>
              )}

            </article>
          )}

          {/* =================================================
              GLOBAL PREVIOUS NAVIGATION
          ================================================= */}

          <div className="reality-page-navigation">
            <button
              type="button"
              className="reality-secondary-button"
              onClick={goPrevious}
              disabled={currentPage <= 1 || saving}
            >
              ← Previous
            </button>

            <div className="reality-page-position">
              <span>
                Page {currentPage} of {SECTIONS.length}
              </span>
              <small>
                {completedSections} of {SECTIONS.length} completed
              </small>
            </div>

            <div className="reality-page-position reality-page-position-right">
              <span>
                {currentSection.shortTitle}
              </span>
            </div>
          </div>

        </section>

      </div>

    </main>
  );
}

export default RealityCheck;