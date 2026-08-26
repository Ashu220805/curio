// deno-lint-ignore-file

import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import "./Lesson1.css";

import { useLessonProgress } from "../../hooks/useLessonProgress.ts";

type LessonSection =
  | "meet"
  | "what"
  | "magic"
  | "instructions"
  | "chat"
  | "context"
  | "safety"
  | "practice";

type ChatMessage = {
  id: number;
  role: "ai" | "user";
  text: string;
};


const SAFETY_EXPECTED: Record<string, boolean> = {
  photosynthesis: true,
  password: false,
  project: true,
};

const FINAL_QUESTIONS = [
  {
    question: "What is AI?",
    options: [
      "A human who answers every question",
      "Technology that can process information, recognise patterns, and produce useful results",
      "A search engine that is always correct",
      "A computer that understands everything like a person",
    ],
    answer: 1,
    explanation:
      "AI is technology that can process information, recognise patterns, and produce useful outputs. It is not a human and it does not automatically understand everything.",
  },
  {
    question: "Which prompt gives AI the clearest instruction?",
    options: [
      "Help me.",
      "Tell me something.",
      "I'm a beginner. Explain gravity using one simple everyday example.",
      "Gravity?",
    ],
    answer: 2,
    explanation:
      "The third prompt gives AI a clear task, your level, and the format you want.",
  },
  {
    question: "Why is context useful when talking to AI?",
    options: [
      "It makes AI human",
      "It gives AI useful information about your goal and situation",
      "It guarantees that the answer will be correct",
      "It removes the need to check an answer",
    ],
    answer: 1,
    explanation:
      "Context helps AI understand what you are trying to do, who the answer is for, and what kind of response may be useful.",
  },
  {
    question: "Which information should you NOT give an AI tool?",
    options: [
      "A general school topic",
      "A request for study ideas",
      "A password or OTP",
      "A public science question",
    ],
    answer: 2,
    explanation:
      "Passwords, OTPs, PINs, and other sensitive secrets should stay private. Never share them with an AI tool.",
  },
  {
    question: "What is the best habit when using AI?",
    options: [
      "Trust the first answer immediately",
      "Copy the answer without understanding it",
      "Use AI as a helper, then think, check, and make your own decision",
      "Never use AI for anything",
    ],
    answer: 2,
    explanation:
      "A strong AI habit is to use AI as a helper while keeping your own thinking, checking important information, and making the final decision yourself.",
  },
];

