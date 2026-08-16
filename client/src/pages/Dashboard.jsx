import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { API_BASE_URL } from "../config/api";
import { COURSES_DATA } from "../data/coursesData";
import CourseCard from "../components/CourseCard";
import TutorialPlayerModal from "../components/TutorialPlayerModal";
import SyllabusModal from "../components/SyllabusModal";
import QuizModal from "../components/QuizModal";
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

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const [connectionCount, setConnectionCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);

  // Modals & Bookmarks state
  const [playerCourse, setPlayerCourse] = useState(null);
  const [syllabusCourse, setSyllabusCourse] = useState(null);
  const [quizCourse, setQuizCourse] = useState(null);
  const [savedCourses, setSavedCourses] = useState(() => {
    try {
      const saved = localStorage.getItem("savedCourses");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleSave = (courseId) => {
    setSavedCourses((prev) => {
      const updated = prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId];
      try {
        localStorage.setItem("savedCourses", JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  // Compute recommended tutorials tailored to user's learnSkills
  const recommendedCourses = useMemo(() => {
    if (!user?.learnSkills || user.learnSkills.length === 0) {
      return COURSES_DATA.slice(0, 3);
    }
    const skillList = user.learnSkills.map((s) => (typeof s === "string" ? s : s.skill).toLowerCase());
    const matched = COURSES_DATA.filter((course) => {
      return (
        skillList.some((s) => course.primarySkill.toLowerCase().includes(s)) ||
        skillList.some((s) => course.title.toLowerCase().includes(s)) ||
        course.relatedSkills.some((rs) =>
          skillList.some((s) => rs.toLowerCase().includes(s))
        )
      );
    });

    return matched.length === 0 ? COURSES_DATA.slice(0, 3) : matched.slice(0, 3);
  }, [user]);

  // Fetch Stats (Connections, Requests, Sessions)
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Connections
        const connRes = await fetch(`${API_BASE_URL}/api/connections/my-connections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const connData = await connRes.json();
        if (connRes.ok && Array.isArray(connData)) {
          setConnectionCount(connData.length);
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-tag">YOUR AI LEARNING DASHBOARD</p>
          <h1>Welcome back, {user.name}! 👋</h1>
          <p className="dashboard-subtitle">
            Manage your skills, discover reciprocal swap partners, schedule 1-on-1 sessions, and advance your career with AI.
          </p>
        </div>

        <div className="dashboard-actions">
          <button className="browse-tutorials-btn" onClick={() => navigate("/matches")}>
            🔍 Find Matches
          </button>
          <button className="browse-tutorials-btn" onClick={() => navigate("/sessions")}>
            📅 Sessions
          </button>
          <button className="request-notification-btn" onClick={() => navigate("/requests")}>
            🔔 Requests
            {requestCount > 0 && (
              <span className="dashboard-request-badge">
                {requestCount > 99 ? "99+" : requestCount}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* Statistics */}
      <section className="stats-grid">
        <div className="stat-card" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
          <div className="stat-icon">🎓</div>
          <div>
            <h3>{user.teachSkills?.length || 0}</h3>
            <p>Skills to Teach</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
          <div className="stat-icon">📚</div>
          <div>
            <h3>{user.learnSkills?.length || 0}</h3>
            <p>Skills to Learn</p>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => navigate("/connections")}>
          <div className="stat-icon">🤝</div>
          <div>
            <h3>{connectionCount}</h3>
            <p>Active Connections</p>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => navigate("/sessions")}>
          <div className="stat-icon">📅</div>
          <div>
            <h3>{sessionsCount}</h3>
            <p>Upcoming Sessions</p>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => navigate("/leaderboard")}>
          <div className="stat-icon">⭐</div>
          <div>
            <h3>{(user.avgRating || 5.0).toFixed(1)} ★</h3>
            <p>Reputation Rating</p>
          </div>
        </div>
      </section>

      {/* UNIFIED AI POWER TOOLS MATRIX */}
      <section className="ai-tools-hub-section">
        <h2 className="section-title">⚡ AI Skill Ecosystem Hub</h2>
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
            <p>Take adaptive quizzes, test your knowledge, and earn verified profile badges.</p>
            <span className="hub-link-text">Take Quiz →</span>
          </div>

          <div className="ai-hub-card" onClick={() => navigate("/resume-analyzer")}>
            <div className="hub-card-icon">📄</div>
            <h3>Resume Gap Analyzer</h3>
            <p>Scan your resume for missing skills and instantly match with teachers.</p>
            <span className="hub-link-text">Analyze Resume →</span>
          </div>

          <div className="ai-hub-card" onClick={() => navigate("/sessions")}>
            <div className="hub-card-icon">📅</div>
            <h3>Live Peer Sessions</h3>
            <p>Schedule 1-on-1 skill exchanges, join video meetings, and leave reviews.</p>
            <span className="hub-link-text">View Sessions →</span>
          </div>

        </div>
      </section>

      {/* Skills Matrix Preview */}
      <section className="dashboard-grid">
        {/* TEACH SKILLS */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <p className="card-tag">WHAT YOU OFFER</p>
              <h2>Skills You Can Teach</h2>
            </div>
            <Link to="/profile" className="edit-skills-link">Edit ✎</Link>
          </div>

          <div className="skills-list">
            {user.teachSkills?.length > 0 ? (
              user.teachSkills.map((item, index) => {
                const name = typeof item === "string" ? item : item.skill;
                const isVer = typeof item === "object" && item.isVerified;
                return (
                  <span className="teach-tag" key={index}>
                    {name} {isVer && "✓"}
                  </span>
                );
              })
            ) : (
              <p>No teaching skills added yet. Add some in your profile!</p>
            )}
          </div>
        </div>

        {/* LEARN SKILLS */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <p className="card-tag">YOUR GOALS</p>
              <h2>Skills You Want to Learn</h2>
            </div>
            <Link to="/profile" className="edit-skills-link">Edit ✎</Link>
          </div>

          <div className="skills-list">
            {user.learnSkills?.length > 0 ? (
              user.learnSkills.map((item, index) => {
                const name = typeof item === "string" ? item : item.skill;
                return (
                  <span className="learn-tag" key={index}>
                    {name}
                  </span>
                );
              })
            ) : (
              <p>No learning goals added yet. Add some in your profile!</p>
            )}
          </div>
        </div>
      </section>

      {/* RECOMMENDED COURSES */}
      <section className="dashboard-tutorials-section">
        <div className="dashboard-tutorials-header">
          <div>
            <p className="card-tag">RECOMMENDED FOR YOUR GOALS</p>
            <h2>Top Courses & Best Video Tutorials</h2>
            <p className="tutorials-subtitle">
              Curated video tutorials aligned with your target learning skills.
            </p>
          </div>

          <button
            className="view-all-link-btn"
            onClick={() => navigate("/courses")}
          >
            Explore All Tutorials →
          </button>
        </div>

        <div className="dashboard-courses-grid">
          {recommendedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isSaved={savedCourses.includes(course.id)}
              onToggleSave={handleToggleSave}
              onWatchTutorial={(c) => setPlayerCourse(c)}
              onViewSyllabus={(c) => setSyllabusCourse(c)}
              onTakeQuiz={(c) => setQuizCourse(c)}
            />
          ))}
        </div>
      </section>

      {/* MODALS */}
      <TutorialPlayerModal
        course={playerCourse}
        isOpen={!!playerCourse}
        onClose={() => setPlayerCourse(null)}
      />

      <SyllabusModal
        course={syllabusCourse}
        isOpen={!!syllabusCourse}
        onClose={() => setSyllabusCourse(null)}
        onStartTutorial={(c) => setPlayerCourse(c)}
      />

      <QuizModal
        course={quizCourse}
        isOpen={!!quizCourse}
        onClose={() => setQuizCourse(null)}
      />
    </div>
  );
}

export default Dashboard;