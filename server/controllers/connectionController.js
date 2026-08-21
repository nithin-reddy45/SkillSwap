const Connection = require("../models/Connection");
const User = require("../models/User");
const Notification = require("../models/Notification");

// 1. SEND STRUCTURED CONNECTION / SWAP REQUEST
const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.receiverId;
    const { teachSkill = "", learnSkill = "", note = "" } = req.body;

    // Prevent sending request to yourself
    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({
        message: "You cannot send a connection request to yourself",
      });
    }

    // Check whether receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check for existing connection in BOTH directions
    const existingConnection = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingConnection) {
      if (existingConnection.status === "accepted") {
        return res.status(400).json({
          message: "You are already connected with this user in an active swap!",
        });
      }

      if (existingConnection.status === "pending") {
        return res.status(400).json({
          message: "A pending skill swap request already exists with this user.",
        });
      }

      // If previously rejected, cancelled, or completed, allow re-request by updating
      existingConnection.sender = senderId;
      existingConnection.receiver = receiverId;
      existingConnection.teachSkill = teachSkill.trim();
      existingConnection.learnSkill = learnSkill.trim();
      existingConnection.note = note.trim();
      existingConnection.status = "pending";
      existingConnection.requestedAt = new Date();
      await existingConnection.save();

      let populated = await existingConnection.populate(
        "sender",
        "name email avatar teachSkills learnSkills avgRating"
      );

      const io = req.app.get("io");
      if (io) {
        io.to(String(receiverId)).emit("newConnectionRequest", {
          connection: populated,
          message: `${populated.sender.name} sent you a skill swap request: Teach ${teachSkill} ⇄ Learn ${learnSkill}`,
        });
      }

      await Notification.create({
        recipient: receiverId,
        sender: senderId,
        type: "connection_request",
        title: "🤝 New Skill Swap Request",
        message: `${populated.sender.name} wants to swap skills: I will teach ${teachSkill || "skills"} for ${learnSkill || "knowledge"}.`,
        link: "/requests",
      });

      return res.status(201).json({
        message: "Skill swap request sent successfully!",
        connection: populated,
      });
    }

    // Create new connection request
    let connection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
      teachSkill: teachSkill.trim(),
      learnSkill: learnSkill.trim(),
      note: note.trim(),
      status: "pending",
    });

    // Populate sender details
    connection = await connection.populate(
      "sender",
      "name email avatar teachSkills learnSkills avgRating"
    );

    // Socket.IO notification
    const io = req.app.get("io");
    if (io) {
      io.to(String(receiverId)).emit("newConnectionRequest", {
        connection,
        message: `${connection.sender.name} sent you a skill swap request`,
      });
    }

    // In-app Notification
    await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: "connection_request",
      title: "🤝 New Skill Swap Request",
      message: `${connection.sender.name} wants to swap: Teach ${teachSkill || "Skills"} ⇄ Learn ${learnSkill || "Skills"}.`,
      link: "/requests",
    });

    res.status(201).json({
      message: "Skill swap request sent successfully!",
      connection,
    });
  } catch (error) {
    console.error("Connection Error:", error);
    res.status(500).json({
      message: "Failed to send connection request",
      error: error.message,
    });
  }
};

// 2. GET INCOMING REQUESTS
const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Connection.find({
      receiver: userId,
      status: "pending",
    })
      .populate("sender", "name email avatar teachSkills learnSkills avgRating location profession")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Get Requests Error:", error);
    res.status(500).json({
      message: "Failed to fetch connection requests",
    });
  }
};

// 3. GET SENT REQUESTS
const getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Connection.find({
      sender: userId,
      status: "pending",
    })
      .populate("receiver", "name email avatar teachSkills learnSkills avgRating location profession")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Get Sent Requests Error:", error);
    res.status(500).json({
      message: "Failed to fetch sent requests",
    });
  }
};

