import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveCustomCodingTest } from "../../data/codingTestsData";
import "./TestEditor.css";

function TestEditor({ onClose, onTestCreated }) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("DSA & Algorithms");
  const [difficulty, setDifficulty] = useState("Medium");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passingScore, setPassingScore] = useState(70);

  // Problems Array
  const [problems, setProblems] = useState([
    {
      id: "p1",
      title: "1. Reverse String in Place",
      difficulty: "Easy",
      points: 50,
      functionName: "reverseString",
      description: "Write a function that reverses an array of characters in-place without returning anything.",
      starterCode: `function reverseString(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    const temp = s[left];
    s[left] = s[right];
    s[right] = temp;
    left++;
    right--;
  }
  return s;
}`,
      testCases: [
        { input: [["h","e","l","l","o"]], expected: ["o","l","l","e","h"], isHidden: false },
        { input: [["H","a","n","n","a","h"]], expected: ["h","a","n","n","a","H"], isHidden: false },
        { input: [["a"]], expected: ["a"], isHidden: true }
      ]
    }
  ]);

  const [activeProblemIdx, setActiveProblemIdx] = useState(0);

  const addProblem = () => {
    const newIdx = problems.length + 1;
    const newProblem = {
      id: `p${Date.now()}`,
      title: `${newIdx}. New Coding Problem`,
      difficulty: "Easy",
      points: 50,
      functionName: `solution${newIdx}`,
      description: "Describe the problem statement, inputs, outputs, and constraints here...",
      starterCode: `function solution${newIdx}(input) {\n  // Write your solution here\n  return input;\n}`,
      testCases: [
        { input: ["sample_input"], expected: "sample_input", isHidden: false },
        { input: ["test_2"], expected: "test_2", isHidden: true }
      ]
    };
    setProblems([...problems, newProblem]);
    setActiveProblemIdx(problems.length);
  };

  const removeProblem = (index) => {
    if (problems.length <= 1) {
      alert("A test must contain at least one problem.");
      return;
    }
    const updated = problems.filter((_, idx) => idx !== index);
    setProblems(updated);
    setActiveProblemIdx(Math.max(0, index - 1));
  };

  const updateCurrentProblem = (field, value) => {
    setProblems(prev => {
      const updated = [...prev];
      updated[activeProblemIdx] = {
        ...updated[activeProblemIdx],
        [field]: value
      };
      return updated;
    });
  };

  const addTestCase = () => {
    setProblems(prev => {
      const updated = [...prev];
      const prob = updated[activeProblemIdx];
      prob.testCases = [
        ...prob.testCases,
        { input: [], expected: "", isHidden: false }
      ];
      return updated;
    });
  };

  const removeTestCase = (tcIdx) => {
    setProblems(prev => {
      const updated = [...prev];
      const prob = updated[activeProblemIdx];
      if (prob.testCases.length <= 1) {
        alert("Each problem needs at least 1 test case.");
        return updated;
      }
      prob.testCases = prob.testCases.filter((_, idx) => idx !== tcIdx);
      return updated;
    });
  };

  const updateTestCase = (tcIdx, field, val) => {
    setProblems(prev => {
      const updated = [...prev];
      const prob = updated[activeProblemIdx];
      const tcList = [...prob.testCases];

      if (field === "input" || field === "expected") {
        try {
          tcList[tcIdx][field] = JSON.parse(val);
        } catch {
          tcList[tcIdx][field] = val; // store raw if not strict JSON
        }
      } else {
        tcList[tcIdx][field] = val;
      }

      prob.testCases = tcList;
      return updated;
    });
  };

  const handleSaveTest = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide a title for your test.");
      return;
    }

    const testData = {
      title,
      description: description || "Custom timed coding assessment created by user.",
      category,
      difficulty,
      durationMinutes: Number(durationMinutes) || 30,
      passingScore: Number(passingScore) || 70,
      author: "Community Member",
      problems
    };

    const saved = saveCustomCodingTest(testData);
    if (saved) {
      if (onTestCreated) onTestCreated(saved);
      if (onClose) onClose();
      navigate(`/coding-test/${saved.id}`);
    }
  };

  const currentProb = problems[activeProblemIdx];

  return (
    <div className="test-editor-container">
      <div className="test-editor-header">
        <div>
          <span className="editor-tag">⚡ TEST CREATOR STUDIO</span>
          <h2>Create Time-Based Online Coding Test</h2>
          <p>Configure assessment duration, problems, boilerplates, and automated test cases.</p>
        </div>
        {onClose && (
          <button className="editor-close-btn" onClick={onClose}>✕</button>
        )}
      </div>

      <form onSubmit={handleSaveTest} className="test-editor-form">
        
        {/* General Settings Card */}
        <div className="editor-card">
          <h3>1. Test Configuration & Time Limit</h3>
          <div className="editor-grid-row">
            <div className="editor-form-group span-2">
              <label>Test Title *</label>
              <input
                type="text"
                placeholder="e.g. 30-Min Frontend JavaScript & DSA Challenge"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="editor-form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="DSA & Algorithms">DSA & Algorithms</option>
                <option value="Web Development">Web Development (JS/TS)</option>
                <option value="AI & Data Science">AI & Data Science (Python)</option>
                <option value="Full Stack Logic">Full Stack Logic</option>
                <option value="Coding Interview Prep">Coding Interview Prep</option>
              </select>
            </div>

            <div className="editor-form-group">
              <label>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div className="editor-form-group">
              <label>⏱️ Time Limit (Minutes) *</label>
              <input
                type="number"
                min="5"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
              />
              <span className="input-hint">Timer will auto-submit when expired</span>
            </div>

            <div className="editor-form-group">
              <label>🎯 Passing Cutoff (%)</label>
              <input
                type="number"
                min="10"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
              />
            </div>

            <div className="editor-form-group span-2">
              <label>Description / Instructions</label>
              <textarea
                rows="2"
                placeholder="Explain the objectives, rules, and guidelines for test takers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Problems Studio */}
        <div className="editor-card">
          <div className="problem-nav-header">
            <h3>2. Problems & Test Cases ({problems.length})</h3>
            <button type="button" className="add-problem-btn" onClick={addProblem}>
              + Add Another Problem
            </button>
          </div>

          {/* Problem Tabs */}
          <div className="problem-tabs-list">
            {problems.map((prob, pIdx) => (
              <button
                type="button"
                key={prob.id || pIdx}
                className={`problem-tab ${activeProblemIdx === pIdx ? "active" : ""}`}
                onClick={() => setActiveProblemIdx(pIdx)}
              >
                <span>Problem {pIdx + 1}</span>
                {problems.length > 1 && (
                  <span
                    className="tab-delete-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProblem(pIdx);
                    }}
                  >
                    ✕
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Active Problem Editor */}
          {currentProb && (
            <div className="active-problem-editor">
              <div className="editor-grid-row">
                <div className="editor-form-group span-2">
                  <label>Problem Title</label>
                  <input
                    type="text"
                    value={currentProb.title}
                    onChange={(e) => updateCurrentProblem("title", e.target.value)}
                    required
                  />
                </div>

                <div className="editor-form-group">
                  <label>Target Function Name</label>
                  <input
                    type="text"
                    value={currentProb.functionName}
                    onChange={(e) => updateCurrentProblem("functionName", e.target.value)}
                    placeholder="e.g. solveProblem"
                    required
                  />
                </div>

                <div className="editor-form-group">
                  <label>Points Allocated</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={currentProb.points}
                    onChange={(e) => updateCurrentProblem("points", Number(e.target.value))}
                  />
                </div>

                <div className="editor-form-group span-2">
                  <label>Problem Statement & Constraints</label>
                  <textarea
                    rows="4"
                    value={currentProb.description}
                    onChange={(e) => updateCurrentProblem("description", e.target.value)}
                    required
                  />
                </div>

                <div className="editor-form-group span-2">
                  <label>Starter Code Template</label>
                  <textarea
                    rows="6"
                    className="code-textarea"
                    value={currentProb.starterCode}
                    onChange={(e) => updateCurrentProblem("starterCode", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Test Cases List */}
              <div className="test-cases-builder">
                <div className="tc-header">
                  <h4>Automated Test Cases ({currentProb.testCases.length})</h4>
                  <button type="button" className="add-tc-btn" onClick={addTestCase}>
                    + Add Test Case
                  </button>
                </div>

                <div className="tc-list">
                  {currentProb.testCases.map((tc, tcIdx) => (
                    <div key={tcIdx} className="tc-item-row">
                      <span className="tc-badge">#{tcIdx + 1}</span>
                      
                      <div className="tc-field">
                        <label>Input (Array of args in JSON format)</label>
                        <input
                          type="text"
                          defaultValue={JSON.stringify(tc.input)}
                          onBlur={(e) => updateTestCase(tcIdx, "input", e.target.value)}
                          placeholder="e.g. [[2, 7, 11, 15], 9]"
                        />
                      </div>

                      <div className="tc-field">
                        <label>Expected Output (JSON)</label>
                        <input
                          type="text"
                          defaultValue={JSON.stringify(tc.expected)}
                          onBlur={(e) => updateTestCase(tcIdx, "expected", e.target.value)}
                          placeholder="e.g. [0, 1] or true"
                        />
                      </div>

                      <label className="tc-hidden-toggle">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={(e) => updateTestCase(tcIdx, "isHidden", e.target.checked)}
                        />
                        <span>Hidden Case</span>
                      </label>

                      <button
                        type="button"
                        className="tc-delete-btn"
                        onClick={() => removeTestCase(tcIdx)}
                        title="Delete test case"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Action Controls */}
        <div className="editor-footer-actions">
          {onClose && (
            <button type="button" className="editor-btn-cancel" onClick={onClose}>
              Cancel
            </button>
          )}
          <button type="submit" className="editor-btn-save">
            🚀 Publish & Start Timed Assessment
          </button>
        </div>

      </form>
    </div>
  );
}

export default TestEditor;
