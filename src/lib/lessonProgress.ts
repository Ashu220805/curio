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
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error(
        "CURIO LESSON PROGRESS AUTH ERROR:",
        error.message
      );

      return null;
    }

    return user?.id ?? null;
  } catch (error) {
    console.error(
      "CURIO LESSON PROGRESS AUTH EXCEPTION:",
      error
    );

    return null;
  }
}

/* =========================================
   NORMALIZE NUMBER
========================================= */

function safeNumber(
  value: unknown,
  fallback = 0
): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

/* =========================================
   DATABASE ROW → APP OBJECT
========================================= */

function mapProgress(
  row: Record<string, unknown>
): LessonProgress {
  return {
    userId: String(
      row.user_id ?? ""
    ),

    lessonId: safeNumber(
      row.lesson_id
    ),

    currentSection: safeNumber(
      row.current_section
    ),

    completedSections: safeNumber(
      row.completed_sections
    ),

    totalSections: safeNumber(
      row.total_sections
    ),

    completed:
      row.completed === true,

    lastAccessedAt:
      typeof row.last_accessed_at ===
      "string"
        ? row.last_accessed_at
        : null,

    completedAt:
      typeof row.completed_at ===
      "string"
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
    .select(
      `
        user_id,
        lesson_id,
        current_section,
        completed_sections,
        total_sections,
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
      "lesson_id",
      lessonId
    )
    .maybeSingle();

  if (error) {
    console.error(
      "CURIO: Failed to load Lesson progress:",
      error.message
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
    .select(
      `
        user_id,
        lesson_id,
        current_section,
        completed_sections,
        total_sections,
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
      "lesson_id",
      {
        ascending: true,
      }
    );

  if (error) {
    console.error(
      "CURIO: Failed to load all Lesson progress:",
      error.message
    );

    return [];
  }

  return (
    data ?? []
  ).map((row) =>
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
    Math.max(
      0,
      Math.floor(
        safeNumber(
          totalSections
        )
      )
    );

  const safeCurrentSection =
    Math.max(
      0,
      Math.min(
        Math.floor(
          safeNumber(
            currentSection
          )
        ),
        safeTotalSections
      )
    );

  const safeCompletedSections =
    Math.max(
      0,
      Math.min(
        Math.floor(
          safeNumber(
            completedSections
          )
        ),
        safeTotalSections
      )
    );

  const completed =
    safeTotalSections > 0 &&
    safeCompletedSections >=
      safeTotalSections;

  const now =
    new Date().toISOString();

  /*
   * IMPORTANT:
   *
   * Never move saved progress backwards.
   *
   * If the database already contains:
   *
   * 5 / 8
   *
   * and a component accidentally sends:
   *
   * 3 / 8
   *
   * we don't want to destroy the user's progress.
   */

  const existing =
    await getLessonProgress(
      lessonId
    );

  const finalCompletedSections =
    Math.max(
      existing?.completedSections ?? 0,
      safeCompletedSections
    );

  const finalCurrentSection =
    Math.max(
      existing?.currentSection ?? 0,
      safeCurrentSection
    );

  const finalCompleted =
    completed ||
    existing?.completed === true ||
    (
      safeTotalSections > 0 &&
      finalCompletedSections >=
        safeTotalSections
    );

  const {
    error,
  } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id:
          userId,

        lesson_id:
          lessonId,

        current_section:
          Math.min(
            finalCurrentSection,
            safeTotalSections
          ),

        completed_sections:
          Math.min(
            finalCompletedSections,
            safeTotalSections
          ),

        total_sections:
          safeTotalSections,

        completed:
          finalCompleted,

        last_accessed_at:
          now,

        completed_at:
          finalCompleted
            ? (
                existing?.completedAt ??
                now
              )
            : null,
      },
      {
        onConflict:
          "user_id,lesson_id",
      }
    );

  if (error) {
    console.error(
      "CURIO: Failed to save Lesson progress:",
      error.message
    );

    return false;
  }

  /*
   * Notify Learn.tsx and other pages.
   *
   * Supabase remains the source of truth.
   * This event only tells the UI to reload.
   */

  if (
    typeof globalThis !==
    "undefined"
  ) {
    globalThis.dispatchEvent(
      new CustomEvent(
        "curio:lesson-progress-updated",
        {
          detail: {
            lessonId,
            currentSection:
              Math.min(
                finalCurrentSection,
                safeTotalSections
              ),
            completedSections:
              Math.min(
                finalCompletedSections,
                safeTotalSections
              ),
            completed:
              finalCompleted,
          },
        }
      )
    );

    if (finalCompleted) {
      globalThis.dispatchEvent(
        new CustomEvent(
          "curio:lesson-completed",
          {
            detail: {
              lessonId,
            },
          }
        )
      );
    }
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
   * Lesson 1 is always unlocked.
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

  return (
    previousProgress?.completed ===
    true
  );
}

/* =========================================
   CHECK COMPLETION
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