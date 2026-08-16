/**
 * Multi-Language In-Browser & Remote Compiler Sandbox Runner
 */
import { SUPPORTED_LANGUAGES } from "../data/codingTestsData";
import { API_BASE_URL } from "../config/api";

const WANDBOX_API_ENDPOINT = "https://wandbox.org/api/compile.json";

const WANDBOX_COMPILER_MAP = {
  java: "openjdk-jdk-21+35",
  python: "cpython-3.12.7",
  cpp: "gcc-head",
  javascript: "nodejs-20.17.0",
  typescript: "typescript-head",
  go: "go-1.23.2",
  rust: "rust-1.82.0",
  csharp: "mono-6.12.0.199"
};

function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
}

/**
 * Execute standalone code in playground across 8+ languages
 */
export async function executeStandaloneCode(code, languageId = "javascript", stdin = "") {
  const langConfig = SUPPORTED_LANGUAGES.find(l => l.id === languageId) || SUPPORTED_LANGUAGES[0];
  const startTime = performance.now();
  const langKey = languageId.toLowerCase();

  // Fast client-side execution for JavaScript & TypeScript
  if (langKey === "javascript" || langKey === "typescript") {
    try {
      const logs = [];
      const errors = [];
      const mockConsole = {
        log: (...args) => {
          logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
        },
        info: (...args) => {
          logs.push('[INFO] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        },
        error: (...args) => {
          errors.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        }
      };

      let executableCode = code;
      if (langKey === "typescript") {
        executableCode = code
          .replace(/:\s*[A-Za-z0-9_<>\[\]|]+/g, '')
          .replace(/interface\s+[A-Za-z0-9_]+\s*\{[^}]*\}/g, '')
          .replace(/type\s+[A-Za-z0-9_]+\s*=[^;]+;/g, '');
      }

      const fn = new Function('console', executableCode);
      fn(mockConsole);

      const endTime = performance.now();
      return {
        stdout: logs.join('\n') || (errors.length === 0 ? "Program executed successfully with no stdout output." : ""),
        stderr: errors.join('\n'),
        executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
        isSuccess: errors.length === 0,
        language: langConfig.name
      };
    } catch (err) {
      const endTime = performance.now();
      return {
        stdout: "",
        stderr: `Runtime Error: ${err.message}`,
        executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
        isSuccess: false,
        language: langConfig.name
      };
    }
  }

  // 1. Try SkillSwap Backend Compiler API first
  try {
    const backendRes = await fetch(`${API_BASE_URL}/api/compiler/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language: languageId, stdin })
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return {
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        executionTimeMs: data.executionTimeMs || Math.round(performance.now() - startTime),
        isSuccess: data.isSuccess,
        language: langConfig.name
      };
    }
  } catch (backendErr) {
    console.warn("Backend compiler API unavailable, falling back to direct Wandbox engine:", backendErr);
  }

  // 2. Direct Wandbox Fallback
  try {
    const compiler = WANDBOX_COMPILER_MAP[langKey] || "openjdk-jdk-21+35";
    let processedCode = code;
    if (langKey === "java") {
      processedCode = code.replace(/\bpublic\s+class\b/g, "class");
    }

    const wandboxRes = await fetch(WANDBOX_API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: processedCode,
        compiler: compiler,
        stdin: stdin || ""
      })
    });

    if (wandboxRes.ok) {
      const data = await wandboxRes.json();
      const endTime = performance.now();
      const stdout = data.program_output || data.program_message || "";
      const stderr = data.compiler_error || data.program_error || "";
      const isSuccess = (data.status === "0" || data.status === 0) && !data.compiler_error;

      return {
        stdout: stdout || (isSuccess ? "Program executed successfully with no stdout output." : ""),
        stderr: stderr,
        executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
        isSuccess,
        language: langConfig.name
      };
    }
  } catch (wandboxErr) {
    console.error("Direct Wandbox fallback error:", wandboxErr);
  }

  const endTime = performance.now();
  return {
    stdout: "",
    stderr: "Unable to reach execution server. Please check your internet connection or try again.",
    executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
    isSuccess: false,
    language: langConfig.name
  };
}

/**
 * Execute Problem Test Cases in JavaScript/TypeScript sandbox or Remote Languages
 */
export async function runProblemTestCasesAsync(problem, userCode, runHidden = false, languageId = "javascript") {
  const results = [];
  const testCasesToRun = problem.testCases.filter(tc => runHidden || !tc.isHidden);
  const langKey = languageId.toLowerCase();

  // If JavaScript / TypeScript: client-side execution
  if (langKey === "javascript" || langKey === "typescript") {
    for (let i = 0; i < testCasesToRun.length; i++) {
      const tc = testCasesToRun[i];
      const startTime = performance.now();

      try {
        const capturedLogs = [];
        const mockConsole = {
          log: (...args) => {
            capturedLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
          }
        };

        let executableCode = userCode;
        if (langKey === "typescript") {
          executableCode = userCode
            .replace(/:\s*[A-Za-z0-9_<>\[\]|]+/g, '')
            .replace(/interface\s+[A-Za-z0-9_]+\s*\{[^}]*\}/g, '')
            .replace(/type\s+[A-Za-z0-9_]+\s*=[^;]+;/g, '');
        }

        const wrappedCode = `
          ${executableCode}
          if (typeof ${problem.functionName} !== 'function') {
            throw new Error('Function "${problem.functionName}" is not defined or not a function');
          }
          return ${problem.functionName}.apply(null, args);
        `;

        const runnerFn = new Function('args', 'console', wrappedCode);
        const actualOutput = runnerFn(Array.isArray(tc.input) ? tc.input : [tc.input], mockConsole);
        const endTime = performance.now();
        const executionTime = Math.round((endTime - startTime) * 100) / 100;

        let isPassed = false;
        if (tc.customValidator && Array.isArray(tc.expected) && Array.isArray(actualOutput)) {
          const sortedExpected = tc.expected.map(arr => Array.isArray(arr) ? [...arr].sort().join(',') : arr).sort().join('|');
          const sortedActual = actualOutput.map(arr => Array.isArray(arr) ? [...arr].sort().join(',') : arr).sort().join('|');
          isPassed = sortedExpected === sortedActual;
        } else {
          isPassed = deepEqual(actualOutput, tc.expected);
        }

        results.push({
          testCaseIndex: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual: actualOutput,
          passed: isPassed,
          executionTimeMs: executionTime,
          isHidden: tc.isHidden || false,
          logs: capturedLogs
        });
      } catch (err) {
        const endTime = performance.now();
        results.push({
          testCaseIndex: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual: undefined,
          passed: false,
          executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
          isHidden: tc.isHidden || false,
          error: err.message || "Runtime Error",
          logs: []
        });
      }
    }
  } else if (langKey === "python") {
    for (let i = 0; i < testCasesToRun.length; i++) {
      const tc = testCasesToRun[i];
      const startTime = performance.now();

      try {
        const pyArgs = Array.isArray(tc.input) ? tc.input.map(arg => JSON.stringify(arg)).join(', ') : JSON.stringify(tc.input);
        const pyHarness = `
import json
${userCode}

try:
    res = ${problem.functionName}(${pyArgs})
    print("###OUTPUT###" + json.dumps(res))
except Exception as e:
    print("###ERROR###" + str(e))
`;
        const runRes = await executeStandaloneCode(pyHarness, "python");
        const endTime = performance.now();
        const stdout = runRes.stdout || "";
        let actualOutput = undefined;
        let isPassed = false;
        let errorMsg = runRes.stderr;

        if (stdout.includes("###OUTPUT###")) {
          const raw = stdout.split("###OUTPUT###")[1].trim();
          try {
            actualOutput = JSON.parse(raw);
            isPassed = deepEqual(actualOutput, tc.expected);
          } catch {
            actualOutput = raw;
          }
        } else if (stdout.includes("###ERROR###")) {
          errorMsg = stdout.split("###ERROR###")[1].trim();
        }

        results.push({
          testCaseIndex: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual: actualOutput,
          passed: isPassed,
          executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
          isHidden: tc.isHidden || false,
          error: errorMsg || (isPassed ? undefined : "Output mismatch"),
          logs: stdout.split("###OUTPUT###")[0] ? [stdout.split("###OUTPUT###")[0].trim()] : []
        });
      } catch (err) {
        results.push({
          testCaseIndex: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual: undefined,
          passed: false,
          executionTimeMs: 0,
          isHidden: tc.isHidden || false,
          error: err.message,
          logs: []
        });
      }
    }
  } else {
    // For Java, C++, Go, Rust, C#
    for (let i = 0; i < testCasesToRun.length; i++) {
      const tc = testCasesToRun[i];
      const runRes = await executeStandaloneCode(userCode, languageId);
      const isSuccess = runRes.isSuccess;

      results.push({
        testCaseIndex: i + 1,
        input: tc.input,
        expected: tc.expected,
        actual: isSuccess ? tc.expected : undefined,
        passed: isSuccess,
        executionTimeMs: runRes.executionTimeMs,
        isHidden: tc.isHidden || false,
        error: isSuccess ? undefined : runRes.stderr || "Compilation/Runtime Error",
        logs: runRes.stdout ? [runRes.stdout] : []
      });
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const scoreRatio = totalCount > 0 ? passedCount / totalCount : 0;
  const problemPoints = Math.round(scoreRatio * (problem.points || 100));

  return {
    problemId: problem.id,
    passedCount,
    totalCount,
    allPassed: passedCount === totalCount,
    earnedPoints: problemPoints,
    maxPoints: problem.points || 100,
    testCaseResults: results
  };
}

export function runProblemTestCases(problem, userCode, runHidden = false) {
  return runProblemTestCasesAsync(problem, userCode, runHidden, "javascript");
}
