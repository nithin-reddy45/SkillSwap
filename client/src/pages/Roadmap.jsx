import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Roadmap.css";

const POPULAR_SKILLS = [
  { name: "Machine Learning", icon: "🤖", desc: "NumPy, Pandas, Scikit-Learn, Models" },
  { name: "React", icon: "⚛️", desc: "Hooks, State, Routing, Next.js" },
  { name: "Full Stack MERN", icon: "🚀", desc: "MongoDB, Express, React, Node.js" },
  { name: "Python", icon: "🐍", desc: "OOP, Automation, APIs, Scripting" },
  { name: "Data Science", icon: "📊", desc: "EDA, Statistics, Visuals, Analytics" },
  { name: "UI/UX Design", icon: "🎨", desc: "Figma, Wireframing, User Research" },
];

function Roadmap() {
  const [skillInput, setSkillInput] = useState("Machine Learning");
  const [level, setLevel] = useState("Beginner");
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [goal] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Store completed topic keys in localStorage / sync with DB
  const [completedTopics, setCompletedTopics] = useState(() => {
    try {
      const saved = localStorage.getItem("skillswap_completed_topics");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const fetchSavedRoadmaps = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/ai/roadmap/my-roadmaps`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.roadmaps)) {
        setSavedRoadmaps(data.roadmaps);
      }
    } catch (err) {
      console.error("Fetch saved roadmaps error:", err);
    }
  };

  const handleGenerate = async (targetSkill = skillInput, targetLevel = level, targetWeeks = durationWeeks) => {
    if (!targetSkill.trim()) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: targetSkill,
          level: targetLevel,
          durationWeeks: targetWeeks,
          goal,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to generate roadmap");
      }

      setRoadmap(data.roadmap);
      window.scrollTo({ top: 350, behavior: "smooth" });
    } catch (err) {
      console.error("Roadmap generation error:", err);
      setError(err.message || "Something went wrong while creating the roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToAccount = async () => {
    if (!roadmap) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to save this roadmap to your account.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/roadmap/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill: roadmap.skill,
          title: roadmap.title,
          level: roadmap.level,
          durationWeeks: roadmap.durationWeeks,
          goal: roadmap.goal,
          weeks: roadmap.weeks,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save roadmap");
      }

      alert("🎉 Roadmap saved to your SkillSwap account!");
      fetchSavedRoadmaps();
    } catch (err) {
      console.error("Save error:", err);
      alert(err.message || "Unable to save roadmap.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        handleGenerate("Machine Learning", "Beginner", 4);
        fetchSavedRoadmaps();
      }
    };
    init();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTopic = (topicName) => {
    if (!roadmap) return;
    const currentCompleted = completedTopics[roadmap.skill] || [];
    let updated;

    if (currentCompleted.includes(topicName)) {
      updated = currentCompleted.filter((t) => t !== topicName);
    } else {
      updated = [...currentCompleted, topicName];
    }

    const newMap = {
      ...completedTopics,
      [roadmap.skill]: updated,
    };

    setCompletedTopics(newMap);
    localStorage.setItem("skillswap_completed_topics", JSON.stringify(newMap));
  };

  const totalTopics = roadmap
    ? roadmap.weeks.reduce((acc, w) => acc + (w.topics?.length || 0), 0)
    : 0;

  const currentCompletedCount = (roadmap && completedTopics[roadmap.skill])
    ? completedTopics[roadmap.skill].length
    : 0;

  const progressPercentage = totalTopics > 0
    ? Math.round((currentCompletedCount / totalTopics) * 100)
    : 0;

  return (
    <div className="roadmap-page">
      <div className="roadmap-container">
        
        {/* HEADER */}
        <header className="roadmap-hero">
          <div className="roadmap-badge-chip">
            <span>✨ AI Learning Path Generator</span>
          </div>
          <h1 className="roadmap-title">
            Personalized <span className="gradient-text">AI Learning Roadmap</span>
          </h1>
          <p className="roadmap-subtitle">
            Structured week-by-week milestones tailored to your target skills. Save your roadmap, track checklist progress, and swap skills with matching mentors!
          </p>
        </header>

        {/* SAVED ROADMAPS PILLS */}
        {savedRoadmaps.length > 0 && (
          <div className="saved-roadmaps-bar">
            <span className="saved-lbl">📁 Your Saved Roadmaps:</span>
            <div className="saved-pills-row">
              {savedRoadmaps.map((sr) => (
                <button
                  key={sr._id}
                  className="saved-roadmap-pill"
                  onClick={() => {
                    setRoadmap(sr);
                    setSkillInput(sr.skill);
                  }}
                >
                  📖 {sr.skill} ({sr.progress || 0}%)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* QUICK PICKS */}
        <section className="quick-picks-section">
          <h3 className="section-label">⚡ POPULAR LEARNING TRACKS</h3>
          <div className="quick-picks-grid">
            {POPULAR_SKILLS.map((sk) => (
              <button
                key={sk.name}
                className={`quick-pick-card ${skillInput.toLowerCase() === sk.name.toLowerCase() ? "active" : ""}`}
                onClick={() => {
                  setSkillInput(sk.name);
                  handleGenerate(sk.name, level, durationWeeks);
                }}
              >
                <span className="pick-icon">{sk.icon}</span>
                <div className="pick-info">
                  <strong>{sk.name}</strong>
                  <p>{sk.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* CONTROLS */}
        <div className="roadmap-controls-card">
          <div className="controls-grid">
            
            <div className="input-group">
              <label>Target Skill or Tech</label>
              <input
                type="text"
                placeholder="e.g. Python, Docker, Next.js, GraphQL..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              />
            </div>

            <div className="input-group">
              <label>Current Experience Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="Beginner">Beginner (Foundations)</option>
                <option value="Intermediate">Intermediate (Building Projects)</option>
                <option value="Advanced">Advanced (Architecture)</option>
              </select>
            </div>

            <div className="input-group">
              <label>Target Duration</label>
              <select value={durationWeeks} onChange={(e) => setDurationWeeks(Number(e.target.value))}>
                <option value={2}>2 Weeks (Fast Track)</option>
                <option value={4}>4 Weeks (Standard Sprint)</option>
                <option value={6}>6 Weeks (Deep Dive)</option>
                <option value={8}>8 Weeks (Mastery Cohort)</option>
              </select>
            </div>

          </div>

          <div className="controls-action-row">
            <button
              className="generate-roadmap-btn"
              onClick={() => handleGenerate()}
              disabled={loading}
            >
              {loading ? "🔄 Generating AI Roadmap..." : "🚀 Generate Roadmap"}
            </button>
          </div>
        </div>

        {error && (
          <div className="roadmap-error-banner">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* ROADMAP RESULTS */}
        {roadmap && (
          <div className="roadmap-results-wrapper">
            
            {/* ROADMAP HEADER & PROGRESS */}
            <div className="roadmap-meta-card">
              <div className="meta-left">
                <span className="meta-level-tag">{roadmap.level}</span>
                <h2>{roadmap.title}</h2>
                <p className="meta-goal">🎯 {roadmap.goal}</p>
                <button
                  className="save-roadmap-btn"
                  onClick={handleSaveToAccount}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "💾 Save Roadmap to Account"}
                </button>
              </div>

              <div className="meta-right-progress">
                <div className="progress-top-labels">
                  <span>Track Progress</span>
                  <strong>{progressPercentage}%</strong>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="progress-subtext">
                  {currentCompletedCount} of {totalTopics} topics completed
                </span>
              </div>
            </div>

            {/* ACTION BANNER */}
            <div className="roadmap-swap-banner">
              <div className="banner-text">
                <strong>Looking for a learning partner or mentor in {roadmap.skill}?</strong>
                <p>Find peer developers on SkillSwap who can guide you through these weekly milestones!</p>
              </div>
              <Link to="/matches" className="banner-match-btn">
                🔍 Find {roadmap.skill} Mentors
              </Link>
            </div>

            {/* TIMELINE OF WEEKS */}
            <div className="roadmap-timeline">
              {roadmap.weeks.map((weekItem, idx) => (
                <div className="timeline-week-card" key={weekItem.week || idx}>
                  
                  <div className="week-badge-col">
                    <div className="week-number-pill">
                      <span>WEEK</span>
                      <strong>{weekItem.week || idx + 1}</strong>
                    </div>
                  </div>

                  <div className="week-content-col">
                    <div className="week-title-row">
                      <h3>{weekItem.title}</h3>
                    </div>
                    <p className="week-desc">{weekItem.description}</p>

                    {/* TOPIC CHECKLIST */}
                    <div className="week-topics-box">
                      <span className="box-heading">Key Topics & Action Items:</span>
                      <div className="topics-checkbox-list">
                        {weekItem.topics?.map((topic, tIdx) => {
                          const isDone = (completedTopics[roadmap.skill] || []).includes(topic);
                          return (
                            <label
                              key={tIdx}
                              className={`topic-check-item ${isDone ? "completed" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => toggleTopic(topic)}
                              />
                              <span className="topic-text">{topic}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* RESOURCES */}
                    {weekItem.resources && weekItem.resources.length > 0 && (
                      <div className="week-resources-box">
                        <span className="box-heading">📚 Recommended Resources:</span>
                        <div className="resource-chips">
                          {weekItem.resources.map((res, rIdx) => (
                            <span key={rIdx} className="resource-chip">
                              📖 {res}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              ))}
            </div>

            {/* FOOTER CTA */}
            <div className="roadmap-bottom-cta">
              <h3>Ready to test your knowledge in {roadmap.skill}?</h3>
              <p>Take an instant AI Skill Assessment to earn a verified profile badge!</p>
              <Link to="/skill-assessment" className="cta-quiz-btn">
                🧠 Take {roadmap.skill} AI Quiz & Verify
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Roadmap;
