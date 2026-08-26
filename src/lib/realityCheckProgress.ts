// deno-lint-ignore-file

import { supabase } from "./supabase";

/* =========================================
   REALITY CHECK PROGRESS TYPE
========================================= */

export interface RealityCheckProgress {
  userId: string;
  realityCheckId: number;

  currentQuestion: number;
  completedQuestions: number;
  totalQuestions: number;

  totalScore: number;

  completed: boolean;

  lastAccessedAt?: string | null;
  completedAt?: string | null;
}

/* =========================================
   CURRENT USER
========================================= */

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(
      "CURIO REALITY CHECK AUTH ERROR:",
      error
    );

    return null;
  }

  return user?.id ?? null;
}

/* =========================================
   DATABASE ROW → APP OBJECT
========================================= */

function mapProgress(
  row: Record<string, unknown>
): RealityCheckProgress {
  return {
    userId: String(row.user_id ?? ""),

    realityCheckId: Number(
      row.reality_check_id ?? 0
    ),

    currentQuestion: Number(
      row.current_question ?? 0
    ),

    completedQuestions: Number(
      row.completed_questions ?? 0
    ),

    totalQuestions: Number(
      row.total_questions ?? 0
    ),

    totalScore: Number(
      row.total_score ?? 0
    ),

    completed:
      Boolean(row.completed),

    lastAccessedAt:
      typeof row.last_accessed_at === "string"
        ? row.last_accessed_at
        : null,

    completedAt:
      typeof row.completed_at === "string"
        ? row.completed_at
        : null,
  };
}

/* =========================================
   GET SINGLE REALITY CHECK PROGRESS
========================================= */

export async function getRealityCheckProgress(
  realityCheckId: number
): Promise<RealityCheckProgress | null> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("reality_check_progress")
    .select("*")
    .eq("user_id", userId)
    .eq(
      "reality_check_id",
      realityCheckId
    )
    .maybeSingle();

  if (error) {
    console.error(
      "CURIO: Failed to load Reality Check progress:",
      error
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return mapProgress(data);
}

/* =========================================
   GET ALL REALITY CHECK PROGRESS
========================================= */

export async function getAllRealityCheckProgress(): Promise<
  RealityCheckProgress[]
> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("reality_check_progress")
    .select("*")
    .eq("user_id", userId)
    .order(
      "reality_check_id",
      {
        ascending: true,
      }
    );

  if (error) {
    console.error(
      "CURIO: Failed to load all Reality Check progress:",
      error
    );

    return [];
  }

  return (data ?? []).map(
    (row) => mapProgress(row)
  );
}

/* =========================================
   SAVE REALITY CHECK PROGRESS
========================================= */

export async function saveRealityCheckProgress(
  realityCheckId: number,
  currentQuestion: number,
  completedQuestions: number,
  totalQuestions: number,
  totalScore = 0
): Promise<boolean> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    console.error(
      "CURIO: No authenticated user."
    );

    return false;
  }

  const safeTotalQuestions =
    Math.max(
      0,
      totalQuestions
    );

  const safeCurrentQuestion =
    Math.max(
      0,
      Math.min(
        currentQuestion,
        safeTotalQuestions
      )
    );

  const safeCompletedQuestions =
    Math.max(
      0,
      Math.min(
        completedQuestions,
        safeTotalQuestions
      )
    );

  const safeScore =
    Math.max(
      0,
      totalScore
    );

  const now =
    new Date().toISOString();

  const completed =
    safeTotalQuestions > 0 &&
    safeCompletedQuestions >=
      safeTotalQuestions;

  const {
    error,
  } = await supabase
    .from("reality_check_progress")
    .upsert(
      {
        user_id:
          userId,

        reality_check_id:
          realityCheckId,

        current_question:
          safeCurrentQuestion,

        completed_questions:
          safeCompletedQuestions,

        total_questions:
          safeTotalQuestions,

        total_score:
          safeScore,

        completed,

        last_accessed_at:
          now,

        completed_at:
          completed
            ? now
            : null,
      },
      {
        onConflict:
          "user_id,reality_check_id",
      }
    );

  if (error) {
    console.error(
      "CURIO: Failed to save Reality Check progress:",
      error
    );

    return false;
  }

  return true;
}

/* =========================================
   COMPLETE REALITY CHECK
========================================= */

export async function completeRealityCheck(
  realityCheckId: number,
  totalQuestions: number,
  totalScore: number
): Promise<boolean> {
  return saveRealityCheckProgress(
    realityCheckId,
    totalQuestions,
    totalQuestions,
    totalQuestions,
    totalScore
  );
}

/* =========================================
   RESET REALITY CHECK
========================================= */

export async function resetRealityCheck(
  realityCheckId: number
): Promise<boolean> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    console.error(
      "CURIO: No authenticated user."
    );

    return false;
  }

  const {
    error,
  } = await supabase
    .from("reality_check_progress")
    .delete()
    .eq(
      "user_id",
      userId
    )
    .eq(
      "reality_check_id",
      realityCheckId
    );

  if (error) {
    console.error(
      "CURIO: Failed to reset Reality Check:",
      error
    );

    return false;
  }

  return true;
}

/* =========================================
   CHECK COMPLETION
========================================= */

export async function isRealityCheckCompleted(
  realityCheckId: number
): Promise<boolean> {
  const progress =
    await getRealityCheckProgress(
      realityCheckId
    );

  return (
    progress?.completed === true
  );
}