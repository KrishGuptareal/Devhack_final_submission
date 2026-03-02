import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { UserProgress } from "../models/userProgress.model.js";
import { StudySession } from "../models/studySession.model.js";
import { getAuth } from "@clerk/express";
import {
    calculateHealthScore,
    formatOverviewStats,
    getWeekDateRange,
    aggregateWeeklyData
} from "../utils/analyticsHelper.js";

/**
 * GET /api/v1/analytics/health
 * Returns academic health score (0-100) based on user's study patterns
 */
const getAcademicHealth = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const userProgress = await UserProgress.findOne({ userId });
    const healthData = calculateHealthScore(userProgress);

    return res.status(200).json(
        new ApiResponse(200, healthData, "Academic health fetched successfully")
    );
});

/**
 * GET /api/v1/analytics/overview
 * Returns dashboard stats: XP, level, streaks, study time, sessions
 */
const getOverview = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const userProgress = await UserProgress.findOne({ userId });
    const overviewData = formatOverviewStats(userProgress);

    return res.status(200).json(
        new ApiResponse(200, overviewData, "Overview fetched successfully")
    );
});

/**
 * GET /api/v1/analytics/weekly
 * Returns last 7 days of study session data for charts
 */
const getWeeklyBreakdown = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { startDate, endDate } = getWeekDateRange();

    const sessions = await StudySession.aggregate([
        {
            $match: {
                userId: userId,
                startTime: { $gte: startDate, $lte: endDate },
                isAbandoned: false
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$startTime" }
                },
                minutes: { $sum: "$durationMinutes" },
                sessions: { $sum: 1 },
                xp: { $sum: "$xpEarned" }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    const weeklyData = aggregateWeeklyData(sessions, startDate);

    return res.status(200).json(
        new ApiResponse(200, weeklyData, "Weekly breakdown fetched successfully")
    );
});

export {
    getAcademicHealth,
    getOverview,
    getWeeklyBreakdown
};
