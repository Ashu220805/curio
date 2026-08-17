import { useState } from "react";
import "./Reality.css";

type TopicId =
  | "foundation"
  | "ai-human"
  | "images"
  | "video"
  | "audio"
  | "text"
  | "verify"
  | "case-lab";

type Topic = {
  id: TopicId;
  number: string;
  icon: string;
  title: string;
  subtitle: string;
};

type Scenario = {
  id: number;
  icon: string;
  title: string;
  situation: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const topics: Topic[] = [
  {
    id: "foundation",
    number: "01",
    icon: "🧠",
    title: "Reality Foundations",
    subtitle: "Why seeing is no longer enough.",
  },
  {
    id: "ai-human",
    number: "02",
    icon: "⚖️",
    title: "AI vs Human",
    subtitle: "Separate origin from truth.",
  },
  {
    id: "images",
    number: "03",
    icon: "🖼️",
    title: "AI Images",
    subtitle: "Investigate visual evidence.",
  },
  {
    id: "video",
    number: "04",
    icon: "🎬",
    title: "AI Video",
    subtitle: "Understand edits and deepfakes.",
  },
  {
    id: "audio",
    number: "05",
    icon: "🎙️",
    title: "AI Voice",
    subtitle: "A familiar voice is not proof.",
  },
  {
    id: "text",
    number: "06",
    icon: "✍️",
    title: "AI Text",
    subtitle: "Fluent does not mean factual.",
  },
  {
    id: "verify",
    number: "07",
    icon: "🔎",
    title: "Verify Before Trust",
    subtitle: "Turn suspicion into a process.",
  },
  {
    id: "case-lab",
    number: "08",
    icon: "🧪",
    title: "Reality Case Lab",
    subtitle: "Apply everything to real situations.",
  },
];

const scenarios: Scenario[] = [
  {
    id: 1,
    icon: "📱",
    title: "The ₹50,000 scholarship message",
    situation:
      "At 9:00 AM you receive a message saying: “BREAKING: The government has launched a ₹50,000 scholarship. Apply immediately using this link.” It has a familiar-looking logo.",
    question: "What should your first move be?",
    options: [
      "Forward it because the logo looks official.",
      "Ask an AI whether the message is real.",
      "Pause and verify the claim through an official source.",
      "Click the link first and inspect the form.",
    ],
    answer: 2,
    explanation:
      "The strongest first move is independent verification. A logo, polished wording or an AI opinion does not authenticate a claim. Find the official announcement and compare the details before acting.",
  },
  {
    id: 2,
    icon: "🎙️",
    title: "A familiar voice asks for money",
    situation:
      "You receive a voice note that sounds exactly like a family member asking you to send money urgently.",
    question: "Which response is strongest?",
    options: [
      "Send the money because you recognise the voice.",
      "Call the person using a trusted number or channel.",
      "Replay the recording several times.",
      "Assume every voice note is fake.",
    ],
    answer: 1,
    explanation:
      "Voice cloning can imitate a familiar person. A second trusted channel provides stronger authentication than the sound of the voice itself.",
  },
  {
    id: 3,
    icon: "🖼️",
    title: "A dramatic viral photograph",
    situation:
      "A photograph claims to show a major event that happened today. Thousands of people are sharing it.",
    question: "What combination gives you stronger evidence?",
    options: [
      "Zoom in until you find one strange hand.",
      "Check the original source, date, location and independent reporting.",
      "Count how many people have shared it.",
      "Use one AI detector and accept its verdict.",
    ],
    answer: 1,
    explanation:
      "Virality is not evidence. A stronger investigation combines provenance, context and independent confirmation instead of relying on one visual clue or one detector.",
  },
  {
    id: 4,
    icon: "🤖",
    title: "A confident AI answer",
    situation:
      "An AI assistant gives you a polished answer containing a precise statistic and a citation.",
    question: "What should you do before using the statistic?",
    options: [
      "Trust it because the answer sounds confident.",
      "Check whether the source actually supports the statistic.",
      "Ask the same AI the question again.",
      "Assume citations are always genuine.",
    ],
    answer: 1,
    explanation:
      "AI systems can produce plausible but unsupported claims and citations. Verification means opening the underlying source and checking what it actually says.",
  },
];

const mediaComparison = [
  {
    medium: "Image",
    clue: "Odd structures, text or inconsistent lighting",
    stronger: "Original source + date + context + independent confirmation",
  },
  {
    medium: "Video",
    clue: "Audio/visual mismatch or suspicious editing",
    stronger: "Original upload + surrounding context + reliable reporting",
  },
  {
    medium: "Voice",
    clue: "Unusual rhythm or artificial-sounding artefacts",
    stronger: "Verify through another trusted communication channel",
  },
  {
    medium: "Text",
    clue: "Unsupported details or fabricated citations",
    stronger: "Open the underlying sources and verify the claims",
  },
];

const matchItems = [
  {
    id: "A",
    label: "Provenance",
    description: "Where did this content originally come from?",
    answer: "source",
  },
  {
    id: "B",
    label: "Context",
    description: "When, where and why was it created or shared?",
    answer: "context",
  },
  {
    id: "C",
    label: "Evidence",
    description: "What independent information supports the claim?",
    answer: "evidence",
  },
  {
    id: "D",
    label: "Action",
    description: "What should you do if the evidence is insufficient?",
    answer: "pause",
  },
];

const matchOptions = [
  {
    value: "source",
    label: "Find the original source",
  },
  {
    value: "context",
    label: "Check time, place and surrounding context",
  },
  {
    value: "evidence",
    label: "Cross-check with independent evidence",
  },
  {
    value: "pause",
    label: "Pause instead of sharing or acting",
  },
];

function RealityCheck() {
  const [activeTopic, setActiveTopic] =
    useState<TopicId>("foundation");

  const [showMenu, setShowMenu] = useState(false);

  const [completedTopics, setCompletedTopics] =
    useState<TopicId[]>([]);

  const [scenarioIndex, setScenarioIndex] = useState(0);

  const [scenarioAnswer, setScenarioAnswer] =
    useState<number | null>(null);

  const [matchAnswers, setMatchAnswers] =
    useState<Record<string, string>>({});

  const [matchChecked, setMatchChecked] =
    useState(false);

  const currentTopic =
    topics.find((topic) => topic.id === activeTopic) ?? topics[0];

  const currentScenario = scenarios[scenarioIndex];

  const progress = Math.round(
    (completedTopics.length / topics.length) * 100
  );

  const activeTopicIndex = topics.findIndex(
    (topic) => topic.id === activeTopic
  );

  const goToTopic = (topicId: TopicId) => {
    setActiveTopic(topicId);
    setShowMenu(false);
    setScenarioAnswer(null);
    setMatchChecked(false);

    window.setTimeout(() => {
      document
        .querySelector(".reality-content")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 0);
  };

  const markComplete = () => {
    setCompletedTopics((previous) =>
      previous.includes(activeTopic)
        ? previous
        : [...previous, activeTopic]
    );
  };

  const completeAndGo = (topicId: TopicId) => {
    markComplete();
    goToTopic(topicId);
  };

  const handleScenarioAnswer = (index: number) => {
    if (scenarioAnswer !== null) return;

    setScenarioAnswer(index);
  };

  const nextScenario = () => {
    setScenarioAnswer(null);

    setScenarioIndex((previous) =>
      (previous + 1) % scenarios.length
    );
  };

  const setMatchValue = (
    id: string,
    value: string
  ) => {
    setMatchAnswers((previous) => ({
      ...previous,
      [id]: value,
    }));

    setMatchChecked(false);
  };

  const correctMatches = matchItems.filter(
    (item) => matchAnswers[item.id] === item.answer
  ).length;

  return (
    <div className="reality-page">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="reality-header">
        <div className="reality-brand">
          <img
            src="/curio-symbol.png"
            alt="CURIO"
            className="reality-brand-logo"
          />

          <div className="reality-brand-copy">
            <div className="reality-brand-name">
              CURIO
            </div>

            <div className="reality-brand-subtitle">
              Reality Check
              <span> · </span>
              Digital Reality Literacy
            </div>
          </div>
        </div>

        <div className="reality-header-center">
          <span>AI THINKING SKILL</span>
          <strong>{progress}%</strong>

          <div className="reality-header-progress-track">
            <span
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <button
          type="button"
          className="reality-menu-button"
          onClick={() =>
            setShowMenu((previous) => !previous)
          }
          aria-label="Open Reality Check learning map"
          aria-expanded={showMenu}
        >
          ☰
        </button>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="reality-hero">
        <div className="reality-hero-inner">
          <div className="reality-hero-copy">
            <div className="reality-eyebrow">
              <span>🛡️</span>
              DIGITAL REALITY LITERACY
            </div>

            <h1>
              Seeing is no longer
              <span> enough.</span>
            </h1>

            <p className="reality-hero-description">
              AI can now generate images, videos, voices and
              text that look convincing. At the same time,
              human-created content can be edited, cropped,
              manipulated or presented without its original
              context.
            </p>

            <div className="reality-hero-teaching">
              <div className="reality-hero-teaching-icon">
                💡
              </div>

              <div>
                <strong>
                  Reality Check is not about distrusting
                  everything.
                </strong>

                <p>
                  It teaches you a better habit:
                  <b> pause → investigate → verify → decide.</b>
                </p>
              </div>
            </div>

            <div className="reality-hero-actions">
              <button
                type="button"
                className="reality-primary-button"
                onClick={() =>
                  goToTopic("foundation")
                }
              >
                Start the journey
                <span>→</span>
              </button>

              <div className="reality-confidence-note">
                <span>●</span>
                Question first. Verify second.
              </div>
            </div>
          </div>

          <div
            className="reality-hero-visual"
            aria-hidden="true"
          >
            <div className="reality-orbit reality-orbit-one" />
            <div className="reality-orbit reality-orbit-two" />

            <div className="reality-hero-glow" />

            <div className="reality-hero-brain">
              🧠
            </div>

            <div className="reality-floating-card reality-floating-card-top">
              <span>01</span>
              <strong>PAUSE</strong>
              <small>Don't react yet.</small>
            </div>

            <div className="reality-floating-card reality-floating-card-right">
              <span>02</span>
              <strong>VERIFY</strong>
              <small>Find evidence.</small>
            </div>

            <div className="reality-floating-card reality-floating-card-bottom">
              <span>03</span>
              <strong>DECIDE</strong>
              <small>Act on evidence.</small>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN
      ====================================================== */}
      <main className="reality-layout">
        {/* ===================================================
            SIDEBAR
        ==================================================== */}
        <aside
          className={`reality-topics ${
            showMenu
              ? "reality-topics-open"
              : ""
          }`}
        >
          <div className="reality-topics-header">
            <span>LEARNING MAP</span>

            <strong>
              From suspicion
              <br />
              to evidence.
            </strong>

            <small>
              8 chapters · learn by thinking,
              not memorising.
            </small>
          </div>

          <nav
            className="reality-topic-list"
            aria-label="Reality Check lessons"
          >
            {topics.map((topic) => {
              const isActive =
                activeTopic === topic.id;

              const isComplete =
                completedTopics.includes(topic.id);

              return (
                <button
                  key={topic.id}
                  type="button"
                  className={`reality-topic ${
                    isActive
                      ? "reality-topic-active"
                      : ""
                  } ${
                    isComplete
                      ? "reality-topic-complete"
                      : ""
                  }`}
                  onClick={() =>
                    goToTopic(topic.id)
                  }
                >
                  <span className="reality-topic-number">
                    {topic.number}
                  </span>

                  <span className="reality-topic-icon">
                    {topic.icon}
                  </span>

                  <span className="reality-topic-text">
                    <strong>{topic.title}</strong>
                    <small>{topic.subtitle}</small>
                  </span>

                  <span className="reality-topic-status">
                    {isComplete
                      ? "✓"
                      : isActive
                        ? "→"
                        : ""}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="reality-progress-box">
            <div className="reality-progress-top">
              <span>YOUR PROGRESS</span>
              <strong>{progress}%</strong>
            </div>

            <div className="reality-progress-track">
              <span
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p>
              Complete a chapter when you understand
              the idea and can explain it in your own
              words.
            </p>
          </div>

          <div className="reality-sidebar-tip">
            <span>💡</span>

            <div>
              <strong>CURIO RULE</strong>
              <p>
                Looks real ≠ is real.
              </p>
            </div>
          </div>
        </aside>

        {/* ===================================================
            CONTENT
        ==================================================== */}
        <section className="reality-content">
          {/* CURRENT CHAPTER */}
          <div className="reality-current-chapter">
            <div>
              <span>CURRENT CHAPTER</span>

              <strong>
                {currentTopic.number}
                {" · "}
                {currentTopic.title}
              </strong>
            </div>

            <div className="reality-current-progress">
              <span>
                {completedTopics.includes(activeTopic)
                  ? "Complete"
                  : "In progress"}
              </span>

              <div>
                <span
                  style={{
                    width: completedTopics.includes(
                      activeTopic
                    )
                      ? "100%"
                      : "28%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* =================================================
              01 FOUNDATION
          ================================================== */}
          {activeTopic === "foundation" && (
            <section className="reality-section">
              <div className="reality-section-heading">
                <span className="reality-section-label">
                  01 · FOUNDATION
                </span>

                <h2>
                  Before you detect AI,
                  <span>
                    {" "}
                    learn to question your first
                    impression.
                  </span>
                </h2>

                <p>
                  Your first impression is useful, but
                  it should not always be your final
                  decision. Digital reality literacy
                  begins when you learn to separate
                  <strong> appearance</strong> from
                  <strong> evidence</strong>.
                </p>
              </div>

              <div className="reality-big-principle">
                <div className="reality-big-principle-icon">
                  👁️
                </div>

                <div>
                  <span>THE CORE IDEA</span>

                  <h3>
                    “Looks real” is not the same
                    as “is real.”
                  </h3>

                  <p>
                    A convincing appearance tells you
                    what something looks or sounds like.
                    It does not automatically tell you
                    who created it, when it was created,
                    whether it was edited, or whether
                    the claim attached to it is true.
                  </p>
                </div>
              </div>

              <div className="reality-learning-grid">
                <article className="reality-learning-card">
                  <div>👀</div>
                  <h3>Appearance</h3>
                  <p>
                    Your brain makes quick judgments
                    from familiar patterns. That is
                    useful for everyday life, but speed
                    can sometimes create false
                    confidence.
                  </p>
                </article>

                <article className="reality-learning-card">
                  <div>🧩</div>
                  <h3>Manipulation</h3>
                  <p>
                    Content can be generated, edited,
                    cropped, rearranged, translated or
                    removed from its original context.
                  </p>
                </article>

                <article className="reality-learning-card">
                  <div>🌐</div>
                  <h3>Context</h3>
                  <p>
                    Source, date, location, surrounding
                    events and original publication can
                    completely change the meaning of
                    the same media.
                  </p>
                </article>

                <article className="reality-learning-card">
                  <div>🔎</div>
                  <h3>Evidence</h3>
                  <p>
                    Strong decisions come from multiple
                    independent signals, not one strange
                    detail or one detector score.
                  </p>
                </article>
              </div>

              <div className="reality-process-card">
                <div className="reality-card-label">
                  THE CURIO METHOD
                </div>

                <h3>
                  Use this five-step loop whenever
                  something important reaches you.
                </h3>

                <div className="reality-process">
                  {[
                    [
                      "01",
                      "PAUSE",
                      "Slow down before sharing or acting.",
                    ],
                    [
                      "02",
                      "OBSERVE",
                      "Notice clues without jumping to a verdict.",
                    ],
                    [
                      "03",
                      "SOURCE",
                      "Find where the content originated.",
                    ],
                    [
                      "04",
                      "CROSS-CHECK",
                      "Compare independent evidence.",
                    ],
                    [
                      "05",
                      "DECIDE",
                      "Act only when the evidence is sufficient.",
                    ],
                  ].map(
                    ([number, title, text]) => (
                      <div
                        className="reality-process-step"
                        key={number}
                      >
                        <span>{number}</span>
                        <strong>{title}</strong>
                        <p>{text}</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="reality-teaching-example">
                <div className="reality-card-label">
                  SIMPLE EXAMPLE
                </div>

                <h3>
                  “Everyone is sharing it” is not
                  evidence that it is true.
                </h3>

                <p>
                  Imagine a message claims that a new
                  government scholarship has opened.
                  Ten thousand people have forwarded it.
                  That tells you the message is popular.
                  It does not tell you that the
                  scholarship exists.
                </p>

                <div className="reality-example-rule">
                  <span>POPULARITY</span>
                  <strong>≠</strong>
                  <span>PROOF</span>
                </div>
              </div>

              <button
                type="button"
                className="reality-primary-action"
                onClick={() =>
                  completeAndGo("ai-human")
                }
              >
                I understand the foundation
                <span>→</span>
              </button>
            </section>
          )}

          {/* =================================================
              02 AI VS HUMAN
          ================================================== */}
          {activeTopic === "ai-human" && (
            <section className="reality-section">
              <div className="reality-section-heading">
                <span className="reality-section-label">
                  02 · AI VS HUMAN
                </span>

                <h2>
                  Origin and truth are
                  <span>
                    {" "}
                    different questions.
                  </span>
                </h2>

                <p>
                  Do not make the mistake of thinking
                  “human-made = true” or
                  “AI-made = false”. Instead ask what
                  claim the content is actually making
                  and what evidence supports it.
                </p>
              </div>

              <div className="reality-two-column">
                <article className="reality-compare-card human">
                  <div className="reality-compare-badge">
                    👤 HUMAN-CREATED
                  </div>

                  <h3>
                    Human origin does not guarantee
                    truth.
                  </h3>

                  <ul>
                    <li>
                      A human can make an honest
                      mistake.
                    </li>
                    <li>
                      A human can crop or edit genuine
                      media.
                    </li>
                    <li>
                      A real photograph can receive a
                      false caption.
                    </li>
                    <li>
                      A genuine recording can be shown
                      out of context.
                    </li>
                  </ul>
                </article>

                <article className="reality-compare-card ai">
                  <div className="reality-compare-badge">
                    🤖 AI-GENERATED
                  </div>

                  <h3>
                    AI origin does not automatically
                    mean false.
                  </h3>

                  <ul>
                    <li>
                      AI can create fictional or
                      illustrative material.
                    </li>
                    <li>
                      AI can assist with genuine
                      communication or design.
                    </li>
                    <li>
                      AI-generated media can be clearly
                      labelled.
                    </li>
                    <li>
                      The important question is what
                      claim it supports.
                    </li>
                  </ul>
                </article>
              </div>

              <div className="reality-table-card">
                <div className="reality-card-label">
                  COMPARE
                </div>

                <h3>
                  What should you actually examine?
                </h3>

                <div className="reality-table-wrap">
                  <table className="reality-table">
                    <thead>
                      <tr>
                        <th>Medium</th>
                        <th>Possible clue</th>
                        <th>Stronger verification</th>
                      </tr>
                    </thead>

                    <tbody>
                      {mediaComparison.map(
                        (row) => (
                          <tr key={row.medium}>
                            <td>
                              <strong>
                                {row.medium}
                              </strong>
                            </td>

                            <td>{row.clue}</td>

                            <td>{row.stronger}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="reality-highlight">
                <span>💡</span>

                <div>
                  <strong>
                    A detector is evidence, not a
                    judge.
                  </strong>

                  <p>
                    Automated detection systems can
                    produce false positives and false
                    negatives. Treat a detector result
                    as one signal inside a larger
                    investigation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="reality-primary-action"
                onClick={() =>
                  completeAndGo("images")
                }
              >
                Continue to AI Images
                <span>→</span>
              </button>
            </section>
          )}

          {/* =================================================
              03 IMAGES
          ================================================== */}
          {activeTopic === "images" && (
            <section className="reality-section">
              <div className="reality-section-heading">
                <span className="reality-section-label">
                  03 · IMAGE INVESTIGATION
                </span>

                <h2>
                  Train your eyes —
                  <span>
                    {" "}
                    but do not stop at your eyes.
                  </span>
                </h2>

                <p>
                  Images can contain clues. The real
                  skill is knowing what to investigate
                  after you notice something unusual.
                </p>
              </div>

              <div className="reality-image-investigation">
                <div className="reality-image-scene">
                  <div className="reality-scene-sun">
                    ☀️
                  </div>

                  <div className="reality-scene-person">
                    🧑‍💼
                  </div>

                  <div className="reality-scene-building">
                    <span>OPEN</span>
                    <strong>TODAY</strong>
                  </div>

                  <div className="reality-scene-ground" />

                  <div className="reality-scene-label label-one">
                    ✋ Hands
                  </div>

                  <div className="reality-scene-label label-two">
                    🔤 Text
                  </div>

                  <div className="reality-scene-label label-three">
                    🌤️ Shadows
                  </div>
                </div>

                <div className="reality-investigation-panel">
                  <div className="reality-card-label">
                    INVESTIGATION CHECKLIST
                  </div>

                  <h3>
                    Notice → question → verify
                  </h3>

                  <div className="reality-check-list">
                    <div>
                      <span>01</span>

                      <strong>
                        Objects & hands
                      </strong>

                      <p>
                        Do relationships between
                        objects make physical sense?
                      </p>
                    </div>

                    <div>
                      <span>02</span>

                      <strong>
                        Text & signs
                      </strong>

                      <p>
                        Does the writing match the
                        language, place and environment?
                      </p>
                    </div>

                    <div>
                      <span>03</span>

                      <strong>
                        Lighting & shadows
                      </strong>

                      <p>
                        Do light direction and shadows
                        behave consistently?
                      </p>
                    </div>

                    <div>
                      <span>04</span>

                      <strong>
                        Source & context
                      </strong>

                      <p>
                        Where was the image first
                        published and what was the
                        original claim?
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="reality-example-box">
                <span className="reality-example-icon">
                  🧪
                </span>

                <div>
                  <div className="reality-card-label">
                    TRY THIS
                  </div>

                  <h3>
                    A strange hand is a clue — not
                    a verdict.
                  </h3>

                  <p>
                    If you notice an impossible-looking
                    hand, pause there. Do not immediately
                    announce “AI!”. Ask what the
                    original source says, whether
                    another photograph of the same
                    event exists, and whether independent
                    reporting supports the claim.
                  </p>

                  <div className="reality-example-rule">
                    One clue
                    <strong>→</strong>
                    investigation
                    <strong>→</strong>
                    stronger evidence
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="reality-primary-action"
                onClick={() =>
                  completeAndGo("video")
                }
              >
                Continue to AI Video
                <span>→</span>
              </button>
            </section>
          )}

          {/* =================================================
              04 VIDEO
          ================================================== */}
          {activeTopic === "video" && (
            <section className="reality-section">
              <div className="reality-section-heading">
                <span className="reality-section-label">
                  04 · VIDEO & DEEPFAKES
                </span>

                <h2>
                  A video can be genuine,
                  <span>
                    {" "}
                    edited, synthetic or
                    miscaptioned.
                  </span>
                </h2>

                <p>
                  Motion feels powerful because it seems
                  to provide more evidence than a still
                  image. But video can still be clipped,
                  rearranged, dubbed, altered or shown
                  with a false context.
                </p>
              </div>

              <div className="reality-video-demo">
                <div className="reality-video-screen">
                  <div className="reality-video-topbar">
                    <span>●</span>
                    VIRAL CLIP · 00:17
                  </div>

                  <div className="reality-video-face">
                    🙂
                  </div>

                  <div className="reality-video-caption">
                    “You won't believe what happened
                    today...”
                  </div>

                  <div className="reality-video-timeline">
                    <span />
                  </div>
                </div>

                <div className="reality-video-side">
                  <div className="reality-card-label">
                    FOUR QUESTIONS
                  </div>

                  <h3>
                    Do not investigate only the face.
                  </h3>

                  <div className="reality-number-list">
                    <div>
                      <span>1</span>

                      <p>
                        <strong>Original?</strong>
                        Can you find the full,
                        original video?
                      </p>
                    </div>

                    <div>
                      <span>2</span>

                      <p>
                        <strong>Context?</strong>
                        What happened before and
                        after the clip?
                      </p>
                    </div>

                    <div>
                      <span>3</span>

                      <p>
                        <strong>Audio?</strong>
                        Does the sound match the
                        scene and source?
                      </p>
                    </div>

                    <div>
                      <span>4</span>

                      <p>
                        <strong>Independent?</strong>
                        Does reliable reporting support
                        the claim?
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="reality-warning-box">
                <span>⚠️</span>

                <div>
                  <strong>
                    Deepfake does not mean “find one
                    facial glitch.”
                  </strong>

                  <p>
                    Modern synthetic media can be highly
                    convincing. Context, provenance and
                    independent evidence often matter
                    more than trying to win a visual
                    guessing game.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="reality-primary-action"
                onClick={() =>
                  completeAndGo("audio")
                }
              >
                Continue to AI Voice
                <span>→</span>
              </button>
            </section>
          )}

          {/* =================================================
              05 AUDIO
          ================================================== */}
          {activeTopic === "audio" && (
            <section className="reality-section">
              <div className="reality-section-heading">
                <span className="reality-section-label">
                  05 · AI VOICE
                </span>

                <h2>
                  A familiar voice is not
                  <span> authentication.</span>
                </h2>

                <p>
                  Voice cloning can reproduce aspects
                  of a person's voice. When a message
                  asks for money, passwords or an urgent
                  decision, verify through another
                  channel.
                </p>
              </div>

              <div className="reality-voice-visual">
                <div
                  className="reality-wave"
                  aria-hidden="true"
                >
                  {[
                    28, 48, 76, 42, 92, 56, 34, 68,
                    84, 44, 72, 38, 88, 54, 30, 66,
                    94, 46, 70, 40, 82, 52, 32, 64,
                    86, 44, 76, 50, 68, 36,
                  ].map((height, index) => (
                    <span
                      key={index}
                      style={{
                        height: `${height}px`,
                      }}
                    />
                  ))}
                </div>

                <div className="reality-voice-message">
                  <div className="reality-avatar">
                    🎙️
                  </div>

                  <div>
                    <strong>
                      “I need the money right now.
                      Please don't call.”
                    </strong>

                    <small>
                      Voice message · urgent request
                    </small>
                  </div>
                </div>
              </div>

              <div className="reality-safety-flow">
                <div>
                  <span>01</span>
                  <strong>PAUSE</strong>
                  <p>
                    Urgency is a reason to slow down,
                    not a reason to act faster.
                  </p>
                </div>

                <div>
                  <span>02</span>
                  <strong>CHANGE CHANNEL</strong>
                  <p>
                    Call the person through a trusted
                    number or known account.
                  </p>
                </div>

                <div>
                  <span>03</span>
                  <strong>CONFIRM</strong>
                  <p>
                    Ask a question the impersonator
                    cannot easily infer.
                  </p>
                </div>

                <div>
                  <span>04</span>
                  <strong>ACT</strong>
                  <p>
                    Only take the requested action
                    after independent confirmation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="reality-primary-action"
                onClick={() =>
                  completeAndGo("text")
                }
              >
                Continue to AI Text
                <span>→</span>
              </button>
            </section>
          )}

          {/* =================================================
              06 TEXT
          ================================================== */}
          {activeTopic === "text" && (
            <section className="reality-section">
              <div className="reality-section-heading">
                <span className="reality-section-label">
                  06 · AI TEXT & HALLUCINATIONS
                </span>

                <h2>
                  Fluent does not mean
                  <span> factual.</span>
                </h2>

                <p>
                  AI can produce answers that are
                  grammatically polished, detailed and
                  confident while still containing
                  incorrect or invented information.
                </p>
              </div>

              <div className="reality-ai-message">
                <div className="reality-ai-message-top">
                  <span>🤖 AI ASSISTANT</span>
                  <span>CONFIDENT ANSWER</span>
                </div>

                <p>
                  “The report was published in 2019
                  and confirms that the programme
                  increased participation by 37%. See
                  the official study for details.”
                </p>

                <div className="reality-citation">
                  Citation shown by the AI:
                  <strong>
                    “Example Research Journal,
                    Vol. 12”
                  </strong>
                </div>

                <div className="reality-text-question">
                  Would you use the statistic without
                  opening the source?
                </div>
              </div>

              <div className="reality-two-column reality-text-teaching-grid">
                <article className="reality-teaching-card">
                  <div className="reality-card-label">
                    HALLUCINATION
                  </div>

                  <h3>
                    A plausible statement without
                    adequate support.
                  </h3>

                  <p>
                    An AI system may generate a name,
                    date, quote, statistic or citation
                    that sounds reasonable but is
                    unsupported or incorrect.
                  </p>
                </article>

                <article className="reality-teaching-card">
                  <div className="reality-card-label">
                    BETTER HABIT
                  </div>

                  <h3>
                    Move from “Does this sound right?”
                    to “Can I verify it?”
                  </h3>

                  <p>
                    Open the source. Check the exact
                    claim. Look for an independent source
                    when the decision matters. If the
                    evidence is missing, say that you
                    do not yet know.
                  </p>
                </article>
              </div>

              <div className="reality-table-card">
                <div className="reality-card-label">
                  AI RESPONSE CHECK
                </div>

                <h3>
                  Four things worth checking
                </h3>

                <div className="reality-four-grid">
                  {[
                    [
                      "CLAIM",
                      "What exactly is the answer asserting?",
                    ],
                    [
                      "SOURCE",
                      "Can you open and inspect the underlying source?",
                    ],
                    [
                      "DATE",
                      "Is the information current enough for this decision?",
                    ],
                    [
                      "INDEPENDENCE",
                      "Does another reliable source agree?",
                    ],
                  ].map(([title, text]) => (
                    <article key={title}>
                      <strong>{title}</strong>
                      <p>{text}</p>
                    </article>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="reality-primary-action"
                onClick={() =>
                  completeAndGo("verify")
                }
              >
                Learn the verification process
                <span>→</span>
              </button>
            </section>
          )}

          {/* =================================================
              07 VERIFY
          ================================================== */}
          {activeTopic === "verify" && (
            <section className="reality-section">
              <div className="reality-section-heading">
                <span className="reality-section-label">
                  07 · VERIFY BEFORE TRUST
                </span>

                <h2>
                  Replace guessing with
                  <span> a repeatable process.</span>
                </h2>

                <p>
                  You do not need to become a perfect
                  AI detector. You need a reliable
                  sequence for investigating a claim.
                </p>
              </div>

              <div className="reality-verification-steps">
                {[
                  [
                    "01",
                    "STOP",
                    "Do not share, pay, publish or act immediately.",
                  ],
                  [
                    "02",
                    "IDENTIFY THE CLAIM",
                    "Write down exactly what is being claimed.",
                  ],
                  [
                    "03",
                    "FIND THE SOURCE",
                    "Trace the content back to its earliest useful source.",
                  ],
                  [
                    "04",
                    "CROSS-CHECK",
                    "Compare independent, trustworthy evidence.",
                  ],
                  [
                    "05",
                    "CHECK THE DATE",
                    "Old content can become misleading when presented as new.",
                  ],
                  [
                    "06",
                    "DECIDE",
                    "Label the claim supported, contradicted or uncertain.",
                  ],
                ].map(
                  ([number, title, text]) => (
                    <article key={number}>
                      <span>{number}</span>

                      <div>
                        <strong>{title}</strong>
                        <p>{text}</p>
                      </div>
                    </article>
                  )
                )}
              </div>

              <div className="reality-source-ladder">
                <div className="reality-card-label">
                  EVIDENCE LADDER
                </div>

                <h3>
                  Not every source carries the same
                  weight.
                </h3>

                <p>
                  Prefer primary material and
                  independent confirmation when the
                  decision has real consequences.
                </p>

                <div className="reality-ladder">
                  <div>
                    <span>01</span>

                    <strong>
                      Primary source
                    </strong>

                    <small>
                      Original document, recording or
                      official announcement.
                    </small>
                  </div>

                  <div>
                    <span>02</span>

                    <strong>
                      Independent evidence
                    </strong>

                    <small>
                      Separate trustworthy reporting
                      or documentation.
                    </small>
                  </div>

                  <div>
                    <span>03</span>

                    <strong>
                      Contextual source
                    </strong>

                    <small>
                      Useful background that helps
                      interpret the claim.
                    </small>
                  </div>

                  <div>
                    <span>04</span>

                    <strong>
                      Social repost
                    </strong>

                    <small>
                      A lead to investigate, not proof
                      by itself.
                    </small>
                  </div>
                </div>
              </div>

              <div className="reality-final-rule">
                <span>🧭</span>

                <div>
                  <strong>
                    Your goal is not to become a
                    perfect AI detector.
                  </strong>

                  <p>
                    Your goal is to become a better
                    digital decision-maker.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="reality-primary-action"
                onClick={() =>
                  completeAndGo("case-lab")
                }
              >
                Enter the Reality Case Lab
                <span>→</span>
              </button>
            </section>
          )}

          {/* =================================================
              08 CASE LAB
          ================================================== */}
          {activeTopic === "case-lab" && (
            <section className="reality-section">
              <div className="reality-section-heading">
                <span className="reality-section-label">
                  08 · REALITY CASE LAB
                </span>

                <h2>
                  Now use the skill when
                  <span>
                    {" "}
                    the answer is not obvious.
                  </span>
                </h2>

                <p>
                  This is where Reality Check becomes
                  practical. Read the situation, identify
                  the risk, choose your action, then
                  examine the reasoning.
                </p>
              </div>

              <div className="reality-case-progress">
                <div>
                  <span>
                    DECISION PRACTICE
                  </span>

                  <strong>
                    Case {currentScenario.id} of{" "}
                    {scenarios.length}
                  </strong>
                </div>

                <div className="reality-case-progress-track">
                  <span
                    style={{
                      width: `${
                        (currentScenario.id /
                          scenarios.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <article className="reality-scenario-card">
                <div className="reality-scenario-top">
                  <div>
                    <div className="reality-card-label">
                      CASE {currentScenario.id} ·
                      DECISION PRACTICE
                    </div>

                    <h3>
                      {currentScenario.title}
                    </h3>
                  </div>

                  <div className="reality-scenario-icon">
                    {currentScenario.icon}
                  </div>
                </div>

                <div className="reality-scenario-situation">
                  <strong>Situation</strong>
                  <p>
                    {currentScenario.situation}
                  </p>
                </div>

                <h4>
                  {currentScenario.question}
                </h4>

                <div className="reality-options">
                  {currentScenario.options.map(
                    (option, index) => {
                      const isSelected =
                        scenarioAnswer === index;

                      const isCorrect =
                        index ===
                        currentScenario.answer;

                      let className =
                        "reality-option";

                      if (
                        scenarioAnswer !== null &&
                        isCorrect
                      ) {
                        className +=
                          " reality-option-correct";
                      }

                      if (
                        scenarioAnswer !== null &&
                        isSelected &&
                        !isCorrect
                      ) {
                        className +=
                          " reality-option-wrong";
                      }

                      return (
                        <button
                          key={option}
                          type="button"
                          className={className}
                          onClick={() =>
                            handleScenarioAnswer(
                              index
                            )
                          }
                          disabled={
                            scenarioAnswer !== null
                          }
                        >
                          <span className="reality-option-letter">
                            {String.fromCharCode(
                              65 + index
                            )}
                          </span>

                          <span className="reality-option-text">
                            {option}
                          </span>

                          {scenarioAnswer !== null &&
                            isCorrect && (
                              <strong className="reality-option-result">
                                ✓
                              </strong>
                            )}

                          {scenarioAnswer !== null &&
                            isSelected &&
                            !isCorrect && (
                              <strong className="reality-option-result">
                                ×
                              </strong>
                            )}
                        </button>
                      );
                    }
                  )}
                </div>

                {scenarioAnswer !== null && (
                  <div
                    className={`reality-answer-feedback ${
                      scenarioAnswer ===
                      currentScenario.answer
                        ? "feedback-correct"
                        : "feedback-wrong"
                    }`}
                  >
                    <strong>
                      {scenarioAnswer ===
                      currentScenario.answer
                        ? "Excellent judgment."
                        : "Good attempt — now inspect the reasoning."}
                    </strong>

                    <p>
                      {currentScenario.explanation}
                    </p>

                    <button
                      type="button"
                      className="reality-secondary-button"
                      onClick={nextScenario}
                    >
                      Next case →
                    </button>
                  </div>
                )}
              </article>

              {/* MATCH THE FOLLOWING */}
              <article className="reality-match-card">
                <div className="reality-card-label">
                  MATCH THE FOLLOWING
                </div>

                <h3>
                  Build the verification habit
                </h3>

                <p>
                  Match each concept with the action
                  that best represents it.
                </p>

                <div className="reality-match-list">
                  {matchItems.map((item) => (
                    <div
                      className="reality-match-row"
                      key={item.id}
                    >
                      <div className="reality-match-left">
                        <span>{item.id}</span>

                        <div>
                          <strong>
                            {item.label}
                          </strong>

                          <p>
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <select
                        value={
                          matchAnswers[item.id] ??
                          ""
                        }
                        onChange={(event) =>
                          setMatchValue(
                            item.id,
                            event.target.value
                          )
                        }
                        aria-label={`Match ${item.label}`}
                      >
                        <option
                          value=""
                          disabled
                        >
                          Choose the best match
                        </option>

                        {matchOptions.map(
                          (option) => (
                            <option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="reality-match-actions">
                  <button
                    type="button"
                    className="reality-primary-button"
                    onClick={() =>
                      setMatchChecked(true)
                    }
                  >
                    Check my matches
                  </button>

                  {matchChecked && (
                    <span className="reality-match-score">
                      {correctMatches}/4 correct
                    </span>
                  )}
                </div>

                {matchChecked && (
                  <div
                    className={`reality-feedback ${
                      correctMatches === 4
                        ? "correct"
                        : "incorrect"
                    }`}
                  >
                    <strong>
                      {correctMatches === 4
                        ? "Perfect match."
                        : "Review the matches and try again."}
                    </strong>

                    <p>
                      Provenance points you to the
                      original source. Context explains
                      when and where something belongs.
                      Evidence provides independent
                      support. When evidence is
                      insufficient, the correct action
                      is to pause.
                    </p>
                  </div>
                )}
              </article>

              {/* FINAL COMPLETION */}
              <div className="reality-completion-card">
                <div className="reality-completion-icon">
                  🏆
                </div>

                <div className="reality-card-label">
                  REALITY CHECK MINDSET
                </div>

                <h3>
                  Question before trusting.
                </h3>

                <p>
                  You do not need perfect certainty to
                  make a better decision. You need
                  enough evidence for the action you are
                  about to take.
                </p>

                <div className="reality-completion-actions">
                  <button
                    type="button"
                    className="reality-primary-action"
                    onClick={markComplete}
                  >
                    Mark Reality Check complete ✓
                  </button>

                  <button
                    type="button"
                    className="reality-secondary-button"
                    onClick={() =>
                      goToTopic("foundation")
                    }
                  >
                    Review from the beginning
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* =================================================
              CHAPTER NAVIGATION
          ================================================== */}
          <div className="reality-chapter-navigation">
            <button
              type="button"
              disabled={activeTopicIndex <= 0}
              onClick={() => {
                if (activeTopicIndex > 0) {
                  goToTopic(
                    topics[
                      activeTopicIndex - 1
                    ].id
                  );
                }
              }}
            >
              ← Previous
            </button>

            <div>
              <span>
                CHAPTER {currentTopic.number}
              </span>

              <strong>
                {currentTopic.title}
              </strong>
            </div>

            <button
              type="button"
              disabled={
                activeTopicIndex >=
                topics.length - 1
              }
              onClick={() => {
                if (
                  activeTopicIndex <
                  topics.length - 1
                ) {
                  markComplete();

                  goToTopic(
                    topics[
                      activeTopicIndex + 1
                    ].id
                  );
                }
              }}
            >
              Next →
            </button>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="reality-footer">
        <div className="reality-footer-brand">
          <img
            src="/curio-symbol.png"
            alt="CURIO"
          />

          <div>
            <strong>CURIO</strong>

            <span>
              Learn · Understand · Grow
            </span>
          </div>
        </div>

        <p>
          Reality Check teaches responsible digital
          judgment — not fear of AI.
        </p>
      </footer>
    </div>
  );
}

export default RealityCheck;