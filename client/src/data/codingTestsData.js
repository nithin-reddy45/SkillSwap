export const SUPPORTED_LANGUAGES = [
  {
    id: "javascript",
    name: "JavaScript (Node.js)",
    icon: "🟨",
    extension: "js",
    pistonLang: "javascript",
    version: "18.15.0",
    defaultCode: `// Online JavaScript Compiler\nconsole.log("Hello, SkillSwap Developer! ⚡");\n\nfunction solve(arr) {\n  return arr.map(x => x * 2);\n}\n\nconsole.log("Result:", solve([1, 2, 3, 4, 5]));\n`
  },
  {
    id: "python",
    name: "Python 3",
    icon: "🐍",
    extension: "py",
    pistonLang: "python",
    version: "3.10.0",
    defaultCode: `# Online Python 3 Compiler\nprint("Hello, SkillSwap Developer! 🐍")\n\ndef solve(arr):\n    return [x * 2 for x in arr]\n\nprint("Result:", solve([1, 2, 3, 4, 5]))\n`
  },
  {
    id: "java",
    name: "Java (OpenJDK 17)",
    icon: "☕",
    extension: "java",
    pistonLang: "java",
    version: "15.0.2",
    defaultCode: `// Online Java Compiler\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, SkillSwap Developer! ☕");\n        int[] arr = {1, 2, 3, 4, 5};\n        System.out.println("Array length: " + arr.length);\n    }\n}\n`
  },
  {
    id: "cpp",
    name: "C++ (GCC 12)",
    icon: "⚡",
    extension: "cpp",
    pistonLang: "c++",
    version: "10.2.0",
    defaultCode: `// Online C++ Compiler\n#include <iostream>\n#include <vector>\n#include <numeric>\n\nusing namespace std;\n\nint main() {\n    cout << "Hello, SkillSwap Developer! ⚡" << endl;\n    vector<int> nums = {1, 2, 3, 4, 5};\n    int sum = 0;\n    for(int n : nums) sum += n;\n    cout << "Sum: " << sum << endl;\n    return 0;\n}\n`
  },
  {
    id: "typescript",
    name: "TypeScript",
    icon: "🔷",
    extension: "ts",
    pistonLang: "typescript",
    version: "5.0.3",
    defaultCode: `// Online TypeScript Compiler\ninterface User {\n  name: string;\n  skill: string;\n  rating: number;\n}\n\nconst dev: User = {\n  name: "SkillSwap Learner",\n  skill: "Full Stack",\n  rating: 4.9\n};\n\nconsole.log("Developer Profile:", dev);\n`
  },
  {
    id: "go",
    name: "Go (Golang)",
    icon: "🐹",
    extension: "go",
    pistonLang: "go",
    version: "1.16.2",
    defaultCode: `// Online Go Compiler\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, SkillSwap Developer! 🐹")\n    nums := []int{1, 2, 3, 4, 5}\n    fmt.Printf("Slice: %v, Length: %d\\n", nums, len(nums))\n}\n`
  },
  {
    id: "rust",
    name: "Rust",
    icon: "🦀",
    extension: "rs",
    pistonLang: "rust",
    version: "1.68.2",
    defaultCode: `// Online Rust Compiler\nfn main() {\n    println!("Hello, SkillSwap Developer! 🦀");\n    let numbers = vec![1, 2, 3, 4, 5];\n    let sum: i32 = numbers.iter().sum();\n    println!("Sum of numbers: {}", sum);\n}\n`
  },
  {
    id: "csharp",
    name: "C# (.NET)",
    icon: "🟣",
    extension: "cs",
    pistonLang: "csharp",
    version: "6.12.0",
    defaultCode: `// Online C# Compiler\nusing System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, SkillSwap Developer! 🟣");\n        var list = new List<int> { 1, 2, 3, 4, 5 };\n        Console.WriteLine($"Count: {list.Count}, Sum: {list.Sum()}");\n    }\n}\n`
  }
];

