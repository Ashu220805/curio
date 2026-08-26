import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  completeSimulationSession,
  getSimulationSession,
  saveSimulationProgress,
  submitSimulationPrompt,
} from "../lib/aiSimulator.ts";

import type {
  AISimulationResult,
  AISimulationSession,
} from "../types/aiSimulator.ts";

/* =========================================
   HOOK
========================================= */

export function useAiSimulator() {
  const [
    session,
    setSession,
  ] = useState<AISimulationSession | null>(
    null,
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
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  /* =========================================
     LOAD SESSION
  ========================================= */

  const loadSession =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const saved =
          await getSimulationSession();

        setSession(saved);
      } catch (err) {
        console.error(
          "CURIO: Failed to load AI Simulation session:",
          err,
        );

        setError(
          "Unable to load AI Simulation progress.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /* =========================================
     INITIAL LOAD
  ========================================= */

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  /* =========================================
     SAVE SESSION
  ========================================= */

  const saveSession =
    useCallback(
      async (
        nextSession: AISimulationSession,
      ) => {
        setSaving(true);
        setError(null);

        try {
          const success =
            await saveSimulationProgress(
              nextSession,
            );

          if (!success) {
            setError(
              "Unable to save AI Simulation progress.",
            );

            return false;
          }

          setSession(
            nextSession,
          );

          return true;
        } catch (err) {
          console.error(
            "CURIO: Failed to save AI Simulation session:",
            err,
          );

          setError(
            "Unable to save AI Simulation progress.",
          );

          return false;
        } finally {
          setSaving(false);
        }
      },
      [],
    );

  /* =========================================
     SUBMIT PROMPT
  ========================================= */

  const submitPrompt =
    useCallback(
      async (
        prompt: string,
      ): Promise<AISimulationResult | null> => {
        setSubmitting(true);
        setError(null);

        try {
          /*
            If no session exists, create one
            using the current authenticated user.
          */

          let currentSession =
            session;

          if (!currentSession) {
            await loadSession();

            currentSession =
              await getSimulationSession();
          }

          if (!currentSession) {
            throw new Error(
              "Unable to create an AI Simulation session. Please sign in again.",
            );
          }

          const result =
            await submitSimulationPrompt(
              currentSession,
              prompt,
            );

          /*
            Reload the saved session so the
            React state always matches storage.
          */

          const updatedSession =
            await getSimulationSession();

          if (updatedSession) {
            setSession(
              updatedSession,
            );
          }

          return result;
        } catch (err) {
          console.error(
            "CURIO: Failed to submit AI Simulation prompt:",
            err,
          );

          const message =
            err instanceof Error
              ? err.message
              : "Unable to process your prompt.";

          setError(message);

          return null;
        } finally {
          setSubmitting(false);
        }
      },
      [
        session,
        loadSession,
      ],
    );

  /* =========================================
     COMPLETE SESSION
  ========================================= */

  const complete =
    useCallback(async () => {
      setSaving(true);
      setError(null);

      try {
        if (!session) {
          setError(
            "No AI Simulation session is available.",
          );

          return false;
        }

        const success =
          await completeSimulationSession(
            session,
          );

        if (!success) {
          setError(
            "Unable to complete AI Simulation session.",
          );

          return false;
        }

        setSession({
          ...session,
          completed: true,
          updatedAt:
            new Date().toISOString(),
        });

        return true;
      } catch (err) {
        console.error(
          "CURIO: Failed to complete AI Simulation:",
          err,
        );

        setError(
          "Unable to complete AI Simulation session.",
        );

        return false;
      } finally {
        setSaving(false);
      }
    }, [session]);

  /* =========================================
     RESET
  ========================================= */

  const reset =
    useCallback(() => {
      localStorage.removeItem(
        "curio_ai_simulation_session",
      );

      setSession(null);
      setError(null);
    }, []);

  /* =========================================
     RETURN
  ========================================= */

  return {
    session,

    loading,
    saving,
    submitting,

    error,

    loadSession,
    saveSession,
    submitPrompt,
    complete,
    reset,

    results:
      session?.results ?? [],

    currentQuestion:
      session?.currentQuestion ?? 0,

    totalQuestions:
      session?.totalQuestions ?? 8,

    completedQuestions:
      session?.completedQuestions ?? 0,

    score:
      session?.score ?? 0,

    completed:
      session?.completed ?? false,
  };
}