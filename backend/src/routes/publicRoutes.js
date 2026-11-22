
import express from "express";

import {
  getPrograms,
  getProjects,
  getNews,
  getEvents,
  getGallery,
  getTeam,
  getReports,
  getImpact,
} from "../controllers/publicController.js";

import {
  submitContactMessage,
} from "../controllers/contactController.js";

import {
  submitVolunteerApplication,
} from "../controllers/volunteerController.js";

import {
  submitDonationEnquiry,
  mpesaCallback,
} from "../controllers/donationController.js";

import {
  submitPartnershipEnquiry,
} from "../controllers/partnershipController.js";

// Validation middleware
import { validateRequest } from "../middleware/validation.js";

// Validation rules
import {
  contactValidation,
  volunteerValidation,
  donationValidation,
  partnershipValidation,
} from "../middleware/validationRules.js";

const router = express.Router();

// ==========================================
// API HEALTH CHECK
// ==========================================

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bishop Wasonga Foundation API is running",
  });
});

// ==========================================
// PUBLIC DATA ROUTES
// ==========================================

router.get("/programs", getPrograms);
router.get("/projects", getProjects);
router.get("/news", getNews);
router.get("/events", getEvents);
router.get("/gallery", getGallery);
router.get("/team", getTeam);
router.get("/reports", getReports);
router.get("/impact", getImpact);

// ==========================================
// CONTACT FORM
// ==========================================

router.post(
  "/contact",
  contactValidation,
  validateRequest,
  submitContactMessage
);

// ==========================================
// VOLUNTEER APPLICATION
// ==========================================

router.post(
  "/volunteers",
  volunteerValidation,
  validateRequest,
  submitVolunteerApplication
);

// ==========================================
// DONATION PAYMENT - STK PUSH
// ==========================================

router.post(
  "/donations",
  donationValidation,
  validateRequest,
  submitDonationEnquiry
);

// ==========================================
// SAFARICOM M-PESA CALLBACK
// ==========================================

router.post(
  "/donations/mpesa/callback",
  mpesaCallback
);

// ==========================================
// PARTNERSHIP ENQUIRY
// ==========================================

router.post(
  "/partnerships",
  partnershipValidation,
  validateRequest,
  submitPartnershipEnquiry
);

// ==========================================
// EXPORT ROUTER
// ==========================================

export default router;
