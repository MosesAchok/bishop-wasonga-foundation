
import Report from "../models/Report.js";

// GET THE CURRENT ADMINISTRATOR ID
const getActorId = (req) => {
  return req.admin?._id || req.admin?.id || null;
};

// CHECK WHETHER THE USER IS AN EDITOR
const isEditor = (req) => {
  return req.admin?.role === "Editor";
};

// CHECK WHETHER THE USER CAN PUBLISH
const canPublish = (req) => {
  return (
    req.admin?.role === "Super Admin" ||
    req.admin?.permissions?.reports?.publish === true
  );
};

// VALIDATE DATE - UTC BASED
const isValidDate = (value) => {
  if (!value) return true;

  if (typeof value !== "string") return false;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

// VALIDATE DOCUMENT URL
const isValidFileUrl = (value) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

// PREPARE AND VALIDATE REPORT CONTENT
// Publication status is deliberately excluded.
const prepareReportData = (data, existing = {}) => {
  const title =
    data.title !== undefined
      ? typeof data.title === "string" ? data.title.trim() : ""
      : existing.title || "";

  const category =
    data.category !== undefined
      ? typeof data.category === "string" ? data.category.trim() : ""
      : existing.category || "";

  const period =
    data.period !== undefined
      ? typeof data.period === "string" ? data.period.trim() : ""
      : existing.period || "";

  const publicationDate =
    data.publicationDate !== undefined
      ? data.publicationDate
      : existing.publicationDate || "";

  const description =
    data.description !== undefined
      ? typeof data.description === "string"
        ? data.description.trim()
        : ""
      : existing.description || "";

  const fileUrl =
    data.fileUrl !== undefined
      ? typeof data.fileUrl === "string"
        ? data.fileUrl.trim()
        : ""
      : existing.fileUrl || "";

  if (!title || !category) {
    return {
      error: "Report title and category are required.",
    };
  }

  if (
    title.length > 200 ||
    category.length > 100 ||
    period.length > 100 ||
    description.length > 5000 ||
    fileUrl.length > 2048
  ) {
    return {
      error: "One or more fields exceed the allowed length.",
    };
  }

  if (typeof publicationDate !== "string") {
    return {
      error: "Publication date must be a valid date string.",
    };
  }

  if (!isValidDate(publicationDate)) {
    return {
      error:
        "Publication date must be a valid date in YYYY-MM-DD format.",
    };
  }

  if (!isValidFileUrl(fileUrl)) {
    return {
      error: "Please provide a valid HTTP or HTTPS document URL.",
    };
  }

  return {
    data: {
      title,
      category,
      period,
      publicationDate,
      description,
      fileUrl,
    },
  };
};

// PREVENT PUBLICATION CHANGES THROUGH THE EDIT ENDPOINT
const hasPublicationChange = (body) => {
  return (
    Object.prototype.hasOwnProperty.call(body, "status") ||
    Object.prototype.hasOwnProperty.call(body, "publicationStatus")
  );
};

// GET ALL REPORTS
export const getAdminReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Get reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve reports.",
    });
  }
};

// GET REPORTS WAITING FOR APPROVAL
export const getPendingAdminReports = async (req, res) => {
  try {
    const reports = await Report.find({
      $or: [
        { approvalStatus: "Pending" },
        { "pendingRevision.reviewStatus": "Pending" },
      ],
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Get pending reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending reports.",
    });
  }
};

// CREATE REPORT
export const createAdminReport = async (req, res) => {
  try {
    const validation = prepareReportData(req.body);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const actorId = getActorId(req);
    const editor = isEditor(req);

    const newReport = await Report.create({
      id: `RPT${Date.now()}`,

      ...validation.data,

      // All newly created reports start unpublished.
      status: "Draft",
      publicationStatus: "Draft",

      approvalStatus: editor ? "Pending" : "Approved",

      approvalHistory: editor
        ? [
            {
              action: "Submitted",
              submittedBy: actorId,
              date: new Date(),
            },
          ]
        : [],
    });

    return res.status(201).json({
      success: true,
      message: editor
        ? "Report submitted successfully and is waiting for approval."
        : "Report created successfully as a Draft.",
      data: newReport,
    });
  } catch (error) {
    console.error("Create report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create report.",
    });
  }
};

