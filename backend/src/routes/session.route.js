import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    startSession,
    endSession,
    getActiveSession,
    uploadSessionFiles,
    deleteSessionFile,
    getSessionFiles
} from "../controllers/session.controller.js";

const sessionRouter = Router();

sessionRouter.use(verifyAuth);

sessionRouter.route("/active").get(getActiveSession);
sessionRouter.route("/start").post(startSession);
sessionRouter.route("/:sessionId/end").post(endSession);

// File routes
sessionRouter.route("/:sessionId/files").get(getSessionFiles);
sessionRouter.route("/:sessionId/upload").post(upload.single("file"), uploadSessionFiles);
sessionRouter.route("/:sessionId/file").delete(deleteSessionFile);

export default sessionRouter;