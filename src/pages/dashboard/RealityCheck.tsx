import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useRealityCheckProgress,
} from "../../hooks/useRealityCheckProgress.ts";
import "./Reality.css";

type SectionId =
  | "pause"
  | "verify"
  | "context"
  | "evidence"
  | "manipulation"
  | "ai-content"
  | "compare"
  | "decide";

type Section = {
  id: SectionId;
  number: string;
  title: string;
  shortTitle: string;
  icon: string;
};

type Choice = {
  value: string;
  label: string;
};

type FinalQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const REALITY_CHECK_ID = 2;
const TOTAL_SECTIONS = 8;

const SECTIONS: Section[] = [
  { id: "pause", number: "01", title: "Pause before reacting", shortTitle: "Pause", icon: "⏸️" },
  { id: "verify", number: "02", title: "Verify the source", shortTitle: "Verify", icon: "🔎" },
  { id: "context", number: "03", title: "Check the context", shortTitle: "Context", icon: "🧩" },
  { id: "evidence", number: "04", title: "Find the evidence", shortTitle: "Evidence", icon: "📌" },
  { id: "manipulation", number: "05", title: "Spot manipulation", shortTitle: "Manipulation", icon: "✂️" },
  { id: "ai-content", number: "06", title: "AI-generated content", shortTitle: "AI Content", icon: "🤖" },
  { id: "compare", number: "07", title: "Compare information", shortTitle: "Compare", icon: "⚖️" },
  { id: "decide", number: "08", title: "Decide using evidence", shortTitle: "Decide", icon: "🧠" },
];

const PAGE_CHOICES: Record<Exclude<SectionId, "decide">, Choice[]> = {
  pause: [
    { value: "share", label: "Share it immediately" },
    { value: "pause", label: "Pause and look carefully" },
  ],
  verify: [
    { value: "anonymous", label: "Trust an anonymous post with no evidence" },
    { value: "verify", label: "Check a source with information you can verify" },
  ],
  context: [
    { value: "headline", label: "Judge only from the headline" },
    { value: "context", label: "Look for the surrounding context" },
  ],
  evidence: [
    { value: "confidence", label: "Trust whoever sounds most confident" },
    { value: "evidence", label: "Look for supporting evidence" },
  ],
  manipulation: [
    { value: "appearance", label: "Only check whether it looks real" },
    { value: "manipulation", label: "Check source, context and presentation" },
  ],
  "ai-content": [
    { value: "trust", label: "Trust it because it looks convincing" },
    { value: "careful", label: "Check the source and supporting evidence" },
  ],
  compare: [
    { value: "first", label: "Trust the first result" },
    { value: "compare", label: "Compare reliable sources" },
  ],
};

const CORRECT_PAGE_ANSWERS: Record<Exclude<SectionId, "decide">, string> = {
  pause: "pause",
  verify: "verify",
  context: "context",
  evidence: "evidence",
  manipulation: "manipulation",
  "ai-content": "careful",
  compare: "compare",
};

const PAGE_CONTENT: Record<
  Exclude<SectionId, "decide">,
  {
    label: string;
    title: string;
    lead: string;
    icon: string;
    principle: string;
    points: { icon: string; title: string; text: string }[];
    practice: {
      label: string;
      scenario: string;
      action: string;
    };
    question: string;
    correctMessage: string;
    wrongMessage: string;
    next: string;
  }
