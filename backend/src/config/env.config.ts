import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.string().default("5000").transform((val) => parseInt(val, 10)),

  MONGODB_ATLAS: z.string().min(1, "MONGODB_ATLAS is required"),
  MONGODB_COMPASS: z.string().min(1, "MONGODB_COMPASS is required"),

  MONGODB_SERVICE_CLIENT_ID: z.string().min(1, "MONGODB_SERVICE_CLIENT_ID is required"),
  MONGODB_SERVICE_CLIENT_SECRET: z.string().min(1, "MONGODB_SERVICE_CLIENT_SECRET is required"),

  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),

  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_URL: z.string().min(1, "CLOUDINARY_URL is required"),

  NVIDIA_API_KEY: z.string().min(1, "NVIDIA_API_KEY is required"),
  NVIDIA_OCR_URL: z.string().min(1, "NVIDIA_OCR_URL (Model URL) is required"),

  QDRANT_API_KEY: z.string().min(1, "QDRANT_API_KEY is required"),
  QDRANT_URL: z.string().min(1, "QDRANT_URL is required"),

  EMBEDDING_SERVER_URL: z.string().min(1, "EMBEDDING_SERVER_URL is required"),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z
    .string()
    .default("6379")
    .transform((val) => parseInt(val, 10)),
  REDIS_URL: z.string().default(""),
    
  FIREBASE_ADMIN_KEY: z.string().min(1, "FIREBASE_ADMIN_KEY is required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;