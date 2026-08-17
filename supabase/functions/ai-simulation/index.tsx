const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

type RequestBody = {
  prompt?: string;
  category?: string;
};

type GeminiResponse = {
  output_text?: string;
  steps?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  [key: string]: unknown;
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

Deno.serve(async (req: Request) => {
  // =========================================
  // CORS
  // =========================================

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  // =========================================
  // ONLY POST
  // =========================================

  if (req.method !== "POST") {
    return jsonResponse(
      {
        success: false,
        error: "Only POST requests are allowed.",
      },
      405,
    );
  }

  try {
    // =========================================
    // GEMINI API KEY
    // =========================================

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY is missing.");

      return jsonResponse(
        {
          success: false,
          error:
            "GEMINI_API_KEY is not configured in Supabase Edge Function secrets.",
        },
        500,
      );
    }

    // =========================================
    // READ REQUEST BODY
    // =========================================

    let body: RequestBody;

    try {
      body = await req.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        400,
      );
    }

    const prompt = body.prompt?.trim();

    const category =
      body.category?.trim() || "General";

    // =========================================
    // VALIDATE PROMPT
    // =========================================

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

    // =========================================
    // CURIO AI PROMPT COACH INSTRUCTIONS
    // =========================================

    const instructions = `
You are CURIO's AI Prompt Coach.

Your job is NOT simply to answer the user's prompt.

Your job is to:

1. Understand what the learner is trying to accomplish.
2. Respond naturally to the learner's prompt.
3. Evaluate the quality of the prompt.
4. Teach the learner how to improve it.
5. Keep the explanation beginner-friendly.
6. Never shame the learner for writing a weak prompt.

Analyze these prompting dimensions:

- Goal
- Context
- Specificity
- Constraints
- Output format
- Audience
- Role/persona
- Examples
- Clarity

The learner's category is:

${category}

The learner's prompt is:

${prompt}

Return a JSON object matching the provided schema.

Important rules:

- score must be an integer from 0 to 100.
- Be fair to beginners.
- Do not give a high score merely because the prompt is long.
- A short but clear prompt can score well.
- The improved prompt must preserve the learner's original goal.
- Do not invent personal information about the learner.
- Keep the response useful and concise.
- The response field should answer the learner's original prompt naturally.
- The summary should briefly explain the quality of the prompt.
- strengths should contain useful things the learner did correctly.
- improvements should tell the learner exactly what they can improve.
- missingElements should identify useful information that was not included.
- betterPrompt should be a significantly improved version of the original prompt.
- skillTips should contain short, practical prompting lessons.
`;

    // =========================================
    // GEMINI MODEL
    // =========================================
    //
    // Current stable Gemini model:
    //
    // gemini-3.6-flash
    //
    // =========================================

    const model = "gemini-3.6-flash";

    console.log(
      `CURIO AI Simulation starting with model: ${model}`,
    );

    // =========================================
    // STRUCTURED JSON SCHEMA
    // =========================================

    const responseSchema = {
      type: "object",

      properties: {
        response: {
          type: "string",
          description:
            "The natural AI response to the learner's original prompt.",
        },

        score: {
          type: "integer",
          description:
            "Prompt quality score from 0 to 100.",
        },

        summary: {
          type: "string",
          description:
            "Short explanation of the prompt quality.",
        },

        strengths: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "Things the learner did well.",
        },

        improvements: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "Specific ways the learner can improve the prompt.",
        },

        missingElements: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "Useful information missing from the prompt.",
        },

        betterPrompt: {
          type: "string",
          description:
            "A significantly improved version of the learner's prompt.",
        },

        skillTips: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "Short practical prompting tips.",
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

    // =========================================
    // GEMINI INTERACTIONS API REQUEST
    // =========================================

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },

        body: JSON.stringify({
          model,

          system_instruction:
            instructions,

          input: prompt,

          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: responseSchema,
          },
        }),
      },
    );

    // =========================================
    // READ GEMINI RESPONSE
    // =========================================

    const rawText = await geminiResponse.text();

    if (!geminiResponse.ok) {
      console.error(
        "Gemini request failed:",
        geminiResponse.status,
        rawText,
      );

      return jsonResponse(
        {
          success: false,
          error: "Gemini request failed.",
          status: geminiResponse.status,
          details: rawText,
        },
        502,
      );
    }

    // =========================================
    // PARSE GEMINI RESPONSE
    // =========================================

    let geminiData: GeminiResponse;

    try {
      geminiData =
        JSON.parse(rawText) as GeminiResponse;
    } catch {
      console.error(
        "Gemini returned invalid JSON:",
        rawText,
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Gemini returned an invalid server response.",
        },
        502,
      );
    }

    // =========================================
    // EXTRACT OUTPUT TEXT
    // =========================================

    let outputText = "";

    // Preferred Interactions API response
    if (
      typeof geminiData.output_text ===
      "string"
    ) {
      outputText =
        geminiData.output_text;
    }

    // Fallback in case output_text is not present
    if (
      !outputText &&
      Array.isArray(geminiData.steps)
    ) {
      for (
        const step of geminiData.steps
      ) {
        if (
          Array.isArray(step.content)
        ) {
          for (
            const content of step.content
          ) {
            if (
              content.type === "text" &&
              typeof content.text ===
                "string"
            ) {
              outputText =
                content.text;
            }
          }
        }
      }
    }

    if (!outputText) {
      console.error(
        "Gemini response did not contain output text:",
        JSON.stringify(geminiData),
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

    // =========================================
    // PARSE CURIO JSON
    // =========================================

    let analysis: Record<
      string,
      unknown
    >;

    try {
      analysis =
        JSON.parse(outputText) as Record<
          string,
          unknown
        >;
    } catch {
      console.error(
        "Could not parse Gemini JSON:",
        outputText,
      );

      return jsonResponse(
        {
          success: true,

          response: outputText,

          score: 0,

          summary:
            "Gemini responded, but CURIO could not parse its analysis.",

          strengths: [],

          improvements: [],

          missingElements: [],

          betterPrompt: "",

          skillTips: [],
        },
        200,
      );
    }

    // =========================================
    // NORMALIZE SCORE
    // =========================================

    let score = Number(
      analysis.score,
    );

    if (!Number.isFinite(score)) {
      score = 0;
    }

    score = Math.round(score);

    score = Math.max(
      0,
      Math.min(100, score),
    );

    // =========================================
    // NORMALIZE ARRAYS
    // =========================================

    const strengths =
      Array.isArray(
        analysis.strengths,
      )
        ? analysis.strengths.map(String)
        : [];

    const improvements =
      Array.isArray(
        analysis.improvements,
      )
        ? analysis.improvements.map(String)
        : [];

    const missingElements =
      Array.isArray(
        analysis.missingElements,
      )
        ? analysis.missingElements.map(
            String,
          )
        : [];

    const skillTips =
      Array.isArray(
        analysis.skillTips,
      )
        ? analysis.skillTips.map(String)
        : [];

    // =========================================
    // RETURN CURIO RESPONSE
    // =========================================

    return jsonResponse(
      {
        success: true,

        response: String(
          analysis.response || "",
        ),

        score,

        summary: String(
          analysis.summary || "",
        ),

        strengths,

        improvements,

        missingElements,

        betterPrompt: String(
          analysis.betterPrompt || "",
        ),

        skillTips,
      },
      200,
    );
  } catch (error) {
    console.error(
      "CURIO AI Simulation error:",
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