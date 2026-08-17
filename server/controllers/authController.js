const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/emailService");

// Email regex validator
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ==========================================
// 1. REGISTER USER
// ==========================================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, teachSkills, learnSkills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teachSkillsArray =
      typeof teachSkills === "string"
        ? teachSkills.split(",").map((s) => ({ skill: s.trim(), level: "Intermediate", experience: "1 year" })).filter((s) => s.skill)
        : Array.isArray(teachSkills)
        ? teachSkills.map((s) => (typeof s === "string" ? { skill: s, level: "Intermediate", experience: "1 year" } : s))
        : [];

    const learnSkillsArray =
      typeof learnSkills === "string"
        ? learnSkills.split(",").map((s) => ({ skill: s.trim(), currentLevel: "Beginner", targetLevel: "Advanced" })).filter((s) => s.skill)
        : Array.isArray(learnSkills)
        ? learnSkills.map((s) => (typeof s === "string" ? { skill: s, currentLevel: "Beginner", targetLevel: "Advanced" } : s))
        : [];

    const user = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      password: hashedPassword,
      teachSkills: teachSkillsArray,
      learnSkills: learnSkillsArray,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        teachSkills: user.teachSkills,
        learnSkills: user.learnSkills,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ==========================================
// 2. LOGIN USER
// ==========================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        teachSkills: user.teachSkills,
        learnSkills: user.learnSkills,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// ==========================================
// 3. GOOGLE MAIL LOGIN / OAUTH
// ==========================================
const googleAuth = async (req, res) => {
  try {
    const { email, name, avatar, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Google account email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Create new user account via Google
      const randomPassword = Math.random().toString(36).slice(-10) + "Aa1!";
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name: name?.trim() || cleanEmail.split("@")[0],
        email: cleanEmail,
        password: hashedPassword,
        avatar: avatar || "",
        googleId: googleId || "",
        bio: "SkillSwap member via Google sign-in.",
        teachSkills: [
          { skill: "JavaScript", level: "Intermediate", experience: "1 year" },
        ],
        learnSkills: [
          { skill: "Python", currentLevel: "Beginner", targetLevel: "Advanced" },
        ],
      });
    } else {
      const updates = {};
      if (avatar && !user.avatar) updates.avatar = avatar;
      if (googleId && !user.googleId) updates.googleId = googleId;
      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        if (updates.avatar) user.avatar = updates.avatar;
        if (updates.googleId) user.googleId = updates.googleId;
      }
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Google sign-in successful! Welcome to SkillSwap AI.",
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        teachSkills: user.teachSkills,
        learnSkills: user.learnSkills,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Google authentication failed", error: error.message });
  }
};

// ==========================================
// 4. FORGOTTEN PASSWORD: SEND RESET OTP
// ==========================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email address" });
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordOTP: otp,
          resetPasswordExpires: expires,
        },
      }
    );

    // Dispatch email to the user's registered inbox
    await sendOTPEmail(user.email, user.name, otp);

    res.status(200).json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${cleanEmail}. Please check your inbox and spam folder.`,
      email: cleanEmail,
      otp, // Provided for instant verification & preview in development
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Failed to process password reset request", error: error.message });
  }
};

// ==========================================
// 5. VERIFY RESET OTP
// ==========================================
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and 6-digit OTP code are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      email: cleanEmail,
      resetPasswordOTP: otp.trim(),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset code. Please request a new one." });
    }

    res.status(200).json({
      success: true,
      message: "Reset code verified! Please set your new password.",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};

// ==========================================
// 6. RESET PASSWORD WITH NEW PASSWORD
// ==========================================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP code, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      email: cleanEmail,
      resetPasswordOTP: otp.trim(),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset code. Please restart the reset process." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          resetPasswordOTP: null,
          resetPasswordExpires: null,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "🎉 Password successfully reset! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};