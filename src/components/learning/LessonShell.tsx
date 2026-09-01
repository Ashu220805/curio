import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getLesson } from "../../data/lessons.ts";
import { useLessonProgress } from "../../hooks/useLessonProgress.ts";
import "./LessonShell.css";

interface LessonShellProps {
  lessonId: number;
}

function LessonShell({ lessonId }: LessonShellProps) {
  const navigate = useNavigate();
  const lesson = getLesson(lessonId);
  const totalSections = lesson?.sections.length ?? 0;
  const [sectionIndex, setSectionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [savingNotice, setSavingNotice] = useState("");

  const {
    loading,
    saving,
    error,
    accessible,
    currentSection,
    completedSections,
    completed,
    progressPercentage,
    updateProgress,
    markComplete,
  } = useLessonProgress(lessonId, totalSections);

  useEffect(() => {
    if (loading || !lesson) return;
    if (!accessible) {
      navigate("/learn", { replace: true });
      return;
    }

    if (completed) {
      setSectionIndex(Math.max(0, totalSections - 1));
      return;
    }

    const nextIndex = Math.min(
      Math.max(currentSection, 0),
      Math.max(totalSections - 1, 0),
    );
    setSectionIndex(nextIndex);
  }, [loading, accessible, completed, currentSection, totalSections, lesson, navigate]);

  useEffect(() => {
    setSelectedOption(null);
    setChecked(false);
    setSavingNotice("");
  }, [sectionIndex]);

  const isLast = sectionIndex === totalSections - 1;
  const progressLabel = useMemo(() => {
    const safe = Math.max(0, Math.min(progressPercentage, 100));
    return `${safe}%`;
  }, [progressPercentage]);

  if (!lesson) {
    return (
      <main className="lesson-shell-error">
        <h1>Lesson unavailable</h1>
        <p>The requested lesson could not be found.</p>
        <Link to="/learn">Return to Learn AI</Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="lesson-shell-loading">
        <div className="lesson-loading-line" />
        <p>Loading your lesson progress…</p>
      </main>
    );
  }

  if (!accessible) return null;

  // A lesson must always contain a valid section before the UI can
  // reference section-specific fields. Keeping this guard here also
  // makes the component safe if lesson data is temporarily incomplete.
  const section = lesson.sections[sectionIndex];

  if (!section) {
    return (
      <main className="lesson-shell-error">
        <h1>Lesson content unavailable</h1>
        <p>This lesson does not contain the requested section.</p>
        <Link to="/learn">Return to Learn AI</Link>
      </main>
    );
  }

  const handleCheck = () => {
    if (selectedOption === null) return;
    setChecked(true);
  };

  const handleNext = async () => {
    const nextCompleted = Math.min(
      totalSections,
      Math.max(completedSections, sectionIndex + 1),
    );

    const ok = await updateProgress(sectionIndex + 1, nextCompleted);
    if (!ok) return;

    if (isLast) {
      const finalAnswerCorrect = selectedOption === section.answer;
      if (!finalAnswerCorrect) {
        setChecked(true);
        setSavingNotice("Choose the strongest answer before completing the lesson.");
        return;
      }

      const finished = await markComplete();
      if (!finished) return;
      setSavingNotice("Lesson complete. Your progress has been saved.");
      return;
    }

    setSavingNotice("");
    setSectionIndex((index) => index + 1);
  };

  const handlePrevious = () => {
    setSectionIndex((index) => Math.max(0, index - 1));
  };

  const kindLabel = {
    concept: "Learn",
    decision: "Decide",
    practice: "Apply",
    challenge: "Challenge",
  }[section.kind];

  return (
    <div className="lesson-shell">
      <header className="lesson-topbar">
        <div className="lesson-topbar-inner">
          <Link className="lesson-brand" to="/learn" aria-label="Back to Learn AI">
            <span className="lesson-brand-mark">
              <img src="/curio-symbol.png" alt="" aria-hidden="true" />
            </span>
            <span>
              <strong>CURIO</strong>
              <small>AI learning path</small>
            </span>
          </Link>
          <div className="lesson-topbar-progress">
            <span>Lesson {lesson.id} · {progressLabel}</span>
            <div className="lesson-topbar-track">
              <span style={{ width: progressLabel }} />
            </div>
          </div>
        </div>
      </header>

      <main className="lesson-layout">
        <aside className="lesson-sidebar">
          <div className="lesson-sidebar-heading">
            <span>LESSON {String(lesson.id).padStart(2, "0")}</span>
            <h1>{lesson.title}</h1>
            <p>{lesson.subtitle}</p>
          </div>

          <nav className="lesson-section-nav" aria-label="Lesson sections">
            {lesson.sections.map((item, index) => {
              const done = index < completedSections || (completed && index === totalSections - 1);
              const active = index === sectionIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`lesson-nav-item ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}
                  onClick={() => {
                    if (index <= completedSections || index === sectionIndex) setSectionIndex(index);
                  }}
                  disabled={index > completedSections && index !== sectionIndex}
                >
                  <span className="lesson-nav-number">{done ? "✓" : String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{index === sectionIndex ? "Current section" : done ? "Completed" : "Up next"}</small>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="lesson-sidebar-footer">
            <Link to="/learn">All lessons</Link>
            <span>{completedSections} / {totalSections} complete</span>
          </div>
        </aside>

        <section className="lesson-content">
          <div className="lesson-content-head">
            <div>
              <span className="lesson-kicker">SECTION {String(section.id).padStart(2, "0")} · {kindLabel.toUpperCase()}</span>
              <h2>{section.title}</h2>
              <p className="lesson-summary">{section.summary}</p>
            </div>
            <span className="lesson-time">{lesson.estimatedMinutes} min lesson</span>
          </div>

          <article className="lesson-reading-card">
            <h3>Core idea</h3>
            <p>{section.explanation}</p>

            <div className="lesson-example">
              <span>Example</span>
              <p>{section.example}</p>
            </div>

            <div className="lesson-action-card">
              <span>Your move</span>
              <p>{section.action}</p>
            </div>
          </article>

          <article className="lesson-check-card">
            <div className="lesson-check-heading">
              <div>
                <span>QUICK CHECK</span>
                <h3>{section.checkQuestion}</h3>
              </div>
              <span className="lesson-check-count">{selectedOption === null ? "Not answered" : checked ? "Checked" : "Selected"}</span>
            </div>

            <div className="lesson-options">
              {section.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = checked && index === section.answer;
                const isWrong = checked && isSelected && index !== section.answer;
                return (
                  <button
                    type="button"
                    key={option}
                    className={`lesson-option ${isSelected ? "is-selected" : ""} ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`}
                    onClick={() => {
                      setSelectedOption(index);
                      setChecked(false);
                      setSavingNotice("");
                    }}
                  >
                    <span className="lesson-option-key">{String.fromCharCode(65 + index)}</span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            {selectedOption !== null && (
              <div className={`lesson-feedback ${checked ? (selectedOption === section.answer ? "is-positive" : "is-negative") : ""}`}>
                {!checked ? "Check your choice to see why it works." : selectedOption === section.answer ? `Correct. ${section.answerExplanation}` : `Not quite. ${section.answerExplanation}`}
              </div>
            )}

            <div className="lesson-check-actions">
              <button type="button" className="lesson-secondary-button" onClick={handleCheck} disabled={selectedOption === null}>
                Check answer
              </button>
            </div>
          </article>

          {(error || savingNotice) && (
            <div className={`lesson-save-message ${error ? "is-error" : ""}`} role="status">
              {error ?? savingNotice}
            </div>
          )}

          <div className="lesson-footer-actions">
            <button type="button" className="lesson-secondary-button" onClick={handlePrevious} disabled={sectionIndex === 0}>
              Previous
            </button>
            <div className="lesson-footer-status">
              <span>Section {sectionIndex + 1} of {totalSections}</span>
              <span>{saving ? "Saving…" : "Progress saves automatically"}</span>
            </div>
            <button type="button" className="lesson-primary-button" onClick={handleNext} disabled={saving || (isLast && selectedOption !== section.answer)}>
              {isLast ? (completed ? "Completed" : "Complete lesson") : "Continue"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LessonShell;
