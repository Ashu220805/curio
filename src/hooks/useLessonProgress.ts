import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  canAccessLesson,
  completeLesson,
  getAllLessonProgress,
  getLessonProgress,
  saveLessonProgress,
  type LessonProgress,
} from "../lib/lessonProgress.ts";

/* =========================================
   SINGLE LESSON PROGRESS HOOK
========================================= */

export function useLessonProgress(
  lessonId: number,
  totalSections: number
) {
  const [progress, setProgress] =
    useState<LessonProgress | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* =========================================
     LOAD SAVED PROGRESS
  ========================================== */

  const loadProgress = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const savedProgress =
          await getLessonProgress(lessonId);

        /*
          Supabase may return null when the user has
          never started this lesson.

          That is NOT an error.

          null simply means:
          0 sections completed.
        */

        setProgress(savedProgress);
      } catch (err) {
        console.error(
          "CURIO: Failed to load lesson progress:",
          err
        );

        setError(
          "Unable to load your lesson progress."
        );
      } finally {
        setLoading(false);
      }
    },
    [lessonId]
  );

  /* =========================================
     LOAD WHEN LESSON OPENS
  ========================================== */

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const savedProgress =
          await getLessonProgress(lessonId);

        if (!active) return;

        setProgress(savedProgress);
      } catch (err) {
        console.error(
          "CURIO: Failed to load lesson progress:",
          err
        );

        if (active) {
          setError(
            "Unable to load your lesson progress."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [lessonId]);

  /* =========================================
     SAVE CURRENT SECTION PROGRESS
  ========================================== */

  const updateProgress = useCallback(
    async (
      currentSection: number,
      completedSections: number
    ) => {
      setSaving(true);
      setError(null);

      try {
        const success =
          await saveLessonProgress(
            lessonId,
            currentSection,
            completedSections,
            totalSections
          );

        if (!success) {
          setError(
            "Unable to save your progress."
          );

          return false;
        }

        /*
          Read the database again after saving.

          Supabase remains the source of truth.
        */

        const savedProgress =
          await getLessonProgress(lessonId);

        setProgress(savedProgress);

        return true;
      } catch (err) {
        console.error(
          "CURIO: Failed to update lesson progress:",
          err
        );

        setError(
          "Unable to save your progress."
        );

        return false;
      } finally {
        setSaving(false);
      }
    },
    [
      lessonId,
      totalSections,
    ]
  );

  /* =========================================
     COMPLETE LESSON
  ========================================== */

  const markComplete =
    useCallback(async () => {
      setSaving(true);
      setError(null);

      try {
        const success =
          await completeLesson(
            lessonId,
            totalSections
          );

        if (!success) {
          setError(
            "Unable to mark this lesson as complete."
          );

          return false;
        }

        /*
          Reload the completed database record.
        */

        const savedProgress =
          await getLessonProgress(lessonId);

        setProgress(savedProgress);

        return true;
      } catch (err) {
        console.error(
          "CURIO: Failed to complete lesson:",
          err
        );

        setError(
          "Unable to complete this lesson."
        );

        return false;
      } finally {
        setSaving(false);
      }
    }, [
      lessonId,
      totalSections,
    ]);

  /* =========================================
     CHECK LESSON ACCESS
  ========================================== */

  const checkAccess =
    useCallback(async () => {
      try {
        return await canAccessLesson(
          lessonId
        );
      } catch (err) {
        console.error(
          "CURIO: Failed to check lesson access:",
          err
        );

        return false;
      }
    }, [lessonId]);

  /* =========================================
     CALCULATED PROGRESS VALUES
  ========================================== */

  /*
    If no database row exists yet, the lesson is
    simply at 0 progress.

    Example:

    Lesson 3 doesn't have a row
          ↓
    progress === null
          ↓
    completedSections === 0
          ↓
    progressPercentage === 0
  */

  const completedSections =
    progress?.completedSections ?? 0;

  const currentSection =
    progress?.currentSection ?? 0;

  const completed =
    progress?.completed ?? false;

  const progressPercentage =
    totalSections > 0
      ? Math.round(
          (completedSections /
            totalSections) *
            100
        )
      : 0;

  /* =========================================
     RETURN
  ========================================== */

  return {
    progress,

    loading,
    saving,
    error,

    currentSection,
    completedSections,
    completed,

    progressPercentage,

    updateProgress,
    markComplete,
    checkAccess,

    reload: loadProgress,
  };
}


/* =========================================
   ALL LESSONS PROGRESS HOOK
========================================= */

export function useAllLessonProgress(
  totalCourseLessons: number = 8
) {
  const [progress, setProgress] =
    useState<LessonProgress[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /* =========================================
     LOAD ALL PROGRESS
  ========================================== */

  const loadAllProgress =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const savedProgress =
          await getAllLessonProgress();

        /*
          Supabase only returns rows that actually
          exist for this user.

          For example:

          Database:
          Lesson 1 -> 8/8
          Lesson 2 -> 1/8

          It may NOT have rows for:

          Lesson 3
          Lesson 4
          Lesson 5
          Lesson 6
          Lesson 7
          Lesson 8

          That is normal.

          We keep the actual database rows here.
        */

        setProgress(
          Array.isArray(savedProgress)
            ? savedProgress
            : []
        );
      } catch (err) {
        console.error(
          "CURIO: Failed to load all lesson progress:",
          err
        );

        setError(
          "Unable to load course progress."
        );

        setProgress([]);
      } finally {
        setLoading(false);
      }
    }, []);

  /* =========================================
     INITIAL LOAD
  ========================================== */

  useEffect(() => {
    loadAllProgress();
  }, [loadAllProgress]);

  /* =========================================
     COURSE CALCULATIONS
  ========================================== */

  /*
    IMPORTANT:

    Do NOT use:

      progress.length

    as the number of lessons.

    progress.length means:
    "How many lessons have a database row?"

    It does NOT mean:
    "How many lessons are in the CURIO course?"
  */

  const completedLessons =
    progress.filter(
      (lesson) => lesson.completed === true
    ).length;

  /*
    CURIO currently has 8 lessons.

    Therefore:

      totalLessons = 8

    even if only Lesson 1 has a database row.
  */

  const totalLessons =
    totalCourseLessons;

  const courseProgress =
    totalLessons > 0
      ? Math.round(
          (completedLessons /
            totalLessons) *
            100
        )
      : 0;

  /* =========================================
     HELPER
     GET PROGRESS FOR ONE LESSON
  ========================================== */

  const getProgressForLesson =
    useCallback(
      (lessonId: number) => {
        return (
          progress.find(
            (lesson) =>
              lesson.lessonId === lessonId
          ) ?? null
        );
      },
      [progress]
    );

  /* =========================================
     RETURN
  ========================================== */

  return {
    progress,

    loading,
    error,

    completedLessons,
    totalLessons,
    courseProgress,

    getProgressForLesson,

    reload: loadAllProgress,
  };
}