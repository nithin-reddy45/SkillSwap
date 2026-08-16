import { useState } from "react";
import { API_BASE_URL } from "../config/api";
import "./ReviewModal.css";

function ReviewModal({ isOpen, onClose, session, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [teachingQuality, setTeachingQuality] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [helpfulness, setHelpfulness] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session._id,
          rating: Number(rating),
          teachingQuality: Number(teachingQuality),
          communication: Number(communication),
          helpfulness: Number(helpfulness),
          feedback,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      alert("⭐ Review submitted successfully! Thank you for supporting the community.");
      if (onReviewSubmitted) onReviewSubmitted(data);
      onClose();
    } catch (err) {
      console.error("Review Error:", err);
      setError(err.message || "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="modal-header">
          <div>
            <h2>Rate Learning Session ⭐</h2>
            <p className="modal-sub">
              Session on <strong>{session.skill}</strong> • {session.topic}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="modal-error-banner">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="review-form">
          
          {/* OVERALL STAR RATING */}
          <div className="star-rating-group">
            <label>Overall Experience Rating</label>
            <div className="stars-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`star-btn ${rating >= star ? "active" : ""}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
              <span className="rating-label-text">
                {rating === 5 ? "5/5 (Outstanding)" : `${rating}/5`}
              </span>
            </div>
          </div>

          {/* DETAILED METRICS */}
          <div className="metrics-grid">
            
            <div className="metric-row">
              <label>Teaching Quality ({teachingQuality}/5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={teachingQuality}
                onChange={(e) => setTeachingQuality(e.target.value)}
              />
            </div>

            <div className="metric-row">
              <label>Communication ({communication}/5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={communication}
                onChange={(e) => setCommunication(e.target.value)}
              />
            </div>

            <div className="metric-row">
              <label>Helpfulness & Clarity ({helpfulness}/5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={helpfulness}
                onChange={(e) => setHelpfulness(e.target.value)}
              />
            </div>

          </div>

          {/* FEEDBACK */}
          <div className="feedback-group">
            <label>Written Feedback (Optional)</label>
            <textarea
              rows={3}
              placeholder="What went well? Any tips for the partner?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          {/* ACTIONS */}
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-review-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Rating & Review"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default ReviewModal;
