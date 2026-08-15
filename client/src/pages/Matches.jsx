import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Matches.css";

function Matches() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/users/matches",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch matches");
          return;
        }

        setMatches(data);
      } catch (error) {
        console.error("Match Error:", error);
        setError("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [navigate]);

  // SEND CONNECTION REQUEST
  const handleConnect = async (receiverId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/connections/${receiverId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to send connection request");
        return;
      }

      alert("Connection request sent successfully! 🤝");
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Unable to connect to the server");
    }
  };

  if (loading) {
    return (
      <div className="matches-page">
        <h1>Finding your best skill matches... 🤖</h1>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <div className="matches-header">
        <p className="matches-tag">AI-POWERED MATCHING</p>

        <h1>Find Your Skill Matches 🤝</h1>

        <p>
          Discover people who can teach you what you want to learn
          and learn from the skills you already have.
        </p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!error && matches.length === 0 && (
        <div className="no-matches">
          <h2>No matches found yet</h2>
          <p>
            Ask more users to join SkillSwap AI or update your skills
            to discover better matches.
          </p>
        </div>
      )}

      <div className="matches-grid">
        {matches.map((match) => (
          <div className="match-card" key={match.user.id}>
            
            <div className="match-top">
              <div className="avatar">
                {match.user.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2>{match.user.name}</h2>
                <p>{match.user.email}</p>
              </div>

              <div className="match-score">
                {match.matchPercentage}%
                <span>Match</span>
              </div>
            </div>

            <div className="match-section">
              <h3>🎓 Can Teach</h3>

              <div className="skill-tags">
                {match.user.teachSkills.map((skill, index) => (
                  <span className="teach-tag" key={index}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="match-section">
              <h3>📚 Wants to Learn</h3>

              <div className="skill-tags">
                {match.user.learnSkills.map((skill, index) => (
                  <span className="learn-tag" key={index}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {match.matchedSkills.length > 0 && (
              <div className="matched-skills">
                <strong>✨ Matching Skills:</strong>

                <div className="skill-tags">
                  {match.matchedSkills.map((skill, index) => (
                    <span className="matched-tag" key={index}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CONNECT BUTTON */}
            <button
              className="connect-btn"
              onClick={() => handleConnect(match.user.id)}
            >
              🤝 Connect
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Matches;