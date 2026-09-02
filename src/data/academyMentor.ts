import type { AcademyLesson } from "./academy.ts";

export type MentorLesson = {
  openingQuestion: string;
  story: string;
  simpleExplanation: string;
  thinkQuestion: string;
  thinkOptions: string[];
  correctIndex: number;
  mentorBridge: string;
  teachBackPrompt: string;
};

const customMentorLessons: Record<number, MentorLesson> = {
  1: {
    openingQuestion: "If a calculator can solve difficult mathematics, does that automatically make it intelligent?",
    story: "Imagine three systems: a calculator, an email spam filter and a chatbot. All produce useful outputs, but they do not work in the same way. The calculator follows exact rules. A spam filter can learn patterns from examples. A chatbot uses a trained model to generate language. Before learning algorithms, you must first learn to recognise which kind of system you are looking at.",
    simpleExplanation: "AI is the big umbrella. Machine Learning is one way of building AI by learning patterns from examples. Deep Learning is a branch of Machine Learning that uses large neural networks. So the relationship is: AI contains ML, and ML contains Deep Learning methods.",
    thinkQuestion: "Which statement best separates a rule-based system from a learned system?",
    thinkOptions: [
      "A rule-based system is always more intelligent.",
      "A rule-based system follows explicitly written logic, while a learned system adjusts parameters using examples.",
      "A learned system never needs evaluation.",
      "They are exactly the same thing.",
    ],
    correctIndex: 1,
    mentorBridge: "Good. Now that the vocabulary is clear, we can ask the more useful question: how does a machine-learning system actually go from a problem to a prediction?",
    teachBackPrompt: "Explain AI, Machine Learning and Deep Learning to a friend who has never studied technology. Do not use textbook definitions first. Start with a simple example.",
  },
  2: {
    openingQuestion: "Why can two teams use the same model, but one system works in the real world while the other fails badly?",
    story: "Because a model is only one part of the system. Before training, someone must define the problem. The data must represent reality. Training, validation and testing must be separated. After deployment, the world can change. A good ML engineer therefore thinks in workflows, not only in algorithms.",
    simpleExplanation: "Think of machine learning as a complete journey: decide what problem you want to solve, collect suitable data, prepare it, train a model, check it honestly on unseen data, deploy it carefully and continue watching whether it still works.",
    thinkQuestion: "Why should the final test set be kept separate while building a model?",
    thinkOptions: [
      "To make the model train faster.",
      "Because repeatedly using it for decisions can make the final evaluation less trustworthy.",
      "Because test data cannot contain numbers.",
      "Because validation and testing mean exactly the same thing.",
    ],
    correctIndex: 1,
    mentorBridge: "The workflow gives us a map. Next we build the tools needed to follow that map, beginning with Python and computational thinking.",
    teachBackPrompt: "Describe the complete machine-learning workflow as if you were explaining how to build a real product, not how to pass an exam.",
  },
  3: {
    openingQuestion: "When you write Python code, what is actually happening between the text in your file and the output you see?",
    story: "A beginner often sees programming as typing instructions and hoping the computer obeys. A stronger mental model is that your source code is input to the Python interpreter. The interpreter reads and executes instructions in a chosen environment. Understanding this makes errors less mysterious and debugging much easier.",
    simpleExplanation: "A Python program is simply text written according to Python rules. The Python interpreter reads that text and runs the instructions. Interactive mode is useful for quick experiments; a script is useful when you want a repeatable program saved in a file.",
    thinkQuestion: "Which is the best reason to save an experiment as a Python script?",
    thinkOptions: [
      "Scripts make every program automatically correct.",
      "A saved script makes the steps easier to repeat, inspect and share.",
      "The interpreter cannot run scripts.",
      "Interactive mode cannot print output.",
    ],
    correctIndex: 1,
    mentorBridge: "Now that you understand how code is executed, we can safely build the Python foundations that later ML libraries depend on.",
    teachBackPrompt: "Explain the difference between Python source code, the interpreter, interactive mode and a script using a simple everyday analogy.",
  },
};

export function getMentorLesson(lesson: AcademyLesson): MentorLesson {
  const custom = customMentorLessons[lesson.order];
  if (custom) return custom;

  const conceptNames = lesson.concepts.slice(0, 3).map((concept) => concept.term).join(", ");

  return {
    openingQuestion: `Before learning ${lesson.title.toLowerCase()}, what problem would remain difficult without it?`,
    story: `${lesson.why} In this lesson, we will not start by memorising terminology. We will first build the problem, then connect the idea to ${conceptNames}, and only after that move into mathematics, algorithms and code when they are useful.`,
    simpleExplanation: `${lesson.summary} In simple words, focus first on what goes in, what the system changes or learns, and what comes out. The formal vocabulary becomes easier once that basic story is clear.`,
    thinkQuestion: `Which idea is most central to understanding ${lesson.title}?`,
    thinkOptions: lesson.concepts.slice(0, 4).map((concept) => concept.definition),
    correctIndex: 0,
    mentorBridge: `You now have the basic picture. Next we connect the idea to the formal concepts, then work through the mathematics or implementation that makes the system work.`,
    teachBackPrompt: `Explain ${lesson.title} in your own words. Start with the problem it solves, then describe the main idea, an example and one limitation or mistake to avoid.`,
  };
}
