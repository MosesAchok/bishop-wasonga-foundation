
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

const allowedActions = [
  "view",
  "create",
  "edit",
  "delete",
  "publish",
  "approve",
];

const approvalModules = [
  "programs",
  "projects",
  "gallery",
  "team",
  "newsEvents",
  "reports",
];

const publicationModules = [
  "programs",
  "projects",
  "gallery",
  "team",
  "newsEvents",
  "reports",
];

const editorModules = [
  "programs",
  "projects",
  "gallery",
  "team",
  "newsEvents",
  "reports",
];

export const authorizePermission = (module, action) => {
  return (req, res, next) => {
    try {
      // VALIDATE REQUESTED MODULE AND ACTION
      if (
        !allowedModules.includes(module) ||
        !allowedActions.includes(action)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid permission configuration.",
        });
      }

      // AUTHENTICATION MUST RUN FIRST
      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      // SUPER ADMIN HAS UNRESTRICTED ACCESS
      if (req.admin.role === "Super Admin") {
        return next();
      }

      // EDITORS CAN ONLY ACCESS THE SIX CONTENT MODULES
      if (
        req.admin.role === "Editor" &&
        !editorModules.includes(module)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Editors cannot access this module.",
        });
      }

      // EDITORS CAN ONLY VIEW, CREATE AND EDIT
      // THEY CANNOT DELETE, PUBLISH OR APPROVE
      if (
        req.admin.role === "Editor" &&
        !["view", "create", "edit"].includes(action)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Editors can only view, create and edit content. Publishing, deleting and approving are restricted.",
        });
      }

      // APPROVAL IS ONLY AVAILABLE FOR CONTENT MODULES
      if (
        action === "approve" &&
        !approvalModules.includes(module)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Approval permission is not available for this module.",
        });
      }

      // PUBLISHING IS ONLY AVAILABLE FOR CONTENT MODULES
      if (
        action === "publish" &&
        !publicationModules.includes(module)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Publishing permission is not available for this module.",
        });
      }

      // CHECK THE ADMINISTRATOR'S EXACT ASSIGNED PERMISSION
      const hasPermission =
        req.admin.permissions?.[module]?.[action] === true;

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to ${action} ${module}. Please contact the Super Admin.`,
        });
      }

      return next();
    } catch (error) {
      console.error("Permission authorization error:", error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to verify administrator permissions.",
      });
    }
  };
};
