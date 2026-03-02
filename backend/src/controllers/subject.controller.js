import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Subject } from "../models/subject.model.js";
import { Task } from "../models/task.model.js";
import { getAuth } from "@clerk/express";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";


const getAllSubjects = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const subjects = await Subject.find({ userId });
    return res.status(200).json(
        new ApiResponse(200, { subjects }, "Subjects fetched successfully")
    )
});

const createSubject = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    console.log("Create Subject Request - UserID:", userId);
    console.log("Request Body:", req.body);

    if (!userId) {
        throw new ApiError(401, "Unauthorized request: No user ID found from Clerk.");
    }

    const { name, color, icon, dailyTimeCommitment, deadline, workloadMultiplier, minWorkloadThreshold } = req.body;


    //console.log("JSONed Deadline:", deadline);

    const subject = await Subject.create({
        userId,
        name,
        color,
        icon,
        dailyTimeCommitment,
        deadline,
        workloadMultiplier,
        minWorkloadThreshold
    });

    return res.status(201).json(
        new ApiResponse(201, { subject }, "Subject created successfully")
    )
});

const updateSubject = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Subject ID format");
    }

    const { userId } = getAuth(req);
    const { name, color, icon, dailyTimeCommitment, deadline, workloadMultiplier, minWorkloadThreshold, isActive, isArchived } = req.body;

    const subject = await Subject.findOneAndUpdate(
        { _id: id, userId },
        {
            name,
            color,
            icon,
            dailyTimeCommitment,
            deadline,
            workloadMultiplier,
            minWorkloadThreshold,
            isActive,
            isArchived
        },
        { new: true, runValidators: true }
    );

    if (!subject) {
        throw new ApiError(404, "Subject not found or unauthorized");
    }

    // If subject is archived or deactivated, delete its pending tasks
    if (isArchived === true || isActive === false) {
        await Task.deleteMany({
            subjectId: id,
            userId,
            status: "pending"
        });
    }

    return res.status(200).json(
        new ApiResponse(200, { subject }, "Subject updated successfully")
    )
});

const deleteSubject = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new ApiError(400, "Invalid Subject ID format");
    }
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId });

    if (!subject) {
        throw new ApiError(404, "Subject not found or unauthorized");
    }

    // Cascade delete: remove all tasks for this subject
    const deletedTasks = await Task.deleteMany({ subjectId: req.params.id, userId });
    console.log(`Deleted ${deletedTasks.deletedCount} tasks for subject ${subject.name}`);

    return res.status(200).json(
        new ApiResponse(200, { subject, deletedTasksCount: deletedTasks.deletedCount }, "Subject and associated tasks deleted successfully")
    )
});

const getSubjectById = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new ApiError(400, "Invalid Subject ID format");
    }
    const subject = await Subject.findOne({ _id: req.params.id, userId });

    if (!subject) {
        throw new ApiError(404, "Subject not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, { subject }, "Subject fetched successfully")
    )
});


export {
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubjectById
}