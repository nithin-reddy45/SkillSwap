import "./SyllabusModal.css";

function SyllabusModal({ course, isOpen, onClose, onStartTutorial }) {
  if (!isOpen || !course) return null;

  return (
    <div className="syllabus-modal-overlay" onClick={onClose}>
      <div className="syllabus-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="syllabus-modal-header">
          <div>
            <div className="syllabus-pill-row">
              <span className="syllabus-badge">{course.category}</span>
              <span className="syllabus-level-badge">{course.level}</span>
            </div>
            <h2>📋 {course.title}</h2>
            <p className="syllabus-meta">
              Curriculum Roadmap • {course.syllabus.length} Core Modules • ~{course.duration} to complete
            </p>
          </div>
          <button className="syllabus-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Body Roadmap */}
        <div className="syllabus-modal-body">
          <div className="syllabus-intro-banner">
            <div className="banner-icon">{course.icon}</div>
            <div>
              <h3>Master {course.primarySkill} from Foundations to Production</h3>
              <p>Follow this step-by-step verified learning path curated by industry engineers and top instructors.</p>
            </div>
          </div>

          <div className="timeline-container">
            {course.syllabus.map((mod, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-marker">
                  <div className="marker-dot">{idx + 1}</div>
                  {idx < course.syllabus.length - 1 && <div className="marker-line" />}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-week">{mod.week}</span>
                    <h4>{mod.title}</h4>
                  </div>
                  <div className="timeline-topics-grid">
                    {mod.topics.map((topic, tIdx) => (
                      <div key={tIdx} className="timeline-topic-card">
                        <span className="topic-num">⚡ Lesson {tIdx + 1}:</span>
                        <span className="topic-text">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Related Tech & Prerequisites */}
          <div className="syllabus-prereq-box">
            <h4>💡 Skills & Technologies You'll Acquire:</h4>
            <div className="prereq-tags">
              {course.relatedSkills?.map((skill, sIdx) => (
                <span key={sIdx} className="prereq-tag">
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="syllabus-modal-footer">
          <button className="syllabus-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="syllabus-btn-primary"
            onClick={() => {
              onClose();
              if (onStartTutorial) onStartTutorial(course);
            }}
          >
            ▶ Start Learning This Course
          </button>
        </div>

      </div>
    </div>
  );
}

export default SyllabusModal;
