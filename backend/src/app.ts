import express, { type Application, type Request, type Response } from "express";
import { registerMiddlewares, registerErrorHandlers } from "./middlewares/index.js";
import { registerRoutes } from "./routes.js";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Application
const app: Application = express();

// Middleware
registerMiddlewares(app);

// ── Root Route ──────────────────────────────────────────────────────────────
// Serves the frontend's index.html for all routes.
// This allows the frontend router to handle all navigation client-side.
app.get("/", (_req: Request, res: Response) => {
    res.status(200).sendFile(path.join(__dirname, "index.html"));
});


// ── Health Check ────────────────────────────────────────────────────────────
// Lightweight endpoint for the frontend to verify the backend is reachable.
// No auth required. Returns 200 when the server is up.
app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});

registerRoutes(app);
registerErrorHandlers(app);

export default app;
