
import express from "express";

import { authenticateAdmin } from "../middleware/authenticateAdmin.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { authorizePermission } from "../middleware/authorizePermission.js";

import {
  getAdminPrograms,
  getPendingAdminPrograms,
  createAdminProgram,
  updateAdminProgram,
  publishAdminProgram,
  approveAdminProgram,
  rejectAdminProgram,
  deleteAdminProgram,
} from "../controllers/adminProgramController.js";

import {
  getAdminProjects,
  getPendingAdminProjects,
  createAdminProject,
  updateAdminProject,
  publishAdminProject,
  approveAdminProject,
  rejectAdminProject,
  deleteAdminProject,
} from "../controllers/adminProjectController.js";

import {
  getAdminNewsEvents,
  getPendingAdminNewsEvents,
  createAdminNewsEvent,
  updateAdminNewsEvent,
  publishAdminNewsEvent,
  approveAdminNewsEvent,
  rejectAdminNewsEvent,
  deleteAdminNewsEvent,
} from "../controllers/adminNewsEventController.js";

import {
  getAdminGallery,
  getPendingAdminGallery,
  createAdminGalleryItem,
  updateAdminGalleryItem,
  publishAdminGalleryItem,
  approveAdminGalleryItem,
  rejectAdminGalleryItem,
  deleteAdminGalleryItem,
} from "../controllers/adminGalleryController.js";

import {
  getAdminTeamMembers,
  getPendingAdminTeamMembers,
  createAdminTeamMember,
  updateAdminTeamMember,
  publishAdminTeamMember,
  approveAdminTeamMember,
  rejectAdminTeamMember,
  deleteAdminTeamMember,
} from "../controllers/adminTeamController.js";

import {
  getAdminReports,
  getPendingAdminReports,
  createAdminReport,
  updateAdminReport,
  publishAdminReport,
  approveAdminReport,
  rejectAdminReport,
  deleteAdminReport,
} from "../controllers/adminReportController.js";

import {
  getAdminMessages,
  updateAdminMessage,
  deleteAdminMessage,
} from "../controllers/adminMessageController.js";

import {
  getAdminVolunteers,
  updateAdminVolunteer,
  deleteAdminVolunteer,
} from "../controllers/adminVolunteerController.js";

import {
  getAdminPartnerships,
  updateAdminPartnership,
  deleteAdminPartnership,
} from "../controllers/adminPartnershipController.js";

import {
  getAdminDonations,
  updateAdminDonation,
  deleteAdminDonation,
} from "../controllers/adminDonationController.js";

import {
  getAdminImpactStats,
  createAdminImpactStat,
  updateAdminImpactStat,
  deleteAdminImpactStat,
} from "../controllers/adminImpactController.js";

import {
  getAdminAdministrators,
  createAdminAdministrator,
  updateAdminAdministrator,
  deleteAdminAdministrator,
} from "../controllers/adminAdministratorController.js";

import {
  getAdminSettings,
  updateAdminSettings,
} from "../controllers/adminSettingsController.js";

const router = express.Router();

// REQUIRE AUTHENTICATION FOR ALL ADMIN ROUTES
router.use(authenticateAdmin);

// ==========================================
// PROGRAMS MANAGEMENT
// ==========================================

router.get(
  "/programs",
  authorizePermission("programs", "view"),
  getAdminPrograms
);

router.get(
  "/programs/pending",
  authorizePermission("programs", "approve"),
  getPendingAdminPrograms
);

router.post(
  "/programs",
  authorizePermission("programs", "create"),
  createAdminProgram
);

router.put(
  "/programs/:id",
  authorizePermission("programs", "edit"),
  updateAdminProgram
);

router.put(
  "/programs/:id/publication",
  authorizePermission("programs", "publish"),
  publishAdminProgram
);

router.put(
  "/programs/:id/approve",
  authorizePermission("programs", "approve"),
  approveAdminProgram
);

router.put(
  "/programs/:id/reject",
  authorizePermission("programs", "approve"),
  rejectAdminProgram
);

router.delete(
  "/programs/:id",
  authorizePermission("programs", "delete"),
  deleteAdminProgram
);

