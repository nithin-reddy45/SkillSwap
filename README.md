# ⚡ SkillSwap AI — AI-Powered Skill Swap & Peer Learning Platform

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-blue?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-emerald?logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/RealTime-Socket.IO%20WebSockets-black?logo=socket.io)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-purple)](#-license)

**SkillSwap AI** is a modern, full-stack, AI-powered peer-to-peer skill exchange platform. It enables developers and learners worldwide to trade knowledge directly—for example, teaching **Java** in exchange for learning **Python**—with zero monetary cost.

The platform combines intelligent **6-factor reciprocal matching**, structured swap agreements, real-time collaboration with in-chat code sharing and WebRTC video calls, AI learning roadmaps & assessments, gamified progress dashboards, and comprehensive administrator moderation.

---

## 🌟 Core System Highlights

```
                       ┌──────────────────────────────────────────────┐
                       │               SKILLSWAP AI                   │
                       │        AI-Powered Skill Exchange             │
                       └──────────────────────┬───────────────────────┘
                                              │
         ┌──────────────────┬─────────────────┼──────────────────┬──────────────────┐
         │                  │                 │                  │                  │
         ▼                  ▼                 ▼                  ▼                  ▼
┌─────────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌────────────────┐
│  Authentication │ │  6-Factor AI  │ │  Structured   │ │ Real-Time Chat│ │ Admin Control  │
│   & Onboarding  │ │ Match Engine  │ │ Skill Swaps   │ │  & Video Room │ │     Center     │
│ (4-Step Wizard) │ │(0-100% Score) │ │(4-Tab Manager)│ │ (Code Notepad)│ │  (Moderation)  │
└─────────────────┘ └───────────────┘ └───────────────┘ └───────────────┘ └────────────────┘
```

---

## 🚀 Key Feature Modules

### 1. 🔐 Authentication & Multi-Step Onboarding
* **Secure Auth**: JWT authentication, bcrypt password hashing, Google OAuth sign-in, and 6-digit email OTP password recovery.
* **4-Step Onboarding Wizard** (`/onboarding`):
  * **Step 1: Background**: Professional title, location, target career goal, and bio.
  * **Step 2: Skills You Can Teach**: Skill name, category, proficiency level (*Beginner/Intermediate/Advanced/Expert*), years of experience, and tags.
  * **Step 3: Skills You Want to Learn**: Target skill, category, current proficiency, and learning goals.
  * **Step 4: Schedule & Mode**: Set availability (*Flexible/Weekdays/Weekends/Evenings*) and preferred mode (*Online/In-Person/Hybrid*) + awards **+50 Bonus XP**.

### 2. ⚙️ Dedicated Skill Portfolio Management (`/my-skills`)
* Dual-card management for **"Skills I Can Teach"** and **"Skills I Want to Learn"**.
* Add, edit, categorize, and remove skills with rich metadata (years of experience, category, tags, descriptions).
* One-click action to **Verify Skill** via AI Assessment or **Generate Roadmap** for learning goals.

### 3. 🔍 6-Factor AI Skill Matching Engine (`/matches`)
* **Multi-Dimensional Compatibility Algorithm**:
  $$\text{Match Score} = 0.35(\text{Reciprocal}) + 0.25(\text{Complementary}) + 0.15(\text{Level}) + 0.10(\text{Schedule}) + 0.10(\text{Mode}) + 0.05(\text{Rating})$$
* **"✨ Best Matches For You" Spotlight**: Highlights top candidates with highest synergy.
* **Match Breakdown**: Transparently explains *why* candidates are recommended (*"You teach Java, they teach Python; shared weekend availability"*).
* **Multi-Criteria Discovery**: Search by skill/name/city, filter by category, level, learning mode, and availability.

### 4. 🤝 Structured Skill Swap System (`/requests`)
* **Proposal Modal**: Propose explicit exchanges (*"I will teach: Java" ⇄ "I want to learn: Python"*) with custom notes.
* **4-Tab Swap Center**:
  1. **📥 Received Proposals**: Review exchange terms, accept (+50 XP), or decline.
  2. **📤 Sent Proposals**: Track pending requests with cancellation option.
  3. **⚡ Active Swaps**: Enter active collaboration workspace with direct shortcuts to Chat, Session Scheduling, and Complete Swap (+100 XP).
  4. **✅ Completed Swaps**: View historical records and trigger star ratings/reviews.

### 5. 💬 Real-Time Chat & Collaborative Video Meetings
* **Socket.IO Real-Time Messaging**: Direct messaging, typing indicators, online/offline presence dots, emoji reactions, and unread counters.
* **In-Chat Code Snippet Sharing**: Monospace syntax-highlighted code composer with one-click **"📋 Copy Code"**.
* **1-on-1 Sessions Hub (`/sessions`)**: Schedule peer sessions with date, time, topic, Google Calendar sync, and downloadable `.ics` calendar files.
* **WebRTC Video Meet Room**: HD video/audio, screen sharing, and an in-call **Live Collaborative Code Notepad**.

### 6. 📊 Learning Progress Analytics Dashboard (`/dashboard`)
* **Interactive Metric Visuals**:
  * Weekly Learning & Teaching Hours bar chart.
  * Activity & Session Attendance heatmap.
  * Developer Leveling XP progress bar ($250\text{ XP}$ per level).
  * Skill Credits time-bank balance (+1 per session taught, +2 per verified test).
* **Gamification Badges**: 🏆 *First Skill Swap*, 🔥 *7-Day Streak*, 🎓 *Skill Master*, ⭐ *Top Mentor*.

### 7. 🧠 AI Skill Acceleration Ecosystem
* **🗺️ AI Learning Roadmap (`/roadmap`)**: Week-by-week structured curriculum with persistent checklists.
* **🧠 AI Skill Verification (`/skill-assessment`)**: Adaptive quizzes with automated grading; score $\ge 70\%$ to earn official verified badges (`✓ Verified`).
* **💻 Interactive Coding Sandbox (`/coding-test`)**: In-browser code runner supporting JavaScript, Python, C++, and Java.
* **📄 AI Resume Gap Matcher (`/resume-analyzer`)**: Scans resumes against target roles and matches mentors who teach missing technologies.
* **🤖 Floating AI Copilot**: Context-aware assistant available on every page to explain concepts and find mentors.

### 8. 🛡️ Admin Control Center (`/admin`)
* **Platform Analytics**: Total users, active swaps, completed exchanges, sessions, reviews, and 7-day user signup growth graphs.
* **User Management Table**: Search users, toggle role (*Admin / User*), view profiles, or delete accounts.
* **Moderation & Reports Queue**: Review reports submitted via the user report system (`/api/users/report`) with status toggles (*Pending / Resolved / Dismissed*).
* **Swaps Monitor**: Global ledger of active and completed peer agreements across the platform.

---

## 🛠️ Technology Stack

| Domain | Technology |
|---|---|
| **Frontend UI** | React 19, Vite, React Router DOM v7, Vanilla CSS Design System (Dark/Light themes, Glassmorphism) |
| **Backend API** | Node.js, Express.js (REST API, Error Middleware, CORS) |
| **Database** | MongoDB Atlas, Mongoose v9 (Normalized Schemas, Indexing) |
| **Real-Time Layer** | Socket.IO (Direct Messaging, Typing, Notifications, WebRTC Signaling) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs, Google OAuth |
| **AI Integration** | Google Gemini API & Contextual Knowledge Engine |
| **Email Services** | Nodemailer (6-Digit OTP Password Reset) |

---

## 📂 Repository Structure

```text
SkillSwap/
├── client/
│   ├── src/
│   │   ├── components/       # Modals (RequestSwap, UserProfile, ReportUser, ScheduleSession), Navbar, AiCopilot
│   │   ├── pages/            # Home, Onboarding, MySkills, FindMatches, Requests, Dashboard, AdminDashboard, Sessions, Chat, etc.
│   │   ├── config/           # API configuration (API_BASE_URL)
│   │   ├── socket.js         # Socket.IO client instance
│   │   ├── utils/            # Auth helpers, error formatters
│   │   ├── App.jsx           # Application route definitions
│   │   └── main.jsx          # React DOM entry point
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── config/               # Database connection (MongoDB Atlas DNS resolvers)
│   ├── controllers/          # auth, user, connection, admin, message, session, review, ai, notification
│   ├── middleware/           # authMiddleware (JWT protect & adminOnly guards)
│   ├── models/               # User, Connection, Report, Session, Message, Review, Roadmap, Notification
│   ├── routes/               # Express REST route definitions
│   ├── utils/                # emailService (OTP dispatcher)
│   ├── server.js             # HTTP & Socket.IO server entry point
│   └── package.json
│
├── start-all.bat             # 1-Click launcher for both backend & frontend
└── README.md
```

---

## 🚦 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [MongoDB Atlas](https://www.mongodb.com/) cluster or local MongoDB instance

---

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/skillswap?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key_2026
CLIENT_URL=http://localhost:5173

# Optional: Google Gemini API Key for live AI roadmaps & copilot
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:
```bash
node server.js
# Backend listening on http://localhost:5000
```

---

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
# Frontend live at http://localhost:5173
```

---

### 3. One-Click Launcher (Windows)
Double-click `start-all.bat` from the root directory to automatically launch both the backend server and Vite client in separate terminal windows.

---

## 🔒 Security & Data Integrity
* **Role-Based Access Control**: `protect` and `adminOnly` route middleware verifying user credentials and privilege levels.
* **Relational Guards**: Prevents self-swaps, duplicate requests, redundant reviews, and unauthorized chat room access.
* **Password Hashing**: Industry-standard `bcryptjs` encryption with 10 salt rounds.
* **Schema Backward Compatibility**: Normalizers handle both legacy string arrays and rich structured skill objects gracefully.

---

## 📝 License
This project is licensed under the [MIT License](LICENSE).
