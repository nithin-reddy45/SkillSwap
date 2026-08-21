import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "users" | "reports" | "swaps"
  
  const [statsData, setStatsData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [swapsList, setSwapsList] = useState([]);
  
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load admin stats");
      const data = await res.json();
      setStatsData(data);
    } catch (err) {
      console.error(err);
      setError("Admin access restricted or server error.");
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users?q=${encodeURIComponent(userSearch)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setUsersList(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Reports
  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setReportsList(data.reports || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Swaps
  const fetchSwaps = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/swaps`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setSwapsList(data.swaps || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchStats();
      await fetchUsers();
      await fetchReports();
      await fetchSwaps();
      setLoading(false);
    };
    init();
  }, [token]);

  // Handle Toggle User Role
  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        alert(`User role updated to ${newRole}!`);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user and all their records?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("User deleted successfully.");
        fetchUsers();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Update Report Status
  const handleReportStatus = async (reportId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reports/${reportId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchReports();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-loading">
            <h2>🛡️ Loading Admin Control Center...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-error-box">
            <h2>🔒 Access Denied</h2>
            <p>You need administrator privileges to access this control panel.</p>
            <button className="admin-back-btn" onClick={() => navigate("/dashboard")}>
              ← Back to User Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = statsData?.stats || {};
  const growth = statsData?.growthData || [];
  const topTeach = statsData?.popularTeachSkills || [];
  const topLearn = statsData?.popularLearnSkills || [];

  return (
    <div className="admin-page">
      <div className="admin-container">
        
        {/* HEADER */}
        <header className="admin-header">
          <div className="admin-title-row">
            <span className="admin-shield-icon">🛡️</span>
            <div>
              <h1>SkillSwap AI <span className="gradient-text">Admin Panel</span></h1>
              <p>Platform ecosystem analytics, user moderation, reports, and swap oversight.</p>
            </div>
          </div>
        </header>

        {/* TABS */}
        <div className="admin-nav-tabs">
          <button
            className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Analytics & Growth
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            👥 User Management ({usersList.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            🚩 Reports & Moderation {stats.pendingReports > 0 && <span className="badge-alert">{stats.pendingReports}</span>}
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "swaps" ? "active" : ""}`}
            onClick={() => setActiveTab("swaps")}
          >
            🤝 Swaps Log ({swapsList.length})
          </button>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="admin-overview-section">
            
            {/* STATS KPI CARDS */}
            <div className="admin-kpi-grid">
              <div className="kpi-card">
                <span className="kpi-icon">👥</span>
                <div>
                  <h3>{stats.totalUsers || 0}</h3>
                  <p>Total Registered Users</p>
                </div>
              </div>

              <div className="kpi-card">
                <span className="kpi-icon">⚡</span>
                <div>
                  <h3>{stats.activeSwaps || 0}</h3>
                  <p>Active Skill Swaps</p>
                </div>
              </div>

              <div className="kpi-card">
                <span className="kpi-icon">✅</span>
                <div>
                  <h3>{stats.completedSwaps || 0}</h3>
                  <p>Completed Swaps</p>
                </div>
              </div>

              <div className="kpi-card">
                <span className="kpi-icon">📅</span>
                <div>
                  <h3>{stats.totalSessions || 0}</h3>
                  <p>Total Live Sessions</p>
                </div>
              </div>

              <div className="kpi-card">
                <span className="kpi-icon">⭐</span>
                <div>
                  <h3>{stats.totalReviews || 0}</h3>
                  <p>Member Reviews</p>
                </div>
              </div>

              <div className="kpi-card highlight-danger">
                <span className="kpi-icon">🚩</span>
                <div>
                  <h3>{stats.pendingReports || 0}</h3>
                  <p>Pending Reports</p>
                </div>
              </div>
            </div>

            {/* CHARTS & POPULAR SKILLS */}
            <div className="admin-visuals-grid">
              
              {/* GROWTH CHART */}
              <div className="admin-chart-box">
                <h3>📈 User Signups Growth (Past 7 Days)</h3>
                <div className="bar-chart-container">
                  {growth.map((g, idx) => {
                    const maxVal = Math.max(...growth.map((item) => item.users), 5);
                    const heightPercent = Math.max(15, (g.users / maxVal) * 100);
                    return (
                      <div key={idx} className="bar-item-wrap">
                        <div className="bar-val-lbl">{g.users}</div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ height: `${heightPercent}%` }} />
                        </div>
                        <span className="bar-date-lbl">{g.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* POPULAR SKILLS */}
              <div className="admin-skills-ranking-box">
                <h3>🔥 Most Popular Skills</h3>
                <div className="skills-rankings-split">
                  
                  <div className="ranking-col">
                    <h4>🎓 Most Taught</h4>
                    <div className="rank-list">
                      {topTeach.map((item, idx) => (
                        <div key={idx} className="rank-item">
                          <span className="rank-num">#{idx + 1}</span>
                          <span className="rank-name">{item.skill}</span>
                          <span className="rank-count">{item.count} mentors</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ranking-col">
                    <h4>📚 Most Requested</h4>
                    <div className="rank-list">
                      {topLearn.map((item, idx) => (
                        <div key={idx} className="rank-item learn">
                          <span className="rank-num">#{idx + 1}</span>
                          <span className="rank-name">{item.skill}</span>
                          <span className="rank-count">{item.count} learners</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. USERS TAB */}
        {activeTab === "users" && (
          <div className="admin-users-section">
            
            <div className="users-search-row">
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
              />
              <button className="search-btn" onClick={fetchUsers}>
                🔍 Search
              </button>
            </div>

            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Skills Teach</th>
                    <th>Skills Learn</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-mini">{u.name?.charAt(0) || "U"}</div>
                          <div>
                            <strong>{u.name}</strong>
                            <span>{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role ? u.role.toUpperCase() : "USER"}
                        </span>
                      </td>
                      <td>{u.teachSkills?.length || 0}</td>
                      <td>{u.learnSkills?.length || 0}</td>
                      <td>⭐ {(u.avgRating || 5.0).toFixed(1)}</td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="role-toggle-btn"
                            onClick={() => handleToggleRole(u._id, u.role)}
                            title="Toggle Admin / User role"
                          >
                            {u.role === "admin" ? "Demote" : "Make Admin"}
                          </button>
                          <button
                            className="delete-user-btn"
                            onClick={() => handleDeleteUser(u._id)}
                            title="Delete User"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 3. REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="admin-reports-section">
            {reportsList.length === 0 ? (
              <div className="empty-reports-card">
                <span className="empty-icon">✅</span>
                <h3>No Reports Found</h3>
                <p>All clear! There are currently no unresolved user violation reports.</p>
              </div>
            ) : (
              <div className="reports-grid">
                {reportsList.map((rep) => (
                  <div key={rep._id} className="report-card">
                    <div className="report-header">
                      <span className="reason-badge">🚩 {rep.reason}</span>
                      <span className={`report-status ${rep.status}`}>{rep.status.toUpperCase()}</span>
                    </div>

                    <div className="report-parties">
                      <div>
                        <span className="lbl">Reporter:</span>
                        <strong>{rep.reporter?.name || "Anonymous"}</strong>
                      </div>
                      <div>
                        <span className="lbl">Reported User:</span>
                        <strong>{rep.reportedUser?.name || "Unknown"}</strong>
                      </div>
                    </div>

                    <p className="report-details-txt">"{rep.details || "No details provided"}"</p>

                    <div className="report-actions-row">
                      {rep.status === "pending" && (
                        <>
                          <button
                            className="resolve-btn"
                            onClick={() => handleReportStatus(rep._id, "resolved")}
                          >
                            ✓ Mark Resolved
                          </button>
                          <button
                            className="dismiss-btn"
                            onClick={() => handleReportStatus(rep._id, "dismissed")}
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                      {rep.status !== "pending" && (
                        <button
                          className="reopen-btn"
                          onClick={() => handleReportStatus(rep._id, "pending")}
                        >
                          Reopen Report
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. SWAPS TAB */}
        {activeTab === "swaps" && (
          <div className="admin-swaps-section">
            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Skill Exchange</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {swapsList.map((s) => (
                    <tr key={s._id}>
                      <td><strong>{s.sender?.name}</strong></td>
                      <td><strong>{s.receiver?.name}</strong></td>
                      <td>
                        <span className="swap-desc-pill">
                          {s.teachSkill || "Skills"} ⇄ {s.learnSkill || "Knowledge"}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${s.status}`}>
                          {s.status?.toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
