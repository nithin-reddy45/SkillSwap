# 🚀 SkillSwap AI

SkillSwap AI is a full-stack MERN application that helps users connect with people who can teach the skills they want to learn.

Users can create profiles, add their skills, find suitable skill matches, send connection requests, accept or reject requests, and communicate through real-time chat.

---

## 📌 Project Overview

SkillSwap AI is a skill exchange platform where users can connect based on their teaching and learning interests.

### Example

**User A**

- Can Teach: Java, React
- Wants to Learn: Python, Machine Learning

**User B**

- Can Teach: Python, Machine Learning
- Wants to Learn: Java

The application helps these users find each other and exchange their skills.

---

# ✨ Features

## 🔐 Authentication

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Secure password storage

## 👤 User Profile

Users can:

- Update their profile
- View their email
- Add skills they can teach
- Remove teaching skills
- Add skills they want to learn
- Remove learning skills

## 🔍 Find Matches

Users can find people based on skill compatibility.

The application matches users who can teach the skills another user wants to learn.

## 🤝 Connection System

Users can:

- Send connection requests
- Receive incoming requests
- Accept connection requests
- Reject connection requests
- View accepted connections

## 🔔 Real-Time Features

Using Socket.IO:

- Real-time connection requests
- Real-time connection updates
- Online/offline user status
- Typing indicators
- Real-time messaging

## 💬 Chat System

Connected users can:

- Start conversations
- Send messages
- Receive messages in real time
- View previous messages
- See typing indicators

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- React Router DOM
- JavaScript
- CSS
- Socket.IO Client

## Backend

- Node.js
- Express.js
- JWT Authentication
- Socket.IO

## Database

- MongoDB
- Mongoose

---

# 📁 Project Structure

```text
SkillSwap/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── FindMatches.jsx
│   │   ├── Requests.jsx
│   │   ├── MyConnections.jsx
│   │   ├── Messages.jsx
│   │   └── Chat.jsx
│   │
│   ├── socket.js
│   ├── App.jsx
│   └── main.jsx
│
├── server/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── connectionController.js
│   │   └── messageController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Connection.js
│   │   └── Message.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── connectionRoutes.js
│   │   └── messageRoutes.js
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Move into the project folder:

```bash
cd SkillSwap
```

---

# 💻 Frontend Setup

Install frontend dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

---

# 🔧 Backend Setup

Open another terminal and move into the server folder:

```bash
cd server
```

Install backend dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

Start the backend:

```bash
npm run dev
```

Or, if you don't use nodemon:

```bash
node server.js
```

The backend will run on:

```text
http://localhost:5000
```

---

# 🔄 Application Flow

```text
Register / Login
       ↓
Create Profile
       ↓
Add Teach & Learn Skills
       ↓
Find Skill Matches
       ↓
Send Connection Request
       ↓
Accept / Reject Request
       ↓
My Connections
       ↓
Messages
       ↓
Real-Time Chat
```

---

# 📸 Screenshots

You can add screenshots of:

- Home Page
- Register Page
- Login Page
- Dashboard
- User Profile
- Find Matches
- Connection Requests
- My Connections
- Messages
- Real-Time Chat

Example:

```md
## Login Page

![Login Page](screenshots/login.png)
```

---

# 🔮 Future Enhancements

- AI-based skill recommendations
- Profile pictures
- User ratings and reviews
- Video calling
- Advanced skill search
- Notifications
- Learning progress tracking
- Dark mode
- Cloud deployment

---

# 👨‍💻 Author

**Nithin Reddy Thumma**

B.Tech – Computer Science and Engineering  
AI & Data Science

---

# ⭐ Conclusion

SkillSwap AI is a MERN stack application designed to connect people based on their skills and learning interests.

This project demonstrates:

- Full-stack web development
- Authentication and authorization
- MongoDB database integration
- REST API development
- Skill-based user matching
- Connection request management
- Real-time communication using Socket.IO
- React frontend development

⭐ If you like this project, consider giving it a star!