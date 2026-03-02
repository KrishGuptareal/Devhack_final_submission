import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    userId: {
        type: String, // Storing Clerk ID
        required: true,
        index: true,
        description: "User ID"
    },

    name: {
        type: String,
        required: true,
        description: "Subject name"
    },
    color: {
        type: String,
        default: function () {
            // Generate random hex color
            return '#' + Math.floor(Math.random() * 16777215).toString(16);
        },
        description: "Subject color"
    },
    icon: {
        type: String,
        description: "Subject icon"
    },

    dailyTimeCommitment: {
        type: Number,
        required: true,
        min: 15,
        description: "Daily time commitment in minutes"
    },

    deadline: {
        date: {
            type: Date,
            required: true,
            description: "Deadline date"
        },
        type: {
            type: String,
            enum: ['exam', 'assignment'],
            required: true,
            description: "Deadline type"
        }
    },

    // Adaptive workload control
    workloadMultiplier: {
        type: Number,
        default: 1.0,
        min: 0.5,
        max: 1.5,
        description: "Workload multiplier"
    },
    minWorkloadThreshold: {
        type: Number,
        default: 0.5,
        description: "Minimum workload threshold"
    },

    isActive: {
        type: Boolean,
        default: true,
        description: "Is subject active"
    },
    isArchived: {
        type: Boolean,
        default: false,
        description: "Is subject archived"
    }
}, {
    timestamps: true
});

export const Subject = mongoose.model("Subject", subjectSchema);
