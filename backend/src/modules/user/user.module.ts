import { UserRepository } from "./repository/user.repository.js";
import { UserService } from "./service/user.service.js";
import { UserController } from "./user.controller.js";
import { materialService } from "../materials/material.module.js";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService, materialService);

export { userController, userService };