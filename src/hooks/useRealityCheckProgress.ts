import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getRealityCheckProgress,
  getAllRealityCheckProgress,
  saveRealityCheckProgress,
  completeRealityCheck,
  resetRealityCheck,
  type RealityCheckProgress,
} from "../lib/realityCheckProgress.ts";

/* =========================================
   SINGLE REALITY CHECK PROGRESS HOOK
========================================= */

export function useRealityCheckProgress(
  realityCheckId: number,
  totalQuestions: number
) {
  const [progress, setProgress] =
    useState<RealityCheckProgress | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* =========================================
     LOAD PROGRESS
  ========================================== */

  const loadProgress =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const savedProgress =
          await getRealityCheckProgress(
            realityCheckId
          );

        setProgress(
          savedProgress
        );
      } catch (err) {
        console.error(
          "CURIO: Failed to load Reality Check progress:",
          err
        );

        setError(
          "Unable to load your Reality Check progress."
        );
      } finally {
        setLoading(false);
      }
    }, [realityCheckId]);

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
          const savedProgress =
            await getRealityCheckProgress(
              realityCheckId
            );

          if (active) {
            setProgress(
              savedProgress
            );
          }
        } catch (err) {
          console.error(
            "CURIO: Failed to load Reality Check progress:",
            err
          );

          if (active) {
            setError(
              "Unable to load your Reality Check progress."
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
  }, [realityCheckId]);

  /* =========================================
     SAVE PROGRESS
  ========================================== */

  const updateProgress =
    useCallback(
      async (
        currentQuestion: number,
        completedQuestions: number,
        totalScore = 0
      ) => {
        setSaving(true);
        setError(null);

        try {
          const success =
            await saveRealityCheckProgress(
              realityCheckId,
              currentQuestion,
              completedQuestions,
              totalQuestions,
              totalScore
            );

          if (!success) {
            setError(
              "Unable to save your Reality Check progress."
            );

            return false;
          }

          const savedProgress =
            await getRealityCheckProgress(
              realityCheckId
            );

          setProgress(
            savedProgress
          );

          return true;
        } catch (err) {
          console.error(
            "CURIO: Failed to update Reality Check progress:",
            err
          );

          setError(
            "Unable to save your Reality Check progress."
          );

          return false;
        } finally {
          setSaving(false);
        }
      },
      [
        realityCheckId,
        totalQuestions,
      ]
    );

  /* =========================================
     COMPLETE REALITY CHECK
  ========================================== */

  const markComplete =
    useCallback(
      async (
        totalScore: number
      ) => {
        setSaving(true);
        setError(null);

        try {
          const success =
            await completeRealityCheck(
              realityCheckId,
              totalQuestions,
              totalScore
            );

          if (!success) {
            setError(
              "Unable to mark Reality Check as complete."
            );

            return false;
          }

          const savedProgress =
            await getRealityCheckProgress(
              realityCheckId
            );

          setProgress(
            savedProgress
          );

          return true;
        } catch (err) {
          console.error(
            "CURIO: Failed to complete Reality Check:",
            err
          );

          setError(
            "Unable to complete Reality Check."
          );

          return false;
        } finally {
          setSaving(false);
        }
      },
      [
        realityCheckId,
        totalQuestions,
      ]
    );

  /* =========================================
     RESET REALITY CHECK
  ========================================== */

  const reset =
    useCallback(
      async () => {
        setSaving(true);
        setError(null);

        try {
          const success =
            await resetRealityCheck(
              realityCheckId
            );

          if (!success) {
            setError(
              "Unable to reset Reality Check."
            );

            return false;
          }

          setProgress(null);

          return true;
        } catch (err) {
          console.error(
            "CURIO: Failed to reset Reality Check:",
            err
          );

          setError(
            "Unable to reset Reality Check."
          );

          return false;
        } finally {
          setSaving(false);
        }
      },
      [realityCheckId]
    );

  /* =========================================
     CALCULATED VALUES
  ========================================== */

  const currentQuestion =
    progress?.currentQuestion ?? 0;

  const completedQuestions =
    progress?.completedQuestions ?? 0;

  const totalScore =
    progress?.totalScore ?? 0;

  /*
   * Alias kept for compatibility with
   * components that use "score".
   */
  const score =
    totalScore;

  const completed =
    progress?.completed ?? false;

  const safeTotalQuestions =
    Math.max(
      0,
      totalQuestions
    );

  const progressPercentage =
    safeTotalQuestions > 0
      ? Math.round(
          (completedQuestions /
            safeTotalQuestions) *
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
    completedQuestions,
    totalQuestions:
      safeTotalQuestions,

    totalScore,
    score,

    completed,

    progressPercentage,

    updateProgress,
    markComplete,
    reset,

    reload:
      loadProgress,
  };
}

/* =========================================
   ALL REALITY CHECK PROGRESS HOOK
========================================= */

export function useAllRealityCheckProgress() {
  const [progress, setProgress] =
    useState<RealityCheckProgress[]>(
      []
    );

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
          await getAllRealityCheckProgress();

        setProgress(
          savedProgress
        );
      } catch (err) {
        console.error(
          "CURIO: Failed to load all Reality Check progress:",
          err
        );

        setError(
          "Unable to load Reality Check progress."
        );
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
     CALCULATIONS
  ========================================== */

  const completedRealityChecks =
    progress.filter(
      (item) =>
        item.completed
    ).length;

  const totalRealityChecks =
    progress.length;

  const overallProgress =
    totalRealityChecks > 0
      ? Math.round(
          (completedRealityChecks /
            totalRealityChecks) *
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

    completedRealityChecks,
    totalRealityChecks,

    overallProgress,

    reload:
      loadAllProgress,
  };
}