// MongoDB configuration
import mongoose, { type Connection } from "mongoose";

console.log();
console.log("🗄️  Loading mongodb.config.ts...");

let mongoConnection: Connection | null = null;

/**
 * Connect to MongoDB database
 * Handles connection pooling, retries, and error handling
 */
async function connectMongoDB(): Promise<Connection> {
  if (mongoConnection) {
    console.log("✅ Using existing MongoDB connection");
    return mongoConnection;
  }

  try {
    // const mongoUri = process.env.NODE_ENV === "production"
    //   ? process.env.MONGODB_ATLAS
    //   : process.env.MONGODB_COMPASS;
    const mongoUri = process.env.MONGODB_ATLAS
    
    if (!mongoUri) {
      console.error("❌ MONGODB_URI is undefined in environment variables");
      throw new Error("MONGODB_URI is required");
    }

    console.log("🔗 Connecting to MongoDB...");

    // Connect to MongoDB with optimized options
    const connection = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,                      // Max connections in pool
      minPoolSize: 5,                       // Min connections in pool
      serverSelectionTimeoutMS: 5000,       // Server selection timeout
      socketTimeoutMS: 45000,               // Socket timeout
      connectTimeoutMS: 10000,              // Connection timeout
      retryWrites: true,                    // Automatic retry for writes
      w: "majority",                        // Write concern
      maxIdleTimeMS: 45000,                 // Max idle time for connections
      authSource: "admin",                  // Authentication source
    });

    mongoConnection = connection.connection;

    console.log("✅ MongoDB connected successfully");
    console.log(`📍 Connected to: ${mongoUri.split("@")[1] || "local database"}`);

    // Handle connection events
    mongoConnection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
    });

    mongoConnection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
      mongoConnection = null;
    });

    mongoConnection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

    process.on("SIGINT", () => {
      mongoConnection?.close();
      console.log("🛑 MongoDB connection closed on app termination");
      process.exit(0);
    });

    return mongoConnection;
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectMongoDB(): Promise<void> {
  try {
    if (mongoConnection) {
      await mongoose.disconnect();
      mongoConnection = null;
      console.log("✅ MongoDB disconnected successfully");
    }
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error);
    throw error;
  }
}

/**
 * Get current MongoDB connection
 */
function getMongoConnection(): Connection {
  if (!mongoConnection) {
    throw new Error("MongoDB is not connected. Call connectMongoDB() first.");
  }
  return mongoConnection;
}

/**
 * Check MongoDB connection status
 */
function isMongoConnected(): boolean {
  return mongoConnection?.readyState === 1; // 1 = connected
}

export {
  connectMongoDB,
  disconnectMongoDB,
  getMongoConnection,
  isMongoConnected,
  mongoose,
};
