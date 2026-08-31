import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.ts";
import { runAISimulation } from "../../lib/aiSimulator.ts";
import "./AiSimulation.css";

type PromptDimensionKey =
  | "clarity"
  | "context"
  | "specificity"
  | "goal"
  | "outputFormat";

type PromptDimension = {
  key: PromptDimensionKey;
  label: string;
  score: number;
  status: "Strong" | "Good" | "Needs work" | "Weak";
  reason: string;
  action: string;
  evidence: string[];
};

type AnalysisResult = {
  score?: number;
  accuracy?: number;
  feedback?: string;
  strengths?: string[];
  missing?: string[];
  suggestions?: string[];
  improvedPrompt?: string;
  response?: string;
  answer?: string;
  skillTips?: string[];

  /* Optional AI dimensions + locally derived dimensions. */
  clarity?: number;
  context?: number;
  specificity?: number;
  goal?: number;
  outputFormat?: number;
  dimensions?: PromptDimension[];
  analysisQuality?: "AI + structural" | "Structural";
  promptType?: string;
  priorityFix?: string;
  confidence?: number;
};


/*
  ============================================================
  CURIO PROMPT ANALYSIS ENGINE
  ============================================================

  The previous implementation treated missing AI dimension
  fields as 0/100. That is the direct reason the dimension cards
  could show five zeros even when the overall prompt score was
  valid.

  This engine is evidence-based and deterministic:
  - it never invents facts about the user's request;
  - it does not reward length by itself;
  - it looks for concrete signals in the actual prompt;
  - it uses a backend/AI dimension score when one is supplied;
  - otherwise it calculates a structural score.

  The result is used for coaching, not as a claim of objective
  "perfect" prompt quality.
*/

const clamp = (value: number) =>
  Math.max(0, Math.min(100, Math.round(value)));

const numericScore = (value: unknown): number | null => {
  const number = Number(value);
  return Number.isFinite(number) &&
    number >= 0 &&
    number <= 100
    ? number
    : null;
};

