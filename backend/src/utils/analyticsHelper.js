/**
 * Analytics Helper Utilities
 * Pure functions for analytics calculations - no DB or HTTP dependencies
 */

// ============================================
// CONSTANTS
// ============================================

const MAX_STREAK_DAYS = 30;
const FREQUENCY_DECAY_RATE = 14.3; // Score decreases by this per day
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Weight constants for health score
const WEIGHTS = {
    STREAK: 0.30,
    COMPLETION: 0.30,
    FREQUENCY: 0.20,
    XP_RATE: 0.20
};

// ============================================
// INDIVIDUAL SCORE CALCULATORS
// ============================================

/**
 * Calculate streak score (30% weight)
 * @param {number} currentStreak - Current streak days
 * @returns {number} Weighted streak score
 */
export function calculateStreakScore(currentStreak) {
    const streakRaw = Math.min((currentStreak / MAX_STREAK_DAYS) * 100, 100);
    return Math.round(streakRaw * WEIGHTS.STREAK);
}

/**
 * Calculate completion rate score (30% weight)
 * @param {number} completedSessions - Number of completed sessions
 * @param {number} totalSessions - Total number of sessions
 * @returns {number} Weighted completion score
 */
export function calculateCompletionScore(completedSessions, totalSessions) {
    const completionRaw = totalSessions > 0
        ? (completedSessions / totalSessions) * 100
        : 50; // Neutral score if no sessions
    return Math.round(completionRaw * WEIGHTS.COMPLETION);
}

/**
 * Calculate frequency score based on recency of last study (20% weight)
 * @param {Date|null} lastStudyDate - Last study date
 * @returns {number} Weighted frequency score
 */
export function calculateFrequencyScore(lastStudyDate) {
    if (!lastStudyDate) return 0;

    const daysSinceLastStudy = calculateDaysSince(lastStudyDate);
    const frequencyRaw = Math.max(0, 100 - (daysSinceLastStudy * FREQUENCY_DECAY_RATE));
    return Math.round(frequencyRaw * WEIGHTS.FREQUENCY);
}

/**
 * Calculate XP gain rate score (20% weight)
 * @param {number} xpGainRate - XP multiplier (0.5 to 1.0)
 * @returns {number} Weighted XP rate score
 */
export function calculateXpRateScore(xpGainRate) {
    const xpRateRaw = ((xpGainRate - 0.5) / 0.5) * 100;
    return Math.round(xpRateRaw * WEIGHTS.XP_RATE);
}

// ============================================
// SESSION COUNTERS
// ============================================

/**
 * Calculate total sessions from focus and free counts
 * @param {number} focusSessionCount 
 * @param {number} freeSessionCount 
 * @returns {number} Total sessions
 */
export function calculateTotalSessions(focusSessionCount, freeSessionCount) {
    return focusSessionCount + freeSessionCount;
}

/**
 * Calculate completed sessions (total minus abandoned)
 * @param {number} totalSessions 
 * @param {number} abandonedSessionCount 
 * @returns {number} Completed sessions
 */
export function calculateCompletedSessions(totalSessions, abandonedSessionCount) {
    return totalSessions - abandonedSessionCount;
}

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Calculate days since a given date
 * @param {Date} date - The date to calculate from
 * @returns {number} Days since the date
 */
