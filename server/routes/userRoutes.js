const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  completeOnboarding,
  getMatches,
  getUserById,
  reportUser,
  verifySkill,
  getLeaderboard,
} = require("../controllers/userController");

// Public / Discover Leaderboard
router.get("/leaderboard", getLeaderboard);

// User Profile
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Onboarding
router.post("/onboarding", protect, completeOnboarding);

// Match Engine & Discover
router.get("/matches", protect, getMatches);

// User Public Profile Preview
router.get("/:userId", protect, getUserById);

// Report User
router.post("/report", protect, reportUser);

// Skill Verification
router.post("/verify-skill", protect, verifySkill);

module.exports = router;