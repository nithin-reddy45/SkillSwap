import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { socket } from "../socket";
import { API_BASE_URL } from "../config/api";
import { handleAuthError } from "../utils/auth";
import ScheduleSessionModal from "../components/ScheduleSessionModal";
import ReviewModal from "../components/ReviewModal";
import "./Requests.css";

function Requests() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("received"); // "received" | "sent" | "active" | "completed"
  
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeSwaps, setActiveSwaps] = useState([]);
  const [completedSwaps, setCompletedSwaps] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Modals
  const [selectedPartnerForSchedule, setSelectedPartnerForSchedule] = useState(null);
  const [selectedSessionForReview, setSelectedSessionForReview] = useState(null);

  const token = localStorage.getItem("token");

  const fetchAllRequestsData = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Received Pending Requests
      const resReceived = await fetch(`${API_BASE_URL}/api/connections/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (handleAuthError(resReceived, navigate)) return;
      if (resReceived.ok) {
        const data = await resReceived.json();
        setReceivedRequests(Array.isArray(data) ? data : []);
      }

      // 2. Sent Pending Requests
      const resSent = await fetch(`${API_BASE_URL}/api/connections/sent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resSent.ok) {
        const data = await resSent.json();
        setSentRequests(Array.isArray(data) ? data : []);
      }

      // 3. Active Swaps
      const resActive = await fetch(`${API_BASE_URL}/api/connections/my-connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resActive.ok) {
        const data = await resActive.json();
        setActiveSwaps(Array.isArray(data) ? data : []);
      }

      // 4. Completed Swaps
      const resCompleted = await fetch(`${API_BASE_URL}/api/connections/completed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resCompleted.ok) {
        const data = await resCompleted.json();
        setCompletedSwaps(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Requests error:", err);
      setError("Unable to load swap requests data.");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchAllRequestsData();
  }, [fetchAllRequestsData]);

  // Socket listener for real-time request updates
  useEffect(() => {
    if (!socket) return;
    if (!socket.connected) socket.connect();

    const handleUpdate = () => {
      fetchAllRequestsData();
    };

    socket.on("newConnectionRequest", handleUpdate);
    socket.on("connectionRequestUpdated", handleUpdate);

    return () => {
      socket.off("newConnectionRequest", handleUpdate);
      socket.off("connectionRequestUpdated", handleUpdate);
    };
  }, [fetchAllRequestsData]);

  // Handle Accept / Reject / Cancel / Complete
  const handleUpdateStatus = async (connectionId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/connections/${connectionId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to update request");
        return;
      }

      setActionSuccess(
        newStatus === "accepted"
          ? "🎉 Skill Swap Accepted! Private messaging is now active."
          : newStatus === "completed"
          ? "✅ Skill Swap marked complete! +100 XP awarded to both learners."
          : `Request marked as ${newStatus}.`
      );
      setTimeout(() => setActionSuccess(""), 4000);

      window.dispatchEvent(new Event("requestUpdated"));
      fetchAllRequestsData();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="requests-page">
      <div className="requests-container">
        
        {/* HEADER */}
        <header className="requests-header">
          <span className="requests-pill-tag">SKILL SWAP MANAGEMENT</span>
          <h1>Skill Swap <span className="gradient-text">Requests & Agreements</span> 🤝</h1>
          <p>
            Manage inbound proposals, track sent requests, enter active collaboration workspaces, and review completed swaps.
          </p>
        </header>

        {actionSuccess && <div className="requests-success-banner">{actionSuccess}</div>}
        {error && <div className="requests-error-banner">⚠️ {error}</div>}

        {/* 4 TABS */}
        <div className="requests-tabs-row">
          <button
            className={`req-tab-btn ${activeTab === "received" ? "active" : ""}`}
            onClick={() => setActiveTab("received")}
          >
            📥 Received ({receivedRequests.length})
          </button>
          <button
            className={`req-tab-btn ${activeTab === "sent" ? "active" : ""}`}
            onClick={() => setActiveTab("sent")}
          >
            📤 Sent ({sentRequests.length})
          </button>
          <button
            className={`req-tab-btn ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            ⚡ Active Swaps ({activeSwaps.length})
          </button>
          <button
            className={`req-tab-btn ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            ✅ Completed ({completedSwaps.length})
          </button>
        </div>

        {loading && (
          <div className="requests-loading-box">
            <span>🔄 Loading skill swap agreements...</span>
          </div>
        )}

        {!loading && (
          <div className="requests-content-area">
            
            {/* 1. RECEIVED REQUESTS */}
            {activeTab === "received" && (
              <div className="requests-grid">
                {receivedRequests.length === 0 ? (
                  <div className="empty-requests-card">
                    <span className="empty-icon">📭</span>
                    <h3>No Pending Received Requests</h3>
                    <p>When other developers propose to swap skills with you, they will appear here.</p>
                  </div>
                ) : (
                  receivedRequests.map((req) => {
                    const sender = req.sender || {};
                    const initials = sender.name ? sender.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

                    return (
                      <div key={req._id} className="req-card">
                        
                        <div className="req-card-user">
                          <div className="req-avatar">{sender.avatar ? <img src={sender.avatar} alt={sender.name} /> : initials}</div>
                          <div>
                            <h3>{sender.name}</h3>
                            <p>{sender.profession || "Developer"}</p>
                            <span className="rating-tag">⭐ {(sender.avgRating || 5.0).toFixed(1)}</span>
                          </div>
                        </div>

                        {/* STRUCTURED EXCHANGE DETAILS */}
                        <div className="structured-swap-box">
                          <div className="swap-term give">
                            <span className="term-lbl">They Will Teach You:</span>
                            <strong>{req.teachSkill || "Selected Skills"}</strong>
                          </div>
                          <div className="swap-term-arrow">⇄</div>
                          <div className="swap-term receive">
                            <span className="term-lbl">They Want to Learn:</span>
                            <strong>{req.learnSkill || "Your Expertise"}</strong>
                          </div>
                        </div>

                        {req.note && (
                          <p className="req-note-txt">📝 <em>"{req.note}"</em></p>
                        )}

                        <div className="req-actions-row">
                          <button
                            className="btn-accept-swap"
                            onClick={() => handleUpdateStatus(req._id, "accepted")}
                          >
                            ✓ Accept Swap
                          </button>
                          <button
                            className="btn-reject-swap"
                            onClick={() => handleUpdateStatus(req._id, "rejected")}
                          >
                            ✕ Decline
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 2. SENT REQUESTS */}
            {activeTab === "sent" && (
              <div className="requests-grid">
                {sentRequests.length === 0 ? (
                  <div className="empty-requests-card">
                    <span className="empty-icon">📤</span>
                    <h3>No Sent Requests Pending</h3>
                    <p>Explore Discover/Find Matches and propose skill swaps with top developers!</p>
                    <Link to="/matches" className="cta-find-btn">
                      🔍 Find Matches
                    </Link>
                  </div>
                ) : (
                  sentRequests.map((req) => {
                    const receiver = req.receiver || {};
                    const initials = receiver.name ? receiver.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

                    return (
                      <div key={req._id} className="req-card">
                        
                        <div className="req-card-user">
                          <div className="req-avatar">{receiver.avatar ? <img src={receiver.avatar} alt={receiver.name} /> : initials}</div>
                          <div>
                            <h3>{receiver.name}</h3>
                            <p>{receiver.profession || "Developer"}</p>
                            <span className="status-pending-pill">⏳ Awaiting Response</span>
                          </div>
                        </div>

                        <div className="structured-swap-box">
                          <div className="swap-term give">
                            <span className="term-lbl">You Offered:</span>
                            <strong>{req.teachSkill || "Your Skills"}</strong>
                          </div>
                          <div className="swap-term-arrow">⇄</div>
                          <div className="swap-term receive">
                            <span className="term-lbl">You Requested:</span>
                            <strong>{req.learnSkill || "Their Skills"}</strong>
                          </div>
                        </div>

                        {req.note && (
                          <p className="req-note-txt">📝 <em>"{req.note}"</em></p>
                        )}

                        <div className="req-actions-row">
                          <button
                            className="btn-cancel-sent"
                            onClick={() => handleUpdateStatus(req._id, "cancelled")}
                          >
                            Cancel Request
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 3. ACTIVE SKILL SWAPS */}
            {activeTab === "active" && (
              <div className="requests-grid">
                {activeSwaps.length === 0 ? (
                  <div className="empty-requests-card">
                    <span className="empty-icon">⚡</span>
                    <h3>No Active Skill Swaps Yet</h3>
                    <p>Accept a received request or wait for your sent requests to be accepted.</p>
                  </div>
                ) : (
                  activeSwaps.map((swap) => {
                    const partner = swap.user || {};
                    const partnerId = partner._id || partner.id;
                    const initials = partner.name ? partner.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

                    return (
                      <div key={swap._id} className="req-card active-swap">
                        
                        <div className="req-card-user">
                          <div className="req-avatar">{partner.avatar ? <img src={partner.avatar} alt={partner.name} /> : initials}</div>
                          <div>
                            <h3>{partner.name}</h3>
                            <p>{partner.profession || "Developer"}</p>
                            <span className="active-glow-pill">⚡ Active Swap Agreement</span>
                          </div>
                        </div>

                        <div className="structured-swap-box">
                          <div className="swap-term give">
                            <span className="term-lbl">Exchange:</span>
                            <strong>{swap.teachSkill || "Teach"} ⇄ {swap.learnSkill || "Learn"}</strong>
                          </div>
                        </div>

                        <div className="active-swap-actions-grid">
                          <Link to={`/chat/${partnerId}`} className="btn-action-chat">
                            💬 Open Chat
                          </Link>

                          <button
                            type="button"
                            className="btn-action-schedule"
                            onClick={() => setSelectedPartnerForSchedule(partner)}
                          >
                            📅 Schedule Session
                          </button>

                          <button
                            type="button"
                            className="btn-action-complete"
                            onClick={() => handleUpdateStatus(swap._id, "completed")}
                          >
                            ✅ Complete Swap (+100 XP)
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 4. COMPLETED SWAPS */}
            {activeTab === "completed" && (
              <div className="requests-grid">
                {completedSwaps.length === 0 ? (
                  <div className="empty-requests-card">
                    <span className="empty-icon">🏆</span>
                    <h3>No Completed Swaps Recorded</h3>
                    <p>Once you finish learning and teaching in an active swap, mark it completed here!</p>
                  </div>
                ) : (
                  completedSwaps.map((swap) => {
                    const partner = swap.user || {};
                    const initials = partner.name ? partner.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

                    return (
                      <div key={swap._id} className="req-card completed-swap">
                        <div className="req-card-user">
                          <div className="req-avatar">{partner.avatar ? <img src={partner.avatar} alt={partner.name} /> : initials}</div>
                          <div>
                            <h3>{partner.name}</h3>
                            <p>Completed on {new Date(swap.completedAt || Date.now()).toLocaleDateString()}</p>
                            <span className="completed-tag">✓ Swap Completed (+100 XP)</span>
                          </div>
                        </div>

                        <div className="structured-swap-box">
                          <div className="swap-term give">
                            <span className="term-lbl">Exchanged:</span>
                            <strong>{swap.teachSkill || "Skill"} ⇄ {swap.learnSkill || "Skill"}</strong>
                          </div>
                        </div>

                        <div className="req-actions-row">
                          <Link to="/sessions" className="btn-view-sessions">
                            ⭐ Rate / View Sessions
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>
        )}

        {/* SCHEDULE SESSION MODAL */}
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

export default Requests;