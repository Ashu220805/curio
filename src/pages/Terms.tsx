import { Link } from "react-router-dom";
import "../styles/Legal.css";

function Terms() {
  return (
    <main className="legal-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="legal-header">

        <Link
          to="/guest"
          className="legal-brand"
          aria-label="CURIO home"
        >
          <img
            src="/curio-symbol.png"
            alt="CURIO"
            className="legal-logo"
          />

          <div className="legal-brand-text">
            <div className="legal-brand-name">
              CURIO
            </div>

            <div className="legal-brand-tagline">
              LEARN · UNDERSTAND · GROW
            </div>
          </div>
        </Link>

        <nav
          className="legal-nav"
          aria-label="Legal navigation"
        >
          <Link to="/guest">
            Home
          </Link>

          <Link to="/login">
            Sign in →
          </Link>
        </nav>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="legal-container">

        <section className="legal-hero">

          <p className="legal-eyebrow">
            CURIO LEGAL
          </p>

          <h1 className="legal-title">
            Terms &amp; Conditions
          </h1>

          <p className="legal-subtitle">
            Please read these terms carefully before
            using the CURIO platform.
          </p>

          <div className="legal-meta">
            <span>
              Effective date: August 29, 2026
            </span>

            <span className="legal-meta-separator">
              •
            </span>

            <span>
              Version 1.0
            </span>
          </div>

        </section>

        {/* ===================================================
            DOCUMENT
        =================================================== */}

        <article className="legal-document">

          <section className="legal-section">

            <p className="legal-section-number">
              01
            </p>

            <h2 className="legal-section-title">
              Acceptance of Terms
            </h2>

            <p>
              Welcome to CURIO. These Terms &amp;
              Conditions govern your access to and
              use of the CURIO website, application,
              educational content, learning activities
              and related services.
            </p>

            <p>
              By accessing or using CURIO, you
              acknowledge that you have read,
              understood and agree to these Terms &amp;
              Conditions. If you do not agree with
              these terms, please do not use the
              platform.
            </p>

          </section>

          <section className="legal-section">

            <p className="legal-section-number">
              02
            </p>

            <h2 className="legal-section-title">
              Use of CURIO
            </h2>

            <p>
              CURIO is designed to provide
              educational resources and practical
              learning experiences relating to
              artificial intelligence and technology.
            </p>

            <ul className="legal-list">

              <li>
                You must use CURIO only for lawful
                purposes.
              </li>

              <li>
                You must not attempt to disrupt,
                damage or gain unauthorized access
                to the platform.
              </li>

              <li>
                You must not misuse CURIO's
                learning content, services or
                infrastructure.
              </li>

            </ul>

          </section>

          <section className="legal-section">

            <p className="legal-section-number">
              03
            </p>

            <h2 className="legal-section-title">
              Accounts
            </h2>

            <p>
              Certain CURIO features may require
              you to create an account. You are
              responsible for maintaining the
              confidentiality of your account
              credentials.
            </p>

          </section>

          <section className="legal-section">

            <p className="legal-section-number">
              04
            </p>

            <h2 className="legal-section-title">
              Guest Access
            </h2>

            <p>
              CURIO may provide a guest mode that
              allows visitors to explore selected
              educational experiences without
              creating an account.
            </p>

            <p>
              Guest activity may not be permanently
              saved, synchronized or associated with
              a personal account.
            </p>

          </section>

          <section className="legal-section">

            <p className="legal-section-number">
              05
            </p>

            <h2 className="legal-section-title">
              Educational Content
            </h2>

            <p>
              CURIO provides educational material
              for learning and informational
              purposes. While we aim to provide
              useful and accurate information,
              educational content may contain errors,
              omissions or outdated information.
            </p>

            <p>
              You should independently verify
              important information before relying
              on it for professional, financial,
              legal, medical or other high-impact
              decisions.
            </p>

          </section>

          <section className="legal-section">

            <p className="legal-section-number">
              06
            </p>

            <h2 className="legal-section-title">
              AI-Generated Information
            </h2>

            <p>
              Some CURIO experiences may use
              artificial intelligence systems.
              AI-generated information may be
              incomplete, inaccurate or unsuitable
              for a particular purpose.
            </p>

            <p>
              Users should evaluate AI-generated
              outputs critically and verify important
              information before relying upon it.
            </p>

          </section>

          <section className="legal-section">

            <p className="legal-section-number">
              07
            </p>

            <h2 className="legal-section-title">
              Intellectual Property
            </h2>

            <p>
              CURIO's branding, visual design,
              original educational materials,
              interface elements, graphics, text
              and other original content are protected
              by applicable intellectual property laws.
            </p>

            <p>
              You may use CURIO for personal learning
              and authorized purposes. You may not
              reproduce, redistribute, sell or
              commercially exploit CURIO content
              without appropriate permission.
            </p>

          </section>

          <section className="legal-section">

            <p className="legal-section-number">
              08
            </p>

            <h2 className="legal-section-title">
              Third-Party Services
            </h2>

            <p>
              CURIO may integrate with third-party
              services, platforms or infrastructure
              providers. Third-party services may
              have their own terms, privacy policies
              and operating requirements.
            </p>

          </section>

          <section className="legal-section">

            <p className="legal-section-number">
              09
            </p>

            <h2 className="legal-section-title">
              Availability
            </h2>

            <p>
              We may modify, update, suspend or
              discontinue portions of CURIO as the
              platform develops. We do not guarantee
              that every feature will always be
              available or uninterrupted.
            </p>

          </section>

          <section className="legal-section">

            <p className="legal-section-number">
              10
            </p>

            <h2 className="legal-section-title">
              Limitation of Liability
            </h2>

            <p>
              To the maximum extent permitted by
              applicable law, CURIO and its
              contributors will not be responsible
              for losses arising from reliance on
              educational information, temporary
              service interruptions, technical
              issues or unauthorized access beyond
              our reasonable control.
            </p>

          </section>

          <section className="legal-section">

            <p className="legal-section-number">
              11
            </p>

            <h2 className="legal-section-title">
              Changes to These Terms
            </h2>

            <p>
              These Terms &amp; Conditions may be
              updated from time to time as CURIO
              evolves. Updated terms will be
              published on this page with a revised
              effective date.
            </p>

          </section>

          <section className="legal-section">

            <p className="legal-section-number">
              12
            </p>

            <h2 className="legal-section-title">
              Questions
            </h2>

            <p>
              If you have questions regarding these
              Terms &amp; Conditions, please contact
              the CURIO team through the official
              communication channel provided by
              the platform.
            </p>

          </section>

        </article>

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="legal-footer">

        <div className="legal-footer-brand">

          <img
            src="/curio-symbol.png"
            alt="CURIO"
            className="legal-footer-logo"
          />

          <span className="legal-footer-name">
            CURIO
          </span>

        </div>

        <nav
          className="legal-footer-links"
          aria-label="Legal footer navigation"
        >
          <Link to="/terms">
            Terms &amp; Conditions
          </Link>

          <Link to="/privacy">
            Privacy Policy
          </Link>

          <Link to="/login">
            Sign in
          </Link>
        </nav>

      </footer>

    </main>
  );
}

export default Terms;