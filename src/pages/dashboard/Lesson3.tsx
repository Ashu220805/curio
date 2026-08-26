import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Lesson3.css";
import { useLessonProgress } from "../../hooks/useLessonProgress.ts";

type LessonSection =
  | "alphabet"
  | "anatomy"
  | "works"
  | "functions"
  | "improve"
  | "shortcuts"
  | "lab"
  | "practice";

type AnswerMap = Record<string, string>;

const LESSON_SECTIONS: {
  id: LessonSection;
  number: string;
  title: string;
}[] = [
  { id: "alphabet", number: "01", title: "Prompt alphabet" },
  { id: "anatomy", number: "02", title: "Build a prompt" },
  { id: "works", number: "03", title: "How prompting works" },
  { id: "functions", number: "04", title: "What prompts can do" },
  { id: "improve", number: "05", title: "Make prompts better" },
  { id: "shortcuts", number: "06", title: "Prompt shortcuts" },
  { id: "lab", number: "07", title: "Prompt lab" },
  { id: "practice", number: "08", title: "Final practice" },
];

const ALL_SECTION_IDS = LESSON_SECTIONS.map((item) => item.id);

const PROMPT_PARTS = [
  {
    icon: "🎯",
    title: "GOAL",
    text: "What do you want the AI to help you achieve?",
    example: "Teach me photosynthesis.",
  },
  {
    icon: "🧩",
    title: "CONTEXT",
    text: "What information does the AI need to understand your situation?",
    example: "I am a Class 8 student.",
  },
  {
    icon: "✋",
    title: "TASK",
    text: "What exactly should the AI do?",
    example: "Explain it using a simple analogy.",
  },
  {
    icon: "📋",
    title: "FORMAT",
    text: "How should the answer look?",
    example: "Use 5 bullet points and a small example.",
  },
  {
    icon: "📏",
    title: "RULES",
    text: "What limits or requirements should it follow?",
    example: "Keep it under 150 words.",
  },
  {
    icon: "👤",
    title: "AUDIENCE",
    text: "Who is the answer for, when that changes the explanation?",
    example: "Use beginner-friendly language.",
  },
];

const SHORTCUTS = [
  {
    shortcut: "/onepage",
    purpose: "One-page notes",
    prompt: "Explain photosynthesis in one page with headings, key points and a quick recap.",
  },
  {
    shortcut: "/eli5",
    purpose: "Very simple explanation",
    prompt: "Explain gravity like you are teaching a beginner using a daily-life example.",
  },
  {
    shortcut: "/steps",
    purpose: "Step-by-step method",
    prompt: "Solve this problem step by step and explain why each step is needed.",
  },
  {
    shortcut: "/table",
    purpose: "Organised comparison",
    prompt: "Compare mitosis and meiosis in a simple table with 6 important differences.",
  },
  {
    shortcut: "/quiz",
    purpose: "Practice questions",
    prompt: "Quiz me with 5 questions, one at a time. Do not reveal the answer until I try.",
  },
  {
    shortcut: "/flashcards",
    purpose: "Revision cards",
    prompt: "Create 10 short flashcards from these notes. Put the answer after each card.",
  },
  {
    shortcut: "/rewrite",
    purpose: "Improve writing",
    prompt: "Rewrite this paragraph in clear, simple English without changing its meaning.",
  },
  {
    shortcut: "/checklist",
    purpose: "Turn work into actions",
    prompt: "Turn this assignment into a checklist I can complete one step at a time.",
  },
  {
    shortcut: "/compare",
    purpose: "Compare choices",
    prompt: "Compare these two options in a table and recommend one using clear criteria.",
  },
  {
    shortcut: "/brainstorm",
    purpose: "Generate ideas",
    prompt: "Give me 10 ideas, grouped from easiest to most creative.",
  },
];