> = {
  pause: {
    label: "01 · PAUSE",
    title: "Don't react yet.",
    lead: "The first skill of digital reality literacy is surprisingly simple: pause.",
    icon: "⏸️",
    principle: "A dramatic headline, shocking image or emotional message can make you react immediately. Give yourself a moment before you like, share, comment or believe it.",
    points: [
      { icon: "01", title: "Notice the reaction", text: "Strong emotion can make a claim feel urgent before you have checked it." },
      { icon: "02", title: "Create space", text: "Give yourself a few seconds before liking, forwarding, commenting or believing." },
      { icon: "03", title: "Name the claim", text: "Separate what you saw from what the post is asking you to believe." },
    ],
    practice: {
      label: "TRY IT IN REAL LIFE",
      scenario: "A post says: “BREAKING — everyone is sharing this right now!”",
      action: "Do not let popularity create urgency. Pause, identify the exact claim, and begin checking it.",
    },
    question: "What should you do first?",
    correctMessage: "Correct. Pausing gives you space to think before reacting.",
    wrongMessage: "Not quite. A strong emotional reaction should not replace checking.",
    next: "Continue → Verify",
  },
  verify: {
    label: "02 · VERIFY",
    title: "Find out where the information came from.",
    lead: "Before trusting a claim, examine its source.",
    icon: "🔎",
    principle: "Ask: “Who is saying this?” Identify the person, organisation or publication behind the information and check whether the claim can actually be verified.",
    points: [
      { icon: "01", title: "Identify the source", text: "Find the person, organisation or publication responsible for the claim." },
      { icon: "02", title: "Check the date", text: "Confirm when it was published and whether it still applies." },
      { icon: "03", title: "Trace the evidence", text: "Follow links, documents, data or original reporting instead of trusting a screenshot." },
    ],
    practice: {
      label: "SOURCE CHECK",
      scenario: "Two posts make the same claim. One is anonymous; the other links to an identifiable report with supporting evidence.",
      action: "Start with the source you can identify and independently verify. A confident tone is not proof.",
    },
    question: "Which source gives you stronger evidence?",
    correctMessage: "Correct. A source with verifiable information gives you a stronger basis for judgment.",
    wrongMessage: "Look again. An unsupported anonymous claim gives you less evidence to work with.",
    next: "Continue → Context",
  },
  context: {
    label: "03 · CONTEXT",
    title: "Ask what might be missing.",
    lead: "Information can be technically real and still be misleading when its context is removed.",
    icon: "🧩",
    principle: "A cropped image, shortened quote, old video or isolated statistic can create a very different impression from the complete information.",
    points: [
      { icon: "01", title: "Look beyond the crop", text: "Check what happened before and after the visible part of an image, video or quote." },
      { icon: "02", title: "Check when", text: "Old information can be reposted as if it happened today." },
      { icon: "03", title: "Complete the picture", text: "Look for the original post, full statement, location and surrounding facts." },
    ],
    practice: {
      label: "CONTEXT CHECK",
      scenario: "A video shows a crowded street with the caption “This happened today.”",
      action: "Check the original upload, date, location and full video before deciding what the clip proves.",
    },
    question: "Which approach is better?",
    correctMessage: "Correct. Context helps you understand what the information actually represents.",
    wrongMessage: "A headline or isolated quote is only one part of the information. Look deeper.",
    next: "Continue → Evidence",
  },
  evidence: {
    label: "04 · EVIDENCE",
    title: "Don't just ask “Is it true?” Ask “What supports it?”",
    lead: "Good reality checking is based on evidence rather than confidence.",
    icon: "📌",
    principle: "Confidence is not evidence. A person can sound completely certain and still be wrong.",
    points: [
      { icon: "01", title: "Separate claim from proof", text: "A statement tells you what someone believes happened; it does not prove that it happened." },
      { icon: "02", title: "Find supporting evidence", text: "Look for records, data, original sources or independent reporting." },
      { icon: "03", title: "Test the conclusion", text: "Ask whether the evidence really supports the strength of the claim." },
    ],
    practice: {
      label: "EVIDENCE TEST",
      scenario: "A creator says, “Experts agree,” but gives no names, sources or data.",
      action: "Treat the statement as a claim. Ask which experts, what evidence and where the original information can be checked.",
    },
    question: "Which approach is strongest?",
    correctMessage: "Correct. Evidence gives you something you can examine instead of simply trusting confidence.",
    wrongMessage: "Confidence does not guarantee accuracy. Look for evidence.",
    next: "Continue → Manipulation",
  },
  manipulation: {
    label: "05 · MANIPULATION",
    title: "Real does not always mean reliable.",
    lead: "A genuine photo or video can still be edited, cropped, rearranged or presented in a misleading way.",
    icon: "✂️",
    principle: "Don't only ask “Is this real?” Also ask “Is this being presented accurately?”",
    points: [
      { icon: "01", title: "Cropping", text: "Removing surrounding information can change what a scene appears to mean." },
      { icon: "02", title: "Editing", text: "Cuts, rearrangement, captions or selective clips can change the impression." },
      { icon: "03", title: "Presentation", text: "A genuine piece of content can still be framed to imply something it does not establish." },
    ],
    practice: {
      label: "MANIPULATION CHECK",
      scenario: "A genuine photograph is posted with a caption claiming it proves a completely different event.",
      action: "Separate authenticity from meaning. Verify when, where and why the image was originally created.",
    },
    question: "What should you check?",
    correctMessage: "Correct. Authenticity and context both matter.",
    wrongMessage: "Something can look genuine and still be misleading.",
    next: "Continue → AI Content",
  },
  "ai-content": {
    label: "06 · AI CONTENT",
    title: "AI-generated content can look convincing.",
    lead: "Images, videos, voices and text can now be generated or modified using AI.",
    icon: "🤖",
    principle: "The fact that something looks, sounds or reads convincingly does not automatically prove that it is accurate.",
    points: [
      { icon: "01", title: "Images", text: "Synthetic or edited images can appear realistic and detailed." },
      { icon: "02", title: "Voices", text: "Audio can be generated, cloned or altered." },
      { icon: "03", title: "Video", text: "Video can be manipulated, composited or generated." },
      { icon: "04", title: "Text", text: "AI can produce fluent content without guaranteeing that its claims are correct." },
    ],
    practice: {
      label: "AI CONTENT CHECK",
      scenario: "A realistic AI-generated image is being shared as proof of a breaking event.",
      action: "Do not use realism as verification. Check the source, original publication, independent reporting and supporting evidence.",
    },
    question: "What is the safest approach?",
    correctMessage: "Correct. Convincing appearance is not enough evidence.",
    wrongMessage: "Something can be convincing without being accurate.",
    next: "Continue → Compare",
  },
  compare: {
    label: "07 · COMPARE",
    title: "One source is rarely the whole picture.",
    lead: "When something matters, compare information instead of stopping at the first answer.",
    icon: "⚖️",
    principle: "Compare, don't just collect. Examine what different sources say and where their evidence comes from.",
    points: [
      { icon: "01", title: "Find the claim", text: "Reduce the post to one precise statement you can actually check." },
      { icon: "02", title: "Find other sources", text: "Look for independent, reliable sources rather than copies of the same post." },
      { icon: "03", title: "Compare evidence", text: "Notice where sources agree, disagree or rely on the same original claim." },
    ],
    practice: {
      label: "COMPARE BEFORE DECIDING",
      scenario: "The first search result supports a claim, but several independent sources give a different picture.",
      action: "Do not stop at the first result. Compare source quality, evidence, dates and whether the reports are actually independent.",
    },
    question: "What is the strongest habit?",
    correctMessage: "Correct. Comparing information helps you make a better-supported judgment.",
    wrongMessage: "The first result is not automatically the best or most accurate source.",
    next: "Continue → Final Challenge",
  },
};

