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
    useState<LessonProgress | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  /* =========================================
     LOAD PROGRESS
  ========================================== */

  const loadProgress =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const saved =
            await getLessonProgress(
              lessonId
            );

          setProgress(
            saved
          );
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
     INITIAL LOAD
  ========================================== */

  useEffect(() => {
    let active = true;

    const load =
      async () => {
        setLoading(true);
        setError(null);

        try {
          const saved =
            await getLessonProgress(
              lessonId
            );

          if (
            active
          ) {
            setProgress(
              saved
            );
          }
        } catch (err) {
          console.error(
            "CURIO: Failed to load lesson progress:",
            err
          );

          if (
            active
          ) {
            setError(
              "Unable to load your lesson progress."
            );
          }
        } finally {
          if (
            active
          ) {
            setLoading(false);
          }
        }
      };

    void load();

    return () => {
      active = false;
    };
  }, [lessonId]);

  /* =========================================
     REFRESH WHEN PAGE BECOMES ACTIVE
  ========================================== */

  useEffect(() => {
    const handleRefresh =
      () => {
        void loadProgress();
      };

    globalThis.addEventListener(
      "focus",
      handleRefresh
    );

    globalThis.addEventListener(
      "pageshow",
      handleRefresh
    );

    globalThis.addEventListener(
      "curio:lesson-progress-updated",
      handleRefresh
    );

    return () => {
      globalThis.removeEventListener(
        "focus",
        handleRefresh
      );

      globalThis.removeEventListener(
        "pageshow",
        handleRefresh
      );

      globalThis.removeEventListener(
        "curio:lesson-progress-updated",
        handleRefresh
      );
    };
  }, [loadProgress]);

  /* =========================================
     SAVE PROGRESS
  ========================================== */

  const updateProgress =
    useCallback(
      async (
        currentSection: number,
        completedSections: number
      ) => {
        if (saving) {
          return false;
        }

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
           * Reload from Supabase.
           */

          const saved =
            await getLessonProgress(
              lessonId
            );

          setProgress(
            saved
          );

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
        saving,
      ]
    );

  /* =========================================
     COMPLETE LESSON
  ========================================== */

  const markComplete =
    useCallback(
      async () => {
        if (saving) {
          return false;
        }

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

          const saved =
            await getLessonProgress(
              lessonId
            );

          setProgress(
            saved
          );

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
      },
      [
        lessonId,
        totalSections,
        saving,
      ]
    );

  /* =========================================
     CHECK ACCESS
  ========================================== */

  const checkAccess =
    useCallback(
      async () => {
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
      },
      [lessonId]
    );

  /* =========================================
     SAFE VALUES
  ========================================== */

  const safeTotalSections =
    Math.max(
      0,
      totalSections
    );

  const completedSections =
    Math.max(
      0,
      Math.min(
        progress?.completedSections ??
          0,
        safeTotalSections
      )
    );

  const currentSection =
    Math.max(
      0,
      Math.min(
        progress?.currentSection ??
          0,
        safeTotalSections
      )
    );

  const completed =
    progress?.completed === true;

  const progressPercentage =
    safeTotalSections > 0
      ? Math.round(
          (
            completedSections /
            safeTotalSections
          ) *
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

    totalSections:
      safeTotalSections,

    completed,

    progressPercentage,

    updateProgress,
    markComplete,
    checkAccess,

    reload:
      loadProgress,
  };
}

/* =========================================
   ALL LESSONS PROGRESS
========================================= */

export function useAllLessonProgress(
  totalCourseLessons = 8
) {
  const [progress, setProgress] =
    useState<
      LessonProgress[]
    >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null
    );

  /* =========================================
     LOAD ALL
  ========================================== */

  const loadAllProgress =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const saved =
            await getAllLessonProgress();

          setProgress(
            Array.isArray(saved)
              ? saved
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
      },
      []
    );

  /* =========================================
     INITIAL LOAD
  ========================================== */

  useEffect(() => {
    void loadAllProgress();
  }, [
    loadAllProgress,
  ]);

  /* =========================================
     REFRESH EVENTS
  ========================================== */

  useEffect(() => {
    const refresh =
      () => {
        void loadAllProgress();
      };

    globalThis.addEventListener(
      "focus",
      refresh
    );

    globalThis.addEventListener(
      "pageshow",
      refresh
    );

    globalThis.addEventListener(
      "curio:lesson-progress-updated",
      refresh
    );

    globalThis.addEventListener(
      "curio:lesson-completed",
      refresh
    );

    return () => {
      globalThis.removeEventListener(
        "focus",
        refresh
      );

      globalThis.removeEventListener(
        "pageshow",
        refresh
      );

      globalThis.removeEventListener(
        "curio:lesson-progress-updated",
        refresh
      );

      globalThis.removeEventListener(
        "curio:lesson-completed",
        refresh
      );
    };
  }, [
    loadAllProgress,
  ]);

  /* =========================================
     COURSE CALCULATIONS
  ========================================== */

  const completedLessons =
    progress.filter(
      (lesson) =>
        lesson.completed === true
    ).length;

  const totalLessons =
    Math.max(
      0,
      totalCourseLessons
    );

  const courseProgress =
    totalLessons > 0
      ? Math.round(
          (
            completedLessons /
            totalLessons
          ) *
            100
        )
      : 0;

  /* =========================================
     GET ONE LESSON
  ========================================== */

  const getProgressForLesson =
    useCallback(
      (
        lessonId: number
      ) => {
        return (
          progress.find(
            (lesson) =>
              lesson.lessonId ===
              lessonId
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

    reload:
      loadAllProgress,
  };
}