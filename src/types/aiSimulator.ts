export interface AISimulatorRequest {
  prompt: string;
  category?: string;
}

export interface AISimulatorAnalysis {
  score: number;
  clarity: number;
  context: number;
  specificity: number;
  goal: number;
  outputFormat: number;

  strengths: string[];
  improvements: string[];

  tip: string;
  improvedPrompt: string;
}

export interface AISimulatorResponse {
  response: string;
  analysis: AISimulatorAnalysis;
}

/* =========================================
   AI SIMULATION RESULT
========================================= */

export interface AISimulationResult {
  prompt: string;
  response: string;
  analysis: AISimulatorAnalysis;
  createdAt: string;
}

/* =========================================
   AI SIMULATION SESSION
========================================= */

export interface AISimulationSession {
  id: string;
  userId: string;

  currentQuestion: number;
  totalQuestions: number;
  completedQuestions: number;

  score: number;
  completed: boolean;

  results: AISimulationResult[];

  createdAt: string;
  updatedAt: string;
}