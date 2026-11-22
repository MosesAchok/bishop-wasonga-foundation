
import { partnershipEnquiries } from "../data/mockData.js";

// GET ALL PARTNERSHIP ENQUIRIES
export const getAdminPartnerships = (req, res) => {
  try {
    const formattedEnquiries = partnershipEnquiries.map(
      (enquiry) => ({
        ...enquiry,
        date: enquiry.createdAt,
        status: enquiry.status || "Pending",
      })
    );

    return res.status(200).json({
      success: true,
      count: formattedEnquiries.length,
      data: formattedEnquiries,
    });
  } catch (error) {
    console.error("Get partnership enquiries error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve partnership enquiries.",
    });
  }
};

// UPDATE PARTNERSHIP ENQUIRY STATUS
export const updateAdminPartnership = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const enquiry = partnershipEnquiries.find(
      (item) => String(item.id) === String(id)
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Partnership enquiry not found.",
      });
    }

    const allowedStatuses = [
      "Pending",
      "Reviewed",
      "Approved",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Pending, Reviewed, Approved, or Rejected.",
      });
    }

    enquiry.status = status;
    enquiry.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: "Partnership enquiry updated successfully.",
      data: {
        ...enquiry,
        date: enquiry.createdAt,
      },
    });
  } catch (error) {
    console.error("Update partnership enquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update partnership enquiry.",
    });
  }
};

// DELETE PARTNERSHIP ENQUIRY
export const deleteAdminPartnership = (req, res) => {
  try {
    const { id } = req.params;

    const index = partnershipEnquiries.findIndex(
      (item) => String(item.id) === String(id)
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Partnership enquiry not found.",
      });
    }

    const deletedEnquiry = partnershipEnquiries.splice(index, 1)[0];

    return res.status(200).json({
      success: true,
      message: "Partnership enquiry deleted successfully.",
      data: deletedEnquiry,
    });
  } catch (error) {
    console.error("Delete partnership enquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete partnership enquiry.",
    });
  }
};
