// deno-lint-ignore-file

import { supabase } from "./supabase";

/* =========================================
   PRACTICE PROGRESS TYPE
========================================= */

export interface PracticeProgress {
  userId: string;
  sessionId: number;

  currentQuestion: number;
  answeredQuestions: number;
  totalQuestions: number;

  score: number;
  completed: boolean;

  answers: (number | null)[];

  updatedAt?: string | null;
  completedAt?: string | null;
}

/* =========================================
   CURRENT USER
========================================= */

async function getCurrentUserId(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log(
      "CURIO PRACTICE SESSION:",
      session
        ? {
            userId: session.user.id,
            email: session.user.email,
          }
        : null
    );

    if (!session?.user) {
      console.error(
        "CURIO PRACTICE: No active session."
      );

      return null;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error(
        "CURIO PRACTICE AUTH ERROR:",
        error.message
      );

      return null;
    }

    console.log(
      "CURIO PRACTICE USER:",
      user?.id
    );

    return user?.id ?? null;
  } catch (error) {
    console.error(
      "CURIO PRACTICE AUTH EXCEPTION:",
      error
    );

    return null;
  }
}

/* =========================================
   NORMALIZE ANSWERS
========================================= */

function normalizeAnswers(
  value: unknown
): (number | null)[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    if (
      typeof item === "number" &&
      Number.isFinite(item) &&
      item >= 0
    ) {
      return item;
    }

    return null;
  });
}

/* =========================================
   DATABASE ROW → APP OBJECT
========================================= */

function mapProgress(
  row: unknown
): PracticeProgress {
  /*
    Supabase can sometimes infer a generated
    error/string type.

    Therefore we deliberately treat the row
    as unknown first instead of forcing it to
    Record<string, unknown>.
  */

  if (
    !row ||
    typeof row !== "object"
  ) {
    return {
      userId: "",
      sessionId: 0,

      currentQuestion: 0,
      answeredQuestions: 0,
      totalQuestions: 0,

      score: 0,
      completed: false,

      answers: [],

      updatedAt: null,
      completedAt: null,
    };
  }

  const record =
    row as Record<string, unknown>;

  return {
    userId:
      typeof record.user_id === "string"
        ? record.user_id
        : "",

    sessionId:
      typeof record.session_id === "number"
        ? record.session_id
        : Number(record.session_id ?? 0),

    currentQuestion:
      typeof record.current_question === "number"
        ? record.current_question
        : Number(
            record.current_question ?? 0
          ),

    answeredQuestions:
      typeof record.answered_questions === "number"
        ? record.answered_questions
        : Number(
            record.answered_questions ?? 0
          ),

    totalQuestions:
      typeof record.total_questions === "number"
        ? record.total_questions
        : Number(
            record.total_questions ?? 0
          ),

    score:
      typeof record.score === "number"
        ? record.score
        : Number(record.score ?? 0),

    completed:
      record.completed === true,

    answers:
      normalizeAnswers(record.answers),

    updatedAt:
      typeof record.updated_at === "string"
        ? record.updated_at
        : null,

    completedAt:
      typeof record.completed_at === "string"
        ? record.completed_at
        : null,
  };
}

/* =========================================
   GET SINGLE PRACTICE PROGRESS
========================================= */

export async function getPracticeProgress(
  sessionId: number
): Promise<PracticeProgress | null> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("practice_progress")
    .select(
      [
        "user_id",
        "practice_id",
        "session_id",
        "current_question",
        "answered_questions",
        "total_questions",
        "score",
        "completed",
        "answers",
        "updated_at",
        "completed_at",
      ].join(",")
    )
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.error(
      "CURIO: Failed to load Practice progress:",
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
   GET ALL PRACTICE PROGRESS
========================================= */

export async function getAllPracticeProgress(): Promise<
  PracticeProgress[]
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
    .from("practice_progress")
    .select(
      [
        "user_id",
        "practice_id",
        "session_id",
        "current_question",
        "answered_questions",
        "total_questions",
        "score",
        "completed",
        "answers",
        "updated_at",
        "completed_at",
      ].join(",")
    )
    .eq("user_id", userId)
    .order("session_id", {
      ascending: true,
    });

  if (error) {
    console.error(
      "CURIO: Failed to load all Practice progress:",
      error.message
    );

    return [];
  }

  return (data ?? []).map((row) =>
    mapProgress(row)
  );
}

