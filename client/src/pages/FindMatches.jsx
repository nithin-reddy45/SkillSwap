import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import ScheduleSessionModal from "../components/ScheduleSessionModal";
import "./FindMatches.css";

function FindMatches() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "reciprocal" | "top"

  // Schedule Modal State
  const [selectedPartnerForSchedule, setSelectedPartnerForSchedule] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/users/matches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load matches");
          return;
        }

        const rawList = Array.isArray(data) ? data : Array.isArray(data.matches) ? data.matches : [];

        const normalized = rawList.map((item) => {
          if (item.user) {
            return item;
          }
          return {
            user: item,
            matchPercentage: 85,
            isReciprocal: false,
            canTeachMe: [],
            canLearnFromMe: [],
            explanation: "Compatible learning partner based on skills",
          };
        });

        setMatches(normalized);
        setError("");
      } catch (err) {
        console.error("Find Matches Error:", err);
        setError("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [navigate]);

  const handleConnect = async (receiverId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/connections/${receiverId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to send connection request");
        return;
      }

      alert("Connection request sent successfully! 🤝");
    } catch (err) {
      console.error("Connection Request Error:", err);
      alert("Unable to connect to the server");
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (activeFilter === "reciprocal") return m.isReciprocal;
    if (activeFilter === "top") return (m.matchPercentage || 0) >= 80;
    return true;
  });

  if (loading) {
    return (
      <div className="matches-page">
        <div className="matches-container">
          <div className="loading-state">
            <h2>🤖 AI Matching Engine is analyzing peer skill graphs...</h2>
            <p>Evaluating 6 compatibility factors: skill needs, reciprocal swap, proficiency level, availability, ratings, and career goals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <div className="matches-container">

        {/* HEADER */}
        <div className="matches-header">
          <div className="ai-engine-chip">
            <span>✨ 6-FACTOR DYNAMIC AI MATCH ENGINE</span>
          </div>

          <h1>
            Discover Your <span className="gradient-text">Skill Swap Matches</span> 🤝
          </h1>

          <p>
            Dynamically calculated from your skill goals, experience level alignment, mutual availability, ratings, and career trajectory.
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="matches-filter-row">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All Matches ({matches.length})
            </button>
            <button
              className={`filter-btn ${activeFilter === "reciprocal" ? "active" : ""}`}
              onClick={() => setActiveFilter("reciprocal")}
            >
              ⭐ Reciprocal Swaps Only
            </button>
            <button
              className={`filter-btn ${activeFilter === "top" ? "active" : ""}`}
              onClick={() => setActiveFilter("top")}
            >
              🎯 Top 80%+ Compatibility
            </button>
          </div>

          <div className="ai-tools-quicklinks">
            <Link to="/roadmap" className="quick-ai-link">
              🗺️ AI Roadmap
            </Link>
            <Link to="/resume-analyzer" className="quick-ai-link">
              📄 Resume Gap
            </Link>
          </div>
        </div>

        {/* ERROR */}
        {error && <div className="matches-error">{error}</div>}

        {/* NO MATCHES */}
        {!error && filteredMatches.length === 0 && (
          <div className="no-matches">
            <h2>No matches found in this category 😔</h2>
            <p>
              Update your skills and goals in your profile to discover more compatible partners!
            </p>
            <Link to="/profile" className="profile-update-btn">
              👤 Update My Skills Profile
            </Link>
          </div>
        )}

        {/* MATCHES GRID */}
        <div className="matches-grid">
          {filteredMatches.map((matchItem) => {
            const user = matchItem.user || {};
            const score = matchItem.matchPercentage || 85;
            const isReciprocal = matchItem.isReciprocal;
            const userInitials = user.name
              ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
              : "U";

            return (
              <div className="match-card" key={user._id || user.id}>
                
                {/* TOP ROW */}
                <div className="card-top-row">
                  <div className="match-avatar">
                    {userInitials}
                  </div>

                  <div className="user-details">
                    <h2>{user.name}</h2>
                    <div className="match-user-sub">
                      <span className="user-role-badge">{user.careerGoal || "Developer"}</span>
                      <span className="rating-tag">⭐ {(user.avgRating || 5.0).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="score-capsule">
                    <span className="score-value">{score}%</span>
                    <span className="score-sub">COMPATIBILITY</span>
                  </div>
                </div>

                {/* RECIPROCAL BADGE */}
                {isReciprocal && (
                  <div className="reciprocal-badge">
                    <span>⭐ 2-Way Reciprocal Swap Partner</span>
                  </div>
                )}

                {/* "WHY THIS MATCH?" BANNER */}
                <div className="why-match-box">
                  <span className="why-label">💡 Why this match:</span>
                  <p className="why-text">{matchItem.explanation}</p>
                </div>

                {/* CAN TEACH */}
                <div className="match-section">
                  <h3>🎓 Can Teach You:</h3>
                  <div className="match-skills">
                    {Array.isArray(user.teachSkills) && user.teachSkills.length > 0 ? (
                      user.teachSkills.map((item, index) => {
                        const skillName = typeof item === "string" ? item : item.skill;
                        const isVer = typeof item === "object" && item.isVerified;
                        return (
                          <span className={`teach-skill ${isVer ? "verified" : ""}`} key={index}>
                            {skillName} {isVer && "✓"}
                          </span>
                        );
                      })
                    ) : (
                      <span className="no-skill-text">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* WANTS TO LEARN */}
                <div className="match-section">
                  <h3>📚 Wants to Learn:</h3>
                  <div className="match-skills">
                    {Array.isArray(user.learnSkills) && user.learnSkills.length > 0 ? (
                      user.learnSkills.map((item, index) => {
                        const skillName = typeof item === "string" ? item : item.skill;
                        return (
                          <span className="learn-skill" key={index}>
                            {skillName}
                          </span>
                        );
                      })
                    ) : (
                      <span className="no-skill-text">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* BUTTONS ROW */}
                <div className="match-card-actions-row">
                  <button
                    className="connect-btn"
                    onClick={() => handleConnect(user._id || user.id)}
                  >
                    🤝 Connect
                  </button>
                  <button
                    className="schedule-btn-shortcut"
                    onClick={() => {
                      setSelectedPartnerForSchedule(user);
                    }}
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

export default FindMatches;