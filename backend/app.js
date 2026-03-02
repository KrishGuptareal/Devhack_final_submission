import express from "express"
import cors from "cors"
import router from "./src/routes/index.js"
import userRouter from "./src/routes/user.route.js"
import taskRouter from "./src/routes/task.route.js"
import sessionRouter from "./src/routes/session.route.js"
import subjectRouter from "./src/routes/subject.route.js"
import flashCardRouter from "./src/routes/flashCard.route.js"
import analyticsRouter from "./src/routes/analytics.route.js"
import aiRouter from "./src/routes/ai.route.js"
import { clerkMiddleware } from "@clerk/express"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(clerkMiddleware())
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))

app.use("/api/v1", router)
app.use("/api/v1/users", userRouter) // Mounted at /api/v1/users/login
app.use("/api/v1/tasks", taskRouter)
app.use("/api/v1/sessions", sessionRouter)
app.use("/api/v1/subjects", subjectRouter)
app.use("/api/v1/flashcards", flashCardRouter)
app.use("/api/v1/analytics", analyticsRouter)
app.use("/api/v1/ai", aiRouter)

app.use((err, req, res, next) => {
    console.error("Error encountered:", err);
    if (err instanceof Error) {
        return res.status(err.statusCode || 500).json({
            status: "error",
            message: err.message || "Internal Server Error",
            errors: err.errors || []
        });
    }
    next(err);
});


export { app }