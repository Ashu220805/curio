export type AcademyLessonProgress = {
  concept: boolean;
  practice: boolean;
  teachBack: boolean;
  completed: boolean;
  updatedAt: string;
};

export type AcademyLearningProgress = Record<number, AcademyLessonProgress>;

const DETAIL_KEY = "curio_academy_learning_progress_v1";
const LEGACY_KEY = "curio_academy_progress_v6";

const emptyProgress = (): AcademyLessonProgress => ({
  concept: false,
  practice: false,
  teachBack: false,
  completed: false,
  updatedAt: new Date(0).toISOString(),
});

export function readAcademyLearningProgress(): AcademyLearningProgress {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(DETAIL_KEY) ?? "{}");
    const result: AcademyLearningProgress = {};

    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
        const order = Number(key);
        if (!Number.isInteger(order) || order < 1 || !value || typeof value !== "object") continue;

        const item = value as Partial<AcademyLessonProgress>;
        result[order] = {
          concept: item.concept === true,
          practice: item.practice === true,
          teachBack: item.teachBack === true,
          completed: item.completed === true,
          updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date(0).toISOString(),
        };
      }
    }

    // Preserve and merge progress from the previous Academy format (v6)
    const legacy: unknown = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "[]");
    if (Array.isArray(legacy)) {
      for (const value of legacy) {
        if (typeof value === "number" && Number.isInteger(value) && value > 0 && !result[value]) {
          result[value] = {
            concept: true,
            practice: true,
            teachBack: true,
            completed: true,
            updatedAt: new Date().toISOString(),
          };
        }
      }
    }

    return result;
  } catch {
    return {};
  }
}

export function saveAcademyLearningProgress(progress: AcademyLearningProgress): void {
  try {
    localStorage.setItem(DETAIL_KEY, JSON.stringify(progress));

    const completed = Object.entries(progress)
      .filter(([, value]) => value.completed)
      .map(([order]) => Number(order))
      .filter(Number.isInteger)
      .sort((a, b) => a - b);

    localStorage.setItem(LEGACY_KEY, JSON.stringify(completed));

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("curio:academy-progress-updated", {
          detail: { progress, completedCount: completed.length },
        })
      );
    }
  } catch (error) {
    console.error("CURIO: Unable to save Academy learning progress:", error);
  }
}

export function getLessonProgress(progress: AcademyLearningProgress, order: number): AcademyLessonProgress {
  return progress[order] ?? emptyProgress();
}

export function updateLessonProgress(
  progress: AcademyLearningProgress,
  order: number,
  patch: Partial<AcademyLessonProgress>,
): AcademyLearningProgress {
  const current = getLessonProgress(progress, order);
  const next = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  return {
    ...progress,
    [order]: next,
  };
}

export function canOpenAcademyLesson(progress: AcademyLearningProgress, order: number): boolean {
  if (order <= 1) return true;
  return progress[order - 1]?.completed === true;
}

export function academyCompletedCount(progress: AcademyLearningProgress): number {
  return Object.values(progress).filter((item) => item.completed).length;
}
