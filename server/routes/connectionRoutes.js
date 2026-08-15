const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  sendConnectionRequest,
  getIncomingRequests,
  updateConnectionRequest,
  getMyConnections,
} = require("../controllers/connectionController");

// Get incoming pending requests
router.get(
  "/requests",
  protect,
  getIncomingRequests
);

// Get accepted connections
router.get(
  "/my-connections",
  protect,
  getMyConnections
);

// Send connection request
router.post(
  "/:receiverId",
  protect,
  sendConnectionRequest
);

// Accept or reject connection request
router.put(
  "/:connectionId/respond",
  protect,
  updateConnectionRequest
);

router.put(
  "/:connectionId",
  protect,
  updateConnectionRequest
);

module.exports = router;