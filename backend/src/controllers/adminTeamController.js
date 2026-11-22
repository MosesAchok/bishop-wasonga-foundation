
import TeamMember from "../models/TeamMember.js";

// GET THE ADMINISTRATOR WHO PERFORMED THE ACTION
const getActorId = (req) =>
  req.admin?._id || req.admin?.id || null;

// CHECK WHETHER THE CURRENT USER IS AN EDITOR
const isEditor = (req) =>
  req.admin?.role === "Editor";

// CHECK WHETHER THE CURRENT USER IS SUPER ADMIN
const isSuperAdmin = (req) =>
  req.admin?.role === "Super Admin";

// CHECK WHETHER THE USER HAS PUBLICATION PERMISSION
const canPublish = (req) => {
  if (isSuperAdmin(req)) return true;

  return req.admin?.permissions?.team?.publish === true;
};

// CHECK WHETHER THE USER CAN REVIEW SUBMISSIONS
const canReview = (req) => {
  if (isSuperAdmin(req)) return true;

  return req.admin?.permissions?.team?.approve === true;
};

// VALIDATE AND PREPARE TEAM MEMBER DATA
const prepareTeamMemberData = (
  body,
  existing = {},
  options = {}
) => {
  const forceDraft = options.forceDraft === true;

  const data = {
    name:
      body.name !== undefined
        ? typeof body.name === "string"
          ? body.name.trim()
          : ""
        : existing.name,

    position:
      body.position !== undefined
        ? typeof body.position === "string"
          ? body.position.trim()
          : ""
        : existing.position,

    imageUrl:
      body.imageUrl !== undefined
        ? typeof body.imageUrl === "string"
          ? body.imageUrl.trim()
          : ""
        : existing.imageUrl || "",

    shortDescription:
      body.shortDescription !== undefined
        ? typeof body.shortDescription === "string"
          ? body.shortDescription.trim()
          : ""
        : existing.shortDescription,

    biography:
      body.biography !== undefined
        ? typeof body.biography === "string"
          ? body.biography.trim()
          : ""
        : existing.biography,

    status: forceDraft
      ? "Draft"
      : body.status !== undefined
        ? body.status
        : existing.status || "Draft",
  };

  if (
    !data.name ||
    !data.position ||
    !data.shortDescription ||
    !data.biography
  ) {
    return {
      error:
        "Name, position, short description and biography are required.",
    };
  }

  if (
    data.name.length > 100 ||
    data.position.length > 100 ||
    data.shortDescription.length > 300 ||
    data.biography.length > 10000 ||
    data.imageUrl.length > 2048
  ) {
    return {
      error: "One or more fields exceed the allowed length.",
    };
  }

  if (data.imageUrl) {
    try {
      const parsedUrl = new URL(data.imageUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid image URL protocol");
      }
    } catch {
      return {
        error: "Please provide a valid image URL.",
      };
    }
  }

  if (!["Published", "Draft"].includes(data.status)) {
    return {
      error: "Status must be Published or Draft.",
    };
  }

  return { data };
};

// GET THE LATEST SUBMISSION HISTORY ENTRY
const getLatestSubmission = (history = []) =>
  [...history]
    .reverse()
    .find((entry) =>
      ["Submitted", "Resubmitted"].includes(entry.action)
    );

// GET ALL TEAM MEMBERS
export const getAdminTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: teamMembers.length,
      data: teamMembers,
    });
  } catch (error) {
    console.error("Get team members error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve team members.",
    });
  }
};

// GET TEAM MEMBERS WAITING FOR APPROVAL
export const getPendingAdminTeamMembers = async (req, res) => {
  try {
    if (isEditor(req) || !canReview(req)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to review submissions.",
      });
    }

    const pendingMembers = await TeamMember.find({
      $or: [
        { approvalStatus: "Pending" },
        { "pendingRevision.reviewStatus": "Pending" },
      ],
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: pendingMembers.length,
      data: pendingMembers,
    });
  } catch (error) {
    console.error("Get pending team members error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending team members.",
    });
  }
};

