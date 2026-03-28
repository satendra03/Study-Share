import rateLimit from "express-rate-limit";

const json429 = (_req: any, res: any) => {
    res.status(429).json({
        success: false,
        message: "Too many requests. Please slow down and try again later.",
    });
};

/**
 * Global catch-all — 200 requests per 15 minutes per IP.
 * Applied to every /api/* route.
 */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json429,
});

/**
 * Auth routes (login, token refresh) — 15 requests per 15 minutes.
 * Prevents brute-force on Firebase email/password sign-in proxy endpoints.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json429,
});

/**
 * File upload — 10 uploads per hour.
 * Prevents abuse of Cloudinary + BullMQ pipeline.
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: "Upload limit reached. You can upload up to 10 files per hour.",
        });
    },
});

/**
 * AI chat (material chat + chatbot) — 40 requests per 15 minutes.
 * Each call hits Gemini; keep this tight to control API costs.
 */
export const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: "AI request limit reached. Please wait a moment before asking again.",
        });
    },
});

/**
 * Code execution — 20 requests per 15 minutes.
 * Prevents abuse of sandbox; each run consumes server resources.
 */
export const codeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            success: false,
            message: "Code execution limit reached. Please wait before running more code.",
        });
    },
});

/**
 * Admin endpoints — 60 requests per 15 minutes.
 * Admin actions are low-volume; this stops enumeration/scraping.
 */
export const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json429,
});
