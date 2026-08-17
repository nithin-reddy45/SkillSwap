const mongoose = require("mongoose");
const Message = require("../models/Message");
const Connection = require("../models/Connection");

// SEND MESSAGE
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.receiverId;
    const { message, replyTo, messageType = "text", codeLanguage = "", codeSnippet = "" } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    // Check accepted connection
    const connection = await Connection.findOne({
      status: "accepted",
      $or: [
        {
          sender: senderId,
          receiver: receiverId,
        },
        {
          sender: receiverId,
          receiver: senderId,
        },
      ],
    });

    if (!connection) {
      return res.status(403).json({
        message: "You can only message accepted connections",
      });
    }

    // Validate replied message
    // Reply is allowed only to a message in this conversation
    if (replyTo) {
      const originalMessage = await Message.findOne({
        _id: replyTo,
        $or: [
          {
            sender: senderId,
            receiver: receiverId,
          },
          {
            sender: receiverId,
            receiver: senderId,
          },
        ],
      });

      if (!originalMessage) {
        return res.status(404).json({
          message:
            "Original message not found in this conversation",
        });
      }
    }

    // Create message
    let newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: message.trim(),
      messageType,
      codeLanguage,
      codeSnippet,
      replyTo: replyTo || null,
      isRead: false,
    });

    // Populate reply message before sending response/socket
    newMessage = await newMessage.populate({
      path: "replyTo",
      select: "message sender",
    });

    const io = req.app.get("io");

    // Send message in real time
    if (io) {
      io.to(receiverId.toString()).emit(
        "receiveMessage",
        newMessage
      );
    }

    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Send Message Error:", error);

    res.status(500).json({
      message: "Failed to send message",
    });
  }
};


// GET CONVERSATION
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        {
          sender: userId,
          receiver: otherUserId,
        },
        {
          sender: otherUserId,
          receiver: userId,
        },
      ],
    })
      .populate({
        path: "replyTo",
        select: "message sender",
      })
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get Messages Error:", error);

    res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
};


// MARK MESSAGES AS READ
const markMessagesAsRead = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const senderId = req.params.userId;

    const result = await Message.updateMany(
      {
        sender: senderId,
        receiver: currentUserId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    const io = req.app.get("io");

    if (io && result.modifiedCount > 0) {
      io.to(senderId.toString()).emit(
        "messagesRead",
        {
          senderId: currentUserId,
          readerId: currentUserId,
        }
      );
    }

    res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark Messages Read Error:", error);

    res.status(500).json({
      message: "Failed to mark messages as read",
    });
  }
};


// GET UNREAD MESSAGE COUNT
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false,
    });

    res.status(200).json({
      unreadCount,
    });
  } catch (error) {
    console.error("Unread Count Error:", error);

    res.status(500).json({
      message: "Failed to fetch unread count",
    });
  }
};


// DELETE MESSAGE
const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.messageId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Only sender can delete
    if (String(message.sender) !== String(userId)) {
      return res.status(403).json({
        message: "You can only delete your own messages",
      });
    }

    await Message.findByIdAndDelete(messageId);

    const io = req.app.get("io");

    if (io) {
      io.to(message.receiver.toString()).emit(
        "messageDeleted",
        {
          messageId,
        }
      );
    }

    res.status(200).json({
      message: "Message deleted successfully",
      messageId,
    });
  } catch (error) {
    console.error("Delete Message Error:", error);

    res.status(500).json({
      message: "Failed to delete message",
    });
  }
};


