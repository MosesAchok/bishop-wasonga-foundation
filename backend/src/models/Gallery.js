
import mongoose from "mongoose";

// CONTENT PROPOSED FOR APPROVAL
const pendingRevisionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    mediaType: {
      type: String,
      enum: ["Image", "Video"],
      default: "Image",
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },
    videoUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },
    date: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Draft",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Administrator",
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

// APPROVAL HISTORY
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

// MAIN GALLERY MODEL
const gallerySchema = new mongoose.Schema(
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

    // IMAGE OR VIDEO
    mediaType: {
      type: String,
      enum: ["Image", "Video"],
      default: "Image",
    },

    // Existing image field retained for compatibility
    imageUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      required: function () {
        return this.mediaType === "Image";
      },
    },

    // YouTube, Vimeo or direct video URL
    videoUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      required: function () {
        return this.mediaType === "Video";
      },
    },

    // Optional video preview image
    thumbnailUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
    },

    date: {
      type: String,
      required: true,
    },

    // LEGACY STATUS - RETAINED FOR COMPATIBILITY
    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Published",
    },

    // INDEPENDENT PUBLICATION STATUS
    publicationStatus: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Draft",
      index: true,
    },

    // APPROVAL STATUS
    approvalStatus: {
      type: String,
      enum: ["Approved", "Pending", "Rejected"],
      default: "Approved",
      index: true,
    },

    // Stores proposed edits separately from published content
    pendingRevision: {
      type: pendingRevisionSchema,
      default: null,
    },

    // Records all approval decisions and submissions
    approvalHistory: {
      type: [approvalHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;
