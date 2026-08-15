const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// Email regex validator
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password, teachSkills, learnSkills } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: trimmedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert comma-separated skills into arrays
    const teachSkillsArray =
      typeof teachSkills === "string"
        ? teachSkills.split(",").map((skill) => skill.trim()).filter(Boolean)
        : teachSkills || [];

    const learnSkillsArray =
      typeof learnSkills === "string"
        ? learnSkills.split(",").map((skill) => skill.trim()).filter(Boolean)
        : learnSkills || [];

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      password: hashedPassword,
      teachSkills: teachSkillsArray,
      learnSkills: learnSkillsArray,
    });

    res.status(201).json({
      message: "User registered successfully",
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
// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
const token = jwt.sign(
  {
    id: user._id,
    email: user.email,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d",
  }
);

res.status(200).json({
  message: "Login successful",
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
      message: "Login failed",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};