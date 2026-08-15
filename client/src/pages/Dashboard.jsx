import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // Connection count
  const [connectionCount, setConnectionCount] =
    useState(0);

  // Pending request count
  const [requestCount, setRequestCount] =
    useState(0);


  // FETCH CONNECTIONS COUNT
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) return;

        const response = await fetch(
          "http://localhost:5000/api/connections/my-connections",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (response.ok) {
          setConnectionCount(
            Array.isArray(data)
              ? data.length
              : 0
          );
        }

      } catch (error) {
        console.error(
          "Connection Count Error:",
          error
        );
      }
    };

    fetchConnections();

    // Refresh connections after accepting a request
    const handleRequestUpdated = () => {
      fetchConnections();
    };

    window.addEventListener(
      "requestUpdated",
      handleRequestUpdated
    );

    return () => {
      window.removeEventListener(
        "requestUpdated",
        handleRequestUpdated
      );
    };

  }, []);


  // FETCH PENDING REQUEST COUNT
  useEffect(() => {
    const fetchRequestCount = async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) return;

        const response = await fetch(
          "http://localhost:5000/api/connections/requests",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (response.ok) {
          setRequestCount(
            Array.isArray(data)
              ? data.length
              : 0
          );
        }

      } catch (error) {
        console.error(
          "Request Count Error:",
          error
        );
      }
    };

    fetchRequestCount();

  }, []);


  // REAL-TIME CONNECTION REQUEST
  useEffect(() => {
    if (!socket) return;

    const handleNewConnectionRequest = () => {
      setRequestCount(
        (prevCount) => prevCount + 1
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


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };


  if (!user) {
    return null;
  }


  return (
    <div className="dashboard-page">

      {/* Welcome Section */}
      <section className="dashboard-hero">

        <div>

          <p className="dashboard-tag">
            YOUR LEARNING DASHBOARD
          </p>

          <h1>
            Welcome back, {user.name}! 👋
          </h1>

          <p className="dashboard-subtitle">
            Manage your skills, discover new people,
            and grow your learning network.
          </p>

        </div>


        <div className="dashboard-actions">

          {/* CONNECTION REQUEST NOTIFICATION */}
          <button
            className="request-notification-btn"
            onClick={() =>
              navigate("/requests")
            }
          >
            🔔 Requests

            {requestCount > 0 && (
              <span className="dashboard-request-badge">
                {requestCount > 99
                  ? "99+"
                  : requestCount}
              </span>
            )}

          </button>


          {/* LOGOUT */}
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </section>


      {/* Statistics */}
      <section className="stats-grid">

        {/* TEACH SKILLS */}
        <div className="stat-card">

          <div className="stat-icon">
            🎓
          </div>

          <div>
            <h3>
              {user.teachSkills?.length || 0}
            </h3>

            <p>
              Skills to Teach
            </p>
          </div>

        </div>


        {/* LEARN SKILLS */}
        <div className="stat-card">

          <div className="stat-icon">
            📚
          </div>

          <div>
            <h3>
              {user.learnSkills?.length || 0}
            </h3>

            <p>
              Skills to Learn
            </p>
          </div>

        </div>


        {/* CONNECTIONS */}
        <div
          className="stat-card"
          style={{
            cursor: "pointer",
          }}
          onClick={() =>
            navigate("/connections")
          }
        >

          <div className="stat-icon">
            🤝
          </div>

          <div>
            <h3>
              {connectionCount}
            </h3>

            <p>
              Connections
            </p>
          </div>

        </div>

      </section>


      {/* Main Dashboard */}
      <section className="dashboard-grid">

        {/* TEACH SKILLS */}
        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <p className="card-tag">
                WHAT YOU OFFER
              </p>

              <h2>
                Skills You Can Teach
              </h2>

            </div>

            <span className="card-icon">
              🎓
            </span>

          </div>


          <div className="skills-list">

            {user.teachSkills?.length > 0 ? (

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

              <p>
                No teaching skills added yet.
              </p>

            )}

          </div>

        </div>


        {/* LEARN SKILLS */}
        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <p className="card-tag">
                YOUR GOALS
              </p>

              <h2>
                Skills You Want to Learn
              </h2>

            </div>

            <span className="card-icon">
              📚
            </span>

          </div>


          <div className="skills-list">

            {user.learnSkills?.length > 0 ? (

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

              <p>
                No learning skills added yet.
              </p>

            )}

          </div>

        </div>

      </section>


      {/* AI Match Section */}
      <section className="ai-match-card">

        <div>

          <p className="dashboard-tag">
            AI-POWERED RECOMMENDATIONS
          </p>

          <h2>
            Ready to Find Your Perfect Match?
          </h2>

          <p>
            Discover people who can teach you
            the skills you want to learn and learn
            from your expertise.
          </p>

        </div>


        <button
          className="find-match-btn"
          onClick={() =>
            navigate("/matches")
          }
        >
          Find Matches →
        </button>

      </section>

    </div>
  );
}

export default Dashboard;