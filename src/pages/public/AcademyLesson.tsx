import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { academyLessons, academyModules } from "../../data/academy.ts";
import { getMentorLesson } from "../../data/academyMentor.ts";
import { useAcademyAccess } from "../../hooks/useAcademyAccess.ts";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.ts";
import {
  academyCompletedCount,
  canOpenAcademyLesson,
  getLessonProgress,
  readAcademyLearningProgress,
  saveAcademyLearningProgress,
  updateLessonProgress,
  type AcademyLearningProgress,
} from "../../lib/academyLearningProgress.ts";
import "./AcademyLesson.css";

const FREE_PREVIEW_LESSONS = 3;

export default function AcademyLesson() {
  const params = useParams<{ order: string }>();
  const navigate = useNavigate();
  const order = Number(params.order);

  const lesson = academyLessons.find((item) => item.order === order);
  const module = useMemo(
    () => (lesson ? academyModules.find((item) => item.lessons.some((candidate) => candidate.id === lesson.id)) : undefined),
    [lesson]
  );

  const mentor = useMemo(() => (lesson ? getMentorLesson(lesson) : null), [lesson]);

  useDocumentMeta(
    lesson ? `${lesson.title} | CURIO AI / ML Academy` : "CURIO Academy Lesson",
    lesson?.summary ?? "Learn AI and machine learning through single-page continuous Socratic lessons."
  );

  const { hasAcademyAccess, isLoading } = useAcademyAccess();
  const [learningProgress, setLearningProgress] = useState<AcademyLearningProgress>(readAcademyLearningProgress);

  // Single-Page Form State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showOptionAnswer, setShowOptionAnswer] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [teachBackText, setTeachBackText] = useState("");

  const progress = lesson ? getLessonProgress(learningProgress, lesson.order) : null;
  const sequentiallyUnlocked = lesson ? canOpenAcademyLesson(learningProgress, lesson.order) : false;
  const membershipUnlocked = lesson ? hasAcademyAccess || lesson.order <= FREE_PREVIEW_LESSONS : false;
  const completedCount = academyCompletedCount(learningProgress);
  const percent = Math.round((completedCount / academyLessons.length) * 100);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [order]);

  const patchProgress = (patch: Parameters<typeof updateLessonProgress>[2]) => {
    if (!lesson) return;
    setLearningProgress((current) => {
      const next = updateLessonProgress(current, lesson.order, patch);
      saveAcademyLearningProgress(next);
      return next;
    });
  };

  const chooseOption = (index: number) => {
    setSelectedOption(index);
    setShowOptionAnswer(true);
    if (mentor && index === mentor.correctIndex) {
      patchProgress({ concept: true });
    }
  };

  const copyCode = async () => {
    if (!lesson?.code?.code) return;
    try {
      await navigator.clipboard.writeText(lesson.code.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1500);
    } catch {
      setCodeCopied(false);
    }
  };

  const completeLesson = () => {
    if (!lesson) return;
    patchProgress({ concept: true, practice: true, teachBack: true, completed: true });
  };

  if (!lesson) return <Navigate to="/academy" replace />;

  const nextLesson = academyLessons.find((item) => item.order === lesson.order + 1);
  const previousLesson = academyLessons.find((item) => item.order === lesson.order - 1);

  if (!isLoading && !sequentiallyUnlocked) {
    const previous = academyLessons.find((item) => item.order === lesson.order - 1);
    return (
      <main className="academy-gate-page">
        <section>
          <span>LESSON LOCKED</span>
          <h1>Finish the previous lesson first.</h1>
          <p>CURIO uses sequential learning so each lesson has the foundational concepts needed for the next one.</p>
          {previous && (
            <button type="button" onClick={() => navigate(`/academy/lesson/${previous.order}`)}>
              Continue Lesson {previous.order}: {previous.title}
            </button>
          )}
          <Link to="/academy">View Curriculum Map</Link>
        </section>
      </main>
    );
  }

  if (!isLoading && !membershipUnlocked) {
    return (
      <main className="academy-gate-page">
        <section>
          <span>PRO MEMBERSHIP</span>
          <h1>This lesson is part of the full Academy.</h1>
          <p>
            The first {FREE_PREVIEW_LESSONS} lessons remain available as a free preview. Unlock PRO to continue the complete 45-lesson curriculum.
          </p>
          <Link className="academy-gate-primary" to="/academy/checkout">
            Unlock Full Academy PRO · ₹1
          </Link>
          <Link to="/academy">Back to Curriculum</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="single-lesson-page">
      {/* TOP HEADER */}
      <header className="single-lesson-topbar">
        <Link className="single-lesson-brand" to="/academy">
          <img src="/curio-symbol.png" alt="CURIO" />
          <span>CURIO</span>
          <small>AI / ML ACADEMY</small>
        </Link>
        <div className="single-lesson-progress">
          <span>{completedCount} / {academyLessons.length} Lessons</span>
          <i><b style={{ width: `${percent}%` }} /></i>
          <strong>{percent}%</strong>
        </div>
        <nav>
          <Link to="/academy">Curriculum</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </header>

      {/* CONTINUOUS SINGLE-PAGE LESSON ARTICLE */}
      <article className="single-lesson-article">
        {/* BREADCRUMBS & TITLE */}
        <div className="single-lesson-breadcrumbs">
          <Link to="/academy">Academy</Link> <span>›</span>
          <span>Module {module?.number}: {module?.title}</span> <span>›</span>
          <span>Lesson {lesson.order}</span>
        </div>

        <header className="single-lesson-header">
          <span className="single-level-badge">{lesson.level.toUpperCase()} · {lesson.duration}</span>
          <h1>{lesson.title}</h1>
          <p className="single-lesson-summary">{lesson.summary}</p>
        </header>

        {/* 1. OPENING PROBLEM */}
        <section className="lesson-block problem-block">
          <span className="block-tag">01 · OPENING PROBLEM</span>
          <h2>{lesson.openingProblem ?? mentor?.openingQuestion}</h2>
          <p>Before jumping into mathematical formulas or code implementation, first think about what problem needs to be solved here.</p>
        </section>

        {/* 2. CURIOSITY / WHY DO WE NEED THIS */}
        <section className="lesson-block curiosity-block">
          <span className="block-tag">02 · WHY DO WE NEED THIS?</span>
          <h2>{lesson.curiosity ?? lesson.why}</h2>
          <p>{lesson.why}</p>
        </section>

        {/* 3. CONNECT TO PRIOR KNOWLEDGE */}
        <section className="lesson-block prior-block">
          <span className="block-tag">03 · CONNECT TO PRIOR KNOWLEDGE</span>
          <h2>{lesson.priorKnowledge ?? "You already know how basic computers follow rules line by line."}</h2>
          <p>We are expanding your mental model step by step. Nothing in AI requires magic—only logical extensions of concepts you already understand.</p>
        </section>

        {/* 4. BUILD INTUITION */}
        <section className="lesson-block intuition-block">
          <span className="block-tag">04 · BUILD THE INTUITION</span>
          <h2>A Mentor Explanation</h2>
          <p className="intuition-story">{mentor?.story}</p>
          <div className="simple-explanation-box">
            <strong>In Simple Words:</strong>
            <p>{mentor?.simpleExplanation}</p>
          </div>
        </section>

        {/* 5. FORMAL CONCEPT & TERMINOLOGY */}
        <section className="lesson-block concept-block">
          <span className="block-tag">05 · FORMAL CONCEPT & TERMINOLOGY</span>
          <h2>Core Vocabulary & Definitions</h2>
          <div className="concepts-grid">
            {lesson.concepts.map((c, idx) => (
              <div key={c.term} className="concept-card">
                <span className="concept-index">{String(idx + 1).padStart(2, "0")}</span>
                <h3>{c.term}</h3>
                <p>{c.definition}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. VISUAL MODEL */}
        <section className="lesson-block visual-block">
          <span className="block-tag">06 · VISUAL MENTAL MODEL</span>
          <h2>See the Process Step-by-Step</h2>
          <div className="visual-steps-list">
            {(lesson.visualExplanation ?? lesson.mindMap).map((step, i) => (
              <div key={step} className="visual-step-card">
                <div className="step-num">{i + 1}</div>
                <div className="step-text">{step}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. MATHEMATICS & FORMULA BREAKDOWN */}
        {lesson.mathematics && (
          <section className="lesson-block math-block">
            <span className="block-tag">07 · MATHEMATICS & FORMULA</span>
            <h2>Understand what the Symbols are Saying</h2>
            <p>{lesson.mathematics.introduction}</p>
            {lesson.mathematics.formulas.map((f) => (
              <div className="formula-box" key={f.title}>
                <h3>{f.title}</h3>
                <div className="formula-math"><code>{f.expression}</code></div>
                <p>{f.explanation}</p>
                {f.symbolBreakdown && (
                  <div className="symbol-table">
                    <strong>Symbol Breakdown:</strong>
                    <ul>
                      {f.symbolBreakdown.map((s) => (
                        <li key={s.symbol}>
                          <code>{s.symbol}</code> : {s.meaning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* 8. DERIVATION */}
        {lesson.derivation && (
          <section className="lesson-block derivation-block">
            <span className="block-tag">08 · DERIVATION</span>
            <h2>Where Did This Come From?</h2>
            <p>{lesson.derivation.introduction}</p>
            <ol className="derivation-steps">
              {lesson.derivation.steps.map((s, idx) => (
                <li key={s.title}>
                  <strong>Step {idx + 1}: {s.title}</strong>
                  <code>{s.expression}</code>
                  <p>{s.explanation}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* 9. WORKED EXAMPLE */}
        {lesson.numerical && (
          <section className="lesson-block example-block">
            <span className="block-tag">09 · WORKED EXAMPLE</span>
            <h2>Solve One Step-by-Step</h2>
            <p>{lesson.numerical.introduction}</p>
            <div className="numerical-steps">
              {lesson.numerical.steps.map((n) => (
                <div className="numerical-item" key={n.step}>
                  <strong>{n.step}</strong>
                  <code>{n.calculation}</code>
                  <p>{n.explanation}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 10. ALGORITHM FLOW */}
        {lesson.algorithm && (
          <section className="lesson-block algorithm-block">
            <span className="block-tag">10 · ALGORITHM FLOW</span>
            <h2>Input → Process → Output</h2>
            <p>{lesson.algorithm.introduction}</p>
            <div className="algorithm-steps">
              {lesson.algorithm.steps.map((a) => (
                <div className="algorithm-card" key={a.step}>
                  <span className="alg-step">{a.step}</span>
                  <div>
                    <h3>{a.title}</h3>
                    <p>{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 11. CODING */}
        {lesson.code && (
          <section className="lesson-block code-block-section">
            <div className="code-block-header">
              <span className="block-tag">11 · CODING IMPLEMENTATION</span>
              <button type="button" className="copy-btn" onClick={() => void copyCode()}>
                {codeCopied ? "Copied ✓" : "Copy Code"}
              </button>
            </div>
            <h2>Implement from Scratch in {lesson.code.language.toUpperCase()}</h2>
            <pre className="single-code-pre">
              <code>{lesson.code.code}</code>
            </pre>

            {/* 12. CODE EXPLANATION */}
            <div className="code-explanation-subblock">
              <h3>12 · Line-by-Line Code Reasoning</h3>
              <ol>
                {lesson.code.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* 13. DEBUGGING LAB */}
        {lesson.debugging && lesson.debugging.length > 0 && (
          <section className="lesson-block debug-block">
            <span className="block-tag">13 · DEBUGGING LAB</span>
            <h2>Broken Code → Find the Mistake</h2>
            {lesson.debugging.map((d, idx) => (
              <div key={idx} className="debug-card">
                <h3>Symptom: {d.symptom}</h3>
                <p><strong>Possible Cause:</strong> {d.possibleCause}</p>
                <p><strong>How to Check:</strong> {d.howToCheck}</p>
                <div className="debug-fix">
                  <strong>Fix:</strong> {d.fix}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* 14. STOP AND THINK QUESTION */}
        {mentor && (
          <section className="lesson-block socratic-check-block">
            <span className="block-tag">14 · STOP AND THINK</span>
            <h2>{mentor.thinkQuestion}</h2>
            <div className="socratic-options">
              {mentor.thinkOptions.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = showOptionAnswer && idx === mentor.correctIndex;
                const isWrong = showOptionAnswer && isSelected && idx !== mentor.correctIndex;

                return (
                  <button
                    key={option}
                    type="button"
                    className={`socratic-option-btn ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`}
                    onClick={() => chooseOption(idx)}
                  >
                    <span className="opt-letter">{String.fromCharCode(65 + idx)}</span>
                    <span className="opt-text">{option}</span>
                  </button>
                );
              })}
            </div>
            {showOptionAnswer && (
              <div className={`option-feedback-box ${selectedOption === mentor.correctIndex ? "success" : "retry"}`}>
                {selectedOption === mentor.correctIndex
                  ? "✓ Correct! You identified the core distinction."
                  : "✕ Not quite. Re-read the intuition section above and try again."}
              </div>
            )}
          </section>
        )}

        {/* 15. REAL-WORLD CASE */}
        {lesson.realWorldApplications && lesson.realWorldApplications.length > 0 && (
          <section className="lesson-block realworld-block">
            <span className="block-tag">15 · REAL-WORLD APPLICATION</span>
            <h2>Where is this Actually Used?</h2>
            <div className="realworld-grid">
              {lesson.realWorldApplications.map((app) => (
                <div key={app.title} className="realworld-card">
                  <h3>{app.title}</h3>
                  <p>{app.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 16. TEACH IT BACK */}
        <section className="lesson-block teachback-block">
          <span className="block-tag">16 · TEACH IT BACK</span>
          <h2>Explain in Your Own Words</h2>
          <p>{mentor?.teachBackPrompt ?? "Explain this topic to a non-technical friend in your own words."}</p>
          <textarea
            value={teachBackText}
            onChange={(e) => setTeachBackText(e.target.value)}
            placeholder="Write your explanation here..."
            rows={5}
          />
          {teachBackText.trim().length >= 30 && (
            <span className="teachback-done-tag">✓ Self-explanation recorded!</span>
          )}
        </section>

        {/* 17. KNOWLEDGE CHECK & LESSON COMPLETION */}
        <section className="lesson-block completion-block">
          <span className="block-tag">17 · KNOWLEDGE CHECK & LESSON COMPLETE</span>
          <h2>{progress?.completed ? "Lesson Completed!" : "Complete Lesson & Unlock Next"}</h2>
          <p>Mark this lesson complete to save your progress and unlock the next lesson in sequence.</p>

          <button
            type="button"
            className="complete-lesson-btn"
            disabled={progress?.completed === true}
            onClick={completeLesson}
          >
            {progress?.completed ? "✓ Lesson Completed" : "Mark as Complete & Unlock Next →"}
          </button>
        </section>

        {/* PREV / NEXT NAVIGATION */}
        <footer className="single-lesson-footer">
          <button
            type="button"
            disabled={!previousLesson}
            onClick={() => previousLesson && navigate(`/academy/lesson/${previousLesson.order}`)}
          >
            ← Previous Lesson
          </button>

          {nextLesson ? (
            <button
              type="button"
              className="next-btn"
              disabled={!progress?.completed || (!hasAcademyAccess && nextLesson.order > FREE_PREVIEW_LESSONS)}
              onClick={() => navigate(`/academy/lesson/${nextLesson.order}`)}
            >
              {!progress?.completed
                ? "Complete this lesson first"
                : nextLesson.order > FREE_PREVIEW_LESSONS && !hasAcademyAccess
                ? "Unlock PRO to continue"
                : "Next Lesson →"}
            </button>
          ) : (
            <Link className="finish-link" to="/academy">
              Return to Curriculum
            </Link>
          )}
        </footer>
      </article>
    </main>
  );
}