// UPDATE REPORT CONTENT
export const updateAdminReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (hasPublicationChange(req.body)) {
      return res.status(400).json({
        success: false,
        message:
          "Publication status must be changed through the separate publication endpoint.",
      });
    }

    const report = await Report.findOne({ id });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    const actorId = getActorId(req);
    const editor = isEditor(req);

    // EDITOR WORKFLOW
    if (editor) {
      if (report.pendingRevision?.reviewStatus === "Pending") {
        return res.status(409).json({
          success: false,
          message:
            "This report already has a revision waiting for approval.",
        });
      }

      // Edit a new report that has not yet been approved,
      // or correct a rejected first-time submission.
      if (
        report.approvalStatus === "Pending" ||
        report.approvalStatus === "Rejected"
      ) {
        const validation = prepareReportData(req.body, report);

        if (validation.error) {
          return res.status(400).json({
            success: false,
            message: validation.error,
          });
        }

        const wasRejected = report.approvalStatus === "Rejected";

        Object.assign(report, validation.data);

        report.status = "Draft";
        report.publicationStatus = "Draft";
        report.approvalStatus = "Pending";
        report.pendingRevision = null;

        report.approvalHistory.push({
          action: wasRejected ? "Resubmitted" : "Submitted",
          submittedBy: actorId,
          date: new Date(),
        });

        await report.save();

        return res.status(200).json({
          success: true,
          message: "Report resubmitted and is waiting for approval.",
          data: report,
        });
      }

      // Edit an already approved report.
      // Preserve the original approved and published report.
      const validation = prepareReportData(req.body, report);

      if (validation.error) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      const wasRejected =
        report.pendingRevision?.reviewStatus === "Rejected";

      report.pendingRevision = {
        ...validation.data,
        status: "Draft",
        submittedBy: actorId,
        submittedAt: new Date(),
        reviewStatus: "Pending",
        reviewedBy: null,
        reviewedAt: null,
        reviewComment: "",
      };

      report.approvalHistory.push({
        action: wasRejected ? "Resubmitted" : "Submitted",
        submittedBy: actorId,
        date: new Date(),
      });

      await report.save();

      return res.status(200).json({
        success: true,
        message:
          "Report changes submitted successfully and are waiting for approval.",
        data: report,
      });
    }

    // ADMINISTRATOR WORKFLOW
    if (report.pendingRevision) {
      return res.status(409).json({
        success: false,
        message:
          "This report has a pending or rejected revision. Resolve the revision before making direct changes.",
      });
    }

    const validation = prepareReportData(req.body, report);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    Object.assign(report, validation.data);

    // Editing does not publish or unpublish.
    // Preserve the current publication status.
    report.approvalStatus = "Approved";

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Report content updated successfully.",
      data: report,
    });
  } catch (error) {
    console.error("Update report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update report.",
    });
  }
};

// PUBLISH OR UNPUBLISH REPORT
export const publishAdminReport = async (req, res) => {
  try {
    if (!canPublish(req)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to publish or unpublish reports.",
      });
    }

    const { id } = req.params;
    const { publicationStatus } = req.body;

    if (!["Published", "Draft"].includes(publicationStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Publication status must be Published or Draft.",
      });
    }

    const report = await Report.findOne({ id });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    if (
      report.approvalStatus !== "Approved" ||
      report.pendingRevision?.reviewStatus === "Pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only approved reports without pending revisions can be published or unpublished.",
      });
    }

    report.publicationStatus = publicationStatus;

    // Keep the legacy field synchronized.
    report.status = publicationStatus;

    await report.save();

    return res.status(200).json({
      success: true,
      message:
        publicationStatus === "Published"
          ? "Report published successfully."
          : "Report unpublished successfully.",
      data: report,
    });
  } catch (error) {
    console.error("Publish report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update report publication status.",
    });
  }
};

