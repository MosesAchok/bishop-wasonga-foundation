
import NewsEvent from "../models/NewsEvent.js";

const allowedTypes = ["News", "Event"];
const allowedPublicationStatuses = ["Draft", "Published"];

const getActorId = (req) =>
  req.admin?._id || req.admin?.id || null;

const isEditor = (req) =>
  req.admin?.role === "Editor";

const canPublish = (req) =>
  req.admin?.role === "Super Admin" ||
  req.admin?.permissions?.newsEvents?.publish === true;

// BUILD AND NORMALIZE NEWS/EVENT CONTENT
// Publication status is deliberately excluded.
const getNewsEventData = (body, existing = {}) => ({
  title:
    body.title !== undefined
      ? typeof body.title === "string"
        ? body.title.trim()
        : ""
      : existing.title || "",

  type:
    body.type !== undefined
      ? body.type
      : existing.type,

  category:
    body.category !== undefined
      ? typeof body.category === "string"
        ? body.category.trim()
        : ""
      : existing.category || "",

  date:
    body.date !== undefined
      ? typeof body.date === "string"
        ? body.date.trim()
        : ""
      : existing.date || "",

  time:
    body.time !== undefined
      ? typeof body.time === "string"
        ? body.time.trim()
        : ""
      : existing.time || "",

  location:
    body.location !== undefined
      ? typeof body.location === "string"
        ? body.location.trim()
        : ""
      : existing.location || "",

  image:
    body.image !== undefined
      ? typeof body.image === "string"
        ? body.image.trim()
        : ""
      : existing.image || "",

  summary:
    body.summary !== undefined
      ? typeof body.summary === "string"
        ? body.summary.trim()
        : ""
      : existing.summary || "",

  description:
    body.description !== undefined
      ? typeof body.description === "string"
        ? body.description.trim()
        : ""
      : existing.description || "",
});

// VALIDATE NEWS/EVENT CONTENT
const validateNewsEventData = (data) => {
  if (
    !data.title ||
    !data.type ||
    !data.category ||
    !data.description
  ) {
    return "Title, type, category and description are required.";
  }

  if (!allowedTypes.includes(data.type)) {
    return "Type must be News or Event.";
  }

  const stringFields = [
    "title",
    "category",
    "description",
    "date",
    "time",
    "location",
    "image",
    "summary",
  ];

  for (const field of stringFields) {
    if (typeof data[field] !== "string") {
      return `Please provide a valid ${field} value.`;
    }
  }

  if (
    data.title.length > 150 ||
    data.category.length > 100 ||
    data.description.length > 5000 ||
    data.summary.length > 500 ||
    data.location.length > 200 ||
    data.image.length > 2000 ||
    data.date.length > 50 ||
    data.time.length > 50
  ) {
    return "One or more fields exceed the allowed length.";
  }

  return null;
};

// GET ALL NEWS AND EVENTS
export const getAdminNewsEvents = async (req, res) => {
  try {
    const items = await NewsEvent.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Get news and events error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve news and events.",
    });
  }
};

// GET NEWS AND EVENTS WAITING FOR APPROVAL
export const getPendingAdminNewsEvents = async (req, res) => {
  try {
    const items = await NewsEvent.find({
      $or: [
        { approvalStatus: "Pending" },
        { "pendingRevision.reviewStatus": "Pending" },
      ],
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Get pending news and events error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending news and events.",
    });
  }
};

// CREATE NEWS OR EVENT
export const createAdminNewsEvent = async (req, res) => {
  try {
    const newsEventData = getNewsEventData(req.body);

    const validationError =
      validateNewsEventData(newsEventData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const editorSubmission = isEditor(req);
    const actorId = getActorId(req);

    const newItem = await NewsEvent.create({
      id: `NE${Date.now()}`,
      ...newsEventData,

      // New content is never automatically published.
      status: "Draft",
      publicationStatus: "Draft",

      approvalStatus: editorSubmission
        ? "Pending"
        : "Approved",

      approvalHistory: editorSubmission
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
      message: editorSubmission
        ? `${newsEventData.type} submitted for Administrator approval.`
        : `${newsEventData.type} created successfully as a Draft.`,
      data: newItem,
    });
  } catch (error) {
    console.error("Create news or event error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create news or event.",
    });
  }
};

