import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { academyLessons, academyModules, type AcademyLesson } from "../../data/academy.ts";
import { useAcademyAccess } from "../../hooks/useAcademyAccess.ts";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.ts";
import "./Academy.css";

const PROGRESS_KEY = "curio_academy_progress_v6";
const FREE_PREVIEW_LESSONS = 3;

type Section = "learn" | "math" | "code" | "practice" | "recap";

function readProgress(): number[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((x): x is number => typeof x === "number" && Number.isInteger(x)) : [];
  } catch { return []; }
}

function saveProgress(values: number[]) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...new Set(values)].sort((a, b) => a - b)));
}

function isSequentiallyUnlocked(order: number, completed: number[]) {
  return order === 1 || completed.includes(order - 1);
}

function Formula({ lesson }: { lesson: AcademyLesson }) {
  if (!lesson.mathematics && !lesson.derivation && !lesson.numerical) {
    return <div className="academy-empty">This foundation lesson is concept-first. Continue to the next lesson where the mathematical model becomes necessary.</div>;
  }
  return <>
    {lesson.mathematics && <section className="lesson-section"><h2>Mathematics</h2><p>{lesson.mathematics.introduction}</p>{lesson.mathematics.formulas.map((f) => <article className="formula" key={f.title}><h3>{f.title}</h3><code>{f.expression}</code><p>{f.explanation}</p></article>)}</section>}
    {lesson.derivation && <section className="lesson-section"><h2>Derivation</h2><p>{lesson.derivation.introduction}</p><ol>{lesson.derivation.steps.map((s) => <li key={s.title}><strong>{s.title}</strong><code>{s.expression}</code><p>{s.explanation}</p></li>)}</ol></section>}
    {lesson.numerical && <section className="lesson-section"><h2>Worked numerical</h2><p>{lesson.numerical.introduction}</p><ol>{lesson.numerical.steps.map((s) => <li key={s.step}><strong>{s.step}</strong><code>{s.calculation}</code><p>{s.explanation}</p></li>)}</ol></section>}
  </>;
}

function Learn({ lesson }: { lesson: AcademyLesson }) {
  const intuition = lesson.intuition ?? [lesson.why];
  const visual = lesson.visualExplanation ?? lesson.mindMap;
  return <>
    <section className="lesson-section"><span className="lesson-label">DEFINITION</span><h2>{lesson.title}</h2><p className="lesson-lead">{lesson.summary}</p></section>
    <section className="lesson-section"><h2>Why this matters</h2><p>{lesson.why}</p></section>
    <section className="lesson-section"><h2>Concepts</h2><div className="definition-grid">{lesson.concepts.map((c) => <article key={c.term}><h3>{c.term}</h3><p>{c.definition}</p></article>)}</div></section>
    <section className="lesson-section"><h2>Intuition</h2><ul>{intuition.map((x) => <li key={x}>{x}</li>)}</ul></section>
    <section className="lesson-section"><h2>Visual mental model</h2><div className="visual-steps">{visual.map((x, i) => <div key={x}><b>{i + 1}</b><span>{x}</span></div>)}</div></section>
    <section className="lesson-section"><h2>Common mistakes</h2><ul className="warning-list">{lesson.commonErrors.map((x) => <li key={x}>{x}</li>)}</ul></section>
  </>;
}

