
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Administrator from "../models/Administrator.js";

// RETURN SAFE ADMINISTRATOR DATA
// Never include passwordHash in authentication responses.
const getSafeAdminData = (admin) => ({
  id: admin.id,
  _id: admin._id,
  name: admin.name,
  email: admin.email,
  phone: admin.phone,
  role: admin.role,
  status: admin.status,
  permissions: admin.permissions,
  lastLoginAt: admin.lastLoginAt,
});

// ADMINISTRATOR LOGIN
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const admin = await Administrator.findOne({
      email: normalizedEmail,
    }).select("+passwordHash");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (admin.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your administrator account is inactive.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
      { adminId: admin._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      }
    );

    admin.lastLoginAt = new Date();
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      data: getSafeAdminData(admin),
    });
  } catch (error) {
    console.error("Administrator login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in. Please try again.",
    });
  }
};

// GET CURRENT LOGGED-IN ADMINISTRATOR
export const getCurrentAdmin = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    return res.status(200).json({
      success: true,
      data: getSafeAdminData(req.admin),
    });
  } catch (error) {
    console.error("Get current administrator error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve administrator details.",
    });
  }
};
