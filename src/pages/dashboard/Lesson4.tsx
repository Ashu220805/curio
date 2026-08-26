import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Lesson4.css";

type SectionId =
  | "why"
  | "trust"
  | "warning"
  | "fact"
  | "verify"
  | "sources"
  | "real"
  | "challenge";

type PracticeQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const sections: {
  id: SectionId;
  number: string;
  icon: string;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "why",
    number: "01",
    icon: "🧠",
    title: "Why Can AI Be Wrong?",
    subtitle: "Understand hallucinations and why confidence is not proof.",
  },
  {
    id: "trust",
    number: "02",
    icon: "🔎",
    title: "What Makes an Answer Trustworthy?",
    subtitle: "Learn the four questions behind a reliable answer.",
  },
  {
    id: "warning",
    number: "03",
    icon: "🚩",
    title: "Spot the Warning Signs",
    subtitle: "Recognise clues that an answer needs checking.",
  },
  {
    id: "fact",
    number: "04",
    icon: "⚖️",
    title: "Fact, Opinion or Reasoning?",
    subtitle: "Separate checkable claims from judgments and conclusions.",
  },
  {
    id: "verify",
    number: "05",
    icon: "🛑",
    title: "How Do I Verify an Answer?",
    subtitle: "Use STOP → BREAK → CHECK → COMPARE → DECIDE.",
  },
  {
    id: "sources",
    number: "06",
    icon: "📚",
    title: "Sources & Evidence",
    subtitle: "Choose the right source and understand evidence.",
  },
  {
    id: "real",
    number: "07",
    icon: "🌎",
    title: "Verification in Real Life",
    subtitle: "Apply verification to study, exams, technology and high-risk topics.",
  },
  {
    id: "challenge",
    number: "08",
    icon: "🎯",
    title: "Verification Challenge",
    subtitle: "Put your verification skills to the test.",
  },
];

const practiceQuestions: PracticeQuestion[] = [
  {
    question: "AI tells you: “Your exam application deadline is tomorrow.” What should you do?",
    options: [
      "Trust AI because it sounds confident.",
      "Ask AI to repeat the answer.",
      "Check the official exam notification or authority.",
      "Forward the message to your friends.",
    ],
    answer: 2,
    explanation:
      "Important deadlines should be checked against the current official source. AI can help you find information, but the official source should confirm it.",
  },
  {
    question: "“Python is the best programming language.” What kind of statement is this?",
    options: ["Fact", "Opinion", "Official announcement", "Mathematical proof"],
    answer: 1,
    explanation:
      "“Best” depends on the person's goal and judgment. It is an opinion, not a simple universally checkable fact.",
  },
  {
    question: "Two reliable sources give different dates for the same event. What should you do?",
    options: [
      "Pick the first date you saw.",
      "Pick the AI answer.",
      "Investigate which source is authoritative and current.",
      "Average the two dates.",
    ],
    answer: 2,
    explanation:
      "Disagreement is a signal to investigate. Check which source is authoritative, current and closest to the original information.",
  },
  {
    question: "AI gives you a medical recommendation. What is the safest approach?",
    options: [
      "Follow it immediately.",
      "Ask AI to say it again.",
      "Treat the answer as professional medical advice.",
      "Use reliable medical information and seek appropriate professional guidance.",
    ],
    answer: 3,
    explanation:
      "High-risk information needs stronger verification and appropriate professional guidance. AI should not be treated as a replacement for qualified care.",
  },
  {
    question:
      "AI gives a very confident answer but provides no evidence. What does its confidence prove?",
    options: [
      "The answer is correct.",
      "The AI is certain, so it must be true.",
      "Nothing by itself about whether the claim is true.",
      "The answer is probably correct.",
    ],
    answer: 2,
    explanation:
      "Confidence is not evidence. A reliable answer needs appropriate evidence or confirmation, especially when the information matters.",
  },
];

function getStoredCompletedLessons(): number[] {
  try {
    const raw = localStorage.getItem("curio_completed_lessons");
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return [...new Set(
      parsed
        .map(Number)
        .filter((id) => Number.isInteger(id) && id >= 1 && id <= 8)
    )];
  } catch {
    return [];
  }
}

