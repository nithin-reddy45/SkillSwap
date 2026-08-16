import { useState } from "react";
import { Link } from "react-router-dom";
import { COURSES_DATA } from "../data/coursesData";
import CourseCard from "../components/CourseCard";
import TutorialPlayerModal from "../components/TutorialPlayerModal";
import SyllabusModal from "../components/SyllabusModal";
import QuizModal from "../components/QuizModal";
import "./Home.css";

function Home() {
  const [selectedHomeCategory, setSelectedHomeCategory] = useState("All");
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

  const featuredCourses = COURSES_DATA.filter((course) => {
    if (selectedHomeCategory === "All") return true;
    if (selectedHomeCategory === "Web Dev") return course.category === "Web Development";
    if (selectedHomeCategory === "AI & ML") return course.category === "AI & Data Science";
    if (selectedHomeCategory === "DSA") return course.category === "DSA & Coding Interview";
    if (selectedHomeCategory === "Cloud & DevOps") return course.category.includes("Cloud") || course.category.includes("DevOps");
    return true;
  }).slice(0, 6);

  return (
    <div className="home">
      
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-tag">LEARN • TEACH • CONNECT</p>

          <h1>
            Exchange Skills.
            <br />
            <span>Grow Together.</span>
          </h1>

          <p className="hero-description">
            SkillSwap AI connects people who want to learn with people
            who have the skills to teach. Find your perfect learning
            partner and grow together.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-btn">
              Get Started
            </Link>

            <Link to="/matches" className="secondary-btn">
              Find Matches
            </Link>

            <Link to="/courses" className="tutorial-hero-btn">
              🎓 Best Tutorials
            </Link>

            <Link to="/coding-test" className="tutorial-hero-btn">
              ⚡ Coding Arena
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="match-card">
            <p className="match-label">AI MATCH</p>
            <h3>Perfect Learning Partner</h3>

            <div className="skills">
              <div>
                <span>You teach</span>
                <strong>Java & DSA</strong>
              </div>

              <div>
                <span>You learn</span>
                <strong>React & Node.js</strong>
              </div>
            </div>

            <div className="match-score">
              <span>Compatibility</span>
              <strong>92%</strong>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COURSES & BEST TUTORIALS SECTION */}
      <section className="featured-courses-section">
        <div className="featured-header-content">
          <p className="section-tag">TOP RATED LEARNING PATHS</p>
          <h2>Best Courses & Industry Tutorials</h2>
          <p className="section-subtitle">
            Watch hands-on video tutorials, study roadmaps, test yourself with practice quizzes, and connect with peer study partners.
          </p>

          {/* Quick Category Filter Bar */}
          <div className="home-category-tabs">
            {["All", "Web Dev", "AI & ML", "DSA", "Cloud & DevOps"].map((cat) => (
              <button
                key={cat}
                className={`home-tab-btn ${selectedHomeCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedHomeCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="home-courses-grid">
          {featuredCourses.map((course) => (
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

        <div className="view-all-courses-wrap">
          <Link to="/courses" className="view-all-courses-btn">
            Explore All Courses & Best Tutorials (12+) →
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <p className="section-tag">HOW IT WORKS</p>

        <h2>Learn by exchanging knowledge</h2>

        <div className="steps">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Share Your Skills</h3>
            <p>
              Add the skills you can teach and the skills you want to learn.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Find Your Match</h3>
            <p>
              Our intelligent matching system finds compatible learning partners.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Grow Together</h3>
            <p>
              Connect, exchange knowledge, schedule sessions, and build skills.
            </p>
          </div>
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

export default Home;