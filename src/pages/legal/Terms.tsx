import { Link } from "react-router-dom";
import "../../styles/Legal.css";
const sections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
  },
  {
    id: "about-curio",
    title: "About CURIO",
  },
  {
    id: "user-accounts",
    title: "User Accounts",
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
  },
  {
    id: "ai-content",
    title: "AI-Generated Content",
  },
  {
    id: "educational-purpose",
    title: "Educational Purpose",
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
  },
  {
    id: "third-party-services",
    title: "Third-Party Services",
  },
  {
    id: "privacy",
    title: "Privacy",
  },
  {
    id: "service-availability",
    title: "Service Availability",
  },
  {
    id: "changes",
    title: "Changes to These Terms",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

function Terms() {
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
            CURIO · LEGAL
          </div>

          <h1>
            Terms of Service
          </h1>

          <p className="legal-hero-description">
            These terms explain the rules and
            responsibilities that apply when you
            use the CURIO platform.
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
              aria-label="Terms sections"
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
              Welcome to CURIO. These Terms of Service
              govern your use of the CURIO platform and
              its educational features. By creating an
              account or using CURIO, you agree to these
              terms.
            </p>

            <section id="acceptance">
              <h2>1. Acceptance of Terms</h2>

              <p>
                By creating an account or using CURIO,
                you agree to these Terms of Service.
                If you do not agree with these terms,
                please do not use the service.
              </p>
            </section>

            <section id="about-curio">
              <h2>2. About CURIO</h2>

              <p>
                CURIO is an educational platform designed
                to help learners understand artificial
                intelligence, use AI tools responsibly,
                practice prompting, evaluate AI-generated
                information and develop practical AI
                literacy skills.
              </p>
            </section>

            <section id="user-accounts">
              <h2>3. User Accounts</h2>

              <p>
                You are responsible for maintaining the
                confidentiality of your account credentials
                and for activity performed through your
                account.
              </p>

              <p>
                You should provide accurate information
                when creating your account and keep your
                information reasonably up to date.
              </p>
            </section>

            <section id="acceptable-use">
              <h2>4. Acceptable Use</h2>

              <p>
                You agree not to misuse CURIO, attempt to
                interfere with its operation, access
                accounts that do not belong to you, or
                use the platform for unlawful activities.
              </p>
            </section>

            <section id="ai-content">
              <h2>5. AI-Generated Content</h2>

              <p>
                CURIO may provide educational experiences
                involving artificial intelligence and
                AI-generated content.
              </p>

              <p>
                AI-generated information can contain
                errors, omissions or misleading
                information. CURIO encourages users to
                critically evaluate important information
                and verify it using reliable sources.
              </p>
            </section>

            <section id="educational-purpose">
              <h2>6. Educational Purpose</h2>

              <p>
                CURIO is an educational platform and does
                not guarantee academic, professional,
                financial, medical, legal or other outcomes
                from use of the service.
              </p>
            </section>

            <section id="intellectual-property">
              <h2>7. Intellectual Property</h2>

              <p>
                CURIO's original branding, interface,
                educational materials and software are
                protected by applicable intellectual
                property laws.
              </p>
            </section>

            <section id="third-party-services">
              <h2>8. Third-Party Services</h2>

              <p>
                CURIO may integrate with third-party
                services and AI providers. Your use of
                those services may also be subject to
                their respective terms and policies.
              </p>
            </section>

            <section id="privacy">
              <h2>9. Privacy</h2>

              <p>
                Information about how CURIO collects and
                uses personal information is described in
                the CURIO Privacy Policy.
              </p>

              <p>
                Please review our{" "}
                <Link to="/privacy">
                  Privacy Policy
                </Link>{" "}
                for more information.
              </p>
            </section>

            <section id="service-availability">
              <h2>10. Service Availability</h2>

              <p>
                We aim to keep CURIO available and
                reliable, but we cannot guarantee
                uninterrupted or error-free operation
                at all times.
              </p>
            </section>

            <section id="changes">
              <h2>11. Changes to These Terms</h2>

              <p>
                CURIO may update these Terms of Service
                as the product evolves. Updated terms
                will be published on this page with a
                revised effective date.
              </p>
            </section>

            <section id="contact">
              <h2>12. Contact</h2>

              <p>
                For questions regarding these Terms of
                Service, please use the contact
                information provided by CURIO.
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

export default Terms;