const FUNCTION_CARDS = [
  {
    icon: "💡",
    title: "EXPLAIN",
    text: "Teach an idea at the level you need.",
    example: "Explain Newton's laws for a Class 9 student.",
  },
  {
    icon: "✍️",
    title: "CREATE",
    text: "Generate something new from your instructions.",
    example: "Create 5 story ideas about a robot detective.",
  },
  {
    icon: "🔄",
    title: "TRANSFORM",
    text: "Change existing content without changing its meaning.",
    example: "Turn these notes into a revision table.",
  },
  {
    icon: "🔎",
    title: "ANALYSE",
    text: "Break information into parts and find patterns or issues.",
    example: "Analyse this paragraph and identify its main argument.",
  },
  {
    icon: "⚖️",
    title: "COMPARE / DECIDE",
    text: "Use clear criteria to compare options.",
    example: "Compare these two study methods by time, difficulty and benefit.",
  },
  {
    icon: "🗺️",
    title: "PLAN",
    text: "Turn a goal into an ordered action plan.",
    example: "Make a 7-day revision plan for these chapters.",
  },
  {
    icon: "🧑‍🏫",
    title: "COACH",
    text: "Ask AI to guide you instead of doing everything for you.",
    example: "Give me hints first. Let me solve the question.",
  },
  {
    icon: "🛡️",
    title: "CHECK / CRITIQUE",
    text: "Ask AI to inspect your work for gaps or mistakes.",
    example: "Check my answer and tell me what I should verify.",
  },
];

const PRACTICE_EXPECTED: Record<string, string> = {
  weak: "specific",
  study: "context",
  format: "format",
  coach: "coach",
  verify: "verify",
};