// APPROVE REPORT
export const approveAdminReport = async (req, res) => {
  try {
    const { id } = req.params;
    const actorId = getActorId(req);

    const report = await Report.findOne({ id });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    // APPROVE AN EXISTING REPORT'S PENDING REVISION
    if (report.pendingRevision) {
      if (report.pendingRevision.reviewStatus !== "Pending") {
        return res.status(400).json({
          success: false,
          message: "This report has no pending revision to approve.",
        });
      }

      const revision = report.pendingRevision;

      report.title = revision.title;
      report.category = revision.category;
      report.period = revision.period;
      report.publicationDate = revision.publicationDate;
      report.description = revision.description;
      report.fileUrl = revision.fileUrl;

      // Do not change publication status during approval.
      // Existing published reports remain published.
      report.pendingRevision = null;
      report.approvalStatus = "Approved";

      report.approvalHistory.push({
        action: "Approved",
        reviewedBy: actorId,
        date: new Date(),
      });
    } else {
      // APPROVE A NEWLY SUBMITTED REPORT
      if (report.approvalStatus !== "Pending") {
        return res.status(400).json({
          success: false,
          message: "This report is not waiting for approval.",
        });
      }

      report.approvalStatus = "Approved";

      // First-time approved submissions remain Draft.
      report.status = "Draft";
      report.publicationStatus = "Draft";

      report.approvalHistory.push({
        action: "Approved",
        reviewedBy: actorId,
        date: new Date(),
      });
    }

    await report.save();

    return res.status(200).json({
      success: true,
      message:
        "Report approved successfully. Publishing remains a separate action.",
      data: report,
    });
  } catch (error) {
    console.error("Approve report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve report.",
    });
  }
};

// REJECT REPORT
export const rejectAdminReport = async (req, res) => {
  try {
    const { id } = req.params;
    const actorId = getActorId(req);

    const comment =
      typeof req.body.comment === "string"
        ? req.body.comment.trim()
        : "";

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "A rejection comment is required.",
      });
    }

    if (comment.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Rejection comment cannot exceed 2000 characters.",
      });
    }

    const report = await Report.findOne({ id });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    // REJECT AN EXISTING REPORT'S PENDING REVISION
    if (report.pendingRevision) {
      if (report.pendingRevision.reviewStatus !== "Pending") {
        return res.status(400).json({
          success: false,
          message: "This report has no pending revision to reject.",
        });
      }

      report.pendingRevision.reviewStatus = "Rejected";
      report.pendingRevision.reviewedBy = actorId;
      report.pendingRevision.reviewedAt = new Date();
      report.pendingRevision.reviewComment = "";

      // Keep the previously approved report unchanged.
    } else {
      // REJECT A NEWLY SUBMITTED REPORT
      if (report.approvalStatus !== "Pending") {
        return res.status(400).json({
          success: false,
          message: "This report is not waiting for approval.",
        });
      }

      report.approvalStatus = "Rejected";
    }

    report.approvalHistory.push({
      action: "Rejected",
      reviewedBy: actorId,
      comment,
      date: new Date(),
    });

    // Store the comment on the rejected revision as well.
    if (report.pendingRevision) {
      report.pendingRevision.reviewComment = comment;
    }

    await report.save();

    return res.status(200).json({
      success: true,
      message:
        "Report rejected. The Editor can review the comment and resubmit.",
      data: report,
    });
  } catch (error) {
    console.error("Reject report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject report.",
    });
  }
};

// DELETE REPORT
export const deleteAdminReport = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReport = await Report.findOneAndDelete({ id });

    if (!deletedReport) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully.",
      data: deletedReport,
    });
  } catch (error) {
    console.error("Delete report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete report.",
    });
  }
};
