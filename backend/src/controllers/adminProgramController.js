
import Program from "../models/Program.js";

// CHECK WHETHER THE CURRENT USER IS AN EDITOR
const isEditor = (req) =>
  req.admin?.role === "Editor";

// CHECK WHETHER THE CURRENT USER IS SUPER ADMIN
const isSuperAdmin = (req) =>
  req.admin?.role === "Super Admin";

// CHECK WHETHER THE USER HAS PROGRAM PUBLICATION PERMISSION
const canPublish = (req) => {
  if (isSuperAdmin(req)) return true;

  return req.admin?.permissions?.programs?.publish === true;
};

// VALIDATE PROGRAM CONTENT
const validateProgramContent = (body, existing = {}) => {
  const content = {
    title:
      body.title !== undefined
        ? typeof body.title === "string"
          ? body.title.trim()
          : ""
        : existing.title,

    category:
      body.category !== undefined
        ? typeof body.category === "string"
          ? body.category.trim()
          : ""
        : existing.category,

    description:
      body.description !== undefined
        ? typeof body.description === "string"
          ? body.description.trim()
          : ""
        : existing.description,

    status:
      body.status !== undefined
        ? body.status
        : existing.status || "Inactive",
  };

  if (!content.title || !content.category || !content.description) {
    return {
      error: "Title, category and description are required.",
    };
  }

  if (
    content.title.length > 150 ||
    content.category.length > 100 ||
    content.description.length > 5000
  ) {
    return {
      error: "One or more fields exceed the allowed length.",
    };
  }

  if (!["Active", "Inactive"].includes(content.status)) {
    return {
      error: "Status must be Active or Inactive.",
    };
  }

  return { content };
};

// GET ALL PROGRAMS
export const getAdminPrograms = async (req, res) => {
  try {
    const programs = await Program.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: programs.length,
      data: programs,
    });
  } catch (error) {
    console.error("Get programs error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve programs.",
    });
  }
};

// GET PROGRAMS WAITING FOR APPROVAL
export const getPendingAdminPrograms = async (req, res) => {
  try {
    const programs = await Program.find({
      $or: [
        { approvalStatus: "Pending" },
        { "pendingRevision.reviewStatus": "Pending" },
      ],
    }).sort({ updatedAt: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: programs.length,
      data: programs,
    });
  } catch (error) {
    console.error("Get pending programs error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending program submissions.",
    });
  }
};

// CREATE A PROGRAM
export const createAdminProgram = async (req, res) => {
  try {
    const editor = isEditor(req);

    // EDITORS ALWAYS CREATE INACTIVE CONTENT.
    // USERS WITHOUT PUBLISH PERMISSION ALSO CREATE INACTIVE CONTENT.
    const requestedBody = {
      ...req.body,
      status:
        editor || !canPublish(req)
          ? "Inactive"
          : req.body.status ?? "Inactive",
    };

    const validation = validateProgramContent(requestedBody);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const { content } = validation;

    const newProgram = await Program.create({
      id: `PRG${Date.now()}`,
      ...content,

      approvalStatus: editor ? "Pending" : "Approved",

      approvalHistory: editor
        ? [
            {
              action: "Submitted",
              submittedBy: req.admin._id,
              date: new Date(),
            },
          ]
        : [],
    });

    return res.status(201).json({
      success: true,
      message: editor
        ? "Program saved as inactive and submitted for Administrator approval."
        : "Program created successfully.",
      data: newProgram,
    });
  } catch (error) {
    console.error("Create program error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create program.",
    });
  }
};

// UPDATE PROGRAM CONTENT
// PUBLICATION STATUS CANNOT BE CHANGED THROUGH THIS ENDPOINT.
export const updateAdminProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProgram = await Program.findOne({ id });

    if (!existingProgram) {
      return res.status(404).json({
        success: false,
        message: "Program not found.",
      });
    }

    const editor = isEditor(req);

    // EDITORS SUBMIT CHANGES FOR APPROVAL.
    if (editor) {
      const currentContent =
        existingProgram.pendingRevision || existingProgram;

      const safeBody = {
        ...req.body,
        status: "Inactive",
      };

      const validation = validateProgramContent(
        safeBody,
        currentContent
      );

      if (validation.error) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      const { content } = validation;

      // A NEW PROGRAM WAITING FOR APPROVAL
      // HAS NO SEPARATE PENDING REVISION.
      if (
        existingProgram.approvalStatus === "Pending" &&
        !existingProgram.pendingRevision
      ) {
        Object.assign(existingProgram, content);

        existingProgram.status = "Inactive";
        existingProgram.approvalStatus = "Pending";

        existingProgram.approvalHistory.push({
          action: "Resubmitted",
          submittedBy: req.admin._id,
          date: new Date(),
        });
      } else {
        // KEEP EXISTING APPROVED CONTENT UNCHANGED.
        const wasRejected =
          existingProgram.pendingRevision?.reviewStatus === "Rejected";

        existingProgram.pendingRevision = {
          ...content,
          status: "Inactive",
          submittedBy: req.admin._id,
          submittedAt: new Date(),
          reviewStatus: "Pending",
          reviewedBy: null,
          reviewedAt: null,
          reviewComment: "",
        };

        existingProgram.approvalHistory.push({
          action: wasRejected ? "Resubmitted" : "Submitted",
          submittedBy: req.admin._id,
          date: new Date(),
        });
      }

      await existingProgram.save();

      return res.status(200).json({
        success: true,
        message:
          "Your changes have been saved as inactive content and submitted for Administrator approval.",
        data: existingProgram,
      });
    }

    // DO NOT OVERWRITE A REVISION WAITING FOR REVIEW.
    if (
      existingProgram.pendingRevision?.reviewStatus === "Pending"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This program has a pending revision. Review it before making direct changes.",
      });
    }

    // PRESERVE THE EXISTING PUBLICATION STATUS.
    // ONLY THE DEDICATED PUBLICATION ENDPOINT CAN CHANGE IT.
    const safeBody = {
      ...req.body,
      status: existingProgram.status || "Inactive",
    };

    const validation = validateProgramContent(
      safeBody,
      existingProgram
    );

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    Object.assign(existingProgram, validation.content);

    existingProgram.approvalStatus = "Approved";
    existingProgram.pendingRevision = null;

    await existingProgram.save();

    return res.status(200).json({
      success: true,
      message: "Program content updated successfully.",
      data: existingProgram,
    });
  } catch (error) {
    console.error("Update program error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update program.",
    });
  }
};

