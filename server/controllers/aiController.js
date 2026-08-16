const User = require("../models/User");

// Preset knowledge bank for ultra-fast & high-quality offline/online generation
const SKILL_CURRICULUM_BANK = {
  "machine learning": {
    title: "Machine Learning Specialist Roadmap",
    weeks: [
      {
        week: 1,
        title: "Python for Data Science & Math Essentials",
        description: "Master NumPy, Pandas, Linear Algebra, and Calculus foundations.",
        topics: ["NumPy Array Manipulation", "Pandas DataFrames & Data Cleaning", "Vector & Matrix Operations", "Derivatives & Gradient Descent intuition"],
        resources: ["Python Data Science Handbook", "StatQuest: Essential Math for ML", "Kaggle Python Course"]
      },
      {
        week: 2,
        title: "Exploratory Data Analysis & Statistics",
        description: "Learn statistical hypotheses, probability distributions, and data visualization.",
        topics: ["Matplotlib & Seaborn Visualizations", "Descriptive & Inferential Statistics", "Handling Outliers & Missing Values", "Feature Scaling & Normalization"],
        resources: ["Towards Data Science: EDA Guide", "Seaborn Official Tutorials", "Khan Academy Statistics"]
      },
      {
        week: 3,
        title: "Supervised Learning Algorithms",
        description: "Implement core classification and regression models using Scikit-Learn.",
        topics: ["Linear & Logistic Regression", "Decision Trees & Random Forests", "Support Vector Machines (SVM)", "Cross-Validation & Hyperparameter Tuning"],
        resources: ["Scikit-Learn User Guide", "Hands-On ML with Scikit-Learn, Keras & TensorFlow", "Coursera ML by Andrew Ng"]
      },
      {
        week: 4,
        title: "Unsupervised Learning & Model Evaluation",
        description: "Discover clustering, dimensionality reduction, and evaluation metrics.",
        topics: ["K-Means & Hierarchical Clustering", "Principal Component Analysis (PCA)", "ROC-AUC, Precision, Recall & F1-Score", "Model Serialization & Deployment with FastAPI"],
        resources: ["FastAPI Documentation", "Scikit-Learn Evaluation Metrics Guide", "Kaggle Housing Price Project"]
      }
    ]
  },
  "react": {
    title: "Modern React.js Developer Roadmap",
    weeks: [
      {
        week: 1,
        title: "Core React Foundations & JSX",
        description: "Understand React virtual DOM, component trees, props, and state.",
        topics: ["JSX Syntax & Rules", "Functional Components & Props", "useState for Local State", "Conditional Rendering & Lists with Keys"],
        resources: ["React.dev Quick Start", "JavaScript ES6+ for React Guide", "Scrimba React Basics"]
      },
      {
        week: 2,
        title: "Component Lifecycle, Effects & API Calls",
        description: "Master asynchronous side-effects, data fetching, and ref management.",
        topics: ["useEffect & Dependency Array Deep Dive", "Fetching Data with Axios/Fetch", "useRef for DOM Manipulation", "Custom Hooks Creation"],
        resources: ["React.dev: Synchronizing with Effects", "TanStack React Query Docs", "Web Dev Simplified Hooks Series"]
      },
      {
        week: 3,
        title: "Advanced State Management & Routing",
        description: "Architect scalable single page apps with routing and context.",
        topics: ["React Router v6 / v7 Navigation & Dynamic Routes", "useContext & useReducer Pattern", "Zustand / Redux Toolkit Basics", "Performance: useMemo & useCallback"],
        resources: ["React Router Official Docs", "Zustand Documentation", "Redux Toolkit Essentials"]
      },
      {
        week: 4,
        title: "Production Patterns, Testing & Deployment",
        description: "Build robust full-stack applications with styling, error boundaries, and CI/CD.",
        topics: ["CSS Modules & TailwindCSS Styling", "Error Boundaries & Suspense", "Unit Testing with Vitest & React Testing Library", "Deploying on Vercel / Netlify"],
        resources: ["React Testing Library Docs", "Vercel Deployment Guide", "Modern Full-Stack React Architecture"]
      }
    ]
  },
  "python": {
    title: "Python Programming Mastery Roadmap",
    weeks: [
      {
        week: 1,
        title: "Python Fundamentals & Control Flow",
        description: "Syntax, data types, loops, conditionals, and functions.",
        topics: ["Variables, Data Types & Operators", "Lists, Tuples, Dictionaries & Sets", "Loops (for, while) & List Comprehensions", "Functions, *args & **kwargs"],
        resources: ["Automate the Boring Stuff with Python", "Python.org Official Tutorial", "Exercism Python Track"]
      },
      {
        week: 2,
        title: "Object-Oriented Programming & Modules",
        description: "Classes, inheritance, encapsulation, and package ecosystem.",
        topics: ["Classes, Objects & __init__ Constructor", "Inheritance, Polymorphism & Dunder Methods", "File I/O and JSON Handling", "Virtual Environments & pip"],
        resources: ["Real Python OOP Guide", "Python Packaging Docs", "Corey Schafer OOP YouTube Playlist"]
      },
      {
        week: 3,
        title: "Advanced Python & Asynchronous Programming",
        description: "Decorators, generators, context managers, and async concurrency.",
        topics: ["Decorators & Function Wrappers", "Generators & Iterators (yield)", "Context Managers (with statement)", "asyncio & Async/Await"],
        resources: ["Fluent Python Book", "Real Python Advanced Topics", "AsyncIO in Python Docs"]
      },
      {
        week: 4,
        title: "Real-World Projects & Backend Basics",
        description: "Build APIs and automation scripts with popular Python libraries.",
        topics: ["Web Scraping with BeautifulSoup", "Building REST APIs with Flask/FastAPI", "Database connectivity with SQLite/PostgreSQL", "Unit Testing with pytest"],
        resources: ["FastAPI Tutorial", "Pytest Documentation", "BeautifulSoup4 Docs"]
      }
    ]
  },
  "mern": {
    title: "Full Stack MERN Developer Roadmap",
    weeks: [
      {
        week: 1,
        title: "Frontend Foundations (React + CSS/Tailwind)",
        description: "Modern UI architecture, stateful components, and responsive design.",
        topics: ["React 18/19 Architecture", "State Management & Custom Hooks", "Responsive Layouts & Glassmorphism UI", "Form Handling & Validation"],
        resources: ["React.dev", "CSS-Tricks", "Scrimba Full-Stack"]
      },
      {
        week: 2,
        title: "Backend Development with Node.js & Express",
        description: "RESTful API creation, middleware, and request/response lifecycle.",
        topics: ["Node.js Event Loop & Modules", "Express Router & Middleware Architecture", "Error Handling & Status Codes", "File Uploads & Environment Config"],
        resources: ["Nodejs.org Docs", "Express.js Guide", "MDN Express Tutorial"]
      },
      {
        week: 3,
        title: "Database Modeling with MongoDB & Mongoose",
        description: "NoSQL schema design, relationships, indexing, and aggregations.",
        topics: ["MongoDB Atlas Setup & Collections", "Mongoose Schemas, Validation & Population", "JWT Authentication & bcrypt Password Hashing", "CRUD Operations with Protected Routes"],
        resources: ["MongoDB University", "Mongoose Docs", "JWT.io Introduction"]
      },
      {
        week: 4,
        title: "Full-Stack Integration, WebSockets & Deployment",
        description: "Connect React frontend with Express backend, add real-time features, and deploy.",
        topics: ["Axios / Fetch API Integration with CORS", "Real-Time Chat with Socket.IO", "End-to-End Authentication Flow", "Deploying MERN (Render / Vercel / Railway)"],
        resources: ["Socket.IO Guide", "Render Deployment Docs", "Full Stack Open Course"]
      }
    ]
  }
};

