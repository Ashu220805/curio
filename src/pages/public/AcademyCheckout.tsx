import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useDocumentMeta } from "../../hooks/useDocumentMeta.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import { useAcademyAccess } from "../../hooks/useAcademyAccess.ts";

import {
  loadRazorpayScript,
  type RazorpayPaymentResponse,
} from "../../lib/razorpay.ts";

import { startAcademyCheckout } from "../../lib/academyCheckout.ts";

import "./Academy.css";
import "./AcademyCheckout.css";

interface AcademyCheckoutResponse {
  success: boolean;
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  userId: string;
}

function isCheckoutResponse(
  value: unknown,
): value is AcademyCheckoutResponse {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const data =
    value as Record<string, unknown>;

  return (
    data.success === true &&
    typeof data.keyId === "string" &&
    typeof data.orderId === "string" &&
    typeof data.amount === "number" &&
    typeof data.currency === "string" &&
    typeof data.userId === "string"
  );
}

export default function AcademyCheckout() {
  useDocumentMeta(
    "CURIO Academy PRO Membership",
    "Secure CURIO Academy membership checkout.",
  );

  const navigate = useNavigate();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    accessStatus,
    membership,
    hasAcademyAccess,
    isLoading: membershipLoading,
    refreshAccess,
  } = useAcademyAccess();

  const [starting, setStarting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const statusLabel =
    authLoading ||
    membershipLoading
      ? "Checking account"
      : hasAcademyAccess
        ? "PRO membership active"
        : user
          ? "Ready for secure checkout"
          : "Sign in required";

  const beginCheckout = async () => {
    setMessage("");

    if (!user) {
      setMessage(
        "Please sign in before purchasing Academy access.",
      );
      return;
    }

    if (hasAcademyAccess) {
      navigate("/academy");
      return;
    }

    setStarting(true);

    try {
      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load the payment service. Please check your connection and try again.",
        );
      }

      if (!globalThis.Razorpay) {
        throw new Error(
          "Razorpay Checkout could not be initialized.",
        );
      }

      const result =
        await startAcademyCheckout();

      if (
        !isCheckoutResponse(
          result,
        )
      ) {
        throw new Error(
          "The payment service returned an invalid checkout order.",
        );
      }

      const checkoutData =
        result;

      const razorpay =
        new globalThis.Razorpay({
          key:
            checkoutData.keyId,

          amount:
            checkoutData.amount,

          currency:
            checkoutData.currency,

          name:
            "CURIO",

          description:
            "CURIO AI / ML Academy PRO Membership",

          order_id:
            checkoutData.orderId,

          prefill: {
            email:
              user.email ?? "",
          },

          theme: {
            color:
              "#5b6cff",
          },

          handler: async (
            response: RazorpayPaymentResponse,
          ) => {
            if (
              !response
                .razorpay_payment_id
            ) {
              setMessage(
                "Payment verification information was not returned.",
              );

              setStarting(false);

              return;
            }

            setMessage(
              "Payment received. Verifying your Academy membership...",
            );

            let attempts = 0;

            const maximumAttempts = 10;

            const verifyAccess =
              async (): Promise<void> => {
                attempts += 1;

                await refreshAccess();

                if (
                  attempts >=
                  maximumAttempts
                ) {
                  setStarting(false);

                  setMessage(
                    "Payment was received. Membership verification may take a few moments. Please refresh the page shortly.",
                  );

                  return;
                }

                globalThis.setTimeout(
                  () => {
                    void verifyAccess();
                  },
                  2000,
                );
              };

            await verifyAccess();
          },

          modal: {
            ondismiss: () => {
              setStarting(false);

              setMessage(
                "Payment was cancelled. Academy access has not been activated.",
              );
            },
          },
        });

      razorpay.open();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Checkout could not be started.";

      setMessage(
        errorMessage,
      );

      setStarting(false);
    }
  };

  return (
    <main className="checkout-page">
      <header className="academy-topbar">
        <Link
          to="/academy"
          className="academy-brand"
        >
          <img
            src="/curio-symbol.png"
            alt=""
          />

          <span>
            CURIO
          </span>

          <small>
            AI / ML ACADEMY · PRO
          </small>
        </Link>

        <div className="academy-header-center">
          <span>
            Secure membership access
          </span>

          <div className="academy-progress">
            <i
              style={{
                width: "100%",
              }}
            />
          </div>

          <small>
            Server verified
          </small>
        </div>

        <nav className="academy-nav">
          <Link to="/academy">
            Back to Academy
          </Link>

          {user && (
            <Link to="/dashboard">
              Dashboard
            </Link>
          )}
        </nav>
      </header>

      <section className="checkout-layout">
        <div className="checkout-copy">
          <span className="academy-kicker">
            CURIO ACADEMY · PRO MEMBERSHIP
          </span>

          <h1>
            One Academy.
            <br />
            One structured path.
            <br />
            ₹1 to test the full experience.
          </h1>

          <p>
            The current ₹1 price is an integration
            and product-flow test. Academy access is
            activated only after trusted server-side
            payment confirmation.
          </p>

          <div className="checkout-includes">
            <article>
              <b>01</b>

              <div>
                <strong>
                  Full serial curriculum
                </strong>

                <span>
                  Python, mathematics, data science,
                  machine learning, deep learning,
                  neural networks, LLMs, generative AI
                  and production systems.
                </span>
              </div>
            </article>

            <article>
              <b>02</b>

              <div>
                <strong>
                  Teaching inside CURIO
                </strong>

                <span>
                  Definitions, distinctions, diagrams,
                  code walkthroughs, examples, common
                  mistakes, recall and practice.
                </span>
              </div>
            </article>

            <article>
              <b>03</b>

              <div>
                <strong>
                  Account-based access
                </strong>

                <span>
                  Your CURIO account identifies the
                  learner and verified payment records
                  control Academy access.
                </span>
              </div>
            </article>
          </div>
        </div>

        <aside className="checkout-card">
          <span className="section-label">
            CURRENT OFFER
          </span>

          <div className="checkout-price">
            <span>
              ₹
            </span>

            <strong>
              1
            </strong>

            <small>
              test price
            </small>
          </div>

          <div className="checkout-status">
            <b>
              {statusLabel}
            </b>

            <span>
              Access status:{" "}
              {accessStatus}
            </span>

            {membership && (
              <span>
                Plan:{" "}
                {
                  membership.plan_name
                }
              </span>
            )}
          </div>

          <ul>
            <li>
              {hasAcademyAccess
                ? "Full Academy access is active"
                : "Unlock the complete Academy curriculum"}
            </li>

            <li>
              Structured lessons and concept maps
            </li>

            <li>
              Code walkthroughs and practice checkpoints
            </li>

            <li>
              Membership connected to your CURIO account
            </li>
          </ul>

          {hasAcademyAccess ? (
            <Link
              className="checkout-primary"
              to="/academy"
            >
              Open full Academy
            </Link>
          ) : !user ? (
            <Link
              className="checkout-primary"
              to="/login"
            >
              Sign in to continue
            </Link>
          ) : (
            <button
              type="button"
              className="checkout-primary checkout-button"
              disabled={
                starting ||
                authLoading ||
                membershipLoading
              }
              onClick={() => {
                void beginCheckout();
              }}
            >
              {starting
                ? "Preparing secure payment..."
                : "Continue to secure ₹1 payment"}
            </button>
          )}

          {message && (
            <p
              className="checkout-message"
              role="alert"
            >
              {message}
            </p>
          )}

          <small className="checkout-fineprint">
            Payment success in the browser alone does
            not activate membership. CURIO waits for
            trusted server-side confirmation.
          </small>
        </aside>
      </section>

      <section className="checkout-security checkout-security-wide">
        <div>
          <span className="section-label">
            PAYMENT & ACCESS ARCHITECTURE
          </span>

          <h2>
            Membership access should always be
            verifiable.
          </h2>

          <p>
            A frontend button, local storage value or
            modified URL must never be able to turn a
            user into a paid Academy member.
          </p>
        </div>

        <div className="security-grid">
          <article>
            <strong>
              1. Supabase Auth
            </strong>

            <p>
              The signed-in learner provides a stable
              CURIO account identity.
            </p>
          </article>

          <article>
            <strong>
              2. Edge Function
            </strong>

            <p>
              The backend creates the Razorpay order
              while payment secrets remain outside the
              browser.
            </p>
          </article>

          <article>
            <strong>
              3. Signed webhook
            </strong>

            <p>
              Razorpay confirms successful payment to
              the server.
            </p>
          </article>

          <article>
            <strong>
              4. Academy entitlement
            </strong>

            <p>
              Verified payment updates the membership
              record used by CURIO to grant Academy
              access.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}