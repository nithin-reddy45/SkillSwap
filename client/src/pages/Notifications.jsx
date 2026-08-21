import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { formatApiError } from "../utils/auth";
import "./Notifications.css";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load notifications");
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Notifications error:", err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id, link) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      window.dispatchEvent(new Event("notificationUpdated"));

      if (link) {
        navigate(link);
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      window.dispatchEvent(new Event("notificationUpdated"));
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.isRead;
    if (activeFilter === "sessions") return n.type.startsWith("session");
    if (activeFilter === "connections") return n.type.startsWith("connection");
    return true;
  });

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        
        {/* HEADER */}
        <header className="notifications-header">
          <div className="header-left">
            <h1>Activity & Notifications 🔔</h1>
            <p>Stay updated on connection requests, learning sessions, and AI matches.</p>
          </div>
          {unreadCount > 0 && (
            <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
              ✓ Mark All as Read ({unreadCount})
            </button>
          )}
        </header>

        {/* FILTERS */}
        <div className="notif-filters-row">
          <button
            className={`notif-filter-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All ({notifications.length})
          </button>
          <button
            className={`notif-filter-btn ${activeFilter === "unread" ? "active" : ""}`}
            onClick={() => setActiveFilter("unread")}
          >
            Unread ({unreadCount})
          </button>
          <button
            className={`notif-filter-btn ${activeFilter === "sessions" ? "active" : ""}`}
            onClick={() => setActiveFilter("sessions")}
          >
            📅 Sessions
          </button>
          <button
            className={`notif-filter-btn ${activeFilter === "connections" ? "active" : ""}`}
            onClick={() => setActiveFilter("connections")}
          >
            🤝 Connections
          </button>
        </div>

        {error && <div className="notif-error">{error}</div>}

        {loading && (
          <div className="notif-loading">
            <h2>🔔 Loading your notification feed...</h2>
          </div>
        )}

        {/* LIST */}
        {!loading && !error && (
          <div className="notifications-list">
            {filteredNotifications.length === 0 ? (
              <div className="empty-notif-box">
                <span className="empty-icon">📭</span>
                <h3>No notifications in this filter</h3>
                <p>All caught up! Activity alerts for new sessions and connection requests will show up here.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const dateObj = new Date(notif.createdAt);
                const timeAgo = dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={notif._id}
                    className={`notif-card ${!notif.isRead ? "unread" : ""}`}
                    onClick={() => handleMarkAsRead(notif._id, notif.link)}
                  >
                    <div className="notif-sender-avatar">
                      {notif.sender?.avatar ? (
                        <img src={notif.sender.avatar} alt="" />
                      ) : (
                        <span>{notif.sender?.name?.charAt(0)?.toUpperCase() || "⚡"}</span>
                      )}
                    </div>

                    <div className="notif-content-col">
                      <div className="notif-title-row">
                        <strong>{notif.title}</strong>
                        <span className="notif-time">{timeAgo}</span>
                      </div>
                      <p className="notif-msg">{notif.message}</p>
                      {notif.link && notif.link !== "/" && (
                        <span className="notif-action-link">View Details →</span>
                      )}
                    </div>

                    {!notif.isRead && <div className="unread-dot"></div>}
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Notifications;
