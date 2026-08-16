import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./AiAssistantModal.css";

const PRESET_PROMPTS = [
  "🗺️ Create a 30-day React roadmap",
  "🔍 Who should I learn Python from?",
  "📄 Analyze my resume skill gaps",
  "🧠 How do I earn a verified badge?",
];

function AiAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Hi! I'm your **SkillSwap AI Copilot**. How can I assist your learning journey today?",
      action: null,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend = inputMessage) => {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend.trim();
    setInputMessage("");

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to get AI response");
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply,
          action: data.action || null,
        },
      ]);
    } catch (err) {
      console.error("AI Assistant error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I had trouble processing that request. Please try asking again!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <button
        className={`floating-ai-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="SkillSwap AI Copilot"
        aria-label="Open AI Assistant"
      >
        <span className="trigger-icon">{isOpen ? "✕" : "🤖"}</span>
        {!isOpen && <span className="trigger-label">AI Copilot</span>}
        <span className="trigger-pulse"></span>
      </button>

      {/* AI CHAT MODAL */}
      {isOpen && (
        <div className="ai-modal-card">
          
          {/* HEADER */}
          <div className="ai-modal-header">
            <div className="header-left">
              <div className="bot-avatar">🤖</div>
              <div>
                <h3>SkillSwap AI Assistant</h3>
                <span className="online-sub">● Online & Ready</span>
              </div>
            </div>
            <button
              className="ai-modal-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* MESSAGES CONTAINER */}
          <div className="ai-modal-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`ai-message-bubble-row ${msg.sender === "user" ? "user-row" : "ai-row"}`}
              >
                {msg.sender === "ai" && <div className="bubble-bot-avatar">🤖</div>}
                <div className={`message-bubble ${msg.sender}`}>
                  <p>{msg.text}</p>

                  {/* ACTION LINK */}
                  {msg.action && (
                    <Link
                      to={msg.action.link}
                      className="ai-action-btn-chip"
                      onClick={() => setIsOpen(false)}
                    >
                      {msg.action.label} →
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-message-bubble-row ai-row">
                <div className="bubble-bot-avatar">🤖</div>
                <div className="message-bubble ai typing">
                  <span>●</span>
                  <span>●</span>
                  <span>●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* PRESET PROMPTS */}
          <div className="ai-presets-scroll">
            {PRESET_PROMPTS.map((prompt, pIdx) => (
              <button
                key={pIdx}
                className="preset-chip"
                onClick={() => handleSendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* INPUT BAR */}
          <form
            className="ai-modal-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              placeholder="Ask anything (e.g. Find Python mentors...)"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button type="submit" className="ai-send-btn" disabled={!inputMessage.trim() || loading}>
              ➤
            </button>
          </form>

        </div>
      )}
    </>
  );
}

export default AiAssistantModal;
