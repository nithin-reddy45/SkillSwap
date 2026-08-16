import { useNavigate } from "react-router-dom";
import "./TestResultsModal.css";

function TestResultsModal({ result, isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen || !result) return null;

  const handleShareWithPartner = () => {
    // Copy test link to clipboard
    const shareUrl = `${window.location.origin}/coding-test/${result.testId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      alert(`Challenge link copied to clipboard!\n${shareUrl}\n\nShare it with your SkillSwap learning partners!`);
    } else {
      alert(`Challenge Link: ${shareUrl}`);
    }
  };

  const handleFindPartnersForSkill = () => {
    onClose();
    navigate(`/matches?skill=${encodeURIComponent(result.category || "DSA")}`);
  };

  return (
    <div className="results-modal-overlay" onClick={onClose}>
      <div className="results-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="results-modal-header">
          <span className={`results-status-badge ${result.isPassed ? "badge-pass" : "badge-fail"}`}>
            {result.isPassed ? "🎉 TEST PASSED" : "⚠️ NEEDS IMPROVEMENT"}
          </span>
          <h2>Assessment Performance Summary</h2>
          <p className="results-test-title">{result.testTitle}</p>
        </div>

        {/* Big Score Card */}
        <div className="results-score-overview">
          <div className="score-stat-box">
            <span className="stat-label">Total Score</span>
            <strong className="stat-val highlight">{result.totalEarnedScore} / {result.totalMaxScore}</strong>
          </div>

          <div className="score-stat-box">
            <span className="stat-label">Accuracy Rate</span>
            <strong className={`stat-val ${result.isPassed ? "val-pass" : "val-fail"}`}>
              {result.scorePercentage}%
            </strong>
          </div>

          <div className="score-stat-box">
            <span className="stat-label">Time Spent</span>
            <strong className="stat-val">
              {result.timeSpentFormatted} <small>({result.allocatedMinutes}m max)</small>
            </strong>
          </div>

          <div className="score-stat-box">
            <span className="stat-label">Cutoff Score</span>
            <strong className="stat-val">{result.passingScore}%</strong>
          </div>
        </div>

        {/* Problem Breakdown List */}
        <div className="results-problems-breakdown">
          <h3>Detailed Problem Breakdown</h3>
          <div className="breakdown-list">
            {result.problemSummaries?.map((prob, idx) => (
              <div key={idx} className="breakdown-card">
                <div className="breakdown-card-top">
                  <div className="prob-title-box">
                    <span className="breakdown-idx">#{idx + 1}</span>
                    <h4>{prob.problemTitle}</h4>
                    <span className="breakdown-diff">{prob.difficulty}</span>
                  </div>
                  <div className="breakdown-points">
                    <strong>{prob.earnedPoints} / {prob.maxPoints} pts</strong>
                  </div>
                </div>

                <div className="breakdown-cases-bar">
                  <span>Test Cases: {prob.passedCount} of {prob.totalCount} passed</span>
                  <div className="cases-mini-bar">
                    <div
                      className="cases-fill"
                      style={{
                        width: `${prob.totalCount > 0 ? (prob.passedCount / prob.totalCount) * 100 : 0}%`,
                        backgroundColor: prob.allPassed ? "#10b981" : "#ef4444"
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="results-modal-footer">
          <button className="results-btn-share" onClick={handleShareWithPartner}>
            📋 Copy & Share Challenge Link
          </button>
          <button className="results-btn-partner" onClick={handleFindPartnersForSkill}>
            🤝 Find Study Partner for {result.category}
          </button>
          <button className="results-btn-done" onClick={onClose}>
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

export default TestResultsModal;
