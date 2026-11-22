
import mongoose from "mongoose";

const pendingRevisionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2048,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    biography: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Draft",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Administrator",
      default: null,
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
      default: "",
      maxlength: 2000,
    },
  },
  { _id: false }
);

const approvalHistorySchema = new mongoose.Schema(
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
      default: "",
      maxlength: 2000,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const teamMemberSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2048,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    biography: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Draft",
    },
    approvalStatus: {
      type: String,
      enum: ["Approved", "Pending", "Rejected"],
      default: "Approved",
      index: true,
    },
    pendingRevision: {
      type: pendingRevisionSchema,
      default: null,
    },
    approvalHistory: {
      type: [approvalHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

export default TeamMember;
