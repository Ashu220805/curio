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
   GUEST MODE CHECK
========================================= */

function isGuestMode(): boolean {
  try {
    return (
      sessionStorage.getItem(
        "curio_guest"
      ) === "true"
    );
  } catch {
    return false;
  }
}

/* =========================================
   SINGLE LESSON PROGRESS
========================================= */

export function useLessonProgress(
  lessonId: number,
  totalSections: number
) {
  const [
    progress,
    setProgress,
  ] = useState<LessonProgress | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    accessible,
    setAccessible,
  ] = useState(true);

  /* =========================================
     RELOAD
  ========================================== */

  const reload =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {

        /*
          Explicit Guest protection.

          Guest Lesson 1 is allowed.
          Guest Lessons 2–8 are blocked.
        */

        if (isGuestMode()) {

          if (lessonId !== 1) {
            setProgress(null);
            setAccessible(false);
            return;
          }

          const saved =
            await getLessonProgress(
              lessonId
            );

          setProgress(saved);
          setAccessible(true);

          return;
        }

        /*
          Authenticated user.
        */

        const access =
          await canAccessLesson(
            lessonId
          );

        setAccessible(access);

        if (!access) {
          setProgress(null);
          return;
        }

        const saved =
          await getLessonProgress(
            lessonId
          );

        setProgress(saved);

      } catch (err) {

        console.error(
          "CURIO: Failed to load Lesson progress:",
          err
        );

        setError(
          "Unable to load lesson progress."
        );

      } finally {
        setLoading(false);
      }
    }, [lessonId]);

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

          /*
            Guest protection.
          */

          if (isGuestMode()) {

            if (lessonId !== 1) {

              if (active) {
                setProgress(null);
                setAccessible(false);
              }

              return;
            }

            const saved =
              await getLessonProgress(
                lessonId
              );

            if (!active) {
              return;
            }

            setProgress(saved);
            setAccessible(true);

            return;
          }

          /*
            Authenticated user.
          */

          const access =
            await canAccessLesson(
              lessonId
            );

          if (!active) {
            return;
          }

          setAccessible(access);

          if (!access) {
            setProgress(null);
            return;
          }

          const saved =
            await getLessonProgress(
              lessonId
            );

          if (!active) {
            return;
          }

          setProgress(saved);

        } catch (err) {

          console.error(
            "CURIO: Failed to load Lesson progress:",
            err
          );

          if (active) {
            setError(
              "Unable to load lesson progress."
            );
          }

        } finally {

          if (active) {
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
     UPDATE PROGRESS
  ========================================== */

  const updateProgress =
    useCallback(
      async (
        currentSection: number,
        completedSections: number
      ) => {

        /*
          Guest can only update Lesson 1.
        */

        if (
          isGuestMode() &&
          lessonId !== 1
        ) {
          setError(
            "Guest users can only access Lesson 1."
          );

          return false;
        }

        /*
          Do not allow updates to a lesson
          that is not accessible.
        */

        if (!accessible) {
          setError(
            "This lesson is locked."
          );

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
              "Unable to save lesson progress."
            );

            return false;
          }

          const saved =
            await getLessonProgress(
              lessonId
            );

          setProgress(saved);

          return true;

        } catch (err) {

          console.error(
            "CURIO: Failed to save Lesson progress:",
            err
          );

          setError(
            "Unable to save lesson progress."
          );

          return false;

        } finally {
          setSaving(false);
        }

      },
      [
        lessonId,
        totalSections,
        accessible,
      ]
    );

  /* =========================================
     COMPLETE LESSON
  ========================================== */

  const markComplete =
    useCallback(async () => {

      /*
        Guest can only complete Lesson 1.
      */

      if (
        isGuestMode() &&
        lessonId !== 1
      ) {
        setError(
          "Guest users can only access Lesson 1."
        );

        return false;
      }

      if (!accessible) {
        setError(
          "This lesson is locked."
        );

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
            "Unable to complete lesson."
          );

          return false;
        }

        const saved =
          await getLessonProgress(
            lessonId
          );

        setProgress(saved);

        return true;

      } catch (err) {

        console.error(
          "CURIO: Failed to complete Lesson:",
          err
        );

        setError(
          "Unable to complete lesson."
        );

        return false;

      } finally {
        setSaving(false);
      }

    }, [
      lessonId,
      totalSections,
      accessible,
    ]);

  /* =========================================
     CALCULATED VALUES
  ========================================== */

  const currentSection =
    progress?.currentSection ?? 0;

  const completedSections =
    progress?.completedSections ?? 0;

  const completed =
    progress?.completed ?? false;

  const progressPercentage =
    totalSections > 0
      ? Math.round(
          (
            completedSections /
            totalSections
          ) * 100
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

    accessible,

    currentSection,
    completedSections,
    totalSections,
    completed,

    progressPercentage,

    updateProgress,
    markComplete,
    reload,
  };
}

/* =========================================
   ALL LESSON PROGRESS
========================================= */

export function useAllLessonProgress() {

  const [
    progress,
    setProgress,
  ] = useState<LessonProgress[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  /* =========================================
     RELOAD ALL
  ========================================== */

  const reload =
    useCallback(async () => {

      setLoading(true);
      setError(null);

      try {

        /*
          Guest mode:

          getAllLessonProgress() already
          returns ONLY guest session progress
          and never queries Supabase.
        */

        const saved =
          await getAllLessonProgress();

        setProgress(
          Array.isArray(saved)
            ? saved
            : []
        );

      } catch (err) {

        console.error(
          "CURIO: Failed to load all Lesson progress:",
          err
        );

        setError(
          "Unable to load lesson progress."
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

    void reload();

  }, [reload]);

  /* =========================================
     PROGRESS EVENT
  ========================================== */

  useEffect(() => {

    const handleProgressUpdate =
      () => {
        void reload();
      };

    window.addEventListener(
      "curio:lesson-progress-updated",
      handleProgressUpdate
    );

    window.addEventListener(
      "curio:lesson-completed",
      handleProgressUpdate
    );

    return () => {

      window.removeEventListener(
        "curio:lesson-progress-updated",
        handleProgressUpdate
      );

      window.removeEventListener(
        "curio:lesson-completed",
        handleProgressUpdate
      );
    };

  }, [reload]);

  /* =========================================
     CALCULATIONS
  ========================================== */

  const completedLessons =
    progress.filter(
      (item) =>
        item.completed === true
    ).length;

  /*
    CURIO currently uses 8 lessons.
  */

  const totalLessons = 8;

  const progressPercentage =
    totalLessons > 0
      ? Math.round(
          (
            completedLessons /
            totalLessons
          ) * 100
        )
      : 0;

  /* =========================================
     RETURN
  ========================================== */

  return {
    progress,

    loading,
    error,

    completedLessons,
    totalLessons,
    progressPercentage,

    reload,
  };
}