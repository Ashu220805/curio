import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

// =========================================================
// AUTHENTICATION
// =========================================================

import Login from "./pages/auth/Login.tsx";
import SignUp from "./pages/auth/Signup.tsx";
import Guest from "./pages/Guest.tsx";

import ProtectedRoute from "./components/auth/ProtectedRoute.tsx";
import OnboardingRoute from "./components/auth/OnboardingRoute.tsx";

// =========================================================
// ONBOARDING
// =========================================================

import Onboarding from "./pages/onboarding/Onboarding.tsx";

// =========================================================
// DASHBOARD / MAIN PAGES
// =========================================================

import Dashboard from "./pages/dashboard/Dashboard.tsx";
import Learn from "./pages/dashboard/Learn.tsx";
import Practice from "./pages/dashboard/Practice.tsx";
import RealityCheck from "./pages/dashboard/RealityCheck.tsx";
import AISimulation from "./pages/dashboard/AISimulation.tsx";

// =========================================================
// LESSONS
// =========================================================

import Lesson1 from "./pages/dashboard/Lesson1.tsx";
import Lesson2 from "./pages/dashboard/Lesson2.tsx";
import Lesson3 from "./pages/dashboard/Lesson3.tsx";
import Lesson4 from "./pages/dashboard/Lesson4.tsx";
import Lesson5 from "./pages/dashboard/Lesson5.tsx";
import Lesson6 from "./pages/dashboard/Lesson6.tsx";
import Lesson7 from "./pages/dashboard/Lesson7.tsx";
import Lesson8 from "./pages/dashboard/Lesson8.tsx";

// =========================================================
// APP
// =========================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        {/* Root */}
        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Sign Up */}
        <Route
          path="/signup"
          element={<SignUp />}
        />

        {/* Guest Entry */}
        <Route
          path="/guest"
          element={<Guest />}
        />


        {/* =================================================
            ONBOARDING
        ================================================= */}

        {/*
          Authentication is required.

          If the user is not logged in:
              /login

          If the user is logged in:
              Onboarding page opens.

          Onboarding.tsx itself checks whether the user
          has already completed onboarding and redirects
          completed users to /dashboard.
        */}

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            AUTHENTICATED APPLICATION
        ================================================= */}

        {/*
          IMPORTANT:

          These routes use OnboardingRoute instead of
          ProtectedRoute.

          Therefore:

          Not logged in
                ↓
             /login

          Logged in + onboarding incomplete
                ↓
             /onboarding

          Logged in + onboarding complete
                ↓
             requested page
        */}


        {/* =================================================
            DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <OnboardingRoute>
              <Dashboard />
            </OnboardingRoute>
          }
        />


        {/* =================================================
            LEARN
        ================================================= */}

        {/*
          Guest users can still access Learn.

          Authenticated users can also access it.

          NOTE:
          We are preserving your existing guest architecture.
        */}

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
        ================================================= */}

        {/*
          AI Simulation is a CURIO account feature.

          Authentication required.
          Onboarding completion required.
        */}

        <Route
          path="/ai-simulation"
          element={
            <OnboardingRoute>
              <AISimulation />
            </OnboardingRoute>
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
    </BrowserRouter>
  );
}

export default App;