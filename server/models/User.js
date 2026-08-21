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

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    location: {
      type: String,
      default: "",
    },

    profession: {
      type: String,
      default: "",
    },

    interests: {
      type: [String],
      default: [],
    },

    xp: {
      type: Number,
      default: 150,
    },

    badges: {
      type: [String],
      default: ["🏆 First Skill Swap"],
    },

    onboarded: {
      type: Boolean,
      default: false,
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
        return {
          skill: item.trim(),
          category: "Development",
          description: "",
          level: "Intermediate",
          yearsExperience: "1 year",
          tags: [],
          isVerified: false,
          verificationScore: 0,
        };
      }
      return {
        skill: item.skill ? item.skill.trim() : "",
        category: item.category || "Development",
        description: item.description || "",
        level: item.level || "Intermediate",
        yearsExperience: item.yearsExperience || item.experience || "1 year",
        tags: Array.isArray(item.tags) ? item.tags : [],
        isVerified: !!item.isVerified,
        verificationScore: item.verificationScore || 0,
      };
    });
  }
  if (Array.isArray(this.learnSkills)) {
    this.learnSkills = this.learnSkills.map((item) => {
      if (typeof item === "string") {
        return {
          skill: item.trim(),
          category: "Development",
          description: "",
          currentLevel: "Beginner",
          targetLevel: "Advanced",
          tags: [],
        };
      }
      return {
        skill: item.skill ? item.skill.trim() : "",
        category: item.category || "Development",
        description: item.description || "",
        currentLevel: item.currentLevel || "Beginner",
        targetLevel: item.targetLevel || "Advanced",
        tags: Array.isArray(item.tags) ? item.tags : [],
      };
    });
  }
});

// Helper method: Normalize skills input to support both simple strings and rich objects
userSchema.methods.normalizeSkills = function () {
  if (Array.isArray(this.teachSkills)) {
    this.teachSkills = this.teachSkills.map((item) => {
      if (typeof item === "string") {
        return {
          skill: item.trim(),
          category: "Development",
          description: "",
          level: "Intermediate",
          yearsExperience: "1 year",
          tags: [],
          isVerified: false,
        };
      }
      return item;
    });
  }
  if (Array.isArray(this.learnSkills)) {
    this.learnSkills = this.learnSkills.map((item) => {
      if (typeof item === "string") {
        return {
          skill: item.trim(),
          category: "Development",
          description: "",
          currentLevel: "Beginner",
          targetLevel: "Advanced",
          tags: [],
        };
      }
      return item;
    });
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;