import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./MySkills.css";

const CATEGORIES = [
  "Development",
  "AI & Data Science",
  "Design & UI/UX",
  "Cloud & DevOps",
  "Mobile Apps",
  "Cybersecurity",
  "Languages",
  "Other",
];

function MySkills() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [activeTab, setActiveTab] = useState("teach"); // "teach" | "learn"

  // Teach Skills State
  const [teachSkills, setTeachSkills] = useState([]);
  const [teachName, setTeachName] = useState("");
  const [teachCategory, setTeachCategory] = useState("Development");
  const [teachLevel, setTeachLevel] = useState("Intermediate");
  const [teachExp, setTeachExp] = useState("1 year");
  const [teachDesc, setTeachDesc] = useState("");
  const [teachTagInput, setTeachTagInput] = useState("");

  // Learn Skills State
  const [learnSkills, setLearnSkills] = useState([]);
  const [learnName, setLearnName] = useState("");
  const [learnCategory, setLearnCategory] = useState("Development");
  const [learnCurrentLevel, setLearnCurrentLevel] = useState("Beginner");
  const [learnTargetLevel, setLearnTargetLevel] = useState("Advanced");
  const [learnDesc, setLearnDesc] = useState("");

  useEffect(() => {
    const fetchUserSkills = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          const u = data.user || data;
          setUser(u);

          setTeachSkills(
            Array.isArray(u.teachSkills)
              ? u.teachSkills.map((s) =>
                  typeof s === "string"
                    ? {
                        skill: s,
                        category: "Development",
                        level: "Intermediate",
                        yearsExperience: "1 year",
                        description: "",
                        tags: [],
                        isVerified: false,
                      }
                    : s
                )
              : []
          );

          setLearnSkills(
            Array.isArray(u.learnSkills)
              ? u.learnSkills.map((s) =>
                  typeof s === "string"
                    ? {
                        skill: s,
                        category: "Development",
                        currentLevel: "Beginner",
                        targetLevel: "Advanced",
                        description: "",
                        tags: [],
                      }
                    : s
                )
              : []
          );
        }
      } catch (err) {
        console.error("Skills fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSkills();
  }, [navigate]);

  // Add Teach Skill
  const handleAddTeachSkill = () => {
    if (!teachName.trim()) return;
    const tags = teachTagInput
      ? teachTagInput.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    setTeachSkills((prev) => [
      ...prev,
      {
        skill: teachName.trim(),
        category: teachCategory,
        level: teachLevel,
        yearsExperience: teachExp,
        description: teachDesc.trim(),
        tags,
        isVerified: false,
      },
    ]);

    setTeachName("");
    setTeachDesc("");
    setTeachTagInput("");
  };

  const handleRemoveTeach = (idx) => {
    setTeachSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add Learn Skill
  const handleAddLearnSkill = () => {
    if (!learnName.trim()) return;

    setLearnSkills((prev) => [
      ...prev,
      {
        skill: learnName.trim(),
        category: learnCategory,
        currentLevel: learnCurrentLevel,
        targetLevel: learnTargetLevel,
        description: learnDesc.trim(),
        tags: [],
      },
    ]);

    setLearnName("");
    setLearnDesc("");
  };

  const handleRemoveLearn = (idx) => {
    setLearnSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  // Save All Skills
  const handleSaveAll = async () => {
    setSaving(true);
    setSuccessMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teachSkills,
          learnSkills,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update skills");
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("authChanged"));
      }

      setSuccessMsg("✓ Skills portfolio updated successfully! AI matching has been re-indexed.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Save error:", err);
      alert(err.message || "Failed to save skills.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="my-skills-page">
      <div className="my-skills-container">
        
        {/* HEADER */}
        <header className="my-skills-header">
          <div className="skills-badge-chip">
            <span>⚙️ Skill Portfolio Management</span>
          </div>
          <h1>
            My Skills & <span className="gradient-text">Learning Goals</span>
          </h1>
          <p>
            Configure what you can teach and what you want to learn. Our 6-factor AI engine uses these records to calculate reciprocal swap compatibility.
          </p>
        </header>

        {successMsg && (
          <div className="skills-success-banner">
            {successMsg}
          </div>
        )}

        {/* TABS & SAVE ACTION */}
        <div className="skills-control-bar">
          <div className="skills-tab-group">
            <button
              className={`skills-tab-btn ${activeTab === "teach" ? "active teach" : ""}`}
              onClick={() => setActiveTab("teach")}
            >
              🎓 Skills I Can Teach ({teachSkills.length})
            </button>
            <button
              className={`skills-tab-btn ${activeTab === "learn" ? "active learn" : ""}`}
              onClick={() => setActiveTab("learn")}
            >
              📚 Skills I Want to Learn ({learnSkills.length})
            </button>
          </div>

          <button
            className="save-skills-main-btn"
            onClick={handleSaveAll}
            disabled={saving}
          >
            {saving ? "Saving Changes..." : "💾 Save Changes"}
          </button>
        </div>

        {loading ? (
          <div className="skills-loading-card">
            <span>🔄 Loading your skills portfolio...</span>
          </div>
        ) : (
          <div className="skills-content-layout">
            
            {/* TEACH TAB */}
            {activeTab === "teach" && (
              <div className="tab-pane">
                
                {/* ADD TEACH SKILL CARD */}
                <div className="add-skill-form-card">
                  <h3>+ Add a Skill You Can Teach</h3>
                  <div className="form-row-3">
                    <div className="input-field">
                      <label>Skill Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Java, React, SQL, Figma"
                        value={teachName}
                        onChange={(e) => setTeachName(e.target.value)}
                      />
                    </div>
                    <div className="input-field">
                      <label>Category</label>
                      <select value={teachCategory} onChange={(e) => setTeachCategory(e.target.value)}>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-field">
                      <label>Proficiency Level</label>
                      <select value={teachLevel} onChange={(e) => setTeachLevel(e.target.value)}>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="input-field">
                      <label>Years of Experience</label>
                      <select value={teachExp} onChange={(e) => setTeachExp(e.target.value)}>
                        <option value="6 months">6 Months</option>
                        <option value="1 year">1 Year</option>
                        <option value="2 years">2 Years</option>
                        <option value="3+ years">3+ Years</option>
                        <option value="5+ years">5+ Years</option>
                      </select>
                    </div>
                    <div className="input-field">
                      <label>Tags (Comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. backend, oop, spring-boot"
                        value={teachTagInput}
                        onChange={(e) => setTeachTagInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="input-field">
                    <label>Description / Teaching Notes</label>
                    <textarea
                      rows={2}
                      placeholder="What specific topics or real-world projects can you mentor on?"
                      value={teachDesc}
                      onChange={(e) => setTeachDesc(e.target.value)}
                    />
                  </div>

                  <button type="button" className="add-teach-btn" onClick={handleAddTeachSkill}>
                    + Add to Teaching Portfolio
                  </button>
                </div>

                {/* CURRENT TEACH SKILLS LIST */}
                <div className="skills-grid-display">
                  {teachSkills.length === 0 ? (
                    <div className="empty-skills-notice">
                      <p>No teaching skills listed yet. Add skills you're confident in above!</p>
                    </div>
                  ) : (
                    teachSkills.map((ts, idx) => (
                      <div key={idx} className="skill-card-item teach">
                        <div className="card-top">
                          <div>
                            <h4>{ts.skill}</h4>
                            <span className="cat-chip">{ts.category || "Development"}</span>
                          </div>
                          <button
                            type="button"
                            className="delete-skill-btn"
                            onClick={() => handleRemoveTeach(idx)}
                            title="Remove skill"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="card-meta-row">
                          <span className="meta-pill level">{ts.level}</span>
                          <span className="meta-pill exp">⏳ {ts.yearsExperience || "1 year"}</span>
                          {ts.isVerified ? (
                            <span className="meta-pill verified">✓ Verified Expert</span>
                          ) : (
                            <Link to="/skill-assessment" className="meta-pill verify-action">
                              Verify Skill →
                            </Link>
                          )}
                        </div>

                        {ts.description && (
                          <p className="card-desc-text">"{ts.description}"</p>
                        )}

                        {Array.isArray(ts.tags) && ts.tags.length > 0 && (
                          <div className="card-tags-row">
                            {ts.tags.map((t, tIdx) => (
                              <span key={tIdx} className="tag-bubble">#{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

            {/* LEARN TAB */}
            {activeTab === "learn" && (
              <div className="tab-pane">
                
                {/* ADD LEARN SKILL CARD */}
                <div className="add-skill-form-card learn">
                  <h3>+ Add a Skill You Want to Learn</h3>
                  <div className="form-row-3">
                    <div className="input-field">
                      <label>Skill Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Machine Learning, Docker, Next.js"
                        value={learnName}
                        onChange={(e) => setLearnName(e.target.value)}
                      />
                    </div>
                    <div className="input-field">
                      <label>Category</label>
                      <select value={learnCategory} onChange={(e) => setLearnCategory(e.target.value)}>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-field">
                      <label>Current Proficiency</label>
                      <select value={learnCurrentLevel} onChange={(e) => setLearnCurrentLevel(e.target.value)}>
                        <option value="Beginner">Beginner (Zero Knowledge)</option>
                        <option value="Intermediate">Intermediate (Some Practice)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="input-field">
                      <label>Target Level</label>
                      <select value={learnTargetLevel} onChange={(e) => setLearnTargetLevel(e.target.value)}>
                        <option value="Intermediate">Intermediate Level</option>
                        <option value="Advanced">Advanced Level</option>
                        <option value="Expert">Expert Level</option>
                      </select>
                    </div>
                    <div className="input-field">
                      <label>Learning Goal / Motivation</label>
                      <input
                        type="text"
                        placeholder="e.g. Build production neural networks"
                        value={learnDesc}
                        onChange={(e) => setLearnDesc(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="button" className="add-learn-btn" onClick={handleAddLearnSkill}>
                    + Add to Learning Goals
                  </button>
                </div>

                {/* CURRENT LEARN SKILLS LIST */}
                <div className="skills-grid-display">
                  {learnSkills.length === 0 ? (
                    <div className="empty-skills-notice">
                      <p>No learning goals listed yet. Add skills you wish to learn above!</p>
                    </div>
                  ) : (
                    learnSkills.map((ls, idx) => (
                      <div key={idx} className="skill-card-item learn">
                        <div className="card-top">
                          <div>
                            <h4>{ls.skill}</h4>
                            <span className="cat-chip">{ls.category || "Development"}</span>
                          </div>
                          <button
                            type="button"
                            className="delete-skill-btn"
                            onClick={() => handleRemoveLearn(idx)}
                            title="Remove skill"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="card-meta-row">
                          <span className="meta-pill current">Current: {ls.currentLevel}</span>
                          <span className="meta-pill target">Target: {ls.targetLevel}</span>
                          <Link to="/roadmap" className="meta-pill roadmap-action">
                            🗺️ Build Roadmap →
                          </Link>
                        </div>

                        {ls.description && (
                          <p className="card-desc-text">"{ls.description}"</p>
                        )}
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default MySkills;