const FINAL_QUESTIONS: FinalQuestion[] = [
  {
    question: "You see a surprising post online. What should you do first?",
    options: ["Share it immediately", "Believe it because many people liked it", "Pause and look at the information carefully", "Assume it is false"],
    answer: 2,
    explanation: "A strong reality-check habit begins with a pause. Don't react before understanding what you are seeing.",
  },
  {
    question: "Which source gives you stronger evidence?",
    options: ["An anonymous post with no evidence", "A source that provides verifiable information", "A message forwarded by a friend", "A dramatic headline"],
    answer: 1,
    explanation: "A source that provides information you can verify gives you a stronger basis for making a decision.",
  },
  {
    question: "Why does context matter?",
    options: ["It makes every claim true", "It helps you understand what happened and what information may be missing", "It guarantees that a post is genuine", "It means you never need another source"],
    answer: 1,
    explanation: "Context can change how information should be understood. A cropped image or sentence may not tell the complete story.",
  },
  {
    question: "Which is the strongest approach when checking an important claim?",
    options: ["Trust the first result you see", "Check multiple reliable sources and compare the evidence", "Trust the most emotional explanation", "Choose the explanation you already agree with"],
    answer: 1,
    explanation: "Comparing reliable sources reduces the chance of making a decision based on incomplete or misleading information.",
  },
  {
    question: "What is the best response when you cannot verify a claim?",
    options: ["Share it anyway", "Treat it as definitely true", "Treat it cautiously and avoid presenting it as established fact", "Add more dramatic details"],
    answer: 2,
    explanation: "When evidence is insufficient, uncertainty is the responsible position.",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function RealityCheck() {
  const navigate = useNavigate();

  const {
    progress,
    loading,
    saving,
    error,
    updateProgress,
    markComplete,
    reload,
  } = useRealityCheckProgress(REALITY_CHECK_ID, TOTAL_SECTIONS);

  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalAnswers, setFinalAnswers] = useState<number[]>(
    () => Array(FINAL_QUESTIONS.length).fill(-1),
  );
  const [finalSubmitted, setFinalSubmitted] = useState(false);
  const [finalPassed, setFinalPassed] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(false);

  const completedSections = clamp(
    Number(progress?.completedQuestions ?? 0),
    0,
    TOTAL_SECTIONS,
  );

  const completed = localCompleted || progress?.completed === true;

  const furthestUnlockedPage = completed
    ? TOTAL_SECTIONS
    : clamp(completedSections + 1, 1, TOTAL_SECTIONS);

  const currentSection = SECTIONS[currentPage - 1] ?? SECTIONS[0];

  const progressPercent = Math.round(
    (completedSections / TOTAL_SECTIONS) * 100,
  );

  const finalScore = useMemo(
    () =>
      FINAL_QUESTIONS.reduce(
        (score, question, index) =>
          score + (finalAnswers[index] === question.answer ? 1 : 0),
        0,
      ),
    [finalAnswers],
  );

  const finalPercentage = Math.round(
    (finalScore / FINAL_QUESTIONS.length) * 100,
  );

  const scrollTop = useCallback(() => {
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /*
   * The database is the source of truth.
   * We store:
   *   currentQuestion = page to resume
   *   completedQuestions = number of completed pages
   *   completed = final Reality Check completion
   */
  useEffect(() => {
    if (loading || !progress) return;

    const safeCompleted = clamp(
      Number(progress.completedQuestions ?? 0),
      0,
      TOTAL_SECTIONS,
    );

    const safeCurrent = clamp(
      Number(progress.currentQuestion ?? 1),
      1,
      TOTAL_SECTIONS,
    );

    let resume = safeCurrent;

    if (progress.completed || safeCompleted >= TOTAL_SECTIONS) {
      resume = TOTAL_SECTIONS;
      setLocalCompleted(true);
      setFinalPassed(true);
      setFinalSubmitted(true);
    } else if (safeCurrent <= safeCompleted) {
      /*
       * Compatibility with older rows where currentQuestion
       * represented the last completed page.
       */
      resume = clamp(safeCompleted + 1, 1, TOTAL_SECTIONS);
    }

    setCurrentPage(resume);
  }, [loading, progress]);

  /*
   * Refreshing/re-entering the browser tab always reloads the
   * authoritative Supabase progress. This prevents stale local
   * state from overwriting the saved record.
   */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void reload();
      }
    };

    const handleFocus = () => {
      void reload();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    globalThis.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      globalThis.removeEventListener("focus", handleFocus);
    };
  }, [reload]);

  const currentAnswer = answers[currentSection.id] ?? "";

  const currentPageReady =
    currentSection.id === "decide"
      ? finalPassed
      : currentAnswer === CORRECT_PAGE_ANSWERS[currentSection.id];

  const selectAnswer = (value: string) => {
    if (currentSection.id === "decide") return;

    setAnswers((previous) => ({
      ...previous,
      [currentSection.id]: value,
    }));
  };

  const openPage = (page: number) => {
    if (page < 1 || page > TOTAL_SECTIONS) return;
    if (page > furthestUnlockedPage) return;

    setCurrentPage(page);
    scrollTop();
  };

  const savePageAndMove = async () => {
    if (saving || !currentPageReady) return;

    const nextPage = clamp(currentPage + 1, 1, TOTAL_SECTIONS);
    const nextCompleted = clamp(
      Math.max(completedSections, currentPage),
      0,
      TOTAL_SECTIONS,
    );

    const success = await updateProgress(
      nextPage,
      nextCompleted,
      progress?.totalScore ?? 0,
    );

    if (!success) return;

    setCurrentPage(nextPage);
    scrollTop();
  };

  const goPrevious = () => {
    if (saving || currentPage <= 1) return;
    setCurrentPage((page) => clamp(page - 1, 1, TOTAL_SECTIONS));
    scrollTop();
  };

  const submitFinalChallenge = () => {
    if (saving) return;

    const unanswered = finalAnswers.some((answer) => answer === -1);
    if (unanswered) return;

    setFinalSubmitted(true);
    setFinalPassed(finalScore >= 4);
  };

  const retryFinalChallenge = () => {
    setFinalAnswers(Array(FINAL_QUESTIONS.length).fill(-1));
    setFinalSubmitted(false);
    setFinalPassed(false);
  };

  const finishRealityCheck = async () => {
    if (saving || !finalPassed || completed) return;

    const success = await markComplete(finalScore);

    if (!success) return;

    setLocalCompleted(true);
    setFinalPassed(true);
    setFinalSubmitted(true);
    setCurrentPage(TOTAL_SECTIONS);
    scrollTop();
  };

  if (loading) {
    return (
      <main className="reality-page reality-loading-page">
        <div className="reality-loading-card">
          <div className="reality-spinner" />
          <h1>Restoring your Reality Check</h1>
          <p>Your saved progress is being loaded from CURIO.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="reality-page">
      <header className="reality-header">
        <div className="reality-brand">
          <div className="reality-logo">🧠</div>

          <div>
            <strong>CURIO</strong>
            <span>Reality Check · Digital Reality Literacy</span>
          </div>
        </div>

        <div className="reality-header-progress">
          <div className="reality-progress-meta">
            <span>AI THINKING SKILL</span>
            <strong>{progressPercent}%</strong>
          </div>

          <div className="reality-progress-track">
            <div
              className="reality-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {error && (
        <div className="reality-error">
          <strong>Progress could not be saved.</strong>
          <span>Check your connection and try the action again.</span>
        </div>
      )}

      <div className="reality-shell">
        <aside className="reality-sidebar">
          <div className="reality-sidebar-title">YOUR JOURNEY</div>

          <div className="reality-nav">
            {SECTIONS.map((section, index) => {
              const page = index + 1;
              const unlocked = page <= furthestUnlockedPage;
              const done = completed || page <= completedSections;
              const active = page === currentPage;

              return (
                <button
                  type="button"
                  key={section.id}
                  disabled={!unlocked}
                  onClick={() => openPage(page)}
                  className={[
                    "reality-nav-item",
                    active ? "active" : "",
                    done ? "completed" : "",
                    !unlocked ? "locked" : "",
                  ].join(" ")}
                >
                  <span className="reality-nav-number">
                    {done ? "✓" : !unlocked ? "🔒" : section.number}
                  </span>

                  <span className="reality-nav-copy">
                    <strong>{section.shortTitle}</strong>
                    <small>{section.title}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="reality-sidebar-tip">
            <span>🛡️</span>
            <strong>Think before you share.</strong>
            <p>
              The safest reality-check habit is to pause when something
              matters, then verify before acting.
            </p>
          </div>
        </aside>

        <section className="reality-main">
          <section className="reality-hero">
            <span className="reality-kicker">🛡 DIGITAL REALITY LITERACY</span>

            <h1>
              Seeing is no
              <br />
              longer <em>enough.</em>
            </h1>

            <p>
              AI can generate convincing images, videos, voices and text.
              Human-created content can also be edited, cropped or shown
              without its original context.
            </p>

            <div className="reality-hero-principle">
              <span>🧠</span>
              <div>
                <strong>Reality Check is not about distrusting everything.</strong>
                <p>
                  It is about learning how to pause, verify, find evidence
                  and make better decisions.
                </p>
              </div>
            </div>

            <div className="reality-hero-method">
              {[
                ["01", "PAUSE", "Slow the reaction."],
                ["02", "VERIFY", "Check the source."],
                ["03", "CONTEXT", "Find what is missing."],
                ["04", "EVIDENCE", "Test the claim."],
                ["05", "COMPARE", "Check independent sources."],
                ["06", "DECIDE", "Act on what you know."],
              ].map(([number, title, text]) => (
                <div key={number}>
                  <span>{number}</span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </div>
              ))}
            </div>
          </section>

          <div className="reality-step-bar">
            <div>
              <span>STEP {currentSection.number}</span>
              <strong>{currentSection.title}</strong>
            </div>
            <span>{completedSections} / {TOTAL_SECTIONS} completed</span>
          </div>

          {currentSection.id !== "decide" ? (
            <RealityLearningPage
              section={currentSection}
              content={PAGE_CONTENT[currentSection.id]}
              choices={PAGE_CHOICES[currentSection.id]}
              answer={currentAnswer}
              onAnswer={selectAnswer}
              onContinue={savePageAndMove}
              saving={saving}
            />
          ) : (
            <FinalChallenge
              answers={finalAnswers}
              submitted={finalSubmitted}
              passed={finalPassed}
              score={finalScore}
              percentage={finalPercentage}
              saving={saving}
              completed={completed}
              onAnswer={(questionIndex, optionIndex) => {
                if (finalSubmitted) return;

                setFinalAnswers((previous) => {
                  const next = [...previous];
                  next[questionIndex] = optionIndex;
                  return next;
                });
              }}
              onSubmit={submitFinalChallenge}
              onRetry={retryFinalChallenge}
              onComplete={finishRealityCheck}
              onLearn={() => navigate("/learn")}
            />
          )}

          <div className="reality-bottom-navigation">
            <button
              type="button"
              className="reality-secondary-button"
              disabled={currentPage === 1 || saving}
              onClick={goPrevious}
            >
              ← Previous
            </button>

            <div className="reality-position">
              <strong>Page {currentPage} of {TOTAL_SECTIONS}</strong>
              <span>
                {currentSection.icon} {currentSection.shortTitle}
              </span>
            </div>

            <div className="reality-save-status">
              {saving ? "Saving progress…" : "Progress synced"}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function RealityLearningPage({
  section,
  content,
  choices,
  answer,
  onAnswer,
  onContinue,
  saving,
}: {
  section: Section;
  content: (typeof PAGE_CONTENT)[Exclude<SectionId, "decide">];
  choices: Choice[];
  answer: string;
  onAnswer: (value: string) => void;
  onContinue: () => void;
  saving: boolean;
}) {
  const correctAnswer =
    section.id === "decide"
      ? undefined
      : CORRECT_PAGE_ANSWERS[section.id];

  const correct = answer === correctAnswer;

  return (
    <article className="reality-card">
      <span className="reality-card-label">{content.label}</span>

      <h2>{content.title}</h2>
      <p className="reality-lead">{content.lead}</p>

      <div className="reality-principle-box">
        <span>{content.icon}</span>
        <p>{content.principle}</p>
      </div>

      <div className="reality-points">
        {content.points.map((point) => (
          <div key={`${point.title}-${point.icon}`} className="reality-point">
            <span>{point.icon}</span>
            <div>
              <strong>{point.title}</strong>
              <p>{point.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="reality-practice">
        <span className="reality-practice-label">{content.practice.label}</span>
        <div className="reality-practice-grid">
          <div>
            <strong>Scenario</strong>
            <p>{content.practice.scenario}</p>
          </div>
          <div>
            <strong>Better move</strong>
            <p>{content.practice.action}</p>
          </div>
        </div>
      </div>

      <div className="reality-question">
        <span className="reality-question-label">CHECK YOUR THINKING</span>
        <h3>{content.question}</h3>

        <div className="reality-choice-grid">
          {choices.map((choice) => {
            const selected = answer === choice.value;
            const isCorrect =
              Boolean(selected) && choice.value === correctAnswer;

            return (
              <button
                type="button"
                key={choice.value}
                className={[
                  "reality-choice",
                  selected ? "selected" : "",
                  isCorrect ? "correct" : "",
                ].join(" ")}
                onClick={() => onAnswer(choice.value)}
              >
                <span>{selected ? "✓" : "○"}</span>
                {choice.label}
              </button>
            );
          })}
        </div>

        {answer && (
          <div className={correct ? "reality-feedback success" : "reality-feedback warning"}>
            <strong>{correct ? "✓ Correct" : "Not quite yet"}</strong>
            <p>{correct ? content.correctMessage : content.wrongMessage}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        className="reality-primary-button"
        disabled={!correct || saving}
        onClick={onContinue}
      >
        {saving ? "Saving…" : content.next}
      </button>
    </article>
  );
}

function FinalChallenge({
  answers,
  submitted,
  passed,
  score,
  percentage,
  saving,
  completed,
  onAnswer,
  onSubmit,
  onRetry,
  onComplete,
  onLearn,
}: {
  answers: number[];
  submitted: boolean;
  passed: boolean;
  score: number;
  percentage: number;
  saving: boolean;
  completed: boolean;
  onAnswer: (questionIndex: number, optionIndex: number) => void;
  onSubmit: () => void;
  onRetry: () => void;
  onComplete: () => void;
  onLearn: () => void;
}) {
  return (
    <article className="reality-card">
      <span className="reality-card-label">08 · FINAL CHALLENGE</span>

      <h2>Act on evidence.</h2>

      <p className="reality-lead">
        Use the complete Reality Check loop: pause, verify, find evidence,
        check context, compare information, then decide.
      </p>

      <div className="reality-loop">
        {[
          ["01", "PAUSE", "Don't react immediately."],
          ["02", "VERIFY", "Check where information came from."],
          ["03", "EVIDENCE", "Look for support for the claim."],
          ["04", "CONTEXT", "Look for what may be missing."],
          ["05", "COMPARE", "Check other reliable information."],
          ["06", "DECIDE", "Act according to the evidence."],
        ].map(([number, title, text]) => (
          <div key={number}>
            <span>{number}</span>
            <strong>{title}</strong>
            <p>{text}</p>
          </div>
        ))}
      </div>

      {!submitted ? (
        <>
          <div className="reality-final-heading">
            <span>FINAL REALITY CHECK</span>
            <h3>Answer all five questions.</h3>
            <p>You need at least 4 / 5 to complete this Reality Check.</p>
          </div>

          <div className="reality-final-questions">
            {FINAL_QUESTIONS.map((question, index) => (
              <div className="reality-final-question" key={question.question}>
                <div className="reality-final-question-title">
                  <span>{index + 1}</span>
                  <h4>{question.question}</h4>
                </div>

                <div className="reality-final-options">
                  {question.options.map((option, optionIndex) => (
                    <button
                      type="button"
                      key={option}
                      className={answers[index] === optionIndex ? "selected" : ""}
                      onClick={() => onAnswer(index, optionIndex)}
                    >
                      <span>{String.fromCharCode(65 + optionIndex)}</span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="reality-primary-button"
            disabled={answers.some((answer) => answer === -1)}
            onClick={onSubmit}
          >
            Check My Answers →
          </button>
        </>
      ) : (
        <div className="reality-result">
          <div className={`reality-result-icon ${passed ? "success" : "fail"}`}>
            {passed ? "✓" : "↻"}
          </div>

          <span className="reality-result-label">YOUR RESULT</span>
          <h3>{passed ? `Excellent! ${score}/5` : `Not quite yet — ${score}/5`}</h3>
          <p>You scored {percentage}%.</p>

          <div className="reality-score-track">
            <div style={{ width: `${percentage}%` }} />
          </div>

          <div className="reality-explanations">
            {FINAL_QUESTIONS.map((question, index) => {
              const correct = answers[index] === question.answer;

              return (
                <div key={question.question} className={correct ? "correct" : "wrong"}>
                  <strong>{correct ? "✓ Correct" : "✕ Review"}</strong>
                  <p>{question.explanation}</p>
                </div>
              );
            })}
          </div>

          {!passed ? (
            <button type="button" className="reality-secondary-button" onClick={onRetry}>
              Try Again ↻
            </button>
          ) : (
            <>
              <div className="reality-completion-card">
                <span>✓</span>
                <div>
                  <strong>Reality Check passed!</strong>
                  <p>
                    You now have a practical framework for evaluating digital
                    information before acting on it.
                  </p>
                </div>
              </div>

              {!completed ? (
                <button
                  type="button"
                  className="reality-primary-button"
                  disabled={saving}
                  onClick={onComplete}
                >
                  {saving ? "Saving completion…" : "Complete Reality Check ✓"}
                </button>
              ) : (
                <button
                  type="button"
                  className="reality-primary-button"
                  onClick={onLearn}
                >
                  Return to Learning Path →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}

export default RealityCheck;
