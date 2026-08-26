import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import "./Lesson5.css";

import { useLessonProgress } from "../../hooks/useLessonProgress.ts";

/* =========================================
   TYPES
========================================= */

type Section = {
  id: number;
  title: string;
  short: string;
};

/* =========================================
   LESSON SECTIONS
========================================= */

const sections: Section[] = [
  {
    id: 1,
    title: "What Is AI Safety?",
    short: "Learn what responsible AI use means.",
  },
  {
    id: 2,
    title: "Protect Your Information",
    short: "Learn what should stay private.",
  },
  {
    id: 3,
    title: "Safe Prompting",
    short: "Remove sensitive details before you ask AI.",
  },
  {
    id: 4,
    title: "AI Ethics",
    short: "Learn the principles behind responsible AI use.",
  },
  {
    id: 5,
    title: "AI Rules & Responsibilities",
    short: "Understand laws, policies and your responsibility.",
  },
  {
    id: 6,
    title: "Scams, Deepfakes & Manipulation",
    short: "Recognise dangerous and deceptive AI content.",
  },
  {
    id: 7,
    title: "Using AI Responsibly",
    short: "Apply safety and ethics to study and real life.",
  },
  {
    id: 8,
    title: "Final Safety Challenge",
    short: "Practice everything you learned.",
  },
];

/* =========================================
   FINAL SAFETY QUESTIONS
========================================= */

const safetyQuestions = [
  {
    question:
      "Which should you never casually paste into a chatbot?",
    options: [
      "A topic you want to study",
      "A public definition",
      "A password or one-time password",
      "A fictional story idea",
    ],
    answer: 2,
    explanation:
      "Passwords, OTPs and similar authentication secrets should stay private.",
  },
  {
    question:
      "You need AI to improve an email. The email contains someone's phone number. What is safer?",
    options: [
      "Paste the number because AI needs every detail.",
      "Replace the number with a placeholder before sharing it.",
      "Post the whole email publicly first.",
      "Ask AI to guess the number.",
    ],
    answer: 1,
    explanation:
      "Remove unnecessary personal information. AI can usually help without seeing the real phone number.",
  },
  {
    question:
      "Which is an ethical use of AI for studying?",
    options: [
      "Ask AI to explain a difficult concept.",
      "Submit AI-generated work as your own when that is prohibited.",
      "Invent sources with AI.",
      "Use AI to impersonate a classmate.",
    ],
    answer: 0,
    explanation:
      "Using AI to understand, practise and improve your learning can support education when it follows the applicable rules.",
  },
  {
    question:
      "You receive a shocking AI-generated video about a public event. What should you do first?",
    options: [
      "Share it immediately.",
      "Assume it is real because it looks professional.",
      "Verify the claim and source before sharing it.",
      "Ask another chatbot and accept its answer.",
    ],
    answer: 2,
    explanation:
      "AI-generated or edited media can look convincing. Verify important claims using reliable sources.",
  },
  {
    question:
      "What is the safest rule for high-risk information?",
    options: [
      "AI is always enough.",
      "Use AI as the only source.",
      "Use appropriate authoritative or professional guidance and verify.",
      "Choose the answer that sounds most confident.",
    ],
    answer: 2,
    explanation:
      "For medical, legal, financial and safety matters, AI should not be your only source of authority.",
  },
];

/* =========================================
   REAL-LIFE SCENARIOS
========================================= */

const scenarioQuestions = [
  {
    situation:
      "A chatbot asks you to paste your account password so it can help diagnose a login problem.",
    answer: "unsafe",
    explanation:
      "Never give a password to a chatbot. Ask for general troubleshooting steps instead.",
  },
  {
    situation:
      "You remove names, phone numbers and addresses from a document before asking AI to summarise it.",
    answer: "safe",
    explanation:
      "Removing unnecessary personal information reduces privacy risk while preserving the useful task.",
  },
  {
    situation:
      "You use AI to brainstorm ideas for a school project and then write the final explanation yourself.",
    answer: "safe",
    explanation:
      "AI can support brainstorming and learning, provided the use follows your school's rules.",
  },
  {
    situation:
      "You see a realistic AI voice recording and forward it because it confirms what you already believe.",
    answer: "unsafe",
    explanation:
      "Believability and agreement with your beliefs do not prove authenticity. Verify before sharing.",
  },
];

/* =========================================
   SAFETY SHORTCUTS
========================================= */

const safetyShortcuts = [
  {
    command: "/private",
    description:
      "Help me identify information in this text that I should remove before sharing.",
  },
  {
    command: "/safe",
    description:
      "What privacy or safety risks should I think about before doing this?",
  },
  {
    command: "/redact",
    description:
      "Show me which personal details can be replaced with placeholders.",
  },
  {
    command: "/ethics",
    description:
      "What ethical concerns should I consider about this use of AI?",
  },
];

/* =========================================
   LESSON 5
========================================= */

