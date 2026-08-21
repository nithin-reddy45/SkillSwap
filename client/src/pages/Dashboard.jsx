import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { handleAuthError } from "../utils/auth";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [connectionCount, setConnectionCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [activeSwapsCount, setActiveSwapsCount] = useState(0);

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch Dashboard Metrics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // User Profile (live credits, streak, hours, badges, xp)
        const profileRes = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (handleAuthError(profileRes, navigate)) return;

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData);
          localStorage.setItem("user", JSON.stringify(profileData));
        }

        // Active Connections & Swaps
        const connRes = await fetch(`${API_BASE_URL}/api/connections/my-connections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const connData = await connRes.json();
        if (connRes.ok && Array.isArray(connData)) {
          setConnectionCount(connData.length);
          setActiveSwapsCount(connData.filter((c) => c.status === "accepted").length);
        }

        // Requests
        const reqRes = await fetch(`${API_BASE_URL}/api/connections/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reqData = await reqRes.json();
        if (reqRes.ok && Array.isArray(reqData)) {
          setRequestCount(reqData.length);
        }

        // Sessions
        const sessRes = await fetch(`${API_BASE_URL}/api/sessions/my-sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sessData = await sessRes.json();
        if (sessRes.ok) {
          const totalUpcoming = (sessData.upcoming?.length || 0) + (sessData.pending?.length || 0);
          setSessionsCount(totalUpcoming);
        }
      } catch (error) {
        console.error("Dashboard Stats Error:", error);
      }
    };

    fetchDashboardStats();
  }, [navigate]);

  if (!user) return null;

  // Gamification Metrics
  const currentXp = user.xp || 150;
  const levelNumber = Math.floor(currentXp / 250) + 1;
  const xpIntoCurrentLevel = currentXp % 250;
  const levelProgressPercent = Math.min(100, Math.round((xpIntoCurrentLevel / 250) * 100));

  // Weekly hours dummy dataset
  const weeklyHours = [
    { day: "Mon", hours: 1.5 },
    { day: "Tue", hours: 2.0 },
    { day: "Wed", hours: 0.5 },
    { day: "Thu", hours: 3.0 },
    { day: "Fri", hours: 2.5 },
    { day: "Sat", hours: 4.0 },
    { day: "Sun", hours: 1.0 },
  ];
  const maxHours = Math.max(...weeklyHours.map((d) => d.hours), 4);

  // Gamification badges list
  const BADGES_LIST = [
    { id: "b1", title: "First Skill Swap", icon: "🏆", desc: "Completed your first exchange" },
    { id: "b2", title: "7-Day Streak", icon: "🔥", desc: "Active 7 days in a row" },
    { id: "b3", title: "Skill Master", icon: "🎓", desc: "Passed AI Skill Assessment" },
    { id: "b4", title: "Top Mentor", icon: "⭐", desc: "Maintained 5.0 Star Rating" },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        {/* HERO SECTION */}
        <section className="dashboard-hero">
          <div className="hero-left">
            <span className="hero-pill-badge">LEARNING PROGRESS HUB</span>
            <h1>Welcome back, {user.name}! 👋</h1>
            <p className="dashboard-subtitle">
              You are currently Level {levelNumber} ({currentXp} XP). Teach skills, pass AI assessments, and complete peer sessions to level up.
            </p>
          </div>

          <div className="dashboard-quick-actions">
            <button className="cta-action-btn primary" onClick={() => navigate("/matches")}>
              🔍 Discover Matches
            </button>
            <button className="cta-action-btn secondary" onClick={() => navigate("/sessions")}>
              📅 Sessions Hub
            </button>
            <button className="cta-action-btn requests" onClick={() => navigate("/requests")}>
              🔔 Requests {requestCount > 0 && <span className="req-count-bubble">{requestCount}</span>}
            </button>
          </div>
        </section>

        {/* PRIMARY METRICS OVERVIEW */}
        <section className="dashboard-metrics-grid">
          
          <div className="metric-card credit-highlight" onClick={() => navigate("/dashboard")}>
            <div className="metric-icon-wrap">🪙</div>
            <div>
              <h3>{user.skillCredits !== undefined ? user.skillCredits : 5}</h3>
              <p>Skill Credits Balance</p>
              <small>+1 per session taught</small>
            </div>
          </div>

          <div className="metric-card" onClick={() => navigate("/skill-assessment")}>
            <div className="metric-icon-wrap">🔥</div>
            <div>
              <h3>{user.learningStreak || 7} Days</h3>
              <p>Learning Streak</p>
              <small>Keep coding daily!</small>
            </div>
          </div>

          <div className="metric-card" onClick={() => navigate("/requests")}>
            <div className="metric-icon-wrap">⚡</div>
            <div>
              <h3>{activeSwapsCount}</h3>
              <p>Active Skill Swaps</p>
              <small>Agreements in progress</small>
            </div>
          </div>

          <div className="metric-card" onClick={() => navigate("/sessions")}>
            <div className="metric-icon-wrap">📅</div>
            <div>
              <h3>{sessionsCount}</h3>
              <p>Upcoming Sessions</p>
              <small>Live 1-on-1 calls</small>
            </div>
          </div>

          <div className="metric-card" onClick={() => navigate("/my-skills")}>
            <div className="metric-icon-wrap">🎓</div>
            <div>
              <h3>{user.teachSkills?.length || 0}</h3>
              <p>Skills Offered</p>
              <small>Ready to teach</small>
            </div>
          </div>

          <div className="metric-card" onClick={() => navigate("/leaderboard")}>
            <div className="metric-icon-wrap">⭐</div>
            <div>
              <h3>{(user.avgRating || 5.0).toFixed(1)} ★</h3>
              <p>Peer Reputation</p>
              <small>Based on member reviews</small>
            </div>
          </div>

        </section>

        {/* XP LEVEL PROGRESS BAR */}
        <section className="xp-progress-card">
          <div className="xp-head-row">
            <div>
              <span className="level-badge">LEVEL {levelNumber}</span>
              <strong>{user.careerGoal || "Software Developer"}</strong>
            </div>
            <span className="xp-text">{currentXp} XP / {levelNumber * 250} XP to Level {levelNumber + 1}</span>
          </div>

          <div className="xp-bar-track">
            <div className="xp-bar-fill" style={{ width: `${levelProgressPercent}%` }} />
          </div>
        </section>

        {/* PROGRESS CHARTS & ANALYTICS SECTION */}
        <section className="analytics-charts-grid">
          
          {/* WEEKLY LEARNING HOURS BAR CHART */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h3>📊 Weekly Learning & Teaching Hours</h3>
              <span className="hours-total-pill">14.5 hrs this week</span>
            </div>

            <div className="weekly-hours-chart">
              {weeklyHours.map((d, idx) => {
                const heightPercent = Math.max(12, (d.hours / maxHours) * 100);
                return (
                  <div key={idx} className="chart-bar-column">
                    <span className="bar-val">{d.hours}h</span>
                    <div className="bar-pillar-wrap">
                      <div className="bar-pillar" style={{ height: `${heightPercent}%` }} />
                    </div>
                    <span className="bar-day-lbl">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WEEKLY ACTIVITY HEATMAP & STREAK */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h3>🔥 Activity & Swaps Completion</h3>
              <span className="completion-rate-pill">94% Attendance</span>
            </div>

            <div className="activity-heatmap-box">
              <p className="heatmap-desc">Weekly Peer Learning Sessions & Assessments completed:</p>
              <div className="heatmap-grid">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                  <div key={idx} className={`heat-cell level-${(idx % 3) + 1}`}>
                    <span className="heat-day">{day}</span>
                    <span className="heat-dot">●</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GAMIFICATION BADGES PREVIEW */}
            <div className="badges-showcase-box">
              <h4>🏆 Achievement Badges</h4>
              <div className="badges-mini-row">
                {BADGES_LIST.map((b) => (
                  <div key={b.id} className="badge-item-mini" title={b.desc}>
                    <span className="badge-icon-bubble">{b.icon}</span>
                    <span className="badge-title-txt">{b.title}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </section>

        {/* UNIFIED AI POWER TOOLS MATRIX */}
        <section className="ai-tools-hub-section">
          <div className="section-head">
            <h2>⚡ AI Skill Acceleration Ecosystem</h2>
            <p>Smart tools to guide your learning roadmap and verify your technical skills.</p>
          </div>

          <div className="ai-tools-cards-grid">
            <div className="ai-hub-card" onClick={() => navigate("/roadmap")}>
              <div className="hub-card-icon">🗺️</div>
              <h3>AI Learning Roadmap</h3>
              <p>Generate week-by-week structured curriculum & track milestone progress.</p>
              <span className="hub-link-text">Open Roadmap →</span>
            </div>

            <div className="ai-hub-card" onClick={() => navigate("/skill-assessment")}>
              <div className="hub-card-icon">🧠</div>
              <h3>AI Skill Assessment</h3>
              <p>Take adaptive tests, test your code, and unlock verified profile badges.</p>
              <span className="hub-link-text">Take Assessment →</span>
            </div>

            <div className="ai-hub-card" onClick={() => navigate("/resume-analyzer")}>
              <div className="hub-card-icon">📄</div>
              <h3>Resume Gap Matcher</h3>
              <p>Scan your resume for missing skills and instantly match with teachers.</p>
              <span className="hub-link-text">Analyze Gaps →</span>
            </div>

            <div className="ai-hub-card" onClick={() => navigate("/my-skills")}>
              <div className="hub-card-icon">⚙️</div>
              <h3>My Skills Portfolio</h3>
              <p>Manage categories, experience levels, tags, and teaching offerings.</p>
              <span className="hub-link-text">Manage Skills →</span>
            </div>
          </div>
        </section>

        {/* SKILLS PREVIEW SECTION */}
        <section className="skills-summary-grid">
          
          <div className="skills-summary-card">
            <div className="card-top-row">
              <div>
                <span className="sub-lbl">WHAT YOU OFFER</span>
                <h3>Skills You Can Teach</h3>
              </div>
              <Link to="/my-skills" className="edit-link">Edit ✎</Link>
            </div>

            <div className="skills-tags-wrap">
              {Array.isArray(user.teachSkills) && user.teachSkills.length > 0 ? (
                user.teachSkills.map((item, idx) => {
                  const name = typeof item === "string" ? item : item.skill;
                  const isVer = typeof item === "object" && item.isVerified;
                  return (
                    <span key={idx} className={`teach-pill ${isVer ? "verified" : ""}`}>
                      {name} {isVer && "✓"}
                    </span>
                  );
                })
              ) : (
                <p className="empty-p">No teaching skills added yet. Add skills in My Skills!</p>
              )}
            </div>
          </div>

          <div className="skills-summary-card">
            <div className="card-top-row">
              <div>
                <span className="sub-lbl">YOUR TARGETS</span>
                <h3>Skills You Want to Learn</h3>
              </div>
              <Link to="/my-skills" className="edit-link">Edit ✎</Link>
            </div>

            <div className="skills-tags-wrap">
              {Array.isArray(user.learnSkills) && user.learnSkills.length > 0 ? (
                user.learnSkills.map((item, idx) => {
                  const name = typeof item === "string" ? item : item.skill;
                  return (
                    <span key={idx} className="learn-pill">
                      {name}
                    </span>
                  );
                })
              ) : (
                <p className="empty-p">No learning goals added yet. Add goals in My Skills!</p>
              )}
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}

export default Dashboard;