function Code({ lesson }: { lesson: AcademyLesson }) {
  const [copied, setCopied] = useState(false);
  if (!lesson.code) return <div className="academy-empty">No code is required for this lesson yet. Understanding the idea first is intentional.</div>;
  const copy = async () => { try { await navigator.clipboard.writeText(lesson.code?.code ?? ""); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { setCopied(false); } };
  return <section className="lesson-section"><div className="section-row"><div><span className="lesson-label">{lesson.code.language.toUpperCase()}</span><h2>Code walkthrough</h2></div><button type="button" onClick={() => void copy()}>{copied ? "Copied" : "Copy code"}</button></div><pre><code>{lesson.code.code}</code></pre><ol>{lesson.code.notes.map((x) => <li key={x}>{x}</li>)}</ol></section>;
}

function Practice({ lesson, completed, onComplete }: { lesson: AcademyLesson; completed: boolean; onComplete: () => void }) {
  return <section className="lesson-section practice-card"><span className="lesson-label">CHECK YOUR UNDERSTANDING</span><h2>Practice</h2><p className="lesson-lead">{lesson.practice.prompt}</p><h3>Before you complete this lesson</h3><ul>{lesson.practice.checkpoints.map((x) => <li key={x}>{x}</li>)}</ul><button type="button" className="complete-button" disabled={completed} onClick={onComplete}>{completed ? "✓ Lesson completed" : "Mark lesson as completed and unlock next →"}</button></section>;
}

export default function Academy() {
  useDocumentMeta("CURIO AI / ML Academy", "Learn AI and machine learning through clear, sequential lessons.");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requested = Number(params.get("lesson"));
  const selectedOrder = Number.isInteger(requested) && requested >= 1 && requested <= academyLessons.length ? requested : 1;
  const [section, setSection] = useState<Section>("learn");
  const [completed, setCompleted] = useState<number[]>(readProgress);
  const [search, setSearch] = useState("");
  const { hasAcademyAccess, isLoading } = useAcademyAccess();
  const lesson = academyLessons.find((x) => x.order === selectedOrder) ?? academyLessons[0];
  const completedCurrent = completed.includes(lesson.order);
  const progress = Math.round((completed.length / academyLessons.length) * 100);

  useEffect(() => saveProgress(completed), [completed]);
  useEffect(() => setSection("learn"), [selectedOrder]);

  const canOpen = (order: number) => {
    if (!isSequentiallyUnlocked(order, completed)) return false;
    return hasAcademyAccess || order <= FREE_PREVIEW_LESSONS;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return academyModules.map((m) => ({ ...m, lessons: m.lessons.filter((l) => !q || l.title.toLowerCase().includes(q) || l.concepts.some((c) => c.term.toLowerCase().includes(q))) })).filter((m) => m.lessons.length > 0);
  }, [search]);

  const openLesson = (order: number) => { if (canOpen(order)) navigate(`/academy?lesson=${order}`); };
  const complete = () => {
    setCompleted((old) => old.includes(lesson.order) ? old : [...old, lesson.order]);
    const next = academyLessons.find((x) => x.order === lesson.order + 1);
    if (next) setTimeout(() => navigate(`/academy?lesson=${next.order}`), 450);
  };

  const tabs: { id: Section; label: string }[] = [
    { id: "learn", label: "Lesson" }, { id: "math", label: "Math & examples" }, { id: "code", label: "Code" }, { id: "practice", label: "Practice" }, { id: "recap", label: "Recap" },
  ];

  return <main className="academy-shell">
    <header className="academy-top"><Link className="academy-brand" to="/"><img src="/curio-symbol.png" alt="" /> CURIO <small>AI / ML ACADEMY</small></Link><div className="academy-progress"><span>{progress}% complete</span><i><b style={{ width: `${progress}%` }} /></i></div><nav><Link to="/dashboard">Dashboard</Link>{!isLoading && !hasAcademyAccess && <Link className="upgrade-link" to="/academy/checkout">Unlock full Academy</Link>}</nav></header>
    <div className="academy-layout">
      <aside className="academy-sidebar"><div className="sidebar-title"><strong>AI / ML Curriculum</strong><span>{completed.length}/{academyLessons.length} completed</span></div><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lessons or concepts" />
        {filtered.map((module) => <section className="module" key={module.id}><h3>{module.number}. {module.title}</h3>{module.lessons.map((item) => { const active = item.order === lesson.order; const unlocked = canOpen(item.order); const done = completed.includes(item.order); return <button type="button" key={item.id} className={`lesson-link ${active ? "active" : ""}`} disabled={!unlocked} onClick={() => openLesson(item.order)}><span>{done ? "✓" : unlocked ? item.order : "🔒"}</span><div><b>{item.title}</b><small>{item.duration} · {item.level}</small></div></button>; })}</section>)}
      </aside>
      <article className="academy-content"><div className="breadcrumbs">Module {academyModules.find((m) => m.lessons.some((x) => x.id === lesson.id))?.number ?? ""} <span>›</span> Lesson {lesson.order}</div><header className="lesson-header"><span className="lesson-label">{lesson.level.toUpperCase()} · {lesson.duration}</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></header>
        <div className="lesson-tabs">{tabs.map((tab) => <button type="button" key={tab.id} className={section === tab.id ? "selected" : ""} onClick={() => setSection(tab.id)}>{tab.label}</button>)}</div>
        <div className="lesson-body">{section === "learn" && <Learn lesson={lesson} />}{section === "math" && <Formula lesson={lesson} />}{section === "code" && <Code lesson={lesson} />}{section === "practice" && <Practice lesson={lesson} completed={completedCurrent} onComplete={complete} />}{section === "recap" && <section className="lesson-section"><h2>Key takeaways</h2><ul>{(lesson.keyTakeaways ?? lesson.concepts.map((c) => `${c.term}: ${c.definition}`)).map((x) => <li key={x}>{x}</li>)}</ul><h2>Prerequisites</h2><p>{lesson.prerequisites.length ? lesson.prerequisites.join(" · ") : "None — this lesson starts the path."}</p></section>}</div>
        <footer className="lesson-footer"><button type="button" disabled={lesson.order === 1} onClick={() => openLesson(lesson.order - 1)}>← Previous</button><button type="button" disabled={!canOpen(lesson.order + 1)} onClick={() => openLesson(lesson.order + 1)}>Next lesson →</button></footer>
      </article>
    </div>
  </main>;
}
