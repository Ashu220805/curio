import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Lesson6.css";

type LessonSection =
  | "start"
  | "study"
  | "research"
  | "create"
  | "everyday"
  | "plan"
  | "practice"
  | "finish";

type FinalAnswers = Record<number, string>;

const LESSON_SECTIONS: {
  id: LessonSection;
  number: string;
  title: string;
}[] = [
  { id: "start", number: "01", title: "AI in real life" },
  { id: "study", number: "02", title: "Study smarter" },
  { id: "research", number: "03", title: "Learn & research" },
  { id: "create", number: "04", title: "Create with AI" },
  { id: "everyday", number: "05", title: "Solve everyday problems" },
  { id: "plan", number: "06", title: "Plan & organise" },
  { id: "practice", number: "07", title: "Real-life practice lab" },
  { id: "finish", number: "08", title: "Final challenge" },
];

const FINAL_QUESTIONS = [
  {
    question: "You have a difficult science topic. What is a useful first request?",
    options: [
      "Explain it simply with an example and then ask me one question.",
      "Give me the answer to my entire exam.",
      "Write random facts about science.",
      "Tell me nothing except the topic name.",
    ],
    answer: "Explain it simply with an example and then ask me one question.",
    explanation:
      "A clear learning request makes AI a study helper instead of replacing your learning.",
  },
  {
    question: "What should you do before trusting an important AI answer?",
    options: [
      "Check important facts with a reliable source.",
      "Assume it must be correct.",
      "Share it immediately.",
      "Use the answer only because it sounds confident.",
    ],
    answer: "Check important facts with a reliable source.",
    explanation:
      "AI can make mistakes, so important information should be verified.",
  },
  {
    question: "You want ideas for a school poster. Which use is appropriate?",
    options: [
      "Ask AI for several themes, slogans and layout ideas, then create your own poster.",
      "Submit an AI-made poster as your own without checking school rules.",
      "Ask AI to copy another student's work.",
      "Give AI your private account password.",
    ],
    answer:
      "Ask AI for several themes, slogans and layout ideas, then create your own poster.",
    explanation:
      "AI can support creativity while you remain responsible for the final work.",
  },
  {
    question: "You need to organise tomorrow's study session. What can AI help with?",
    options: [
      "Turn your subjects and available time into a simple study plan.",
      "Guarantee that you will get full marks.",
      "Decide everything without knowing your schedule.",
      "Replace all of your studying.",
    ],
    answer:
      "Turn your subjects and available time into a simple study plan.",
    explanation:
      "AI is useful for planning when you provide the goal, constraints and time available.",
  },
  {
    question: "Which mindset is best when using AI in everyday life?",
    options: [
      "Use AI as a helper, think for yourself, and check important results.",
      "Let AI make every decision for you.",
      "Never question an AI answer.",
      "Use AI only when someone else tells you to.",
    ],
    answer:
      "Use AI as a helper, think for yourself, and check important results.",
    explanation:
      "The goal is AI independence: use the tool while keeping your own judgement.",
  },
];

function readCompletedLessons(): number[] {
  try {
    const stored = localStorage.getItem("curio_completed_lessons");
    if (!stored) return [1];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [1];

    const valid = parsed.filter(
      (id): id is number => typeof id === "number"
    );

    return Array.from(new Set([1, ...valid])).sort((a, b) => a - b);
  } catch {
    return [1];
  }
}

function saveCompletedLesson(lessonId: number) {
  const completed = Array.from(
    new Set([...readCompletedLessons(), lessonId])
  ).sort((a, b) => a - b);

  localStorage.setItem(
    "curio_completed_lessons",
    JSON.stringify(completed)
  );

  window.dispatchEvent(
    new CustomEvent("curio:lesson-completed", {
      detail: {
        lesson: lessonId,
        completedLessons: completed,
      },
    })
  );

  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "curio_completed_lessons",
      newValue: JSON.stringify(completed),
      storageArea: localStorage,
    })
  );
}