// CREATE TEAM MEMBER
export const createAdminTeamMember = async (req, res) => {
  try {
    const editor = isEditor(req);

    // EDITORS MUST ALWAYS CREATE DRAFTS
    const { error, data } = prepareTeamMemberData(
      req.body,
      {},
      { forceDraft: editor }
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    // PUBLISHED CONTENT REQUIRES PUBLICATION PERMISSION
    if (data.status === "Published" && !canPublish(req)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to publish Team content. Save it as a draft instead.",
      });
    }

    const actorId = getActorId(req);

    const newMember = await TeamMember.create({
      id: `TEAM${Date.now()}`,
      ...data,

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
        ? "Team member saved as a draft and submitted for approval."
        : "Team member created successfully.",
      data: newMember,
    });
  } catch (error) {
    console.error("Create team member error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create team member.",
    });
  }
};

// UPDATE TEAM MEMBER CONTENT
// THIS ENDPOINT CANNOT PUBLISH OR UNPUBLISH CONTENT.
export const updateAdminTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    const existingMember = await TeamMember.findOne({ id });

    if (!existingMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    const editor = isEditor(req);
    const actorId = getActorId(req);

    const hasPendingRevision =
      existingMember.pendingRevision?.reviewStatus === "Pending";

    const hasRejectedRevision =
      existingMember.pendingRevision?.reviewStatus === "Rejected";

    // NON-EDITORS CANNOT OVERWRITE A PENDING REVISION
    if (!editor && hasPendingRevision) {
      return res.status(409).json({
        success: false,
        message:
          "This team member has a pending revision awaiting approval.",
      });
    }

    const sourceData =
      editor && (hasPendingRevision || hasRejectedRevision)
        ? existingMember.pendingRevision
        : existingMember;

    // PRESERVE THE CURRENT PUBLICATION STATUS.
    // STATUS CHANGES MUST USE THE DEDICATED PUBLICATION ENDPOINT.
    const safeBody = {
      ...req.body,
      status: sourceData.status || existingMember.status || "Draft",
    };

    const { error, data } = prepareTeamMemberData(
      safeBody,
      sourceData,
      { forceDraft: editor }
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    // EDITOR SUBMISSIONS REQUIRE APPROVAL
    if (editor) {
      // NEW OR REJECTED ITEM WITHOUT A SEPARATE REVISION
      if (
        existingMember.approvalStatus !== "Approved" &&
        !existingMember.pendingRevision
      ) {
        const wasRejected =
          existingMember.approvalStatus === "Rejected";

        Object.assign(existingMember, data);

        existingMember.approvalStatus = "Pending";

        existingMember.approvalHistory.push({
          action: wasRejected ? "Resubmitted" : "Submitted",
          submittedBy: actorId,
          date: new Date(),
        });

        await existingMember.save();

        return res.status(200).json({
          success: true,
          message:
            "Changes saved as a draft and submitted for approval.",
          data: existingMember,
        });
      }

      // UPDATE A PENDING OR REJECTED REVISION.
      // APPROVED CONTENT REMAINS UNCHANGED UNTIL APPROVAL.
      existingMember.pendingRevision = {
        ...data,
        status: "Draft",
        submittedBy: actorId,
        submittedAt: new Date(),
        reviewStatus: "Pending",
        reviewedBy: null,
        reviewedAt: null,
        reviewComment: "",
      };

      existingMember.approvalHistory.push({
        action: hasRejectedRevision
          ? "Resubmitted"
          : "Submitted",
        submittedBy: actorId,
        date: new Date(),
      });

      await existingMember.save();

      return res.status(200).json({
        success: true,
        message:
          "Changes saved as a draft and submitted for approval.",
        data: existingMember,
      });
    }

    // ADMINISTRATOR OR SUPER ADMIN CONTENT UPDATE.
    // PUBLICATION STATUS IS NOT CHANGED HERE.
    Object.assign(existingMember, data);

    existingMember.approvalStatus = "Approved";
    existingMember.pendingRevision = null;

    await existingMember.save();

    return res.status(200).json({
      success: true,
      message: "Team member updated successfully.",
      data: existingMember,
    });
  } catch (error) {
    console.error("Update team member error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update team member.",
    });
  }
};

