
import mongoose from "mongoose";

const pendingRevisionSchema = new mongoose.Schema(
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
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    startDate: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
      maxlength: 2048,
    },
    status: {
      type: String,
      enum: ["Planning", "Ongoing", "Completed", "On Hold"],
      default: "Planning",
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

const projectSchema = new mongoose.Schema(
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
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    startDate: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
      maxlength: 2048,
    },
    status: {
      type: String,
      enum: ["Planning", "Ongoing", "Completed", "On Hold"],
      default: "Planning",
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // INDEPENDENT WEBSITE PUBLICATION STATUS
    publicationStatus: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
      index: true,
    },

    // CONTENT APPROVAL
    approvalStatus: {
      type: String,
      enum: ["Approved", "Pending", "Rejected"],
      default: "Approved",
      index: true,
    },

    // EDITOR PROPOSED CHANGES
    pendingRevision: {
      type: pendingRevisionSchema,
      default: null,
    },

    // APPROVAL AUDIT HISTORY
    approvalHistory: {
      type: [approvalHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
