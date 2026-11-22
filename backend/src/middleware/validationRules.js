
import { body } from "express-validator";

// ==========================================
// CONTACT FORM VALIDATION
// ==========================================

export const contactValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ max: 100 })
    .withMessage("Name must not exceed 100 characters."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please enter a valid email address."),

  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required.")
    .isLength({ max: 150 })
    .withMessage("Subject must not exceed 150 characters."),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required.")
    .isLength({ max: 3000 })
    .withMessage("Message must not exceed 3000 characters."),
];

// ==========================================
// VOLUNTEER FORM VALIDATION
// ==========================================

export const volunteerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please enter a valid email address."),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required.")
    .isLength({ min: 7, max: 20 })
    .withMessage("Please enter a valid phone number."),

  body("interest")
    .trim()
    .notEmpty()
    .withMessage("Please specify your area of interest."),
];

// ==========================================
// DONATION PAYMENT VALIDATION
// ==========================================

export const donationValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ max: 100 })
    .withMessage("Name must not exceed 100 characters."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .isLength({ max: 150 })
    .withMessage("Email must not exceed 150 characters."),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("M-Pesa phone number is required.")
    .matches(/^(?:\+?254|0)?[17]\d{8}$/)
    .withMessage("Please enter a valid Kenyan M-Pesa phone number."),

  body("amount")
    .exists()
    .withMessage("Donation amount is required.")
    .bail()
    .isFloat({ min: 1 })
    .withMessage("Donation amount must be at least KSh 1."),

  body("message")
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage("Message must not exceed 3000 characters."),
];

// ==========================================
// PARTNERSHIP FORM VALIDATION
// ==========================================

export const partnershipValidation = [
  body("organization")
    .trim()
    .notEmpty()
    .withMessage("Organization name is required."),

  body("contactPerson")
    .trim()
    .notEmpty()
    .withMessage("Contact person is required."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please enter a valid email address."),

  body("phone")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage("Please enter a valid phone number."),

  body("partnershipType")
    .trim()
    .notEmpty()
    .withMessage("Partnership type is required."),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Partnership message is required.")
    .isLength({ max: 3000 })
    .withMessage("Message must not exceed 3000 characters."),
];
