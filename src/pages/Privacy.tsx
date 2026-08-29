import { Link } from "react-router-dom";
import "../styles/Privacy.css";

function Privacy() {
  return (
    <main className="legal-page privacy-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="legal-header">

        <Link
          to="/"
          className="legal-brand"
          aria-label="CURIO home"
        >
          <img
            src="/curio-symbol.png"
            alt="CURIO symbol"
            className="legal-logo"
          />

          <div className="legal-brand-text">
            <p className="legal-brand-name">
              CURIO
            </p>

            <p className="legal-brand-tagline">
              LEARN • UNDERSTAND • GROW
            </p>
          </div>
        </Link>

        <nav
          className="legal-nav"
          aria-label="Legal navigation"
        >
          <Link to="/login">
            Sign in →
          </Link>

          <Link to="/terms">
            Terms
          </Link>

          <Link to="/privacy">
            Privacy
          </Link>
        </nav>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="legal-container">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="legal-hero">

          <p className="legal-eyebrow">
            CURIO LEGAL
          </p>

          <h1 className="legal-title">
            Privacy Policy.
          </h1>

          <p className="legal-subtitle">
            This Privacy Policy explains how CURIO
            collects, uses, protects and handles
            information when you use the CURIO
            platform.
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
            PRIVACY DOCUMENT
        =================================================== */}

        <article className="legal-document privacy-document">

          {/* =================================================
              01
          ================================================= */}

          <section className="legal-section">

            <p className="legal-section-number">
              01
            </p>

            <h2 className="legal-section-title">
              Introduction
            </h2>

            <p>
              CURIO respects your privacy and is
              committed to handling information
              responsibly. This Privacy Policy
              describes how information may be
              collected and used when you access
              or use CURIO.
            </p>

            <p>
              By using CURIO, you acknowledge that
              you have read and understood this
              Privacy Policy.
            </p>

          </section>


          {/* =================================================
              02
          ================================================= */}

          <section className="legal-section">

            <p className="legal-section-number">
              02
            </p>

            <h2 className="legal-section-title">
              Information We May Collect
            </h2>

            <p>
              Depending on how you use CURIO,
              the platform may process information
              necessary to provide its services
              and learning experiences.
            </p>

            <ul className="legal-list">

              <li>
                Account information such as your
                name, email address or other
                information provided during
                registration.
              </li>

              <li>
                Learning activity and progress
                information associated with your
                CURIO account.
              </li>

              <li>
                Information you voluntarily provide
                while interacting with CURIO.
              </li>

              <li>
                Technical information required
                for security, reliability and
                operation of the platform.
              </li>

            </ul>

          </section>


          {/* =================================================
              03
          ================================================= */}

          <section className="legal-section">

            <p className="legal-section-number">
              03
            </p>

            <h2 className="legal-section-title">
              How We Use Information
            </h2>

            <p>
              Information may be used to operate,
              maintain and improve CURIO and to
              provide users with appropriate
              learning experiences.
            </p>

            <ul className="legal-list">

              <li>
                To create and manage user accounts.
              </li>

              <li>
                To provide learning content and
                platform functionality.
              </li>

              <li>
                To maintain learning progress
                and personalized features.
              </li>

              <li>
                To improve the performance,
                reliability and security of CURIO.
              </li>

              <li>
                To communicate important
                information relating to the
                platform.
              </li>

            </ul>

          </section>


          {/* =================================================
              04
          ================================================= */}

          <section className="legal-section">

            <p className="legal-section-number">
              04
            </p>

            <h2 className="legal-section-title">
              Guest Mode
            </h2>

            <p>
              CURIO may provide a guest mode that
              allows visitors to explore selected
              educational experiences without
              creating an account.
            </p>

            <p>
              Guest activity may not be permanently
              saved, synchronized or associated
              with a personal CURIO account.
            </p>

          </section>


          {/* =================================================
              05
          ================================================= */}

          <section className="legal-section">

            <p className="legal-section-number">
              05
            </p>

            <h2 className="legal-section-title">
              Cookies and Local Storage
            </h2>

            <p>
              CURIO may use browser storage,
              cookies or similar technologies
              where necessary to maintain
              sessions, preferences, security
              information and other platform
              functionality.
            </p>

            <p>
              Guest mode may use browser
              session storage to maintain the
              guest experience during a browsing
              session.
            </p>

          </section>


          {/* =================================================
              06
          ================================================= */}

          <section className="legal-section">

            <p className="legal-section-number">
              06
            </p>

            <h2 className="legal-section-title">
              AI and Third-Party Services
            </h2>

            <p>
              Some CURIO experiences may use
              artificial intelligence systems or
              third-party services to provide
              functionality.
            </p>

            <p>
              Information processed by such
              services may be subject to their
              respective privacy policies and
              terms. Users should review those
              policies where applicable.
            </p>

          </section>


          {/* =================================================
              07
          ================================================= */}

          <section className="legal-section">

            <p className="legal-section-number">
              07
            </p>

            <h2 className="legal-section-title">
              Data Security
            </h2>

            <p>
              CURIO takes reasonable measures to
              protect information against
              unauthorized access, alteration,
              disclosure or destruction.
            </p>

            <p>
              However, no internet-based system
              can be guaranteed to be completely
              secure.
            </p>

          </section>


          {/* =================================================
              08
          ================================================= */}

          <section className="legal-section">

            <p className="legal-section-number">
              08
            </p>

            <h2 className="legal-section-title">
              Data Retention
            </h2>

            <p>
              Information may be retained for as
              long as reasonably necessary to
              provide CURIO services, maintain
              legitimate records, comply with
              applicable requirements or resolve
              disputes.
            </p>

          </section>


          {/* =================================================
              09
          ================================================= */}

          <section className="legal-section">

            <p className="legal-section-number">
              09
            </p>

            <h2 className="legal-section-title">
              Your Choices
            </h2>

            <p>
              Depending on the functionality
              available to you, you may be able
              to access, update or request deletion
              of information associated with your
              CURIO account.
            </p>

            <p>
              You may also choose not to create
              an account and use available guest
              experiences instead.
            </p>

          </section>


          {/* =================================================
              10
          ================================================= */}

          <section className="legal-section">

            <p className="legal-section-number">
              10
            </p>

            <h2 className="legal-section-title">
              Children's Privacy
            </h2>

            <p>
              CURIO is intended to provide
              educational experiences. Users
              should provide only information
              appropriate for their circumstances
              and should not submit unnecessary
              personal information.
            </p>

          </section>


          {/* =================================================
              11
          ================================================= */}

          <section className="legal-section">

            <p className="legal-section-number">
              11
            </p>

            <h2 className="legal-section-title">
              Changes to This Privacy Policy
            </h2>

            <p>
              This Privacy Policy may be updated
              from time to time as CURIO develops.
              Updated versions will be published
              on this page with a revised effective
              date.
            </p>

          </section>


          {/* =================================================
              12
          ================================================= */}

          <section className="legal-section">

            <p className="legal-section-number">
              12
            </p>

            <h2 className="legal-section-title">
              Questions
            </h2>

            <p>
              If you have questions regarding this
              Privacy Policy, please contact the
              CURIO team through the official
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
            alt="CURIO symbol"
            className="legal-footer-logo"
          />

          <span className="legal-footer-name">
            CURIO
          </span>

        </div>

        <div className="legal-footer-links">

          <Link to="/terms">
            Terms & Conditions
          </Link>

          <Link to="/privacy">
            Privacy Policy
          </Link>

          <Link to="/login">
            Sign in
          </Link>

        </div>

      </footer>

    </main>
  );
}

export default Privacy;