// EDIT MESSAGE
const editMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.messageId;
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    let existingMessage =
      await Message.findById(messageId);

    if (!existingMessage) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Only sender can edit
    if (
      String(existingMessage.sender) !==
      String(userId)
    ) {
      return res.status(403).json({
        message: "You can only edit your own messages",
      });
    }

    existingMessage.message = message.trim();
    existingMessage.isEdited = true;

    await existingMessage.save();

    existingMessage =
      await existingMessage.populate({
        path: "replyTo",
        select: "message sender",
      });

    const io = req.app.get("io");

    if (io) {
      io.to(
        existingMessage.receiver.toString()
      ).emit(
        "messageEdited",
        existingMessage
      );
    }

    res.status(200).json({
      message: "Message updated successfully",
      data: existingMessage,
    });
  } catch (error) {
    console.error("Edit Message Error:", error);

    res.status(500).json({
      message: "Failed to edit message",
    });
  }
};


// ADD OR REMOVE MESSAGE REACTION
const toggleReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.messageId;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        message: "Emoji is required",
      });
    }

    const message = await Message.findById(
      messageId
    );

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    const existingReactionIndex =
      message.reactions.findIndex(
        (reaction) =>
          String(reaction.user) ===
          String(userId)
      );

    if (existingReactionIndex !== -1) {
      const existingReaction =
        message.reactions[
          existingReactionIndex
        ];

      // Same emoji → remove reaction
      if (existingReaction.emoji === emoji) {
        message.reactions.splice(
          existingReactionIndex,
          1
        );
      } else {
        // Different emoji → change reaction
        existingReaction.emoji = emoji;
      }
    } else {
      message.reactions.push({
        user: userId,
        emoji,
      });
    }

    await message.save();

    const io = req.app.get("io");

    // Group reactions by emoji
    const groupedReactions = message.reactions.reduce((acc, reaction) => {
      const existingEmoji = acc.find(
        (r) => r.emoji === reaction.emoji
      );
      if (existingEmoji) {
        existingEmoji.reactedBy.push(
          reaction.user
        );
      } else {
        acc.push({
          emoji: reaction.emoji,
          reactedBy: [reaction.user],
        });
      }
      return acc;
    }, []);

    if (io) {
      const reactionData = {
        messageId: message._id,
        reactions: groupedReactions,
      };

      io.to(message.sender.toString()).emit(
        "reactionAdded",
        reactionData
      );

      io.to(message.receiver.toString()).emit(
        "reactionAdded",
        reactionData
      );
    }

    res.status(200).json({
      message: "Reaction updated successfully",
      data: {
        ...message.toObject(),
        reactions: groupedReactions,
      },
    });
  } catch (error) {
    console.error(
      "Toggle Reaction Error:",
      error
    );

    res.status(500).json({
      message: "Failed to update reaction",
    });
  }
};

// ADD REACTION
const addReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.messageId;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        message: "Emoji is required",
      });
    }

    const message = await Message.findById(
      messageId
    );

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Check if user already has this reaction
    const alreadyReacted =
      message.reactions.some(
        (reaction) =>
          String(reaction.user) ===
            String(userId) &&
          reaction.emoji === emoji
      );

    if (!alreadyReacted) {
      message.reactions.push({
        user: userId,
        emoji,
      });

      await message.save();
    }

    // Group reactions by emoji
    const groupedReactions = message.reactions.reduce((acc, reaction) => {
      const existingEmoji = acc.find(
        (r) => r.emoji === reaction.emoji
      );
      if (existingEmoji) {
        existingEmoji.reactedBy.push(
          reaction.user
        );
      } else {
        acc.push({
          emoji: reaction.emoji,
          reactedBy: [reaction.user],
        });
      }
      return acc;
    }, []);

    const io = req.app.get("io");

    if (io) {
      const reactionData = {
        messageId: message._id,
        reactions: groupedReactions,
      };

      io.to(message.sender.toString()).emit(
        "reactionAdded",
        reactionData
      );

      io.to(message.receiver.toString()).emit(
        "reactionAdded",
        reactionData
      );
    }

    res.status(200).json({
      message: "Reaction added successfully",
      data: {
        ...message.toObject(),
        reactions: groupedReactions,
      },
    });
  } catch (error) {
    console.error(
      "Add Reaction Error:",
      error
    );

    res.status(500).json({
      message: "Failed to add reaction",
    });
  }
};

