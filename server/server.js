const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const messageRoutes = require("./routes/messageRoutes");

dotenv.config();

connectDB();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Store online users
const onlineUsers = new Map();

// Make Socket.IO available in controllers
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "SkillSwap AI Backend is running successfully!",
  });
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins their personal room
  socket.on("join", (userId) => {
    const id = userId.toString();

    socket.join(id);

    // Store user as online
    onlineUsers.set(id, socket.id);

    console.log(`User ${id} is now online`);

    // Broadcast updated online users
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // User is typing
  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(receiverId.toString()).emit("typing", {
      senderId,
    });
  });

  // User stopped typing
  socket.on("stopTyping", ({ senderId, receiverId }) => {
    io.to(receiverId.toString()).emit("stopTyping", {
      senderId,
    });
  });

  // User disconnects
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);

        console.log(`User ${userId} is now offline`);
        break;
      }
    }

    // Broadcast updated online users
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});