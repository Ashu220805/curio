import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// =========================================
// AUTHENTICATION
// =========================================
import Login from "./pages/auth/Login.tsx";
import SignUp from "./pages/auth/Signup.tsx";
import Guest from "./pages/Guest.tsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.tsx";

// =========================================
// DASHBOARD / MAIN PAGES
// =========================================
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import Learn from "./pages/dashboard/Learn.tsx";
import Practice from "./pages/dashboard/Practice.tsx";
import RealityCheck from "./pages/dashboard/RealityCheck.tsx";
import AISimulation from "./pages/dashboard/AISimulation.tsx";

// =========================================
// LESSONS
// =========================================
import Lesson1 from "./pages/dashboard/Lesson1.tsx";
import Lesson2 from "./pages/dashboard/Lesson2.tsx";
import Lesson3 from "./pages/dashboard/Lesson3.tsx";
import Lesson4 from "./pages/dashboard/Lesson4.tsx";
import Lesson5 from "./pages/dashboard/Lesson5.tsx";
import Lesson6 from "./pages/dashboard/Lesson6.tsx";
import Lesson7 from "./pages/dashboard/Lesson7.tsx";
import Lesson8 from "./pages/dashboard/Lesson8.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================================
            DEFAULT ROUTE
        ========================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* =========================================
            PUBLIC AUTHENTICATION ROUTES
        ========================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<SignUp />}
        />

        <Route
          path="/guest"
          element={<Guest />}
        />


        {/* =========================================
            PROTECTED CURIO APPLICATION
        ========================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            CURIO LEARN AI
        ========================================== */}

        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <Learn />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            CURIO AI SIMULATION
        ========================================== */}

        <Route
          path="/ai-simulation"
          element={
            <ProtectedRoute>
              <AISimulation />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            CURIO PRACTICE
        ========================================== */}

        <Route
          path="/practice"
          element={
            <ProtectedRoute>
              <Practice />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            CURIO REALITY CHECK
        ========================================== */}

        <Route
          path="/reality-check"
          element={
            <ProtectedRoute>
              <RealityCheck />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            CURIO LESSON 1
        ========================================== */}

        <Route
          path="/learn/lesson/1"
          element={
            <ProtectedRoute>
              <Lesson1 />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            CURIO LESSON 2
        ========================================== */}

        <Route
          path="/learn/lesson/2"
          element={
            <ProtectedRoute>
              <Lesson2 />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            CURIO LESSON 3
        ========================================== */}

        <Route
          path="/learn/lesson/3"
          element={
            <ProtectedRoute>
              <Lesson3 />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            CURIO LESSON 4
        ========================================== */}

        <Route
          path="/learn/lesson/4"
          element={
            <ProtectedRoute>
              <Lesson4 />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            CURIO LESSON 5
        ========================================== */}

        <Route
          path="/learn/lesson/5"
          element={
            <ProtectedRoute>
              <Lesson5 />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            CURIO LESSON 6
        ========================================== */}

        <Route
          path="/learn/lesson/6"
          element={
            <ProtectedRoute>
              <Lesson6 />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            CURIO LESSON 7
        ========================================== */}

        <Route
          path="/learn/lesson/7"
          element={
            <ProtectedRoute>
              <Lesson7 />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            CURIO LESSON 8
        ========================================== */}

        <Route
          path="/learn/lesson/8"
          element={
            <ProtectedRoute>
              <Lesson8 />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            INVALID ROUTES
        ========================================== */}

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