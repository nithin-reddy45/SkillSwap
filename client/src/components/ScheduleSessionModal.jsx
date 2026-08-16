import { useState } from "react";
import { API_BASE_URL } from "../config/api";
import "./ScheduleSessionModal.css";

function ScheduleSessionModal({ isOpen, onClose, defaultPartner, onSessionCreated }) {
  const [skill, setSkill] = useState(
    defaultPartner?.skill || defaultPartner?.teachSkills?.[0] || defaultPartner?.learnSkills?.[0] || ""
  );
  const [topic, setTopic] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("18:00");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [isMentor, setIsMentor] = useState(false); // false = I am learner, true = I am mentor
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !defaultPartner) return null;

  const partnerId = defaultPartner._id || defaultPartner.id;
  const partnerName = defaultPartner.name || "Skill Partner";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skill.trim() || !scheduledDate || !scheduledTime) {
      setError("Please fill out skill, date, and time.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const combinedDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);

      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partnerId,
          isMentor,
          skill: typeof skill === "object" ? skill.skill : skill,
          topic: topic.trim() || `Session on ${typeof skill === "object" ? skill.skill : skill}`,
          scheduledAt: combinedDateTime.toISOString(),
          durationMinutes: Number(durationMinutes),
          notes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to schedule session");
      }

      alert("🎉 Session proposed successfully! Partner has been notified.");
      if (onSessionCreated) onSessionCreated(data.session);
      onClose();
    } catch (err) {
      console.error("Schedule Error:", err);
      setError(err.message || "Could not schedule session.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="schedule-modal-card" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div>
            <h2>Schedule Learning Session 📅</h2>
            <p className="modal-sub">
              Collaborate & swap skills with <strong>{partnerName}</strong>
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="modal-error-banner">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="schedule-form">
          
          {/* ROLE SELECTOR */}
          <div className="role-switch-row">
            <label>Session Format:</label>
            <div className="role-buttons">
              <button
                type="button"
                className={`role-btn ${!isMentor ? "active" : ""}`}
                onClick={() => setIsMentor(false)}
              >
                📚 I want to learn from {partnerName}
              </button>
              <button
                type="button"
                className={`role-btn ${isMentor ? "active" : ""}`}
                onClick={() => setIsMentor(true)}
              >
                🎓 I will teach {partnerName}
              </button>
            </div>
          </div>

          {/* SKILL & TOPIC */}
          <div className="form-group">
            <label>Skill to Focus On</label>
            <input
              type="text"
              placeholder="e.g. React, Python, Machine Learning..."
              value={typeof skill === "object" ? skill.skill : skill}
              onChange={(e) => setSkill(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Topic / Agenda</label>
            <input
              type="text"
              placeholder="e.g. Code Review, Hooks Architecture, Model Debugging"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* DATE, TIME & DURATION */}
          <div className="form-row-grid">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Duration</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes (Standard)</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={90}>90 Minutes (Deep Dive)</option>
              </select>
            </div>
          </div>

          {/* NOTES */}
          <div className="form-group">
            <label>Notes / Context for Partner (Optional)</label>
            <textarea
              rows={2}
              placeholder="Any specific questions or GitHub repo link to review..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* ACTIONS */}
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-schedule-btn" disabled={submitting}>
              {submitting ? "Scheduling..." : "🚀 Send Session Proposal"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default ScheduleSessionModal;
