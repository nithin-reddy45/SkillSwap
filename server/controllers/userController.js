const User = require("../models/User");

// GET SKILL MATCHES
const getMatches = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get current user
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get all other users
    const users = await User.find({
      _id: { $ne: currentUserId },
    }).select("-password");

    const matches = users.map((user) => {
      let score = 0;
      let matchedSkills = [];

      // Skills I want to learn that the other user can teach
      currentUser.learnSkills.forEach((skill) => {
        if (
          user.teachSkills.some(
            (teachSkill) =>
              teachSkill.toLowerCase() === skill.toLowerCase()
          )
        ) {
          score += 50;
          matchedSkills.push(skill);
        }
      });

      // Skills I can teach that the other user wants to learn
      currentUser.teachSkills.forEach((skill) => {
        if (
          user.learnSkills.some(
            (learnSkill) =>
              learnSkill.toLowerCase() === skill.toLowerCase()
          )
        ) {
          score += 50;

          if (!matchedSkills.includes(skill)) {
            matchedSkills.push(skill);
          }
        }
      });

      // Maximum score is 100
      score = Math.min(score, 100);

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          teachSkills: user.teachSkills,
          learnSkills: user.learnSkills,
        },
        matchPercentage: score,
        matchedSkills,
      };
    });

    // Only return users with some match
    const filteredMatches = matches
      .filter((match) => match.matchPercentage > 0)
      .sort(
        (a, b) =>
          b.matchPercentage - a.matchPercentage
      );

    res.status(200).json(filteredMatches);

  } catch (error) {
    console.error("Match Error:", error);

    res.status(500).json({
      message: "Failed to find matches",
    });
  }
};

module.exports = {
  getMatches,
};