import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        {/* LEFT — CURIO BRAND EXPERIENCE */}
        <section className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="curio-brand">
              <img
                src="/curio-symbol.png"
                alt="CURIO"
                className="curio-brand-symbol"
              />

              <div>
                <div className="curio-brand-name">CURIO</div>

                <div className="curio-tagline">
                  <span>LEARN</span>
                  <i>•</i>
                  <span>UNDERSTAND</span>
                  <i>•</i>
                  <span>GROW</span>
                </div>
              </div>
            </div>

            <div className="auth-hero-content">
              <p className="auth-eyebrow">YOUR AI LEARNING JOURNEY</p>

              <h1>
                Learn AI.
                <br />
                Think Better.
                <br />
                <span>Build the Future.</span>
              </h1>

              <p className="auth-hero-description">
                CURIO helps you understand Artificial Intelligence
                step-by-step through interactive learning, real-world
                examples, and hands-on practice.
              </p>
            </div>

            <div className="auth-features">
              <div className="auth-feature">
                <div className="feature-icon">▶</div>

                <div>
                  <h3>Interactive Learning</h3>
                  <p>Engaging lessons with visual explanations</p>
                </div>
              </div>

              <div className="auth-feature">
                <div className="feature-icon">◉</div>

                <div>
                  <h3>AI Simulators</h3>
                  <p>Experiment with AI in a safe environment</p>
                </div>
              </div>

              <div className="auth-feature">
                <div className="feature-icon">✓</div>

                <div>
                  <h3>Safe & Responsible</h3>
                  <p>Learn how to use AI ethically and responsibly</p>
                </div>
              </div>

              <div className="auth-feature">
                <div className="feature-icon">★</div>

                <div>
                  <h3>Track Your Growth</h3>
                  <p>Build skills through structured practice</p>
                </div>
              </div>
            </div>

            <div className="auth-quote">
              <div className="quote-mark">“</div>

              <div>
                <p>
                  The best way to predict the future is to understand
                  the intelligence shaping it.
                </p>

                <span>— CURIO</span>
              </div>
            </div>
          </div>

          <div className="auth-glow auth-glow-one" />
          <div className="auth-glow auth-glow-two" />
          <div className="auth-grid" />
        </section>

        {/* RIGHT — AUTHENTICATION */}
        <section className="auth-form-panel">
          <div className="auth-form-container">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

export default AuthLayout;