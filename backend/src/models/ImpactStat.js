
import mongoose from "mongoose";

const impactStatSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

const ImpactStat = mongoose.model("ImpactStat", impactStatSchema);

export default ImpactStat;
