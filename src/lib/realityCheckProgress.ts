import { supabase } from "./supabase.ts";

export type RealityCheckProgress = {
  id?: string;
  userId: string;

  completedItems: number;
  totalItems: number;

  score: number;
  totalScore: number;

  progressPercent: number;

  completed: boolean;

  lastAccessedAt?: string;
  completedAt?: string | null;
};

type RealityCheckProgressRow = {
  id?: string;
  user_id: string;
  completed_items?: number | null;
  total_items?: number | null;
  score?: number | null;
  total_score?: number | null;
  progress_percent?: number | null;
  completed?: boolean | null;
  last_accessed_at?: string | null;
  completed_at?: string | null;
};

function mapProgress(row: RealityCheckProgressRow): RealityCheckProgress {
  return {
    id: row.id,
    userId: row.user_id,

    completedItems: row.completed_items ?? 0,
    totalItems: row.total_items ?? 8,

    score: row.score ?? 0,
    totalScore: row.total_score ?? 100,

    progressPercent: row.progress_percent ?? 0,

    completed: row.completed ?? false,

    lastAccessedAt: row.last_accessed_at,
    completedAt: row.completed_at,
  };
}


/* ============================================
   GET CURRENT USER
============================================ */

async function getCurrentUser() {
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

  return user;
}


/* ============================================
   LOAD REALITY CHECK PROGRESS
============================================ */

export async function getRealityCheckProgress(): Promise<
  RealityCheckProgress | null
> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("reality_check_progress")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "CURIO: Failed to load Reality Check progress:",
      error
    );

    throw error;
  }

  if (!data) {
    return null;
  }

  return mapProgress(data);
}


/* ============================================
   SAVE REALITY CHECK PROGRESS
============================================ */

export async function saveRealityCheckProgress(
  completedItems: number,
  totalItems: number,
  score: number,
  totalScore: number
): Promise<RealityCheckProgress | null> {
  const user = await getCurrentUser();

  if (!user) {
    console.error(
      "CURIO: No authenticated user."
    );

    return null;
  }

  const safeTotalItems =
    Math.max(totalItems, 1);

  const safeTotalScore =
    Math.max(totalScore, 1);

  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (completedItems /
          safeTotalItems) *
          100
      )
    )
  );

  const completed =
    completedItems >= safeTotalItems;

  const { data, error } = await supabase
    .from("reality_check_progress")
    .upsert(
      {
        user_id: user.id,

        completed_items: completedItems,
        total_items: safeTotalItems,

        score,
        total_score: safeTotalScore,

        progress_percent: progressPercent,

        completed,

        last_accessed_at:
          new Date().toISOString(),

        completed_at: completed
          ? new Date().toISOString()
          : null,

        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error(
      "CURIO: Failed to save Reality Check progress:",
      error
    );

    throw error;
  }

  return mapProgress(data);
}


/* ============================================
   COMPLETE REALITY CHECK
============================================ */

export function completeRealityCheck(
  totalItems: number,
  score: number,
  totalScore: number
) {
  return saveRealityCheckProgress(
    totalItems,
    totalItems,
    score,
    totalScore
  );
}