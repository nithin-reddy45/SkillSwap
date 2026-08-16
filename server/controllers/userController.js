const User = require("../models/User");

// Helper to normalize teach/learn skills from strings or objects
const normalizeSkillList = (skills, isTeach = true) => {
  if (!Array.isArray(skills)) return [];
  return skills.map((item) => {
    if (typeof item === "string") {
      return isTeach
        ? { skill: item.trim(), level: "Intermediate", experience: "1 year", isVerified: false, verificationScore: 0 }
        : { skill: item.trim(), currentLevel: "Beginner", targetLevel: "Advanced" };
    }
    if (item && item.skill) {
      return isTeach
        ? {
            skill: item.skill.trim(),
            level: item.level || "Intermediate",
            experience: item.experience || "1 year",
            isVerified: !!item.isVerified,
            verificationScore: item.verificationScore || 0,
          }
        : {
            skill: item.skill.trim(),
            currentLevel: item.currentLevel || "Beginner",
            targetLevel: item.targetLevel || "Advanced",
          };
    }
    return null;
  }).filter(Boolean);
};

// ====================================================
// 1. GET PROFILE
// ====================================================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================================================
// 2. UPDATE PROFILE
// ====================================================
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      avatar,
      careerGoal,
      learningGoal,
      availability,
      preferredMode,
      teachSkills,
      learnSkills,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (careerGoal !== undefined) user.careerGoal = careerGoal;
    if (learningGoal !== undefined) user.learningGoal = learningGoal;
    if (availability !== undefined) user.availability = availability;
    if (preferredMode !== undefined) user.preferredMode = preferredMode;

    if (teachSkills !== undefined) {
      user.teachSkills = normalizeSkillList(teachSkills, true);
    }
    if (learnSkills !== undefined) {
      user.learnSkills = normalizeSkillList(learnSkills, false);
    }

    await user.save();

    const updatedUser = await User.findById(req.user.id).select("-password");
    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ====================================================
// 3. GET MATCHES (DYNAMIC 6-FACTOR AI ALGORITHM)
// ====================================================
const getMatches = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all other registered users
    const users = await User.find({ _id: { $ne: currentUserId } }).select("-password");

    const myLearnSkills = normalizeSkillList(currentUser.learnSkills, false);
    const myTeachSkills = normalizeSkillList(currentUser.teachSkills, true);

    const levelWeights = { Beginner: 1, Intermediate: 2, Advanced: 3 };

    const matches = users.map((otherUser) => {
      const otherTeachSkills = normalizeSkillList(otherUser.teachSkills, true);
      const otherLearnSkills = normalizeSkillList(otherUser.learnSkills, false);

      const canTeachMe = [];
      const canLearnFromMe = [];
      let levelMatchScore = 0;
      let levelComparisons = 0;

      // 1. Check what otherUser can teach me
      myLearnSkills.forEach((myLearn) => {
        const found = otherTeachSkills.find(
          (ot) => ot.skill.toLowerCase() === myLearn.skill.toLowerCase()
        );
        if (found) {
          canTeachMe.push(found);
          const teacherLevel = levelWeights[found.level] || 2;
          const learnerTarget = levelWeights[myLearn.targetLevel] || 3;
          levelMatchScore += teacherLevel >= learnerTarget ? 1 : 0.7;
          levelComparisons++;
        }
      });

      // 2. Check what I can teach otherUser
      myTeachSkills.forEach((myTeach) => {
        const found = otherLearnSkills.find(
          (ol) => ol.skill.toLowerCase() === myTeach.skill.toLowerCase()
        );
        if (found) {
          canLearnFromMe.push(found);
        }
      });

      // Factor 1: Skill Match (40%)
      const skillFactor = canTeachMe.length > 0 ? Math.min(canTeachMe.length * 20, 40) : 0;

      // Factor 2: Reciprocal Swap (20%)
      const isReciprocal = canTeachMe.length > 0 && canLearnFromMe.length > 0;
      const reciprocalFactor = isReciprocal ? 20 : (canLearnFromMe.length > 0 ? 10 : 0);

      // Factor 3: Level Compatibility (15%)
      const levelFactor = levelComparisons > 0 ? Math.round((levelMatchScore / levelComparisons) * 15) : 10;

      // Factor 4: Availability Match (10%)
      let availabilityFactor = 5;
      if (currentUser.availability === otherUser.availability || currentUser.availability === "Flexible" || otherUser.availability === "Flexible") {
        availabilityFactor = 10;
      }

      // Factor 5: User Rating & Experience (10%)
      const rating = otherUser.avgRating || 5.0;
      const ratingFactor = Math.min(Math.round((rating / 5.0) * 10), 10);

      // Factor 6: Career & Learning Goal Alignment (5%)
      let goalFactor = 2;
      const myGoal = (currentUser.careerGoal || "").toLowerCase();
      const otherGoal = (otherUser.careerGoal || "").toLowerCase();
      if (myGoal && otherGoal && (myGoal.includes(otherGoal) || otherGoal.includes(myGoal))) {
        goalFactor = 5;
      }

      // Total Dynamic Score (Clamped 15 - 98)
      let totalScore = skillFactor + reciprocalFactor + levelFactor + availabilityFactor + ratingFactor + goalFactor;
      totalScore = Math.max(15, Math.min(totalScore, 98));

      // Dynamic "Why this match?" Explanation
      const whyReasons = [];
      if (canTeachMe.length > 0) {
        whyReasons.push(`Can teach you ${canTeachMe.map((s) => s.skill).join(", ")}`);
      }
      if (canLearnFromMe.length > 0) {
        whyReasons.push(`Wants to learn your ${canLearnFromMe.map((s) => s.skill).join(", ")}`);
      }
      if (isReciprocal) {
        whyReasons.push("⭐ Perfect 2-way reciprocal skill exchange");
      }
      if (availabilityFactor === 10) {
        whyReasons.push(`Both available on ${otherUser.availability || "Flexible schedules"}`);
      }
      if (rating >= 4.8) {
        whyReasons.push(`Highly rated mentor (${rating.toFixed(1)} ★)`);
      }

      const explanation = whyReasons.join(" • ") || "Compatible learner on the platform";

      return {
        user: {
          id: otherUser._id,
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          avatar: otherUser.avatar || "",
          bio: otherUser.bio || "",
          careerGoal: otherUser.careerGoal || "",
          availability: otherUser.availability || "Flexible",
          preferredMode: otherUser.preferredMode || "Online",
          avgRating: otherUser.avgRating || 5.0,
          completedSessionsCount: otherUser.completedSessionsCount || 0,
          verifiedSkills: otherUser.verifiedSkills || [],
          teachSkills: otherTeachSkills,
          learnSkills: otherLearnSkills,
        },
        matchPercentage: totalScore,
        isReciprocal,
        canTeachMe: canTeachMe.map((s) => s.skill),
        canLearnFromMe: canLearnFromMe.map((s) => s.skill),
        explanation,
        breakdown: {
          skillsMatch: skillFactor,
          reciprocalBonus: reciprocalFactor,
          levelAlignment: levelFactor,
          availabilityScore: availabilityFactor,
          ratingScore: ratingFactor,
          goalAlignment: goalFactor,
        },
      };
    });

    // Sort descending by calculated compatibility
    const sortedMatches = matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json(sortedMatches);
  } catch (error) {
    console.error("Match Error:", error);
    res.status(500).json({ message: "Failed to calculate skill matches", error: error.message });
  }
};