// ==========================================
// PROJECTS MANAGEMENT
// ==========================================

router.get(
  "/projects",
  authorizePermission("projects", "view"),
  getAdminProjects
);

router.get(
  "/projects/pending",
  authorizePermission("projects", "approve"),
  getPendingAdminProjects
);

router.post(
  "/projects",
  authorizePermission("projects", "create"),
  createAdminProject
);

router.put(
  "/projects/:id",
  authorizePermission("projects", "edit"),
  updateAdminProject
);

router.put(
  "/projects/:id/publication",
  authorizePermission("projects", "publish"),
  publishAdminProject
);

router.put(
  "/projects/:id/approve",
  authorizePermission("projects", "approve"),
  approveAdminProject
);

router.put(
  "/projects/:id/reject",
  authorizePermission("projects", "approve"),
  rejectAdminProject
);

router.delete(
  "/projects/:id",
  authorizePermission("projects", "delete"),
  deleteAdminProject
);

// ==========================================
// GALLERY MANAGEMENT
// ==========================================

router.get(
  "/gallery",
  authorizePermission("gallery", "view"),
  getAdminGallery
);

router.get(
  "/gallery/pending",
  authorizePermission("gallery", "approve"),
  getPendingAdminGallery
);

router.post(
  "/gallery",
  authorizePermission("gallery", "create"),
  createAdminGalleryItem
);

router.put(
  "/gallery/:id",
  authorizePermission("gallery", "edit"),
  updateAdminGalleryItem
);

router.put(
  "/gallery/:id/publication",
  authorizePermission("gallery", "publish"),
  publishAdminGalleryItem
);

router.put(
  "/gallery/:id/approve",
  authorizePermission("gallery", "approve"),
  approveAdminGalleryItem
);

router.put(
  "/gallery/:id/reject",
  authorizePermission("gallery", "approve"),
  rejectAdminGalleryItem
);

router.delete(
  "/gallery/:id",
  authorizePermission("gallery", "delete"),
  deleteAdminGalleryItem
);

// ==========================================
// TEAM MANAGEMENT
// ==========================================

router.get(
  "/team",
  authorizePermission("team", "view"),
  getAdminTeamMembers
);

router.get(
  "/team/pending",
  authorizePermission("team", "approve"),
  getPendingAdminTeamMembers
);

router.post(
  "/team",
  authorizePermission("team", "create"),
  createAdminTeamMember
);

router.put(
  "/team/:id",
  authorizePermission("team", "edit"),
  updateAdminTeamMember
);

router.put(
  "/team/:id/publication",
  authorizePermission("team", "publish"),
  publishAdminTeamMember
);

router.put(
  "/team/:id/approve",
  authorizePermission("team", "approve"),
  approveAdminTeamMember
);

router.put(
  "/team/:id/reject",
  authorizePermission("team", "approve"),
  rejectAdminTeamMember
);

router.delete(
  "/team/:id",
  authorizePermission("team", "delete"),
  deleteAdminTeamMember
);

// ==========================================
// NEWS AND EVENTS MANAGEMENT
// ==========================================

router.get(
  "/news-events",
  authorizePermission("newsEvents", "view"),
  getAdminNewsEvents
);

router.get(
  "/news-events/pending",
  authorizePermission("newsEvents", "approve"),
  getPendingAdminNewsEvents
);

router.post(
  "/news-events",
  authorizePermission("newsEvents", "create"),
  createAdminNewsEvent
);

router.put(
  "/news-events/:id",
  authorizePermission("newsEvents", "edit"),
  updateAdminNewsEvent
);

router.put(
  "/news-events/:id/publication",
  authorizePermission("newsEvents", "publish"),
  publishAdminNewsEvent
);

router.put(
  "/news-events/:id/approve",
  authorizePermission("newsEvents", "approve"),
  approveAdminNewsEvent
);

router.put(
  "/news-events/:id/reject",
  authorizePermission("newsEvents", "approve"),
  rejectAdminNewsEvent
);

router.delete(
  "/news-events/:id",
  authorizePermission("newsEvents", "delete"),
  deleteAdminNewsEvent
);

