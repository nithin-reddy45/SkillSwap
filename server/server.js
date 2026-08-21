const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const messageRoutes = require("./routes/messageRoutes");
const compilerRoutes = require("./routes/compilerRoutes");
const aiRoutes = require("./routes/aiRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");

connectDB();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Store online users
const onlineUsers = new Map();

// Make Socket.IO available in controllers
app.set("io", io);

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/compiler", compilerRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

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
    if (!userId) return;
    const id = userId.toString();

    socket.join(id);

    // Store user as online
    onlineUsers.set(id, socket.id);

    console.log(`User ${id} joined room and is online`);

    // Broadcast updated online users
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // User is typing
  socket.on("typing", ({ senderId, receiverId }) => {
    if (!receiverId) return;
    io.to(receiverId.toString()).emit("typing", {
      senderId,
    });
  });

  // User stopped typing
  socket.on("stopTyping", ({ senderId, receiverId }) => {
    if (!receiverId) return;
    io.to(receiverId.toString()).emit("stopTyping", {
      senderId,
    });
  });

  // ================= WEBRTC CALL SIGNALING =================

  // Call user (Video / Voice)
  socket.on("callUser", ({ userToCall, signalData, from, fromName, isVideo }) => {
    if (!userToCall) return;
    io.to(userToCall.toString()).emit("incomingCall", {
      signal: signalData,
      from,
      fromName,
      isVideo,
    });
  });

  // Answer call
  socket.on("answerCall", ({ to, signal }) => {
    if (!to) return;
    io.to(to.toString()).emit("callAccepted", {
      signal,
    });
  });

  // Relay ICE Candidate
  socket.on("iceCandidate", ({ to, candidate }) => {
    if (!to) return;
    io.to(to.toString()).emit("iceCandidate", {
      candidate,
    });
  });

  // End call
  socket.on("endCall", ({ to }) => {
    if (!to) return;
    io.to(to.toString()).emit("callEnded");
  });

  // Reject call
  socket.on("rejectCall", ({ to }) => {
    if (!to) return;
    io.to(to.toString()).emit("callRejected");
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