import { supabase } from "./supabase.ts";

export interface RealityCheckProgress {
  userId: string;
  realityCheckId: number;

  completed: boolean;

  currentQuestion: number;
  completedQuestions: number;
  totalQuestions: number;

  totalScore: number;

  lastAccessedAt?: string;
  completedAt?: string | null;
}

const REALITY_CHECK_TABLE = "reality_check_progress";

interface RealityCheckProgressRow {
  user_id: string;
  reality_check_id: number;
  completed: boolean;
  current_question: number | null;
  completed_questions: number | null;
  total_questions: number | null;
  total_score: number | null;
  last_accessed_at: string | null;
  completed_at: string | null;
}

/* =========================================
   GET CURRENT USER
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
   MAP DATABASE ROW
========================================= */

function mapProgress(
  row: RealityCheckProgressRow
): RealityCheckProgress {
  return {
    userId: row.user_id,
    realityCheckId: Number(
      row.reality_check_id
    ),

    completed: Boolean(
      row.completed
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

    lastAccessedAt:
      row.last_accessed_at ??
      undefined,

    completedAt:
      row.completed_at ?? null,
  };
}

/* =========================================
   GET REALITY CHECK PROGRESS
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
    .from(REALITY_CHECK_TABLE)
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
    .from(REALITY_CHECK_TABLE)
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

  return (data ?? []).map(mapProgress);
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
    return false;
  }

  const safeCurrentQuestion =
    Math.max(
      0,
      Math.min(
        currentQuestion,
        totalQuestions
      )
    );

  const safeCompletedQuestions =
    Math.max(
      0,
      Math.min(
        completedQuestions,
        totalQuestions
      )
    );

  const safeScore = Math.max(
    0,
    totalScore
  );

  const isCompleted =
    totalQuestions > 0 &&
    safeCompletedQuestions >=
      totalQuestions;

  const now =
    new Date().toISOString();

  const {
    error,
  } = await supabase
    .from(REALITY_CHECK_TABLE)
    .upsert(
      {
        user_id: userId,

        reality_check_id:
          realityCheckId,

        current_question:
          safeCurrentQuestion,

        completed_questions:
          safeCompletedQuestions,

        total_questions:
          totalQuestions,

        total_score:
          safeScore,

        completed:
          isCompleted,

        last_accessed_at:
          now,

        completed_at:
          isCompleted ? now : null,
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
  const userId =
    await getCurrentUserId();

  if (!userId) {
    return false;
  }

  const now =
    new Date().toISOString();

  const {
    error,
  } = await supabase
    .from(REALITY_CHECK_TABLE)
    .upsert(
      {
        user_id: userId,

        reality_check_id:
          realityCheckId,

        current_question:
          totalQuestions,

        completed_questions:
          totalQuestions,

        total_questions:
          totalQuestions,

        total_score:
          totalScore,

        completed: true,

        last_accessed_at:
          now,

        completed_at:
          now,
      },
      {
        onConflict:
          "user_id,reality_check_id",
      }
    );

  if (error) {
    console.error(
      "CURIO: Failed to complete Reality Check:",
      error
    );

    return false;
  }

  return true;
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
    return false;
  }

  const {
    error,
  } = await supabase
    .from(REALITY_CHECK_TABLE)
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