// UPDATE NEWS OR EVENT CONTENT
export const updateAdminNewsEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const existingItem = await NewsEvent.findOne({ id });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "News or event not found.",
      });
    }

    const editorSubmission = isEditor(req);
    const actorId = getActorId(req);

    // Do not overwrite a revision that is awaiting review.
    if (
      !editorSubmission &&
      existingItem.pendingRevision?.reviewStatus === "Pending"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This item has a pending revision awaiting approval. Review it before making further changes.",
      });
    }

    // EDITOR SUBMISSIONS
    if (editorSubmission) {
      const hasPendingRevision =
        existingItem.pendingRevision?.reviewStatus === "Pending";

      const hasRejectedRevision =
        existingItem.pendingRevision?.reviewStatus === "Rejected";

      const currentData =
        hasPendingRevision || hasRejectedRevision
          ? existingItem.pendingRevision
          : existingItem;

      const proposedData = getNewsEventData(
        req.body,
        currentData
      );

      const validationError =
        validateNewsEventData(proposedData);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      // UPDATE A NEW OR REJECTED SUBMISSION
      if (
        existingItem.approvalStatus !== "Approved" &&
        !existingItem.pendingRevision
      ) {
        const previousApprovalStatus =
          existingItem.approvalStatus;

        Object.assign(existingItem, proposedData);

        existingItem.status = "Draft";
        existingItem.publicationStatus = "Draft";
        existingItem.approvalStatus = "Pending";

        existingItem.approvalHistory.push({
          action:
            previousApprovalStatus === "Rejected"
              ? "Resubmitted"
              : "Submitted",
          submittedBy: actorId,
          date: new Date(),
        });
      } else {
        // KEEP THE ORIGINAL CONTENT AND PUBLICATION UNCHANGED.
        // Store the proposed changes separately.
        existingItem.pendingRevision = {
          ...proposedData,
          status: "Draft",
          submittedBy: actorId,
          submittedAt: new Date(),
          reviewStatus: "Pending",
          reviewedBy: null,
          reviewedAt: null,
          reviewComment: "",
        };

        existingItem.approvalHistory.push({
          action:
            hasRejectedRevision
              ? "Resubmitted"
              : "Submitted",
          submittedBy: actorId,
          date: new Date(),
        });
      }

      await existingItem.save();

      return res.status(200).json({
        success: true,
        message:
          "News or event changes submitted for Administrator approval.",
        data: existingItem,
      });
    }

    // ADMINISTRATOR OR SUPER ADMIN CONTENT UPDATE
    const updatedData = getNewsEventData(
      req.body,
      existingItem
    );

    const validationError =
      validateNewsEventData(updatedData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // Publication fields are not changed by this operation.
    Object.assign(existingItem, updatedData);

    await existingItem.save();

    return res.status(200).json({
      success: true,
      message: "News or event content updated successfully.",
      data: existingItem,
    });
  } catch (error) {
    console.error("Update news or event error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update news or event.",
    });
  }
};

