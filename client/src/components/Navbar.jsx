import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "../socket";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [requestCount, setRequestCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

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

    // Clear notification counts
    setRequestCount(0);
    setUnreadCount(0);

    // Go to login page
    navigate("/login");
  };

  // ============================
  // NOTIFICATIONS + SOCKET
  // ============================
  useEffect(() => {
    const token = localStorage.getItem("token");

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
    if (!token || !user) {
      return;
    }

    const currentUserId = user._id || user.id;

    // Fetch connection request count
    const fetchRequestCount = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/connections/requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
          "http://localhost:5000/api/messages/unread/count",
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
  }, []);

  const token = localStorage.getItem("token");

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        SkillSwap AI
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
              🔔 Messages

              {unreadCount > 0 && (
                <span className="message-badge">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </Link>

            <button
              className="nav-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}

        {!token && (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;