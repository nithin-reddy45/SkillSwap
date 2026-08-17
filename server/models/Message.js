const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    messageType: {
      type: String,
      enum: ["text", "code", "file"],
      default: "text",
    },

    codeLanguage: {
      type: String,
      default: "",
    },

    codeSnippet: {
      type: String,
      default: "",
    },

    // Reply to another message
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // Read receipt
    isRead: {
      type: Boolean,
      default: false,
    },

    // Edited message
    isEdited: {
      type: Boolean,
      default: false,
    },

    // Forwarded message
    isForwarded: {
      type: Boolean,
      default: false,
    },

    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // Message reactions
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        emoji: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
messageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;