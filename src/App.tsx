import {
  lazy,
  Suspense,
  type ReactNode,
} from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
// =========================================================
// AUTHENTICATION
// =========================================================

import Login from "./pages/auth/Login.tsx";
import SignUp from "./pages/auth/Signup.tsx";
import Guest from "./pages/Guest.tsx";

import ProtectedRoute from "./components/auth/ProtectedRoute.tsx";
import OnboardingRoute from "./components/auth/OnboardingRoute.tsx";

import "./styles/GlobalBackButton.css";
// =========================================================
// LEGAL / INFORMATION PAGES
// =========================================================

import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";

// =========================================================
// DASHBOARD / MAIN PAGES
// =========================================================

const Dashboard = lazy(
  () =>
    import(
      "./pages/dashboard/Dashboard.tsx"
    ),
);

const Learn = lazy(
  () =>
    import(
      "./pages/dashboard/Learn.tsx"
    ),
);

const Practice = lazy(
  () =>
    import(
      "./pages/dashboard/Practice.tsx"
    ),
);

const RealityCheck = lazy(
  () =>
    import(
      "./pages/dashboard/RealityCheck.tsx"
    ),
);

const AISimulation = lazy(
  () =>
    import(
      "./pages/dashboard/AISimulation.tsx"
    ),
);

const Academy = lazy(
  () => import("./pages/public/Academy.tsx"),
);

const ConceptLibrary = lazy(
  () => import("./pages/public/ConceptLibrary.tsx"),
);

const CodeLab = lazy(
  () => import("./pages/public/CodeLab.tsx"),
);

const AcademyCheckout = lazy(
  () => import("./pages/public/AcademyCheckout.tsx"),
);

const AcademyLesson = lazy(
  () => import("./pages/public/AcademyLesson.tsx"),
);

// =========================================================
// LESSONS
// =========================================================

const Lesson1 = lazy(
  () =>
    import(
      "./pages/dashboard/Lesson1.tsx"
    ),
);

const Lesson2 = lazy(
  () =>
    import(
      "./pages/dashboard/Lesson2.tsx"
    ),
);

const Lesson3 = lazy(
  () =>
    import(
      "./pages/dashboard/Lesson3.tsx"
    ),
);

const Lesson4 = lazy(
  () =>
    import(
      "./pages/dashboard/Lesson4.tsx"
    ),
);

const Lesson5 = lazy(
  () =>
    import(
      "./pages/dashboard/Lesson5.tsx"
    ),
);

const Lesson6 = lazy(
  () =>
    import(
      "./pages/dashboard/Lesson6.tsx"
    ),
);

const Lesson7 = lazy(
  () =>
    import(
      "./pages/dashboard/Lesson7.tsx"
    ),
);

const Lesson8 = lazy(
  () =>
    import(
      "./pages/dashboard/Lesson8.tsx"
    ),
);

// =========================================================
// LOADING SCREEN
// =========================================================

function RouteLoadingScreen() {
  return (
    <div
      className="auth-loading-screen"
      role="status"
      aria-live="polite"
      aria-label="Loading CURIO"
    >
      <div
        className="auth-loading-spinner"
        aria-hidden="true"
      />

      <p>Loading CURIO...</p>
    </div>
  );
}

// =========================================================
// GLOBAL BACK BUTTON
// =========================================================
//
// Kept at App level so existing page code does not need
// to be rewritten. Login, Signup and Guest are excluded.
// All other CURIO routes receive the same Back control.
//
function GlobalBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenPaths = [
    "/",
    "/login",
    "/signup",
    "/guest",
    // These pages already provide their own navigation.
    "/dashboard",
    "/academy",
    "/academy/checkout",
  ];

  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  const handleBack = () => {
    // Only go back when React Router has a same-tab history entry.
    // Otherwise a direct visit must stay inside CURIO.
    const historyState = window.history.state as
      | { idx?: unknown }
      | null;

    const historyIndex =
      typeof historyState?.idx === "number"
        ? historyState.idx
        : 0;

    if (historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <button
      type="button"
      className="curio-global-back-button"
      onClick={handleBack}
      aria-label="Go back"
      title="Go back"
    >
      <span
        className="curio-global-back-button-arrow"
        aria-hidden="true"
      >
        ←
      </span>
      <span>Back</span>
    </button>
  );
}


// =========================================================
// MEMBER ROUTE
// =========================================================
//
// Authenticated users:
//     ProtectedRoute
//           ↓
//     OnboardingRoute
//           ↓
//     Requested page
//
// Guests are NOT handled here.
// Guest mode has its own routing logic.
// =========================================================

function MemberRoute({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute>
      <OnboardingRoute>
        {children}
      </OnboardingRoute>
    </ProtectedRoute>
  );
}

// =========================================================
// GUEST CHECK
// =========================================================
//
// Guest mode is intentionally stored in sessionStorage.
//
// This function does NOT use Supabase authentication.
// Guest mode is a browser-session state.
// =========================================================

