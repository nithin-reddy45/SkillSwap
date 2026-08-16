const express = require("express");
const router = express.Router();

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

const WANDBOX_OPTIONS_MAP = {
  cpp: "warning,gnu++2a",
  javascript: "",
  python: "",
  java: "",
  typescript: "",
  go: "",
  rust: "",
  csharp: ""
};

/**
 * POST /api/compiler/execute
 * Executes code in Java, Python, C++, JS, TS, Go, Rust, C#
 */
router.post("/execute", async (req, res) => {
  const { code, language = "javascript", stdin = "" } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Code is required" });
  }

  const startTime = Date.now();
  const langKey = language.toLowerCase();
  const compiler = WANDBOX_COMPILER_MAP[langKey] || "nodejs-20.17.0";
  const options = WANDBOX_OPTIONS_MAP[langKey] || "";

  // Normalize Java public class
  let processedCode = code;
  if (langKey === "java") {
    processedCode = code.replace(/\bpublic\s+class\b/g, "class");
  }

  try {
    // 1. Try Wandbox API (open and fast)
    const wandboxRes = await fetch("https://wandbox.org/api/compile.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: processedCode,
        compiler: compiler,
        options: options,
        stdin: stdin || ""
      })
    });

    if (wandboxRes.ok) {
      const data = await wandboxRes.json();
      const executionTimeMs = Date.now() - startTime;
      const stdout = data.program_output || data.program_message || "";
      const stderr = data.compiler_error || data.program_error || "";
      const isSuccess = (data.status === "0" || data.status === 0) && !data.compiler_error;

      return res.json({
        stdout: stdout || (isSuccess ? "Program executed successfully with no stdout output." : ""),
        stderr: stderr,
        isSuccess,
        executionTimeMs,
        language
      });
    }
  } catch (wandboxErr) {
    console.error("Wandbox execution error:", wandboxErr.message);
  }

  // 2. Fallback to Judge0
  try {
    const judge0Res = await fetch("https://ce.judge0.com/submissions?wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: code,
        language_id: getJudge0LanguageId(language),
        stdin: stdin || ""
      })
    });

    if (judge0Res.ok) {
      const jData = await judge0Res.json();
      const executionTimeMs = Date.now() - startTime;
      const stdout = jData.stdout || "";
      const stderr = jData.stderr || jData.compile_output || "";
      const isSuccess = jData.status?.id === 3;

      return res.json({
        stdout: stdout || (isSuccess ? "Program executed successfully." : ""),
        stderr: stderr,
        isSuccess,
        executionTimeMs,
        language
      });
    }
  } catch (judge0Err) {
    console.error("Judge0 fallback error:", judge0Err.message);
  }

  return res.status(500).json({
    stdout: "",
    stderr: "Execution service encountered an error. Please verify code syntax or try again.",
    isSuccess: false,
    executionTimeMs: Date.now() - startTime,
    language
  });
});

function getJudge0LanguageId(lang) {
  switch (lang.toLowerCase()) {
    case "javascript": return 63;
    case "python": return 71;
    case "java": return 62;
    case "cpp": return 54;
    case "typescript": return 74;
    case "go": return 60;
    case "rust": return 73;
    case "csharp": return 51;
    default: return 63;
  }
}

module.exports = router;
