const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      default: "Skill Swap Session",
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 45,
      min: 15,
      max: 180,
    },
    meetingLink: {
      type: String,
      default: function () {
        const randId = Math.random().toString(36).substring(2, 9);
        return `https://meet.jit.si/SkillSwap-${randId}`;
      },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
    hasMentorReviewed: {
      type: Boolean,
      default: false,
    },
    hasLearnerReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ mentor: 1, learner: 1, status: 1 });
sessionSchema.index({ scheduledAt: 1 });

module.exports = mongoose.model("Session", sessionSchema);
