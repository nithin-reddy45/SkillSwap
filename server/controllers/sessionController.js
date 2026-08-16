const Session = require("../models/Session");
const Notification = require("../models/Notification");
const User = require("../models/User");

// 1. CREATE A SESSION PROPOSAL
const createSession = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { partnerId, isMentor, skill, topic, scheduledAt, durationMinutes, notes } = req.body;

    if (!partnerId || !skill || !scheduledAt) {
      return res.status(400).json({ message: "Partner, skill, and scheduled date/time are required." });
    }

    if (String(currentUserId) === String(partnerId)) {
      return res.status(400).json({ message: "You cannot schedule a session with yourself." });
    }

    const partner = await User.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner user not found." });
    }

    const mentorId = isMentor ? currentUserId : partnerId;
    const learnerId = isMentor ? partnerId : currentUserId;

    const newSession = new Session({
      mentor: mentorId,
      learner: learnerId,
      skill: skill.trim(),
      topic: topic?.trim() || `Learning ${skill.trim()}`,
      scheduledAt: new Date(scheduledAt),
      durationMinutes: Number(durationMinutes) || 45,
      notes: notes || "",
      status: "pending",
    });

    await newSession.save();

    // Create Notification for the partner
    const currentUser = await User.findById(currentUserId);
    await Notification.create({
      recipient: partnerId,
      sender: currentUserId,
      type: "session_request",
      title: "📅 New Learning Session Proposed",
      message: `${currentUser.name} has scheduled a session for "${skill}" on ${new Date(scheduledAt).toLocaleDateString()}.`,
      link: "/sessions",
    });

    // Populate for response
    const populated = await Session.findById(newSession._id)
      .populate("mentor", "name email avatar")
      .populate("learner", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Session scheduled successfully! Partner has been notified.",
      session: populated,
    });
  } catch (error) {
    console.error("Create Session Error:", error);
    res.status(500).json({ message: "Failed to schedule session", error: error.message });
  }
};

// 2. GET USER SESSIONS (UPCOMING, PENDING, COMPLETED)
const getMySessions = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const allSessions = await Session.find({
      $or: [{ mentor: currentUserId }, { learner: currentUserId }],
    })
      .populate("mentor", "name email avatar teachSkills avgRating")
      .populate("learner", "name email avatar learnSkills")
      .sort({ scheduledAt: -1 });

    const now = new Date();

    const upcoming = [];
    const pending = [];
    const completed = [];

    allSessions.forEach((s) => {
      if (s.status === "completed") {
        completed.push(s);
      } else if (s.status === "pending") {
        pending.push(s);
      } else if (s.status === "accepted") {
        upcoming.push(s);
      }
    });

    res.status(200).json({
      success: true,
      upcoming,
      pending,
      completed,
      totalCount: allSessions.length,
    });
  } catch (error) {
    console.error("Get Sessions Error:", error);
    res.status(500).json({ message: "Failed to load sessions", error: error.message });
  }
};

// 3. UPDATE SESSION STATUS (ACCEPT, COMPLETE, CANCEL)
const updateSessionStatus = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { sessionId } = req.params;
    const { status } = req.body; // "accepted" | "completed" | "cancelled"

    if (!["accepted", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    const session = await Session.findById(sessionId)
      .populate("mentor", "name email")
      .populate("learner", "name email");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const isMentor = String(session.mentor._id) === String(currentUserId);
    const isLearner = String(session.learner._id) === String(currentUserId);

    if (!isMentor && !isLearner) {
      return res.status(403).json({ message: "Not authorized to update this session" });
    }

    session.status = status;
    await session.save();

    const partnerId = isMentor ? session.learner._id : session.mentor._id;
    const currentUser = isMentor ? session.mentor : session.learner;

    if (status === "accepted") {
      await Notification.create({
        recipient: partnerId,
        sender: currentUserId,
        type: "session_accepted",
        title: "✅ Session Accepted",
        message: `${currentUser.name} accepted the session for ${session.skill}! Check the meeting link.`,
        link: "/sessions",
      });
    } else if (status === "completed") {
      // Increment completed sessions count for both
      await User.findByIdAndUpdate(session.mentor._id, { $inc: { completedSessionsCount: 1 } });
      await User.findByIdAndUpdate(session.learner._id, { $inc: { completedSessionsCount: 1 } });

      await Notification.create({
        recipient: partnerId,
        sender: currentUserId,
        type: "session_completed",
        title: "🌟 Session Completed",
        message: `Your session on "${session.skill}" has been marked complete. Please leave a rating!`,
        link: "/sessions",
      });
    }

    res.status(200).json({
      success: true,
      message: `Session status updated to ${status}`,
      session,
    });
  } catch (error) {
    console.error("Update Session Error:", error);
    res.status(500).json({ message: "Failed to update session status", error: error.message });
  }
};

module.exports = {
  createSession,
  getMySessions,
  updateSessionStatus,
};
