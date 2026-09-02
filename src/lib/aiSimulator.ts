// deno-lint-ignore-file
import { supabase } from "./supabase.ts";

import type {
  AISimulatorAnalysis,
  AISimulatorRequest,
  AISimulatorResponse,
  AISimulationResult,
  AISimulationSession,
} from "../types/aiSimulator.ts";

/* =========================================
   AI SIMULATOR SERVICE
========================================= */

const FUNCTION_NAME = "ai-simulation";

const AI_SIMULATION_SESSION_KEY =
  "curio_ai_simulation_session";

/* =========================================
   ERROR TYPE
========================================= */

type SupabaseFunctionError = {
  message?: string;
};

/* =========================================
   RUN AI SIMULATION
========================================= */

export async function runAISimulation(
  request: AISimulatorRequest,
): Promise<AISimulatorResponse> {
  const prompt = request.prompt.trim();

  if (!prompt) {
    throw new Error(
      "Please write a prompt before running the simulation.",
    );
  }

  if (prompt.length > 4000) {
    throw new Error(
      "Your prompt is too long. Please keep it under 4000 characters.",
    );
  }

  /*
    Make sure the learner is authenticated.
  */

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error(
      "CURIO AI Simulator authentication error:",
      authError,
    );

    throw new Error(
      "Unable to verify your CURIO account. Please sign in again.",
    );
  }

  if (!user) {
    throw new Error(
      "You must be signed in to use AI Simulation.",
    );
  }

  /*
    Call Supabase Edge Function.

    The OpenAI API key NEVER reaches the browser.
  */

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    FUNCTION_NAME,
    {
      body: {
        prompt,
        category:
          request.category ??
          "Prompting Practice",
      },
    },
  );

  if (error) {
    console.error(
      "CURIO AI Simulator function error:",
      error,
    );

    throw new Error(
      getFunctionErrorMessage(error),
    );
  }

  if (!data) {
    throw new Error(
      "The AI simulator returned no response.",
    );
  }

  /*
    Backend may return:
    { error: "..." }
  */

  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data
  ) {
    const backendError = (
      data as {
        error?: unknown;
      }
    ).error;

    const message =
      typeof backendError === "string"
        ? backendError
        : "The AI simulator could not process your prompt.";

    throw new Error(message);
  }

  /*
    Backend may return:
    { result: {...} }

    or directly:
    {...}
  */

  const result =
    typeof data === "object" &&
    data !== null &&
    "result" in data
      ? (
          data as {
            result?: unknown;
          }
        ).result
      : data;

  if (
    typeof result !== "object" ||
    result === null
  ) {
    throw new Error(
      "The AI simulator returned an invalid response.",
    );
  }

  const object = result as unknown as Record<string, unknown>;
  /*
    Response
  */

  const response =
    typeof object.response === "string"
      ? object.response
      : typeof object.answer === "string"
        ? object.answer
        : typeof object.aiResponse === "string"
          ? object.aiResponse
          : "";

  /*
    Analysis
  */

  const rawAnalysis =
    typeof object.analysis === "object" &&
    object.analysis !== null
      ? object.analysis
      : object;

  const analysis =
    normalizeAnalysis(rawAnalysis);

  /*
    Make sure backend returned something useful.
  */

  if (
    !response &&
    !analysis.improvedPrompt &&
    analysis.strengths.length === 0 &&
    analysis.improvements.length === 0
  ) {
    throw new Error(
      "The AI simulator returned an incomplete response.",
    );
  }

  return {
    response,
    analysis,
  };
}

/* =========================================
   NORMALIZE ANALYSIS
========================================= */

function normalizeAnalysis(
  value: unknown,
): AISimulatorAnalysis {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return getDefaultAnalysis();
  }

  const object =
    value as Record<string, unknown>;

  return {
    score: normalizeScore(
      object.score ??
        object.accuracy,
    ),

    clarity: normalizeScore(
      object.clarity,
    ),

    context: normalizeScore(
      object.context,
    ),

    specificity: normalizeScore(
      object.specificity,
    ),

    goal: normalizeScore(
      object.goal,
    ),

    outputFormat: normalizeScore(
      object.outputFormat ??
        object.output_format,
    ),

    strengths:
      normalizeStringArray(
        object.strengths,
        5,
      ),

    improvements:
      normalizeStringArray(
        object.improvements ??
          object.suggestions,
        5,
      ),

    tip:
      typeof object.tip === "string"
        ? object.tip
        : typeof object.feedback === "string"
          ? object.feedback
          : "Try making your goal, context and expected output clearer.",

    improvedPrompt:
      typeof object.improvedPrompt ===
      "string"
        ? object.improvedPrompt
        : typeof object.improved_prompt ===
            "string"
          ? object.improved_prompt
          : typeof object.betterPrompt ===
              "string"
            ? object.betterPrompt
            : "",
  };
}

/* =========================================
   DEFAULT ANALYSIS
========================================= */

function getDefaultAnalysis(): AISimulatorAnalysis {
  return {
    score: 0,
    clarity: 0,
    context: 0,
    specificity: 0,
    goal: 0,
    outputFormat: 0,
    strengths: [],
    improvements: [],
    tip: "Try making your goal, context and expected output clearer.",
    improvedPrompt: "",
  };
}

/* =========================================
   SCORE
========================================= */

