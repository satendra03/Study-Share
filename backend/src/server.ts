// Main Server
import { env } from "./config/env.config.js";
import "./config/firebase.config.js";
import "./config/cloudinary.config.js";
import { connectMongoDB } from "./config/mongodb.config.js";

import app from "./app.js";

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
    app.listen(env.PORT, () => {
      console.log();
      console.log("🚀 Server started");
      console.log(`✅ Server running on port ${env.PORT}`);
      console.log(`URL: http://localhost:${env.PORT}`);
      console.log();
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();