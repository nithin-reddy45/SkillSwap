import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [availability, setAvailability] = useState("Flexible");
  const [preferredMode, setPreferredMode] = useState("Online");

  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);

  // New Skill Inputs
  const [newTeachSkill, setNewTeachSkill] = useState("");
  const [newTeachLevel, setNewTeachLevel] = useState("Intermediate");
  const [newTeachExp, setNewTeachExp] = useState("1 year");

  const [newLearnSkill, setNewLearnSkill] = useState("");
  const [newLearnCurrentLevel, setNewLearnCurrentLevel] = useState("Beginner");
  const [newLearnTargetLevel, setNewLearnTargetLevel] = useState("Advanced");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.clear();
            navigate("/login");
          }
          return;
        }

        const u = data.user || data;
        setUser(u);
        setName(u.name || "");
        setAvatar(u.avatar || "");
        setBio(u.bio || "");
        setCareerGoal(u.careerGoal || "");
        setLearningGoal(u.learningGoal || "");
        setAvailability(u.availability || "Flexible");
        setPreferredMode(u.preferredMode || "Online");

        setTeachSkills(
          Array.isArray(u.teachSkills)
            ? u.teachSkills.map((s) =>
                typeof s === "string"
                  ? { skill: s, level: "Intermediate", experience: "1 year", isVerified: false }
                  : s
              )
            : []
        );

        setLearnSkills(
          Array.isArray(u.learnSkills)
            ? u.learnSkills.map((s) =>
                typeof s === "string"
                  ? { skill: s, currentLevel: "Beginner", targetLevel: "Advanced" }
                  : s
              )
            : []
        );
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Add Teach Skill
  const handleAddTeachSkill = () => {
    const trimmed = newTeachSkill.trim();
    if (!trimmed) return;
    if (teachSkills.some((s) => s.skill.toLowerCase() === trimmed.toLowerCase())) {
      alert("You have already added this teach skill.");
      return;
    }

    setTeachSkills((prev) => [
      ...prev,
      { skill: trimmed, level: newTeachLevel, experience: newTeachExp, isVerified: false },
    ]);
    setNewTeachSkill("");
  };

  const handleRemoveTeachSkill = (index) => {
    setTeachSkills((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Learn Skill
  const handleAddLearnSkill = () => {
    const trimmed = newLearnSkill.trim();
    if (!trimmed) return;
    if (learnSkills.some((s) => s.skill.toLowerCase() === trimmed.toLowerCase())) {
      alert("You have already added this learning skill.");
      return;
    }

    setLearnSkills((prev) => [
      ...prev,
      { skill: trimmed, currentLevel: newLearnCurrentLevel, targetLevel: newLearnTargetLevel },
    ]);
    setNewLearnSkill("");
  };

  const handleRemoveLearnSkill = (index) => {
    setLearnSkills((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          avatar,
          bio,
          careerGoal,
          learningGoal,
          availability,
          preferredMode,
          teachSkills,
          learnSkills,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      const updatedUser = data.user || data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("authChanged"));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Save error:", err);
      alert(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-loading">
            <h2>Loading your Skill Profile... 👤</h2>
          </div>
        </div>
      </div>
    );
  }

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        {/* HEADER OVERVIEW CARD */}
        <div className="profile-overview-banner">
          <div className="avatar-side">
            <div className="user-avatar-large">
              {avatar ? (
                <img src={avatar} alt={user?.name} className="avatar-img-large" />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>
            <div className="user-reputation-capsules">
              <span className="reputation-badge rating">
                ⭐ {user?.avgRating ? user.avgRating.toFixed(1) : "5.0"} Rating
              </span>
              <span className="reputation-badge sessions">
                📅 {user?.completedSessionsCount || 0} Sessions Completed
              </span>
            </div>
          </div>

          <div className="user-summary-side">
            <div className="title-row">
              <h1>{user?.name}</h1>
              <span className="email-lbl">{user?.email}</span>
            </div>
            <p className="user-bio-preview">
              {user?.bio || "Passionate peer developer & skill swapper."}
            </p>

            {/* VERIFIED SKILLS BADGES */}
            <div className="verified-badges-row">
              <span className="badges-title">🎖️ Verified Skill Badges:</span>
              <div className="badge-chips-wrap">
                {user?.verifiedSkills && user.verifiedSkills.length > 0 ? (
                  user.verifiedSkills.map((sk, idx) => (
                    <span key={idx} className="verified-badge-chip">
                      ✓ {sk} Verified
                    </span>
                  ))
                ) : (
                  <Link to="/skill-assessment" className="verify-now-chip">
                    + Take AI Assessment to Earn Badges
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="profile-success-banner">
            ✓ Profile saved successfully! Your AI match score has been refreshed.
          </div>
        )}

        {/* MAIN EDIT FORM */}
        <form onSubmit={handleSaveProfile} className="profile-edit-form">
          
          {/* SECTION 1: PERSONAL & CAREER INFO */}
          <div className="profile-section-card">
            <h2>👤 Personal & Career Goals</h2>
            <p className="section-desc">
              AI uses your goals to recommend the most compatible learning partners.
            </p>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Target Career Role</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Developer, Data Scientist"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Short Bio</label>
              <textarea
                rows={2}
                placeholder="Tell other swappers about yourself, your interests, and what you're building..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label>Primary Learning Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Master React Hooks & Node.js"
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Availability</label>
                <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
                  <option value="Flexible">Flexible (Anytime)</option>
                  <option value="Weekdays">Weekdays</option>
                  <option value="Weekends">Weekends</option>
                  <option value="Evenings">Evenings (After Work/College)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Preferred Mode</label>
                <select value={preferredMode} onChange={(e) => setPreferredMode(e.target.value)}>
                  <option value="Online">Online Video / Chat</option>
                  <option value="Offline">In-Person / Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: SKILLS I CAN TEACH */}
          <div className="profile-section-card">
            <div className="section-head-row">
              <div>
                <h2>🎓 Skills I Can Teach</h2>
                <p className="section-desc">
                  List technical skills you feel confident sharing with other learners.
                </p>
              </div>
              <Link to="/skill-assessment" className="assessment-shortcut-btn">
                🧠 Take AI Quiz & Verify
              </Link>
            </div>

            {/* SKILLS LIST */}
            <div className="skills-items-list">
              {teachSkills.map((ts, idx) => (
                <div className="skill-item-card" key={idx}>
                  <div className="skill-item-info">
                    <strong>{ts.skill}</strong>
                    <div className="skill-meta-tags">
                      <span className="level-pill">{ts.level}</span>
                      <span className="exp-pill">⏳ {ts.experience}</span>
                      {ts.isVerified ? (
                        <span className="verified-pill">✓ Verified Expert</span>
                      ) : (
                        <Link to="/skill-assessment" className="unverified-pill">
                          Verify Skill →
                        </Link>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="remove-skill-btn"
                    onClick={() => handleRemoveTeachSkill(idx)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* ADD TEACH SKILL ROW */}
            <div className="add-skill-row-box">
              <div className="add-skill-inputs">
                <input
                  type="text"
                  placeholder="Skill name (e.g. React, Python, SQL)"
                  value={newTeachSkill}
                  onChange={(e) => setNewTeachSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTeachSkill())}
                />
                <select
                  value={newTeachLevel}
                  onChange={(e) => setNewTeachLevel(e.target.value)}
                >
                  <option value="Beginner">Beginner Level</option>
                  <option value="Intermediate">Intermediate Level</option>
                  <option value="Advanced">Advanced Level</option>
                </select>
                <select
                  value={newTeachExp}
                  onChange={(e) => setNewTeachExp(e.target.value)}
                >
                  <option value="6 months">6 Months</option>
                  <option value="1 year">1 Year</option>
                  <option value="2 years">2 Years</option>
                  <option value="3+ years">3+ Years</option>
                </select>
              </div>
              <button
                type="button"
                className="add-skill-action-btn"
                onClick={handleAddTeachSkill}
              >
                + Add Teach Skill
              </button>
            </div>
          </div>

          {/* SECTION 3: SKILLS I WANT TO LEARN */}
          <div className="profile-section-card">
            <h2>📚 Skills I Want to Learn</h2>
            <p className="section-desc">
              Skills you wish to acquire. AI uses these to match you with top-rated mentors.
            </p>

            {/* LEARN SKILLS LIST */}
            <div className="skills-items-list">
              {learnSkills.map((ls, idx) => (
                <div className="skill-item-card learn" key={idx}>
                  <div className="skill-item-info">
                    <strong>{ls.skill}</strong>
                    <div className="skill-meta-tags">
                      <span className="level-pill learn">Current: {ls.currentLevel}</span>
                      <span className="target-pill">Target: {ls.targetLevel}</span>
                      <Link to="/roadmap" className="roadmap-shortcut-pill">
                        🗺️ Build Roadmap →
                      </Link>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="remove-skill-btn"
                    onClick={() => handleRemoveLearnSkill(idx)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* ADD LEARN SKILL ROW */}
            <div className="add-skill-row-box">
              <div className="add-skill-inputs">
                <input
                  type="text"
                  placeholder="Skill name (e.g. Machine Learning, Docker)"
                  value={newLearnSkill}
                  onChange={(e) => setNewLearnSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLearnSkill())}
                />
                <select
                  value={newLearnCurrentLevel}
                  onChange={(e) => setNewLearnCurrentLevel(e.target.value)}
                >
                  <option value="Beginner">Current: Beginner</option>
                  <option value="Intermediate">Current: Intermediate</option>
                </select>
                <select
                  value={newLearnTargetLevel}
                  onChange={(e) => setNewLearnTargetLevel(e.target.value)}
                >
                  <option value="Intermediate">Target: Intermediate</option>
                  <option value="Advanced">Target: Advanced</option>
                </select>
              </div>
              <button
                type="button"
                className="add-skill-action-btn"
                onClick={handleAddLearnSkill}
              >
                + Add Learning Goal
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="profile-submit-row">
            <button
              type="submit"
              className="save-profile-btn"
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "💾 Save Profile & Update AI Matches"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default Profile;