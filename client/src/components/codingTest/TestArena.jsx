import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { runProblemTestCasesAsync } from "../../utils/codeRunner";
import {
  saveTestResult,
  SUPPORTED_LANGUAGES,
  getStarterCodeForLanguage
} from "../../data/codingTestsData";
import TestResultsModal from "./TestResultsModal";
import "./TestArena.css";

function TestArena({ test, onExit }) {
  const navigate = useNavigate();

  // Test Time Management
  const initialSeconds = (test.durationMinutes || 30) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Selected Language State
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  // Active Problem State
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const currentProblem = test.problems[activeProblemIdx] || test.problems[0];

  // User Code Solution Map: { [problemId]: { [langId]: code } }
  const [userSolutions, setUserSolutions] = useState(() => {
    const map = {};
    test.problems.forEach(p => {
      map[p.id] = {};
      SUPPORTED_LANGUAGES.forEach(lang => {
        map[p.id][lang.id] = getStarterCodeForLanguage(p, lang.id);
      });
    });
    return map;
  });

  // Test Execution State per problem
  const [runOutputs, setRunOutputs] = useState({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState("testcases");

  // Final Results Modal State
  const [finalResult, setFinalResult] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const timerRef = useRef(null);

  // COUNTDOWN TIMER EFFECT
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Format Timer Display
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(mins)}:${pad(remainingSecs)}`;
  };

  // Get current active code for the selected problem and language
  const currentCode = userSolutions[currentProblem.id]?.[selectedLanguage] || getStarterCodeForLanguage(currentProblem, selectedLanguage);

  // Handle Code Change
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setUserSolutions(prev => ({
      ...prev,
      [currentProblem.id]: {
        ...prev[currentProblem.id],
        [selectedLanguage]: newCode
      }
    }));
  };

  // Reset Code to Starter
  const handleResetCode = () => {
    const langObj = SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage);
    if (window.confirm(`Reset code to default ${langObj?.name || selectedLanguage} template?`)) {
      setUserSolutions(prev => ({
        ...prev,
        [currentProblem.id]: {
          ...prev[currentProblem.id],
          [selectedLanguage]: getStarterCodeForLanguage(currentProblem, selectedLanguage)
        }
      }));
    }
  };

  // RUN SAMPLE TEST CASES (VISIBLE ONLY)
  const handleRunSampleTests = async () => {
    setIsExecuting(true);
    try {
      const code = currentCode;
      const result = await runProblemTestCasesAsync(currentProblem, code, false, selectedLanguage);
      setRunOutputs(prev => ({
        ...prev,
        [currentProblem.id]: result
      }));
      setActiveConsoleTab("testcases");
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  // FINAL SUBMIT (EVALUATES ALL PROBLEMS WITH HIDDEN CASES)
  const handleFinalSubmit = async (autoExpired = false) => {
    if (!autoExpired && !window.confirm("Are you sure you want to submit your entire test?")) {
      return;
    }

    clearInterval(timerRef.current);
    setIsSubmitted(true);
    setIsExecuting(true);

    let totalEarnedScore = 0;
    let totalMaxScore = 0;
    const problemSummaries = [];

    for (const prob of test.problems) {
      const code = userSolutions[prob.id]?.[selectedLanguage] || getStarterCodeForLanguage(prob, selectedLanguage);
      const evalResult = await runProblemTestCasesAsync(prob, code, true, selectedLanguage);
      totalEarnedScore += evalResult.earnedPoints;
      totalMaxScore += evalResult.maxPoints;

      problemSummaries.push({
        problemId: prob.id,
        problemTitle: prob.title,
        difficulty: prob.difficulty,
        earnedPoints: evalResult.earnedPoints,
        maxPoints: evalResult.maxPoints,
        passedCount: evalResult.passedCount,
        totalCount: evalResult.totalCount,
        allPassed: evalResult.allPassed,
        testCaseResults: evalResult.testCaseResults
      });
    }

    setIsExecuting(false);

    const timeSpentSeconds = initialSeconds - secondsRemaining;
    const scorePercentage = totalMaxScore > 0 ? Math.round((totalEarnedScore / totalMaxScore) * 100) : 0;
    const isPassed = scorePercentage >= (test.passingScore || 70);

    const resultPayload = {
      testId: test.id,
      testTitle: test.title,
      category: test.category,
      difficulty: test.difficulty,
      language: selectedLanguage,
      totalEarnedScore,
      totalMaxScore,
      scorePercentage,
      isPassed,
      passingScore: test.passingScore || 70,
      timeSpentSeconds,
      timeSpentFormatted: formatTime(timeSpentSeconds),
      allocatedMinutes: test.durationMinutes || 30,
      autoExpired,
      problemSummaries
    };

    saveTestResult(resultPayload);
    setFinalResult(resultPayload);
  };

  // AUTO-SUBMIT ON TIME EXPIRY
  useEffect(() => {
    if (isTimeUp && !isSubmitted) {
      handleFinalSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimeUp, isSubmitted]);

  const currentOutput = runOutputs[currentProblem.id];
  const isTimeCritical = secondsRemaining <= 180;

  return (
    <div className="test-arena-wrapper">
      
      {/* ARENA HEADER WITH TIMER */}
      <header className="arena-header">
        <div className="arena-header-left">
          <button className="arena-exit-btn" onClick={onExit} title="Exit Assessment">
            ← Exit Test
          </button>
          <div>
            <span className="arena-test-badge">{test.category}</span>
            <h1 className="arena-test-title">{test.title}</h1>
          </div>
        </div>

        {/* TIMER BAR */}
        <div className="arena-header-right">
          <div className={`arena-timer-box ${isTimeCritical ? "timer-warning" : ""}`}>
            <span className="timer-icon">⏱️</span>
            <div>
              <span className="timer-label">TIME REMAINING</span>
              <strong className="timer-clock">{formatTime(secondsRemaining)}</strong>
            </div>
          </div>

          <button
            className="arena-submit-all-btn"
            onClick={() => handleFinalSubmit(false)}
            disabled={isExecuting}
          >
            {isExecuting ? "⚡ Submitting..." : "🚀 Submit Test"}
          </button>
        </div>
      </header>

      {/* PROBLEMS NAVIGATION TABS */}
      <nav className="arena-problem-tabs">
        {test.problems.map((prob, idx) => {
          const out = runOutputs[prob.id];
          const hasPassed = out?.allPassed;
          const hasAttempted = (userSolutions[prob.id]?.[selectedLanguage] || "").trim() !== (getStarterCodeForLanguage(prob, selectedLanguage) || "").trim();

          return (
            <button
              key={prob.id || idx}
              className={`arena-prob-tab ${activeProblemIdx === idx ? "active" : ""}`}
              onClick={() => setActiveProblemIdx(idx)}
            >
              <span className="tab-idx">Problem {idx + 1}</span>
              <span className="tab-diff">{prob.difficulty}</span>
              {hasPassed ? (
                <span className="tab-status-icon passed">✅</span>
              ) : hasAttempted ? (
                <span className="tab-status-icon attempted">🟡</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* TWO COLUMN SPLIT ARENA */}
      <main className="arena-body-grid">
        
        {/* LEFT COLUMN: PROBLEM DESCRIPTION */}
        <div className="arena-left-pane">
          <div className="problem-info-header">
            <div className="problem-title-row">
              <h2>{currentProblem.title}</h2>
              <span className={`diff-pill diff-${currentProblem.difficulty?.toLowerCase()}`}>
                {currentProblem.difficulty}
              </span>
              <span className="points-pill">{currentProblem.points || 50} pts</span>
            </div>
          </div>

          <div className="problem-description-content">
            <p className="problem-text">{currentProblem.description}</p>

            {/* Examples */}
            {currentProblem.examples && currentProblem.examples.length > 0 && (
              <div className="problem-examples-section">
                <h3>Examples:</h3>
                {currentProblem.examples.map((ex, exIdx) => (
                  <div key={exIdx} className="example-box">
                    <p><strong>Input:</strong> <code>{ex.input}</code></p>
                    <p><strong>Output:</strong> <code>{ex.output}</code></p>
                    {ex.explanation && (
                      <p className="example-explanation"><strong>Explanation:</strong> {ex.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {currentProblem.constraints && currentProblem.constraints.length > 0 && (
              <div className="problem-constraints-section">
                <h3>Constraints:</h3>
                <ul>
                  {currentProblem.constraints.map((c, cIdx) => (
                    <li key={cIdx}><code>{c}</code></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CODE EDITOR & CONSOLE */}
        <div className="arena-right-pane">
          
          {/* Editor Action Bar with Multi-Language Selector */}
          <div className="editor-action-bar">
            <div className="editor-lang-selector-group">
              <span className="lang-select-label">Language:</span>
              <select
                className="arena-language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {lang.icon} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="editor-btn-group">
              <button className="editor-tool-btn" onClick={handleResetCode} title="Reset code">
                ↺ Reset
              </button>
              <button
                className="editor-run-btn"
                onClick={handleRunSampleTests}
                disabled={isExecuting}
              >
                {isExecuting ? "⚡ Running..." : "▶ Run Sample Tests"}
              </button>
            </div>
          </div>

          {/* Code Textarea / IDE */}
          <div className="editor-wrapper">
            <textarea
              className="arena-code-editor"
              value={currentCode}
              onChange={handleCodeChange}
              placeholder="// Write your code here..."
              spellCheck="false"
            />
          </div>

          {/* Bottom Console & Test Case Results Pane */}
          <div className="arena-console-pane">
            <div className="console-tabs-row">
              <button
                className={`console-tab ${activeConsoleTab === "testcases" ? "active" : ""}`}
                onClick={() => setActiveConsoleTab("testcases")}
              >
                Test Cases Result
                {currentOutput && (
                  <span className={`console-pass-badge ${currentOutput.allPassed ? "all-pass" : "partial"}`}>
                    {currentOutput.passedCount}/{currentOutput.totalCount} Passed
                  </span>
                )}
              </button>
            </div>

            <div className="console-content">
              {currentOutput ? (
                <div className="testcase-results-list">
                  {currentOutput.testCaseResults.map((tcRes, tIdx) => (
                    <div
                      key={tIdx}
                      className={`testcase-card ${tcRes.passed ? "passed" : "failed"}`}
                    >
                      <div className="tc-card-header">
                        <span className="tc-num">Case {tcRes.testCaseIndex}:</span>
                        <span className={`tc-status ${tcRes.passed ? "pass" : "fail"}`}>
                          {tcRes.passed ? "✓ Passed" : "✗ Failed"}
                        </span>
                        <span className="tc-time">⏱️ {tcRes.executionTimeMs} ms</span>
                      </div>

                      <div className="tc-card-details">
                        <div>
                          <span className="tc-label">Input:</span>
                          <code>{JSON.stringify(tcRes.input)}</code>
                        </div>
                        <div>
                          <span className="tc-label">Expected:</span>
                          <code>{JSON.stringify(tcRes.expected)}</code>
                        </div>
                        <div>
                          <span className="tc-label">Actual:</span>
                          <code>{tcRes.actual !== undefined ? JSON.stringify(tcRes.actual) : (tcRes.error || "undefined")}</code>
                        </div>
                        {tcRes.logs && tcRes.logs.length > 0 && (
                          <div className="tc-logs">
                            <span className="tc-label">Console Output:</span>
                            <pre>{tcRes.logs.join('\n')}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="console-placeholder">
                  <p>Click <strong>"▶ Run Sample Tests"</strong> to verify your code in <strong>{SUPPORTED_LANGUAGES.find(l=>l.id===selectedLanguage)?.name}</strong>.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* FINAL RESULTS MODAL */}
      <TestResultsModal
        result={finalResult}
        isOpen={!!finalResult}
        onClose={() => {
          setFinalResult(null);
          if (onExit) onExit();
          navigate("/coding-test");
        }}
      />

    </div>
  );
}

export default TestArena;
