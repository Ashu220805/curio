import { supabase } from "./supabase.ts";

export interface LessonProgress {
  lessonId: number;
  completed: boolean;
  currentSection: number;
  totalSections: number;
  completedSections: number;
  lastAccessedAt: string;
  completedAt: string | null;
}

const PROGRESS_TABLE = "lesson_progress";

/* =========================================
   GET CURRENT USER
========================================= */

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log("CURIO AUTH USER:", user);
  console.log("CURIO AUTH ERROR:", error);

  if (error) {
    console.error(
      "CURIO: Unable to get current user:",
      error
    );

    return null;
  }

  return user?.id ?? null;
}
/* =========================================
   GET LESSON PROGRESS
========================================= */

export async function getLessonProgress(
  lessonId: number
): Promise<LessonProgress | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from(PROGRESS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) {
    console.error(
      "CURIO: Failed to load lesson progress:",
      error
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return {
    lessonId: Number(data.lesson_id),
    completed: Boolean(data.completed),
    currentSection: Number(
      data.current_section ?? 0
    ),
    totalSections: Number(
      data.total_sections ?? 0
    ),
    completedSections: Number(
      data.completed_sections ?? 0
    ),
    lastAccessedAt:
      data.last_accessed_at ??
      new Date().toISOString(),
    completedAt:
      data.completed_at ?? null,
  };
}

/* =========================================
   GET ALL LESSON PROGRESS
========================================= */

export async function getAllLessonProgress(): Promise<
  LessonProgress[]
> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from(PROGRESS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("lesson_id", {
      ascending: true,
    });

  if (error) {
    console.error(
      "CURIO: Failed to load all lesson progress:",
      error
    );

    return [];
  }

  return (data ?? []).map((item) => ({
    lessonId: Number(item.lesson_id),
    completed: Boolean(item.completed),
    currentSection: Number(
      item.current_section ?? 0
    ),
    totalSections: Number(
      item.total_sections ?? 0
    ),
    completedSections: Number(
      item.completed_sections ?? 0
    ),
    lastAccessedAt:
      item.last_accessed_at ??
      new Date().toISOString(),
    completedAt:
      item.completed_at ?? null,
  }));
}

/* =========================================
   SAVE SECTION PROGRESS
========================================= */

export async function saveLessonProgress(
  lessonId: number,
  currentSection: number,
  completedSections: number,
  totalSections: number
): Promise<boolean> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return false;
  }

  const safeCurrentSection = Math.max(
    0,
    Math.min(currentSection, totalSections)
  );

  const safeCompletedSections = Math.max(
    0,
    Math.min(completedSections, totalSections)
  );

  const isCompleted =
    totalSections > 0 &&
    safeCompletedSections >= totalSections;

  const {
    error,
  } = await supabase
    .from(PROGRESS_TABLE)
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        current_section: safeCurrentSection,
        completed_sections:
          safeCompletedSections,
        total_sections: totalSections,
        completed: isCompleted,
        last_accessed_at:
          new Date().toISOString(),
        completed_at: isCompleted
          ? new Date().toISOString()
          : null,
      },
      {
        onConflict: "user_id,lesson_id",
      }
    );

  if (error) {
    console.error(
      "CURIO: Failed to save lesson progress:",
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
  const userId = await getCurrentUserId();

  if (!userId) {
    return false;
  }

  const now = new Date().toISOString();

  const {
    error,
  } = await supabase
    .from(PROGRESS_TABLE)
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        current_section: totalSections,
        completed_sections: totalSections,
        total_sections: totalSections,
        completed: true,
        last_accessed_at: now,
        completed_at: now,
      },
      {
        onConflict: "user_id,lesson_id",
      }
    );

  if (error) {
    console.error(
      "CURIO: Failed to complete lesson:",
      error
    );

    return false;
  }

  return true;
}

/* =========================================
   CHECK WHETHER LESSON IS COMPLETED
========================================= */

export async function isLessonCompleted(
  lessonId: number
): Promise<boolean> {
  const progress =
    await getLessonProgress(lessonId);

  return progress?.completed === true;
}

/* =========================================
   CHECK WHETHER PREVIOUS LESSON IS COMPLETE
========================================= */

export function canAccessLesson(
  lessonId: number
): Promise<boolean> {
  if (lessonId <= 1) {
    return Promise.resolve(true);
  }

  return isLessonCompleted(lessonId - 1);
}

/* =========================================
   GET COMPLETED LESSON COUNT
========================================= */

export async function getCompletedLessonCount(): Promise<number> {
  const progress =
    await getAllLessonProgress();

  return progress.filter(
    (lesson) => lesson.completed
  ).length;
}

/* =========================================
   GET OVERALL COURSE PROGRESS
========================================= */

export async function getCourseProgress(
  totalLessons = 8
): Promise<number> {
  const completed =
    await getCompletedLessonCount();

  if (totalLessons <= 0) {
    return 0;
  }

  return Math.round(
    (completed / totalLessons) * 100
  );
}