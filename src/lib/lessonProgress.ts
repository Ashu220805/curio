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
   GUEST MODE
========================================= */

/*
  IMPORTANT:

  Guest users must NEVER read or write
  lesson progress from Supabase.

  Guest progress is kept only inside
  sessionStorage.

  This prevents a guest from accidentally
  seeing another authenticated user's progress.
*/

function isGuestMode(): boolean {
  try {
    return (
      sessionStorage.getItem("curio_guest") ===
      "true"
    );
  } catch (error) {
    console.error(
      "CURIO: Unable to check Guest Mode:",
      error
    );

    return false;
  }
}

/* =========================================
   GUEST STORAGE KEY
========================================= */

const GUEST_PROGRESS_KEY =
  "curio_guest_lesson_progress";

/* =========================================
   GET GUEST PROGRESS
========================================= */

function getGuestProgress(): LessonProgress[] {
  if (!isGuestMode()) {
    return [];
  }

  try {
    const stored =
      sessionStorage.getItem(
        GUEST_PROGRESS_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is LessonProgress => {
        return (
          typeof item === "object" &&
          item !== null &&
          typeof (
            item as LessonProgress
          ).lessonId === "number"
        );
      }
    );
  } catch (error) {
    console.error(
      "CURIO: Failed to load Guest lesson progress:",
      error
    );

    return [];
  }
}

/* =========================================
   SAVE GUEST PROGRESS
========================================= */

function saveGuestProgress(
  progress: LessonProgress
): boolean {
  if (!isGuestMode()) {
    return false;
  }

  /*
    Guest accounts are only allowed to
    access Lesson 1.
  */

  if (progress.lessonId !== 1) {
    console.warn(
      "CURIO: Guest attempted to save progress for a locked lesson."
    );

    return false;
  }

  try {
    const existing =
      getGuestProgress();

    const updated =
      existing.filter(
        (item) =>
          item.lessonId !==
          progress.lessonId
      );

    updated.push(progress);

    sessionStorage.setItem(
      GUEST_PROGRESS_KEY,
      JSON.stringify(updated)
    );

    return true;
  } catch (error) {
    console.error(
      "CURIO: Failed to save Guest lesson progress:",
      error
    );

    return false;
  }
}

/* =========================================
   CLEAR GUEST PROGRESS
========================================= */

export function clearGuestLessonProgress(): void {
  try {
    sessionStorage.removeItem(
      GUEST_PROGRESS_KEY
    );
  } catch (error) {
    console.error(
      "CURIO: Failed to clear Guest lesson progress:",
      error
    );
  }
}

/* =========================================
   CURRENT USER
========================================= */

async function getCurrentUserId(): Promise<string | null> {
  /*
    CRITICAL SECURITY RULE:

    Guest mode must NEVER use the current
    Supabase authentication session.

    This prevents accidental access to
    another user's progress.
  */

  if (isGuestMode()) {
    return null;
  }

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

  /* -----------------------------------------
     GUEST MODE
  ----------------------------------------- */

  if (isGuestMode()) {

    /*
      Guest can only access Lesson 1.
    */

    if (lessonId !== 1) {
      return null;
    }

    const guestProgress =
      getGuestProgress();

    return (
      guestProgress.find(
        (item) =>
          item.lessonId === lessonId
      ) ?? null
    );
  }

  /* -----------------------------------------
     AUTHENTICATED USER
  ----------------------------------------- */

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

  /* -----------------------------------------
     GUEST MODE
  ----------------------------------------- */

  if (isGuestMode()) {

    /*
      Guest only has Lesson 1.

      No Supabase query is performed.
    */

    return getGuestProgress().filter(
      (item) =>
        item.lessonId === 1
    );
  }

  /* -----------------------------------------
     AUTHENTICATED USER
  ----------------------------------------- */

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

  /* -----------------------------------------
     GUEST MODE
  ----------------------------------------- */

  if (isGuestMode()) {

    /*
      Guests are only allowed to save
      Lesson 1 progress.

      Nothing is written to Supabase.
    */

    if (lessonId !== 1) {
      console.warn(
        "CURIO: Guest cannot save locked lesson progress."
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

    const guestProgress: LessonProgress = {
      userId: "guest",

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

      totalSections:
        safeTotalSections,

      completed:
        finalCompleted,

      lastAccessedAt:
        now,

      completedAt:
        finalCompleted
          ? (
              existing?.completedAt ??
              now
            )
          : null,
    };

    const success =
      saveGuestProgress(
        guestProgress
      );

    if (success) {

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
                  guestProgress.currentSection,
                completedSections:
                  guestProgress.completedSections,
                completed:
                  guestProgress.completed,
              },
            }
          )
        );

        if (
          guestProgress.completed
        ) {
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
    }

    return success;
  }

  /* -----------------------------------------
     AUTHENTICATED USER
  ----------------------------------------- */

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

  /*
    Guest can only complete Lesson 1.
  */

  if (
    isGuestMode() &&
    lessonId !== 1
  ) {
    return false;
  }

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

  /* -----------------------------------------
     GUEST MODE
  ----------------------------------------- */

  if (isGuestMode()) {

    /*
      Guest gets exactly ONE lesson.
    */

    return lessonId === 1;
  }

  /* -----------------------------------------
     AUTHENTICATED USER
  ----------------------------------------- */

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