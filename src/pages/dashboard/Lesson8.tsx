import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Lesson8.css";

type Section = {
  id: number;
  title: string;
  icon: string;
};

const sections: Section[] = [
  { id: 1, title: "What Is AI Independence?", icon: "🧠" },
  { id: 2, title: "When Should I Use AI?", icon: "🤔" },
  { id: 3, title: "When Should I Not Use AI?", icon: "🛑" },
  { id: 4, title: "Choose Your Approach", icon: "🎯" },
  { id: 5, title: "Solve a Real Problem", icon: "🧩" },
  { id: 6, title: "Build Your AI Routine", icon: "📋" },
  { id: 7, title: "Practice Lab", icon: "🧪" },
  { id: 8, title: "Final Challenge", icon: "🏆" },
];

const finalQuestions = [
  {
    question: "What does AI independence mean?",
    options: [
      "Letting AI make every decision for you",
      "Being able to decide when and how AI is useful while keeping your own judgment",
      "Never using AI",
      "Copying every AI answer",
    ],
    answer: 1,
    explanation:
      "AI independence means you can choose when AI helps and still think, decide, and check for yourself.",
  },
  {
    question: "You need to understand a difficult school topic. What is a good use of AI?",
    options: [
      "Ask AI to explain it in simple language and then check your understanding",
      "Submit the first answer without reading it",
      "Ask AI to take the exam for you",
      "Avoid learning the topic yourself",
    ],
    answer: 0,
    explanation:
      "AI can act as a learning helper. You should still understand the idea yourself.",
  },
  {
    question: "Which situation needs your own judgment most?",
    options: [
      "Choosing a simple heading",
      "Brainstorming examples",
      "Making an important personal decision",
      "Rewriting a sentence",
    ],
    answer: 2,
    explanation:
      "AI can provide information, but important personal decisions should remain under your own judgment.",
  },
  {
    question: "What is a strong AI habit?",
    options: [
      "Trust the first answer",
      "Use AI without thinking",
      "Give AI every private detail",
      "Use AI as a helper, then think and verify",
    ],
    answer: 3,
    explanation:
      "A strong habit is: use AI to help, think about the result, and verify important information.",
  },
  {
    question: "What is the best final question to ask yourself after using AI?",
    options: [
      "Did AI write everything?",
      "Can I explain and stand behind this answer myself?",
      "Did I finish as quickly as possible?",
      "Can I avoid checking it?",
    ],
    answer: 1,
    explanation:
      "Being able to understand and stand behind the result is a key part of becoming AI-independent.",
  },
];

