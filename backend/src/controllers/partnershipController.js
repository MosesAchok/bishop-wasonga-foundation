
import { partnershipEnquiries } from "../data/mockData.js";

export const submitPartnershipEnquiry = (req, res) => {
  try {
    const {
      organization,
      contactPerson,
      email,
      phone,
      partnershipType,
      message,
    } = req.body;

    // Check required fields
    if (
      !organization?.trim() ||
      !contactPerson?.trim() ||
      !email?.trim() ||
      !partnershipType?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required partnership fields.",
      });
    }

    // Clean submitted values
    const cleanOrganization = organization.trim();
    const cleanContactPerson = contactPerson.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone?.trim() || "";
    const cleanPartnershipType = partnershipType.trim();
    const cleanMessage = message.trim();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Validate optional Kenyan phone number
    const phoneRegex = /^(?:\+254|254|0)[17]\d{8}$/;

    if (cleanPhone && !phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid Kenyan phone number, e.g. 0712345678 or +254712345678.",
      });
    }

    // Validate maximum character lengths
    if (
      cleanOrganization.length > 150 ||
      cleanContactPerson.length > 100 ||
      cleanEmail.length > 150 ||
      cleanPhone.length > 15 ||
      cleanPartnershipType.length > 100 ||
      cleanMessage.length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed character limit.",
      });
    }

    // Create partnership enquiry
    const newEnquiry = {
      id: Date.now(),
      organization: cleanOrganization,
      contactPerson: cleanContactPerson,
      email: cleanEmail,
      phone: cleanPhone,
      partnershipType: cleanPartnershipType,
      message: cleanMessage,
      createdAt: new Date(),
    };

    // Save temporarily in memory
    partnershipEnquiries.push(newEnquiry);

    return res.status(201).json({
      success: true,
      message: "Your partnership enquiry has been received successfully.",
      data: newEnquiry,
    });
  } catch (error) {
    console.error("Partnership enquiry error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit your partnership enquiry. Please try again later.",
    });
  }
};
