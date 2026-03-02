import { Router } from "express";
import { getAcademicHealth, getOverview, getWeeklyBreakdown } from "../controllers/analytics.controller.js";
import { verifyAuth } from "../middlewares/auth.js";

const analyticsRouter = Router();

// Apply auth middleware to all routes
analyticsRouter.use(verifyAuth);

// GET /api/v1/analytics/health - Academic health score
analyticsRouter.get("/health", getAcademicHealth);

// GET /api/v1/analytics/overview - Dashboard stats
analyticsRouter.get("/overview", getOverview);

// GET /api/v1/analytics/weekly - Weekly breakdown chart data
analyticsRouter.get("/weekly", getWeeklyBreakdown);

export default analyticsRouter;