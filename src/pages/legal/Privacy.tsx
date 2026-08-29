import { Link } from "react-router-dom";
import "../../styles/Legal.css";
const sections = [
  {
    id: "information",
    title: "Information We Collect",
  },
  {
    id: "account",
    title: "Account Information",
  },
  {
    id: "learning",
    title: "Learning Information",
  },
  {
    id: "usage",
    title: "How We Use Information",
  },
  {
    id: "ai",
    title: "AI Interactions",
  },
  {
    id: "security",
    title: "Data Security",
  },
  {
    id: "third-party",
    title: "Third-Party Services",
  },
  {
    id: "retention",
    title: "Data Retention",
  },
  {
    id: "choices",
    title: "Your Choices",
  },
  {
    id: "children",
    title: "Children's Privacy",
  },
  {
    id: "changes",
    title: "Changes to This Policy",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

function Privacy() {
  return (
    <div className="legal-app">

      {/* =========================================
          HEADER
      ========================================== */}

      <header className="legal-header">

        <div className="legal-header-inner">

          <Link
            to="/login"
            className="legal-brand"
            aria-label="CURIO home"
          >

            <img
              src="/curio-symbol.png"
              alt=""
              className="legal-brand-logo"
            />

            <span className="legal-brand-name">
              CURIO
            </span>

          </Link>

          <nav
            className="legal-header-nav"
            aria-label="Legal navigation"
          >

            <Link to="/login">
              Sign in
            </Link>

            <Link
              to="/signup"
              className="legal-header-cta"
            >
              Create account
            </Link>

          </nav>

        </div>

      </header>

      {/* =========================================
          MAIN
      ========================================== */}

      <main className="legal-main">

        {/* HERO */}

        <section className="legal-hero">

          <div className="legal-eyebrow">
            CURIO · PRIVACY
          </div>

          <h1>
            Privacy Policy
          </h1>

          <p className="legal-hero-description">
            Learn what information CURIO collects,
            why it is used and how we approach the
            protection of your information.
          </p>

          <div className="legal-meta">

            <span>
              Last updated
            </span>

            <strong>
              August 29, 2026
            </strong>

          </div>

        </section>

        {/* DOCUMENT */}

        <div className="legal-document-layout">

          {/* SIDEBAR */}

          <aside className="legal-sidebar">

            <div className="legal-sidebar-title">
              On this page
            </div>

            <nav
              className="legal-sidebar-nav"
              aria-label="Privacy sections"
            >

              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                >
                  <span>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {section.title}
                </a>
              ))}

            </nav>

          </aside>

          {/* CONTENT */}

          <article className="legal-content">

            <p className="legal-introduction">
              This Privacy Policy explains how CURIO
              handles information associated with your
              account and use of the platform.
            </p>

            <section id="information">
              <h2>1. Information We Collect</h2>

              <p>
                When you create a CURIO account, we may
                collect information such as your name,
                email address, age, learner type,
                education level, AI experience and
                learning goals.
              </p>
            </section>

            <section id="account">
              <h2>2. Account Information</h2>

              <p>
                Your email address and authentication
                information are used to create and secure
                your CURIO account.
              </p>
            </section>

            <section id="learning">
              <h2>3. Learning Information</h2>

              <p>
                CURIO may store information related to
                your learning activity, such as lesson
                progress, practice attempts, preferences
                and skill development.
              </p>
            </section>

            <section id="usage">
              <h2>4. How We Use Information</h2>

              <p>
                Information may be used to provide the
                CURIO service, personalize learning
                experiences, maintain account security,
                improve the platform and understand
                aggregate product usage.
              </p>
            </section>

            <section id="ai">
              <h2>5. AI Interactions</h2>

              <p>
                Some CURIO features may involve
                interaction with AI systems.
              </p>

              <p>
                Users should avoid entering sensitive
                personal information, passwords,
                financial information or other
                confidential information into AI tools
                unless CURIO explicitly indicates that
                the relevant feature supports such
                information.
              </p>
            </section>

            <section id="security">
              <h2>6. Data Security</h2>

              <p>
                CURIO uses technical and organizational
                measures intended to protect account and
                application data. No internet service can
                guarantee absolute security.
              </p>
            </section>

            <section id="third-party">
              <h2>7. Third-Party Services</h2>

              <p>
                CURIO may use third-party infrastructure,
                authentication providers, hosting
                services and AI providers to operate
                certain features.
              </p>
            </section>

            <section id="retention">
              <h2>8. Data Retention</h2>

              <p>
                Information may be retained for as long
                as necessary to provide the service,
                maintain security, comply with applicable
                obligations and support legitimate
                product operations.
              </p>
            </section>

            <section id="choices">
              <h2>9. Your Choices</h2>

              <p>
                CURIO will provide appropriate
                mechanisms for users to manage their
                account and, where applicable, request
                changes or deletion of their information.
              </p>
            </section>

            <section id="children">
              <h2>10. Children's Privacy</h2>

              <p>
                CURIO should establish and communicate
                appropriate age requirements before
                public launch. Additional safeguards may
                be required if CURIO is made available
                to children.
              </p>
            </section>

            <section id="changes">
              <h2>11. Changes to This Policy</h2>

              <p>
                We may update this Privacy Policy as
                CURIO evolves. Changes will be reflected
                on this page together with an updated
                date.
              </p>
            </section>

            <section id="contact">
              <h2>12. Contact</h2>

              <p>
                For privacy-related questions, please
                use the contact information provided by
                CURIO.
              </p>
            </section>

          </article>

        </div>

      </main>

      {/* =========================================
          FOOTER
      ========================================== */}

      <footer className="legal-footer">

        <div className="legal-footer-inner">

          <div className="legal-footer-brand">

            <img
              src="/curio-symbol.png"
              alt=""
              className="legal-footer-logo"
            />

            <span>
              CURIO
            </span>

          </div>

          <div className="legal-footer-links">

            <Link to="/terms">
              Terms of Service
            </Link>

            <Link to="/privacy">
              Privacy Policy
            </Link>

            <Link to="/signup">
              Create account
            </Link>

          </div>

          <p className="legal-footer-copy">
            © 2026 CURIO. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Privacy;