import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { handleAuthError } from "../utils/auth";
import "./Messages.css";

function Messages() {
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH CONNECTIONS FOR MESSAGES LIST
  // ==========================================
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

        if (handleAuthError(response, navigate)) return;

        const data = await response.json();

        if (!response.ok) {
          console.error(
            data.message || "Failed to load connections"
          );

          return;
        }

        setConnections(
          Array.isArray(data) ? data : []
        );

      } catch (error) {
        console.error(
          "Error loading messages:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [navigate]);


  // ==========================================
  // OPEN CHAT
  // ==========================================
  const openChat = (user) => {
    if (!user?._id) return;

    navigate(`/chat/${user._id}`, {
      state: {
        selectedUser: user,
      },
    });
  };


  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="messages-page">
        <h2>Loading messages... 💬</h2>
      </div>
    );
  }


  return (
    <div className="messages-page">

      <h1>💬 Messages</h1>

      {connections.length === 0 ? (

        <div className="no-messages">
          <h2>No connections available</h2>

          <p>
            Connect with other users to start messaging them.
          </p>
        </div>

      ) : (

        <div className="messages-list">

          {connections.map((connection) => {
            const user =
              connection.user || connection;

            if (!user?._id) {
              return null;
            }

            return (
              <div
                key={user._id}
                className="message-user"
                onClick={() => openChat(user)}
              >

                {/* AVATAR */}
                <div className="user-avatar">
                  {user.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>


                {/* USER INFORMATION */}
                <div className="message-user-info">

                  <h3>
                    {user.name || "Unknown User"}
                  </h3>

                  <p>
                    Click to start chatting
                  </p>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default Messages;