function saveCompletedLessons(lessons: number[]) {
  localStorage.setItem(
    "curio_completed_lessons",
    JSON.stringify([...new Set(lessons)])
  );
}

const SectionButton = ({
  active,
  completed,
  unlocked,
  section,
  onClick,
}: {
  active: boolean;
  completed: boolean;
  unlocked: boolean;
  section: (typeof sections)[number];
  onClick: () => void;
}) => (
  <button
    type="button"
    disabled={!unlocked}
    className={`lesson4-nav-item ${active ? "active" : ""} ${
      completed ? "completed" : ""
    } ${!unlocked ? "locked" : ""}`}
    onClick={onClick}
    aria-current={active ? "step" : undefined}
    aria-disabled={!unlocked}
  >
    <span>{section.number}</span>
    <strong>{section.title}</strong>
    <small>{completed ? "✓" : unlocked ? "" : "🔒"}</small>
  </button>
);

export default function Lesson4() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<SectionId>("why");
  const [completedSections, setCompletedSections] = useState<SectionId[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [checkedAnswers, setCheckedAnswers] = useState<number[]>([]);
  const [completedLesson, setCompletedLesson] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const sectionIndex = sections.findIndex((item) => item.id === activeSection);
  const progressCount = completedSections.length;
  const progressPercent = Math.round(
    (progressCount / sections.length) * 100
  );

  const furthestUnlockedIndex = useMemo(() => {
    let index = 0;

    for (let i = 0; i < sections.length - 1; i += 1) {
      if (completedSections.includes(sections[i].id)) {
        index = i + 1;
      } else {
        break;
      }
    }

    return index;
  }, [completedSections]);

  const practiceScore = useMemo(
    () =>
      practiceQuestions.reduce(
        (score, question, index) =>
          score + (selectedAnswers[index] === question.answer ? 1 : 0),
        0
      ),
    [selectedAnswers]
  );

  useEffect(() => {
    const stored = getStoredCompletedLessons();
    setCompletedLesson(stored.includes(4));
  }, []);

  const markSectionComplete = (id: SectionId) => {
    setCompletedSections((current) =>
      current.includes(id) ? current : [...current, id]
    );
  };

  const canOpenSection = (index: number) =>
    index <= furthestUnlockedIndex ||
    completedSections.includes(sections[index].id);

  const goToSection = (id: SectionId, index: number) => {
    if (!canOpenSection(index)) return;

    setActiveSection(id);
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextSection = () => {
    if (sectionIndex < 0 || sectionIndex >= sections.length - 1) return;

    markSectionComplete(sections[sectionIndex].id);
    setActiveSection(sections[sectionIndex + 1].id);
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrevious = () => {
    if (sectionIndex <= 0) return;

    setActiveSection(sections[sectionIndex - 1].id);
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  };

  const finishLesson = () => {
    const completed = getStoredCompletedLessons();
    const updated = [...new Set([...completed, 4])];

    saveCompletedLessons(updated);
    setCompletedSections(sections.map((section) => section.id));
    setCompletedLesson(true);

    globalThis.dispatchEvent(
      new CustomEvent("curio:lesson-completed", {
        detail: { lessonId: 4, completedLessons: updated },
      })
    );

    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseAnswer = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers((current) => ({
      ...current,
      [questionIndex]: optionIndex,
    }));
    setCheckedAnswers((current) => current.filter((i) => i !== questionIndex));
  };

  const checkAnswer = (questionIndex: number) => {
    if (selectedAnswers[questionIndex] === undefined) return;

    setCheckedAnswers((current) =>
      current.includes(questionIndex)
        ? current
        : [...current, questionIndex]
    );
  };

  const renderSection = () => {
    switch (activeSection) {
      case "why":
        return (
          <>
            <span className="lesson4-step-label">01 · THE FIRST RULE</span>
            <h2>AI can sound confident and still be wrong.</h2>
            <p className="lesson4-lead">
              AI is useful, but it can sometimes generate information that is
              incorrect, unsupported, outdated or made up. Your job is not to
              distrust AI. Your job is to know when an answer needs checking.
            </p>

            <div className="lesson4-big-idea">
              <span>💡</span>
              <div>
                <strong>Remember this:</strong>
                <p>Confidence is not evidence.</p>
              </div>
            </div>

            <div className="lesson4-example-grid">
              <article>
                <span>🤖 AI ANSWER</span>
                <h4>
                  “The Taj Mahal was built in 1653 by Akbar.”
                </h4>
                <p>
                  It sounds specific and confident. But sounding believable
                  does not make it true.
                </p>
              </article>
              <article>
                <span>🔍 YOUR JOB</span>
                <h4>“How can I check this claim?”</h4>
                <p>
                  Look for reliable evidence and compare it with an
                  authoritative source.
                </p>
              </article>
            </div>

            <div className="lesson4-term-card">
              <strong>New word: Hallucination</strong>
              <p>
                An AI hallucination is information generated by AI that may
                sound believable but is incorrect, unsupported or invented.
              </p>
            </div>

            <div className="lesson4-mini-rule">
              <b>AI suggests → You inspect → Evidence helps you decide.</b>
            </div>
          </>
        );

      case "trust":
        return (
          <>
            <span className="lesson4-step-label">02 · TRUST QUESTIONS</span>
            <h2>Ask four simple questions.</h2>
            <p className="lesson4-lead">
              When an answer matters, pause and ask these four questions before
              relying on it.
            </p>

            <div className="lesson4-four-grid">
              <article>
                <span>01</span>
                <strong>WHO?</strong>
                <p>Who says this? Is there a trustworthy source?</p>
              </article>
              <article>
                <span>02</span>
                <strong>WHAT?</strong>
                <p>What exact claim is being made?</p>
              </article>
              <article>
                <span>03</span>
                <strong>WHERE?</strong>
                <p>Where can I check the claim or find evidence?</p>
              </article>
              <article>
                <span>04</span>
                <strong>WHEN?</strong>
                <p>Could this information have changed?</p>
              </article>
            </div>

            <div className="lesson4-scenario">
              <span>📅</span>
              <div>
                <small>EXAMPLE</small>
                <h4>
                  “The exam application closes on September 15.”
                </h4>
                <p>
                  The key question is <b>WHEN?</b> A deadline can change, so
                  check the current official notification.
                </p>
              </div>
            </div>
          </>
        );

      case "warning":
        return (
          <>
            <span className="lesson4-step-label">03 · WARNING SIGNS</span>
            <h2>Learn to notice the red flags.</h2>
            <p className="lesson4-lead">
              A warning sign does not automatically mean an answer is wrong.
              It means: <b>slow down and check.</b>
            </p>

            <div className="lesson4-warning-grid">
              {[
                ["🚩", "Very confident language", "“This is definitely true.”"],
                ["🔗", "No useful source", "“Research proves...” — but which research?"],
                ["📎", "Unclear citation", "A reference does not clearly support the claim."],
                ["🎯", "Very specific claim", "Exact dates, numbers or names deserve checking."],
                ["⏰", "Current information", "Prices, laws, dates and features can change."],
                ["🤔", "Doesn't make sense", "Your own reasoning tells you to investigate."],
              ].map(([icon, title, text]) => (
                <article key={title}>
                  <span>{icon}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="lesson4-callout">
              <strong>🚨 Red flag rule</strong>
              <p>
                The more important, specific or time-sensitive a claim is, the
                more carefully you should verify it.
              </p>
            </div>
          </>
        );

      case "fact":
        return (
          <>
            <span className="lesson4-step-label">04 · THINK CLEARLY</span>
            <h2>Fact, opinion or reasoning?</h2>
            <p className="lesson4-lead">
              Before checking an answer, identify what kind of statement you
              are looking at.
            </p>

            <div className="lesson4-three-grid">
              <article className="fact-card">
                <span>🟢</span>
                <strong>FACT</strong>
                <p>Something that can potentially be checked with evidence.</p>
                <code>“Water freezes at about 0°C at standard pressure.”</code>
              </article>
              <article className="fact-card">
                <span>🟡</span>
                <strong>OPINION</strong>
                <p>A judgment, preference or personal view.</p>
                <code>“Python is the best programming language.”</code>
              </article>
              <article className="fact-card">
                <span>🔵</span>
                <strong>REASONING</strong>
                <p>A conclusion reached from information or observations.</p>
                <code>“The road is wet, so it probably rained.”</code>
              </article>
            </div>

            <div className="lesson4-thinking-box">
              <strong>Why does this matter?</strong>
              <p>
                A fact needs evidence. An opinion may need reasons and context.
                A piece of reasoning should be checked for whether the
                conclusion actually follows from the evidence.
              </p>
            </div>
          </>
        );

      case "verify":
        return (
          <>
            <span className="lesson4-step-label">05 · THE VERIFICATION LOOP</span>
            <h2>STOP → BREAK → CHECK → COMPARE → DECIDE</h2>
            <p className="lesson4-lead">
              This is the main skill of Lesson 4. Use it whenever an AI answer
              matters enough to verify.
            </p>

            <div className="lesson4-loop">
              {[
                ["🛑", "STOP", "Don't immediately believe or share the answer."],
                ["🧩", "BREAK", "Separate the answer into individual claims."],
                ["🔎", "CHECK", "Find evidence for the important claim."],
                ["🔄", "COMPARE", "Compare reliable sources when needed."],
                ["✅", "DECIDE", "Mark it supported, unclear or incorrect."],
              ].map(([icon, title, text], index) => (
                <article key={title}>
                  <span>{icon}</span>
                  <b>{index + 1}</b>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </article>
              ))}
            </div>

            <div className="lesson4-breakdown">
              <small>EXAMPLE CLAIM</small>
              <h4>
                “India launched Mission X in 2024 and it discovered Y.”
              </h4>
              <p>
                That sentence contains at least two claims. Check each important
                claim instead of treating the whole sentence as one fact.
              </p>
            </div>

            <div className="lesson4-note">
              <span>💬</span>
              <div>
                <strong>Important</strong>
                <p>
                  Asking AI “Are you sure?” can help you reconsider, but it is
                  not independent proof. Evidence verifies; confidence does
                  not.
                </p>
              </div>
            </div>
          </>
        );

      case "sources":
        return (
          <>
            <span className="lesson4-step-label">06 · SOURCES & EVIDENCE</span>
            <h2>Choose the right source for the job.</h2>
            <p className="lesson4-lead">
              Verification becomes much easier when you know where to look.
            </p>

            <div className="lesson4-source-stack">
              <article className="source-primary">
                <span>🥇</span>
                <div>
                  <strong>Primary / official sources</strong>
                  <p>
                    Government websites, official organisations, original
                    research, official documentation and official exam
                    notifications.
                  </p>
                </div>
              </article>
              <article className="source-secondary">
                <span>🥈</span>
                <div>
                  <strong>Reliable secondary sources</strong>
                  <p>
                    Established news organisations, educational institutions
                    and reputable reference sources.
                  </p>
                </div>
              </article>
              <article className="source-unverified">
                <span>🥉</span>
                <div>
                  <strong>Unverified sources</strong>
                  <p>
                    Random blogs, anonymous posts, social media claims and
                    forwarded messages. Treat them cautiously.
                  </p>
                </div>
              </article>
            </div>

            <div className="lesson4-match-grid">
              <div>
                <strong>📝 Exam date?</strong>
                <p>Check the official exam authority.</p>
              </div>
              <div>
                <strong>💻 Software feature?</strong>
                <p>Check official documentation.</p>
              </div>
              <div>
                <strong>🏛️ Government scheme?</strong>
                <p>Check the government source.</p>
              </div>
            </div>

            <div className="lesson4-note">
              <span>🔄</span>
              <div>
                <strong>Cross-checking</strong>
                <p>
                  If reliable sources agree, confidence increases. If they
                  disagree, don't guess—investigate which source is authoritative
                  and current.
                </p>
              </div>
            </div>
          </>
        );

      case "real":
        return (
          <>
            <span className="lesson4-step-label">07 · REAL LIFE</span>
            <h2>Verification depends on risk.</h2>
            <p className="lesson4-lead">
              Not every AI answer needs the same amount of checking. The higher
              the risk, the stronger the verification should be.
            </p>

            <div className="lesson4-risk-grid">
              <article className="risk-low">
                <span>🟢</span>
                <strong>LOW RISK</strong>
                <p>You can experiment.</p>
                <ul>
                  <li>Brainstorming names</li>
                  <li>Creative writing</li>
                  <li>Ideas</li>
                  <li>Casual explanations</li>
                </ul>
              </article>
              <article className="risk-medium">
                <span>🟡</span>
                <strong>MEDIUM RISK</strong>
                <p>Verify before relying on it.</p>
                <ul>
                  <li>Homework facts</li>
                  <li>Technical instructions</li>
                  <li>Historical claims</li>
                  <li>Study notes</li>
                </ul>
              </article>
              <article className="risk-high">
                <span>🔴</span>
                <strong>HIGH RISK</strong>
                <p>Do not rely on AI alone.</p>
                <ul>
                  <li>Medical decisions</li>
                  <li>Legal decisions</li>
                  <li>Financial decisions</li>
                  <li>Safety instructions</li>
                  <li>Important official information</li>
                </ul>
              </article>
            </div>

            <div className="lesson4-life-grid">
              <article>
                <span>📚</span>
                <strong>Studying</strong>
                <p>
                  Check important facts against textbooks, notes or reliable
                  educational sources.
                </p>
              </article>
              <article>
                <span>📝</span>
                <strong>Exams</strong>
                <p>
                  Check dates, eligibility and rules against the official
                  notification.
                </p>
              </article>
              <article>
                <span>💻</span>
                <strong>Technology</strong>
                <p>
                  Check current commands and features against official
                  documentation.
                </p>
              </article>
              <article>
                <span>🛡️</span>
                <strong>High-risk topics</strong>
                <p>
                  Use authoritative information and appropriate professional
                  guidance.
                </p>
              </article>
            </div>
          </>
        );

      case "challenge":
        return (
          <>
            <span className="lesson4-step-label">08 · FINAL CHALLENGE</span>
            <h2>Can you verify before you trust?</h2>
            <p className="lesson4-lead">
              Choose an answer, check it, and read the explanation. You don't
              need a perfect score to learn—the explanation is part of the
              lesson.
            </p>

            <div className="lesson4-practice-list">
              {practiceQuestions.map((question, questionIndex) => {
                const selected = selectedAnswers[questionIndex];
                const checked = checkedAnswers.includes(questionIndex);
                const isCorrect = selected === question.answer;

                return (
                  <article className="lesson4-practice-item" key={question.question}>
                    <div className="lesson4-practice-number">
                      {questionIndex + 1}
                    </div>
                    <div>
                      <h4>{question.question}</h4>

                      <div className="lesson4-choice-list">
                        {question.options.map((option, optionIndex) => (
                          <button
                            type="button"
                            key={option}
                            className={`lesson4-choice ${
                              selected === optionIndex ? "selected" : ""
                            } ${
                              checked && optionIndex === question.answer
                                ? "correct"
                                : ""
                            } ${
                              checked &&
                              selected === optionIndex &&
                              !isCorrect
                                ? "wrong"
                                : ""
                            }`}
                            onClick={() =>
                              chooseAnswer(questionIndex, optionIndex)
                            }
                          >
                            <span>
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            {option}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="lesson4-check-button"
                        disabled={selected === undefined}
                        onClick={() => checkAnswer(questionIndex)}
                      >
                        {checked ? "Checked ✓" : "Check answer"}
                      </button>

                      {checked && (
                        <div
                          className={`lesson4-feedback ${
                            isCorrect ? "correct" : "wrong"
                          }`}
                        >
                          <strong>
                            {isCorrect ? "Correct ✓" : "Not quite — learn from it"}
                          </strong>
                          <p>{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="lesson4-score-card">
              <div>
                <strong>Your score</strong>
                <span>
                  {practiceScore} / {practiceQuestions.length}
                </span>
              </div>
              <div className="lesson4-mini-track">
                <div
                  style={{
                    width: `${(practiceScore / practiceQuestions.length) * 100}%`,
                  }}
                />
              </div>
              <p>
                Focus on understanding the verification process, not just the
                score.
              </p>
            </div>

            <div className="lesson4-cheatsheet">
              <button
                type="button"
                onClick={() => setShowCheatSheet((value) => !value)}
              >
                {showCheatSheet ? "Hide" : "Show"} my Verification Checklist
              </button>

              {showCheatSheet && (
                <div className="lesson4-checklist">
                  <h4>Before trusting an AI answer:</h4>
                  {[
                    "What exactly is the claim?",
                    "Could this information have changed?",
                    "Does the answer give evidence?",
                    "Can I find a reliable source?",
                    "Do independent sources agree?",
                    "Does the answer make logical sense?",
                    "How important or risky is this information?",
                  ].map((item) => (
                    <label key={item}>
                      <input type="checkbox" />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="lesson4-final-rule">
              <span>🧠</span>
              <div>
                <strong>CURIO Verification Rule</strong>
                <p>
                  <b>STOP → CHECK → COMPARE → DECIDE.</b> AI can help you find
                  information. Evidence helps you decide whether to trust it.
                </p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="lesson4-page">
      <header className="lesson4-header">
        <button
          type="button"
          className="lesson4-back-button"
          onClick={() => navigate("/learn")}
          aria-label="Back to Learn"
        >
          ←
        </button>

        <div className="lesson4-heading">
          <span>LESSON 04</span>
          <h1>Verifying AI Answers</h1>
        </div>

        <div className="lesson4-header-progress">
          <span>
            {progressCount} / {sections.length}
          </span>
          <div className="lesson4-progress-track">
            <div
              className="lesson4-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <div className="lesson4-layout">
        <aside className="lesson4-navigation">
          <div className="lesson4-nav-title">LESSON JOURNEY</div>

          {sections.map((section, index) => (
            <SectionButton
              key={section.id}
              section={section}
              active={activeSection === section.id}
              completed={completedSections.includes(section.id)}
              unlocked={canOpenSection(index)}
              onClick={() => goToSection(section.id, index)}
            />
          ))}

          <div className="lesson4-side-rule">
            <span>🔍</span>
            <strong>Think before you trust.</strong>
            <p>
              The goal isn't to distrust AI. It's to know when and how to
              verify.
            </p>
          </div>
        </aside>

        <main className="lesson4-content">
          <section className="lesson4-intro">
            <span className="lesson4-kicker">CURIO · AI LITERACY</span>
            <h2>Don't just get an answer. Learn how to check it.</h2>
            <p>
              AI can be fast and useful, but a believable answer is not
              automatically a correct answer. This lesson gives you a simple
              system for checking facts, sources and important decisions.
            </p>
            <div className="lesson4-principle">
              <span>🛑</span>
              <div>
                <strong>Core idea</strong>
                <p>
                  <b>AI suggests → You inspect → Evidence helps you decide.</b>
                </p>
              </div>
            </div>
          </section>

          <section className="lesson4-card">
            {renderSection()}

            <div className="lesson4-footer">
              <button
                type="button"
                className="lesson4-secondary-button"
                onClick={goPrevious}
                disabled={sectionIndex === 0}
              >
                ← Previous
              </button>

              {activeSection === "challenge" ? (
                <button
                  type="button"
                  className="lesson4-primary-button"
                  onClick={finishLesson}
                >
                  {completedLesson ? "Lesson 4 Completed ✓" : "Complete Lesson 4 →"}
                </button>
              ) : (
                <button
                  type="button"
                  className="lesson4-primary-button"
                  onClick={nextSection}
                >
                  Continue →
                </button>
              )}
            </div>

            {completedLesson && activeSection === "challenge" && (
              <div className="lesson4-complete-card">
                <span>🎉</span>
                <div>
                  <strong>Great work!</strong>
                  <p>
                    You completed Lesson 4. You now have a practical system for
                    checking AI answers before relying on them.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/learn/lesson/5")}
                  >
                    Start Lesson 5 — AI Safety →
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}