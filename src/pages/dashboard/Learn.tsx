import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { lessons } from "../../data/lessons.ts";
import { useAllLessonProgress } from "../../hooks/useLessonProgress.ts";
import "./Learn.css";

type LessonStatus = "completed" | "in-progress" | "available" | "locked";

function isGuestMode(): boolean {
  try {
    return sessionStorage.getItem("curio_guest") === "true";
  } catch {
    return false;
  }
}

function Learn() {
  const navigate = useNavigate();
  const isGuest = isGuestMode();
  const { progress, loading } = useAllLessonProgress();

  const progressMap = useMemo(() => {
    const map = new Map<number, number>();
    if (!isGuest) {
      progress.forEach((item) => {
        const total = Math.max(1, Number(item.totalSections) || 1);
        const completed = Math.max(0, Math.min(Number(item.completedSections) || 0, total));
        map.set(item.lessonId, Math.round((completed / total) * 100));
      });
    }
    return map;
  }, [isGuest, progress]);

  const getPercent = (lessonId: number) => progressMap.get(lessonId) ?? 0;

  const isComplete = (lessonId: number) => getPercent(lessonId) >= 100;

  const statusFor = (lessonId: number): LessonStatus => {
    if (isGuest) return lessonId === 1 ? "available" : "locked";
    if (isComplete(lessonId)) return "completed";
    if (getPercent(lessonId) > 0) return "in-progress";
    if (lessonId === 1 || isComplete(lessonId - 1)) return "available";
    return "locked";
  };

  const completedLessons = isGuest
    ? 0
    : lessons.filter((lesson) => isComplete(lesson.id)).length;

  const overall = Math.round(
    lessons.reduce((sum, lesson) => sum + getPercent(lesson.id), 0) / lessons.length,
  );

  const currentLesson = useMemo(() => {
    if (isGuest) return lessons[0];
    return (
      lessons.find((lesson) => statusFor(lesson.id) === "in-progress") ??
      lessons.find((lesson) => statusFor(lesson.id) === "available") ??
      lessons[0]
    );
  }, [isGuest, progressMap]);

  const openLesson = (lessonId: number) => {
    if (isGuest && lessonId !== 1) return;
    if (!isGuest && statusFor(lessonId) === "locked") return;
    navigate(`/learn/lesson/${lessonId}`);
  };

  if (loading && !isGuest) {
    return (
      <main className="learn-page learn-loading-page">
        <div className="learn-loading-block">
          <div className="learn-loading-bar" />
          <p>Loading your learning path…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="learn-page">
      <section className="learn-intro">
        <div className="learn-intro-copy">
          <span className="learn-kicker">CURIO · LEARNING PATH</span>
          <h1>Learn AI with a clear path.</h1>
          <p>
            Eight focused lessons take you from AI foundations to independent,
            responsible use. Each lesson teaches a concept, asks you to apply it,
            and records your real progress.
          </p>
        </div>
        <div className="learn-progress-summary">
          <span>COURSE PROGRESS</span>
          <strong>{overall}%</strong>
          <small>{completedLessons} of {lessons.length} lessons complete</small>
          <div className="learn-progress-track"><span style={{ width: `${overall}%` }} /></div>
        </div>
      </section>

      <section className="learn-next">
        <div>
          <span className="learn-kicker">NEXT UP</span>
          <h2>{currentLesson.title}</h2>
          <p>{currentLesson.subtitle}</p>
          <div className="learn-next-meta">
            <span>{currentLesson.difficulty}</span>
            <span>{currentLesson.estimatedMinutes} minutes</span>
            <span>{currentLesson.sections.length} sections</span>
          </div>
        </div>
        <button type="button" onClick={() => openLesson(currentLesson.id)}>
          {getPercent(currentLesson.id) > 0 ? "Continue lesson" : "Start lesson"} <span>→</span>
        </button>
      </section>

      {isGuest && (
        <div className="learn-guest-note">
          <strong>Guest access</strong>
          <span>Lesson 1 is available in this session. Sign in to unlock and save the complete learning path.</span>
        </div>
      )}

      <section className="learn-path-section">
        <div className="learn-section-heading">
          <div>
            <span className="learn-kicker">THE CURIO CURRICULUM</span>
            <h2>Eight lessons, one progression</h2>
          </div>
          <p>Complete a lesson to unlock the next one.</p>
        </div>

        <div className="learn-grid">
          {lessons.map((lesson) => {
            const status = statusFor(lesson.id);
            const percent = getPercent(lesson.id);
            return (
              <article key={lesson.id} className={`learn-card is-${status}`}>
                <div className="learn-card-top">
                  <span className="learn-card-number">{String(lesson.id).padStart(2, "0")}</span>
                  <span className={`learn-status learn-status-${status}`}>
                    {status === "in-progress" ? "In progress" : status[0].toUpperCase() + status.slice(1)}
                  </span>
                </div>
                <span className="learn-card-difficulty">{lesson.difficulty} · {lesson.estimatedMinutes} min</span>
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
                <div className="learn-skills">
                  {lesson.skills.map((skill) => <span key={skill}>{skill}</span>)}
                </div>
                <div className="learn-card-progress">
                  <div><span>{percent}% complete</span><span>{lesson.sections.length} sections</span></div>
                  <div className="learn-progress-track"><span style={{ width: `${percent}%` }} /></div>
                </div>
                <button type="button" onClick={() => openLesson(lesson.id)} disabled={status === "locked"}>
                  {status === "locked" ? `Complete Lesson ${lesson.id - 1} first` : status === "completed" ? "Review lesson" : status === "in-progress" ? "Continue" : "Start lesson"}
                  {status !== "locked" && <span>→</span>}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="learn-deeper-section">
        <div className="learn-section-heading">
          <div>
            <span className="learn-kicker">GO DEEPER</span>
            <h2>Move from AI literacy to AI engineering</h2>
          </div>
          <p>Keep the eight CURIO lessons focused. Use the Academy, Concept Library and Code Lab as separate deeper learning areas.</p>
        </div>
        <div className="learn-deeper-grid">
          <button type="button" onClick={() => navigate("/academy")}>
            <span>01 · ACADEMY</span><strong>AI / ML study map</strong><p>Foundations, Python, data, ML, deep learning, LLMs and production systems.</p>
          </button>
          <button type="button" onClick={() => navigate("/concepts")}>
            <span>02 · CONCEPTS</span><strong>Connected definitions</strong><p>Simple explanations, technical definitions, misconceptions, examples and related ideas.</p>
          </button>
          <button type="button" onClick={() => navigate("/code-lab")}>
            <span>03 · CODE LAB</span><strong>Read code line by line</strong><p>Python, NumPy, supervised learning and PyTorch training patterns.</p>
          </button>
        </div>
      </section>
    </main>
  );
}

export default Learn;
