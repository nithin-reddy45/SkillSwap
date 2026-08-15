const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");

    const conn = await mongoose.connect(
      process.env.MONGO_URI,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    console.log(
      `MongoDB Connected: ${conn.connection.host}`
    );

  } catch (error) {
    console.error(
      "MongoDB Connection Error:",
      error.message
    );

    // Do not crash the server temporarily
  }
};

module.exports = connectDB;