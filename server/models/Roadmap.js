const mongoose = require("mongoose");

const roadmapWeekSchema = new mongoose.Schema(
  {
    week: Number,
    title: String,
    description: String,
    topics: [String],
    completedTopics: {
      type: [String],
      default: [],
    },
    resources: [String],
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    durationWeeks: {
      type: Number,
      default: 4,
    },
    goal: {
      type: String,
      default: "",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    weeks: [roadmapWeekSchema],
  },
  {
    timestamps: true,
  }
);

roadmapSchema.index({ user: 1, skill: 1 });

module.exports = mongoose.model("Roadmap", roadmapSchema);