// ==========================================
// 1. GENERATE AI ROADMAP
// ==========================================
const generateRoadmap = async (req, res) => {
  try {
    const { skill, level = "Beginner", durationWeeks = 4, goal = "" } = req.body;

    if (!skill || !skill.trim()) {
      return res.status(400).json({ message: "Skill topic is required" });
    }

    const cleanSkill = skill.trim().toLowerCase();
    
    // Check if we have pre-calibrated roadmap for popular tech
    let matchedKey = Object.keys(SKILL_CURRICULUM_BANK).find(k => 
      cleanSkill.includes(k) || k.includes(cleanSkill)
    );

    let roadmapData;

    if (matchedKey) {
      const base = SKILL_CURRICULUM_BANK[matchedKey];
      roadmapData = {
        skill: skill.trim(),
        title: `${skill.trim()} (${level}) — ${durationWeeks}-Week Mastery Plan`,
        level,
        goal: goal || `Master ${skill.trim()} to build production-ready projects and swap knowledge effectively.`,
        durationWeeks: Number(durationWeeks),
        weeks: base.weeks.slice(0, Math.min(Number(durationWeeks), base.weeks.length))
      };
    } else {
      // Dynamic generation for arbitrary skill
      const weeksCount = Math.max(2, Math.min(8, Number(durationWeeks) || 4));
      const dynamicWeeks = [];

      for (let i = 1; i <= weeksCount; i++) {
        if (i === 1) {
          dynamicWeeks.push({
            week: 1,
            title: `${skill} Fundamentals & Core Syntax`,
            description: `Understand core concepts, environment setup, and baseline terminology for ${skill}.`,
            topics: [`${skill} Architecture & Environment Setup`, "Core Syntax & Essential Constructs", "Basic Data Handling & Inputs", "First Hands-On Script / Exercise"],
            resources: [`Official ${skill} Documentation`, `${skill} Beginner Guide on freeCodeCamp`, "Community Best Practices"]
          });
        } else if (i === 2) {
          dynamicWeeks.push({
            week: 2,
            title: `${skill} Intermediate Workflows & Patterns`,
            description: `Build modular components, handle errors, and manage state or data structures.`,
            topics: ["Modular Code Structure", "Error Handling & Debugging Techniques", "Data Processing & Common Standard Libraries", "Integration with External APIs / Tools"],
            resources: [`Advanced ${skill} Articles on Medium`, "GitHub Sample Projects", "Interactive Coding Challenges"]
          });
        } else if (i === 3) {
          dynamicWeeks.push({
            week: 3,
            title: `Advanced ${skill} Architecture & Performance`,
            description: `Optimize speed, security, and deep dive into real-world enterprise patterns.`,
            topics: ["Optimization & Memory Management", "Design Patterns & Scalability", "Unit Testing & Automated Quality Checks", "Security & Data Integrity"],
            resources: [`${skill} Performance Optimization Guide`, "Testing Framework Docs", "Production Case Studies"]
          });
        } else {
          dynamicWeeks.push({
            week: i,
            title: `Capstone Project & Skill Swap Mentorship`,
            description: `Build and deploy an end-to-end project to showcase in your portfolio and teach peers.`,
            topics: ["End-to-End Capstone Project", "Deployment & CI/CD Pipeline", "Code Review & Documentation", "Teaching & Swapping with Peers"],
            resources: ["Portfolio Project Templates", "Hosting & Cloud Guides", "SkillSwap AI Peer Feedback Community"]
          });
        }
      }

      roadmapData = {
        skill: skill.trim(),
        title: `${skill.trim()} (${level}) — ${weeksCount}-Week Roadmap`,
        level,
        goal: goal || `Achieve practical competence in ${skill.trim()} with verifiable projects.`,
        durationWeeks: weeksCount,
        weeks: dynamicWeeks
      };
    }

    return res.status(200).json({
      success: true,
      roadmap: roadmapData
    });

  } catch (error) {
    console.error("AI Roadmap Error:", error);
    res.status(500).json({ message: "Failed to generate AI roadmap", error: error.message });
  }
};

