import { useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import { useAcademyAccess } from "../../hooks/useAcademyAccess.ts";
import { startAcademyCheckout } from "../../lib/academyCheckout.ts";
import "./Academy.css";
import "./AcademyCheckout.css";

export default function AcademyCheckout() {
  useDocumentMeta("CURIO Academy PRO Membership", "Secure CURIO Academy membership checkout and server-backed access.");
  const { user, loading: authLoading } = useAuth();
  const { isMember, status, loading: membershipLoading } = useAcademyAccess();
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState("");

  const beginCheckout = async () => {
    setMessage("");
    if (!user) {
      setMessage("Sign in first. Payment must be linked to a verified CURIO account.");
      return;
    }
    setStarting(true);
    try {
      const url = await startAcademyCheckout();
      window.location.assign(url);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Checkout could not be started.";
      setMessage(`${text} Connect the Supabase create-academy-checkout Edge Function before enabling live payment.`);
      setStarting(false);
    }
  };

  const statusLabel = authLoading || membershipLoading
    ? "Checking account…"
    : isMember ? "PRO membership active"
    : user ? "Ready for secure checkout" : "Sign in required";

  return <main className="checkout-page">
    <header className="academy-topbar">
      <Link to="/academy" className="academy-brand"><img src="/curio-symbol.png" alt="" /><span>CURIO</span><small>AI / ML ACADEMY · PRO</small></Link>
      <div className="academy-header-center"><span>Secure membership access</span><div className="academy-progress"><i style={{ width: "100%" }} /></div><small>Server verified</small></div>
      <nav className="academy-nav"><Link to="/academy">Back to Academy</Link>{user && <Link to="/dashboard">Dashboard</Link>}</nav>
    </header>

    <section className="checkout-layout">
      <div className="checkout-copy">
        <span className="academy-kicker">CURIO ACADEMY · PRO MEMBERSHIP</span>
        <h1>One Academy. One structured path. ₹1 to test the full experience.</h1>
        <p>The current ₹1 price is an integration and product-flow test. Successful payment must be confirmed by the payment provider on the server before the Academy entitlement becomes active.</p>
        <div className="checkout-includes">
          <article><b>01</b><div><strong>Full serial curriculum</strong><span>Python, mathematics, data, machine learning, deep learning, LLMs, generative AI and production systems.</span></div></article>
          <article><b>02</b><div><strong>Teaching, not redirects</strong><span>Definitions, distinctions, diagrams, code walkthroughs, common errors, recall and practice live inside CURIO.</span></div></article>
          <article><b>03</b><div><strong>Server-backed access</strong><span>Supabase Auth identifies the learner; a verified payment webhook controls the entitlement.</span></div></article>
        </div>
      </div>

      <aside className="checkout-card">
        <span className="section-label">CURRENT OFFER</span>
        <div className="checkout-price"><span>₹</span><strong>1</strong><small>test price</small></div>
        <p className="checkout-status"><b>{statusLabel}</b><span>Access status: {status}</span></p>
        <ul>
          <li>{isMember ? "Full Academy already active" : "Unlock all Academy modules"}</li>
          <li>All serial lessons and concept maps</li>
          <li>Code walkthroughs and practice checkpoints</li>
          <li>Membership stored against your CURIO account</li>
        </ul>
        {isMember ? <Link className="checkout-primary" to="/academy">Open full Academy →</Link>
          : !user ? <Link className="checkout-primary" to="/login">Sign in to buy securely →</Link>
          : <button type="button" className="checkout-primary checkout-button" disabled={starting} onClick={() => void beginCheckout()}>{starting ? "Opening secure checkout…" : "Continue to secure ₹1 payment →"}</button>}
        {message && <p className="checkout-message" role="alert">{message}</p>}
        <small className="checkout-fineprint">Payment success in the browser is not enough to unlock access. CURIO waits for a trusted server-side confirmation.</small>
      </aside>
    </section>

    <section className="checkout-security checkout-security-wide">
      <div><span className="section-label">PAYMENT & ACCESS ARCHITECTURE</span><h2>Who paid, what they bought and why access is active must be auditable.</h2><p>This design prevents a frontend button, local storage value or URL parameter from turning a user into a paid member.</p></div>
      <div className="security-grid">
        <article><strong>1. Supabase Auth</strong><p>The signed-in user provides the stable CURIO user ID.</p></article>
        <article><strong>2. Edge Function</strong><p>The server creates the ₹1 provider checkout and attaches trusted metadata.</p></article>
        <article><strong>3. Signed webhook</strong><p>The provider confirms payment to a server endpoint using signature verification.</p></article>
        <article><strong>4. Entitlement table</strong><p>The webhook writes active product access; the Academy reads it and fails closed on errors.</p></article>
      </div>
    </section>
  </main>;
}
