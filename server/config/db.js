const mongoose = require("mongoose");
const dns = require("dns");

// Configure robust public DNS resolvers to handle MongoDB SRV lookups reliably
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (dnsErr) {
  console.warn("Could not set custom DNS servers:", dnsErr.message);
}

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");

    const conn = await mongoose.connect(
      process.env.MONGO_URI,
      {
        serverSelectionTimeoutMS: 15000,
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
  }
};

module.exports = connectDB;