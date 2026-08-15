import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./MyConnections.css";

function MyConnections() {
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==========================================
  // FETCH ACCEPTED CONNECTIONS
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

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message ||
            "Failed to fetch connections"
          );
          return;
        }

        setConnections(
          Array.isArray(data) ? data : []
        );

        setError("");

      } catch (error) {
        console.error(
          "My Connections Error:",
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
  }, [navigate]);


  // ==========================================
  // OPEN CHAT
  // ==========================================
  const handleMessage = (user) => {
    navigate("/messages", {
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
      <div className="connections-page">
        <h1>
          Loading your connections... 🤝
        </h1>
      </div>
    );
  }


  return (
    <div className="connections-page">

      <div className="connections-container">

        {/* HEADER */}
        <div className="connections-header">

          <p>
            MY NETWORK
          </p>

          <h1>
            My Connections 🤝
          </h1>

          <span>
            Connect, learn, teach, and grow together.
          </span>

        </div>


        {/* ERROR */}
        {error && (
          <div className="connections-error">
            {error}
          </div>
        )}


        {/* NO CONNECTIONS */}
        {!error &&
          connections.length === 0 && (
            <div className="no-connections">

              <h2>
                No connections yet 🤝
              </h2>

              <p>
                Accept connection requests or find
                new skill partners to start building
                your network.
              </p>

            </div>
          )}


        {/* CONNECTIONS GRID */}
        <div className="connections-grid">

          {connections.map((connection) => {
            const user = connection.user;

            if (!user) return null;

            return (
              <div
                className="connection-card"
                key={connection._id}
              >

                {/* AVATAR */}
                <div className="connection-avatar">
                  {user.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>


                {/* USER INFO */}
                <h2>
                  {user.name}
                </h2>

                <p className="connection-email">
                  {user.email}
                </p>


                {/* TEACH SKILLS */}
                <div className="connection-section">

                  <h3>
                    🎓 Can Teach
                  </h3>

                  <div className="connection-skills">

                    {user.teachSkills?.length > 0 ? (
                      user.teachSkills.map(
                        (skill, index) => (
                          <span
                            className="connection-teach-tag"
                            key={index}
                          >
                            {skill}
                          </span>
                        )
                      )
                    ) : (
                      <span className="empty-skill">
                        No skills added
                      </span>
                    )}

                  </div>

                </div>


                {/* LEARN SKILLS */}
                <div className="connection-section">

                  <h3>
                    📚 Wants to Learn
                  </h3>

                  <div className="connection-skills">

                    {user.learnSkills?.length > 0 ? (
                      user.learnSkills.map(
                        (skill, index) => (
                          <span
                            className="connection-learn-tag"
                            key={index}
                          >
                            {skill}
                          </span>
                        )
                      )
                    ) : (
                      <span className="empty-skill">
                        No skills added
                      </span>
                    )}

                  </div>

                </div>


                {/* MESSAGE BUTTON */}
                <button
                  className="message-btn"
                  onClick={() =>
                    handleMessage(user)
                  }
                >
                  💬 Message
                </button>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}

export default MyConnections;