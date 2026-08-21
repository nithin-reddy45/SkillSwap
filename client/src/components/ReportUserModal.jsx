import { useState } from "react";
import { API_BASE_URL } from "../config/api";
import "./ReportUserModal.css";

function ReportUserModal({ isOpen, onClose, targetUser }) {
  const [reason, setReason] = useState("Inappropriate Behavior");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/users/report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportedUserId: targetUser._id || targetUser.id,
          reason,
          details: details.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit report");
      }

      alert("Thank you. Your report has been submitted for review by the moderation team.");
      onClose();
    } catch (err) {
      console.error("Report submit error:", err);
      setError(err.message || "Unable to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-modal-backdrop" onClick={onClose}>
      <div className="report-modal-card" onClick={(e) => e.stopPropagation()}>
        
        <div className="report-modal-header">
          <div className="report-title-box">
            <span className="flag-icon">🚩</span>
            <div>
              <h3>Report User</h3>
              <p>Reporting: <strong>{targetUser.name}</strong></p>
            </div>
          </div>
          <button className="report-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="report-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="report-modal-form">
          <div className="form-group-report">
            <label>Reason for Report:</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="Harassment">Harassment or Offensive Language</option>
              <option value="Inappropriate Behavior">Inappropriate Behavior</option>
              <option value="Spam">Spam or Advertising</option>
              <option value="No-Show / Unreliable">No-Show / Cancelled without Notice</option>
              <option value="False Skill Claims">False Skill or Experience Claims</option>
              <option value="Other">Other Issues</option>
            </select>
          </div>

          <div className="form-group-report">
            <label>Additional Details:</label>
            <textarea
              rows={4}
              placeholder="Describe what occurred with as much context as possible..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />
          </div>

          <div className="report-actions">
            <button type="button" className="report-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="report-submit-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default ReportUserModal;
