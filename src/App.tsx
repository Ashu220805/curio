import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/Signup";
import Guest from "./pages/Guest";
import Dashboard from "./pages/dashboard/Dashboard";
import Learn from "./pages/dashboard/Learn";
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

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

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

        <Route
          path="/learn/lesson/3"
          element={<Lesson3 />}
        />

        <Route
          path="/learn/lesson/4"
          element={<Lesson4 />}
        />

        <Route
          path="/learn/lesson/5"
          element={<Lesson5 />}
        />

        <Route
          path="/learn/lesson/6"
          element={<Lesson6 />}
        />

        <Route
          path="/learn/lesson/7"
          element={<Lesson7 />}
        />

        <Route
          path="/learn/lesson/8"
          element={<Lesson8 />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;