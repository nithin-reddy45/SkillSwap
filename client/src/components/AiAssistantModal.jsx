import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./AiAssistantModal.css";

const PRESET_PROMPTS = [
  "🔍 Who can teach me Python & React?",
  "🗺️ Create a 30-day Machine Learning roadmap",
  "🧠 How do I earn verified skill badges?",
  "🪙 How do Skill Credits work?",
  "💻 How does useEffect cleanup work in React?",
  "📄 Analyze my resume skill gaps",
];

function FormattedMessage({ text }) {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);

  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Split by code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="formatted-msg-content">
      {parts.map((part, idx) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0].trim();
          const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const lang = hasLang ? firstLine : "code";
          const codeContent = hasLang ? lines.slice(1).join("\n") : lines.join("\n");

          return (
            <div className="ai-code-container" key={idx}>
              <div className="ai-code-header">
                <span className="code-lang-tag">⚡ {lang}</span>
                <button
                  type="button"
                  className="ai-copy-code-btn"
                  onClick={() => handleCopyCode(codeContent, idx)}
                >
                  {copiedCodeIdx === idx ? "✓ Copied!" : "📋 Copy"}
                </button>
              </div>
              <pre className="ai-code-pre">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // Parse markdown formatting for regular text
        const renderedText = part.split("\n").map((line, lIdx) => {
          if (!line.trim()) return <br key={lIdx} />;

          if (line.startsWith("### ")) {
            return (
              <h4 key={lIdx} className="ai-heading">
                {line.replace("### ", "")}
              </h4>
            );
          }

          if (line.startsWith("• ") || line.startsWith("- ")) {
            return (
              <div key={lIdx} className="ai-list-item">
                <span className="bullet">▸</span>
                <span>{renderInlineMarkdown(line.slice(2))}</span>
              </div>
            );
          }

          return (
            <p key={lIdx} className="ai-paragraph">
              {renderInlineMarkdown(line)}
            </p>
          );
        });

        return <div key={idx}>{renderedText}</div>;
      })}
    </div>
  );
}

function renderInlineMarkdown(text) {
  // Bold **text**
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((bPart, bIdx) => {
    if (bPart.startsWith("**") && bPart.endsWith("**")) {
      return <strong key={bIdx}>{bPart.slice(2, -2)}</strong>;
    }
    // Inline code `code`
    const codeParts = bPart.split(/(`.*?`)/g);
    return codeParts.map((cPart, cIdx) => {
      if (cPart.startsWith("`") && cPart.endsWith("`")) {
        return (
          <code key={cIdx} className="ai-inline-code">
            {cPart.slice(1, -1)}
          </code>
        );
      }
      return cPart;
    });
  });
}

function AiAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("skillswap_ai_chat");
      return saved
        ? JSON.parse(saved)
        : [
            {
              sender: "ai",
              text: "👋 Hi! I'm your **SkillSwap AI Copilot**. Ask me to find mentors, explain code, generate roadmaps, or explain how to earn verified badges!",
              action: null,
            },
          ];
    } catch {
      return [
        {
          sender: "ai",
          text: "👋 Hi! I'm your **SkillSwap AI Copilot**. How can I assist your learning journey today?",
          action: null,
        },
      ];
    }
  });

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem("skillswap_ai_chat", JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleClearChat = () => {
    const initial = [
      {
        sender: "ai",
        text: "👋 Chat cleared! Ask me anything about skills, finding mentors, or programming concepts.",
        action: null,
      },
    ];
    setMessages(initial);
    sessionStorage.setItem("skillswap_ai_chat", JSON.stringify(initial));
  };

  const handleSendMessage = async (textToSend = inputMessage) => {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend.trim();
    setInputMessage("");

    const newMessages = [...messages, { sender: "user", text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/ai/assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: userText,
          history: newMessages.slice(-6),
        }),
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
          mentors: data.mentors || [],
        },
      ]);
    } catch (err) {
      console.error("AI Assistant error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ Sorry, I had trouble processing that request. Please verify your connection or ask another question!",
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
        <div className={`ai-modal-card ${isExpanded ? "expanded" : ""}`}>
          
          {/* HEADER */}
          <div className="ai-modal-header">
            <div className="header-left">
              <div className="bot-avatar">🤖</div>
              <div>
                <h3>SkillSwap AI Assistant</h3>
                <span className="online-sub">● Online & Ready</span>
              </div>
            </div>

            <div className="header-actions">
              <button
                type="button"
                className="ai-header-btn"
                title="Clear Chat History"
                onClick={handleClearChat}
              >
                🗑️
              </button>
              <button
                type="button"
                className="ai-header-btn"
                title={isExpanded ? "Collapse Window" : "Expand Window"}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "🗗" : "🗖"}
              </button>
              <button
                type="button"
                className="ai-modal-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close Copilot"
              >
                ✕
              </button>
            </div>
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
                  <FormattedMessage text={msg.text} />

                  {/* MENTORS MINI CARDS */}
                  {msg.mentors && msg.mentors.length > 0 && (
                    <div className="ai-mentors-preview-list">
                      {msg.mentors.map((m) => (
                        <div className="ai-mentor-card" key={m.id}>
                          <div className="mentor-card-info">
                            <strong>👤 {m.name}</strong>
                            <span>⭐ {m.rating?.toFixed(1) || "5.0"} Rating</span>
                          </div>
                          <Link
                            to="/matches"
                            className="ai-connect-btn"
                            onClick={() => setIsOpen(false)}
                          >
                            Connect →
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}

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
              placeholder="Ask anything (e.g. Find Python mentors, explain React hooks...)"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              autoFocus
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