// 4. UPDATE CONNECTION / SWAP REQUEST STATUS
const updateConnectionRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const connectionId = req.params.connectionId;
    const { status } = req.body;

    // Validate status
    if (!["accepted", "rejected", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Status must be accepted, rejected, cancelled, or completed",
      });
    }

    const connection = await Connection.findOne({
      _id: connectionId,
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar");

    if (!connection) {
      return res.status(404).json({
        message: "Connection request not found",
      });
    }

    // Only receiver can accept or reject pending requests
    if (connection.status === "pending" && ["accepted", "rejected"].includes(status)) {
      if (String(connection.receiver._id) !== String(userId)) {
        return res.status(403).json({
          message: "Only the recipient can accept or reject this request",
        });
      }
    }

    // Only sender can cancel pending request
    if (status === "cancelled" && connection.status === "pending") {
      if (String(connection.sender._id) !== String(userId)) {
        return res.status(403).json({
          message: "Only the sender can cancel this request",
        });
      }
    }

    connection.status = status;
    await connection.save();

    // Reward XP if accepted
    if (status === "accepted") {
      await User.findByIdAndUpdate(connection.sender._id, { $inc: { xp: 50 } });
      await User.findByIdAndUpdate(connection.receiver._id, { $inc: { xp: 50 } });

      const otherUserId =
        String(connection.sender._id) === String(userId)
          ? connection.receiver._id
          : connection.sender._id;
      const currentUser =
        String(connection.sender._id) === String(userId)
          ? connection.sender
          : connection.receiver;

      await Notification.create({
        recipient: otherUserId,
        sender: userId,
        type: "connection_accepted",
        title: "🎉 Skill Swap Accepted!",
        message: `${currentUser.name} accepted your skill swap request! Private messaging is now unlocked.`,
        link: "/messages",
      });
    }

    // Reward XP if completed
    if (status === "completed") {
      await User.findByIdAndUpdate(connection.sender._id, {
        $inc: { xp: 100, completedSessionsCount: 1 },
      });
      await User.findByIdAndUpdate(connection.receiver._id, {
        $inc: { xp: 100, completedSessionsCount: 1 },
      });
    }

    const io = req.app.get("io");
    if (io) {
      io.to(String(connection.sender._id)).emit("connectionRequestUpdated", {
        connectionId: connection._id,
        status,
      });
      io.to(String(connection.receiver._id)).emit("connectionRequestUpdated", {
        connectionId: connection._id,
        status,
      });
    }

    res.status(200).json({
      message: `Skill swap request marked as ${status}`,
      connection,
    });
  } catch (error) {
    console.error("Update Connection Error:", error);
    res.status(500).json({
      message: "Failed to update connection request",
      error: error.message,
    });
  }
};

// 5. GET MY CONNECTIONS / ACTIVE SWAPS
const getMyConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const connections = await Connection.find({
      status: "accepted",
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email avatar teachSkills learnSkills avgRating location profession")
      .populate("receiver", "name email avatar teachSkills learnSkills avgRating location profession")
      .sort({ updatedAt: -1 });

    const formattedConnections = connections.map((connection) => {
      const isSender = String(connection.sender._id) === String(userId);
      const otherUser = isSender ? connection.receiver : connection.sender;

      return {
        _id: connection._id,
        user: otherUser,
        teachSkill: isSender ? connection.teachSkill : connection.learnSkill,
        learnSkill: isSender ? connection.learnSkill : connection.teachSkill,
        note: connection.note,
        status: connection.status,
        connectedAt: connection.updatedAt,
      };
    });

    res.status(200).json(formattedConnections);
  } catch (error) {
    console.error("Get Connections Error:", error);
    res.status(500).json({
      message: "Failed to fetch connections",
    });
  }
};

// 6. GET COMPLETED SWAPS
const getCompletedSwaps = async (req, res) => {
  try {
    const userId = req.user.id;

    const connections = await Connection.find({
      status: "completed",
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email avatar teachSkills learnSkills avgRating location profession")
      .populate("receiver", "name email avatar teachSkills learnSkills avgRating location profession")
      .sort({ updatedAt: -1 });

    const formatted = connections.map((connection) => {
      const isSender = String(connection.sender._id) === String(userId);
      const otherUser = isSender ? connection.receiver : connection.sender;

      return {
        _id: connection._id,
        user: otherUser,
        teachSkill: isSender ? connection.teachSkill : connection.learnSkill,
        learnSkill: isSender ? connection.learnSkill : connection.teachSkill,
        status: "completed",
        completedAt: connection.updatedAt,
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Get Completed Swaps Error:", error);
    res.status(500).json({
      message: "Failed to fetch completed swaps",
    });
  }
};

module.exports = {
  sendConnectionRequest,
  getIncomingRequests,
  getSentRequests,
  updateConnectionRequest,
  getMyConnections,
  getCompletedSwaps,
};