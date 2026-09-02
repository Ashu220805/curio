import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  academyLessons,
  academyModules,
  type AcademyLesson,
  type LessonDiagram,
} from "../../data/academy.ts";

import { useAcademyAccess } from "../../hooks/useAcademyAccess.ts";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.ts";

import "./Academy.css";

const PROGRESS_KEY = "curio_academy_progress_v4";
const FREE_PREVIEW_LESSONS = 3;

type View = "learn" | "map" | "recall" | "practice";

function readProgress(): number[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is number => Number.isInteger(item),
    );
  } catch {
    return [];
  }
}

function saveProgress(values: number[]) {
  try {
    const uniqueValues = [...new Set(values)].sort(
      (a, b) => a - b,
    );

    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify(uniqueValues),
    );
  } catch {
    // Progress is only local learning state.
    // It is never used for payment authorization.
  }
}

function Diagram({
  kind,
  nodes,
}: {
  kind: LessonDiagram;
  nodes: string[];
}) {
  if (kind === "neural") {
    return (
      <div
        className="academy-diagram neural-diagram"
        aria-label="Neural network diagram"
      >
        <div className="diagram-layer">
          <span>Input</span>
          <i />
          <i />
          <i />
        </div>

        <b>→</b>

        <div className="diagram-layer">
          <span>Hidden</span>
          <i />
          <i />
          <i />
          <i />
        </div>

        <b>→</b>

        <div className="diagram-layer">
          <span>Output</span>
          <i />
          <i />
        </div>
      </div>
    );
  }

  if (kind === "transformer") {
    const items = [
      "Tokens",
      "Embeddings",
      "Q · K · V",
      "Attention",
      "Output",
    ];

    return (
      <div className="academy-diagram pipeline-diagram">
        {items.map((item, index) => (
          <div
            key={item}
            className="pipeline-step"
          >
            <span>{item}</span>

            {index < items.length - 1 && <b>→</b>}
          </div>
        ))}
      </div>
    );
  }

  if (kind === "mlops") {
    const items = [
      "Data",
      "Train",
      "Evaluate",
      "Deploy",
      "Monitor",
      "Improve",
    ];

    return (
      <div className="academy-diagram pipeline-diagram">
        {items.map((item, index) => (
          <div
            key={item}
            className="pipeline-step"
          >
            <span>{item}</span>

            {index < items.length - 1 && <b>→</b>}
          </div>
        ))}
      </div>
    );
  }

  if (kind === "regression") {
    return (
      <div className="academy-diagram regression-diagram">
        <div className="regression-plot">
          <i className="axis-x" />
          <i className="axis-y" />
          <i className="fit-line" />

          <b className="dot dot-1" />
          <b className="dot dot-2" />
          <b className="dot dot-3" />
          <b className="dot dot-4" />
          <b className="dot dot-5" />
        </div>

        <p>
          Observed data → model estimate → prediction →
          residual / error
        </p>
      </div>
    );
  }

  const visibleNodes = nodes.slice(0, 8);

  return (
    <div className="academy-diagram pipeline-diagram">
      {visibleNodes.map((node, index) => (
        <div
          key={`${node}-${index}`}
          className="pipeline-step"
        >
          <span>{node}</span>

          {index < visibleNodes.length - 1 && <b>→</b>}
        </div>
      ))}
    </div>
  );
}

function MindMap({
  lesson,
}: {
  lesson: AcademyLesson;
}) {
  const nodes = lesson.mindMap.slice(0, 8);

  const getNode = (
    index: number,
    fallback: string,
  ) => nodes[index] ?? fallback;

  return (
    <section
      className="academy-mindmap"
      aria-label={`${lesson.title} concept map`}
    >
      <div className="mind-node">
        01 · {getNode(0, "Concept")}
      </div>

      <div className="mind-node">
        02 · {getNode(1, "Input")}
      </div>

      <div className="mind-node">
        03 · {getNode(2, "Process")}
      </div>

      <div className="mind-node">
        07 · {getNode(6, "Evaluate")}
      </div>

      <div className="mind-core">
        {lesson.title}
      </div>

      <div className="mind-node">
        04 · {getNode(3, "Model")}
      </div>

      <div className="mind-node">
        08 · {getNode(7, "Practice")}
      </div>

      <div className="mind-node">
        06 · {getNode(5, "Output")}
      </div>

      <div className="mind-node">
        05 · {getNode(4, "Error")}
      </div>
    </section>
  );
}

