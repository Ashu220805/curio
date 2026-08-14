import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Learn.css";

function Learn() {
  const lessons = [
    {
      id: 1,
      number: "01",
      icon: "🧠",
      title: "AI Fundamentals",
      description:
        "Understand what Artificial Intelligence really is and how it works.",
      duration: "3 min",
    },
    {
      id: 2,
      number: "02",
      icon: "🤖",
      title: "Understanding AI Tools",
      description:
        "Explore ChatGPT, Gemini and other AI tools and understand what they can do.",
      duration: "4 min",
    },
    {
      id: 3,
      number: "03",
      icon: "💬",
      title: "What is a Prompt?",
      description:
        "Learn how to communicate clearly with AI and get better responses.",
      duration: "5 min",
    },
    {
      id: 4,
      number: "04",
      icon: "🔍",
      title: "Verifying AI Answers",
      description:
        "Learn how to check whether an AI answer is reliable or needs verification.",
      duration: "5 min",
    },
    {
      id: 5,
      number: "05",
      icon: "🛡️",
      title: "AI Safety",
      description:
        "Learn what information you should protect and how to use AI responsibly.",
      duration: "4 min",
    },
    {
      id: 6,
      number: "06",
      icon: "🌎",
      title: "AI in Real Life",
      description:
        "Discover practical ways to use AI for studying, creativity and everyday problems.",
      duration: "6 min",
    },
    {
      id: 7,
      number: "07",
      icon: "⚙️",
      title: "AI Workflows",
      description:
        "Learn how different AI tools can work together to complete bigger tasks.",
      duration: "7 min",
    },
    {
      id: 8,
      number: "08",
      icon: "🚀",
      title: "AI Independence",
      description:
        "Build the confidence to choose, use and question AI independently.",
      duration: "6 min",
    },
  ];

  /*
    =========================================================
    CURIO ACCESS MODE
    =========================================================

    Guest mode is stored in sessionStorage.

    IMPORTANT:
    We intentionally do NOT use the normal
    "curio_completed_lessons" localStorage key for guests.

    That key belongs to the logged-in user's learning
    progress and must never be exposed to Guest Mode.
  */

  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return sessionStorage.getItem("curio_guest") === "true";
  });

  /*
    =========================================================
    COMPLETED LESSONS
    =========================================================

    LOGGED-IN USER:
      Read the existing CURIO completion storage.

    GUEST:
      Never read the logged-in user's completion storage.

      Guest has only Lesson 1 as a free trial.

      We also support a separate guest-only key:
        curio_guest_completed_lessons

      This is optional and allows Lesson 1 to become
      completed if the lesson page stores guest completion.
  */

  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>(
    () => {
      const guestMode =
        sessionStorage.getItem("curio_guest") === "true";

      /*
        -----------------------------------------
        GUEST MODE
        -----------------------------------------
      */

      if (guestMode) {
        try {
          const guestStored = sessionStorage.getItem(
            "curio_guest_completed_lessons"
          );

          if (!guestStored) {
            return [];
          }

          const parsed = JSON.parse(guestStored);

          if (!Array.isArray(parsed)) {
            return [];
          }

          /*
            Guest can ONLY ever complete Lesson 1.
          */

          return parsed.filter(
            (id): id is number => id === 1
          );
        } catch {
          return [];
        }
      }

      /*
        -----------------------------------------
        NORMAL ACCOUNT MODE
        -----------------------------------------
      */

      try {
        const stored = localStorage.getItem(
          "curio_completed_lessons"
        );

        if (!stored) {
          return [];
        }

        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
          return [];
        }

        const valid = parsed.filter(
          (id): id is number =>
            typeof id === "number" &&
            id >= 1 &&
            id <= lessons.length
        );

        return Array.from(new Set(valid)).sort(
          (a, b) => a - b
        );
      } catch {
        return [];
      }
    }
  );

  /*
    =========================================================
    CHECK GUEST MODE
    =========================================================

    This protects the page if the user changes authentication
    state while staying on the Learn page.
  */

  useEffect(() => {
    const checkGuestMode = () => {
      const guestMode =
        sessionStorage.getItem("curio_guest") === "true";

      setIsGuest(guestMode);

      /*
        -----------------------------------------
        GUEST
        -----------------------------------------
      */

      if (guestMode) {
        try {
          const guestStored = sessionStorage.getItem(
            "curio_guest_completed_lessons"
          );

          if (!guestStored) {
            setCompletedLessonIds([]);
            return;
          }

          const parsed = JSON.parse(guestStored);

          if (!Array.isArray(parsed)) {
            setCompletedLessonIds([]);
            return;
          }

          const guestCompleted = parsed.filter(
            (id): id is number => id === 1
          );

          setCompletedLessonIds(
            Array.from(new Set(guestCompleted))
          );
        } catch {
          setCompletedLessonIds([]);
        }

        return;
      }

      /*
        -----------------------------------------
        LOGGED-IN USER
        -----------------------------------------
      */

      try {
        const stored = localStorage.getItem(
          "curio_completed_lessons"
        );

        if (!stored) {
          setCompletedLessonIds([]);
          return;
        }

        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
          setCompletedLessonIds([]);
          return;
        }

        const valid = parsed.filter(
          (id): id is number =>
            typeof id === "number" &&
            id >= 1 &&
            id <= lessons.length
        );

        setCompletedLessonIds(
          Array.from(new Set(valid)).sort(
            (a, b) => a - b
          )
        );
      } catch {
        // Keep current state if storage is invalid.
      }
    };

    /*
      Initial synchronization.
    */

    checkGuestMode();

    /*
      Lesson completion event.
    */

    window.addEventListener(
      "curio:lesson-completed",
      checkGuestMode
    );

    /*
      Storage changes.
    */

    window.addEventListener(
      "storage",
      checkGuestMode
    );

    /*
      When user returns to this tab.
    */

    window.addEventListener(
      "focus",
      checkGuestMode
    );

    /*
      Guest session changes.
    */

    window.addEventListener(
      "curio:guest-mode-changed",
      checkGuestMode
    );

    return () => {
      window.removeEventListener(
        "curio:lesson-completed",
        checkGuestMode
      );

      window.removeEventListener(
        "storage",
        checkGuestMode
      );

      window.removeEventListener(
        "focus",
        checkGuestMode
      );

      window.removeEventListener(
        "curio:guest-mode-changed",
        checkGuestMode
      );
    };
  }, []);


  /*
    =========================================================
    LESSON ACCESS / STATUS
    =========================================================

    LOGGED-IN USER:

      Completed → completed
      First incomplete → current
      Everything after → locked

    GUEST:

      Lesson 1 → current / completed
      Lesson 2–8 → locked

    This is the important separation that prevents
    Ashu's progress from appearing in Guest Mode.
  */

  const lessonsWithStatus = lessons.map((lesson) => {
    /*
      -----------------------------------------
      GUEST MODE
      -----------------------------------------
    */

    if (isGuest) {
      /*
        Guest completed Lesson 1.
      */

      if (
        lesson.id === 1 &&
        completedLessonIds.includes(1)
      ) {
        return {
          ...lesson,
          status: "completed" as const,
        };
      }

      /*
        Lesson 1 is the free trial.
      */

      if (lesson.id === 1) {
        return {
          ...lesson,
          status: "current" as const,
        };
      }

      /*
        Every lesson after Lesson 1 is locked
        until the user signs in.
      */

      return {
        ...lesson,
        status: "locked" as const,
      };
    }

    /*
      -----------------------------------------
      NORMAL ACCOUNT MODE
      -----------------------------------------
    */

    if (completedLessonIds.includes(lesson.id)) {
      return {
        ...lesson,
        status: "completed" as const,
      };
    }

    const firstIncompleteLesson = lessons.find(
      (item) => !completedLessonIds.includes(item.id)
    )?.id;

    return {
      ...lesson,
      status:
        lesson.id === firstIncompleteLesson
          ? ("current" as const)
          : ("locked" as const),
    };
  });


  /*
    =========================================================
    PROGRESS
    =========================================================
  */

  const completedLessons = isGuest
    ? completedLessonIds.filter((id) => id === 1).length
    : completedLessonIds.length;


  const currentLesson = lessonsWithStatus.find(
    (lesson) => lesson.status === "current"
  );


  const progress = Math.round(
    (completedLessons / lessons.length) * 100
  );


  return (
    <div className="learn-page">

      {/* =========================================
          HEADER
      ========================================== */}

      <header className="learn-header">

        <div className="learn-header-left">

          <Link
            to="/dashboard"
            className="learn-back-button"
          >
            ←
          </Link>

          <div>

            <span className="learn-header-label">
              CURIO LEARNING
            </span>

            <h1>
              Learn AI
            </h1>

          </div>

        </div>


        <div className="learn-header-progress">

          <div className="learn-header-progress-text">

            <span>
              {isGuest
                ? "Guest trial progress"
                : "Your progress"}
            </span>

            <strong>
              {completedLessons} / {lessons.length}
            </strong>

          </div>


          <div className="learn-header-progress-track">

            <div
              className="learn-header-progress-bar"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

      </header>


      {/* =========================================
          MAIN CONTENT
      ========================================== */}

      <main className="learn-content">


        {/* =========================================
            GUEST NOTICE
        ========================================== */}

        {isGuest && (
          <section className="learn-guest-notice">

            <div className="learn-guest-notice-icon">
              🎓
            </div>

            <div className="learn-guest-notice-content">

              <strong>
                You're exploring CURIO as a guest
              </strong>

              <p>
                Lesson 1 is free to try. Sign in to
                unlock the complete AI learning path
                and save your progress.
              </p>

            </div>

            <Link
              to="/login"
              className="learn-guest-signin-button"
              onClick={() => {
                sessionStorage.removeItem(
                  "curio_guest"
                );

                window.dispatchEvent(
                  new Event(
                    "curio:guest-mode-changed"
                  )
                );
              }}
            >
              Sign in
              <span>→</span>
            </Link>

          </section>
        )}


        {/* =========================================
            INTRO
        ========================================== */}

        <section className="learn-intro">

          <div>

            <span className="learn-intro-label">
              YOUR AI JOURNEY
            </span>

            <h2>
              Learn AI, one step at a time.
            </h2>

            <p>
              Start with the basics, practice what you learn,
              and gradually become confident using AI on your own.
            </p>

          </div>

          <div className="learn-intro-icon">
            🧠
          </div>

        </section>


        {/* =========================================
            CONTINUE LEARNING
        ========================================== */}

        {currentLesson && (
          <section className="learn-continue-section">

            <div className="learn-section-title">

              <div>

                <span>
                  {isGuest
                    ? "FREE TRIAL"
                    : "CONTINUE LEARNING"}
                </span>

                <h2>
                  {isGuest
                    ? "Start with your free Lesson 1 trial."
                    : "Pick up where you left off."}
                </h2>

              </div>

            </div>


            <div className="learn-continue-card">

              <div className="learn-continue-icon">
                {currentLesson.icon}
              </div>


              <div className="learn-continue-content">

                <div className="learn-lesson-number">

                  {currentLesson.number}

                  {" • "}

                  {isGuest
                    ? "FREE TRIAL"
                    : "CURRENT LESSON"}

                </div>


                <h3>
                  {currentLesson.title}
                </h3>


                <p>
                  {currentLesson.description}
                </p>


                <div className="learn-continue-meta">

                  <span>
                    ⏱ {currentLesson.duration}
                  </span>

                  <span>
                    •
                  </span>

                  <span>
                    Beginner
                  </span>

                </div>

              </div>


              <Link
                to={`/learn/lesson/${currentLesson.id}`}
                className="learn-continue-button"
              >
                {isGuest
                  ? "Try Lesson 1"
                  : "Continue"}

                <span>
                  →
                </span>

              </Link>

            </div>

          </section>
        )}


        {/* =========================================
            GUEST COMPLETED TRIAL
        ========================================== */}

        {isGuest &&
          !currentLesson &&
          completedLessonIds.includes(1) && (
            <section className="learn-guest-complete">

              <div className="learn-guest-complete-icon">
                ✓
              </div>

              <div>

                <strong>
                  You've completed the free trial.
                </strong>

                <p>
                  Sign in to continue your CURIO AI
                  learning journey and unlock Lessons 2–8.
                </p>

              </div>

              <Link
                to="/login"
                className="learn-guest-signin-button"
                onClick={() => {
                  sessionStorage.removeItem(
                    "curio_guest"
                  );
                }}
              >
                Sign in to continue
                <span>→</span>
              </Link>

            </section>
          )}


        {/* =========================================
            LEARNING PATH
        ========================================== */}

        <section className="learn-path-section">

          <div className="learn-section-title">

            <div>

              <span>
                YOUR LEARNING PATH
              </span>

              <h2>
                Build your AI skills
              </h2>

              <p>
                Follow the path from understanding AI
                to using it independently.
              </p>

            </div>


            <div className="learn-path-count">

              {isGuest
                ? "1 free lesson"
                : `${completedLessons} completed`}

            </div>

          </div>


          <div className="learn-path">

            {lessonsWithStatus.map(
              (lesson, index) => (

                <div
                  key={lesson.id}
                  className={`learn-lesson-card learn-lesson-${lesson.status}`}
                >


                  {/* =================================
                      LESSON NUMBER
                  ================================== */}

                  <div className="learn-lesson-number-column">

                    <div className="learn-lesson-number-circle">

                      {lesson.status === "completed"
                        ? "✓"
                        : lesson.status === "locked"
                        ? "🔒"
                        : lesson.number}

                    </div>


                    {index !== lessons.length - 1 && (
                      <div className="learn-lesson-line" />
                    )}

                  </div>


                  {/* =================================
                      LESSON ICON
                  ================================== */}

                  <div className="learn-lesson-icon">
                    {lesson.icon}
                  </div>


                  {/* =================================
                      LESSON CONTENT
                  ================================== */}

                  <div className="learn-lesson-content">

                    <div className="learn-lesson-top">

                      <span className="learn-lesson-label">
                        LESSON {lesson.number}
                      </span>


                      {lesson.status === "completed" && (
                        <span className="learn-status completed">
                          Completed
                        </span>
                      )}


                      {lesson.status === "current" && (
                        <span className="learn-status current">
                          {isGuest
                            ? "Free Trial"
                            : "In progress"}
                        </span>
                      )}


                      {lesson.status === "locked" && (
                        <span className="learn-status locked">
                          {isGuest
                            ? "Sign in required"
                            : "Locked"}
                        </span>
                      )}

                    </div>


                    <h3>
                      {lesson.title}
                    </h3>


                    <p>
                      {lesson.description}
                    </p>


                    <div className="learn-lesson-bottom">

                      <span>
                        ⏱ {lesson.duration}
                      </span>

                      <span>
                        •
                      </span>

                      <span>
                        Beginner
                      </span>

                    </div>

                  </div>


                  {/* =================================
                      LESSON ACTION
                  ================================== */}

                  <div className="learn-lesson-action">

                    {/* ---------------------------------
                        COMPLETED
                    ---------------------------------- */}

                    {lesson.status === "completed" && (
                      <>
                        {!isGuest ? (
                          <Link
                            to={`/learn/lesson/${lesson.id}`}
                            className="learn-review-button"
                          >
                            Review
                          </Link>
                        ) : (
                          <span className="learn-completed-trial">
                            Trial complete
                          </span>
                        )}
                      </>
                    )}


                    {/* ---------------------------------
                        CURRENT
                    ---------------------------------- */}

                    {lesson.status === "current" && (
                      <Link
                        to={`/learn/lesson/${lesson.id}`}
                        className="learn-start-button"
                      >
                        {isGuest
                          ? "Try lesson →"
                          : "Start →"}
                      </Link>
                    )}


                    {/* ---------------------------------
                        LOCKED
                    ---------------------------------- */}

                    {lesson.status === "locked" && (
                      <>
                        {isGuest ? (
                          <Link
                            to="/login"
                            className="learn-locked-text learn-guest-lock-link"
                            onClick={() => {
                              sessionStorage.removeItem(
                                "curio_guest"
                              );

                              window.dispatchEvent(
                                new Event(
                                  "curio:guest-mode-changed"
                                )
                              );
                            }}
                          >
                            🔒 Sign in to unlock
                          </Link>
                        ) : (
                          <span className="learn-locked-text">
                            Complete previous lesson
                          </span>
                        )}
                      </>
                    )}

                  </div>

                </div>

              )
            )}

          </div>

        </section>


        {/* =========================================
            LEARNING METHOD
        ========================================== */}

        <section className="learn-method-section">

          <div className="learn-method-heading">

            <span>
              HOW CURIO WORKS
            </span>

            <h2>
              Don't just watch. Learn by doing.
            </h2>

            <p>
              Every CURIO lesson gradually moves you from
              understanding an idea to actually using it.
            </p>

          </div>


          <div className="learn-method-grid">


            <div className="learn-method-card">

              <div className="learn-method-icon">
                👀
              </div>

              <strong>
                WATCH
              </strong>

              <p>
                Understand the concept through a short,
                simple explanation.
              </p>

            </div>


            <div className="learn-method-card">

              <div className="learn-method-icon">
                💡
              </div>

              <strong>
                SEE
              </strong>

              <p>
                See how the concept works through
                practical examples.
              </p>

            </div>


            <div className="learn-method-card">

              <div className="learn-method-icon">
                ✋
              </div>

              <strong>
                TRY
              </strong>

              <p>
                Try the concept yourself with an
                interactive activity.
              </p>

            </div>


            <div className="learn-method-card">

              <div className="learn-method-icon">
                🧠
              </div>

              <strong>
                PRACTICE
              </strong>

              <p>
                Solve a small challenge to make the
                knowledge stick.
              </p>

            </div>


          </div>

        </section>


      </main>

    </div>
  );
}

export default Learn;