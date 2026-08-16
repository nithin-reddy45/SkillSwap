import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

  // Connection count
  const [connectionCount, setConnectionCount] = useState(0);

  // Pending request count
  const [requestCount, setRequestCount] = useState(0);

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
    const matched = COURSES_DATA.filter((course) => {
      const skillLower = user.learnSkills.map((s) => s.toLowerCase());
      return (
        skillLower.some((s) => course.primarySkill.toLowerCase().includes(s)) ||
        skillLower.some((s) => course.title.toLowerCase().includes(s)) ||
        course.relatedSkills.some((rs) =>
          skillLower.some((s) => rs.toLowerCase().includes(s))
        )
      );
    });

    if (matched.length === 0) {
      return COURSES_DATA.slice(0, 3);
    }
    return matched.slice(0, 3);
  }, [user]);

  // FETCH CONNECTIONS COUNT
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${API_BASE_URL}/api/connections/my-connections`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setConnectionCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        console.error("Connection Count Error:", error);
      }
    };

    fetchConnections();

    const handleRequestUpdated = () => {
      fetchConnections();
    };

    window.addEventListener("requestUpdated", handleRequestUpdated);

    return () => {
      window.removeEventListener("requestUpdated", handleRequestUpdated);
    };
  }, []);

  // FETCH PENDING REQUEST COUNT
  useEffect(() => {
    const fetchRequestCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${API_BASE_URL}/api/connections/requests`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setRequestCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        console.error("Request Count Error:", error);
      }
    };

    fetchRequestCount();
  }, []);

  // REAL-TIME CONNECTION REQUEST
  useEffect(() => {
    if (!socket) return;

    const handleNewConnectionRequest = () => {
      setRequestCount((prevCount) => prevCount + 1);
    };

    socket.on("newConnectionRequest", handleNewConnectionRequest);

    return () => {
      socket.off("newConnectionRequest", handleNewConnectionRequest);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-tag">YOUR LEARNING DASHBOARD</p>
          <h1>Welcome back, {user.name}! 👋</h1>
          <p className="dashboard-subtitle">
            Manage your skills, discover new people, access top tutorials, and
            grow your learning network.
          </p>
        </div>

        <div className="dashboard-actions">
          {/* ALL TUTORIALS BUTTON */}
          <button
            className="browse-tutorials-btn"
            onClick={() => navigate("/courses")}
          >
            🎓 Tutorials
          </button>

          {/* CODING TESTS ARENA BUTTON */}
          <button
            className="browse-tutorials-btn"
            onClick={() => navigate("/coding-test")}
          >
            ⚡ Coding Tests
          </button>

          {/* CONNECTION REQUEST NOTIFICATION */}
          <button
            className="request-notification-btn"
            onClick={() => navigate("/requests")}
          >
            🔔 Requests
            {requestCount > 0 && (
              <span className="dashboard-request-badge">
                {requestCount > 99 ? "99+" : requestCount}
              </span>
            )}
          </button>

          {/* LOGOUT */}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>

      {/* Statistics */}
      <section className="stats-grid">
        {/* TEACH SKILLS */}
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div>
            <h3>{user.teachSkills?.length || 0}</h3>
            <p>Skills to Teach</p>
          </div>
        </div>

        {/* LEARN SKILLS */}
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div>
            <h3>{user.learnSkills?.length || 0}</h3>
            <p>Skills to Learn</p>
          </div>
        </div>

        {/* CONNECTIONS */}
        <div
          className="stat-card"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/connections")}
        >
          <div className="stat-icon">🤝</div>
          <div>
            <h3>{connectionCount}</h3>
            <p>Connections</p>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="dashboard-grid">
        {/* TEACH SKILLS */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <p className="card-tag">WHAT YOU OFFER</p>
              <h2>Skills You Can Teach</h2>
            </div>
            <span className="card-icon">🎓</span>
          </div>

          <div className="skills-list">
            {user.teachSkills?.length > 0 ? (
              user.teachSkills.map((skill, index) => (
                <span className="teach-tag" key={index}>
                  {skill}
                </span>
              ))
            ) : (
              <p>No teaching skills added yet.</p>
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
            <span className="card-icon">📚</span>
          </div>

          <div className="skills-list">
            {user.learnSkills?.length > 0 ? (
              user.learnSkills.map((skill, index) => (
                <span className="learn-tag" key={index}>
                  {skill}
                </span>
              ))
            ) : (
              <p>No learning skills added yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* RECOMMENDED COURSES & BEST TUTORIALS SECTION */}
      <section className="dashboard-tutorials-section">
        <div className="dashboard-tutorials-header">
          <div>
            <p className="card-tag">RECOMMENDED FOR YOUR GOALS</p>
            <h2>Top Courses & Best Video Tutorials</h2>
            <p className="tutorials-subtitle">
              Hand-picked video tutorials and quizzes aligned with your target learning skills.
            </p>
          </div>

          <button
            className="view-all-link-btn"
            onClick={() => navigate("/courses")}
          >
            Explore All 12+ Tutorials →
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

      {/* AI Match Section */}
      <section className="ai-match-card">
        <div>
          <p className="dashboard-tag">AI-POWERED RECOMMENDATIONS</p>
          <h2>Ready to Find Your Perfect Match?</h2>
          <p>
            Discover people who can teach you the skills you want to learn and
            learn from your expertise.
          </p>
        </div>

        <button
          className="find-match-btn"
          onClick={() => navigate("/matches")}
        >
          Find Matches →
        </button>
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