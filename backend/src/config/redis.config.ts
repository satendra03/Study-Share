// Redis configuration
import { Redis, type RedisOptions } from "ioredis";
import { env } from "./env.config.js";

console.log();
console.log("🧠 Loading redis.config.ts...");

let redisClient: Redis | null = null;

/**
 * Build Redis connection options using validated environment variables
 */
function getRedisOptions(): RedisOptions {
  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    // BullMQ uses blocking commands (BRPOP, BLPOP, etc.), and ioredis requires
    // maxRetriesPerRequest to be null to avoid losing the connection due to
    // command timeouts.
    maxRetriesPerRequest: null,
    // You can add additional options (password, tls, etc.) as needed.
  };
}

/**
 * Create (or reuse) a Redis client and validate connectivity.
 */
let redisShutdownHandlerInstalled = false;

async function connectRedis(): Promise<Redis> {
  if (redisClient && (redisClient.status === "ready" || redisClient.status === "connecting")) {
    console.log("✅ Using existing Redis client");
    return redisClient;
  }

  const options = getRedisOptions();
  console.log("🔗 Connecting to Redis...", `${options.host}:${options.port}`);

  redisClient = new Redis(options);

  redisClient.on("connect", () => {
    console.log("✅ Redis client connected");
  });

  redisClient.on("ready", () => {
    console.log("✅ Redis client ready");
  });

  redisClient.on("error", (error) => {
    console.error("❌ Redis error:", error);
  });

  redisClient.on("close", () => {
    console.warn("⚠️  Redis connection closed");
  });

  redisClient.on("reconnecting", () => {
    console.log("♻️  Redis reconnecting...");
  });

  try {
    // `redisClient` is assigned above and not null at this point.
    await redisClient.ping();
  } catch (error) {
    console.error("❌ Error connecting to Redis:", error);
    process.exit(1);
  }

  if (!redisShutdownHandlerInstalled) {
    process.on("SIGINT", async () => {
      await disconnectRedis();
      console.log("🛑 Redis connection closed on app termination");
      process.exit(0);
    });
    redisShutdownHandlerInstalled = true;
  }

  return redisClient;
}

/**
 * Get existing Redis client, connecting if necessary.
 */
function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error("Redis client is not initialized. Call connectRedis() first.");
  }
  return redisClient;
}

/**
 * Gracefully close Redis connection.
 */
async function disconnectRedis(): Promise<void> {
  const client = redisClient;
  if (!client) return;

  try {
    await client.quit();
    console.log("✅ Redis disconnected successfully");
  } catch (error) {
    console.error("❌ Error disconnecting Redis:", error);
    throw error;
  } finally {
    redisClient = null;
  }
}

/**
 * Check whether Redis is currently connected.
 */
function isRedisConnected(): boolean {
  return redisClient?.status === "ready";
}

export {
  connectRedis,
  getRedisClient,
  disconnectRedis,
  isRedisConnected,
  getRedisOptions,
};
