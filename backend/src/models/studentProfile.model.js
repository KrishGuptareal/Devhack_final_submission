import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  branch: {
    type: String,
    required: true,
    uppercase: true
  },
  careerInterests: [{
    type: String,
    lowercase: true
  }],
  fixedSlots: [{
    type: String, // Array of Slot IDs like 'A', 'E', 'L1'
    uppercase: true
  }],
  selectedElectives: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Elective'
  }]
}, {
  timestamps: true
});

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;