const uniqueStrings = (items: string[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const normalized = item.trim().toLowerCase();

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

const wordCount = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

const hasSignal = (
  text: string,
  expression: RegExp,
) => expression.test(text);

const dimensionStatus = (
  score: number,
): PromptDimension["status"] => {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs work";
  return "Weak";
};

const dimensionInfo: Record<
  PromptDimensionKey,
  {
    label: string;
    strongReason: string;
    action: string;
  }
> = {
  clarity: {
    label: "Clarity",
    strongReason:
      "The instruction is easy to interpret and gives the AI a recognizable action to perform.",
    action:
      "Make the instruction direct and unambiguous; avoid wording that allows multiple interpretations.",
  },
  context: {
    label: "Context",
    strongReason:
      "The prompt supplies useful background, audience, situation, purpose, or constraints.",
    action:
      "Add only the background the AI needs: audience, situation, purpose, existing state, or relevant constraints.",
  },
  specificity: {
    label: "Specificity",
    strongReason:
      "The prompt narrows the task with concrete scope, requirements, limits, examples, or measurable criteria.",
    action:
      "Replace broad wording with exact scope, requirements, examples, limits, or measurable criteria.",
  },
  goal: {
    label: "Goal",
    strongReason:
      "The prompt clearly communicates what the AI should accomplish and why the result is useful.",
    action:
      "State the desired outcome explicitly and define what a useful result should help you accomplish.",
  },
  outputFormat: {
    label: "Output format",
    strongReason:
      "The prompt gives useful instructions about how the answer should be presented.",
    action:
      "Specify the useful presentation: bullets, table, steps, sections, code, length, comparison, or another concrete format.",
  },
};

const structuralAnalysis = (prompt: string) => {
  const text = prompt.trim();
  const lower = text.toLowerCase();
  const words = wordCount(text);
  const sentences = text
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;

  const evidence: Record<
    PromptDimensionKey,
    string[]
  > = {
    clarity: [],
    context: [],
    specificity: [],
    goal: [],
    outputFormat: [],
  };

  /*
    1. CLARITY
  */
  let clarity = 42;

  if (
    hasSignal(
      lower,
      /\b(explain|describe|analyze|analyse|compare|create|write|solve|design|summarize|summarise|evaluate|generate|list|identify|teach|recommend|improve|rewrite|debug|review|calculate|translate|plan)\b/i,
    )
  ) {
    clarity += 25;
    evidence.clarity.push(
      "A clear action verb tells the AI what to do.",
    );
  }

  if (words >= 12) {
    clarity += 8;
    evidence.clarity.push(
      "The prompt contains enough wording to express a complete request.",
    );
  }

  if (sentences >= 2) {
    clarity += 5;
    evidence.clarity.push(
      "Separate sentences provide room for the task and supporting details.",
    );
  }

  if (
    hasSignal(
      lower,
      /\b(step[- ]by[- ]step|in simple terms|for a beginner|clearly|briefly|in detail|deeply)\b/i,
    )
  ) {
    clarity += 8;
    evidence.clarity.push(
      "The prompt specifies useful explanation depth or style.",
    );
  }

  if (/[,:;]/.test(text)) clarity += 4;

  if (words <= 5) {
    clarity -= 8;
    evidence.clarity.push(
      "The request is extremely short, leaving little instruction to follow.",
    );
  }

  /*
    2. CONTEXT
  */
  let context = 28;

  if (
    hasSignal(
      lower,
      /\b(i am|i'm|as a|my role|for a|for an|audience|student|beginner|developer|manager|teacher|researcher|customer|interviewer|candidate|exam|client|team)\b/i,
    )
  ) {
    context += 22;
    evidence.context.push(
      "An audience, role, or user situation is specified.",
    );
  }

  if (
    hasSignal(
      lower,
      /\b(context|background|situation|scenario|purpose|because|currently|project|environment|use case|problem|challenge|existing|current)\b/i,
    )
  ) {
    context += 20;
    evidence.context.push(
      "Relevant background or situation is explicitly mentioned.",
    );
  }

  if (
    hasSignal(
      lower,
      /\b(assuming|given that|based on|using|with|without|within|under|limited to|for the purpose of)\b/i,
    )
  ) {
    context += 12;
    evidence.context.push(
      "Assumptions or situational boundaries are included.",
    );
  }

  if (words >= 25) context += 8;

  if (words <= 8) {
    context -= 6;
    evidence.context.push(
      "Very little background is supplied, so the AI may need to infer context.",
    );
  }

  /*
    3. SPECIFICITY
  */
  let specificity = 30;

  if (/\b\d+(?:\.\d+)?\b/.test(text)) {
    specificity += 10;
    evidence.specificity.push(
      "The prompt contains a concrete number or measurable value.",
    );
  }

  if (
    hasSignal(
      lower,
      /\b(exactly|specific|only|must|should|include|exclude|focus on|cover|criteria|requirements|constraints|scope|limit|maximum|minimum|at least|at most)\b/i,
    )
  ) {
    specificity += 22;
    evidence.specificity.push(
      "Concrete requirements or boundaries are stated.",
    );
  }

  if (
    hasSignal(
      lower,
      /\b(example|examples|such as|like|including|e\.g\.|for instance)\b/i,
    )
  ) {
    specificity += 12;
    evidence.specificity.push(
      "An example or concrete reference narrows the request.",
    );
  }

  if (
    /\b\d+\s*(?:words?|sentences?|points?|steps?|examples?|items?|rows?|columns?|minutes?|days?)\b/i.test(
      text,
    )
  ) {
    specificity += 10;
    evidence.specificity.push(
      "A measurable output constraint is included.",
    );
  }

  /*
    4. GOAL
  */
  let goal = 38;

  if (
    hasSignal(
      lower,
      /\b(explain|describe|analyze|analyse|compare|create|write|solve|design|summarize|summarise|evaluate|generate|list|identify|teach|recommend|improve|rewrite|debug|review|calculate|translate|plan)\b/i,
    )
  ) {
    goal += 22;
    evidence.goal.push(
      "The prompt contains an explicit task for the AI.",
    );
  }

  if (
    hasSignal(
      lower,
      /\b(goal|objective|outcome|purpose|so that|so i can|help me|i need|i want|i'm trying to|success means|decision)\b/i,
    )
  ) {
    goal += 22;
    evidence.goal.push(
      "The intended outcome or reason is stated.",
    );
  }

  if (
    hasSignal(
      lower,
      /\b(learn|understand|prepare|implement|choose|decide|build|use|apply|practice|present|submit)\b/i,
    )
  ) {
    goal += 10;
    evidence.goal.push(
      "The prompt indicates how the result will be used.",
    );
  }

  /*
    5. OUTPUT FORMAT
  */
  let outputFormat = 22;

  if (
    hasSignal(
      lower,
      /\b(bullet points?|bullets?|numbered list|table|json|csv|markdown|headings?|sections?|steps?|step[- ]by[- ]step|code|code block|template|checklist|summary|short answer|detailed answer|comparison|pros and cons|pros\/cons|columns?|rows?)\b/i,
    )
  ) {
    outputFormat += 38;
    evidence.outputFormat.push(
      "A concrete answer structure is requested.",
    );
  }

  if (
    hasSignal(
      lower,
      /\b(words?|characters?|paragraphs?|lines?|format|structure|length|limit|organize|organise|present|respond with|return as|format as)\b/i,
    )
  ) {
    outputFormat += 20;
    evidence.outputFormat.push(
      "A presentation or length instruction is included.",
    );
  }

  /*
    Anti-gaming / quality adjustment:
    verbosity is not the same as quality.
  */
  const chainedInstructions =
    (lower.match(/\b(and|also|then|but)\b/gi) || [])
      .length;

  if (chainedInstructions >= 8) {
    clarity -= 8;
    evidence.clarity.push(
      "Many chained instructions may make the request harder to follow.",
    );
  }

  if (words > 250) {
    clarity -= 5;
    specificity -= 3;
    evidence.clarity.push(
      "The prompt is unusually long; organizing requirements into sections may improve usability.",
    );
  }

  return {
    clarity: clamp(clarity),
    context: clamp(context),
    specificity: clamp(specificity),
    goal: clamp(goal),
    outputFormat: clamp(outputFormat),
    evidence,
  };
};

const buildDimensions = (
  prompt: string,
  aiAnalysis: Record<string, unknown>,
): PromptDimension[] => {
  const local = structuralAnalysis(prompt);

  const keys: PromptDimensionKey[] = [
    "clarity",
    "context",
    "specificity",
    "goal",
    "outputFormat",
  ];

  /*
    IMPORTANT: Some backend/Edge Function versions return 0
    for dimension fields that they did not actually calculate.
    A zero here is therefore treated as "not supplied", not as
    a real prompt-quality score. We fall back to the local
    evidence-based score in that case.
  */
  const nestedDimensions =
    aiAnalysis.dimensions &&
    typeof aiAnalysis.dimensions === "object"
      ? (aiAnalysis.dimensions as Record<string, unknown>)
      : null;

  return keys.map((key) => {
    const directValue = numericScore(aiAnalysis[key]);

    const nestedValue =
      nestedDimensions &&
      nestedDimensions[key] &&
      typeof nestedDimensions[key] === "object"
        ? numericScore(
            (nestedDimensions[key] as Record<string, unknown>).score,
          )
        : null;

    /* Treat 0 as an omitted dimension from the backend. */
    const supplied =
      directValue !== null && directValue > 0
        ? directValue
        : nestedValue !== null && nestedValue > 0
          ? nestedValue
          : null;

    const score = clamp(
      supplied === null
        ? local[key]
        : supplied,
    );

    const reason =
      score >= 70
        ? dimensionInfo[key].strongReason
        : key === "clarity"
          ? "The request is understandable, but some wording can still be interpreted in more than one way."
          : key === "context"
            ? "The AI has limited background information and may need to make assumptions."
            : key === "specificity"
              ? "The task remains broad or leaves important requirements unspecified."
              : key === "goal"
                ? "The task is present, but the desired end result is not fully defined."
                : "The AI is mostly free to choose how the answer should be presented.";

    return {
      key,
      label: dimensionInfo[key].label,
      score,
      status: dimensionStatus(score),
      reason,
      action: dimensionInfo[key].action,
      evidence: uniqueStrings(
        local.evidence[key],
      ).slice(0, 3),
    };
  });
};

const detectPromptType = (prompt: string) => {
  const lower = prompt.toLowerCase();

  if (/\b(debug|fix|error|bug|code)\b/.test(lower))
    return "Problem solving";
  if (/\b(compare|difference|versus|vs\.?)\b/.test(lower))
    return "Comparison";
  if (/\b(write|draft|compose|rewrite|email|essay|story)\b/.test(lower))
    return "Writing";
  if (/\b(explain|teach|learn|understand)\b/.test(lower))
    return "Learning";
  if (/\b(analyze|analyse|evaluate|research|investigate)\b/.test(lower))
    return "Analysis";
  if (/\b(create|generate|design|build)\b/.test(lower))
    return "Creation";
  if (/\b(plan|roadmap|strategy)\b/.test(lower))
    return "Planning";

  return "General request";
};

const buildFeedback = (
  prompt: string,
  dimensions: PromptDimension[],
) => {
  const weakest = [...dimensions]
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);

  if (weakest[0].score >= 85) {
    return `This is a strong ${detectPromptType(prompt).toLowerCase()} prompt. The next improvement is refinement: add detail only where it reduces ambiguity or improves the result.`;
  }

  const first = weakest[0];
  const second = weakest[1];

  return `Your request is understandable, but ${first.label.toLowerCase()} is the biggest opportunity. ${first.reason}${second ? ` Next, improve ${second.label.toLowerCase()} so the AI has fewer decisions to make.` : ""}`;
};

const buildStrengths = (
  dimensions: PromptDimension[],
  serviceStrengths: unknown,
) => {
  const fromService = Array.isArray(serviceStrengths)
    ? serviceStrengths.filter(
        (item): item is string =>
          typeof item === "string" &&
          item.trim().length > 0,
      )
    : [];

  const fromStructure = dimensions
    .filter((dimension) => dimension.score >= 70)
    .sort((a, b) => b.score - a.score)
    .map(
      (dimension) =>
        `${dimension.label}: ${dimension.reason}`,
    );

  return uniqueStrings([
    ...fromService,
    ...fromStructure,
  ]).slice(0, 4);
};

const buildMissing = (
  dimensions: PromptDimension[],
) =>
  [...dimensions]
    .filter((dimension) => dimension.score < 70)
    .sort((a, b) => a.score - b.score)
    .map(
      (dimension) =>
        `${dimension.label}: ${dimension.action}`,
    )
    .slice(0, 4);

const buildSuggestions = (
  dimensions: PromptDimension[],
  prompt: string,
) => {
  const weakest = [...dimensions]
    .filter((dimension) => dimension.score < 85)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const suggestions = weakest.map(
    (dimension, index) =>
      `${index === 0 ? "Priority" : "Next"} — ${dimension.action}`,
  );

  if (
    wordCount(prompt) < 12 &&
    !suggestions.some((item) =>
      /background|audience|context/i.test(item),
    )
  ) {
    suggestions.push(
      "Add one sentence explaining who the answer is for or why you need it.",
    );
  }

  return uniqueStrings(suggestions).slice(0, 4);
};

const buildImprovedPrompt = (
  prompt: string,
  dimensions: PromptDimension[],
  aiImprovedPrompt: unknown,
) => {
  if (
    typeof aiImprovedPrompt === "string" &&
    aiImprovedPrompt.trim()
  ) {
    return aiImprovedPrompt.trim();
  }

  const missing = new Set(
    dimensions
      .filter((dimension) => dimension.score < 70)
      .map((dimension) => dimension.key),
  );

  const additions: string[] = [];

  if (missing.has("goal")) {
    additions.push(
      "Goal: [state the exact outcome you want].",
    );
  }

  if (missing.has("context")) {
    additions.push(
      "Context/audience: [add only the background the AI needs].",
    );
  }

  if (missing.has("specificity")) {
    additions.push(
      "Requirements: [add scope, constraints, examples, or measurable limits].",
    );
  }

  if (missing.has("outputFormat")) {
    additions.push(
      "Output format: [specify the desired structure, length, or format].",
    );
  }

  if (!additions.length) {
    return prompt.trim();
  }

  return `${prompt.trim()}

${additions.join("\n")}`;
};

function AISimulation() {
  const navigate = useNavigate();

  /*
    =========================================
    GUEST MODE
  =========================================
  */

  const [isGuest, setIsGuest] = useState(false);

  /*
    =========================================
    USER
  =========================================
  */

  const [_userName, setUserName] = useState("User");

  /*
    =========================================
    PROMPT
  =========================================
  */

  const [prompt, setPrompt] = useState("");

  const [analysis, setAnalysis] =
    useState<AnalysisResult | null>(null);

  /*
    =========================================
    UI STATES
  =========================================
  */

  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [
    showImprovedPrompt,
    setShowImprovedPrompt,
  ] = useState(false);

  /*
    =========================================
    CURIO MEDIATOR
  =========================================

    The mediator checks the prompt BEFORE
    sending it to the AI simulation.

    Private information is detected locally
    in the browser.
  =========================================
  */

  const [
    mediatorStatus,
    setMediatorStatus,
  ] = useState<"idle" | "warning" | "blocked">(
    "idle",
  );

  const [
    mediatorMessage,
    setMediatorMessage,
  ] = useState("");

  const [
    mediatorDetails,
    setMediatorDetails,
  ] = useState<string[]>([]);

  /*
    =========================================
    LOAD USER
  =========================================
  */

  useEffect(() => {
    const loadUser = async () => {
      const guest =
        sessionStorage.getItem("curio_guest") ===
        "true";

      setIsGuest(guest);

      if (guest) {
        setUserName("Guest");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";

      setUserName(fullName);
    };

    void loadUser();
  }, [navigate]);

  /*
    =========================================
    CURIO MEDIATOR
    =========================================

    FIRST VERSION

    Checks for common private/sensitive
    information before the prompt is sent
    to the AI simulation.

    This check happens locally.
  =========================================
  */

  const checkMediator = (
    text: string,
  ): {
    status: "safe" | "warning" | "blocked";
    message: string;
    details: string[];
  } => {
    const value = text.trim();

    const findings: string[] = [];

    /*
      =========================================
      EMAIL
      =========================================
    */

    if (
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(
        value,
      )
    ) {
      findings.push(
        "Your prompt appears to contain an email address.",
      );
    }

    /*
      =========================================
      PHONE NUMBER
      =========================================
    */

    if (
      /(?:\+?\d[\d\s().-]{8,}\d)/.test(value)
    ) {
      findings.push(
        "Your prompt appears to contain a phone number.",
      );
    }

    /*
      =========================================
      CREDIT / DEBIT CARD
      =========================================
    */

    if (
      /\b(?:\d[ -]*?){13,19}\b/.test(value)
    ) {
      findings.push(
        "Your prompt may contain a card or financial number.",
      );
    }

    /*
      =========================================
      PASSWORD
      =========================================
    */

    if (
      /\b(password|passwd|passcode|login password|secret key)\b\s*(is|:|=)/i.test(
        value,
      )
    ) {
      findings.push(
        "Your prompt appears to contain a password or secret.",
      );
    }

    /*
      =========================================
      OTP
      =========================================
    */

    if (
      /\b(?:otp|one[- ]time password|verification code|security code)\b\s*(is|:|=)/i.test(
        value,
      )
    ) {
      findings.push(
        "Your prompt appears to contain a verification code.",
      );
    }

    /*
      =========================================
      API KEYS / TOKENS
      =========================================
    */

    if (
      /\b(?:api[_ -]?key|access[_ -]?token|secret[_ -]?key|bearer token)\b\s*(is|:|=)/i.test(
        value,
      )
    ) {
      findings.push(
        "Your prompt appears to contain an API key or access token.",
      );
    }

    /*
      =========================================
      SENSITIVE IDENTITY INFORMATION
      =========================================
    */

    if (
      /\b(?:aadhaar|pan card|passport|social security|ssn)\b\s*(number|no\.?|#)?\s*(is|:|=)?/i.test(
        value,
      )
    ) {
      findings.push(
        "Your prompt appears to reference sensitive identity information.",
      );
    }

    /*
      =========================================
      PRIVATE ADDRESS
      =========================================
    */

    if (
      /\b(?:home address|residential address|my address|house address)\b\s*(is|:|=)/i.test(
        value,
      )
    ) {
      findings.push(
        "Your prompt appears to contain a private address.",
      );
    }

    /*
      =========================================
      PERSONAL INFORMATION COMBINATION
      =========================================
    */

    if (
      /\b(?:my|our)\b.{0,30}\b(?:address|phone|email|location)\b/i.test(
        value,
      )
    ) {
      findings.push(
        "Your prompt may contain personally identifying information.",
      );
    }

    /*
      =========================================
      STRONG SECRET INDICATORS
      =========================================
    */

    const strongSecret =
      /\b(?:password|otp|one[- ]time password|api[_ -]?key|access[_ -]?token|secret key|credit card|debit card|cvv|pin)\b/i.test(
        value,
      );

    /*
      =========================================
      BLOCK SENSITIVE SECRETS
      =========================================
    */

    if (strongSecret) {
      return {
        status: "blocked",

        message:
          "CURIO stopped this prompt because it may contain private or sensitive information.",

        details: findings,
      };
    }

    /*
      =========================================
      WARNING
      =========================================
    */

    if (findings.length > 0) {
      return {
        status: "warning",

        message:
          "CURIO noticed information that may be private. Review your prompt before sending it.",

        details: findings,
      };
    }

    /*
      =========================================
      SAFE
      =========================================
    */

    return {
      status: "safe",

      message:
        "Your prompt looks safe to continue.",

      details: [],
    };
  };

  /*
    =========================================
    RUN AI SIMULATION
    =========================================

    The actual AI request is handled by:

      lib/aiSimulation.ts

    This keeps the frontend clean and ensures
    the OpenAI/API key stays on the server.
  =========================================
  */

  const runSimulation = async () => {
    setErrorMessage("");
    setAnalysis(null);
    setShowImprovedPrompt(false);

    /*
      Reset mediator state
    */

    setMediatorStatus("idle");
    setMediatorMessage("");
    setMediatorDetails([]);

    if (!prompt.trim()) {
      setErrorMessage(
        "Write a prompt first. Try asking the AI to solve a specific problem.",
      );
      return;
    }

    if (prompt.trim().length < 10) {
      setErrorMessage(
        "Your prompt is too short. Add more context about what you want the AI to do.",
      );
      return;
    }

    /*
      =========================================
      CURIO MEDIATOR
      =========================================

      IMPORTANT:

      This happens BEFORE the prompt reaches
      the AI simulation.
    */

    const mediator = checkMediator(prompt);

    if (mediator.status === "blocked") {
      setMediatorStatus("blocked");

      setMediatorMessage(mediator.message);

      setMediatorDetails(mediator.details);

      return;
    }

    if (mediator.status === "warning") {
      setMediatorStatus("warning");

      setMediatorMessage(mediator.message);

      setMediatorDetails(mediator.details);

      return;
    }

    /*
      =========================================
      GUEST PROTECTION
      =========================================
    */

    if (isGuest) {
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      /*
        =========================================
        AI SIMULATOR SERVICE
        =========================================

        Do NOT call supabase.functions.invoke()
        directly here.

        lib/aiSimulation.ts handles:
        - authentication
        - Edge Function
        - response validation
        - normalization
        - errors
      */

      const simulatorResult =
        await runAISimulation({
          prompt: prompt.trim(),
          category: "Prompting Practice",
        });

      /*
        =========================================
        SERVICE RESPONSE
        =========================================

        runAISimulation() returns:

        {
          response: string,
          analysis: {
            score,
            clarity,
            context,
            specificity,
            goal,
            outputFormat,
            strengths,
            improvements,
            tip,
            improvedPrompt
          }
        }
      */

      const result =
        simulatorResult.analysis as Record<string, unknown>;

      /*
        =========================================
        INTELLIGENT ANALYSIS NORMALIZATION
        =========================================

        Backend dimensions are preferred when present.
        Missing dimensions are derived from the user's actual
        prompt rather than becoming 0/100.
      */
      const dimensions = buildDimensions(
        prompt.trim(),
        result,
      );

      const feedback =
        typeof result.tip === "string" &&
        result.tip.trim()
          ? result.tip.trim()
          : buildFeedback(
              prompt.trim(),
              dimensions,
            );

      const strengths = buildStrengths(
        dimensions,
        result.strengths,
      );

      const missing = buildMissing(
        dimensions,
      );

      const suggestions = buildSuggestions(
        dimensions,
        prompt.trim(),
      );

      const improvedPrompt =
        buildImprovedPrompt(
          prompt.trim(),
          dimensions,
          result.improvedPrompt,
        );

      const dimensionAverage =
        dimensions.reduce(
          (sum, dimension) =>
            sum + dimension.score,
          0,
        ) / dimensions.length;

      /*
        Some older backend responses use 0 as a placeholder for
        an unavailable overall score. Never let that placeholder
        overwrite the real dimension-based score.
      */
      const rawServiceScore =
        numericScore(result.score) ??
        numericScore(result.accuracy);

      const serviceScore =
        rawServiceScore !== null && rawServiceScore > 0
          ? rawServiceScore
          : null;

      /*
        Preserve the service's overall score when valid.
        If it is absent, derive it from the five dimensions.
      */
      const overallScore = clamp(
        serviceScore === null
          ? dimensionAverage
          : serviceScore,
      );

      const weakest = [...dimensions].sort(
        (a, b) => a.score - b.score,
      )[0];

      const hasAIDimensions =
        dimensions.some((dimension) => {
          const direct = numericScore(
            result[dimension.key],
          );

          if (direct !== null && direct > 0) {
            return true;
          }

          const nested =
            result.dimensions &&
            typeof result.dimensions === "object"
              ? (result.dimensions as Record<string, unknown>)[
                  dimension.key
                ]
              : null;

          if (nested && typeof nested === "object") {
            const nestedScore = numericScore(
              (nested as Record<string, unknown>).score,
            );

            return nestedScore !== null && nestedScore > 0;
          }

          return false;
        });

      setAnalysis({
        score: overallScore,
        accuracy: overallScore,

        feedback,

        strengths,

        missing,

        suggestions,

        improvedPrompt,

        response:
          simulatorResult.response,

        answer:
          simulatorResult.response,

        skillTips: dimensions.map(
          (dimension) =>
            `${dimension.label}: ${dimension.score}/100`,
        ),

        clarity:
          dimensions.find(
            (dimension) =>
              dimension.key === "clarity",
          )?.score,

        context:
          dimensions.find(
            (dimension) =>
              dimension.key === "context",
          )?.score,

        specificity:
          dimensions.find(
            (dimension) =>
              dimension.key === "specificity",
          )?.score,

        goal:
          dimensions.find(
            (dimension) =>
              dimension.key === "goal",
          )?.score,

        outputFormat:
          dimensions.find(
            (dimension) =>
              dimension.key === "outputFormat",
          )?.score,

        dimensions,

        analysisQuality:
          hasAIDimensions
            ? "AI + structural"
            : "Structural",

        promptType:
          detectPromptType(
            prompt.trim(),
          ),

        priorityFix:
          `${weakest.label}: ${weakest.action}`,

        confidence:
          hasAIDimensions ? 92 : 82,
      });

    } catch (error) {
      console.error(
        "CURIO AI Simulation error:",
        error,
      );

      if (
        error &&
        typeof error === "object" &&
        "message" in error
      ) {
        setErrorMessage(
          String(
            (
              error as {
                message?: string;
              }
            ).message ??
              "Unable to connect to the AI simulation. Please try again.",
          ),
        );
      } else {
        setErrorMessage(
          "Unable to connect to the AI simulation. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /*
    =========================================
    CLEAR SIMULATION
    =========================================
  */

  const clearSimulation = () => {
    setPrompt("");
    setAnalysis(null);
    setErrorMessage("");
    setShowImprovedPrompt(false);

    /*
      Reset mediator
    */

    setMediatorStatus("idle");
    setMediatorMessage("");
    setMediatorDetails([]);
  };

  /*
    =========================================
    USE IMPROVED PROMPT
    =========================================
  */

  const useImprovedPrompt = () => {
    if (analysis?.improvedPrompt) {
      setPrompt(analysis.improvedPrompt);

      setShowImprovedPrompt(false);

      globalThis.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /*
    =========================================
    SCORE
    =========================================
  */

  const score = Math.max(
    0,
    Math.min(
      100,
      Number(
        analysis?.score ??
          analysis?.accuracy ??
          0,
      ),
    ),
  );

  const getScoreLabel = () => {
    if (score >= 90) {
      return "Excellent prompt";
    }

    if (score >= 75) {
      return "Strong prompt";
    }

    if (score >= 50) {
      return "Good start";
    }

    if (score >= 25) {
      return "Needs improvement";
    }

    return "Beginner prompt";
  };

  /*
    =========================================
    GUEST LOCK SCREEN
    =========================================
  */

  if (isGuest) {
    return (
      <div className="ai-simulation-page">
        <div className="ai-simulation-locked">
          <div className="ai-simulation-lock-icon">
            🔒
          </div>

          <span className="ai-simulation-eyebrow">
            AI SIMULATION
          </span>

          <h1>
            Practice prompting with AI
          </h1>

          <p>
            Build real prompting skills by
            writing prompts, receiving AI
            feedback and improving your
            prompts step by step.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            className="ai-simulation-primary-button"
          >
            Sign in to unlock
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="ai-simulation-secondary-button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /*
    =========================================
    MAIN PAGE
    =========================================
  */

  return (
    <div className="ai-simulation-page">
      {/* =====================================
          HEADER
      ====================================== */}

      <header className="ai-simulation-header">
        <div>
          <button
            type="button"
            className="ai-simulation-back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          <span className="ai-simulation-eyebrow">
            CURIO • AI SIMULATION
          </span>

          <h1>
            Learn to talk to AI.
            <br />
            <span>
              One prompt at a time.
            </span>
          </h1>

          <p>
            Write a prompt, see how the AI
            responds, and understand exactly
            how you can make your prompt
            stronger.
          </p>
        </div>

        <div className="ai-simulation-header-badge">
          <span>🧠</span>

          <div>
            <strong>
              Prompt Coach
            </strong>

            <small>
              Learn • Try • Improve
            </small>
          </div>
        </div>
      </header>

      {/* =====================================
          MAIN WORKSPACE
      ====================================== */}

      <main className="ai-simulation-workspace">
        {/* ===================================
            PROMPT AREA
        ==================================== */}

        <section className="ai-simulation-prompt-card">
          <div className="ai-simulation-card-heading">
            <div>
              <span className="ai-simulation-step">
                STEP 01
              </span>

              <h2>
                Write your prompt
              </h2>

              <p>
                Tell the AI what you want it
                to do. Don't worry about being
                perfect.
              </p>
            </div>

            <div className="ai-simulation-prompt-icon">
              💬
            </div>
          </div>

          <div className="ai-simulation-input-wrapper">
            <textarea
              value={prompt}
              onChange={(event) =>
                setPrompt(event.target.value)
              }
              placeholder="Example: Explain photosynthesis to a Class 10 student using a simple real-life example."
              maxLength={4000}
              disabled={isLoading}
            />

            <div className="ai-simulation-input-footer">
              <span>
                {prompt.length}/4000
              </span>

              <span>
                💡 Be specific about your goal.
              </span>
            </div>
          </div>

          {/* ERROR */}

          {errorMessage && (
            <div className="ai-simulation-error">
              <span>⚠️</span>

              <p>{errorMessage}</p>
            </div>
          )}

          {/* =====================================
              CURIO MEDIATOR
          ====================================== */}

          {mediatorStatus !== "idle" && (
            <div
              className={
                mediatorStatus === "blocked"
                  ? "ai-simulation-mediator ai-simulation-mediator-blocked"
                  : "ai-simulation-mediator ai-simulation-mediator-warning"
              }
            >
              <div className="ai-simulation-mediator-icon">
                {mediatorStatus === "blocked"
                  ? "🛡️"
                  : "⚠️"}
              </div>

              <div className="ai-simulation-mediator-content">
                <span className="ai-simulation-mediator-label">
                  CURIO MEDIATOR
                </span>

                <h3>
                  {mediatorStatus ===
                  "blocked"
                    ? "Prompt stopped for your safety"
                    : "Please review your prompt"}
                </h3>

                <p>
                  {mediatorMessage}
                </p>

                {mediatorDetails.length >
                  0 && (
                  <ul>
                    {mediatorDetails.map(
                      (
                        detail,
                        index,
                      ) => (
                        <li
                          key={`${detail}-${index}`}
                        >
                          {detail}
                        </li>
                      ),
                    )}
                  </ul>
                )}

                <div className="ai-simulation-mediator-help">
                  <strong>
                    What should you do?
                  </strong>

                  <p>
                    Remove private information
                    such as passwords, OTPs,
                    financial details, contact
                    information, or sensitive
                    identity information.
                  </p>
                </div>

                <button
                  type="button"
                  className="ai-simulation-mediator-edit"
                  onClick={() => {
                    setMediatorStatus(
                      "idle",
                    );

                    setMediatorMessage("");

                    setMediatorDetails([]);
                  }}
                >
                  Edit my prompt
                </button>
              </div>
            </div>
          )}

          <div className="ai-simulation-prompt-actions">
            <button
              type="button"
              className="ai-simulation-clear-button"
              onClick={clearSimulation}
              disabled={
                isLoading || !prompt
              }
            >
              Clear
            </button>

            <button
              type="button"
              className="ai-simulation-run-button"
              onClick={runSimulation}
              disabled={
                isLoading ||
                !prompt.trim()
              }
            >
              {isLoading ? (
                <>
                  <span className="ai-simulation-spinner" />
                  Analysing prompt...
                </>
              ) : (
                <>
                  Analyse my prompt
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* ===================================
            ANALYSIS
        ==================================== */}

        {analysis && (
          <section className="ai-simulation-results">
            {/* =================================
                SCORE
            ================================== */}

            <div
              className="ai-simulation-score-card"
              style={
                {
                  "--score": score,
                } as React.CSSProperties
              }
            >
              <div className="ai-simulation-score-left">
                <span className="ai-simulation-step">
                  STEP 02
                </span>

                <h2>
                  Your prompt score
                </h2>

                <p>
                  {getScoreLabel()}
                </p>
              </div>

              <div className="ai-simulation-score-circle">
                <div>
                  <strong>
                    {score}
                  </strong>

                  <span>/100</span>
                </div>
              </div>
            </div>

            {/* =================================
                PROMPT DIMENSIONS
            ================================== */}

            {analysis.dimensions &&
              analysis.dimensions.length > 0 && (
                <div className="ai-simulation-dimensions-card">
                  <div className="ai-simulation-section-title">
                    <span>
                      HOW YOUR SCORE IS BUILT
                    </span>

                    <h2>
                      Prompt dimensions
                    </h2>

                    <p>
                      Each dimension answers a different
                      question about your prompt. The
                      analysis focuses on evidence in your
                      wording, not on prompt length.
                    </p>
                  </div>

                  <div className="ai-simulation-dimensions-grid">
                    {analysis.dimensions.map(
                      (dimension) => (
                        <div
                          className="ai-simulation-dimension"
                          key={dimension.key}
                        >
                          <div className="ai-simulation-dimension-heading">
                            <span>
                              {dimension.label}
                            </span>

                            <strong>
                              {dimension.score}/100
                            </strong>
                          </div>

                          <div className="ai-simulation-dimension-track">
                            <div
                              className="ai-simulation-dimension-fill"
                              style={{
                                width: `${dimension.score}%`,
                              }}
                            />
                          </div>

                          <div className="ai-simulation-dimension-status">
                            {dimension.status}
                          </div>

                          <p>
                            {dimension.reason}
                          </p>

                          {dimension.evidence.length >
                            0 && (
                            <ul className="ai-simulation-dimension-evidence">
                              {dimension.evidence.map(
                                (
                                  item,
                                  index,
                                ) => (
                                  <li
                                    key={`${dimension.key}-${index}`}
                                  >
                                    {item}
                                  </li>
                                ),
                              )}
                            </ul>
                          )}

                          {dimension.score < 85 && (
                            <div className="ai-simulation-dimension-action">
                              <strong>
                                Improve:
                              </strong>{" "}
                              {dimension.action}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>

                  <div className="ai-simulation-analysis-meta">
                    <span>
                      Type:{" "}
                      {analysis.promptType ||
                        "General request"}
                    </span>

                    <span>
                      Method:{" "}
                      {analysis.analysisQuality ||
                        "Structural"}
                    </span>

                    <span>
                      Confidence:{" "}
                      {analysis.confidence || 82}%
                    </span>
                  </div>
                </div>
              )}

            {/* =================================
                FEEDBACK
            ================================== */}

            {analysis.feedback && (
              <div className="ai-simulation-feedback-card">
                <div className="ai-simulation-result-icon">
                  💡
                </div>

                <div>
                  <span>
                    COACH FEEDBACK
                  </span>

                  <h3>
                    Here's what I noticed
                  </h3>

                  <p>
                    {analysis.feedback}
                  </p>
                </div>
              </div>
            )}

            {/* =================================
                STRENGTHS / MISSING
            ================================== */}

            <div className="ai-simulation-analysis-grid">
              <div className="ai-simulation-analysis-card">
                <div className="ai-simulation-analysis-title">
                  <span>✓</span>

                  <h3>
                    What's working
                  </h3>
                </div>

                {analysis.strengths &&
                analysis.strengths.length >
                  0 ? (
                  <ul>
                    {analysis.strengths.map(
                      (
                        item,
                        index,
                      ) => (
                        <li
                          key={`${item}-${index}`}
                        >
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="ai-simulation-empty">
                    Your prompt doesn't have
                    clear strengths identified
                    yet.
                  </p>
                )}
              </div>

              <div className="ai-simulation-analysis-card">
                <div className="ai-simulation-analysis-title">
                  <span>!</span>

                  <h3>
                    What is missing
                  </h3>
                </div>

                {analysis.missing &&
                analysis.missing.length >
                  0 ? (
                  <ul>
                    {analysis.missing.map(
                      (
                        item,
                        index,
                      ) => (
                        <li
                          key={`${item}-${index}`}
                        >
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="ai-simulation-empty">
                    Great! No major missing
                    elements were detected.
                  </p>
                )}
              </div>
            </div>

            {/* =================================
                SUGGESTIONS
            ================================== */}

            {analysis.suggestions &&
            analysis.suggestions.length >
              0 && (
              <div className="ai-simulation-suggestions-card">
                <div className="ai-simulation-section-title">
                  <span>
                    STEP 03
                  </span>

                  <h2>
                    Make your prompt stronger
                  </h2>

                  <p>
                    These changes can make
                    your instructions clearer
                    and more useful.
                  </p>
                </div>

                <div className="ai-simulation-suggestions-list">
                  {analysis.suggestions.map(
                    (
                      suggestion,
                      index,
                    ) => (
                      <div
                        className="ai-simulation-suggestion"
                        key={`${suggestion}-${index}`}
                      >
                        <div>
                          {index + 1}
                        </div>

                        <p>
                          {suggestion}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* =================================
                IMPROVED PROMPT
            ================================== */}

            {analysis.improvedPrompt && (
              <div className="ai-simulation-improved-card">
                <div className="ai-simulation-section-title">
                  <span>
                    STEP 04
                  </span>

                  <h2>
                    See a stronger version
                  </h2>

                  <p>
                    Compare your original prompt
                    with a stronger version that targets
                    the actual weak dimensions.
                  </p>
                </div>

                <button
                  type="button"
                  className="ai-simulation-show-button"
                  onClick={() =>
                    setShowImprovedPrompt(
                      (previous) =>
                        !previous,
                    )
                  }
                >
                  {showImprovedPrompt
                    ? "Hide improved prompt"
                    : "Show improved prompt"}

                  <span>
                    {showImprovedPrompt
                      ? "↑"
                      : "↓"}
                  </span>
                </button>

                {showImprovedPrompt && (
                  <div className="ai-simulation-improved-prompt">
                    <div className="ai-simulation-code-header">
                      <span>
                        ✨ CURIO SUGGESTED PROMPT
                      </span>
                    </div>

                    <p>
                      {analysis.improvedPrompt}
                    </p>

                    <button
                      type="button"
                      onClick={
                        useImprovedPrompt
                      }
                      className="ai-simulation-use-button"
                    >
                      Use this prompt

                      <span>→</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* =================================
                AI RESPONSE
            ================================== */}

            {(analysis.response ||
              analysis.answer) && (
              <div className="ai-simulation-response-card">
                <div className="ai-simulation-section-title">
                  <span>
                    AI RESPONSE
                  </span>

                  <h2>
                    What the AI would answer
                  </h2>
                </div>

                <div className="ai-simulation-response">
                  <div className="ai-simulation-response-avatar">
                    ✨
                  </div>

                  <div>
                    {analysis.response ||
                      analysis.answer}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* =====================================
            EMPTY STATE
        ====================================== */}

        {!analysis &&
          !isLoading && (
            <section className="ai-simulation-how-it-works">
              <div>
                <span>
                  HOW IT WORKS
                </span>

                <h2>
                  Don't just use AI.
                  <br />
                  Learn how to use it well.
                </h2>
              </div>

              <div className="ai-simulation-how-grid">
                <div>
                  <strong>01</strong>

                  <h3>
                    Write
                  </h3>

                  <p>
                    Write your prompt naturally.
                  </p>
                </div>

                <div>
                  <strong>02</strong>

                  <h3>
                    Analyse
                  </h3>

                  <p>
                    CURIO identifies what's
                    helping or hurting your prompt.
                  </p>
                </div>

                <div>
                  <strong>03</strong>

                  <h3>
                    Improve
                  </h3>

                  <p>
                    Apply the feedback and try
                    again.
                  </p>
                </div>
              </div>
            </section>
          )}
      </main>
    </div>
  );
}

export default AISimulation;