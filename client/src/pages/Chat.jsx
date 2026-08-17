import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { socket } from "../socket";
import { API_BASE_URL } from "../config/api";
import { handleAuthError } from "../utils/auth";
import "./Chat.css";

function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ================= STATES =================

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);


  // Edit
  const [editingMessageId, setEditingMessageId] =
    useState(null);

  const [editedText, setEditedText] =
    useState("");

  // Reactions
  const [showReactionPicker, setShowReactionPicker] =
    useState(null);

  const reactions = [
    { emoji: "😀", name: "smile" },
    { emoji: "❤️", name: "heart" },
    { emoji: "👍", name: "thumbsup" },
    { emoji: "😂", name: "laugh" },
    { emoji: "😮", name: "wow" },
    { emoji: "😢", name: "sad" },
    { emoji: "🔥", name: "fire" },
    { emoji: "👏", name: "clap" },
  ];

  // Search
  const [searchTerm, setSearchTerm] =
    useState("");

  // Forward
  const [forwardingMessage, setForwardingMessage] =
    useState(null);

  const [showForwardModal, setShowForwardModal] =
    useState(false);

  const [connections, setConnections] =
    useState([]);

  const [forwardLoading, setForwardLoading] =
    useState(false);

  // Code Snippet Sharing State
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeSnippetText, setCodeSnippetText] = useState("");
  const [codeLang, setCodeLang] = useState("javascript");
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  const handleSendCodeSnippet = async (e) => {
    if (e) e.preventDefault();
    if (!codeSnippetText.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/messages/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: `Code snippet (${codeLang})`,
          messageType: "code",
          codeLanguage: codeLang,
          codeSnippet: codeSnippetText.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to send code");
        return;
      }

      if (data.data) {
        setMessages((prev) => {
          const exists = prev.some((m) => String(m._id) === String(data.data._id));
          return exists ? prev : [...prev, data.data];
        });
      }

      setCodeSnippetText("");
      setShowCodeModal(false);
    } catch (err) {
      console.error("Send code error:", err);
      alert("Failed to send code snippet");
    }
  };

  const handleCopyCode = (messageId, code) => {
    navigator.clipboard.writeText(code);
    setCopiedMsgId(messageId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // ================= CURRENT USER =================

  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      return user?._id || user?.id || null;
    } catch (error) {
      console.error(
        "User Parse Error:",
        error
      );

      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  // ================= FORMAT TIME =================

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ================= SEARCH =================

  const filteredMessages = messages.filter(
    (message) =>
      message.message
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
  );

  // ================= AUTO SCROLL =================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // ================= SOCKET =================

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token || !currentUserId) {
      return;
    }

    const joinRoom = () => {
      if (currentUserId) {
        socket.emit("join", currentUserId);
      }
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.connect();
    }

    socket.on("connect", joinRoom);

    // Online users
    const handleOnlineUsers = (users) => {
      if (Array.isArray(users)) {
        setOnlineUsers(
          users.map((id) =>
            String(id)
          )
        );
      }
    };

    socket.on(
      "onlineUsers",
      handleOnlineUsers
    );

    // Receive message
    const handleReceiveMessage = (
      message
    ) => {
      if (!message) return;

      const msgSender = String(
        message.sender?._id || message.sender
      );
      const msgReceiver = String(
        message.receiver?._id || message.receiver
      );
      const activePartner = String(userId);
      const myId = String(currentUserId);

      // Only process messages for this conversation
      const isForThisChat =
        (msgSender === activePartner && msgReceiver === myId) ||
        (msgSender === myId && msgReceiver === activePartner);

      if (!isForThisChat) return;

      setIsTyping(false);

      setMessages((prevMessages) => {
        const exists =
          prevMessages.some(
            (msg) =>
              String(msg._id) ===
              String(message._id)
          );

        if (exists) {
          return prevMessages;
        }

        return [
          ...prevMessages,
          message,
        ];
      });

      // If received from chat partner, mark as read
      if (msgSender === activePartner) {
        fetch(
          `${API_BASE_URL}/api/messages/read/${activePartner}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ).catch(() => {});
      }
    };

    socket.on(
      "receiveMessage",
      handleReceiveMessage
    );

    // Typing
    const handleTyping = ({
      senderId,
    }) => {
      if (
        String(senderId) ===
        String(userId)
      ) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({
      senderId,
    }) => {
      if (
        String(senderId) ===
        String(userId)
      ) {
        setIsTyping(false);
      }
    };

    socket.on(
      "typing",
      handleTyping
    );

    socket.on(
      "stopTyping",
      handleStopTyping
    );

    // Delete message
    const handleMessageDeleted = ({
      messageId,
    }) => {
      setMessages((prevMessages) =>
        prevMessages.filter(
          (message) =>
            String(message._id) !==
            String(messageId)
        )
      );
    };

    socket.on(
      "messageDeleted",
      handleMessageDeleted
    );

    // Edit message
    const handleMessageEdited = (
      updatedMessage
    ) => {
      setMessages((prevMessages) =>
        prevMessages.map(
          (message) =>
            String(message._id) ===
            String(updatedMessage._id)
              ? updatedMessage
              : message
        )
      );
    };

    socket.on(
      "messageEdited",
      handleMessageEdited
    );

    // Reaction added
    const handleReactionAdded = (
      data
    ) => {
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          String(message._id) ===
          String(data.messageId)
            ? {
                ...message,
                reactions:
                  data.reactions,
              }
            : message
        )
      );
    };

    socket.on(
      "reactionAdded",
      handleReactionAdded
    );

    // Reaction removed
    const handleReactionRemoved = (
      data
    ) => {
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          String(message._id) ===
          String(data.messageId)
            ? {
                ...message,
                reactions:
                  data.reactions,
              }
            : message
        )
      );
    };

    socket.on(
      "reactionRemoved",
      handleReactionRemoved
    );

    return () => {
      socket.off(
        "connect",
        joinRoom
      );

      socket.off(
        "onlineUsers",
        handleOnlineUsers
      );

      socket.off(
        "receiveMessage",
        handleReceiveMessage
      );

      socket.off(
        "typing",
        handleTyping
      );

      socket.off(
        "stopTyping",
        handleStopTyping
      );

      socket.off(
        "messageDeleted",
        handleMessageDeleted
      );

      socket.off(
        "messageEdited",
        handleMessageEdited
      );

      socket.off(
        "reactionAdded",
        handleReactionAdded
      );

      socket.off(
        "reactionRemoved",
        handleReactionRemoved
      );

      if (
        typingTimeoutRef.current
      ) {
        clearTimeout(
          typingTimeoutRef.current
        );
      }
    };
  }, [
    currentUserId,
    userId,
  ]);


  // ================= FETCH MESSAGES =================

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/messages/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (handleAuthError(response, navigate)) return;

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to fetch messages"
          );

          return;
        }

        setMessages(
          Array.isArray(data)
            ? data
            : []
        );

        // Mark messages as read
        await fetch(
          `${API_BASE_URL}/api/messages/read/${userId}`,
          {
            method: "PUT",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        window.dispatchEvent(
          new Event("messageRead")
        );
      } catch (error) {
        console.error(
          "Fetch Messages Error:",
          error
        );

        setError(
          "Unable to connect to the server"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [
    userId,
    navigate,
  ]);

  // ================= FETCH CONNECTIONS =================

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/connections/my-connections`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (handleAuthError(response, navigate)) return;

        if (!response.ok) {
          console.error(
            data.message ||
              "Failed to fetch connections"
          );

          setConnections([]);
          return;
        }

        setConnections(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Fetch Connections Error:",
          error
        );

        setConnections([]);
      }
    };

    fetchConnections();
  }, [navigate]);

  // ================= TYPING =================

  const handleInputChange = (e) => {
    const value = e.target.value;

    setNewMessage(value);

    if (
      !socket ||
      !currentUserId
    ) {
      return;
    }

    if (value.trim()) {
      socket.emit(
        "typing",
        {
          senderId: currentUserId,
          receiverId: userId,
        }
      );
    }

    if (
      typingTimeoutRef.current
    ) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    typingTimeoutRef.current =
      setTimeout(() => {
        socket.emit(
          "stopTyping",
          {
            senderId:
              currentUserId,
            receiverId: userId,
          }
        );
      }, 1000);
  };

  // ================= SEND MESSAGE =================

  const handleSendMessage = async (
    e
  ) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      socket.emit(
        "stopTyping",
        {
          senderId: currentUserId,
          receiverId: userId,
        }
      );

      if (
        typingTimeoutRef.current
      ) {
        clearTimeout(
          typingTimeoutRef.current
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/messages/${userId}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            message:
              newMessage.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to send message"
        );

        return;
      }

      if (data.data) {
        setMessages(
          (prevMessages) => {
            const exists =
              prevMessages.some(
                (msg) =>
                  String(msg._id) ===
                  String(
                    data.data._id
                  )
              );

            if (exists) {
              return prevMessages;
            }

            return [
              ...prevMessages,
              data.data,
            ];
          }
        );
      }

      setNewMessage("");
    } catch (error) {
      console.error(
        "Send Message Error:",
        error
      );

      alert(
        "Unable to connect to the server"
      );
    }
  };

  // ================= EDIT MESSAGE =================

  const handleEditMessage = (
    message
  ) => {
    setEditingMessageId(
      message._id
    );

    setEditedText(
      message.message
    );
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedText("");
  };

  const handleSaveEdit = async (
    messageId
  ) => {
    if (!editedText.trim()) {
      alert(
        "Message cannot be empty"
      );

      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/messages/edit/${messageId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            message:
              editedText.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to edit message"
        );

        return;
      }

      if (data.data) {
        setMessages(
          (prevMessages) =>
            prevMessages.map(
              (message) =>
                String(message._id) ===
                String(messageId)
                  ? data.data
                  : message
            )
        );
      }

      handleCancelEdit();
    } catch (error) {
      console.error(
        "Edit Message Error:",
        error
      );

      alert(
        "Unable to connect to the server"
      );
    }
  };

  // ================= DELETE MESSAGE =================

  const handleDeleteMessage = async (
    messageId
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this message?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/messages/${messageId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to delete message"
        );

        return;
      }

      setMessages(
        (prevMessages) =>
          prevMessages.filter(
            (message) =>
              String(message._id) !==
              String(messageId)
          )
      );
    } catch (error) {
      console.error(
        "Delete Message Error:",
        error
      );

      alert(
        "Unable to connect to the server"
      );
    }
  };

  // ================= FORWARD MESSAGE =================

  const handleOpenForward = (
    message
  ) => {
    setForwardingMessage(message);
    setShowForwardModal(true);
  };

  const handleCloseForward = () => {
    setForwardingMessage(null);
    setShowForwardModal(false);
  };

  const handleForwardMessage = async (
    receiverId
  ) => {
    if (
      !forwardingMessage ||
      !receiverId
    ) {
      return;
    }

    try {
      setForwardLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/messages/forward/${forwardingMessage._id}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            receiverId,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to forward message"
        );

        return;
      }

      alert(
        "Message forwarded successfully"
      );

      handleCloseForward();
    } catch (error) {
      console.error(
        "Forward Message Error:",
        error
      );

      alert(
        "Unable to connect to the server"
      );
    } finally {
      setForwardLoading(false);
    }
  };

  // ================= ADD REACTION =================

  const handleAddReaction = async (
    messageId,
    emoji
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/messages/${messageId}/reaction`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            emoji,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          data.message ||
            "Failed to add reaction"
        );
        return;
      }

      if (data.data) {
        setMessages(
          (prevMessages) =>
            prevMessages.map(
              (message) =>
                String(message._id) ===
                String(messageId)
                  ? {
                      ...message,
                      reactions:
                        data.data.reactions,
                    }
                  : message
            )
        );
      }

      setShowReactionPicker(null);
    } catch (error) {
      console.error(
        "Add Reaction Error:",
        error
      );
    }
  };

  // ================= REMOVE REACTION =================

  const handleRemoveReaction = async (
    messageId,
    emoji
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/messages/${messageId}/reaction`,
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            emoji,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          data.message ||
            "Failed to remove reaction"
        );
        return;
      }

      if (data.data) {
        setMessages(
          (prevMessages) =>
            prevMessages.map(
              (message) =>
                String(message._id) ===
                String(messageId)
                  ? {
                      ...message,
                      reactions:
                        data.data.reactions,
                    }
                  : message
            )
        );
      }
    } catch (error) {
      console.error(
        "Remove Reaction Error:",
        error
      );
    }
  };

  // ================= ONLINE STATUS =================

  const isUserOnline =
    onlineUsers.includes(
      String(userId)
    );

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="chat-page">
        <h2>
          Loading conversation... 💬
        </h2>
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="chat-page">
      <div className="chat-container">

        {/* HEADER */}

        {(() => {
          const partnerUser =
            location.state?.selectedUser ||
            connections.find(
              (c) =>
                String(c.user?._id) === String(userId) ||
                String(c.user?.id) === String(userId)
            )?.user ||
            null;

          return (
            <div className="chat-header">
              <button
                className="back-btn"
                onClick={() =>
                  navigate("/connections")
                }
              >
                ← Back
              </button>

              <div className="chat-partner-info">
                <div className="chat-partner-avatar">
                  {partnerUser?.name?.charAt(0)?.toUpperCase() || "👤"}
                  <span
                    className={
                      isUserOnline
                        ? "avatar-status-dot online"
                        : "avatar-status-dot offline"
                    }
                  ></span>
                </div>

                <div className="chat-partner-details">
                  <h2>
                    {partnerUser?.name || "Skill Partner"}
                  </h2>

                  <p className="online-status">
                    <span
                      className={
                        isUserOnline
                          ? "status-dot online"
                          : "status-dot offline"
                      }
                    ></span>

                    {isUserOnline
                      ? "Active Now"
                      : "Offline"}
                  </p>
                </div>
              </div>

            </div>
          );
        })()}

        {/* SEARCH */}

        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search messages..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
            >
              ✕
            </button>
          )}
        </div>

        {/* ERROR */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* MESSAGES */}

        <div className="messages-container">

          {filteredMessages.length ===
          0 ? (
            <div className="no-messages">
              {searchTerm ? (
                <p>
                  No messages found.
                </p>
              ) : (
                <>
                  <p>
                    No messages yet.
                  </p>

                  <p>
                    Start the conversation! 👋
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredMessages.map(
              (message) => {
                const senderId =
                  message.sender?._id ||
                  message.sender;

                const isSent =
                  String(senderId) ===
                  String(
                    currentUserId
                  );

                const isEditing =
                  String(
                    editingMessageId
                  ) ===
                  String(
                    message._id
                  );

                return (
                  <div
                    key={message._id}
                    className={
                      isSent
                        ? "message-wrapper sent-wrapper"
                        : "message-wrapper received-wrapper"
                    }
                  >
                    {isEditing ? (
                      <div className="edit-message-box">

                        <input
                          type="text"
                          value={editedText}
                          onChange={(e) =>
                            setEditedText(
                              e.target.value
                            )
                          }
                          autoFocus
                        />

                        <div className="edit-buttons">

                          <button
                            type="button"
                            onClick={() =>
                              handleSaveEdit(
                                message._id
                              )
                            }
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={
                              handleCancelEdit
                            }
                          >
                            Cancel
                          </button>

                        </div>
                      </div>
                    ) : (
                      <>
                        {/* FORWARDED */}

                        {message.isForwarded && (
                          <div className="forwarded-label">
                            📤 Forwarded
                          </div>
                        )}

                        {/* MESSAGE CONTENT */}
                        {message.messageType === "code" || message.codeSnippet ? (
                          <div className={`chat-code-block ${isSent ? "code-sent" : "code-received"}`}>
                            <div className="code-block-header">
                              <span className="code-lang-tag">⚡ {message.codeLanguage || "code"}</span>
                              <button
                                type="button"
                                className="copy-code-btn"
                                onClick={() => handleCopyCode(message._id, message.codeSnippet || message.message)}
                              >
                                {copiedMsgId === message._id ? "✓ Copied!" : "📋 Copy"}
                              </button>
                            </div>
                            <pre className="code-content">
                              <code>{message.codeSnippet || message.message}</code>
                            </pre>
                          </div>
                        ) : (
                          <div
                            className={
                              isSent
                                ? "message sent"
                                : "message received"
                            }
                          >
                            {message.message}
                          </div>
                        )}

                        {/* TIME */}

                        <span className="message-time">
                          {formatTime(
                            message.createdAt
                          )}

                          {message.isEdited &&
                            " (edited)"}
                        </span>

                        {/* REACTIONS */}

                        {message.reactions &&
                          message.reactions
                            .length > 0 && (
                            <div className="message-reactions">
                              {message.reactions.map(
                                (
                                  reaction,
                                  idx
                                ) => {
                                  const hasReacted =
                                    reaction.reactedBy?.some(
                                      (uid) =>
                                        String(uid) ===
                                        String(currentUserId)
                                    );

                                  return (
                                    <button
                                      key={
                                        idx
                                      }
                                      type="button"
                                      className={
                                        hasReacted
                                          ? "reaction-btn active"
                                          : "reaction-btn"
                                      }
                                      onClick={() =>
                                        hasReacted
                                          ? handleRemoveReaction(
                                              message._id,
                                              reaction.emoji
                                            )
                                          : handleAddReaction(
                                              message._id,
                                              reaction.emoji
                                            )
                                      }
                                      title={`${reaction.reactedBy?.length || 0} ${reaction.emoji}`}
                                    >
                                      {
                                        reaction.emoji
                                      }{" "}
                                      {
                                        reaction
                                          .reactedBy
                                          ?.length
                                      }
                                    </button>
                                  );
                                }
                              )}

                              <button
                                type="button"
                                className="add-reaction-btn"
                                onClick={() =>
                                  setShowReactionPicker(
                                    showReactionPicker ===
                                      message._id
                                      ? null
                                      : message._id
                                  )
                                }
                              >
                                +
                              </button>
                            </div>
                          )}

                        {/* REACTION PICKER */}

                        {showReactionPicker ===
                          message._id && (
                          <div className="reaction-picker">
                            {reactions.map(
                              (
                                reaction,
                                idx
                              ) => (
                                <button
                                  key={
                                    idx
                                  }
                                  type="button"
                                  className="emoji-btn"
                                  onClick={() =>
                                    handleAddReaction(
                                      message._id,
                                      reaction.emoji
                                    )
                                  }
                                  title={
                                    reaction.name
                                  }
                                >
                                  {
                                    reaction.emoji
                                  }
                                </button>
                              )
                            )}
                          </div>
                        )}

                        {/* ACTIONS */}

                        <div className="message-actions">

                          <button
                            type="button"
                            className="forward-message-btn"
                            onClick={() =>
                              handleOpenForward(
                                message
                              )
                            }
                          >
                            📤 Forward
                          </button>

                          {isSent && (
                            <>
                              <button
                                type="button"
                                className="edit-message-btn"
                                onClick={() =>
                                  handleEditMessage(
                                    message
                                  )
                                }
                              >
                                ✏️ Edit
                              </button>

                              <button
                                type="button"
                                className="delete-message-btn"
                                onClick={() =>
                                  handleDeleteMessage(
                                    message._id
                                  )
                                }
                              >
                                🗑 Delete
                              </button>
                            </>
                          )}

                        </div>
                      </>
                    )}
                  </div>
                );
              }
            )
          )}

          {/* TYPING */}

          {isTyping && (
            <div className="typing-indicator-container">
              <div className="typing-bubble">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
              <span className="typing-label">typing...</span>
            </div>
          )}

          <div
            ref={messagesEndRef}
          ></div>
        </div>

        {/* SEND MESSAGE */}

        <form
          className="message-form"
          onSubmit={
            handleSendMessage
          }
        >
          <button
            type="button"
            className="code-snippet-trigger-btn"
            title="Share Code Snippet"
            onClick={() => setShowCodeModal(true)}
          >
            💻 Code
          </button>

          <input
            type="text"
            placeholder="Type your message or share a snippet..."
            value={newMessage}
            onChange={
              handleInputChange
            }
          />

          <button type="submit">
            Send
          </button>
        </form>

        {/* CODE SNIPPET MODAL */}
        {showCodeModal && (
          <div className="code-modal-overlay">
            <div className="code-modal-card">
              <div className="code-modal-header">
                <h3>💻 Share Code Snippet</h3>
                <button type="button" onClick={() => setShowCodeModal(false)}>✕</button>
              </div>

              <div className="code-modal-controls">
                <label>Language:</label>
                <select value={codeLang} onChange={(e) => setCodeLang(e.target.value)}>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="react">React / JSX</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="sql">SQL</option>
                  <option value="markdown">Markdown</option>
                </select>
              </div>

              <textarea
                className="code-snippet-textarea"
                placeholder="Paste or write your code snippet here..."
                value={codeSnippetText}
                onChange={(e) => setCodeSnippetText(e.target.value)}
                rows={8}
                autoFocus
              />

              <div className="code-modal-actions">
                <button type="button" className="cancel-code-btn" onClick={() => setShowCodeModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="send-code-btn"
                  disabled={!codeSnippetText.trim()}
                  onClick={handleSendCodeSnippet}
                >
                  🚀 Share Snippet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FORWARD MODAL */}

        {showForwardModal && (
          <div className="forward-modal-overlay">

            <div className="forward-modal">

              <div className="forward-modal-header">

                <h3>
                  📤 Forward Message
                </h3>

                <button
                  type="button"
                  onClick={
                    handleCloseForward
                  }
                >
                  ✕
                </button>

              </div>

              {/* MESSAGE PREVIEW */}

              {forwardingMessage && (
                <div className="forward-preview">

                  <strong>
                    Message:
                  </strong>

                  <p>
                    {
                      forwardingMessage.message
                    }
                  </p>

                </div>
              )}

              <h4>
                Select a connection
              </h4>

              {/* CONNECTIONS */}

              <div className="forward-connections">

                {connections.length ===
                0 ? (
                  <p>
                    No accepted connections found.
                  </p>
                ) : (
                  connections.map(
                    (connection) => {
                      const otherUser =
                        connection.user;

                      if (
                        !otherUser ||
                        !otherUser._id
                      ) {
                        return null;
                      }

                      // Don't show current chat user
                      if (
                        String(
                          otherUser._id
                        ) ===
                        String(userId)
                      ) {
                        return null;
                      }

                      return (
                        <button
                          key={
                            connection._id
                          }
                          type="button"
                          className="forward-user-btn"
                          disabled={
                            forwardLoading
                          }
                          onClick={() =>
                            handleForwardMessage(
                              otherUser._id
                            )
                          }
                        >
                          👤{" "}

                          {otherUser.name ||
                            "User"}
                        </button>
                      );
                    }
                  )
                )}

              </div>

              <button
                type="button"
                className="cancel-forward-btn"
                disabled={
                  forwardLoading
                }
                onClick={
                  handleCloseForward
                }
              >
                Cancel
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Chat;