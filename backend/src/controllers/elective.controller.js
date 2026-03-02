import Elective from "../models/elective.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import { getAuth } from "@clerk/express";

// Get all electives
export const getAllElectives = async (req, res) => {
  try {
    const electives = await Elective.find();
    res.status(200).json({ status: "success", data: electives });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update student profile (Onboarding)
export const updateProfile = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { branch, careerInterests, fixedSlots } = req.body;

    const profile = await StudentProfile.findOneAndUpdate(
      { clerkId: userId },
      { branch, careerInterests, fixedSlots },
      { new: true, upsert: true }
    );

    res.status(200).json({ status: "success", data: profile });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get current student profile
export const getProfile = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const profile = await StudentProfile.findOne({ clerkId: userId }).populate('selectedElectives');
    res.status(200).json({ status: "success", data: profile });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Recommendation Logic
export const getRecommendations = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const profile = await StudentProfile.findOne({ clerkId: userId });

    if (!profile) {
      return res.status(404).json({ status: "fail", message: "Profile not found. Please complete onboarding." });
    }

    const allElectives = await Elective.find();

    const recommended = allElectives.map(elective => {
      let score = 0;

      // 60% Weight: Career Match
      const careerMatch = elective.careerTags.some(tag => profile.careerInterests.includes(tag.toLowerCase()));
      if (careerMatch) score += 60;

      // 30% Weight: Branch Relevance
      const branchMatch = elective.branchTags.includes(profile.branch.toUpperCase());
      if (branchMatch) score += 30;

      // 10% Weight: Availability (Fake value for now)
      const availabilityFactor = Math.max(0, 10 - (elective.currentEnrollment / elective.maxCapacity) * 10);
      score += availabilityFactor;

      // Conflict Check: If elective slot is in profile.fixedSlots, it's a hard conflict
      const hasConflict = profile.fixedSlots.includes(elective.slotId);

      return {
        ...elective.toObject(),
        recommendationScore: score,
        hasConflict
      };
    });

    // Sort by score and put conflicts at the bottom
    const sorted = recommended.sort((a, b) => {
      if (a.hasConflict && !b.hasConflict) return 1;
      if (!a.hasConflict && b.hasConflict) return -1;
      return b.recommendationScore - a.recommendationScore;
    });

    res.status(200).json({ status: "success", data: sorted });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Select an elective
export const selectElective = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { electiveId } = req.body;

    const elective = await Elective.findById(electiveId);
    if (!elective) throw new Error("Elective not found");

    const profile = await StudentProfile.findOne({ clerkId: userId });
    if (!profile) {
      throw new Error("Profile not found. Please complete onboarding first.");
    }
    if (profile.fixedSlots.includes(elective.slotId)) {
      throw new Error("Conflict with core timetable slot " + elective.slotId);
    }

    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { clerkId: userId },
      { $addToSet: { selectedElectives: electiveId } },
      { new: true }
    ).populate('selectedElectives');

    res.status(200).json({ status: "success", data: updatedProfile });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
