// Main Server

import "dotenv/config";

import "./config/firebase.config.js";
import "./config/cloudinary.config.js";
import { connectMongoDB } from "./config/mongodb.config.js";

import app from "./app.js";

const PORT = process.env.PORT || 5000;

/**
 * Start server with database connections
 */
async function startServer() {
  try {
    // Connect to MongoDB
    console.log();
    console.log("📡 Initializing database connections...");
    await connectMongoDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log();
      console.log("🚀 Server started");
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
      console.log();
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();