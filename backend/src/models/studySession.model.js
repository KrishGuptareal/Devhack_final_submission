import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
            description: "User ID"
        },

        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
            index: true,
            description: "Subject ID"
        },

        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            default: null,
            description: "Task ID"
        },

        mode: {
            type: String,
            enum: ['focus', 'free'],
            required: true,
            description: "Study session mode"
        },

        startTime: {
            type: Date,
            required: true,
            description: "Study session start time"
        },

        endTime: {
            type: Date,
            default: null,
            description: "Study session end time"
        },
        durationMinutes: {
            type: Number,
            default: 0,
            description: "Study session duration in minutes"
        },
        completionPercentage: {
            type: Number,
            default: 0,
            description: "Study session completion percentage"
        },

        xpEarned: {
            type: Number,
            default: 0,
            description: "Study session XP earned"
        },

        notes: {
            type: String,
            default: "",
            description: "Study session notes"
        },

        tempFiles: {
            type: [String],
            default: [],
            description: "Study session temporary files"
        },

        isAbandoned: {
            type: Boolean,
            default: false,
            description: "Study session abandoned status"
        },
    },
    {
        timestamps: true
    }
);

export const StudySession = mongoose.model("StudySession", studySessionSchema);