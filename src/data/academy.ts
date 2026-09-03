export type LessonDiagram =
  | "flow"
  | "mindmap"
  | "regression"
  | "neural"
  | "data"
  | "transformer"
  | "mlops"
  | "tree"
  | "matrix"
  | "gradient"
  | "pipeline";

export type CodeBlock = {
  language: string;
  code: string;
  notes: string[];
};

export type MathematicsSection = {
  introduction: string;
  formulas: {
    title: string;
    expression: string;
    explanation: string;
    symbolBreakdown?: { symbol: string; meaning: string }[];
  }[];
};

export type DerivationSection = {
  introduction: string;
  steps: {
    title: string;
    expression: string;
    explanation: string;
  }[];
};

export type NumericalSection = {
  introduction: string;
  steps: {
    step: string;
    calculation: string;
    explanation: string;
  }[];
};

export type AlgorithmSection = {
  introduction: string;
  steps: {
    step: number;
    title: string;
    description: string;
  }[];
};

export type DebuggingItem = {
  symptom: string;
  possibleCause: string;
  howToCheck: string;
  fix: string;
};

export type RealWorldCase = {
  title: string;
  description: string;
  industryImpact?: string;
};

export type AcademyLesson = {
  id: string;
  order: number;
  module: string;
  moduleNumber: string;
  title: string;
  duration: string;
  level: "Foundation" | "Core" | "Applied" | "Advanced";
  summary: string;
  why: string;
  openingProblem: string;
  curiosity: string;
  priorKnowledge: string;
  objectives: string[];
  concepts: { term: string; definition: string }[];
  diagram: LessonDiagram;
  mindMap: string[];
  commonErrors?: string[];
  code?: CodeBlock;
  practice: { prompt: string; checkpoints: string[] };
  prerequisites: string[];

  // Continuous Single-Page Flow Data
  intuition?: string[];
  visualExplanation?: string[];
  mathematics?: MathematicsSection;
  derivation?: DerivationSection;
  numerical?: NumericalSection;
  algorithm?: AlgorithmSection;
  debugging?: DebuggingItem[];
  realWorldApplications?: RealWorldCase[];
  keyTakeaways?: string[];
  teachBackPrompt?: string;
};

export type AcademyModule = {
  id: string;
  number: string;
  title: string;
  description: string;
  learningOutcomes: string[];
  prerequisites: string[];
  lessons: AcademyLesson[];
};

/* =========================================================
   CURIO AI / ML ACADEMY — 10 EXACT CURRICULUM MODULES
   ========================================================= */

