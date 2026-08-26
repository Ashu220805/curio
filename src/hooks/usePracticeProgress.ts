import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  completePracticeSession,
  getAllPracticeProgress,
  getPracticeProgress,
  resetPracticeProgress,
  savePracticeProgress,
  type PracticeProgress,
} from "../lib/practiceProgress.ts";

/* =========================================
   SINGLE PRACTICE SESSION PROGRESS
========================================= */

export function usePracticeProgress(
  sessionId: number,
  totalQuestions: number
) {
  const [
    progress,
    setProgress,
  ] = useState<PracticeProgress | null>(
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

  /* =========================================
     RELOAD
  ========================================== */

  const reload =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const saved =
          await getPracticeProgress(
            sessionId
          );

        setProgress(saved);
      } catch (err) {
        console.error(
          "CURIO: Failed to load Practice progress:",
          err
        );

        setError(
          "Unable to load practice progress."
        );
      } finally {
        setLoading(false);
      }
    }, [sessionId]);

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
            await getPracticeProgress(
              sessionId
            );

          if (!active) {
            return;
          }

          setProgress(saved);
        } catch (err) {
          console.error(
            "CURIO: Failed to load Practice progress:",
            err
          );

          if (active) {
            setError(
              "Unable to load practice progress."
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
  }, [sessionId]);

  /* =========================================
     UPDATE CURRENT QUESTION
  ========================================== */

  const updateProgress =
    useCallback(
      async (
        currentQuestion: number,
        answers: (number | null)[]
      ) => {
        setSaving(true);
        setError(null);

        try {
          const success =
            await savePracticeProgress(
              sessionId,
              currentQuestion,
              answers,
              totalQuestions
            );

          if (!success) {
            setError(
              "Unable to save practice progress."
            );

            return false;
          }

          const saved =
            await getPracticeProgress(
              sessionId
            );

          setProgress(saved);

          return true;
        } catch (err) {
          console.error(
            "CURIO: Failed to save Practice progress:",
            err
          );

          setError(
            "Unable to save practice progress."
          );

          return false;
        } finally {
          setSaving(false);
        }
      },
      [
        sessionId,
        totalQuestions,
      ]
    );

  /* =========================================
     COMPLETE SESSION
  ========================================== */

  const markComplete =
    useCallback(
      async (
        answers: (number | null)[],
        score: number
      ) => {
        setSaving(true);
        setError(null);

        try {
          const success =
            await completePracticeSession(
              sessionId,
              answers,
              score,
              totalQuestions
            );

          if (!success) {
            setError(
              "Unable to complete practice session."
            );

            return false;
          }

          const saved =
            await getPracticeProgress(
              sessionId
            );

          setProgress(saved);

          return true;
        } catch (err) {
          console.error(
            "CURIO: Failed to complete Practice session:",
            err
          );

          setError(
            "Unable to complete practice session."
          );

          return false;
        } finally {
          setSaving(false);
        }
      },
      [
        sessionId,
        totalQuestions,
      ]
    );

  /* =========================================
     RESET SESSION
  ========================================== */

  const reset =
    useCallback(async () => {
      setSaving(true);
      setError(null);

      try {
        const success =
          await resetPracticeProgress(
            sessionId
          );

        if (!success) {
          setError(
            "Unable to reset practice session."
          );

          return false;
        }

        setProgress(null);

        return true;
      } catch (err) {
        console.error(
          "CURIO: Failed to reset Practice progress:",
          err
        );

        setError(
          "Unable to reset practice session."
        );

        return false;
      } finally {
        setSaving(false);
      }
    }, [sessionId]);

  /* =========================================
     CALCULATED VALUES
  ========================================== */

  const currentQuestion =
    progress?.currentQuestion ?? 0;

  const answeredQuestions =
    progress?.answeredQuestions ?? 0;

  const score =
    progress?.score ?? 0;

  const completed =
    progress?.completed ?? false;

  const progressPercentage =
    totalQuestions > 0
      ? Math.round(
          (answeredQuestions /
            totalQuestions) *
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

    currentQuestion,
    answeredQuestions,
    totalQuestions,
    score,
    completed,
    progressPercentage,

    updateProgress,
    markComplete,
    reset,
    reload,
  };
}

/* =========================================
   ALL PRACTICE SESSIONS
========================================= */

export function useAllPracticeProgress() {
  const [
    progress,
    setProgress,
  ] = useState<PracticeProgress[]>(
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
     LOAD ALL
  ========================================== */

  const reload =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const saved =
          await getAllPracticeProgress();

        setProgress(
          Array.isArray(saved)
            ? saved
            : []
        );
      } catch (err) {
        console.error(
          "CURIO: Failed to load all Practice progress:",
          err
        );

        setError(
          "Unable to load practice progress."
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
     CALCULATIONS
  ========================================== */

  const completedSessions =
    progress.filter(
      (item) =>
        item.completed === true
    ).length;

  /*
    CURIO currently uses 8 practice sessions.
  */

  const totalSessions = 8;

  const progressPercentage =
    totalSessions > 0
      ? Math.round(
          (completedSessions /
            totalSessions) *
            100
        )
      : 0;

  /* =========================================
     RETURN
  ========================================== */

  return {
    progress,

    loading,
    error,

    completedSessions,
    totalSessions,
    progressPercentage,

    reload,
  };
}