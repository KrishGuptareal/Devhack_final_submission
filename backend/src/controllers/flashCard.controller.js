import { FlashCard } from "../models/flashCard.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { getAuth } from "@clerk/express";
import mongoose from "mongoose";

import { Subject } from "../models/subject.model.js";

export const createFlashCard = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { subjectId, question, answer, difficulty } = req.body;

    // 1. Validate required fields
    if (!subjectId || !question || !answer) {
        throw new ApiError(400, "Subject, Question, and Answer are required");
    }

    // 2. Verify Subject Ownership
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
        throw new ApiError(404, "Subject not found or unauthorized");
    }

    // 3. Create Flashcard
    const flashCard = await FlashCard.create({
        userId,
        subjectId,
        question,
        answer,
        difficulty: difficulty || 'medium' // Use default if not provided
    });

    return res.status(201).json(new ApiResponse(201, flashCard, "Flash card created successfully"));
});

export const getFlashCardsByFilter = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { subjectId, difficulty } = req.query;

    const query = { userId };

    // Optional filters
    if (subjectId) query.subjectId = subjectId;
    if (difficulty) query.difficulty = difficulty;

    const flashCards = await FlashCard.find(query);

    return res.status(200).json(
        new ApiResponse(200, { flashCards }, `Found ${flashCards.length} flashcards`)
    );
});

export const getFlashCardById = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Flashcard ID format");
    }

    const flashCard = await FlashCard.findOne({ _id: id, userId });
    if (!flashCard) {
        throw new ApiError(404, "Flash card not found");
    }
    return res.status(200).json(new ApiResponse(200, flashCard, "Flash card fetched successfully"));
});

export const updateFlashCard = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { id } = req.params;
    const { question, answer, difficulty } = req.body;

    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Flashcard ID format");
    }

    const flashCard = await FlashCard.findOneAndUpdate({ _id: id, userId }, { question, answer, difficulty }, { new: true });
    if (!flashCard) {
        throw new ApiError(404, "Flash card not found");
    }
    return res.status(200).json(new ApiResponse(200, flashCard, "Flash card updated successfully"));
});

export const deleteFlashCard = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Flashcard ID format");
    }

    const flashCard = await FlashCard.findOneAndDelete({ _id: id, userId });

    if (!flashCard) {
        throw new ApiError(404, "Flash card not found");
    }

    return res.status(200).json(new ApiResponse(200, flashCard, "Flash card deleted successfully"));
});

