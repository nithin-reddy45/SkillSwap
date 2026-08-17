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
  const [notifCount, setNotifCount] = useState(0);
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
  const [isAiDropdownOpen, setIsAiDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const aiDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (aiDropdownRef.current && !aiDropdownRef.current.contains(e.target)) {
        setIsAiDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsProfileDropdownOpen(false);
      setIsAiDropdownOpen(false);
    }, 0);
    return () => clearTimeout(timer);
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
    setNotifCount(0);
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

    // Fetch in-app notifications unread count
    const fetchNotifCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        setNotifCount(data.unreadCount || 0);
      } catch (error) {
        console.error("Notif Count Error:", error);
      }
    };

    fetchRequestCount();
    fetchUnreadCount();
    fetchNotifCount();

    const handleRequestUpdated = () => fetchRequestCount();
    const handleMessageRead = () => fetchUnreadCount();
    const handleNotifUpdated = () => fetchNotifCount();

    window.addEventListener("requestUpdated", handleRequestUpdated);
    window.addEventListener("messageRead", handleMessageRead);
    window.addEventListener("notificationUpdated", handleNotifUpdated);

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("join", currentUserId);

    const handleReceiveMessage = () => fetchUnreadCount();
    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      window.removeEventListener("requestUpdated", handleRequestUpdated);
      window.removeEventListener("messageRead", handleMessageRead);
      window.removeEventListener("notificationUpdated", handleNotifUpdated);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [token]);

  // User initials for avatar
  const userInitials = currentUser?.name
    ? currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-container">
        
        {/* BRAND LOGO */}
        <Link to={token ? "/dashboard" : "/"} className="navbar-brand">
          <div className="brand-logo-icon">
            <span>⚡</span>
          </div>
          <div className="brand-title-wrap">
            <span className="brand-title">SkillSwap</span>
            <span className="brand-ai-badge">AI</span>
          </div>
        </Link>

        {/* PRIMARY FOCUSED NAVIGATION LINKS */}
        <div className="navbar-nav-center">
          {token ? (
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </NavLink>
          ) : (
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">🏠</span>
              <span>Home</span>
            </NavLink>
          )}

          <NavLink
            to="/matches"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">🔍</span>
            <span>Find Matches</span>
          </NavLink>

          <NavLink
            to="/connections"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">🤝</span>
            <span>Connections</span>
          </NavLink>

          <NavLink
            to="/sessions"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">📅</span>
            <span>Sessions</span>
          </NavLink>

          {token && (
            <NavLink
              to="/messages"
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">💬</span>
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="nav-pill-badge message-color">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </NavLink>
          )}

          {/* AI LEARNING DROPDOWN */}
          <div className="ai-nav-dropdown-wrapper" ref={aiDropdownRef}>
            <button
              type="button"
              className={`nav-item ai-drop-btn ${
                location.pathname === "/roadmap" ||
                location.pathname === "/skill-assessment" ||
                location.pathname === "/resume-analyzer"
                  ? "active"
                  : ""
              }`}
              onClick={() => setIsAiDropdownOpen(!isAiDropdownOpen)}
            >
              <span className="nav-icon">🧠</span>
              <span>AI Tools</span>
              <span className="nav-drop-arrow">▾</span>
            </button>

            {isAiDropdownOpen && (
              <div className="ai-nav-menu-card">
                <Link
                  to="/skill-assessment"
                  className="ai-menu-link"
                  onClick={() => setIsAiDropdownOpen(false)}
                >
                  <span className="menu-icon">🧠</span>
                  <div>
                    <strong>AI Skill Verification</strong>
                    <p>Take skill tests & earn verified badges</p>
                  </div>
                </Link>
                <Link
                  to="/roadmap"
                  className="ai-menu-link"
                  onClick={() => setIsAiDropdownOpen(false)}
                >
                  <span className="menu-icon">🗺️</span>
                  <div>
                    <strong>AI Learning Roadmap</strong>
                    <p>Customized week-by-week learning goals</p>
                  </div>
                </Link>
                <Link
                  to="/resume-analyzer"
                  className="ai-menu-link"
                  onClick={() => setIsAiDropdownOpen(false)}
                >
                  <span className="menu-icon">📄</span>
                  <div>
                    <strong>Resume Gap Matcher</strong>
                    <p>Detect missing skills & find mentors</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <NavLink
            to="/leaderboard"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">🏆</span>
            <span>Leaderboard</span>
          </NavLink>
        </div>

        {/* RIGHT CONTROLS: NOTIFICATIONS, THEME TOGGLE, PROFILE / AUTH */}
        <div className="navbar-controls-right">
          
          {/* Theme Toggle Button */}
          <button
            className="theme-switch-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            aria-label="Toggle Theme"
          >
            <span className="theme-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
          </button>

          {token && (
            /* SKILL CREDITS PILL */
            <Link
              to="/dashboard"
              className="navbar-credits-badge"
              title="Your Skill Credits balance (Earn +1 credit by teaching, +2 by passing skill assessments)"
            >
              <span className="credits-coin-icon">🪙</span>
              <span className="credits-count-text">
                {currentUser?.skillCredits !== undefined ? currentUser.skillCredits : 5}
              </span>
              <span className="credits-label">Credits</span>
            </Link>
          )}

          {token && (
            /* NOTIFICATIONS BELL */
            <Link
              to="/notifications"
              className={`notif-bell-btn ${location.pathname === "/notifications" ? "active" : ""}`}
              title="Activity & Notifications"
            >
              <span className="bell-icon">🔔</span>
              {notifCount > 0 && (
                <span className="notif-count-badge">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </Link>
          )}

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
                  <Link to="/requests" className="dropdown-link" onClick={() => setIsProfileDropdownOpen(false)}>
                    <span>📬</span> Connection Requests {requestCount > 0 && <span className="dropdown-mini-badge">{requestCount}</span>}
                  </Link>
                  <Link to="/sessions" className="dropdown-link" onClick={() => setIsProfileDropdownOpen(false)}>
                    <span>📅</span> My Learning Sessions
                  </Link>
                  <Link to="/notifications" className="dropdown-link" onClick={() => setIsProfileDropdownOpen(false)}>
                    <span>🔔</span> Notifications Center
                  </Link>

                  <div className="dropdown-divider" />

                  <button className="dropdown-logout-btn" onClick={handleLogout}>
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons-group">
              <Link to="/login" className="login-btn-ghost">
                Sign In
              </Link>
              <Link to="/register" className="register-btn-glow">
                Get Started
              </Link>
            </div>
          )}

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>
        </div>

      </nav>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay">
          <div className="mobile-drawer-card">
            
            <div className="drawer-header">
              <div className="drawer-brand">
                <span className="brand-logo-icon">⚡</span>
                <span className="brand-title">SkillSwap AI</span>
              </div>
              <button
                className="drawer-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mobile-nav-links">
              {token ? (
                <NavLink to="/dashboard" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>📊</span> Dashboard
                </NavLink>
              ) : (
                <NavLink to="/" end className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>🏠</span> Home
                </NavLink>
              )}

              <NavLink to="/matches" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>🔍</span> Find Matches
              </NavLink>

              <NavLink to="/connections" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>🤝</span> Connections
              </NavLink>

              <NavLink to="/sessions" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>📅</span> Sessions
              </NavLink>

              {token && (
                <NavLink to="/messages" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>💬</span> Messages {unreadCount > 0 && <span className="mobile-badge">{unreadCount}</span>}
                </NavLink>
              )}

              <NavLink to="/roadmap" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>🗺️</span> AI Roadmap
              </NavLink>

              <NavLink to="/skill-assessment" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>🧠</span> AI Skill Assessment
              </NavLink>

              <NavLink to="/coding-test" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>⚡</span> Arena Sandbox
              </NavLink>

              <NavLink to="/resume-analyzer" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>📄</span> Career Assistant
              </NavLink>

              <NavLink to="/leaderboard" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>🏆</span> Leaderboard
              </NavLink>

              {token && (
                <NavLink to="/notifications" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>🔔</span> Notifications {notifCount > 0 && <span className="mobile-badge">{notifCount}</span>}
                </NavLink>
              )}
            </div>

            <div className="mobile-drawer-footer">
              {token ? (
                <div className="mobile-user-actions">
                  <Link to="/profile" className="mobile-profile-btn" onClick={() => setIsMobileMenuOpen(false)}>
                    <span>👤</span> {currentUser?.name || "Profile"}
                  </Link>
                  <button className="mobile-logout-btn" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-actions">
                  <Link to="/login" className="mobile-login-btn" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link to="/register" className="mobile-register-btn" onClick={() => setIsMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </header>
  );
}

export default Navbar;