// PUBLISH OR UNPUBLISH TEAM MEMBER
// REQUIRES THE SEPARATE PUBLISH PERMISSION.
export const publishAdminTeamMember = async (req, res) => {
  try {
    if (!canPublish(req)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to publish or unpublish Team content.",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["Published", "Draft"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Published or Draft.",
      });
    }

    const member = await TeamMember.findOne({ id });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    // ONLY APPROVED CONTENT CAN BE PUBLISHED
    if (member.approvalStatus !== "Approved") {
      return res.status(409).json({
        success: false,
        message:
          "This Team content must be approved before it can be published.",
      });
    }

    member.status = status;

    await member.save();

    return res.status(200).json({
      success: true,
      message:
        status === "Published"
          ? "Team member published successfully."
          : "Team member unpublished and saved as a draft.",
      data: member,
    });
  } catch (error) {
    console.error("Publish team member error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change Team publication status.",
    });
  }
};

// APPROVE TEAM MEMBER OR PENDING REVISION
export const approveAdminTeamMember = async (req, res) => {
  try {
    if (isEditor(req) || !canReview(req)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to approve Team content.",
      });
    }

    const { id } = req.params;
    const reviewerId = getActorId(req);

    const member = await TeamMember.findOne({ id });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    let submittedBy = null;

    // APPROVE A PENDING REVISION
    if (member.pendingRevision?.reviewStatus === "Pending") {
      const revision = member.pendingRevision;

      submittedBy = revision.submittedBy;

      Object.assign(member, {
        name: revision.name,
        position: revision.position,
        imageUrl: revision.imageUrl,
        shortDescription: revision.shortDescription,
        biography: revision.biography,

        // APPROVAL DOES NOT AUTOMATICALLY PUBLISH
        status: "Draft",
      });

      member.pendingRevision = null;
    } else if (member.approvalStatus === "Pending") {
      // APPROVE A NEW SUBMISSION
      const latestSubmission = getLatestSubmission(
        member.approvalHistory
      );

      submittedBy = latestSubmission?.submittedBy || null;

      // A NEW EDITOR SUBMISSION REMAINS A DRAFT
      member.status = "Draft";
    } else {
      return res.status(400).json({
        success: false,
        message: "This team member has no pending submission.",
      });
    }

    member.approvalStatus = "Approved";

    member.approvalHistory.push({
      action: "Approved",
      submittedBy,
      reviewedBy: reviewerId,
      date: new Date(),
    });

    await member.save();

    return res.status(200).json({
      success: true,
      message:
        "Team member approved and saved as a draft. An authorized Administrator can publish it.",
      data: member,
    });
  } catch (error) {
    console.error("Approve team member error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve team member.",
    });
  }
};

// REJECT TEAM MEMBER OR PENDING REVISION
export const rejectAdminTeamMember = async (req, res) => {
  try {
    if (isEditor(req) || !canReview(req)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to reject Team content.",
      });
    }

    const { id } = req.params;
    const reviewerId = getActorId(req);

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

    const member = await TeamMember.findOne({ id });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    let submittedBy = null;

    // REJECT A PENDING REVISION
    if (member.pendingRevision?.reviewStatus === "Pending") {
      const revision = member.pendingRevision;

      submittedBy = revision.submittedBy;

      revision.reviewStatus = "Rejected";
      revision.reviewedBy = reviewerId;
      revision.reviewedAt = new Date();
      revision.reviewComment = comment;
    } else if (member.approvalStatus === "Pending") {
      // REJECT A NEW SUBMISSION
      const latestSubmission = getLatestSubmission(
        member.approvalHistory
      );

      submittedBy = latestSubmission?.submittedBy || null;

      member.approvalStatus = "Rejected";
    } else {
      return res.status(400).json({
        success: false,
        message: "This team member has no pending submission.",
      });
    }

    member.approvalHistory.push({
      action: "Rejected",
      submittedBy,
      reviewedBy: reviewerId,
      comment,
      date: new Date(),
    });

    await member.save();

    return res.status(200).json({
      success: true,
      message: "Team member submission rejected.",
      data: member,
    });
  } catch (error) {
    console.error("Reject team member error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject team member.",
    });
  }
};

// DELETE TEAM MEMBER
export const deleteAdminTeamMember = async (req, res) => {
  try {
    if (isEditor(req)) {
      return res.status(403).json({
        success: false,
        message: "Editors are not allowed to delete Team content.",
      });
    }

    const { id } = req.params;

    const deletedMember = await TeamMember.findOneAndDelete({ id });

    if (!deletedMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Team member deleted successfully.",
      data: deletedMember,
    });
  } catch (error) {
    console.error("Delete team member error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete team member.",
    });
  }
};
