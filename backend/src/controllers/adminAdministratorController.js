
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import Administrator from "../models/Administrator.js";

const allowedRoles = ["Super Admin", "Administrator", "Editor"];
const allowedStatuses = ["Active", "Inactive"];

const allowedModules = [
  "programs",
  "projects",
  "gallery",
  "team",
  "newsEvents",
  "reports",
  "messages",
  "volunteers",
  "partnerships",
  "donations",
  "impact",
  "settings",
];

const editorModules = [
  "programs",
  "projects",
  "gallery",
  "team",
  "newsEvents",
  "reports",
];

// Permissions available to Administrators.
// Publish and Approve are separate permissions.
const moduleActions = {
  programs: ["view", "create", "edit", "delete", "publish", "approve"],
  projects: ["view", "create", "edit", "delete", "publish", "approve"],
  gallery: ["view", "create", "edit", "delete", "publish", "approve"],
  team: ["view", "create", "edit", "delete", "publish", "approve"],
  newsEvents: ["view", "create", "edit", "delete", "publish", "approve"],
  reports: ["view", "create", "edit", "delete", "publish", "approve"],
  messages: ["view", "edit", "delete"],
  volunteers: ["view", "edit", "delete"],
  partnerships: ["view", "edit", "delete"],
  donations: ["view", "edit", "delete"],
  impact: ["view", "create", "edit", "delete"],
  settings: ["view", "edit"],
};

const allPermissionActions = [
  "view",
  "create",
  "edit",
  "delete",
  "publish",
  "approve",
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// DEFAULT EDITOR PERMISSIONS
const getDefaultEditorPermissions = () => {
  const permissions = {};

  for (const module of allowedModules) {
    permissions[module] = {
      view: false,
      create: false,
      edit: false,
      delete: false,
      publish: false,
      approve: false,
    };
  }

  for (const module of editorModules) {
    permissions[module].view = true;
    permissions[module].create = true;
    permissions[module].edit = true;
  }

  return permissions;
};

// RETURN SAFE ADMINISTRATOR DATA
const safeAdminData = (admin) => ({
  id: admin.id,
  _id: admin._id,
  name: admin.name,
  email: admin.email,
  phone: admin.phone,
  role: admin.role,
  permissions: admin.permissions,
  status: admin.status,
  lastLoginAt: admin.lastLoginAt,
  dateAdded: admin.dateAdded,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
});

// FIND ADMINISTRATOR BY CUSTOM ID OR MONGODB ID
const findAdministratorById = async (id) => {
  let admin = await Administrator.findOne({ id });

  if (!admin && mongoose.Types.ObjectId.isValid(id)) {
    admin = await Administrator.findById(id);
  }

  return admin;
};

// GET ACTIONS ALLOWED FOR A ROLE AND MODULE
const getAllowedActions = (role, module) => {
  if (role === "Editor") {
    return editorModules.includes(module)
      ? ["view", "create", "edit"]
      : [];
  }

  if (role === "Administrator") {
    return moduleActions[module] || [];
  }

  return [];
};

// VALIDATE AND BUILD PERMISSIONS
const buildUpdatedPermissions = (
  currentPermissions,
  incomingPermissions,
  role
) => {
  if (
    !incomingPermissions ||
    typeof incomingPermissions !== "object" ||
    Array.isArray(incomingPermissions)
  ) {
    return {
      error: "Permissions must be provided as a valid object.",
    };
  }

  const updatedPermissions = {};

  for (const module of allowedModules) {
    updatedPermissions[module] = {
      view: false,
      create: false,
      edit: false,
      delete: false,
      publish: false,
      approve: false,
    };

    const permittedActions = getAllowedActions(role, module);

    for (const action of permittedActions) {
      updatedPermissions[module][action] =
        currentPermissions?.[module]?.[action] === true;
    }
  }

  for (const [module, actions] of Object.entries(incomingPermissions)) {
    if (!allowedModules.includes(module)) {
      return {
        error: `Invalid permission module: ${module}.`,
      };
    }

    if (
      !actions ||
      typeof actions !== "object" ||
      Array.isArray(actions)
    ) {
      return {
        error: `Invalid permissions for ${module}.`,
      };
    }

    for (const [action, value] of Object.entries(actions)) {
      if (!allPermissionActions.includes(action)) {
        return {
          error: `Invalid permission action: ${action}.`,
        };
      }

      if (typeof value !== "boolean") {
        return {
          error: `Permission ${module}.${action} must be true or false.`,
        };
      }

      const permittedActions = getAllowedActions(role, module);

      if (!permittedActions.includes(action)) {
        if (value === true) {
          return {
            error: `The ${role} role cannot receive ${action} permission for ${module}.`,
          };
        }

        continue;
      }

      updatedPermissions[module][action] = value;
    }
  }

  return {
    permissions: updatedPermissions,
  };
};

// GET ALL ADMINISTRATORS
export const getAdminAdministrators = async (req, res) => {
  try {
    const administrators = await Administrator.find().sort({
      createdAt: -1,
    });

    const safeAdministrators = administrators.map(safeAdminData);

    return res.status(200).json({
      success: true,
      count: safeAdministrators.length,
      data: safeAdministrators,
    });
  } catch (error) {
    console.error("Get administrators error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve administrators.",
    });
  }
};

