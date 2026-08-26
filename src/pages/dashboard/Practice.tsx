import React, { useEffect, useMemo, useState } from "react";
import { usePracticeProgress } from "../../hooks/usePracticeProgress.ts";
import "./Practice.css";

type Difficulty = "Basic" | "Moderate" | "Hard";

type PracticeQuestion = {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: Difficulty;
  topic: string;
  scenario: string;
};

type PracticeSession = {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  difficulty: Difficulty;
  questions: PracticeQuestion[];
};

const PRACTICE_SESSIONS: PracticeSession[] = [
  {
    id: 1,
    title: "AI Foundations Lab",
    subtitle: "Think beyond definitions",
    icon: "🧠",
    difficulty: "Basic",
    questions: [
      {
        id: 101,
        question:
          "A student asks an AI system to explain gravity. The system generates a fluent explanation but includes an incorrect scientific statement. What is the most important lesson?",
        options: [
          "Fluent answers are always reliable",
          "AI output should be checked before being trusted",
          "AI cannot explain science",
          "Long answers are more accurate"
        ],
        answer: 1,
        explanation:
          "AI can produce convincing but incorrect information. Verification is an important AI skill.",
        difficulty: "Basic",
        topic: "AI Fundamentals",
        scenario: "A student receives a confident but incorrect AI explanation."
      },
      {
        id: 102,
        question:
          "You ask an AI tool to summarize a 20-page document. Which factor most directly affects the quality of the summary?",
        options: [
          "The colour of the website",
          "The quality and clarity of the instructions",
          "The user's internet speed",
          "The number of emojis used"
        ],
        answer: 1,
        explanation:
          "Clear instructions about what to focus on, the desired length and format generally improve the usefulness of the output.",
        difficulty: "Basic",
        topic: "AI Tools",
        scenario: "You need a useful summary from a long document."
      },
      {
        id: 103,
        question:
          "An AI assistant gives two different answers to the same factual question. What is the best response?",
        options: [
          "Choose the longer answer",
          "Choose the answer that sounds more confident",
          "Verify the claim using a trustworthy source",
          "Assume both answers are correct"
        ],
        answer: 2,
        explanation:
          "Conflicting AI answers are a signal to verify the underlying claim with a reliable source.",
        difficulty: "Basic",
        topic: "Verification",
        scenario: "Two AI responses disagree."
      },
      {
        id: 104,
        question:
          "Which request gives an AI assistant the clearest task?",
        options: [
          "Tell me something about presentations",
          "Presentations please",
          "Create a 5-slide beginner presentation explaining solar energy",
          "Solar energy"
        ],
        answer: 2,
        explanation:
          "The third request specifies the task, topic, audience level and expected format.",
        difficulty: "Basic",
        topic: "Prompting",
        scenario: "You want an AI to create a presentation."
      },
      {
        id: 105,
        question:
          "An AI tool asks for your full address even though you only want help rewriting an essay. What should you do?",
        options: [
          "Provide it immediately",
          "Provide additional personal information",
          "Avoid sharing unnecessary personal information",
          "Give a fake address and continue"
        ],
        answer: 2,
        explanation:
          "A useful privacy principle is to share only information necessary for the task.",
        difficulty: "Moderate",
        topic: "AI Safety",
        scenario: "An AI tool requests information unrelated to your task."
      },
      {
        id: 106,
        question:
          "A teacher wants students to use AI for brainstorming but still wants them to develop their own ideas. Which approach is best?",
        options: [
          "Let AI write the complete assignment",
          "Use AI to generate possibilities and evaluate them independently",
          "Copy the first AI response",
          "Avoid thinking about the suggestions"
        ],
        answer: 1,
        explanation:
          "AI can support ideation while the learner remains responsible for evaluating and developing the final ideas.",
        difficulty: "Moderate",
        topic: "Responsible AI",
        scenario: "AI is being used as a brainstorming partner."
      },
      {
        id: 107,
        question:
          "An AI-generated article contains several references. What should you do before citing them in your project?",
        options: [
          "Assume they exist because they look professional",
          "Check whether the references actually exist and support the claims",
          "Use only the longest reference",
          "Remove all references automatically"
        ],
        answer: 1,
        explanation:
          "AI systems can generate inaccurate or nonexistent citations. References should be independently checked.",
        difficulty: "Moderate",
        topic: "Verification",
        scenario: "AI gives you references for a research assignment."
      },
      {
        id: 108,
        question:
          "You want AI to improve your answer without changing your main idea. Which instruction is most useful?",
        options: [
          "Make it better",
          "Rewrite everything",
          "Improve clarity and grammar while preserving my original meaning",
          "Change the topic"
        ],
        answer: 2,
        explanation:
          "A good instruction defines both what should change and what should remain unchanged.",
        difficulty: "Moderate",
        topic: "Prompting",
        scenario: "You want editing rather than replacement."
      }
    ]
  },

  {
    id: 2,
    title: "Prompt Engineering Arena",
    subtitle: "Turn vague requests into useful instructions",
    icon: "🎯",
    difficulty: "Basic",
    questions: [
      {
        id: 201,
        question:
          "You want an AI to teach a difficult topic to a beginner. Which prompt gives the strongest context?",
        options: [
          "Explain this",
          "Teach me",
          "Explain neural networks to a beginner using a simple analogy and one example",
          "Neural network?"
        ],
        answer: 2,
        explanation:
          "The prompt specifies the topic, audience, teaching style and example requirement.",
        difficulty: "Basic",
        topic: "Prompt Structure",
        scenario: "A beginner needs an understandable explanation."
      },
      {
        id: 202,
        question:
          "You ask an AI to create exam questions. Which addition would make the request more precise?",
        options: [
          "Make questions",
          "Give many",
          "Create 10 moderate-level MCQs with answers and explanations",
          "Questions now"
        ],
        answer: 2,
        explanation:
          "Number, difficulty, format and output requirements make the task measurable.",
        difficulty: "Basic",
        topic: "Prompting",
        scenario: "You are creating a practice test."
      },
      {
        id: 203,
        question:
          "An AI response is too complicated for your level. What is the best next instruction?",
        options: [
          "Stop using AI",
          "Explain it at a beginner level using everyday examples",
          "Give an even longer answer",
          "Repeat the same prompt"
        ],
        answer: 1,
        explanation:
          "Iterative prompting lets you adjust the response to your needs.",
        difficulty: "Basic",
        topic: "Prompt Refinement",
        scenario: "The first explanation is too advanced."
      },
      {
        id: 204,
        question:
          "You want consistent output from an AI tool for five topics. What can help?",
        options: [
          "Give no format",
          "Define a reusable output structure",
          "Change the language randomly",
          "Ask unrelated questions"
        ],
        answer: 1,
        explanation:
          "A reusable structure helps maintain consistency across multiple outputs.",
        difficulty: "Moderate",
        topic: "Prompt Design",
        scenario: "You need the same format repeatedly."
      },
      {
        id: 205,
        question:
          "You ask AI to compare two technologies. Which instruction produces the most useful comparison?",
        options: [
          "Compare them",
          "Which is better?",
          "Compare them by cost, speed, strengths, weaknesses and suitable use cases",
          "Tell me everything"
        ],
        answer: 2,
        explanation:
          "Explicit comparison criteria make the result easier to evaluate.",
        difficulty: "Moderate",
        topic: "Prompting",
        scenario: "You need a structured technology comparison."
      },
      {
        id: 206,
        question:
          "A prompt contains five unrelated tasks and the AI produces an incomplete answer. What is a strong improvement?",
        options: [
          "Add ten more tasks",
          "Break the work into clear steps",
          "Make the prompt shorter by removing the objective",
          "Ask the AI to guess"
        ],
        answer: 1,
        explanation:
          "Breaking complex work into manageable steps can make the requested workflow clearer.",
        difficulty: "Moderate",
        topic: "Task Decomposition",
        scenario: "A complex request produces an incomplete response."
      },
      {
        id: 207,
        question:
          "You want an AI to critique your draft rather than rewrite it. Which instruction is most appropriate?",
        options: [
          "Rewrite this completely",
          "Identify three weaknesses and explain how I can improve them",
          "Make it perfect",
          "Replace my ideas"
        ],
        answer: 1,
        explanation:
          "The instruction explicitly asks for feedback instead of replacement.",
        difficulty: "Moderate",
        topic: "Prompt Control",
        scenario: "You want feedback while keeping ownership of your work."
      },
      {
        id: 208,
        question:
          "What is the strongest reason to specify the intended audience in a prompt?",
        options: [
          "It changes the AI's internet speed",
          "It helps the response match the reader's knowledge and needs",
          "It guarantees factual accuracy",
          "It removes the need for verification"
        ],
        answer: 1,
        explanation:
          "Audience information helps determine vocabulary, depth, examples and tone.",
        difficulty: "Hard",
        topic: "Prompt Strategy",
        scenario: "The same topic must be explained to different audiences."
      }
    ]
  },

  {
    id: 3,
    title: "AI Tool Detective",
    subtitle: "Choose the right tool for the right job",
    icon: "🔎",
    difficulty: "Moderate",
    questions: [
      {
        id: 301,
        question:
          "You need to find today's changing information about a public event. Which capability is most useful?",
        options: [
          "A calculator only",
          "A tool with current web information",
          "A text editor only",
          "An offline dictionary"
        ],
        answer: 1,
        explanation:
          "Time-sensitive information requires access to current sources.",
        difficulty: "Basic",
        topic: "Tool Selection",
        scenario: "You need current information."
      },
      {
        id: 302,
        question:
          "You need to calculate a complex numerical expression accurately. Which tool is most appropriate?",
        options: [
          "A calculator",
          "A random text generator",
          "A presentation editor",
          "A drawing application"
        ],
        answer: 0,
        explanation:
          "A calculator is specifically designed for precise numerical computation.",
        difficulty: "Basic",
        topic: "AI Tools",
        scenario: "Precision arithmetic is required."
      },
      {
        id: 303,
        question:
          "You want to understand a long research paper. Which workflow is strongest?",
        options: [
          "Ask for a one-word answer",
          "Summarize the paper and then verify important claims against the source",
          "Trust every AI statement",
          "Read only the AI-generated title"
        ],
        answer: 1,
        explanation:
          "AI can accelerate comprehension, but important claims should remain traceable to the source.",
        difficulty: "Moderate",
        topic: "Research",
        scenario: "You are using AI to understand a research paper."
      },
      {
        id: 304,
        question:
          "You need to create a professional presentation from notes. Which capability is most relevant?",
        options: [
          "A presentation-generation or editing tool",
          "A stopwatch",
          "A calculator only",
          "A music player"
        ],
        answer: 0,
        explanation:
          "The task requires presentation creation and organization.",
        difficulty: "Basic",
        topic: "Tool Selection",
        scenario: "You have notes and need slides."
      },
      {
        id: 305,
        question:
          "You use an AI coding assistant and receive code you do not understand. What should you do?",
        options: [
          "Run it immediately in production",
          "Ask for an explanation and test the code safely",
          "Assume it cannot contain bugs",
          "Delete your project"
        ],
        answer: 1,
        explanation:
          "Understanding, reviewing and safely testing generated code reduces risk.",
        difficulty: "Moderate",
        topic: "AI Coding",
        scenario: "AI generated code you don't fully understand."
      },
      {
        id: 306,
        question:
          "A student wants AI to create an image of a futuristic classroom. Which type of tool is most directly suited to the task?",
        options: [
          "Image generation tool",
          "Spreadsheet",
          "Calculator",
          "Text-only dictionary"
        ],
        answer: 0,
        explanation:
          "Image generation tools are designed to create visual content from descriptions.",
        difficulty: "Basic",
        topic: "AI Tools",
        scenario: "You need a visual concept."
      },
      {
        id: 307,
        question:
          "You are selecting between two AI tools. One is excellent at writing but lacks access to current information; the other can search current sources. For today's market prices, which is preferable?",
        options: [
          "Always the writing-focused tool",
          "The tool capable of accessing current information",
          "Either tool is equally suitable",
          "Neither tool can help"
        ],
        answer: 1,
        explanation:
          "Current market information changes, so access to fresh sources matters.",
        difficulty: "Moderate",
        topic: "Tool Selection",
        scenario: "You need changing real-world information."
      },
      {
        id: 308,
        question:
          "What is the most important principle when choosing an AI tool?",
        options: [
          "Choose the tool with the most colourful interface",
          "Choose the tool whose capabilities match the task and constraints",
          "Always use the newest tool",
          "Use the same tool for every task"
        ],
        answer: 1,
        explanation:
          "Good tool selection is task-driven rather than popularity-driven.",
        difficulty: "Hard",
        topic: "AI Strategy",
        scenario: "You must choose between several AI tools."
      }
    ]
  },

  {
    id: 4,
    title: "Fact Check Mission",
    subtitle: "Catch mistakes before they become facts",
    icon: "🕵️",
    difficulty: "Moderate",
    questions: [
      {
        id: 401,
        question:
          "An AI says, 'Scientists proved X yesterday.' What should make you cautious?",
        options: [
          "The sentence is short",
          "The claim is recent and needs verification",
          "The AI used punctuation",
          "The answer contains a date"
        ],
        answer: 1,
        explanation:
          "Recent claims should be checked against reliable current sources.",
        difficulty: "Basic",
        topic: "Verification",
        scenario: "AI makes a recent scientific claim."
      },
      {
        id: 402,
        question:
          "Which source is generally stronger for verifying an official government policy?",
        options: [
          "An anonymous comment",
          "The relevant official government source",
          "A random social media post",
          "An AI-generated paragraph"
        ],
        answer: 1,
        explanation:
          "Primary official sources are generally the strongest place to verify official policy.",
        difficulty: "Basic",
        topic: "Sources",
        scenario: "You need to verify an official policy."
      },
      {
        id: 403,
        question:
          "An AI provides a statistic but does not explain where it came from. What should you do?",
        options: [
          "Treat it as automatically true",
          "Ask for the source and verify the statistic",
          "Increase the number",
          "Use it without checking"
        ],
        answer: 1,
        explanation:
          "Important statistics should be traceable to a credible source.",
        difficulty: "Basic",
        topic: "Fact Checking",
        scenario: "AI gives an unsupported statistic."
      },
      {
        id: 404,
        question:
          "Why can an AI answer sound correct even when it is wrong?",
        options: [
          "AI always knows the truth",
          "AI can generate plausible language without guaranteeing factual correctness",
          "Grammar proves factual accuracy",
          "Long answers cannot be wrong"
        ],
        answer: 1,
        explanation:
          "Language fluency and factual reliability are different properties.",
        difficulty: "Moderate",
        topic: "AI Limitations",
        scenario: "A convincing answer contains a hidden error."
      },
      {
        id: 405,
        question:
          "You find three websites repeating the same claim. Does repetition alone prove it?",
        options: [
          "Yes",
          "No; the sites may all rely on the same original claim",
          "Only if the pages are long",
          "Only if AI agrees"
        ],
        answer: 1,
        explanation:
          "Multiple copies do not necessarily represent independent evidence.",
        difficulty: "Hard",
        topic: "Source Evaluation",
        scenario: "Several websites repeat identical information."
      },
      {
        id: 406,
        question:
          "Which is the strongest verification habit?",
        options: [
          "Check only whether the answer sounds professional",
          "Compare important claims with trustworthy independent evidence",
          "Trust the first result",
          "Trust the most detailed AI response"
        ],
        answer: 1,
        explanation:
          "Verification is about evidence, not presentation quality.",
        difficulty: "Moderate",
        topic: "Verification",
        scenario: "You need confidence in an AI-generated answer."
      },
      {
        id: 407,
        question:
          "A source is from five years ago and the topic changes rapidly. What should you consider?",
        options: [
          "The old source is automatically perfect",
          "The information may be outdated",
          "Age never matters",
          "Older means more accurate"
        ],
        answer: 1,
        explanation:
          "Source freshness matters for rapidly changing topics.",
        difficulty: "Moderate",
        topic: "Source Quality",
        scenario: "You are checking information in a fast-changing field."
      },
      {
        id: 408,
        question:
          "What should you do when an important AI-generated claim cannot be verified?",
        options: [
          "Present it as fact anyway",
          "Treat it as unverified and avoid overstating it",
          "Invent a source",
          "Make the claim stronger"
        ],
        answer: 1,
        explanation:
          "Unverified information should not be presented as established fact.",
        difficulty: "Hard",
        topic: "Responsible AI",
        scenario: "You cannot confirm an important AI claim."
      }
    ]
  },

  {
    id: 5,
    title: "AI Safety Challenge",
    subtitle: "Make smart decisions with AI",
    icon: "🛡️",
    difficulty: "Moderate",
    questions: [
      {
        id: 501,
        question:
          "Which information is generally safest to avoid sharing with an AI tool unless necessary and appropriately protected?",
        options: [
          "A fictional character name",
          "A public topic",
          "Sensitive personal information",
          "A general study question"
        ],
        answer: 2,
        explanation:
          "Sensitive personal information should be handled carefully and only shared when genuinely necessary and appropriate.",
        difficulty: "Basic",
        topic: "Privacy",
        scenario: "You are deciding what information to enter."
      },
      {
        id: 502,
        question:
          "An AI gives medical information that could affect an important decision. What is the safer approach?",
        options: [
          "Treat it as a professional diagnosis",
          "Use appropriate qualified professional or authoritative sources for verification",
          "Ignore all medical information",
          "Ask the AI to guarantee the answer"
        ],
        answer: 1,
        explanation:
          "High-stakes information requires appropriate authoritative or professional verification.",
        difficulty: "Moderate",
        topic: "High-Stakes AI",
        scenario: "AI gives potentially consequential information."
      },
      {
        id: 503,
        question:
          "You accidentally paste confidential information into an AI service. What is the best immediate response?",
        options: [
          "Share even more information",
          "Follow the relevant service and organizational privacy/security procedures",
          "Post it publicly",
          "Ignore the situation completely"
        ],
        answer: 1,
        explanation:
          "Security incidents should be handled through the applicable privacy and security process.",
        difficulty: "Hard",
        topic: "Privacy",
        scenario: "Confidential information was accidentally shared."
      },
      {
        id: 504,
        question:
          "Why should users understand how an AI tool handles their data?",
        options: [
          "Only because it changes screen colours",
          "Because data handling can affect privacy and security",
          "Because it improves spelling",
          "It never matters"
        ],
        answer: 1,
        explanation:
          "Understanding data handling helps users make informed privacy decisions.",
        difficulty: "Moderate",
        topic: "Data Privacy",
        scenario: "You are evaluating a new AI service."
      },
      {
        id: 505,
        question:
          "An AI produces a biased description of a group. What is a responsible response?",
        options: [
          "Automatically repeat it",
          "Recognize the potential bias, question the framing and seek better evidence",
          "Make the bias stronger",
          "Assume AI cannot be biased"
        ],
        answer: 1,
        explanation:
          "AI systems can reproduce or amplify biases, so outputs should be critically evaluated.",
        difficulty: "Moderate",
        topic: "AI Bias",
        scenario: "An AI response contains potentially biased framing."
      },
      {
        id: 506,
        question:
          "You are using AI for an important academic decision. What should remain with you?",
        options: [
          "All responsibility",
          "Critical evaluation and the final decision",
          "Nothing",
          "Only the formatting"
        ],
        answer: 1,
        explanation:
          "AI can assist decision-making, but humans should remain responsible for appropriate evaluation and decisions.",
        difficulty: "Moderate",
        topic: "Human Oversight",
        scenario: "AI is helping with an important decision."
      },
      {
        id: 507,
        question:
          "Why is 'AI said it' a weak justification for an important claim?",
        options: [
          "AI responses are always short",
          "AI output itself is not sufficient evidence of truth",
          "AI cannot write sentences",
          "AI has no vocabulary"
        ],
        answer: 1,
        explanation:
          "AI-generated text is an output, not automatically independent evidence.",
        difficulty: "Hard",
        topic: "Critical Thinking",
        scenario: "Someone uses an AI answer as their only evidence."
      },
      {
        id: 508,
        question:
          "Which principle best summarizes responsible AI use?",
        options: [
          "Automate everything",
          "Use AI thoughtfully while protecting privacy, verifying important information and retaining human judgment",
          "Trust every answer",
          "Avoid every AI tool"
        ],
        answer: 1,
        explanation:
          "Responsible use combines usefulness with verification, privacy, safety and human oversight.",
        difficulty: "Hard",
        topic: "Responsible AI",
        scenario: "You are designing your personal AI-use rules."
      }
    ]
  },

  {
    id: 6,
    title: "Real-World AI Case Lab",
    subtitle: "Solve realistic problems with AI",
    icon: "🧩",
    difficulty: "Moderate",
    questions: [
      {
        id: 601,
        question:
          "You have 50 pages of notes and only one hour to prepare. What is a strong first AI-assisted workflow?",
        options: [
          "Ask AI to guess the exam",
          "Organize and summarize the notes, then verify important details",
          "Ignore the notes",
          "Ask for random facts"
        ],
        answer: 1,
        explanation:
          "AI can help organize a large information set before targeted studying and verification.",
        difficulty: "Basic",
        topic: "AI Workflow",
        scenario: "You have limited time and a large amount of material."
      },
      {
        id: 602,
        question:
          "You need to learn a new technical concept. Which workflow is strongest?",
        options: [
          "Ask for the answer and stop",
          "Learn the concept, test yourself with examples and correct misunderstandings",
          "Only memorize the definition",
          "Copy an AI response"
        ],
        answer: 1,
        explanation:
          "Active practice and correction create a stronger learning loop than passive reading.",
        difficulty: "Moderate",
        topic: "Learning With AI",
        scenario: "You are learning an unfamiliar technical topic."
      },
      {
        id: 603,
        question:
          "An AI creates a study plan that schedules eight hours of difficult work every day. What should you do?",
        options: [
          "Follow it exactly",
          "Adapt it to realistic time, energy and priorities",
          "Ask AI to make it harder",
          "Stop studying"
        ],
        answer: 1,
        explanation:
          "AI suggestions should be adapted to real-world constraints.",
        difficulty: "Moderate",
        topic: "AI Planning",
        scenario: "An AI-generated plan is unrealistic."
      },
      {
        id: 604,
        question:
          "You want to use AI to improve your resume. What should you provide first?",
        options: [
          "Every private detail you have",
          "Relevant professional information and the target role",
          "An unrelated story",
          "No context at all"
        ],
        answer: 1,
        explanation:
          "Relevant context improves usefulness while unnecessary sensitive information should be avoided.",
        difficulty: "Moderate",
        topic: "Practical AI",
        scenario: "You want targeted resume assistance."
      },
      {
        id: 605,
        question:
          "AI generates five possible solutions to a problem. What is the next valuable step?",
        options: [
          "Pick the first automatically",
          "Evaluate each against constraints and evidence",
          "Choose the longest",
          "Ask AI to pick randomly"
        ],
        answer: 1,
        explanation:
          "AI can generate options, but evaluation against real constraints remains essential.",
        difficulty: "Moderate",
        topic: "Problem Solving",
        scenario: "AI produces multiple possible solutions."
      },
      {
        id: 606,
        question:
          "You want AI to help debug code. What information is most useful to provide?",
        options: [
          "Only 'it doesn't work'",
          "Relevant code, error message, expected behavior and actual behavior",
          "Only your name",
          "An unrelated screenshot"
        ],
        answer: 1,
        explanation:
          "Useful debugging context helps identify the difference between expected and actual behavior.",
        difficulty: "Moderate",
        topic: "AI Coding",
        scenario: "You need help debugging a program."
      },
      {
        id: 607,
        question:
          "A business uses AI to draft customer responses. What should happen before sending sensitive or consequential responses?",
        options: [
          "Send everything automatically",
          "Use appropriate human review",
          "Remove all customer context",
          "Trust the AI's confidence"
        ],
        answer: 1,
        explanation:
          "Human review is important where errors could materially affect customers.",
        difficulty: "Hard",
        topic: "AI Workflows",
        scenario: "AI is drafting customer communication."
      },
      {
        id: 608,
        question:
          "What makes an AI workflow genuinely useful rather than just 'using AI'?",
        options: [
          "Using AI as many times as possible",
          "Connecting AI to a clear objective, process, evaluation and human judgment",
          "Making prompts as long as possible",
          "Using the newest tool for every task"
        ],
        answer: 1,
        explanation:
          "A useful workflow has a purpose, process, evaluation and appropriate human oversight.",
        difficulty: "Hard",
        topic: "AI Strategy",
        scenario: "You are designing a repeatable AI workflow."
      }
    ]
  },

  {
    id: 7,
    title: "Prompt Doctor",
    subtitle: "Diagnose weak AI requests",
    icon: "🩺",
    difficulty: "Hard",
    questions: [
      {
        id: 701,
        question:
          "Prompt: 'Give me everything about AI.' What is the biggest problem?",
        options: [
          "It contains too many punctuation marks",
          "The objective and scope are unclear",
          "It is too specific",
          "It has a perfect structure"
        ],
        answer: 1,
        explanation:
          "The request has no defined audience, scope, purpose or output format.",
        difficulty: "Basic",
        topic: "Prompt Diagnosis",
        scenario: "You receive a very broad AI request."
      },
      {
        id: 702,
        question:
          "Prompt: 'Write a report.' What important information is missing?",
        options: [
          "The user's favourite colour",
          "Topic, audience, purpose and desired format",
          "An emoji",
          "The AI's name"
        ],
        answer: 1,
        explanation:
          "The task is too underspecified to reliably produce the desired report.",
        difficulty: "Basic",
        topic: "Prompt Design",
        scenario: "A request is too vague."
      },
      {
        id: 703,
        question:
          "You ask AI to solve a problem but never provide the constraints. What is a likely consequence?",
        options: [
          "The AI automatically knows every constraint",
          "The response may solve a different version of the problem",
          "The AI becomes a calculator",
          "The problem disappears"
        ],
        answer: 1,
        explanation:
          "Constraints define what counts as an acceptable solution.",
        difficulty: "Moderate",
        topic: "Prompt Constraints",
        scenario: "A problem has requirements that weren't stated."
      },
      {
        id: 704,
        question:
          "You want an AI to act as a tutor. Which instruction is more useful?",
        options: [
          "Be smart",
          "Teach me",
          "Ask me one question at a time, explain mistakes and adjust difficulty",
          "Answer everything immediately"
        ],
        answer: 2,
        explanation:
          "The third prompt defines an interactive teaching behaviour.",
        difficulty: "Moderate",
        topic: "AI Roles",
        scenario: "You want interactive tutoring."
      },
      {
        id: 705,
        question:
          "An AI repeatedly misunderstands your desired output. What should you inspect first?",
        options: [
          "Whether the request clearly defines the desired result",
          "The computer wallpaper",
          "The keyboard brand",
          "The AI's font"
        ],
        answer: 0,
        explanation:
          "Poorly specified objectives and output requirements are common causes of mismatch.",
        difficulty: "Moderate",
        topic: "Prompt Debugging",
        scenario: "The AI repeatedly produces the wrong format."
      },
      {
        id: 706,
        question:
          "Which instruction best controls output length?",
        options: [
          "Don't be long",
          "Make it nice",
          "Summarize the topic in exactly five bullet points",
          "Explain everything"
        ],
        answer: 2,
        explanation:
          "A measurable output requirement is easier for both the AI and user to interpret.",
        difficulty: "Moderate",
        topic: "Output Control",
        scenario: "You need concise structured output."
      },
      {
        id: 707,
        question:
          "You want AI to challenge your reasoning rather than agree with you. Which instruction is strongest?",
        options: [
          "Always agree",
          "Tell me I'm correct",
          "Identify assumptions, counterarguments and weaknesses in my reasoning",
          "Make my answer longer"
        ],
        answer: 2,
        explanation:
          "The prompt explicitly asks for critical evaluation.",
        difficulty: "Hard",
        topic: "Critical Prompting",
        scenario: "You want AI to act as a reasoning critic."
      },
      {
        id: 708,
        question:
          "Why is iterative prompting powerful?",
        options: [
          "Because the first answer must always be wrong",
          "Because you can evaluate the output and refine the next instruction",
          "Because longer conversations are always better",
          "Because AI cannot follow one prompt"
        ],
        answer: 1,
        explanation:
          "Good prompting can be an iterative process: request, evaluate, refine and repeat.",
        difficulty: "Hard",
        topic: "Prompt Strategy",
        scenario: "You improve a result through several rounds."
      }
    ]
  },

  {
    id: 8,
    title: "AI Master Challenge",
    subtitle: "Mixed real-world decision making",
    icon: "🏆",
    difficulty: "Hard",
    questions: [
      {
        id: 801,
        question:
          "You receive an AI answer containing a surprising historical claim. What should you do first?",
        options: [
          "Share it because it is surprising",
          "Verify the claim using reliable historical sources",
          "Make the claim more dramatic",
          "Assume AI researched it"
        ],
        answer: 1,
        explanation:
          "Unexpected factual claims should be checked before being repeated.",
        difficulty: "Moderate",
        topic: "Verification",
        scenario: "AI gives you a surprising historical fact."
      },
      {
        id: 802,
        question:
          "You need to solve a complex project problem using AI. Which sequence is strongest?",
        options: [
          "Generate → blindly accept → submit",
          "Define → generate → evaluate → refine → verify",
          "Ask once → submit",
          "Generate random answers"
        ],
        answer: 1,
        explanation:
          "A structured workflow combines problem definition, generation, evaluation, refinement and verification.",
        difficulty: "Hard",
        topic: "AI Workflow",
        scenario: "AI is part of a complex project."
      },
      {
        id: 803,
        question:
          "An AI recommendation conflicts with an official source. What should happen?",
        options: [
          "Always trust AI",
          "Investigate the discrepancy and prioritize appropriate authoritative evidence",
          "Delete the official source",
          "Choose the longer answer"
        ],
        answer: 1,
        explanation:
          "Conflicts should be investigated rather than resolved by confidence or length.",
        difficulty: "Hard",
        topic: "Verification",
        scenario: "AI and an authoritative source disagree."
      },
      {
        id: 804,
        question:
          "You want to automate a repetitive task with AI. What should you establish before automating it fully?",
        options: [
          "A way to evaluate whether the output is correct",
          "A colourful interface",
          "More emojis",
          "A longer prompt only"
        ],
        answer: 0,
        explanation:
          "Automation without evaluation can scale errors as well as useful results.",
        difficulty: "Hard",
        topic: "AI Automation",
        scenario: "You are considering automating a workflow."
      },
      {
        id: 805,
        question:
          "AI generates an answer that is technically correct but inappropriate for your audience. What should you change?",
        options: [
          "The audience",
          "The prompt's audience, tone and communication requirements",
          "The internet",
          "The factual evidence"
        ],
        answer: 1,
        explanation:
          "Communication quality depends partly on matching the output to the intended audience.",
        difficulty: "Moderate",
        topic: "Communication",
        scenario: "Correct information is poorly communicated."
      },
      {
        id: 806,
        question:
          "A learner uses AI for every assignment and stops attempting problems independently. What skill is most at risk?",
        options: [
          "Keyboard speed",
          "Independent problem-solving ability",
          "Screen brightness",
          "File naming"
        ],
        answer: 1,
        explanation:
          "Over-reliance can weaken independent reasoning and problem-solving practice.",
        difficulty: "Hard",
        topic: "AI Independence",
        scenario: "A learner becomes dependent on AI."
      },
      {
        id: 807,
        question:
          "You want to become better at AI rather than simply getting answers from AI. Which habit is strongest?",
        options: [
          "Always ask AI to do everything",
          "Practice prompting, verification, evaluation and independent problem-solving",
          "Copy every response",
          "Avoid questioning AI"
        ],
        answer: 1,
        explanation:
          "AI literacy includes using AI effectively while retaining independent judgment and verification skills.",
        difficulty: "Hard",
        topic: "AI Literacy",
        scenario: "You want long-term AI independence."
      },
      {
        id: 808,
        question:
          "Which statement best represents advanced AI literacy?",
        options: [
          "AI is always correct",
          "AI should replace human thinking",
          "AI is a powerful tool whose outputs should be directed, evaluated and used responsibly",
          "AI should never be used"
        ],
        answer: 2,
        explanation:
          "Advanced AI literacy means understanding both AI's capabilities and its limitations.",
        difficulty: "Hard",
        topic: "AI Literacy",
        scenario: "You are defining your approach to AI."
      }
    ]
  }
];

