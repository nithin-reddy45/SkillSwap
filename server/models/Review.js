const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    teachingQuality: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    helpfulness: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    feedback: {
      type: String,
      default: "",
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique review per session per reviewer
reviewSchema.index({ session: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewedUser: 1 });

module.exports = mongoose.model("Review", reviewSchema);
