import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.ts";
import { useAllLessonProgress } from "../../hooks/useLessonProgress.ts";
import "./Dashboard.css";
function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}


function Dashboard() {
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);


  /*
    =========================================
    LEARNING PROGRESS
  =========================================

    Use the existing CURIO lesson-progress
    system instead of hard-coded percentages.
  =========================================
  */

  const TOTAL_LESSONS = 8;
  const TOTAL_SECTIONS_PER_LESSON = 8;

  const {
    progress: lessonProgress,
    loading: lessonProgressLoading,
    reload: reloadLessonProgress,
  } = useAllLessonProgress();


  /*
    =========================================
    GUEST MODE
  =========================================
  */

  const [isGuest, setIsGuest] = useState(false);

  /*
    =========================================
    LESSON PROGRESS HELPERS
  =========================================
  */

  const getLessonProgress = (
    lessonId: number
  ): number => {
    if (isGuest) {
      return 0;
    }

    const savedProgress =
      lessonProgress.find(
        (item) =>
          item.lessonId === lessonId
      );

    if (!savedProgress) {
      return 0;
    }

    const completedSections = Math.max(
      0,
      Math.min(
        Number(
          savedProgress.completedSections ?? 0
        ),
        TOTAL_SECTIONS_PER_LESSON
      )
    );

    if (
      savedProgress.completed === true ||
      completedSections >=
        TOTAL_SECTIONS_PER_LESSON
    ) {
      return 100;
    }

    return Math.round(
      (completedSections /
        TOTAL_SECTIONS_PER_LESSON) *
        100
    );
  };

  const overallProgress = isGuest
    ? 0
    : Math.round(
        Array.from(
          { length: TOTAL_LESSONS },
          (_, index) =>
            getLessonProgress(index + 1)
        ).reduce(
          (total, progress) =>
            total + progress,
          0
        ) / TOTAL_LESSONS
      );

  /*
    =========================================
    REFRESH LESSON PROGRESS
  =========================================
  */

  useEffect(() => {
    if (isGuest) {
      return;
    }

    const refresh = () => {
      void reloadLessonProgress();
    };

    globalThis.addEventListener(
      "curio:lesson-completed",
      refresh
    );

    globalThis.addEventListener(
      "storage",
      refresh
    );

    const handleVisibilityChange = () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        refresh();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      globalThis.removeEventListener(
        "curio:lesson-completed",
        refresh
      );

      globalThis.removeEventListener(
        "storage",
        refresh
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
    USER PROFILE
  =========================================
  */

  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  /*
    =========================================
    PROFILE MENU
  =========================================
  */

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  /*
    =========================================
    CALM MODE
  =========================================
  */

  const [isCalmMode, setIsCalmMode] = useState(false);

  /*
    =========================================
    TEXT SIZE
  =========================================
  */

  const [textScale, setTextScale] = useState(1);

  /*
    =========================================
    NOTIFICATIONS
  =========================================
  */

  const [isNotificationOpen, setIsNotificationOpen] =
    useState(false);

  /*
    =========================================
    CHECK GUEST / AUTH USER
  =========================================
  */

  useEffect(() => {
    const guestMode =
      sessionStorage.getItem("curio_guest") === "true";

    setIsGuest(guestMode);

    if (guestMode) {
      /*
        Guest must NEVER use the Supabase user's
        name or email.
      */

      setUserName("Guest");
      setUserEmail("");

      return;
    }

    /*
      =========================================
      LOAD REAL SUPABASE USER
      =========================================
    */

    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User";

        setUserName(fullName);
        setUserEmail(user.email || "");
      } catch (error) {
        console.error(
          "CURIO dashboard user error:",
          error
        );

        navigate("/login", {
          replace: true,
        });
      }
    };

    loadUser();
  }, [navigate]);

  /*
    =========================================
    LOGOUT
  =========================================
  */

  const handleLogout = async () => {
    setIsLoggingOut(true);

    /*
      =========================================
      GUEST LOGOUT
      =========================================
    */

    if (isGuest) {
      sessionStorage.removeItem("curio_guest");

      setIsGuest(false);
      setIsProfileOpen(false);

      navigate("/login", {
        replace: true,
      });

      return;
    }

    /*
      =========================================
      NORMAL SUPABASE LOGOUT
      =========================================
    */

    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      navigate("/login", {
        replace: true,
      });
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
    CALM MODE
  =========================================
  */

  const handleCalmMode = () => {
    setIsCalmMode(
      (previous) => !previous
    );
  };

  /*
    =========================================
    TEXT SIZE
  =========================================
  */

  const increaseTextSize = () => {
    setTextScale(
      (previous) =>
        Math.min(previous + 0.1, 1.4)
    );
  };

  const decreaseTextSize = () => {
    setTextScale(
      (previous) =>
        Math.max(previous - 0.1, 0.8)
    );
  };

  /*
    =========================================
    LEARNING DATA
  =========================================
  */

  const learningCards = [
    {
      id: 1,
      title: "What is Artificial Intelligence?",
      description:
        "Understand what AI is and how it works.",
      lesson: "Lesson 1",
      duration: "2 min",
      progress: getLessonProgress(1),
      path: "/learn/lesson/1",
      icon: "🧠",
    },
    {
      id: 2,
      title: "Understanding AI Tools",
      description:
        "Explore ChatGPT, Gemini and other AI tools.",
      lesson: "Lesson 2",
      duration: "3 min",
      progress: getLessonProgress(2),
      path: "/learn/lesson/2",
      icon: "🤖",
    },
    {
      id: 3,
      title: "What is a Prompt?",
      description:
        "Learn how to communicate effectively with AI.",
      lesson: "Lesson 3",
      duration: "3 min",
      progress: getLessonProgress(3),
      path: "/learn/lesson/3",
      icon: "💬",
    },
    {
      id: 4,
      title: "AI Safety Basics",
      description:
        "Learn what information you should and shouldn't share.",
      lesson: "Lesson 4",
      duration: "2 min",
      progress: getLessonProgress(4),
      path: "/learn/lesson/4",
      icon: "🛡️",
    },
  ];

  /*
    =========================================
    QUICK ACTIONS
  =========================================
  */

  const quickActions = [
    {
      title: "Learn AI",
      description: "Start or continue a lesson",
      icon: "📖",
      path: "/learn",
      className:
        "dashboard-action-green",
    },
    {
      title: "Practice",
      description: "Test your knowledge",
      icon: "✏️",
      path: "/practice",
      className:
        "dashboard-action-blue",
    },
    {
      title: "AI Literacy",
      description: "Think critically about AI",
      icon: "🧠",
      path: "/reality-check",
      className:
        "dashboard-action-teal",
    },
    {
      title: "AI Simulation",
      description: "Practice using AI",
      icon: "🤖",
      path: "/ai-simulation",
      className:
        "dashboard-action-purple",
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
        isGuest
          ? "dashboard-guest-mode"
          : ""
      } ${
        isCalmMode
          ? "dashboard-calm-mode"
          : ""
      }`}
      style={{
        fontSize: `${textScale}em`,
      }}
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

        {/*
          The dashboard sidebar is intentionally kept focused on
          the dashboard itself. Lesson/tool navigation is handled
          by the dashboard Quick Actions and by the Learn AI page.
          This keeps the dashboard and Learn AI responsibilities
          separate for both signed-in and guest users.
        */}
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

            {/* CALM MODE */}

            <button
              type="button"
              className={`dashboard-header-button ${
                isCalmMode
                  ? "dashboard-header-button-active"
                  : ""
              }`}
              onClick={handleCalmMode}
              aria-pressed={isCalmMode}
            >
              🌿

              <span>
                {isCalmMode
                  ? "Calm On"
                  : "Calm Mode"}
              </span>
            </button>


            {/* TEXT SIZE */}

            <div className="dashboard-text-controls">

              <button
                type="button"
                className="dashboard-header-button"
                onClick={decreaseTextSize}
                aria-label="Decrease text size"
              >
                A−
              </button>

              <button
                type="button"
                className="dashboard-header-button"
                onClick={increaseTextSize}
                aria-label="Increase text size"
              >
                A+
                <span>
                  Text
                </span>
              </button>

            </div>


            {/* NOTIFICATIONS */}

            <div className="dashboard-notification-wrapper">

              <button
                type="button"
                className="dashboard-notification-button"
                aria-label="Notifications"
                onClick={() =>
                  setIsNotificationOpen(
                    (previous) => !previous
                  )
                }
              >
                🔔
              </button>


              {isNotificationOpen && (

                <div className="dashboard-notification-menu">

                  <div className="dashboard-notification-title">
                    Notifications
                  </div>

                  <div className="dashboard-notification-empty">
                    No new notifications.
                  </div>

                </div>

              )}

            </div>


            {/* PROFILE */}

            <div className="dashboard-profile-wrapper">

              <button
                type="button"
                className={`dashboard-profile ${
                  isGuest
                    ? "dashboard-profile-guest"
                    : ""
                }`}
                onClick={() =>
                  setIsProfileOpen(
                    (previous) => !previous
                  )
                }
                aria-expanded={isProfileOpen}
              >

                <div className="dashboard-avatar">
                  {isGuest
                    ? "👤"
                    : "🧑🏻"}
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

              </button>


              {isProfileOpen && (

                <div className="dashboard-profile-menu">

                  {/* =========================================
                      GUEST PROFILE
                  ========================================== */}

                  {isGuest ? (

                    <>

                      <div className="dashboard-profile-menu-header">

                        <div className="dashboard-profile-menu-avatar">
                          👤
                        </div>

                        <div>

                          <strong>
                            Guest
                          </strong>

                          <span>
                            Exploring CURIO
                          </span>

                        </div>

                      </div>


                      <div className="dashboard-profile-menu-divider" />


                      <div className="dashboard-profile-menu-info">

                        <div>

                          <span>
                            Account
                          </span>

                          <strong>
                            Guest Account
                          </strong>

                        </div>


                        <div>

                          <span>
                            Progress
                          </span>

                          <strong>
                            Not saved
                          </strong>

                        </div>

                      </div>


                      <button
                        type="button"
                        className="dashboard-profile-menu-logout"
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

                    </>

                  ) : (

                    /* =========================================
                       NORMAL SUPABASE USER PROFILE
                    ========================================== */

                    <>

                      <div className="dashboard-profile-menu-header">

                        <div className="dashboard-profile-menu-avatar">
                          🧑🏻
                        </div>

                        <div>

                          <strong>
                            {userName}
                          </strong>

                          <span>
                            Beginner
                          </span>

                        </div>

                      </div>


                      <div className="dashboard-profile-menu-divider" />


                      <div className="dashboard-profile-menu-info">

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
                            Email
                          </span>

                          <strong>
                            {userEmail || "Not available"}
                          </strong>

                        </div>

                      </div>


                      <button
                        type="button"
                        className="dashboard-profile-menu-action"
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsNotificationOpen(false);
                        }}
                      >
                        ⚙️
                        <span>
                          Profile settings
                        </span>
                      </button>


                      <button
                        type="button"
                        className="dashboard-profile-menu-logout"
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

                    </>

                  )}

                </div>

              )}

            </div>

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
              {getGreeting()}, {userName}! 👋
            </h1>

            <p>
              {isGuest
                ? "Welcome to CURIO! Explore your AI learning journey as a guest."
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
                  Pick up where you left off.
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

              {learningCards.map((card) => (

                <Link
                  to="/learn"
                  className="dashboard-learning-card"
                  key={card.id}
                >

                  <div className="dashboard-learning-card-icon">
                    {card.icon}
                  </div>


                  <div className="dashboard-learning-card-content">

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

              ))}

            </div>

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

              {quickActions.map((action) => (

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

              ))}

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
                  ? "Start your CURIO journey! 🚀"
                  : "You're building momentum! 🚀"}
              </h2>

              <p>
                {isGuest
                  ? "Explore CURIO and start learning AI."
                  : "Keep learning a little every day."}
              </p>

            </div>


            <div className="dashboard-overall-progress">

              <div className="dashboard-overall-progress-number">
                {lessonProgressLoading ? "—" : `${overallProgress}%`}
              </div>

              <div className="dashboard-overall-progress-track">

                <div
                  className="dashboard-overall-progress-bar"
                  style={{
                    width: isGuest
                      ? "0%"
                      : `${overallProgress}%`,
                  }}
                />

              </div>

              <span>
                {isGuest
                  ? "Guest progress isn't saved"
                  : lessonProgressLoading
                    ? "Loading learning progress..."
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