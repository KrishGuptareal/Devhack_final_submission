import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        ref: "User",
        description: "One progress profile per user"
    },

    totalXP: {
        type: Number,
        default: 0,
        min: 0,
        description: "Total XP earned by the user"
    },

    currentLevel: {
        type: Number,
        default: 1,
        min: 1,
        description: "Current level of the user"
    },

    xpGainRate: {
        type: Number,
        default: 1.0,
        min: 0.5,
        max: 1.0,
        description: "Multiplier for XP gain rate"
    },

    currentStreak: {
        type: Number,
        default: 0,
        description: "Current streak of consecutive study sessions"
    },

    longestStreak: {
        type: Number,
        default: 0,
        description: "Longest streak of consecutive study sessions"
    },

    totalStudyMinutes: {
        type: Number,
        default: 0,
        description: "Total study minutes of the user"
    },

    focusSessionCount: {
        type: Number,
        default: 0,
        description: "Number of focus study sessions"
    },

    freeSessionCount: {
        type: Number,
        default: 0,
        description: "Number of free study sessions"
    },

    lastStudyDate: {
        type: Date,
        default: null,
        description: "Last study session date"
    },

    abandonedSessionCount: {
        type: Number,
        default: 0,
        description: "Number of abandoned study sessions"
    },
});

export const UserProgress = mongoose.model("UserProgress", userProgressSchema);