function Lesson6() {
  const navigate = useNavigate();

  const [section, setSection] = useState<LessonSection>("start");
  const [completedSections, setCompletedSections] = useState<LessonSection[]>(
    []
  );
  const [practiceChoice, setPracticeChoice] = useState("");
  const [practiceChecked, setPracticeChecked] = useState(false);
  const [finalAnswers, setFinalAnswers] = useState<FinalAnswers>({});
  const [finalChecked, setFinalChecked] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);

  const currentIndex = LESSON_SECTIONS.findIndex(
    (item) => item.id === section
  );

  const progressCount = completedSections.length;
  const progressPercent = Math.round(
    (progressCount / LESSON_SECTIONS.length) * 100
  );

  const furthestUnlockedIndex = useMemo(() => {
    let index = 0;

    for (let i = 0; i < LESSON_SECTIONS.length - 1; i += 1) {
      if (completedSections.includes(LESSON_SECTIONS[i].id)) {
        index = i + 1;
      } else {
        break;
      }
    }

    return index;
  }, [completedSections]);

  const markSectionComplete = (id: LessonSection) => {
    setCompletedSections((previous) => {
      if (previous.includes(id)) return previous;
      return [...previous, id];
    });
  };

  const canOpenSection = (index: number) =>
    index <= furthestUnlockedIndex ||
    completedSections.includes(LESSON_SECTIONS[index].id);

  const openSection = (id: LessonSection, index: number) => {
    if (!canOpenSection(index)) return;

    setSection(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    if (currentIndex < 0 || currentIndex >= LESSON_SECTIONS.length - 1) {
      return;
    }

    markSectionComplete(LESSON_SECTIONS[currentIndex].id);
    setSection(LESSON_SECTIONS[currentIndex + 1].id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goPrevious = () => {
    if (currentIndex <= 0) return;

    setSection(LESSON_SECTIONS[currentIndex - 1].id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const chooseFinalAnswer = (questionIndex: number, answer: string) => {
    setFinalAnswers((previous) => ({
      ...previous,
      [questionIndex]: answer,
    }));
  };

  const checkFinalAnswer = (questionIndex: number) => {
    setFinalChecked((previous) =>
      previous.includes(questionIndex)
        ? previous
        : [...previous, questionIndex]
    );
  };

  const finalScore = FINAL_QUESTIONS.reduce(
    (score, question, index) =>
      finalAnswers[index] === question.answer ? score + 1 : score,
    0
  );

  const finalReady = finalChecked.length === FINAL_QUESTIONS.length;
  const finalPerfect = finalReady && finalScore === FINAL_QUESTIONS.length;

  const finishLesson = () => {
    if (!finalPerfect) return;

    markSectionComplete("finish");
    setCompleted(true);
    saveCompletedLesson(6);
  };

  const practiceReady = practiceChecked && practiceChoice !== "";

  const renderSection = () => {
    switch (section) {
      case "start":
        return (
          <>
            <span className="lesson6-step-label">01 · START HERE</span>
            <h2>AI is a helper, not a replacement. 🤝</h2>
            <p className="lesson6-lead">
              AI becomes useful when you give it a real goal and then use its
              output thoughtfully. You can use it to learn, create, plan,
              organise and solve everyday problems.
            </p>

            <div className="lesson6-principle">
              <span>💡</span>
              <div>
                <strong>CURIO Real-Life Rule</strong>
                <p>
                  <b>Ask → Understand → Improve → Check → Use.</b>
                </p>
              </div>
            </div>

            <div className="lesson6-use-grid">
              <article>
                <span>📚</span>
                <strong>Study</strong>
                <p>Understand topics, practise questions and revise.</p>
              </article>
              <article>
                <span>🔎</span>
                <strong>Research</strong>
                <p>Explore ideas and turn confusing information into simple explanations.</p>
              </article>
              <article>
                <span>🎨</span>
                <strong>Create</strong>
                <p>Brainstorm stories, posters, designs, scripts and ideas.</p>
              </article>
              <article>
                <span>🧩</span>
                <strong>Solve</strong>
                <p>Break everyday problems into smaller, clearer steps.</p>
              </article>
            </div>

            <div className="lesson6-example-box">
              <strong>Think about this:</strong>
              <p>
                Instead of typing <b>"Maths"</b>, you could ask:
              </p>
              <code>
                Explain quadratic equations like I am a beginner, then give me
                3 easy practice questions.
              </code>
            </div>

            <div className="lesson6-tip">
              <strong>The better the goal, the more useful the help.</strong>
              <p>
                You already learned how to communicate with AI in Lesson 3.
                Now we will use that skill in real situations.
              </p>
            </div>
          </>
        );

      case "study":
        return (
          <>
            <span className="lesson6-step-label">02 · STUDY SMARTER</span>
            <h2>Use AI as your study partner. 📚</h2>
            <p className="lesson6-lead">
              AI can explain a difficult idea, turn notes into revision
              material, create practice questions and help you find gaps in
              your understanding.
            </p>

            <div className="lesson6-flow">
              <div><b>1</b><span>Learn</span><small>Ask for a simple explanation.</small></div>
              <div><b>2</b><span>See</span><small>Ask for an example or analogy.</small></div>
              <div><b>3</b><span>Try</span><small>Ask for a question without the answer.</small></div>
              <div><b>4</b><span>Check</span><small>Ask AI to explain your mistake.</small></div>
            </div>

            <div className="lesson6-prompt-card">
              <span>GOOD STUDY REQUEST</span>
              <code>
                I am preparing for an exam. Explain photosynthesis in simple
                language, give one everyday analogy, then quiz me with 5
                questions.
              </code>
            </div>

            <div className="lesson6-two-column">
              <div>
                <strong>AI can help you...</strong>
                <ul>
                  <li>summarise your own notes</li>
                  <li>make flashcards</li>
                  <li>generate practice questions</li>
                  <li>explain a difficult step</li>
                </ul>
              </div>
              <div>
                <strong>You still need to...</strong>
                <ul>
                  <li>think about the answer</li>
                  <li>solve problems yourself</li>
                  <li>check important facts</li>
                  <li>follow your school rules</li>
                </ul>
              </div>
            </div>

            <div className="lesson6-tip">
              <strong>Best habit:</strong>
              <p>
                Ask AI to teach you and test you — not simply to do all the
                learning for you.
              </p>
            </div>
          </>
        );

      case "research":
        return (
          <>
            <span className="lesson6-step-label">03 · LEARN & RESEARCH</span>
            <h2>Turn confusion into a learning path. 🔎</h2>
            <p className="lesson6-lead">
              When you do not understand something, AI can help you decide what
              to learn first, explain vocabulary and suggest questions to
              investigate.
            </p>

            <div className="lesson6-research-map">
              <div><span>❓</span><strong>Question</strong><p>What exactly am I trying to understand?</p></div>
              <div><span>🧱</span><strong>Break it down</strong><p>What smaller ideas do I need first?</p></div>
              <div><span>📖</span><strong>Explore</strong><p>Ask for explanations and examples.</p></div>
              <div><span>✅</span><strong>Verify</strong><p>Check important claims with reliable sources.</p></div>
            </div>

            <div className="lesson6-example-box">
              <strong>Example: "I don't understand climate change."</strong>
              <p>Instead of asking for one huge answer, try:</p>
              <code>
                Teach me the basics of climate change in 4 small steps. After
                each step, ask me one question to check my understanding.
              </code>
            </div>

            <div className="lesson6-warning">
              <strong>⚠️ Remember</strong>
              <p>
                An AI answer can sound confident and still be wrong. For
                important facts, dates, statistics, health, money, law or
                current events, verify the information.
              </p>
            </div>
          </>
        );

      case "create":
        return (
          <>
            <span className="lesson6-step-label">04 · CREATE WITH AI</span>
            <h2>Use AI to expand your ideas. 🎨</h2>
            <p className="lesson6-lead">
              Creativity is not only about generating a final answer. AI can
              help you brainstorm possibilities, compare ideas and improve a
              draft you created.
            </p>

            <div className="lesson6-create-grid">
              <article>
                <span>💭</span>
                <strong>Brainstorm</strong>
                <p>Ask for 10 possible ideas before choosing one.</p>
              </article>
              <article>
                <span>✍️</span>
                <strong>Draft</strong>
                <p>Give AI your goal and ask for a first version.</p>
              </article>
              <article>
                <span>🔧</span>
                <strong>Improve</strong>
                <p>Ask for clearer wording, structure or alternatives.</p>
              </article>
              <article>
                <span>🧠</span>
                <strong>Own it</strong>
                <p>Review, edit and make the final work yours.</p>
              </article>
            </div>

            <div className="lesson6-before-after">
              <div>
                <span>TOO VAGUE</span>
                <code>Give me a story.</code>
              </div>
              <div>
                <span>MORE USEFUL</span>
                <code>
                  Give me 3 story ideas for a 500-word school story about
                  friendship and courage. Keep them suitable for a beginner
                  writer.
                </code>
              </div>
            </div>

            <div className="lesson6-tip">
              <strong>AI gives possibilities. You make the choices.</strong>
              <p>
                Always check your school, workplace or platform rules about AI
                use and credit work appropriately.
              </p>
            </div>
          </>
        );

      case "everyday":
        return (
          <>
            <span className="lesson6-step-label">05 · EVERYDAY PROBLEMS</span>
            <h2>Use AI to break a problem into steps. 🧩</h2>
            <p className="lesson6-lead">
              Everyday problems often feel difficult because they contain many
              small decisions. AI can help you organise those decisions.
            </p>

            <div className="lesson6-problem-grid">
              <article>
                <span>🍳</span>
                <strong>Cooking</strong>
                <p>Plan a simple meal from ingredients you already have.</p>
              </article>
              <article>
                <span>🗓️</span>
                <strong>Planning</strong>
                <p>Turn a list of tasks into a realistic order.</p>
              </article>
              <article>
                <span>💻</span>
                <strong>Technology</strong>
                <p>Explain a technical problem and ask for troubleshooting steps.</p>
              </article>
              <article>
                <span>✉️</span>
                <strong>Communication</strong>
                <p>Improve a message while keeping your meaning and tone.</p>
              </article>
            </div>

            <div className="lesson6-framework">
              <strong>The 4-part problem prompt</strong>
              <div>
                <span>GOAL</span>
                <span>CONTEXT</span>
                <span>CONSTRAINT</span>
                <span>OUTPUT</span>
              </div>
              <p>
                Example: "Help me plan a 2-hour study session. I have Maths and
                English, I need one break, and I want the result as a simple
                timetable."
              </p>
            </div>

            <div className="lesson6-warning">
              <strong>Important:</strong>
              <p>
                For high-stakes decisions involving health, safety, money or
                legal matters, AI should not be your only source of advice.
              </p>
            </div>
          </>
        );

      case "plan":
        return (
          <>
            <span className="lesson6-step-label">06 · PLAN & ORGANISE</span>
            <h2>Give AI your constraints. 🗓️</h2>
            <p className="lesson6-lead">
              A useful plan needs more than a goal. Tell AI what time, tools,
              limits and priorities you have.
            </p>

            <div className="lesson6-plan-card">
              <div><strong>Goal</strong><p>What do I want to finish?</p></div>
              <div><strong>Time</strong><p>How much time do I have?</p></div>
              <div><strong>Limits</strong><p>What can or cannot I do?</p></div>
              <div><strong>Priority</strong><p>What matters most?</p></div>
            </div>

            <div className="lesson6-prompt-card">
              <span>EXAMPLE</span>
              <code>
                I have 3 hours tonight. I need to revise Maths, Physics and
                English. Maths is my weakest subject. Make a realistic plan
                with two short breaks and put the most important work first.
              </code>
            </div>

            <div className="lesson6-checklist">
              <strong>Before following the plan, ask:</strong>
              <label>☐ Does this fit my real schedule?</label>
              <label>☐ Is the plan realistic?</label>
              <label>☐ Did AI understand my priorities?</label>
              <label>☐ Can I adjust it if something changes?</label>
            </div>

            <div className="lesson6-tip">
              <strong>AI can organise your options. You decide what is realistic.</strong>
            </div>
          </>
        );

      case "practice":
        return (
          <>
            <span className="lesson6-step-label">07 · PRACTICE LAB</span>
            <h2>Choose the right real-life use. ✋</h2>
            <p className="lesson6-lead">
              You are now going to practise choosing how AI could help in a
              real situation.
            </p>

            <div className="lesson6-scenario">
              <strong>Scenario</strong>
              <p>
                You have an exam in three days. You know the subjects, but you
                keep wasting time deciding what to study first.
              </p>
            </div>

            <div className="lesson6-choice-list">
              {[
                "Ask AI to create a study plan using your subjects, available time and weakest topic.",
                "Ask AI to take the exam for you.",
                "Ask AI to guarantee which questions will appear.",
              ].map((choice) => (
                <button
                  type="button"
                  key={choice}
                  className={`lesson6-choice ${
                    practiceChoice === choice ? "selected" : ""
                  }`}
                  onClick={() => {
                    setPracticeChoice(choice);
                    setPracticeChecked(false);
                  }}
                >
                  {choice}
                </button>
              ))}
            </div>

            {practiceChoice && (
              <div className="lesson6-feedback">
                <strong>
                  {practiceChoice.startsWith("Ask AI to create")
                    ? "Good choice! ✅"
                    : "Try again. 💡"}
                </strong>
                <p>
                  {practiceChoice.startsWith("Ask AI to create")
                    ? "You are using AI to organise your work while keeping control of your studying."
                    : "The goal is to use AI as a practical helper, not to replace your responsibility or pretend it can predict the future."}
                </p>
              </div>
            )}

            <button
              type="button"
              className="lesson6-check-button"
              disabled={!practiceChoice}
              onClick={() => setPracticeChecked(true)}
            >
              Check my choice
            </button>

            {practiceChecked && (
              <div className="lesson6-complete-note">
                Practice complete. You are ready for the final challenge.
              </div>
            )}
          </>
        );

      case "finish":
        return (
          <>
            <span className="lesson6-step-label">08 · FINAL CHALLENGE</span>
            <h2>Can you use AI in real life? 🚀</h2>
            <p className="lesson6-lead">
              Answer all 5 questions. You need <b>5 / 5</b> to complete Lesson
              6. Each answer gives you a short explanation so you learn from
              the decision.
            </p>

            <div className="lesson6-final-list">
              {FINAL_QUESTIONS.map((item, index) => {
                const checked = finalChecked.includes(index);
                const correct = finalAnswers[index] === item.answer;

                return (
                  <article
                    key={item.question}
                    className={`lesson6-final-question ${
                      checked ? (correct ? "correct" : "incorrect") : ""
                    }`}
                  >
                    <div className="lesson6-question-number">
                      {index + 1}
                    </div>

                    <div>
                      <strong>{item.question}</strong>

                      <div className="lesson6-final-options">
                        {item.options.map((option) => (
                          <button
                            type="button"
                            key={option}
                            className={
                              finalAnswers[index] === option ? "selected" : ""
                            }
                            onClick={() => {
                              chooseFinalAnswer(index, option);
                              setFinalChecked((previous) =>
                                previous.filter((value) => value !== index)
                              );
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="lesson6-check-button small"
                        disabled={!finalAnswers[index]}
                        onClick={() => checkFinalAnswer(index)}
                      >
                        Check answer
                      </button>

                      {checked && (
                        <div className="lesson6-answer-feedback">
                          <strong>
                            {correct ? "Correct ✓" : "Not quite"}
                          </strong>
                          <p>{item.explanation}</p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="lesson6-score">
              <strong>
                Score: {finalScore} / {FINAL_QUESTIONS.length}
              </strong>
              <span>
                {finalPerfect
                  ? "Excellent. You are ready to use AI more independently."
                  : "Check every question and aim for 5 / 5."}
              </span>
            </div>
          </>
        );
    }
  };

  if (completed) {
    return (
      <div className="lesson6-page">
        <div className="lesson6-completion">
          <span>LESSON 06 COMPLETE</span>
          <div className="lesson6-completion-icon">✓</div>
          <h1>AI in Real Life</h1>
          <p>
            You now know how to use AI for studying, research, creativity,
            planning and everyday problems — while keeping your own judgement
            in control.
          </p>

          <div className="lesson6-completion-grid">
            <div>📚 Study smarter</div>
            <div>🔎 Research clearly</div>
            <div>🎨 Create ideas</div>
            <div>🧩 Solve problems</div>
          </div>

          <button
            type="button"
            className="lesson6-primary"
            onClick={() => navigate("/learn")}
          >
            Back to Learn →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson6-page">
      <header className="lesson6-header">
        <div className="lesson6-header-left">
          <button
            type="button"
            className="lesson6-back-button"
            onClick={() => navigate("/learn")}
          >
            ←
          </button>

          <div>
            <span className="lesson6-header-label">CURIO LEARNING</span>
            <h1>Lesson 06 · AI in Real Life</h1>
          </div>
        </div>

        <div className="lesson6-header-progress">
          <div className="lesson6-progress-text">
            <span>Your lesson progress</span>
            <strong>
              {progressCount} / {LESSON_SECTIONS.length}
            </strong>
          </div>
          <div className="lesson6-progress-track">
            <div
              className="lesson6-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <div className="lesson6-layout">
        <aside className="lesson6-navigation">
          <div className="lesson6-nav-title">
            <span>LESSON JOURNEY</span>
            <strong>AI in Real Life</strong>
          </div>

          {LESSON_SECTIONS.map((item, index) => {
            const unlocked = canOpenSection(index);
            const isCompleted = completedSections.includes(item.id);

            return (
              <button
                type="button"
                key={item.id}
                disabled={!unlocked}
                onClick={() => openSection(item.id, index)}
                className={`lesson6-nav-item ${
                  section === item.id ? "active" : ""
                } ${!unlocked ? "locked" : ""} ${
                  isCompleted ? "completed" : ""
                }`}
              >
                <span>{isCompleted ? "✓" : item.number}</span>
                <strong>{item.title}</strong>
                {!unlocked && <small>🔒 Locked</small>}
              </button>
            );
          })}

          <div className="lesson6-lock-note">
            <span>🔒</span>
            <p>Complete each section to unlock the next one.</p>
          </div>
        </aside>

        <main className="lesson6-main">
          <section className="lesson6-intro">
            <span>LESSON 06 · PRACTICAL AI</span>
            <h2>AI in Real Life</h2>
            <p>
              Discover practical ways to use AI for studying, creativity and
              everyday problems.
            </p>

            <div className="lesson6-intro-meta">
              <span>⏱ 7–9 min</span>
              <span>•</span>
              <span>Beginner</span>
              <span>•</span>
              <span>Learn by doing</span>
            </div>
          </section>

          <section className="lesson6-card">
            {renderSection()}
          </section>

          <div className="lesson6-footer">
            <button
              type="button"
              className="lesson6-secondary"
              onClick={goPrevious}
              disabled={currentIndex <= 0}
            >
              ← Previous
            </button>

            {section !== "finish" ? (
              <button
                type="button"
                className="lesson6-primary"
                onClick={goNext}
                disabled={
                  section === "practice" && !practiceReady
                }
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                className="lesson6-primary"
                onClick={finishLesson}
                disabled={!finalPerfect}
              >
                {finalPerfect
                  ? "Complete Lesson 6 ✓"
                  : "Score 5 / 5 First"}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Lesson6;