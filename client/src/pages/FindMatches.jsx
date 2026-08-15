import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./FindMatches.css";

function FindMatches() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH MATCHES
  // ==========================================
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/users/matches`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Failed to load matches"
          );
          return;
        }

        setMatches(
          Array.isArray(data.matches)
            ? data.matches
            : []
        );

        setError("");

      } catch (error) {
        console.error(
          "Find Matches Error:",
          error
        );

        setError(
          "Unable to connect to the server"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [navigate]);


  // ==========================================
  // SEND CONNECTION REQUEST
  // ==========================================
  const handleConnect = async (receiverId) => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/connections/${receiverId}`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Failed to send connection request"
        );

        return;
      }

      alert(
        "Connection request sent successfully! 🤝"
      );

    } catch (error) {
      console.error(
        "Connection Request Error:",
        error
      );

      alert(
        "Unable to connect to the server"
      );
    }
  };


  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="matches-page">
        <h1>
          Finding your skill matches... 🔍
        </h1>
      </div>
    );
  }


  return (
    <div className="matches-page">

      <div className="matches-container">

        {/* HEADER */}
        <div className="matches-header">
          <p>SKILLSWAP AI</p>

          <h1>
            Find Your Matches 🤝
          </h1>

          <span>
            People who can teach the skills
            you want to learn
          </span>
        </div>


        {/* ERROR */}
        {error && (
          <div className="matches-error">
            {error}
          </div>
        )}


        {/* NO MATCHES */}
        {!error && matches.length === 0 && (
          <div className="no-matches">

            <h2>
              No matches found 😔
            </h2>

            <p>
              Add more skills to your learning
              profile and check again later.
            </p>

          </div>
        )}


        {/* MATCHES */}
        <div className="matches-grid">

          {matches.map((user) => (

            <div
              className="match-card"
              key={user._id}
            >

              {/* AVATAR */}
              <div className="match-avatar">
                {user.name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>


              <h2>
                {user.name}
              </h2>


              <p className="match-email">
                {user.email}
              </p>


              {/* CAN TEACH */}
              <div className="match-section">

                <h3>
                  🎓 Can Teach
                </h3>

                <div className="match-skills">

                  {Array.isArray(
                    user.teachSkills
                  ) &&
                  user.teachSkills.length > 0 ? (

                    user.teachSkills.map(
                      (skill, index) => (
                        <span
                          className="teach-skill"
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
              <div className="match-section">

                <h3>
                  📚 Wants to Learn
                </h3>

                <div className="match-skills">

                  {Array.isArray(
                    user.learnSkills
                  ) &&
                  user.learnSkills.length > 0 ? (

                    user.learnSkills.map(
                      (skill, index) => (
                        <span
                          className="learn-skill"
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


              {/* CONNECT BUTTON */}
              <button
                className="connect-btn"
                onClick={() =>
                  handleConnect(user._id)
                }
              >
                🤝 Connect
              </button>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default FindMatches;