import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";
import "./RequestSwapModal.css";

function RequestSwapModal({ isOpen, onClose, targetUser, onSuccess }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTeachSkill, setSelectedTeachSkill] = useState("");
  const [selectedLearnSkill, setSelectedLearnSkill] = useState("");
  const [customTeachSkill, setCustomTeachSkill] = useState("");
  const [customLearnSkill, setCustomLearnSkill] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        const myTeach = Array.isArray(u.teachSkills) ? u.teachSkills : [];
        if (myTeach.length > 0) {
          const first = typeof myTeach[0] === "string" ? myTeach[0] : myTeach[0].skill;
          setSelectedTeachSkill(first || "");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (targetUser) {
      const targetTeach = Array.isArray(targetUser.teachSkills) ? targetUser.teachSkills : [];
      if (targetTeach.length > 0) {
        const first = typeof targetTeach[0] === "string" ? targetTeach[0] : targetTeach[0].skill;
        setSelectedLearnSkill(first || "");
      }
    }
  }, [targetUser]);

  if (!isOpen || !targetUser) return null;

  const myTeachSkills = Array.isArray(currentUser?.teachSkills)
    ? currentUser.teachSkills.map((s) => (typeof s === "string" ? s : s.skill))
    : [];

  const partnerTeachSkills = Array.isArray(targetUser.teachSkills)
    ? targetUser.teachSkills.map((s) => (typeof s === "string" ? s : s.skill))
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const finalTeach = selectedTeachSkill === "other" ? customTeachSkill.trim() : selectedTeachSkill;
    const finalLearn = selectedLearnSkill === "other" ? customLearnSkill.trim() : selectedLearnSkill;

    if (!finalTeach) {
      setError("Please select or enter the skill you will teach.");
      return;
    }
    if (!finalLearn) {
      setError("Please select or enter the skill you want to learn.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const receiverId = targetUser._id || targetUser.id;

      const response = await fetch(`${API_BASE_URL}/api/connections/${receiverId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teachSkill: finalTeach,
          learnSkill: finalLearn,
          note: note.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send skill swap request");
      }

      alert("🎉 Skill swap request sent successfully! Check the Requests page to track status.");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Request error:", err);
      setError(err.message || "Unable to send swap request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="swap-modal-backdrop" onClick={onClose}>
      <div className="swap-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="swap-modal-header">
          <div className="swap-modal-title">
            <span className="swap-icon-badge">🤝</span>
            <div>
              <h3>Propose a Skill Swap</h3>
              <p>Trading with <strong>{targetUser.name}</strong></p>
            </div>
          </div>
          <button className="swap-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="swap-error-banner">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="swap-modal-form">
          
          {/* EXCHANGE PREVIEW BOX */}
          <div className="swap-exchange-preview">
            
            {/* TEACH SIDE */}
            <div className="exchange-side give">
              <label className="exchange-lbl">🎓 I Will Teach:</label>
              <select
                value={selectedTeachSkill}
                onChange={(e) => setSelectedTeachSkill(e.target.value)}
                required
              >
                {myTeachSkills.map((sk, idx) => (
                  <option key={idx} value={sk}>{sk}</option>
                ))}
                <option value="other">+ Enter another skill...</option>
              </select>

              {selectedTeachSkill === "other" && (
                <input
                  type="text"
                  placeholder="Type skill name you offer (e.g. Java)"
                  value={customTeachSkill}
                  onChange={(e) => setCustomTeachSkill(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="exchange-direction-badge">⇄</div>

            {/* LEARN SIDE */}
            <div className="exchange-side receive">
              <label className="exchange-lbl">📚 I Want to Learn:</label>
              <select
                value={selectedLearnSkill}
                onChange={(e) => setSelectedLearnSkill(e.target.value)}
                required
              >
                {partnerTeachSkills.map((sk, idx) => (
                  <option key={idx} value={sk}>{sk}</option>
                ))}
                <option value="other">+ Enter another skill...</option>
              </select>

              {selectedLearnSkill === "other" && (
                <input
                  type="text"
                  placeholder="Type skill name you want (e.g. Python)"
                  value={customLearnSkill}
                  onChange={(e) => setCustomLearnSkill(e.target.value)}
                  required
                />
              )}
            </div>

          </div>

          {/* NOTE / MESSAGE */}
          <div className="form-group-swap">
            <label>Personal Note / Availability (Optional):</label>
            <textarea
              rows={3}
              placeholder="Hi! I saw you know Machine Learning and I'd love to swap for my Java experience. Available on weekends!"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={400}
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="swap-modal-actions">
            <button type="button" className="swap-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="swap-send-btn" disabled={submitting}>
              {submitting ? "Sending Request..." : "🚀 Send Swap Request"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default RequestSwapModal;
