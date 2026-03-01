import express, { type Application } from "express";
import { registerMiddlewares, registerErrorHandlers } from "./middlewares/index.js" 
import { registerRoutes } from "./routes.js";
// Application
const app: Application = express();

// Middleware
registerMiddlewares(app);
registerRoutes(app);
registerErrorHandlers(app);

export default app;