// ==========================================
// REPORTS MANAGEMENT
// ==========================================

router.get(
  "/reports",
  authorizePermission("reports", "view"),
  getAdminReports
);

router.get(
  "/reports/pending",
  authorizePermission("reports", "approve"),
  getPendingAdminReports
);

router.post(
  "/reports",
  authorizePermission("reports", "create"),
  createAdminReport
);

router.put(
  "/reports/:id",
  authorizePermission("reports", "edit"),
  updateAdminReport
);

// SEPARATE PUBLICATION PERMISSION
router.put(
  "/reports/:id/publication",
  authorizePermission("reports", "publish"),
  publishAdminReport
);

router.put(
  "/reports/:id/approve",
  authorizePermission("reports", "approve"),
  approveAdminReport
);

router.put(
  "/reports/:id/reject",
  authorizePermission("reports", "approve"),
  rejectAdminReport
);

router.delete(
  "/reports/:id",
  authorizePermission("reports", "delete"),
  deleteAdminReport
);

// ==========================================
// CONTACT MESSAGES MANAGEMENT
// ==========================================

router.get(
  "/messages",
  authorizePermission("messages", "view"),
  getAdminMessages
);

router.put(
  "/messages/:id",
  authorizePermission("messages", "edit"),
  updateAdminMessage
);

router.delete(
  "/messages/:id",
  authorizePermission("messages", "delete"),
  deleteAdminMessage
);

// ==========================================
// VOLUNTEER APPLICATIONS MANAGEMENT
// ==========================================

router.get(
  "/volunteers",
  authorizePermission("volunteers", "view"),
  getAdminVolunteers
);

router.put(
  "/volunteers/:id",
  authorizePermission("volunteers", "edit"),
  updateAdminVolunteer
);

router.delete(
  "/volunteers/:id",
  authorizePermission("volunteers", "delete"),
  deleteAdminVolunteer
);

// ==========================================
// PARTNERSHIP ENQUIRIES MANAGEMENT
// ==========================================

router.get(
  "/partnerships",
  authorizePermission("partnerships", "view"),
  getAdminPartnerships
);

router.put(
  "/partnerships/:id",
  authorizePermission("partnerships", "edit"),
  updateAdminPartnership
);

router.delete(
  "/partnerships/:id",
  authorizePermission("partnerships", "delete"),
  deleteAdminPartnership
);

// ==========================================
// DONATION ENQUIRIES MANAGEMENT
// ==========================================

router.get(
  "/donations",
  authorizePermission("donations", "view"),
  getAdminDonations
);

router.put(
  "/donations/:id",
  authorizePermission("donations", "edit"),
  updateAdminDonation
);

router.delete(
  "/donations/:id",
  authorizePermission("donations", "delete"),
  deleteAdminDonation
);

// ==========================================
// IMPACT STATISTICS MANAGEMENT
// ==========================================

router.get(
  "/impact",
  authorizePermission("impact", "view"),
  getAdminImpactStats
);

router.post(
  "/impact",
  authorizePermission("impact", "create"),
  createAdminImpactStat
);

router.put(
  "/impact/:id",
  authorizePermission("impact", "edit"),
  updateAdminImpactStat
);

router.delete(
  "/impact/:id",
  authorizePermission("impact", "delete"),
  deleteAdminImpactStat
);

// ==========================================
// ADMINISTRATORS MANAGEMENT
// SUPER ADMIN ONLY
// ==========================================

router.get(
  "/administrators",
  authorizeRoles("Super Admin"),
  getAdminAdministrators
);

router.post(
  "/administrators",
  authorizeRoles("Super Admin"),
  createAdminAdministrator
);

router.put(
  "/administrators/:id",
  authorizeRoles("Super Admin"),
  updateAdminAdministrator
);

router.delete(
  "/administrators/:id",
  authorizeRoles("Super Admin"),
  deleteAdminAdministrator
);

// ==========================================
// WEBSITE SETTINGS
// ==========================================

router.get(
  "/settings",
  authorizePermission("settings", "view"),
  getAdminSettings
);

router.put(
  "/settings",
  authorizePermission("settings", "edit"),
  updateAdminSettings
);

export default router;
