import mongoose from "mongoose";

const flashCardSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            ref: "User",
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

        question: {
            type: String,
            required: true,
            maxLength: 500,
            description: "Question"
        },

        answer: {
            type: String,
            required: true,
            maxLength: 1000,
            description: "Answer"
        },

        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
            description: "Difficulty level"
        },

        reviewCount: {
            type: Number,
            default: 0,
            description: "Review count"
        },

        lastReviewed: {
            type: Date,
            default: null,
            description: "Last reviewed date"
        },

        nextReviewDate: {
            type: Date,
            default: null,
            description: "Next review date"
        },
    },
    {
        timestamps: true
    }
);

export const FlashCard = mongoose.model("Flashcard", flashCardSchema);
    