// ====================================================
// 4. VERIFY SKILL (AFTER PASSING ASSESSMENT/ARENA)
// ====================================================
const verifySkill = async (req, res) => {
  try {
    const { skill, score = 80 } = req.body;
    if (!skill) {
      return res.status(400).json({ message: "Skill name is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cleanSkill = skill.trim();

    // Check if in verifiedSkills
    if (!user.verifiedSkills.includes(cleanSkill)) {
      user.verifiedSkills.push(cleanSkill);
    }

    // Check teachSkills and update isVerified flag
    let foundInTeach = false;
    user.teachSkills = (user.teachSkills || []).map((ts) => {
      const skillName = typeof ts === "string" ? ts : ts.skill;
      if (skillName.toLowerCase() === cleanSkill.toLowerCase()) {
        foundInTeach = true;
        return {
          skill: cleanSkill,
          level: typeof ts === "object" ? ts.level : "Intermediate",
          experience: typeof ts === "object" ? ts.experience : "1 year",
          isVerified: true,
          verificationScore: score,
        };
      }
      return typeof ts === "string"
        ? { skill: ts, level: "Intermediate", experience: "1 year", isVerified: false, verificationScore: 0 }
        : ts;
    });

    if (!foundInTeach) {
      user.teachSkills.push({
        skill: cleanSkill,
        level: score >= 90 ? "Advanced" : "Intermediate",
        experience: "1+ years",
        isVerified: true,
        verificationScore: score,
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `🎉 Skill "${cleanSkill}" verified successfully!`,
      verifiedSkills: user.verifiedSkills,
      teachSkills: user.teachSkills,
    });
  } catch (error) {
    console.error("Verify Skill Error:", error);
    res.status(500).json({ message: "Failed to verify skill", error: error.message });
  }
};

// ====================================================
// 5. GET LEADERBOARD
// ====================================================
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    const BADGES_POOL = [
      "🏆 Grandmaster Mentor",
      "⚡ Code Wizard",
      "🔥 Swap Legend",
      "🌟 AI Pioneer",
      "🎖️ Fast Learner",
      "🚀 Full Stack Pro",
    ];

    const leaderboard = users.map((user, idx) => {
      const teachSkills = normalizeSkillList(user.teachSkills, true);
      const learnSkills = normalizeSkillList(user.learnSkills, false);

      const teachCount = teachSkills.length;
      const verifiedCount = (user.verifiedSkills || []).length;
      const sessions = user.completedSessionsCount || Math.max(1, teachCount * 3);
      const rating = user.avgRating || 5.0;

      const basePoints = teachCount * 350 + learnSkills.length * 150 + verifiedCount * 500;
      const totalPoints = basePoints + sessions * 50;

      const streak = Math.max(2, (user.name.length * 2) % 21);
      const badge = BADGES_POOL[idx % BADGES_POOL.length];

      return {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        careerGoal: user.careerGoal || "Software Engineer",
        teachSkills: teachSkills.map((s) => s.skill),
        learnSkills: learnSkills.map((s) => s.skill),
        verifiedSkills: user.verifiedSkills || [],
        points: totalPoints,
        swapsCompleted: sessions,
        rating: Number(rating.toFixed(1)),
        streakDays: streak,
        badge,
      };
    });

    leaderboard.sort((a, b) => b.points - a.points);

    const rankedList = leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    res.status(200).json({
      success: true,
      totalUsers: rankedList.length,
      leaderboard: rankedList,
    });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({ message: "Failed to load leaderboard", error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getMatches,
  verifySkill,
  getLeaderboard,
};