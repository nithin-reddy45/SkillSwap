const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createSession,
  getMySessions,
  updateSessionStatus,
} = require("../controllers/sessionController");

// Sessions CRUD
router.post("/", authMiddleware, createSession);
router.get("/my-sessions", authMiddleware, getMySessions);
router.put("/:sessionId/status", authMiddleware, updateSessionStatus);

module.exports = router;
