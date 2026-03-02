import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.js";
import { syncUser, getCurrentUser, updateCurrentUser } from "../controllers/user.controller.js";

const userRouter = Router();

// Apply auth middleware to all variants of routes
userRouter.use(verifyAuth);

userRouter.route("/login").get(syncUser);
userRouter.route("/me").get(getCurrentUser).patch(updateCurrentUser);

export default userRouter;