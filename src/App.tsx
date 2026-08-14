import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/Signup";
import Guest from "./pages/Guest";

import Dashboard from "./pages/dashboard/Dashboard";
import Learn from "./pages/dashboard/Learn";
import Practice from "./pages/dashboard/Practice";

import Lesson1 from "./pages/dashboard/Lesson1";
import Lesson2 from "./pages/dashboard/Lesson2";
import Lesson3 from "./pages//dashboard/Lesson3";
import Lesson4 from "./pages//dashboard/Lesson4";
import Lesson5 from "./pages/dashboard/Lesson5";
import Lesson6 from "./pages/dashboard/Lesson6";
import Lesson7 from "./pages/dashboard/Lesson7";
import Lesson8 from "./pages/dashboard/Lesson8";

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
            CURIO PRACTICE
        ========================================== */}

        <Route
          path="/practice"
          element={<Practice />}
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