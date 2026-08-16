import { useNavigate } from "react-router-dom";
import "./CourseCard.css";

function CourseCard({
  course,
  isSaved,
  onToggleSave,
  onWatchTutorial,
  onViewSyllabus,
  onTakeQuiz
}) {
  const navigate = useNavigate();

  const handleFindPartner = (e) => {
    e.stopPropagation();
    navigate(`/matches?skill=${encodeURIComponent(course.primarySkill || course.category)}`);
  };

  return (
    <div className="course-card">
      {/* Card Header / Thumbnail Banner */}
      <div
        className="course-card-banner"
        style={{ background: course.thumbnailGradient }}
      >
        <span className="course-banner-icon">{course.icon}</span>
        {course.badge && (
          <span className="course-badge-pill">{course.badge}</span>
        )}
        <button
          className={`course-bookmark-btn ${isSaved ? "saved" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(course.id);
          }}
          title={isSaved ? "Remove from saved" : "Save Course"}
          aria-label="Save Course"
        >
          {isSaved ? "★" : "☆"}
        </button>
      </div>

      {/* Card Body */}
      <div className="course-card-content">
        <div className="course-category-row">
          <span className="course-category-tag">{course.category}</span>
          <span className="course-level-tag">{course.level}</span>
        </div>

        <h3 className="course-title">{course.title}</h3>
        <p className="course-instructor">
          By <strong>{course.instructor}</strong> • <span>{course.platform}</span>
        </p>

        <p className="course-desc">{course.description}</p>

        {/* Stats Row */}
        <div className="course-stats-bar">
          <span title="Rating">⭐ <strong>{course.rating}</strong> ({course.reviewCount.toLocaleString()})</span>
          <span title="Duration">⏱️ {course.duration}</span>
          <span title="Modules">📚 {course.lessonsCount} lessons</span>
        </div>

        {/* Tags */}
        <div className="course-tech-tags">
          {course.relatedSkills?.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="tech-tag">{skill}</span>
          ))}
          {course.relatedSkills?.length > 3 && (
            <span className="tech-tag-more">+{course.relatedSkills.length - 3}</span>
          )}
        </div>

        {/* SPECIFIED BUTTONS SECTION */}
        <div className="course-card-actions">
          {/* Main primary Action Button: Watch Tutorial */}
          <button
            className="btn-action-primary"
            onClick={() => onWatchTutorial(course)}
          >
            ▶ Watch Tutorial
          </button>

          {/* Secondary Action Buttons Grid */}
          <div className="btn-secondary-grid">
            <button
              className="btn-action-secondary"
              onClick={() => onViewSyllabus(course)}
              title="View full curriculum roadmap"
            >
              📋 Syllabus
            </button>

            <button
              className="btn-action-secondary"
              onClick={() => onTakeQuiz(course)}
              title="Test your understanding"
            >
              🎯 Practice Quiz
            </button>

            <button
              className="btn-action-partner"
              onClick={handleFindPartner}
              title={`Find a peer learning or teaching ${course.primarySkill}`}
            >
              🤝 Find Study Partner
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CourseCard;
