import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  useAllLessonProgress,
} from "../../hooks/useLessonProgress.ts";

import "./Learn.css";

/* =========================================
   CURIO LESSON DATA
========================================= */

interface LessonInfo {
  id: number;
  title: string;
  description: string;
  sections: number;
  level: string;
  duration: string;
}

const LESSONS: LessonInfo[] = [
  {
    id: 1,
    title: "AI Fundamentals",
    description:
      "Understand what Artificial Intelligence is, how it works, and where it is used.",
    sections: 8,
    level: "Beginner",
    duration: "10 min",
  },

  {
    id: 2,
    title: "Understanding AI Tools",
    description:
      "Learn how different AI tools work and how to choose the right tool for a task.",
    sections: 8,
    level: "Beginner",
    duration: "10 min",
  },

  {
    id: 3,
    title: "What is a Prompt?",
    description:
      "Learn how to communicate with AI clearly and build effective prompts.",
    sections: 8,
    level: "Beginner",
    duration: "12 min",
  },

  {
    id: 4,
    title: "Verifying AI Answers",
    description:
      "Learn how to check AI-generated information instead of blindly trusting it.",
    sections: 8,
    level: "Beginner",
    duration: "12 min",
  },

  {
    id: 5,
    title: "AI Ethics & Safety",
    description:
      "Understand privacy, responsible AI use, misinformation, and safe AI practices.",
    sections: 8,
    level: "Intermediate",
    duration: "12 min",
  },

  {
    id: 6,
    title: "AI in Real Life",
    description:
      "Discover practical ways to use AI for studying, creativity, work, and everyday problems.",
    sections: 8,
    level: "Intermediate",
    duration: "12 min",
  },

  {
    id: 7,
    title: "AI Workflows",
    description:
      "Learn how multiple AI tools can work together to solve larger problems.",
    sections: 8,
    level: "Intermediate",
    duration: "15 min",
  },

  {
    id: 8,
    title: "CURIO Final Challenge",
    description:
      "Put your AI knowledge into practice and demonstrate what you have learned.",
    sections: 8,
    level: "Challenge",
    duration: "15 min",
  },
];

/* =========================================
   TYPES
========================================= */

type LessonStatus =
  | "completed"
  | "in-progress"
  | "available"
  | "locked";

/* =========================================
   COMPONENT
========================================= */

