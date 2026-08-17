import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { socket } from "../socket";
import { API_BASE_URL } from "../config/api";
import { handleAuthError } from "../utils/auth";
import ScheduleSessionModal from "../components/ScheduleSessionModal";
import "./Connections.css";

function Connections() {
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Total unread messages
  const [unreadCount, setUnreadCount] = useState(0);

  // Unread messages grouped by sender
  const [unreadCountsBySender, setUnreadCountsBySender] = useState({});

  // Schedule Modal
  const [selectedPartnerForSchedule, setSelectedPartnerForSchedule] = useState(null);

  // ==============================
  // FETCH CONNECTIONS
  // ==============================
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/connections/my-connections`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (handleAuthError(response, navigate)) return;

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch connections");
          return;
        }

        setConnections(Array.isArray(data) ? data : []);
        setError("");
      } catch (error) {
        console.error("Connections Error:", error);
        setError("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();

    const handleRefresh = () => {
      fetchConnections();
    };

    window.addEventListener("refreshConnections", handleRefresh);

    return () => {
      window.removeEventListener("refreshConnections", handleRefresh);
    };
  }, [navigate]);

  // ==============================
  // FETCH TOTAL UNREAD COUNT
  // ==============================
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${API_BASE_URL}/api/messages/unread/count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Unread Count Error:", error);
      }
    };

    fetchUnreadCount();

    const handleMessageRead = () => {
      fetchUnreadCount();
    };

    window.addEventListener("messageRead", handleMessageRead);

    return () => {
      window.removeEventListener("messageRead", handleMessageRead);
    };
  }, []);

  // ==============================
  // FETCH UNREAD COUNTS BY SENDER
  // ==============================
  useEffect(() => {
    const fetchUnreadBySender = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${API_BASE_URL}/api/messages/unread-by-sender`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          setUnreadCountsBySender(data.unreadCounts || {});
        }
      } catch (error) {
        console.error("Unread By Sender Error:", error);
      }
    };

    fetchUnreadBySender();

    const handleMessageRead = () => {
      fetchUnreadBySender();
    };

    window.addEventListener("messageRead", handleMessageRead);

    return () => {
      window.removeEventListener("messageRead", handleMessageRead);
    };
  }, []);

  // Socket listener for new messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      setUnreadCount((prev) => prev + 1);

      if (newMessage?.sender) {
        const senderId = String(
          typeof newMessage.sender === "object"
            ? newMessage.sender._id
            : newMessage.sender
        );

        setUnreadCountsBySender((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, []);

  const filteredConnections = connections.filter((conn) => {
    const u = conn.user;
    if (!u) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(query);
    const emailMatch = u.email?.toLowerCase().includes(query);
    const teachMatch = (u.teachSkills || []).some((s) =>
      (typeof s === "string" ? s : s.skill).toLowerCase().includes(query)
    );
    const learnMatch = (u.learnSkills || []).some((s) =>
      (typeof s === "string" ? s : s.skill).toLowerCase().includes(query)
    );
    return nameMatch || emailMatch || teachMatch || learnMatch;
  });

  if (loading) {
    return (
      <div className="connections-page">
        <div className="connections-container">
          <div className="connections-loading-card">
            <h2>🤝 Loading your SkillSwap network...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="connections-page">
      <div className="connections-container">
        
        {/* HEADER */}
        <div className="connections-header">
          <div className="connections-chip">
            <span>MY NETWORK</span>
          </div>

          <h1>
            My SkillSwap <span className="gradient-text">Connections</span> 🤝
            {unreadCount > 0 && (
              <span className="unread-header-badge">
                {unreadCount > 99 ? "99+" : unreadCount} Unread
              </span>
            )}
          </h1>

          <p>
            Connect, collaborate, schedule 1-on-1 sessions, and exchange technical skills with your community.
          </p>
        </div>

        {/* CONTROLS ROW */}
        <div className="connections-controls-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search connections by name or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>

          <Link to="/matches" className="find-more-btn">
            + Find New Matches
          </Link>
        </div>

        {/* ERROR */}
        {error && <div className="connections-error-box">⚠️ {error}</div>}

        {/* NO CONNECTIONS */}
        {!error && filteredConnections.length === 0 && (
          <div className="no-connections-card">
            <span className="empty-icon">🤝</span>
            <h2>
              {searchQuery ? "No matching connections found" : "No connections yet"}
            </h2>
            <p>
              {searchQuery
                ? "Try searching with a different skill or member name."
                : "Explore skill matches and send connection requests to grow your peer network!"}
            </p>
            <Link to="/matches" className="explore-matches-cta">
              🔍 Discover Skill Matches
            </Link>
          </div>
        )}

        {/* CONNECTION GRID */}
        <div className="connections-grid">
          {filteredConnections.map((connection) => {
            const user = connection.user;
            if (!user) return null;

            const userId = String(user._id || user.id);
            const userUnreadCount = unreadCountsBySender[userId] || 0;
            const initials = user.name
              ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
              : "U";

            return (
              <div className="connection-card" key={connection._id}>
                
                {/* USER INFO */}
                <div className="connection-user-row">
                  <div className="connection-avatar">
                    {initials}
                  </div>

                  <div className="connection-info">
                    <h2>{user.name || "Skill Member"}</h2>
                    <span className="user-email-sub">{user.email || ""}</span>
                    {user.careerGoal && (
                      <span className="user-role-tag">{user.careerGoal}</span>
                    )}
                  </div>

                  {user.avgRating && (
                    <div className="user-rating-pill">
                      ⭐ {user.avgRating.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* CAN TEACH */}
                <div className="connection-section">
                  <h3>🎓 Can Teach</h3>
                  <div className="skill-tags">
                    {Array.isArray(user.teachSkills) && user.teachSkills.length > 0 ? (
                      user.teachSkills.map((item, index) => {
                        const skillName = typeof item === "string" ? item : item.skill;
                        const isVer = typeof item === "object" && item.isVerified;
                        return (
                          <span className={`teach-tag ${isVer ? "verified" : ""}`} key={index}>
                            {skillName} {isVer && "✓"}
                          </span>
                        );
                      })
                    ) : (
                      <span className="no-skills-msg">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* WANTS TO LEARN */}
                <div className="connection-section">
                  <h3>📚 Wants to Learn</h3>
                  <div className="skill-tags">
                    {Array.isArray(user.learnSkills) && user.learnSkills.length > 0 ? (
                      user.learnSkills.map((item, index) => {
                        const skillName = typeof item === "string" ? item : item.skill;
                        return (
                          <span className="learn-tag" key={index}>
                            {skillName}
                          </span>
                        );
                      })
                    ) : (
                      <span className="no-skills-msg">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* ACTIONS ROW */}
                <div className="connection-actions-row">
                  <button
                    className="message-btn"
                    onClick={() => navigate(`/chat/${user._id || user.id}`)}
                  >
                    💬 Message
                    {userUnreadCount > 0 && (
                      <span className="individual-unread-badge">
                        {userUnreadCount > 99 ? "99+" : userUnreadCount}
                      </span>
                    )}
                  </button>

                  <button
                    className="schedule-session-action-btn"
                    onClick={() => setSelectedPartnerForSchedule(user)}
                  >
                    📅 Schedule Session
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* SCHEDULE MODAL */}
        {selectedPartnerForSchedule && (
          <ScheduleSessionModal
            isOpen={!!selectedPartnerForSchedule}
            onClose={() => setSelectedPartnerForSchedule(null)}
            defaultPartner={selectedPartnerForSchedule}
          />
        )}

      </div>
    </div>
  );
}

export default Connections;