function CodeStudy({
  lesson,
}: {
  lesson: AcademyLesson;
}) {
  const [copied, setCopied] = useState(false);

  if (!lesson.code) {
    return null;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        lesson.code?.code ?? "",
      );

      setCopied(true);

      globalThis.setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="academy-panel academy-code-study">
      <div className="academy-panel-heading">
        <div>
          <span className="section-label">
            CODE WALKTHROUGH
          </span>

          <h3>
            Understand what every line is responsible for.
          </h3>

          <p>
            Do not treat code as a spell. Identify the
            input, transformation, output and possible
            failure.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void copy();
          }}
        >
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>

      <pre>
        <code>{lesson.code.code}</code>
      </pre>

      <ol className="code-notes">
        {lesson.code.notes.map((note) => (
          <li key={note}>
            {note}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Academy() {
  useDocumentMeta(
    "CURIO AI / ML Academy",
    "A structured AI and machine learning curriculum from foundations through machine learning, deep learning, language models and production systems.",
  );

  const [params] = useSearchParams();

  const requested = Number(
    params.get("lesson"),
  );

  const initialLesson =
    Number.isInteger(requested) &&
    requested >= 1 &&
    requested <= academyLessons.length
      ? requested
      : 1;

  const [selectedOrder, setSelectedOrder] =
    useState(initialLesson);

  const [view, setView] =
    useState<View>("learn");

  const [completed, setCompleted] =
    useState<number[]>(readProgress);

  const [query, setQuery] =
    useState("");

  const {
    accessStatus,
    membership,
    hasAcademyAccess,
    isLoading: membershipLoading,
  } = useAcademyAccess();

  useEffect(() => {
    if (
      Number.isInteger(requested) &&
      requested >= 1 &&
      requested <= academyLessons.length
    ) {
      setSelectedOrder(requested);
      setView("learn");
    }
  }, [requested]);

  useEffect(() => {
    saveProgress(completed);
  }, [completed]);

  const lesson =
    academyLessons.find(
      (item) => item.order === selectedOrder,
    ) ?? academyLessons[0];

  const completedCount =
    completed.length;

  const progress =
    academyLessons.length > 0
      ? Math.round(
          (completedCount /
            academyLessons.length) *
            100,
        )
      : 0;

  const highestPreview = Math.min(
    FREE_PREVIEW_LESSONS,
    Math.max(
      FREE_PREVIEW_LESSONS,
      ...completed.map(
        (item) => item + 1,
      ),
    ),
  );

  const highestAccessible =
    hasAcademyAccess
      ? academyLessons.length
      : highestPreview;

  const practiceUnlocked =
    completed.includes(lesson.order) &&
    (
      hasAcademyAccess ||
      lesson.order <= FREE_PREVIEW_LESSONS
    );

  const accessLabel =
    membershipLoading
      ? "Checking membership"
      : hasAcademyAccess
        ? "PRO MEMBER · Full Academy"
        : "Preview access · Upgrade for full Academy";

  const filteredModules = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    return academyModules
      .map((module) => ({
        ...module,

        lessons: module.lessons.filter(
          (item) => {
            if (!normalizedQuery) {
              return true;
            }

            return [
              item.title,
              item.summary,
              item.module,
              ...item.concepts.map(
                (concept) => concept.term,
              ),
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery);
          },
        ),
      }))
      .filter(
        (module) =>
          module.lessons.length > 0,
      );
  }, [query]);

  const selectLesson = (
    next: AcademyLesson,
  ) => {
    const locked =
      !hasAcademyAccess &&
      next.order > highestAccessible;

    if (locked) {
      return;
    }

    setSelectedOrder(next.order);
    setView("learn");

    globalThis.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const checkpoint = () => {
    setCompleted((current) => {
      if (
        current.includes(
          lesson.order,
        )
      ) {
        return current;
      }

      return [
        ...current,
        lesson.order,
      ];
    });
  };

  const move = (
    delta: number,
  ) => {
    const target =
      academyLessons.find(
        (item) =>
          item.order ===
          lesson.order + delta,
      );

    if (!target) {
      return;
    }

    const locked =
      !hasAcademyAccess &&
      target.order >
        highestAccessible;

    if (locked) {
      return;
    }

    selectLesson(target);
  };

  return (
    <main className="academy-shell">
      <header className="academy-topbar">
        <Link
          to="/academy"
          className="academy-brand"
          aria-label="CURIO AI ML Academy home"
        >
          <img
            src="/curio-symbol.png"
            alt=""
          />

          <span>CURIO</span>

          <small>
            AI / ML ACADEMY · PRO
          </small>
        </Link>

        <div className="academy-header-center">
          <span>
            {accessLabel}
          </span>

          <div
            className="academy-progress"
            aria-label={`${progress}% curriculum progress`}
          >
            <i
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <small>
            {completedCount} /{" "}
            {academyLessons.length}{" "}
            learning checkpoints
          </small>
        </div>

        <nav
          className="academy-nav"
          aria-label="Academy navigation"
        >
          <Link to="/dashboard">
            Dashboard
          </Link>

          {!hasAcademyAccess && (
            <Link
              className="academy-nav-cta"
              to="/academy/checkout"
            >
              Unlock PRO · ₹1
            </Link>
          )}
        </nav>
      </header>

      <section className="academy-hero">
        <div className="academy-hero-copy">
          <span className="academy-kicker">
            SERIAL CURRICULUM FOR AIML · AI ·
            DATA · COMPUTER ENGINEERING
          </span>

          <h1>
            Learn AI in dependency order —
            from foundations to systems.
          </h1>

          <p>
            Every lesson follows the same teaching
            sequence: definition, intuition,
            distinction, diagram, worked code,
            failure modes, recall and practice.
          </p>

          <div className="academy-hero-points">
            <span>
              Build fundamentals before libraries
            </span>

            <span>
              Differentiate similar concepts
            </span>

            <span>
              Practice after learning
            </span>
          </div>
        </div>

        <aside className="academy-pro-card">
          <span className="section-label">
            ACADEMY MEMBERSHIP
          </span>

          <h2>
            {hasAcademyAccess
              ? "Full curriculum is active."
              : "PRO curriculum is locked."}
          </h2>

          <p>
            {hasAcademyAccess
              ? "Your Academy entitlement is active. Learning progress and membership access remain separate."
              : `Preview the first ${FREE_PREVIEW_LESSONS} lessons, then unlock the complete structured curriculum.`}
          </p>

          <div className="pro-card-stats">
            <span>
              <b>
                {academyModules.length}
              </b>{" "}
              modules
            </span>

            <span>
              <b>
                {academyLessons.length}
              </b>{" "}
              lessons
            </span>

            <span>
              <b>₹1</b>{" "}
              current setup price
            </span>
          </div>

          {membership && (
            <p>
              Current plan:{" "}
              {membership.plan_name}
            </p>
          )}

          {!hasAcademyAccess && (
            <Link to="/academy/checkout">
              View PRO membership
            </Link>
          )}
        </aside>
      </section>

      {!hasAcademyAccess && (
        <section className="academy-preview-banner">
          <div>
            <strong>
              Preview mode is active.
            </strong>

            <span>
              Lessons 1–
              {FREE_PREVIEW_LESSONS} are
              available before upgrading.
            </span>
          </div>

          <Link to="/academy/checkout">
            Unlock complete Academy · ₹1
          </Link>
        </section>
      )}

      <div className="academy-workspace">
        <aside
          className="academy-curriculum"
          aria-label="Academy curriculum"
        >
          <div className="curriculum-head">
            <span className="section-label">
              CURRICULUM
            </span>

            <strong>
              {academyModules.length} modules ·{" "}
              {academyLessons.length} serial lessons
            </strong>

            <label>
              <span>
                Find a topic
              </span>

              <input
                value={query}
                onChange={(event) => {
                  setQuery(
                    event.target.value,
                  );
                }}
                placeholder="Python, regression, attention..."
              />
            </label>
          </div>

          <div className="curriculum-list">
            {filteredModules.map(
              (module) => (
                <section
                  key={module.id}
                  className="curriculum-module"
                >
                  <div className="module-title">
                    <span>
                      {module.number}
                    </span>

                    <div>
                      <strong>
                        {module.title}
                      </strong>

                      <small>
                        {module.description}
                      </small>
                    </div>
                  </div>

                  {module.lessons.map(
                    (item) => {
                      const locked =
                        !hasAcademyAccess &&
                        item.order >
                          highestAccessible;

                      const done =
                        completed.includes(
                          item.order,
                        );

                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={locked}
                          onClick={() => {
                            selectLesson(
                              item,
                            );
                          }}
                          className={[
                            "curriculum-lesson",
                            selectedOrder ===
                            item.order
                              ? "is-active"
                              : "",
                            locked
                              ? "is-locked"
                              : "",
                          ].join(" ")}
                          aria-current={
                            selectedOrder ===
                            item.order
                              ? "page"
                              : undefined
                          }
                        >
                          <span className="lesson-state">
                            {done
                              ? "✓"
                              : locked
                                ? "PRO"
                                : String(
                                    item.order,
                                  ).padStart(
                                    2,
                                    "0",
                                  )}
                          </span>

                          <div>
                            <strong>
                              {item.title}
                            </strong>

                            <small>
                              {item.level} ·{" "}
                              {item.duration}
                            </small>
                          </div>
                        </button>
                      );
                    },
                  )}
                </section>
              ),
            )}
          </div>
        </aside>

        <section className="academy-content">
          <div className="lesson-crumb">
            <span>
              {lesson.module}
            </span>

            <span>
              Lesson{" "}
              {String(
                lesson.order,
              ).padStart(2, "0")}{" "}
              of {academyLessons.length}
            </span>

            <span>
              {lesson.level}
            </span>
          </div>

          <article className="lesson-hero-card">
            <div>
              <span className="academy-kicker">
                CURRENT LESSON
              </span>

              <h2>
                {lesson.title}
              </h2>

              <p>
                {lesson.summary}
              </p>

              <div
                className="lesson-actions"
                role="tablist"
                aria-label="Lesson views"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={
                    view === "learn"
                  }
                  className={
                    view === "learn"
                      ? "is-current"
                      : ""
                  }
                  onClick={() =>
                    setView("learn")
                  }
                >
                  Learn
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={
                    view === "map"
                  }
                  className={
                    view === "map"
                      ? "is-current"
                      : ""
                  }
                  onClick={() =>
                    setView("map")
                  }
                >
                  Concept map
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={
                    view === "recall"
                  }
                  className={
                    view === "recall"
                      ? "is-current"
                      : ""
                  }
                  onClick={() =>
                    setView("recall")
                  }
                >
                  Active recall
                </button>

                <button
                  type="button"
                  role="tab"
                  disabled={
                    !practiceUnlocked
                  }
                  aria-selected={
                    view === "practice"
                  }
                  className={
                    view === "practice"
                      ? "is-current"
                      : ""
                  }
                  onClick={() =>
                    setView("practice")
                  }
                >
                  {practiceUnlocked
                    ? "Practice"
                    : "Practice · after checkpoint"}
                </button>
              </div>
            </div>

            <div className="lesson-status">
              <span>
                {completed.includes(
                  lesson.order,
                )
                  ? "Checkpoint saved"
                  : "Learning"}
              </span>

              <strong>
                {lesson.duration}
              </strong>
            </div>
          </article>

          {view === "learn" && (
            <div className="lesson-view">
              <section className="academy-panel lesson-why">
                <span className="section-label">
                  WHY THIS LESSON MATTERS
                </span>

                <p>
                  {lesson.why}
                </p>
              </section>

              <section className="academy-panel lesson-objectives">
                <span className="section-label">
                  BY THE END, YOU SHOULD BE ABLE TO
                </span>

                <div>
                  {lesson.objectives.map(
                    (objective) => (
                      <p
                        key={
                          objective
                        }
                      >
                        ✓ {objective}
                      </p>
                    ),
                  )}
                </div>
              </section>

              <section className="academy-panel">
                <div className="academy-panel-heading">
                  <div>
                    <span className="section-label">
                      MENTAL MODEL
                    </span>

                    <h3>
                      See the relationship before
                      writing the implementation.
                    </h3>
                  </div>
                </div>

                <Diagram
                  kind={lesson.diagram}
                  nodes={lesson.mindMap}
                />
              </section>

              <section className="concept-definition-grid">
                <div className="section-title">
                  <span className="section-label">
                    CORE DEFINITIONS
                  </span>

                  <h3>
                    Definition first. Distinction
                    second. Application third.
                  </h3>

                  <p>
                    These concepts form the vocabulary
                    required to reason about the lesson.
                  </p>
                </div>

                {lesson.concepts.map(
                  (concept) => (
                    <article
                      key={
                        concept.term
                      }
                    >
                      <strong>
                        {concept.term}
                      </strong>

                      <p>
                        {
                          concept.definition
                        }
                      </p>
                    </article>
                  ),
                )}
              </section>

              <CodeStudy
                lesson={lesson}
              />

              <section className="lesson-errors">
                <span className="section-label">
                  COMMON ERRORS AND MISCONCEPTIONS
                </span>

                {lesson.commonErrors.map(
                  (
                    error,
                    index,
                  ) => (
                    <div key={error}>
                      <b>
                        {String(
                          index + 1,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </b>

                      <p>
                        {error}
                      </p>
                    </div>
                  ),
                )}
              </section>

              <section className="learning-checkpoint">
                <div>
                  <span className="section-label">
                    LEARNING CHECKPOINT
                  </span>

                  <h3>
                    Save this checkpoint when you can
                    explain the idea without copying the
                    page.
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={
                    checkpoint
                  }
                >
                  {completed.includes(
                    lesson.order,
                  )
                    ? "Checkpoint saved"
                    : "Save learning checkpoint"}
                </button>
              </section>
            </div>
          )}

          {view === "map" && (
            <section className="academy-panel mindmap-view">
              <span className="section-label">
                VISIBLE CONCEPT MAP
              </span>

              <h3>
                Connections remain readable at every
                screen size.
              </h3>

              <p>
                The map uses a stable grid layout so
                concepts remain visible without text
                overlap.
              </p>

              <MindMap
                lesson={lesson}
              />
            </section>
          )}

          {view === "recall" && (
            <section className="academy-panel recall-view">
              <span className="section-label">
                ACTIVE RECALL
              </span>

              <h3>
                Try to answer before opening the
                explanation.
              </h3>

              {lesson.concepts.map(
                (
                  concept,
                  index,
                ) => (
                  <details
                    key={
                      concept.term
                    }
                  >
                    <summary>
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        "0",
                      )}
                      . Define{" "}
                      {concept.term} in your own words.
                    </summary>

                    <p>
                      {
                        concept.definition
                      }
                    </p>
                  </details>
                ),
              )}

              <button
                type="button"
                onClick={
                  checkpoint
                }
              >
                I can explain this lesson
              </button>
            </section>
          )}

          {view === "practice" && (
            <section className="academy-panel practice-view">
              <span className="section-label">
                PRACTICE · UNLOCKED BY LEARNING
              </span>

              <h3>
                {
                  lesson.practice
                    .prompt
                }
              </h3>

              <textarea
                aria-label="Practice answer"
                rows={10}
                placeholder="Write your reasoning here. Explain your assumptions, steps and conclusion."
              />

              <div className="practice-checkpoints">
                <strong>
                  Self-check before moving on
                </strong>

                {lesson.practice.checkpoints.map(
                  (
                    checkpointText,
                  ) => (
                    <label
                      key={
                        checkpointText
                      }
                    >
                      <input type="checkbox" />

                      {" "}
                      {
                        checkpointText
                      }
                    </label>
                  ),
                )}
              </div>

              <button
                type="button"
                onClick={
                  checkpoint
                }
              >
                Save practice checkpoint
              </button>
            </section>
          )}

          <footer className="academy-lesson-footer">
            <button
              type="button"
              disabled={
                lesson.order === 1
              }
              onClick={() =>
                move(-1)
              }
            >
              ← Previous
            </button>

            <span>
              Lesson {lesson.order} /{" "}
              {academyLessons.length}
            </span>

            <button
              type="button"
              disabled={
                lesson.order >=
                  highestAccessible ||
                lesson.order ===
                  academyLessons.length
              }
              onClick={() =>
                move(1)
              }
            >
              Next →
            </button>
          </footer>

          {accessStatus && (
            <span
              className="academy-access-status"
              hidden
            >
              {accessStatus}
            </span>
          )}
        </section>
      </div>
    </main>
  );
}