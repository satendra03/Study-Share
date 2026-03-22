// All Routes
import { type Application } from "express";
import authRoute from "./modules/auth/auth.routes.js";
import { materialRoute } from "./modules/materials/material.routes.js";
import { userRoute } from "./modules/user/user.routes.js";
import chatbotRoute from "./modules/chatbot/chatbot.routes.js";
import adminRoute from "./modules/admin/admin.routes.js";
import codeRoute from "./modules/code/code.routes.js";

const routes = [
    authRoute,
    materialRoute,
    userRoute,
    chatbotRoute,
    adminRoute,
    codeRoute,
];

export const registerRoutes = (app: Application) => {
    routes.forEach((route) => {
        app.use(`/api/${route.path}`, route.router);
    });
};