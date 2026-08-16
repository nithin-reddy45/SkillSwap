import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import ReviewModal from "../components/ReviewModal";
import ScheduleSessionModal from "../components/ScheduleSessionModal";
import "./Sessions.css";

function Sessions() {
  const navigate = useNavigate();
  const [sessionsData, setSessionsData] = useState({ upcoming: [], pending: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "pending" | "completed"

  // Connections for modal
  const [connections, setConnections] = useState([]);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedPartnerForSchedule, setSelectedPartnerForSchedule] = useState(null);

  // Review Modal State
  const [reviewSession, setReviewSession] = useState(null);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/sessions/my-sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load sessions");
      }

      setSessionsData({
        upcoming: data.upcoming || [],
        pending: data.pending || [],
        completed: data.completed || [],
      });
    } catch (err) {
      console.error("Sessions error:", err);
      setError("Unable to load sessions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/connections/my-connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setConnections(data);
      }
    } catch (err) {
      console.error("Connections error:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchConnections();
  }, []);

  const handleUpdateStatus = async (sessionId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to update session");
        return;
      }

      alert(`Session ${newStatus}!`);
      fetchSessions();
    } catch (err) {
      console.error("Update error:", err);
      alert("Unable to update session.");
    }
  };

  const currentUserId = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      return u?._id || u?.id;
    } catch {
      return null;
    }
  })();

  const activeList = sessionsData[activeTab] || [];

  return (
    <div className="sessions-page">
      <div className="sessions-container">
        
        {/* HEADER */}
        <header className="sessions-hero">
          <div className="sessions-chip">
            <span>📅 Live Collaboration Hub</span>
          </div>
          <h1>
            Peer Learning <span className="gradient-text">Sessions</span>
          </h1>
          <p>
            Schedule 1-on-1 skill exchanges, join video sessions, track learning hours, and leave verified reviews.
          </p>
        </header>

        {/* TOP CONTROLS */}
        <div className="sessions-controls-row">
          
          {/* TABS */}
          <div className="sessions-tabs">
            <button
              className={`session-tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
              onClick={() => setActiveTab("upcoming")}
            >
              📅 Upcoming ({sessionsData.upcoming.length})
            </button>
            <button
              className={`session-tab-btn ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              ⏳ Pending ({sessionsData.pending.length})
            </button>
            <button
              className={`session-tab-btn ${activeTab === "completed" ? "active" : ""}`}
              onClick={() => setActiveTab("completed")}
            >
              ✅ Completed ({sessionsData.completed.length})
            </button>
          </div>

          {/* SCHEDULE CTA */}
          <button
            className="schedule-new-session-btn"
            onClick={() => {
              if (connections.length === 0) {
                alert("Connect with other swappers in 'Find Matches' first to schedule sessions!");
                navigate("/matches");
                return;
              }
              setSelectedPartnerForSchedule(connections[0]?.user || connections[0]);
              setIsScheduleOpen(true);
            }}
          >
            ➕ Schedule Session
          </button>
        </div>

        {error && <div className="sessions-error">{error}</div>}

        {/* LOADING STATE */}
        {loading && (
          <div className="sessions-loading">
            <h2>📅 Loading your learning schedule...</h2>
          </div>
        )}

        {/* SESSIONS LIST */}
        {!loading && !error && (
          <div className="sessions-grid">
            {activeList.length === 0 ? (
              <div className="no-sessions-card">
                <h3>No {activeTab} sessions found</h3>
                <p>
                  {activeTab === "upcoming"
                    ? "You have no upcoming sessions scheduled. Connect with a partner or propose a session!"
                    : activeTab === "pending"
                    ? "No pending session requests at the moment."
                    : "Complete sessions with your skill swap partners to see them here and leave reviews."}
                </p>
                <Link to="/matches" className="explore-matches-btn">
                  🔍 Find Skill Partners
                </Link>
              </div>
            ) : (
              activeList.map((session) => {
                const isMentor = String(session.mentor?._id || session.mentor?.id) === String(currentUserId);
                const partner = isMentor ? session.learner : session.mentor;
                const partnerName = partner?.name || "Skill Partner";
                const dateObj = new Date(session.scheduledAt);
                const formattedDate = dateObj.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const formattedTime = dateObj.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const hasReviewed = isMentor ? session.hasMentorReviewed : session.hasLearnerReviewed;

                return (
                  <div className="session-card" key={session._id}>
                    
                    <div className="card-header-bar">
                      <div className="session-skill-pill">
                        <span>🎯 {session.skill}</span>
                      </div>
                      <span className={`status-badge ${session.status}`}>
                        {session.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="session-topic-title">{session.topic}</h3>

                    {/* PARTICIPANTS */}
                    <div className="participants-box">
                      <div className="participant-item">
                        <span className="role-lbl">Teacher:</span>
                        <strong>{session.mentor?.name || "Teacher"}</strong>
                      </div>
                      <div className="participant-divider">⇄</div>
                      <div className="participant-item">
                        <span className="role-lbl">Learner:</span>
                        <strong>{session.learner?.name || "Learner"}</strong>
                      </div>
                    </div>

                    {/* TIME & DURATION */}
                    <div className="session-meta-details">
                      <div className="meta-item">
                        <span>🗓️ {formattedDate}</span>
                      </div>
                      <div className="meta-item">
                        <span>⏰ {formattedTime} ({session.durationMinutes} min)</span>
                      </div>
                    </div>

                    {session.notes && (
                      <p className="session-notes">📝 <em>"{session.notes}"</em></p>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="session-card-actions">
                      
                      {/* JOIN MEETING BUTTON */}
                      {session.status === "accepted" && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="join-meeting-btn"
                        >
                          🎥 Start / Join Video Meeting
                        </a>
                      )}

                      {/* ACCEPT / DECLINE FOR PENDING */}
                      {session.status === "pending" && (
                        <div className="pending-actions-row">
                          <button
                            className="accept-session-btn"
                            onClick={() => handleUpdateStatus(session._id, "accepted")}
                          >
                            ✓ Accept Session
                          </button>
                          <button
                            className="decline-session-btn"
                            onClick={() => handleUpdateStatus(session._id, "cancelled")}
                          >
                            ✕ Decline
                          </button>
                        </div>
                      )}

                      {/* MARK COMPLETED FOR UPCOMING */}
                      {session.status === "accepted" && (
                        <div className="accepted-actions-row">
                          <button
                            className="complete-session-btn"
                            onClick={() => handleUpdateStatus(session._id, "completed")}
                          >
                            ✅ Mark Session Completed
                          </button>
                          <button
                            className="cancel-session-btn"
                            onClick={() => handleUpdateStatus(session._id, "cancelled")}
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* RATE FOR COMPLETED */}
                      {session.status === "completed" && (
                        <div className="completed-actions-row">
                          {!hasReviewed ? (
                            <button
                              className="rate-session-btn"
                              onClick={() => setReviewSession(session)}
                            >
                              ⭐ Rate Session & Partner
                            </button>
                          ) : (
                            <span className="reviewed-badge">✓ Review Submitted</span>
                          )}
                        </div>
                      )}

                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* MODALS */}
        {reviewSession && (
          <ReviewModal
            isOpen={!!reviewSession}
            onClose={() => setReviewSession(null)}
            session={reviewSession}
            onReviewSubmitted={() => fetchSessions()}
          />
        )}

        {isScheduleOpen && selectedPartnerForSchedule && (
          <ScheduleSessionModal
            isOpen={isScheduleOpen}
            onClose={() => setIsScheduleOpen(false)}
            defaultPartner={selectedPartnerForSchedule}
            onSessionCreated={() => fetchSessions()}
          />
        )}

      </div>
    </div>
  );
}

export default Sessions;