function Learn() {
  const navigate = useNavigate();

  const {
    progress,
    loading,
  } = useAllLessonProgress();

  /* =========================================
     GUEST MODE DETECTION

     Guest mode is stored only in the current
     browser session.

     IMPORTANT:

     We do NOT use localStorage here because
     guest access should disappear when the
     browser session ends.
  ========================================== */

  const isGuest = useMemo(() => {
    return (
      sessionStorage.getItem(
        "curio_guest"
      ) === "true"
    );
  }, []);

  /* =========================================
     AUTHENTICATED USER PROGRESS

     The progress hook should return progress
     belonging to the currently authenticated
     Supabase user.

     For Guest Mode we intentionally ignore
     all database progress.

     This is important because a guest must
     NEVER see another user's progress.
  ========================================== */

  const visibleProgress = useMemo(() => {
    if (isGuest) {
      return [];
    }

    return progress;
  }, [isGuest, progress]);

  /* =========================================
     PROGRESS LOOKUP

     Guest:
       Empty map.

     Authenticated:
       Current user's progress returned by
       useAllLessonProgress().
  ========================================== */

  const progressMap = useMemo(() => {
    const map = new Map<
      number,
      (typeof visibleProgress)[number]
    >();

    visibleProgress.forEach((item) => {
      map.set(item.lessonId, item);
    });

    return map;
  }, [visibleProgress]);

  /* =========================================
     GET COMPLETED SECTIONS

     Guest Mode:

       We deliberately return 0.

     This prevents any persisted progress
     from another user from appearing.

     Authenticated Mode:

       Read only the progress returned for
       the authenticated user.
  ========================================== */

  const getCompletedSections = (
    lesson: LessonInfo
  ): number => {
    /* ---------------------------------------
       GUEST MODE
    --------------------------------------- */

    if (isGuest) {
      return 0;
    }

    /* ---------------------------------------
       AUTHENTICATED USER
    --------------------------------------- */

    const lessonProgress =
      progressMap.get(lesson.id);

    const savedSections =
      lessonProgress?.completedSections ?? 0;

    return Math.min(
      Math.max(savedSections, 0),
      lesson.sections
    );
  };

  /* =========================================
     CHECK ACTUAL LESSON COMPLETION
  ========================================== */

  const isLessonCompleted = (
    lesson: LessonInfo
  ): boolean => {
    const completedSections =
      getCompletedSections(lesson);

    return (
      completedSections >= lesson.sections
    );
  };

  /* =========================================
     GUEST ACCESS RULE

     Guest users can access ONLY Lesson 1.

     Lessons 2–8 can NEVER be opened by a
     guest, regardless of database progress.
  ========================================== */

  const canGuestOpenLesson = (
    lessonId: number
  ): boolean => {
    return lessonId === 1;
  };

  /* =========================================
     CHECK LESSON ACCESS
  ========================================== */

  const canOpenLesson = (
    lessonId: number
  ): boolean => {
    /* ---------------------------------------
       GUEST MODE
    --------------------------------------- */

    if (isGuest) {
      return canGuestOpenLesson(
        lessonId
      );
    }

    /* ---------------------------------------
       LESSON 1

       Always available for authenticated
       users.
    --------------------------------------- */

    if (lessonId === 1) {
      return true;
    }

    /* ---------------------------------------
       FIND PREVIOUS LESSON
    --------------------------------------- */

    const previousLesson =
      LESSONS.find(
        (lesson) =>
          lesson.id === lessonId - 1
      );

    if (!previousLesson) {
      return false;
    }

    /* ---------------------------------------
       PREVIOUS LESSON MUST BE COMPLETE
    --------------------------------------- */

    return isLessonCompleted(
      previousLesson
    );
  };

  /* =========================================
     LESSON STATUS
  ========================================== */

  const getLessonStatus = (
    lesson: LessonInfo
  ): LessonStatus => {
    /* ---------------------------------------
       GUEST MODE

       ONLY LESSON 1 IS AVAILABLE.

       Lessons 2–8 are ALWAYS locked.
    --------------------------------------- */

    if (isGuest) {
      if (lesson.id === 1) {
        return "available";
      }

      return "locked";
    }

    /* ---------------------------------------
       AUTHENTICATED MODE
    --------------------------------------- */

    const completedSections =
      getCompletedSections(lesson);

    /* ---------------------------------------
       COMPLETED
    --------------------------------------- */

    if (
      completedSections >=
      lesson.sections
    ) {
      return "completed";
    }

    /* ---------------------------------------
       IN PROGRESS
    --------------------------------------- */

    if (completedSections > 0) {
      return "in-progress";
    }

    /* ---------------------------------------
       AVAILABLE
    --------------------------------------- */

    if (canOpenLesson(lesson.id)) {
      return "available";
    }

    /* ---------------------------------------
       LOCKED
    --------------------------------------- */

    return "locked";
  };

  /* =========================================
     COMPLETED LESSONS

     Guest:

       Always 0.

     Authenticated:

       Calculated from actual section
       completion.
  ========================================== */

  const completedLessons = useMemo(() => {
    if (isGuest) {
      return 0;
    }

    return LESSONS.filter(
      (lesson) =>
        isLessonCompleted(lesson)
    ).length;
  }, [isGuest, progressMap]);

  /* =========================================
     COURSE PROGRESS

     Guest:

       We only consider Lesson 1.

       The guest has not completed any
       sections initially.

     Authenticated:

       Full 8-lesson course.
  ========================================== */

  const courseProgress = useMemo(() => {
    if (isGuest) {
      return 0;
    }

    return LESSONS.length > 0
      ? Math.round(
          (completedLessons /
            LESSONS.length) *
            100
        )
      : 0;
  }, [isGuest, completedLessons]);

  /* =========================================
     CURRENT LESSON

     Guest:

       Always Lesson 1.

     Authenticated:

       First in-progress lesson,
       otherwise first available lesson.
  ========================================== */

  const currentLesson = useMemo(() => {
    /* ---------------------------------------
       GUEST
    --------------------------------------- */

    if (isGuest) {
      return LESSONS.find(
        (lesson) => lesson.id === 1
      );
    }

    /* ---------------------------------------
       AUTHENTICATED
    --------------------------------------- */

    const inProgressLesson =
      LESSONS.find(
        (lesson) =>
          getLessonStatus(lesson) ===
          "in-progress"
      );

    if (inProgressLesson) {
      return inProgressLesson;
    }

    return LESSONS.find(
      (lesson) =>
        getLessonStatus(lesson) ===
        "available"
    );
  }, [isGuest, progressMap]);

  /* =========================================
     OPEN LESSON
  ========================================== */

  const openLesson = (
    lesson: LessonInfo
  ) => {
    /* ---------------------------------------
       SECURITY CHECK

       Never trust the visual status alone.

       Check actual access again before
       navigating.
    --------------------------------------- */

    if (!canOpenLesson(lesson.id)) {
      return;
    }

    /* ---------------------------------------
       EXTRA GUEST PROTECTION
    --------------------------------------- */

    if (
      isGuest &&
      lesson.id !== 1
    ) {
      return;
    }

    /* ---------------------------------------
       OPEN LESSON
    --------------------------------------- */

    navigate(
      `/learn/lesson/${lesson.id}`
    );
  };

  /* =========================================
     LOADING STATE
  ========================================== */

  if (loading && !isGuest) {
    return (
      <div className="learn-page">

        <div className="learn-loading">

          <div className="learn-loading-spinner" />

          <h2>
            Loading your learning journey...
          </h2>

          <p>
            CURIO is checking your progress.
          </p>

        </div>

      </div>
    );
  }

  /* =========================================
     RENDER
  ========================================== */

  return (
    <div className="learn-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="learn-header">

        <div className="learn-header-content">

          <div>

            <span className="learn-eyebrow">
              CURIO LEARNING PATH
            </span>

            <h1>
              Learn AI
            </h1>

            <p>
              {isGuest
                ? "Start with the first lesson and explore the CURIO learning experience."
                : "Build your AI skills step by step. Learn, practice, verify, and apply what you discover."}
            </p>

          </div>

          <div className="learn-header-stat">

            <strong>

              {completedLessons}

              <span>
                {" "}
                / {isGuest ? 1 : LESSONS.length}
              </span>

            </strong>

            <small>
              Lessons completed
            </small>

          </div>

        </div>

      </header>


      {/* =====================================
          COURSE PROGRESS
      ===================================== */}

      <section className="learn-course-progress">

        <div className="course-progress-top">

          <div>

            <span>
              YOUR COURSE PROGRESS
            </span>

            <h2>
              {courseProgress}% complete
            </h2>

          </div>

          <div className="course-progress-count">

            {isGuest
              ? "Lesson 1 of 1 available"
              : `${completedLessons} of ${LESSONS.length} lessons`}

          </div>

        </div>


        <div className="course-progress-track">

          <div
            className="course-progress-fill"
            style={{
              width: `${courseProgress}%`,
            }}
          />

        </div>


        <p className="course-progress-message">

          {isGuest &&
            "Guest access includes Lesson 1 only. Create an account to unlock the complete learning path."}

          {!isGuest &&
            courseProgress === 0 &&
            "Start with Lesson 1 and build your AI foundation."}

          {!isGuest &&
            courseProgress > 0 &&
            courseProgress < 100 &&
            "Keep going. Your AI skills are growing with every lesson."}

          {!isGuest &&
            courseProgress === 100 &&
            "Excellent! You completed the CURIO learning path."}

        </p>

      </section>


      {/* =====================================
          CONTINUE LEARNING
      ===================================== */}

      {currentLesson && (

        <section className="continue-learning-card">

          <div className="continue-learning-content">

            <span className="continue-label">

              {isGuest
                ? "START LEARNING"
                : getLessonStatus(
                    currentLesson
                  ) === "in-progress"
                ? "CONTINUE LEARNING"
                : "START LEARNING"}

            </span>


            <h2>
              {currentLesson.title}
            </h2>


            <p>
              {currentLesson.description}
            </p>


            <button
              type="button"
              onClick={() =>
                openLesson(
                  currentLesson
                )
              }
              className="continue-button"
            >

              {isGuest
                ? "Start Lesson 1"
                : getLessonStatus(
                    currentLesson
                  ) === "in-progress"
                ? "Continue lesson"
                : "Start lesson"}

              <span>
                →
              </span>

            </button>

          </div>


          <div className="continue-learning-number">

            <span>
              LESSON
            </span>

            <strong>
              {currentLesson.id}
            </strong>

          </div>

        </section>

      )}


      {/* =====================================
          LESSON PATH
      ===================================== */}

      <section className="lesson-path-section">

        <div className="lesson-path-heading">

          <div>

            <span>
              YOUR LEARNING PATH
            </span>

            <h2>
              {isGuest
                ? "Start with Lesson 1"
                : "Progress through CURIO"}
            </h2>

          </div>

          <p>

            {isGuest
              ? "Guest accounts can explore Lesson 1. Create an account to unlock the remaining lessons."
              : "Complete each lesson to unlock the next stage."}

          </p>

        </div>


        {/* ===================================
            LESSON LIST
        =================================== */}

        <div className="lesson-path">

          {LESSONS.map(
            (lesson, index) => {

              /* --------------------------------
                 GET STATUS
              -------------------------------- */

              const status =
                getLessonStatus(
                  lesson
                );

              /* --------------------------------
                 GET REAL SECTION PROGRESS
              -------------------------------- */

              const completedSections =
                getCompletedSections(
                  lesson
                );

              /* --------------------------------
                 CALCULATE PERCENTAGE
              -------------------------------- */

              const percentage =
                lesson.sections > 0
                  ? Math.round(
                      (completedSections /
                        lesson.sections) *
                        100
                    )
                  : 0;

              return (

                <div
                  key={lesson.id}
                  className={`lesson-card lesson-${status}`}
                >

                  {/* ==========================
                      CONNECTOR
                  ========================== */}

                  {index > 0 && (

                    <div
                      className={`lesson-connector ${
                        status === "locked"
                          ? "connector-locked"
                          : ""
                      }`}
                    />

                  )}


                  {/* ==========================
                      NUMBER / STATUS
                  ========================== */}

                  <div className="lesson-number">

                    {status ===
                      "completed" && (

                      <span>
                        ✓
                      </span>

                    )}

                    {status ===
                      "locked" && (

                      <span>
                        🔒
                      </span>

                    )}

                    {status !==
                      "completed" &&
                      status !==
                        "locked" && (

                      <span>
                        {lesson.id}
                      </span>

                    )}

                  </div>


                  {/* ==========================
                      CONTENT
                  ========================== */}

                  <div className="lesson-card-content">

                    <div className="lesson-card-top">

                      <div>

                        <span className="lesson-stage">

                          LESSON {lesson.id}

                        </span>

                        <h3>
                          {lesson.title}
                        </h3>

                      </div>


                      <span
                        className={`lesson-status status-${status}`}
                      >

                        {status ===
                          "completed" &&
                          "Completed"}

                        {status ===
                          "in-progress" &&
                          "In progress"}

                        {status ===
                          "available" &&
                          "Available"}

                        {status ===
                          "locked" &&
                          "Locked"}

                      </span>

                    </div>


                    {/* ==========================
                        DESCRIPTION
                    ========================== */}

                    <p className="lesson-description">

                      {lesson.description}

                    </p>


                    {/* ==========================
                        META
                    ========================== */}

                    <div className="lesson-meta">

                      <span>
                        ◷ {lesson.duration}
                      </span>

                      <span>
                        ● {lesson.level}
                      </span>

                      <span>
                        {lesson.sections} sections
                      </span>

                    </div>


                    {/* ==========================
                        PROGRESS
                    ========================== */}

                    <div className="lesson-progress-area">

                      <div className="lesson-progress-label">

                        <span>

                          {completedSections}
                          {" / "}
                          {lesson.sections}
                          {" sections"}

                        </span>

                        <strong>
                          {percentage}%
                        </strong>

                      </div>


                      <div className="lesson-progress-track">

                        <div
                          className="lesson-progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>


                    {/* ==========================
                        ACTION
                    ========================== */}

                    <div className="lesson-action">

                      {status ===
                        "locked" ? (

                        <button
                          type="button"
                          className="lesson-button locked-button"
                          disabled
                        >

                          {isGuest
                            ? "Create an account to unlock"
                            : `Complete Lesson ${
                                lesson.id - 1
                              } to unlock`}

                        </button>

                      ) : (

                        <button
                          type="button"
                          className="lesson-button"
                          onClick={() =>
                            openLesson(
                              lesson
                            )
                          }
                        >

                          {status ===
                            "completed" &&
                            "Review lesson"}

                          {status ===
                            "in-progress" &&
                            "Continue"}

                          {status ===
                            "available" &&
                            "Start lesson"}

                          <span>
                            →
                          </span>

                        </button>

                      )}

                    </div>

                  </div>

                </div>

              );

            }
          )}

        </div>

      </section>


      {/* =====================================
          COMPLETION MESSAGE
      ===================================== */}

      {!isGuest &&
        courseProgress === 100 && (

        <section className="learn-completion-card">

          <div className="completion-icon">
            ✓
          </div>

          <div>

            <span>
              COURSE COMPLETE
            </span>

            <h2>
              You completed the CURIO learning path.
            </h2>

            <p>
              You have completed all eight core
              lessons. Your next step can be
              practice, verification, or applying
              your AI skills to real-world problems.
            </p>

          </div>

        </section>

      )}

    </div>
  );
}

export default Learn;