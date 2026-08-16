import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./ResumeAnalyzer.css";

const DEMO_RESUME = `Nithin Reddy
Software Engineering Student | Web Enthusiast
Skills: React, JavaScript, HTML5, CSS3, SQL, Python, Git
Experience:
- Built full-stack e-commerce frontend using React and Redux.
- Designed database schemas in MySQL and wrote aggregation queries.
- Completed coursework in Data Structures, Algorithms, and Object-Oriented Programming.`;

function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async (textToAnalyze = resumeText) => {
    if (!textToAnalyze.trim()) {
      setError("Please paste your resume or technical background text.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/api/ai/resume-gap`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          resumeText: textToAnalyze,
          targetRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze resume.");
      }

      setAnalysis(data);
      window.scrollTo({ top: 380, behavior: "smooth" });
    } catch (err) {
      console.error("Resume analysis error:", err);
      setError(err.message || "Unable to complete resume gap analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (receiverId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/connections/${receiverId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to send request");
        return;
      }

      alert("Swap request sent to bridge this skill gap! 🤝");
    } catch (err) {
      console.error("Connect error:", err);
      alert("Unable to send request.");
    }
  };

  return (
    <div className="resume-page">
      <div className="resume-container">
        
        {/* HERO */}
        <header className="resume-hero">
          <div className="resume-chip">
            <span>📄 AI Career & Skill Gap Engine</span>
          </div>
          <h1>
            AI Resume <span className="gradient-text">Skill Gap Analyzer</span>
          </h1>
          <p>
            Paste your resume to detect missing industry skills for your target role and instantly find SkillSwap peers who can mentor you.
          </p>
        </header>

        {/* INPUT FORM */}
        <div className="analyzer-card">
          <div className="role-selector-row">
            <label>Target Career Role:</label>
            <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="AI / ML Engineer">AI / ML Engineer</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
            </select>
          </div>

          <div className="resume-input-group">
            <div className="label-row">
              <label>Paste Resume Content or Technical Background:</label>
              <button
                type="button"
                className="demo-resume-btn"
                onClick={() => {
                  setResumeText(DEMO_RESUME);
                  handleAnalyze(DEMO_RESUME);
                }}
              >
                📋 Load Sample Resume
              </button>
            </div>
            <textarea
              rows={8}
              placeholder="Paste your resume summary, skills, and projects here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          <div className="analyze-action-row">
            <button
              className="analyze-btn"
              onClick={() => handleAnalyze()}
              disabled={loading}
            >
              {loading ? "🔄 Analyzing Resume & Scanning Database..." : "🔍 Analyze Skill Gaps"}
            </button>
          </div>
        </div>

        {error && (
          <div className="resume-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* ANALYSIS REPORT */}
        {analysis && (
          <div className="analysis-report">
            
            {/* SCORE CARD */}
            <div className="report-score-banner">
              <div className="score-badge-circle">
                <span className="score-val">{analysis.matchScore}%</span>
                <span className="score-sub">ROLE MATCH</span>
              </div>
              <div className="score-text">
                <h2>Skill Alignment for {analysis.targetRole}</h2>
                <p>{analysis.advice}</p>
              </div>
            </div>

            {/* GAPS & DETECTED SKILLS */}
            <div className="skills-breakdown-grid">
              
              <div className="breakdown-card detected">
                <div className="card-header">
                  <span className="icon">✓</span>
                  <h3>Detected Current Skills ({analysis.identifiedSkills.length})</h3>
                </div>
                <p className="card-desc">Skills verified from your resume:</p>
                <div className="chips-wrap">
                  {analysis.identifiedSkills.map((sk, idx) => (
                    <span key={idx} className="detected-chip">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="breakdown-card missing">
                <div className="card-header">
                  <span className="icon">⚡</span>
                  <h3>Missing Skill Gaps ({analysis.missingSkills.length})</h3>
                </div>
                <p className="card-desc">Critical skills to acquire for {analysis.targetRole}:</p>
                <div className="chips-wrap">
                  {analysis.missingSkills.map((sk, idx) => (
                    <span key={idx} className="missing-chip">
                      + {sk}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* ACTIONABLE MENTOR MATCHES */}
            <div className="mentor-matches-section">
              <div className="section-head">
                <h3>🤝 Recommended Peers Teaching Your Missing Skills</h3>
                <p>Connect and start swapping to bridge your resume gaps faster!</p>
              </div>

              {analysis.recommendedMentors && analysis.recommendedMentors.length > 0 ? (
                <div className="mentors-grid">
                  {analysis.recommendedMentors.map((mentor) => (
                    <div className="mentor-card" key={mentor.id}>
                      <div className="mentor-avatar">
                        {mentor.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="mentor-info">
                        <h4>{mentor.name}</h4>
                        <div className="teaches-row">
                          <span className="teach-lbl">Can teach you:</span>
                          <div className="gap-pills">
                            {mentor.matchedGaps?.map((gap, gIdx) => (
                              <span key={gIdx} className="gap-pill">
                                🌟 {gap}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        className="mentor-connect-btn"
                        onClick={() => handleConnect(mentor.id)}
                      >
                        Swap Skills
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-mentors-box">
                  <p>Check the Find Matches page or generate an AI Roadmap to learn these missing topics!</p>
                  <Link to="/roadmap" className="inline-roadmap-link">
                    🗺️ Generate {analysis.missingSkills[0] || "Custom"} Roadmap
                  </Link>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default ResumeAnalyzer;
