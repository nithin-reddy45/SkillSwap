import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { socket } from "./socket";

import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import AiAssistantModal from "./components/AiAssistantModal.jsx";

import NotFound from "./pages/NotFound.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import SkillAssessment from "./pages/SkillAssessment.jsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import FindMatches from "./pages/FindMatches.jsx";
import Requests from "./pages/Requests.jsx";
import Connections from "./pages/Connections.jsx";
import Sessions from "./pages/Sessions.jsx";
import Notifications from "./pages/Notifications.jsx";
import Profile from "./pages/Profile.jsx";
import Messages from "./pages/Messages.jsx";
import Chat from "./pages/Chat.jsx";

function App() {
  // =========================
  // SOCKET CONNECTION
  // =========================
  useEffect(() => {
    const connectSocket = () => {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) return;

      try {
        const user = JSON.parse(storedUser);
        const userId = user?._id || user?.id;

        if (!userId) return;

        // Connect socket
        if (!socket.connected) {
          socket.connect();

          // Join after socket connects
          socket.once("connect", () => {
            socket.emit("join", userId);
          });
        } else {
          // If already connected
          socket.emit("join", userId);
        }

      } catch (error) {
        console.error("Error connecting socket:", error);
      }
    };

    connectSocket();
  }, []);

  return (
    <>
      <Navbar />

      <Routes>

        {/* ========================= */}
        {/* PUBLIC & AI TOOLS ROUTES */}
        {/* ========================= */}

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* AI Learning & Guidance */}
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/skill-assessment" element={<SkillAssessment />} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />

        {/* ========================= */}
        {/* PROTECTED USER ROUTES */}
        {/* ========================= */}

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* FIND MATCHES */}
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <FindMatches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/find-matches"
          element={<Navigate to="/matches" replace />}
        />

        {/* CONNECTION REQUESTS */}
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          }
        />

        {/* CONNECTIONS */}
        <Route
          path="/connections"
          element={
            <ProtectedRoute>
              <Connections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-connections"
          element={<Navigate to="/connections" replace />}
        />

        {/* SESSIONS HUB */}
        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <Sessions />
            </ProtectedRoute>
          }
        />

        {/* NOTIFICATIONS CENTER */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* MESSAGES & CHAT */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:userId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* NOT FOUND */}
        {/* ========================= */}

        <Route path="*" element={<NotFound />} />

      </Routes>

      {/* GLOBAL FLOATING AI COPILOT */}
      <AiAssistantModal />
    </>
  );
}

export default App;