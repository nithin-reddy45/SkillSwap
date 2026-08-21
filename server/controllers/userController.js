const User = require("../models/User");
const Report = require("../models/Report");
const Review = require("../models/Review");

// Helper to normalize teach/learn skills from strings or objects
const normalizeSkillList = (skills, isTeach = true) => {
  if (!Array.isArray(skills)) return [];
  return skills.map((item) => {
    if (typeof item === "string") {
      return isTeach
        ? {
            skill: item.trim(),
            category: "Development",
            description: "",
            level: "Intermediate",
            yearsExperience: "1 year",
            tags: [],
            isVerified: false,
            verificationScore: 0,
          }
        : {
            skill: item.trim(),
            category: "Development",
            description: "",
            currentLevel: "Beginner",
            targetLevel: "Advanced",
            tags: [],
          };
    }
    if (item && item.skill) {
      return isTeach
        ? {
            skill: item.skill.trim(),
            category: item.category || "Development",
            description: item.description || "",
            level: item.level || "Intermediate",
            yearsExperience: item.yearsExperience || item.experience || "1 year",
            tags: Array.isArray(item.tags) ? item.tags : [],
            isVerified: !!item.isVerified,
            verificationScore: item.verificationScore || 0,
          }
        : {
            skill: item.skill.trim(),
            category: item.category || "Development",
            description: item.description || "",
            currentLevel: item.currentLevel || "Beginner",
            targetLevel: item.targetLevel || "Advanced",
            tags: Array.isArray(item.tags) ? item.tags : [],
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
      location,
      profession,
      interests,
      careerGoal,
      learningGoal,
      availability,
      preferredMode,
      teachSkills,
      learnSkills,
      onboarded,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (location !== undefined) user.location = location;
    if (profession !== undefined) user.profession = profession;
    if (interests !== undefined && Array.isArray(interests)) user.interests = interests;
    if (careerGoal !== undefined) user.careerGoal = careerGoal;
    if (learningGoal !== undefined) user.learningGoal = learningGoal;
    if (availability !== undefined) user.availability = availability;
    if (preferredMode !== undefined) user.preferredMode = preferredMode;
    if (onboarded !== undefined) user.onboarded = !!onboarded;

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
// 3. COMPLETE ONBOARDING
// ====================================================
const completeOnboarding = async (req, res) => {
  try {
    const {
      avatar,
      bio,
      location,
      profession,
      interests,
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

    if (avatar) user.avatar = avatar;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (profession) user.profession = profession;
    if (interests) user.interests = interests;
    if (careerGoal) user.careerGoal = careerGoal;
    if (learningGoal) user.learningGoal = learningGoal;
    if (availability) user.availability = availability;
    if (preferredMode) user.preferredMode = preferredMode;

    if (teachSkills) user.teachSkills = normalizeSkillList(teachSkills, true);
    if (learnSkills) user.learnSkills = normalizeSkillList(learnSkills, false);

    user.onboarded = true;
    user.xp = (user.xp || 100) + 50; // Bonus onboarding XP
    await user.save();

    const updatedUser = await User.findById(req.user.id).select("-password");
    res.status(200).json({
      success: true,
      message: "🎉 Welcome aboard! Profile completed and +50 XP awarded.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Onboarding Error:", error);
    res.status(500).json({ message: "Failed to complete onboarding", error: error.message });
  }
};

// ====================================================
// 4. GET MATCHES (6-FACTOR AI ENGINE + ADVANCED SEARCH & FILTERS)
// ====================================================
const getMatches = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    let currentUser = null;

    if (currentUserId) {
      currentUser = await User.findById(currentUserId);
    }

    // Extract query parameters for Discover & Filter
    const {
      q = "",
      skill = "",
      category = "",
      level = "",
      location = "",
      mode = "",
      availability = "",
      sortBy = "score", // "score" | "rating" | "sessions"
    } = req.query;

    const queryConditions = {};
    if (currentUserId) {
      queryConditions._id = { $ne: currentUserId };
    }

    // Fetch candidate users
    const users = await User.find(queryConditions).select("-password");

    const myLearnSkills = currentUser ? normalizeSkillList(currentUser.learnSkills, false) : [];
    const myTeachSkills = currentUser ? normalizeSkillList(currentUser.teachSkills, true) : [];

    const levelWeights = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };

    let matches = users.map((otherUser) => {
      const otherTeachSkills = normalizeSkillList(otherUser.teachSkills, true);
      const otherLearnSkills = normalizeSkillList(otherUser.learnSkills, false);

      const canTeachMe = [];
      const canLearnFromMe = [];
      let levelMatchScore = 0;
      let levelComparisons = 0;

      // 1. What otherUser can teach me
      if (myLearnSkills.length > 0) {
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
      }

      // 2. What I can teach otherUser
      if (myTeachSkills.length > 0) {
        myTeachSkills.forEach((myTeach) => {
          const found = otherLearnSkills.find(
            (ol) => ol.skill.toLowerCase() === myTeach.skill.toLowerCase()
          );
          if (found) {
            canLearnFromMe.push(found);
          }
        });
      }

      // Factor 1: Skill Match (40%)
      const skillFactor = canTeachMe.length > 0 ? Math.min(canTeachMe.length * 20, 40) : (otherTeachSkills.length > 0 ? 15 : 5);

      // Factor 2: Reciprocal Swap (20%)
      const isReciprocal = canTeachMe.length > 0 && canLearnFromMe.length > 0;
      const reciprocalFactor = isReciprocal ? 20 : (canLearnFromMe.length > 0 ? 10 : 0);

      // Factor 3: Level Compatibility (15%)
      const levelFactor = levelComparisons > 0 ? Math.round((levelMatchScore / levelComparisons) * 15) : 10;

      // Factor 4: Availability & Mode Match (10%)
      let availabilityFactor = 5;
      if (
        currentUser &&
        (currentUser.availability === otherUser.availability ||
          currentUser.availability === "Flexible" ||
          otherUser.availability === "Flexible")
      ) {
        availabilityFactor = 10;
      }

      // Factor 5: User Rating & Experience (10%)
      const rating = otherUser.avgRating || 5.0;
      const ratingFactor = Math.min(Math.round((rating / 5.0) * 10), 10);

      // Factor 6: Career & Location Alignment (5%)
      let goalFactor = 2;
      const myGoal = (currentUser?.careerGoal || "").toLowerCase();
      const otherGoal = (otherUser.careerGoal || "").toLowerCase();
      if (myGoal && otherGoal && (myGoal.includes(otherGoal) || otherGoal.includes(myGoal))) {
        goalFactor = 5;
      }

      // Total Dynamic Score (Clamped 25 - 99)
      let totalScore = skillFactor + reciprocalFactor + levelFactor + availabilityFactor + ratingFactor + goalFactor;
      totalScore = Math.max(25, Math.min(totalScore, 99));

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
        whyReasons.push(`Similar schedule (${otherUser.availability || "Flexible"})`);
      }
      if (rating >= 4.8) {
        whyReasons.push(`Highly rated mentor (${rating.toFixed(1)} ★)`);
      }
      if (otherUser.location && currentUser?.location && otherUser.location.toLowerCase() === currentUser.location.toLowerCase()) {
        whyReasons.push(`Based in ${otherUser.location}`);
      }

      const explanation = whyReasons.join(" • ") || "Active developer with complementary skills";

      return {
        user: {
          id: otherUser._id,
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          avatar: otherUser.avatar || "",
          bio: otherUser.bio || "",
          location: otherUser.location || "",
          profession: otherUser.profession || "",
          interests: otherUser.interests || [],
          careerGoal: otherUser.careerGoal || "",
          availability: otherUser.availability || "Flexible",
          preferredMode: otherUser.preferredMode || "Online",
          avgRating: otherUser.avgRating || 5.0,
          completedSessionsCount: otherUser.completedSessionsCount || 0,
          verifiedSkills: otherUser.verifiedSkills || [],
          xp: otherUser.xp || 100,
          badges: otherUser.badges || [],
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

    // APPLY SEARCH & FILTERS
    if (q.trim()) {
      const cleanQ = q.trim().toLowerCase();
      matches = matches.filter((m) => {
        const u = m.user;
        const nameMatch = u.name.toLowerCase().includes(cleanQ);
        const bioMatch = u.bio.toLowerCase().includes(cleanQ);
        const teachMatch = u.teachSkills.some((ts) => ts.skill.toLowerCase().includes(cleanQ));
        const learnMatch = u.learnSkills.some((ls) => ls.skill.toLowerCase().includes(cleanQ));
        const locationMatch = u.location.toLowerCase().includes(cleanQ);
        return nameMatch || bioMatch || teachMatch || learnMatch || locationMatch;
      });
    }

    if (skill.trim()) {
      const cleanSkill = skill.trim().toLowerCase();
      matches = matches.filter((m) =>
        m.user.teachSkills.some((ts) => ts.skill.toLowerCase().includes(cleanSkill))
      );
    }

    if (category.trim() && category !== "All") {
      const cleanCat = category.trim().toLowerCase();
      matches = matches.filter((m) =>
        m.user.teachSkills.some((ts) => (ts.category || "").toLowerCase() === cleanCat)
      );
    }

    if (level.trim() && level !== "All") {
      matches = matches.filter((m) =>
        m.user.teachSkills.some((ts) => ts.level === level)
      );
    }

    if (location.trim()) {
      const cleanLoc = location.trim().toLowerCase();
      matches = matches.filter((m) => (m.user.location || "").toLowerCase().includes(cleanLoc));
    }

    if (mode.trim() && mode !== "All") {
      matches = matches.filter(
        (m) => m.user.preferredMode === mode || m.user.preferredMode === "Both" || m.user.preferredMode === "Hybrid"
      );
    }

    if (availability.trim() && availability !== "All") {
      matches = matches.filter(
        (m) => m.user.availability === availability || m.user.availability === "Flexible"
      );
    }

    // SORTING
    if (sortBy === "rating") {
      matches.sort((a, b) => (b.user.avgRating || 0) - (a.user.avgRating || 0));
    } else if (sortBy === "sessions") {
      matches.sort((a, b) => (b.user.completedSessionsCount || 0) - (a.user.completedSessionsCount || 0));
    } else {
      // Default: Sort by Match Score descending
      matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    res.status(200).json(matches);
  } catch (error) {
    console.error("Match Error:", error);
    res.status(500).json({ message: "Failed to calculate skill matches", error: error.message });
  }
};

// ====================================================
// 5. GET USER BY ID (PUBLIC PROFILE MODAL & STATS)
// ====================================================
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reviews = await Review.find({ reviewedUser: userId })
      .populate("reviewer", "name avatar")
      .limit(5)
      .sort({ createdAt: -1 });

    res.status(200).json({
      user,
      reviews,
    });
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ message: "Failed to load user profile", error: error.message });
  }
};

// ====================================================
// 6. REPORT USER
// ====================================================
const reportUser = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const { reportedUserId, reason, details } = req.body;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ message: "Reported user and reason are required" });
    }

    const newReport = await Report.create({
      reporter: reporterId,
      reportedUser: reportedUserId,
      reason,
      details: details?.trim() || "",
    });

    res.status(201).json({
      success: true,
      message: "Report submitted. Our moderation team will inspect this issue promptly.",
      report: newReport,
    });
  } catch (error) {
    console.error("Report Error:", error);
    res.status(500).json({ message: "Failed to submit report", error: error.message });
  }
};

