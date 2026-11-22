
import { messages } from "../data/mockData.js";

export const submitContactMessage = (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Check required fields
    if (
      !name?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // Clean submitted values
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Validate maximum lengths
    if (
      cleanName.length > 100 ||
      cleanEmail.length > 150 ||
      cleanSubject.length > 150 ||
      cleanMessage.length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed character limit.",
      });
    }

    // Create new contact message
    const newMessage = {
      id: Date.now(),
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      createdAt: new Date(),
    };

    // Save temporarily in memory
    messages.push(newMessage);

    return res.status(201).json({
      success: true,
      message: "Your message has been received successfully.",
      data: newMessage,
    });
  } catch (error) {
    console.error("Contact submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your message. Please try again later.",
    });
  }
};
