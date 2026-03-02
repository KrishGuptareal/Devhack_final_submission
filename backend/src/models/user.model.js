import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      description: "Clerk ID"
    },

    email: {
      type: String,
      required: true,
      unique: true,
      description: "User email"
    },

    username: {
      type: String,
      description: "User username"
    },

    preferences: {
      defaultStudyMode: {
        type: String,
        enum: ["focus", "free"],
        default: "focus",
        description: "Default study mode"
      },

      defaultSessionDuration: {
        type: Number,
        default: 45,
        description: "Default session duration in minutes"
      },

      timezone: {
        type: String,
        default: "UTC",
        description: "User timezone"
      },

      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "auto",
        description: "User theme"
      },

      notifications: {
        tasks: {
          type: Boolean,
          default: true,
          description: "Notification for tasks"
        },
        deadlines: {
          type: Boolean,
          default: true,
          description: "Notification for deadlines"
        },
        dailySummary: {
          type: Boolean,
          default: true,
          description: "Notification for daily summary"
        },
        xpMilestones: {
          type: Boolean,
          default: true,
          description: "Notification for XP milestones"
        }
      }
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
      description: "Is onboarding completed"
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model("User", userSchema);