export const DEFAULT_CODING_TESTS = [
  {
    id: "dsa-sprint-30",
    title: "⚡ DSA & Algorithms Speedrun Challenge",
    description: "Test your problem-solving speed with classic Data Structures & Algorithms challenges. Solve Two Sum, Valid Parentheses, and Max Subarray Sum under time pressure!",
    category: "DSA & Algorithms",
    difficulty: "Medium",
    durationMinutes: 30,
    passingScore: 70,
    author: "SkillSwap Official",
    isOfficial: true,
    badge: "🔥 Most Popular",
    icon: "⚡",
    problems: [
      {
        id: "p1",
        title: "1. Two Sum Problem",
        difficulty: "Easy",
        points: 30,
        functionName: "twoSum",
        description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. Return the indices sorted in ascending order.`,
        examples: [
          {
            input: "nums = [2, 7, 11, 15], target = 9",
            output: "[0, 1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
          },
          {
            input: "nums = [3, 2, 4], target = 6",
            output: "[1, 2]"
          }
        ],
        constraints: [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "Only one valid answer exists."
        ],
        starterCodeByLang: {
          javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
          python: `def twoSum(nums, target):
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []`,
          java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
          cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.count(complement)) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`,
          typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (map.has(comp)) {
      return [map.get(comp)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
          go: `func twoSum(nums []int, target int) []int {
    m := make(map[int]int)
    for i, num := range nums {
        if idx, ok := m[target-num]; ok {
            return []int{idx, i}
        }
        m[num] = i
    }
    return []int{}
}`,
          rust: `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        let mut map = std::collections::HashMap::new();
        for (i, &num) in nums.iter().enumerate() {
            let comp = target - num;
            if let Some(&prev_idx) = map.get(&comp) {
                return vec![prev_idx as i32, i as i32];
            }
            map.insert(num, i);
        }
        vec![]
    }
}`,
          csharp: `public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        var map = new Dictionary<int, int>();
        for (int i = 0; i < nums.Length; i++) {
            int comp = target - nums[i];
            if (map.ContainsKey(comp)) {
                return new int[] { map[comp], i };
            }
            map[nums[i]] = i;
        }
        return new int[0];
    }
}`
        },
        starterCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        testCases: [
          { input: [[2, 7, 11, 15], 9], expected: [0, 1], isHidden: false },
          { input: [[3, 2, 4], 6], expected: [1, 2], isHidden: false },
          { input: [[3, 3], 6], expected: [0, 1], isHidden: true },
          { input: [[-1, -2, -3, -4, -5], -8], expected: [2, 4], isHidden: true }
        ]
      },
      {
        id: "p2",
        title: "2. Valid Parentheses",
        difficulty: "Easy",
        points: 30,
        functionName: "isValid",
        description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.`,
        examples: [
          { input: 's = "()"', output: "true" },
          { input: 's = "()[]{}"', output: "true" },
          { input: 's = "(]"', output: "false" }
        ],
        constraints: [
          "1 <= s.length <= 10^4",
          "s consists of parentheses only '()[]{}'."
        ],
        starterCodeByLang: {
          javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
          python: `def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
          java: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
          cpp: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(') st.push(')');
            else if (c == '{') st.push('}');
            else if (c == '[') st.push(']');
            else {
                if (st.empty() || st.top() != c) return false;
                st.pop();
            }
        }
        return st.empty();
    }
};`,
          typescript: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`
        },
        starterCode: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
        testCases: [
          { input: ["()"], expected: true, isHidden: false },
          { input: ["()[]{}"], expected: true, isHidden: false },
          { input: ["(]"], expected: false, isHidden: false },
          { input: ["([{}])"], expected: true, isHidden: true },
          { input: ["((("], expected: false, isHidden: true }
        ]
      },
      {
        id: "p3",
        title: "3. Maximum Subarray (Kadane's Algorithm)",
        difficulty: "Medium",
        points: 40,
        functionName: "maxSubArray",
        description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.`,
        examples: [
          {
            input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
            output: "6",
            explanation: "The subarray [4, -1, 2, 1] has the largest sum 6."
          },
          { input: "nums = [1]", output: "1" },
          { input: "nums = [5, 4, -1, 7, 8]", output: "23" }
        ],
        constraints: [
          "1 <= nums.length <= 10^5",
          "-10^4 <= nums[i] <= 10^4"
        ],
        starterCodeByLang: {
          javascript: `function maxSubArray(nums) {
  let currentSum = nums[0];
  let maxSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`,
          python: `def maxSubArray(nums: list[int]) -> int:
    current_sum = max_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
          java: `class Solution {
    public int maxSubArray(int[] nums) {
        int currentSum = nums[0];
        int maxSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
    }
}`,
          cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int currentSum = nums[0];
        int maxSum = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            currentSum = max(nums[i], currentSum + nums[i]);
            maxSum = max(maxSum, currentSum);
        }
        return maxSum;
    }
};`
        },
        starterCode: `function maxSubArray(nums) {
  let currentSum = nums[0];
  let maxSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`,
        testCases: [
          { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6, isHidden: false },
          { input: [[1]], expected: 1, isHidden: false },
          { input: [[5, 4, -1, 7, 8]], expected: 23, isHidden: false },
          { input: [[-5, -2, -8, -1]], expected: -1, isHidden: true }
        ]
      }
    ]
  },
  {
    id: "js-fullstack-20",
    title: "🚀 Modern JavaScript & Data Logic Assessment",
    description: "Timed 20-minute test evaluating deep object manipulation, array transformations, palindromes, and string encoding skills.",
    category: "Web Development",
    difficulty: "Easy to Medium",
    durationMinutes: 20,
    passingScore: 60,
    author: "SkillSwap Official",
    isOfficial: true,
    badge: "🌟 Recommended",
    icon: "🌐",
    problems: [
      {
        id: "p1",
        title: "1. Group Anagrams",
        difficulty: "Medium",
        points: 50,
        functionName: "groupAnagrams",
        description: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in any order.\n\nAn Anagram is a word formed by rearranging the letters of a different word, using all the original letters exactly once.`,
        examples: [
          {
            input: 'strs = ["eat", "tea", "tan", "ate", "nat", "bat"]',
            output: '[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]'
          }
        ],
        constraints: [
          "1 <= strs.length <= 10^4",
          "0 <= strs[i].length <= 100",
          "strs[i] consists of lowercase English letters."
        ],
        starterCodeByLang: {
          javascript: `function groupAnagrams(strs) {
  const map = {};
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map[key]) map[key] = [];
    map[key].push(s);
  }
  return Object.values(map);
}`,
          python: `def groupAnagrams(strs):
    from collections import defaultdict
    anagram_map = defaultdict(list)
    for s in strs:
        sorted_s = "".join(sorted(s))
        anagram_map[sorted_s].append(s)
    return list(anagram_map.values())`,
          java: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(map.values());
    }
}`
        },
        starterCode: `function groupAnagrams(strs) {
  const map = {};
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map[key]) map[key] = [];
    map[key].push(s);
  }
  return Object.values(map);
}`,
        testCases: [
          {
            input: [["eat", "tea", "tan", "ate", "nat", "bat"]],
            expected: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]],
            customValidator: true,
            isHidden: false
          },
          {
            input: [[""]],
            expected: [[""]],
            customValidator: true,
            isHidden: false
          },
          {
            input: [["a"]],
            expected: [["a"]],
            customValidator: true,
            isHidden: true
          }
        ]
      },
      {
        id: "p2",
        title: "2. Longest Palindromic Substring",
        difficulty: "Medium",
        points: 50,
        functionName: "longestPalindrome",
        description: `Given a string \`s\`, return the longest palindromic substring in \`s\`.`,
        examples: [
          { input: 's = "babad"', output: '"bab" or "aba"' },
          { input: 's = "cbbd"', output: '"bb"' }
        ],
        constraints: [
          "1 <= s.length <= 1000",
          "s consist of only digits and English letters."
        ],
        starterCodeByLang: {
          javascript: `function longestPalindrome(s) {
  if (!s || s.length < 1) return "";
  let start = 0, end = 0;
  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    return r - l - 1;
  }
  for (let i = 0; i < s.length; i++) {
    const len1 = expand(i, i);
    const len2 = expand(i, i + 1);
    const len = Math.max(len1, len2);
    if (len > end - start) {
      start = i - Math.floor((len - 1) / 2);
      end = i + Math.floor(len / 2);
    }
  }
  return s.substring(start, end + 1);
}`,
          python: `def longestPalindrome(s: str) -> str:
    if not s: return ""
    start, end = 0, 0
    def expand(l, r):
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        return r - l - 1
    for i in range(len(s)):
        len1 = expand(i, i)
        len2 = expand(i, i + 1)
        length = max(len1, len2)
        if length > end - start:
            start = i - (length - 1) // 2
            end = i + length // 2
    return s[start:end+1]`
        },
        starterCode: `function longestPalindrome(s) {
  if (!s || s.length < 1) return "";
  let start = 0, end = 0;
  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    return r - l - 1;
  }
  for (let i = 0; i < s.length; i++) {
    const len1 = expand(i, i);
    const len2 = expand(i, i + 1);
    const len = Math.max(len1, len2);
    if (len > end - start) {
      start = i - Math.floor((len - 1) / 2);
      end = i + Math.floor(len / 2);
    }
  }
  return s.substring(start, end + 1);
}`,
        testCases: [
          { input: ["cbbd"], expected: "bb", isHidden: false },
          { input: ["a"], expected: "a", isHidden: false },
          { input: ["racecar"], expected: "racecar", isHidden: true }
        ]
      }
    ]
  },
  {
    id: "python-algo-45",
    title: "🐍 Advanced Algorithms & Dynamic Programming",
    description: "45-minute timed challenge tackling Coin Change, Binary Search variations, and Climbing Stairs.",
    category: "AI & Data Science",
    difficulty: "Hard",
    durationMinutes: 45,
    passingScore: 75,
    author: "SkillSwap Official",
    isOfficial: true,
    badge: "🏆 Advanced Trophy",
    icon: "🐍",
    problems: [
      {
        id: "p1",
        title: "1. Coin Change (Fewest Coins)",
        difficulty: "Medium",
        points: 50,
        functionName: "coinChange",
        description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.`,
        examples: [
          { input: "coins = [1, 2, 5], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1" },
          { input: "coins = [2], amount = 3", output: "-1" }
        ],
        constraints: [
          "1 <= coins.length <= 12",
          "1 <= coins[i] <= 2^31 - 1",
          "0 <= amount <= 10^4"
        ],
        starterCodeByLang: {
          javascript: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
          python: `def coinChange(coins: list[int], amount: int) -> int:
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if i - coin >= 0:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
          java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (i - coin >= 0) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`
        },
        starterCode: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
        testCases: [
          { input: [[1, 2, 5], 11], expected: 3, isHidden: false },
          { input: [[2], 3], expected: -1, isHidden: false },
          { input: [[1], 0], expected: 0, isHidden: false },
          { input: [[186, 419, 83, 408], 6249], expected: 20, isHidden: true }
        ]
      },
      {
        id: "p2",
        title: "2. Climbing Stairs",
        difficulty: "Easy",
        points: 50,
        functionName: "climbStairs",
        description: `You are climbing a staircase. It takes \`n\` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
        examples: [
          { input: "n = 2", output: "2", explanation: "1. 1 step + 1 step\n2. 2 steps" },
          { input: "n = 3", output: "3" }
        ],
        constraints: ["1 <= n <= 45"],
        starterCodeByLang: {
          javascript: `function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}`,
          python: `def climbStairs(n: int) -> int:
    if n <= 2: return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,
          java: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }
}`
        },
        starterCode: `function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}`,
        testCases: [
          { input: [2], expected: 2, isHidden: false },
          { input: [3], expected: 3, isHidden: false },
          { input: [5], expected: 8, isHidden: true },
          { input: [8], expected: 34, isHidden: true }
        ]
      }
    ]
  }
];

export function getStarterCodeForLanguage(problem, langId = "javascript") {
  if (problem.starterCodeByLang && problem.starterCodeByLang[langId]) {
    return problem.starterCodeByLang[langId];
  }
  if (langId === "javascript") {
    return problem.starterCode || `function ${problem.functionName || "solution"}(input) {\n  return input;\n}`;
  }
  if (langId === "python") {
    return `def ${problem.functionName || "solution"}(*args):\n    # Write your Python 3 solution here\n    pass`;
  }
  if (langId === "java") {
    return `class Solution {\n    public Object ${problem.functionName || "solution"}(Object... args) {\n        // Write your Java solution here\n        return null;\n    }\n}`;
  }
  if (langId === "cpp") {
    return `class Solution {\npublic:\n    auto ${problem.functionName || "solution"}() {\n        // Write your C++ solution here\n    }\n};`;
  }
  if (langId === "typescript") {
    return `function ${problem.functionName || "solution"}(...args: any[]): any {\n  // Write your TypeScript solution here\n}`;
  }
  if (langId === "go") {
    return `func ${problem.functionName || "solution"}() {\n    // Write your Go solution here\n}`;
  }
  if (langId === "rust") {
    return `impl Solution {\n    pub fn ${problem.functionName || "solution"}() {\n        // Write your Rust solution here\n    }\n}`;
  }
  if (langId === "csharp") {
    return `public class Solution {\n    public object ${problem.functionName || "Solution"}() {\n        // Write your C# solution here\n        return null;\n    }\n}`;
  }
  return problem.starterCode || "";
}

