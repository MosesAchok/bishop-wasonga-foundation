
import { messages } from "../data/mockData.js";

// GET ALL CONTACT MESSAGES
export const getAdminMessages = (req, res) => {
  try {
    const formattedMessages = messages.map((message) => {
      // Assign default status without changing the original data structure
      const status = message.status || "Unread";

      return {
        ...message,
        status,
        date: message.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedMessages.length,
      data: formattedMessages,
    });
  } catch (error) {
    console.error("Get contact messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve contact messages.",
    });
  }
};

// UPDATE MESSAGE STATUS
export const updateAdminMessage = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const message = messages.find(
      (item) => String(item.id) === String(id)
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    const allowedStatuses = ["Unread", "Read", "Replied"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Unread, Read, or Replied.",
      });
    }

    message.status = status;
    message.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: "Contact message status updated successfully.",
      data: {
        ...message,
        date: message.createdAt,
      },
    });
  } catch (error) {
    console.error("Update contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update contact message.",
    });
  }
};

// DELETE CONTACT MESSAGE
export const deleteAdminMessage = (req, res) => {
  try {
    const { id } = req.params;

    const index = messages.findIndex(
      (item) => String(item.id) === String(id)
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    const deletedMessage = messages.splice(index, 1)[0];

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully.",
      data: deletedMessage,
    });
  } catch (error) {
    console.error("Delete contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete contact message.",
    });
  }
};
