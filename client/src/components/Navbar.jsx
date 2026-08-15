import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "../socket";
import { useTheme } from "../context/ThemeContext";
import { API_BASE_URL } from "../config/api";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [requestCount, setRequestCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Listen for auth state changes across the app
  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("authChanged", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  // ============================
  // LOGOUT
  // ============================
  const handleLogout = () => {
    // Disconnect Socket.IO
    if (socket.connected) {
      socket.disconnect();
    }

    // Remove user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear notification counts & state
    setRequestCount(0);
    setUnreadCount(0);
    setToken(null);

    window.dispatchEvent(new Event("authChanged"));

    // Go to login page
    navigate("/login");
  };

  // ============================
  // NOTIFICATIONS + SOCKET
  // ============================
  useEffect(() => {
    const currentToken = localStorage.getItem("token");

    let user = null;

    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        user = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("User parsing error:", error);
    }

    // If user is not logged in
    if (!currentToken || !user) {
      return;
    }

    const currentUserId = user._id || user.id;

    // Fetch connection request count
    const fetchRequestCount = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/connections/requests`,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        setRequestCount(
          Array.isArray(data) ? data.length : 0
        );
      } catch (error) {
        console.error(
          "Request Notification Error:",
          error
        );
      }
    };

    // Fetch unread message count
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/messages/unread/count`,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        setUnreadCount(
          data.unreadCount || 0
        );
      } catch (error) {
        console.error(
          "Unread Message Error:",
          error
        );
      }
    };

    // Initial API calls
    fetchRequestCount();
    fetchUnreadCount();

    // Update request count
    const handleRequestUpdated = () => {
      fetchRequestCount();
    };

    window.addEventListener(
      "requestUpdated",
      handleRequestUpdated
    );

    // Update unread count when messages are read
    const handleMessageRead = () => {
      fetchUnreadCount();
    };

    window.addEventListener(
      "messageRead",
      handleMessageRead
    );

    // Connect shared socket
    if (!socket.connected) {
      socket.connect();
    }

    // Join user's personal room
    socket.emit(
      "join",
      currentUserId
    );

    // New message received
    const handleReceiveMessage = () => {
      fetchUnreadCount();
    };

    socket.on(
      "receiveMessage",
      handleReceiveMessage
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "requestUpdated",
        handleRequestUpdated
      );

      window.removeEventListener(
        "messageRead",
        handleMessageRead
      );

      socket.off(
        "receiveMessage",
        handleReceiveMessage
      );
    };
  }, [token]);

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="logo-icon">⚡</span>
        <span className="logo-text">SkillSwap <span className="logo-ai">AI</span></span>
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {token && (
          <>
            <Link to="/dashboard">
              Dashboard
            </Link>
            <Link to="/profile">
              👤 Profile
            </Link>

            <Link to="/matches">
              Find Matches
            </Link>

            <Link
              to="/requests"
              className="requests-link"
            >
              Requests

              {requestCount > 0 && (
                <span className="notification-badge">
                  {requestCount > 99
                    ? "99+"
                    : requestCount}
                </span>
              )}
            </Link>

            <Link to="/connections">
              Connections
            </Link>

            <Link
              to="/messages"
              className="messages-link"
            >
              💬 Messages

              {unreadCount > 0 && (
                <span className="message-badge">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </Link>
          </>
        )}

        {/* Theme Toggle Button */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {token ? (
          <button
            className="nav-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="nav-login-btn">
              Login
            </Link>

            <Link to="/register" className="nav-register-btn">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;