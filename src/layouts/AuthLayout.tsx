import type { ReactNode } from "react";
import "./AuthLayout.css";
import LearningOrbit from "../components/visuals/LearningOrbit.tsx";

interface AuthLayoutProps { children: ReactNode; }

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-brand-panel">
          <div className="auth-grid" aria-hidden="true" />
          <div className="auth-glow auth-glow-one" aria-hidden="true" />
          <div className="auth-glow auth-glow-two" aria-hidden="true" />
          <div className="auth-brand-content">
            <div className="curio-brand">
              <img src="/curio-symbol.png" alt="CURIO" className="curio-brand-symbol" />
              <div>
                <div className="curio-brand-name">CURIO</div>
                <div className="curio-tagline"><span>EXPLORE</span><i> / </i><span>CONNECT</span><i> / </i><span>GROW</span></div>
              </div>
            </div>

            <LearningOrbit decorative />

            <div className="auth-hero-content">
              <p className="auth-eyebrow">A PLACE TO BE CURIOUS</p>
              <h1>Learn with<br/>clarity, colour<br/><span>and momentum.</span></h1>
              <p className="auth-hero-description">CURIO makes learning feel active and rewarding. Follow ideas, connect concepts, test your understanding, and build confidence one step at a time.</p>
            </div>

            <div className="auth-features">
              <div className="auth-feature"><div className="feature-index">01</div><div><h3>Explore ideas</h3><p>Start with clear concepts and practical examples.</p></div></div>
              <div className="auth-feature"><div className="feature-index">02</div><div><h3>See connections</h3><p>Use visual maps to understand the bigger picture.</p></div></div>
              <div className="auth-feature"><div className="feature-index">03</div><div><h3>Practice actively</h3><p>Think, answer, improve and remember more.</p></div></div>
              <div className="auth-feature"><div className="feature-index">04</div><div><h3>Keep growing</h3><p>Turn small lessons into lasting learning habits.</p></div></div>
            </div>
          </div>
        </section>
        <section className="auth-form-panel"><div className="auth-form-container">{children}</div></section>
      </div>
    </main>
  );
}
export default AuthLayout;
