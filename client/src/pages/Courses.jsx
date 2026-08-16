import { useState, useMemo } from "react";
import { COURSES_DATA, CATEGORIES } from "../data/coursesData";
import CourseCard from "../components/CourseCard";
import TutorialPlayerModal from "../components/TutorialPlayerModal";
import SyllabusModal from "../components/SyllabusModal";
import QuizModal from "../components/QuizModal";
import "./Courses.css";

function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [sortBy, setSortBy] = useState("popular"); // popular, rating, duration
  const [onlySaved, setOnlySaved] = useState(false);

  // Saved Courses State persisted in localStorage
  const [savedCourses, setSavedCourses] = useState(() => {
    try {
      const saved = localStorage.getItem("savedCourses");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Modals State
  const [playerCourse, setPlayerCourse] = useState(null);
  const [syllabusCourse, setSyllabusCourse] = useState(null);
  const [quizCourse, setQuizCourse] = useState(null);

  // Toggle Save
  const handleToggleSave = (courseId) => {
    setSavedCourses(prev => {
      let updated;
      if (prev.includes(courseId)) {
        updated = prev.filter(id => id !== courseId);
      } else {
        updated = [...prev, courseId];
      }
      try {
        localStorage.setItem("savedCourses", JSON.stringify(updated));
      } catch (err) {
        console.error("Error saving course:", err);
      }
      return updated;
    });
  };

  // Filtered and Sorted Courses
  const filteredCourses = useMemo(() => {
    return COURSES_DATA.filter(course => {
      // Category filter
      if (selectedCategory !== "All Categories" && course.category !== selectedCategory) {
        return false;
      }

      // Level filter
      if (selectedLevel !== "All Levels") {
        if (selectedLevel === "Beginner" && !course.level.includes("Beginner")) return false;
        if (selectedLevel === "Intermediate" && !course.level.includes("Intermediate")) return false;
        if (selectedLevel === "Advanced" && !course.level.includes("Advanced")) return false;
      }

      // Saved only filter
      if (onlySaved && !savedCourses.includes(course.id)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = course.title.toLowerCase().includes(query);
        const matchDesc = course.description.toLowerCase().includes(query);
        const matchInstructor = course.instructor.toLowerCase().includes(query);
        const matchSkill = course.relatedSkills?.some(s => s.toLowerCase().includes(query));
        if (!matchTitle && !matchDesc && !matchInstructor && !matchSkill) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
      if (sortBy === "lessons") return b.lessonsCount - a.lessonsCount;
      return b.reviewCount * b.rating - a.reviewCount * a.rating; // default popular
    });
  }, [searchQuery, selectedCategory, selectedLevel, sortBy, onlySaved, savedCourses]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedLevel("All Levels");
    setOnlySaved(false);
  };

  return (
    <div className="courses-page">
      
      {/* Hero Header */}
      <section className="courses-hero">
        <div className="courses-hero-content">
          <p className="courses-tag">🎓 CURATED LEARNING HUB</p>
          <h1>
            Explore All Courses & <span>Best Tutorials</span>
          </h1>
          <p className="courses-subtitle">
            Master full stack web development, generative AI, data structures, cloud architecture, mobile apps, and UI/UX design with industry-standard roadmaps, quizzes, and peer study matching.
          </p>

          {/* Search & Main Filter Controls */}
          <div className="courses-search-bar-wrapper">
            <div className="courses-search-input-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search courses by skill (e.g., React, Python, DSA, Docker, Figma)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="courses-search-input"
              />
              {searchQuery && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="courses-filters-row">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="courses-select"
              >
                <option value="All Levels">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="courses-select"
              >
                <option value="popular">🔥 Most Popular</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="lessons">📚 Most Lessons</option>
                <option value="reviews">💬 Most Reviewed</option>
              </select>

              <button
                className={`courses-saved-toggle-btn ${onlySaved ? "active" : ""}`}
                onClick={() => setOnlySaved(!onlySaved)}
              >
                ★ Saved ({savedCourses.length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Chips */}
      <section className="courses-categories-bar">
        <div className="categories-scroll-wrapper">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              className={`category-chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Main Results Grid */}
      <main className="courses-main-container">
        <div className="courses-results-header">
          <h2>
            {selectedCategory === "All Categories" ? "All Featured Courses & Tutorials" : selectedCategory}
            <span className="results-count">({filteredCourses.length} available)</span>
          </h2>

          {(selectedCategory !== "All Categories" || selectedLevel !== "All Levels" || searchQuery || onlySaved) && (
            <button className="reset-filters-btn" onClick={clearFilters}>
              Reset Filters ↺
            </button>
          )}
        </div>

        {filteredCourses.length > 0 ? (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
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
        ) : (
          <div className="courses-empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No courses or tutorials found</h3>
            <p>We couldn't find any courses matching your search criteria.</p>
            <button className="empty-reset-btn" onClick={clearFilters}>
              Show All Courses
            </button>
          </div>
        )}
      </main>

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

export default Courses;
