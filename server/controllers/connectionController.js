const Connection = require("../models/Connection");
const User = require("../models/User");


// SEND CONNECTION REQUEST
const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.receiverId;

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

    if (existingConnection) {
      if (existingConnection.status === "accepted") {
        return res.status(400).json({
          message: "You are already connected with this user",
        });
      }

      if (existingConnection.status === "pending") {
        return res.status(400).json({
          message: "A connection request already exists",
        });
      }

      return res.status(400).json({
        message: "Connection request already exists",
      });
    }


    // Create new connection request
    let connection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });


    // Populate sender details for frontend notification
    connection = await connection.populate(
      "sender",
      "name email teachSkills learnSkills"
    );


    // GET SOCKET.IO INSTANCE
    const io = req.app.get("io");


    // SEND REAL-TIME NOTIFICATION
    if (io) {
      io.to(String(receiverId)).emit(
        "newConnectionRequest",
        {
          connection,
          message: `${connection.sender.name} sent you a connection request`,
        }
      );
    }


    res.status(201).json({
      message: "Connection request sent successfully",
      connection,
    });

  } catch (error) {
    console.error(
      "Connection Error:",
      error
    );

    res.status(500).json({
      message: "Failed to send connection request",
    });
  }
};


// GET INCOMING REQUESTS
const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Connection.find({
      receiver: userId,
      status: "pending",
    })
      .populate(
        "sender",
        "name email teachSkills learnSkills"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json(requests);

  } catch (error) {
    console.error(
      "Get Requests Error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch connection requests",
    });
  }
};


// UPDATE CONNECTION REQUEST
const updateConnectionRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const connectionId = req.params.connectionId;

    const { status } = req.body;


    // Validate status
    if (
      !["accepted", "rejected"].includes(status)
    ) {
      return res.status(400).json({
        message:
          "Status must be accepted or rejected",
      });
    }


    const connection =
      await Connection.findOne({
        _id: connectionId,
        receiver: userId,
        status: "pending",
      });


    if (!connection) {
      return res.status(404).json({
        message:
          "Connection request not found",
      });
    }


    // Update status
    connection.status = status;

    await connection.save();


    // GET SOCKET.IO INSTANCE
    const io = req.app.get("io");


    // Notify the original sender in real time
    if (io) {
      io.to(
        String(connection.sender)
      ).emit(
        "connectionRequestUpdated",
        {
          connectionId: connection._id,
          senderId: connection.sender,
          receiverId: connection.receiver,
          status,
        }
      );
    }


    res.status(200).json({
      message: `Connection request ${status}`,
      connection,
    });

  } catch (error) {
    console.error(
      "Update Connection Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update connection request",
    });
  }
};


// GET MY CONNECTIONS
const getMyConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const connections =
      await Connection.find({
        status: "accepted",

        $or: [
          {
            sender: userId,
          },
          {
            receiver: userId,
          },
        ],
      })
        .populate(
          "sender",
          "name email teachSkills learnSkills"
        )
        .populate(
          "receiver",
          "name email teachSkills learnSkills"
        )
        .sort({
          updatedAt: -1,
        });


    const formattedConnections =
      connections.map((connection) => {

        const otherUser =
          String(connection.sender._id) ===
          String(userId)
            ? connection.receiver
            : connection.sender;


        return {
          _id: connection._id,
          user: otherUser,
          connectedAt: connection.updatedAt,
        };
      });


    res.status(200).json(
      formattedConnections
    );

  } catch (error) {
    console.error(
      "Get Connections Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch connections",
    });
  }
};


module.exports = {
  sendConnectionRequest,
  getIncomingRequests,
  updateConnectionRequest,
  getMyConnections,
};