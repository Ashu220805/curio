import { useState } from "react";
import type { AcademyLesson } from "../../data/academy.ts";
import { getMentorLesson } from "../../data/academyMentor.ts";
import "./LearningTools.css";

export function MathWorkshop({ lesson }: { lesson: AcademyLesson }) {
  if (!lesson.mathematics && !lesson.derivation && !lesson.numerical) {
    return <section className="tool-empty"><span>NO FORCED MATH</span><h2>Understand the idea first</h2><p>This lesson does not need mathematics to make its main concept clear. When mathematics becomes necessary, it should explain something—not decorate the lesson.</p></section>;
  }

  return <div className="tool-stack">
    <section className="tool-hero"><span>MATH WORKSHOP</span><h2>Understand what the symbols are saying</h2><p>Read each expression as a sentence first. Then connect the sentence to the problem.</p></section>
    {lesson.mathematics && <section className="tool-card"><h2>1. The mathematical idea</h2><p>{lesson.mathematics.introduction}</p>{lesson.mathematics.formulas.map((formula) => <article className="formula-card" key={formula.title}><h3>{formula.title}</h3><code>{formula.expression}</code><p>{formula.explanation}</p></article>)}</section>}
    {lesson.derivation && <section className="tool-card"><h2>2. Where it comes from</h2><p>{lesson.derivation.introduction}</p><div className="derivation-list">{lesson.derivation.steps.map((step, index) => <article key={step.title}><b>{index + 1}</b><div><h3>{step.title}</h3><code>{step.expression}</code><p>{step.explanation}</p></div></article>)}</div></section>}
    {lesson.numerical && <section className="tool-card"><h2>3. Solve one slowly</h2><p>{lesson.numerical.introduction}</p><div className="numerical-list">{lesson.numerical.steps.map((step) => <article key={step.step}><strong>{step.step}</strong><code>{step.calculation}</code><p>{step.explanation}</p></article>)}</div></section>}
  </div>;
}

export function AlgorithmWorkshop({ lesson }: { lesson: AcademyLesson }) {
  const steps = lesson.algorithm?.steps ?? lesson.mindMap.map((title, index) => ({ step: index + 1, title, description: "Understand what this stage contributes before moving to the next one." }));
  const intro = lesson.algorithm?.introduction ?? "Turn the idea into an ordered process. If you cannot describe the steps, code will feel like magic.";

  return <div className="tool-stack">
    <section className="tool-hero"><span>ALGORITHM THINKING</span><h2>Before code, know the sequence</h2><p>{intro}</p></section>
    <section className="tool-card"><div className="algorithm-list">{steps.map((step) => <article key={`${step.step}-${step.title}`}><span>{step.step}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></article>)}</div></section>
  </div>;
}

