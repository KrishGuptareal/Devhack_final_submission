import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { UserProgress } from "../models/userProgress.model.js";
import { clerkClient } from "@clerk/express";
import { getAuth } from "@clerk/express";

const syncUser = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    // Fetch from Clerk for latest metadata
    const clerkUser = await clerkClient.users.getUser(userId);

    let user;
    try {
        // Update or Create (atomic upsert)
        user = await User.findOneAndUpdate(
            { clerkId: userId },
            {
                $setOnInsert: {
                    email: clerkUser.emailAddresses[0].emailAddress,
                    username: clerkUser.username || clerkUser.emailAddresses[0].emailAddress.split("@")[0],
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    } catch (err) {
        // Handle race condition: if a duplicate key error occurs (E11000),
        // another concurrent request already created the user — just fetch it.
        if (err.code === 11000) {
            user = await User.findOne({ clerkId: userId });
        } else {
            throw err;
        }
    }

    if (!user) {
        throw new ApiError(500, "Something went wrong while syncing user")
    }

    // Get or create user progress atomically to avoid race-condition duplicates
    const progress = await UserProgress.findOneAndUpdate(
        { userId: user.clerkId },
        { $setOnInsert: { userId: user.clerkId } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const userWithProgress = user.toObject();
    userWithProgress.progress = progress;

    return res.status(200).json(
        new ApiResponse(200, { user: userWithProgress }, "User synced successfully")
    )
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const progress = await UserProgress.findOne({ userId: user.clerkId });
    const userWithProgress = user.toObject();
    userWithProgress.progress = progress;

    return res.status(200).json(
        new ApiResponse(200, { user: userWithProgress }, "User fetched successfully")
    )
});

const updateCurrentUser = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { preferences, onboardingCompleted } = req.body;

    const cleanupUpdate = {};
    if (onboardingCompleted !== undefined) cleanupUpdate.onboardingCompleted = onboardingCompleted;
    if (preferences) {
        // Dot notation for nested updates to avoid overwriting entire object
        // Use != null to allow falsy values like 0 or false
        if (preferences.defaultStudyMode != null) cleanupUpdate["preferences.defaultStudyMode"] = preferences.defaultStudyMode;
        if (preferences.defaultSessionDuration != null) cleanupUpdate["preferences.defaultSessionDuration"] = preferences.defaultSessionDuration;
        if (preferences.timezone != null) cleanupUpdate["preferences.timezone"] = preferences.timezone;
        if (preferences.theme != null) cleanupUpdate["preferences.theme"] = preferences.theme;
        // Notification preferences
        if (preferences.notifications) {
            if (preferences.notifications.tasks != null) cleanupUpdate["preferences.notifications.tasks"] = preferences.notifications.tasks;
            if (preferences.notifications.deadlines != null) cleanupUpdate["preferences.notifications.deadlines"] = preferences.notifications.deadlines;
            if (preferences.notifications.dailySummary != null) cleanupUpdate["preferences.notifications.dailySummary"] = preferences.notifications.dailySummary;
            if (preferences.notifications.xpMilestones != null) cleanupUpdate["preferences.notifications.xpMilestones"] = preferences.notifications.xpMilestones;
        }
    }

    const user = await User.findOneAndUpdate(
        { clerkId: userId },
        { $set: cleanupUpdate },
        { new: true, runValidators: true }
    );

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(200, { user }, "User updated successfully")
    )
});

export {
    syncUser,
    getCurrentUser,
    updateCurrentUser
}
