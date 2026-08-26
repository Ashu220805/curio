// deno-lint-ignore-file

import { supabase } from "./supabase";

/* =========================================
   LESSON PROGRESS TYPE
========================================= */

export interface LessonProgress {
  userId: string;
  lessonId: number;

  currentSection: number;
  completedSections: number;
  totalSections: number;

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
      "CURIO LESSON PROGRESS AUTH ERROR:",
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
): LessonProgress {
  return {
    userId: String(row.user_id),

    lessonId: Number(
      row.lesson_id ?? 0
    ),

    currentSection: Number(
      row.current_section ?? 0
    ),

    completedSections: Number(
      row.completed_sections ?? 0
    ),

    totalSections: Number(
      row.total_sections ?? 0
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
   GET SINGLE LESSON PROGRESS
========================================= */

export async function getLessonProgress(
  lessonId: number
): Promise<LessonProgress | null> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) {
    console.error(
      "CURIO: Failed to load Lesson progress:",
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
   GET ALL LESSON PROGRESS
========================================= */

export async function getAllLessonProgress(): Promise<
  LessonProgress[]
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
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .order("lesson_id", {
      ascending: true,
    });

  if (error) {
    console.error(
      "CURIO: Failed to load all Lesson progress:",
      error
    );

    return [];
  }

  return (data ?? []).map((row) =>
    mapProgress(row)
  );
}

/* =========================================
   SAVE LESSON PROGRESS
========================================= */

export async function saveLessonProgress(
  lessonId: number,
  currentSection: number,
  completedSections: number,
  totalSections: number
): Promise<boolean> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    console.error(
      "CURIO: No authenticated user."
    );

    return false;
  }

  const safeTotalSections =
    Math.max(0, totalSections);

  const safeCurrentSection =
    Math.max(
      0,
      Math.min(
        currentSection,
        safeTotalSections
      )
    );

  const safeCompletedSections =
    Math.max(
      0,
      Math.min(
        completedSections,
        safeTotalSections
      )
    );

  const completed =
    safeTotalSections > 0 &&
    safeCompletedSections >=
      safeTotalSections;

  const now =
    new Date().toISOString();

  const {
    error,
  } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: userId,

        lesson_id: lessonId,

        current_section:
          safeCurrentSection,

        completed_sections:
          safeCompletedSections,

        total_sections:
          safeTotalSections,

        completed,

        last_accessed_at:
          now,

        completed_at:
          completed ? now : null,
      },
      {
        onConflict:
          "user_id,lesson_id",
      }
    );

  if (error) {
    console.error(
      "CURIO: Failed to save Lesson progress:",
      error
    );

    return false;
  }

  return true;
}

/* =========================================
   COMPLETE LESSON
========================================= */

export async function completeLesson(
  lessonId: number,
  totalSections: number
): Promise<boolean> {
  return saveLessonProgress(
    lessonId,
    totalSections,
    totalSections,
    totalSections
  );
}

/* =========================================
   CHECK LESSON ACCESS
========================================= */

export async function canAccessLesson(
  lessonId: number
): Promise<boolean> {
  /*
   * Lesson 1 is always available.
   */
  if (lessonId <= 1) {
    return true;
  }

  const previousLessonId =
    lessonId - 1;

  const previousProgress =
    await getLessonProgress(
      previousLessonId
    );

  /*
   * A lesson becomes available when
   * the previous lesson is completed.
   */
  return (
    previousProgress?.completed === true
  );
}

/* =========================================
   CHECK LESSON COMPLETION
========================================= */

export async function isLessonCompleted(
  lessonId: number
): Promise<boolean> {
  const progress =
    await getLessonProgress(
      lessonId
    );

  return (
    progress?.completed === true
  );
}