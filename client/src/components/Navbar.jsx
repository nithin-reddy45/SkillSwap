import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import { useTheme } from "../context/ThemeContext";
import { API_BASE_URL } from "../config/api";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [requestCount, setRequestCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Listen for auth state changes across the app
  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem("token"));
      try {
        const stored = localStorage.getItem("user");
        setCurrentUser(stored ? JSON.parse(stored) : null);
      } catch {
        setCurrentUser(null);
      }
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
    if (socket.connected) {
      socket.disconnect();
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setRequestCount(0);
    setUnreadCount(0);
    setToken(null);
    setCurrentUser(null);
    setIsProfileDropdownOpen(false);

    window.dispatchEvent(new Event("authChanged"));
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
      if (storedUser) user = JSON.parse(storedUser);
    } catch (error) {
      console.error("User parsing error:", error);
    }

    if (!currentToken || !user) return;

    const currentUserId = user._id || user.id;

    // Fetch connection request count
    const fetchRequestCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/connections/requests`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        setRequestCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.error("Request Notification Error:", error);
      }
    };

    // Fetch unread message count
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/messages/unread/count`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error("Unread Message Error:", error);
      }
    };

    fetchRequestCount();
    fetchUnreadCount();

    const handleRequestUpdated = () => fetchRequestCount();
    const handleMessageRead = () => fetchUnreadCount();

    window.addEventListener("requestUpdated", handleRequestUpdated);
    window.addEventListener("messageRead", handleMessageRead);

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("join", currentUserId);

    const handleReceiveMessage = () => fetchUnreadCount();
    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      window.removeEventListener("requestUpdated", handleRequestUpdated);
      window.removeEventListener("messageRead", handleMessageRead);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [token]);

  // User initials for avatar
  const userInitials = currentUser?.name
    ? currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-container">
        
        {/* BRAND LOGO */}
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-icon">
            <span>⚡</span>
          </div>
          <div className="brand-title-wrap">
            <span className="brand-title">SkillSwap</span>
            <span className="brand-ai-badge">AI</span>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <div className="navbar-nav-center">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/courses"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">🎓</span>
            <span>Tutorials</span>
          </NavLink>

          <NavLink
            to="/coding-test"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">⚡</span>
            <span>Coding Arena</span>
            <span className="nav-highlight-dot"></span>
          </NavLink>

          {token && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">📊</span>
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/matches"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">🔍</span>
                <span>Find Matches</span>
              </NavLink>

              <NavLink
                to="/requests"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">📬</span>
                <span>Requests</span>
                {requestCount > 0 && (
                  <span className="nav-pill-badge">{requestCount > 99 ? "99+" : requestCount}</span>
                )}
              </NavLink>

              <NavLink
                to="/connections"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">🤝</span>
                <span>Connections</span>
              </NavLink>

              <NavLink
                to="/messages"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">💬</span>
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="nav-pill-badge message-color">{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
              </NavLink>
            </>
          )}
        </div>

        {/* RIGHT CONTROLS: THEME TOGGLE, PROFILE / AUTH */}
        <div className="navbar-controls-right">
          
          {/* Theme Toggle Button */}
          <button
            className="theme-switch-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            <span className="theme-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
          </button>

          {token ? (
            /* USER PROFILE CAPSULE & DROPDOWN */
            <div className="user-profile-menu" ref={dropdownRef}>
              <button
                className={`profile-capsule-btn ${isProfileDropdownOpen ? "active" : ""}`}
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <div className="user-avatar-circle">
                  <span>{userInitials}</span>
                  <span className="online-indicator-dot"></span>
                </div>
                <div className="user-capsule-info">
                  <span className="user-capsule-name">{currentUser?.name || "My Account"}</span>
                </div>
                <span className="dropdown-arrow-icon">{isProfileDropdownOpen ? "▲" : "▼"}</span>
              </button>

              {/* DROPDOWN MENU */}
              {isProfileDropdownOpen && (
                <div className="profile-dropdown-card">
                  <div className="dropdown-user-header">
                    <div className="dropdown-avatar">{userInitials}</div>
                    <div className="dropdown-info">
                      <strong>{currentUser?.name || "SkillSwap User"}</strong>
                      <span>{currentUser?.email || "Signed In"}</span>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <Link to="/profile" className="dropdown-link" onClick={() => setIsProfileDropdownOpen(false)}>
                    <span>👤</span> View & Edit Profile
                  </Link>
                  <Link to="/dashboard" className="dropdown-link" onClick={() => setIsProfileDropdownOpen(false)}>
                    <span>📊</span> Learning Dashboard
                  </Link>
                  <Link to="/coding-test" className="dropdown-link" onClick={() => setIsProfileDropdownOpen(false)}>
                    <span>⚡</span> Coding Challenges & Arena
                  </Link>
                  <Link to="/courses" className="dropdown-link" onClick={() => setIsProfileDropdownOpen(false)}>
                    <span>🎓</span> Curated Tutorials
                  </Link>

                  <div className="dropdown-divider" />

                  <button className="dropdown-logout-btn" onClick={handleLogout}>
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* GUEST AUTH BUTTONS */
            <div className="auth-buttons-group">
              <Link to="/login" className="nav-btn-login">
                Sign In
              </Link>
              <Link to="/register" className="nav-btn-register">
                Get Started →
              </Link>
            </div>
          )}

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            className={`mobile-hamburger-btn ${isMobileMenuOpen ? "open" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

        </div>

      </nav>

      {/* MOBILE DRAWER NAVIGATION */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-menu">
          <div className="mobile-links-list">
            <NavLink to="/" end className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
              <span>🏠</span> Home
            </NavLink>
            <NavLink to="/courses" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
              <span>🎓</span> Tutorials & Courses
            </NavLink>
            <NavLink to="/coding-test" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
              <span>⚡</span> Coding Arena & Tests
            </NavLink>

            {token ? (
              <>
                <NavLink to="/dashboard" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>📊</span> Dashboard
                </NavLink>
                <NavLink to="/matches" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>🔍</span> Find Matches
                </NavLink>
                <NavLink to="/requests" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>📬</span> Connection Requests {requestCount > 0 && <span className="drawer-badge">{requestCount}</span>}
                </NavLink>
                <NavLink to="/connections" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>🤝</span> My Connections
                </NavLink>
                <NavLink to="/messages" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>💬</span> Messages {unreadCount > 0 && <span className="drawer-badge">{unreadCount}</span>}
                </NavLink>
                <NavLink to="/profile" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>👤</span> My Profile
                </NavLink>
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  <span>🚪</span> Sign Out
                </button>
              </>
            ) : (
              <div className="mobile-auth-row">
                <Link to="/login" className="mobile-login-btn" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="mobile-register-btn" onClick={() => setIsMobileMenuOpen(false)}>
                  Get Started →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;