import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { academyLessons, academyModules } from "../../data/academy.ts";
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
import TeachingBlocks from "../../components/academy/TeachingBlocks.tsx";
import {
  AlgorithmWorkshop,
  ApplyWorkshop,
  CodeWorkshop,
  DebugWorkshop,
  MathWorkshop,
  PracticeWorkshop,
} from "../../components/academy/LearningTools.tsx";
import "./AcademyLesson.css";

const FREE_PREVIEW_LESSONS = 3;

type Layer = "understand" | "math" | "algorithm" | "code" | "debug" | "apply" | "practice";

const layers: { id: Layer; label: string; hint: string }[] = [
  { id: "understand", label: "Understand", hint: "Problem → intuition → concepts" },
  { id: "math", label: "Math", hint: "Formula → derivation → numerical" },
  { id: "algorithm", label: "Algorithm", hint: "Turn the idea into steps" },
  { id: "code", label: "Code Lab", hint: "Implement and inspect" },
  { id: "debug", label: "Debug", hint: "Find the broken assumption" },
  { id: "apply", label: "Apply", hint: "Connect theory to reality" },
  { id: "practice", label: "Practice", hint: "Do it and teach it back" },
];

export default function AcademyLesson() {
  const params = useParams<{ order: string }>();
  const navigate = useNavigate();
  const order = Number(params.order);
  const lesson = academyLessons.find((item) => item.order === order);
  const module = useMemo(() => lesson ? academyModules.find((item) => item.lessons.some((candidate) => candidate.id === lesson.id)) : undefined, [lesson]);

  useDocumentMeta(
    lesson ? `${lesson.title} | CURIO Academy` : "CURIO Academy Lesson",
    lesson?.summary ?? "Learn AI and machine learning through guided lessons.",
  );

  const { hasAcademyAccess, isLoading } = useAcademyAccess();
  const [learningProgress, setLearningProgress] = useState<AcademyLearningProgress>(readAcademyLearningProgress);
  const [layer, setLayer] = useState<Layer>("understand");

  const progress = lesson ? getLessonProgress(learningProgress, lesson.order) : null;
  const sequentiallyUnlocked = lesson ? canOpenAcademyLesson(learningProgress, lesson.order) : false;
  const membershipUnlocked = lesson ? hasAcademyAccess || lesson.order <= FREE_PREVIEW_LESSONS : false;
  const completedCount = academyCompletedCount(learningProgress);
  const percent = Math.round((completedCount / academyLessons.length) * 100);

  useEffect(() => {
    setLayer("understand");
  }, [order]);

  const patchProgress = (patch: Parameters<typeof updateLessonProgress>[2]) => {
    if (!lesson) return;
    setLearningProgress((current) => {
      const next = updateLessonProgress(current, lesson.order, patch);
      saveAcademyLearningProgress(next);
      return next;
    });
  };

  const completeLesson = () => {
    if (!lesson || !progress?.concept || !progress.practice || !progress.teachBack) return;
    patchProgress({ completed: true });
  };

  if (!lesson) return <Navigate to="/academy" replace />;

  const nextLesson = academyLessons.find((item) => item.order === lesson.order + 1);
  const previousLesson = academyLessons.find((item) => item.order === lesson.order - 1);
  const readyToComplete = progress?.concept === true && progress.practice === true && progress.teachBack === true;

  if (!isLoading && !sequentiallyUnlocked) {
    const previous = academyLessons.find((item) => item.order === lesson.order - 1);
    return <main className="academy-gate-page"><section><span>LESSON LOCKED</span><h1>Finish the previous lesson first.</h1><p>CURIO uses sequential learning so each lesson has the concepts needed for the next one.</p>{previous && <button type="button" onClick={() => navigate(`/academy/lesson/${previous.order}`)}>Continue lesson {previous.order}: {previous.title}</button>}<Link to="/academy">View curriculum</Link></section></main>;
  }

  if (!isLoading && !membershipUnlocked) {
    return <main className="academy-gate-page"><section><span>PRO MEMBERSHIP</span><h1>This lesson is part of the full Academy.</h1><p>The first {FREE_PREVIEW_LESSONS} lessons remain available as a preview. Unlock PRO to continue the complete sequential curriculum.</p><Link className="academy-gate-primary" to="/academy/checkout">Unlock complete Academy</Link><Link to="/academy">Back to curriculum</Link></section></main>;
  }

  return (
    <main className="academy-lesson-page">
      <header className="academy-lesson-topbar">
        <Link className="academy-lesson-brand" to="/academy"><span>CURIO</span><small>AI / ML ACADEMY</small></Link>
        <div className="academy-lesson-progress"><span>{completedCount}/{academyLessons.length} lessons</span><i><b style={{ width: `${percent}%` }} /></i><strong>{percent}%</strong></div>
        <nav><Link to="/academy">Curriculum</Link><Link to="/dashboard">Dashboard</Link></nav>
      </header>

      <div className="academy-lesson-layout">
        <aside className="academy-learning-map">
          <div className="learning-map-heading"><span>{module?.number ?? ""} · {module?.title ?? ""}</span><h2>Learning path</h2><p>Move through the idea in the same order a good teacher would build it.</p></div>
          <div className="learning-layer-list">{layers.map((item, index) => <button type="button" key={item.id} className={layer === item.id ? "active" : ""} onClick={() => setLayer(item.id)}><b>{String(index + 1).padStart(2, "0")}</b><span><strong>{item.label}</strong><small>{item.hint}</small></span></button>)}</div>
          <div className="lesson-checkpoints"><strong>Your checkpoints</strong><span className={progress?.concept ? "done" : ""}>{progress?.concept ? "✓" : "○"} Understand the core idea</span><span className={progress?.practice ? "done" : ""}>{progress?.practice ? "✓" : "○"} Complete the practice</span><span className={progress?.teachBack ? "done" : ""}>{progress?.teachBack ? "✓" : "○"} Explain it yourself</span></div>
        </aside>

        <article className="academy-learning-content">
          <div className="academy-lesson-breadcrumbs"><Link to="/academy">Academy</Link><span>›</span><span>Module {module?.number}</span><span>›</span><span>Lesson {lesson.order}</span></div>
          <header className="academy-learning-header"><span>{lesson.level.toUpperCase()} · {lesson.duration}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></header>

          <div className="academy-layer-mobile">{layers.map((item) => <button type="button" key={item.id} className={layer === item.id ? "active" : ""} onClick={() => setLayer(item.id)}>{item.label}</button>)}</div>

          <div className="academy-layer-content">
            {layer === "understand" && <TeachingBlocks lesson={lesson} conceptReady={progress?.concept === true} onConceptReady={() => patchProgress({ concept: true })} />}
            {layer === "math" && <MathWorkshop lesson={lesson} />}
            {layer === "algorithm" && <AlgorithmWorkshop lesson={lesson} />}
            {layer === "code" && <CodeWorkshop lesson={lesson} />}
            {layer === "debug" && <DebugWorkshop lesson={lesson} />}
            {layer === "apply" && <ApplyWorkshop lesson={lesson} />}
            {layer === "practice" && <PracticeWorkshop lesson={lesson} practiceDone={progress?.practice === true} teachBackDone={progress?.teachBack === true} onPracticeDone={() => patchProgress({ practice: true })} onTeachBackDone={() => patchProgress({ teachBack: true })} />}
          </div>

          <section className="academy-completion-panel">
            <div><span>LESSON COMPLETION</span><h2>{progress?.completed ? "Lesson completed" : readyToComplete ? "You have done the work. Complete the lesson." : "Complete the three learning checkpoints."}</h2><p>Understanding is not measured by scrolling. CURIO asks you to understand the idea, practise it and explain it in your own words.</p></div>
            <button type="button" disabled={!readyToComplete || progress?.completed === true} onClick={completeLesson}>{progress?.completed ? "Completed ✓" : "Complete and unlock next"}</button>
          </section>

          <footer className="academy-learning-footer">
            <button type="button" disabled={!previousLesson} onClick={() => previousLesson && navigate(`/academy/lesson/${previousLesson.order}`)}>← Previous lesson</button>
            {nextLesson ? <button type="button" className="next" disabled={!progress?.completed || (!hasAcademyAccess && nextLesson.order > FREE_PREVIEW_LESSONS)} onClick={() => navigate(`/academy/lesson/${nextLesson.order}`)}>{!progress?.completed ? "Complete this lesson first" : nextLesson.order > FREE_PREVIEW_LESSONS && !hasAcademyAccess ? "Unlock PRO to continue" : "Next lesson →"}</button> : <Link className="academy-finish-link" to="/academy">Return to curriculum</Link>}
          </footer>
        </article>
      </div>
    </main>
  );
}
