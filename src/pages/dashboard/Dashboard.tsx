import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.ts";

import {
  useAllLessonProgress,
} from "../../hooks/useLessonProgress.ts";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /*
    =========================================
    GUEST MODE
  =========================================
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

  /*
    =========================================
    SUPABASE LESSON PROGRESS
  =========================================

    Learn.tsx already uses this same hook.

    Dashboard now uses Supabase as the source
    of truth instead of relying only on
    localStorage.
  =========================================
  */

  const {
    progress: lessonProgress,
    loading: lessonProgressLoading,
    reload: reloadLessonProgress,
  } = useAllLessonProgress();

  /*
    =========================================
    READ COMPLETED LESSONS
  =========================================

    Keep the existing localStorage support.

    Supabase progress will be used first for
    the actual Dashboard progress.
  =========================================
  */

  /*
    =========================================
    READ LESSON SECTION PROGRESS
  =========================================

    IMPORTANT:

    Logged-in users:
      Supabase -> primary source

    Guest users:
      0% progress
  =========================================
  */

  const readSectionProgress = (
    lessonId: number
  ): number => {
    /*
      =========================================
      GUEST MODE
      =========================================
    */

    if (isGuest) {
      return 0;
    }

    /*
      =========================================
      SUPABASE IS THE ONLY SOURCE OF TRUTH
      =========================================

      Authenticated Dashboard progress is
      calculated only from completed_sections.

      The database `completed` flag is NOT
      allowed to turn a lesson into 100%.
    =========================================
    */

    const savedProgress =
      lessonProgress.find(
        (item) =>
          Number(item.lessonId) === lessonId
      );

    if (!savedProgress) {
      return 0;
    }

    const completedSections = Math.max(
      0,
      Math.min(
        Math.floor(
          Number(
            savedProgress.completedSections ?? 0
          )
        ),
        TOTAL_SECTIONS_PER_LESSON
      )
    );

    return Math.round(
      (completedSections /
        TOTAL_SECTIONS_PER_LESSON) *
        100
    );
  };

  /*
    =========================================
    GET LESSON PROGRESS
  =========================================
  */

  const getLessonProgress = (
    lessonId: number
  ): number => {
    if (isGuest) {
      return 0;
    }

    return readSectionProgress(
      lessonId
    );
  };

  /*
    =========================================
    REFRESH LEARNING PROGRESS
  =========================================
  */

  const refreshLearningProgress = () => {
    setProgressVersion(
      (previous) => previous + 1
    );

    /*
      Reload the actual Supabase data.
    */

    if (!isGuest) {
      void reloadLessonProgress();
    }
  };

  /*
    =========================================
    USER / PROFILE
  =========================================
  */

  const [userName, setUserName] = useState(
    isGuest ? "Guest" : "User"
  );

  const [userEmail, setUserEmail] =
    useState(
      isGuest ? "Guest account" : ""
    );

  const [showProfile, setShowProfile] =
    useState(false);

  /*
    =========================================
    ACCESSIBILITY
  =========================================
  */

  const [textScale, setTextScale] =
    useState(1);

  /*
    =========================================
    LESSON COMPLETION / PRACTICE ACCESS
  =========================================
  */

  const [
    completedLessonIds,
    setCompletedLessonIds,
  ] = useState<number[]>([]);

  const totalLessons = 8;

  const completedLessons =
    completedLessonIds.length;

  const lessonsCompleted =
    Math.min(
      completedLessons,
      totalLessons
    );

  /*
    =========================================
    FEATURE ACCESS
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

  const [
    showChangePassword,
    setShowChangePassword,
  ] = useState(false);

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    passwordMessage,
    setPasswordMessage,
  ] = useState("");

  const [
    isChangingPassword,
    setIsChangingPassword,
  ] = useState(false);

  /*
    =========================================
    LOAD CURRENT USER
  =========================================
  */

  useEffect(() => {
    const loadUser = async () => {
      /*
        GUEST MODE
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
      } =
        await supabase.auth.getUser();

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

    IMPORTANT:

    Use Supabase lesson progress.

    A lesson is completed when:
      completed === true

    OR

      completedSections >= 8
  =========================================
  */

  useEffect(() => {
    if (isGuest) {
      setCompletedLessonIds([]);
      return;
    }

    if (lessonProgressLoading) {
      return;
    }

    const completedIds =
      lessonProgress
        .filter(
          (lesson) =>
            Number(
              lesson.completedSections ?? 0
            ) >=
            TOTAL_SECTIONS_PER_LESSON
        )
        .map(
          (lesson) => lesson.lessonId
        )
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id >= 1 &&
            id <= totalLessons
        );

    setCompletedLessonIds(
      Array.from(
        new Set(completedIds)
      ).sort((a, b) => a - b)
    );
  }, [
    lessonProgress,
    lessonProgressLoading,
    isGuest,
  ]);

  /*
    =========================================
    LESSON COMPLETION EVENTS
  =========================================
  */

  useEffect(() => {
    const handleLessonCompleted =
      () => {
        refreshLearningProgress();
      };

    globalThis.addEventListener(
      "curio:lesson-completed",
      handleLessonCompleted
    );

    globalThis.addEventListener(
      "curio:lesson-progress-updated",
      handleLessonCompleted
    );

    globalThis.addEventListener(
      "storage",
      handleLessonCompleted
    );

    globalThis.addEventListener(
      "focus",
      handleLessonCompleted
    );

    return () => {
      globalThis.removeEventListener(
        "curio:lesson-completed",
        handleLessonCompleted
      );

      globalThis.removeEventListener(
        "curio:lesson-progress-updated",
        handleLessonCompleted
      );

      globalThis.removeEventListener(
        "storage",
        handleLessonCompleted
      );

      globalThis.removeEventListener(
        "focus",
        handleLessonCompleted
      );
    };
  }, [isGuest, reloadLessonProgress]);

  /*
    =========================================
    LEARNING PROGRESS LISTENERS
  =========================================
  */

  useEffect(() => {
    const handleProgressChange =
      () => {
        setProgressVersion(
          (previous) =>
            previous + 1
        );

        if (!isGuest) {
          void reloadLessonProgress();
        }
      };

    globalThis.addEventListener(
      "storage",
      handleProgressChange
    );

    globalThis.addEventListener(
      "curio:lesson-completed",
      handleProgressChange
    );

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          handleProgressChange();
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
  }, [
    isGuest,
    reloadLessonProgress,
  ]);

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

  const handleChangePassword =
    async () => {
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
        newPassword !==
        confirmPassword
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
  */

  const canGuestOpenLesson = (
    lessonId: number
  ) => {
    if (!isGuest) {
      return true;
    }

    return lessonId === 1;
  };

  const openLesson = (
    lessonId: number
  ) => {
    if (
      isGuest &&
      !canGuestOpenLesson(
        lessonId
      )
    ) {
      navigate("/login");
      return;
    }

    navigate(
      `/learn/lesson/${lessonId}`
    );
  };

  /*
    =========================================
    FEATURE ACCESS HELPERS
  =========================================
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
      icon: isGuest
        ? "🔒"
        : "✏️",
      path: "/practice",
      className:
        "dashboard-action-blue",
      locked:
        isGuest || !canPractice,
    },

    {
      title: "AI Literacy",
      description:
        isGuest
          ? "Sign in to unlock AI Literacy"
          : "Understand AI, spot synthetic content & think critically",
      icon: isGuest
        ? "🔒"
        : "🧠",
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
      style={
        {
          "--dashboard-text-scale":
            textScale,
        } as React.CSSProperties
      }
    >
      <aside className="dashboard-sidebar">

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
              onClick={
                openAISimulation
              }
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
              onClick={
                openAILiteracy
              }
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
            disabled={
              isLoggingOut
            }
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

      <main className="dashboard-main">

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
              aria-pressed={
                calmMode
              }
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

            <div
              className="dashboard-text-controls"
              aria-label="Text size controls"
            >
              <button
                type="button"
                className="dashboard-text-size-button"
                onClick={
                  decreaseTextSize
                }
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
                onClick={
                  increaseTextSize
                }
                aria-label="Increase text size"
                disabled={
                  textScale >= 1.3
                }
              >
                A+
              </button>
            </div>

            <button
              type="button"
              className="dashboard-notification-button"
              aria-label="Notifications"
            >
              🔔
            </button>

            <button
              type="button"
              className="dashboard-profile"
              onClick={() =>
                setShowProfile(
                  (previous) =>
                    !previous
                )
              }
              aria-expanded={
                showProfile
              }
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

            {showProfile && (
              <div className="dashboard-profile-panel">

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

                {!isGuest &&
                  showChangePassword && (
                    <div className="dashboard-password-box">

                      <input
                        type="password"
                        placeholder="New password"
                        value={
                          newPassword
                        }
                        onChange={(event) =>
                          setNewPassword(
                            event.target
                              .value
                          )
                        }
                        autoComplete="new-password"
                      />

                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={
                          confirmPassword
                        }
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target
                              .value
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

                <button
                  type="button"
                  className="dashboard-profile-logout"
                  onClick={
                    handleLogout
                  }
                  disabled={
                    isLoggingOut
                  }
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

        <div className="dashboard-content">

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
                                  width:
                                    "0%",
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

                          navigate(
                            "/login"
                          );
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