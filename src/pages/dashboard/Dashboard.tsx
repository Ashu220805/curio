import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.ts";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /*
    =========================================
    GUEST MODE
  =========================================
    */

  /*
    IMPORTANT:
    Guest mode is completely separate from
    the logged-in user's learning progress.

    A guest must NEVER read:
    curio_completed_lessons

    from localStorage.
  */
  const isGuest =
    sessionStorage.getItem("curio_guest") === "true";

  /*
    =========================================
    LEARNING PROGRESS
  =========================================
    */

  const [progressVersion, setProgressVersion] = useState(0);

  const TOTAL_LESSONS = 8;
  const TOTAL_SECTIONS_PER_LESSON = 8;

  const readCompletedLessons = (): number[] => {
    /*
      =========================================
      GUEST PROTECTION
      =========================================

      Never use the logged-in user's
      localStorage progress while in Guest Mode.
    */

    if (isGuest) {
      return [];
    }

    try {
      const stored = localStorage.getItem(
        "curio_completed_lessons"
      );

      if (!stored) return [];

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) return [];

      return Array.from(
        new Set(
          parsed
            .map(Number)
            .filter(
              (lesson) =>
                Number.isInteger(lesson) &&
                lesson >= 1 &&
                lesson <= TOTAL_LESSONS
            )
        )
      );
    } catch {
      return [];
    }
  };

  const readSectionProgress = (
    lessonId: number
  ): number => {
    /*
      =========================================
      GUEST PROTECTION
      =========================================

      Guests do not inherit progress from
      an existing CURIO account.
    */

    if (isGuest) {
      return 0;
    }

    try {
      const completedLessons =
        readCompletedLessons();

      if (completedLessons.includes(lessonId)) {
        return 100;
      }

      const matchingKeys = Object.keys(
        localStorage
      ).filter((key) => {
        const lowerKey = key.toLowerCase();

        return (
          lowerKey.includes(`lesson${lessonId}`) &&
          lowerKey.includes("sections") &&
          lowerKey.includes("completed")
        );
      });

      let bestCount = 0;

      matchingKeys.forEach((key) => {
        try {
          const parsed = JSON.parse(
            localStorage.getItem(key) || "null"
          );

          if (Array.isArray(parsed)) {
            const validSections = parsed.filter(
              (item) =>
                item !== null &&
                item !== undefined
            );

            bestCount = Math.max(
              bestCount,
              validSections.length
            );
          }
        } catch {
          // Ignore unrelated localStorage values.
        }
      });

      if (bestCount <= 0) return 0;

      return Math.min(
        100,
        Math.round(
          (bestCount /
            TOTAL_SECTIONS_PER_LESSON) *
            100
        )
      );
    } catch {
      return 0;
    }
  };

  const getLessonProgress = (
    lessonId: number
  ): number => {
    /*
      =========================================
      GUEST MODE
      =========================================

      Guests always see zero dashboard
      progress because their progress is
      intentionally not connected to the
      logged-in user's localStorage.
    */

    if (isGuest) {
      return 0;
    }

    return readSectionProgress(lessonId);
  };

  const refreshLearningProgress = () => {
    setProgressVersion(
      (previous) => previous + 1
    );
  };

  /*
    =========================================
    USER / PROFILE
  =========================================
  */

  const [userName, setUserName] = useState(
    isGuest ? "Guest" : "User"
  );

  const [userEmail, setUserEmail] = useState(
    isGuest ? "Guest account" : ""
  );

  const [showProfile, setShowProfile] =
    useState(false);

  /*
    =========================================
    ACCESSIBILITY
  =========================================
  */

  /*
    1.0 = 100%
    0.9 = 90%
    1.1 = 110%
    1.2 = 120%
    1.3 = 130%
  */

  const [textScale, setTextScale] =
    useState(1);

  /*
    =========================================
    LESSON COMPLETION / PRACTICE ACCESS
  =========================================
  */

  const [completedLessonIds, setCompletedLessonIds] =
    useState<number[]>([]);

  const totalLessons = 8;

  const completedLessons =
    completedLessonIds.length;

  const lessonsCompleted =
    Math.min(completedLessons, totalLessons);

  /*
    =========================================
    FEATURE ACCESS
    =========================================

    Guest:
      Practice      -> locked
      AI Literacy   -> locked
      AI Simulation  -> locked

    Logged-in:
      Practice      -> unlocked only after
                      all 8 lessons

      AI Literacy   -> unlocked

      AI Simulation -> unlocked
  =========================================
  */

  const canPractice =
    !isGuest &&
    lessonsCompleted === totalLessons;

  const canAccessAILiteracy =
    !isGuest;

  const canAccessAISimulation =
    !isGuest;

  /*
    =========================================
    CALM MODE
  =========================================
  */

  const [calmMode, setCalmMode] =
    useState(false);

  /*
    =========================================
    CHANGE PASSWORD
  =========================================
  */

  const [showChangePassword, setShowChangePassword] =
    useState(false);

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [isChangingPassword, setIsChangingPassword] =
    useState(false);

  /*
    =========================================
    LOAD CURRENT USER
  =========================================
  */

  useEffect(() => {
    const loadUser = async () => {
      /*
        GUEST MODE
        -------------------------------------
        Do NOT ask Supabase for a user.
        Do NOT redirect to login.
      */

      if (
        sessionStorage.getItem(
          "curio_guest"
        ) === "true"
      ) {
        setUserName("Guest");
        setUserEmail("Guest account");
        return;
      }

      /*
        NORMAL SUPABASE USER
      */

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";

      setUserName(fullName);
      setUserEmail(user.email || "");
    };

    loadUser();
  }, [navigate]);

  /*
    =========================================
    LOAD LESSON COMPLETION
  =========================================
  */

  useEffect(() => {
    const loadLessonProgress = () => {
      /*
        Guest users NEVER get practice access.
        Their lesson progress is not used here.
      */

      if (
        sessionStorage.getItem("curio_guest") ===
        "true"
      ) {
        setCompletedLessonIds([]);
        return;
      }

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

        const validIds = parsed
          .map(Number)
          .filter(
            (id) =>
              Number.isInteger(id) &&
              id >= 1 &&
              id <= totalLessons
          );

        setCompletedLessonIds(
          Array.from(new Set(validIds)).sort(
            (a, b) => a - b
          )
        );
      } catch {
        setCompletedLessonIds([]);
      }
    };

    loadLessonProgress();

    /*
      Lesson pages dispatch this event after completion.
      This makes the dashboard update immediately.
    */

    const handleLessonCompleted = () => {
      loadLessonProgress();
    };

    globalThis.addEventListener(
      "curio:lesson-completed",
      handleLessonCompleted
    );

    globalThis.addEventListener(
      "storage",
      handleLessonCompleted
    );

    globalThis.addEventListener(
      "focus",
      loadLessonProgress
    );

    return () => {
      globalThis.removeEventListener(
        "curio:lesson-completed",
        handleLessonCompleted
      );

      globalThis.removeEventListener(
        "storage",
        handleLessonCompleted
      );

      globalThis.removeEventListener(
        "focus",
        loadLessonProgress
      );
    };
  }, []);

  /*
    =========================================
    LEARNING PROGRESS LISTENERS
  =========================================
  */

  useEffect(() => {
    const handleProgressChange = () => {
      refreshLearningProgress();
    };

    globalThis.addEventListener(
      "storage",
      handleProgressChange
    );

    globalThis.addEventListener(
      "curio:lesson-completed",
      handleProgressChange
    );

    const handleVisibilityChange = () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        refreshLearningProgress();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      globalThis.removeEventListener(
        "storage",
        handleProgressChange
      );

      globalThis.removeEventListener(
        "curio:lesson-completed",
        handleProgressChange
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  /*
    =========================================
    TEXT SIZE CONTROLS
  =========================================
  */

  const decreaseTextSize = () => {
    setTextScale((previous) => {
      const next = Number(
        (previous - 0.1).toFixed(1)
      );

      return Math.max(0.9, next);
    });
  };

  const increaseTextSize = () => {
    setTextScale((previous) => {
      const next = Number(
        (previous + 0.1).toFixed(1)
      );

      return Math.min(1.3, next);
    });
  };

  /*
    =========================================
    LOGOUT
  =========================================
  */

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      /*
        GUEST LOGOUT
        -------------------------------------
      */

      if (
        sessionStorage.getItem(
          "curio_guest"
        ) === "true"
      ) {
        sessionStorage.removeItem(
          "curio_guest"
        );

        setShowProfile(false);

        navigate("/login");
        return;
      }

      /*
        NORMAL SUPABASE LOGOUT
      */

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      navigate("/login");
    } catch (error) {
      console.error(
        "CURIO logout error:",
        error
      );

      setIsLoggingOut(false);
    }
  };

  /*
    =========================================
    CHANGE PASSWORD
  =========================================
  */

  const handleChangePassword = async () => {
    setPasswordMessage("");

    if (!newPassword) {
      setPasswordMessage(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setPasswordMessage(
        "Passwords do not match."
      );
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (error) {
        throw error;
      }

      setPasswordMessage(
        "Password changed successfully."
      );

      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(
        "CURIO password change error:",
        error
      );

      if (error instanceof Error) {
        setPasswordMessage(
          error.message
        );
      } else {
        setPasswordMessage(
          "Unable to change password."
        );
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  /*
    =========================================
    GUEST LESSON ACCESS
  =========================================

    Lesson 1 is the only free trial lesson.

    Lessons 2-8 are visible but locked.
  */

  const canGuestOpenLesson = (
    lessonId: number
  ) => {
    if (!isGuest) {
      return true;
    }

    return lessonId === 1;
  };

  const openLesson = (lessonId: number) => {
    /*
      =========================================
      GUEST
      =========================================
    */

    if (
      isGuest &&
      !canGuestOpenLesson(lessonId)
    ) {
      navigate("/login");
      return;
    }

    /*
      =========================================
      NORMAL USER
      =========================================
    */

    navigate(
      `/learn/lesson/${lessonId}`
    );
  };

  /*
    =========================================
    FEATURE ACCESS HELPERS
  =========================================
  */

  /*
    Practice:
      Guest -> login
      Logged-in but incomplete -> Learn AI
  */

  const openPractice = () => {
    if (isGuest) {
      navigate("/login");
      return;
    }

    if (!canPractice) {
      navigate("/learn");
      return;
    }

    navigate("/practice");
  };

  /*
    AI Literacy:
      Guest -> login
      Logged-in -> Reality Check
  */

  const openAILiteracy = () => {
    if (!canAccessAILiteracy) {
      navigate("/login");
      return;
    }

    navigate("/reality-check");
  };

  /*
    =========================================
    AI SIMULATION ACCESS
  =========================================
  
    Guest -> login
  
    Logged-in -> AI Simulation
  */

  const openAISimulation = () => {
    if (!canAccessAISimulation) {
      navigate("/login");
      return;
    }

    navigate("/ai-simulation");
  };

  /*
    =========================================
    LEARNING DATA
  =========================================
  */

  void progressVersion;

  const learningCards = [
    {
      id: 1,
      title:
        "What is Artificial Intelligence?",
      description:
        "Understand what AI is and how it works.",
      lesson: "Lesson 1",
      duration: "2 min",
      progress:
        getLessonProgress(1),
      icon: "🧠",
    },

    {
      id: 2,
      title:
        "Understanding AI Tools",
      description:
        "Explore ChatGPT, Gemini and other AI tools.",
      lesson: "Lesson 2",
      duration: "3 min",
      progress:
        getLessonProgress(2),
      icon: "🤖",
    },

    {
      id: 3,
      title:
        "What is a Prompt?",
      description:
        "Learn how to communicate effectively with AI.",
      lesson: "Lesson 3",
      duration: "3 min",
      progress:
        getLessonProgress(3),
      icon: "💬",
    },

    {
      id: 4,
      title:
        "Verifying AI Answers",
      description:
        "Learn how to check whether an AI answer is reliable.",
      lesson: "Lesson 4",
      duration: "3 min",
      progress:
        getLessonProgress(4),
      icon: "🔎",
    },

    {
      id: 5,
      title:
        "AI Safety",
      description:
        "Learn how to use AI safely, responsibly and ethically.",
      lesson: "Lesson 5",
      duration: "3 min",
      progress:
        getLessonProgress(5),
      icon: "🛡️",
    },

    {
      id: 6,
      title:
        "AI in Real Life",
      description:
        "Discover practical ways to use AI for everyday problems.",
      lesson: "Lesson 6",
      duration: "3 min",
      progress:
        getLessonProgress(6),
      icon: "🌍",
    },

    {
      id: 7,
      title:
        "AI Workflows",
      description:
        "Learn how different AI tools can work together on bigger tasks.",
      lesson: "Lesson 7",
      duration: "3 min",
      progress:
        getLessonProgress(7),
      icon: "⚙️",
    },

    {
      id: 8,
      title:
        "AI Independence",
      description:
        "Bring your AI skills together and become a confident AI user.",
      lesson: "Lesson 8",
      duration: "3 min",
      progress:
        getLessonProgress(8),
      icon: "🚀",
    },
  ];

  const overallProgress = isGuest
    ? 0
    : Math.round(
        learningCards.reduce(
          (total, card) =>
            total + card.progress,
          0
        ) / TOTAL_LESSONS
      );

  /*
    =========================================
    QUICK ACTIONS
  =========================================
  */

  const quickActions = [
    {
      title: "Learn AI",
      description: "Start a new lesson",
      icon: "📖",
      path: "/learn",
      className:
        "dashboard-action-green",
      locked: false,
    },

    {
      title: "Practice",
      description:
        isGuest
          ? "Sign in to unlock practice"
          : "Test your knowledge",
      icon: isGuest ? "🔒" : "✏️",
      path: "/practice",
      className:
        "dashboard-action-blue",
      locked: isGuest || !canPractice,
    },

    /*
      =========================================
      AI LITERACY / REALITY CHECK
      =========================================

      Guest users can see that the feature
      exists, but cannot enter it.

      Logged-in users can access it normally.
    */

    {
      title: "AI Literacy",
      description:
        isGuest
          ? "Sign in to unlock AI Literacy"
          : "Understand AI, spot synthetic content & think critically",
      icon: isGuest ? "🔒" : "🧠",
      path: "/reality-check",
      className:
        "dashboard-action-reality",
      locked: isGuest,
    },
  ];

  /*
    =========================================
    DASHBOARD
  =========================================
  */

  return (
    <div
      className={`dashboard-page ${
        textScale !== 1
          ? "dashboard-large-text"
          : ""
      } ${
        calmMode
          ? "dashboard-calm-mode"
          : ""
      }`}
      /*
        IMPORTANT:
        This variable allows Dashboard.css
        to control the dashboard scale without
        changing the profile panel scale.
      */
      style={
        {
          "--dashboard-text-scale":
            textScale,
        } as React.CSSProperties
      }
    >
      {/* =========================================
          SIDEBAR
      ========================================== */}

      <aside className="dashboard-sidebar">

        {/* LOGO */}

        <div className="dashboard-logo">
          <img
            src="/curio-symbol.png"
            alt="CURIO"
            className="dashboard-logo-image"
          />

          <div>
            <div className="dashboard-logo-name">
              CURIO
            </div>

            <div className="dashboard-logo-tagline">
              Learn AI. Use AI. Question AI.
            </div>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="dashboard-navigation">

          <Link
            to="/dashboard"
            className="dashboard-nav-item dashboard-nav-active"
          >
            <span className="dashboard-nav-icon">
              🏠
            </span>

            <span>
              Home
            </span>
          </Link>


          {/* =========================================
              LEARN AI

              Guests can enter Learn AI because
              Lesson 1 is the free trial.

              Lessons 2-8 remain locked inside
              the learning area.
          ========================================== */}

          <Link
            to="/learn"
            className="dashboard-nav-item"
          >
            <span className="dashboard-nav-icon">
              📖
            </span>

            <span>
              Learn AI
            </span>
          </Link>


          {/* =========================================
              AI SIMULATION

              Guests cannot enter.

              Logged-in users can access the
              AI Simulation page.
          ========================================== */}

          {canAccessAISimulation ? (
            <Link
              to="/ai-simulation"
              className="dashboard-nav-item"
            >
              <span className="dashboard-nav-icon">
                🤖
              </span>

              <span>
                AI Simulation
              </span>
            </Link>
          ) : (
            <button
              type="button"
              className="dashboard-nav-item dashboard-nav-locked"
              onClick={openAISimulation}
              title="Sign in to unlock AI Simulation"
            >
              <span className="dashboard-nav-icon">
                🔒
              </span>

              <span>
                AI Simulation
              </span>
            </button>
          )}


          {/* =========================================
              AI LITERACY

              Guests cannot enter.
          ========================================== */}

          {canAccessAILiteracy ? (
            <Link
              to="/reality-check"
              className="dashboard-nav-item"
            >
              <span className="dashboard-nav-icon">
                🧠
              </span>

              <span>
                AI Literacy
              </span>
            </Link>
          ) : (
            <button
              type="button"
              className="dashboard-nav-item dashboard-nav-locked"
              onClick={openAILiteracy}
              title="Sign in to unlock AI Literacy"
            >
              <span className="dashboard-nav-icon">
                🔒
              </span>

              <span>
                AI Literacy
              </span>
            </button>
          )}


          {/* =========================================
              PRACTICE

              Guest:
                locked

              Logged-in but lessons incomplete:
                locked

              Logged-in + all 8 lessons:
                unlocked
          ========================================== */}

          {canPractice ? (
            <Link
              to="/practice"
              className="dashboard-nav-item"
            >
              <span className="dashboard-nav-icon">
                ✨
              </span>

              <span>
                Practice
              </span>
            </Link>
          ) : (
            <button
              type="button"
              className="dashboard-nav-item dashboard-nav-locked"
              onClick={openPractice}
              title={
                isGuest
                  ? "Sign in to unlock Practice"
                  : `Complete all 8 lessons to unlock Practice (${lessonsCompleted}/8)`
              }
            >
              <span className="dashboard-nav-icon">
                🔒
              </span>

              <span>
                Practice
              </span>
            </button>
          )}

        </nav>


        {/* SIDEBAR BOTTOM */}

        <div className="dashboard-sidebar-bottom">

          <div className="dashboard-learning-style">

            <div className="dashboard-learning-style-title">
              Your Learning Style
            </div>

            <div className="dashboard-learning-style-value">
              Visual • Step-by-step
            </div>

            <button
              type="button"
              className="dashboard-change-button"
            >
              Change
            </button>

          </div>


          <button
            type="button"
            className="dashboard-logout-button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <span>
              ↪
            </span>

            <span>
              {isLoggingOut
                ? "Signing out..."
                : "Sign out"}
            </span>
          </button>

        </div>

      </aside>


      {/* =========================================
          MAIN AREA
      ========================================== */}

      <main className="dashboard-main">

        {/* =========================================
            TOP HEADER
        ========================================== */}

        <header className="dashboard-header">

          <div className="dashboard-mobile-logo">
            CURIO
          </div>


          <div className="dashboard-search">

            <span className="dashboard-search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search lessons, topics or AI tools..."
              aria-label="Search"
            />

          </div>


          <div className="dashboard-header-actions">

            {/* =====================================
                CALM MODE
            ====================================== */}

            <button
              type="button"
              className={`dashboard-header-button ${
                calmMode
                  ? "dashboard-header-button-active"
                  : ""
              }`}
              onClick={() =>
                setCalmMode(
                  (previous) =>
                    !previous
                )
              }
              aria-pressed={calmMode}
            >

              <span
                className="dashboard-calm-icon"
                aria-hidden="true"
              >
                🌿
              </span>

              <span>
                {calmMode
                  ? "Calm On"
                  : "Calm Mode"}
              </span>

            </button>


            {/* =====================================
                TEXT SIZE
            ====================================== */}

            <div
              className="dashboard-text-controls"
              aria-label="Text size controls"
            >

              <button
                type="button"
                className="dashboard-text-size-button"
                onClick={decreaseTextSize}
                aria-label="Decrease text size"
                disabled={
                  textScale <= 0.9
                }
              >
                A−
              </button>


              <span
                className="dashboard-text-size-label"
                aria-live="polite"
              >
                {Math.round(
                  textScale * 100
                )}%
              </span>


              <button
                type="button"
                className="dashboard-text-size-button"
                onClick={increaseTextSize}
                aria-label="Increase text size"
                disabled={
                  textScale >= 1.3
                }
              >
                A+
              </button>

            </div>


            {/* =====================================
                NOTIFICATIONS
            ====================================== */}

            <button
              type="button"
              className="dashboard-notification-button"
              aria-label="Notifications"
            >
              🔔
            </button>


            {/* =====================================
                PROFILE
            ====================================== */}

            <button
              type="button"
              className="dashboard-profile"
              onClick={() =>
                setShowProfile(
                  (previous) =>
                    !previous
                )
              }
              aria-expanded={showProfile}
              aria-label="Open profile menu"
            >

              <div className="dashboard-avatar">
                🧑🏻
              </div>

              <div className="dashboard-profile-text">

                <strong>
                  Hi, {userName} 👋
                </strong>

                <span>
                  {isGuest
                    ? "Guest"
                    : "Beginner"}
                </span>

              </div>

              <span
                className="dashboard-profile-arrow"
                aria-hidden="true"
              >
                {showProfile
                  ? "⌃"
                  : "⌄"}
              </span>

            </button>


            {/* =========================================
                PROFILE PANEL
            ========================================== */}

            {showProfile && (

              <div className="dashboard-profile-panel">

                {/* PROFILE HEADER */}

                <div className="dashboard-profile-panel-header">

                  <div className="dashboard-profile-large-avatar">
                    🧑🏻
                  </div>

                  <div>

                    <strong>
                      {userName}
                    </strong>

                    <span>
                      {isGuest
                        ? "Exploring CURIO"
                        : "Beginner learner"}
                    </span>

                  </div>

                </div>


                <div className="dashboard-profile-divider" />


                {/* PROFILE INFORMATION */}

                <div className="dashboard-profile-info">

                  <div>

                    <span>
                      Full name
                    </span>

                    <strong>
                      {userName}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Email address
                    </span>

                    <strong>
                      {userEmail}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Account
                    </span>

                    <strong>
                      {isGuest
                        ? "Guest"
                        : "CURIO Learner"}
                    </strong>

                  </div>


                  {!isGuest && (

                    <div>

                      <span>
                        Password
                      </span>

                      <strong>
                        ••••••••
                      </strong>

                    </div>

                  )}

                </div>


                {/* GUEST MESSAGE */}

                {isGuest && (

                  <div className="dashboard-guest-message">

                    <strong>
                      ✨ You're exploring as a guest
                    </strong>

                    <p>
                      Lesson 1 is your free
                      trial. Sign in to unlock
                      the remaining CURIO
                      lessons, Practice and
                      AI Literacy, and save
                      your progress.
                    </p>

                  </div>

                )}


                {/* CHANGE PASSWORD */}

                {!isGuest && (

                  <button
                    type="button"
                    className="dashboard-profile-action"
                    onClick={() =>
                      setShowChangePassword(
                        (previous) =>
                          !previous
                      )
                    }
                  >
                    🔐 Change Password
                  </button>

                )}


                {/* PASSWORD FORM */}

                {!isGuest &&
                  showChangePassword && (

                    <div className="dashboard-password-box">

                      <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(
                            event.target.value
                          )
                        }
                        autoComplete="new-password"
                      />


                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value
                          )
                        }
                        autoComplete="new-password"
                      />


                      <button
                        type="button"
                        onClick={
                          handleChangePassword
                        }
                        disabled={
                          isChangingPassword
                        }
                      >
                        {isChangingPassword
                          ? "Changing..."
                          : "Update Password"}
                      </button>


                      {passwordMessage && (

                        <p className="dashboard-password-message">
                          {passwordMessage}
                        </p>

                      )}

                    </div>

                  )}


                {/* PROFILE LOGOUT */}

                <button
                  type="button"
                  className="dashboard-profile-logout"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  ↪{" "}

                  {isLoggingOut
                    ? "Signing out..."
                    : "Sign out"}
                </button>

              </div>

            )}

          </div>

        </header>


        {/* =========================================
            CONTENT
        ========================================== */}

        <div className="dashboard-content">


          {/* =========================================
              WELCOME
          ========================================== */}

          <section className="dashboard-welcome">

            <h1>
              Good morning, {userName}! 👋
            </h1>

            <p>
              {isGuest
                ? "Welcome to CURIO! Explore Lesson 1 as your free trial."
                : "Welcome back! Continue your AI learning journey."}
            </p>

          </section>


          {/* =========================================
              MAIN LEARNING HERO
          ========================================== */}

          <section className="dashboard-learning-hero">

            <div className="dashboard-hero-content">

              <span className="dashboard-hero-label">
                YOUR NEXT STEP
              </span>

              <h2>
                Let's learn, practice
                <br />
                and master AI together.
              </h2>

              <p>
                Short lessons, interactive practice
                and real-world AI skills.
              </p>


              <Link
                to="/learn"
                className="dashboard-primary-button"
              >
                Continue Learning

                <span>
                  →
                </span>
              </Link>

            </div>


            <div className="dashboard-hero-visual">

              <div className="dashboard-brain">
                🧠
              </div>

              <div className="dashboard-hero-circle dashboard-circle-one">
                💡
              </div>

              <div className="dashboard-hero-circle dashboard-circle-two">
                💬
              </div>

              <div className="dashboard-hero-circle dashboard-circle-three">
                ✨
              </div>

            </div>

          </section>


          {/* =========================================
              CONTINUE LEARNING
          ========================================== */}

          <section className="dashboard-section">

            <div className="dashboard-section-heading">

              <div>

                <h2>
                  Continue Learning
                </h2>

                <p>
                  {isGuest
                    ? "Start with your free Lesson 1 trial."
                    : "Pick up where you left off."}
                </p>

              </div>


              <Link
                to="/learn"
                className="dashboard-view-all"
              >
                View all →
              </Link>

            </div>


            <div className="dashboard-learning-grid">

              {learningCards.map(
                (card) => {

                  /*
                    =================================
                    GUEST LOCKED LESSON
                    =================================

                    Lesson 1:
                    freely accessible.

                    Lessons 2-8:
                    visible but locked.
                  */

                  if (
                    isGuest &&
                    card.id !== 1
                  ) {

                    return (

                      <button
                        type="button"
                        className="dashboard-learning-card dashboard-learning-card-locked"
                        key={card.id}
                        onClick={() =>
                          openLesson(
                            card.id
                          )
                        }
                      >

                        <div className="dashboard-learning-card-icon">
                          {card.icon}
                        </div>


                        <div className="dashboard-learning-card-content">

                          <div className="dashboard-guest-lock-label">
                            🔒 SIGN IN TO UNLOCK
                          </div>

                          <h3>
                            {card.title}
                          </h3>

                          <p>
                            {card.description}
                          </p>


                          <div className="dashboard-card-meta">

                            <span>
                              {card.lesson}
                            </span>

                            <span>
                              •
                            </span>

                            <span>
                              {card.duration}
                            </span>

                          </div>


                          <div className="dashboard-progress">

                            <div className="dashboard-progress-track">

                              <div
                                className="dashboard-progress-bar"
                                style={{
                                  width: "0%",
                                }}
                              />

                            </div>

                            <span>
                              Locked
                            </span>

                          </div>

                        </div>

                      </button>

                    );

                  }


                  /*
                    =================================
                    NORMAL LESSON CARD
                    =================================
                  */

                  return (

                    <Link
                      to={`/learn/lesson/${card.id}`}
                      className={`dashboard-learning-card ${
                        isGuest &&
                        card.id === 1
                          ? "dashboard-learning-card-trial"
                          : ""
                      }`}
                      key={card.id}
                    >

                      <div className="dashboard-learning-card-icon">
                        {card.icon}
                      </div>


                      <div className="dashboard-learning-card-content">

                        {isGuest &&
                          card.id === 1 && (

                            <div className="dashboard-guest-trial-label">
                              FREE TRIAL
                            </div>

                          )}


                        <h3>
                          {card.title}
                        </h3>

                        <p>
                          {card.description}
                        </p>


                        <div className="dashboard-card-meta">

                          <span>
                            {card.lesson}
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {card.duration}
                          </span>

                        </div>


                        <div className="dashboard-progress">

                          <div className="dashboard-progress-track">

                            <div
                              className="dashboard-progress-bar"
                              style={{
                                width: `${card.progress}%`,
                              }}
                            />

                          </div>

                          <span>
                            {card.progress}%
                          </span>

                        </div>

                      </div>

                    </Link>

                  );

                }
              )}

            </div>


            {/* =========================================
                GUEST SIGN-IN MESSAGE
            ========================================== */}

            {isGuest && (

              <div className="dashboard-guest-learning-message">

                <div className="dashboard-guest-learning-icon">
                  🔓
                </div>

                <div>

                  <strong>
                    Enjoying CURIO?
                  </strong>

                  <p>
                    Lesson 1 is free to explore.
                    Sign in to unlock Lessons
                    2–8, Practice and AI
                    Literacy, and save your
                    learning progress.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/login")
                  }
                >
                  Sign in →
                </button>

              </div>

            )}

          </section>


          {/* =========================================
              QUICK ACTIONS
          ========================================== */}

          <section className="dashboard-section dashboard-quick-section">

            <div className="dashboard-section-heading">

              <div>

                <h2>
                  What would you like to do today?
                </h2>

                <p>
                  Choose a path and keep building your AI skills.
                </p>

              </div>

            </div>


            <div className="dashboard-actions-grid">

              {quickActions.map(
                (action) => {

                  /*
                    =================================
                    LOCKED QUICK ACTION
                    =================================

                    Guests cannot directly enter
                    Practice or AI Literacy.

                    Clicking the card takes them
                    to login instead.
                  */

                  if (action.locked) {

                    return (

                      <button
                        key={action.title}
                        type="button"
                        className={`dashboard-action-card ${action.className} dashboard-action-locked`}
                        onClick={() => {
                          if (
                            action.title ===
                            "Practice"
                          ) {
                            openPractice();
                            return;
                          }

                          if (
                            action.title ===
                            "AI Literacy"
                          ) {
                            openAILiteracy();
                            return;
                          }

                          navigate("/login");
                        }}
                        title={
                          isGuest
                            ? `Sign in to unlock ${action.title}`
                            : action.title ===
                              "Practice"
                            ? `Complete all 8 lessons to unlock Practice (${lessonsCompleted}/8)`
                            : action.title
                        }
                      >

                        <div className="dashboard-action-icon">
                          {action.icon}
                        </div>


                        <div>

                          <h3>
                            {action.title}
                          </h3>

                          <p>
                            {action.description}
                          </p>

                        </div>

                      </button>

                    );

                  }


                  /*
                    =================================
                    NORMAL QUICK ACTION
                    =================================
                  */

                  return (

                    <Link
                      key={action.title}
                      to={action.path}
                      className={`dashboard-action-card ${action.className}`}
                    >

                      <div className="dashboard-action-icon">
                        {action.icon}
                      </div>


                      <div>

                        <h3>
                          {action.title}
                        </h3>

                        <p>
                          {action.description}
                        </p>

                      </div>

                    </Link>

                  );

                }
              )}

            </div>

          </section>


          {/* =========================================
              SIMPLE PROGRESS
          ========================================== */}

          <section className="dashboard-progress-section">

            <div>

              <span className="dashboard-progress-label">
                YOUR PROGRESS
              </span>

              <h2>
                {isGuest
                  ? "Start your AI journey! 🌱"
                  : "You're building momentum! 🚀"}
              </h2>

              <p>
                {isGuest
                  ? "Lesson 1 is your free starting point. Sign in to save your progress."
                  : "Keep learning a little every day."}
              </p>

            </div>


            <div className="dashboard-overall-progress">

              <div className="dashboard-overall-progress-number">
                {overallProgress}%
              </div>


              <div className="dashboard-overall-progress-track">

                <div
                  className="dashboard-overall-progress-bar"
                  style={{
                    width: `${overallProgress}%`,
                  }}
                />

              </div>


              <span>
                {isGuest
                  ? "Guest trial progress"
                  : "Overall learning progress"}
              </span>

            </div>

          </section>


        </div>

      </main>

    </div>
  );
}

export default Dashboard;