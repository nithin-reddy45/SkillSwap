import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TutorialPlayerModal.css";

function TutorialPlayerModal({ course, isOpen, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // overview, notes, resources
  const [completedLessons, setCompletedLessons] = useState({});

  if (!isOpen || !course) return null;

  const toggleLesson = (idx) => {
    setCompletedLessons(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleFindPartner = () => {
    onClose();
    navigate(`/matches?skill=${encodeURIComponent(course.primarySkill || course.category)}`);
  };

  return (
    <div className="tutorial-modal-overlay" onClick={onClose}>
      <div className="tutorial-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="tutorial-modal-header">
          <div className="tutorial-header-info">
            <span className="tutorial-badge">{course.category}</span>
            <h2>{course.title}</h2>
            <p className="tutorial-instructor">
              Instructor: <strong>{course.instructor}</strong> • {course.duration} • ⭐ {course.rating} ({course.reviewCount.toLocaleString()} reviews)
            </p>
          </div>
          <button className="tutorial-modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Video Player */}
        <div className="tutorial-video-wrapper">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${course.videoEmbedId}?autoplay=1&rel=0`}
            title={course.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="tutorial-iframe"
          />
        </div>

        {/* Action Bar */}
        <div className="tutorial-action-bar">
          <div className="tutorial-tabs">
            <button
              className={`tutorial-tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              📖 Overview & Lessons
            </button>
            <button
              className={`tutorial-tab-btn ${activeTab === "notes" ? "active" : ""}`}
              onClick={() => setActiveTab("notes")}
            >
              📝 Quick Cheatsheet & Notes
            </button>
            <button
              className={`tutorial-tab-btn ${activeTab === "resources" ? "active" : ""}`}
              onClick={() => setActiveTab("resources")}
            >
              🔗 Official Docs & Links
            </button>
          </div>

          <button className="tutorial-partner-btn" onClick={handleFindPartner}>
            🤝 Find Study Partner for {course.primarySkill}
          </button>
        </div>

        {/* Content Body */}
        <div className="tutorial-modal-content">
          {activeTab === "overview" && (
            <div className="tutorial-overview">
              <p className="tutorial-desc">{course.description}</p>
              
              <h3 className="section-subtitle">📚 Course Modules & Lesson Checklist</h3>
              <div className="tutorial-modules-list">
                {course.syllabus.map((mod, mIdx) => (
                  <div key={mIdx} className="tutorial-module-card">
                    <div className="module-header">
                      <span className="module-week">{mod.week}</span>
                      <h4>{mod.title}</h4>
                    </div>
                    <ul className="module-topics">
                      {mod.topics.map((t, tIdx) => {
                        const key = `${mIdx}-${tIdx}`;
                        const isDone = !!completedLessons[key];
                        return (
                          <li
                            key={tIdx}
                            className={`topic-item ${isDone ? "completed" : ""}`}
                            onClick={() => toggleLesson(key)}
                          >
                            <span className="topic-checkbox">{isDone ? "✅" : "⭕"}</span>
                            <span>{t}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="tutorial-notes">
              <div className="notes-box">
                <h4>💡 Key Takeaways & Best Practices</h4>
                <ul>
                  <li><strong>Core Fundamentals:</strong> Build small interactive prototypes after each lesson module.</li>
                  <li><strong>Skill Exchange Tip:</strong> Teaching this concept to a SkillSwap partner reinforces 90% of what you learn.</li>
                  <li><strong>Code Quality:</strong> Always follow modern industry standards, clean architecture, and type safety.</li>
                  <li><strong>Active Practice:</strong> Don't just watch videos—open your code editor and type along actively!</li>
                </ul>
              </div>
              <div className="skills-pill-group">
                <span>Technologies Covered:</span>
                {course.relatedSkills?.map((skill, idx) => (
                  <span key={idx} className="skill-pill">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="tutorial-resources">
              <div className="resource-item">
                <div className="resource-icon">🌐</div>
                <div>
                  <h4>Official Documentation & Tutorials</h4>
                  <p>Read the definitive guides and API reference for {course.primarySkill}.</p>
                  <a href={course.officialUrl} target="_blank" rel="noopener noreferrer" className="resource-link">
                    Open Official Documentation ↗
                  </a>
                </div>
              </div>
              <div className="resource-item">
                <div className="resource-icon">🎓</div>
                <div>
                  <h4>SkillSwap Peer Learning Room</h4>
                  <p>Connect 1-on-1 via WebRTC video call or chat to solve exercises together.</p>
                  <button onClick={handleFindPartner} className="resource-btn">
                    Find Compatible Tutor/Learner
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default TutorialPlayerModal;