export function CodeWorkshop({ lesson }: { lesson: AcademyLesson }) {
  const [copied, setCopied] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);

  if (!lesson.code) return <section className="tool-empty"><span>CODE LAB</span><h2>Code is not required here yet</h2><p>Some ideas should be understood before implementation. This is intentional.</p></section>;

  const copy = async () => {
    try {
      if (!lesson.code?.code) {
  return;
}

await navigator.clipboard.writeText(lesson.code.code);
      setCopied(true);
      globalThis.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return <div className="tool-stack">
    <section className="tool-hero"><span>CODE LAB · {lesson.code.language.toUpperCase()}</span><h2>Read the program like a machine</h2><p>First know the algorithm. Then ask what each line changes, creates or returns.</p></section>
    <section className="tool-card code-card"><div className="tool-row"><div><h2>Working example</h2><p>Do not copy and move on. Predict what should happen before running it.</p></div><button type="button" onClick={() => void copy()}>{copied ? "Copied ✓" : "Copy code"}</button></div><pre><code>{lesson.code.code}</code></pre><button type="button" className="notes-toggle" onClick={() => setNotesOpen((value) => !value)}>{notesOpen ? "Hide explanation" : "Show explanation"}</button>{notesOpen && <ol className="code-notes">{lesson.code.notes.map((note) => <li key={note}>{note}</li>)}</ol>}</section>
    <section className="tool-card challenge-card"><span>CHANGE SOMETHING</span><h2>Make the example yours</h2><p>Change one input, value, parameter or condition. Before running the code, write down what you expect to happen. Then compare your prediction with the result.</p></section>
  </div>;
}

export function DebugWorkshop({ lesson }: { lesson: AcademyLesson }) {
  const issues = lesson.debugging ?? lesson.commonErrors.map((error) => ({ symptom: error, possibleCause: "A mental model or implementation assumption does not match how the system actually works.", howToCheck: "Return to the inputs, expected output and the step where the behaviour first becomes different.", fix: "Change one assumption at a time and test again." }));

  return <div className="tool-stack">
    <section className="tool-hero"><span>DEBUGGING LAB</span><h2>Learn by finding what went wrong</h2><p>Strong learners do not avoid mistakes. They learn to locate the exact assumption that caused the mistake.</p></section>
    {issues.map((issue, index) => <section className="debug-card" key={`${issue.symptom}-${index}`}><span>CASE {index + 1}</span><h2>{issue.symptom}</h2><dl><div><dt>Possible cause</dt><dd>{issue.possibleCause}</dd></div><div><dt>How to check</dt><dd>{issue.howToCheck}</dd></div><div><dt>Fix</dt><dd>{issue.fix}</dd></div></dl></section>)}
  </div>;
}

export function ApplyWorkshop({ lesson }: { lesson: AcademyLesson }) {
  const applications = lesson.realWorldApplications ?? lesson.concepts.slice(0, 3).map((concept) => ({ title: concept.term, description: `Look for a real system where ${concept.term.toLowerCase()} helps transform an input into a useful decision, prediction or output.` }));
  return <div className="tool-stack">
    <section className="tool-hero"><span>REAL-WORLD CONNECTION</span><h2>Where this stops being theory</h2><p>A concept becomes durable when you can recognise where it appears outside the lesson.</p></section>
    <section className="application-grid">{applications.map((application) => <article key={application.title}><h3>{application.title}</h3><p>{application.description}</p><small>Ask: What is the input? What is being processed or learned? What is the output?</small></article>)}</section>
  </div>;
}

type PracticeProps = { lesson: AcademyLesson; practiceDone: boolean; teachBackDone: boolean; onPracticeDone: () => void; onTeachBackDone: () => void; };

export function PracticeWorkshop({ lesson, practiceDone, teachBackDone, onPracticeDone, onTeachBackDone }: PracticeProps) {
  const mentor = getMentorLesson(lesson);
  const [checks, setChecks] = useState<boolean[]>(lesson.practice.checkpoints.map(() => false));
  const [reflection, setReflection] = useState("");
  const allChecks = checks.every(Boolean);

  return <div className="tool-stack">
    <section className="tool-hero"><span>YOUR TURN</span><h2>Now you do the thinking</h2><p>{lesson.practice.prompt}</p></section>
    <section className="tool-card"><h2>Practice checklist</h2><p>Complete these deliberately. This is the bridge between reading and being able to work independently.</p><div className="practice-checklist">{lesson.practice.checkpoints.map((checkpoint, index) => <label key={checkpoint}><input type="checkbox" checked={checks[index] ?? false} onChange={(event) => setChecks((old) => old.map((value, itemIndex) => itemIndex === index ? event.target.checked : value))} /><span>{checkpoint}</span></label>)}</div><button type="button" className="tool-primary" disabled={!allChecks || practiceDone} onClick={onPracticeDone}>{practiceDone ? "Practice completed ✓" : "Complete practice checkpoint"}</button></section>
    <section className="tool-card teachback-card"><span>TEACH IT BACK</span><h2>If you can explain it, you own it</h2><p>{mentor.teachBackPrompt}</p><textarea value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder="Write your explanation here in your own words. Do not try to sound like a textbook." rows={8} /><button type="button" className="tool-primary" disabled={reflection.trim().length < 40 || teachBackDone} onClick={onTeachBackDone}>{teachBackDone ? "Teach-back completed ✓" : "Save teach-back checkpoint"}</button><small>Your answer stays in this browser. The checkpoint records that you practised explaining the idea.</small></section>
  </div>;
}
