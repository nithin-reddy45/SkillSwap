import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { socket } from "./socket";

import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

import NotFound from "./pages/NotFound.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import FindMatches from "./pages/FindMatches.jsx";
import Requests from "./pages/Requests.jsx";
import MyConnections from "./pages/MyConnections.jsx";
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

        if (!user?._id) return;

        // Connect socket
        if (!socket.connected) {
          socket.connect();

          // Join after socket connects
          socket.once("connect", () => {
            socket.emit("join", user._id);
          });
        } else {
          // If already connected
          socket.emit("join", user._id);
        }

      } catch (error) {
        console.error(
          "Error connecting socket:",
          error
        );
      }
    };

    connectSocket();

  }, []);


  return (
    <>
      <Navbar />

      <Routes>

        {/* ========================= */}
        {/* PUBLIC ROUTES */}
        {/* ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ========================= */}
        {/* PROTECTED ROUTES */}
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


        {/* CONNECTION REQUESTS */}
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          }
        />


        {/* MY CONNECTIONS */}
        <Route
          path="/connections"
          element={
            <ProtectedRoute>
              <MyConnections />
            </ProtectedRoute>
          }
        />


        {/* MESSAGES */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />


        {/* CHAT */}
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

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </>
  );
}

export default App;