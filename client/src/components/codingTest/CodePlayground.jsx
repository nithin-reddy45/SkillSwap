import { useState } from "react";
import { SUPPORTED_LANGUAGES } from "../../data/codingTestsData";
import { executeStandaloneCode } from "../../utils/codeRunner";
import "./CodePlayground.css";

const CODE_PRESETS = [
  {
    name: "👋 Hello World",
    codes: {
      javascript: `console.log("Hello from JavaScript in SkillSwap! ⚡");`,
      python: `print("Hello from Python 3 in SkillSwap! 🐍")`,
      java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java in SkillSwap! ☕");\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from C++ in SkillSwap! ⚡" << endl;\n    return 0;\n}`,
      typescript: `const greeting: string = "Hello from TypeScript in SkillSwap! 🔷";\nconsole.log(greeting);`,
      go: `package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go in SkillSwap! 🐹")\n}`,
      rust: `fn main() {\n    println!("Hello from Rust in SkillSwap! 🦀");\n}`,
      csharp: `using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from C# in SkillSwap! 🟣");\n    }\n}`
    }
  },
  {
    name: "🔍 Two Sum Algorithm",
    codes: {
      javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log("Two Sum [2,7,11,15], target=9 ->", twoSum([2, 7, 11, 15], 9));`,
      python: `def two_sum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in lookup:\n            return [lookup[complement], i]\n        lookup[num] = i\n    return []\n\nprint("Two Sum [2,7,11,15], target=9 ->", two_sum([2, 7, 11, 15], 9))`,
      java: `import java.util.*;\n\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if (map.containsKey(comp)) return new int[]{map.get(comp), i};\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n    public static void main(String[] args) {\n        int[] res = twoSum(new int[]{2, 7, 11, 15}, 9);\n        System.out.println("Two Sum Result: [" + res[0] + ", " + res[1] + "]");\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> map;\n    for(int i=0; i<nums.size(); i++) {\n        int comp = target - nums[i];\n        if(map.count(comp)) return {map[comp], i};\n        map[nums[i]] = i;\n    }\n    return {};\n}\n\nint main() {\n    vector<int> nums = {2, 7, 11, 15};\n    auto res = twoSum(nums, 9);\n    cout << "Two Sum Result: [" << res[0] << ", " << res[1] << "]" << endl;\n    return 0;\n}`
    }
  },
  {
    name: "⚡ Fibonacci Sequence",
    codes: {
      javascript: `function fibonacci(n) {\n  const fib = [0, 1];\n  for (let i = 2; i < n; i++) {\n    fib[i] = fib[i - 1] + fib[i - 2];\n  }\n  return fib;\n}\nconsole.log("Fibonacci(10):", fibonacci(10));`,
      python: `def fibonacci(n):\n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[-1] + fib[-2])\n    return fib\n\nprint("Fibonacci(10):", fibonacci(10))`,
      java: `public class Main {\n    public static void main(String[] args) {\n        int n = 10;\n        int[] fib = new int[n];\n        fib[0] = 0; fib[1] = 1;\n        for (int i = 2; i < n; i++) fib[i] = fib[i-1] + fib[i-2];\n        for (int x : fib) System.out.print(x + " ");\n        System.out.println();\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n = 10;\n    vector<int> fib = {0, 1};\n    for(int i=2; i<n; i++) fib.push_back(fib[i-1] + fib[i-2]);\n    for(int x : fib) cout << x << " ";\n    cout << endl;\n    return 0;\n}`
    }
  }
];

function CodePlayground() {
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0].id);
  const [codeMap, setCodeMap] = useState(() => {
    const map = {};
    SUPPORTED_LANGUAGES.forEach(l => {
      map[l.id] = l.defaultCode;
    });
    return map;
  });

  const [stdin, setStdin] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);

  const currentLangConfig = SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = (langId) => {
    setSelectedLanguage(langId);
  };

  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCodeMap(prev => ({
      ...prev,
      [selectedLanguage]: val
    }));
  };

  const handleLoadPreset = (preset) => {
    const presetCode = preset.codes[selectedLanguage] || preset.codes.javascript || currentLangConfig.defaultCode;
    setCodeMap(prev => ({
      ...prev,
      [selectedLanguage]: presetCode
    }));
  };

  const handleResetCode = () => {
    if (window.confirm(`Reset ${currentLangConfig.name} to default template?`)) {
      setCodeMap(prev => ({
        ...prev,
        [selectedLanguage]: currentLangConfig.defaultCode
      }));
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    const code = codeMap[selectedLanguage] || "";
    const res = await executeStandaloneCode(code, selectedLanguage, stdin);
    setOutput(res);
    setIsRunning(false);
  };

  return (
    <div className="code-playground-container">
      
      {/* Playground Header */}
      <div className="playground-header">
        <div className="playground-title-group">
          <span className="playground-badge">⚡ MULTI-LANGUAGE IDE</span>
          <h2>Online Multi-Language Code Compiler</h2>
          <p>Write, compile, and execute code instantly in 8+ popular programming languages.</p>
        </div>

        {/* Language Tabs Row */}
        <div className="lang-selector-chips">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.id}
              className={`lang-chip ${selectedLanguage === lang.id ? "active" : ""}`}
              onClick={() => handleLanguageChange(lang.id)}
            >
              <span className="lang-icon">{lang.icon}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Output Two-Column Grid */}
      <div className="playground-grid">
        
        {/* Left: Code Editor Pane */}
        <div className="playground-editor-pane">
          
          {/* Controls Bar */}
          <div className="editor-controls-bar">
            <div className="editor-left-tools">
              <span className="current-lang-tag">
                {currentLangConfig.icon} {currentLangConfig.name}
              </span>
              
              {/* Presets dropdown */}
              <div className="presets-dropdown-group">
                <span className="tool-label">Presets:</span>
                {CODE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    className="preset-btn"
                    onClick={() => handleLoadPreset(p)}
                    title={`Load ${p.name}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="editor-right-tools">
              <select
                className="font-size-select"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                title="Font size"
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
              </select>

              <button className="tool-btn" onClick={handleResetCode} title="Reset Template">
                ↺ Reset
              </button>

              <button
                className="run-code-btn"
                onClick={handleRunCode}
                disabled={isRunning}
              >
                {isRunning ? "⚡ Compiling..." : "▶ Run Code"}
              </button>
            </div>
          </div>

          {/* Textarea IDE */}
          <div className="editor-surface">
            <textarea
              className="playground-textarea"
              style={{ fontSize: `${fontSize}px` }}
              value={codeMap[selectedLanguage] || ""}
              onChange={handleCodeChange}
              placeholder={`Write ${currentLangConfig.name} code here...`}
              spellCheck="false"
            />
          </div>

          {/* Custom Stdin Input */}
          <div className="stdin-container">
            <div className="stdin-header">
              <span>Standard Input (stdin):</span>
            </div>
            <textarea
              className="stdin-textarea"
              placeholder="Enter standard input arguments (if your program reads from stdin)..."
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows="2"
            />
          </div>

        </div>

        {/* Right: Compiler Output Console */}
        <div className="playground-output-pane">
          <div className="output-header">
            <h3>Compiler Output & Console</h3>
            {output && (
              <div className="output-stats-badge">
                <span className={output.isSuccess ? "stat-success" : "stat-error"}>
                  {output.isSuccess ? "✓ Success" : "✗ Error"}
                </span>
                <span>⏱️ {output.executionTimeMs} ms</span>
                {output.memory && <span>💾 {output.memory}</span>}
              </div>
            )}
          </div>

          <div className="output-console-body">
            {isRunning ? (
              <div className="output-loading">
                <div className="spinner"></div>
                <p>Compiling and executing {currentLangConfig.name} code...</p>
              </div>
            ) : output ? (
              <div className="output-results">
                {output.stdout && (
                  <div className="stdout-box">
                    <span className="console-label">Standard Output (stdout):</span>
                    <pre className="stdout-text">{output.stdout}</pre>
                  </div>
                )}
                {output.stderr && (
                  <div className="stderr-box">
                    <span className="console-label error-label">Compiler / Runtime Errors (stderr):</span>
                    <pre className="stderr-text">{output.stderr}</pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="output-empty">
                <p>Click <strong>"▶ Run Code"</strong> to compile and view program output.</p>
                <div className="supported-langs-mini-pill">
                  {SUPPORTED_LANGUAGES.map(l => (
                    <span key={l.id}>{l.icon} {l.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

export default CodePlayground;
