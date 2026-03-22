import multer, { type FileFilterCallback } from "multer";

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
    fileFilter: (req, file, cb: FileFilterCallback) => {
        if (file.mimetype.startsWith("application/") || file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"));
        }
    }
});