
import mongoose from "mongoose";

const pendingRevisionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    period: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
    publicationDate: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Draft",
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
    fileUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2048,
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
      trim: true,
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
      trim: true,
      maxlength: 2000,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
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
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    period: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
    publicationDate: {
      type: String,
      default: "",
    },

    // Legacy publication field retained for compatibility
    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Draft",
    },

    // Independent publication control
    publicationStatus: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Draft",
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
    fileUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2048,
    },

    // Approval workflow
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

const Report = mongoose.model("Report", reportSchema);

export default Report;