// REMOVE REACTION
const removeReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.messageId;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        message: "Emoji is required",
      });
    }

    const message = await Message.findById(
      messageId
    );

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Remove user's reaction with this emoji
    message.reactions =
      message.reactions.filter(
        (reaction) =>
          !(
            String(reaction.user) ===
              String(userId) &&
            reaction.emoji === emoji
          )
      );

    await message.save();

    // Group reactions by emoji
    const groupedReactions = message.reactions.reduce((acc, reaction) => {
      const existingEmoji = acc.find(
        (r) => r.emoji === reaction.emoji
      );
      if (existingEmoji) {
        existingEmoji.reactedBy.push(
          reaction.user
        );
      } else {
        acc.push({
          emoji: reaction.emoji,
          reactedBy: [reaction.user],
        });
      }
      return acc;
    }, []);

    const io = req.app.get("io");

    if (io) {
      const reactionData = {
        messageId: message._id,
        reactions: groupedReactions,
      };

      io.to(message.sender.toString()).emit(
        "reactionRemoved",
        reactionData
      );

      io.to(message.receiver.toString()).emit(
        "reactionRemoved",
        reactionData
      );
    }

    res.status(200).json({
      message: "Reaction removed successfully",
      data: {
        ...message.toObject(),
        reactions: groupedReactions,
      },
    });
  } catch (error) {
    console.error(
      "Remove Reaction Error:",
      error
    );

    res.status(500).json({
      message: "Failed to remove reaction",
    });
  }
};
// GET UNREAD MESSAGE COUNTS BY SENDER
const getUnreadCountsBySender = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(
            userId
          ),
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // Convert result into an object
    const formattedCounts = {};
    unreadCounts.forEach((item) => {
      formattedCounts[
        item._id.toString()
      ] = item.count;
    });

    res.status(200).json({
      unreadCounts: formattedCounts,
    });
  } catch (error) {
    console.error(
      "Unread Counts By Sender Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch unread message counts",
    });
  }
};

// FORWARD MESSAGE
const forwardMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { messageId } = req.params;
    const { receiverId } = req.body;

    // Validate receiver
    if (!receiverId) {
      return res.status(400).json({
        message: "Receiver ID is required",
      });
    }

    // Find original message
    const originalMessage = await Message.findById(messageId);

    if (!originalMessage) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // User must belong to the original conversation
    const belongsToConversation =
      String(originalMessage.sender) === String(senderId) ||
      String(originalMessage.receiver) === String(senderId);

    if (!belongsToConversation) {
      return res.status(403).json({
        message: "You cannot forward this message",
      });
    }

    // Check accepted connection with new receiver
    const connection = await Connection.findOne({
      status: "accepted",
      $or: [
        {
          sender: senderId,
          receiver: receiverId,
        },
        {
          sender: receiverId,
          receiver: senderId,
        },
      ],
    });

    if (!connection) {
      return res.status(403).json({
        message: "You can only forward messages to accepted connections",
      });
    }

    // Create forwarded message
    const forwardedMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: originalMessage.message,
      isRead: false,
      isForwarded: true,
      forwardedFrom: originalMessage._id,
    });

    const io = req.app.get("io");

    // Send in real time
    if (io) {
      io.to(receiverId.toString()).emit(
        "receiveMessage",
        forwardedMessage
      );
    }

    res.status(201).json({
      message: "Message forwarded successfully",
      data: forwardedMessage,
    });
  } catch (error) {
    console.error("Forward Message Error:", error);

    res.status(500).json({
      message: "Failed to forward message",
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  getUnreadCount,
  getUnreadCountsBySender,
  deleteMessage,
  editMessage,
  toggleReaction,
  addReaction,
  removeReaction,
  forwardMessage,
};