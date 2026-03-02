import { Router } from "express";
import { enhanceText } from "../controllers/ai.controller.js";

const router = Router();

// AI text enhancement endpoint (public - no auth required for quick access)
router.route("/enhance").post(enhanceText);

export default router;
