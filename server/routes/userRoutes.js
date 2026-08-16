const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  getMatches,
  verifySkill,
  getLeaderboard,
} = require("../controllers/userController");

// User Profile
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// Skill Matches
router.get("/matches", authMiddleware, getMatches);

// Skill Verification
router.post("/verify-skill", authMiddleware, verifySkill);

// Leaderboard
router.get("/leaderboard", getLeaderboard);

module.exports = router;