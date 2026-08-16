import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Leaderboard.css";

function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all"); // "all" | "mentors" | "streaks" | "points"

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/leaderboard`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load leaderboard");
        }

        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
        setError("Unable to load leaderboard. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleConnect = async (receiverId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/connections/${receiverId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to send request");
        return;
      }
      alert("Swap request sent to this top swapper! 🤝");
    } catch (err) {
      console.error("Connect error:", err);
      alert("Unable to send request.");
    }
  };

  // Filter & Search Logic
  const filteredList = leaderboard.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.teachSkills?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.learnSkills?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeCategory === "mentors") return (user.teachSkills?.length || 0) >= 2;
    if (activeCategory === "streaks") return (user.streakDays || 0) >= 5;
    if (activeCategory === "points") return (user.points || 0) >= 1500;
    return true;
  });

  const topThree = leaderboard.slice(0, 3);
  const remainingList = filteredList.length > 0 ? filteredList : [];

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-container">
        
        {/* HERO SECTION */}
        <header className="leaderboard-hero">
          <div className="leaderboard-chip">
            <span>🏆 SkillSwap Community Rankings</span>
          </div>
          <h1>
            Global <span className="gradient-text">Skill Champions</span> Leaderboard
          </h1>
          <p>
            Recognizing the top mentors, learners, and active skill swappers across the platform. Level up your rank by teaching skills, completing roadmaps, and acing AI assessments!
          </p>
        </header>

        {/* TOP 3 PODIUM */}
        {leaderboard.length >= 3 && !searchTerm && activeCategory === "all" && (
          <div className="podium-wrapper">
            
            {/* 2ND PLACE (SILVER) */}
            {topThree[1] && (
              <div className="podium-card rank-2">
                <div className="podium-medal silver">🥈 #2</div>
                <div className="podium-avatar">
                  {topThree[1].name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <h3 className="podium-name">{topThree[1].name}</h3>
                <span className="podium-badge">{topThree[1].badge}</span>
                <div className="podium-stats">
                  <div>
                    <strong>{topThree[1].points}</strong>
                    <span>XP Points</span>
                  </div>
                  <div>
                    <strong>{topThree[1].swapsCompleted}</strong>
                    <span>Swaps</span>
                  </div>
                </div>
                <button className="podium-connect-btn" onClick={() => handleConnect(topThree[1].id || topThree[1]._id)}>
                  🤝 Swap
                </button>
              </div>
            )}

            {/* 1ST PLACE (GOLD) */}
            {topThree[0] && (
              <div className="podium-card rank-1">
                <div className="crown-icon">👑</div>
                <div className="podium-medal gold">🥇 #1 Champion</div>
                <div className="podium-avatar gold-glow">
                  {topThree[0].name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <h3 className="podium-name">{topThree[0].name}</h3>
                <span className="podium-badge gold">{topThree[0].badge}</span>
                <div className="podium-stats">
                  <div>
                    <strong>{topThree[0].points}</strong>
                    <span>XP Points</span>
                  </div>
                  <div>
                    <strong>⭐ {topThree[0].rating}</strong>
                    <span>Rating</span>
                  </div>
                  <div>
                    <strong>{topThree[0].swapsCompleted}</strong>
                    <span>Swaps</span>
                  </div>
                </div>
                <button className="podium-connect-btn champion" onClick={() => handleConnect(topThree[0].id || topThree[0]._id)}>
                  ⚡ Swap with Champion
                </button>
              </div>
            )}

            {/* 3RD PLACE (BRONZE) */}
            {topThree[2] && (
              <div className="podium-card rank-3">
                <div className="podium-medal bronze">🥉 #3</div>
                <div className="podium-avatar">
                  {topThree[2].name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <h3 className="podium-name">{topThree[2].name}</h3>
                <span className="podium-badge">{topThree[2].badge}</span>
                <div className="podium-stats">
                  <div>
                    <strong>{topThree[2].points}</strong>
                    <span>XP Points</span>
                  </div>
                  <div>
                    <strong>{topThree[2].swapsCompleted}</strong>
                    <span>Swaps</span>
                  </div>
                </div>
                <button className="podium-connect-btn" onClick={() => handleConnect(topThree[2].id || topThree[2]._id)}>
                  🤝 Swap
                </button>
              </div>
            )}

          </div>
        )}

        {/* CONTROLS: TABS + SEARCH */}
        <div className="leaderboard-controls">
          <div className="filter-tabs-group">
            <button
              className={`filter-tab ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              🌟 All Ranks
            </button>
            <button
              className={`filter-tab ${activeCategory === "mentors" ? "active" : ""}`}
              onClick={() => setActiveCategory("mentors")}
            >
              🎓 Top Mentors
            </button>
            <button
              className={`filter-tab ${activeCategory === "streaks" ? "active" : ""}`}
              onClick={() => setActiveCategory("streaks")}
            >
              🔥 Active Streaks
            </button>
            <button
              className={`filter-tab ${activeCategory === "points" ? "active" : ""}`}
              onClick={() => setActiveCategory("points")}
            >
              ⚡ XP Legends
            </button>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search swapper name or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* LOADING & ERROR */}
        {loading && (
          <div className="leaderboard-loading">
            <h2>🏆 Calculating community leaderboard rankings...</h2>
          </div>
        )}

        {error && <div className="leaderboard-error">{error}</div>}

        {/* RANKED LIST TABLE */}
        {!loading && !error && (
          <div className="leaderboard-table-card">
            
            <div className="table-header-row">
              <span className="col-rank">RANK</span>
              <span className="col-user">SWAPPER</span>
              <span className="col-skills">TEACHES</span>
              <span className="col-rating">RATING</span>
              <span className="col-streak">STREAK</span>
              <span className="col-points">XP POINTS</span>
              <span className="col-action">ACTION</span>
            </div>

            <div className="table-body-rows">
              {remainingList.map((user, idx) => {
                const rankNum = user.rank || idx + 1;
                return (
                  <div className={`table-row ${rankNum <= 3 ? "top-three-row" : ""}`} key={user.id || user._id}>
                    
                    {/* RANK */}
                    <div className="col-rank">
                      <span className={`rank-pill rank-${rankNum <= 3 ? rankNum : "other"}`}>
                        {rankNum === 1 ? "🥇 1" : rankNum === 2 ? "🥈 2" : rankNum === 3 ? "🥉 3" : `#${rankNum}`}
                      </span>
                    </div>

                    {/* USER INFO */}
                    <div className="col-user">
                      <div className="user-avatar-sm">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="user-info-text">
                        <strong>{user.name}</strong>
                        <span className="user-badge-text">{user.badge}</span>
                      </div>
                    </div>

                    {/* SKILLS */}
                    <div className="col-skills">
                      <div className="teach-skills-wrap">
                        {user.teachSkills?.slice(0, 3).map((skill, sIdx) => (
                          <span key={sIdx} className="mini-teach-tag">
                            {skill}
                          </span>
                        ))}
                        {user.teachSkills?.length > 3 && (
                          <span className="mini-more-tag">+{user.teachSkills.length - 3}</span>
                        )}
                      </div>
                    </div>

                    {/* RATING */}
                    <div className="col-rating">
                      <span className="rating-pill">⭐ {user.rating}</span>
                    </div>

                    {/* STREAK */}
                    <div className="col-streak">
                      <span className="streak-pill">🔥 {user.streakDays}d</span>
                    </div>

                    {/* POINTS */}
                    <div className="col-points">
                      <strong>{user.points?.toLocaleString()}</strong>
                      <span>XP</span>
                    </div>

                    {/* CONNECT */}
                    <div className="col-action">
                      <button
                        className="row-connect-btn"
                        onClick={() => handleConnect(user.id || user._id)}
                      >
                        🤝 Connect
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* BOTTOM MOTIVATIONAL CTA */}
        <div className="leaderboard-bottom-banner">
          <div className="banner-content">
            <h3>Want to climb up the Leaderboard?</h3>
            <p>Teach peers, complete AI-generated Roadmaps, and verify your skills with AI Assessments!</p>
          </div>
          <div className="banner-buttons">
            <Link to="/skill-assessment" className="banner-cta-btn secondary">
              🧠 Take Skill Quiz
            </Link>
            <Link to="/roadmap" className="banner-cta-btn primary">
              🗺️ Generate AI Roadmap
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Leaderboard;
