const express = require("express");
const router = express.Router();

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");


// ===============================
// TEST USER ROUTE
// ===============================
router.get("/test", (req, res) => {
  res.json({
    message: "User routes are working!",
  });
});


// ===============================
// GET LOGGED-IN USER PROFILE
// ===============================
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("Get Profile Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ===============================
// UPDATE USER PROFILE
// ===============================
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, teachSkills, learnSkills } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update name
    if (name !== undefined) {
      user.name = name;
    }

    // Update skills user can teach
    if (teachSkills !== undefined) {
      user.teachSkills = teachSkills;
    }

    // Update skills user wants to learn
    if (learnSkills !== undefined) {
      user.learnSkills = learnSkills;
    }

    await user.save();

    // Get updated user without password
    const updatedUser = await User.findById(req.user.id)
      .select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Update Profile Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ===============================
// FIND SKILL MATCHES
// ===============================
router.get("/matches", authMiddleware, async (req, res) => {
  try {
    // Get currently logged-in user
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Find users who can teach skills
    // that the current user wants to learn
    const matches = await User.find({
      _id: {
        $ne: req.user.id,
      },

      teachSkills: {
        $in: currentUser.learnSkills,
      },
    }).select("-password");

    res.status(200).json({
      count: matches.length,
      matches,
    });

  } catch (error) {
    console.error("Find Matches Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


module.exports = router;