// ====================================================
// 7. VERIFY SKILL
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

    if (!user.verifiedSkills.includes(cleanSkill)) {
      user.verifiedSkills.push(cleanSkill);
    }

    // Award +50 XP and +2 Skill Credits
    user.xp = (user.xp || 100) + 50;
    user.skillCredits = (user.skillCredits || 5) + 2;

    let foundInTeach = false;
    user.teachSkills = (user.teachSkills || []).map((ts) => {
      const skillName = typeof ts === "string" ? ts : ts.skill;
      if (skillName.toLowerCase() === cleanSkill.toLowerCase()) {
        foundInTeach = true;
        return {
          skill: cleanSkill,
          category: typeof ts === "object" ? ts.category || "Development" : "Development",
          description: typeof ts === "object" ? ts.description || "" : "",
          level: typeof ts === "object" ? ts.level : "Intermediate",
          yearsExperience: typeof ts === "object" ? ts.yearsExperience || ts.experience || "1 year" : "1 year",
          tags: typeof ts === "object" && Array.isArray(ts.tags) ? ts.tags : [],
          isVerified: true,
          verificationScore: score,
        };
      }
      return typeof ts === "string"
        ? { skill: ts, level: "Intermediate", yearsExperience: "1 year", isVerified: false }
        : ts;
    });

    if (!foundInTeach) {
      user.teachSkills.push({
        skill: cleanSkill,
        category: "Development",
        level: score >= 90 ? "Advanced" : "Intermediate",
        yearsExperience: "1+ years",
        isVerified: true,
        verificationScore: score,
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `🎉 Skill "${cleanSkill}" verified successfully! +2 Credits & +50 XP awarded.`,
      verifiedSkills: user.verifiedSkills,
      teachSkills: user.teachSkills,
    });
  } catch (error) {
    console.error("Verify Skill Error:", error);
    res.status(500).json({ message: "Failed to verify skill", error: error.message });
  }
};

// ====================================================
// 8. GET LEADERBOARD
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
      const sessions = user.completedSessionsCount || Math.max(1, teachCount * 2);
      const rating = user.avgRating || 5.0;

      const calculatedXp = user.xp || (teachCount * 150 + learnSkills.length * 50 + verifiedCount * 200 + sessions * 75);
      const streak = user.learningStreak || Math.max(2, (user.name.length * 3) % 21);
      const badge = BADGES_POOL[idx % BADGES_POOL.length];

      return {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        location: user.location || "",
        profession: user.profession || user.careerGoal || "Developer",
        careerGoal: user.careerGoal || "Software Engineer",
        teachSkills: teachSkills.map((s) => s.skill),
        learnSkills: learnSkills.map((s) => s.skill),
        verifiedSkills: user.verifiedSkills || [],
        points: calculatedXp,
        xp: calculatedXp,
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
  completeOnboarding,
  getMatches,
  getUserById,
  reportUser,
  verifySkill,
  getLeaderboard,
};