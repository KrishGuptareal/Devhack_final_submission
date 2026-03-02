import { Router } from "express";
import { 
  getAllElectives, 
  updateProfile, 
  getProfile, 
  getRecommendations, 
  selectElective 
} from "../controllers/elective.controller.js";
import { verifyAuth } from "../middlewares/auth.js";

const router = Router();

router.use(verifyAuth); // All elective routes require authentication

router.route("/all").get(getAllElectives);
router.route("/profile").get(getProfile).post(updateProfile);
router.route("/recommendations").get(getRecommendations);
router.route("/select").post(selectElective);

export default router;
