const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
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
} = require("../controllers/messageController");


// GET UNREAD MESSAGE COUNT
router.get(
  "/unread/count",
  protect,
  getUnreadCount
);


// MARK MESSAGES AS READ
router.put(
  "/read/:userId",
  protect,
  markMessagesAsRead
);


// EDIT MESSAGE
router.put(
  "/edit/:messageId",
  protect,
  editMessage
);


// REACT TO MESSAGE (toggle)
router.put(
  "/reaction/:messageId",
  protect,
  toggleReaction
);

// ADD REACTION
router.post(
  "/:messageId/reaction",
  protect,
  addReaction
);

// REMOVE REACTION
router.delete(
  "/:messageId/reaction",
  protect,
  removeReaction
);


// FORWARD MESSAGE
// IMPORTANT: Keep this before "/:receiverId"
router.post(
  "/forward/:messageId",
  protect,
  forwardMessage
);


// DELETE MESSAGE
router.delete(
  "/:messageId",
  protect,
  deleteMessage
);

// GET UNREAD MESSAGE COUNTS BY SENDER
router.get(
  "/unread/by-sender",
  protect,
  getUnreadCountsBySender
);

// GET CONVERSATION
router.get(
  "/:userId",
  protect,
  getMessages
);


// SEND MESSAGE
// Keep this last because it is a dynamic route
router.post(
  "/:receiverId",
  protect,
  sendMessage
);


module.exports = router;