// PUBLISH OR UNPUBLISH A PROGRAM
// REQUIRES THE SEPARATE PROGRAM PUBLISH PERMISSION.
export const publishAdminProgram = async (req, res) => {
  try {
    if (!canPublish(req)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to publish or unpublish Programs.",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Active or Inactive.",
      });
    }

    const program = await Program.findOne({ id });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found.",
      });
    }

    // ONLY APPROVED PROGRAMS CAN BE PUBLISHED.
    if (program.approvalStatus !== "Approved") {
      return res.status(409).json({
        success: false,
        message:
          "This Program must be approved before it can be published.",
      });
    }

    // DO NOT PUBLISH WHILE A REVISION IS AWAITING REVIEW.
    if (
      program.pendingRevision?.reviewStatus === "Pending"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This Program has a pending revision awaiting approval.",
      });
    }

    program.status = status;

    await program.save();

    return res.status(200).json({
      success: true,
      message:
        status === "Active"
          ? "Program published successfully."
          : "Program unpublished successfully.",
      data: program,
    });
  } catch (error) {
    console.error("Publish program error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change Program publication status.",
    });
  }
};

// APPROVE A PROGRAM OR PENDING REVISION
// APPROVAL DOES NOT AUTOMATICALLY PUBLISH.
export const approveAdminProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findOne({ id });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found.",
      });
    }

    const hasPendingRevision =
      program.pendingRevision?.reviewStatus === "Pending";

    const isNewPendingProgram =
      program.approvalStatus === "Pending" &&
      !program.pendingRevision;

    if (!hasPendingRevision && !isNewPendingProgram) {
      return res.status(400).json({
        success: false,
        message: "This program has no pending submission to approve.",
      });
    }

    // APPLY APPROVED REVISION AS INACTIVE CONTENT.
    if (hasPendingRevision) {
      const revision = program.pendingRevision;

      program.title = revision.title;
      program.category = revision.category;
      program.description = revision.description;

      program.pendingRevision = null;
    }

    // APPROVED CONTENT MUST STILL BE PUBLISHED SEPARATELY.
    program.status = "Inactive";
    program.approvalStatus = "Approved";

    program.approvalHistory.push({
      action: "Approved",
      reviewedBy: req.admin._id,
      date: new Date(),
    });

    await program.save();

    return res.status(200).json({
      success: true,
      message:
        "Program approved and saved as inactive. An authorized Administrator can publish it separately.",
      data: program,
    });
  } catch (error) {
    console.error("Approve program error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve program.",
    });
  }
};

// REJECT A PROGRAM OR PENDING REVISION
export const rejectAdminProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const cleanComment =
      typeof comment === "string" ? comment.trim() : "";

    if (!cleanComment) {
      return res.status(400).json({
        success: false,
        message: "A written rejection comment is required.",
      });
    }

    if (cleanComment.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "The rejection comment cannot exceed 2,000 characters.",
      });
    }

    const program = await Program.findOne({ id });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found.",
      });
    }

    const hasPendingRevision =
      program.pendingRevision?.reviewStatus === "Pending";

    const isNewPendingProgram =
      program.approvalStatus === "Pending" &&
      !program.pendingRevision;

    if (!hasPendingRevision && !isNewPendingProgram) {
      return res.status(400).json({
        success: false,
        message: "This program has no pending submission to reject.",
      });
    }

    if (hasPendingRevision) {
      program.pendingRevision.reviewStatus = "Rejected";
      program.pendingRevision.reviewedBy = req.admin._id;
      program.pendingRevision.reviewedAt = new Date();
      program.pendingRevision.reviewComment = cleanComment;
    } else {
      program.approvalStatus = "Rejected";
    }

    program.approvalHistory.push({
      action: "Rejected",
      reviewedBy: req.admin._id,
      comment: cleanComment,
      date: new Date(),
    });

    await program.save();

    return res.status(200).json({
      success: true,
      message: "Program submission rejected. Feedback has been recorded.",
      data: program,
    });
  } catch (error) {
    console.error("Reject program error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject program.",
    });
  }
};

// DELETE A PROGRAM
export const deleteAdminProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProgram = await Program.findOneAndDelete({ id });

    if (!deletedProgram) {
      return res.status(404).json({
        success: false,
        message: "Program not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Program deleted successfully.",
      data: deletedProgram,
    });
  } catch (error) {
    console.error("Delete program error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete program.",
    });
  }
};
