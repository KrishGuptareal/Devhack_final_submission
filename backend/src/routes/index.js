import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.js";
import { clerkClient, getAuth } from "@clerk/express";

const router = Router();

// Public route for unauthenticated redirects
router.route("/sign-in").get((req, res) => {
    res.status(401).json({
        status: "fail",
        message: "Authentication required. Please sign in via the frontend and provide a Bearer token.",
        code: 401
    });
});

// Health check route linked to aggregator
router.route("/healthcheck").get((req, res) => {
    res.status(200).json({ status: "success", message: "Router is working!" });
});

// Protected Route Example
router.route("/auth-test").get(verifyAuth, async (req, res) => {
    const { userId } = getAuth(req);
    const user = await clerkClient.users.getUser(userId);

    res.status(200).json({
        status: "success",
        message: "You are authenticated!",
        user: user
    });
});

export default router;
