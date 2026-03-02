import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.js";
import {
    generateDailyTasks,
    getTodaysTasks,
    getTaskById,
    createCustomTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskCompletionPercentage
} from "../controllers/task.controller.js";

const taskRouter = Router();

taskRouter.use(verifyAuth);

taskRouter.route("/generate").post(generateDailyTasks);
taskRouter.route("/today").get(getTodaysTasks);
// Custom Task CRUD
taskRouter.route("/")
    .post(createCustomTask);

taskRouter.route("/:taskId")
    .get(getTaskById)
    .put(updateTask)
    .delete(deleteTask);

// specific updates
taskRouter.route("/:taskId/status").patch(updateTaskStatus);
taskRouter.route("/:taskId/completion").patch(updateTaskCompletionPercentage);

export default taskRouter;