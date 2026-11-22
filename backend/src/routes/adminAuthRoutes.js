
import express from "express";

import {
  loginAdmin,
  getCurrentAdmin,
} from "../controllers/adminAuthController.js";

import { authenticateAdmin } from "../middleware/authenticateAdmin.js";

const router = express.Router();

// ADMINISTRATOR LOGIN
router.post("/login", loginAdmin);

// CURRENT LOGGED-IN ADMINISTRATOR
router.get("/me", authenticateAdmin, getCurrentAdmin);

export default router;