export const academyModules: AcademyModule[] = [
  // ---------------------------------------------------------
  // MODULE 1: FOUNDATION
  // ---------------------------------------------------------
  {
    id: "foundation",
    number: "01",
    title: "FOUNDATION",
    description: "Build the mental models, Python basics, variables, math concepts, and problem-solving mindset required for AI engineering.",
    learningOutcomes: [
      "Understand how digital computers execute instructions versus how biological brains process information.",
      "Write executable Python scripts using data types, variables, arithmetic, and control logic.",
      "Represent problem variables as vectors and arrays.",
      "Adopt a structured, hypothesis-driven problem-solving mindset."
    ],
    prerequisites: ["Basic computer literacy", "High school arithmetic"],
    lessons: [
      {
        id: "found-1", order: 1, module: "FOUNDATION", moduleNumber: "01",
        title: "How Computers Think", duration: "25 min", level: "Foundation",
        summary: "Understand binary computation, instructions, memory representation, and deterministic processing.",
        why: "Before attempting to build intelligent systems, you must understand how ordinary software processes instructions.",
        openingProblem: "Can a machine that only knows 0s and 1s solve problems that normally require human intelligence?",
        curiosity: "Why do traditional IF/ELSE rules break down when dealing with complex tasks like recognizing a handwritten digit?",
        priorKnowledge: "You already know how to use computers for web browsing and apps. Now we look under the hood.",
        objectives: ["Explain CPU instruction execution", "Distinguish memory from storage", "Differentiate deterministic logic from probabilistic estimation"],
        concepts: [
          { term: "Deterministic System", definition: "A system that produces the exact same output every time for a given input." },
          { term: "Binary Representation", definition: "Encoding data (numbers, text, images) as sequences of 0s and 1s." },
          { term: "Interpreter / CPU", definition: "The hardware/software engine that executes instructions line by line." }
        ],
        diagram: "mindmap", mindMap: ["Input Data", "Binary Encoding", "CPU Memory", "Instructions", "Deterministic Output"],
        commonErrors: ["Thinking computers 'understand' text or images the way humans do.", "Confusing RAM memory with hard-drive storage."],
        mathematics: {
          introduction: "A digital number $N$ is represented in binary (base 2) as a sum of powers of 2:",
          formulas: [
            {
              title: "Binary Expansion",
              expression: "N = \\sum_{i=0}^{k} b_i \\cdot 2^i",
              explanation: "Each bit $b_i \\in \\{0, 1\\}$ multiplies a power of 2.",
              symbolBreakdown: [
                { symbol: "b_i", meaning: "Bit value (0 or 1) at position i" },
                { symbol: "2^i", meaning: "Weight of position i (1, 2, 4, 8, 16...)" },
                { symbol: "N", meaning: "Total integer value" }
              ]
            }
          ]
        },
        derivation: {
          introduction: "Converting decimal 13 to binary by successive division by 2:",
          steps: [
            { title: "Divide 13 by 2", expression: "13 \\div 2 = 6 \\text{ remainder } 1", explanation: "Least significant bit is 1." },
            { title: "Divide 6 by 2", expression: "6 \\div 2 = 3 \\text{ remainder } 0", explanation: "Next bit is 0." },
            { title: "Divide 3 by 2", expression: "3 \\div 2 = 1 \\text{ remainder } 1", explanation: "Next bit is 1." },
            { title: "Divide 1 by 2", expression: "1 \\div 2 = 0 \\text{ remainder } 1", explanation: "Most significant bit is 1. Binary = 1101." }
          ]
        },
        numerical: {
          introduction: "Convert binary 1101 back to decimal:",
          steps: [
            { step: "Position 0", calculation: "1 \\times 2^0 = 1", explanation: "1" },
            { step: "Position 1", calculation: "0 \\times 2^1 = 0", explanation: "0" },
            { step: "Position 2", calculation: "1 \\times 2^2 = 4", explanation: "4" },
            { step: "Position 3", calculation: "1 \\times 2^3 = 8", explanation: "8" },
            { step: "Total Sum", calculation: "8 + 4 + 0 + 1 = 13", explanation: "Decimal value 13" }
          ]
        },
        algorithm: {
          introduction: "Execution loop of a deterministic computer:",
          steps: [
            { step: 1, title: "Fetch", description: "Read the next instruction from memory." },
            { step: 2, title: "Decode", description: "Determine what operation (ADD, LOAD, STORE) is requested." },
            { step: 3, title: "Execute", description: "Perform the calculation in the ALU." },
            { step: 4, title: "Store", description: "Write the result back to memory." }
          ]
        },
        code: {
          language: "python",
          code: `# Demonstrating deterministic logic in Python
def evaluate_rule(temperature):
    # Fixed rule authored by a human programmer
    if temperature > 38.0:
        return "Fever Alert"
    else:
        return "Normal"

print(evaluate_rule(39.2))  # Output: Fever Alert`,
          notes: [
            "Line 2: Function accepts a numerical input.",
            "Line 4: Strict deterministic IF condition.",
            "Line 7: Calling the function returns predictable output every time."
          ]
        },
        debugging: [
          {
            symptom: "TypeError: '>' not supported between instances of 'str' and 'float'",
            possibleCause: "Input data was passed as text string `'39.2'` instead of number `39.2`.",
            howToCheck: "Print `type(temperature)` before the IF statement.",
            fix: "Convert input using `float(temperature)`."
          }
        ],
        practice: {
          prompt: "Write a function `check_access(age)` that returns 'Allowed' for age >= 18 and 'Denied' otherwise.",
          checkpoints: ["Define function with parameter `age`", "Use explicit IF condition", "Return string result"]
        },
        realWorldApplications: [
          { title: "ATM Banking", description: "ATMs check account balance using strict deterministic logic; missing 1 cent is an intolerable bug." }
        ],
        teachBackPrompt: "Explain how a computer executes deterministic instructions using an everyday vending machine analogy.",
        prerequisites: []
      },
      {
        id: "found-2", order: 2, module: "FOUNDATION", moduleNumber: "01",
        title: "Python Fundamentals", duration: "30 min", level: "Foundation",
        summary: "Master scripts, syntax, control structures, functions, and modules in Python.",
        why: "Python is the dominant language of AI and machine learning engineering.",
        openingProblem: "How do we write instructions that are readable by humans and executable by computers?",
        curiosity: "Why did Python beat C++ and Java as the universal language for AI research?",
        priorKnowledge: "You understand how computers execute instructions line by line.",
        objectives: ["Write Python scripts", "Use functions with parameters and returns", "Import modules"],
        concepts: [
          { term: "Interpreter", definition: "The Python runtime program that executes source code." },
          { term: "Function", definition: "A named, reusable block of instructions." },
          { term: "Module", definition: "A file containing reusable Python functions and classes." }
        ],
        diagram: "pipeline", mindMap: ["Script File", "Python Interpreter", "Bytecode", "Execution"],
        commonErrors: ["Mixing tabs and spaces for indentation.", "Forgetting `return` in a function."],
        code: {
          language: "python",
          code: `def calculate_mse(y_true, y_pred):
    # Compute mean squared error between arrays
    errors = [(a - b) ** 2 for a, b in zip(y_true, y_pred)]
    return sum(errors) / len(errors)

actual = [10.0, 20.0, 30.0]
predicted = [12.0, 19.0, 29.0]
print("MSE:", calculate_mse(actual, predicted))`,
          notes: [
            "Line 1: Function definition accepting two lists.",
            "Line 3: List comprehension calculating squared residuals.",
            "Line 4: Return average squared error."
          ]
        },
        practice: {
          prompt: "Implement a `calculate_mae(y_true, y_pred)` function that computes Mean Absolute Error.",
          checkpoints: ["Use `abs(a - b)` for absolute error", "Sum absolute errors", "Divide by list length"]
        },
        realWorldApplications: [{ title: "Model Pipeline", description: "Python scripts orchestrate data loading, model training, and web deployment." }],
        teachBackPrompt: "Explain the difference between printing a value and returning a value from a Python function.",
        prerequisites: ["How Computers Think"]
      }
    ]
  },

  // ---------------------------------------------------------
  // MODULE 2: AI FUNDAMENTALS
  // ---------------------------------------------------------
  {
    id: "ai-fundamentals",
    number: "02",
    title: "AI FUNDAMENTALS",
    description: "Understand what Artificial Intelligence actually is, how AI systems work, differences between AI/ML/DL, training vs inference, and problem classification.",
    learningOutcomes: [
      "Distinguish Artificial Intelligence, Machine Learning, and Deep Learning.",
      "Explain the exact difference between Training and Inference.",
      "Classify AI problems into prediction, classification, generation, and decision support."
    ],
    prerequisites: ["FOUNDATION"],
    lessons: [
      {
        id: "ai-1", order: 3, module: "AI FUNDAMENTALS", moduleNumber: "02",
        title: "What is Artificial Intelligence?", duration: "30 min", level: "Foundation",
        summary: "Separate media hype from engineering reality by defining AI as software performing tasks associated with intelligence.",
        why: "To build effective AI systems, you must know what AI can and cannot guarantee.",
        openingProblem: "When an email app filters spam or a phone recognizes a face, is the software 'thinking'?",
        curiosity: "Why are systems that sounded like science fiction 20 years ago now considered ordinary automation?",
        priorKnowledge: "You know how computer scripts execute rules.",
        objectives: ["Define Artificial Intelligence accurately", "Identify AI capability boundaries", "Differentiate rule-based AI from pattern-based AI"],
        concepts: [
          { term: "Artificial Intelligence", definition: "A broad field of computer science creating systems that perform tasks associated with human intelligence." },
          { term: "Pattern Recognition", definition: "Detecting statistical regularities in visual, audio, text, or numerical data." }
        ],
        diagram: "mindmap", mindMap: ["Artificial Intelligence", "Rule-Based Expert Systems", "Machine Learning", "Deep Learning"],
        commonErrors: ["Equating AI with human-like consciousness.", "Assuming AI outputs are guaranteed to be 100% correct."],
        code: {
          language: "text",
          code: `Traditional Software: Data + Rules  ==> Output
Machine Learning:    Data + Output ==> Learned Rules (Parameters)
Inference Stage:     New Data + Learned Parameters ==> Prediction`,
          notes: ["Traditional coding writes the rules manually.", "Machine learning infers parameters from examples."]
        },
        practice: {
          prompt: "Classify three systems (Calculator, Spam Filter, Chatbot) as rule-based, learned, or hybrid.",
          checkpoints: ["State input and output for each", "Identify whether data is used for training", "Explain failure modes"]
        },
        realWorldApplications: [{ title: "Spam Detection", description: "Learns statistical probability of spam words from millions of reported emails." }],
        teachBackPrompt: "Explain AI to a non-technical friend without using marketing buzzwords.",
        prerequisites: ["Python Fundamentals"]
      },
      {
        id: "ai-2", order: 4, module: "AI FUNDAMENTALS", moduleNumber: "02",
        title: "AI vs ML vs Deep Learning", duration: "30 min", level: "Foundation",
        summary: "Master the nested hierarchy of AI, Machine Learning, Deep Learning, and Generative AI.",
        why: "Correct technical vocabulary prevents picking the wrong architecture for a problem.",
        openingProblem: "Are ChatGPT, linear regression, and spam filters all the same thing?",
        curiosity: "Why did Deep Learning suddenly outperform classical ML around 2012?",
        priorKnowledge: "You know what AI is in high-level terms.",
        objectives: ["Map the nested set diagram of AI/ML/DL/GenAI", "Explain when to use classical ML vs Deep Learning"],
        concepts: [
          { term: "Machine Learning", definition: "Subfield of AI where algorithms adjust parameters using data examples." },
          { term: "Deep Learning", definition: "Subfield of ML using multi-layer artificial neural networks." },
          { term: "Generative AI", definition: "Deep learning models specialized in generating new text, images, audio, or code." }
        ],
        diagram: "neural", mindMap: ["AI (Broad Umbrella)", "ML (Data-driven)", "Deep Learning (Neural Nets)", "Generative AI (Transformers/Diffusion)"],
        commonErrors: ["Using a heavy Deep Learning model when a simple Linear Regression is faster and more accurate."],
        practice: {
          prompt: "Draw or describe the nested relationship between AI, ML, Deep Learning, and Generative AI.",
          checkpoints: ["Identify which contains which", "Provide one real-world example for each layer"]
        },
        realWorldApplications: [{ title: "Medical Imaging", description: "Deep learning detects tumors in X-rays; classical ML predicts hospital readmission risk." }],
        teachBackPrompt: "Explain why Deep Learning requires more data than classical Machine Learning.",
        prerequisites: ["What is Artificial Intelligence?"]
      }
    ]
  },

  // ---------------------------------------------------------
  // MODULE 3: MACHINE LEARNING FOUNDATIONS
  // ---------------------------------------------------------
  {
    id: "ml-foundations",
    number: "03",
    title: "MACHINE LEARNING FOUNDATIONS",
    description: "Learn data representation, features and targets, train/test splits, generalization, and the complete ML workflow.",
    learningOutcomes: [
      "Formulate supervised problems into features ($X$) and targets ($y$).",
      "Explain generalization gap and overfitting.",
      "Execute the complete end-to-end Machine Learning workflow."
    ],
    prerequisites: ["AI FUNDAMENTALS"],
    lessons: [
      {
        id: "mlf-1", order: 5, module: "MACHINE LEARNING FOUNDATIONS", moduleNumber: "03",
        title: "Features and Targets", duration: "35 min", level: "Core",
        summary: "Learn how to structure data into feature matrices ($X$) and target vectors ($y$).",
        why: "Machine learning algorithms accept structured matrices, not raw unstructured thoughts.",
        openingProblem: "How do we convert a house listing (3 bedrooms, 1200 sqft, built 2010, price $400k) into mathematical inputs for a model?",
        curiosity: "What happens if a crucial feature is missing from your dataset?",
        priorKnowledge: "You understand Python variables and basic data types.",
        objectives: ["Extract feature vectors $X$", "Identify target variable $y$", "Distinguish continuous targets from categorical targets"],
        concepts: [
          { term: "Feature Vector (X)", definition: "Numerical inputs representing measured attributes of an observation." },
          { term: "Target (y)", definition: "The ground-truth output or value the model is trained to predict." }
        ],
        diagram: "data", mindMap: ["Raw Data", "Feature Matrix X", "Target Vector y", "Model Training"],
        commonErrors: ["Including the target variable inside the feature matrix (Data Leakage)."],
        mathematics: {
          introduction: "A dataset with $n$ samples and $d$ features is represented as a matrix $\\mathbf{X}$ and vector $\\mathbf{y}$:",
          formulas: [
            {
              title: "Feature Matrix & Target Vector",
              expression: "\\mathbf{X} \\in \\mathbb{R}^{n \\times d}, \\quad \\mathbf{y} \\in \\mathbb{R}^{n}",
              explanation: "$\\\\mathbf{X}$ has $n$ rows (samples) and $d$ columns (features). $\\\\mathbf{y}$ has $n$ target values.",
              symbolBreakdown: [
                { symbol: "n", meaning: "Number of data samples (rows)" },
                { symbol: "d", meaning: "Number of input features (columns)" },
                { symbol: "X", meaning: "Feature matrix" },
                { symbol: "y", meaning: "Target vector" }
              ]
            }
          ]
        },
        numerical: {
          introduction: "Given 2 house listings:",
          steps: [
            { step: "House 1", calculation: "X_1 = [1200, 3, 2010], y_1 = 400000", explanation: "Size=1200, Beds=3, Year=2010" },
            { step: "House 2", calculation: "X_2 = [1800, 4, 2015], y_2 = 550000", explanation: "Size=1800, Beds=4, Year=2015" },
            { step: "Matrix X Shape", calculation: "(2, 3)", explanation: "2 samples, 3 features" }
          ]
        },
        code: {
          language: "python",
          code: `import numpy as np

# Feature matrix X: [size_sqft, bedrooms, age_years]
X = np.array([
    [1200, 3, 14],
    [1800, 4, 9],
    [950,  2, 25]
])

# Target vector y: price in $k
y = np.array([400, 550, 280])

print("X shape:", X.shape)  # (3, 3)
print("y shape:", y.shape)  # (3,)`,
          notes: [
            "Line 4: Rows represent individual houses.",
            "Line 11: Target vector y contains corresponding prices.",
            "Line 13: Shapes must align along dimension 0."
          ]
        },
        practice: {
          prompt: "For a student performance dataset (study_hours, attendance_pct, sleep_hours, final_score), identify X and y.",
          checkpoints: ["List features in X", "Identify target y", "State shape of X for 100 students"]
        },
        realWorldApplications: [{ title: "Credit Scoring", description: "Features: income, debt, payment history; Target: credit risk score or default." }],
        teachBackPrompt: "Explain what features and targets are using a car pricing example.",
        prerequisites: ["Python Fundamentals"]
      }
    ]
  },

  // ---------------------------------------------------------
  // MODULE 4: MATHEMATICS FOR MACHINE LEARNING
  // ---------------------------------------------------------
  {
    id: "math-for-ml",
    number: "04",
    title: "MATHEMATICS FOR MACHINE LEARNING",
    description: "Master essential Linear Algebra, Calculus, Probability, Statistics, and Optimization needed to understand ML algorithms.",
    learningOutcomes: [
      "Compute dot products, vector norms, and matrix multiplications.",
      "Calculate derivatives using the Power Rule and Chain Rule.",
      "Understand gradient vectors and how Gradient Descent minimizes loss."
    ],
    prerequisites: ["FOUNDATION"],
    lessons: [
      {
        id: "math-lin-alg", order: 6, module: "MATHEMATICS FOR MACHINE LEARNING", moduleNumber: "04",
        title: "Linear Algebra & Vectors", duration: "40 min", level: "Core",
        summary: "Understand vectors, matrices, dot products, and linear combinations.",
        why: "All model predictions $\\hat{y} = \\mathbf{w}^T \\mathbf{x} + b$ are vectorized dot products.",
        openingProblem: "How do you multiply 50 feature values by 50 weight parameters in a single instant?",
        curiosity: "Why are GPUs so much faster at machine learning than standard CPUs?",
        priorKnowledge: "You know how features are organized in matrices.",
        objectives: ["Compute vector dot products", "Perform matrix-vector multiplication", "Interpret geometric dot product"],
        concepts: [
          { term: "Vector Dot Product", definition: "Sum of element-wise products of two vectors: $\\mathbf{a} \\cdot \\mathbf{b} = \\sum a_i b_i$." },
          { term: "Weight Vector (w)", definition: "Learned parameters indicating the importance of each feature." }
        ],
        diagram: "matrix", mindMap: ["Vector", "Matrix", "Dot Product", "Weighted Sum"],
        mathematics: {
          introduction: "The linear prediction model combines features $\\mathbf{x}$ and weights $\\mathbf{w}$:",
          formulas: [
            {
              title: "Linear Prediction Formula",
              expression: "\\hat{y} = \\mathbf{w}^T \\mathbf{x} + b = \\sum_{i=1}^{d} w_i x_i + b",
              explanation: "Multiply each feature $x_i$ by weight $w_i$, sum them up, and add bias $b$.",
              symbolBreakdown: [
                { symbol: "\\hat{y}", meaning: "Predicted target value" },
                { symbol: "w_i", meaning: "Weight (importance) of feature i" },
                { symbol: "x_i", meaning: "Value of feature i" },
                { symbol: "b", meaning: "Bias (intercept / baseline offset)" }
              ]
            }
          ]
        },
        derivation: {
          introduction: "Expanding the vector dot product $\\mathbf{w}^T \\mathbf{x}$ for $d=3$ features:",
          steps: [
            { title: "Define Vectors", expression: "\\mathbf{w} = [w_1, w_2, w_3]^T, \\quad \\mathbf{x} = [x_1, x_2, x_3]^T", explanation: "Column vectors of length 3." },
            { title: "Transpose & Multiply", expression: "\\mathbf{w}^T \\mathbf{x} = [w_1, w_2, w_3] \\begin{bmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{bmatrix}", explanation: "Row vector times column vector." },
            { title: "Sum Products", expression: "\\mathbf{w}^T \\mathbf{x} = w_1 x_1 + w_2 x_2 + w_3 x_3", explanation: "Final scalar weighted sum." }
          ]
        },
        numerical: {
          introduction: "Calculate prediction $\\hat{y}$ for a house with size $x_1=1500$, bedrooms $x_2=3$, with weights $w_1=0.2$, $w_2=10$, bias $b=50$:",
          steps: [
            { step: "Multiply Feature 1", calculation: "w_1 \\cdot x_1 = 0.2 \\times 1500 = 300", explanation: "Size contribution = $300k" },
            { step: "Multiply Feature 2", calculation: "w_2 \\cdot x_2 = 10 \\times 3 = 30", explanation: "Bedrooms contribution = $30k" },
            { step: "Add Bias", calculation: "300 + 30 + 50 = 380", explanation: "Base price offset = $50k" },
            { step: "Final Prediction", calculation: "\\hat{y} = 380", explanation: "Predicted house price: $380,000" }
          ]
        },
        algorithm: {
          introduction: "Dot product calculation algorithm:",
          steps: [
            { step: 1, title: "Initialize", description: "Set `total = 0.0`." },
            { step: 2, title: "Loop", description: "For index `i` from 0 to `d-1`, calculate `product = w[i] * x[i]`." },
            { step: 3, title: "Accumulate", description: "Add `product` to `total`." },
            { step: 4, title: "Add Bias", description: "Return `total + b`." }
          ]
        },
        code: {
          language: "python",
          code: `import numpy as np

# Weights: [price_per_sqft_k, price_per_bedroom_k]
w = np.array([0.2, 10.0])
# Features: [sqft, bedrooms]
x = np.array([1500, 3])
b = 50.0

# Vectorized dot product
y_hat = np.dot(w, x) + b
print("Predicted Price ($k):", y_hat)  # 380.0`,
          notes: [
            "Line 9: `np.dot(w, x)` computes sum(w_i * x_i) in C-speed parallelism."
          ]
        },
        debugging: [
          {
            symptom: "ValueError: shapes (3,) and (2,) not aligned",
            possibleCause: "Weight vector has 3 elements but feature vector has only 2.",
            howToCheck: "Print `w.shape` and `x.shape`.",
            fix: "Ensure length of weights equals number of features."
          }
        ],
        practice: {
          prompt: "Compute dot product of w = [0.5, -1.0, 2.0] and x = [4.0, 2.0, 1.0] with bias b = 0.0 by hand and code.",
          checkpoints: ["Hand calculation: (0.5*4) + (-1*2) + (2*1)", "Verify total is 2.0", "Write NumPy code"]
        },
        realWorldApplications: [{ title: "Recommendation Engines", description: "User preference vector dot product item feature vector calculates similarity score." }],
        teachBackPrompt: "Explain what slope $w$ and intercept $b$ mean in the prediction equation $y = wx + b$.",
        prerequisites: ["Features and Targets"]
      }
    ]
  },

  // ---------------------------------------------------------
  // MODULE 5: SUPERVISED LEARNING
  // ---------------------------------------------------------
  {
    id: "supervised-learning",
    number: "05",
    title: "SUPERVISED LEARNING",
    description: "Deep dive into Linear Regression, Loss Functions, Gradient Descent, Logistic Regression, k-NN, Decision Trees, and Ensembles.",
    learningOutcomes: [
      "Understand Linear & Logistic Regression from math derivation to Python code.",
      "Derive Mean Squared Error loss and Gradient Descent parameter updates.",
      "Implement classification algorithms and decision trees."
    ],
    prerequisites: ["MATHEMATICS FOR MACHINE LEARNING"],
    lessons: [
      {
        id: "sup-1", order: 7, module: "SUPERVISED LEARNING", moduleNumber: "05",
        title: "Linear Regression & Gradient Descent", duration: "50 min", level: "Core",
        summary: "Learn Linear Regression, MSE Loss derivation, and Gradient Descent optimization from scratch.",
        why: "Linear Regression + Gradient Descent is the foundational optimization pattern used throughout machine learning and deep learning.",
        openingProblem: "If you have 100 historical house prices, how do you find the exact slope $w$ and intercept $b$ that minimizes overall prediction error?",
        curiosity: "Why can't we just guess weights randomly until we find good ones?",
        priorKnowledge: "You know the linear prediction formula $\\hat{y} = wx + b$ and vector dot products.",
        objectives: [
          "Define Mean Squared Error (MSE) loss function",
          "Derive partial derivatives $\\frac{\\partial L}{\\partial w}$ and $\\frac{\\partial L}{\\partial b}$",
          "Implement Gradient Descent update rule $w \\leftarrow w - \\alpha \\frac{\\partial L}{\\partial w}$"
        ],
        concepts: [
          { term: "Linear Regression", definition: "Algorithm that models the target as a linear combination of features." },
          { term: "Mean Squared Error (MSE)", definition: "Loss function averaging squared differences between predictions and actual targets." },
          { term: "Gradient Descent", definition: "Optimization algorithm that iteratively steps parameters in the opposite direction of the loss gradient." },
          { term: "Learning Rate (alpha)", definition: "Hyperparameter controlling the step size of each gradient update." }
        ],
        diagram: "gradient", mindMap: ["Input Data", "Prediction y_hat = wx + b", "Calculate MSE Loss", "Compute Gradients", "Update w and b"],
        commonErrors: [
          "Setting learning rate $\\alpha$ too large, causing loss to explode to infinity.",
          "Forgetting to divide by sample count $n$ when computing gradients."
        ],
        mathematics: {
          introduction: "Linear Regression uses Mean Squared Error (MSE) loss $L(w, b)$:",
          formulas: [
            {
              title: "Prediction Equation",
              expression: "\\hat{y}_i = w x_i + b",
              explanation: "Predicted output for sample i.",
              symbolBreakdown: [
                { symbol: "\\hat{y}_i", meaning: "Predicted target for sample i" },
                { symbol: "w", meaning: "Weight (slope parameter)" },
                { symbol: "x_i", meaning: "Feature input for sample i" },
                { symbol: "b", meaning: "Bias (intercept parameter)" }
              ]
            },
            {
              title: "Mean Squared Error Loss",
              expression: "L(w, b) = \\frac{1}{n} \\sum_{i=1}^{n} (\\hat{y}_i - y_i)^2",
              explanation: "Averages squared residuals across all n training samples.",
              symbolBreakdown: [
                { symbol: "L(w, b)", meaning: "Total loss value" },
                { symbol: "n", meaning: "Number of training samples" },
                { symbol: "y_i", meaning: "Actual ground-truth target for sample i" }
              ]
            },
            {
              title: "Gradient Descent Update Rules",
              expression: "w \\leftarrow w - \\alpha \\frac{\\partial L}{\\partial w}, \\quad b \\leftarrow b - \\alpha \\frac{\\partial L}{\\partial b}",
              explanation: "Subtract learning rate times gradient to move downhill toward minimum loss.",
              symbolBreakdown: [
                { symbol: "\\alpha", meaning: "Learning rate (step size hyperparameter)" },
                { symbol: "\\frac{\\partial L}{\\partial w}", meaning: "Gradient of loss with respect to weight w" }
              ]
            }
          ]
        },
        derivation: {
          introduction: "Deriving partial derivative $\\frac{\\partial L}{\\partial w}$ using the Chain Rule:",
          steps: [
            {
              title: "Step 1: Write Loss Function",
              expression: "L = \\frac{1}{n} \\sum_{i=1}^{n} (w x_i + b - y_i)^2",
              explanation: "Substitute prediction formula $\\hat{y}_i = w x_i + b$ into MSE."
            },
            {
              title: "Step 2: Apply Chain Rule",
              expression: "\\frac{\\partial L}{\\partial w} = \\frac{1}{n} \\sum_{i=1}^{n} 2(w x_i + b - y_i) \\cdot \\frac{\\partial}{\\partial w}(w x_i + b - y_i)",
              explanation: "Derivative of $u^2$ is $2u \\cdot u'$."
            },
            {
              title: "Step 3: Inner Derivative",
              expression: "\\frac{\\partial}{\\partial w}(w x_i + b - y_i) = x_i",
              explanation: "Derivative of $w x_i$ with respect to $w$ is $x_i$."
            },
            {
              title: "Step 4: Final Weight Gradient",
              expression: "\\frac{\\partial L}{\\partial w} = \\frac{2}{n} \\sum_{i=1}^{n} (\\hat{y}_i - y_i) x_i",
              explanation: "Gradient is the average error times input feature $x_i$."
            },
            {
              title: "Step 5: Final Bias Gradient",
              expression: "\\frac{\\partial L}{\\partial b} = \\frac{2}{n} \\sum_{i=1}^{n} (\\hat{y}_i - y_i)",
              explanation: "Bias gradient is simply the average error."
            }
          ]
        },
        numerical: {
          introduction: "Worked example with 1 sample: $x=2, y=5$. Initial $w=0, b=0, \\alpha=0.1$:",
          steps: [
            { step: "Predict", calculation: "\\hat{y} = (0)(2) + 0 = 0", explanation: "Initial prediction is 0." },
            { step: "Error", calculation: "\\hat{y} - y = 0 - 5 = -5", explanation: "Prediction is 5 units too low." },
            { step: "Weight Gradient", calculation: "2 \\times (-5) \\times 2 = -20", explanation: "Gradient w = -20" },
            { step: "Bias Gradient", calculation: "2 \\times (-5) = -10", explanation: "Gradient b = -10" },
            { step: "Update Weight", calculation: "w_{new} = 0 - (0.1 \\times -20) = 2.0", explanation: "New weight w = 2.0" },
            { step: "Update Bias", calculation: "b_{new} = 0 - (0.1 \\times -10) = 1.0", explanation: "New bias b = 1.0" },
            { step: "New Prediction", calculation: "\\hat{y}_{new} = (2.0)(2) + 1.0 = 5.0", explanation: "Prediction perfectly matches target 5.0!" }
          ]
        },
        algorithm: {
          introduction: "Linear Regression Gradient Descent Training Loop:",
          steps: [
            { step: 1, title: "Initialize", description: "Initialize parameters $w=0, b=0$, set learning rate $\\alpha$ and epochs." },
            { step: 2, title: "Forward Pass", description: "Compute predictions $\\hat{y} = w X + b$ for all samples." },
            { step: 3, title: "Compute Loss", description: "Calculate $MSE = \\frac{1}{n} \\sum (\\hat{y} - y)^2$." },
            { step: 4, title: "Compute Gradients", description: "Calculate $dw = \\frac{2}{n} X^T (\\hat{y} - y)$ and $db = \\frac{2}{n} \\sum (\\hat{y} - y)$." },
            { step: 5, title: "Update Parameters", description: "Update $w \\leftarrow w - \\alpha dw$ and $b \\leftarrow b - \\alpha db$." },
            { step: 6, title: "Repeat", description: "Repeat steps 2–5 for specified epochs until loss converges." }
          ]
        },
        code: {
          language: "python",
          code: `import numpy as np

# Synthetic Data: y = 2x + 1
X = np.array([1.0, 2.0, 3.0, 4.0])
y = np.array([3.0, 5.0, 7.0, 9.0])

# Initialize parameters
w = 0.0
b = 0.0
alpha = 0.05
epochs = 200
n = len(X)

# Training loop
for epoch in range(epochs):
    # 1. Forward Pass (Prediction)
    y_hat = w * X + b
    
    # 2. Compute MSE Loss
    loss = np.mean((y_hat - y) ** 2)
    
    # 3. Compute Gradients
    dw = (2 / n) * np.sum((y_hat - y) * X)
    db = (2 / n) * np.sum(y_hat - y)
    
    # 4. Update Parameters
    w -= alpha * dw
    b -= alpha * db

print(f"Trained Weight w: {w:.4f} (Expected ~2.0)")
print(f"Trained Bias b:   {b:.4f} (Expected ~1.0)")`,
          notes: [
            "Line 17: Prediction vector y_hat computed across all samples.",
            "Line 20: MSE loss calculated as average squared error.",
            "Lines 23-24: Exact vectorized partial derivatives.",
            "Lines 27-28: Parameter updates using gradient descent."
          ]
        },
        debugging: [
          {
            symptom: "Loss becomes `nan` or `inf` during training.",
            possibleCause: "Learning rate $\\alpha$ is too high, causing gradient updates to overshoot and explode.",
            howToCheck: "Print loss values during early epochs.",
            fix: "Reduce learning rate by 10x (e.g. from 0.5 to 0.01)."
          }
        ],
        practice: {
          prompt: "Run 1 gradient update step by hand for x=1, y=3 with w=0, b=0, alpha=0.1.",
          checkpoints: ["Calculate y_hat = 0", "Calculate dw = 2(0-3)(1) = -6", "Calculate new w = 0.6"]
        },
        realWorldApplications: [{ title: "House Price Estimation", description: "Zillow and real estate platforms predict property values using regression features." }],
        teachBackPrompt: "Explain why we square errors in MSE and how Gradient Descent steps down the loss curve.",
        prerequisites: ["Linear Algebra & Vectors"]
      }
    ]
  },

  // ---------------------------------------------------------
  // MODULE 6: UNSUPERVISED LEARNING
  // ---------------------------------------------------------
  {
    id: "unsupervised-learning",
    number: "06",
    title: "UNSUPERVISED LEARNING",
    description: "Explore clustering algorithms ($K$-Means, Hierarchical, DBSCAN) and dimensionality reduction (PCA).",
    learningOutcomes: [
      "Group data without target labels using $K$-Means clustering.",
      "Understand distance metrics and centroid updates.",
      "Compress feature spaces using Principal Component Analysis (PCA)."
    ],
    prerequisites: ["SUPERVISED LEARNING"],
    lessons: [
      {
        id: "unsup-1", order: 8, module: "UNSUPERVISED LEARNING", moduleNumber: "06",
        title: "Clustering & K-Means", duration: "45 min", level: "Core",
        summary: "Learn how $K$-Means clusters unlabeled data points around centroid seeds.",
        why: "Most real-world data lacks labels. Clustering discovers natural groupings.",
        openingProblem: "Given 100,000 customer shopping histories with no labels, how do you discover natural customer segments?",
        curiosity: "How does the algorithm decide where cluster centers should be located?",
        priorKnowledge: "You understand distance metrics and vector features.",
        objectives: ["Explain $K$-Means algorithm loop", "Compute Euclidean distance", "Update centroids"],
        concepts: [
          { term: "Clustering", definition: "Unsupervised task of partitioning data into groups based on similarity." },
          { term: "Centroid", definition: "The mean position of all data points belonging to a cluster." }
        ],
        diagram: "flow", mindMap: ["Unlabeled Data", "Initialize K Centroids", "Assign Points to Nearest Centroid", "Update Centroids to Mean", "Repeat until Convergence"],
        code: {
          language: "python",
          code: `from sklearn.cluster import KMeans
import numpy as np

X = np.array([[1, 2], [1, 4], [1, 0], [10, 2], [10, 4], [10, 0]])
kmeans = KMeans(n_clusters=2, random_state=42).fit(X)

print("Cluster Labels:", kmeans.labels_)
print("Centroids:\n", kmeans.cluster_centers_)`,
          notes: ["Line 5: K-Means partitions data into 2 distinct clusters."]
        },
        practice: {
          prompt: "Describe how K-Means selects new centroid positions in iteration 2.",
          checkpoints: ["Calculate mean X coordinate of cluster points", "Calculate mean Y coordinate", "Update centroid"]
        },
        realWorldApplications: [{ title: "Customer Segmentation", description: "E-commerce apps group users by buying patterns to target promotions." }],
        teachBackPrompt: "Explain K-Means clustering using a grouping students into study tables analogy.",
        prerequisites: ["Linear Regression & Gradient Descent"]
      }
    ]
  },

  // ---------------------------------------------------------
  // MODULE 7: MODEL EVALUATION
  // ---------------------------------------------------------
  {
    id: "model-evaluation",
    number: "07",
    title: "MODEL EVALUATION",
    description: "Master cross-validation, bias-variance trade-offs, overfitting, underfitting, confusion matrices, precision, recall, and F1-score.",
    learningOutcomes: [
      "Evaluate classification models using Precision, Recall, and F1-Score.",
      "Diagnose underfitting vs overfitting from loss curves.",
      "Implement $K$-Fold Cross Validation."
    ],
    prerequisites: ["SUPERVISED LEARNING"],
    lessons: [
      {
        id: "eval-1", order: 9, module: "MODEL EVALUATION", moduleNumber: "07",
        title: "Confusion Matrix & Metrics", duration: "45 min", level: "Core",
        summary: "Understand TP, FP, TN, FN, Precision, Recall, and F1-Score.",
        why: "Accuracy fails on imbalanced datasets. Precision and Recall evaluate real-world trade-offs.",
        openingProblem: "Why is 99% accuracy useless if 99% of transactions are legitimate and 1% are fraudulent?",
        curiosity: "Which is worse: diagnosing a healthy person as sick, or letting a sick person go home?",
        priorKnowledge: "You know classification models predict probability scores.",
        objectives: ["Construct a Confusion Matrix", "Calculate Precision, Recall, and F1-Score", "Select thresholds based on domain risk"],
        concepts: [
          { term: "True Positive (TP)", definition: "Model correctly predicted Positive class." },
          { term: "False Positive (FP)", definition: "Model incorrectly predicted Positive class (False Alarm)." },
          { term: "False Negative (FN)", definition: "Model incorrectly predicted Negative class (Missed Detection)." },
          { term: "Precision", definition: "$\\frac{TP}{TP + FP}$ — Out of all predicted positives, how many were right?" },
          { term: "Recall", definition: "$\\frac{TP}{TP + FN}$ — Out of all actual positives, how many did we catch?" }
        ],
        diagram: "flow", mindMap: ["Confusion Matrix", "True Positives", "False Positives", "Precision", "Recall", "F1 Score"],
        mathematics: {
          introduction: "Classification evaluation metrics:",
          formulas: [
            { title: "Precision", expression: "\\text{Precision} = \\frac{TP}{TP + FP}", explanation: "Accuracy of positive predictions." },
            { title: "Recall", expression: "\\text{Recall} = \\frac{TP}{TP + FN}", explanation: "Coverage of actual positive cases." },
            { title: "F1 Score", expression: "\\text{F1} = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}", explanation: "Harmonic mean of Precision and Recall." }
          ]
        },
        code: {
          language: "python",
          code: `from sklearn.metrics import classification_report, confusion_matrix

y_true = [1, 0, 1, 1, 0, 1, 0, 0]
y_pred = [1, 0, 1, 0, 0, 1, 1, 0]

print(confusion_matrix(y_true, y_pred))
print(classification_report(y_true, y_pred))`,
          notes: ["Line 6: Outputs TP, FP, TN, FN matrix.", "Line 7: Reports Precision, Recall, F1."]
        },
        practice: {
          prompt: "Given TP=80, FP=20, FN=10, TN=890, calculate Precision and Recall.",
          checkpoints: ["Precision = 80 / (80+20) = 0.80", "Recall = 80 / (80+10) = 0.888", "Calculate F1 score"]
        },
        realWorldApplications: [{ title: "Cancer Detection", description: "Medical screening prioritizes high Recall to ensure no tumor is missed." }],
        teachBackPrompt: "Explain Precision and Recall using a fishing net analogy.",
        prerequisites: ["Linear Regression & Gradient Descent"]
      }
    ]
  },

  // ---------------------------------------------------------
  // MODULE 8: DEEP LEARNING
  // ---------------------------------------------------------
  {
    id: "deep-learning",
    number: "08",
    title: "DEEP LEARNING",
    description: "Understand artificial neural networks, forward propagation, backpropagation, CNNs, RNNs, and Transformers.",
    learningOutcomes: [
      "Understand multi-layer neural networks from single neurons to deep architectures.",
      "Derive backpropagation with the Calculus Chain Rule.",
      "Build Convolutional Neural Networks and Transformer Attention mechanisms."
    ],
    prerequisites: ["MATHEMATICS FOR MACHINE LEARNING"],
    lessons: [
      {
        id: "dl-1", order: 10, module: "DEEP LEARNING", moduleNumber: "08",
        title: "Neural Networks & Backpropagation", duration: "60 min", level: "Advanced",
        summary: "Build deep neural networks, forward pass, activation functions, and backpropagation.",
        why: "Deep learning powers modern vision, speech, language, and generative models.",
        openingProblem: "How do networks with millions of parameters learn complex features automatically?",
        curiosity: "What makes deep networks superior to single-layer models?",
        priorKnowledge: "You know linear algebra, dot products, and basic gradient descent.",
        objectives: ["Understand multi-layer perceptron architecture", "Trace forward pass matrix multiplication", "Understand backpropagation chain rule"],
        concepts: [
          { term: "Hidden Layer", definition: "Intermediate layer of neurons learning latent representations." },
          { term: "Backpropagation", definition: "Calculating gradients of loss with respect to all weights using the chain rule." }
        ],
        diagram: "neural", mindMap: ["Input Layer", "Hidden Layers (ReLU)", "Output Layer (Softmax)", "Backpropagation (Chain Rule)", "Optimizer Update"],
        code: {
          language: "python",
          code: `import torch
import torch.nn as nn

# Simple PyTorch Neural Network
class MultiLayerPerceptron(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(10, 32)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(32, 1)

    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        return self.fc2(x)

model = MultiLayerPerceptron()
print(model)`,
          notes: ["Line 8: Input 10 -> Hidden 32", "Line 9: Non-linear ReLU activation", "Line 10: Hidden 32 -> Output 1"]
        },
        practice: {
          prompt: "Write a PyTorch network with 2 hidden layers (64 and 32 neurons) using ReLU.",
          checkpoints: ["Define `fc1`, `fc2`, `fc3`", "Apply ReLU after fc1 and fc2", "Return final output"]
        },
        realWorldApplications: [{ title: "Speech Recognition", description: "Siri and Google Assistant use deep neural networks to convert audio signals to text." }],
        teachBackPrompt: "Explain how information flows forward and gradients flow backward in a deep neural network.",
        prerequisites: ["Linear Regression & Gradient Descent"]
      }
    ]
  },

  // ---------------------------------------------------------
  // MODULE 9: REAL-WORLD MACHINE LEARNING
  // ---------------------------------------------------------
  {
    id: "real-world-ml",
    number: "09",
    title: "REAL-WORLD MACHINE LEARNING",
    description: "Learn data collection, cleaning, feature engineering, hyperparameter tuning, model deployment, and monitoring.",
    learningOutcomes: [
      "Package models into clean production project layouts.",
      "Build deployment REST APIs.",
      "Monitor data drift and model performance decay in production."
    ],
    prerequisites: ["MODEL EVALUATION"],
    lessons: [
      {
        id: "rw-1", order: 11, module: "REAL-WORLD MACHINE LEARNING", moduleNumber: "09",
        title: "Deployment & Monitoring", duration: "50 min", level: "Applied",
        summary: "Turn models into live REST APIs, handle data drift, and build monitoring pipelines.",
        why: "A model in a notebook creates zero business value until deployed and monitored.",
        openingProblem: "What happens when a model deployed to production starts receiving unexpected data?",
        curiosity: "Why do models degrade over time even if the code never changes?",
        priorKnowledge: "You know python scripts and model evaluation metrics.",
        objectives: ["Deploy models via API endpoints", "Detect Data Drift and Concept Drift", "Build logging pipelines"],
        concepts: [
          { term: "Data Drift", definition: "Shift in input feature distribution $P(X)$ over time." },
          { term: "Concept Drift", definition: "Shift in the target relationship mapping $P(y|X)$ over time." }
        ],
        diagram: "mlops", mindMap: ["Deploy API", "Validate Input Data", "Compute Inference", "Log Metrics", "Detect Data Drift"],
        code: {
          language: "python",
          code: `# Production inference handler pattern
def predict_endpoint(input_json, model, scaler):
    # 1. Validate input schema
    if "sqft" not in input_json:
        return {"error": "Missing sqft field"}, 400
    
    # 2. Preprocess using training scaler
    features = scaler.transform([[input_json["sqft"], input_json["beds"]]])
    
    # 3. Model inference
    prediction = model.predict(features)[0]
    
    return {"prediction": float(prediction)}, 200`,
          notes: ["Line 4: Validates request boundary", "Line 8: Uses training scaler to maintain preprocessing parity"]
        },
        practice: {
          prompt: "Write a validation function checking that input age is between 0 and 120 before model inference.",
          checkpoints: ["Check type", "Check numerical range", "Return descriptive error if invalid"]
        },
        realWorldApplications: [{ title: "Fraud Monitoring", description: "Banks monitor live credit transaction feature distributions to detect emerging fraud patterns." }],
        teachBackPrompt: "Explain the difference between Data Drift and Concept Drift with an e-commerce example.",
        prerequisites: ["Neural Networks & Backpropagation"]
      }
    ]
  },

  // ---------------------------------------------------------
  // MODULE 10: PROJECTS AND PRACTICE
  // ---------------------------------------------------------
  {
    id: "projects-and-practice",
    number: "10",
    title: "PROJECTS AND PRACTICE",
    description: "Apply your knowledge across guided projects, mini challenges, debugging challenges, case studies, and capstone projects.",
    learningOutcomes: [
      "Build end-to-end Machine Learning pipelines from scratch.",
      "Debug broken ML pipelines and fix data leakage bugs.",
      "Complete a production-ready Capstone project."
    ],
    prerequisites: ["REAL-WORLD MACHINE LEARNING"],
    lessons: [
      {
        id: "proj-1", order: 12, module: "PROJECTS AND PRACTICE", moduleNumber: "10",
        title: "End-to-End Capstone Project", duration: "90 min", level: "Advanced",
        summary: "Build an end-to-end AI project from specification and baseline to deployment and auditing.",
        why: "Integrating all skills into a complete project is how you become an AI engineer.",
        openingProblem: "How do you take a real business problem statement and build a complete, verifiable AI product?",
        curiosity: "How do senior engineers evaluate whether an AI project is ready for launch?",
        priorKnowledge: "All previous modules in this curriculum.",
        objectives: ["Formulate project specification", "Build baseline and candidate models", "Perform ablation study", "Document limitations and release"],
        concepts: [
          { term: "Capstone Project", definition: "An integrated project demonstrating complete mastery of the ML lifecycle." },
          { term: "Ablation Study", definition: "Removing individual components to measure their exact performance contribution." }
        ],
        diagram: "pipeline", mindMap: ["Problem Spec", "Data Pipeline", "Baseline Model", "Candidate Models", "Evaluation & Ablation", "Deployment API"],
        code: {
          language: "python",
          code: `# Complete Capstone Execution Pipeline
def run_capstone_pipeline(data_path):
    print("1. Loading & Validating Data...")
    print("2. Feature Engineering & Preprocessing...")
    print("3. Training Baseline vs Candidate Models...")
    print("4. Evaluating Metrics (Precision, Recall, F1)...")
    print("5. Packaging Model Artifacts for API Serving...")
    return True

run_capstone_pipeline("dataset.csv")`,
          notes: ["Orchestrates data, preprocessing, training, evaluation, and packaging."]
        },
        practice: {
          prompt: "Write a Capstone project proposal outlining problem, data source, baseline, model, and metrics.",
          checkpoints: ["Define business outcome", "Specify feature inputs and targets", "Choose baseline and evaluation metrics"]
        },
        realWorldApplications: [{ title: "Enterprise AI Launch", description: "Deploying a customer churn prediction pipeline with automated monitoring." }],
        teachBackPrompt: "Summarize your end-to-end Capstone architecture from data collection to live monitoring.",
        prerequisites: ["Deployment & Monitoring"]
      }
    ]
  }
];

export const academyLessons = academyModules
  .flatMap((module) => module.lessons)
  .sort((a, b) => a.order - b.order);

export type AcademyTopic = {
  id: string;
  title: string;
  summary: string;
  trackNumber: string;
  trackTitle: string;
  concepts: string[];
  lessonOrder: number;
};

export const allAcademyTopics: AcademyTopic[] = academyModules.flatMap((module) =>
  module.lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    summary: lesson.summary,
    trackNumber: module.number,
    trackTitle: module.title,
    concepts: lesson.concepts.map((concept) => concept.term),
    lessonOrder: lesson.order,
  }))
);
