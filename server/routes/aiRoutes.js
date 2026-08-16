const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  generateRoadmap,
  generateQuiz,
  evaluateQuiz,
  analyzeResumeGap,
  aiAssistantChat,
  saveRoadmap,
  getMyRoadmaps,
  toggleRoadmapTopic,
} = require("../controllers/aiController");

// AI Roadmap Generation (Public / Authenticated)
router.post("/roadmap", generateRoadmap);
router.post("/roadmap/save", authMiddleware, saveRoadmap);
router.get("/roadmap/my-roadmaps", authMiddleware, getMyRoadmaps);
router.put("/roadmap/:roadmapId/toggle-topic", authMiddleware, toggleRoadmapTopic);

// AI Skill Assessment & Quiz
router.post("/quiz", generateQuiz);
router.post("/quiz/evaluate", evaluateQuiz);

// AI Resume Gap Analysis
router.post("/resume-gap", analyzeResumeGap);

// AI Copilot Chatbot
router.post("/assistant", aiAssistantChat);

module.exports = router;