function Lesson8() {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    Array(finalQuestions.length).fill(-1)
  );
  const [checkedQuestions, setCheckedQuestions] = useState<boolean[]>(
    Array(finalQuestions.length).fill(false)
  );
  const [lessonComplete, setLessonComplete] = useState(false);

  const completedCount = completedSections.length;
  const progress = `${completedCount}/8`;

  const completeCurrentSection = () => {
    setCompletedSections((prev) =>
      prev.includes(currentSection) ? prev : [...prev, currentSection]
    );

    if (currentSection < 8) {
      setCurrentSection(currentSection + 1);
    }
  };

  const checkAnswer = (index: number) => {
    if (selectedAnswers[index] === -1) return;

    setCheckedQuestions((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const finalScore = checkedQuestions.reduce(
    (score, checked, index) =>
      score + (checked && selectedAnswers[index] === finalQuestions[index].answer ? 1 : 0),
    0
  );

  const finishLesson = () => {
    if (finalScore !== finalQuestions.length) return;

    localStorage.setItem("curio_completed_lesson_8", "true");
    const existing = JSON.parse(
      localStorage.getItem("curio_completed_lessons") || "[]"
    );

    if (!existing.includes(8)) {
      localStorage.setItem(
        "curio_completed_lessons",
        JSON.stringify([...existing, 8])
      );
    }

    setLessonComplete(true);
  };

  if (lessonComplete) {
    return (
      <div className="lesson8-page">
        <div className="lesson8-complete">
          <div className="lesson8-complete-icon">🎉</div>
          <p className="lesson8-eyebrow">CURIO • LESSON 08</p>
          <h1>Your Lesson Is Complete!</h1>
          <p>
            You now know how to use AI as a helper while keeping your own
            thinking, judgment, and responsibility.
          </p>

          <div className="lesson8-complete-card">
            <span>✓</span>
            <strong>Lesson 8 completed</strong>
            <small>AI Independence</small>
          </div>

          <button
            className="lesson8-primary-btn"
            onClick={() => navigate("/learn")}
          >
            Back to Learn →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson8-page">
      <header className="lesson8-header">
        <div>
          <p className="lesson8-eyebrow">LESSON 08 • AI INDEPENDENCE</p>
          <h1>Use AI. Keep Your Thinking.</h1>
          <p className="lesson8-subtitle">
            Learn how to decide when AI should help you — and when your own
            judgment should lead.
          </p>
        </div>

        <div className="lesson8-progress">
          <span>{progress}</span>
          <small>progress</small>
        </div>
      </header>

      <div className="lesson8-progress-bar">
        <div
          className="lesson8-progress-fill"
          style={{ width: `${(completedCount / 8) * 100}%` }}
        />
      </div>

      <div className="lesson8-layout">
        <aside className="lesson8-sidebar">
          <h3>Lesson Map</h3>

          {sections.map((section) => {
            const locked =
              section.id > 1 && !completedSections.includes(section.id - 1);
            const active = currentSection === section.id;

            return (
              <button
                key={section.id}
                className={`lesson8-section-item ${active ? "active" : ""} ${
                  locked ? "locked" : ""
                } ${completedSections.includes(section.id) ? "done" : ""}`}
                disabled={locked}
                onClick={() => setCurrentSection(section.id)}
              >
                <span className="lesson8-section-icon">{section.icon}</span>
                <span>
                  <strong>0{section.id}</strong>
                  <small>{section.title}</small>
                </span>
                {completedSections.includes(section.id) ? (
                  <b>✓</b>
                ) : locked ? (
                  <b>🔒</b>
                ) : null}
              </button>
            );
          })}
        </aside>

        <main className="lesson8-content">
          {currentSection === 1 && (
            <section className="lesson8-card">
              <span className="lesson8-number">01</span>
              <h2>What Is AI Independence?</h2>
              <p>
                AI independence does <strong>not</strong> mean doing everything
                without AI. It means you can make a smart choice about using
                AI and still understand what you are doing.
              </p>

              <div className="lesson8-big-idea">
                <span>💡</span>
                <div>
                  <strong>Think of AI as a helper, not your brain.</strong>
                  <p>
                    You give the goal. AI can help with ideas, explanations,
                    organisation, or drafts. You remain responsible for the
                    final result.
                  </p>
                </div>
              </div>

              <div className="lesson8-three-cards">
                <div>
                  <span>🧑</span>
                  <strong>You decide</strong>
                  <small>What you actually need</small>
                </div>
                <div>
                  <span>🤖</span>
                  <strong>AI helps</strong>
                  <small>With useful tasks</small>
                </div>
                <div>
                  <span>🔎</span>
                  <strong>You check</strong>
                  <small>The final result</small>
                </div>
              </div>

              <button className="lesson8-primary-btn" onClick={completeCurrentSection}>
                I Understand →
              </button>
            </section>
          )}

          {currentSection === 2 && (
            <section className="lesson8-card">
              <span className="lesson8-number">02</span>
              <h2>When Should I Use AI?</h2>
              <p>
                AI is useful when it can save time or make a task easier
                without taking away your learning or judgment.
              </p>

              <div className="lesson8-example-list">
                <div><span>📚</span><div><strong>Learning</strong><small>Ask for a simple explanation, examples, or practice questions.</small></div></div>
                <div><span>💡</span><div><strong>Ideas</strong><small>Brainstorm topics, names, questions, or possible approaches.</small></div></div>
                <div><span>✍️</span><div><strong>Creating</strong><small>Improve a draft, organise ideas, or explore different versions.</small></div></div>
                <div><span>🧩</span><div><strong>Problem-solving</strong><small>Break a large problem into smaller steps.</small></div></div>
              </div>

              <div className="lesson8-tip">
                <strong>Shortcut:</strong> Ask yourself: “Will AI help me understand,
                create, organise, or explore this task?”
              </div>

              <button className="lesson8-primary-btn" onClick={completeCurrentSection}>
                Continue →
              </button>
            </section>
          )}

          {currentSection === 3 && (
            <section className="lesson8-card">
              <span className="lesson8-number">03</span>
              <h2>When Should I Not Use AI?</h2>
              <p>
                Sometimes using AI can weaken your learning or create unnecessary
                risk. Knowing when to stop is part of being AI-independent.
              </p>

              <div className="lesson8-warning-grid">
                <div><span>🧠</span><strong>When you need to learn it yourself</strong><small>Do not replace practice with copying.</small></div>
                <div><span>🔐</span><strong>When information is highly private</strong><small>Do not share sensitive information unnecessarily.</small></div>
                <div><span>⚖️</span><strong>When responsibility matters</strong><small>Do not let AI make important decisions for you.</small></div>
                <div><span>📜</span><strong>When rules say you cannot</strong><small>Follow school, exam, workplace, or platform rules.</small></div>
              </div>

              <div className="lesson8-rule">
                <strong>Remember:</strong> If using AI removes the thinking you are
                supposed to learn, use less AI — not more.
              </div>

              <button className="lesson8-primary-btn" onClick={completeCurrentSection}>
                I Got It →
              </button>
            </section>
          )}

          {currentSection === 4 && (
            <section className="lesson8-card">
              <span className="lesson8-number">04</span>
              <h2>Choose Your Approach</h2>
              <p>Not every task needs the same amount of AI.</p>

              <div className="lesson8-approach-grid">
                <div><span>1</span><strong>Do it yourself</strong><small>Best when practice, personal judgment, or rules require your own work.</small></div>
                <div><span>2</span><strong>AI as a helper</strong><small>Use AI for hints, explanations, examples, brainstorming, or feedback.</small></div>
                <div><span>3</span><strong>AI + your thinking</strong><small>Let AI help with a bigger task, then review, edit, verify, and own the result.</small></div>
              </div>

              <div className="lesson8-flow">
                <span>Goal</span><b>→</b><span>Choose AI level</span><b>→</b><span>Use AI</span><b>→</b><span>Think + Check</span>
              </div>

              <button className="lesson8-primary-btn" onClick={completeCurrentSection}>
                Choose Smartly →
              </button>
            </section>
          )}

          {currentSection === 5 && (
            <section className="lesson8-card">
              <span className="lesson8-number">05</span>
              <h2>Solve a Real Problem</h2>
              <p>
                Imagine you have a science presentation due tomorrow. Instead
                of asking AI to do everything, build a controlled process.
              </p>

              <div className="lesson8-real-problem">
                <div><span>01</span><strong>Understand</strong><small>Define what the presentation must achieve.</small></div>
                <div><span>02</span><strong>Ask</strong><small>Use AI to explain difficult concepts or suggest ideas.</small></div>
                <div><span>03</span><strong>Create</strong><small>Write your own structure and use AI to improve it.</small></div>
                <div><span>04</span><strong>Check</strong><small>Verify important facts and remove mistakes.</small></div>
                <div><span>05</span><strong>Own</strong><small>Make sure you can explain the final presentation yourself.</small></div>
              </div>

              <div className="lesson8-big-idea">
                <span>🎯</span>
                <div>
                  <strong>The goal is not “AI did it.”</strong>
                  <p>The goal is “AI helped me do it better, and I understand the result.”</p>
                </div>
              </div>

              <button className="lesson8-primary-btn" onClick={completeCurrentSection}>
                I Can Do This →
              </button>
            </section>
          )}

          {currentSection === 6 && (
            <section className="lesson8-card">
              <span className="lesson8-number">06</span>
              <h2>Build Your AI Routine</h2>
              <p>Use this simple routine whenever you work with AI.</p>

              <div className="lesson8-routine">
                <div><b>01</b><strong>Define</strong><small>What exactly am I trying to do?</small></div>
                <div><b>02</b><strong>Ask</strong><small>What should I tell AI so it can help?</small></div>
                <div><b>03</b><strong>Review</strong><small>Does the response make sense?</small></div>
                <div><b>04</b><strong>Verify</strong><small>Do important facts need checking?</small></div>
                <div><b>05</b><strong>Decide</strong><small>What will I actually use?</small></div>
              </div>

              <div className="lesson8-checklist">
                <strong>Before you finish, ask:</strong>
                <label>☐ Do I understand the result?</label>
                <label>☐ Did I check important information?</label>
                <label>☐ Did I protect private information?</label>
                <label>☐ Am I following the rules?</label>
              </div>

              <button className="lesson8-primary-btn" onClick={completeCurrentSection}>
                My Routine Is Ready →
              </button>
            </section>
          )}

          {currentSection === 7 && (
            <section className="lesson8-card">
              <span className="lesson8-number">07</span>
              <h2>Practice Lab</h2>
              <p>Choose the smartest approach for each situation.</p>

              <div className="lesson8-lab">
                <div>
                  <strong>📖 You are learning a difficult maths concept.</strong>
                  <p>Best approach: ask AI for a simple explanation, examples, and hints — then solve problems yourself.</p>
                </div>
                <div>
                  <strong>📝 You have written an essay draft.</strong>
                  <p>Best approach: ask AI for feedback on clarity and structure, then decide which changes to make.</p>
                </div>
                <div>
                  <strong>🔒 You have highly private information.</strong>
                  <p>Best approach: avoid sharing unnecessary sensitive information with an AI system.</p>
                </div>
              </div>

              <div className="lesson8-motto">
                <span>🧠</span>
                <strong>Use AI to increase your capability — not to replace it.</strong>
              </div>

              <button className="lesson8-primary-btn" onClick={completeCurrentSection}>
                Start Final Challenge →
              </button>
            </section>
          )}

          {currentSection === 8 && (
            <section className="lesson8-card lesson8-final">
              <span className="lesson8-number">08</span>
              <h2>Final Challenge</h2>
              <p>
                Answer all 5 questions correctly to complete Lesson 8.
              </p>

              <div className="lesson8-score">
                Score: <strong>{finalScore}/5</strong>
              </div>

              {finalQuestions.map((item, index) => {
                const selected = selectedAnswers[index];
                const checked = checkedQuestions[index];
                const correct = selected === item.answer;

                return (
                  <div className="lesson8-question" key={item.question}>
                    <h3>{index + 1}. {item.question}</h3>

                    <div className="lesson8-options">
                      {item.options.map((option, optionIndex) => (
                        <button
                          key={option}
                          disabled={checked}
                          className={`lesson8-option ${
                            selected === optionIndex ? "selected" : ""
                          } ${
                            checked && optionIndex === item.answer ? "correct" : ""
                          } ${
                            checked &&
                            selected === optionIndex &&
                            selected !== item.answer
                              ? "wrong"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedAnswers((prev) => {
                              const next = [...prev];
                              next[index] = optionIndex;
                              return next;
                            });
                          }}
                        >
                          <span>{String.fromCharCode(65 + optionIndex)}</span>
                          {option}
                        </button>
                      ))}
                    </div>

                    {!checked && selected !== -1 && (
                      <button
                        className="lesson8-check-btn"
                        onClick={() => checkAnswer(index)}
                      >
                        Check Answer
                      </button>
                    )}

                    {checked && (
                      <div className={`lesson8-feedback ${correct ? "feedback-correct" : "feedback-wrong"}`}>
                        <strong>{correct ? "✓ Correct!" : "✕ Not quite"}</strong>
                        <p>{item.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                className="lesson8-primary-btn lesson8-finish-btn"
                disabled={finalScore !== 5 || checkedQuestions.some((q) => !q)}
                onClick={finishLesson}
              >
                Complete Lesson 8 🎉
              </button>
            </section>
          )}
        </main>
      </div>

      <footer className="lesson8-navigation">
        <button
          className="lesson8-secondary-btn"
          disabled={currentSection === 1}
          onClick={() => setCurrentSection((prev) => Math.max(1, prev - 1))}
        >
          ← Previous
        </button>

        <span>Section {currentSection} of 8</span>

        {currentSection > 1 && currentSection < 8 && (
          <button className="lesson8-secondary-btn" onClick={completeCurrentSection}>
            Continue →
          </button>
        )}
      </footer>
    </div>
  );
}

export default Lesson8;