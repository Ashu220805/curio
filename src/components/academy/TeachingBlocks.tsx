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
    if (index === mentor.correctIndex) {
      onConceptReady();
    }
  };

  const isCorrectChoice = selected === mentor.correctIndex;

  return (
    <div className="teach-stack">
      {/* OPENING HOOK */}
      <section className="teach-opening">
        <span className="teach-eyebrow">START WITH A QUESTION</span>
        <h2>{mentor.openingQuestion}</h2>
        <p>Do not rush to memorise definitions. First pause and think about what this problem requires from your own intuition.</p>
      </section>

      {/* STEP 1: MENTOR STORY */}
      <section className="teach-section mentor-section">
        <div className="teach-section-heading">
          <span className="teach-step">01</span>
          <div>
            <span className="teach-eyebrow">BUILD THE IDEA</span>
            <h2>A mentor would start here</h2>
          </div>
        </div>
        <p className="teach-body-large">{mentor.story}</p>
      </section>

      {/* STEP 2: SIMPLE EXPLANATION */}
      <section className="teach-section simple-section">
        <div className="teach-section-heading">
          <span className="teach-step">02</span>
          <div>
            <span className="teach-eyebrow">IN SIMPLE WORDS</span>
            <h2>What you should understand first</h2>
          </div>
        </div>
        <p className="teach-body-large">{mentor.simpleExplanation}</p>
      </section>

      {/* STEP 3: CONCEPT CARDS */}
      <section className="teach-section">
        <div className="teach-section-heading">
          <span className="teach-step">03</span>
          <div>
            <span className="teach-eyebrow">BUILD THE VOCABULARY</span>
            <h2>Name the ideas you now understand</h2>
          </div>
        </div>
        <div className="teach-concepts">
          {lesson.concepts.map((concept, index) => (
            <article key={concept.term} className="teach-concept-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{concept.term}</h3>
              <p>{concept.definition}</p>
              <small>Ask yourself: “Can I explain {concept.term} in my own words without repeating these exact words?”</small>
            </article>
          ))}
        </div>
      </section>

      {/* STEP 4: STOP AND THINK */}
      <section className="teach-section think-section">
        <div className="teach-section-heading">
          <span className="teach-step">04</span>
          <div>
            <span className="teach-eyebrow">STOP AND THINK</span>
            <h2>{mentor.thinkQuestion}</h2>
          </div>
        </div>
        <div className="teach-options" role="radiogroup" aria-label="Socratic question options">
          {mentor.thinkOptions.map((option, index) => {
            const isSelected = selected === index;
            const isCorrect = showAnswer && index === mentor.correctIndex;
            const isWrong = showAnswer && isSelected && index !== mentor.correctIndex;
            return (
              <button
                type="button"
                key={`${option}-${index}`}
                className={`teach-option-button ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                onClick={() => choose(index)}
              >
                <span className="option-badge">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
              </button>
            );
          })}
        </div>
        {showAnswer && (
          <div className={`teach-feedback ${isCorrectChoice ? "success" : "retry"}`}>
            {isCorrectChoice
              ? "✓ Correct. You have identified the core principle. The next layers will deepen this understanding through math, code, and practice."
              : "✕ Not quite. Re-read the mentor story above, then consider what distinction separates this concept from related ideas before trying again."}
          </div>
        )}
      </section>

      {/* STEP 5: VISUAL MENTAL MODEL */}
      <section className="teach-section visual-section">
        <div className="teach-section-heading">
          <span className="teach-step">05</span>
          <div>
            <span className="teach-eyebrow">MENTAL MODEL</span>
            <h2>See the process before studying the details</h2>
          </div>
        </div>
        <div className="teach-flow">
          {(lesson.visualExplanation ?? lesson.mindMap).map((item, index) => (
            <div className="teach-flow-item" key={`${item}-${index}`}>
              <b>{index + 1}</b>
              <span>{item}</span>
              {index < (lesson.visualExplanation ?? lesson.mindMap).length - 1 && <i aria-hidden="true">↓</i>}
            </div>
          ))}
        </div>
        <p className="teach-bridge">{mentor.mentorBridge}</p>
      </section>

      {/* STEP 6: FORMAL TEXTBOOK DISCLOSURE */}
      <section className="teach-section formal-section">
        <button
          type="button"
          className="teach-disclosure"
          onClick={() => setShowFormal((value) => !value)}
          aria-expanded={showFormal}
        >
          <span>
            <span className="teach-eyebrow">FORMAL SPECIFICATION</span>
            <strong>Read the textbook-level definition</strong>
          </span>
          <span className="teach-disclosure-icon">{showFormal ? "−" : "+"}</span>
        </button>
        {showFormal && (
          <div className="teach-formal-content">
            <p>{lesson.summary}</p>
            <h3>Learning Objectives</h3>
            <ul>
              {lesson.objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* CONCEPT CHECKPOINT COMPLETED NOTIFICATION */}
      {conceptReady && (
        <div className="teach-ready">
          ✓ Concept checkpoint complete! Proceed through the remaining workshops or practice layer to complete this lesson.
        </div>
      )}
    </div>
  );
}