export function calculateDaysSince(date) {
    return Math.floor(
        (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    );
}

/**
 * Get date range for last 7 days
 * @returns {Object} { startDate, endDate }
 */
export function getWeekDateRange() {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    return { startDate, endDate };
}

/**
 * Format date to YYYY-MM-DD string
 * @param {Date} date 
 * @returns {string} Formatted date string
 */
export function formatDateString(date) {
    return date.toISOString().split("T")[0];
}

/**
 * Get day name from date
 * @param {Date} date 
 * @returns {string} Day name (Mon, Tue, etc.)
 */
export function getDayName(date) {
    return DAY_NAMES[date.getDay()];
}

// ============================================
// DEFAULT VALUES
// ============================================

/**
 * Get default health score for new users
 * @returns {Object} Default health data
 */
export function getDefaultHealthScore() {
    return {
        healthScore: 50,
        breakdown: {
            streakScore: 0,
            completionScore: 0,
            frequencyScore: 0,
            xpRateScore: 50
        },
        totalSessions: 0,
        completedSessions: 0,
        abandonedSessions: 0
    };
}

/**
 * Get default overview stats for new users
 * @returns {Object} Default overview data
 */
export function getDefaultOverviewStats() {
    return {
        totalXP: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalStudyMinutes: 0,
        totalSessions: 0,
        focusSessions: 0,
        freeSessions: 0,
        xpGainRate: 1.0,
        lastStudyDate: null
    };
}

// ============================================
// COMPOSITE FUNCTIONS
// ============================================

/**
 * Calculate academic health score from user progress data
 * @param {Object} userProgress - UserProgress document
 * @returns {Object} Health score data with breakdown
 */
export function calculateHealthScore(userProgress) {
    if (!userProgress) {
        return getDefaultHealthScore();
    }

    const totalSessions = calculateTotalSessions(
        userProgress.focusSessionCount,
        userProgress.freeSessionCount
    );
    const completedSessions = calculateCompletedSessions(
        totalSessions,
        userProgress.abandonedSessionCount
    );
    const abandonedSessions = userProgress.abandonedSessionCount;

    const streakScore = calculateStreakScore(userProgress.currentStreak);
    const completionScore = calculateCompletionScore(completedSessions, totalSessions);
    const frequencyScore = calculateFrequencyScore(userProgress.lastStudyDate);
    const xpRateScore = calculateXpRateScore(userProgress.xpGainRate);

    const healthScore = streakScore + completionScore + frequencyScore + xpRateScore;

    return {
        healthScore,
        breakdown: {
            streakScore,
            completionScore,
            frequencyScore,
            xpRateScore
        },
        totalSessions,
        completedSessions,
        abandonedSessions
    };
}

/**
 * Format overview stats from user progress data
 * @param {Object} userProgress - UserProgress document
 * @returns {Object} Formatted overview stats
 */
export function formatOverviewStats(userProgress) {
    if (!userProgress) {
        return getDefaultOverviewStats();
    }

    return {
        totalXP: userProgress.totalXP,
        currentLevel: userProgress.currentLevel,
        currentStreak: userProgress.currentStreak,
        longestStreak: userProgress.longestStreak,
        totalStudyMinutes: userProgress.totalStudyMinutes,
        totalSessions: calculateTotalSessions(
            userProgress.focusSessionCount,
            userProgress.freeSessionCount
        ),
        focusSessions: userProgress.focusSessionCount,
        freeSessions: userProgress.freeSessionCount,
        xpGainRate: userProgress.xpGainRate,
        lastStudyDate: userProgress.lastStudyDate
    };
}

/**
 * Build single day entry from session data
 * @param {Date} date - Date for the entry
 * @param {Object|undefined} dayData - Session data for the day
 * @returns {Object} Day entry object
 */
export function buildDayEntry(date, dayData) {
    return {
        day: getDayName(date),
        date: formatDateString(date),
        minutes: dayData?.minutes || 0,
        sessions: dayData?.sessions || 0,
        xp: dayData?.xp || 0
    };
}

/**
 * Aggregate weekly data from session results
 * @param {Array} sessions - Aggregated session data from MongoDB
 * @param {Date} startDate - Start date of the week
 * @returns {Object} Weekly breakdown with totals
 */
export function aggregateWeeklyData(sessions, startDate) {
    const weeklyData = [];
    let totalMinutes = 0;
    let totalSessions = 0;
    let totalXP = 0;

    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = formatDateString(date);

        const dayData = sessions.find(s => s._id === dateStr);
        const dayEntry = buildDayEntry(date, dayData);

        weeklyData.push(dayEntry);
        totalMinutes += dayEntry.minutes;
        totalSessions += dayEntry.sessions;
        totalXP += dayEntry.xp;
    }

    return {
        weeklyData,
        totalMinutes,
        totalSessions,
        totalXP
    };
}
