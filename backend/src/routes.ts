// All Routes

import { type Application } from "express";

const routes = [
];

export const registerRoutes = (app: Application) => {
    routes.forEach((route) => {
        app.use(route.path, route.router);
    });
};