function isGuestMode(): boolean {
  try {
    return (
      sessionStorage.getItem(
        "curio_guest",
      ) === "true"
    );
  } catch (error) {
    console.error(
      "CURIO: Unable to read Guest Mode.",
      error,
    );

    return false;
  }
}

// =========================================================
// DASHBOARD ENTRY
// =========================================================
//
// IMPORTANT:
//
// Guest → Dashboard directly
//
// Member → ProtectedRoute → OnboardingRoute → Dashboard
//
// This prevents ProtectedRoute from incorrectly sending
// a guest user back to /login.
// =========================================================

function DashboardEntry() {
  if (isGuestMode()) {
    return <Dashboard />;
  }

  return (
    <MemberRoute>
      <Dashboard />
    </MemberRoute>
  );
}

// =========================================================
// APP
// =========================================================

function App() {
  return (
    <BrowserRouter>
      <GlobalBackButton />

      <Suspense
        fallback={
          <RouteLoadingScreen />
        }
      >
        <Routes>

          {/* =================================================
              DEFAULT ROUTE
          ================================================= */}

          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

          {/* =================================================
              AUTHENTICATION
          ================================================= */}

          <Route
            path="/academy"
            element={<Academy />}
          />

          <Route
            path="/academy/checkout"
            element={<AcademyCheckout />}
          />

          <Route
            path="/academy/lesson/:order"
            element={<AcademyLesson />}
          />

          <Route
            path="/concepts"
            element={<ConceptLibrary />}
          />

          <Route
            path="/code-lab"
            element={<CodeLab />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<SignUp />}
          />

          {/* =================================================
              GUEST LANDING PAGE
          ================================================= */}

          <Route
            path="/guest"
            element={<Guest />}
          />

          {/* =================================================
              TERMS & CONDITIONS
          ================================================= */}

          <Route
            path="/terms"
            element={<Terms />}
          />

          {/* =================================================
              PRIVACY POLICY
          ================================================= */}

          <Route
            path="/privacy"
            element={<Privacy />}
          />

          {/* =================================================
              DASHBOARD
          =================================================
          
              Guest:
                  sessionStorage curio_guest=true
                  ↓
                  Dashboard directly

              Member:
                  ProtectedRoute
                  ↓
                  OnboardingRoute
                  ↓
                  Dashboard
          ================================================= */}

          <Route
            path="/dashboard"
            element={
              <DashboardEntry />
            }
          />

          {/* =================================================
              LEARN
              
              Guests + authenticated members
          ================================================= */}

          <Route
            path="/learn"
            element={
              <ProtectedRoute allowGuest>
                <Learn />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              PRACTICE
              
              Guests + authenticated members
          ================================================= */}

          <Route
            path="/practice"
            element={
              <ProtectedRoute allowGuest>
                <Practice />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              REALITY CHECK
              
              Guests + authenticated members
          ================================================= */}

          <Route
            path="/reality-check"
            element={
              <ProtectedRoute allowGuest>
                <RealityCheck />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              AI SIMULATION
              
              Members only
          ================================================= */}

          <Route
            path="/ai-simulation"
            element={
              <MemberRoute>
                <AISimulation />
              </MemberRoute>
            }
          />

          {/* =================================================
              LESSON 1
          ================================================= */}

          <Route
            path="/learn/lesson/1"
            element={
              <ProtectedRoute allowGuest>
                <Lesson1 />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              LESSON 2
          ================================================= */}

          <Route
            path="/learn/lesson/2"
            element={
              <ProtectedRoute allowGuest>
                <Lesson2 />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              LESSON 3
          ================================================= */}

          <Route
            path="/learn/lesson/3"
            element={
              <ProtectedRoute allowGuest>
                <Lesson3 />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              LESSON 4
          ================================================= */}

          <Route
            path="/learn/lesson/4"
            element={
              <ProtectedRoute allowGuest>
                <Lesson4 />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              LESSON 5
          ================================================= */}

          <Route
            path="/learn/lesson/5"
            element={
              <ProtectedRoute allowGuest>
                <Lesson5 />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              LESSON 6
          ================================================= */}

          <Route
            path="/learn/lesson/6"
            element={
              <ProtectedRoute allowGuest>
                <Lesson6 />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              LESSON 7
          ================================================= */}

          <Route
            path="/learn/lesson/7"
            element={
              <ProtectedRoute allowGuest>
                <Lesson7 />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              LESSON 8
          ================================================= */}

          <Route
            path="/learn/lesson/8"
            element={
              <ProtectedRoute allowGuest>
                <Lesson8 />
              </ProtectedRoute>
            }
          />
          <Route
  path="/reset-password"
  element={<ResetPassword />}
/>

          {/* =================================================
              UNKNOWN ROUTES
          ================================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;