// ==========================================
// 2. GENERATE AI SKILL ASSESSMENT QUIZ
// ==========================================
const QUIZ_QUESTION_BANK = {
  javascript: [
    {
      id: 1,
      question: "What is the primary difference between `let`, `const`, and `var` in modern JavaScript?",
      options: [
        "`var` is block-scoped, while `let` and `const` are function-scoped",
        "`let` and `const` are block-scoped, whereas `var` is function-scoped and hoisted",
        "`const` allows reassignment but `let` does not",
        "There is no difference in ES6+"
      ],
      correctIndex: 1,
      explanation: "`let` and `const` respect block scope ({}) and live in the Temporal Dead Zone until declared, while `var` is function-scoped and hoisted with undefined."
    },
    {
      id: 2,
      question: "What does the JavaScript Event Loop do when a Promise resolves (`.then` callback)?",
      options: [
        "Places the callback into the Microtask Queue (executed before the next render/macrotask)",
        "Places the callback into the Macrotask (Task) Queue alongside setTimeout",
        "Executes it synchronously blocking all execution",
        "Spawns a new OS background thread"
      ],
      correctIndex: 0,
      explanation: "Promise callbacks are placed into the Microtask Queue, which drains completely after the current synchronous stack before any Macrotasks run."
    },
    {
      id: 3,
      question: "What will `console.log(typeof null)` output in JavaScript?",
      options: ["'null'", "'undefined'", "'object'", "'boolean'"],
      correctIndex: 2,
      explanation: "`typeof null` returns 'object' due to a historical legacy bug in the original JavaScript implementation where type tags for objects were 0."
    },
    {
      id: 4,
      question: "Which array method creates a NEW array populated with the results of calling a function on every element?",
      options: ["array.forEach()", "array.map()", "array.filter()", "array.reduce()"],
      correctIndex: 1,
      explanation: "`array.map()` returns a new array of transformed elements without mutating the original array."
    },
    {
      id: 5,
      question: "What is a Closure in JavaScript?",
      options: [
        "A syntax error caused by unclosed parentheses",
        "A function bundled with references to its surrounding lexical environment",
        "A way to terminate an infinite while loop",
        "A built-in method to close network sockets"
      ],
      correctIndex: 1,
      explanation: "A closure gives a function access to its outer scope even after the outer function has finished executing."
    }
  ],
  python: [
    {
      id: 1,
      question: "Which of the following data types in Python is IMMUTABLE?",
      options: ["List", "Dictionary", "Tuple", "Set"],
      correctIndex: 2,
      explanation: "Tuples and Strings in Python cannot be modified in-place after creation (they are immutable)."
    },
    {
      id: 2,
      question: "What is the purpose of the `*args` and `**kwargs` syntax in Python function definitions?",
      options: [
        "To enforce strict static type checking",
        "To accept arbitrary positional (*args) and keyword (**kwargs) arguments",
        "To declare pointer variables like in C/C++",
        "To create multi-threaded daemon workers"
      ],
      correctIndex: 1,
      explanation: "`*args` collects extra positional arguments into a tuple, while `**kwargs` collects extra keyword arguments into a dictionary."
    },
    {
      id: 3,
      question: "What does the `yield` keyword do when used inside a Python function?",
      options: [
        "Terminates the program immediately",
        "Pauses function execution and turns the function into a Generator yielding values one at a time",
        "Throws an exception caught by try/except",
        "Imports an external module"
      ],
      correctIndex: 1,
      explanation: "`yield` produces a value and suspends execution state, allowing memory-efficient lazy iteration."
    },
    {
      id: 4,
      question: "What is the Global Interpreter Lock (GIL) in CPython?",
      options: [
        "A mutex that prevents multiple native threads from executing Python bytecodes simultaneously",
        "A security firewall preventing file access",
        "A memory compression algorithm",
        "A compiler optimization for matrix multiplication"
      ],
      correctIndex: 0,
      explanation: "The GIL is a mutex in CPython that ensures only one thread executes Python bytecode at a time to keep reference counting thread-safe."
    },
    {
      id: 5,
      question: "Which built-in module provides support for JSON serialization in Python?",
      options: ["http", "json", "pickle", "marshal"],
      correctIndex: 1,
      explanation: "The standard `json` module provides `json.dumps()` and `json.loads()`."
    }
  ],
  react: [
    {
      id: 1,
      question: "Why should you never mutate React state directly (e.g. `state.count = 5`)?",
      options: [
        "It will throw a JavaScript syntax error",
        "React relies on shallow reference comparison to trigger component re-renders",
        "It deletes all child component props",
        "It causes an infinite HTTP loop"
      ],
      correctIndex: 1,
      explanation: "Direct mutation modifies the object in-place without changing reference identity, causing React to miss the update and skip re-rendering."
    },
    {
      id: 2,
      question: "What is the second argument passed to `useEffect` called, and what does `[]` mean?",
      options: [
        "Callback function; runs on every mouse hover",
        "Dependency array; an empty array [] means the effect runs only once after the initial mount",
        "Timeout delay in milliseconds",
        "Virtual DOM tree selector"
      ],
      correctIndex: 1,
      explanation: "The dependency array tells React when to re-run the effect. An empty array `[]` means it runs only after the initial mount."
    },
    {
      id: 3,
      question: "When should you use `useCallback` or `useMemo` in React?",
      options: [
        "On every single variable and function in the entire app",
        "To memoize expensive calculations or prevent unnecessary re-renders of optimized child components",
        "Only when making GraphQL API calls",
        "To replace standard HTML CSS classes"
      ],
      correctIndex: 1,
      explanation: "`useMemo` caches computed values and `useCallback` caches function definitions across renders to avoid redundant work."
    },
    {
      id: 4,
      question: "What is the key rule when rendering lists in React with `.map()`?",
      options: [
        "Every element must have a unique `key` prop so React can identify which items changed/added/removed",
        "All list items must be enclosed in an <iframe>",
        "You cannot render lists longer than 10 items",
        "Lists cannot contain click event handlers"
      ],
      correctIndex: 0,
      explanation: "React uses `key` props for efficient Virtual DOM reconciliation when lists update."
    },
    {
      id: 5,
      question: "What is the primary advantage of React Context API?",
      options: [
        "It speeds up network download speed",
        "It allows sharing state across the component tree without prop drilling at every level",
        "It replaces the need for backend databases",
        "It compiles React directly to WebAssembly"
      ],
      correctIndex: 1,
      explanation: "Context allows passing data through the component tree without manually threading props down through every intermediate component."
    }
  ],
  "machine learning": [
    {
      id: 1,
      question: "What is the difference between Supervised and Unsupervised Learning?",
      options: [
        "Supervised learning uses labeled training data, while unsupervised learning finds patterns in unlabeled data",
        "Unsupervised learning requires humans to label every sample manually",
        "Supervised learning only works on images",
        "There is no difference in modern deep learning"
      ],
      correctIndex: 0,
      explanation: "Supervised models learn input-to-output mappings from labeled targets, while unsupervised models discover latent structure and clusters in unlabeled data."
    },
    {
      id: 2,
      question: "What happens when a machine learning model suffers from Overfitting?",
      options: [
        "It performs poorly on both training and test data (high bias)",
        "It achieves very high accuracy on training data but fails to generalize to unseen test data (high variance)",
        "The model weights become NaN during training",
        "The dataset size is too large for GPU RAM"
      ],
      correctIndex: 1,
      explanation: "Overfitting occurs when a model memorizes noise in the training set, failing to generalize to new, unseen data."
    },
    {
      id: 3,
      question: "Which evaluation metric is preferred when evaluating a classification model on an imbalanced dataset?",
      options: ["Raw Accuracy", "F1-Score / PR-AUC", "Mean Squared Error", "R-Squared"],
      correctIndex: 1,
      explanation: "On imbalanced datasets (e.g. 99% negative, 1% positive), accuracy is misleading. F1-Score balances Precision and Recall."
    },
    {
      id: 4,
      question: "What is the primary role of Gradient Descent in training neural networks?",
      options: [
        "To iteratively update model weights in the direction opposite to the loss gradient to minimize the loss function",
        "To randomly guess parameters until one works",
        "To compress PNG image resolutions",
        "To encrypt trained model checkpoints"
      ],
      correctIndex: 0,
      explanation: "Gradient descent optimizes model weights by taking steps proportional to the negative of the gradient of the loss function."
    },
    {
      id: 5,
      question: "Which algorithm is commonly used for Dimensionality Reduction in ML?",
      options: ["K-Nearest Neighbors", "Principal Component Analysis (PCA)", "Linear Regression", "Apriori Algorithm"],
      correctIndex: 1,
      explanation: "PCA projects high-dimensional data onto orthogonal principal components with maximal variance, reducing feature dimensions."
    }
  ]
};