function normalizeScore(
  value: unknown,
): number {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(score),
    ),
  );
}

/* =========================================
   STRING ARRAY
========================================= */

function normalizeStringArray(
  value: unknown,
  maximum: number,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string" &&
        item.trim().length > 0,
    )
    .map((item) => item.trim())
    .slice(0, maximum);
}

/* =========================================
   FUNCTION ERROR
========================================= */

function getFunctionErrorMessage(
  error: SupabaseFunctionError,
): string {
  const message =
    typeof error.message === "string"
      ? error.message
      : "";

  const lowerMessage =
    message.toLowerCase();

  if (
    lowerMessage.includes("401") ||
    lowerMessage.includes("unauthorized")
  ) {
    return "Your CURIO session has expired. Please sign in again.";
  }

  if (
    lowerMessage.includes("429") ||
    lowerMessage.includes("too many")
  ) {
    return "The AI simulator is temporarily busy. Please try again shortly.";
  }

  if (message) {
    return message;
  }

  return "Unable to connect to the AI simulator. Please try again.";
}

/* =========================================
   CURRENT USER
========================================= */

async function getAISimulationUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(
      "CURIO AI Simulator user error:",
      error,
    );

    return null;
  }

  return user;
}

/* =========================================
   GET SIMULATION SESSION
========================================= */

export async function getSimulationSession(): Promise<AISimulationSession | null> {
  const user =
    await getAISimulationUser();

  if (!user) {
    return null;
  }

  try {
    const stored =
      localStorage.getItem(
        AI_SIMULATION_SESSION_KEY,
      );

    if (!stored) {
      return null;
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (
      typeof parsed !== "object" ||
      parsed === null
    ) {
      return null;
    }

    const session =
      parsed as Partial<AISimulationSession>;

    if (
      session.userId !== user.id
    ) {
      return null;
    }

    if (
      typeof session.id !== "string"
    ) {
      return null;
    }

    if (
      !Array.isArray(session.results)
    ) {
      return null;
    }

    return {
      id: session.id,
      userId: user.id,

      currentQuestion:
        Number(
          session.currentQuestion ?? 0,
        ),

      totalQuestions:
        Number(
          session.totalQuestions ?? 8,
        ),

      completedQuestions:
        Number(
          session.completedQuestions ?? 0,
        ),

      score:
        Number(
          session.score ?? 0,
        ),

      completed:
        Boolean(
          session.completed,
        ),

      results:
        session.results as AISimulationResult[],

      createdAt:
        typeof session.createdAt ===
        "string"
          ? session.createdAt
          : new Date().toISOString(),

      updatedAt:
        typeof session.updatedAt ===
        "string"
          ? session.updatedAt
          : new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      "CURIO: Failed to read AI Simulation session:",
      error,
    );

    return null;
  }
}

/* =========================================
   SAVE SIMULATION PROGRESS
========================================= */

export async function saveSimulationProgress(
  session: AISimulationSession,
): Promise<boolean> {
  const user =
    await getAISimulationUser();

  if (!user) {
    return false;
  }

  try {
    const updatedSession: AISimulationSession = {
      ...session,
      userId: user.id,
      updatedAt:
        new Date().toISOString(),
    };

    localStorage.setItem(
      AI_SIMULATION_SESSION_KEY,
      JSON.stringify(updatedSession),
    );

    return true;
  } catch (error) {
    console.error(
      "CURIO: Failed to save AI Simulation progress:",
      error,
    );

    return false;
  }
}

/* =========================================
   SUBMIT SIMULATION PROMPT
========================================= */

export async function submitSimulationPrompt(
  session: AISimulationSession,
  prompt: string,
): Promise<AISimulationResult> {
  const cleanPrompt =
    prompt.trim();

  if (!cleanPrompt) {
    throw new Error(
      "Please write a prompt before submitting.",
    );
  }

  const response =
    await runAISimulation({
      prompt: cleanPrompt,
      category: "Prompting Practice",
    });

  const result: AISimulationResult = {
    prompt: cleanPrompt,

    response:
      response.response ?? "",

    analysis:
      response.analysis,

    createdAt:
      new Date().toISOString(),
  };

  const nextCompleted =
    Math.max(
      0,
      session.completedQuestions + 1,
    );

  const nextScore =
    session.score +
    Number(
      response.analysis.score ?? 0,
    );

  const updatedSession: AISimulationSession = {
    ...session,

    currentQuestion:
      Math.min(
        session.totalQuestions,
        session.currentQuestion + 1,
      ),

    completedQuestions:
      nextCompleted,

    score: nextScore,

    completed:
      nextCompleted >=
      session.totalQuestions,

    results: [
      ...session.results,
      result,
    ],

    updatedAt:
      new Date().toISOString(),
  };

  const saved =
    await saveSimulationProgress(
      updatedSession,
    );

  if (!saved) {
    console.warn(
      "CURIO: AI result was generated but session progress could not be saved.",
    );
  }

  return result;
}

/* =========================================
   COMPLETE SIMULATION SESSION
========================================= */

export async function completeSimulationSession(
  session: AISimulationSession,
): Promise<boolean> {
  const updatedSession: AISimulationSession = {
    ...session,

    completed: true,

    updatedAt:
      new Date().toISOString(),
  };

  return saveSimulationProgress(
    updatedSession,
  );
}