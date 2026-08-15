import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { API_BASE_URL } from "../config/api";
import "./Connections.css";

function Connections() {
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Total unread messages
  const [unreadCount, setUnreadCount] = useState(0);

  // Unread messages grouped by sender
  const [unreadCountsBySender, setUnreadCountsBySender] =
    useState({});


  // ==============================
  // FETCH CONNECTIONS
  // ==============================
  // LOAD CONNECTIONS
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/connections/my-connections`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Failed to fetch connections"
          );
          return;
        }

        setConnections(
          Array.isArray(data) ? data : []
        );

        setError("");

      } catch (error) {
        console.error(
          "Connections Error:",
          error
        );

        setError(
          "Unable to connect to the server"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();

    // Listen for refresh event
    const handleRefresh = () => {
      fetchConnections();
    };

    window.addEventListener(
      "refreshConnections",
      handleRefresh
    );

    return () => {
      window.removeEventListener(
        "refreshConnections",
        handleRefresh
      );
    };
  }, [navigate]);


  // ==============================
  // FETCH TOTAL UNREAD COUNT
  // ==============================
  // LOAD AND REFRESH TOTAL UNREAD COUNT
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const response = await fetch(
          `${API_BASE_URL}/api/messages/unread/count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            data.message ||
            "Failed to fetch unread count"
          );
          return;
        }

        setUnreadCount(
          data.unreadCount || 0
        );

      } catch (error) {
        console.error(
          "Unread Count Error:",
          error
        );
      }
    };

    fetchUnreadCount();

    const interval = setInterval(
      fetchUnreadCount,
      5000
    );

    return () => clearInterval(interval);

  }, []);


  // ==============================
  // FETCH UNREAD COUNTS BY SENDER
  // ==============================
  // LOAD AND REFRESH UNREAD COUNTS
  useEffect(() => {
    const fetchUnreadCountsBySender =
      async () => {
        try {
          const token = localStorage.getItem("token");

          if (!token) return;

          const response = await fetch(
            `${API_BASE_URL}/api/messages/unread/by-sender`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            console.error(
              data.message ||
              "Failed to fetch unread counts"
            );

            return;
          }

          setUnreadCountsBySender(
            data.unreadCounts || {}
          );

        } catch (error) {
          console.error(
            "Unread Counts By Sender Error:",
            error
          );
        }
      };

    fetchUnreadCountsBySender();

    const interval = setInterval(
      fetchUnreadCountsBySender,
      5000
    );

    return () => clearInterval(interval);

  }, []);


  // ==============================
  // CONNECT SOCKET
  // ==============================
  useEffect(() => {
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }
  }, []);


  // ==============================
  // REAL-TIME MESSAGE UPDATE
  // ==============================
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      if (!newMessage || !newMessage.sender) {
        return;
      }

      const senderId =
        typeof newMessage.sender === "object"
          ? (
              newMessage.sender._id ||
              newMessage.sender.id
            )
          : newMessage.sender;

      if (!senderId) return;

      const senderIdString = String(senderId);

      // Update total unread count
      setUnreadCount((previousCount) => {
        return previousCount + 1;
      });

      // Update unread count for that sender
      setUnreadCountsBySender(
        (previousCounts) => ({
          ...previousCounts,

          [senderIdString]:
            (previousCounts[senderIdString] || 0) + 1,
        })
      );
    };


    socket.on(
      "receiveMessage",
      handleReceiveMessage
    );


    return () => {
      socket.off(
        "receiveMessage",
        handleReceiveMessage
      );
    };

  }, []);


  // ==============================
  // REAL-TIME CONNECTION UPDATE
  // ==============================
  useEffect(() => {
    if (!socket) return;

    const handleConnectionUpdate = (data) => {
      console.log(
        "Connection request updated:",
        data
      );

      // If the request is accepted,
      // automatically refresh connections
      if (data?.status === "accepted") {
        window.dispatchEvent(
          new Event("refreshConnections")
        );
      }
    };


    socket.on(
      "connectionRequestUpdated",
      handleConnectionUpdate
    );


    return () => {
      socket.off(
        "connectionRequestUpdated",
        handleConnectionUpdate
      );
    };

  }, []);


  // ==============================
  // REAL-TIME CONNECTION REQUEST
  // ==============================
  useEffect(() => {
    if (!socket) return;

    const handleNewConnectionRequest = (data) => {
      console.log(
        "New connection request:",
        data
      );

      // Notify other components/pages
      window.dispatchEvent(
        new Event("newConnectionRequest")
      );
    };


    socket.on(
      "newConnectionRequest",
      handleNewConnectionRequest
    );


    return () => {
      socket.off(
        "newConnectionRequest",
        handleNewConnectionRequest
      );
    };

  }, []);


  // ==============================
  // LOADING
  // ==============================
  if (loading) {
    return (
      <div className="connections-page">
        <h1>
          Loading your connections... 🤝
        </h1>
      </div>
    );
  }


  return (
    <div className="connections-page">

      {/* HEADER */}
      <div className="connections-header">

        <p className="connections-tag">
          MY NETWORK
        </p>

        <h1>
          My SkillSwap Connections 🤝

          {unreadCount > 0 && (
            <span className="unread-badge">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </h1>

        <p>
          Connect, learn, and exchange knowledge
          with your SkillSwap community.
        </p>

      </div>


      {/* ERROR */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* NO CONNECTIONS */}
      {!error &&
        connections.length === 0 && (
          <div className="no-connections">

            <h2>
              No connections yet
            </h2>

            <p>
              Find skill matches and send connection
              requests to grow your network.
            </p>

          </div>
        )}


      {/* CONNECTION GRID */}
      <div className="connections-grid">

        {connections.map((connection) => {
          const user = connection.user;

          if (!user) return null;

          const userId = String(user._id);

          const userUnreadCount =
            unreadCountsBySender[userId] || 0;

          return (
            <div
              className="connection-card"
              key={connection._id}
            >

              {/* USER INFORMATION */}
              <div className="connection-user">

                <div className="connection-avatar">
                  {user.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

                <div>
                  <h2>
                    {user.name || "Unknown User"}
                  </h2>

                  <p>
                    {user.email || ""}
                  </p>
                </div>

              </div>


              {/* CAN TEACH */}
              <div className="connection-section">

                <h3>🎓 Can Teach</h3>

                <div className="skill-tags">

                  {Array.isArray(user.teachSkills) &&
                  user.teachSkills.length > 0 ? (
                    user.teachSkills.map(
                      (skill, index) => (
                        <span
                          className="teach-tag"
                          key={index}
                        >
                          {skill}
                        </span>
                      )
                    )
                  ) : (
                    <span>
                      No skills added
                    </span>
                  )}

                </div>

              </div>


              {/* WANTS TO LEARN */}
              <div className="connection-section">

                <h3>📚 Wants to Learn</h3>

                <div className="skill-tags">

                  {Array.isArray(user.learnSkills) &&
                  user.learnSkills.length > 0 ? (
                    user.learnSkills.map(
                      (skill, index) => (
                        <span
                          className="learn-tag"
                          key={index}
                        >
                          {skill}
                        </span>
                      )
                    )
                  ) : (
                    <span>
                      No skills added
                    </span>
                  )}

                </div>

              </div>


              {/* CONNECTION STATUS */}
              <div className="connection-status">
                ✓ Connected
              </div>


              {/* MESSAGE BUTTON */}
              <button
                className="message-btn"
                onClick={() =>
                  navigate(`/chat/${user._id}`)
                }
              >
                💬 Message

                {userUnreadCount > 0 && (
                  <span className="individual-unread-badge">
                    {userUnreadCount > 99
                      ? "99+"
                      : userUnreadCount}
                  </span>
                )}
              </button>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Connections;