// Helper functions for LocalStorage management
const CUSTOM_TESTS_KEY = "skillswap_custom_coding_tests";
const TEST_HISTORY_KEY = "skillswap_test_history";

export function getAllCodingTests() {
  try {
    const saved = localStorage.getItem(CUSTOM_TESTS_KEY);
    const customTests = saved ? JSON.parse(saved) : [];
    return [...DEFAULT_CODING_TESTS, ...customTests];
  } catch {
    return DEFAULT_CODING_TESTS;
  }
}

export function getCodingTestById(id) {
  const all = getAllCodingTests();
  return all.find(t => t.id === id) || null;
}

export function saveCustomCodingTest(testData) {
  try {
    const saved = localStorage.getItem(CUSTOM_TESTS_KEY);
    const customTests = saved ? JSON.parse(saved) : [];
    const newTest = {
      ...testData,
      id: testData.id || `custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isOfficial: false,
      badge: "🛠️ User Created",
      icon: testData.icon || "💻"
    };
    customTests.unshift(newTest);
    localStorage.setItem(CUSTOM_TESTS_KEY, JSON.stringify(customTests));
    return newTest;
  } catch (err) {
    console.error("Error saving custom test:", err);
    return null;
  }
}

export function deleteCustomCodingTest(id) {
  try {
    const saved = localStorage.getItem(CUSTOM_TESTS_KEY);
    const customTests = saved ? JSON.parse(saved) : [];
    const filtered = customTests.filter(t => t.id !== id);
    localStorage.setItem(CUSTOM_TESTS_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error("Error deleting custom test:", err);
    return false;
  }
}

export function saveTestResult(resultData) {
  try {
    const saved = localStorage.getItem(TEST_HISTORY_KEY);
    const history = saved ? JSON.parse(saved) : [];
    const item = {
      ...resultData,
      id: `res-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    history.unshift(item);
    localStorage.setItem(TEST_HISTORY_KEY, JSON.stringify(history));
    return item;
  } catch (err) {
    console.error("Error saving test result:", err);
    return null;
  }
}

export function getTestHistory() {
  try {
    const saved = localStorage.getItem(TEST_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}