/* =========================================
   SAVE PRACTICE PROGRESS
========================================= */

export async function savePracticeProgress(
  sessionId: number,
  currentQuestion: number,
  answers: (number | null)[],
  totalQuestions: number
): Promise<boolean> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    console.error(
      "CURIO: No authenticated user."
    );

    return false;
  }

  const total =
    Math.max(0, totalQuestions);

  /*
    Keep the answers array exactly the same
    length as the number of questions.
  */

  const safeAnswers =
    Array.from(
      { length: total },
      (_, index) => {
        const value =
          answers[index];

        if (
          typeof value === "number" &&
          Number.isFinite(value) &&
          value >= 0
        ) {
          return value;
        }

        return null;
      }
    );

  const answered =
    safeAnswers.filter(
      (value) => value !== null
    ).length;

  const safeCurrent =
    total > 0
      ? Math.max(
          0,
          Math.min(
            currentQuestion,
            total - 1
          )
        )
      : 0;

  /*
    IMPORTANT:
    The database requires practice_id.

    We use sessionId as practice_id because
    the current Practice system identifies
    each practice session by this numeric ID.
  */

  const practiceId =
    sessionId;

  const completed =
    total > 0 &&
    answered >= total;

  const now =
    new Date().toISOString();

  const {
    error,
  } = await supabase
    .from("practice_progress")
    .upsert(
      {
        user_id: userId,

        practice_id: practiceId,

        session_id: sessionId,

        current_question:
          safeCurrent,

        answered_questions:
          answered,

        total_questions:
          total,

        score: 0,

        completed,

        answers:
          safeAnswers,

        last_accessed_at:
          now,

        updated_at:
          now,

        completed_at:
          completed
            ? now
            : null,
      },
      {
        onConflict:
          "user_id,session_id",
      }
    );

  if (error) {
    console.error(
      "CURIO: Failed to save Practice progress:",
      error.message
    );

    return false;
  }

  return true;
}

/* =========================================
   COMPLETE PRACTICE SESSION
========================================= */

export async function completePracticeSession(
  sessionId: number,
  answers: (number | null)[],
  score: number,
  totalQuestions: number
): Promise<boolean> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    console.error(
      "CURIO: No authenticated user."
    );

    return false;
  }

  const total =
    Math.max(0, totalQuestions);

  const safeAnswers =
    Array.from(
      { length: total },
      (_, index) => {
        const value =
          answers[index];

        if (
          typeof value === "number" &&
          Number.isFinite(value) &&
          value >= 0
        ) {
          return value;
        }

        return null;
      }
    );

  const now =
    new Date().toISOString();

  const safeScore =
    Math.max(
      0,
      Math.min(score, total)
    );

  const {
    error,
  } = await supabase
    .from("practice_progress")
    .upsert(
      {
        user_id: userId,

        practice_id:
          sessionId,

        session_id:
          sessionId,

        current_question:
          total > 0
            ? total - 1
            : 0,

        answered_questions:
          total,

        total_questions:
          total,

        score:
          safeScore,

        completed:
          true,

        answers:
          safeAnswers,

        last_accessed_at:
          now,

        updated_at:
          now,

        completed_at:
          now,
      },
      {
        onConflict:
          "user_id,session_id",
      }
    );

  if (error) {
    console.error(
      "CURIO: Failed to complete Practice session:",
      error.message
    );

    return false;
  }

  return true;
}

/* =========================================
   RESET PRACTICE PROGRESS
========================================= */

export async function resetPracticeProgress(
  sessionId: number
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
    .from("practice_progress")
    .delete()
    .eq("user_id", userId)
    .eq("session_id", sessionId);

  if (error) {
    console.error(
      "CURIO: Failed to reset Practice progress:",
      error.message
    );

    return false;
  }

  return true;
}