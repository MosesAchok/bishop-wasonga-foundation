
import { volunteerApplications } from "../data/mockData.js";

export const submitVolunteerApplication = (req, res) => {
  try {
    const { name, email, phone, interest } = req.body;

    // Check required fields
    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !interest?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    // Clean submitted values
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanInterest = interest.trim();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Validate Kenyan phone number
    const phoneRegex = /^(?:\+254|254|0)[17]\d{8}$/;

    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid Kenyan phone number, e.g. 0712345678 or +254712345678.",
      });
    }

    // Validate maximum character lengths
    if (
      cleanName.length > 100 ||
      cleanEmail.length > 150 ||
      cleanPhone.length > 15 ||
      cleanInterest.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed character limit.",
      });
    }

    // Create volunteer application
    const newApplication = {
      id: Date.now(),
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      interest: cleanInterest,
      createdAt: new Date(),
    };

    // Save temporarily in memory
    volunteerApplications.push(newApplication);

    return res.status(201).json({
      success: true,
      message: "Your volunteer application has been received.",
      data: newApplication,
    });
  } catch (error) {
    console.error("Volunteer application error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit your application. Please try again later.",
    });
  }
};
