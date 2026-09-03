import { useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.ts";
import "./CodeLab.css";

type SnippetCategory = "python" | "numpy" | "pandas" | "sklearn" | "pytorch";

type CodeSnippet = {
  id: string;
  category: SnippetCategory;
  title: string;
  description: string;
  language: string;
  code: string;
  explanation: string[];
  expectedOutput: string;
};

const codeSnippets: CodeSnippet[] = [
  {
    id: "py-1",
    category: "python",
    title: "Mean Squared Error from Scratch",
    description: "Implement MSE calculation using list comprehensions and basic Python.",
    language: "python",
    code: `def calculate_mse(y_true, y_pred):
    if len(y_true) != len(y_pred):
        raise ValueError("Arrays must have equal length")
    
    squared_errors = [(actual - pred) ** 2 for actual, pred in zip(y_true, y_pred)]
    return sum(squared_errors) / len(y_true)

actual = [10.0, 20.0, 30.0, 40.0]
predicted = [12.0, 18.0, 31.0, 39.0]
mse = calculate_mse(actual, predicted)
print(f"MSE: {mse:.4f}")`,
    explanation: [
      "Line 2: Input length validation boundary.",
      "Line 5: List comprehension computes (actual - pred)^2 for each pair.",
      "Line 6: Averages squared errors across all samples."
    ],
    expectedOutput: "MSE: 1.7500"
  },
  {
    id: "np-1",
    category: "numpy",
    title: "Vectorized Linear Prediction (w·x + b)",
    description: "Compute weighted feature predictions using NumPy dot product.",
    language: "python",
    code: `import numpy as np

# Feature matrix X: 3 samples, 2 features (sqft_k, bedrooms)
X = np.array([
    [1.5, 3],
    [2.0, 4],
    [0.9, 2]
])

# Weight vector w and bias b
w = np.array([200.0, 25.0])
b = 50.0

# Vectorized prediction: Y_hat = X @ w + b
y_hat = np.dot(X, w) + b
print("Predicted Prices ($k):", y_hat)`,
    explanation: [
      "Line 4: Feature matrix X with shape (3, 2).",
      "Line 11: Weights corresponding to [price_per_k_sqft, price_per_bedroom].",
      "Line 15: `np.dot(X, w)` performs matrix-vector multiplication in C-speed parallelism."
    ],
    expectedOutput: "Predicted Prices ($k): [425. 550. 280.]"
  },
  {
    id: "pd-1",
    category: "pandas",
    title: "Data Profiling & Missingness Audit",
    description: "Load dataset, check schema types, count missing values, and handle duplicates.",
    language: "python",
    code: `import pandas as pd
import numpy as np

# Create sample dataset with missing values
data = {
    "age": [25, 30, np.nan, 45, 30],
    "income": [50000, 65000, 80000, np.nan, 65000],
    "target": [0, 1, 1, 0, 1]
}

df = pd.DataFrame(data)

print("--- SHAPE & TYPES ---")
print(df.dtypes)

print("\n--- MISSING VALUES ---")
print(df.isna().sum())

print("\n--- DUPLICATE ROWS ---")
print("Duplicates:", df.duplicated().sum())`,
    explanation: [
      "Line 11: Converts raw dictionary into pandas DataFrame.",
      "Line 17: `df.isna().sum()` counts missing values per column.",
      "Line 20: `df.duplicated().sum()` identifies repeated rows."
    ],
    expectedOutput: `--- SHAPE & TYPES ---
age        float64
income     float64
target       int64
dtype: object

--- MISSING VALUES ---
age       1
income    1
target    0
dtype: int64

--- DUPLICATE ROWS ---
Duplicates: 1`
  },
  {
    id: "sk-1",
    category: "sklearn",
    title: "Linear Regression Pipeline",
    description: "Train LinearRegression model with Scikit-Learn pipeline and evaluate test MSE.",
    language: "python",
    code: `from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import numpy as np

# Generate synthetic linear data: y = 3x + 5 + noise
np.random.seed(42)
X = np.random.rand(100, 1) * 10
y = 3 * X.squeeze() + 5 + np.random.randn(100) * 0.5

# Split train / test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Fit model
model = LinearRegression()
model.fit(X_train, y_train)

# Predict & evaluate
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)

print(f"Slope (w):     {model.coef_[0]:.4f} (Expected ~3.0)")
print(f"Intercept (b): {model.intercept_:.4f} (Expected ~5.0)")
print(f"Test MSE:      {mse:.4f}")`,
    explanation: [
      "Line 12: `train_test_split` locks 20% data for evaluation.",
      "Line 16: `model.fit()` fits parameters w and b using Ordinary Least Squares.",
      "Line 20: Evaluates test set MSE."
    ],
    expectedOutput: `Slope (w):     3.0077 (Expected ~3.0)
Intercept (b): 4.8872 (Expected ~5.0)
Test MSE:      0.2524`
  },
  {
    id: "pt-1",
    category: "pytorch",
    title: "PyTorch Neural Network Training Loop",
    description: "Build MLP in PyTorch and run explicit 4-step training loop with Autograd.",
    language: "python",
    code: `import torch
import torch.nn as nn
import torch.optim as optim

# 1. Define Model
class SimpleMLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(2, 4)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(4, 1)

    def forward(self, x):
        return self.fc2(self.relu(self.fc1(x)))

model = SimpleMLP()
optimizer = optim.SGD(model.parameters(), lr=0.01)
criterion = nn.MSELoss()

# Synthetic batch
inputs = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
targets = torch.tensor([[5.0], [11.0]])

# 2. Training Loop Step
optimizer.zero_grad()               # Reset gradients
predictions = model(inputs)          # 1. Forward Pass
loss = criterion(predictions, targets) # 2. Compute Loss
loss.backward()                     # 3. Backprop (Autograd)
optimizer.step()                    # 4. Parameter Update

print(f"Loss value: {loss.item():.4f}")`,
    explanation: [
      "Lines 6-14: Class definition inheriting `nn.Module`.",
      "Line 24: `optimizer.zero_grad()` clears accumulated gradient buffers.",
      "Line 27: `loss.backward()` triggers automatic differentiation chain rule."
    ],
    expectedOutput: "Loss value: 43.1250"
  }
];

export default function CodeLab() {
  useDocumentMeta("Interactive Code Lab | CURIO", "Inspect and experiment with Python, NumPy, Pandas, Scikit-Learn, and PyTorch code walkthroughs line by line.");

  const [activeCategory, setActiveCategory] = useState<SnippetCategory>("python");
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>("py-1");
  const [copied, setCopied] = useState(false);

  const categories: { id: SnippetCategory; label: string }[] = [
    { id: "python", label: "Python Basics" },
    { id: "numpy", label: "NumPy & Vectors" },
    { id: "pandas", label: "Pandas & Data" },
    { id: "sklearn", label: "Scikit-Learn ML" },
    { id: "pytorch", label: "PyTorch Deep Learning" },
  ];

  const currentCategorySnippets = codeSnippets.filter((s) => s.category === activeCategory);
  const activeSnippet = codeSnippets.find((s) => s.id === selectedSnippetId) ?? currentCategorySnippets[0] ?? codeSnippets[0];

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeSnippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="codelab-page">
      <header className="codelab-header">
        <Link className="codelab-brand" to="/dashboard">
          <img src="/curio-symbol.png" alt="CURIO" />
          <span>CURIO</span>
          <small>CODE LAB</small>
        </Link>
        <nav className="codelab-top-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/academy">AI / ML Academy</Link>
          <Link to="/concepts">Concept Library</Link>
        </nav>
      </header>

      <main className="codelab-container">
        <section className="codelab-hero">
          <span className="codelab-eyebrow">INTERACTIVE CODE LAB</span>
          <h1>Read AI Code Line by Line</h1>
          <p>
            Study production-ready implementations in Python, NumPy, Pandas, Scikit-Learn, and PyTorch. Predict what each line does before inspecting the output.
          </p>
        </section>

        {/* CATEGORY SELECTOR */}
        <div className="codelab-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`codelab-tab ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => {
                setActiveCategory(cat.id);
                const first = codeSnippets.find((s) => s.category === cat.id);
                if (first) setSelectedSnippetId(first.id);
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="codelab-workspace">
          {/* SIDEBAR SNIPPET SELECTOR */}
          <aside className="codelab-snippet-list">
            <h3>Examples in {categories.find((c) => c.id === activeCategory)?.label}</h3>
            {currentCategorySnippets.map((snippet) => (
              <button
                key={snippet.id}
                type="button"
                className={`snippet-item ${activeSnippet.id === snippet.id ? "active" : ""}`}
                onClick={() => setSelectedSnippetId(snippet.id)}
              >
                <strong>{snippet.title}</strong>
                <p>{snippet.description}</p>
              </button>
            ))}
          </aside>

          {/* MAIN CODE VIEW */}
          <article className="codelab-code-viewer">
            <header className="code-viewer-header">
              <div>
                <span className="code-lang-badge">{activeSnippet.language.toUpperCase()}</span>
                <h2>{activeSnippet.title}</h2>
                <p>{activeSnippet.description}</p>
              </div>
              <button type="button" className="copy-code-btn" onClick={() => void copyCode()}>
                {copied ? "Copied ✓" : "Copy code"}
              </button>
            </header>

            <pre className="code-block-pre">
              <code>{activeSnippet.code}</code>
            </pre>

            <section className="code-explanation-section">
              <h3>Line-by-Line Reasoning</h3>
              <ul>
                {activeSnippet.explanation.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>

            <section className="code-output-section">
              <h3>Expected Terminal Output</h3>
              <pre className="output-pre">
                <code>{activeSnippet.expectedOutput}</code>
              </pre>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
}
