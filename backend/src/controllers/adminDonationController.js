
import Donation from "../models/Donation.js";

// ==========================================
// GET ALL DONATIONS
// ==========================================

export const getAdminDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({
      createdAt: -1,
    });

    const formattedDonations = donations.map((donation) => ({
      ...donation.toObject(),
      date: donation.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: formattedDonations.length,
      data: formattedDonations,
    });
  } catch (error) {
    console.error("Get donations error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve donations.",
    });
  }
};

// ==========================================
// UPDATE DONATION STATUS
// ==========================================

export const updateAdminDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== "Cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "Administrators can only cancel pending donations. Payment status is updated automatically through Safaricom verification.",
      });
    }

    const donation = await Donation.findOne({
      id: String(id),
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation record not found.",
      });
    }

    if (donation.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending donations can be cancelled.",
      });
    }

    donation.status = "Cancelled";

    await donation.save();

    return res.status(200).json({
      success: true,
      message: "Donation cancelled successfully.",
      data: {
        ...donation.toObject(),
        date: donation.createdAt,
      },
    });
  } catch (error) {
    console.error("Update donation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update donation.",
    });
  }
};

// ==========================================
// DELETE DONATION
// DONATION RECORDS ARE PERMANENT
// ==========================================

export const deleteAdminDonation = async (req, res) => {
  return res.status(403).json({
    success: false,
    message:
      "Donation records cannot be deleted. All financial records must be retained for accountability.",
  });
};
