import { UserRepository } from "./repository/user.repository.js";
import { UserService } from "./service/user.service.js";
import { UserController } from "./user.controller.js";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export { userController, userService };