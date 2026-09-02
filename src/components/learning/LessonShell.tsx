import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getLesson } from "../../data/lessons.ts";
import { useLessonProgress } from "../../hooks/useLessonProgress.ts";
import { lessonResources } from "../../data/lessonResources.ts";
import "./LessonShell.css";

interface LessonShellProps { lessonId: number; }
type LearningMode = "learn" | "map" | "recall" | "apply";
type MapNodeKey = "core" | "example" | "action" | "check";

function LessonShell({ lessonId }: LessonShellProps) {
  const navigate = useNavigate();
  const lesson = getLesson(lessonId);
  const totalSections = lesson?.sections.length ?? 0;
  const [sectionIndex, setSectionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [savingNotice, setSavingNotice] = useState("");
  const [learningMode, setLearningMode] = useState<LearningMode>("learn");
  const [recallOpen, setRecallOpen] = useState(false);
  const [teachBack, setTeachBack] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [selectedMapNode, setSelectedMapNode] = useState<MapNodeKey>("core");

  const { loading, saving, error, accessible, currentSection, completedSections, completed, progressPercentage, updateProgress, markComplete } = useLessonProgress(lessonId, totalSections);

  useEffect(() => {
    if (loading || !lesson) return;
    if (!accessible) { navigate("/learn", { replace: true }); return; }
    if (completed) { setSectionIndex(Math.max(0, totalSections - 1)); return; }
    setSectionIndex(Math.min(Math.max(currentSection, 0), Math.max(totalSections - 1, 0)));
  }, [loading, accessible, completed, currentSection, totalSections, lesson, navigate]);

  useEffect(() => {
    setSelectedOption(null); setChecked(false); setSavingNotice(""); setRecallOpen(false); setTeachBack(""); setConfidence(null); setSelectedMapNode("core");
  }, [sectionIndex]);

  const progressLabel = useMemo(() => `${Math.max(0, Math.min(progressPercentage, 100))}%`, [progressPercentage]);

  if (!lesson) return <main className="lesson-shell-error"><h1>Lesson unavailable</h1><p>The requested lesson could not be found.</p><Link to="/learn">Return to Learn AI</Link></main>;
  if (loading) return <main className="lesson-shell-loading"><div className="lesson-loading-line" /><p>Loading your lesson progress…</p></main>;
  if (!accessible) return null;

  const section = lesson.sections[sectionIndex];
  if (!section) return <main className="lesson-shell-error"><h1>Lesson content unavailable</h1><p>This lesson does not contain the requested section.</p><Link to="/learn">Return to Learn AI</Link></main>;

  const isLast = sectionIndex === totalSections - 1;
  const kindLabel = ({ concept: "Learn", decision: "Decide", practice: "Apply", challenge: "Challenge" } as const)[section.kind];
  const mapNodes: Record<MapNodeKey, { eyebrow: string; title: string; body: string }> = {
    core: { eyebrow: "CORE IDEA", title: section.title, body: section.summary },
    example: { eyebrow: "EXAMPLE", title: "See it in use", body: section.example },
    action: { eyebrow: "TRY THIS", title: "Make it yours", body: section.action },
    check: { eyebrow: "CHECK", title: "Test the connection", body: section.checkQuestion },
  };
  const misconception = section.kind === "decision"
    ? "A plausible recommendation is not automatically the right decision; the context and consequences still matter."
    : section.kind === "practice"
      ? "Repeating a technique is not the same as understanding why it works or when it should be used."
      : section.kind === "challenge"
        ? "A correct answer in one example does not prove the idea transfers unchanged to every situation."
        : "Fluent or familiar wording can create an illusion of understanding; test the idea with an example and a recall attempt.";
  const resources = lessonResources[lesson.id] ?? [];

  const handleCheck = () => { if (selectedOption !== null) setChecked(true); };
  const handleNext = async () => {
    const nextCompleted = Math.min(totalSections, Math.max(completedSections, sectionIndex + 1));
    const ok = await updateProgress(sectionIndex + 1, nextCompleted); if (!ok) return;
    if (isLast) {
      if (selectedOption !== section.answer) { setChecked(true); setSavingNotice("Choose the strongest answer before completing the lesson."); return; }
      const finished = await markComplete(); if (!finished) return; setSavingNotice("Lesson complete. Your progress has been saved."); return;
    }
    setSavingNotice(""); setSectionIndex((index) => index + 1);
  };

  return (
    <div className="lesson-shell">
      <header className="lesson-topbar"><div className="lesson-topbar-inner">
        <Link className="lesson-brand" to="/learn" aria-label="Back to Learn AI"><span className="lesson-brand-mark"><img src="/curio-symbol.png" alt="" aria-hidden="true" /></span><span><strong>CURIO</strong><small>AI learning path</small></span></Link>
        <div className="lesson-topbar-progress"><span>Lesson {lesson.id} · {progressLabel}</span><div className="lesson-topbar-track"><span style={{ width: progressLabel }} /></div></div>
      </div></header>

      <main className="lesson-layout">
        <aside className="lesson-sidebar">
          <div className="lesson-sidebar-heading"><span>LESSON {String(lesson.id).padStart(2, "0")}</span><h1>{lesson.title}</h1><p>{lesson.subtitle}</p></div>
          <nav className="lesson-section-nav" aria-label="Lesson sections">{lesson.sections.map((item, index) => {
            const done = index < completedSections || (completed && index === totalSections - 1); const active = index === sectionIndex;
            return <button key={item.id} type="button" className={`lesson-nav-item ${active ? "is-active" : ""} ${done ? "is-done" : ""}`} onClick={() => { if (index <= completedSections || index === sectionIndex) setSectionIndex(index); }} disabled={index > completedSections && index !== sectionIndex}>
              <span className="lesson-nav-number">{done ? "OK" : String(index + 1).padStart(2, "0")}</span><span><strong>{item.title}</strong><small>{active ? "Current section" : done ? "Completed" : "Up next"}</small></span>
            </button>;
          })}</nav>
          <div className="lesson-sidebar-footer"><Link to="/learn">All lessons</Link><span>{completedSections} / {totalSections} complete</span></div>
        </aside>

        <section className="lesson-content">
          <div className="lesson-content-head"><div><span className="lesson-kicker">SECTION {String(section.id).padStart(2, "0")} · {kindLabel.toUpperCase()}</span><h2>{section.title}</h2><p className="lesson-summary">{section.summary}</p></div><span className="lesson-time">{lesson.estimatedMinutes} min lesson</span></div>

          {sectionIndex === 0 && <section className="lesson-goals-card" aria-label="Lesson goals"><div><span>WHAT YOU WILL BE ABLE TO DO</span><h3>Build the skill, not just finish the lesson.</h3></div><ul>{lesson.objectives.slice(0, 5).map((objective) => <li key={objective}>{objective}</li>)}</ul></section>}

          <div className="lesson-mode-switch" role="tablist" aria-label="Learning mode">{(["learn", "map", "recall", "apply"] as LearningMode[]).map((mode) => <button key={mode} type="button" role="tab" aria-selected={learningMode === mode} className={learningMode === mode ? "is-active" : ""} onClick={() => setLearningMode(mode)}>{mode === "map" ? "Mind Map" : mode === "recall" ? "Recall" : mode === "apply" ? "Apply" : "Learn"}</button>)}</div>

          {learningMode === "learn" && <article className="lesson-reading-card">
            <div className="lesson-card-kicker">LEARN</div><h3>Core idea</h3><p>{section.explanation}</p>
            <div className="lesson-example"><span>Example</span><p>{section.example}</p></div>
            <div className="lesson-action-card"><span>Try it yourself</span><p>{section.action}</p></div>
            <div className="lesson-misconception"><span>COMMON CONFUSION TO AVOID</span><p>{misconception}</p></div>
          </article>}

          {learningMode === "map" && <article className="lesson-map-card">
            <div className="lesson-map-heading"><div><span>CONCEPT CONNECTIONS</span><h3>Read the map from the core idea outward.</h3><p>Each node stays separate and readable. Select a node to focus on that connection.</p></div><span className="lesson-map-hint">Select a node</span></div>
            <div className="lesson-map-stage">
              <svg className="lesson-map-lines" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true"><line x1="500" y1="310" x2="220" y2="145" /><line x1="500" y1="310" x2="780" y2="145" /><line x1="500" y1="310" x2="220" y2="475" /><line x1="500" y1="310" x2="780" y2="475" /></svg>
              <div className="lesson-map-grid">
                <button type="button" onClick={() => setSelectedMapNode("core")} className={`lesson-map-node node-core node-position-core ${selectedMapNode === "core" ? "is-selected" : ""}`}><span>CORE</span><strong>{section.title}</strong><small>{section.summary}</small></button>
                <button type="button" onClick={() => setSelectedMapNode("example")} className={`lesson-map-node node-example node-position-example ${selectedMapNode === "example" ? "is-selected" : ""}`}><span>EXAMPLE</span><strong>See it in use</strong><small>{section.example}</small></button>
                <button type="button" onClick={() => setSelectedMapNode("action")} className={`lesson-map-node node-action node-position-action ${selectedMapNode === "action" ? "is-selected" : ""}`}><span>TRY</span><strong>Make it yours</strong><small>{section.action}</small></button>
                <button type="button" onClick={() => setSelectedMapNode("check")} className={`lesson-map-node node-check node-position-check ${selectedMapNode === "check" ? "is-selected" : ""}`}><span>CHECK</span><strong>Test the idea</strong><small>{section.checkQuestion}</small></button>
              </div>
            </div>
            <div className="lesson-map-focus"><span>{mapNodes[selectedMapNode].eyebrow}</span><h4>{mapNodes[selectedMapNode].title}</h4><p>{mapNodes[selectedMapNode].body}</p></div>
          </article>}

          {learningMode === "recall" && <article className="lesson-recall-card"><span>ACTIVE RECALL</span><h3>Explain this idea in your own words before revealing the answer.</h3><textarea value={teachBack} onChange={(event) => setTeachBack(event.target.value)} placeholder="Write your explanation here. Focus on the main idea, an example, and why it matters." aria-label="Explain the concept in your own words" /><div className="lesson-recall-actions"><button type="button" onClick={() => setRecallOpen((v) => !v)}>{recallOpen ? "Hide explanation" : "Reveal explanation"}</button><span>{teachBack.trim().length ? "Your explanation is ready to compare." : "Try explaining before you reveal."}</span></div>{recallOpen && <div className="lesson-reveal"><strong>Compare with the lesson</strong><p>{section.explanation}</p></div>}</article>}

          {learningMode === "apply" && <article className="lesson-apply-card"><span>REAL-WORLD TRANSFER</span><h3>Where would you use this idea outside this lesson?</h3><p>{section.action}</p><div className="lesson-definition"><strong>Practical definition</strong><span>{section.summary}</span></div><div className="lesson-apply-prompt"><strong>Decision prompt</strong><p>Choose one real situation from your studies, work, or daily life and describe how this idea would change what you do next.</p></div></article>}

          <article className="lesson-check-card"><div className="lesson-check-heading"><div><span>QUICK CHECK</span><h3>{section.checkQuestion}</h3></div><span className="lesson-check-count">{selectedOption === null ? "Not answered" : checked ? "Checked" : "Selected"}</span></div>
            <div className="lesson-options">{section.options.map((option, index) => { const isSelected = selectedOption === index; const isCorrect = checked && index === section.answer; const isWrong = checked && isSelected && index !== section.answer; return <button type="button" key={option} className={`lesson-option ${isSelected ? "is-selected" : ""} ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`} onClick={() => { setSelectedOption(index); setChecked(false); setSavingNotice(""); }}><span className="lesson-option-key">{String.fromCharCode(65 + index)}</span><span>{option}</span></button>; })}</div>
            {selectedOption !== null && <div className={`lesson-feedback ${checked ? (selectedOption === section.answer ? "is-positive" : "is-negative") : ""}`}>{!checked ? "Check your choice to see why it works." : selectedOption === section.answer ? `Correct. ${section.answerExplanation}` : `Not quite. ${section.answerExplanation}`}</div>}
            <div className="lesson-check-actions"><button type="button" className="lesson-secondary-button" onClick={handleCheck} disabled={selectedOption === null}>Check answer</button></div>
          </article>

          <section className="lesson-reflection-card"><div><span>CONFIDENCE CHECK</span><h3>How confident are you with this idea now?</h3></div><div className="lesson-confidence-options">{["Not sure yet", "Getting there", "I can explain it"].map((label, index) => <button key={label} type="button" className={confidence === index ? "is-selected" : ""} onClick={() => setConfidence(index)}>{label}</button>)}</div></section>

          {resources.length > 0 && <section className="lesson-resources-card"><div><span>LEARN FURTHER</span><h3>References for this lesson</h3><p>Use these sources to verify, deepen, and extend what you learned.</p></div><div>{resources.map((resource) => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer"><small>{resource.source}</small><strong>{resource.label}</strong><b>Open ↗</b></a>)}</div></section>}

          {(error || savingNotice) && <div className={`lesson-save-message ${error ? "is-error" : ""}`} role="status">{error ?? savingNotice}</div>}
          <div className="lesson-footer-actions"><button type="button" className="lesson-secondary-button" onClick={() => setSectionIndex((index) => Math.max(0, index - 1))} disabled={sectionIndex === 0}>Previous</button><div className="lesson-footer-status"><span>Section {sectionIndex + 1} of {totalSections}</span><span>{saving ? "Saving…" : "Progress saves automatically"}</span></div><button type="button" className="lesson-primary-button" onClick={handleNext} disabled={saving || (isLast && selectedOption !== section.answer)}>{isLast ? (completed ? "Completed" : "Complete lesson") : "Continue"}<span aria-hidden="true">→</span></button></div>
        </section>
      </main>
    </div>
  );
}

export default LessonShell;
