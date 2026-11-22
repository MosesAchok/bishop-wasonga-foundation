
import mongoose from "mongoose";

// PENDING REVISION SCHEMA
const pendingRevisionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    type: {
      type: String,
      required: true,
      enum: ["News", "Event"],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    date: {
      type: String,
      default: "",
      maxlength: 50,
    },
    time: {
      type: String,
      default: "",
      maxlength: 50,
    },
    location: {
      type: String,
      default: "",
      maxlength: 200,
    },
    image: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    summary: {
      type: String,
      default: "",
      maxlength: 500,
    },

    // LEGACY FIELD: retained for compatibility with existing revisions
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
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

// APPROVAL HISTORY SCHEMA
const approvalHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "Submitted",
        "Resubmitted",
        "Approved",
        "Rejected",
      ],
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

// MAIN NEWS AND EVENTS SCHEMA
const newsEventSchema = new mongoose.Schema(
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
    type: {
      type: String,
      required: true,
      enum: ["News", "Event"],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    date: {
      type: String,
      default: "",
      maxlength: 50,
    },
    time: {
      type: String,
      default: "",
      maxlength: 50,
    },
    location: {
      type: String,
      default: "",
      maxlength: 200,
    },
    image: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    summary: {
      type: String,
      default: "",
      maxlength: 500,
    },

    // LEGACY FIELD: retained to avoid breaking existing records
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },

    // INDEPENDENT PUBLICATION CONTROL
    publicationStatus: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // APPROVAL WORKFLOW
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

const NewsEvent = mongoose.model("NewsEvent", newsEventSchema);

export default NewsEvent;