const generateQuiz = async (req, res) => {
  try {
    const { skill = "javascript", level = "Intermediate" } = req.body;
    const cleanSkill = skill.toLowerCase().trim();

    const matchedKey = Object.keys(QUIZ_QUESTION_BANK).find(k => 
      cleanSkill.includes(k) || k.includes(cleanSkill)
    );

    let questions;

    if (matchedKey) {
      questions = QUIZ_QUESTION_BANK[matchedKey];
    } else {
      // Dynamic questions for custom skill
      questions = [
        {
          id: 1,
          question: `What is the foundational architectural principle of ${skill}?`,
          options: [
            `Modularity and standard conventions of ${skill}`,
            "Direct hardware register manipulation",
            "Single-file monolithic script execution",
            "Pure XML document schemas"
          ],
          correctIndex: 0,
          explanation: `${skill} relies on clean modular design and standard conventions for maintainability.`
        },
        {
          id: 2,
          question: `How are exceptions and runtime errors typically handled in ${skill}?`,
          options: [
            "Structured try/catch or error propagation patterns",
            "Ignoring all errors silently",
            "Terminating the server immediately on any warning",
            "Restarting the entire operating system"
          ],
          correctIndex: 0,
          explanation: "Best practice across engineering involves structured error catching and logging."
        },
        {
          id: 3,
          question: `Which technique is recommended to optimize performance in ${skill}?`,
          options: [
            "Profiling bottlenecks, caching, and minimizing redundant operations",
            "Writing all code on a single line",
            "Disabling all variable types",
            "Calling APIs synchronously inside tight loops"
          ],
          correctIndex: 0,
          explanation: "Profiling, algorithmic efficiency, and caching are critical for high performance."
        },
        {
          id: 4,
          question: `What is the role of automated unit testing in ${skill} development?`,
          options: [
            "Ensures regression safety and verifies expected function outputs",
            "Slows down software without providing value",
            "Replaces the need for code compilers",
            "Deploys code to production automatically without verification"
          ],
          correctIndex: 0,
          explanation: "Automated tests verify correctness and ensure code changes do not break existing behavior."
        },
        {
          id: 5,
          question: `What is the recommended approach for state or data persistence in ${skill}?`,
          options: [
            "Using sanitized database connections with proper validation and indexing",
            "Storing credentials directly in public client source code",
            "Writing plain text files with no locking",
            "Hardcoding all values in global constants"
          ],
          correctIndex: 0,
          explanation: "Secure persistence with sanitized queries and indexes ensures safety and high throughput."
        }
      ];
    }

    // Return questions without revealing correct answer directly on payload if evaluating later
    res.status(200).json({
      success: true,
      skill,
      level,
      totalQuestions: questions.length,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options
      })),
      // internal assessment token payload for scoring
      _internalAnswers: questions.map(q => ({
        id: q.id,
        correctIndex: q.correctIndex,
        explanation: q.explanation
      }))
    });

  } catch (error) {
    console.error("AI Quiz Error:", error);
    res.status(500).json({ message: "Failed to generate AI quiz", error: error.message });
  }
};

