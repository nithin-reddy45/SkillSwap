const Review = require("../models/Review");
const Session = require("../models/Session");
const User = require("../models/User");
const Notification = require("../models/Notification");

// 1. SUBMIT SESSION REVIEW
const createReview = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { sessionId, rating, teachingQuality, communication, helpfulness, feedback } = req.body;

    if (!sessionId || !rating) {
      return res.status(400).json({ message: "Session ID and rating (1-5) are required." });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    if (session.status !== "completed") {
      return res.status(400).json({ message: "You can only review a completed session." });
    }

    const isMentor = String(session.mentor) === String(reviewerId);
    const isLearner = String(session.learner) === String(reviewerId);

    if (!isMentor && !isLearner) {
      return res.status(403).json({ message: "You were not a participant in this session." });
    }

    // Determine target reviewed user
    const reviewedUserId = isMentor ? session.learner : session.mentor;

    // Check for duplicate review
    const existingReview = await Review.findOne({ session: sessionId, reviewer: reviewerId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already submitted a review for this session." });
    }

    // Create Review
    const newReview = new Review({
      session: sessionId,
      reviewer: reviewerId,
      reviewedUser: reviewedUserId,
      rating: Number(rating),
      teachingQuality: Number(teachingQuality) || Number(rating),
      communication: Number(communication) || Number(rating),
      helpfulness: Number(helpfulness) || Number(rating),
      feedback: feedback?.trim() || "",
    });

    await newReview.save();

    // Mark reviewed status on session
    if (isMentor) {
      session.hasMentorReviewed = true;
    } else {
      session.hasLearnerReviewed = true;
    }
    await session.save();

    // Recalculate average rating for reviewed user
    const allUserReviews = await Review.find({ reviewedUser: reviewedUserId });
    const avg = allUserReviews.reduce((sum, r) => sum + r.rating, 0) / allUserReviews.length;
    const roundedAvg = Number(avg.toFixed(1));

    await User.findByIdAndUpdate(reviewedUserId, { avgRating: roundedAvg });

    // Send Notification to reviewed user
    const reviewerUser = await User.findById(reviewerId);
    await Notification.create({
      recipient: reviewedUserId,
      sender: reviewerId,
      type: "session_completed",
      title: "⭐ New Review Received",
      message: `${reviewerUser.name} gave you a ${rating}★ rating for your session on ${session.skill}!`,
      link: "/profile",
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your review has been recorded.",
      review: newReview,
      newAvgRating: roundedAvg,
    });
  } catch (error) {
    console.error("Create Review Error:", error);
    res.status(500).json({ message: "Failed to submit review", error: error.message });
  }
};

// 2. GET REVIEWS FOR A USER
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewedUser: userId })
      .populate("reviewer", "name avatar")
      .populate("session", "skill topic scheduledAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);
    res.status(500).json({ message: "Failed to load reviews", error: error.message });
  }
};

module.exports = {
  createReview,
  getUserReviews,
};