// PUBLISH OR UNPUBLISH NEWS OR EVENT
export const publishAdminNewsEvent = async (req, res) => {
  try {
    if (!canPublish(req)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to publish or unpublish news and events.",
      });
    }

    const { id } = req.params;
    const { publicationStatus } = req.body;

    if (!allowedPublicationStatuses.includes(publicationStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Publication status must be Draft or Published.",
      });
    }

    const item = await NewsEvent.findOne({ id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "News or event not found.",
      });
    }

    if (
      item.approvalStatus !== "Approved" ||
      item.pendingRevision?.reviewStatus === "Pending"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This content must be approved and have no pending revision before its publication status can be changed.",
      });
    }

    item.publicationStatus = publicationStatus;

    // Keep the legacy field synchronized for compatibility.
    item.status = publicationStatus;

    await item.save();

    return res.status(200).json({
      success: true,
      message:
        publicationStatus === "Published"
          ? "News or event published successfully."
          : "News or event moved to Draft successfully.",
      data: item,
    });
  } catch (error) {
    console.error("Publish news or event error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change news or event publication status.",
    });
  }
};

// APPROVE NEWS OR EVENT OR PENDING REVISION
export const approveAdminNewsEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const actorId = getActorId(req);

    const item = await NewsEvent.findOne({ id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "News or event not found.",
      });
    }

    // APPROVE A PENDING REVISION
    if (item.pendingRevision?.reviewStatus === "Pending") {
      const revision = item.pendingRevision;

      const approvedData = {
        title: revision.title,
        type: revision.type,
        category: revision.category,
        date: revision.date,
        time: revision.time,
        location: revision.location,
        image: revision.image,
        summary: revision.summary,
        description: revision.description,
      };

      Object.assign(item, approvedData);

      item.pendingRevision = null;
      item.approvalStatus = "Approved";

      item.approvalHistory.push({
        action: "Approved",
        submittedBy: revision.submittedBy,
        reviewedBy: actorId,
        date: new Date(),
      });
    } else if (item.approvalStatus === "Pending") {
      // APPROVE A NEW SUBMISSION.
      // It remains a Draft until separately published.
      item.approvalStatus = "Approved";
      item.status = "Draft";
      item.publicationStatus = "Draft";

      item.approvalHistory.push({
        action: "Approved",
        reviewedBy: actorId,
        date: new Date(),
      });
    } else {
      return res.status(400).json({
        success: false,
        message:
          "This item has no pending submission to approve.",
      });
    }

    await item.save();

    return res.status(200).json({
      success: true,
      message:
        "News or event approved successfully. Publication must be handled separately.",
      data: item,
    });
  } catch (error) {
    console.error("Approve news or event error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve news or event.",
    });
  }
};

// REJECT NEWS OR EVENT OR PENDING REVISION
export const rejectAdminNewsEvent = async (req, res) => {
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
        message:
          "The rejection comment cannot exceed 2000 characters.",
      });
    }

    const item = await NewsEvent.findOne({ id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "News or event not found.",
      });
    }

    // REJECT A PENDING REVISION
    if (item.pendingRevision?.reviewStatus === "Pending") {
      const revision = item.pendingRevision;

      revision.reviewStatus = "Rejected";
      revision.reviewedBy = actorId;
      revision.reviewedAt = new Date();
      revision.reviewComment = comment;

      item.approvalHistory.push({
        action: "Rejected",
        submittedBy: revision.submittedBy,
        reviewedBy: actorId,
        comment,
        date: new Date(),
      });
    } else if (item.approvalStatus === "Pending") {
      // REJECT A NEW SUBMISSION
      item.approvalStatus = "Rejected";

      item.approvalHistory.push({
        action: "Rejected",
        reviewedBy: actorId,
        comment,
        date: new Date(),
      });
    } else {
      return res.status(400).json({
        success: false,
        message:
          "This item has no pending submission to reject.",
      });
    }

    await item.save();

    return res.status(200).json({
      success: true,
      message: "News or event submission rejected.",
      data: item,
    });
  } catch (error) {
    console.error("Reject news or event error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject news or event.",
    });
  }
};

// DELETE NEWS OR EVENT
export const deleteAdminNewsEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await NewsEvent.findOneAndDelete({ id });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "News or event not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "News or event deleted successfully.",
      data: deletedItem,
    });
  } catch (error) {
    console.error("Delete news or event error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete news or event.",
    });
  }
};
