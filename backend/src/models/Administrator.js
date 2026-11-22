
import mongoose from "mongoose";

// PERMISSION ACTIONS
const permissionActionsSchema = new mongoose.Schema(
  {
    view: {
      type: Boolean,
      default: false,
    },
    create: {
      type: Boolean,
      default: false,
    },
    edit: {
      type: Boolean,
      default: false,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    publish: {
      type: Boolean,
      default: false,
    },
    approve: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// INDIVIDUAL MODULE PERMISSIONS
const permissionsSchema = new mongoose.Schema(
  {
    programs: {
      type: permissionActionsSchema,
      default: () => ({}),
    },
    projects: {
      type: permissionActionsSchema,
      default: () => ({}),
    },
    gallery: {
      type: permissionActionsSchema,
      default: () => ({}),
    },
    team: {
      type: permissionActionsSchema,
      default: () => ({}),
    },
    newsEvents: {
      type: permissionActionsSchema,
      default: () => ({}),
    },
    reports: {
      type: permissionActionsSchema,
      default: () => ({}),
    },
    messages: {
      type: permissionActionsSchema,
      default: () => ({}),
    },
    volunteers: {
      type: permissionActionsSchema,
      default: () => ({}),
    },
    partnerships: {
      type: permissionActionsSchema,
      default: () => ({}),
    },
    donations: {
      type: permissionActionsSchema,
      default: () => ({}),
    },
    impact: {
      type: permissionActionsSchema,
      default: () => ({}),
    },
    settings: {
      type: permissionActionsSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

// ADMINISTRATOR SCHEMA
const administratorSchema = new mongoose.Schema(
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
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 150,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 20,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["Super Admin", "Administrator", "Editor"],
      default: "Administrator",
      required: true,
    },
    permissions: {
      type: permissionsSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      required: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    dateAdded: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
  },
  {
    timestamps: true,
  }
);

const Administrator = mongoose.model(
  "Administrator",
  administratorSchema
);

export default Administrator;
