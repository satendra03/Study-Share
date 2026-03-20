import { AuthController } from "@/modules/auth/auth.controller.js";
import { AuthService } from "@/modules/auth/service/auth.service.js";

const authService = new AuthService();
const authController = new AuthController(authService);

export { authController };
