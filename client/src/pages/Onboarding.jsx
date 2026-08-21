import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Onboarding.css";

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

function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [profession, setProfession] = useState("");
  const [careerGoal, setCareerGoal] = useState("Full Stack Developer");
  const [learningGoal, setLearningGoal] = useState("");
  const [availability, setAvailability] = useState("Flexible");
  const [preferredMode, setPreferredMode] = useState("Online");

  // Teach Skills
  const [teachSkills, setTeachSkills] = useState([
    {
      skill: "JavaScript",
      category: "Development",
      level: "Intermediate",
      yearsExperience: "1 year",
      description: "ES6+, Async/Await, DOM manipulation",
      tags: ["web", "frontend"],
    },
  ]);
  const [curTeachName, setCurTeachName] = useState("");
  const [curTeachCat, setCurTeachCat] = useState("Development");
  const [curTeachLevel, setCurTeachLevel] = useState("Intermediate");
  const [curTeachExp, setCurTeachExp] = useState("1 year");
  const [curTeachDesc, setCurTeachDesc] = useState("");

  // Learn Skills
  const [learnSkills, setLearnSkills] = useState([
    {
      skill: "Python",
      category: "Development",
      currentLevel: "Beginner",
      targetLevel: "Advanced",
      description: "Data analysis and backend automation",
      tags: ["python", "backend"],
    },
  ]);
  const [curLearnName, setCurLearnName] = useState("");
  const [curLearnCat, setCurLearnCat] = useState("Development");
  const [curLearnCurrentLvl, setCurLearnCurrentLvl] = useState("Beginner");
  const [curLearnTargetLvl, setCurLearnTargetLvl] = useState("Advanced");
  const [curLearnDesc, setCurLearnDesc] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        setName(u.name || "");
        setAvatar(u.avatar || "");
        setBio(u.bio || "");
        setLocation(u.location || "");
        setProfession(u.profession || "");
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Add Teach Skill
  const handleAddTeach = () => {
    if (!curTeachName.trim()) return;
    setTeachSkills((prev) => [
      ...prev,
      {
        skill: curTeachName.trim(),
        category: curTeachCat,
        level: curTeachLevel,
        yearsExperience: curTeachExp,
        description: curTeachDesc.trim(),
        tags: [],
      },
    ]);
    setCurTeachName("");
    setCurTeachDesc("");
  };

  const handleRemoveTeach = (idx) => {
    setTeachSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add Learn Skill
  const handleAddLearn = () => {
    if (!curLearnName.trim()) return;
    setLearnSkills((prev) => [
      ...prev,
      {
        skill: curLearnName.trim(),
        category: curLearnCat,
        currentLevel: curLearnCurrentLvl,
        targetLevel: curLearnTargetLvl,
        description: curLearnDesc.trim(),
        tags: [],
      },
    ]);
    setCurLearnName("");
    setCurLearnDesc("");
  };

  const handleRemoveLearn = (idx) => {
    setLearnSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCompleteOnboarding = async () => {
    if (teachSkills.length === 0) {
      setError("Please add at least 1 skill you can teach!");
      setCurrentStep(2);
      return;
    }
    if (learnSkills.length === 0) {
      setError("Please add at least 1 skill you want to learn!");
      setCurrentStep(3);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/users/onboarding`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          avatar,
          bio: bio.trim(),
          location: location.trim(),
          profession: profession.trim(),
          careerGoal: careerGoal.trim(),
          learningGoal: learningGoal.trim(),
          availability,
          preferredMode,
          teachSkills,
          learnSkills,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to complete onboarding");
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("authChanged"));
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Onboarding submission error:", err);
      setError(err.message || "Could not save onboarding profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        
        {/* PROGRESS INDICATOR */}
        <div className="onboarding-progress-bar">
          <div className="progress-step-header">
            <span className="step-count">Step {currentStep} of 4</span>
            <span className="step-title">
              {currentStep === 1 && "Personal & Professional Background"}
              {currentStep === 2 && "Skills You Can Teach"}
              {currentStep === 3 && "Skills You Want to Learn"}
              {currentStep === 4 && "Availability & Preferences"}
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {error && <div className="onboarding-error">⚠️ {error}</div>}

        <div className="onboarding-card">
          
          {/* STEP 1: PERSONAL & BACKGROUND */}
          {currentStep === 1 && (
            <div className="step-content">
              <div className="step-intro">
                <h2>👋 Tell Us About Yourself</h2>
                <p>Help other developers know who you are and what you're passionate about.</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Profession / Title</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="e.g. Frontend Developer, CS Student"
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Location (City, Country)</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, USA / London, UK"
                  />
                </div>

                <div className="form-group">
                  <label>Target Career Goal</label>
                  <input
                    type="text"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Short Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Introduce yourself! What technologies are you exploring? What cool things are you building?"
                />
              </div>

              <div className="step-nav-actions">
                <div />
                <button
                  type="button"
                  className="next-step-btn"
                  onClick={() => setCurrentStep(2)}
                >
                  Continue to Teach Skills →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TEACH SKILLS */}
          {currentStep === 2 && (
            <div className="step-content">
              <div className="step-intro">
                <h2>🎓 Skills You Can Teach</h2>
                <p>What knowledge, frameworks, or tools can you share with other learners?</p>
              </div>

              {/* LIST OF TEACH SKILLS */}
              <div className="added-skills-list">
                {teachSkills.map((ts, idx) => (
                  <div key={idx} className="skill-chip-item teach">
                    <div>
                      <strong>{ts.skill}</strong>
                      <span className="cat-pill">{ts.category}</span>
                      <span className="lvl-pill">{ts.level}</span>
                      <span className="exp-pill">{ts.yearsExperience}</span>
                    </div>
                    <button
                      type="button"
                      className="remove-pill-btn"
                      onClick={() => handleRemoveTeach(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* ADD SKILL BOX */}
              <div className="add-skill-box">
                <h4>+ Add a Skill You Can Teach:</h4>
                <div className="form-grid-3">
                  <input
                    type="text"
                    placeholder="Skill Name (e.g. React, Java, SQL)"
                    value={curTeachName}
                    onChange={(e) => setCurTeachName(e.target.value)}
                  />
                  <select
                    value={curTeachCat}
                    onChange={(e) => setCurTeachCat(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    value={curTeachLevel}
                    onChange={(e) => setCurTeachLevel(e.target.value)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="form-grid-2">
                  <select
                    value={curTeachExp}
                    onChange={(e) => setCurTeachExp(e.target.value)}
                  >
                    <option value="6 months">6 Months Exp</option>
                    <option value="1 year">1 Year Exp</option>
                    <option value="2 years">2 Years Exp</option>
                    <option value="3+ years">3+ Years Exp</option>
                    <option value="5+ years">5+ Years Exp</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Brief description of your expertise..."
                    value={curTeachDesc}
                    onChange={(e) => setCurTeachDesc(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="add-item-btn"
                  onClick={handleAddTeach}
                >
                  + Add Teach Skill
                </button>
              </div>

              <div className="step-nav-actions">
                <button
                  type="button"
                  className="prev-step-btn"
                  onClick={() => setCurrentStep(1)}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="next-step-btn"
                  onClick={() => {
                    if (teachSkills.length === 0) {
                      setError("Please add at least 1 teach skill.");
                      return;
                    }
                    setError("");
                    setCurrentStep(3);
                  }}
                >
                  Continue to Learning Goals →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LEARN SKILLS */}
          {currentStep === 3 && (
            <div className="step-content">
              <div className="step-intro">
                <h2>📚 Skills You Want to Learn</h2>
                <p>What technologies, algorithms, or topics are you eager to master?</p>
              </div>

              {/* LIST OF LEARN SKILLS */}
              <div className="added-skills-list">
                {learnSkills.map((ls, idx) => (
                  <div key={idx} className="skill-chip-item learn">
                    <div>
                      <strong>{ls.skill}</strong>
                      <span className="cat-pill">{ls.category}</span>
                      <span className="lvl-pill">Current: {ls.currentLevel}</span>
                      <span className="target-pill">Target: {ls.targetLevel}</span>
                    </div>
                    <button
                      type="button"
                      className="remove-pill-btn"
                      onClick={() => handleRemoveLearn(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* ADD LEARN BOX */}
              <div className="add-skill-box learn">
                <h4>+ Add a Skill You Want to Learn:</h4>
                <div className="form-grid-3">
                  <input
                    type="text"
                    placeholder="Skill Name (e.g. Machine Learning, Docker)"
                    value={curLearnName}
                    onChange={(e) => setCurLearnName(e.target.value)}
                  />
                  <select
                    value={curLearnCat}
                    onChange={(e) => setCurLearnCat(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    value={curLearnCurrentLvl}
                    onChange={(e) => setCurLearnCurrentLvl(e.target.value)}
                  >
                    <option value="Beginner">Current: Beginner</option>
                    <option value="Intermediate">Current: Intermediate</option>
                  </select>
                </div>

                <div className="form-grid-2">
                  <select
                    value={curLearnTargetLvl}
                    onChange={(e) => setCurLearnTargetLvl(e.target.value)}
                  >
                    <option value="Intermediate">Target: Intermediate</option>
                    <option value="Advanced">Target: Advanced</option>
                    <option value="Expert">Target: Expert</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Goal with this skill (e.g. build production APIs)"
                    value={curLearnDesc}
                    onChange={(e) => setCurLearnDesc(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="add-item-btn learn"
                  onClick={handleAddLearn}
                >
                  + Add Learning Goal
                </button>
              </div>

              <div className="step-nav-actions">
                <button
                  type="button"
                  className="prev-step-btn"
                  onClick={() => setCurrentStep(2)}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="next-step-btn"
                  onClick={() => {
                    if (learnSkills.length === 0) {
                      setError("Please add at least 1 learning goal.");
                      return;
                    }
                    setError("");
                    setCurrentStep(4);
                  }}
                >
                  Continue to Preferences →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AVAILABILITY & MODE */}
          {currentStep === 4 && (
            <div className="step-content">
              <div className="step-intro">
                <h2>⚡ Availability & Preferred Learning Mode</h2>
                <p>Set your schedule so AI can pair you with swappers in overlapping time slots.</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Availability Schedule</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                  >
                    <option value="Flexible">Flexible (Anytime / As Arranged)</option>
                    <option value="Weekdays">Weekdays (Mon - Fri)</option>
                    <option value="Weekends">Weekends (Sat - Sun)</option>
                    <option value="Evenings">Evenings (After 6 PM)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Preferred Learning Mode</label>
                  <select
                    value={preferredMode}
                    onChange={(e) => setPreferredMode(e.target.value)}
                  >
                    <option value="Online">Online (Video / Chat / Pair Coding)</option>
                    <option value="Offline">Offline / In-Person</option>
                    <option value="Hybrid">Both / Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Primary Learning Milestone</label>
                <input
                  type="text"
                  placeholder="e.g. Build a full-stack SaaS app and prepare for engineering interviews"
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                />
              </div>

              {/* SUMMARY CARD */}
              <div className="onboarding-summary-box">
                <h3>🚀 Your SkillSwap Setup Summary</h3>
                <div className="summary-pills">
                  <span>🎓 Teaching: {teachSkills.length} skills</span>
                  <span>📚 Learning: {learnSkills.length} goals</span>
                  <span>🗓️ Schedule: {availability}</span>
                  <span>💻 Mode: {preferredMode}</span>
                  <span>🪙 +50 Bonus XP Upon Completion</span>
                </div>
              </div>

              <div className="step-nav-actions">
                <button
                  type="button"
                  className="prev-step-btn"
                  onClick={() => setCurrentStep(3)}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="finish-onboarding-btn"
                  onClick={handleCompleteOnboarding}
                  disabled={loading}
                >
                  {loading ? "Finishing Setup..." : "✨ Complete Onboarding & Explore Matches"}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Onboarding;
