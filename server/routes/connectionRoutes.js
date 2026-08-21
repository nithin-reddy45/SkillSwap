const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  sendConnectionRequest,
  getIncomingRequests,
  getSentRequests,
  updateConnectionRequest,
  getMyConnections,
  getCompletedSwaps,
} = require("../controllers/connectionController");

// Incoming requests
router.get("/requests", protect, getIncomingRequests);

// Sent requests
router.get("/sent", protect, getSentRequests);

// Active connections / swaps
router.get("/my-connections", protect, getMyConnections);

// Completed swaps
router.get("/completed", protect, getCompletedSwaps);

// Send structured swap request
router.post("/:receiverId", protect, sendConnectionRequest);

// Update / respond to connection request (accept, reject, cancel, complete)
router.put("/:connectionId/respond", protect, updateConnectionRequest);
router.put("/:connectionId", protect, updateConnectionRequest);

module.exports = router;