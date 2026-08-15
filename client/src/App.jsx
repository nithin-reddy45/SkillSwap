import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "./socket";

import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import CallModal from "./components/CallModal.jsx";

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
  const [activeCall, setActiveCall] = useState(null);

  // =========================
  // SOCKET CONNECTION & GLOBAL CALL LISTENER
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
        console.error(
          "Error connecting socket:",
          error
        );
      }
    };

    connectSocket();

    // Global incoming call handler from Socket
    const handleIncomingCall = (data) => {
      setActiveCall({
        partnerId: data.from,
        partnerName: data.fromName || "Skill Partner",
        isVideo: data.isVideo,
        isInitiator: false,
        incomingCallData: data,
      });
    };

    // Global start call handler triggered from Chat or anywhere
    const handleStartCall = (event) => {
      const { partnerId, partnerName, isVideo } = event.detail;
      setActiveCall({
        partnerId,
        partnerName,
        isVideo,
        isInitiator: true,
        incomingCallData: null,
      });
    };

    socket.on("incomingCall", handleIncomingCall);
    window.addEventListener("startCall", handleStartCall);

    return () => {
      socket.off("incomingCall", handleIncomingCall);
      window.removeEventListener("startCall", handleStartCall);
    };

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
        <Route
          path="/find-matches"
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
        <Route
          path="/my-connections"
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

      {/* GLOBAL WEBRTC CALL MODAL (CALLER & RECEIVER) */}
      {activeCall && (
        <CallModal
          isOpen={!!activeCall}
          onClose={() => setActiveCall(null)}
          callType={activeCall.isVideo ? "video" : "voice"}
          partnerId={activeCall.partnerId}
          partnerName={activeCall.partnerName || "Skill Partner"}
          currentUserId={
            (() => {
              try {
                const u = JSON.parse(localStorage.getItem("user"));
                return u?._id || u?.id;
              } catch {
                return null;
              }
            })()
          }
          currentUserName={
            (() => {
              try {
                return JSON.parse(localStorage.getItem("user"))?.name || "User";
              } catch {
                return "User";
              }
            })()
          }
          incomingCallData={activeCall.incomingCallData}
          isInitiator={activeCall.isInitiator}
        />
      )}
    </>
  );
}

export default App;