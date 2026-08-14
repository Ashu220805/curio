import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Lesson7.css";

type LessonSection =
  | "start"
  | "workflow"
  | "tools"
  | "handoff"
  | "build"
  | "safety"
  | "practice"
  | "finish";

const LESSON_SECTIONS: {
  id: LessonSection;
  number: string;
  title: string;
}[] = [
  { id: "start", number: "01", title: "What is a workflow?" },
  { id: "workflow", number: "02", title: "Think in steps" },
  { id: "tools", number: "03", title: "Choose the right tool" },
  { id: "handoff", number: "04", title: "Pass work between tools" },
  { id: "build", number: "05", title: "Build your first workflow" },
  { id: "safety", number: "06", title: "Safety & control" },
  { id: "practice", number: "07", title: "Workflow practice lab" },
  { id: "finish", number: "08", title: "Final challenge" },
];

const FINAL_QUESTIONS = [
  {
    question: "What is an AI workflow?",
    options: [
      "A sequence of steps where tools or AI help complete a bigger task.",
      "A single random question sent to an AI.",
      "A password for an AI account.",
      "A way to avoid checking AI output.",
    ],
    answer: "A sequence of steps where tools or AI help complete a bigger task.",
    explanation:
      "A workflow connects smaller actions so a larger task becomes easier to complete.",
  },
  {
    question: "What should you decide before choosing several AI tools?",
    options: [
      "What the goal is and what each step needs.",
      "Which tool has the most colourful interface.",
      "How to make the workflow as complicated as possible.",
      "How to let the tools make every decision.",
    ],
    answer: "What the goal is and what each step needs.",
    explanation:
      "Start with the task. Then choose tools because they solve a specific part of the task.",
  },
  {
    question: "Why is a handoff important in a workflow?",
    options: [
      "It defines what information moves from one step or tool to the next.",
      "It guarantees that every AI answer is correct.",
      "It means you never need to read the output.",
      "It removes the need for a clear goal.",
    ],
    answer:
      "It defines what information moves from one step or tool to the next.",
    explanation:
      "A good handoff tells the next step what it receives and what it should do with it.",
  },
  {
    question: "Which workflow is safest for an important task?",
    options: [
      "AI helps with steps, while a person reviews important outputs before using them.",
      "Several AI tools pass information forever without review.",
      "The first AI answer is automatically treated as fact.",
      "Private information is copied into every tool.",
    ],
    answer:
      "AI helps with steps, while a person reviews important outputs before using them.",
    explanation:
      "Human review, privacy awareness and verification remain important when workflows affect real decisions.",
  },
  {
    question: "You want to create a school presentation. What is a sensible workflow?",
    options: [
      "Research → verify → outline → create slides → review.",
      "Create slides → submit immediately → research later.",
      "Ask one AI to do everything and never check it.",
      "Copy information from several tools without understanding it.",
    ],
    answer: "Research → verify → outline → create slides → review.",
    explanation:
      "Breaking a bigger task into clear stages makes the work easier to manage and review.",
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

function Lesson7() {
  const navigate = useNavigate();

  const [section, setSection] = useState<LessonSection>("start");
  const [completedSections, setCompletedSections] = useState<LessonSection[]>(
    []
  );
  const [practiceChoice, setPracticeChoice] = useState("");
  const [practiceChecked, setPracticeChecked] = useState(false);
  const [finalAnswers, setFinalAnswers] = useState<Record<number, string>>({});
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

  const canOpenSection = (index: number) =>
    index <= furthestUnlockedIndex ||
    completedSections.includes(LESSON_SECTIONS[index].id);

  const markSectionComplete = (id: LessonSection) => {
    setCompletedSections((previous) =>
      previous.includes(id) ? previous : [...previous, id]
    );
  };

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrevious = () => {
    if (currentIndex <= 0) return;

    setSection(LESSON_SECTIONS[currentIndex - 1].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    saveCompletedLesson(7);
  };

  const renderSection = () => {
    switch (section) {
      case "start":
        return (
          <>
            <span className="lesson7-step-label">01 · START HERE</span>
            <h2>Big tasks become easier when you connect small steps. 🔗</h2>
            <p className="lesson7-lead">
              An AI workflow is a planned sequence of actions where AI tools,
              normal tools and you work together to finish a bigger task.
            </p>

            <div className="lesson7-principle">
              <span>💡</span>
              <div>
                <strong>CURIO Workflow Rule</strong>
                <p>
                  <b>Goal → Steps → Tools → Handoffs → Review → Result.</b>
                </p>
              </div>
            </div>

            <div className="lesson7-use-grid">
              <article>
                <span>🎯</span>
                <strong>One big goal</strong>
                <p>Start by deciding what you actually want to finish.</p>
              </article>
              <article>
                <span>🧩</span>
                <strong>Small steps</strong>
                <p>Break the big task into actions that are easier to manage.</p>
              </article>
              <article>
                <span>🤖</span>
                <strong>Useful tools</strong>
                <p>Give each step to the tool that is suitable for it.</p>
              </article>
              <article>
                <span>👀</span>
                <strong>Human review</strong>
                <p>Check important work before it becomes the final result.</p>
              </article>
            </div>

            <div className="lesson7-example-box">
              <strong>Example: School presentation</strong>
              <p>Instead of asking one AI to "do everything":</p>
              <code>
                Research topic → verify facts → create outline → make slides →
                practise speaking → review final presentation
              </code>
            </div>

            <div className="lesson7-tip">
              <strong>A workflow is not about using more AI.</strong>
              <p>
                It is about using the right help at the right step.
              </p>
            </div>
          </>
        );

      case "workflow":
        return (
          <>
            <span className="lesson7-step-label">02 · THINK IN STEPS</span>
            <h2>First, turn the big task into a map. 🗺️</h2>
            <p className="lesson7-lead">
              Before choosing tools, understand the work. Ask: What goes in?
              What needs to happen? What should come out?
            </p>

            <div className="lesson7-flow">
              <div>
                <b>1</b>
                <span>INPUT</span>
                <small>What information or material do I have?</small>
              </div>
              <div>
                <b>2</b>
                <span>ACTION</span>
                <small>What needs to be done with it?</small>
              </div>
              <div>
                <b>3</b>
                <span>OUTPUT</span>
                <small>What should this step produce?</small>
              </div>
              <div>
                <b>4</b>
                <span>CHECK</span>
                <small>How will I know it is useful?</small>
              </div>
            </div>

            <div className="lesson7-prompt-card">
              <span>WORKFLOW THINKING</span>
              <code>
                My goal is ____. I already have ____. Break this task into
                simple steps. For each step, tell me what input it needs, what
                output it creates, and what I should check.
              </code>
            </div>

            <div className="lesson7-two-column">
              <div>
                <strong>Weak approach</strong>
                <p>
                  "AI, make my whole project."
                </p>
                <small>
                  The task is unclear and important steps can be missed.
                </small>
              </div>
              <div>
                <strong>Better approach</strong>
                <p>
                  "Help me plan the research, verification, outline and final
                  review."
                </p>
                <small>
                  Each stage has a clear purpose and can be checked.
                </small>
              </div>
            </div>

            <div className="lesson7-tip">
              <strong>Think like a project manager.</strong>
              <p>
                You do not need to know every AI tool yet. First understand the
                job that needs to be done.
              </p>
            </div>
          </>
        );

      case "tools":
        return (
          <>
            <span className="lesson7-step-label">03 · CHOOSE THE RIGHT TOOL</span>
            <h2>Different tools are good at different jobs. 🧰</h2>
            <p className="lesson7-lead">
              A workflow may use an AI chatbot, search tool, image tool,
              spreadsheet, document editor or other software. Choose based on
              the job — not just the tool's popularity.
            </p>

            <div className="lesson7-tool-grid">
              <article>
                <span>💬</span>
                <strong>Chat / text AI</strong>
                <p>Explain, brainstorm, rewrite, organise or practise.</p>
              </article>
              <article>
                <span>🔎</span>
                <strong>Search / research</strong>
                <p>Find current information and sources to investigate.</p>
              </article>
              <article>
                <span>🖼️</span>
                <strong>Image tools</strong>
                <p>Create visual ideas, illustrations or design concepts.</p>
              </article>
              <article>
                <span>📊</span>
                <strong>Data tools</strong>
                <p>Work with tables, calculations, charts and structured data.</p>
              </article>
            </div>

            <div className="lesson7-tool-rule">
              <strong>Ask one question before adding a tool:</strong>
              <p>
                "What specific part of my workflow will this tool improve?"
              </p>
            </div>

            <div className="lesson7-warning">
              <strong>⚠️ More tools does not always mean better.</strong>
              <p>
                Too many tools can create confusion, duplicated work and more
                places where information can be lost or exposed.
              </p>
            </div>
          </>
        );

      case "handoff":
        return (
          <>
            <span className="lesson7-step-label">04 · PASS WORK BETWEEN TOOLS</span>
            <h2>The handoff is where tools connect. 🔄</h2>
            <p className="lesson7-lead">
              A handoff means the output from one step becomes useful input for
              the next step.
            </p>

            <div className="lesson7-handoff">
              <div>
                <span>STEP 1</span>
                <strong>Research AI</strong>
                <p>Finds possible facts and sources.</p>
              </div>
              <div className="lesson7-arrow">→</div>
              <div>
                <span>HANDOFF</span>
                <strong>Verified notes</strong>
                <p>Only useful, checked information moves forward.</p>
              </div>
              <div className="lesson7-arrow">→</div>
              <div>
                <span>STEP 2</span>
                <strong>Writing AI</strong>
                <p>Turns the notes into a clear outline.</p>
              </div>
            </div>

            <div className="lesson7-example-box">
              <strong>Good handoff</strong>
              <p>
                Don't simply paste a huge conversation into the next tool.
                Give the next step a clean instruction.
              </p>
              <code>
                Here are the verified notes. Create a 5-part presentation
                outline. Do not add facts that are not in these notes.
              </code>
            </div>

            <div className="lesson7-checklist">
              <strong>Before a handoff, check:</strong>
              <label>☐ Is the information relevant?</label>
              <label>☐ Is important information verified?</label>
              <label>☐ Does the next tool know what to do?</label>
              <label>☐ Am I accidentally sharing private information?</label>
            </div>
          </>
        );

      case "build":
        return (
          <>
            <span className="lesson7-step-label">05 · BUILD YOUR FIRST WORKFLOW</span>
            <h2>Let's build one together. 🚀</h2>
            <p className="lesson7-lead">
              Imagine you need to make a short presentation about a science
              topic. Here is a beginner-friendly workflow.
            </p>

            <div className="lesson7-build">
              <article>
                <b>01</b>
                <strong>Choose the goal</strong>
                <p>Make a 5-minute presentation for classmates.</p>
              </article>
              <article>
                <b>02</b>
                <strong>Research</strong>
                <p>Find useful information and possible sources.</p>
              </article>
              <article>
                <b>03</b>
                <strong>Verify</strong>
                <p>Check important facts before using them.</p>
              </article>
              <article>
                <b>04</b>
                <strong>Organise</strong>
                <p>Ask AI to turn verified notes into a simple outline.</p>
              </article>
              <article>
                <b>05</b>
                <strong>Create</strong>
                <p>Build slides or visuals from the approved outline.</p>
              </article>
              <article>
                <b>06</b>
                <strong>Review</strong>
                <p>Check facts, clarity, visuals and your own understanding.</p>
              </article>
            </div>

            <div className="lesson7-prompt-card">
              <span>CONNECTING THE STEPS</span>
              <code>
                I have verified notes about photosynthesis. Create a simple
                6-slide outline for beginners. Use only the information in my
                notes and clearly mark anything that needs another source.
              </code>
            </div>

            <div className="lesson7-tip">
              <strong>Notice what changed?</strong>
              <p>
                You are no longer asking one tool to magically finish a giant
                task. You are designing a controlled process.
              </p>
            </div>
          </>
        );

      case "safety":
        return (
          <>
            <span className="lesson7-step-label">06 · SAFETY & CONTROL</span>
            <h2>A workflow still needs a human in control. 🛡️</h2>
            <p className="lesson7-lead">
              Connecting tools can make work faster, but every connection is
              also a place where errors, privacy problems or misleading output
              can spread.
            </p>

            <div className="lesson7-safety-grid">
              <article>
                <span>🔐</span>
                <strong>Protect data</strong>
                <p>Do not send passwords, private keys or unnecessary personal information.</p>
              </article>
              <article>
                <span>✅</span>
                <strong>Verify</strong>
                <p>Check important information before passing it forward.</p>
              </article>
              <article>
                <span>👤</span>
                <strong>Keep control</strong>
                <p>Do not let an automated chain make important decisions without review.</p>
              </article>
              <article>
                <span>🧠</span>
                <strong>Understand</strong>
                <p>Know what each step is doing before trusting the final result.</p>
              </article>
            </div>

            <div className="lesson7-warning">
              <strong>Golden rule</strong>
              <p>
                <b>Automate repetition, not responsibility.</b> If a result
                affects people, money, safety, school work or important
                decisions, keep meaningful human review.
              </p>
            </div>

            <div className="lesson7-example-box">
              <strong>Simple workflow safety check</strong>
              <code>
                What information enters the workflow? → Where does it go? →
                What does each tool change? → Where do I verify? → Who makes
                the final decision?
              </code>
            </div>
          </>
        );

      case "practice":
        return (
          <>
            <span className="lesson7-step-label">07 · PRACTICE LAB</span>
            <h2>Choose the best workflow. ✋</h2>
            <p className="lesson7-lead">
              You need to create a school presentation from your own research.
              Which workflow shows good planning and human control?
            </p>

            <div className="lesson7-scenario">
              <strong>Scenario</strong>
              <p>
                You have notes from your research and need to turn them into a
                clear presentation.
              </p>
            </div>

            <div className="lesson7-choice-list">
              {[
                "Verify notes → ask AI for an outline → create slides → review facts and presentation yourself.",
                "Send private information to several tools → ask them all to do everything → submit the first result.",
                "Ask one AI to make the presentation → never check the facts → submit it immediately.",
              ].map((choice) => (
                <button
                  type="button"
                  key={choice}
                  className={`lesson7-choice ${
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
              <div className="lesson7-feedback">
                <strong>
                  {practiceChoice.startsWith("Verify notes")
                    ? "Excellent workflow! ✅"
                    : "Try again. 💡"}
                </strong>
                <p>
                  {practiceChoice.startsWith("Verify notes")
                    ? "The information is checked before the next step, the tools have clear jobs, and you review the final result."
                    : "A strong workflow needs a clear sequence, appropriate tools, privacy awareness and human review."}
                </p>
              </div>
            )}

            <button
              type="button"
              className="lesson7-check-button"
              disabled={!practiceChoice}
              onClick={() => setPracticeChecked(true)}
            >
              Check my choice
            </button>

            {practiceChecked && (
              <div className="lesson7-complete-note">
                Practice complete. You are ready for the final challenge.
              </div>
            )}
          </>
        );

      case "finish":
        return (
          <>
            <span className="lesson7-step-label">08 · FINAL CHALLENGE</span>
            <h2>Can you build a useful AI workflow? 🧠</h2>
            <p className="lesson7-lead">
              Answer all 5 questions. You need <b>5 / 5</b> to complete Lesson
              7.
            </p>

            <div className="lesson7-final-list">
              {FINAL_QUESTIONS.map((item, index) => {
                const checked = finalChecked.includes(index);
                const correct = finalAnswers[index] === item.answer;

                return (
                  <article
                    key={item.question}
                    className={`lesson7-final-question ${
                      checked ? (correct ? "correct" : "incorrect") : ""
                    }`}
                  >
                    <div className="lesson7-question-number">{index + 1}</div>

                    <div>
                      <strong>{item.question}</strong>

                      <div className="lesson7-final-options">
                        {item.options.map((option) => (
                          <button
                            type="button"
                            key={option}
                            className={
                              finalAnswers[index] === option ? "selected" : ""
                            }
                            onClick={() => {
                              setFinalAnswers((previous) => ({
                                ...previous,
                                [index]: option,
                              }));
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
                        className="lesson7-check-button small"
                        disabled={!finalAnswers[index]}
                        onClick={() =>
                          setFinalChecked((previous) =>
                            previous.includes(index)
                              ? previous
                              : [...previous, index]
                          )
                        }
                      >
                        Check answer
                      </button>

                      {checked && (
                        <div className="lesson7-answer-feedback">
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

            <div className="lesson7-score">
              <strong>
                Score: {finalScore} / {FINAL_QUESTIONS.length}
              </strong>
              <span>
                {finalPerfect
                  ? "Excellent. You understand how AI tools can work together."
                  : "Check every question and aim for 5 / 5."}
              </span>
            </div>
          </>
        );
    }
  };

  if (completed) {
    return (
      <div className="lesson7-page">
        <div className="lesson7-completion">
          <span>LESSON 07 COMPLETE</span>
          <div className="lesson7-completion-icon">✓</div>
          <h1>AI Workflows</h1>
          <p>
            You now know how to break bigger tasks into steps, choose useful
            tools, connect their outputs and keep human control over the final
            result.
          </p>

          <div className="lesson7-completion-grid">
            <div>🎯 Define the goal</div>
            <div>🧩 Break it down</div>
            <div>🔗 Connect the steps</div>
            <div>🛡️ Review safely</div>
          </div>

          <button
            type="button"
            className="lesson7-primary"
            onClick={() => navigate("/learn")}
          >
            Back to Learn →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson7-page">
      <header className="lesson7-header">
        <div className="lesson7-header-left">
          <button
            type="button"
            className="lesson7-back-button"
            onClick={() => navigate("/learn")}
          >
            ←
          </button>

          <div>
            <span className="lesson7-header-label">CURIO LEARNING</span>
            <h1>Lesson 07 · AI Workflows</h1>
          </div>
        </div>

        <div className="lesson7-header-progress">
          <div className="lesson7-progress-text">
            <span>Your lesson progress</span>
            <strong>
              {progressCount} / {LESSON_SECTIONS.length}
            </strong>
          </div>
          <div className="lesson7-progress-track">
            <div
              className="lesson7-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <div className="lesson7-layout">
        <aside className="lesson7-navigation">
          <div className="lesson7-nav-title">
            <span>LESSON JOURNEY</span>
            <strong>AI Workflows</strong>
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
                className={`lesson7-nav-item ${
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

          <div className="lesson7-lock-note">
            <span>🔒</span>
            <p>Complete each section to unlock the next one.</p>
          </div>
        </aside>

        <main className="lesson7-main">
          <section className="lesson7-intro">
            <span>LESSON 07 · PRACTICAL AI</span>
            <h2>AI Workflows</h2>
            <p>
              Learn how different AI tools can work together to complete bigger
              tasks.
            </p>

            <div className="lesson7-intro-meta">
              <span>⏱ 8–10 min</span>
              <span>•</span>
              <span>Beginner → Intermediate</span>
              <span>•</span>
              <span>Learn by doing</span>
            </div>
          </section>

          <section className="lesson7-card">{renderSection()}</section>

          <div className="lesson7-footer">
            <button
              type="button"
              className="lesson7-secondary"
              onClick={goPrevious}
              disabled={currentIndex <= 0}
            >
              ← Previous
            </button>

            {section !== "finish" ? (
              <button
                type="button"
                className="lesson7-primary"
                onClick={goNext}
                disabled={section === "practice" && !practiceChecked}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                className="lesson7-primary"
                onClick={finishLesson}
                disabled={!finalPerfect}
              >
                {finalPerfect
                  ? "Complete Lesson 7 ✓"
                  : "Score 5 / 5 First"}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Lesson7;