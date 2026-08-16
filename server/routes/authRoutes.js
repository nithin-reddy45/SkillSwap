const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  googleAuth,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} = require("../controllers/authController");

// Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);

// Password Recovery Routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

module.exports = router;