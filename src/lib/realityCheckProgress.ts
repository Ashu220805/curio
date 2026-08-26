// deno-lint-ignore-file

import { supabase } from "./supabase";

/* =========================================================
   REALITY CHECK PROGRESS
   CURIO
========================================================= */

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

/* =========================================================
   DATABASE ROW TYPE
========================================================= */

interface RealityCheckProgressRow {
  user_id: string;
  reality_check_id: number | null;

  current_question: number | null;
  completed_questions: number | null;
  total_questions: number | null;

  total_score: number | null;

  completed: boolean | null;

  last_accessed_at: string | null;
  completed_at: string | null;
}

/* =========================================================
   GET CURRENT USER
========================================================= */

async function getCurrentUserId(): Promise<string | null> {
  try {
    const {
      data,
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error(
        "CURIO REALITY CHECK AUTH ERROR:",
        error.message
      );

      return null;
    }

    return data.user?.id ?? null;
  } catch (error) {
    console.error(
      "CURIO REALITY CHECK AUTH EXCEPTION:",
      error
    );

    return null;
  }
}

/* =========================================================
   DATABASE ROW → APP OBJECT
========================================================= */

function mapProgress(
  row: RealityCheckProgressRow
): RealityCheckProgress {
  return {
    userId: row.user_id,

    realityCheckId:
      Number(row.reality_check_id ?? 0),

    currentQuestion:
      Number(row.current_question ?? 0),

    completedQuestions:
      Number(row.completed_questions ?? 0),

    totalQuestions:
      Number(row.total_questions ?? 0),

    totalScore:
      Number(row.total_score ?? 0),

    completed:
      Boolean(row.completed),

    lastAccessedAt:
      row.last_accessed_at ?? null,

    completedAt:
      row.completed_at ?? null,
  };
}

/* =========================================================
   GET ONE REALITY CHECK
========================================================= */

export async function getRealityCheckProgress(
  realityCheckId: number
): Promise<RealityCheckProgress | null> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    return null;
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from("reality_check_progress")
      .select(
        `
        user_id,
        reality_check_id,
        current_question,
        completed_questions,
        total_questions,
        total_score,
        completed,
        last_accessed_at,
        completed_at
        `
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "reality_check_id",
        realityCheckId
      )
      .maybeSingle();

    if (error) {
      console.error(
        "CURIO: Failed to load Reality Check progress:",
        error.message
      );

      return null;
    }

    if (!data) {
      return null;
    }

    return mapProgress(
      data as RealityCheckProgressRow
    );
  } catch (error) {
    console.error(
      "CURIO: Reality Check load exception:",
      error
    );

    return null;
  }
}

/* =========================================================
   GET ALL REALITY CHECK PROGRESS
========================================================= */

export async function getAllRealityCheckProgress(): Promise<
  RealityCheckProgress[]
> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    return [];
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from("reality_check_progress")
      .select(
        `
        user_id,
        reality_check_id,
        current_question,
        completed_questions,
        total_questions,
        total_score,
        completed,
        last_accessed_at,
        completed_at
        `
      )
      .eq(
        "user_id",
        userId
      )
      .order(
        "reality_check_id",
        {
          ascending: true,
        }
      );

    if (error) {
      console.error(
        "CURIO: Failed to load all Reality Check progress:",
        error.message
      );

      return [];
    }

    return (
      (data ?? []) as RealityCheckProgressRow[]
    ).map(
      mapProgress
    );
  } catch (error) {
    console.error(
      "CURIO: Failed to load all Reality Check progress:",
      error
    );

    return [];
  }
}

/* =========================================================
   SAVE REALITY CHECK PROGRESS
========================================================= */

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

  /* -----------------------------------------
     SANITIZE VALUES
  ----------------------------------------- */

  const safeRealityCheckId =
    Math.max(
      0,
      Math.floor(
        realityCheckId
      )
    );

  const safeTotalQuestions =
    Math.max(
      0,
      Math.floor(
        totalQuestions
      )
    );

  const safeCurrentQuestion =
    Math.max(
      0,
      Math.min(
        Math.floor(
          currentQuestion
        ),
        safeTotalQuestions
      )
    );

  const safeCompletedQuestions =
    Math.max(
      0,
      Math.min(
        Math.floor(
          completedQuestions
        ),
        safeTotalQuestions
      )
    );

  const safeScore =
    Math.max(
      0,
      Math.floor(
        totalScore
      )
    );

  /* -----------------------------------------
     COMPLETION
  ----------------------------------------- */

  const completed =
    safeTotalQuestions > 0 &&
    safeCompletedQuestions >=
      safeTotalQuestions;

  const now =
    new Date().toISOString();

  /* -----------------------------------------
     DATABASE PAYLOAD
  ----------------------------------------- */

  const payload = {
    user_id: userId,

    reality_check_id:
      safeRealityCheckId,

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
  };

  try {
    const {
      error,
    } = await supabase
      .from("reality_check_progress")
      .upsert(
        payload,
        {
          onConflict:
            "user_id,reality_check_id",
        }
      );

    if (error) {
      console.error(
        "CURIO: Failed to save Reality Check progress:",
        error.message
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "CURIO: Reality Check save exception:",
      error
    );

    return false;
  }
}

/* =========================================================
   COMPLETE REALITY CHECK
========================================================= */

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

/* =========================================================
   RESET REALITY CHECK
========================================================= */

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

  try {
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
        error.message
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "CURIO: Reality Check reset exception:",
      error
    );

    return false;
  }
}

/* =========================================================
   CHECK COMPLETION
========================================================= */

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