function Lesson1() {
  const navigate = useNavigate();

  const [section, setSection] =
    useState<LessonSection>("meet");

  const [chatMessage, setChatMessage] =
    useState("");

  const [chatStarted, setChatStarted] =
    useState(false);

  const [chatHistory, setChatHistory] =
    useState<ChatMessage[]>([]);

  const [contextAnswer, setContextAnswer] =
    useState("");

  const [safetyAnswers, setSafetyAnswers] =
    useState<Record<string, boolean>>({});

  const [finalAnswers, setFinalAnswers] =
    useState<number[]>(
      Array(FINAL_QUESTIONS.length).fill(-1)
    );

  const [finalSubmitted, setFinalSubmitted] =
    useState(false);

  const [finalPassed, setFinalPassed] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  /*
   * =========================================
   * CURIO LESSON PROGRESS
   * =========================================
   *
   * Lesson 1 has 8 sections.
   *
   * lessonProgress.ts remains unchanged.
   * useLessonProgress.ts handles communication
   * with Supabase.
   */

  const {
    loading: progressLoading,
    saving: progressSaving,
    error: progressError,
    currentSection: savedCurrentSection,
    completedSections: savedCompletedSections,
    completed: savedCompleted,
    updateProgress,
    markComplete,
  } = useLessonProgress(1, 8);

  /*
   * =========================================
   * LESSON SECTIONS
   * =========================================
   */

  const sections: {
    id: LessonSection;
    number: string;
    title: string;
  }[] = [
    {
      id: "meet",
      number: "01",
      title: "Meet AI",
    },
    {
      id: "what",
      number: "02",
      title: "What is AI?",
    },
    {
      id: "magic",
      number: "03",
      title: "AI isn't magic",
    },
    {
      id: "instructions",
      number: "04",
      title: "Give instructions",
    },
    {
      id: "chat",
      number: "05",
      title: "Try AI",
    },
    {
      id: "context",
      number: "06",
      title: "Give context",
    },
    {
      id: "safety",
      number: "07",
      title: "Stay safe",
    },
    {
      id: "practice",
      number: "08",
      title: "Practice",
    },
  ];

  /*
   * =========================================
   * RESTORE SUPABASE PROGRESS
   * =========================================
   */

  useEffect(() => {
    if (progressLoading) {
      return;
    }

    /*
     * If Lesson 1 has already been completed,
     * restore the completed state.
     */

    if (savedCompleted) {
      setCompleted(true);

      setFinalPassed(true);

      /*
       * Keep the user on the final section
       * after refresh.
       */

      setSection("practice");

      return;
    }

    /*
     * Restore the last saved section.
     *
     * currentSection is stored as a 1-based
     * completed-section count.
     *
     * Example:
     *
     * currentSection = 1
     * -> Meet AI completed
     * -> open What is AI?
     *
     * currentSection = 2
     * -> What is AI? completed
     * -> open AI isn't magic
     */

    if (
      savedCurrentSection > 0 &&
      savedCurrentSection < sections.length
    ) {
      const nextIndex = Math.min(
        savedCurrentSection,
        sections.length - 1
      );

      setSection(
        sections[nextIndex].id
      );
    }

    /*
     * If the user has already completed
     * all 8 sections, restore completion.
     */

    if (
      savedCompletedSections >=
      sections.length
    ) {
      setCompleted(true);
      setFinalPassed(true);
      setSection("practice");
    }
  }, [
    progressLoading,
    savedCurrentSection,
    savedCompletedSections,
    savedCompleted,
  ]);

  /*
   * =========================================
   * RESTORE FINAL CHALLENGE STATE
   * =========================================
   *
   * We cannot restore the user's answers because
   * lessonProgress.ts stores lesson progress,
   * not quiz answers.
   *
   * But we DO restore the fact that the lesson
   * was completed.
   */

  useEffect(() => {
    if (
      !progressLoading &&
      savedCompleted
    ) {
      setCompleted(true);
      setFinalPassed(true);
    }
  }, [
    progressLoading,
    savedCompleted,
  ]);

  /*
   * =========================================
   * CURRENT SECTION
   * =========================================
   */

  const currentIndex =
    sections.findIndex(
      (item) => item.id === section
    );

  /*
   * =========================================
   * REAL PROGRESS
   * =========================================
   *
   * Supabase is now the source of truth.
   */

  const progressCount =
    Math.max(
      0,
      Math.min(
        savedCompletedSections,
        sections.length
      )
    );

  const progressPercent =
    sections.length > 0
      ? (progressCount / sections.length) *
        100
      : 0;

  /*
   * =========================================
   * FURTHEST UNLOCKED SECTION
   * =========================================
   *
   * Example:
   *
   * completedSections = 0
   * -> only section 1 unlocked
   *
   * completedSections = 1
   * -> sections 1 and 2 unlocked
   *
   * completedSections = 2
   * -> sections 1, 2 and 3 unlocked
   */

  const furthestUnlockedIndex =
    Math.min(
      savedCompletedSections,
      sections.length - 1
    );

  /*
   * =========================================
   * COMPLETE CURRENT SECTION
   * =========================================
   */

  const markCurrentSectionComplete =
    async () => {
      /*
       * Current section index is 0-based.
       *
       * Therefore:
       *
       * section 1 -> index 0 -> completed = 1
       * section 2 -> index 1 -> completed = 2
       */

      const newCompletedCount =
        Math.max(
          savedCompletedSections,
          currentIndex + 1
        );

      /*
       * Do not exceed 8.
       */

      const safeCompletedCount =
        Math.min(
          newCompletedCount,
          sections.length
        );

      /*
       * Save progress to Supabase.
       *
       * currentSection is also stored as the
       * number of the last completed section.
       */

      const success =
        await updateProgress(
          safeCompletedCount,
          safeCompletedCount
        );

      return success;
    };

  /*
   * =========================================
   * NEXT SECTION
   * =========================================
   */

  const goNext = async () => {
    if (
      currentIndex >=
      sections.length - 1
    ) {
      return;
    }

    /*
     * Save FIRST.
     *
     * This is important because React state
     * updates are asynchronous.
     */

    const saved =
      await markCurrentSectionComplete();

    if (!saved) {
      return;
    }

    /*
     * Only move forward after the save
     * succeeds.
     */

    setSection(
      sections[currentIndex + 1].id
    );

    globalThis.scrollTo?.({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * =========================================
   * SECTION ACCESS
   * =========================================
   */

  const canOpenSection = (
    index: number
  ) => {
    /*
     * Completed lesson:
     * everything is available.
     */

    if (savedCompleted) {
      return true;
    }

    /*
     * Current furthest unlocked section
     * and all previous sections are available.
     */

    return (
      index <= furthestUnlockedIndex
    );
  };

  /*
   * =========================================
   * OPEN SECTION
   * =========================================
   */

  const openSection = (
    id: LessonSection,
    index: number
  ) => {
    if (!canOpenSection(index)) {
      return;
    }

    setSection(id);

    globalThis.scrollTo?.({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * =========================================
   * AI PRACTICE
   * =========================================
   */

  const getAIResponse = (
    prompt: string
  ) => {
    const lower =
      prompt.toLowerCase();

    if (lower.includes("gravity")) {
      return "Gravity is the force that pulls objects toward each other. On Earth, it is what keeps you on the ground. 🌍";
    }

    if (
      lower.includes(
        "photosynthesis"
      )
    ) {
      return "Photosynthesis is how green plants use light, water and carbon dioxide to make food. 🌱";
    }

    return "Good start! 😊 You gave AI a clear thing to work on. In the next steps, you'll learn how context and specific instructions can make your results even more useful.";
  };

  const startChat = () => {
    const trimmedMessage =
      chatMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    const userMessage: ChatMessage =
      {
        id: Date.now(),
        role: "user",
        text: trimmedMessage,
      };

    const aiMessage: ChatMessage =
      {
        id: Date.now() + 1,
        role: "ai",
        text: getAIResponse(
          trimmedMessage
        ),
      };

    setChatHistory(
      (previous) => [
        ...previous,
        userMessage,
        aiMessage,
      ]
    );

    setChatStarted(true);
    setChatMessage("");
  };

  /*
   * =========================================
   * SAFETY
   * =========================================
   */

  const answerSafety = (
    question: string,
    safe: boolean
  ) => {
    setSafetyAnswers(
      (previous) => ({
        ...previous,
        [question]: safe,
      })
    );
  };

  const safetyComplete =
    Object.keys(
      SAFETY_EXPECTED
    ).every(
      (question) =>
        safetyAnswers[question] ===
        SAFETY_EXPECTED[question]
    );

  /*
   * =========================================
   * CONTEXT
   * =========================================
   */

  const contextCorrect =
    contextAnswer === "with";

  /*
   * =========================================
   * FINAL QUIZ
   * =========================================
   */

  const finalScore =
    FINAL_QUESTIONS.reduce(
      (
        score,
        question,
        index
      ) =>
        score +
        (finalAnswers[index] ===
        question.answer
          ? 1
          : 0),
      0
    );

  const finalPercentage =
    (finalScore /
      FINAL_QUESTIONS.length) *
    100;

  const submitFinalChallenge =
    () => {
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

  const retryFinalChallenge =
    () => {
      setFinalAnswers(
        Array(
          FINAL_QUESTIONS.length
        ).fill(-1)
      );

      setFinalSubmitted(false);
      setFinalPassed(false);
      setCompleted(false);
    };

  /*
   * =========================================
   * SAFETY FEEDBACK
   * =========================================
   */

  const safetyFeedback = (
    question: string
  ) => {
    const answer =
      safetyAnswers[question];

    if (answer === undefined) {
      return null;
    }

    const correct =
      answer ===
      SAFETY_EXPECTED[question];

    if (
      question ===
      "photosynthesis"
    ) {
      return correct
        ? "Correct. Asking AI to explain a general topic does not reveal private information."
        : "Not quite. This is safe because it does not contain a password, private message, financial detail, or other sensitive information.";
    }

    if (
      question ===
      "password"
    ) {
      return correct
        ? "Correct. Passwords must stay private. Never give passwords, OTPs, PINs or similar secrets to an AI tool."
        : "Not safe. A password is private information. Do not paste it into an AI tool, even if you only want help remembering it.";
    }

    return correct
      ? "Correct. General school-project ideas are normally fine to ask about. Just avoid sharing private personal details."
      : "Not quite. A general request for school-project ideas is safe when it does not include private or sensitive information.";
  };

  /*
   * =========================================
   * COMPLETE LESSON
   * =========================================
   *
   * IMPORTANT:
   *
   * We DO NOT modify lessonProgress.ts.
   *
   * markComplete() already performs the Supabase
   * upsert with:
   *
   * completed = true
   * current_section = 8
   * completed_sections = 8
   * total_sections = 8
   *
   */

  const completeLesson =
    async () => {
      if (!finalPassed) {
        return;
      }

      /*
       * Save all 8 sections and mark the lesson
       * as completed in Supabase.
       */

      const success =
        await markComplete();

      if (!success) {
        return;
      }

      /*
       * Update local UI only after Supabase
       * confirms the save.
       */

      setCompletedSectionsForUI();

      setCompleted(true);

      /*
       * Keep these localStorage entries for
       * compatibility with your previous code.
       *
       * Supabase is now the actual source of truth.
       */

      const stored =
        localStorage.getItem(
          "curio_completed_lessons"
        );

      let completedLessons: number[] =
        [];

      if (stored) {
        try {
          completedLessons =
            JSON.parse(stored);
        } catch {
          completedLessons = [];
        }
      }

      if (
        !completedLessons.includes(1)
      ) {
        completedLessons.push(1);
      }

      localStorage.setItem(
        "curio_completed_lessons",
        JSON.stringify(
          completedLessons
        )
      );

      localStorage.setItem(
        "curio_lesson1_sections_completed",
        JSON.stringify(
          sections.map(
            (item) => item.id
          )
        )
      );

      localStorage.setItem(
        "curio_completed_lesson_1",
        "true"
      );
    };

  /*
   * =========================================
   * UI COMPLETION HELPER
   * =========================================
   *
   * This is only for the local visual state.
   * Actual persistence is handled by Supabase.
   */

  const setCompletedSectionsForUI =
    () => {
      /*
       * We don't need to manually change
       * completedSections anymore because the
       * hook will reload the saved progress.
       *
       * This function intentionally exists only
       * so completeLesson() remains easy to read.
       */
    };

  /*
   * =========================================
   * LOADING STATE
   * =========================================
   *
   * Prevents the lesson from briefly rendering
   * as locked before Supabase progress arrives.
   */

  if (progressLoading) {
    return (
      <main className="lesson-page">
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          Loading your lesson progress...
        </div>
      </main>
    );
  }

  return (
    <main className="lesson-page">
      <header className="lesson-header">
        <button
          type="button"
          className="lesson-back-button"
          onClick={() =>
            navigate("/learn")
          }
          aria-label="Back to Learn AI"
        >
          ←
        </button>

        <div className="lesson-heading">
          <span>
            CURIO · LESSON 01
          </span>

          <h1>Meet AI</h1>
        </div>

        <div
          className="lesson-header-progress"
          aria-label="Lesson progress"
        >
          <span>
            {progressCount} /{" "}
            {sections.length}{" "}
            completed
          </span>

          <div className="lesson-progress-track">
            <div
              className="lesson-progress-fill"
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>
        </div>
      </header>

      {progressError && (
        <div
          style={{
            padding: "10px 20px",
            background: "#fff3cd",
            color: "#664d03",
            textAlign: "center",
          }}
        >
          {progressError}
        </div>
      )}

      <div className="lesson-layout">
        <aside className="lesson-navigation">
          <div className="lesson-nav-title">
            YOUR JOURNEY
          </div>

          {sections.map(
            (item, index) => {
              const unlocked =
                canOpenSection(
                  index
                );

              const isCompleted =
                savedCompleted
                  ? true
                  : index <
                    savedCompletedSections;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!unlocked}
                  className={`lesson-nav-item ${
                    section ===
                    item.id
                      ? "active"
                      : ""
                  } ${
                    !unlocked
                      ? "locked"
                      : ""
                  }`}
                  onClick={() =>
                    openSection(
                      item.id,
                      index
                    )
                  }
                  aria-current={
                    section ===
                    item.id
                      ? "step"
                      : undefined
                  }
                  aria-disabled={
                    !unlocked
                  }
                >
                  <span>
                    {item.number}
                  </span>

                  <strong>
                    {item.title}
                  </strong>

                  <small
                    aria-label={
                      isCompleted
                        ? "Completed"
                        : unlocked
                        ? "Unlocked"
                        : "Locked"
                    }
                  >
                    {isCompleted
                      ? "✓"
                      : unlocked
                      ? ""
                      : "🔒"}
                  </small>
                </button>
              );
            }
          )}
        </aside>

        <section className="lesson-content">

          {/* =====================================
              EXISTING LESSON INTRO
          ===================================== */}

          <div className="lesson-intro">
            <span className="lesson-kicker">
              AI FUNDAMENTALS
            </span>

            <h2>
              Your first step into AI.
            </h2>

            <p>
              You don't need to be
              technical. You don't
              need to know how
              computers work.
            </p>

            <p>
              We're going to start
              from the very beginning
              and learn AI one small
              step at a time.
            </p>

            <div className="lesson-principle">
              <span>🧠</span>

              <div>
                <strong>
                  Think of this like
                  learning an alphabet.
                </strong>

                <p>
                  First we'll learn
                  the basics. Then
                  we'll learn how to
                  communicate with AI.
                </p>
              </div>
            </div>
          </div>

          {/* =====================================
              SECTION 01
          ===================================== */}

          {section === "meet" && (
            <div className="lesson-card">
              <span className="lesson-step-label">
                01 · MEET AI
              </span>

              <h3>
                You've probably already
                met AI.
              </h3>

              <p className="lesson-lead">
                AI isn't only something
                you see in
                science-fiction movies.
              </p>

              <p>
                You may have already used
                AI without even realising
                it.
              </p>

              <div className="familiar-grid">
                <article>
                  <span>🎬</span>
                  <strong>
                    Video recommendations
                  </strong>
                  <p>
                    A platform suggests
                    videos you might enjoy.
                  </p>
                </article>

                <article>
                  <span>🗺️</span>
                  <strong>
                    Maps
                  </strong>
                  <p>
                    Technology can help
                    predict routes and
                    traffic.
                  </p>
                </article>

                <article>
                  <span>📱</span>
                  <strong>
                    Face recognition
                  </strong>
                  <p>
                    Your phone can
                    recognise patterns
                    in your face.
                  </p>
                </article>

                <article>
                  <span>💬</span>
                  <strong>
                    Chatbots
                  </strong>
                  <p>
                    AI can respond to
                    questions and
                    instructions.
                  </p>
                </article>
              </div>

              <button
                type="button"
                className="lesson-primary"
                onClick={goNext}
                disabled={progressSaving}
              >
                {progressSaving
                  ? "Saving..."
                  : "I understand → What's AI?"}
              </button>
            </div>
          )}

          {/* =====================================
              SECTION 02
          ===================================== */}

          {section === "what" && (
            <div className="lesson-card">
              <span className="lesson-step-label">
                02 · WHAT IS AI?
              </span>

              <h3>
                So... what actually is AI?
              </h3>

              <p className="lesson-lead">
                Let's keep it simple.
              </p>

              <div className="big-definition">
                <span>AI</span>

                <p>
                  Artificial Intelligence
                  is technology that can
                  process information,
                  recognise patterns, and
                  produce useful results.
                </p>
              </div>

              <div className="simple-flow">
                <div>
                  <span>1</span>
                  <strong>
                    Information
                  </strong>
                  <p>
                    AI receives
                    information.
                  </p>
                </div>

                <div className="flow-arrow">
                  →
                </div>

                <div>
                  <span>2</span>
                  <strong>
                    Processing
                  </strong>
                  <p>
                    AI works with
                    patterns.
                  </p>
                </div>

                <div className="flow-arrow">
                  →
                </div>

                <div>
                  <span>3</span>
                  <strong>
                    Result
                  </strong>
                  <p>
                    AI produces an
                    output.
                  </p>
                </div>
              </div>

              <div className="lesson-note">
                <strong>
                  Remember:
                </strong>

                <span>
                  AI isn't a person.
                  It doesn't
                  automatically
                  understand
                  everything.
                </span>
              </div>

              <button
                type="button"
                className="lesson-primary"
                onClick={goNext}
                disabled={progressSaving}
              >
                {progressSaving
                  ? "Saving..."
                  : "Got it → Continue"}
              </button>
            </div>
          )}

          {/* =====================================
              SECTION 03
          ===================================== */}

          {section === "magic" && (
            <div className="lesson-card">
              <span className="lesson-step-label">
                03 · AI ISN'T MAGIC
              </span>

              <h3>
                AI isn't a mind reader.
              </h3>

              <p className="lesson-lead">
                One of the most important
                things to understand about
                AI:
              </p>

              <div className="comparison">
                <div className="comparison-box weak">
                  <span>❌</span>
                  <small>
                    TOO VAGUE
                  </small>
                  <strong>
                    "Help me."
                  </strong>
                  <p>
                    Help with what?
                  </p>
                </div>

                <div className="comparison-arrow">
                  →
                </div>

                <div className="comparison-box good">
                  <span>✅</span>
                  <small>
                    CLEARER
                  </small>
                  <strong>
                    "Help me study
                    photosynthesis."
                  </strong>
                  <p>
                    Now AI knows the
                    task.
                  </p>
                </div>
              </div>

              <div className="lesson-highlight">
                <span>💡</span>

                <div>
                  <strong>
                    The better you explain
                    what you need, the more
                    useful AI can be.
                  </strong>

                  <p>
                    We'll learn how to do
                    this throughout CURIO.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="lesson-primary"
                onClick={goNext}
                disabled={progressSaving}
              >
                {progressSaving
                  ? "Saving..."
                  : "Show me how → Give instructions"}
              </button>
            </div>
          )}

          {/* =====================================
              SECTION 04
          ===================================== */}

          {section ===
            "instructions" && (
            <div className="lesson-card">
              <span className="lesson-step-label">
                04 · GIVE INSTRUCTIONS
              </span>

              <h3>
                Talk to AI like you're
                giving instructions to a
                helper.
              </h3>

              <p className="lesson-lead">
                Your instruction is often
                called a{" "}
                <strong>
                  prompt
                </strong>
                .
              </p>

              <div className="prompt-ladder">
                <div className="prompt-level">
                  <span>1</span>

                  <div>
                    <small>
                      START
                    </small>

                    <strong>
                      "Explain gravity."
                    </strong>
                  </div>
                </div>

                <div className="prompt-level">
                  <span>2</span>

                  <div>
                    <small>
                      ADD CONTEXT
                    </small>

                    <strong>
                      "I'm a beginner.
                      Explain gravity."
                    </strong>
                  </div>
                </div>

                <div className="prompt-level">
                  <span>3</span>

                  <div>
                    <small>
                      BE SPECIFIC
                    </small>

                    <strong>
                      "I'm a beginner.
                      Explain gravity
                      using one everyday
                      example."
                    </strong>
                  </div>
                </div>
              </div>

              <div className="lesson-note">
                <strong>
                  You're already
                  learning prompting.
                </strong>

                <span>
                  Don't worry about
                  remembering
                  complicated terms
                  yet.
                </span>
              </div>

              <button
                type="button"
                className="lesson-primary"
                onClick={goNext}
                disabled={progressSaving}
              >
                {progressSaving
                  ? "Saving..."
                  : "I want to try AI →"}
              </button>
            </div>
          )}

          {/* =====================================
              SECTION 05
          ===================================== */}

          {section === "chat" && (
            <div className="lesson-card">
              <span className="lesson-step-label">
                05 · TRY AI
              </span>

              <h3>
                Your first AI
                conversation.
              </h3>

              <p className="lesson-lead">
                This is a safe practice
                space. You can't break
                anything here.
              </p>

              <div className="mini-chat">
                <div className="chat-header">
                  <span>✨</span>

                  <div>
                    <strong>
                      CURIO Practice AI
                    </strong>

                    <small>
                      Learning mode ·
                      Beginner friendly
                    </small>
                  </div>

                  <span
                    className="chat-status"
                    aria-label="Practice AI online"
                  >
                    ●
                  </span>
                </div>

                <div className="chat-body">
                  <div className="chat-message ai">
                    <strong>
                      CURIO Practice AI
                    </strong>

                    <span>
                      Hi! 👋 I'm your
                      practice AI. Try
                      asking me something.
                    </span>
                  </div>

                  {chatHistory.map(
                    (message) => (
                      <div
                        key={message.id}
                        className={`chat-message ${message.role}`}
                      >
                        {message.role ===
                          "ai" && (
                          <strong>
                            CURIO Practice AI
                          </strong>
                        )}

                        <span>
                          {message.text}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <div className="chat-input-area">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(event) =>
                      setChatMessage(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        startChat();
                      }
                    }}
                    placeholder="Try asking me something..."
                    aria-label="Ask the practice AI"
                  />

                  <button
                    type="button"
                    onClick={startChat}
                    disabled={
                      !chatMessage.trim()
                    }
                    aria-label="Send message"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="chat-learning-tip">
                <span>💡</span>

                <div>
                  <strong>
                    Beginner tip
                  </strong>

                  <p>
                    Don't worry about
                    writing the perfect
                    prompt. Start with
                    what you want to know.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="lesson-primary"
                onClick={goNext}
                disabled={
                  !chatStarted ||
                  progressSaving
                }
              >
                {progressSaving
                  ? "Saving..."
                  : "I tried it → Learn about context"}
              </button>
            </div>
          )}

          {/* =====================================
              SECTION 06
          ===================================== */}

          {section === "context" && (
            <div className="lesson-card">
              <span className="lesson-step-label">
                06 · GIVE CONTEXT
              </span>

              <h3>
                Help AI understand your
                situation.
              </h3>

              <p className="lesson-lead">
                Context tells AI
                important details about
                what you're trying to do.
              </p>

              <div className="context-comparison">
                <div>
                  <small>
                    WITHOUT CONTEXT
                  </small>

                  <div className="context-prompt weak">
                    "Make me a study plan."
                  </div>
                </div>

                <div className="context-arrow">
                  →
                </div>

                <div>
                  <small>
                    WITH CONTEXT
                  </small>

                  <div className="context-prompt strong">
                    "I'm a Class 10 student
                    preparing for a science
                    exam. I have 7 days."
                  </div>
                </div>
              </div>

              <h4>
                Which one gives AI more
                useful information?
              </h4>

              <div className="choice-grid">
                <button
                  type="button"
                  className={
                    contextAnswer ===
                    "without"
                      ? "selected-choice"
                      : ""
                  }
                  onClick={() =>
                    setContextAnswer(
                      "without"
                    )
                  }
                >
                  The first one
                </button>

                <button
                  type="button"
                  className={
                    contextAnswer ===
                    "with"
                      ? "selected-choice"
                      : ""
                  }
                  onClick={() =>
                    setContextAnswer(
                      "with"
                    )
                  }
                >
                  The second one
                </button>
              </div>

              {contextAnswer ===
                "without" && (
                <div className="error-message">
                  <strong>
                    Not quite.
                  </strong>{" "}
                  The first prompt
                  gives AI very little
                  information about
                  you, your goal, or
                  your deadline.
                  Context helps AI
                  give a more useful
                  answer.
                </div>
              )}

              {contextAnswer ===
                "with" && (
                <div className="success-message">
                  <strong>
                    🎉 Correct!
                  </strong>{" "}
                  The second prompt
                  gives AI useful
                  context: your level,
                  subject, goal, and
                  time available.
                </div>
              )}

              <button
                type="button"
                className="lesson-primary"
                onClick={goNext}
                disabled={
                  !contextCorrect ||
                  progressSaving
                }
              >
                {progressSaving
                  ? "Saving..."
                  : "Next → Stay safe"}
              </button>
            </div>
          )}

          {/* =====================================
              SECTION 07
          ===================================== */}

          {section === "safety" && (
            <div className="lesson-card">
              <span className="lesson-step-label">
                07 · STAY SAFE
              </span>

              <h3>
                One important rule before
                you use AI.
              </h3>

              <div className="safety-rule">
                <span>🔐</span>

                <div>
                  <strong>
                    Don't give AI private
                    information.
                  </strong>

                  <p>
                    Treat an AI tool
                    carefully. Don't share
                    information that could
                    put you or someone else
                    at risk.
                  </p>
                </div>
              </div>

              <div className="safety-questions">

                <div
                  className={`safety-item ${
                    safetyAnswers
                      .photosynthesis !==
                    undefined
                      ? safetyAnswers
                          .photosynthesis ===
                        true
                        ? "answered-correct"
                        : "answered-wrong"
                      : ""
                  }`}
                >
                  <p>
                    "Explain
                    photosynthesis."
                  </p>

                  <div>
                    <button
                      type="button"
                      className={
                        safetyAnswers
                          .photosynthesis ===
                        true
                          ? "selected-correct"
                          : ""
                      }
                      onClick={() =>
                        answerSafety(
                          "photosynthesis",
                          true
                        )
                      }
                    >
                      ✓ Safe
                    </button>

                    <button
                      type="button"
                      className={
                        safetyAnswers
                          .photosynthesis ===
                        false
                          ? "selected-wrong"
                          : ""
                      }
                      onClick={() =>
                        answerSafety(
                          "photosynthesis",
                          false
                        )
                      }
                    >
                      ✕ Not safe
                    </button>
                  </div>

                  {safetyAnswers
                    .photosynthesis !==
                    undefined && (
                    <div
                      className={
                        safetyAnswers
                          .photosynthesis ===
                        SAFETY_EXPECTED
                          .photosynthesis
                          ? "safety-feedback correct"
                          : "safety-feedback wrong"
                      }
                    >
                      {safetyFeedback(
                        "photosynthesis"
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={`safety-item ${
                    safetyAnswers
                      .password !==
                    undefined
                      ? safetyAnswers
                          .password ===
                        false
                        ? "answered-correct"
                        : "answered-wrong"
                      : ""
                  }`}
                >
                  <p>
                    "My password is
                    ABC123. Help me
                    remember it."
                  </p>

                  <div>
                    <button
                      type="button"
                      className={
                        safetyAnswers
                          .password ===
                        true
                          ? "selected-wrong"
                          : ""
                      }
                      onClick={() =>
                        answerSafety(
                          "password",
                          true
                        )
                      }
                    >
                      ✓ Safe
                    </button>

                    <button
                      type="button"
                      className={
                        safetyAnswers
                          .password ===
                        false
                          ? "selected-correct"
                          : ""
                      }
                      onClick={() =>
                        answerSafety(
                          "password",
                          false
                        )
                      }
                    >
                      ✕ Not safe
                    </button>
                  </div>

                  {safetyAnswers
                    .password !==
                    undefined && (
                    <div
                      className={
                        safetyAnswers
                          .password ===
                        SAFETY_EXPECTED
                          .password
                          ? "safety-feedback correct"
                          : "safety-feedback wrong"
                      }
                    >
                      {safetyFeedback(
                        "password"
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={`safety-item ${
                    safetyAnswers
                      .project !==
                    undefined
                      ? safetyAnswers
                          .project ===
                        true
                        ? "answered-correct"
                        : "answered-wrong"
                      : ""
                  }`}
                >
                  <p>
                    "Give me ideas for
                    my school project."
                  </p>

                  <div>
                    <button
                      type="button"
                      className={
                        safetyAnswers
                          .project ===
                        true
                          ? "selected-correct"
                          : ""
                      }
                      onClick={() =>
                        answerSafety(
                          "project",
                          true
                        )
                      }
                    >
                      ✓ Safe
                    </button>

                    <button
                      type="button"
                      className={
                        safetyAnswers
                          .project ===
                        false
                          ? "selected-wrong"
                          : ""
                      }
                      onClick={() =>
                        answerSafety(
                          "project",
                          false
                        )
                      }
                    >
                      ✕ Not safe
                    </button>
                  </div>

                  {safetyAnswers
                    .project !==
                    undefined && (
                    <div
                      className={
                        safetyAnswers
                          .project ===
                        SAFETY_EXPECTED
                          .project
                          ? "safety-feedback correct"
                          : "safety-feedback wrong"
                      }
                    >
                      {safetyFeedback(
                        "project"
                      )}
                    </div>
                  )}
                </div>
              </div>

              {safetyComplete && (
                <div className="success-message">
                  <strong>
                    🔐 Excellent!
                  </strong>{" "}
                  You correctly identified
                  all three examples.
                  That's a strong first
                  AI-safety habit.
                </div>
              )}

              <button
                type="button"
                className="lesson-primary"
                onClick={goNext}
                disabled={
                  !safetyComplete ||
                  progressSaving
                }
              >
                {progressSaving
                  ? "Saving..."
                  : "I understand → Final practice"}
              </button>
            </div>
          )}

          {/* =====================================
              SECTION 08
          ===================================== */}

          {section === "practice" && (
            <div className="lesson-card">
              <span className="lesson-step-label">
                08 · FINAL CHALLENGE
              </span>

              <h3>
                Show what you've learned.
              </h3>

              <p className="lesson-lead">
                This is your first CURIO
                knowledge check. Answer all
                five questions before
                submitting your test.
              </p>

              <div className="final-challenge-intro">
                <span>🎯</span>

                <div>
                  <strong>
                    Your goal: 4 out of 5
                    or better.
                  </strong>

                  <p>
                    You get a fresh attempt
                    if you score below 4/5.
                    The answers and
                    explanations are shown
                    only after you submit
                    the test.
                  </p>
                </div>
              </div>

              <div className="final-score-banner">
                <span>
                  PASS MARK
                </span>

                <strong>
                  4 / 5
                </strong>

                <small>
                  80% or higher unlocks
                  the next lesson.
                </small>
              </div>

              <div className="final-questions">
                {FINAL_QUESTIONS.map(
                  (
                    item,
                    index
                  ) => {
                    const selected =
                      finalAnswers[
                        index
                      ];

                    const correct =
                      selected ===
                      item.answer;

                    return (
                      <div
                        className="final-question"
                        key={
                          item.question
                        }
                      >
                        <div className="final-question-heading">
                          <span>
                            {index +
                              1}
                          </span>

                          <h4>
                            {
                              item.question
                            }
                          </h4>
                        </div>

                        <div className="final-options">
                          {item.options.map(
                            (
                              option,
                              optionIndex
                            ) => (
                              <button
                                type="button"
                                key={
                                  option
                                }
                                disabled={
                                  finalSubmitted
                                }
                                className={`final-option ${
                                  selected ===
                                  optionIndex
                                    ? "selected"
                                    : ""
                                } ${
                                  finalSubmitted &&
                                  optionIndex ===
                                    item.answer
                                    ? "final-correct"
                                    : ""
                                } ${
                                  finalSubmitted &&
                                  selected ===
                                    optionIndex &&
                                  !correct
                                    ? "final-wrong"
                                    : ""
                                }`}
                                onClick={() =>
                                  setFinalAnswers(
                                    (
                                      previous
                                    ) => {
                                      const next =
                                        [
                                          ...previous,
                                        ];

                                      next[
                                        index
                                      ] =
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
                                  {
                                    option
                                  }
                                </strong>
                              </button>
                            )
                          )}
                        </div>

                        {finalSubmitted && (
                          <div
                            className={`final-feedback ${
                              correct
                                ? "final-feedback-correct"
                                : "final-feedback-wrong"
                            }`}
                          >
                            <strong>
                              {correct
                                ? "✓ Correct"
                                : "✕ Not quite"}
                            </strong>

                            <p>
                              {
                                item.explanation
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              {!finalSubmitted && (
                <button
                  type="button"
                  className="lesson-primary complete-button"
                  disabled={finalAnswers.some(
                    (answer) =>
                      answer === -1
                  )}
                  onClick={
                    submitFinalChallenge
                  }
                >
                  Submit Final Challenge →
                </button>
              )}

              {finalSubmitted &&
                !finalPassed && (
                  <div className="final-result final-result-fail">
                    <div className="final-result-icon">
                      ↻
                    </div>

                    <div>
                      <strong>
                        Not passed yet —
                        {finalScore}/5 (
                        {finalPercentage}%).
                      </strong>

                      <p>
                        That's okay.
                        Review the
                        explanations above
                        and try the challenge
                        again. You need at
                        least 4/5 to complete
                        Lesson 1.
                      </p>

                      <button
                        type="button"
                        className="lesson-primary retry-button"
                        onClick={
                          retryFinalChallenge
                        }
                      >
                        Retry Final Challenge
                        ↻
                      </button>
                    </div>
                  </div>
                )}

              {finalSubmitted &&
                finalPassed && (
                  <>
                    <div className="final-result final-result-pass">
                      <div className="final-result-icon">
                        ✓
                      </div>

                      <div>
                        <strong>
                          Excellent!{" "}
                          {finalScore}/5 (
                          {finalPercentage}%).
                        </strong>

                        <p>
                          You passed the
                          challenge. You are
                          ready to continue
                          your CURIO learning
                          journey.
                        </p>
                      </div>
                    </div>

                    {!completed ? (
                      <button
                        type="button"
                        className="lesson-primary complete-button"
                        onClick={
                          completeLesson
                        }
                        disabled={
                          progressSaving
                        }
                      >
                        {progressSaving
                          ? "Saving Lesson..."
                          : "Complete Lesson 1 ✓"}
                      </button>
                    ) : (
                      <>
                        <div className="completion-panel">
                          <div className="completion-icon">
                            ✓
                          </div>

                          <div>
                            <strong>
                              Lesson 1 complete!
                            </strong>

                            <p>
                              You now know
                              what AI is,
                              how
                              instructions
                              work, why
                              context
                              matters, and
                              one important
                              safety rule.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="back-learning-button"
                          onClick={() =>
                            navigate(
                              "/learn"
                            )
                          }
                        >
                          Return to your
                          learning path →
                        </button>
                      </>
                    )}
                  </>
                )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Lesson1;