// ==========================================
// 3. EVALUATE QUIZ & GRANT BADGE
// ==========================================
const evaluateQuiz = async (req, res) => {
  try {
    const { skill, userAnswers = {}, answersPayload = [] } = req.body;

    let correctCount = 0;
    const feedbackList = [];

    answersPayload.forEach((ans) => {
      const userSelected = userAnswers[ans.id];
      const isCorrect = Number(userSelected) === Number(ans.correctIndex);
      
      if (isCorrect) {
        correctCount++;
      }

      feedbackList.push({
        questionId: ans.id,
        isCorrect,
        userSelected,
        correctIndex: ans.correctIndex,
        explanation: ans.explanation
      });
    });

    const total = answersPayload.length || 5;
    const percentage = Math.round((correctCount / total) * 100);
    const passed = percentage >= 70;

    let badge = null;
    if (passed) {
      badge = {
        title: `Verified ${skill} Specialist`,
        icon: percentage >= 90 ? "🏆" : "🎖️",
        grade: percentage >= 90 ? "Expert" : "Proficient",
        score: percentage,
        issuedAt: new Date().toISOString()
      };
    }

    res.status(200).json({
      success: true,
      score: percentage,
      correctCount,
      totalQuestions: total,
      passed,
      badge,
      feedback: feedbackList
    });

  } catch (error) {
    console.error("AI Evaluation Error:", error);
    res.status(500).json({ message: "Failed to evaluate quiz", error: error.message });
  }
};

