const mongoose = require("mongoose");

const teachSkillSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    experience: {
      type: String,
      default: "1 year",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationScore: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const learnSkillSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    currentLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    targetLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Advanced",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    avatar: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "Passionate learner & skill swapper.",
      maxlength: 500,
    },

    careerGoal: {
      type: String,
      default: "Full Stack Developer",
    },

    learningGoal: {
      type: String,
      default: "Expand technical breadth and build scalable full-stack projects.",
    },

    availability: {
      type: String,
      enum: ["Flexible", "Weekdays", "Weekends", "Evenings"],
      default: "Flexible",
    },

    preferredMode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online",
    },

    avgRating: {
      type: Number,
      default: 5.0,
      min: 1.0,
      max: 5.0,
    },

    completedSessionsCount: {
      type: Number,
      default: 0,
    },

    verifiedSkills: {
      type: [String],
      default: [],
    },

    googleId: {
      type: String,
      default: "",
    },

    resetPasswordOTP: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    skillCredits: {
      type: Number,
      default: 5,
      min: 0,
    },

    learningStreak: {
      type: Number,
      default: 1,
    },

    hoursLearned: {
      type: Number,
      default: 0,
    },

    hoursTaught: {
      type: Number,
      default: 0,
    },

    // Rich skill structures (with backward compatibility for strings & objects)
    teachSkills: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    learnSkills: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-normalize skills before validation for backward compatibility with legacy string arrays
userSchema.pre("validate", function () {
  if (Array.isArray(this.teachSkills)) {
    this.teachSkills = this.teachSkills.map((item) => {
      if (typeof item === "string") {
        return { skill: item, level: "Intermediate", experience: "1 year", isVerified: false };
      }
      return item;
    });
  }
  if (Array.isArray(this.learnSkills)) {
    this.learnSkills = this.learnSkills.map((item) => {
      if (typeof item === "string") {
        return { skill: item, currentLevel: "Beginner", targetLevel: "Advanced" };
      }
      return item;
    });
  }
});

// Helper method: Normalize skills input to support both simple strings and rich objects
userSchema.methods.normalizeSkills = function () {
  if (Array.isArray(this.teachSkills)) {
    this.teachSkills = this.teachSkills.map((item) => {
      if (typeof item === "string") {
        return { skill: item, level: "Intermediate", experience: "1 year", isVerified: false };
      }
      return item;
    });
  }
  if (Array.isArray(this.learnSkills)) {
    this.learnSkills = this.learnSkills.map((item) => {
      if (typeof item === "string") {
        return { skill: item, currentLevel: "Beginner", targetLevel: "Advanced" };
      }
      return item;
    });
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;