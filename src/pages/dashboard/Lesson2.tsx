import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Lesson2.css";
import { useLessonProgress } from "../../hooks/useLessonProgress.ts";

type LessonSection =
  | "meet"
  | "chatgpt"
  | "gemini"
  | "tools"
  | "recognize"
  | "choose"
  | "practice"
  | "finish";

function Lesson2() {
  const navigate = useNavigate();

  const [section, setSection] = useState<LessonSection>("meet");

  const [recognitionAnswers, setRecognitionAnswers] = useState<
    Record<string, string>
  >({});

  const [toolChoices, setToolChoices] = useState<Record<string, string>>({});

  const [practiceAnswers, setPracticeAnswers] = useState<
    Record<string, string>
  >({});

  const [completed, setCompleted] = useState(false);

  /* =========================================
     CURIO SUPABASE PROGRESS
     Lesson 2 always has exactly 8 sections.
  ========================================== */
  const {
    loading: progressLoading,
    saving: progressSaving,
    error: progressError,
    currentSection: savedCurrentSection,
    completedSections: savedCompletedSections,
    completed: savedCompleted,
    updateProgress,
    markComplete,
  } = useLessonProgress(2, 8);

  const sections: {
    id: LessonSection;
    number: string;
    title: string;
  }[] = [
    { id: "meet", number: "01", title: "Meet AI tools" },
    { id: "chatgpt", number: "02", title: "Recognise ChatGPT" },
    { id: "gemini", number: "03", title: "Recognise Gemini" },
    { id: "tools", number: "04", title: "What can tools do?" },
    { id: "recognize", number: "05", title: "Tool detective" },
    { id: "choose", number: "06", title: "Choose the right tool" },
    { id: "practice", number: "07", title: "Use an AI tool" },
    { id: "finish", number: "08", title: "Final practice" },
  ];

  const currentIndex = sections.findIndex((item) => item.id === section);

  /* =========================================
     RESTORE PROGRESS AFTER REFRESH
  ========================================== */
  useEffect(() => {
    if (progressLoading) return;

    if (savedCompleted) {
      setCompleted(true);
      setSection("finish");
      return;
    }

    if (savedCurrentSection > 0) {
      const nextIndex = Math.min(
        savedCurrentSection,
        sections.length - 1
      );

      setSection(sections[nextIndex].id);
    }
  }, [
    progressLoading,
    savedCurrentSection,
    savedCompleted,
  ]);

  /* =========================================
     REAL SAVED PROGRESS
  ========================================== */
  const progressCount = Math.max(
    0,
    Math.min(savedCompletedSections, sections.length)
  );

  const progressPercent =
    sections.length > 0
      ? (progressCount / sections.length) * 100
      : 0;

  const furthestUnlockedIndex = Math.min(
    savedCompletedSections,
    sections.length - 1
  );

  /* =========================================
     SAVE CURRENT SECTION BEFORE MOVING FORWARD
  ========================================== */
  const markCurrentSectionComplete = () => {
    const newCompletedCount = Math.max(
      savedCompletedSections,
      currentIndex + 1
    );

    const safeCompletedCount = Math.min(
      newCompletedCount,
      sections.length
    );

    return updateProgress(
      safeCompletedCount,
      safeCompletedCount
    );
  };

  const goNext = async () => {
    if (currentIndex >= sections.length - 1) return;

    const saved = await markCurrentSectionComplete();

    if (!saved) return;

    setSection(sections[currentIndex + 1].id);

    globalThis.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const canOpenSection = (index: number) => {
    if (savedCompleted) return true;

    return index <= furthestUnlockedIndex;
  };

  const openSection = (id: LessonSection, index: number) => {
    if (!canOpenSection(index)) return;

    setSection(id);

    globalThis.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const answerRecognition = (question: string, answer: string) => {
    setRecognitionAnswers((previous) => ({
      ...previous,
      [question]: answer,
    }));
  };

  const answerToolChoice = (question: string, answer: string) => {
    setToolChoices((previous) => ({
      ...previous,
      [question]: answer,
    }));
  };

  const answerPractice = (question: string, answer: string) => {
    setPracticeAnswers((previous) => ({
      ...previous,
      [question]: answer,
    }));
  };

  const recognitionCorrect =
    recognitionAnswers.chatgpt === "chatgpt" &&
    recognitionAnswers.gemini === "gemini";

  const toolChoiceCorrect =
    toolChoices.explain === "chat" &&
    toolChoices.images === "gemini";

  const practiceCorrect =
    practiceAnswers.school === "chatgpt" &&
    practiceAnswers.images === "gemini";

  const finalPracticeComplete =
    recognitionCorrect && toolChoiceCorrect && practiceCorrect;

  const saveLessonCompletion = async () => {
    if (!finalPracticeComplete || progressSaving) return;

    const success = await markComplete();

    if (!success) return;

    setCompleted(true);
    setSection("finish");

    /* Keep the old localStorage key only for backward compatibility.
       Supabase remains the source of truth. */
    try {
      const stored = localStorage.getItem("curio_completed_lessons");
      const parsed = stored ? JSON.parse(stored) : [];
      const completedLessons = Array.isArray(parsed)
        ? parsed.filter((id): id is number => typeof id === "number")
        : [];

      if (!completedLessons.includes(2)) {
        completedLessons.push(2);
      }

      localStorage.setItem(
        "curio_completed_lessons",
        JSON.stringify(Array.from(new Set(completedLessons)).sort((a, b) => a - b))
      );

      globalThis.dispatchEvent(new Event("curio:lesson-completed"));
    } catch {
      // Supabase save already succeeded; localStorage is only compatibility.
    }
  };

  const getRecognitionFeedback = (
    question: string,
    answer: string | undefined
  ) => {
    if (!answer) return null;

    if (question === "chatgpt") {
      return answer === "chatgpt"
        ? "Correct! You recognised the ChatGPT identity. The important habit is to connect the tool's name, visual identity and purpose in your memory."
        : "Not quite. Look again at the name and visual identity. This activity is about recognising the tool before deciding what to ask it.";
    }

    return answer === "gemini"
      ? "Correct! You recognised Gemini. The goal is not to memorise every tiny logo detail, but to become comfortable recognising the tool you are opening."
      : "Not quite. Look for the Gemini name and its visual identity. Try again — you are training your tool-recognition memory.";
  };

  const getToolChoiceFeedback = (
    question: string,
    answer: string | undefined
  ) => {
    if (!answer) return null;

    if (question === "explain") {
      return answer === "chat"
        ? "Good choice. A conversational AI tool such as ChatGPT can help you explain a topic step by step."
        : "Try again. The task is mainly a conversation: you want an explanation and follow-up questions.";
    }

    return answer === "gemini"
      ? "Good choice. Gemini can work with text and images, making it useful when you want to discuss visual information."
      : "Try again. For this activity, choose a tool that can work with visual information as well as text.";
  };

  const getPracticeFeedback = (
    question: string,
    answer: string | undefined
  ) => {
    if (!answer) return null;

    if (question === "school") {
      return answer === "chatgpt"
        ? "Correct. A conversational AI assistant is a natural choice for brainstorming and explaining a school topic."
        : "Not quite. Think about the job: you want to talk through an idea, ask follow-up questions and improve your understanding.";
    }

    return answer === "gemini"
      ? "Correct. When the task involves an image, choose a tool that can work with visual information."
      : "Not quite. The important clue is the image. Choose a tool that can understand visual information.";
  };

  if (progressLoading) {
    return (
      <main className="lesson2-page">
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
            {progressCount} / {sections.length} completed
          </span>

          <div className="lesson2-progress-track">
            <div
              className="lesson2-progress-fill"
              style={{ width: `${progressPercent}%` }}
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

      <div className="lesson2-layout">
        <aside className="lesson2-navigation">
          <div className="lesson2-nav-title">YOUR JOURNEY</div>

          {sections.map((item, index) => {
            const unlocked = canOpenSection(index);
            const isCompleted = savedCompleted || index < savedCompletedSections;

            return (
              <button
                key={item.id}
                type="button"
                disabled={!unlocked}
                className={`lesson2-nav-item ${
                  section === item.id ? "active" : ""
                } ${!unlocked ? "locked" : ""}`}
                onClick={() => openSection(item.id, index)}
                aria-current={section === item.id ? "step" : undefined}
                aria-disabled={!unlocked}
              >
                <span>{item.number}</span>
                <strong>{item.title}</strong>

                <small>
                  {isCompleted ? "✓" : unlocked ? "" : "🔒"}
                </small>
              </button>
            );
          })}
        </aside>

        <section className="lesson2-content">
          <div className="lesson2-intro">
            <span className="lesson2-kicker">AI TOOL LITERACY</span>

            <h2>
              Before you use an AI tool, learn to recognise it.
            </h2>

            <p>
              Think about how you learned the word “apple”. You learned its
              name, its shape, its colour and what it is used for.
            </p>

            <p>
              We will learn AI tools the same way — one familiar feature at a
              time.
            </p>

            <div className="lesson2-principle">
              <span>🧠</span>

              <div>
                <strong>Name → Look → Purpose → Try</strong>

                <p>
                  First recognise the tool. Then learn what it can help you
                  do.
                </p>
              </div>
            </div>
          </div>

          {section === "meet" && (
            <div className="lesson2-card">
              <span className="lesson2-step-label">
                01 · MEET AI TOOLS
              </span>

              <h3>AI is not just one app.</h3>

              <p className="lesson2-lead">
                Just like there are many kinds of books and many kinds of
                helpers, there are many AI tools.
              </p>

              <div className="lesson2-tool-grid">
                <article className="lesson2-tool-card">
                  <div className="lesson2-tool-visual chatgpt-visual">
                    <span>◉</span>
                  </div>

                  <strong>ChatGPT</strong>

                  <p>
                    A conversational AI assistant. You can type a question,
                    ask for an explanation and continue the conversation.
                  </p>
                </article>

                <article className="lesson2-tool-card">
                  <div className="lesson2-tool-visual gemini-visual">
                    <span>✦</span>
                  </div>

                  <strong>Gemini</strong>

                  <p>
                    An AI assistant from Google. It can work with conversation
                    and, depending on the feature, visual information too.
                  </p>
                </article>

                <article className="lesson2-tool-card">
                  <div className="lesson2-tool-visual other-visual">
                    <span>✨</span>
                  </div>

                  <strong>Other AI tools</strong>

                  <p>
                    Different tools can specialise in search, images, writing,
                    coding, research, audio and many other tasks.
                  </p>
                </article>
              </div>

              <div className="lesson2-note">
                <strong>You don't need to learn every tool today.</strong>
                <span>
                  The first skill is simply knowing that different AI tools
                  exist for different kinds of work.
                </span>
              </div>

              <button
                type="button"
                className="lesson2-primary"
                onClick={goNext}
              >
                I understand → Meet ChatGPT
              </button>
            </div>
          )}

          {section === "chatgpt" && (
            <div className="lesson2-card">
              <span className="lesson2-step-label">
                02 · RECOGNISE CHATGPT
              </span>

              <h3>Let's learn the “face” of ChatGPT.</h3>

              <p className="lesson2-lead">
                When you see a tool again, your brain should start saying:
                “I know this one.”
              </p>

              <div className="lesson2-recognition-card">
                <div className="lesson2-logo-large chatgpt-visual">
                  <span>◉</span>
                </div>

                <div>
                  <span className="lesson2-mini-label">TOOL NAME</span>

                  <h4>ChatGPT</h4>

                  <p>
                    Look for the ChatGPT name and its distinctive OpenAI
                    visual identity. The exact interface can change, so focus
                    on recognising the tool rather than memorising one screen.
                  </p>
                </div>
              </div>

              <div className="lesson2-memory-grid">
                <div>
                  <span>👀</span>
                  <strong>LOOK</strong>
                  <p>Notice the name and visual identity.</p>
                </div>

                <div>
                  <span>🧠</span>
                  <strong>REMEMBER</strong>
                  <p>Connect the look with “AI conversation”.</p>
                </div>

                <div>
                  <span>💬</span>
                  <strong>USE</strong>
                  <p>Ask it a question and continue the conversation.</p>
                </div>
              </div>

              <h4 className="lesson2-question-title">
                Which tool are you learning to recognise here?
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
                  <span>◉</span>
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
                  <span>✦</span>
                  Gemini
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
                disabled={recognitionAnswers.chatgpt !== "chatgpt"}
              >
                Next → Meet Gemini
              </button>
            </div>
          )}

          {section === "gemini" && (
            <div className="lesson2-card">
              <span className="lesson2-step-label">
                03 · RECOGNISE GEMINI
              </span>

              <h3>Now meet another AI helper: Gemini.</h3>

              <p className="lesson2-lead">
                The goal is not to memorise a complicated logo. The goal is to
                recognise the tool when you see its name and visual identity.
              </p>

              <div className="lesson2-recognition-card">
                <div className="lesson2-logo-large gemini-visual">
                  <span>✦</span>
                </div>

                <div>
                  <span className="lesson2-mini-label">TOOL NAME</span>

                  <h4>Gemini</h4>

                  <p>
                    Gemini is Google's AI assistant. Its interface and
                    branding can change over time, so use the name plus its
                    visual identity as your memory anchor.
                  </p>
                </div>
              </div>

              <div className="lesson2-memory-grid">
                <div>
                  <span>👀</span>
                  <strong>LOOK</strong>
                  <p>Notice the Gemini name and visual identity.</p>
                </div>

                <div>
                  <span>🧠</span>
                  <strong>REMEMBER</strong>
                  <p>Connect it with an AI assistant.</p>
                </div>

                <div>
                  <span>🔎</span>
                  <strong>EXPLORE</strong>
                  <p>Notice what kinds of information it can work with.</p>
                </div>
              </div>

              <h4 className="lesson2-question-title">
                Which one represents Gemini?
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
                  <span>◉</span>
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
                  <span>✦</span>
                  Gemini
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
                disabled={recognitionAnswers.gemini !== "gemini"}
              >
                I recognise it → Continue
              </button>
            </div>
          )}

          {section === "tools" && (
            <div className="lesson2-card">
              <span className="lesson2-step-label">
                04 · WHAT CAN AI TOOLS DO?
              </span>

              <h3>Think of an AI tool as a helper with abilities.</h3>

              <p className="lesson2-lead">
                You don't need to understand the technology underneath. First,
                learn what the tool can help you do.
              </p>

              <div className="lesson2-ability-list">
                <div>
                  <span>💬</span>
                  <div>
                    <strong>Talk and explain</strong>
                    <p>
                      Ask questions, learn concepts and continue a
                      conversation.
                    </p>
                  </div>
                </div>

                <div>
                  <span>✍️</span>
                  <div>
                    <strong>Create and rewrite</strong>
                    <p>
                      Draft ideas, rewrite text, summarise information or
                      change the style.
                    </p>
                  </div>
                </div>

                <div>
                  <span>🖼️</span>
                  <div>
                    <strong>Work with visual information</strong>
                    <p>
                      Some AI tools can understand or create images when that
                      feature is available.
                    </p>
                  </div>
                </div>

                <div>
                  <span>🔎</span>
                  <div>
                    <strong>Find and organise information</strong>
                    <p>
                      Some tools are designed to help search, research or
                      organise information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lesson2-highlight">
                <span>💡</span>

                <div>
                  <strong>Important beginner idea</strong>
                  <p>
                    “AI tool” is a category. ChatGPT and Gemini are examples
                    of AI assistants, not the whole world of AI.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="lesson2-primary"
                onClick={goNext}
              >
                I understand → Tool detective
              </button>
            </div>
          )}

          {section === "recognize" && (
            <div className="lesson2-card">
              <span className="lesson2-step-label">
                05 · TOOL DETECTIVE
              </span>

              <h3>Can you recognise the helper?</h3>

              <p className="lesson2-lead">
                This is not a test of technical knowledge. Look at the clue,
                connect it to the tool, and make your best choice.
              </p>

              <div className="lesson2-scenario">
                <div className="lesson2-scenario-icon">💬</div>

                <div>
                  <span>CLUE 01</span>

                  <h4>
                    “I want to have a conversation with an AI assistant,
                    ask follow-up questions and get a simple explanation.”
                  </h4>
                </div>
              </div>

              <div className="lesson2-choice-row">
                <button
                  type="button"
                  className={
                    toolChoices.explain === "chat" ? "selected" : ""
                  }
                  onClick={() =>
                    answerToolChoice("explain", "chat")
                  }
                >
                  <span>◉</span>
                  ChatGPT
                </button>

                <button
                  type="button"
                  className={
                    toolChoices.explain === "other" ? "selected" : ""
                  }
                  onClick={() =>
                    answerToolChoice("explain", "other")
                  }
                >
                  <span>🧮</span>
                  Calculator
                </button>
              </div>

              {toolChoices.explain && (
                <div
                  className={`lesson2-feedback ${
                    toolChoices.explain === "chat"
                      ? "correct"
                      : "wrong"
                  }`}
                >
                  {getToolChoiceFeedback(
                    "explain",
                    toolChoices.explain
                  )}
                </div>
              )}

              <div className="lesson2-scenario">
                <div className="lesson2-scenario-icon">🖼️</div>

                <div>
                  <span>CLUE 02</span>

                  <h4>
                    “I have a picture and want to discuss what is visible in
                    it with an AI assistant.”
                  </h4>
                </div>
              </div>

              <div className="lesson2-choice-row">
                <button
                  type="button"
                  className={
                    toolChoices.images === "gemini" ? "selected" : ""
                  }
                  onClick={() =>
                    answerToolChoice("images", "gemini")
                  }
                >
                  <span>✦</span>
                  Gemini
                </button>

                <button
                  type="button"
                  className={
                    toolChoices.images === "calculator"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    answerToolChoice("images", "calculator")
                  }
                >
                  <span>🧮</span>
                  Calculator
                </button>
              </div>

              {toolChoices.images && (
                <div
                  className={`lesson2-feedback ${
                    toolChoices.images === "gemini"
                      ? "correct"
                      : "wrong"
                  }`}
                >
                  {getToolChoiceFeedback(
                    "images",
                    toolChoices.images
                  )}
                </div>
              )}

              <button
                type="button"
                className="lesson2-primary"
                onClick={goNext}
                disabled={!toolChoiceCorrect}
              >
                Good detective work → Continue
              </button>
            </div>
          )}

          {section === "choose" && (
            <div className="lesson2-card">
              <span className="lesson2-step-label">
                06 · CHOOSE THE RIGHT TOOL
              </span>

              <h3>Don't ask “Which AI is best?”</h3>

              <p className="lesson2-lead">
                Ask a better question: “Which tool fits the job I am trying to
                do?”
              </p>

              <div className="lesson2-job-grid">
                <article>
                  <span>💬</span>
                  <strong>Conversation</strong>
                  <p>
                    Ask questions, learn a topic and continue a conversation.
                  </p>
                </article>

                <article>
                  <span>🖼️</span>
                  <strong>Visual work</strong>
                  <p>
                    Work with an image when the tool supports visual input.
                  </p>
                </article>

                <article>
                  <span>🔎</span>
                  <strong>Research</strong>
                  <p>
                    Use a tool designed for searching and organising current
                    information.
                  </p>
                </article>
              </div>

              <div className="lesson2-note">
                <strong>There is no single “best AI”.</strong>
                <span>
                  The best starting point depends on your task, the tool's
                  abilities and the information you need.
                </span>
              </div>

              <button
                type="button"
                className="lesson2-primary"
                onClick={goNext}
              >
                I know how to choose → Practice
              </button>
            </div>
          )}

          {section === "practice" && (
            <div className="lesson2-card">
              <span className="lesson2-step-label">
                07 · USE AN AI TOOL
              </span>

              <h3>Now recognise the tool from the job.</h3>

              <p className="lesson2-lead">
                Read each situation. You are not memorising an answer — you
                are learning to notice the important clue.
              </p>

              <div className="lesson2-practice-item">
                <div className="lesson2-practice-number">01</div>

                <div>
                  <h4>
                    You want to understand a difficult school topic by asking
                    questions and getting explanations.
                  </h4>

                  <div className="lesson2-choice-row">
                    <button
                      type="button"
                      className={
                        practiceAnswers.school === "chatgpt"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice("school", "chatgpt")
                      }
                    >
                      <span>◉</span>
                      ChatGPT
                    </button>

                    <button
                      type="button"
                      className={
                        practiceAnswers.school === "calculator"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice("school", "calculator")
                      }
                    >
                      <span>🧮</span>
                      Calculator
                    </button>
                  </div>

                  {practiceAnswers.school && (
                    <div
                      className={`lesson2-feedback ${
                        practiceAnswers.school === "chatgpt"
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
                <div className="lesson2-practice-number">02</div>

                <div>
                  <h4>
                    You have a picture and want an AI assistant that can work
                    with visual information.
                  </h4>

                  <div className="lesson2-choice-row">
                    <button
                      type="button"
                      className={
                        practiceAnswers.images === "gemini"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice("images", "gemini")
                      }
                    >
                      <span>✦</span>
                      Gemini
                    </button>

                    <button
                      type="button"
                      className={
                        practiceAnswers.images === "calculator"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        answerPractice("images", "calculator")
                      }
                    >
                      <span>🧮</span>
                      Calculator
                    </button>
                  </div>

                  {practiceAnswers.images && (
                    <div
                      className={`lesson2-feedback ${
                        practiceAnswers.images === "gemini"
                          ? "correct"
                          : "wrong"
                      }`}
                    >
                      {getPracticeFeedback(
                        "images",
                        practiceAnswers.images
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="lesson2-primary"
                onClick={goNext}
                disabled={!practiceCorrect}
              >
                I can recognise the right tool → Final practice
              </button>
            </div>
          )}

          {section === "finish" && (
            <div className="lesson2-card">
              <span className="lesson2-step-label">
                08 · FINAL PRACTICE
              </span>

              <h3>Show what you learned.</h3>

              <p className="lesson2-lead">
                Imagine you are helping a friend who has never used an AI
                assistant before.
              </p>

              <div className="lesson2-final-task">
                <div className="lesson2-final-icon">🧠</div>

                <div>
                  <span className="lesson2-mini-label">
                    YOUR CHALLENGE
                  </span>

                  <h4>
                    Explain the difference between an AI tool and the job you
                    want the tool to do.
                  </h4>

                  <p>
                    For example: “ChatGPT is an AI assistant. I can use it to
                    ask questions, explain ideas and have a conversation.”
                  </p>
                </div>
              </div>

              <div className="lesson2-final-checklist">
                <div className={recognitionCorrect ? "done" : ""}>
                  <span>{recognitionCorrect ? "✓" : "1"}</span>
                  Recognise ChatGPT and Gemini
                </div>

                <div className={toolChoiceCorrect ? "done" : ""}>
                  <span>{toolChoiceCorrect ? "✓" : "2"}</span>
                  Connect a tool to a task
                </div>

                <div className={practiceCorrect ? "done" : ""}>
                  <span>{practiceCorrect ? "✓" : "3"}</span>
                  Choose a useful AI tool
                </div>
              </div>

              {!finalPracticeComplete && (
                <div className="lesson2-feedback wrong">
                  Finish the previous practice activities first. There is no
                  rush — the goal is to recognise the tools and understand
                  what they can help you do.
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
                  <div className="lesson2-completion-icon">✓</div>

                  <div>
                    <strong>Lesson 2 complete!</strong>

                    <p>
                      You can now recognise common AI tools, understand that
                      different tools have different abilities, and choose a
                      tool based on the job you want to do.
                    </p>
                  </div>
                </div>
              )}

              {completed && (
                <button
                  type="button"
                  className="lesson2-back-learning-button"
                  onClick={() => navigate("/learn")}
                >
                  Continue your learning path →
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Lesson2;