const DIFFICULTIES = ["All", "Basic", "Moderate", "Hard"];

const Practice: React.FC = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(8).fill(null)
  );
  const [showResult, setShowResult] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] =
    useState<string>("All");

  const selectedSession =
    PRACTICE_SESSIONS.find(
      (session) => session.id === selectedSessionId
    ) || PRACTICE_SESSIONS[0];

  const TOTAL_QUESTIONS = selectedSession.questions.length;
  const {
    progress: savedProgress,
    loading: progressLoading,
    saving: progressSaving,
    error: progressError,
    updateProgress,
    markComplete,
    reset: resetSavedProgress,
  } = usePracticeProgress(selectedSessionId, TOTAL_QUESTIONS);

  useEffect(() => {
    if (progressLoading) return;
    const total = selectedSession.questions.length;
    const restoredAnswers = Array.from({ length: total }, (_, index) => {
      const value = savedProgress?.answers?.[index];
      return typeof value === "number" ? value : null;
    });
    const restoredQuestion = Math.max(
      0,
      Math.min(savedProgress?.currentQuestion ?? 0, Math.max(total - 1, 0))
    );
    setAnswers(restoredAnswers);
    setCurrentQuestion(restoredQuestion);
    setSelectedAnswer(restoredAnswers[restoredQuestion] ?? null);
    setShowResult(Boolean(savedProgress?.completed));
  }, [savedProgress, progressLoading, selectedSession.questions.length]);

  const filteredSessions = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return PRACTICE_SESSIONS.filter((session) => {
      const matchesDifficulty =
        difficultyFilter === "All" ||
        session.difficulty === difficultyFilter;

      if (!search) {
        return matchesDifficulty;
      }

      const sessionText = [
        session.title,
        session.subtitle,
        session.difficulty,
        ...session.questions.map(
          (question) =>
            `${question.question} ${question.topic} ${question.scenario}`
        )
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesDifficulty &&
        sessionText.includes(search)
      );
    });
  }, [searchTerm, difficultyFilter]);

  const question = selectedSession.questions[currentQuestion] ?? selectedSession.questions[0];

  const correctCount = answers.reduce((total: number, answer, index) => {
    if (
      answer !== null &&
      answer === selectedSession.questions[index].answer
    ) {
      return total + 1;
    }

    return total;
  }, 0);

  const answeredCount = answers.filter(
    (answer) => answer !== null
  ).length;

  const percentage = TOTAL_QUESTIONS > 0 ? Math.round((correctCount / TOTAL_QUESTIONS) * 100) : 0;

  const handleSessionChange = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers(Array(PRACTICE_SESSIONS.find((session) => session.id === sessionId)?.questions.length ?? 0).fill(null));
    setShowResult(false);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || progressSaving) return;
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = answerIndex;
    setAnswers(updatedAnswers);
    setSelectedAnswer(answerIndex);
    void updateProgress(currentQuestion, updatedAnswers);
  };

  const handleNext = async () => {
    if (selectedAnswer === null || progressSaving) return;
    if (currentQuestion < TOTAL_QUESTIONS - 1) {
      const nextQuestion = currentQuestion + 1;
      const saved = await updateProgress(nextQuestion, answers);
      if (!saved) return;
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer(answers[nextQuestion]);
      return;
    }
    const score = answers.reduce<number>((total, answer, index) => {
      if (answer !== null && answer === selectedSession.questions[index].answer) {
        return total + 1;
      }
      return total;
    }, 0);

    const completed = await markComplete(answers, score);
    if (completed) {
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0 && !progressSaving) {
      const previousQuestion = currentQuestion - 1;
      setCurrentQuestion(previousQuestion);
      setSelectedAnswer(answers[previousQuestion]);
      void updateProgress(previousQuestion, answers);
    }
  };

  const handleRetry = async () => {
    if (progressSaving) return;
    const reset = await resetSavedProgress();
    if (!reset) return;
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers(Array(TOTAL_QUESTIONS).fill(null));
    setShowResult(false);
  };

  const nextSession = () => {
    const nextId = selectedSessionId >= PRACTICE_SESSIONS.length ? 1 : selectedSessionId + 1;
    handleSessionChange(nextId);
  };

  return (
    <div className="practice-page">

      {progressError && (
        <div className="practice-progress-error" role="alert">
          {progressError}
        </div>
      )}

      {progressLoading && (
        <div className="practice-progress-loading" role="status">
          Loading your saved practice progress…
        </div>
      )}

      {/* ================================
          HEADER
      ================================= */}

      <header className="practice-header">

        <div className="practice-brand">
          <div className="practice-brand-icon">
            ✨
          </div>

          <div>
            <h1>Practice Lab</h1>
            <p>Learn by solving real AI problems</p>
          </div>
        </div>

        <div className="practice-search-wrapper">

          <span className="practice-search-icon">
            🔍
          </span>

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search topics, tools, scenarios..."
            aria-label="Search practice sessions"
          />

          {searchTerm && (
            <button type="button"
              className="practice-search-clear"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>

      </header>

      <main className="practice-content">

        {/* ================================
            HERO
        ================================= */}

        <section className="practice-hero">

          <div className="practice-hero-content">

            <span className="practice-eyebrow">
              CURIO PRACTICE
            </span>

            <h2>
              Think. Try. <span>Master AI.</span>
            </h2>

            <p>
              Practice AI skills through real-world situations,
              decision-making challenges and case-based problems.
            </p>

            <div className="practice-hero-stats">

              <div>
                <strong>8</strong>
                <span>Sessions</span>
              </div>

              <div>
                <strong>64</strong>
                <span>Questions</span>
              </div>

              <div>
                <strong>4</strong>
                <span>Levels</span>
              </div>

            </div>

          </div>

          <div className="practice-hero-visual">

            <div className="practice-orbit orbit-one" />
            <div className="practice-orbit orbit-two" />

            <div className="practice-big-icon">
              🧠
            </div>

            <div className="floating-practice-card card-one">
              🎯 Prompt
            </div>

            <div className="floating-practice-card card-two">
              🛡️ Safety
            </div>

            <div className="floating-practice-card card-three">
              🔎 Verify
            </div>

          </div>

        </section>

        {/* ================================
            FILTERS
        ================================= */}

        <section className="practice-filter-bar">

          <div className="filter-title">
            <span>Practice level</span>
            <small>
              Choose what you want to challenge
            </small>
          </div>

          <div className="difficulty-buttons">

            {DIFFICULTIES.map((difficulty) => (
              <button type="button"
                key={difficulty}
                className={
                  difficultyFilter === difficulty
                    ? "difficulty-button active"
                    : "difficulty-button"
                }
                onClick={() =>
                  setDifficultyFilter(difficulty)
                }
              >
                {difficulty}
              </button>
            ))}

          </div>

        </section>

        {/* ================================
            SESSION LIST
        ================================= */}

        {!showResult && (
          <section className="practice-main-grid">

            <aside className="session-sidebar">

              <div className="session-sidebar-heading">
                <div>
                  <h3>Practice Series</h3>
                  <p>{PRACTICE_SESSIONS.length} independent challenges</p>
                </div>

                <span className="series-count">
                  8
                </span>
              </div>

              <div className="session-list">

                {filteredSessions.map((session) => (
                  <button type="button"
                    key={session.id}
                    className={
                      selectedSessionId === session.id
                        ? "session-item active"
                        : "session-item"
                    }
                    onClick={() =>
                      handleSessionChange(session.id)
                    }
                  >

                    <span className="session-number">
                      {session.id}
                    </span>

                    <span className="session-icon">
                      {session.icon}
                    </span>

                    <span className="session-information">

                      <strong>
                        {session.title}
                      </strong>

                      <small>
                        {session.questions.length} questions
                      </small>

                    </span>

                    <span className="session-arrow">
                      →
                    </span>

                  </button>
                ))}

                {filteredSessions.length === 0 && (
                  <div className="no-sessions">
                    <span>🔍</span>
                    <strong>No practice found</strong>
                    <p>
                      Try another topic or difficulty.
                    </p>
                  </div>
                )}

              </div>

            </aside>

            {/* ================================
                QUESTION AREA
            ================================= */}

            <section className="practice-question-area">

              <div className="question-top">

                <div>
                  <span className="question-session-label">
                    SESSION {selectedSession.id}
                  </span>

                  <h3>
                    {selectedSession.title}
                  </h3>
                </div>

                <div className="question-counter">
                  <strong>
                    {currentQuestion + 1}
                  </strong>
                  <span>/ {TOTAL_QUESTIONS}</span>
                </div>

              </div>

              <div className="question-progress">

                <div
                  className="question-progress-fill"
                  style={{
                    width: `${((currentQuestion + 1) / TOTAL_QUESTIONS) * 100}%`
                  }}
                />

              </div>

              <div className="question-meta">

                <span>
                  {question.topic}
                </span>

                <span
                  className={`question-difficulty ${question.difficulty.toLowerCase()}`}
                >
                  {question.difficulty}
                </span>

              </div>

              <div className="case-card">

                <div className="case-card-header">
                  <span>CASE</span>
                  <span>Real-world scenario</span>
                </div>

                <p>
                  {question.scenario}
                </p>

              </div>

              <div className="question-card">

                <div className="question-number">
                  Q{currentQuestion + 1}
                </div>

                <h4>
                  {question.question}
                </h4>

                <div className="answer-list">

                  {question.options.map(
                    (option, index) => {

                      const isSelected =
                        selectedAnswer === index;

                      const isCorrect =
                        selectedAnswer !== null &&
                        index === question.answer;

                      const isWrong =
                        isSelected &&
                        index !== question.answer;

                      let className =
                        "answer-option";

                      if (isCorrect) {
                        className += " correct";
                      }

                      if (isWrong) {
                        className += " wrong";
                      }

                      if (isSelected) {
                        className += " selected";
                      }

                      return (
                        <button type="button"
                          key={option}
                          className={className}
                          onClick={() =>
                            handleAnswer(index)
                          }
                          disabled={
                            selectedAnswer !== null
                          }
                        >

                          <span className="answer-letter">
                            {String.fromCharCode(
                              65 + index
                            )}
                          </span>

                          <span className="answer-text">
                            {option}
                          </span>

                          <span className="answer-status">
                            {isCorrect && "✓"}
                            {isWrong && "×"}
                          </span>

                        </button>
                      );
                    }
                  )}

                </div>

                {selectedAnswer !== null && (
                  <div className="explanation-box">

                    <div className="explanation-icon">
                      💡
                    </div>

                    <div>
                      <strong>
                        {selectedAnswer ===
                        question.answer
                          ? "Correct!"
                          : "Let's learn from this"}
                      </strong>

                      <p>
                        {question.explanation}
                      </p>
                    </div>

                  </div>
                )}

              </div>

              <div className="question-actions">

                <button type="button"
                  className="previous-button"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  ← Previous
                </button>

                <div className="answered-indicator">
                  {answeredCount}/{TOTAL_QUESTIONS} answered
                </div>

                <button type="button"
                  className="next-button"
                  onClick={handleNext}
                  disabled={selectedAnswer === null}
                >
                  {currentQuestion === TOTAL_QUESTIONS - 1
                    ? "View Result"
                    : "Next Question →"}
                </button>

              </div>

            </section>

          </section>
        )}

        {/* ================================
            RESULT
        ================================= */}

        {showResult && (
          <section className="practice-result">

            <div className="result-icon">
              {percentage === 100
                ? "🏆"
                : percentage >= 75
                ? "🎉"
                : percentage >= 50
                ? "💪"
                : "🌱"}
            </div>

            <span className="result-label">
              SESSION COMPLETE
            </span>

            <h2>
              {percentage === 100
                ? "Perfect practice!"
                : percentage >= 75
                ? "Great work!"
                : percentage >= 50
                ? "Good progress!"
                : "Keep practising!"}
            </h2>

            <p>
              You completed{" "}
              <strong>{selectedSession.title}</strong>.
            </p>

            <div className="result-score">

              <div className="score-circle">

                <div>
                  <strong>
                    {correctCount}
                  </strong>

                  <span>
                    / 8
                  </span>
                </div>

              </div>

              <div className="score-details">

                <div className="score-row">
                  <span>Correct answers</span>
                  <strong>
                    {correctCount}/{TOTAL_QUESTIONS}
                  </strong>
                </div>

                <div className="score-row">
                  <span>Incorrect answers</span>
                  <strong>
                    {TOTAL_QUESTIONS - correctCount}/{TOTAL_QUESTIONS}
                  </strong>
                </div>

                <div className="score-row">
                  <span>Accuracy</span>
                  <strong>
                    {percentage}%
                  </strong>
                </div>

              </div>

            </div>

            <div className="result-actions">

              <button
                type="button"
                className="result-secondary"
                onClick={handleRetry}
              >
                ↻ Retry Session
              </button>

              <button
                type="button"
                className="result-primary"
                onClick={nextSession}
              >
                Next Practice →
              </button>

            </div>

          </section>
        )}

      </main>

    </div>
  );
};

export default Practice;