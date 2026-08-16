export const COURSES_DATA = [
  {
    id: "course-react-full",
    title: "Full Stack React 19 & Next.js 15 Masterclass",
    category: "Web Development",
    level: "Intermediate",
    rating: 4.9,
    reviewCount: 3420,
    duration: "14 hours",
    lessonsCount: 42,
    badge: "🔥 Best Seller",
    instructor: "freeCodeCamp / Tech Lead",
    platform: "YouTube / Open Source",
    description: "Master React 19, Server Components, Next.js 15 App Router, Server Actions, Tailwind CSS, and Full Stack TypeScript development from scratch to production.",
    thumbnailGradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
    icon: "⚛️",
    primarySkill: "React",
    relatedSkills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript"],
    videoEmbedId: "bMknfKXIFA8",
    officialUrl: "https://react.dev/learn",
    syllabus: [
      {
        week: "Module 1",
        title: "Modern React Fundamentals & Hooks",
        topics: ["JSX & Virtual DOM Deep Dive", "useState, useEffect, useMemo, useCallback", "Custom Hooks & State Management", "Component Composition Patterns"]
      },
      {
        week: "Module 2",
        title: "React 19 & Next.js 15 App Router",
        topics: ["React Server Components (RSC)", "Server Actions & Form Handling", "Dynamic & Nested Routing", "Streaming & Suspense SSR"]
      },
      {
        week: "Module 3",
        title: "Full Stack Integration & Production",
        topics: ["Connecting to PostgreSQL & Prisma ORM", "Auth with NextAuth & JWT", "Optimistic UI Updates", "Deploying on Vercel with CI/CD"]
      }
    ],
    quiz: [
      {
        question: "What is the primary advantage of React 19 Server Components?",
        options: [
          "They eliminate the need for any CSS styling",
          "They render on the server, reducing the client-side JavaScript bundle size",
          "They replace standard HTML buttons",
          "They can only be used with SQL databases"
        ],
        correctAnswer: 1,
        explanation: "React Server Components run only on the server and do not add to the JavaScript bundle sent to the client, leading to faster initial loads and better performance."
      },
      {
        question: "Which hook should you use when you want to avoid re-calculating an expensive computation between re-renders?",
        options: ["useEffect", "useMemo", "useRef", "useReducer"],
        correctAnswer: 1,
        explanation: "useMemo caches the result of a calculation between re-renders unless its dependencies change."
      },
      {
        question: "How do Server Actions in Next.js enhance form handling?",
        options: [
          "They run asynchronous server-side mutations directly without needing manual REST endpoint setup",
          "They automatically convert forms into PDFs",
          "They disable client-side JavaScript completely",
          "They encrypt all HTML tags"
        ],
        correctAnswer: 0,
        explanation: "Server Actions allow you to run asynchronous code directly on the server triggered by form submissions or client interactions without manual API routes."
      }
    ]
  },
  {
    id: "course-python-ai",
    title: "Complete Python, Data Science & Machine Learning",
    category: "AI & Data Science",
    level: "Beginner to Advanced",
    rating: 4.95,
    reviewCount: 4890,
    duration: "20 hours",
    lessonsCount: 65,
    badge: "🌟 Top Rated",
    instructor: "Andrew Ng / Stanford AI",
    platform: "Coursera / YouTube",
    description: "End-to-end curriculum covering Python programming, NumPy, Pandas data wrangling, Scikit-Learn, Neural Networks, PyTorch, and deploying ML models.",
    thumbnailGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    icon: "🐍",
    primarySkill: "Python",
    relatedSkills: ["Python", "Machine Learning", "Data Science", "PyTorch", "Pandas"],
    videoEmbedId: "LHBE6Q9XlzI",
    officialUrl: "https://www.coursera.org/learn/machine-learning",
    syllabus: [
      {
        week: "Module 1",
        title: "Python & Scientific Computing Stack",
        topics: ["Python 3.12 Core Syntax & OOP", "NumPy Matrix Operations & Vectorization", "Pandas DataFrames & Cleaning", "Matplotlib & Seaborn Visualizations"]
      },
      {
        week: "Module 2",
        title: "Classical Machine Learning Algorithms",
        topics: ["Linear & Logistic Regression", "Decision Trees & Random Forests", "Support Vector Machines (SVM)", "Evaluation Metrics (ROC, AUC, F1-Score)"]
      },
      {
        week: "Module 3",
        title: "Deep Learning & PyTorch",
        topics: ["Feedforward Neural Networks", "Backpropagation & Gradient Descent", "CNNs for Computer Vision", "Transformers & LLM Intro"]
      }
    ],
    quiz: [
      {
        question: "Which Python library is specifically optimized for multidimensional array calculations with C-level speed?",
        options: ["Flask", "NumPy", "BeautifulSoup", "Django"],
        correctAnswer: 1,
        explanation: "NumPy provides high-performance multidimensional arrays and vectorized mathematical operations implemented in C."
      },
      {
        question: "In Machine Learning, what is overfitting?",
        options: [
          "When a model performs well on training data but poorly on unseen test data",
          "When the dataset has too few rows",
          "When the learning rate is set to zero",
          "When the computer runs out of RAM"
        ],
        correctAnswer: 0,
        explanation: "Overfitting happens when a model learns the training noise and specifics too closely, losing its ability to generalize to new data."
      }
    ]
  },
  {
    id: "course-dsa-java",
    title: "Data Structures & Algorithms in Java & C++",
    category: "DSA & Coding Interview",
    level: "Intermediate",
    rating: 4.88,
    reviewCount: 5120,
    duration: "25 hours",
    lessonsCount: 78,
    badge: "⚡ Interview Essential",
    instructor: "Abdul Bari / MIT OCW",
    platform: "MIT OpenCourseWare / YouTube",
    description: "Crack FAANG coding interviews! Comprehensive deep dive into Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, and Greedy Algorithms with LeetCode patterns.",
    thumbnailGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    icon: "💻",
    primarySkill: "DSA",
    relatedSkills: ["Java", "C++", "DSA", "Algorithms", "Problem Solving"],
    videoEmbedId: "8hly31xKli0",
    officialUrl: "https://leetcode.com/explore/",
    syllabus: [
      {
        week: "Module 1",
        title: "Time Complexity & Core Data Structures",
        topics: ["Big-O Asymptotic Analysis", "Dynamic Arrays & Sliding Window", "Singly & Doubly Linked Lists", "Stacks, Queues & Monotonic Stacks"]
      },
      {
        week: "Module 2",
        title: "Trees, Heaps & Graphs",
        topics: ["Binary Search Trees & AVL Balancing", "Min/Max Binary Heaps & Priority Queues", "BFS & DFS Graph Traversals", "Dijkstra's & Kruskal's Shortest Path"]
      },
      {
        week: "Module 3",
        title: "Dynamic Programming & Advanced Patterns",
        topics: ["Recursion & Memoization", "0/1 Knapsack & Unbounded Knapsack", "Longest Common Subsequence", "Bit Manipulation & Backtracking"]
      }
    ],
    quiz: [
      {
        question: "What is the average time complexity of searching an element in a balanced Binary Search Tree (BST)?",
        options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
        correctAnswer: 1,
        explanation: "Searching in a balanced BST cuts the search space in half at each step, yielding O(log N) time complexity."
      },
      {
        question: "Which algorithmic strategy is used when a problem exhibits 'Optimal Substructure' and 'Overlapping Subproblems'?",
        options: ["Greedy Method", "Divide and Conquer", "Dynamic Programming", "Brute Force"],
        correctAnswer: 2,
        explanation: "Dynamic Programming solves problems by breaking them into overlapping subproblems and caching intermediate solutions."
      }
    ]
  },
  {
    id: "course-genai-llm",
    title: "Generative AI, LangChain & LLM App Engineering",
    category: "AI & Data Science",
    level: "Advanced",
    rating: 4.96,
    reviewCount: 2900,
    duration: "12 hours",
    lessonsCount: 38,
    badge: "🚀 Trending Tech",
    instructor: "Harrison Chase / DeepLearning.AI",
    platform: "DeepLearning.AI / YouTube",
    description: "Build cutting-edge AI applications with OpenAI, Anthropic Claude, LangChain, LlamaIndex, Vector Databases (Pinecone/ChromaDB), and RAG pipelines.",
    thumbnailGradient: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    icon: "🤖",
    primarySkill: "GenAI",
    relatedSkills: ["GenAI", "LangChain", "Python", "Vector Databases", "Prompt Engineering"],
    videoEmbedId: "aywZrzNaKjs",
    officialUrl: "https://www.deeplearning.ai/",
    syllabus: [
      {
        week: "Module 1",
        title: "LLM Fundamentals & Prompt Engineering",
        topics: ["Transformer Architecture & Attention", "Few-Shot & Chain-of-Thought Prompting", "OpenAI & Anthropic API Integration", "Function Calling & Structured Outputs"]
      },
      {
        week: "Module 2",
        title: "Retrieval-Augmented Generation (RAG)",
        topics: ["Document Loaders & Chunking Strategies", "Text Embeddings & Vector Stores", "Semantic Search & Hybrid Retrieval", "Evaluating RAG with Ragas Framework"]
      },
      {
        week: "Module 3",
        title: "Autonomous Agents & Tool Calling",
        topics: ["LangGraph Multi-Agent Workflows", "Memory Management & Conversation History", "Local LLMs with Ollama", "Deploying Enterprise AI Agents"]
      }
    ],
    quiz: [
      {
        question: "What does RAG (Retrieval-Augmented Generation) do?",
        options: [
          "It retrains the LLM weights from scratch on a GPU cluster",
          "It retrieves relevant external documents and injects them into the LLM prompt context to produce factual answers",
          "It renders 3D graphics in the browser",
          "It compresses video files"
        ],
        correctAnswer: 1,
        explanation: "RAG combines search retrieval with LLM generation, allowing models to answer questions using private or real-time documents without retraining."
      }
    ]
  },
  {
    id: "course-system-design",
    title: "System Design for High-Scale Distributed Systems",
    category: "Cloud & Architecture",
    level: "Advanced",
    rating: 4.92,
    reviewCount: 3870,
    duration: "18 hours",
    lessonsCount: 50,
    badge: "🏆 Staff Engineer Pick",
    instructor: "Alex Xu / ByteByteGo",
    platform: "ByteByteGo / YouTube",
    description: "Learn how to design scalable, fault-tolerant architectures like Netflix, Uber, YouTube, and WhatsApp. Covers microservices, caching, Kafka, and sharding.",
    thumbnailGradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    icon: "🌐",
    primarySkill: "System Design",
    relatedSkills: ["System Design", "Microservices", "Kafka", "Redis", "Cloud Architecture"],
    videoEmbedId: "i7twT3x5yv8",
    officialUrl: "https://bytebytego.com/",
    syllabus: [
      {
        week: "Module 1",
        title: "Fundamentals of Scalability",
        topics: ["Horizontal vs Vertical Scaling", "Load Balancing Algorithms (Nginx, HAProxy)", "Caching Strategies (Redis, Memcached, Cache-Aside)", "Database Replication & Read Replicas"]
      },
      {
        week: "Module 2",
        title: "Distributed Storage & Messaging",
        topics: ["SQL vs NoSQL Tradeoffs", "Database Sharding & Consistent Hashing", "Message Queues with Apache Kafka & RabbitMQ", "CAP Theorem & Eventual Consistency"]
      },
      {
        week: "Module 3",
        title: "Real-World Architecture Case Studies",
        topics: ["Designing YouTube / Video Streaming", "Designing WhatsApp Real-Time Chat (WebSockets)", "Designing Uber Geospatial Matching", "Rate Limiting & DDoS Protection"]
      }
    ],
    quiz: [
      {
        question: "According to the CAP theorem, in the presence of a network partition, what tradeoff must a distributed system make?",
        options: [
          "Choose between Cost and Security",
          "Choose between Consistency and Availability",
          "Choose between CPU and RAM",
          "Choose between Frontend and Backend"
        ],
        correctAnswer: 1,
        explanation: "The CAP theorem states that a distributed data store can simultaneously provide at most two out of three guarantees: Consistency, Availability, and Partition Tolerance."
      }
    ]
  },
  {
    id: "course-docker-k8s",
    title: "Docker, Kubernetes & DevOps CI/CD Masterclass",
    category: "Cloud & DevOps",
    level: "Intermediate",
    rating: 4.87,
    reviewCount: 2940,
    duration: "16 hours",
    lessonsCount: 45,
    badge: "🐳 Cloud Favorite",
    instructor: "Nana Janashia / TechWorld with Nana",
    platform: "YouTube / DevOps",
    description: "Containerize microservices with Docker, manage container orchestration with Kubernetes clusters, write Helm charts, and build automated GitHub Actions CI/CD pipelines.",
    thumbnailGradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    icon: "🚢",
    primarySkill: "DevOps",
    relatedSkills: ["Docker", "Kubernetes", "DevOps", "CI/CD", "AWS"],
    videoEmbedId: "3c-iBn73dDE",
    officialUrl: "https://kubernetes.io/docs/tutorials/",
    syllabus: [
      {
        week: "Module 1",
        title: "Docker & Containerization Mastery",
        topics: ["Images, Containers & Dockerfile Best Practices", "Multi-stage Builds & Optimization", "Docker Compose Multi-Container Stacks", "Networking & Volume Persistence"]
      },
      {
        week: "Module 2",
        title: "Kubernetes Orchestration",
        topics: ["Pods, Deployments, Services & Ingress", "ConfigMaps & Secrets Management", "StatefulSets & Persistent Volumes", "Kubernetes Namespaces & Resource Limits"]
      },
      {
        week: "Module 3",
        title: "Automated CI/CD Pipelines",
        topics: ["GitHub Actions Workflow Automation", "Automated Testing & Security Scanning", "Helm Package Manager", "GitOps with ArgoCD"]
      }
    ],
    quiz: [
      {
        question: "What is the primary function of a Kubernetes Ingress?",
        options: [
          "To manage external HTTP/HTTPS routing to internal cluster services",
          "To format the hard drive on worker nodes",
          "To compile Java code into bytecode",
          "To store encrypted passwords in Git"
        ],
        correctAnswer: 0,
        explanation: "An Ingress exposes HTTP and HTTPS routes from outside the cluster to services within the cluster, providing load balancing, SSL termination, and name-based virtual hosting."
      }
    ]
  },
  {
    id: "course-uiux-figma",
    title: "Modern UI/UX Design & Figma Systems Masterclass",
    category: "UI/UX & Product Design",
    level: "Beginner to Intermediate",
    rating: 4.94,
    reviewCount: 3180,
    duration: "11 hours",
    lessonsCount: 34,
    badge: "🎨 Creative Pick",
    instructor: "Mizko / DesignCourse",
    platform: "Figma Academy / YouTube",
    description: "Design stunning mobile & web interfaces. Learn Auto-Layout 5.0, Design Tokens, Variables, Interactive Prototyping, Glassmorphism, and Developer Handoff.",
    thumbnailGradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
    icon: "🖌️",
    primarySkill: "UI/UX",
    relatedSkills: ["UI/UX", "Figma", "Design Systems", "Prototyping", "CSS"],
    videoEmbedId: "FTFaQWZBqQ8",
    officialUrl: "https://www.figma.com/resource-library/",
    syllabus: [
      {
        week: "Module 1",
        title: "Visual Design Hierarchy & Typography",
        topics: ["Color Theory, Contrast & 60-30-10 Rule", "Typography Pairing & Modular Scales", "Spacing Systems & 8pt Grid", "Glassmorphism & Neumorphic Nuances"]
      },
      {
        week: "Module 2",
        title: "Figma Advanced Component Architecture",
        topics: ["Auto-Layout nested flex structures", "Component Variants & Boolean Properties", "Figma Variables for Dark/Light Themes", "Interactive Micro-Animations & Smart Animate"]
      },
      {
        week: "Module 3",
        title: "Design Systems & Production Handoff",
        topics: ["Building Scalable Design Systems", "Accessibility (WCAG 2.1 AA/AAA) Auditing", "Responsive Mobile & Desktop Breakpoints", "Exporting Tokens to CSS/Tailwind"]
      }
    ],
    quiz: [
      {
        question: "In UI/UX design, what does the 8pt Grid System accomplish?",
        options: [
          "It forces all text fonts to be size 8",
          "It creates consistent spatial rhythm and alignment across buttons, margins, and layouts",
          "It limits color choices to 8 hues",
          "It reduces download time by 80%"
        ],
        correctAnswer: 1,
        explanation: "The 8pt grid uses multiples of 8 (8, 16, 24, 32, 48px) for margins, paddings, and element sizing to provide visual consistency and seamless developer handoff."
      }
    ]
  },
  {
    id: "course-flutter-mobile",
    title: "Flutter & Dart: Cross-Platform iOS & Android Apps",
    category: "Mobile App Development",
    level: "Beginner to Intermediate",
    rating: 4.89,
    reviewCount: 2650,
    duration: "22 hours",
    lessonsCount: 58,
    badge: "📱 Cross-Platform Hero",
    instructor: "Angela Yu / Google Flutter Team",
    platform: "App Brewery / YouTube",
    description: "Build beautiful native iOS and Android apps with single codebase using Flutter 3 and Dart. Features Bloc/Riverpod state management, Firebase, and REST API integration.",
    thumbnailGradient: "linear-gradient(135deg, #0284c7 0%, #6366f1 100%)",
    icon: "📱",
    primarySkill: "Flutter",
    relatedSkills: ["Flutter", "Dart", "Mobile App Development", "Firebase", "iOS/Android"],
    videoEmbedId: "VPvVD8t02U8",
    officialUrl: "https://docs.flutter.dev/get-started",
    syllabus: [
      {
        week: "Module 1",
        title: "Dart Programming & Widget Fundamentals",
        topics: ["Dart 3 Null Safety, Records & Pattern Matching", "Stateless vs Stateful Widgets", "Layouts: Column, Row, Stack & ListView", "Custom Themes & Styling"]
      },
      {
        week: "Module 2",
        title: "State Management & Architecture",
        topics: ["Provider & Riverpod State Containers", "Bloc Pattern & Event Streams", "Navigation 2.0 & Deep Linking", "Local Storage with Hive & SQLite"]
      },
      {
        week: "Module 3",
        title: "Backend Integration & App Store Deployment",
        topics: ["Firebase Authentication & Cloud Firestore", "Push Notifications with FCM", "Camera & Geolocation Native Plugins", "Publishing to Google Play & Apple App Store"]
      }
    ],
    quiz: [
      {
        question: "What is the key advantage of Flutter's rendering engine compared to traditional WebView-based frameworks?",
        options: [
          "Flutter compiles directly to native ARM machine code using its own Impeller/Skia engine without a bridge",
          "Flutter requires no code to be written",
          "Flutter only works on Desktop computers",
          "Flutter converts all graphics to HTML tables"
        ],
        correctAnswer: 0,
        explanation: "Flutter draws its own UI using native GPU acceleration via Impeller/Skia, delivering smooth 60/120fps performance without JavaScript bridge bottlenecks."
      }
    ]
  },
  {
    id: "course-cybersecurity",
    title: "Ethical Hacking & Network Penetration Testing",
    category: "Cybersecurity",
    level: "Intermediate to Advanced",
    rating: 4.91,
    reviewCount: 3340,
    duration: "15 hours",
    lessonsCount: 40,
    badge: "🛡️ Security Shield",
    instructor: "The Cyber Mentor / Heath Adams",
    platform: "TCM Security / YouTube",
    description: "Learn offensive security, reconnaissance, OWASP Top 10 vulnerabilities, Metasploit, Wireshark, SQL Injection, XSS, and Active Directory exploitation in safe labs.",
    thumbnailGradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    icon: "🔒",
    primarySkill: "Cybersecurity",
    relatedSkills: ["Cybersecurity", "Ethical Hacking", "Networking", "Linux", "Penetration Testing"],
    videoEmbedId: "3Kq1MIfTWCE",
    officialUrl: "https://owasp.org/www-project-top-ten/",
    syllabus: [
      {
        week: "Module 1",
        title: "Networking Basics & Reconnaissance",
        topics: ["TCP/IP, OSI Model & Subnetting", "Passive Recon & OSINT Techniques", "Port Scanning with Nmap", "Packet Sniffing with Wireshark"]
      },
      {
        week: "Module 2",
        title: "Web Application Penetration Testing",
        topics: ["OWASP Top 10 Vulnerabilities", "SQL Injection (SQLi) & Defense", "Cross-Site Scripting (XSS) & CSRF", "Burp Suite Proxy & Vulnerability Scanning"]
      },
      {
        week: "Module 3",
        title: "System Exploitation & Post-Exploitation",
        topics: ["Metasploit Framework & Payloads", "Linux & Windows Privilege Escalation", "Active Directory Attacks (Kerberoasting)", "Writing Comprehensive Penetration Test Reports"]
      }
    ],
    quiz: [
      {
        question: "Which type of vulnerability occurs when untrusted user input is executed directly in a database query?",
        options: ["Cross-Site Scripting (XSS)", "SQL Injection (SQLi)", "Denial of Service (DoS)", "Buffer Overflow"],
        correctAnswer: 1,
        explanation: "SQL Injection occurs when malicious user input modifies SQL query syntax, allowing attackers to access, alter, or destroy database records."
      }
    ]
  },
  {
    id: "course-nodejs-backend",
    title: "Node.js, Express & MongoDB Enterprise API Backend",
    category: "Web Development",
    level: "Intermediate",
    rating: 4.88,
    reviewCount: 3750,
    duration: "13 hours",
    lessonsCount: 36,
    badge: "⚡ Backend Core",
    instructor: "Brad Traversy / Traversy Media",
    platform: "YouTube / Traversy Media",
    description: "Build robust REST APIs and WebSocket servers with Node.js, Express, MongoDB Mongoose, JWT authentication, rate limiting, and Redis caching.",
    thumbnailGradient: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
    icon: "🟢",
    primarySkill: "Node.js",
    relatedSkills: ["Node.js", "Express", "MongoDB", "Backend", "REST APIs"],
    videoEmbedId: "Oe421EPjeBE",
    officialUrl: "https://nodejs.org/en/learn",
    syllabus: [
      {
        week: "Module 1",
        title: "Node.js Core Architecture & Event Loop",
        topics: ["Event Loop, Microtasks & Macrotasks", "File System (fs), Streams & Buffers", "HTTP Modules & Middleware Pipelines", "Error Handling & Async Patterns"]
      },
      {
        week: "Module 2",
        title: "Express & MongoDB Database Modeling",
        topics: ["RESTful API Route Architecture", "Mongoose Schema Design & Aggregation Pipelines", "Password Hashing with Bcrypt & JWT Tokens", "Input Validation with Zod/Joi"]
      },
      {
        week: "Module 3",
        title: "Real-Time WebSockets & Security",
        topics: ["Socket.IO Bi-Directional Events", "Rate Limiting & Helmet HTTP Headers", "Redis Caching for Fast API Responses", "Dockerizing & Cloud Deployment"]
      }
    ],
    quiz: [
      {
        question: "What is the primary advantage of Node.js's non-blocking I/O event-driven model?",
        options: [
          "It allows a single thread to handle thousands of concurrent connections efficiently without blocking on I/O operations",
          "It runs directly on graphic cards",
          "It forces synchronous execution for every loop",
          "It removes the need for databases"
        ],
        correctAnswer: 0,
        explanation: "Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient for I/O-intensive real-time applications."
      }
    ]
  },
  {
    id: "course-postgresql-sql",
    title: "PostgreSQL & Database Engineering Masterclass",
    category: "Database & Backend",
    level: "Beginner to Advanced",
    rating: 4.93,
    reviewCount: 2210,
    duration: "10 hours",
    lessonsCount: 30,
    badge: "🗄️ High Performance",
    instructor: "Hussein Nasser / PostgreSQL Team",
    platform: "YouTube / Database Engineering",
    description: "Master relational databases with PostgreSQL. Learn indexing (B-Tree, GIN, GiST), ACID transactions, query execution plans (EXPLAIN ANALYZE), partitioning, and replication.",
    thumbnailGradient: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
    icon: "🐘",
    primarySkill: "SQL",
    relatedSkills: ["SQL", "PostgreSQL", "Database Design", "Indexing", "Backend"],
    videoEmbedId: "qw--VYLpxG4",
    officialUrl: "https://www.postgresql.org/docs/",
    syllabus: [
      {
        week: "Module 1",
        title: "Relational Modeling & Advanced SQL Queries",
        topics: ["Normalization (1NF, 2NF, 3NF, BCNF)", "Complex Joins, Subqueries & CTEs (WITH)", "Window Functions (RANK, ROW_NUMBER, LAG, LEAD)", "JSONB Columns & Unstructured Querying"]
      },
      {
        week: "Module 2",
        title: "Performance, Indexing & Query Optimization",
        topics: ["EXPLAIN (ANALYZE, BUFFERS) Query Plans", "B-Tree vs Hash vs GIN vs BRIN Indexes", "Locking Modes, Deadlocks & MVCC", "Connection Pooling with PgBouncer"]
      },
      {
        week: "Module 3",
        title: "Scale, Partitioning & High Availability",
        topics: ["Declarative Table Partitioning by Range/List", "Streaming Replication & Failover", "WAL (Write-Ahead Logging) & Backup", "Database Security & Role-Based Access Control"]
      }
    ],
    quiz: [
      {
        question: "What does the EXPLAIN ANALYZE command in PostgreSQL do?",
        options: [
          "It actually executes the query, measures real execution time, and displays the planner's cost estimates alongside actual row counts",
          "It formats SQL syntax with color coding",
          "It deletes duplicate rows in the table",
          "It exports data to a CSV file"
        ],
        correctAnswer: 0,
        explanation: "EXPLAIN ANALYZE executes the statement and displays real run times and execution statistics along with the query optimizer's estimates."
      }
    ]
  },
  {
    id: "course-typescript-mastery",
    title: "TypeScript Deep Dive: Enterprise Scalable Codebases",
    category: "Web Development",
    level: "Intermediate to Advanced",
    rating: 4.95,
    reviewCount: 3100,
    duration: "9 hours",
    lessonsCount: 28,
    badge: "🛡️ Type Safety King",
    instructor: "Matt Pocock / Total TypeScript",
    platform: "Total TypeScript / YouTube",
    description: "Write bulletproof JavaScript with TypeScript. Master Generics, Conditional Types, Template Literal Types, Discriminated Unions, and utility types for production apps.",
    thumbnailGradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    icon: "🔷",
    primarySkill: "TypeScript",
    relatedSkills: ["TypeScript", "JavaScript", "React", "Frontend", "Node.js"],
    videoEmbedId: "BwuLxPH8IDs",
    officialUrl: "https://www.typescriptlang.org/docs/",
    syllabus: [
      {
        week: "Module 1",
        title: "Advanced Types & Generics",
        topics: ["Generics with Constraints (`T extends object`)", "Discriminated Unions & Exhaustive Checks", "Mapped Types & `keyof` Operator", "Type Narrowing & Custom Type Guards"]
      },
      {
        week: "Module 2",
        title: "Type Level Programming",
        topics: ["Conditional Types & `infer` Keyword", "Template Literal String Types", "Recursive Type Definitions", "Advanced Utility Types (`ReturnType`, `Parameters`)"]
      },
      {
        week: "Module 3",
        title: "TypeScript in Production Ecosystem",
        topics: ["Strict `tsconfig.json` Configuration", "Typing React 19 Components & Hooks", "Zod Schema Type Inference", "Monorepo Type Sharing with Turborepo"]
      }
    ],
    quiz: [
      {
        question: "In TypeScript, what is a Discriminated Union?",
        options: [
          "A union of types where each type shares a common literal property that TypeScript can use to narrow the type down in a switch/if block",
          "A type that rejects all string values",
          "A union that cannot be used in loops",
          "A method to delete variables from memory"
        ],
        correctAnswer: 0,
        explanation: "A discriminated union uses a common literal discriminant property (like `kind: 'circle' | 'square'`) allowing the compiler to safely narrow types."
      }
    ]
  }
];

export const CATEGORIES = [
  "All Categories",
  "Web Development",
  "AI & Data Science",
  "DSA & Coding Interview",
  "Cloud & DevOps",
  "Cloud & Architecture",
  "UI/UX & Product Design",
  "Mobile App Development",
  "Cybersecurity",
  "Database & Backend"
];
