const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
  "Content-Type": "application/json",
};

type RequestBody = {
  prompt?: string;
  category?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: unknown;
};

type CurioAnalysis = {
  response: string;
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  missingElements: string[];
  betterPrompt: string;
  skillTips: string[];
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: corsHeaders,
    },
  );
}

Deno.serve(async (req: Request) => {
  // =========================================================
  // CORS
  // =========================================================

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  // =========================================================
  // ONLY POST
  // =========================================================

  if (req.method !== "POST") {
    return jsonResponse(
      {
        success: false,
        error:
          "Only POST requests are allowed.",
      },
      405,
    );
  }

  try {
    // =========================================================
    // GEMINI ENVIRONMENT VARIABLES
    // =========================================================

    const geminiKey =
      Deno.env.get("GEMINI_API_KEY");

    const geminiModel =
      Deno.env.get("GEMINI_MODEL") ||
      "gemini-3.5-flash-lite";

    // =========================================================
    // CHECK GEMINI KEY
    // =========================================================

    if (!geminiKey) {
      console.error(
        "GEMINI_API_KEY is missing.",
      );

      return jsonResponse(
        {
          success: false,
          error:
            "GEMINI_API_KEY is not configured in Supabase Edge Function secrets.",
        },
        500,
      );
    }

    console.log(
      `CURIO AI Simulation starting with Gemini model: ${geminiModel}`,
    );

    // =========================================================
    // READ REQUEST BODY
    // =========================================================

    let body: RequestBody;

    try {
      body = await req.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          error:
            "Invalid JSON request body.",
        },
        400,
      );
    }

    // =========================================================
    // CLEAN INPUT
    // =========================================================

    const prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";

    const category =
      typeof body.category === "string" &&
      body.category.trim()
        ? body.category.trim()
        : "General";

    // =========================================================
    // VALIDATE PROMPT
    // =========================================================

    if (!prompt) {
      return jsonResponse(
        {
          success: false,
          error:
            "Please enter a prompt before running the simulation.",
        },
        400,
      );
    }

    if (prompt.length > 4000) {
      return jsonResponse(
        {
          success: false,
          error:
            "Prompt is too long. Please keep it under 4000 characters.",
        },
        400,
      );
    }

    // =========================================================
    // CURIO PROMPT COACH INSTRUCTIONS
    // =========================================================

    const instructions = `
You are CURIO's AI Prompt Coach.

CURIO is an AI literacy platform that teaches beginners
how to communicate effectively with artificial intelligence.

Your task has TWO purposes.

FIRST:
Actually answer the learner's original prompt naturally.

SECOND:
Analyze how well the learner wrote the prompt and teach
them how to improve it.

You are a supportive teacher.

Never shame the learner.
Never make the learner feel that their prompt is stupid.
Assume the learner may be a complete beginner.

Analyze the prompt using these dimensions:

1. Goal
2. Context
3. Specificity
4. Constraints
5. Output format
6. Audience
7. Role or persona
8. Examples
9. Clarity

CATEGORY:
${category}

IMPORTANT SCORING RULES:

- Score must be between 0 and 100.
- Score prompting quality, not the quality of the topic.
- Do not give a high score just because the prompt is long.
- A short and clear prompt can receive a high score.
- A beginner prompt should be judged fairly.
- Do not penalize a prompt for missing elements that are unnecessary
  for the learner's actual goal.
- Preserve the learner's original intention.
- The improved prompt should be realistic and usable.
- Do not invent personal information about the learner.

FOR "response":

Actually answer the learner's original prompt.

FOR "summary":

Give a short beginner-friendly explanation of the prompt quality.

FOR "strengths":

Identify the strongest parts of the learner's prompt.

FOR "improvements":

Give practical changes that would make the prompt better.

FOR "missingElements":

Only mention genuinely useful missing information.

FOR "betterPrompt":

Rewrite the learner's prompt into a stronger version while
preserving the original goal.

FOR "skillTips":

Give short prompting lessons the learner can remember and use
next time.

Keep everything concise and useful.
`;

    // =========================================================
    // GEMINI STRUCTURED OUTPUT SCHEMA
    // =========================================================

    const responseSchema = {
      type: "OBJECT",

      properties: {
        response: {
          type: "STRING",
        },

        score: {
          type: "INTEGER",
        },

        summary: {
          type: "STRING",
        },

        strengths: {
          type: "ARRAY",
          items: {
            type: "STRING",
          },
        },

        improvements: {
          type: "ARRAY",
          items: {
            type: "STRING",
          },
        },

        missingElements: {
          type: "ARRAY",
          items: {
            type: "STRING",
          },
        },

        betterPrompt: {
          type: "STRING",
        },

        skillTips: {
          type: "ARRAY",
          items: {
            type: "STRING",
          },
        },
      },

      required: [
        "response",
        "score",
        "summary",
        "strengths",
        "improvements",
        "missingElements",
        "betterPrompt",
        "skillTips",
      ],
    };

    // =========================================================
    // GEMINI API URL
    // =========================================================

    const geminiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        geminiModel,
      )}:generateContent?key=${encodeURIComponent(
        geminiKey,
      )}`;

    // =========================================================
    // GEMINI REQUEST
    // =========================================================

    const geminiResponse =
      await fetch(geminiUrl, {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: instructions,
              },
            ],
          },

          contents: [
            {
              role: "user",

              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],

          generationConfig: {
            temperature: 0.4,

            responseMimeType:
              "application/json",

            responseSchema,
          },
        }),
      });

    // =========================================================
    // READ GEMINI RESPONSE
    // =========================================================

    const rawText =
      await geminiResponse.text();

    // =========================================================
    // GEMINI ERROR
    // =========================================================

    if (!geminiResponse.ok) {
      console.error(
        "Gemini request failed:",
        geminiResponse.status,
        rawText,
      );

      let details: unknown =
        rawText;

      try {
        details = JSON.parse(
          rawText,
        );
      } catch {
        // Keep raw response.
      }

      return jsonResponse(
        {
          success: false,
          error:
            "Gemini request failed.",
          status:
            geminiResponse.status,
          details,
        },
        502,
      );
    }

    // =========================================================
    // PARSE GEMINI RESPONSE
    // =========================================================

    let geminiData: GeminiResponse;

    try {
      geminiData =
        JSON.parse(
          rawText,
        ) as GeminiResponse;
    } catch {
      console.error(
        "Gemini returned invalid JSON:",
        rawText,
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Gemini returned an invalid response.",
        },
        502,
      );
    }

    // =========================================================
    // EXTRACT GENERATED TEXT
    // =========================================================

    const outputText =
      geminiData
        .candidates?.[0]
        ?.content
        ?.parts?.[0]
        ?.text
        ?.trim() || "";

    if (!outputText) {
      console.error(
        "Gemini response did not contain generated text:",
        JSON.stringify(
          geminiData,
        ),
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Gemini did not return any text.",
        },
        502,
      );
    }

    // =========================================================
    // PARSE STRUCTURED JSON
    // =========================================================

    let analysis: CurioAnalysis;

    try {
      analysis =
        JSON.parse(
          outputText,
        ) as CurioAnalysis;
    } catch {
      console.error(
        "Could not parse Gemini JSON:",
        outputText,
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Gemini returned an unexpected analysis format.",
        },
        502,
      );
    }

    // =========================================================
    // NORMALIZE SCORE
    // =========================================================

    const rawScore =
      Number(analysis.score);

    const score =
      Number.isFinite(rawScore)
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(
                rawScore,
              ),
            ),
          )
        : 0;

    // =========================================================
    // NORMALIZE ARRAYS
    // =========================================================

    const strengths =
      Array.isArray(
        analysis.strengths,
      )
        ? analysis.strengths.filter(
            (item) =>
              typeof item ===
              "string",
          )
        : [];

    const improvements =
      Array.isArray(
        analysis.improvements,
      )
        ? analysis.improvements.filter(
            (item) =>
              typeof item ===
              "string",
          )
        : [];

    const missingElements =
      Array.isArray(
        analysis.missingElements,
      )
        ? analysis.missingElements.filter(
            (item) =>
              typeof item ===
              "string",
          )
        : [];

    const skillTips =
      Array.isArray(
        analysis.skillTips,
      )
        ? analysis.skillTips.filter(
            (item) =>
              typeof item ===
              "string",
          )
        : [];

    // =========================================================
    // RETURN CURIO FORMAT
    //
    // IMPORTANT:
    // These names are intentionally mapped to the
    // existing AISimulation.tsx structure.
    // =========================================================

    return jsonResponse({
      success: true,

      response:
        typeof analysis.response ===
        "string"
          ? analysis.response
          : "",

      score,

      accuracy: score,

      feedback:
        typeof analysis.summary ===
        "string"
          ? analysis.summary
          : "",

      strengths,

      missing:
        missingElements,

      suggestions:
        improvements,

      improvedPrompt:
        typeof analysis.betterPrompt ===
        "string"
          ? analysis.betterPrompt
          : "",

      skillTips,

      summary:
        typeof analysis.summary ===
        "string"
          ? analysis.summary
          : "",
    });
  } catch (error) {
    // =========================================================
    // UNEXPECTED ERROR
    // =========================================================

    console.error(
      "CURIO Gemini AI Simulation error:",
      error,
    );

    return jsonResponse(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      500,
    );
  }
});
