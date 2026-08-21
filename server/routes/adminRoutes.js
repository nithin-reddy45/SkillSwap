const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  deleteUser,
  getAdminReports,
  updateReportStatus,
  getAdminSwaps,
} = require("../controllers/adminController");

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Platform Analytics & Stats
router.get("/stats", getAdminStats);

// User Management
router.get("/users", getAdminUsers);
router.put("/users/:userId/role", updateUserRole);
router.delete("/users/:userId", deleteUser);

// Reports & Moderation
router.get("/reports", getAdminReports);
router.put("/reports/:reportId", updateReportStatus);

// Swaps Inspection
router.get("/swaps", getAdminSwaps);

module.exports = router;