// CREATE ADMINISTRATOR
export const createAdminAdministrator = async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Administrator name and email are required.",
      });
    }

    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (cleanName.length > 100 || normalizedEmail.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Name or email exceeds the allowed length.",
      });
    }

    const cleanPhone = phone === undefined ? "" : phone;

    if (
      typeof cleanPhone !== "string" ||
      cleanPhone.trim().length > 20
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number.",
      });
    }

    const selectedRole = role ?? "Administrator";
    const selectedStatus = status ?? "Active";

    if (!allowedRoles.includes(selectedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid administrator role.",
      });
    }

    if (!allowedStatuses.includes(selectedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account status.",
      });
    }

    const existingAdmin = await Administrator.findOne({
      email: normalizedEmail,
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "An administrator with this email already exists.",
      });
    }

    const temporaryPassword = randomBytes(18).toString("base64url");
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    const newAdmin = await Administrator.create({
      id: `ADM${Date.now()}${randomBytes(2)
        .toString("hex")
        .toUpperCase()}`,
      name: cleanName,
      email: normalizedEmail,
      phone: cleanPhone.trim(),
      passwordHash,
      role: selectedRole,
      status: selectedStatus,

      // Editors receive only their six permitted content permissions.
      // Administrators start with no permissions until assigned.
      permissions:
        selectedRole === "Editor"
          ? getDefaultEditorPermissions()
          : {},

      dateAdded: new Date().toISOString().slice(0, 10),
    });

    return res.status(201).json({
      success: true,
      message: "Administrator created successfully.",
      data: safeAdminData(newAdmin),
      temporaryPassword,
    });
  } catch (error) {
    console.error("Create administrator error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An administrator with this email or ID already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create administrator.",
    });
  }
};

// UPDATE ADMINISTRATOR
export const updateAdminAdministrator = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      phone,
      role,
      status,
      permissions,
    } = req.body;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update.",
      });
    }

    const currentAdmin = await findAdministratorById(id);

    if (!currentAdmin) {
      return res.status(404).json({
        success: false,
        message: "Administrator not found.",
      });
    }

    if (
      currentAdmin.role === "Super Admin" &&
      (
        (role !== undefined && role !== "Super Admin") ||
        status === "Inactive"
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "The Super Admin role and account status cannot be changed.",
      });
    }

    if (
      req.admin &&
      String(req.admin._id) === String(currentAdmin._id) &&
      status === "Inactive"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot deactivate your own account.",
      });
    }

    const updates = {};

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim() ||
        name.trim().length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid administrator name.",
        });
      }

      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: "Email address cannot be empty.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (
        !emailPattern.test(normalizedEmail) ||
        normalizedEmail.length > 150
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address.",
        });
      }

      const duplicateEmail = await Administrator.findOne({
        email: normalizedEmail,
        _id: { $ne: currentAdmin._id },
      });

      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          message: "An administrator with this email already exists.",
        });
      }

      updates.email = normalizedEmail;
    }

    if (phone !== undefined) {
      if (
        typeof phone !== "string" ||
        phone.trim().length > 20
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid phone number.",
        });
      }

      updates.phone = phone.trim();
    }

    if (role !== undefined) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid administrator role.",
        });
      }

      updates.role = role;
    }

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid account status.",
        });
      }

      updates.status = status;
    }

    const selectedRole = role ?? currentAdmin.role;

    if (selectedRole === "Editor") {
      // Editors always receive the exact restricted permission set.
      updates.permissions = getDefaultEditorPermissions();
    } else if (permissions !== undefined) {
      if (
        currentAdmin.role === "Super Admin" ||
        selectedRole === "Super Admin"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Permissions cannot be assigned to the Super Admin account.",
        });
      }

      const currentPermissions =
        currentAdmin.permissions?.toObject
          ? currentAdmin.permissions.toObject()
          : currentAdmin.permissions;

      const result = buildUpdatedPermissions(
        currentPermissions,
        permissions,
        selectedRole
      );

      if (result.error) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      updates.permissions = result.permissions;
    } else if (
      currentAdmin.role !== "Super Admin" &&
      selectedRole !== "Super Admin" &&
      selectedRole !== currentAdmin.role
    ) {
      const currentPermissions =
        currentAdmin.permissions?.toObject
          ? currentAdmin.permissions.toObject()
          : currentAdmin.permissions;

      const result = buildUpdatedPermissions(
        currentPermissions,
        currentPermissions,
        selectedRole
      );

      if (result.error) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      updates.permissions = result.permissions;
    }

    Object.assign(currentAdmin, updates);

    await currentAdmin.save();

    return res.status(200).json({
      success: true,
      message: "Administrator updated successfully.",
      data: safeAdminData(currentAdmin),
    });
  } catch (error) {
    console.error("Update administrator error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An administrator with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update administrator.",
    });
  }
};

// DELETE ADMINISTRATOR
export const deleteAdminAdministrator = async (req, res) => {
  try {
    const { id } = req.params;

    const adminToDelete = await findAdministratorById(id);

    if (!adminToDelete) {
      return res.status(404).json({
        success: false,
        message: "Administrator not found.",
      });
    }

    if (adminToDelete.role === "Super Admin") {
      return res.status(403).json({
        success: false,
        message: "The Super Admin account cannot be deleted.",
      });
    }

    if (
      req.admin &&
      String(req.admin._id) === String(adminToDelete._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete your own administrator account.",
      });
    }

    await Administrator.deleteOne({
      _id: adminToDelete._id,
    });

    return res.status(200).json({
      success: true,
      message: "Administrator deleted successfully.",
      data: safeAdminData(adminToDelete),
    });
  } catch (error) {
    console.error("Delete administrator error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete administrator.",
    });
  }
};
