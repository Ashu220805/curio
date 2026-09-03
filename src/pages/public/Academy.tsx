import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { academyLessons, academyModules } from "../../data/academy.ts";
import { useAcademyAccess } from "../../hooks/useAcademyAccess.ts";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.ts";
import {
  academyCompletedCount,
  canOpenAcademyLesson,
  readAcademyLearningProgress,
  type AcademyLearningProgress,
} from "../../lib/academyLearningProgress.ts";
import "./Academy.css";

const FREE_PREVIEW_LESSONS = 3;

export default function Academy() {
  useDocumentMeta(
    "AI / Machine Learning Academy | CURIO",
    "Complete 45-lesson curriculum from computational thinking and Python to deep learning, transformers, and production MLOps."
  );

  const navigate = useNavigate();
  const { hasAcademyAccess, isLoading } = useAcademyAccess();
  const [search, setSearch] = useState("");
  const [learningProgress, setLearningProgress] = useState<AcademyLearningProgress>(readAcademyLearningProgress);

  useEffect(() => {
    const handleProgressUpdate = () => {
      setLearningProgress(readAcademyLearningProgress());
    };
    globalThis.addEventListener("curio:academy-progress-updated", handleProgressUpdate);
    return () => {
      globalThis.removeEventListener("curio:academy-progress-updated", handleProgressUpdate);
    };
  }, []);

  const completedCount = academyCompletedCount(learningProgress);
  const totalLessons = academyLessons.length;
  const overallPercent = Math.round((completedCount / totalLessons) * 100);

  const isUnlocked = (order: number) => {
    const sequentiallyUnlocked = canOpenAcademyLesson(learningProgress, order);
    const membershipUnlocked = hasAcademyAccess || order <= FREE_PREVIEW_LESSONS;
    return sequentiallyUnlocked && membershipUnlocked;
  };

  const filteredModules = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return academyModules;

    return academyModules
      .map((module) => ({
        ...module,
        lessons: module.lessons.filter(
          (lesson) =>
            lesson.title.toLowerCase().includes(query) ||
            lesson.summary.toLowerCase().includes(query) ||
            lesson.concepts.some((c) => c.term.toLowerCase().includes(query))
        ),
      }))
      .filter((module) => module.lessons.length > 0);
  }, [search]);

  const openLesson = (order: number) => {
    if (isUnlocked(order)) {
      navigate(`/academy/lesson/${order}`);
    }
  };

  return (
    <main className="academy-shell">
      {/* HEADER */}
      <header className="academy-top">
        <Link className="academy-brand" to="/dashboard">
          <img src="/curio-symbol.png" alt="CURIO" />
          <span>CURIO</span>
          <small>AI / ML ACADEMY</small>
        </Link>

        <div className="academy-progress">
          <span>{completedCount} of {totalLessons} completed ({overallPercent}%)</span>
          <i>
            <b style={{ width: `${overallPercent}%` }} />
          </i>
        </div>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/concepts">Concepts</Link>
          <Link to="/code-lab">Code Lab</Link>
          {!isLoading && !hasAcademyAccess && (
            <Link className="upgrade-link" to="/academy/checkout">
              Unlock PRO
            </Link>
          )}
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="academy-hero-banner">
        <div className="academy-hero-copy">
          <span className="academy-kicker">CURIO · AI & MACHINE LEARNING ACADEMY</span>
          <h1>Master AI Engineering from First Principles.</h1>
          <p>
            45 sequential lessons across 11 modules. Go from computational thinking and Python foundations to linear algebra, supervised learning, neural networks, transformers, RAG, generative models, and MLOps.
          </p>
        </div>
        <div className="academy-stats-card">
          <div className="stat-item">
            <strong>11</strong>
            <span>Modules</span>
          </div>
          <div className="stat-item">
            <strong>45</strong>
            <span>Lessons</span>
          </div>
          <div className="stat-item">
            <strong>7</strong>
            <span>Layers / Lesson</span>
          </div>
        </div>
      </section>

      {/* SEARCH BAR */}
      <section className="academy-search-bar">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search curriculum by topic, concept (e.g. Backpropagation, PyTorch, RAG, Ridge)..."
          aria-label="Search Academy curriculum"
        />
        {search && (
          <button type="button" className="clear-search" onClick={() => setSearch("")}>
            Clear
          </button>
        )}
      </section>

      {/* CURRICULUM ROADMAP */}
      <div className="academy-roadmap">
        {filteredModules.map((module) => (
          <section className="academy-module-block" key={module.id}>
            <header className="module-header">
              <span className="module-number">MODULE {module.number}</span>
              <h2>{module.title}</h2>
              <p>{module.description}</p>
            </header>

            <div className="module-lessons-grid">
              {module.lessons.map((item) => {
                const unlocked = isUnlocked(item.order);
                const progressState = learningProgress[item.order];
                const isCompleted = progressState?.completed === true;

                return (
                  <article
                    key={item.id}
                    className={`academy-lesson-card ${isCompleted ? "is-completed" : ""} ${!unlocked ? "is-locked" : ""}`}
                    onClick={() => openLesson(item.order)}
                  >
                    <div className="lesson-card-top">
                      <span className="lesson-order-badge">Lesson {item.order}</span>
                      <span className="lesson-level-badge">{item.level}</span>
                      {isCompleted ? (
                        <span className="status-badge completed">✓ Done</span>
                      ) : !unlocked ? (
                        <span className="status-badge locked">🔒 Locked</span>
                      ) : (
                        <span className="status-badge available">Available</span>
                      )}
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>

                    <div className="lesson-card-meta">
                      <span>⏱ {item.duration}</span>
                      <span>💡 {item.concepts.length} key concepts</span>
                      {item.order <= FREE_PREVIEW_LESSONS && (
                        <span className="preview-tag">Free Preview</span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="lesson-card-action"
                      disabled={!unlocked}
                      onClick={(e) => {
                        e.stopPropagation();
                        openLesson(item.order);
                      }}
                    >
                      {isCompleted
                        ? "Review Lesson →"
                        : unlocked
                        ? "Start Lesson →"
                        : !hasAcademyAccess && item.order > FREE_PREVIEW_LESSONS
                        ? "Unlock PRO Membership"
                        : "Finish Previous Lesson"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
