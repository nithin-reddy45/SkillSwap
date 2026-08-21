import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { handleAuthError, formatApiError } from "../utils/auth";
import RequestSwapModal from "../components/RequestSwapModal";
import UserProfileModal from "../components/UserProfileModal";
import ReportUserModal from "../components/ReportUserModal";
import ScheduleSessionModal from "../components/ScheduleSessionModal";
import "./FindMatches.css";

const CATEGORIES = [
  "All",
  "Development",
  "AI & Data Science",
  "Design & UI/UX",
  "Cloud & DevOps",
  "Mobile Apps",
  "Cybersecurity",
  "Languages",
];

function FindMatches() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [sortBy, setSortBy] = useState("score"); // "score" | "rating" | "sessions"
  const [reciprocalOnly, setReciprocalOnly] = useState(false);

  // Modal States
  const [targetSwapUser, setTargetSwapUser] = useState(null);
  const [targetProfileUserId, setTargetProfileUserId] = useState(null);
  const [targetReportUser, setTargetReportUser] = useState(null);
  const [selectedPartnerForSchedule, setSelectedPartnerForSchedule] = useState(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("q", searchQuery.trim());
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedLevel !== "All") params.append("level", selectedLevel);
      if (selectedMode !== "All") params.append("mode", selectedMode);
      if (selectedAvailability !== "All") params.append("availability", selectedAvailability);
      params.append("sortBy", sortBy);

      const response = await fetch(`${API_BASE_URL}/api/users/matches?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (handleAuthError(response, navigate)) return;

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load matches");
      }

      const rawList = Array.isArray(data) ? data : Array.isArray(data.matches) ? data.matches : [];
      const normalized = rawList.map((item) => {
        if (item.user) return item;
        return {
          user: item,
          matchPercentage: 85,
          isReciprocal: false,
          canTeachMe: [],
          canLearnFromMe: [],
          explanation: "Active peer learner on the platform",
        };
      });

      setMatches(normalized);
    } catch (err) {
      console.error("Find Matches Error:", err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedLevel, selectedMode, selectedAvailability, sortBy, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMatches();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchMatches]);

  const filteredList = matches.filter((m) => {
    if (reciprocalOnly) return m.isReciprocal;
    return true;
  });

  // Highlight top 3 Best Matches
  const bestMatches = filteredList.slice(0, 3);

  return (
    <div className="matches-page">
      <div className="matches-container">
        
        {/* HEADER */}
        <header className="matches-hero">
          <div className="ai-engine-chip">
            <span>✨ 6-FACTOR INTELLIGENT MATCHING ENGINE</span>
          </div>

          <h1>
            Discover Compatible <span className="gradient-text">Skill Partners</span> 🤝
          </h1>

          <p>
            Real-time multi-dimensional matching based on skills you want to learn, skills they teach, mutual schedules, proficiency levels, and community ratings.
          </p>
        </header>

        {/* SEARCH & ADVANCED FILTER BAR */}
        <div className="discover-filter-card">
          
          <div className="search-input-row">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by skill (e.g. React, Java, Python), name, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>

          <div className="filters-grid-row">
            
            <div className="filter-select-item">
              <label>Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-select-item">
              <label>Skill Level</label>
              <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="filter-select-item">
              <label>Learning Mode</label>
              <select value={selectedMode} onChange={(e) => setSelectedMode(e.target.value)}>
                <option value="All">All Modes</option>
                <option value="Online">Online Video / Chat</option>
                <option value="Offline">In-Person</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="filter-select-item">
              <label>Availability</label>
              <select value={selectedAvailability} onChange={(e) => setSelectedAvailability(e.target.value)}>
                <option value="All">Anytime</option>
                <option value="Flexible">Flexible</option>
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
                <option value="Evenings">Evenings</option>
              </select>
            </div>

            <div className="filter-select-item">
              <label>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="score">✨ AI Match Score</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="sessions">📅 Most Sessions</option>
              </select>
            </div>

            <div className="filter-toggle-box">
              <button
                type="button"
                className={`toggle-reciprocal-btn ${reciprocalOnly ? "active" : ""}`}
                onClick={() => setReciprocalOnly(!reciprocalOnly)}
              >
                {reciprocalOnly ? "✓ 2-Way Reciprocal Swaps" : "⭐ Reciprocal Swaps Only"}
              </button>
            </div>

          </div>

        </div>

        {error && (
          <div className="matches-error-banner">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* BEST MATCHES FOR YOU CAROUSEL / SPOTLIGHT */}
        {!loading && !error && bestMatches.length > 0 && (
          <section className="best-matches-section">
            <div className="section-title-row">
              <span className="sparkle-icon">✨</span>
              <h2>Best Matches For You</h2>
              <span className="best-tag">Top AI Compatibility</span>
            </div>

            <div className="best-matches-grid">
              {bestMatches.map((m) => {
                const u = m.user || {};
                const initials = u.name ? u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";
                return (
                  <div key={u._id || u.id} className="best-match-spotlight-card">
                    <div className="spotlight-top">
                      <div className="spotlight-avatar">
                        {u.avatar ? <img src={u.avatar} alt={u.name} /> : initials}
                      </div>
                      <div className="spotlight-meta">
                        <h3>{u.name}</h3>
                        <p>{u.profession || u.careerGoal || "Software Developer"}</p>
                        <span className="rating-pill">⭐ {(u.avgRating || 5.0).toFixed(1)}</span>
                      </div>
                      <div className="match-score-badge large">
                        <span>{m.matchPercentage}%</span>
                        <small>MATCH</small>
                      </div>
                    </div>

                    <div className="spotlight-reason">
                      <p>💡 {m.explanation}</p>
                    </div>

                    <div className="spotlight-skills-split">
                      <div className="skill-col">
                        <span className="col-lbl">Teaches:</span>
                        <div className="tags-wrap">
                          {u.teachSkills?.slice(0, 3).map((ts, idx) => (
                            <span key={idx} className="teach-tag-mini">
                              {typeof ts === "string" ? ts : ts.skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="skill-col">
                        <span className="col-lbl">Wants:</span>
                        <div className="tags-wrap">
                          {u.learnSkills?.slice(0, 2).map((ls, idx) => (
                            <span key={idx} className="learn-tag-mini">
                              {typeof ls === "string" ? ls : ls.skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="spotlight-actions">
                      <button
                        className="btn-view-profile"
                        onClick={() => setTargetProfileUserId(u._id || u.id)}
                      >
                        View Profile
                      </button>
                      <button
                        className="btn-request-swap-glow"
                        onClick={() => setTargetSwapUser(u)}
                      >
                        🤝 Propose Swap
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ALL DISCOVER CARDS */}
        <section className="all-matches-section">
          <div className="section-title-row">
            <h2>All Compatible Swappers ({filteredList.length})</h2>
          </div>

          {loading && (
            <div className="matches-loading-card">
              <span>🤖 AI Matching Engine calculating compatibility matrices...</span>
            </div>
          )}

          {!loading && filteredList.length === 0 && (
            <div className="no-matches-card">
              <span className="no-match-icon">😔</span>
              <h3>No skill swappers found with these filters</h3>
              <p>Try clearing some search criteria or adding more skills in your profile!</p>
              <Link to="/my-skills" className="profile-update-btn">
                ⚙️ Update My Skills Portfolio
              </Link>
            </div>
          )}

          <div className="matches-cards-grid">
            {filteredList.map((matchItem) => {
              const u = matchItem.user || {};
              const score = matchItem.matchPercentage || 80;
              const isReciprocal = matchItem.isReciprocal;
              const initials = u.name ? u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

              return (
                <div key={u._id || u.id} className="match-card-item">
                  
                  {/* CARD HEADER */}
                  <div className="match-card-head">
                    <div className="match-user-info">
                      <div className="user-avatar-circle">
                        {u.avatar ? <img src={u.avatar} alt={u.name} /> : initials}
                      </div>
                      <div>
                        <h3>{u.name}</h3>
                        <p className="user-role-text">{u.profession || u.careerGoal || "Developer"}</p>
                        <div className="user-micro-badges">
                          {u.location && <span className="location-pill">📍 {u.location}</span>}
                          <span className="rating-pill">⭐ {(u.avgRating || 5.0).toFixed(1)}</span>
                          <span className="mode-pill">{u.preferredMode || "Online"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="match-score-badge">
                      <span>{score}%</span>
                      <small>MATCH</small>
                    </div>
                  </div>

                  {/* RECIPROCAL BADGE */}
                  {isReciprocal && (
                    <div className="reciprocal-ribbon">
                      <span>⭐ 2-Way Reciprocal Skill Match</span>
                    </div>
                  )}

                  {/* WHY THIS MATCH EXPLANATION */}
                  <div className="why-match-reason-box">
                    <span className="why-head">✓ Match Reasons:</span>
                    <p>{matchItem.explanation}</p>
                  </div>

                  {/* SHORT BIO */}
                  {u.bio && <p className="card-bio-snippet">"{u.bio}"</p>}

                  {/* TEACH SKILLS */}
                  <div className="skills-block">
                    <span className="skills-block-lbl">🎓 Can Teach:</span>
                    <div className="skills-tags-cluster">
                      {Array.isArray(u.teachSkills) && u.teachSkills.length > 0 ? (
                        u.teachSkills.slice(0, 4).map((ts, idx) => {
                          const name = typeof ts === "string" ? ts : ts.skill;
                          const isVer = typeof ts === "object" && ts.isVerified;
                          return (
                            <span key={idx} className={`teach-tag ${isVer ? "verified" : ""}`}>
                              {name} {isVer && "✓"}
                            </span>
                          );
                        })
                      ) : (
                        <span className="empty-tag">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* LEARN SKILLS */}
                  <div className="skills-block">
                    <span className="skills-block-lbl">📚 Wants to Learn:</span>
                    <div className="skills-tags-cluster">
                      {Array.isArray(u.learnSkills) && u.learnSkills.length > 0 ? (
                        u.learnSkills.slice(0, 4).map((ls, idx) => {
                          const name = typeof ls === "string" ? ls : ls.skill;
                          return (
                            <span key={idx} className="learn-tag">
                              {name}
                            </span>
                          );
                        })
                      ) : (
                        <span className="empty-tag">No goals listed</span>
                      )}
                    </div>
                  </div>

                  {/* CARD ACTIONS */}
                  <div className="match-card-actions">
                    <button
                      type="button"
                      className="view-profile-btn"
                      onClick={() => setTargetProfileUserId(u._id || u.id)}
                    >
                      View Profile
                    </button>

                    <button
                      type="button"
                      className="request-swap-btn"
                      onClick={() => setTargetSwapUser(u)}
                    >
                      🤝 Request Swap
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </section>

        {/* MODALS */}
        {targetSwapUser && (
          <RequestSwapModal
            isOpen={!!targetSwapUser}
            onClose={() => setTargetSwapUser(null)}
            targetUser={targetSwapUser}
            onSuccess={() => fetchMatches()}
          />
        )}

        {targetProfileUserId && (
          <UserProfileModal
            isOpen={!!targetProfileUserId}
            onClose={() => setTargetProfileUserId(null)}
            userId={targetProfileUserId}
            onRequestSwap={(user) => setTargetSwapUser(user)}
            onReportUser={(user) => setTargetReportUser(user)}
          />
        )}

        {targetReportUser && (
          <ReportUserModal
            isOpen={!!targetReportUser}
            onClose={() => setTargetReportUser(null)}
            targetUser={targetReportUser}
          />
        )}

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