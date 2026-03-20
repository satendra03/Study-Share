// Cloudinary configuration
import { InternalServerError } from "@/shared/ApiError.js";
import { v2 as cloudinary, type ConfigOptions, type UploadApiErrorResponse, type UploadApiResponse } from "cloudinary";

console.log();
console.log("☁️  Loading cloudinary.config.ts...");

let cloudinaryInitialized = false;

/**
 * Initialize Cloudinary with API credentials
 * Handles file upload, transformation, and storage
 */
function initializeCloudinary(): void {
  if (cloudinaryInitialized) {
    console.log("✅ Cloudinary already initialized");
    return;
  }

  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        "Missing required Cloudinary environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
      );
    }

    console.log("🔑 Configuring Cloudinary credentials...");

    const config: ConfigOptions = {
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
      // Additional options for better performance
      timeout: 60000,  // 60 seconds timeout
    };

    cloudinary.config(config);

    cloudinaryInitialized = true;
    console.log("✅ Cloudinary initialized successfully");
    console.log(`📍 Cloud Name: ${cloudName}`);
  } catch (error) {
    console.error("❌ Error initializing Cloudinary:", error);
    process.exit(1);
  }
}

/**
 * Get Cloudinary instance
 */
function getCloudinary() {
  if (!cloudinaryInitialized) {
    initializeCloudinary();
  }
  return cloudinary;
}

/**
 * Upload file to Cloudinary
 */
async function uploadFile(
  fileBuffer: Buffer,
  options?: {
    folder?: string;
    publicId?: string;
    resourceType?: "auto" | "image" | "video" | "raw";
    overwrite?: boolean;
    quality?: "auto" | number;
    format?: string;
    tags?: string[];
    metadata?: Record<string, string>;
  }
): Promise<{
  publicId: string;
  url: string;
  format?: string;
  width?: number;
  height?: number;
  size?: number;
  resourceType?: string;
  createdAt?: string;
  originalFilename?: string;
}> {
  try {
    if (!cloudinaryInitialized) {
      initializeCloudinary();
    }

    console.log(`📤 Uploading file buffer to Cloudinary`);

    const uploadOptions = {
      folder: "study-share/materials",
      resource_type: "raw" as const,
      use_filename: true,
      unique_filename: true,
      quality: "auto" as const,
      ...options,
    };

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("No result from Cloudinary"));

          resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });

    console.log(`✅ File uploaded successfully: ${result.public_id}`);

    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
      resourceType: result.resource_type,
      createdAt: result.created_at,
      originalFilename: result.original_filename,
    };
  } catch (error) {
    console.error("❌ Error uploading file to Cloudinary:", error);
    throw new InternalServerError();
  }
}

/**
 * Delete file from Cloudinary
 */
async function deleteFile(publicId: string, resourceType: string = "auto") {
  try {
    if (!cloudinaryInitialized) {
      initializeCloudinary();
    }

    console.log(`🗑️  Deleting file: ${publicId}`);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType as "auto" | "image" | "video" | "raw",
    });

    console.log(`✅ File deleted successfully: ${publicId}`);
    return result;
  } catch (error) {
    console.error("❌ Error deleting file from Cloudinary:", error);
    throw error;
  }
}

/**
 * Get file information from Cloudinary
 */
async function getFileInfo(publicId: string) {
  try {
    if (!cloudinaryInitialized) {
      initializeCloudinary();
    }

    const result = await cloudinary.api.resource(publicId);

    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
      created: result.created_at,
      tags: result.tags,
    };
  } catch (error) {
    console.error("❌ Error getting file info from Cloudinary:", error);
    throw error;
  }
}

/**
 * Generate transformation URL for file
 * Used for resizing images, extracting PDFs pages, etc.
 */
function generateTransformationUrl(
  publicId: string,
  transformations?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
    page?: number;                      // For PDF - page number
  }
) {
  try {
    if (!cloudinaryInitialized) {
      initializeCloudinary();
    }

    const url = cloudinary.url(publicId, {
      secure: true,
      ...transformations,
    });

    return url;
  } catch (error) {
    console.error("❌ Error generating transformation URL:", error);
    throw error;
  }
}

/**
 * Check Cloudinary initialization status
 */
function isCloudinaryInitialized(): boolean {
  return cloudinaryInitialized;
}

// Initialize on import
initializeCloudinary();

export {
  cloudinary,
  initializeCloudinary,
  getCloudinary,
  uploadFile,
  deleteFile,
  getFileInfo,
  generateTransformationUrl,
  isCloudinaryInitialized,
};