// ==========================================
// 4. RESUME SKILL GAP ANALYZER & MENTOR MATCHER
// ==========================================
const ROLE_SKILL_REQUIREMENTS = {
  "full stack developer": ["React", "Node.js", "MongoDB", "Express", "JavaScript", "SQL", "Git", "REST APIs", "TypeScript", "Docker"],
  "frontend developer": ["React", "JavaScript", "TypeScript", "HTML5", "CSS3", "TailwindCSS", "Redux", "UI/UX", "Next.js", "Git"],
  "backend developer": ["Node.js", "Express", "Python", "Java", "PostgreSQL", "MongoDB", "REST APIs", "Docker", "Redis", "Microservices"],
  "data scientist": ["Python", "Machine Learning", "Pandas", "NumPy", "SQL", "Statistics", "Data Visualization", "TensorFlow", "Scikit-Learn", "EDA"],
  "ai / ml engineer": ["Python", "PyTorch", "TensorFlow", "Deep Learning", "NLP", "Machine Learning", "Transformers", "LLMs", "FastAPI", "Docker"],
  "ui/ux designer": ["Figma", "UI/UX", "Wireframing", "User Research", "Prototyping", "Design Systems", "HTML5", "CSS3", "Accessibility"]
};

const analyzeResumeGap = async (req, res) => {
  try {
    const { resumeText = "", targetRole = "Full Stack Developer" } = req.body;
    const currentUserId = req.user?.id;

    if (!resumeText.trim()) {
      return res.status(400).json({ message: "Please paste your resume or list your current experience" });
    }

    const cleanRoleKey = Object.keys(ROLE_SKILL_REQUIREMENTS).find(r => 
      targetRole.toLowerCase().includes(r) || r.includes(targetRole.toLowerCase())
    ) || "full stack developer";

    const targetRequiredSkills = ROLE_SKILL_REQUIREMENTS[cleanRoleKey];

    // Detect skills in resume text using word boundary matching
    const identifiedSkills = [];
    const missingSkills = [];

    const lowerResume = resumeText.toLowerCase();

    targetRequiredSkills.forEach(skill => {
      const pattern = new RegExp(`\\b${skill.toLowerCase().replace(/[+]/g, "\\+")}\\b`, "i");
      if (pattern.test(lowerResume)) {
        identifiedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    // Also look for other general skills in resume
    const ALL_COMMON_SKILLS = ["Java", "Python", "React", "SQL", "JavaScript", "Node.js", "MongoDB", "Docker", "Kubernetes", "AWS", "C++", "C#", "Go", "Figma", "UI/UX", "Machine Learning"];
    ALL_COMMON_SKILLS.forEach(skill => {
      const pattern = new RegExp(`\\b${skill.toLowerCase().replace(/[+]/g, "\\+")}\\b`, "i");
      if (pattern.test(lowerResume) && !identifiedSkills.includes(skill)) {
        identifiedSkills.push(skill);
      }
    });

    const matchScore = Math.round((identifiedSkills.filter(s => targetRequiredSkills.includes(s)).length / targetRequiredSkills.length) * 100);

    // Cross-reference SkillSwap database for teachers who teach the missing skills!
    const query = {
      ...(currentUserId ? { _id: { $ne: currentUserId } } : {}),
      teachSkills: { $in: missingSkills.map(s => new RegExp(`^${s}$`, "i")) }
    };

    const mentorMatches = await User.find(query).select("-password").limit(6);

    const recommendedMentors = mentorMatches.map(user => {
      const canTeachMissing = user.teachSkills.filter(ts => 
        missingSkills.some(ms => ms.toLowerCase() === ts.toLowerCase())
      );

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        teachSkills: user.teachSkills,
        learnSkills: user.learnSkills,
        matchedGaps: canTeachMissing
      };
    });

    return res.status(200).json({
      success: true,
      targetRole,
      matchScore,
      identifiedSkills,
      missingSkills,
      recommendedMentors,
      advice: missingSkills.length === 0 
        ? `🎉 Outstanding! Your resume matches all standard requirements for ${targetRole}. Consider building complex capstone projects to show off your depth!`
        : `To become a standout ${targetRole}, focus on acquiring: ${missingSkills.slice(0, 3).join(", ")}. Connect with the recommended SkillSwap mentors below to accelerate your learning!`
    });

  } catch (error) {
    console.error("Resume Analysis Error:", error);
    res.status(500).json({ message: "Failed to analyze resume", error: error.message });
  }
};

// ==========================================
// 5. AI COPILOT / CHATBOT ASSISTANT
// ==========================================
const aiAssistantChat = async (req, res) => {
  try {
    const { message = "" } = req.body;
    const lower = message.toLowerCase().trim();

    if (!lower) {
      return res.status(400).json({ message: "Message is required" });
    }

    let reply = "";
    let action = null;

    if (lower.includes("roadmap") || lower.includes("learn path") || lower.includes("how to learn")) {
      reply = "I can generate a customized week-by-week learning roadmap for any skill or career goal! Visit our AI Roadmap generator to customize your timeline, track milestones, and check off topics.";
      action = { label: "Generate AI Roadmap 🗺️", link: "/roadmap" };
    } else if (lower.includes("resume") || lower.includes("gap") || lower.includes("job") || lower.includes("career")) {
      reply = "Our AI Resume Skill Gap Analyzer scans your current experience, detects missing industry requirements for your target role, and instantly matches you with mentors on SkillSwap who teach those skills!";
      action = { label: "Analyze Resume Gap 📄", link: "/resume-analyzer" };
    } else if (lower.includes("quiz") || lower.includes("test") || lower.includes("assessment") || lower.includes("badge") || lower.includes("verify")) {
      reply = "You can take AI Skill Assessments across JavaScript, Python, React, Machine Learning, and more to test your knowledge, pinpoint weak spots, and earn verified skill badges for your profile!";
      action = { label: "Take Skill Quiz 🧠", link: "/skill-assessment" };
    } else if (lower.includes("session") || lower.includes("schedule") || lower.includes("meeting")) {
      reply = "You can schedule 1-on-1 peer learning sessions directly with your connections or matched partners, join video calls, and leave verified reviews.";
      action = { label: "View Sessions 📅", link: "/sessions" };
    } else if (lower.includes("match") || lower.includes("partner") || lower.includes("swap") || lower.includes("find")) {
      reply = "SkillSwap uses 6-factor AI compatibility matching to pair you with users where you teach what they want to learn, and they teach what you want to learn. Check out Find Matches to explore reciprocal swaps!";
      action = { label: "Find Skill Matches 🔍", link: "/matches" };
    } else {
      reply = `Hello! I'm your **SkillSwap AI Copilot**. I can help you find optimal learning partners, generate structured career roadmaps, test your technical skills with AI quizzes, or analyze your resume skill gaps. What would you like to explore today?`;
    }

    return res.status(200).json({
      success: true,
      reply,
      action,
    });
  } catch (error) {
    console.error("AI Assistant Error:", error);
    res.status(500).json({ message: "AI Assistant failed", error: error.message });
  }
};

const Roadmap = require("../models/Roadmap");

// ==========================================
// 6. PERSISTENT ROADMAP MANAGEMENT
// ==========================================

// Save or Update Roadmap
const saveRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill, title, level, durationWeeks, goal, weeks } = req.body;

    if (!skill || !weeks) {
      return res.status(400).json({ message: "Skill and weekly milestones are required." });
    }

    let existing = await Roadmap.findOne({ user: userId, skill: skill.trim() });

    if (existing) {
      existing.title = title || existing.title;
      existing.level = level || existing.level;
      existing.durationWeeks = durationWeeks || existing.durationWeeks;
      existing.goal = goal || existing.goal;
      existing.weeks = weeks;
      await existing.save();
      return res.status(200).json({ success: true, message: "Roadmap updated!", roadmap: existing });
    }

    const newRoadmap = new Roadmap({
      user: userId,
      skill: skill.trim(),
      title: title || `${skill.trim()} (${level || "Beginner"}) Mastery Roadmap`,
      level: level || "Beginner",
      durationWeeks: Number(durationWeeks) || 4,
      goal: goal || "",
      weeks,
      progress: 0,
    });

    await newRoadmap.save();

    res.status(201).json({
      success: true,
      message: "Roadmap saved to your profile!",
      roadmap: newRoadmap,
    });
  } catch (error) {
    console.error("Save Roadmap Error:", error);
    res.status(500).json({ message: "Failed to save roadmap", error: error.message });
  }
};

