
import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
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

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    method: {
      type: String,
      enum: ["M-Pesa"],
      default: "M-Pesa",
    },

    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Cancelled"],
      default: "Pending",
    },

    reference: {
      type: String,
      trim: true,
      default: "",
    },

    merchantRequestId: {
      type: String,
      default: "",
    },

    checkoutRequestId: {
      type: String,
      default: "",
      index: true,
    },

    mpesaResultCode: {
      type: String,
      default: "",
    },

    mpesaResultDescription: {
      type: String,
      default: "",
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// PREVENT DUPLICATE M-PESA RECEIPTS
// ==========================================

donationSchema.index(
  { reference: 1 },
  {
    unique: true,
    partialFilterExpression: {
      reference: { $gt: "" },
    },
  }
);

const Donation = mongoose.model("Donation", donationSchema);

export default Donation;
