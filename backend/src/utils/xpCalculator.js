/**
 * XP Calculator Service
 * Centralizes all logic for XP gains, Leveling, and Streak bonuses.
 */

// Constants
const BASE_XP_PER_MINUTE = 1;
const FOCUS_MODE_MULTIPLIER = 1;
const STREAK_BONUS_MULTIPLIER = 0; // Removed as per user request (min == XP)
const MAX_STREAK_BONUS = 0; 
const LEVEL_CONSTANT = 0.1; // Controls leveling curve

/**
 * Calculate XP for a completed study session
 * @param {number} minutes - Duration of session
 * @param {string} mode - 'focus' or 'free'
 * @param {number} currentStreak - Current streak count
 * @returns {object} { baseXP, bonusXP, totalXP }
 */
export const calculateSessionXP = (minutes, mode, currentStreak) => {
    // 1. Base XP
    let rate = BASE_XP_PER_MINUTE;
    if (mode === 'focus') rate *= FOCUS_MODE_MULTIPLIER;

    const baseXP = Math.round(minutes * rate);

    // 2. Streak Bonus
    // Cap bonus at 5 days (50%)
    const streakFactor = Math.min(currentStreak * STREAK_BONUS_MULTIPLIER, MAX_STREAK_BONUS);
    const bonusXP = Math.round(baseXP * streakFactor);

    return {
        baseXP,
        bonusXP,
        totalXP: baseXP + bonusXP
    };
};

/**
 * Check if user leveled up
 * Formula: Level = Constant * sqrt(TotalXP)
 * @param {number} currentXP
 * @param {number} currentLevel
 * @returns {number|null} New level if leveled up, null otherwise
 */
export const checkLevelUp = (currentXP, currentLevel) => {
    // Inverse: XP needed for level L = (L / Constant)^2
    // Level = 0.1 * sqrt(XP)  => Level 10 needs 10,000 XP
    const calculatedLevel = Math.floor(LEVEL_CONSTANT * Math.sqrt(currentXP)) || 1;

    if (calculatedLevel > currentLevel) {
        return calculatedLevel;
    }
    return null;
};

/**
 * Get XP required for next level
 * @param {number} level
 * @returns {number}
 */
export const getXpForLevel = (level) => {
    return Math.pow(level / LEVEL_CONSTANT, 2);
};
