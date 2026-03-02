import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Task } from "../models/task.model.js";
import { Subject } from "../models/subject.model.js";
import { getAuth } from "@clerk/express";
import mongoose from "mongoose";

// Helper: Calculate priority based on days until deadline
const calculatePriority = (daysUntilDeadline) => {
  if (daysUntilDeadline < 3) return "critical";
  if (daysUntilDeadline < 7) return "high";
  if (daysUntilDeadline < 14) return "medium";
  return "low";
};

// Helper: Calculate urgency score (0-100)
const calculateUrgencyScore = (daysUntilDeadline) => {
  const score = 100 - daysUntilDeadline * 2;
  return Math.max(0, Math.min(100, score)); // Clamp between 0-100
};

// Helper: Get start and end of today
const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today, tomorrow };
};

export const generateDailyTasks = asyncHandler(async (req, res) => {
  const { today, tomorrow } = getTodayRange();
  const { userId } = getAuth(req);
  const force = req.query.force === "true";

  // Check for existing system-generated tasks today
  const existingTasks = await Task.find({
    userId,
    scheduledDate: { $gte: today, $lt: tomorrow },
    generatedBy: "system",
  });

  // If tasks already exist and force is not set, return them
  if (existingTasks.length > 0 && !force) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { tasks: existingTasks }, "Tasks already generated for today.")
      );
  }

  // Clean Slate: Remove existing pending system-generated tasks for today
  // (only when force is true or when regenerating)
  await Task.deleteMany({
    userId,
    scheduledDate: { $gte: today, $lt: tomorrow },
    generatedBy: "system",
    status: "pending"
  });

  // 2. Get all active subjects for the user
  const subjects = await Subject.find({
    userId,
    isActive: true,
    isArchived: false,
  });

  if (subjects.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { tasks: [] },
          "No active subjects found. Add subjects first."
        )
      );
  }

  // Generate a task for each subject
  const tasksToCreate = subjects
    .map((subject) => {
      // Calculate days until deadline
      const deadlineDate = new Date(subject.deadline.date);
      const daysUntilDeadline = Math.ceil(
        (deadlineDate - today) / (1000 * 60 * 60 * 24)
      );

      // Skip if deadline has passed
      if (daysUntilDeadline < 0) return null;

      // Calculate adjusted study time
      const adjustedMinutes =
        Math.round(
          (subject.dailyTimeCommitment * subject.workloadMultiplier) / 5
        ) * 5;

      return {
        userId,
        subjectId: subject._id,
        title: `${subject.name} - Study Session`,
        description: `Daily study task for ${subject.name}`,
        estimatedMinutes: adjustedMinutes,
        scheduledDate: today,
        priority: calculatePriority(daysUntilDeadline),
        urgencyScore: calculateUrgencyScore(daysUntilDeadline),
        status: "pending",
        generatedBy: "system",
      };
    })
    .filter((task) => task !== null); // Remove null entries (past deadlines)

  // Insert all tasks
  const createdTasks = await Task.insertMany(tasksToCreate);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { tasks: createdTasks },
        `Generated ${createdTasks.length} tasks for today`
      )
    );
});

export const getTodaysTasks = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { today, tomorrow } = getTodayRange();
  const { status = "all" } = req.query;

  // 1. Get all tasks for today with status given by user
  const tasks = await Task.find({
    userId,
    scheduledDate: { $gte: today, $lt: tomorrow },
    status:
      status === "all"
        ? { $in: ["pending", "in_progress", "completed", "skipped"] }
        : status,
  }).populate("subjectId", "name color");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { tasks }, `Found ${tasks.length} tasks for today`)
    );
});

export const getTaskById = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { taskId } = req.params;

  if (!mongoose.isValidObjectId(taskId)) {
    throw new ApiError(400, "Invalid Task ID format");
  }

  const task = await Task.findOne({
    userId,
    _id: taskId,
  }).populate("subjectId", "name color");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res.status(200).json(new ApiResponse(200, { task }, "Task found"));
});

export const createCustomTask = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { title, description, estimatedMinutes, scheduledDate, subjectId } =
    req.body;

  const task = await Task.create({
    userId,
    title,
    description,
    estimatedMinutes,
    scheduledDate,
    subjectId,
    generatedBy: "user",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { task }, "Task created successfully"));
});

export const updateTask = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { taskId } = req.params;
  const { title, description, estimatedMinutes, scheduledDate, subjectId } =
    req.body;

  if (!mongoose.isValidObjectId(taskId)) {
    throw new ApiError(400, "Invalid Task ID format");
  }

  const task = await Task.findOneAndUpdate(
    {
      userId,
      _id: taskId,
    },
    {
      title,
      description,
      estimatedMinutes,
      scheduledDate,
      subjectId,
    },
    {
      new: true,
    }
  ).populate("subjectId", "name color");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { task }, "Task updated successfully"));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { taskId } = req.params;

  if (!mongoose.isValidObjectId(taskId)) {
    throw new ApiError(400, "Invalid Task ID format");
  }

  const task = await Task.findOneAndDelete({
    userId,
    _id: taskId,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { task }, "Task deleted successfully"));
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { taskId } = req.params;
  const { status } = req.body;

  if (!mongoose.isValidObjectId(taskId)) {
    throw new ApiError(400, "Invalid Task ID format");
  }

  const task = await Task.findOneAndUpdate(
    {
      userId,
      _id: taskId,
    },
    {
      status,
    },
    {
      new: true,
    }
  ).populate("subjectId", "name color");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { task }, "Task status updated successfully"));
});

export const updateTaskCompletionPercentage = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { taskId } = req.params;
  const { completionPercentage } = req.body;

  if (!mongoose.isValidObjectId(taskId)) {
    throw new ApiError(400, "Invalid Task ID format");
  }

  const task = await Task.findOneAndUpdate(
    {
      userId,
      _id: taskId,
    },
    {
      completionPercentage,
    },
    {
      new: true,
    }
  ).populate("subjectId", "name color");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { task },
        "Task completion percentage updated successfully"
      )
    );
});
