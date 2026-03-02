import mongoose from "mongoose";

const electiveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slotId: {
    type: String,
    required: true, // e.g., 'A', 'H', 'L'
    uppercase: true
  },
  credits: {
    type: Number,
    required: true,
    default: 3
  },
  branchTags: [{
    type: String, // CSE, ECE, MECH, etc.
    uppercase: true
  }],
  careerTags: [{
    type: String, // AI, Data Science, WebDev, Core, etc.
    lowercase: true
  }],
  maxCapacity: {
    type: Number,
    default: 60
  },
  currentEnrollment: {
    type: Number,
    default: 0
  },
  prerequisites: [String],
  description: String
}, {
  timestamps: true
});

const Elective = mongoose.model("Elective", electiveSchema);

export default Elective;
