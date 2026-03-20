import { Router } from "express";
import { userController } from "@/modules/user/user.module.js";
import { verifyFirebaseToken, requireAppUser, requireAdmin } from "@/middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/firebase", userController.getByFirebaseUid);
userRouter.get("/email", userController.getByEmail);
userRouter.get("/search", userController.searchUsers);
userRouter.get("/:id", userController.getById);
userRouter.put("/:id", verifyFirebaseToken, requireAppUser, userController.updateUser);
userRouter.delete("/:id", verifyFirebaseToken, requireAppUser, requireAdmin, userController.deleteUser);

export const userRoute = {
    path: "user",
    router: userRouter,
};