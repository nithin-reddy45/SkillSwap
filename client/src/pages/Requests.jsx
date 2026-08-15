import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { API_BASE_URL } from "../config/api";
import "./Requests.css";

function Requests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingRequest, setUpdatingRequest] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // ==========================================
  // FETCH INCOMING REQUESTS
  // ==========================================
  useEffect(() => {
    let isMounted = true;

    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/connections/requests`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!isMounted) return;

        if (!response.ok) {
          setError(
            data.message || "Failed to fetch requests"
          );
          return;
        }

        setRequests(
          Array.isArray(data) ? data : []
        );

        setError("");

      } catch (error) {
        console.error("Requests Error:", error);

        if (isMounted) {
          setError(
            "Unable to connect to the server"
          );
        }

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRequests();

    return () => {
      isMounted = false;
    };
  }, [navigate]);


  // ==========================================
  // CONNECT SOCKET
  // ==========================================
  useEffect(() => {
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }
  }, []);


  // ==========================================
  // REAL-TIME NEW CONNECTION REQUEST
  // ==========================================
  useEffect(() => {
    if (!socket) return;

    const handleNewConnectionRequest = (data) => {
      const newRequest = data?.connection;

      if (!newRequest) return;

      setRequests((prevRequests) => {
        const alreadyExists = prevRequests.some(
          (request) =>
            request._id === newRequest._id
        );

        if (alreadyExists) {
          return prevRequests;
        }

        return [
          newRequest,
          ...prevRequests,
        ];
      });

      setError("");
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


  // ==========================================
  // ACCEPT OR REJECT REQUEST
  // ==========================================
  const handleRequest = async (
    connectionId,
    status
  ) => {
    try {
      setUpdatingRequest(connectionId);
      setSuccessMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/connections/${connectionId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Failed to update request"
        );
        return;
      }

      setSuccessMessage(
        status === "accepted"
          ? "Connection accepted successfully! 🎉"
          : "Connection request rejected."
      );

      // Remove handled request
      setRequests((prevRequests) =>
        prevRequests.filter(
          (request) =>
            request._id !== connectionId
        )
      );

      // Update Navbar notification count
      window.dispatchEvent(
        new Event("requestUpdated")
      );

    } catch (error) {
      console.error(
        "Update Request Error:",
        error
      );

      alert(
        "Unable to connect to the server"
      );

    } finally {
      setUpdatingRequest(null);
    }
  };


  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="requests-page">
        <h1>
          Loading connection requests... 🤝
        </h1>
      </div>
    );
  }


  return (
    <div className="requests-page">

      {/* HEADER */}
      <div className="requests-header">

        <p className="requests-tag">
          CONNECTION REQUESTS
        </p>

        <h1>
          Incoming Skill Swap Requests 🤝

          {requests.length > 0 && (
            <span className="request-count-badge">
              {requests.length > 99
                ? "99+"
                : requests.length}
            </span>
          )}
        </h1>

        <p>
          Review requests from people who want
          to connect and exchange skills with you.
        </p>

      </div>


      {/* ERROR MESSAGE */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}


      {/* NO REQUESTS */}
      {!error &&
        requests.length === 0 && (
          <div className="no-requests">

            <h2>
              No pending requests
            </h2>

            <p>
              You don't have any incoming
              connection requests yet.
            </p>

          </div>
        )}


      {/* REQUESTS GRID */}
      <div className="requests-grid">

        {requests.map((request) => {
          const sender = request.sender;

          if (!sender) return null;

          const isUpdating =
            updatingRequest === request._id;

          return (
            <div
              className="request-card"
              key={request._id}
            >

              {/* USER INFORMATION */}
              <div className="request-user">

                <div className="request-avatar">
                  {sender.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

                <div>
                  <h2>
                    {sender.name ||
                      "Unknown User"}
                  </h2>

                  <p>
                    {sender.email || ""}
                  </p>
                </div>

              </div>


              {/* CAN TEACH */}
              <div className="request-skills">

                <h3>
                  🎓 Can Teach
                </h3>

                <div className="skill-tags">

                  {Array.isArray(
                    sender.teachSkills
                  ) &&
                  sender.teachSkills.length > 0 ? (

                    sender.teachSkills.map(
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
              <div className="request-skills">

                <h3>
                  📚 Wants to Learn
                </h3>

                <div className="skill-tags">

                  {Array.isArray(
                    sender.learnSkills
                  ) &&
                  sender.learnSkills.length > 0 ? (

                    sender.learnSkills.map(
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


              {/* ACTION BUTTONS */}
              <div className="request-actions">

                <button
                  className="accept-btn"
                  onClick={() =>
                    handleRequest(
                      request._id,
                      "accepted"
                    )
                  }
                  disabled={isUpdating}
                >
                  {isUpdating
                    ? "Updating..."
                    : "✓ Accept"}
                </button>

                <button
                  className="reject-btn"
                  onClick={() =>
                    handleRequest(
                      request._id,
                      "rejected"
                    )
                  }
                  disabled={isUpdating}
                >
                  {isUpdating
                    ? "Updating..."
                    : "✕ Reject"}
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Requests;