const User = require("../models/User");
const Connection = require("../models/Connection");
const Session = require("../models/Session");
const Review = require("../models/Review");
const Report = require("../models/Report");

// 1. GET PLATFORM ANALYTICS & STATS
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const onboardedUsers = await User.countDocuments({ onboarded: true });
    const totalSwaps = await Connection.countDocuments({});
    const activeSwaps = await Connection.countDocuments({ status: "accepted" });
    const completedSwaps = await Connection.countDocuments({ status: "completed" });
    const totalSessions = await Session.countDocuments({});
    const completedSessions = await Session.countDocuments({ status: "completed" });
    const totalReviews = await Review.countDocuments({});
    const pendingReports = await Report.countDocuments({ status: "pending" });

    // Aggregate Most Popular Skills
    const allUsers = await User.find({}).select("teachSkills learnSkills createdAt");

    const teachSkillCount = {};
    const learnSkillCount = {};

    allUsers.forEach((u) => {
      (u.teachSkills || []).forEach((ts) => {
        const name = typeof ts === "string" ? ts : ts.skill;
        if (name) {
          teachSkillCount[name] = (teachSkillCount[name] || 0) + 1;
        }
      });

      (u.learnSkills || []).forEach((ls) => {
        const name = typeof ls === "string" ? ls : ls.skill;
        if (name) {
          learnSkillCount[name] = (learnSkillCount[name] || 0) + 1;
        }
      });
    });

    const popularTeachSkills = Object.entries(teachSkillCount)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const popularLearnSkills = Object.entries(learnSkillCount)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 7-day user growth
    const past7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const growthData = past7Days.map((dateStr) => {
      const count = allUsers.filter((u) => {
        const userDate = new Date(u.createdAt).toISOString().slice(0, 10);
        return userDate <= dateStr;
      }).length;
      return { date: dateStr.slice(5), users: count };
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        onboardedUsers,
        totalSwaps,
        activeSwaps,
        completedSwaps,
        totalSessions,
        completedSessions,
        totalReviews,
        pendingReports,
      },
      popularTeachSkills,
      popularLearnSkills,
      growthData,
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ message: "Failed to load admin statistics", error: error.message });
  }
};

// 2. GET ALL USERS (WITH SEARCH & ROLE FILTER)
const getAdminUsers = async (req, res) => {
  try {
    const { q = "", role = "All" } = req.query;

    const filter = {};
    if (q.trim()) {
      filter.$or = [
        { name: new RegExp(q.trim(), "i") },
        { email: new RegExp(q.trim(), "i") },
      ];
    }
    if (role !== "All" && ["user", "admin"].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    console.error("Admin Users Error:", error);
    res.status(500).json({ message: "Failed to load users", error: error.message });
  }
};

// 3. UPDATE USER ROLE (USER <-> ADMIN)
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'user' or 'admin'" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    console.error("Update User Role Error:", error);
    res.status(500).json({ message: "Failed to update user role", error: error.message });
  }
};

// 4. DELETE USER
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (String(userId) === String(req.user.id)) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    await User.findByIdAndDelete(userId);
    await Connection.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
    await Session.deleteMany({ $or: [{ mentor: userId }, { learner: userId }] });

    res.status(200).json({
      success: true,
      message: "User and associated data removed successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

// 5. GET ALL REPORTS
const getAdminReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate("reporter", "name email avatar")
      .populate("reportedUser", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Admin Reports Error:", error);
    res.status(500).json({ message: "Failed to load reports", error: error.message });
  }
};

// 6. UPDATE REPORT STATUS
const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (status) report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    await report.save();

    res.status(200).json({
      success: true,
      message: `Report status updated to ${status}`,
      report,
    });
  } catch (error) {
    console.error("Update Report Error:", error);
    res.status(500).json({ message: "Failed to update report", error: error.message });
  }
};

// 7. GET ALL SWAPS
const getAdminSwaps = async (req, res) => {
  try {
    const swaps = await Connection.find({})
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      swaps,
    });
  } catch (error) {
    console.error("Admin Swaps Error:", error);
    res.status(500).json({ message: "Failed to load swaps", error: error.message });
  }
};

module.exports = {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  deleteUser,
  getAdminReports,
  updateReportStatus,
  getAdminSwaps,
};
