import { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./SkillAssessment.css";

const ASSESSABLE_SKILLS = [
  { name: "JavaScript", icon: "🟨", level: "Intermediate", desc: "Closures, Event Loop, ES6+, Promises" },
  { name: "React", icon: "⚛️", level: "Intermediate", desc: "Hooks, State, Virtual DOM, Lifecycle" },
  { name: "Python", icon: "🐍", level: "Intermediate", desc: "OOP, Generators, GIL, Data Structures" },
  { name: "Machine Learning", icon: "🤖", level: "Intermediate", desc: "Supervised/Unsupervised, Metrics, PCA, Tuning" },
];

function SkillAssessment() {
  const [selectedSkill, setSelectedSkill] = useState("JavaScript");
  const [customSkill, setCustomSkill] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");

  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [error, setError] = useState("");

  const startQuiz = async (skillName = selectedSkill, diff = difficulty) => {
    setLoading(true);
    setError("");
    setEvaluationResult(null);
    setUserAnswers({});
    setCurrentQuestionIdx(0);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: skillName,
          level: diff,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load quiz");
      }

      setQuizData(data);
    } catch (err) {
      console.error("Quiz load error:", err);
      setError(err.message || "Could not generate assessment questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIdx) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizData) return;
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/quiz/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: quizData.skill,
          userAnswers,
          answersPayload: quizData._internalAnswers || [],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to evaluate answers");
      }

      setEvaluationResult(data);

      if (data.passed) {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            await fetch(`${API_BASE_URL}/api/users/verify-skill`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                skill: quizData.skill,
                score: data.score,
              }),
            });
            window.dispatchEvent(new Event("authChanged"));
          } catch (verErr) {
            console.error("Auto verify skill error:", verErr);
          }
        }
      }

      window.scrollTo({ top: 100, behavior: "smooth" });
    } catch (err) {
      console.error("Evaluation error:", err);
      setError(err.message || "Failed to calculate quiz score.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = quizData?.questions?.[currentQuestionIdx];
  const totalQuestions = quizData?.questions?.length || 0;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="assessment-page">
      <div className="assessment-container">

        {/* HEADER */}
        <header className="assessment-hero">
          <div className="hero-chip">
            <span>🧠 AI Skill Evaluation & Verification</span>
          </div>
          <h1>
            Validate Your Skills & Earn <span className="gradient-text">Verified Badges</span>
          </h1>
          <p>
            Take quick AI-generated assessment tests to benchmark your knowledge, unlock verified badges on your profile, and stand out in skill swap matches.
          </p>
        </header>

        {/* STEP 1: SELECTOR (WHEN NO ACTIVE QUIZ & NO RESULT) */}
        {!quizData && !evaluationResult && (
          <div className="assessment-setup-card">
            
            <h2 className="setup-title">Choose a Skill to Assess</h2>

            <div className="skill-cards-grid">
              {ASSESSABLE_SKILLS.map((sk) => (
                <div
                  key={sk.name}
                  className={`skill-pick-card ${selectedSkill === sk.name ? "active" : ""}`}
                  onClick={() => {
                    setSelectedSkill(sk.name);
                    setCustomSkill("");
                  }}
                >
                  <span className="card-emoji">{sk.icon}</span>
                  <h3>{sk.name}</h3>
                  <span className="level-chip">{sk.level}</span>
                  <p>{sk.desc}</p>
                </div>
              ))}
            </div>

            <div className="custom-skill-row">
              <label>Or enter any other skill:</label>
              <input
                type="text"
                placeholder="e.g. Node.js, TypeScript, SQL, Docker..."
                value={customSkill}
                onChange={(e) => {
                  setCustomSkill(e.target.value);
                  if (e.target.value) setSelectedSkill(e.target.value);
                }}
              />
            </div>

            <div className="setup-actions">
              <div className="difficulty-picker">
                <label>Difficulty:</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <button
                className="start-test-btn"
                onClick={() => startQuiz(customSkill || selectedSkill, difficulty)}
                disabled={loading}
              >
                {loading ? "🔄 Preparing AI Assessment..." : "⚡ Start Assessment (5 Questions)"}
              </button>
            </div>

          </div>
        )}

        {error && (
          <div className="assessment-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* STEP 2: ACTIVE QUIZ QUESTIONS */}
        {quizData && !evaluationResult && currentQ && (
          <div className="quiz-active-wrapper">
            
            <div className="quiz-top-bar">
              <div className="quiz-info">
                <span className="quiz-skill-tag">{quizData.skill} ({quizData.level})</span>
                <h2>Question {currentQuestionIdx + 1} of {totalQuestions}</h2>
              </div>
              <div className="quiz-progress-pill">
                <span>{answeredCount} of {totalQuestions} answered</span>
              </div>
            </div>

            <div className="question-card">
              <p className="question-text">{currentQ.question}</p>

              <div className="options-list">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = userAnswers[currentQ.id] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      className={`option-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectOption(currentQ.id, oIdx)}
                    >
                      <span className="opt-letter">{String.fromCharCode(65 + oIdx)}</span>
                      <span className="opt-text">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* NAVIGATOR BUTTONS */}
            <div className="quiz-footer-actions">
              <button
                className="quiz-nav-btn"
                onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                disabled={currentQuestionIdx === 0}
              >
                ← Previous
              </button>

              {currentQuestionIdx < totalQuestions - 1 ? (
                <button
                  className="quiz-nav-btn next"
                  onClick={() => setCurrentQuestionIdx((p) => Math.min(totalQuestions - 1, p + 1))}
                >
                  Next Question →
                </button>
              ) : (
                <button
                  className="quiz-submit-btn"
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "✅ Submit Assessment"}
                </button>
              )}
            </div>

          </div>
        )}

        {/* STEP 3: EVALUATION RESULT & BADGE */}
        {evaluationResult && (
          <div className="evaluation-card">
            
            <div className="result-header">
              <div className="score-circle">
                <span className="score-num">{evaluationResult.score}%</span>
                <span className="score-lbl">{evaluationResult.passed ? "PASSED" : "REVIEW NEEDED"}</span>
              </div>

              <div className="result-headline">
                <h2>
                  {evaluationResult.passed
                    ? "🎉 Congratulations! Skill Verified!"
                    : "📚 Keep Practicing to Earn Your Badge"}
                </h2>
                <p>
                  You answered {evaluationResult.correctCount} of {evaluationResult.totalQuestions} questions correctly.
                  {evaluationResult.passed
                    ? " You have demonstrated solid technical proficiency."
                    : " Review the questions below and brush up with our AI Roadmap."}
                </p>
              </div>
            </div>

            {/* VERIFIED BADGE PREVIEW */}
            {evaluationResult.badge && (
              <div className="verified-badge-card">
                <div className="badge-preview-box">
                  <span className="badge-icon">{evaluationResult.badge.icon}</span>
                  <div className="badge-details">
                    <span className="badge-status">OFFICIAL VERIFICATION (+2 CREDITS)</span>
                    <h3>{evaluationResult.badge.title}</h3>
                    <p>Proficiency Level: <strong>{evaluationResult.badge.grade}</strong> ({evaluationResult.badge.score}% Score)</p>
                    <span className="credits-reward-pill">🪙 +2 Skill Credits Awarded to Balance</span>
                  </div>
                </div>
                <div className="badge-actions">
                  <button className="badge-claim-btn" onClick={() => alert("🎖️ Badge & 2 Skill Credits added to your profile!")}>
                    ✨ Badge Claimed to Profile
                  </button>
                </div>
              </div>
            )}

            {/* DETAILED QUESTION REVIEW */}
            <div className="review-section">
              <h3>Detailed Answer Breakdown</h3>
              <div className="review-items-list">
                {evaluationResult.feedback?.map((fb, idx) => (
                  <div
                    key={fb.questionId}
                    className={`review-item ${fb.isCorrect ? "correct" : "incorrect"}`}
                  >
                    <div className="review-item-header">
                      <span className="status-tag">
                        {fb.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                      </span>
                      <strong>Question {idx + 1}</strong>
                    </div>

                    <p className="review-explanation">
                      💡 <strong>Explanation:</strong> {fb.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="result-footer-row">
              <button
                className="retake-btn"
                onClick={() => {
                  setEvaluationResult(null);
                  setQuizData(null);
                }}
              >
                🔄 Try Another Skill
              </button>

              <Link to="/roadmap" className="roadmap-link-btn">
                🗺️ Build AI Learning Roadmap
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default SkillAssessment;
