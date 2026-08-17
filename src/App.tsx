import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login.tsx";
import SignUp from "./pages/auth/Signup.tsx";
import Guest from "./pages/Guest.tsx";

import Dashboard from "./pages/dashboard/Dashboard.tsx";
import Learn from "./pages/dashboard/Learn.tsx";
import Practice from "./pages/dashboard/Practice.tsx";
import RealityCheck from "./pages/dashboard/RealityCheck.tsx";
import AISimulation from "./pages/dashboard/AISimulation.tsx";

import Lesson1 from "./pages/dashboard/Lesson1.tsx";
import Lesson2 from "./pages/dashboard/Lesson2.tsx";
import Lesson3 from "./pages//dashboard/Lesson3.tsx";
import Lesson4 from "./pages//dashboard/Lesson4.tsx";
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
          element={<Navigate to="/login" replace />}
        />


        {/* =========================================
            AUTHENTICATION
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
            CURIO DASHBOARD
        ========================================== */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =========================================
            CURIO LEARN AI
        ========================================== */}

        <Route
          path="/learn"
          element={<Learn />}
        />


        {/* =========================================
            CURIO AI SIMULATION
        ========================================== */}

        <Route
          path="/ai-simulation"
          element={<AISimulation />}
        />


        {/* =========================================
            CURIO PRACTICE
        ========================================== */}

        <Route
          path="/practice"
          element={<Practice />}
        />


        {/* =========================================
            CURIO REALITY CHECK
        ========================================== */}

        <Route
          path="/reality-check"
          element={<RealityCheck />}
        />


        {/* =========================================
            CURIO LESSON 1
        ========================================== */}

        <Route
          path="/learn/lesson/1"
          element={<Lesson1 />}
        />


        {/* =========================================
            CURIO LESSON 2
        ========================================== */}

        <Route
          path="/learn/lesson/2"
          element={<Lesson2 />}
        />


        {/* =========================================
            CURIO LESSON 3
        ========================================== */}

        <Route
          path="/learn/lesson/3"
          element={<Lesson3 />}
        />


        {/* =========================================
            CURIO LESSON 4
        ========================================== */}

        <Route
          path="/learn/lesson/4"
          element={<Lesson4 />}
        />


        {/* =========================================
            CURIO LESSON 5
        ========================================== */}

        <Route
          path="/learn/lesson/5"
          element={<Lesson5 />}
        />


        {/* =========================================
            CURIO LESSON 6
        ========================================== */}

        <Route
          path="/learn/lesson/6"
          element={<Lesson6 />}
        />


        {/* =========================================
            CURIO LESSON 7
        ========================================== */}

        <Route
          path="/learn/lesson/7"
          element={<Lesson7 />}
        />


        {/* =========================================
            CURIO LESSON 8
        ========================================== */}

        <Route
          path="/learn/lesson/8"
          element={<Lesson8 />}
        />


        {/* =========================================
            INVALID ROUTES
        ========================================== */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;