import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Lesson2.css";

type LessonSection =
  | "meet"
  | "chatgpt"
  | "gemini"
  | "claude"
  | "tools"
  | "recognize"
  | "choose"
  | "practice"
  | "finish";

type AnswerMap = Record<string, string>;

const LESSON_SECTIONS: {
  id: Exclude<LessonSection, "finish">;
  number: string;
  title: string;
}[] = [
  { id: "meet", number: "01", title: "Meet AI tools" },
  { id: "chatgpt", number: "02", title: "Recognise ChatGPT" },
  { id: "gemini", number: "03", title: "Recognise Gemini" },
  { id: "claude", number: "04", title: "Recognise Claude" },
  { id: "tools", number: "05", title: "Understand capabilities" },
  { id: "recognize", number: "06", title: "Tool detective" },
  { id: "choose", number: "07", title: "Choose the right tool" },
  { id: "practice", number: "08", title: "Final tool practice" },
];

const ALL_SECTION_IDS: Exclude<LessonSection, "finish">[] =
  LESSON_SECTIONS.map((item) => item.id);

function Lesson2() {
  const navigate = useNavigate();

  /*
   * =========================================================
   * USER / GUEST SCOPED STORAGE
   * =========================================================
   *
   * This keeps the existing CURIO approach:
   * - authenticated users get their own lesson state
   * - guests get a session-specific state
   * - existing compatibility keys are preserved
   */

  const getStorageScope = () => {
    try {
      const storageKeys = Object.keys(localStorage);

      for (const key of storageKeys) {
        if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
          const raw = localStorage.getItem(key);

          if (!raw) continue;

          try {
            const parsed = JSON.parse(raw);
            const userId =
              parsed?.user?.id ||
              parsed?.currentSession?.user?.id ||
              parsed?.session?.user?.id;

            if (userId) {
              return `user_${String(userId)}`;
            }
          } catch {
            // Continue looking for another Supabase auth entry.
          }
        }
      }

      const possibleUserKeys = [
        "curio_current_user",
        "currentUser",
        "user",
        "curio_user",
      ];

      for (const key of possibleUserKeys) {
        const raw = localStorage.getItem(key);

        if (!raw) continue;

        try {
          const parsed = JSON.parse(raw);
          const userId =
            parsed?.id ||
            parsed?.user?.id ||
            parsed?.email;

          if (userId) {
            return `user_${String(userId)}`;
          }
        } catch {
          if (raw.includes("@")) {
            return `user_${raw}`;
          }
        }
      }

      let guestId = sessionStorage.getItem("curio_guest_id");

      if (!guestId) {
        guestId =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}_${Math.random()}`;

        sessionStorage.setItem("curio_guest_id", guestId);
      }

      return `guest_${guestId}`;
    } catch {
      return "guest_session";
    }
  };

  const storageScope = getStorageScope();

  const lessonCompletionKey =
    `curio_completed_lessons_${storageScope}`;

  const lesson2SectionsKey =
    `curio_lesson2_sections_completed_${storageScope}`;

  /*
   * =========================================================
   * INITIAL STORED STATE
   * =========================================================
   */

  const readStoredSections = (): Exclude<LessonSection, "finish">[] => {
    try {
      const stored = localStorage.getItem(lesson2SectionsKey);

      if (!stored) return [];

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        (item): item is Exclude<LessonSection, "finish"> =>
          ALL_SECTION_IDS.includes(item)
      );
    } catch {
      return [];
    }
  };

  const storedSectionsAtLoad = readStoredSections();
  const lessonWasAlreadyCompleted =
    ALL_SECTION_IDS.every((id) => storedSectionsAtLoad.includes(id));

  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [section, setSection] = useState<LessonSection>(
    lessonWasAlreadyCompleted ? "finish" : "meet"
  );

  const [recognitionAnswers, setRecognitionAnswers] =
    useState<AnswerMap>({});

  const [toolChoices, setToolChoices] =
    useState<AnswerMap>({});

  const [practiceAnswers, setPracticeAnswers] =
    useState<AnswerMap>({});

  const [completedSections, setCompletedSections] =
    useState<Exclude<LessonSection, "finish">[]>(
      storedSectionsAtLoad
    );

  const [completed, setCompleted] =
    useState(lessonWasAlreadyCompleted);

  /*
   * =========================================================
   * PROGRESS
   * =========================================================
   *
   * Lesson 2 has exactly 8 learning sections.
   * "finish" is a completion screen and is NOT counted.
   */

  const progressCount = completedSections.filter((item) =>
    ALL_SECTION_IDS.includes(item)
  ).length;

  const progressPercent =
    (progressCount / LESSON_SECTIONS.length) * 100;

  const currentIndex = LESSON_SECTIONS.findIndex(
    (item) => item.id === section
  );

  const furthestUnlockedIndex = useMemo(() => {
    let index = 0;

    for (
      let i = 0;
      i < LESSON_SECTIONS.length - 1;
      i += 1
    ) {
      if (completedSections.includes(LESSON_SECTIONS[i].id)) {
        index = i + 1;
      } else {
        break;
      }
    }

    return index;
  }, [completedSections]);

  /*
   * =========================================================
   * SECTION COMPLETION
   * =========================================================
   */

  const markSectionComplete = (
    sectionId: Exclude<LessonSection, "finish">
  ) => {
    setCompletedSections((previous) => {
      if (previous.includes(sectionId)) {
        return previous;
      }

      const updatedSections = [
        ...previous,
        sectionId,
      ];

      localStorage.setItem(
        lesson2SectionsKey,
        JSON.stringify(updatedSections)
      );

      return updatedSections;
    });
  };

  const saveAllSectionProgress = () => {
    setCompletedSections(ALL_SECTION_IDS);

    localStorage.setItem(
      lesson2SectionsKey,
      JSON.stringify(ALL_SECTION_IDS)
    );
  };

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const goNext = () => {
    if (
      currentIndex < 0 ||
      currentIndex >= LESSON_SECTIONS.length - 1
    ) {
      return;
    }

    markSectionComplete(
      LESSON_SECTIONS[currentIndex].id
    );

    const nextSection =
      LESSON_SECTIONS[currentIndex + 1];

    setSection(nextSection.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goPrevious = () => {
    if (currentIndex <= 0) return;

    setSection(
      LESSON_SECTIONS[currentIndex - 1].id
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const canOpenSection = (index: number) => {
    return (
      index <= furthestUnlockedIndex ||
      completedSections.includes(
        LESSON_SECTIONS[index].id
      )
    );
  };

  const openSection = (
    id: LessonSection,
    index: number
  ) => {
    if (id === "finish") {
      if (!completed) return;

      setSection("finish");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (!canOpenSection(index)) return;

    setSection(id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * =========================================================
   * ANSWER HANDLERS
   * =========================================================
   */

  const answerRecognition = (
    question: string,
    answer: string
  ) => {
    setRecognitionAnswers((previous) => ({
      ...previous,
      [question]: answer,
    }));
  };

  const answerToolChoice = (
    question: string,
    answer: string
  ) => {
    setToolChoices((previous) => ({
      ...previous,
      [question]: answer,
    }));
  };

  const answerPractice = (
    question: string,
    answer: string
  ) => {
    setPracticeAnswers((previous) => ({
      ...previous,
      [question]: answer,
    }));
  };

  /*
   * =========================================================
   * ANSWER VALIDATION
   * =========================================================
   */

  const recognitionCorrect =
    recognitionAnswers.chatgpt === "chatgpt" &&
    recognitionAnswers.gemini === "gemini" &&
    recognitionAnswers.claude === "claude";

  const capabilityCorrect =
    toolChoices.capability === "multimodal";

  const detectiveCorrect =
    toolChoices.identity === "name-logo" &&
    toolChoices.visual === "visual-input" &&
    toolChoices.category === "assistant";

  const practiceCorrect =
    practiceAnswers.school === "conversation" &&
    practiceAnswers.image === "visual-input" &&
    practiceAnswers.research === "research" &&
    practiceAnswers.creation === "image-generation" &&
    practiceAnswers.identity === "claude";

  const finalPracticeComplete =
    recognitionCorrect &&
    capabilityCorrect &&
    detectiveCorrect &&
    practiceCorrect;

  /*
   * =========================================================
   * FINAL LESSON COMPLETION
   * =========================================================
   */

  const saveLessonCompletion = () => {
    if (!finalPracticeComplete) {
      return;
    }

    saveAllSectionProgress();
    setCompleted(true);
    setSection("finish");

    let completedLessons: number[] = [];

    try {
      const stored =
        localStorage.getItem(lessonCompletionKey);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          completedLessons = parsed.filter(
            (item): item is number =>
              typeof item === "number"
          );
        }
      }
    } catch {
      completedLessons = [];
    }

    /*
     * Preserve the existing compatibility key.
     * We only add Lesson 2 here.
     */
    try {
      const compatibilityStored =
        localStorage.getItem(
          "curio_completed_lessons"
        );

      if (compatibilityStored) {
        const compatibilityParsed =
          JSON.parse(compatibilityStored);

        if (Array.isArray(compatibilityParsed)) {
          completedLessons = Array.from(
            new Set([
              ...completedLessons,
              ...compatibilityParsed.filter(
                (item): item is number =>
                  typeof item === "number"
              ),
            ])
          );
        }
      }
    } catch {
      // Keep the user-scoped completion list.
    }

    if (!completedLessons.includes(2)) {
      completedLessons.push(2);
    }

    completedLessons = Array.from(
      new Set(completedLessons)
    ).sort((a, b) => a - b);

    localStorage.setItem(
      lessonCompletionKey,
      JSON.stringify(completedLessons)
    );

    // Keep one canonical compatibility key for the Learn page.
    // This must be written for guests as well as authenticated users.
    // Otherwise Lesson 2 can be complete here but Learn may still show
    // the old lesson state.
    localStorage.setItem(
      "curio_completed_lessons",
      JSON.stringify(completedLessons)
    );

    /*
     * Notify the Learn page immediately.
     */
    window.dispatchEvent(
      new CustomEvent(
        "curio:lesson-completed",
        {
          detail: {
            lesson: 2,
            completedLessons,
            sectionsCompleted:
              ALL_SECTION_IDS,
            scope: storageScope,
          },
        }
      )
    );

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: lessonCompletionKey,
        newValue:
          JSON.stringify(completedLessons),
        storageArea: localStorage,
      })
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * =========================================================
   * FEEDBACK
   * =========================================================
   */

  const getRecognitionFeedback = (
    question: string,
    answer: string | undefined
  ) => {
    if (!answer) return null;

    const feedback: Record<
      string,
      Record<string, string>
    > = {
      chatgpt: {
        chatgpt:
          "Correct. You recognised the ChatGPT identity. Build the memory from the name + visual identity + purpose. Do not rely on one particular screen layout because interfaces can change.",
        gemini:
          "Not quite. Both tools are AI assistants, so the job alone is not enough. Look at the displayed logo and the tool name together.",
        claude:
          "Not quite. Claude is also an AI assistant, but it has a different identity. Compare the name and visual clue carefully.",
      },

      gemini: {
        chatgpt:
          "Not quite. ChatGPT and Gemini can perform similar tasks. Recognition depends on the name and visual identity, not just the fact that it is an AI assistant.",
        gemini:
          "Correct. Your memory anchor is Gemini + its distinctive visual identity + its role as an AI assistant from Google.",
        claude:
          "Not quite. Claude is another AI assistant. Look at the displayed Gemini identity before deciding.",
      },

      claude: {
        chatgpt:
          "Not quite. Do not assume every conversational AI assistant is ChatGPT. The displayed identity is the important clue.",
        gemini:
          "Not quite. Gemini has a different visual identity. Compare the logo and name carefully.",
        claude:
          "Correct. You recognised Claude using the strongest clues: the name and visual identity.",
      },
    };

    return (
      feedback[question]?.[answer] ||
      "Look again and use more than one clue before deciding."
    );
  };

  const getToolChoiceFeedback = (
    question: string,
    answer: string | undefined
  ) => {
    if (!answer) return null;

    const feedback: Record<
      string,
      Record<string, string>
    > = {
      capability: {
        multimodal:
          "Correct. Multimodal means the tool can work with more than one type of information, such as text and images, when that feature is supported.",
        chatbot:
          "Not quite. Having a chat box tells you that conversation is possible, but it does not prove the tool can understand images.",
        calculator:
          "Not quite. Calculation is a specialised capability. The clue here is the ability to work with visual information as well as text.",
      },

      identity: {
        "name-logo":
          "Correct. Name + visual identity is stronger than guessing from colour, layout or one interface element.",
        logo:
          "Partly right, but a logo alone can be misleading. Use the name and visual identity together.",
        interface:
          "Not the strongest clue. Interfaces can change. Recognition should survive a redesign.",
      },

      visual: {
        "visual-input":
          "Correct. If the task includes a photograph, the important capability is visual input or image understanding.",
        chatbot:
          "Not enough. A chat box does not tell you whether the tool accepts images.",
        calculator:
          "Not relevant. Numerical calculation does not solve a visual-understanding task.",
      },

      category: {
        assistant:
          "Correct. ChatGPT, Gemini and Claude are examples of AI assistants. They are individual tools within the wider AI-tool ecosystem.",
        robot:
          "Not quite. A robot is a physical machine. These are software-based AI assistants.",
        search:
          "Not quite. Search is a capability or tool category, not the broad category that these three assistants share.",
      },
    };

    return (
      feedback[question]?.[answer] ||
      "Read the clue again and identify the capability it is really asking about."
    );
  };

  const getPracticeFeedback = (
    question: string,
    answer: string | undefined
  ) => {
    if (!answer) return null;

    const feedback: Record<
      string,
      Record<string, string>
    > = {
      school: {
        conversation:
          "Correct. The strongest clue is the need for an ongoing conversation: questions, follow-ups and explanations.",
        calculator:
          "Not quite. A calculator is useful for numerical operations, but the student needs explanation and conversation.",
        research:
          "Not the best match. The situation mainly requires an interactive explanation rather than source-focused research.",
      },

      image: {
        "visual-input":
          "Correct. The task requires a tool that supports image or visual input. The word 'picture' is the key clue.",
        chatbot:
          "Not enough information. Many chatbots exist, but not every chat interface has the same image capabilities.",
        calculator:
          "Not quite. A calculator is designed for numerical work, not discussing what is visible in a photograph.",
      },

      research: {
        research:
          "Correct. When current facts and sources matter, use a research/search-oriented workflow and verify the sources instead of treating a generated answer as automatically current.",
        chat:
          "Not the strongest choice for this clue. Conversation can help, but the task specifically emphasises current information and sources.",
        image:
          "Not relevant. The problem is about finding and checking information, not understanding or generating an image.",
      },

      creation: {
        "image-generation":
          "Correct. The task asks for a new visual to be created from instructions, so image generation is the relevant capability.",
        "visual-input":
          "Not quite. Understanding an existing image and creating a new image are different capabilities.",
        conversation:
          "Not the best match. Conversation can help plan an image, but the task specifically asks for the image itself to be generated.",
      },

      identity: {
        claude:
          "Correct. The strongest identity clue is the combination of the displayed name and visual identity. Similar capability does not make two assistants the same tool.",
        chatgpt:
          "Not quite. The situation explicitly gives the Claude identity. Do not replace the named tool with a familiar assistant.",
        gemini:
          "Not quite. Gemini may have similar capabilities, but the name and visual identity identify Claude.",
      },
    };

    return (
      feedback[question]?.[answer] ||
      "Look for the strongest clue in the situation before choosing."
    );
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <main className="lesson2-page">

      <header className="lesson2-header">

        <button
          type="button"
          className="lesson2-back-button"
          onClick={() => navigate("/learn")}
          aria-label="Back to Learn AI"
        >
          ←
        </button>

        <div className="lesson2-heading">
          <span>CURIO · LESSON 02</span>
          <h1>Understanding AI Tools</h1>
        </div>

        <div
          className="lesson2-header-progress"
          aria-label="Lesson progress"
        >
          <span>
            {progressCount} / {LESSON_SECTIONS.length} completed
          </span>

          <div className="lesson2-progress-track">
            <div
              className="lesson2-progress-fill"
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>
        </div>

      </header>

      <div className="lesson2-layout">

        <aside
          className="lesson2-navigation"
          aria-label="Lesson sections"
        >
          <div className="lesson2-nav-title">
            YOUR JOURNEY
          </div>

          {LESSON_SECTIONS.map((item, index) => {
            const unlocked =
              canOpenSection(index);

            const isCompleted =
              completedSections.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                disabled={!unlocked}
                className={`lesson2-nav-item ${
                  section === item.id
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
                  section === item.id
                    ? "step"
                    : undefined
                }
                aria-disabled={!unlocked}
              >
                <span>{item.number}</span>

                <strong>
                  {item.title}
                </strong>

                <small>
                  {isCompleted
                    ? "✓"
                    : unlocked
                    ? ""
                    : "🔒"}
                </small>
              </button>
            );
          })}
        </aside>

        <section className="lesson2-content">

          {/* =====================================================
              INTRO
          ===================================================== */}

          <div className="lesson2-intro">

            <span className="lesson2-kicker">
              AI TOOL LITERACY
            </span>

            <h2>
              Before you use an AI tool, learn to recognise what you are using.
            </h2>

            <p>
              Think about how you learned the word “apple”. You did not only
              memorise the word. You connected the name with its appearance,
              colour, shape and purpose.
            </p>

            <p>
              CURIO uses the same learning idea for AI tools. First recognise
              the tool. Then understand its capabilities. Finally, connect the
              capability to a real task.
            </p>

            <div className="lesson2-principle">

              <img
                src="/curio-symbol.png"
                alt="CURIO learning symbol"
                className="lesson2-curio-image"
              />

              <div>
                <strong>
                  NAME → LOOK → CAPABILITY → PURPOSE → TRY
                </strong>

                <p>
                  The goal is not to memorise blindly. The goal is to build a
                  useful mental picture of each tool so you can recognise it
                  when you meet it again.
                </p>
              </div>

            </div>

          </div>

          {/* =====================================================
              01 — MEET AI TOOLS
          ===================================================== */}

          {section === "meet" && (
            <div className="lesson2-card">

              <span className="lesson2-step-label">
                01 · MEET AI TOOLS
              </span>

              <h3>
                AI is not just one app.
              </h3>

              <p className="lesson2-lead">
                AI tools are like different helpers. Some are built mainly for
                conversation, some for research, some for images, some for
                coding, and some combine several abilities. A beginner does
                not need to memorise every tool — but should recognise the
                common ones and understand what kind of job each can help with.
              </p>

              <div className="lesson2-tool-grid">

                <article className="lesson2-tool-card">
                  <div className="lesson2-tool-visual chatgpt-visual">
                    <img
                      src="/chatgpt-logo.png"
                      alt="ChatGPT logo"
                      className="lesson2-tool-logo"
                    />
                  </div>

                  <strong>ChatGPT</strong>

                  <ul>
                    <li>
                      Conversational AI assistant from OpenAI.
                    </li>
                    <li>
                      Useful for questions, explanations and learning.
                    </li>
                    <li>
                      Can help draft, rewrite, brainstorm and organise ideas.
                    </li>
                    <li>
                      Supported features can include images, files, voice and
                      other tools depending on the version.
                    </li>
                  </ul>
                </article>

                <article className="lesson2-tool-card">
                  <div className="lesson2-tool-visual gemini-visual">
                    <img
                      src="/gemini-logo.png"
                      alt="Gemini logo"
                      className="lesson2-tool-logo"
                    />
                  </div>

                  <strong>Gemini</strong>

                  <ul>
                    <li>
                      Google's AI assistant.
                    </li>
                    <li>
                      Useful for conversation, explanations and creation.
                    </li>
                    <li>
                      Supported features can work with visual information and
                      other inputs.
                    </li>
                    <li>
                      Features can change, so learn the capability rather than
                      memorising one screen.
                    </li>
                  </ul>
                </article>

                <article className="lesson2-tool-card">
                  <div className="lesson2-tool-visual claude-visual">
                    <img
                      src="/claude-logo.png"
                      alt="Claude logo"
                      className="lesson2-tool-logo"
                    />
                  </div>

                  <strong>Claude</strong>

                  <ul>
                    <li>
                      Conversational AI assistant from Anthropic.
                    </li>
                    <li>
                      Useful for explanations, writing and working with text.
                    </li>
                    <li>
                      Can help analyse and organise information.
                    </li>
                    <li>
                      Always check the exact features available in the tool
                      you are using.
                    </li>
                  </ul>
                </article>

                <article className="lesson2-tool-card">
                  <div className="lesson2-tool-visual other-visual">
                    <span>🔎</span>
                  </div>

                  <strong>Research / search AI</strong>

                  <ul>
                    <li>
                      Helps find information from the web or connected sources.
                    </li>
                    <li>
                      Especially useful when freshness or sources matter.
                    </li>
                    <li>
                      A search result and a generated answer are not the same
                      thing.
                    </li>
                  </ul>
                </article>

                <article className="lesson2-tool-card">
                  <div className="lesson2-tool-visual other-visual">
                    <span>🎨</span>
                  </div>

                  <strong>Image AI</strong>

                  <ul>
                    <li>
                      Creates or edits visual content in supported tools.
                    </li>
                    <li>
                      Works from visual instructions or prompts.
                    </li>
                    <li>
                      Creating an image is different from understanding an
                      existing image.
                    </li>
                  </ul>
                </article>

                <article className="lesson2-tool-card">
                  <div className="lesson2-tool-visual other-visual">
                    <span>💻</span>
                  </div>

                  <strong>Coding AI</strong>

                  <ul>
                    <li>
                      Helps write, explain and transform code.
                    </li>
                    <li>
                      Can help identify likely programming mistakes.
                    </li>
                    <li>
                      Code still needs to be tested and reviewed.
                    </li>
                  </ul>
                </article>

              </div>

              <div className="lesson2-knowledge-grid">

                <div>
                  <strong>AI assistant</strong>
                  <ul>
                    <li>
                      Talks with you.
                    </li>
                    <li>
                      Answers questions and explains ideas.
                    </li>
                    <li>
                      Can create or transform information.
                    </li>
                  </ul>
                </div>

                <div>
                  <strong>Research / search</strong>
                  <ul>
                    <li>
                      Helps locate information.
                    </li>
                    <li>
                      Useful when current facts or sources matter.
                    </li>
                    <li>
                      Sources still need checking.
                    </li>
                  </ul>
                </div>

                <div>
                  <strong>Image AI</strong>
                  <ul>
                    <li>
                      Creates or edits visual content.
                    </li>
                    <li>
                      May work from text instructions.
                    </li>
                    <li>
                      Capability depends on the tool.
                    </li>
                  </ul>
                </div>

                <div>
                  <strong>Coding AI</strong>
                  <ul>
                    <li>
                      Helps with programming tasks.
                    </li>
                    <li>
                      Can explain errors and code.
                    </li>
                    <li>
                      Results should be tested.
                    </li>
                  </ul>
                </div>

              </div>

              <div className="lesson2-note">
                <span>💡</span>

                <div>
                  <strong>
                    Beginner rule
                  </strong>

                  <span>
                    The name tells you which tool you opened. The capabilities
                    tell you what that tool can attempt. Never assume that one
                    AI tool is automatically the best choice for every job.
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="lesson2-primary"
                onClick={goNext}
              >
                I understand the difference → Recognise ChatGPT
              </button>

            </div>
          )}

          {/* =====================================================
              02 — CHATGPT
          ===================================================== */}

          {section === "chatgpt" && (
            <div className="lesson2-card">

              <span className="lesson2-step-label">
                02 · RECOGNISE CHATGPT
              </span>

              <h3>
                Learn the “face” of ChatGPT.
              </h3>

              <p className="lesson2-lead">
                Your brain recognises an apple because the word “apple” became
                connected with its shape, colour and purpose. Do the same with
                AI tools: connect the name, visual identity and general role.
              </p>

              <div className="lesson2-recognition-card">

                <div className="lesson2-logo-large chatgpt-visual">
                  <img
                    src="/chatgpt-logo.png"
                    alt="ChatGPT logo"
                    className="lesson2-logo-image"
                  />
                </div>

                <div>
                  <span className="lesson2-mini-label">
                    TOOL NAME
                  </span>

                  <h4>
                    ChatGPT
                  </h4>

                  <ul>
                    <li>
                      Look for the name “ChatGPT”.
                    </li>
                    <li>
                      Notice the OpenAI / ChatGPT visual identity shown here.
                    </li>
                    <li>
                      The interface may change across versions and devices.
                    </li>
                    <li>
                      Connect the identity with conversational AI: ask, explain,
                      create and continue a discussion.
                    </li>
                  </ul>
                </div>

              </div>

              <div className="lesson2-memory-grid">

                <div>
                  <span>👀</span>
                  <strong>LOOK</strong>
                  <p>
                    Name + visual identity. Do not memorise only one screen.
                  </p>
                </div>

                <div>
                  <span>🧠</span>
                  <strong>CONNECT</strong>
                  <p>
                    Connect the identity with an AI assistant used for
                    conversation and creation.
                  </p>
                </div>

                <div>
                  <span>🎯</span>
                  <strong>PURPOSE</strong>
                  <p>
                    Think: “This is an AI assistant I can interact with.”
                  </p>
                </div>

              </div>

              <div className="lesson2-bullet-panel">
                <strong>
                  What should stay in your memory?
                </strong>

                <ul>
                  <li>
                    The logo is a recognition clue, not proof that every
                    possible feature is available.
                  </li>
                  <li>
                    The interface can change without changing the identity of
                    the tool.
                  </li>
                  <li>
                    Check the name before entering information or assuming you
                    are using the intended service.
                  </li>
                  <li>
                    “AI assistant” does not mean “always correct”.
                  </li>
                </ul>
              </div>

              <h4 className="lesson2-question-title">
                Recognition challenge: which tool is shown above?
              </h4>

              <div className="lesson2-choice-row">

                <button
                  type="button"
                  className={
                    recognitionAnswers.chatgpt === "chatgpt"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerRecognition("chatgpt", "chatgpt")
                  }
                >
                  <img
                    src="/chatgpt-logo.png"
                    alt=""
                    className="lesson2-choice-logo"
                  />
                  ChatGPT
                </button>

                <button
                  type="button"
                  className={
                    recognitionAnswers.chatgpt === "gemini"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerRecognition("chatgpt", "gemini")
                  }
                >
                  <img
                    src="/gemini-logo.png"
                    alt=""
                    className="lesson2-choice-logo"
                  />
                  Gemini
                </button>

                <button
                  type="button"
                  className={
                    recognitionAnswers.chatgpt === "claude"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerRecognition("chatgpt", "claude")
                  }
                >
                  <img
                    src="/claude-logo.png"
                    alt=""
                    className="lesson2-choice-logo"
                  />
                  Claude
                </button>

              </div>

              {recognitionAnswers.chatgpt && (
                <div
                  className={`lesson2-feedback ${
                    recognitionAnswers.chatgpt === "chatgpt"
                      ? "correct"
                      : "wrong"
                  }`}
                >
                  {getRecognitionFeedback(
                    "chatgpt",
                    recognitionAnswers.chatgpt
                  )}
                </div>
              )}

              <button
                type="button"
                className="lesson2-primary"
                onClick={goNext}
                disabled={
                  recognitionAnswers.chatgpt !== "chatgpt"
                }
              >
                Correct → Recognise Gemini
              </button>

            </div>
          )}

          {/* =====================================================
              03 — GEMINI
          ===================================================== */}

          {section === "gemini" && (
            <div className="lesson2-card">

              <span className="lesson2-step-label">
                03 · RECOGNISE GEMINI
              </span>

              <h3>
                Now learn to recognise Gemini.
              </h3>

              <p className="lesson2-lead">
                Two AI assistants can do similar jobs and still be different
                tools. Recognition means noticing the identity first, then
                learning what that tool can do.
              </p>

              <div className="lesson2-recognition-card">

                <div className="lesson2-logo-large gemini-visual">
                  <img
                    src="/gemini-logo.png"
                    alt="Gemini logo"
                    className="lesson2-logo-image"
                  />
                </div>

                <div>
                  <span className="lesson2-mini-label">
                    TOOL NAME
                  </span>

                  <h4>
                    Gemini
                  </h4>

                  <ul>
                    <li>
                      Look for the name “Gemini”.
                    </li>
                    <li>
                      Use the displayed Gemini visual identity as a memory
                      anchor.
                    </li>
                    <li>
                      Gemini is Google's AI assistant.
                    </li>
                    <li>
                      Supported features can include text and visual information,
                      depending on the product and feature.
                    </li>
                  </ul>
                </div>

              </div>

              <div className="lesson2-memory-grid">

                <div>
                  <span>👀</span>
                  <strong>LOOK</strong>
                  <p>
                    Notice the Gemini name and its distinctive visual identity.
                  </p>
                </div>

                <div>
                  <span>🔗</span>
                  <strong>CONNECT</strong>
                  <p>
                    Connect the identity with Google's AI assistant.
                  </p>
                </div>

                <div>
                  <span>🖼️</span>
                  <strong>CAPABILITY</strong>
                  <p>
                    Some supported features can work with visual information.
                  </p>
                </div>

              </div>

              <div className="lesson2-bullet-panel">
                <strong>
                  Recognition rule
                </strong>

                <ul>
                  <li>
                    Do not identify Gemini simply because something “looks like
                    AI”.
                  </li>
                  <li>
                    Use the name + logo + context together.
                  </li>
                  <li>
                    Similar tasks do not mean two tools are the same tool.
                  </li>
                  <li>
                    Capabilities can change as products are updated.
                  </li>
                </ul>
              </div>

              <h4 className="lesson2-question-title">
                Which visual identity represents Gemini?
              </h4>

              <div className="lesson2-choice-row">

                <button
                  type="button"
                  className={
                    recognitionAnswers.gemini === "chatgpt"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerRecognition("gemini", "chatgpt")
                  }
                >
                  <img
                    src="/chatgpt-logo.png"
                    alt=""
                    className="lesson2-choice-logo"
                  />
                  ChatGPT
                </button>

                <button
                  type="button"
                  className={
                    recognitionAnswers.gemini === "gemini"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerRecognition("gemini", "gemini")
                  }
                >
                  <img
                    src="/gemini-logo.png"
                    alt=""
                    className="lesson2-choice-logo"
                  />
                  Gemini
                </button>

                <button
                  type="button"
                  className={
                    recognitionAnswers.gemini === "claude"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerRecognition("gemini", "claude")
                  }
                >
                  <img
                    src="/claude-logo.png"
                    alt=""
                    className="lesson2-choice-logo"
                  />
                  Claude
                </button>

              </div>

              {recognitionAnswers.gemini && (
                <div
                  className={`lesson2-feedback ${
                    recognitionAnswers.gemini === "gemini"
                      ? "correct"
                      : "wrong"
                  }`}
                >
                  {getRecognitionFeedback(
                    "gemini",
                    recognitionAnswers.gemini
                  )}
                </div>
              )}

              <button
                type="button"
                className="lesson2-primary"
                onClick={goNext}
                disabled={
                  recognitionAnswers.gemini !== "gemini"
                }
              >
                Correct → Recognise Claude
              </button>

            </div>
          )}

          {/* =====================================================
              04 — CLAUDE
          ===================================================== */}

          {section === "claude" && (
            <div className="lesson2-card">

              <span className="lesson2-step-label">
                04 · RECOGNISE CLAUDE
              </span>

              <h3>
                Meet Claude — and make recognition harder.
              </h3>

              <p className="lesson2-lead">
                ChatGPT, Gemini and Claude are all conversational AI assistants.
                That means the question “Can it answer me?” is not enough to
                identify one of them. You need stronger recognition clues.
              </p>

              <div className="lesson2-recognition-card">

                <div className="lesson2-logo-large claude-visual">
                  <img
                    src="/claude-logo.png"
                    alt="Claude logo"
                    className="lesson2-logo-image"
                  />
                </div>

                <div>
                  <span className="lesson2-mini-label">
                    TOOL NAME
                  </span>

                  <h4>
                    Claude
                  </h4>

                  <ul>
                    <li>
                      Look for the name “Claude”.
                    </li>
                    <li>
                      Learn the visual identity shown in this lesson.
                    </li>
                    <li>
                      Claude is a conversational AI assistant from Anthropic.
                    </li>
                    <li>
                      Its capabilities can overlap with other assistants, so
                      identity and capability are separate ideas.
                    </li>
                  </ul>
                </div>

              </div>

              <div className="lesson2-warning">
                <strong>
                  Important distinction
                </strong>

                <p>
                  <b>Identity</b> answers “Which tool is this?”
                  <br />
                  <b>Capability</b> answers “What can this tool do?”
                  <br />
                  <b>Task</b> answers “What am I trying to accomplish?”
                </p>

                <p>
                  Several tools may be capable of the same task. CURIO teaches
                  you to identify the tool first and then check the exact
                  capability available.
                </p>
              </div>

              <h4 className="lesson2-question-title">
                You see the exact Claude logo and the name “Claude”.
                Which is the strongest conclusion?
              </h4>

              <div className="lesson2-choice-row lesson2-choice-grid">

                <button
                  type="button"
                  className={
                    recognitionAnswers.claude === "chatgpt"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerRecognition("claude", "chatgpt")
                  }
                >
                  <img
                    src="/chatgpt-logo.png"
                    alt=""
                    className="lesson2-choice-logo"
                  />
                  It must be ChatGPT because it is an AI assistant
                </button>

                <button
                  type="button"
                  className={
                    recognitionAnswers.claude === "gemini"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerRecognition("claude", "gemini")
                  }
                >
                  <img
                    src="/gemini-logo.png"
                    alt=""
                    className="lesson2-choice-logo"
                  />
                  It is probably Gemini because AI assistants are similar
                </button>

                <button
                  type="button"
                  className={
                    recognitionAnswers.claude === "claude"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerRecognition("claude", "claude")
                  }
                >
                  <img
                    src="/claude-logo.png"
                    alt=""
                    className="lesson2-choice-logo"
                  />
                  It is Claude because the name and visual identity match
                </button>

              </div>

              {recognitionAnswers.claude && (
                <div
                  className={`lesson2-feedback ${
                    recognitionAnswers.claude === "claude"
                      ? "correct"
                      : "wrong"
                  }`}
                >
                  {getRecognitionFeedback(
                    "claude",
                    recognitionAnswers.claude
                  )}
                </div>
              )}

              <button
                type="button"
                className="lesson2-primary"
                onClick={goNext}
                disabled={
                  recognitionAnswers.claude !== "claude"
                }
              >
                Correct → Understand AI capabilities
              </button>

            </div>
          )}

          {/* =====================================================
              05 — CAPABILITIES
          ===================================================== */}

          {section === "tools" && (
            <div className="lesson2-card">

              <span className="lesson2-step-label">
                05 · UNDERSTAND AI CAPABILITIES
              </span>

              <h3>
                A tool has capabilities — not magic powers.
              </h3>

              <p className="lesson2-lead">
                Once you recognise the tool, ask a second question:
                “What can this tool actually help me do?” The same AI assistant
                may have several capabilities, while another tool may specialise
                in one area. Features also vary by product, version and plan.
              </p>

              <div className="lesson2-ability-list">

                <div>
                  <span>💬</span>

                  <div>
                    <strong>
                      Conversation & explanation
                    </strong>

                    <ul>
                      <li>
                        Ask questions and follow up.
                      </li>
                      <li>
                        Request simpler explanations.
                      </li>
                      <li>
                        Brainstorm and learn through dialogue.
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <span>✍️</span>

                  <div>
                    <strong>
                      Writing & transformation
                    </strong>

                    <ul>
                      <li>
                        Draft text.
                      </li>
                      <li>
                        Rewrite or summarise.
                      </li>
                      <li>
                        Change tone, structure or level.
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <span>🖼️</span>

                  <div>
                    <strong>
                      Visual understanding
                    </strong>

                    <ul>
                      <li>
                        Some tools accept images.
                      </li>
                      <li>
                        They may describe or discuss visual content.
                      </li>
                      <li>
                        Availability depends on the specific feature.
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <span>🔎</span>

                  <div>
                    <strong>
                      Search & research
                    </strong>

                    <ul>
                      <li>
                        Find information from sources.
                      </li>
                      <li>
                        Useful when current facts matter.
                      </li>
                      <li>
                        Sources should still be checked.
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <span>💻</span>

                  <div>
                    <strong>
                      Coding
                    </strong>

                    <ul>
                      <li>
                        Generate or explain code.
                      </li>
                      <li>
                        Help identify likely errors.
                      </li>
                      <li>
                        Code must still be tested.
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <span>🎨</span>

                  <div>
                    <strong>
                      Image creation
                    </strong>

                    <ul>
                      <li>
                        Create visual concepts from instructions.
                      </li>
                      <li>
                        Edit images in supported tools.
                      </li>
                      <li>
                        Creation is different from image understanding.
                      </li>
                    </ul>
                  </div>
                </div>

              </div>

              <div className="lesson2-highlight">
                <span>💡</span>

                <div>
                  <strong>
                    Capability ≠ guarantee
                  </strong>

                  <p>
                    If an AI tool can attempt a task, that does not mean the
                    result is automatically correct. Capability tells you what
                    the tool can attempt — not whether the answer is reliable.
                  </p>
                </div>
              </div>

              <h4 className="lesson2-question-title">
                A tool accepts text and images. Which statement is the most accurate?
              </h4>

              <div className="lesson2-choice-row lesson2-choice-grid">

                <button
                  type="button"
                  className={
                    toolChoices.capability === "multimodal"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerToolChoice(
                      "capability",
                      "multimodal"
                    )
                  }
                >
                  It can work with more than one type of information; this is
                  called multimodal capability
                </button>

                <button
                  type="button"
                  className={
                    toolChoices.capability === "chatbot"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerToolChoice(
                      "capability",
                      "chatbot"
                    )
                  }
                >
                  Every chatbot automatically understands every type of input
                </button>

                <button
                  type="button"
                  className={
                    toolChoices.capability === "calculator"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerToolChoice(
                      "capability",
                      "calculator"
                    )
                  }
                >
                  If it accepts images, every answer it gives must be accurate
                </button>

              </div>

              {toolChoices.capability && (
                <div
                  className={`lesson2-feedback ${
                    toolChoices.capability === "multimodal"
                      ? "correct"
                      : "wrong"
                  }`}
                >
                  {getToolChoiceFeedback(
                    "capability",
                    toolChoices.capability
                  )}
                </div>
              )}

              <button
                type="button"
                className="lesson2-primary"
                onClick={goNext}
                disabled={!capabilityCorrect}
              >
                I understand capabilities → Tool detective
              </button>

            </div>
          )}

          {/* =====================================================
              06 — TOOL DETECTIVE
          ===================================================== */}

          {section === "recognize" && (
            <div className="lesson2-card">

              <span className="lesson2-step-label">
                06 · TOOL DETECTIVE
              </span>

              <h3>
                Can you identify the important clue?
              </h3>

              <p className="lesson2-lead">
                Now the questions become less obvious. Do not search for one
                magic word. Combine the name, visual identity, category,
                capability and task.
              </p>

              <div className="lesson2-scenario">
                <div className="lesson2-scenario-icon">
                  🧠
                </div>

                <div>
                  <span>
                    CLUE 01 · IDENTITY
                  </span>

                  <h4>
                    You open an AI website. The page shows a tool name and a
                    distinctive logo. The chat layout looks familiar. What is
                    the strongest first step for identifying the tool?
                  </h4>
                </div>
              </div>

              <div className="lesson2-choice-row lesson2-choice-grid">

                <button
                  type="button"
                  className={
                    toolChoices.identity === "name-logo"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerToolChoice(
                      "identity",
                      "name-logo"
                    )
                  }
                >
                  Use the tool name together with its visual identity
                </button>

                <button
                  type="button"
                  className={
                    toolChoices.identity === "logo"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerToolChoice(
                      "identity",
                      "logo"
                    )
                  }
                >
                  Decide only from the page colour
                </button>

                <button
                  type="button"
                  className={
                    toolChoices.identity === "interface"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerToolChoice(
                      "identity",
                      "interface"
                    )
                  }
                >
                  Decide only from the shape of the chat box
                </button>

              </div>

              {toolChoices.identity && (
                <div
                  className={`lesson2-feedback ${
                    toolChoices.identity === "name-logo"
                      ? "correct"
                      : "wrong"
                  }`}
                >
                  {getToolChoiceFeedback(
                    "identity",
                    toolChoices.identity
                  )}
                </div>
              )}

              <div className="lesson2-scenario">
                <div className="lesson2-scenario-icon">
                  🖼️
                </div>

                <div>
                  <span>
                    CLUE 02 · CAPABILITY
                  </span>

                  <h4>
                    You have a photograph of a plant. You want to ask an AI
                    assistant what it can see in the photograph. Which
                    capability matters most?
                  </h4>
                </div>
              </div>

              <div className="lesson2-choice-row lesson2-choice-grid">

                <button
                  type="button"
                  className={
                    toolChoices.visual === "visual-input"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerToolChoice(
                      "visual",
                      "visual-input"
                    )
                  }
                >
                  Support for visual input / image understanding
                </button>

                <button
                  type="button"
                  className={
                    toolChoices.visual === "chatbot"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerToolChoice(
                      "visual",
                      "chatbot"
                    )
                  }
                >
                  Only having a text chat box
                </button>

                <button
                  type="button"
                  className={
                    toolChoices.visual === "calculator"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerToolChoice(
                      "visual",
                      "calculator"
                    )
                  }
                >
                  Numerical calculation
                </button>

              </div>

              {toolChoices.visual && (
                <div
                  className={`lesson2-feedback ${
                    toolChoices.visual === "visual-input"
                      ? "correct"
                      : "wrong"
                  }`}
                >
                  {getToolChoiceFeedback(
                    "visual",
                    toolChoices.visual
                  )}
                </div>
              )}

              <div className="lesson2-scenario">
                <div className="lesson2-scenario-icon">
                  💬
                </div>

                <div>
                  <span>
                    CLUE 03 · CATEGORY
                  </span>

                  <h4>
                    ChatGPT, Gemini and Claude are individual examples of what
                    broad kind of AI software?
                  </h4>
                </div>
              </div>

              <div className="lesson2-choice-row lesson2-choice-grid">

                <button
                  type="button"
                  className={
                    toolChoices.category === "assistant"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerToolChoice(
                      "category",
                      "assistant"
                    )
                  }
                >
                  AI assistants
                </button>

                <button
                  type="button"
                  className={
                    toolChoices.category === "robot"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerToolChoice(
                      "category",
                      "robot"
                    )
                  }
                >
                  Physical robots
                </button>

                <button
                  type="button"
                  className={
                    toolChoices.category === "search"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerToolChoice(
                      "category",
                      "search"
                    )
                  }
                >
                  Search engines only
                </button>

              </div>

              {toolChoices.category && (
                <div
                  className={`lesson2-feedback ${
                    toolChoices.category === "assistant"
                      ? "correct"
                      : "wrong"
                  }`}
                >
                  {getToolChoiceFeedback(
                    "category",
                    toolChoices.category
                  )}
                </div>
              )}

              <button
                type="button"
                className="lesson2-primary"
                onClick={goNext}
                disabled={!detectiveCorrect}
              >
                Detective complete → Choose tools wisely
              </button>

            </div>
          )}

          {/* =====================================================
              07 — CHOOSE TOOL
          ===================================================== */}

          {section === "choose" && (
            <div className="lesson2-card">

              <span className="lesson2-step-label">
                07 · CHOOSE THE RIGHT TOOL
              </span>

              <h3>
                Do not ask “Which AI is best?”
              </h3>

              <p className="lesson2-lead">
                A better beginner question is:
                “Which tool has the capability I need for this job?”
                The answer depends on the task, the information you have,
                the features available and whether you need current sources.
              </p>

              <div className="lesson2-job-grid">

                <article>
                  <span>💬</span>

                  <strong>
                    Conversation
                  </strong>

                  <ul>
                    <li>
                      Learn a difficult concept.
                    </li>
                    <li>
                      Ask follow-up questions.
                    </li>
                    <li>
                      Brainstorm or improve an idea.
                    </li>
                  </ul>
                </article>

                <article>
                  <span>🖼️</span>

                  <strong>
                    Visual work
                  </strong>

                  <ul>
                    <li>
                      Understand an existing image.
                    </li>
                    <li>
                      Discuss visual information.
                    </li>
                    <li>
                      Create or edit an image with a suitable tool.
                    </li>
                  </ul>
                </article>

                <article>
                  <span>🔎</span>

                  <strong>
                    Research
                  </strong>

                  <ul>
                    <li>
                      Find information.
                    </li>
                    <li>
                      Look for current facts.
                    </li>
                    <li>
                      Trace and check sources.
                    </li>
                  </ul>
                </article>

                <article>
                  <span>💻</span>

                  <strong>
                    Coding
                  </strong>

                  <ul>
                    <li>
                      Write or transform code.
                    </li>
                    <li>
                      Explain programming errors.
                    </li>
                    <li>
                      Test and verify the result.
                    </li>
                  </ul>
                </article>

                <article>
                  <span>🎨</span>

                  <strong>
                    Image creation
                  </strong>

                  <ul>
                    <li>
                      Create a new visual from instructions.
                    </li>
                    <li>
                      Explore different visual ideas.
                    </li>
                    <li>
                      Use a tool that supports image generation.
                    </li>
                  </ul>
                </article>

                <article>
                  <span>📄</span>

                  <strong>
                    Document work
                  </strong>

                  <ul>
                    <li>
                      Summarise or organise information.
                    </li>
                    <li>
                      Extract useful points from supported files.
                    </li>
                    <li>
                      Check the output against the original.
                    </li>
                  </ul>
                </article>

              </div>

              <div className="lesson2-decision-rule">

                <strong>
                  THE BEGINNER DECISION RULE
                </strong>

                <ol>
                  <li>
                    What job am I trying to do?
                  </li>
                  <li>
                    What information do I need to give the tool?
                  </li>
                  <li>
                    What capability does the tool need?
                  </li>
                  <li>
                    Do I need current information or sources?
                  </li>
                  <li>
                    How will I check whether the result makes sense?
                  </li>
                </ol>

              </div>

              <div className="lesson2-note">
                <span>🧠</span>

                <div>
                  <strong>
                    There is no single “best AI”.
                  </strong>

                  <span>
                    A good AI-literate user chooses according to the task,
                    not according to popularity alone.
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="lesson2-primary"
                onClick={goNext}
              >
                I know how to choose → Final practice
              </button>

            </div>
          )}

          {/* =====================================================
              08 — FINAL PRACTICE
          ===================================================== */}

          {section === "practice" && (
            <div className="lesson2-card">

              <span className="lesson2-step-label">
                08 · FINAL TOOL PRACTICE
              </span>

              <h3>
                Show that you can recognise the right tool.
              </h3>

              <p className="lesson2-lead">
                These questions are intentionally harder than the recognition
                cards. Read the whole situation, find the strongest clue and
                then decide. If you choose incorrectly, CURIO explains why.
              </p>

              <div className="lesson2-practice-item">
                <div className="lesson2-practice-number">
                  01
                </div>

                <div>
                  <h4>
                    A student is confused about a difficult science topic.
                    They want to ask several follow-up questions, request a
                    simpler explanation and keep discussing the same idea.
                    Which type of AI tool best matches the job?
                  </h4>

                  <div className="lesson2-choice-row">

                    <button
                      type="button"
                      className={
                        practiceAnswers.school === "conversation"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "school",
                          "conversation"
                        )
                      }
                    >
                      Conversational AI assistant
                    </button>

                    <button
                      type="button"
                      className={
                        practiceAnswers.school === "calculator"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "school",
                          "calculator"
                        )
                      }
                    >
                      Calculator
                    </button>

                    <button
                      type="button"
                      className={
                        practiceAnswers.school === "research"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "school",
                          "research"
                        )
                      }
                    >
                      Research-only workflow
                    </button>

                  </div>

                  {practiceAnswers.school && (
                    <div
                      className={`lesson2-feedback ${
                        practiceAnswers.school === "conversation"
                          ? "correct"
                          : "wrong"
                      }`}
                    >
                      {getPracticeFeedback(
                        "school",
                        practiceAnswers.school
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="lesson2-practice-item">
                <div className="lesson2-practice-number">
                  02
                </div>

                <div>
                  <h4>
                    You upload a photograph and want an AI assistant to discuss
                    what is visible in it. Two assistants are available, but
                    one accepts ordinary text only. What should you look for
                    before choosing?
                  </h4>

                  <div className="lesson2-choice-row">

                    <button
                      type="button"
                      className={
                        practiceAnswers.image === "visual-input"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "image",
                          "visual-input"
                        )
                      }
                    >
                      Visual / multimodal input
                    </button>

                    <button
                      type="button"
                      className={
                        practiceAnswers.image === "chatbot"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "image",
                          "chatbot"
                        )
                      }
                    >
                      Only the presence of a chat box
                    </button>

                    <button
                      type="button"
                      className={
                        practiceAnswers.image === "calculator"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "image",
                          "calculator"
                        )
                      }
                    >
                      Calculator support
                    </button>

                  </div>

                  {practiceAnswers.image && (
                    <div
                      className={`lesson2-feedback ${
                        practiceAnswers.image === "visual-input"
                          ? "correct"
                          : "wrong"
                      }`}
                    >
                      {getPracticeFeedback(
                        "image",
                        practiceAnswers.image
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="lesson2-practice-item">
                <div className="lesson2-practice-number">
                  03
                </div>

                <div>
                  <h4>
                    You need information about a topic where current facts and
                    sources matter. Which approach shows the strongest AI-tool
                    understanding?
                  </h4>

                  <div className="lesson2-choice-row">

                    <button
                      type="button"
                      className={
                        practiceAnswers.research === "research"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "research",
                          "research"
                        )
                      }
                    >
                      Use a research/search-oriented workflow and check sources
                    </button>

                    <button
                      type="button"
                      className={
                        practiceAnswers.research === "chat"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "research",
                          "chat"
                        )
                      }
                    >
                      Trust the first AI answer without checking
                    </button>

                    <button
                      type="button"
                      className={
                        practiceAnswers.research === "image"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "research",
                          "image"
                        )
                      }
                    >
                      Use an image generator
                    </button>

                  </div>

                  {practiceAnswers.research && (
                    <div
                      className={`lesson2-feedback ${
                        practiceAnswers.research === "research"
                          ? "correct"
                          : "wrong"
                      }`}
                    >
                      {getPracticeFeedback(
                        "research",
                        practiceAnswers.research
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="lesson2-practice-item">
                <div className="lesson2-practice-number">
                  04
                </div>

                <div>
                  <h4>
                    You want a new poster image created from your written
                    description. Which capability is the actual requirement?
                  </h4>

                  <div className="lesson2-choice-row">

                    <button
                      type="button"
                      className={
                        practiceAnswers.creation === "image-generation"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "creation",
                          "image-generation"
                        )
                      }
                    >
                      Image generation
                    </button>

                    <button
                      type="button"
                      className={
                        practiceAnswers.creation === "visual-input"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "creation",
                          "visual-input"
                        )
                      }
                    >
                      Image understanding only
                    </button>

                    <button
                      type="button"
                      className={
                        practiceAnswers.creation === "conversation"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "creation",
                          "conversation"
                        )
                      }
                    >
                      Text conversation only
                    </button>

                  </div>

                  {practiceAnswers.creation && (
                    <div
                      className={`lesson2-feedback ${
                        practiceAnswers.creation === "image-generation"
                          ? "correct"
                          : "wrong"
                      }`}
                    >
                      {getPracticeFeedback(
                        "creation",
                        practiceAnswers.creation
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="lesson2-practice-item">
                <div className="lesson2-practice-number">
                  05
                </div>

                <div>
                  <h4>
                    An AI assistant looks similar to another assistant you have
                    used before. The displayed name and visual identity clearly
                    identify it as Claude. What should you conclude?
                  </h4>

                  <div className="lesson2-choice-row">

                    <button
                      type="button"
                      className={
                        practiceAnswers.identity === "claude"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "identity",
                          "claude"
                        )
                      }
                    >
                      Claude
                    </button>

                    <button
                      type="button"
                      className={
                        practiceAnswers.identity === "chatgpt"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "identity",
                          "chatgpt"
                        )
                      }
                    >
                      ChatGPT
                    </button>

                    <button
                      type="button"
                      className={
                        practiceAnswers.identity === "gemini"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice(
                          "identity",
                          "gemini"
                        )
                      }
                    >
                      Gemini
                    </button>

                  </div>

                  {practiceAnswers.identity && (
                    <div
                      className={`lesson2-feedback ${
                        practiceAnswers.identity === "claude"
                          ? "correct"
                          : "wrong"
                      }`}
                    >
                      {getPracticeFeedback(
                        "identity",
                        practiceAnswers.identity
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="lesson2-practice-score">

                <div>
                  <strong>
                    Your practice
                  </strong>

                  <span>
                    {Object.keys(practiceAnswers).length} / 5 answered
                  </span>
                </div>

                <div className="lesson2-mini-progress">
                  <div
                    style={{
                      width: `${
                        (Object.keys(practiceAnswers).length / 5) * 100
                      }%`,
                    }}
                  />
                </div>

              </div>

              <button
                type="button"
                className="lesson2-primary"
                onClick={() => {
                  if (!practiceCorrect) return;

                  saveAllSectionProgress();
                  setSection("finish");

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                disabled={!practiceCorrect}
              >
                All five correct → Final lesson check
              </button>

            </div>
          )}

          {/* =====================================================
              FINAL CHECK
          ===================================================== */}

          {section === "finish" && (
            <div className="lesson2-card">

              <span className="lesson2-step-label">
                FINAL · SHOW WHAT YOU LEARNED
              </span>

              <h3>
                You can now recognise and reason about AI tools.
              </h3>

              <p className="lesson2-lead">
                Before completing Lesson 2, connect everything together. You
                are learning a repeatable skill — not memorising a list of
                brand names.
              </p>

              <div className="lesson2-final-task">

                <img
                  src="/curio-symbol.png"
                  alt="CURIO learning symbol"
                  className="lesson2-curio-image"
                />

                <div>
                  <span className="lesson2-mini-label">
                    YOUR FINAL CHALLENGE
                  </span>

                  <h4>
                    Imagine a friend asks:
                    “How do I know which AI tool I am using and whether it fits
                    the job?”
                  </h4>

                  <ul>
                    <li>
                      First identify the tool using its name and visual identity.
                    </li>
                    <li>
                      Then identify the capability the task requires.
                    </li>
                    <li>
                      Match the task to a tool that supports that capability.
                    </li>
                    <li>
                      Remember that a capability does not guarantee a correct
                      result.
                    </li>
                    <li>
                      When information matters, check the result and its sources.
                    </li>
                  </ul>
                </div>

              </div>

              <div className="lesson2-final-checklist">

                <div
                  className={
                    recognitionCorrect
                      ? "done"
                      : ""
                  }
                >
                  <span>
                    {recognitionCorrect ? "✓" : "1"}
                  </span>
                  Recognise ChatGPT, Gemini and Claude
                </div>

                <div
                  className={
                    capabilityCorrect
                      ? "done"
                      : ""
                  }
                >
                  <span>
                    {capabilityCorrect ? "✓" : "2"}
                  </span>
                  Understand common AI capabilities
                </div>

                <div
                  className={
                    detectiveCorrect
                      ? "done"
                      : ""
                  }
                >
                  <span>
                    {detectiveCorrect ? "✓" : "3"}
                  </span>
                  Use several clues instead of guessing
                </div>

                <div
                  className={
                    practiceCorrect
                      ? "done"
                      : ""
                  }
                >
                  <span>
                    {practiceCorrect ? "✓" : "4"}
                  </span>
                  Match capabilities to real tasks
                </div>

              </div>

              {!finalPracticeComplete && (
                <div className="lesson2-feedback wrong">
                  Complete the recognition and practice activities first.
                  CURIO is designed to teach the reasoning behind the answer,
                  not just the answer itself.
                </div>
              )}

              {!completed ? (
                <button
                  type="button"
                  className="lesson2-primary complete-button"
                  disabled={!finalPracticeComplete}
                  onClick={saveLessonCompletion}
                >
                  Complete Lesson 2 ✓
                </button>
              ) : (
                <div className="lesson2-completion-panel">

                  <div className="lesson2-completion-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Lesson 2 complete!
                    </strong>

                    <p>
                      You can now recognise common AI assistants, understand
                      important AI-tool capabilities, distinguish identity from
                      capability, and choose a tool based on the job you want
                      to perform.
                    </p>
                  </div>

                </div>
              )}

              {completed && (
                <div className="lesson2-next-lesson-panel">
                  <strong>Progress saved: 2 / 8 lessons completed</strong>
                  <p>
                    Lesson 3 is now unlocked. Continue with <b>What is a Prompt?</b>.
                  </p>

                  <button
                    type="button"
                    className="lesson2-back-learning-button"
                    onClick={() =>
                      navigate("/learn/lesson/3")
                    }
                  >
                    Start Lesson 3 →
                  </button>
                </div>
              )}

            </div>
          )}

          {/* =====================================================
              BACK BUTTON
          ===================================================== */}

          {section !== "meet" && section !== "finish" && (
            <button
              type="button"
              className="lesson2-secondary-button"
              onClick={goPrevious}
            >
              ← Previous section
            </button>
          )}

        </section>
      </div>
    </main>
  );
}

export default Lesson2;