import { useState } from "react";
import "./QuizModal.css";

function QuizModal({ course, isOpen, onClose }) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  if (!isOpen || !course || !course.quiz || course.quiz.length === 0) return null;

  const quiz = course.quiz;
  const currentQ = quiz[currentQuestionIdx];
  const selected = selectedAnswers[currentQuestionIdx];
  const isAnswered = selected !== undefined;

  const handleSelectOption = (idx) => {
    if (isAnswered) return; // Prevent changing after selected
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: idx
    }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < quiz.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setShowResult(false);
  };

  // Calculate score
  const correctCount = Object.entries(selectedAnswers).reduce((acc, [qIdx, ansIdx]) => {
    return ansIdx === quiz[qIdx]?.correctAnswer ? acc + 1 : acc;
  }, 0);

  const percentage = Math.round((correctCount / quiz.length) * 100);

  return (
    <div className="quiz-modal-overlay" onClick={onClose}>
      <div className="quiz-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="quiz-modal-header">
          <div className="quiz-header-title">
            <span className="quiz-badge">🎯 Interactive Knowledge Test</span>
            <h2>{course.title}</h2>
          </div>
          <button className="quiz-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Quiz Content */}
        {!showResult ? (
          <div className="quiz-modal-body">
            
            {/* Progress */}
            <div className="quiz-progress-bar-container">
              <div className="quiz-progress-meta">
                <span>Question {currentQuestionIdx + 1} of {quiz.length}</span>
                <span>{Math.round(((currentQuestionIdx + 1) / quiz.length) * 100)}% Completed</span>
              </div>
              <div className="quiz-progress-track">
                <div
                  className="quiz-progress-fill"
                  style={{ width: `${((currentQuestionIdx + 1) / quiz.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="quiz-question-box">
              <h3>{currentQ.question}</h3>
            </div>

            {/* Options */}
            <div className="quiz-options-list">
              {currentQ.options.map((option, idx) => {
                let statusClass = "";
                if (isAnswered) {
                  if (idx === currentQ.correctAnswer) {
                    statusClass = "correct";
                  } else if (idx === selected) {
                    statusClass = "wrong";
                  }
                }

                return (
                  <button
                    key={idx}
                    className={`quiz-option-btn ${statusClass} ${selected === idx ? "selected" : ""}`}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="option-text">{option}</span>
                    {isAnswered && idx === currentQ.correctAnswer && <span className="option-icon">✅</span>}
                    {isAnswered && idx === selected && idx !== currentQ.correctAnswer && <span className="option-icon">❌</span>}
                  </button>
                );
              })}
            </div>

            {/* Explanation when answered */}
            {isAnswered && (
              <div className={`quiz-explanation-card ${selected === currentQ.correctAnswer ? "correct-card" : "wrong-card"}`}>
                <h4>{selected === currentQ.correctAnswer ? "🎉 Correct Answer!" : "⚠️ Explanation"}</h4>
                <p>{currentQ.explanation}</p>
              </div>
            )}

            {/* Controls */}
            <div className="quiz-nav-controls">
              <button
                className="quiz-nav-btn secondary"
                onClick={handlePrev}
                disabled={currentQuestionIdx === 0}
              >
                ← Previous
              </button>

              <button
                className="quiz-nav-btn primary"
                onClick={handleNext}
                disabled={!isAnswered}
              >
                {currentQuestionIdx === quiz.length - 1 ? "See Final Results 🏆" : "Next Question →"}
              </button>
            </div>

          </div>
        ) : (
          /* Result Screen */
          <div className="quiz-result-body">
            <div className="result-score-circle">
              <span className="result-icon">{percentage >= 70 ? "🏆" : "📚"}</span>
              <h3>{percentage}%</h3>
              <p>{correctCount} of {quiz.length} Correct</p>
            </div>

            <h2>
              {percentage === 100
                ? "Outstanding! Master Level! 🌟"
                : percentage >= 70
                ? "Great Job! You're Ready to Build! 🚀"
                : "Keep Learning & Reviewing! 💪"}
            </h2>

            <p className="result-feedback">
              {percentage >= 70
                ? `You have a strong understanding of ${course.primarySkill}. Find a learning partner to build advanced projects together!`
                : `Watch the full tutorial lessons or review the syllabus to solidify your knowledge in ${course.primarySkill}.`}
            </p>

            <div className="result-actions">
              <button className="quiz-nav-btn secondary" onClick={handleRestart}>
                🔄 Retry Quiz
              </button>
              <button className="quiz-nav-btn primary" onClick={onClose}>
                Done & Back to Courses
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default QuizModal;