function Lesson3() {
  const navigate = useNavigate();

  const [section, setSection] = useState<LessonSection>("alphabet");
  const [completedSections, setCompletedSections] = useState<LessonSection[]>(
    []
  );
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [labGoal, setLabGoal] = useState("Understand a topic");
  const [labContext, setLabContext] = useState("I am a beginner student");
  const [labFormat, setLabFormat] = useState("Simple bullet points");
  const [labRules, setLabRules] = useState("Keep it concise");
  const [completed, setCompleted] = useState(false);

  const [hasLearnedPrompt, setHasLearnedPrompt] = useState(false);

  const {
    loading: progressLoading,
    saving: progressSaving,
    error: progressError,
    currentSection: savedCurrentSection,
    completedSections: savedCompletedSections,
    completed: savedCompleted,
    updateProgress,
    markComplete,
  } = useLessonProgress(3, 8);

  const currentIndex = LESSON_SECTIONS.findIndex(
    (item) => item.id === section
  );

  const progressCount = Math.max(0, Math.min(savedCompletedSections, 8));
  const progressPercent = Math.round((progressCount / 8) * 100);

  useEffect(() => {
    if (progressLoading) return;

    if (savedCompleted) {
      setCompleted(true);
      setCompletedSections(ALL_SECTION_IDS);
      setSection("practice");
      return;
    }

    if (savedCurrentSection > 0) {
      const nextIndex = Math.min(savedCurrentSection, LESSON_SECTIONS.length - 1);
      setSection(LESSON_SECTIONS[nextIndex].id);
    }

    setCompletedSections(
      LESSON_SECTIONS.filter((_, index) => index < savedCompletedSections).map(
        (item) => item.id
      )
    );

    setHasLearnedPrompt(savedCompletedSections >= 1);
  }, [progressLoading, savedCurrentSection, savedCompleted, savedCompletedSections]);

  const furthestUnlockedIndex = Math.min(
    savedCompletedSections,
    LESSON_SECTIONS.length - 1
  );

  const canOpenSection = (index: number) =>
    savedCompleted || index <= furthestUnlockedIndex;

  const openSection = (id: LessonSection, index: number) => {
    if (!canOpenSection(index)) return;
    setSection(id);
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = async () => {
    if (currentIndex < 0 || currentIndex >= LESSON_SECTIONS.length - 1) return;

    const completedCount = Math.min(8, Math.max(savedCompletedSections, currentIndex + 1));
    const saved = await updateProgress(completedCount, completedCount);
    if (!saved) return;

    setSection(LESSON_SECTIONS[currentIndex + 1].id);
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrevious = () => {
    if (currentIndex <= 0) return;
    setSection(LESSON_SECTIONS[currentIndex - 1].id);
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  };

  const answer = (question: string, value: string) => {
    setAnswers((previous) => ({
      ...previous,
      [question]: value,
    }));
  };

  const practiceScore = Object.keys(PRACTICE_EXPECTED).filter(
    (question) => answers[question] === PRACTICE_EXPECTED[question]
  ).length;

  const practiceComplete = practiceScore === Object.keys(PRACTICE_EXPECTED).length;

  const promptPreview = [
    labGoal,
    labContext ? `Context: ${labContext}` : "",
    `Format: ${labFormat}`,
    labRules ? `Rules: ${labRules}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const completeLesson = async () => {
    if (!practiceComplete || !hasLearnedPrompt || progressSaving) return;

    const saved = await markComplete();
    if (!saved) return;

    setCompletedSections(ALL_SECTION_IDS);
    setCompleted(true);
    setSection("practice");

    try {
      localStorage.setItem("curio_completed_lesson_3", "true");
      globalThis.dispatchEvent(new Event("curio:lesson-completed"));
    } catch {
      // Supabase is the source of truth.
    }

    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  };

  const feedback = (question: string) => {
    const selected = answers[question];
    if (!selected) return null;

    const correct = selected === PRACTICE_EXPECTED[question];

    if (correct) {
      const messages: Record<string, string> = {
        weak: "Correct. Specific instructions reduce ambiguity. You told the AI what outcome you actually want.",
        study:
          "Correct. Context gives the AI information about your level and situation, so the response can fit you better.",
        format:
          "Correct. Format tells the AI how to organise the answer, making it easier to use.",
        coach:
          "Correct. A coaching prompt can make AI guide your thinking instead of simply giving you the finished answer.",
        verify:
          "Correct. A prompt can ask for checking, but important facts should still be verified independently.",
      };

      return messages[question];
    }

    const wrong: Record<string, string> = {
      weak: "Not quite. The better prompt is the one that clearly states the task and desired result.",
      study:
        "Look for the option that tells the AI who you are or what you already know. That is context.",
      format:
        "Look for the option that controls the shape of the answer, such as bullets, a table or steps.",
      coach:
        "Look for the option that asks AI to guide you with hints rather than immediately doing the work.",
      verify:
        "Look for the option that asks AI to identify uncertainty or what should be checked. Remember: AI's check is not proof.",
    };

    return wrong[question];
  };

  const sectionButton = (
    id: LessonSection,
    number: string,
    title: string,
    index: number
  ) => {
    const unlocked = canOpenSection(index);
    const isCompleted = completedSections.includes(id);

    return (
      <button
        key={id}
        type="button"
        disabled={!unlocked}
        className={`lesson3-nav-item ${
          section === id ? "active" : ""
        } ${!unlocked ? "locked" : ""}`}
        onClick={() => openSection(id, index)}
        aria-current={section === id ? "step" : undefined}
      >
        <span>{number}</span>
        <strong>{title}</strong>
        <small>{isCompleted ? "✓" : !unlocked ? "🔒" : ""}</small>
      </button>
    );
  };

  if (progressLoading) {
    return (
      <main className="lesson3-page">
        <div className="lesson3-loading">Loading your lesson progress...</div>
      </main>
    );
  }

  return (
    <main className="lesson3-page">
      <header className="lesson3-header">
        <button
          type="button"
          className="lesson3-back-button"
          onClick={() => navigate("/learn")}
          aria-label="Back to Learn AI"
        >
          ←
        </button>

        <div className="lesson3-heading">
          <span>CURIO · LESSON 03</span>
          <h1>What is a Prompt?</h1>
        </div>

        <div
          className="lesson3-header-progress"
          aria-label="Lesson progress"
        >
          <span>
            {progressCount} / {LESSON_SECTIONS.length} completed
          </span>

          <div className="lesson3-progress-track">
            <div
              className="lesson3-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {progressError && <div className="lesson3-progress-error">{progressError}</div>}

      <div className="lesson3-layout">
        <aside className="lesson3-navigation" aria-label="Lesson sections">
          <div className="lesson3-nav-title">YOUR JOURNEY</div>

          {LESSON_SECTIONS.map((item, index) =>
            sectionButton(
              item.id,
              item.number,
              item.title,
              index
            )
          )}

          <div className="lesson3-lock-note">
            <span>🧠</span>
            <p>
              Build one skill at a time. CURIO teaches the reasoning behind a
              good prompt, not a magic sentence to copy.
            </p>
          </div>
        </aside>

        <section className="lesson3-content">
          <div className="lesson3-intro">
            <span className="lesson3-kicker">PROMPTING FUNDAMENTALS</span>

            <h2>
              A prompt is simply how you tell an AI what you want.
            </h2>

            <p>
              You already know how to give instructions to another person:
              you explain what you need, add useful details and say what a good
              result should look like. Prompting is the same skill, adapted for
              an AI assistant.
            </p>

            <p>
              The goal of this lesson is not to memorise complicated formulas.
              It is to make you confident enough to type what you mean.
            </p>

            <div className="lesson3-principle">
              <span>🎯</span>
              <div>
                <strong>GOOD PROMPT = CLEAR GOAL + USEFUL CONTEXT + CLEAR TASK</strong>
                <p>
                  Then add format, rules or audience details when they actually
                  help. More words do not automatically mean a better prompt.
                </p>
              </div>
            </div>
          </div>

          {section === "alphabet" && (
            <div className="lesson3-card">
              <span className="lesson3-step-label">
                01 · PROMPT ALPHABET
              </span>

              <h3>Start with the smallest useful idea.</h3>

              <p className="lesson3-lead">
                A prompt is the input or instruction you give an AI system.
                It can be one sentence, a question, a list of requirements, or
                a longer set of instructions.
              </p>

              <div className="lesson3-scenario">
                <div className="lesson3-scenario-icon">👦</div>
                <div>
                  <span>IMAGINE THIS</span>
                  <h4>
                    You ask a teacher: “Explain fractions.” That is a valid
                    request. But “Explain fractions to a Class 6 student using
                    a pizza example and 3 practice questions” gives the teacher
                    much more useful direction.
                  </h4>
                </div>
              </div>

              <div className="lesson3-compare-grid">
                <div>
                  <span>WEAK / VAGUE</span>
                  <strong>“Tell me about planets.”</strong>
                  <p>
                    The AI has to guess your level, purpose, length and format.
                  </p>
                </div>

                <div>
                  <span>BETTER</span>
                  <strong>
                    “Explain the 8 planets for a Class 7 student in a simple
                    table with one interesting fact about each.”
                  </strong>
                  <p>
                    Now the goal, audience and output format are clear.
                  </p>
                </div>
              </div>

              <div className="lesson3-note">
                <span>💡</span>
                <div>
                  <strong>Remember</strong>
                  <p>
                    A prompt is not a password. There is no single “perfect
                    wording.” Your job is to communicate the task clearly.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="lesson3-primary"
                onClick={() => {
                  setHasLearnedPrompt(true);
                  goNext();
                }}
              >
                I understand what a prompt is →
              </button>
            </div>
          )}

          {section === "anatomy" && (
            <div className="lesson3-card">
              <span className="lesson3-step-label">
                02 · BUILD A PROMPT
              </span>

              <h3>Think of a prompt as a small instruction sheet.</h3>

              <p className="lesson3-lead">
                You do not need every part every time. Start with the goal and
                task. Add the other parts when they improve the result.
              </p>

              <div className="lesson3-parts-grid">
                {PROMPT_PARTS.map((part) => (
                  <article key={part.title}>
                    <span>{part.icon}</span>
                    <strong>{part.title}</strong>
                    <p>{part.text}</p>
                    <small>{part.example}</small>
                  </article>
                ))}
              </div>

              <div className="lesson3-flow">
                <span>GOAL</span>
                <b>→</b>
                <span>CONTEXT</span>
                <b>→</b>
                <span>TASK</span>
                <b>→</b>
                <span>FORMAT</span>
                <b>→</b>
                <span>RULES</span>
              </div>

              <div className="lesson3-highlight">
                <span>⭐</span>
                <div>
                  <strong>The beginner rule</strong>
                  <p>
                    If you are stuck, write just three things: “I need help
                    with ___.” “My situation is ___.” “Please give me ___.”
                    That is already a real prompt.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="lesson3-primary"
                onClick={goNext}
              >
                I can build a prompt →
              </button>
            </div>
          )}

          {section === "works" && (
            <div className="lesson3-card">
              <span className="lesson3-step-label">
                03 · HOW PROMPTING WORKS
              </span>

              <h3>What happens after you press Send?</h3>

              <div className="lesson3-process-grid">
                <article>
                  <span>1</span>
                  <strong>You give input</strong>
                  <p>
                    Your words, files or other supported input tell the AI what
                    you want it to work with.
                  </p>
                </article>

                <article>
                  <span>2</span>
                  <strong>AI interprets the request</strong>
                  <p>
                    The system uses your instructions and the available
                    context to determine what response to generate.
                  </p>
                </article>

                <article>
                  <span>3</span>
                  <strong>AI generates an output</strong>
                  <p>
                    It produces a response that tries to match your request.
                    The result can still be wrong, incomplete or unsuitable.
                  </p>
                </article>

                <article>
                  <span>4</span>
                  <strong>You inspect and refine</strong>
                  <p>
                    If the result is not useful, tell the AI what to change.
                    Good prompting is often a conversation, not one attempt.
                  </p>
                </article>
              </div>

              <div className="lesson3-warning">
                <strong>⚠️ IMPORTANT: A better prompt does not guarantee truth.</strong>
                <p>
                  Clear instructions can improve relevance, structure and
                  usefulness. They do not guarantee factual accuracy.
                </p>
                <p>
                  For important information, check reliable sources and do not
                  treat confident wording as proof.
                </p>
              </div>

              <div className="lesson3-before-after">
                <div>
                  <span>ROUND 1</span>
                  <strong>“Explain electricity.”</strong>
                  <p>Useful starting point, but the AI must guess your needs.</p>
                </div>

                <div>
                  <span>ROUND 2</span>
                  <strong>
                    “Explain electricity for a Class 8 student using a water-pipe
                    analogy, then give me 3 quick questions.”
                  </strong>
                  <p>
                    You refined the goal, audience, analogy and practice format.
                  </p>
                </div>
              </div>

              <button type="button" className="lesson3-primary" onClick={goNext}>
                Show me what prompts can do →
              </button>
            </div>
          )}

          {section === "functions" && (
            <div className="lesson3-card">
              <span className="lesson3-step-label">
                04 · PROMPT FUNCTIONS
              </span>

              <h3>Prompts are tools for different jobs.</h3>

              <p className="lesson3-lead">
                Instead of memorising “prompt types,” think about the function
                you need. What job should the AI perform for you?
              </p>

              <div className="lesson3-function-grid">
                {FUNCTION_CARDS.map((item) => (
                  <article key={item.title}>
                    <span>{item.icon}</span>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                    <small>{item.example}</small>
                  </article>
                ))}
              </div>

              <div className="lesson3-job-rule">
                <strong>ASK YOURSELF BEFORE TYPING</strong>
                <ol>
                  <li>What am I trying to achieve?</li>
                  <li>Do I need an explanation, creation, transformation, analysis, plan or practice?</li>
                  <li>What information does the AI need?</li>
                  <li>What should the final answer look like?</li>
                </ol>
              </div>

              <button type="button" className="lesson3-primary" onClick={goNext}>
                I know the job I want AI to do →
              </button>
            </div>
          )}

          {section === "improve" && (
            <div className="lesson3-card">
              <span className="lesson3-step-label">
                05 · MAKE PROMPTS BETTER
              </span>

              <h3>From “good enough” to genuinely useful.</h3>

              <div className="lesson3-improvement-list">
                <div>
                  <span>01</span>
                  <div>
                    <strong>Be specific about the outcome.</strong>
                    <p>Say what you want produced, not just the topic.</p>
                    <code>Instead of: “Math.” → “Give me 5 practice questions on quadratic equations.”</code>
                  </div>
                </div>

                <div>
                  <span>02</span>
                  <div>
                    <strong>Add only useful context.</strong>
                    <p>Tell the AI your level, situation or goal when it changes the answer.</p>
                    <code>“I am a beginner and I already understand basic fractions.”</code>
                  </div>
                </div>

                <div>
                  <span>03</span>
                  <div>
                    <strong>Choose the output format.</strong>
                    <p>Tables, bullets, steps, examples and checklists can make answers easier to use.</p>
                    <code>“Give the answer as a 3-column table.”</code>
                  </div>
                </div>

                <div>
                  <span>04</span>
                  <div>
                    <strong>Give constraints when they matter.</strong>
                    <p>Length, difficulty, number of examples or tone can guide the response.</p>
                    <code>“Keep it under 200 words and use simple language.”</code>
                  </div>
                </div>

                <div>
                  <span>05</span>
                  <div>
                    <strong>Refine instead of starting again.</strong>
                    <p>Say exactly what should change after the first answer.</p>
                    <code>“Good, but make it shorter and add one real-life example.”</code>
                  </div>
                </div>
              </div>

              <div className="lesson3-highlight">
                <span>🧠</span>
                <div>
                  <strong>Prompting is a conversation skill.</strong>
                  <p>
                    First attempt → inspect → give feedback → improve. You do
                    not need to write a huge prompt at the beginning.
                  </p>
                </div>
              </div>

              <button type="button" className="lesson3-primary" onClick={goNext}>
                I can improve a prompt →
              </button>
            </div>
          )}

          {section === "shortcuts" && (
            <div className="lesson3-card">
              <span className="lesson3-step-label">
                06 · PROMPT SHORTCUTS
              </span>

              <h3>Use short patterns when you already know the job.</h3>

              <p className="lesson3-lead">
                CURIO uses these as memorable shortcuts for common prompt
                patterns. They are not universal commands supported by every
                chatbot. If a tool does not recognise a slash shortcut, simply
                write the full instruction after it.
              </p>

              <div className="lesson3-shortcut-grid">
                {SHORTCUTS.map((item) => (
                  <article key={item.shortcut}>
                    <div className="lesson3-shortcut-top">
                      <code>{item.shortcut}</code>
                      <span>{item.purpose}</span>
                    </div>
                    <p>{item.prompt}</p>
                  </article>
                ))}
              </div>

              <div className="lesson3-shortcut-example">
                <span>EXAMPLE</span>
                <strong>
                  /onepage Photosynthesis for Class 8 — include the equation,
                  5 key points, one diagram description and 3 quick questions.
                </strong>
                <p>
                  The shortcut tells you the output style. The words after it
                  provide the actual task and context.
                </p>
              </div>

              <button type="button" className="lesson3-primary" onClick={goNext}>
                Let me build one myself →
              </button>
            </div>
          )}

          {section === "lab" && (
            <div className="lesson3-card">
              <span className="lesson3-step-label">
                07 · PROMPT LAB
              </span>

              <h3>Build a useful prompt without overthinking it.</h3>

              <p className="lesson3-lead">
                Choose the pieces below. CURIO will assemble a prompt preview.
                Then read it and ask: “Would another person understand exactly
                what I want?”
              </p>

              <div className="lesson3-lab-grid">
                <label>
                  <span>GOAL</span>
                  <select
                    value={labGoal}
                    onChange={(event) => setLabGoal(event.target.value)}
                  >
                    <option>Understand a topic</option>
                    <option>Solve a problem</option>
                    <option>Create something</option>
                    <option>Study for an exam</option>
                    <option>Improve my writing</option>
                    <option>Make a plan</option>
                  </select>
                </label>

                <label>
                  <span>CONTEXT</span>
                  <select
                    value={labContext}
                    onChange={(event) => setLabContext(event.target.value)}
                  >
                    <option>I am a beginner student</option>
                    <option>I am preparing for an exam</option>
                    <option>I already know the basics</option>
                    <option>I need a real-life explanation</option>
                  </select>
                </label>

                <label>
                  <span>FORMAT</span>
                  <select
                    value={labFormat}
                    onChange={(event) => setLabFormat(event.target.value)}
                  >
                    <option>Simple bullet points</option>
                    <option>Step-by-step explanation</option>
                    <option>One-page notes</option>
                    <option>Comparison table</option>
                    <option>Quiz me one question at a time</option>
                  </select>
                </label>

                <label>
                  <span>RULE</span>
                  <select
                    value={labRules}
                    onChange={(event) => setLabRules(event.target.value)}
                  >
                    <option>Keep it concise</option>
                    <option>Use simple language</option>
                    <option>Include examples</option>
                    <option>Explain the reasoning, not just the answer</option>
                  </select>
                </label>
              </div>

              <div className="lesson3-prompt-preview">
                <div className="lesson3-preview-head">
                  <span>YOUR PROMPT</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(promptPreview)}
                  >
                    Copy
                  </button>
                </div>
                <pre>{promptPreview}</pre>
              </div>

              <div className="lesson3-note">
                <span>🔍</span>
                <div>
                  <strong>Quality check</strong>
                  <p>
                    Does your prompt make the goal, context and desired output
                    clear? If yes, you are ready to try it in an AI tool.
                  </p>
                </div>
              </div>

              <button type="button" className="lesson3-primary" onClick={goNext}>
                My prompt is clear enough →
              </button>
            </div>
          )}

          {section === "practice" && (
            <div className="lesson3-card">
              <span className="lesson3-step-label">
                08 · FINAL PRACTICE
              </span>

              <h3>Now prove that you can communicate with AI.</h3>

              <p className="lesson3-lead">
                Choose the answer that shows the better prompting decision.
                CURIO will explain the reasoning, not just mark it right or
                wrong.
              </p>

              <div className="lesson3-practice-item">
                <div className="lesson3-practice-number">1</div>
                <div>
                  <h4>Which is a more useful prompt?</h4>
                  <div className="lesson3-choice-row">
                    {[
                      ["weak", "Tell me science."],
                      [
                        "specific",
                        "Explain gravity for a Class 8 student using one daily-life example and 3 key points.",
                      ],
                    ].map(([value, text]) => (
                      <button
                        key={value}
                        type="button"
                        className={answers.weak === value ? "selected" : ""}
                        onClick={() => answer("weak", value)}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                  {feedback("weak") && (
                    <div
                      className={`lesson3-feedback ${
                        answers.weak === "specific" ? "correct" : "wrong"
                      }`}
                    >
                      {feedback("weak")}
                    </div>
                  )}
                </div>
              </div>

              <div className="lesson3-practice-item">
                <div className="lesson3-practice-number">2</div>
                <div>
                  <h4>
                    You are preparing for an exam. Which addition gives useful
                    context?
                  </h4>
                  <div className="lesson3-choice-row">
                    {[
                      ["random", "Make it interesting."],
                      ["context", "I am a beginner preparing for a school exam."],
                      ["long", "Use many words."],
                    ].map(([value, text]) => (
                      <button
                        key={value}
                        type="button"
                        className={answers.study === value ? "selected" : ""}
                        onClick={() => answer("study", value)}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                  {feedback("study") && (
                    <div
                      className={`lesson3-feedback ${
                        answers.study === "context" ? "correct" : "wrong"
                      }`}
                    >
                      {feedback("study")}
                    </div>
                  )}
                </div>
              </div>

              <div className="lesson3-practice-item">
                <div className="lesson3-practice-number">3</div>
                <div>
                  <h4>Which instruction controls the output format?</h4>
                  <div className="lesson3-choice-row">
                    {[
                      ["topic", "Explain photosynthesis."],
                      ["format", "Put the answer in a 5-row table."],
                      ["goal", "Help me understand it."],
                    ].map(([value, text]) => (
                      <button
                        key={value}
                        type="button"
                        className={answers.format === value ? "selected" : ""}
                        onClick={() => answer("format", value)}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                  {feedback("format") && (
                    <div
                      className={`lesson3-feedback ${
                        answers.format === "format" ? "correct" : "wrong"
                      }`}
                    >
                      {feedback("format")}
                    </div>
                  )}
                </div>
              </div>

              <div className="lesson3-practice-item">
                <div className="lesson3-practice-number">4</div>
                <div>
                  <h4>
                    You want to learn rather than copy an answer. Which prompt
                    is best?
                  </h4>
                  <div className="lesson3-choice-row">
                    {[
                      ["answer", "Give me only the final answer."],
                      [
                        "coach",
                        "Guide me with hints first and let me try each step.",
                      ],
                      ["copy", "Do the whole assignment for me."],
                    ].map(([value, text]) => (
                      <button
                        key={value}
                        type="button"
                        className={answers.coach === value ? "selected" : ""}
                        onClick={() => answer("coach", value)}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                  {feedback("coach") && (
                    <div
                      className={`lesson3-feedback ${
                        answers.coach === "coach" ? "correct" : "wrong"
                      }`}
                    >
                      {feedback("coach")}
                    </div>
                  )}
                </div>
              </div>

              <div className="lesson3-practice-item">
                <div className="lesson3-practice-number">5</div>
                <div>
                  <h4>
                    Which prompt uses AI as a checking assistant without
                    treating it as proof?
                  </h4>
                  <div className="lesson3-choice-row">
                    {[
                      ["verify", "Check my answer, point out possible errors, and tell me what facts I should verify."],
                      ["trust", "Tell me whether my answer is definitely correct."],
                      ["guess", "Guess if I am right."],
                    ].map(([value, text]) => (
                      <button
                        key={value}
                        type="button"
                        className={answers.verify === value ? "selected" : ""}
                        onClick={() => answer("verify", value)}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                  {feedback("verify") && (
                    <div
                      className={`lesson3-feedback ${
                        answers.verify === "verify" ? "correct" : "wrong"
                      }`}
                    >
                      {feedback("verify")}
                    </div>
                  )}
                </div>
              </div>

              <div className="lesson3-practice-score">
                <div>
                  <strong>Practice score</strong>
                  <span>
                    {practiceScore} / {Object.keys(PRACTICE_EXPECTED).length}
                  </span>
                </div>
                <div className="lesson3-mini-progress">
                  <div
                    style={{
                      width: `${
                        (practiceScore /
                          Object.keys(PRACTICE_EXPECTED).length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="lesson3-final-checklist">
                <div className={hasLearnedPrompt ? "done" : ""}>
                  <span>{hasLearnedPrompt ? "✓" : "1"}</span>
                  Understand what a prompt is
                </div>
                <div className={practiceScore >= 3 ? "done" : ""}>
                  <span>{practiceScore >= 3 ? "✓" : "2"}</span>
                  Build clearer prompts
                </div>
                <div className={practiceScore === 5 ? "done" : ""}>
                  <span>{practiceScore === 5 ? "✓" : "3"}</span>
                  Use prompting for learning and real tasks
                </div>
              </div>

              {!practiceComplete && (
                <div className="lesson3-feedback wrong">
                  Complete all five practice questions correctly. Read the
                  explanation after each answer — the reasoning is the lesson.
                </div>
              )}

              {practiceComplete && !completed && (
                <button
                  type="button"
                  className="lesson3-primary"
                  disabled={!hasLearnedPrompt}
                  onClick={completeLesson}
                >
                  Complete Lesson 3 ✓
                </button>
              )}

              {completed && (
                <div className="lesson3-completion-panel">
                  <div className="lesson3-completion-icon">✓</div>
                  <div>
                    <strong>Lesson 3 complete!</strong>
                    <p>
                      You can now turn a goal into a clear prompt, add useful
                      context, choose an output format, refine the result and
                      use prompt patterns for studying and real-life tasks.
                    </p>
                    <div className="lesson3-next-panel">
                      <strong>Progress saved: 3 / 8 lessons completed</strong>
                      <p>
                        Lesson 4 is now unlocked. Continue with the next CURIO
                        skill.
                      </p>
                      <button
                        type="button"
                        className="lesson3-next-button"
                        onClick={() => navigate("/learn")}
                      >
                        Continue to Lesson 4 →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {section !== "alphabet" && (
            <button
              type="button"
              className="lesson3-secondary-button"
              onClick={goPrevious}
            >
              ← Previous section
            </button>
          )}

          {section !== "practice" && (
            <div className="lesson3-next-hint">
              <span>💡</span>
              <p>
                Tip: do not copy a prompt just because it looks impressive.
                Understand why each part is there.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Lesson3;