// Get all saved roadmaps for logged-in user
const getMyRoadmaps = async (req, res) => {
  try {
    const userId = req.user.id;
    const roadmaps = await Roadmap.find({ user: userId }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      roadmaps,
      count: roadmaps.length,
    });
  } catch (error) {
    console.error("Get Roadmaps Error:", error);
    res.status(500).json({ message: "Failed to load saved roadmaps", error: error.message });
  }
};

// Toggle Topic completion & recalculate percentage
const toggleRoadmapTopic = async (req, res) => {
  try {
    const userId = req.user.id;
    const { roadmapId } = req.params;
    const { weekNum, topic } = req.body;

    const roadmap = await Roadmap.findOne({ _id: roadmapId, user: userId });
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    const weekIndex = roadmap.weeks.findIndex((w) => w.week === Number(weekNum));
    if (weekIndex === -1) {
      return res.status(400).json({ message: "Week not found in roadmap" });
    }

    const currentCompleted = roadmap.weeks[weekIndex].completedTopics || [];
    if (currentCompleted.includes(topic)) {
      roadmap.weeks[weekIndex].completedTopics = currentCompleted.filter((t) => t !== topic);
    } else {
      roadmap.weeks[weekIndex].completedTopics.push(topic);
    }

    // Recalculate total progress
    let totalTopics = 0;
    let completedTopicsCount = 0;

    roadmap.weeks.forEach((w) => {
      totalTopics += (w.topics || []).length;
      completedTopicsCount += (w.completedTopics || []).length;
    });

    roadmap.progress = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;
    await roadmap.save();

    res.status(200).json({
      success: true,
      progress: roadmap.progress,
      roadmap,
    });
  } catch (error) {
    console.error("Toggle Topic Error:", error);
    res.status(500).json({ message: "Failed to update topic progress", error: error.message });
  }
};

module.exports = {
  generateRoadmap,
  generateQuiz,
  evaluateQuiz,
  analyzeResumeGap,
  aiAssistantChat,
  saveRoadmap,
  getMyRoadmaps,
  toggleRoadmapTopic,
};