function Lesson5() {
  /* =========================================
     SECTION STATE
  ========================================== */

  const [activeSection, setActiveSection] =
    useState(1);

  const [, setCompletedSections] =
    useState<number[]>([]);

  /* =========================================
     PRACTICE STATE
  ========================================== */

  const [scenarioAnswers, setScenarioAnswers] =
    useState<Record<number, string>>({});

  const [checkedScenarios, setCheckedScenarios] =
    useState<number[]>([]);

  const [finalAnswers, setFinalAnswers] =
    useState<Record<number, number>>({});

  const [checkedFinal, setCheckedFinal] =
    useState<number[]>([]);

  const [showChecklist, setShowChecklist] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  /* =========================================
     LESSON PROGRESS
  ========================================== */

  const {
    loading: progressLoading,
    saving: progressSaving,
    error: progressError,

    currentSection: savedCurrentSection,
    completedSections: savedCompletedSections,
    completed: savedCompleted,

    updateProgress,
    markComplete,
  } = useLessonProgress(5, 8);

  /* =========================================
     PROGRESS CALCULATIONS
  ========================================== */

  const currentSectionIndex =
    Math.max(
      0,
      Math.min(
        activeSection - 1,
        sections.length - 1
      )
    );

  const progressCount =
    Math.max(
      0,
      Math.min(
        savedCompletedSections,
        sections.length
      )
    );

  const progressPercent =
    Math.round(
      (progressCount / sections.length) * 100
    );

  /* =========================================
     RESTORE SAVED PROGRESS
  ========================================== */

  useEffect(() => {
    if (progressLoading) {
      return;
    }

    if (savedCompleted) {
      setCompleted(true);

      setActiveSection(8);

      setCompletedSections(
        sections.map(
          (section) => section.id
        )
      );

      return;
    }

    const safeCompletedSections =
      Math.max(
        0,
        Math.min(
          savedCompletedSections,
          sections.length
        )
      );

    setCompletedSections(
      sections
        .filter(
          (_, index) =>
            index < safeCompletedSections
        )
        .map(
          (section) => section.id
        )
    );

    const safeCurrentSection =
      Math.max(
        1,
        Math.min(
          savedCurrentSection + 1,
          sections.length
        )
      );

    setActiveSection(
      safeCurrentSection
    );

    setCompleted(false);
  }, [
    progressLoading,
    savedCurrentSection,
    savedCompleted,
    savedCompletedSections,
  ]);

  /* =========================================
     FINAL SCORE
  ========================================== */

  const finalScore = useMemo(() => {
    return safetyQuestions.reduce(
      (score, question, index) => {
        return (
          score +
          (finalAnswers[index] ===
          question.answer
            ? 1
            : 0)
        );
      },
      0
    );
  }, [finalAnswers]);

  /* =========================================
     SCENARIO COMPLETION
  ========================================== */

  const scenarioPracticeComplete =
    checkedScenarios.length ===
    scenarioQuestions.length;

  /* =========================================
     COMPLETE SECTION
  ========================================== */

  const completeSection = async (
    sectionId: number
  ) => {
    if (
      sectionId < 1 ||
      sectionId > sections.length
    ) {
      return false;
    }

    const currentSavedCount =
      Math.max(
        0,
        Math.min(
          savedCompletedSections,
          sections.length
        )
      );

    const count =
      Math.min(
        sections.length,
        Math.max(
          currentSavedCount,
          sectionId
        )
      );

    const saved =
      await updateProgress(
        count,
        count
      );

    if (!saved) {
      return false;
    }

    setCompletedSections(
      sections
        .filter(
          (_, index) =>
            index < count
        )
        .map(
          (section) =>
            section.id
        )
    );

    if (
      sectionId <
      sections.length
    ) {
      const nextSectionId =
        sectionId + 1;

      setActiveSection(
        nextSectionId
      );

      globalThis.setTimeout(
        () => {
          document
            .getElementById(
              `lesson5-section-${nextSectionId}`
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        },
        80
      );
    }

    return true;
  };

  /* =========================================
     SCENARIO ANSWER
  ========================================== */

  const chooseScenarioAnswer = (
    questionIndex: number,
    answer: string
  ) => {
    setScenarioAnswers(
      (current) => ({
        ...current,
        [questionIndex]:
          answer,
      })
    );
  };

  /* =========================================
     CHECK SCENARIO ANSWER
  ========================================== */

  const checkScenarioAnswer = (
    questionIndex: number
  ) => {
    setCheckedScenarios(
      (current) =>
        current.includes(
          questionIndex
        )
          ? current
          : [
              ...current,
              questionIndex,
            ]
    );
  };

  /* =========================================
     FINAL ANSWER
  ========================================== */

  const chooseFinalAnswer = (
    questionIndex: number,
    optionIndex: number
  ) => {
    setFinalAnswers(
      (current) => ({
        ...current,
        [questionIndex]:
          optionIndex,
      })
    );

    /*
     * If the user changes an answer after checking it,
     * allow them to check the new answer again.
     */
    setCheckedFinal(
      (current) =>
        current.filter(
          (index) =>
            index !== questionIndex
        )
    );
  };

  /* =========================================
     CHECK FINAL ANSWER
  ========================================== */

  const checkFinalAnswer = (
    questionIndex: number
  ) => {
    if (
      finalAnswers[
        questionIndex
      ] === undefined
    ) {
      return;
    }

    setCheckedFinal(
      (current) =>
        current.includes(
          questionIndex
        )
          ? current
          : [
              ...current,
              questionIndex,
            ]
    );
  };

  /* =========================================
     FINISH LESSON
  ========================================== */

  const finishLesson =
    async () => {
      if (progressSaving) {
        return;
      }

      if (
        checkedFinal.length !==
        safetyQuestions.length
      ) {
        return;
      }

      if (
        finalScore !==
        safetyQuestions.length
      ) {
        return;
      }

      const saved =
        await markComplete();

      if (!saved) {
        return;
      }

      setCompleted(true);

      setCompletedSections(
        sections.map(
          (section) =>
            section.id
        )
      );

      setActiveSection(8);

      globalThis.dispatchEvent(
        new Event(
          "curio:lesson-completed"
        )
      );
    };

  /* =========================================
     NAVIGATION
  ========================================== */

  const goToSection = (
    sectionId: number
  ) => {
    const maxUnlockedSection =
      Math.min(
        savedCompletedSections + 1,
        sections.length
      );

    const unlocked =
      savedCompleted ||
      sectionId <=
        maxUnlockedSection;

    if (!unlocked) {
      return;
    }

    setActiveSection(
      sectionId
    );

    globalThis.setTimeout(
      () => {
        document
          .getElementById(
            `lesson5-section-${sectionId}`
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      },
      50
    );
  };

  /* =========================================
     NEXT SECTION
  ========================================== */

  const nextSection =
    async () => {
      if (
        activeSection >=
        sections.length
      ) {
        return;
      }

      await completeSection(
        activeSection
      );
    };

  /* =========================================
     PREVIOUS SECTION
  ========================================== */

  const previousSection =
    () => {
      if (
        activeSection > 1
      ) {
        setActiveSection(
          activeSection - 1
        );
      }
    };

  /* =========================================
     RENDER SECTION
  ========================================== */

  const renderSection =
    () => {
      switch (
        activeSection
      ) {
        /* =====================================
           SECTION 1
        ====================================== */

        case 1:
          return (
            <>
              <span className="lesson5-step-label">
                01 · START HERE
              </span>

              <h2>
                What does AI safety actually mean?
              </h2>

              <p className="lesson5-lead">
                AI safety is not about being afraid of AI. It is
                about learning how to use AI without unnecessarily
                putting yourself, other people, your information,
                or your future at risk.
              </p>

              <div className="lesson5-principle">
                <span>🛡️</span>

                <div>
                  <strong>
                    CURIO Safety Principle
                  </strong>

                  <p>
                    <b>
                      Think → Protect → Verify → Use responsibly.
                    </b>
                  </p>
                </div>
              </div>

              <div className="lesson5-four-pillars">
                <article>
                  <span>🔐</span>
                  <strong>
                    Protect
                  </strong>

                  <p>
                    Protect private information, accounts and
                    other secrets.
                  </p>
                </article>

                <article>
                  <span>🧠</span>
                  <strong>
                    Think
                  </strong>

                  <p>
                    Think about consequences before you ask,
                    trust or share.
                  </p>
                </article>

                <article>
                  <span>⚖️</span>
                  <strong>
                    Respect
                  </strong>

                  <p>
                    Respect people, rules, ownership and
                    privacy.
                  </p>
                </article>

                <article>
                  <span>✅</span>
                  <strong>
                    Verify
                  </strong>

                  <p>
                    Check important information before acting
                    on it.
                  </p>
                </article>
              </div>

              <div className="lesson5-example-box">
                <strong>
                  Imagine this:
                </strong>

                <p>
                  You would not hand a stranger your house keys
                  just because they promised to help you.
                </p>

                <p>
                  Your digital information deserves the same
                  kind of careful thinking.
                </p>
              </div>

              <div className="lesson5-tip">
                <strong>
                  Safety is a habit, not a button.
                </strong>

                <p>
                  The goal of CURIO is to help you make safer
                  decisions even when nobody is reminding you.
                </p>
              </div>
            </>
          );

        /* =====================================
           SECTION 2
        ====================================== */

        case 2:
          return (
            <>
              <span className="lesson5-step-label">
                02 · PRIVACY
              </span>

              <h2>
                Protect your information 🔐
              </h2>

              <p className="lesson5-lead">
                AI can be useful without knowing everything about
                you. Before sharing information, ask whether the
                AI actually needs it.
              </p>

              <div className="lesson5-information-grid">
                <article className="danger">
                  <span>🔴</span>

                  <strong>
                    Keep secret
                  </strong>

                  <ul>
                    <li>
                      Passwords
                    </li>
                    <li>
                      OTP / verification codes
                    </li>
                    <li>
                      Bank or card details
                    </li>
                    <li>
                      API keys and access tokens
                    </li>
                    <li>
                      Recovery codes
                    </li>
                    <li>
                      Private authentication information
                    </li>
                  </ul>
                </article>

                <article className="careful">
                  <span>🟡</span>

                  <strong>
                    Think before sharing
                  </strong>

                  <ul>
                    <li>
                      Phone numbers
                    </li>
                    <li>
                      Home address
                    </li>
                    <li>
                      Personal documents
                    </li>
                    <li>
                      Precise location
                    </li>
                    <li>
                      Private photos
                    </li>
                    <li>
                      Family or school details
                    </li>
                  </ul>
                </article>

                <article className="safer">
                  <span>🟢</span>

                  <strong>
                    Usually safer to discuss
                  </strong>

                  <ul>
                    <li>
                      General concepts
                    </li>
                    <li>
                      Public information
                    </li>
                    <li>
                      Fictional examples
                    </li>
                    <li>
                      Generic study questions
                    </li>
                    <li>
                      De-identified examples
                    </li>
                    <li>
                      Practice data
                    </li>
                  </ul>
                </article>
              </div>

              <div className="lesson5-rule-box">
                <span>💡</span>

                <div>
                  <strong>
                    The “Does AI need this?” test
                  </strong>

                  <p>
                    If a detail is not necessary for the task,
                    remove it or replace it with a placeholder.
                  </p>
                </div>
              </div>

              <div className="lesson5-before-after">
                <div>
                  <span>
                    ❌ TOO MUCH INFORMATION
                  </span>

                  <p>
                    “My friend Rahul lives at [full address].
                    His phone number is [number]. Write him a
                    message.”
                  </p>
                </div>

                <div>
                  <span>
                    ✅ BETTER
                  </span>

                  <p>
                    “Help me write a respectful message to a
                    friend about a missed appointment.”
                  </p>
                </div>
              </div>
            </>
          );

        /* =====================================
           SECTION 3
        ====================================== */

        case 3:
          return (
            <>
              <span className="lesson5-step-label">
                03 · SAFE PROMPTING
              </span>

              <h2>
                Make your prompts safer
              </h2>

              <p className="lesson5-lead">
                Lesson 3 taught you how to give AI useful
                instructions. Now add one more skill:
                <b>
                  {" "}
                  give AI only the information it needs.
                </b>
              </p>

              <div className="lesson5-redaction-flow">
                <article>
                  <span>1</span>

                  <strong>
                    Find
                  </strong>

                  <p>
                    Identify names, numbers, passwords or other
                    unnecessary private details.
                  </p>
                </article>

                <article>
                  <span>2</span>

                  <strong>
                    Remove
                  </strong>

                  <p>
                    Delete details that are not required for the
                    task.
                  </p>
                </article>

                <article>
                  <span>3</span>

                  <strong>
                    Replace
                  </strong>

                  <p>
                    Use placeholders such as [NAME],
                    [PHONE], or [ADDRESS].
                  </p>
                </article>

                <article>
                  <span>4</span>

                  <strong>
                    Prompt
                  </strong>

                  <p>
                    Give AI the clean version and ask for the
                    actual task.
                  </p>
                </article>
              </div>

              <div className="lesson5-code-example">
                <div>
                  <span>
                    ❌ DON'T
                  </span>

                  <code>
                    Here is my API key: sk-...
                    <br />
                    Fix my code using this key.
                  </code>
                </div>

                <div>
                  <span>
                    ✅ DO
                  </span>

                  <code>
                    My program needs an API key.
                    <br />
                    Show me how to store it safely in an
                    environment variable.
                  </code>
                </div>
              </div>

              <div className="lesson5-tip">
                <strong>
                  Important:
                </strong>

                <p>
                  If you accidentally expose a real secret,
                  do not keep using it. Follow the relevant
                  service's process for changing or revoking it.
                </p>
              </div>
            </>
          );

        /* =====================================
           SECTION 4
        ====================================== */

        case 4:
          return (
            <>
              <span className="lesson5-step-label">
                04 · AI ETHICS
              </span>

              <h2>
                What does it mean to use AI ethically? ⚖️
              </h2>

              <p className="lesson5-lead">
                Ethics is about thinking about what is right,
                fair, respectful and responsible — not just what
                technology allows you to do.
              </p>

              <div className="lesson5-ethics-grid">
                <article>
                  <span>👤</span>

                  <strong>
                    Respect people
                  </strong>

                  <p>
                    Do not use AI to deceive, harass, impersonate
                    or unfairly target others.
                  </p>
                </article>

                <article>
                  <span>🔒</span>

                  <strong>
                    Respect privacy
                  </strong>

                  <p>
                    Do not expose another person's private
                    information simply because AI can process it.
                  </p>
                </article>

                <article>
                  <span>✍️</span>

                  <strong>
                    Be honest
                  </strong>

                  <p>
                    Do not present AI-generated work as your own
                    when the applicable rules require disclosure
                    or prohibit it.
                  </p>
                </article>

                <article>
                  <span>🧾</span>

                  <strong>
                    Be accurate
                  </strong>

                  <p>
                    Do not knowingly use AI to fabricate facts,
                    evidence, sources or data.
                  </p>
                </article>

                <article>
                  <span>⚠️</span>

                  <strong>
                    Think about harm
                  </strong>

                  <p>
                    Consider whether an AI-generated output could
                    cause real-world harm before using it.
                  </p>
                </article>

                <article>
                  <span>🧠</span>

                  <strong>
                    Keep human judgement
                  </strong>

                  <p>
                    AI can assist your decisions, but important
                    decisions should not become automatic just
                    because AI suggested something.
                  </p>
                </article>
              </div>

              <div className="lesson5-pro-con">
                <div>
                  <strong>
                    🟢 Responsible use can help
                  </strong>

                  <ul>
                    <li>
                      Learn faster
                    </li>
                    <li>
                      Generate ideas
                    </li>
                    <li>
                      Improve accessibility
                    </li>
                    <li>
                      Automate repetitive work
                    </li>
                    <li>
                      Support creativity
                    </li>
                  </ul>
                </div>

                <div>
                  <strong>
                    🔴 Irresponsible use can harm
                  </strong>

                  <ul>
                    <li>
                      Spread misinformation
                    </li>
                    <li>
                      Expose private information
                    </li>
                    <li>
                      Enable deception
                    </li>
                    <li>
                      Damage someone's reputation
                    </li>
                    <li>
                      Create unfair or harmful outcomes
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lesson5-core-question">
                <strong>
                  Before you use an AI output, ask:
                </strong>

                <p>
                  “Would I be comfortable explaining what I did,
                  why I did it, and what effect it could have on
                  another person?”
                </p>
              </div>
            </>
          );

        /* =====================================
           SECTION 5
        ====================================== */

        case 5:
          return (
            <>
              <span className="lesson5-step-label">
                05 · RULES & RESPONSIBILITY
              </span>

              <h2>
                AI has rules — and you have responsibilities
              </h2>

              <p className="lesson5-lead">
                There is no single “AI law” that covers every
                situation. Different countries, organisations,
                schools, platforms and services can have different
                rules. Some uses of AI can also interact with
                existing laws.
              </p>

              <div className="lesson5-law-layers">
                <article>
                  <span>🏛️</span>

                  <strong>
                    Law
                  </strong>

                  <p>
                    General laws can apply to AI-assisted
                    actions too. AI does not make an otherwise
                    unlawful act automatically lawful.
                  </p>
                </article>

                <article>
                  <span>🏫</span>

                  <strong>
                    Institution rules
                  </strong>

                  <p>
                    Schools, colleges and workplaces may have
                    their own rules about acceptable AI use.
                  </p>
                </article>

                <article>
                  <span>📱</span>

                  <strong>
                    Platform rules
                  </strong>

                  <p>
                    AI services can set rules about what their
                    users may do with the service.
                  </p>
                </article>

                <article>
                  <span>🤝</span>

                  <strong>
                    Responsible judgement
                  </strong>

                  <p>
                    Even when something is technically allowed,
                    ask whether it is fair, safe and respectful.
                  </p>
                </article>
              </div>

              <div className="lesson5-law-rule">
                <span>⚠️</span>

                <div>
                  <strong>
                    Important distinction
                  </strong>

                  <p>
                    This lesson gives basic AI-safety literacy,
                    not legal advice. Laws and policies differ by
                    place and situation. When a legal question
                    matters, use current official information or
                    qualified professional advice.
                  </p>
                </div>
              </div>

              <div className="lesson5-responsibility-grid">
                <article>
                  <strong>
                    YOU are responsible for...
                  </strong>

                  <ul>
                    <li>
                      What you choose to enter.
                    </li>
                    <li>
                      What you choose to believe.
                    </li>
                    <li>
                      What you choose to share.
                    </li>
                    <li>
                      How you use the output.
                    </li>
                    <li>
                      Whether your use follows applicable rules.
                    </li>
                  </ul>
                </article>

                <article>
                  <strong>
                    AI is not your excuse.
                  </strong>

                  <p>
                    “The chatbot told me to do it” does not
                    remove the need for human judgement.
                  </p>

                  <p>
                    <b>
                      AI is a tool. You make the decision.
                    </b>
                  </p>
                </article>
              </div>

              <div className="lesson5-law-example">
                <strong>
                  Example
                </strong>

                <p>
                  If a school says that an assignment must be
                  completed without AI assistance, using AI and
                  hiding that use can violate the school's rule
                  even if the chatbot itself allows the request.
                </p>
              </div>
            </>
          );

        /* =====================================
           SECTION 6
        ====================================== */

        case 6:
          return (
            <>
              <span className="lesson5-step-label">
                06 · DIGITAL THREATS
              </span>

              <h2>
                Scams, deepfakes and manipulation 🚨
              </h2>

              <p className="lesson5-lead">
                AI can create useful content — but the same
                technology can also make deception more
                convincing. Your Lesson 4 verification skills
                are your first defence.
              </p>

              <div className="lesson5-threat-grid">
                <article>
                  <span>🎭</span>

                  <strong>
                    Deepfakes
                  </strong>

                  <p>
                    AI-generated or altered images, video or
                    audio that can make a person appear to say
                    or do something.
                  </p>
                </article>

                <article>
                  <span>📨</span>

                  <strong>
                    Phishing
                  </strong>

                  <p>
                    Messages designed to trick you into revealing
                    information or taking an unsafe action.
                  </p>
                </article>

                <article>
                  <span>🗣️</span>

                  <strong>
                    Voice impersonation
                  </strong>

                  <p>
                    A synthetic voice may sound like someone you
                    know. Voice alone is not proof of identity.
                  </p>
                </article>

                <article>
                  <span>🧠</span>

                  <strong>
                    Manipulation
                  </strong>

                  <p>
                    AI-generated content can be designed to
                    provoke fear, anger or urgency.
                  </p>
                </article>
              </div>

              <div className="lesson5-red-flags">
                <strong>
                  🚩 Common red flags
                </strong>

                <div>
                  <span>
                    “Act NOW!”
                  </span>

                  <span>
                    “Keep this secret.”
                  </span>

                  <span>
                    “Send the code.”
                  </span>

                  <span>
                    “Don't verify.”
                  </span>

                  <span>
                    “You must pay immediately.”
                  </span>
                </div>
              </div>

              <div className="lesson5-emergency-rule">
                <span>🛑</span>

                <div>
                  <strong>
                    STOP → VERIFY → THEN ACT
                  </strong>

                  <p>
                    If a message creates pressure, fear or
                    urgency, slow down. Contact the person or
                    organisation through a trusted channel instead
                    of using the contact details in the suspicious
                    message.
                  </p>
                </div>
              </div>

              <div className="lesson5-scenario-box">
                <strong>
                  Someone sends you an AI-looking voice message
                  asking for money.
                </strong>

                <p>
                  Do not rely on the voice alone. Verify the
                  request through a separate trusted channel.
                </p>
              </div>
            </>
          );

        /* =====================================
           SECTION 7
        ====================================== */

        case 7:
          return (
            <>
              <span className="lesson5-step-label">
                07 · REAL-LIFE PRACTICE
              </span>

              <h2>
                Use AI responsibly in the real world
              </h2>

              <p className="lesson5-lead">
                Safety becomes useful when you can apply it
                without thinking too hard about every single
                situation.
              </p>

              <div className="lesson5-risk-scale">
                <article>
                  <span>🟢</span>

                  <strong>
                    LOW RISK
                  </strong>

                  <p>
                    Brainstorming, creative ideas and generic
                    learning questions.
                  </p>
                </article>

                <article>
                  <span>🟡</span>

                  <strong>
                    MEDIUM RISK
                  </strong>

                  <p>
                    Study material, code, work documents and
                    personal projects. Remove sensitive data and
                    verify important claims.
                  </p>
                </article>

                <article>
                  <span>🔴</span>

                  <strong>
                    HIGH RISK
                  </strong>

                  <p>
                    Medical, legal, financial, safety, identity
                    or security decisions. Use appropriate
                    authoritative or professional guidance.
                  </p>
                </article>
              </div>

              <div className="lesson5-scenario-practice">
                {scenarioQuestions.map(
                  (scenario, index) => {
                    const selected =
                      scenarioAnswers[index];

                    const checked =
                      checkedScenarios.includes(
                        index
                      );

                    const correct =
                      selected ===
                      scenario.answer;

                    return (
                      <article
                        key={
                          scenario.situation
                        }
                      >
                        <div className="lesson5-scenario-number">
                          {index + 1}
                        </div>

                        <div>
                          <h4>
                            {scenario.situation}
                          </h4>

                          <div className="lesson5-safe-buttons">
                            <button
                              type="button"
                              className={
                                selected ===
                                "safe"
                                  ? "selected"
                                  : ""
                              }
                              onClick={() =>
                                chooseScenarioAnswer(
                                  index,
                                  "safe"
                                )
                              }
                            >
                              🟢 SAFE
                            </button>

                            <button
                              type="button"
                              className={
                                selected ===
                                "unsafe"
                                  ? "selected"
                                  : ""
                              }
                              onClick={() =>
                                chooseScenarioAnswer(
                                  index,
                                  "unsafe"
                                )
                              }
                            >
                              🔴 UNSAFE
                            </button>
                          </div>

                          <button
                            type="button"
                            className="lesson5-check-button"
                            disabled={
                              !selected
                            }
                            onClick={() =>
                              checkScenarioAnswer(
                                index
                              )
                            }
                          >
                            {checked
                              ? "Checked ✓"
                              : "Check decision"}
                          </button>

                          {checked && (
                            <div
                              className={`lesson5-feedback ${
                                correct
                                  ? "correct"
                                  : "wrong"
                              }`}
                            >
                              <strong>
                                {correct
                                  ? "Correct ✓"
                                  : "Not quite — learn from it"}
                              </strong>

                              <p>
                                {
                                  scenario.explanation
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </>
          );

        /* =====================================
           SECTION 8
        ====================================== */

        case 8:
          return (
            <>
              <span className="lesson5-step-label">
                08 · FINAL CHALLENGE
              </span>

              <h2>
                Can you use AI safely? 🛡️
              </h2>

              <p className="lesson5-lead">
                Choose the best answer, check it, and read the
                explanation. You need <b>5 / 5</b> to complete
                Lesson 5.
              </p>

              <div className="lesson5-final-list">
                {safetyQuestions.map(
                  (question, index) => {
                    const selected =
                      finalAnswers[index];

                    const checked =
                      checkedFinal.includes(
                        index
                      );

                    const correct =
                      selected ===
                      question.answer;

                    return (
                      <article
                        key={
                          question.question
                        }
                      >
                        <div className="lesson5-final-number">
                          {index + 1}
                        </div>

                        <div>
                          <h4>
                            {question.question}
                          </h4>

                          <div className="lesson5-choice-list">
                            {question.options.map(
                              (
                                option,
                                optionIndex
                              ) => (
                                <button
                                  type="button"
                                  key={option}
                                  className={[
                                    selected ===
                                    optionIndex
                                      ? "selected"
                                      : "",
                                    checked &&
                                    optionIndex ===
                                      question.answer
                                      ? "correct"
                                      : "",
                                    checked &&
                                    selected ===
                                      optionIndex &&
                                    !correct
                                      ? "wrong"
                                      : "",
                                  ].join(
                                    " "
                                  )}
                                  onClick={() =>
                                    chooseFinalAnswer(
                                      index,
                                      optionIndex
                                    )
                                  }
                                >
                                  <span>
                                    {String.fromCharCode(
                                      65 +
                                        optionIndex
                                    )}
                                  </span>

                                  {option}
                                </button>
                              )
                            )}
                          </div>

                          <button
                            type="button"
                            className="lesson5-check-button"
                            disabled={
                              selected ===
                              undefined
                            }
                            onClick={() =>
                              checkFinalAnswer(
                                index
                              )
                            }
                          >
                            {checked
                              ? "Checked ✓"
                              : "Check answer"}
                          </button>

                          {checked && (
                            <div
                              className={`lesson5-feedback ${
                                correct
                                  ? "correct"
                                  : "wrong"
                              }`}
                            >
                              <strong>
                                {correct
                                  ? "Correct ✓"
                                  : "Not quite — learn from it"}
                              </strong>

                              <p>
                                {
                                  question.explanation
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>

              <div className="lesson5-score-card">
                <div>
                  <strong>
                    Your score
                  </strong>

                  <span>
                    {finalScore} /{" "}
                    {safetyQuestions.length}
                  </span>
                </div>

                <div className="lesson5-score-track">
                  <div
                    style={{
                      width: `${
                        (finalScore /
                          safetyQuestions.length) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <p>
                  Understand the safety principle, not just the
                  answer.
                </p>
              </div>

              <div className="lesson5-cheatsheet">
                <button
                  type="button"
                  onClick={() =>
                    setShowChecklist(
                      (value) =>
                        !value
                    )
                  }
                >
                  {showChecklist
                    ? "Hide"
                    : "Show"}{" "}
                  my Safety Checklist
                </button>

                {showChecklist && (
                  <div className="lesson5-checklist">
                    <h4>
                      Before using AI, ask:
                    </h4>

                    {[
                      "Am I sharing a password, OTP, key or secret?",
                      "Does AI actually need this personal detail?",
                      "Can I remove or replace private information?",
                      "Is this use allowed by the relevant rules?",
                      "Could this harm or unfairly affect someone?",
                      "Do I need to verify the output?",
                      "Would I be comfortable explaining how I used AI?",
                    ].map(
                      (item) => (
                        <label
                          key={item}
                        >
                          <input
                            type="checkbox"
                          />

                          <span>
                            {item}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                )}
              </div>

              {checkedFinal.length ===
                safetyQuestions.length &&
                finalScore ===
                  safetyQuestions.length && (
                  <div className="lesson5-complete-card">
                    <span>
                      🎉
                    </span>

                    <div>
                      <strong>
                        Lesson 5 completed!
                      </strong>

                      <p>
                        You now know how to protect information,
                        think ethically, recognise AI-related
                        risks, and use AI more responsibly.
                      </p>

                      <small>
                        Your course progress is now
                        {" "}
                        5 / 8.
                      </small>
                    </div>

                    <Link
                      to="/learn/lesson/6"
                      className="lesson5-next-button"
                    >
                      Start Lesson 6 →
                    </Link>
                  </div>
                )}
            </>
          );

        default:
          return null;
      }
    };

  /* =========================================
     LOADING SCREEN
  ========================================== */

  if (progressLoading) {
    return (
      <div className="lesson5-page">
        <div className="lesson5-loading">
          Loading your lesson progress...
        </div>
      </div>
    );
  }

  /* =========================================
     MAIN UI
  ========================================== */

  return (
    <div className="lesson5-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="lesson5-header">
        <Link
          to="/learn"
          className="lesson5-back-button"
          aria-label="Back to Learn"
        >
          ←
        </Link>

        <div className="lesson5-heading">
          <span>
            LESSON 05
          </span>

          <h1>
            AI Safety
          </h1>
        </div>

        <div className="lesson5-header-progress">
          <span>
            {currentSectionIndex + 1} /{" "}
            {sections.length}
          </span>

          <div className="lesson5-progress-track">
            <div
              className="lesson5-progress-fill"
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* =====================================
          PROGRESS ERROR
      ====================================== */}

      {progressError && (
        <div className="lesson5-progress-error">
          {progressError}
        </div>
      )}

      {/* =====================================
          LAYOUT
      ====================================== */}

      <div className="lesson5-layout">

        {/* ===================================
            SIDEBAR
        ==================================== */}

        <aside className="lesson5-navigation">

          <div className="lesson5-nav-title">
            LESSON JOURNEY
          </div>

          {sections.map(
            (section) => {
              const locked =
                !savedCompleted &&
                section.id >
                  Math.min(
                    savedCompletedSections +
                      1,
                    sections.length
                  );

              const sectionCompleted =
                savedCompleted ||
                section.id <=
                  savedCompletedSections;

              return (
                <button
                  type="button"
                  key={section.id}
                  disabled={locked}
                  className={`lesson5-nav-item ${
                    activeSection ===
                    section.id
                      ? "active"
                      : ""
                  } ${
                    sectionCompleted
                      ? "completed"
                      : ""
                  } ${
                    locked
                      ? "locked"
                      : ""
                  }`}
                  onClick={() =>
                    goToSection(
                      section.id
                    )
                  }
                >
                  <span className="lesson5-nav-number">
                    {sectionCompleted
                      ? "✓"
                      : locked
                      ? "🔒"
                      : String(
                          section.id
                        ).padStart(
                          2,
                          "0"
                        )}
                  </span>

                  <span className="lesson5-nav-text">
                    <strong>
                      {section.title}
                    </strong>

                    <small>
                      {section.short}
                    </small>
                  </span>
                </button>
              );
            }
          )}

          <div className="lesson5-side-rule">
            <span>
              🛡️
            </span>

            <strong>
              Think before you share.
            </strong>

            <p>
              The safest AI user is not the person who knows
              every rule. It is the person who pauses and
              thinks when something matters.
            </p>
          </div>
        </aside>

        {/* ===================================
            CONTENT
        ==================================== */}

        <main className="lesson5-content">

          {/* =================================
              INTRO
          ================================== */}

          <section className="lesson5-intro">
            <span className="lesson5-kicker">
              CURIO · AI LITERACY
            </span>

            <h2>
              Use AI with confidence — and responsibility.
            </h2>

            <p>
              AI can help you learn, create and solve problems.
              This lesson teaches you how to protect your
              information, respect people, understand basic
              rules and recognise situations where extra
              caution is needed.
            </p>

            <div className="lesson5-principle">
              <span>
                🛡️
              </span>

              <div>
                <strong>
                  Core idea
                </strong>

                <p>
                  <b>
                    AI gives you power. Safety teaches you how
                    to use that power responsibly.
                  </b>
                </p>
              </div>
            </div>
          </section>

          {/* =================================
              ACTIVE LESSON CARD
          ================================== */}

          <section className="lesson5-card">

            <div
              id={`lesson5-section-${activeSection}`}
            >
              {renderSection()}
            </div>

            {/* =================================
                FOOTER NAVIGATION
            ================================== */}

            <div className="lesson5-footer">

              <button
                type="button"
                className="lesson5-secondary-button"
                onClick={
                  previousSection
                }
                disabled={
                  activeSection ===
                  1
                }
              >
                ← Previous
              </button>

              {activeSection ===
              8 ? (
                <button
                  type="button"
                  className="lesson5-primary-button"
                  onClick={
                    finishLesson
                  }
                  disabled={
                    checkedFinal.length !==
                    safetyQuestions.length ||
                    finalScore !==
                    safetyQuestions.length ||
                    progressSaving ||
                    completed
                  }
                >
                  {completed
                    ? "Lesson 5 Completed ✓"
                    : checkedFinal.length ===
                        safetyQuestions.length &&
                      finalScore ===
                        safetyQuestions.length
                    ? "Lesson 5 Completed ✓"
                    : "Complete 5 / 5 First"}
                </button>
              ) : (
                <button
                  type="button"
                  className="lesson5-primary-button"
                  onClick={
                    nextSection
                  }
                  disabled={
                    progressSaving ||
                    (
                      activeSection ===
                        7 &&
                      !scenarioPracticeComplete
                    )
                  }
                >
                  {progressSaving
                    ? "Saving..."
                    : "Continue →"}
                </button>
              )}
            </div>
          </section>

          {/* =================================
              SHORTCUTS
          ================================== */}

          <section className="lesson5-shortcuts-card">

            <span className="lesson5-step-label">
              CONNECTING TO LESSON 3
            </span>

            <h3>
              Safe prompting shortcuts
            </h3>

            <p>
              You can use prompting to make AI safer too. These
              shortcuts help you think about privacy and ethics;
              they do not replace your judgement.
            </p>

            <div className="lesson5-shortcuts-grid">
              {safetyShortcuts.map(
                (shortcut) => (
                  <div
                    key={
                      shortcut.command
                    }
                  >
                    <code>
                      {shortcut.command}
                    </code>

                    <span>
                      {
                        shortcut.description
                      }
                    </span>
                  </div>
                )
              )}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

export default Lesson5;