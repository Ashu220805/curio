import { useMemo, useState } from "react";
import type { AcademyLesson } from "../../data/academy.ts";
import { getMentorLesson } from "../../data/academyMentor.ts";
import "./TeachingBlocks.css";

type Props = {
  lesson: AcademyLesson;
  onConceptReady: () => void;
  conceptReady: boolean;
};

export default function TeachingBlocks({ lesson, onConceptReady, conceptReady }: Props) {
  const mentor = useMemo(() => getMentorLesson(lesson), [lesson]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showFormal, setShowFormal] = useState(false);

  const choose = (index: number) => {
    setSelected(index);
    setShowAnswer(true);
    if (index === mentor.correctIndex) onConceptReady();
  };

  return (
    <div className="teach-stack">
      <section className="teach-opening">
        <span className="teach-eyebrow">START WITH A QUESTION</span>
        <h2>{mentor.openingQuestion}</h2>
        <p>Do not rush to a definition. First try to answer from your own experience.</p>
      </section>

      <section className="teach-section mentor-section">
        <div className="teach-section-heading">
          <span className="teach-step">01</span>
          <div><span className="teach-eyebrow">LET'S BUILD THE IDEA</span><h2>A mentor would start here</h2></div>
        </div>
        <p className="teach-body-large">{mentor.story}</p>
      </section>

      <section className="teach-section simple-section">
        <div className="teach-section-heading">
          <span className="teach-step">02</span>
          <div><span className="teach-eyebrow">IN SIMPLE WORDS</span><h2>What you should understand first</h2></div>
        </div>
        <p className="teach-body-large">{mentor.simpleExplanation}</p>
      </section>

      <section className="teach-section">
        <div className="teach-section-heading">
          <span className="teach-step">03</span>
          <div><span className="teach-eyebrow">BUILD THE VOCABULARY</span><h2>Name the ideas you already understand</h2></div>
        </div>
        <div className="teach-concepts">
          {lesson.concepts.map((concept, index) => (
            <article key={concept.term} className="teach-concept-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{concept.term}</h3>
              <p>{concept.definition}</p>
              <small>Ask yourself: “Can I explain this without repeating these exact words?”</small>
            </article>
          ))}
        </div>
      </section>

      <section className="teach-section think-section">
        <div className="teach-section-heading">
          <span className="teach-step">04</span>
          <div><span className="teach-eyebrow">STOP AND THINK</span><h2>{mentor.thinkQuestion}</h2></div>
        </div>
        <div className="teach-options">
          {mentor.thinkOptions.map((option, index) => {
            const isSelected = selected === index;
            const isCorrect = showAnswer && index === mentor.correctIndex;
            const isWrong = showAnswer && isSelected && index !== mentor.correctIndex;
            return <button type="button" key={`${option}-${index}`} className={`${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`} onClick={() => choose(index)}>{option}</button>;
          })}
        </div>
        {showAnswer && (
          <div className={`teach-feedback ${selected === mentor.correctIndex ? "success" : "retry"}`}>
            {selected === mentor.correctIndex ? "Correct. You have identified the central idea. The next layer will make that idea more precise." : "Not quite. Read the mentor explanation once more, then try to explain the distinction in your own words before choosing again."}
          </div>
        )}
      </section>

      <section className="teach-section visual-section">
        <div className="teach-section-heading">
          <span className="teach-step">05</span>
          <div><span className="teach-eyebrow">MENTAL MODEL</span><h2>See the process before studying the details</h2></div>
        </div>
        <div className="teach-flow">
          {(lesson.visualExplanation ?? lesson.mindMap).map((item, index) => (
            <div className="teach-flow-item" key={`${item}-${index}`}><b>{index + 1}</b><span>{item}</span>{index < (lesson.visualExplanation ?? lesson.mindMap).length - 1 && <i aria-hidden="true">↓</i>}</div>
          ))}
        </div>
        <p className="teach-bridge">{mentor.mentorBridge}</p>
      </section>

      <section className="teach-section formal-section">
        <button type="button" className="teach-disclosure" onClick={() => setShowFormal((value) => !value)}>
          <span><span className="teach-eyebrow">FORMAL LANGUAGE</span><strong>Now see the textbook-level version</strong></span>
          <span>{showFormal ? "−" : "+"}</span>
        </button>
        {showFormal && <div className="teach-formal-content"><p>{lesson.summary}</p><h3>Learning objectives</h3><ul>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></div>}
      </section>

      {conceptReady && <div className="teach-ready">✓ Concept checkpoint complete. You are ready for the next learning layer.</div>}
    </div>
  );
}
