/* =========================================
   CURIO LESSON DATA
   Single source of truth for the
   CURIO learning pathway.
========================================= */

export interface LessonSection {
  id: number;
  title: string;
  shortDescription: string;
  explanation: string;
  estimatedMinutes: number;
}

export interface LessonData {
  id: number;
  title: string;
  subtitle: string;
  description: string;

  difficulty:
    | "Beginner"
    | "Intermediate"
    | "Advanced";

  estimatedMinutes: number;

  skills: string[];

  objectives: string[];

  sections: LessonSection[];

  prerequisiteLessonId: number | null;

  requiresCompletion: boolean;
}

/* =========================================
   LESSON 1
   AI FUNDAMENTALS
========================================= */

export const lessons: LessonData[] = [

  {
    id: 1,

    title: "Understanding AI",

    subtitle: "What AI is, how it works, and where it fits in everyday life.",

    description:
      "Build a strong foundation in artificial intelligence before learning how to use generative AI tools.",

    difficulty: "Beginner",

    estimatedMinutes: 15,

    skills: [
      "AI Fundamentals",
      "AI Literacy",
      "Technology Awareness",
    ],

    objectives: [
      "Understand what artificial intelligence means.",
      "Distinguish AI from traditional software.",
      "Understand what machine learning is at a basic level.",
      "Recognize common AI systems in everyday life.",
      "Understand the limitations of AI.",
    ],

    prerequisiteLessonId: null,

    requiresCompletion: false,

    sections: [
      {
        id: 1,

        title: "What is AI?",

        shortDescription:
          "Understand the basic idea behind artificial intelligence.",

        explanation:
          "Artificial intelligence refers to computer systems designed to perform tasks that normally require human-like abilities such as recognizing patterns, understanding language, making predictions, and solving problems.",

        estimatedMinutes: 2,
      },

      {
        id: 2,

        title: "How AI Learns",

        shortDescription:
          "Understand the basic idea of learning from data.",

        explanation:
          "Many modern AI systems learn patterns from examples. Instead of manually programming every possible answer, developers provide data and training methods that allow the system to identify useful patterns.",

        estimatedMinutes: 3,
      },

      {
        id: 3,

        title: "AI Around You",

        shortDescription:
          "Recognize AI systems you may already use.",

        explanation:
          "AI is already present in search engines, recommendation systems, navigation applications, spam filters, translation tools, voice assistants, image recognition systems, and generative AI applications.",

        estimatedMinutes: 2,
      },

      {
        id: 4,

        title: "Generative AI",

        shortDescription:
          "Learn what makes generative AI different.",

        explanation:
          "Generative AI creates new content such as text, images, audio, video, and code based on patterns learned during training.",

        estimatedMinutes: 3,
      },

      {
        id: 5,

        title: "What AI Cannot Do Reliably",

        shortDescription:
          "Understand why AI answers must be evaluated.",

        explanation:
          "AI systems can produce incorrect, incomplete, outdated, or misleading information. A confident answer is not automatically a correct answer.",

        estimatedMinutes: 3,
      },

      {
        id: 6,

        title: "AI Responsibility",

        shortDescription:
          "Understand why responsible AI use matters.",

        explanation:
          "Using AI responsibly means protecting private information, checking important information, understanding limitations, and thinking about the consequences of AI-generated outputs.",

        estimatedMinutes: 2,
      },
    ],
  },

  /* =========================================
     LESSON 2
     AI TOOLS
  ========================================== */

  {
    id: 2,

    title: "Understanding AI Tools",

    subtitle:
      "Learn how different AI tools work and when to choose them.",

    description:
      "Understand the difference between AI assistants, search-based tools, image generators, coding assistants, and other AI applications.",

    difficulty: "Beginner",

    estimatedMinutes: 15,

    skills: [
      "AI Tools",
      "Tool Selection",
      "Digital Literacy",
    ],

    objectives: [
      "Identify different categories of AI tools.",
      "Understand what an AI assistant does.",
      "Understand the difference between generation and search.",
      "Choose an appropriate AI tool for a task.",
      "Recognize that different tools have different strengths.",
    ],

    prerequisiteLessonId: 1,

    requiresCompletion: true,

    sections: [
      {
        id: 1,
        title: "AI Assistants",
        shortDescription:
          "Understand conversational AI assistants.",
        explanation:
          "AI assistants allow users to interact with AI through natural language. They can help explain concepts, brainstorm ideas, transform text, plan tasks, and support problem solving.",
        estimatedMinutes: 2,
      },

      {
        id: 2,
        title: "Search vs AI Generation",
        shortDescription:
          "Understand an important difference between searching and generating.",
        explanation:
          "Search systems primarily retrieve information from available sources, while generative AI produces responses based on learned patterns and the information available to the system.",
        estimatedMinutes: 3,
      },

      {
        id: 3,
        title: "Choosing the Right Tool",
        shortDescription:
          "Learn to match a task with an appropriate AI tool.",
        explanation:
          "The best AI tool depends on the task. Research, writing, coding, image creation, data analysis, and real-time information may require different capabilities.",
        estimatedMinutes: 3,
      },

      {
        id: 4,
        title: "AI Tool Strengths",
        shortDescription:
          "Understand why different AI systems behave differently.",
        explanation:
          "Different AI systems may use different models, data sources, interfaces, tools, and capabilities. Therefore their responses and strengths can differ.",
        estimatedMinutes: 3,
      },

      {
        id: 5,
        title: "Using Multiple AI Tools",
        shortDescription:
          "Learn when multiple tools can work together.",
        explanation:
          "A workflow can combine different tools. For example, one tool may help research, another may organize information, and another may help create a presentation.",
        estimatedMinutes: 2,
      },

      {
        id: 6,
        title: "Tool Selection Practice",
        shortDescription:
          "Practice choosing the appropriate tool for a situation.",
        explanation:
          "You will evaluate realistic tasks and select the type of AI tool that is most suitable for each situation.",
        estimatedMinutes: 2,
      },
    ],
  },

  /* =========================================
     LESSON 3
     PROMPTING
  ========================================== */

  {
    id: 3,

    title: "What is a Prompt?",

    subtitle:
      "Learn how to communicate clearly with AI.",

    description:
      "Learn how prompts influence AI responses and how to construct clear, useful instructions.",

    difficulty: "Beginner",

    estimatedMinutes: 20,

    skills: [
      "Prompting",
      "Communication",
      "Problem Solving",
    ],

    objectives: [
      "Understand what a prompt is.",
      "Identify the important parts of a prompt.",
      "Write clear instructions for AI.",
      "Improve vague prompts.",
      "Use prompt shortcuts effectively.",
      "Evaluate whether a prompt contains enough context.",
    ],

    prerequisiteLessonId: 2,

    requiresCompletion: true,

    sections: [
      {
        id: 1,
        title: "Prompt Alphabet",
        shortDescription:
          "Learn the building blocks of a useful prompt.",
        explanation:
          "A strong prompt can include a goal, context, task, format, rules, and audience. These components help communicate what you actually want from the AI.",
        estimatedMinutes: 3,
      },

      {
        id: 2,
        title: "Build a Prompt",
        shortDescription:
          "Construct a prompt step by step.",
        explanation:
          "Start with the desired outcome, add relevant context, describe the task, and specify the format or constraints when necessary.",
        estimatedMinutes: 3,
      },

      {
        id: 3,
        title: "How Prompting Works",
        shortDescription:
          "Understand why wording affects AI responses.",
        explanation:
          "AI systems interpret the information and instructions provided in a prompt. Clearer context and instructions can make the desired response easier to produce.",
        estimatedMinutes: 3,
      },

      {
        id: 4,
        title: "What Prompts Can Do",
        shortDescription:
          "Discover practical uses of prompting.",
        explanation:
          "Prompts can be used to explain, create, transform, analyze, compare, plan, coach, and critique information.",
        estimatedMinutes: 3,
      },

      {
        id: 5,
        title: "Make Prompts Better",
        shortDescription:
          "Improve vague or incomplete prompts.",
        explanation:
          "Instead of asking a broad question, provide enough context, specify the desired outcome, define constraints, and explain the format you want.",
        estimatedMinutes: 3,
      },

      {
        id: 6,
        title: "Prompt Shortcuts",
        shortDescription:
          "Use structured instructions for common tasks.",
        explanation:
          "Shortcuts such as asking for steps, tables, examples, summaries, quizzes, flashcards, comparisons, or checklists can make instructions easier to understand.",
        estimatedMinutes: 2,
      },

      {
        id: 7,
        title: "Prompt Lab",
        shortDescription:
          "Experiment with prompts.",
        explanation:
          "You will modify prompts and observe how changing the goal, context, format, or constraints affects the resulting answer.",
        estimatedMinutes: 2,
      },

      {
        id: 8,
        title: "Final Practice",
        shortDescription:
          "Demonstrate your prompting skills.",
        explanation:
          "Apply the prompting techniques from this lesson to construct a complete prompt for a realistic task.",
        estimatedMinutes: 2,
      },
    ],
  },

  /* =========================================
     LESSON 4
     VERIFICATION
  ========================================== */

  {
    id: 4,

    title: "Verifying AI Answers",

    subtitle:
      "Learn how to question, check, and validate AI-generated information.",

    description:
      "Develop critical thinking skills so you can distinguish useful AI output from information that requires verification.",

    difficulty: "Intermediate",

    estimatedMinutes: 20,

    skills: [
      "Verification",
      "Critical Thinking",
      "Fact Checking",
    ],

    objectives: [
      "Understand why AI can produce incorrect answers.",
      "Identify claims that require verification.",
      "Compare AI output with reliable sources.",
      "Recognize hallucinations and unsupported claims.",
      "Develop a verification habit.",
    ],

    prerequisiteLessonId: 3,

    requiresCompletion: true,

    sections: [
      {
        id: 1,
        title: "Why AI Can Be Wrong",
        shortDescription:
          "Understand the limitations behind AI answers.",
        explanation:
          "AI generates responses from learned patterns and available context. It does not guarantee that every statement it produces is factually correct.",
        estimatedMinutes: 3,
      },

      {
        id: 2,
        title: "Spot Suspicious Claims",
        shortDescription:
          "Identify information that deserves closer checking.",
        explanation:
          "Specific statistics, dates, quotations, legal claims, medical information, financial information, and unfamiliar facts should receive additional scrutiny.",
        estimatedMinutes: 3,
      },

      {
        id: 3,
        title: "Finding Reliable Sources",
        shortDescription:
          "Learn what makes a source useful.",
        explanation:
          "Reliable verification often requires checking authoritative organizations, primary sources, official documents, academic publications, or reputable reporting.",
        estimatedMinutes: 3,
      },

      {
        id: 4,
        title: "Cross Checking",
        shortDescription:
          "Compare information across sources.",
        explanation:
          "A useful verification process compares important claims with independent sources instead of relying on a single AI response.",
        estimatedMinutes: 3,
      },

      {
        id: 5,
        title: "AI Verification Workflow",
        shortDescription:
          "Build a repeatable verification process.",
        explanation:
          "Ask, inspect the claim, identify the evidence needed, check reliable sources, compare the information, and only then decide whether the answer is trustworthy enough to use.",
        estimatedMinutes: 4,
      },

      {
        id: 6,
        title: "Verification Practice",
        shortDescription:
          "Apply the verification process.",
        explanation:
          "You will evaluate AI-generated claims and determine what should be accepted, questioned, or verified.",
        estimatedMinutes: 4,
      },
    ],
  },

  /* =========================================
     LESSON 5
     SAFETY & ETHICS
  ========================================== */

  {
    id: 5,

    title: "AI Ethics & Safety",

    subtitle:
      "Use AI responsibly while protecting yourself and others.",

    description:
      "Understand privacy, security, responsible AI use, bias, misinformation, and ethical decision-making.",

    difficulty: "Intermediate",

    estimatedMinutes: 20,

    skills: [
      "Privacy",
      "Security",
      "AI Ethics",
      "Responsible AI",
    ],

    objectives: [
      "Understand why private information should not be casually entered into AI tools.",
      "Recognize sensitive information.",
      "Understand AI-related risks.",
      "Identify biased or harmful outputs.",
      "Use AI responsibly.",
    ],

    prerequisiteLessonId: 4,

    requiresCompletion: true,

    sections: [
      {
        id: 1,
        title: "Think Before You Send",
        shortDescription:
          "Learn what information should stay private.",
        explanation:
          "Before entering information into an AI system, consider whether it contains passwords, financial information, personal identifiers, confidential documents, private conversations, or other sensitive data.",
        estimatedMinutes: 3,
      },

      {
        id: 2,
        title: "Privacy & Data",
        shortDescription:
          "Understand why data handling matters.",
        explanation:
          "AI applications can have different data handling policies. Users should understand the privacy settings and policies of the system they are using before sharing sensitive information.",
        estimatedMinutes: 3,
      },

      {
        id: 3,
        title: "AI Bias",
        shortDescription:
          "Understand how bias can appear in AI systems.",
        explanation:
          "AI systems can reproduce patterns or biases present in their training data, system design, or user inputs. Outputs should therefore be evaluated critically.",
        estimatedMinutes: 3,
      },

      {
        id: 4,
        title: "Misinformation",
        shortDescription:
          "Recognize how AI can amplify incorrect information.",
        explanation:
          "Generated content can make incorrect information appear convincing. Verification is especially important when AI output could influence important decisions.",
        estimatedMinutes: 3,
      },

      {
        id: 5,
        title: "Responsible AI Use",
        shortDescription:
          "Develop responsible habits.",
        explanation:
          "Responsible AI use combines privacy awareness, verification, transparency, appropriate tool selection, and human judgment.",
        estimatedMinutes: 4,
      },

      {
        id: 6,
        title: "Safety Scenarios",
        shortDescription:
          "Practice making safe AI decisions.",
        explanation:
          "You will evaluate realistic situations and decide whether information should be shared, verified, modified, or kept private.",
        estimatedMinutes: 4,
      },
    ],
  },

  /* =========================================
     LESSON 6
     AI IN REAL LIFE
  ========================================== */

  {
    id: 6,

    title: "AI in Real Life",

    subtitle:
      "Turn AI knowledge into practical everyday skills.",

    description:
      "Learn how AI can support studying, communication, creativity, planning, research, and everyday problem solving.",

    difficulty: "Intermediate",

    estimatedMinutes: 20,

    skills: [
      "Practical AI",
      "Problem Solving",
      "Productivity",
    ],

    objectives: [
      "Use AI for learning.",
      "Use AI for writing and communication.",
      "Use AI for brainstorming and creativity.",
      "Use AI for planning.",
      "Recognize when human judgment is still required.",
    ],

    prerequisiteLessonId: 5,

    requiresCompletion: true,

    sections: [
      {
        id: 1,
        title: "AI for Studying",
        shortDescription:
          "Use AI as a learning assistant.",
        explanation:
          "AI can help explain concepts, generate practice questions, create summaries, compare ideas, and provide different explanations of difficult topics.",
        estimatedMinutes: 3,
      },

      {
        id: 2,
        title: "AI for Communication",
        shortDescription:
          "Use AI to improve communication.",
        explanation:
          "AI can help draft emails, simplify complex writing, adjust tone, organize ideas, and translate text while the user remains responsible for the final message.",
        estimatedMinutes: 3,
      },

      {
        id: 3,
        title: "AI for Creativity",
        shortDescription:
          "Use AI as a creative partner.",
        explanation:
          "AI can support brainstorming, idea generation, storytelling, design concepts, and creative experimentation.",
        estimatedMinutes: 3,
      },

      {
        id: 4,
        title: "AI for Planning",
        shortDescription:
          "Use AI to structure tasks.",
        explanation:
          "AI can help break large goals into smaller tasks, create schedules, prepare checklists, and identify possible next steps.",
        estimatedMinutes: 3,
      },

      {
        id: 5,
        title: "AI Problem Solving",
        shortDescription:
          "Use AI to explore possible solutions.",
        explanation:
          "AI can help identify options, explain trade-offs, organize information, and suggest approaches. Important decisions should still involve human judgment and appropriate verification.",
        estimatedMinutes: 4,
      },

      {
        id: 6,
        title: "Real World Challenge",
        shortDescription:
          "Apply AI to a realistic problem.",
        explanation:
          "You will solve a practical problem using the complete CURIO learning process: understand, prompt, evaluate, verify, and apply.",
        estimatedMinutes: 4,
      },
    ],
  },

  /* =========================================
     LESSON 7
     AI WORKFLOWS
  ========================================== */

  {
    id: 7,

    title: "AI Workflows",

    subtitle:
      "Combine AI tools and human judgment into useful workflows.",

    description:
      "Learn how multiple AI capabilities can be connected to complete larger tasks systematically.",

    difficulty: "Advanced",

    estimatedMinutes: 20,

    skills: [
      "AI Workflows",
      "Automation",
      "Tool Integration",
      "Problem Solving",
    ],

    objectives: [
      "Understand what an AI workflow is.",
      "Break large tasks into stages.",
      "Assign different tools to different tasks.",
      "Add verification checkpoints.",
      "Design a responsible AI workflow.",
    ],

    prerequisiteLessonId: 6,

    requiresCompletion: true,

    sections: [
      {
        id: 1,
        title: "What is an AI Workflow?",
        shortDescription:
          "Understand workflows instead of isolated prompts.",
        explanation:
          "An AI workflow is a sequence of connected steps where AI tools and human decisions work together to achieve a larger outcome.",
        estimatedMinutes: 3,
      },

      {
        id: 2,
        title: "Break the Problem Down",
        shortDescription:
          "Turn a large task into smaller steps.",
        explanation:
          "Complex tasks become easier to manage when they are divided into clear stages such as research, analysis, creation, review, and finalization.",
        estimatedMinutes: 3,
      },

      {
        id: 3,
        title: "Connecting AI Tools",
        shortDescription:
          "Understand how different tools can cooperate.",
        explanation:
          "Different tools can contribute different capabilities. A workflow can combine research, writing, analysis, coding, image generation, or other AI capabilities.",
        estimatedMinutes: 3,
      },

      {
        id: 4,
        title: "Human Checkpoints",
        shortDescription:
          "Keep humans in control of important decisions.",
        explanation:
          "Important workflows should include points where a person reviews information, checks accuracy, evaluates risks, and decides whether to continue.",
        estimatedMinutes: 3,
      },

      {
        id: 5,
        title: "Safe AI Workflow",
        shortDescription:
          "Design workflows with privacy and verification.",
        explanation:
          "A responsible workflow limits sensitive data, verifies important outputs, documents decisions where appropriate, and keeps humans responsible for consequential decisions.",
        estimatedMinutes: 4,
      },

      {
        id: 6,
        title: "Workflow Challenge",
        shortDescription:
          "Design your own AI workflow.",
        explanation:
          "Create a complete workflow for a realistic problem and identify the AI tools, human checkpoints, verification steps, and final output.",
        estimatedMinutes: 4,
      },
    ],
  },

  /* =========================================
     LESSON 8
     FINAL CHALLENGE
  ========================================== */

  {
    id: 8,

    title: "CURIO Final Challenge",

    subtitle:
      "Demonstrate that you can use AI independently and responsibly.",

    description:
      "Bring together AI fundamentals, tool selection, prompting, verification, safety, practical use, and workflows in one final challenge.",

    difficulty: "Advanced",

    estimatedMinutes: 25,

    skills: [
      "AI Independence",
      "Prompting",
      "Verification",
      "Safety",
      "Problem Solving",
    ],

    objectives: [
      "Choose an appropriate AI tool.",
      "Write an effective prompt.",
      "Evaluate the AI response.",
      "Identify information requiring verification.",
      "Protect sensitive information.",
      "Apply AI to a realistic problem.",
      "Demonstrate independent AI judgment.",
    ],

    prerequisiteLessonId: 7,

    requiresCompletion: true,

    sections: [
      {
        id: 1,
        title: "Understand the Problem",
        shortDescription:
          "Identify what the task actually requires.",
        explanation:
          "Before using AI, clearly define the problem, desired outcome, constraints, and information required.",
        estimatedMinutes: 3,
      },

      {
        id: 2,
        title: "Choose the Tool",
        shortDescription:
          "Select the appropriate AI capability.",
        explanation:
          "Choose an AI tool based on the task, required information, output type, privacy considerations, and verification needs.",
        estimatedMinutes: 3,
      },

      {
        id: 3,
        title: "Write the Prompt",
        shortDescription:
          "Create a complete task prompt.",
        explanation:
          "Construct a prompt using an appropriate goal, context, task, format, audience, and constraints.",
        estimatedMinutes: 4,
      },

      {
        id: 4,
        title: "Evaluate the Answer",
        shortDescription:
          "Critically inspect the AI output.",
        explanation:
          "Examine whether the response actually answers the task, contains unsupported claims, misses important context, or requires additional information.",
        estimatedMinutes: 4,
      },

      {
        id: 5,
        title: "Verify Important Information",
        shortDescription:
          "Check claims before relying on them.",
        explanation:
          "Identify important claims and verify them using appropriate reliable sources before using them for consequential decisions.",
        estimatedMinutes: 4,
      },

      {
        id: 6,
        title: "Apply Safely",
        shortDescription:
          "Use the result responsibly.",
        explanation:
          "Review privacy, accuracy, potential risks, and human responsibility before applying the AI-generated result.",
        estimatedMinutes: 3,
      },

      {
        id: 7,
        title: "Final Assessment",
        shortDescription:
          "Demonstrate independent AI literacy.",
        explanation:
          "Complete the final assessment covering AI fundamentals, prompting, tool selection, verification, safety, practical application, and workflows.",
        estimatedMinutes: 4,
      },
    ],
  },
];

/* =========================================
   HELPER FUNCTIONS
========================================= */

export function getLessonById(
  lessonId: number
): LessonData | undefined {
  return lessons.find(
    (lesson) => lesson.id === lessonId
  );
}

export function getLessonSections(
  lessonId: number
): LessonSection[] {
  return (
    getLessonById(lessonId)?.sections ?? []
  );
}

export function getTotalLessons(): number {
  return lessons.length;
}

export function getCompletedLessonIds(
  completedLessonIds: number[]
): number[] {
  return lessons
    .filter((lesson) =>
      completedLessonIds.includes(lesson.id)
    )
    .map((lesson) => lesson.id);
}

export function isLessonUnlocked(
  lessonId: number,
  completedLessonIds: number[]
): boolean {
  const lesson =
    getLessonById(lessonId);

  if (!lesson) {
    return false;
  }

  if (
    lesson.prerequisiteLessonId === null
  ) {
    return true;
  }

  return completedLessonIds.includes(
    lesson.prerequisiteLessonId
  );
}