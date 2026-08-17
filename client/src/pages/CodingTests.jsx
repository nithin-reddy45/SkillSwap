import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAllCodingTests,
  getCodingTestById,
  getTestHistory,
  deleteCustomCodingTest
} from "../data/codingTestsData";
import TestEditor from "../components/codingTest/TestEditor";
import TestArena from "../components/codingTest/TestArena";
import CodePlayground from "../components/codingTest/CodePlayground";
import "./CodingTests.css";

function CodingTests() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [testsList, setTestsList] = useState(() => getAllCodingTests());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("all-tests"); // all-tests, playground, or history

  // If a testId is in the URL, load it directly into activeTest
  const activeTest = useMemo(() => {
    if (!testId) return null;
    return getCodingTestById(testId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, testsList]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const history = useMemo(() => getTestHistory(), [activeTab, activeTest]);

  const refreshTests = () => {
    setTestsList(getAllCodingTests());
  };

  const handleStartTest = (id) => {
    navigate(`/coding-test/${id}`);
  };

  const handleExitArena = () => {
    navigate("/coding-test");
    refreshTests();
  };

  const handleDeleteTest = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this custom test?")) {
      deleteCustomCodingTest(id);
      refreshTests();
    }
  };

  // If currently taking a test
  if (activeTest) {
    return <TestArena test={activeTest} onExit={handleExitArena} />;
  }

  // Filtered Tests
  const filteredTests = testsList.filter(t => {
    if (selectedCategory !== "All" && t.category !== selectedCategory) return false;
    if (selectedDifficulty !== "All" && t.difficulty !== selectedDifficulty) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="coding-tests-page">
      
      {/* HERO BANNER */}
      <section className="coding-tests-hero">
        <div className="hero-inner">
          <span className="hero-tag">⚡ TIME-BASED ONLINE CODING ARENA</span>
          <h1>
            Practice, Create & Compete in <span>Timed Coding Tests</span>
          </h1>
          <p className="hero-subtitle">
            Sharpen your problem-solving speed under real-time countdown pressure with support for <strong>JavaScript, Python 3, Java, C++, TypeScript, Go, Rust, and C#</strong>.
          </p>

          <div className="hero-cta-row">
            <button
              className="create-test-hero-btn"
              onClick={() => setIsCreating(true)}
            >
              + Create New Timed Coding Test
            </button>
            <button
              className="playground-hero-btn"
              onClick={() => setActiveTab("playground")}
            >
              💻 Open Multi-Language Compiler
            </button>
          </div>
        </div>
      </section>

      {/* MODAL: TEST CREATOR */}
      {isCreating && (
        <div className="modal-backdrop-blur">
          <TestEditor
            onClose={() => setIsCreating(false)}
            onTestCreated={() => {
              setIsCreating(false);
              refreshTests();
            }}
          />
        </div>
      )}

      {/* MAIN CONTENT CONTAINER */}
      <main className="coding-tests-main">
        
        {/* Navigation Tabs */}
        <div className="hub-tabs-row">
          <div className="hub-tabs">
            <button
              className={`hub-tab-btn ${activeTab === "all-tests" ? "active" : ""}`}
              onClick={() => setActiveTab("all-tests")}
            >
              💻 Available Coding Tests ({testsList.length})
            </button>
            <button
              className={`hub-tab-btn ${activeTab === "playground" ? "active" : ""}`}
              onClick={() => setActiveTab("playground")}
            >
              ⚡ Multi-Language Compiler & IDE
            </button>
            <button
              className={`hub-tab-btn ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              📊 Attempt History ({history.length})
            </button>
          </div>

          {activeTab === "all-tests" && (
            <button className="create-test-mini-btn" onClick={() => setIsCreating(true)}>
              + Create Test
            </button>
          )}
        </div>

        {/* TAB 1: ALL AVAILABLE TESTS */}
        {activeTab === "all-tests" && (
          <>
            {/* Filter Bar */}
            <div className="tests-filter-bar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search coding tests by title, skill, or algorithm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-selects">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="DSA & Algorithms">DSA & Algorithms</option>
                  <option value="Web Development">Web Development</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Full Stack Logic">Full Stack Logic</option>
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Test Cards Grid */}
            <div className="tests-grid">
              {filteredTests.map((test) => (
                <div key={test.id} className="test-card">
                  
                  <div className="test-card-header">
                    <div className="test-card-icon">{test.icon || "💻"}</div>
                    <div className="test-card-badges">
                      <span className="test-badge-cat">{test.category}</span>
                      <span className={`test-badge-diff diff-${test.difficulty?.toLowerCase()}`}>
                        {test.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="test-card-body">
                    <h3>{test.title}</h3>
                    <p className="test-card-desc">{test.description}</p>

                    <div className="test-meta-stats">
                      <span title="Time Limit">⏱️ <strong>{test.durationMinutes} mins</strong></span>
                      <span title="Problems">🧩 <strong>{test.problems?.length || 1} Problems</strong></span>
                      <span title="Passing score">🎯 Cutoff: <strong>{test.passingScore || 70}%</strong></span>
                    </div>

                    <div className="test-supported-langs-pill">
                      <span>Languages:</span>
                      <span className="mini-lang-tag">🟨 JS</span>
                      <span className="mini-lang-tag">🐍 Py</span>
                      <span className="mini-lang-tag">☕ Java</span>
                      <span className="mini-lang-tag">⚡ C++</span>
                      <span className="mini-lang-tag">+4 more</span>
                    </div>
                  </div>

                  <div className="test-card-footer">
                    {!test.isOfficial && (
                      <button
                        className="test-delete-icon-btn"
                        onClick={(e) => handleDeleteTest(e, test.id)}
                        title="Delete custom test"
                      >
                        🗑️
                      </button>
                    )}

                    <button
                      className="test-start-btn"
                      onClick={() => handleStartTest(test.id)}
                    >
                      ▶ Start Timed Test
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </>
        )}

        {/* TAB 2: MULTI-LANGUAGE ONLINE COMPILER & PLAYGROUND */}
        {activeTab === "playground" && (
          <CodePlayground />
        )}

        {/* TAB 3: ATTEMPT HISTORY */}
        {activeTab === "history" && (
          <div className="history-container">
            {history.length > 0 ? (
              <div className="history-table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Test Title</th>
                      <th>Category</th>
                      <th>Language</th>
                      <th>Score</th>
                      <th>Accuracy</th>
                      <th>Time Spent</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, idx) => (
                      <tr key={idx}>
                        <td><strong>{h.testTitle}</strong></td>
                        <td>{h.category}</td>
                        <td><span className="table-lang-tag">{h.language || "javascript"}</span></td>
                        <td>{h.totalEarnedScore} / {h.totalMaxScore}</td>
                        <td><strong>{h.scorePercentage}%</strong></td>
                        <td>{h.timeSpentFormatted}</td>
                        <td>
                          <span className={`status-pill ${h.isPassed ? "pass" : "fail"}`}>
                            {h.isPassed ? "Passed 🎉" : "Failed ⚠️"}
                          </span>
                        </td>
                        <td>{new Date(h.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="history-empty">
                <p>No coding tests attempted yet. Start a test above to record your score!</p>
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
}

export default CodingTests;
