
import { volunteerApplications } from "../data/mockData.js";

// GET ALL VOLUNTEER APPLICATIONS
export const getAdminVolunteers = (req, res) => {
  try {
    const formattedApplications = volunteerApplications.map(
      (application) => ({
        ...application,
        date: application.createdAt,
        availability: application.availability || "",
        experience: application.experience || "",
        message: application.message || "",
        status: application.status || "Pending",
      })
    );

    return res.status(200).json({
      success: true,
      count: formattedApplications.length,
      data: formattedApplications,
    });
  } catch (error) {
    console.error("Get volunteer applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve volunteer applications.",
    });
  }
};

// UPDATE VOLUNTEER APPLICATION
export const updateAdminVolunteer = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = volunteerApplications.find(
      (item) => String(item.id) === String(id)
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Volunteer application not found.",
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

    application.status = status;
    application.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: "Volunteer application updated successfully.",
      data: {
        ...application,
        date: application.createdAt,
        availability: application.availability || "",
        experience: application.experience || "",
        message: application.message || "",
      },
    });
  } catch (error) {
    console.error("Update volunteer application error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update volunteer application.",
    });
  }
};

// DELETE VOLUNTEER APPLICATION
export const deleteAdminVolunteer = (req, res) => {
  try {
    const { id } = req.params;

    const index = volunteerApplications.findIndex(
      (item) => String(item.id) === String(id)
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Volunteer application not found.",
      });
    }

    const deletedApplication = volunteerApplications.splice(
      index,
      1
    )[0];

    return res.status(200).json({
      success: true,
      message: "Volunteer application deleted successfully.",
      data: deletedApplication,
    });
  } catch (error) {
    console.error("Delete volunteer application error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete volunteer application.",
    });
  }
};
