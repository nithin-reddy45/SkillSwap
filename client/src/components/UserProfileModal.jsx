import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";
import "./UserProfileModal.css";

function UserProfileModal({ isOpen, onClose, userId, onRequestSwap, onReportUser }) {
  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUserProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load user profile");
        }

        setProfileData(data.user || data);
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Profile modal load error:", err);
        setError(err.message || "Unable to fetch user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const user = profileData;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* TOP BAR */}
        <div className="profile-modal-topbar">
          <span className="profile-modal-chip">MEMBER PROFILE</span>
          <button className="profile-modal-close" onClick={onClose}>✕</button>
        </div>

        {loading && (
          <div className="profile-modal-loading">
            <span>🔄 Loading profile details...</span>
          </div>
        )}

        {error && (
          <div className="profile-modal-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {!loading && user && (
          <div className="profile-modal-body">
            
            {/* HERO INFO */}
            <div className="profile-hero-row">
              <div className="profile-avatar-box">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">{initials}</div>
                )}
              </div>

              <div className="profile-hero-meta">
                <h2>{user.name}</h2>
                <p className="profession-text">{user.profession || user.careerGoal || "Software Developer"}</p>
                
                <div className="meta-capsules-row">
                  {user.location && <span className="meta-cap">📍 {user.location}</span>}
                  <span className="meta-cap">⭐ {(user.avgRating || 5.0).toFixed(1)} Rating</span>
                  <span className="meta-cap">📅 {user.completedSessionsCount || 0} Sessions</span>
                  <span className="meta-cap">⚡ {user.xp || 150} XP</span>
                </div>
              </div>
            </div>

            {/* BIO */}
            <div className="profile-section-box">
              <h4>About</h4>
              <p className="bio-content">{user.bio || "No biography provided yet."}</p>
            </div>

            {/* AVAILABILITY & MODE */}
            <div className="profile-pref-grid">
              <div className="pref-box">
                <span className="pref-label">Availability</span>
                <strong>{user.availability || "Flexible Schedules"}</strong>
              </div>
              <div className="pref-box">
                <span className="pref-label">Preferred Mode</span>
                <strong>{user.preferredMode || "Online"}</strong>
              </div>
            </div>

            {/* VERIFIED BADGES */}
            {user.verifiedSkills && user.verifiedSkills.length > 0 && (
              <div className="profile-section-box">
                <h4>🎖️ Verified Skills</h4>
                <div className="badges-chips-wrap">
                  {user.verifiedSkills.map((sk, idx) => (
                    <span key={idx} className="verified-pill-item">✓ {sk} Verified</span>
                  ))}
                </div>
              </div>
            )}

            {/* CAN TEACH */}
            <div className="profile-section-box">
              <h4>🎓 Skills They Can Teach</h4>
              <div className="skills-tags-wrap">
                {Array.isArray(user.teachSkills) && user.teachSkills.length > 0 ? (
                  user.teachSkills.map((item, idx) => {
                    const skillName = typeof item === "string" ? item : item.skill;
                    const level = typeof item === "object" ? item.level : "Intermediate";
                    const isVer = typeof item === "object" && item.isVerified;
                    return (
                      <span key={idx} className={`teach-pill-item ${isVer ? "verified" : ""}`}>
                        {skillName} <small>({level})</small> {isVer && "✓"}
                      </span>
                    );
                  })
                ) : (
                  <p className="empty-txt">No teaching skills listed.</p>
                )}
              </div>
            </div>

            {/* WANTS TO LEARN */}
            <div className="profile-section-box">
              <h4>📚 Skills They Want to Learn</h4>
              <div className="skills-tags-wrap">
                {Array.isArray(user.learnSkills) && user.learnSkills.length > 0 ? (
                  user.learnSkills.map((item, idx) => {
                    const skillName = typeof item === "string" ? item : item.skill;
                    return (
                      <span key={idx} className="learn-pill-item">
                        {skillName}
                      </span>
                    );
                  })
                ) : (
                  <p className="empty-txt">No learning goals listed.</p>
                )}
              </div>
            </div>

            {/* RECENT REVIEWS */}
            {reviews.length > 0 && (
              <div className="profile-section-box">
                <h4>⭐ Member Reviews ({reviews.length})</h4>
                <div className="reviews-mini-list">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="review-mini-card">
                      <div className="rev-head">
                        <strong>{rev.reviewer?.name || "Peer Learner"}</strong>
                        <span>{"⭐".repeat(rev.rating)}</span>
                      </div>
                      {rev.feedback && <p className="rev-text">"{rev.feedback}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FOOTER ACTIONS */}
            <div className="profile-modal-actions">
              <button
                type="button"
                className="report-user-btn"
                onClick={() => {
                  onClose();
                  if (onReportUser) onReportUser(user);
                }}
              >
                🚩 Report
              </button>

              <button
                type="button"
                className="propose-swap-cta"
                onClick={() => {
                  onClose();
                  if (onRequestSwap) onRequestSwap(user);
                }}
              >
                🤝 Propose Skill Swap
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default UserProfileModal;
