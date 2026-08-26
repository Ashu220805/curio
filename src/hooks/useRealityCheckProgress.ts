import {
  useCallback,
  useEffect,
  useRef,
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
  const [
    progress,
    setProgress,
  ] =
    useState<RealityCheckProgress | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  /*
   * Prevent an old asynchronous request
   * from overwriting newer progress.
   */
  const requestIdRef =
    useRef(0);

  /* =========================================
     SAFE TOTAL QUESTIONS
  ========================================== */

  const safeTotalQuestions =
    Math.max(
      0,
      Math.floor(
        Number.isFinite(
          totalQuestions
        )
          ? totalQuestions
          : 0
      )
    );

  /* =========================================
     LOAD PROGRESS
  ========================================== */

  const loadProgress =
    useCallback(
      async () => {
        const requestId =
          ++requestIdRef.current;

        setLoading(true);
        setError(null);

        try {
          const savedProgress =
            await getRealityCheckProgress(
              realityCheckId
            );

          /*
           * Do not allow an old request
           * to overwrite a newer request.
           */
          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          setProgress(
            savedProgress
          );
        } catch (err) {
          console.error(
            "CURIO: Failed to load Reality Check progress:",
            err
          );

          if (
            requestId ===
            requestIdRef.current
          ) {
            setError(
              "Unable to load your Reality Check progress."
            );
          }
        } finally {
          if (
            requestId ===
            requestIdRef.current
          ) {
            setLoading(false);
          }
        }
      },
      [
        realityCheckId,
      ]
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

    void load();

    return () => {
      active = false;
    };
  }, [
    realityCheckId,
  ]);

  /* =========================================
     SAVE PROGRESS
  ========================================== */

  const updateProgress =
    useCallback(
      async (
        currentQuestion: number,
        completedQuestions: number,
        totalScore = 0
      ): Promise<boolean> => {
        if (saving) {
          return false;
        }

        setSaving(true);
        setError(null);

        /*
         * Keep local state immediately aligned
         * with the intended saved state.
         */
        const safeCurrentQuestion =
          Math.max(
            0,
            Math.min(
              Math.floor(
                Number.isFinite(
                  currentQuestion
                )
                  ? currentQuestion
                  : 0
              ),
              safeTotalQuestions
            )
          );

        const safeCompletedQuestions =
          Math.max(
            0,
            Math.min(
              Math.floor(
                Number.isFinite(
                  completedQuestions
                )
                  ? completedQuestions
                  : 0
              ),
              safeTotalQuestions
            )
          );

        const safeScore =
          Math.max(
            0,
            Math.floor(
              Number.isFinite(
                totalScore
              )
                ? totalScore
                : 0
            )
          );

        try {
          const success =
            await saveRealityCheckProgress(
              realityCheckId,
              safeCurrentQuestion,
              safeCompletedQuestions,
              safeTotalQuestions,
              safeScore
            );

          if (!success) {
            setError(
              "Progress could not be saved. Check your Supabase connection, authentication, and database permissions."
            );

            return false;
          }

          /*
           * Reload from Supabase after saving.
           * Supabase remains the source of truth.
           */
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
            "Progress could not be saved. Please try the action again."
          );

          return false;
        } finally {
          setSaving(false);
        }
      },
      [
        realityCheckId,
        safeTotalQuestions,
        saving,
      ]
    );

  /* =========================================
     COMPLETE REALITY CHECK
  ========================================== */

  const markComplete =
    useCallback(
      async (
        totalScore: number
      ): Promise<boolean> => {
        if (saving) {
          return false;
        }

        setSaving(true);
        setError(null);

        try {
          const safeScore =
            Math.max(
              0,
              Math.floor(
                Number.isFinite(
                  totalScore
                )
                  ? totalScore
                  : 0
              )
            );

          const success =
            await completeRealityCheck(
              realityCheckId,
              safeTotalQuestions,
              safeScore
            );

          if (!success) {
            setError(
              "Reality Check could not be completed. Please try again."
            );

            return false;
          }

          /*
           * Always reload after completion.
           */
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
            "Reality Check could not be completed. Please try again."
          );

          return false;
        } finally {
          setSaving(false);
        }
      },
      [
        realityCheckId,
        safeTotalQuestions,
        saving,
      ]);

  /* =========================================
     RESET REALITY CHECK
  ========================================== */

  const reset =
    useCallback(
      async (): Promise<boolean> => {
        if (saving) {
          return false;
        }

        setSaving(true);
        setError(null);

        try {
          const success =
            await resetRealityCheck(
              realityCheckId
            );

          if (!success) {
            setError(
              "Reality Check could not be reset. Please try again."
            );

            return false;
          }

          /*
           * Reset local state only after
           * Supabase confirms deletion.
           */
          setProgress(
            null
          );

          return true;
        } catch (err) {
          console.error(
            "CURIO: Failed to reset Reality Check:",
            err
          );

          setError(
            "Reality Check could not be reset. Please try again."
          );

          return false;
        } finally {
          setSaving(false);
        }
      },
      [
        realityCheckId,
        saving,
      ]
    );

  /* =========================================
     CALCULATED VALUES
  ========================================== */

  const currentQuestion =
    progress?.currentQuestion ??
    0;

  const completedQuestions =
    progress?.completedQuestions ??
    0;

  const totalScore =
    progress?.totalScore ??
    0;

  /*
   * Compatibility alias.
   */
  const score =
    totalScore;

  const completed =
    progress?.completed ??
    false;

  const progressPercentage =
    safeTotalQuestions > 0
      ? Math.min(
          100,
          Math.round(
            (completedQuestions /
              safeTotalQuestions) *
              100
          )
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
  const [
    progress,
    setProgress,
  ] =
    useState<
      RealityCheckProgress[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  /* =========================================
     LOAD ALL PROGRESS
  ========================================== */

  const loadAllProgress =
    useCallback(
      async () => {
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