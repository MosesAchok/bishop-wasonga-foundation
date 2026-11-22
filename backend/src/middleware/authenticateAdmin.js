
import jwt from "jsonwebtoken";
import Administrator from "../models/Administrator.js";

export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Administrator.findById(decoded.adminId);

    if (!admin || admin.status !== "Active") {
      return res.status(401).json({
        success: false,
        message: "Your administrator account is unavailable.",
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
    }

    console.error("Admin authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to authenticate administrator.",
    });
  }
};
