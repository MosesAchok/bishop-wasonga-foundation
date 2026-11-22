
import mongoose from "mongoose";

// PENDING PROGRAM CONTENT
const pendingProgramSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Administrator",
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewStatus: {
      type: String,
      enum: ["Pending", "Rejected"],
      default: "Pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Administrator",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewComment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  { _id: false }
);

// PROGRAM APPROVAL HISTORY
const programApprovalHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["Submitted", "Resubmitted", "Approved", "Rejected"],
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Administrator",
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Administrator",
      default: null,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// MAIN PROGRAM SCHEMA
const programSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // Legacy records without this field remain supported.
    approvalStatus: {
      type: String,
      enum: ["Approved", "Pending", "Rejected"],
      default: "Approved",
      index: true,
    },

    // Stores proposed edits separately from published content.
    pendingRevision: {
      type: pendingProgramSchema,
      default: null,
    },

    // Tracks submission and review decisions.
    approvalHistory: {
      type: [programApprovalHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Program = mongoose.model("Program", programSchema);

export default Program;
