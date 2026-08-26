import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getRealityCheckProgress,
  saveRealityCheckProgress,
  completeRealityCheck,
  type RealityCheckProgress,
} from "../lib/realityCheckProgress.ts";

export function useRealityCheckProgress(
  totalQuestions: number
) {
  const [progress, setProgress] =
    useState<RealityCheckProgress | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* =========================================
     LOAD PROGRESS
  ========================================= */

  const loadProgress = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await getRealityCheckProgress();

        setProgress(data);
      } catch (err) {
        console.error(
          "CURIO: Failed to load Reality Check progress:",
          err
        );

        setError(
          "Unable to load Reality Check progress."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* =========================================
     INITIAL LOAD
  ========================================= */

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  /* =========================================
     SAVE PROGRESS
  ========================================= */

  const updateProgress = useCallback(
    async (
      currentQuestion: number,
      completedQuestions: number,
      score: number
    ) => {
      setSaving(true);
      setError(null);

      try {
        const success =
          await saveRealityCheckProgress(
            currentQuestion,
            completedQuestions,
            totalQuestions,
            score
          );

        if (!success) {
          setError(
            "Unable to save Reality Check progress."
          );

          return false;
        }

        await loadProgress();

        return true;
      } catch (err) {
        console.error(
          "CURIO: Failed to update Reality Check progress:",
          err
        );

        setError(
          "Unable to save Reality Check progress."
        );

        return false;
      } finally {
        setSaving(false);
      }
    },
    [
      totalQuestions,
      loadProgress,
    ]
  );

  /* =========================================
     COMPLETE
  ========================================= */

  const markComplete = useCallback(
    async (score: number) => {
      setSaving(true);
      setError(null);

      try {
        const success =
          await completeRealityCheck(
            totalQuestions,
            score,
            totalQuestions
          );

        if (!success) {
          setError(
            "Unable to complete Reality Check."
          );

          return false;
        }

        await loadProgress();

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
      totalQuestions,
      loadProgress,
    ]
  );

  /* =========================================
     RESET
  ========================================= */

  const resetProgress = useCallback(
    async () => {
      setSaving(true);
      setError(null);

      try {
        const success =
          await saveRealityCheckProgress(
            0,
            0,
            totalQuestions,
            0
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
    [totalQuestions]
  );

  /* =========================================
     CALCULATED VALUES
  ========================================= */

  const completedQuestions =
    (progress as
      | (RealityCheckProgress & {
          completedQuestions?: number;
        })
      | null)?.completedQuestions ?? 0;

  const currentQuestion =
    (progress as
      | (RealityCheckProgress & {
          currentQuestion?: number;
        })
      | null)?.currentQuestion ?? 0;

  const score =
    progress?.score ?? 0;

  const completed =
    progress?.completed ?? false;

  const progressPercentage =
    totalQuestions > 0
      ? Math.round(
          (completedQuestions /
            totalQuestions) *
            100
        )
      : 0;

  /* =========================================
     RETURN
  ========================================= */

  return {
    progress,

    loading,
    saving,
    error,

    currentQuestion,
    completedQuestions,
    totalQuestions,

    score,
    completed,

    progressPercentage,

    updateProgress,
    markComplete,
    resetProgress,

    reload: loadProgress,
  };
}

export default useRealityCheckProgress;