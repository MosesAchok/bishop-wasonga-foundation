
import Gallery from "../models/Gallery.js";

const allowedMediaTypes = ["Image", "Video"];
const allowedPublicationStatuses = ["Published", "Draft"];

// GET THE CURRENT ADMINISTRATOR ID
const getActorId = (req) =>
  req.admin?._id || req.admin?.id || null;

// CHECK WHETHER THE USER IS AN EDITOR
const isEditor = (req) =>
  req.admin?.role === "Editor";

// CHECK PUBLICATION PERMISSION
const canPublish = (req) =>
  req.admin?.role === "Super Admin" ||
  req.admin?.permissions?.gallery?.publish === true;

// VALIDATE HTTP OR HTTPS URL
const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

// VALIDATE DATE USING UTC
const isValidDate = (value) => {
  if (typeof value !== "string") return false;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

// BUILD AND VALIDATE GALLERY CONTENT
// Publication status is deliberately excluded.
const prepareGalleryData = (body, existing = {}) => {
  const mediaType =
    body.mediaType !== undefined
      ? body.mediaType
      : existing.mediaType || "Image";

  const data = {
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

    mediaType,

    imageUrl:
      body.imageUrl !== undefined
        ? typeof body.imageUrl === "string"
          ? body.imageUrl.trim()
          : ""
        : existing.imageUrl || "",

    videoUrl:
      body.videoUrl !== undefined
        ? typeof body.videoUrl === "string"
          ? body.videoUrl.trim()
          : ""
        : existing.videoUrl || "",

    thumbnailUrl:
      body.thumbnailUrl !== undefined
        ? typeof body.thumbnailUrl === "string"
          ? body.thumbnailUrl.trim()
          : ""
        : existing.thumbnailUrl || "",

    date:
      body.date !== undefined
        ? body.date
        : existing.date,
  };

  if (!data.title || !data.category || !data.date) {
    return {
      error: "Title, category and date are required.",
    };
  }

  if (
    data.title.length > 150 ||
    data.category.length > 100
  ) {
    return {
      error: "Title or category exceeds the allowed length.",
    };
  }

  if (!allowedMediaTypes.includes(data.mediaType)) {
    return {
      error: "Media type must be Image or Video.",
    };
  }

  if (data.mediaType === "Image") {
    if (!data.imageUrl) {
      return {
        error: "An image URL is required for image gallery items.",
      };
    }

    if (!isValidUrl(data.imageUrl)) {
      return {
        error: "Please provide a valid HTTP or HTTPS image URL.",
      };
    }

    data.videoUrl = "";
    data.thumbnailUrl = "";
  }

  if (data.mediaType === "Video") {
    if (!data.videoUrl) {
      return {
        error: "A video URL is required for video gallery items.",
      };
    }

    if (!isValidUrl(data.videoUrl)) {
      return {
        error: "Please provide a valid HTTP or HTTPS video URL.",
      };
    }

    data.imageUrl = "";

    if (
      data.thumbnailUrl &&
      !isValidUrl(data.thumbnailUrl)
    ) {
      return {
        error: "Please provide a valid HTTP or HTTPS thumbnail URL.",
      };
    }
  }

  if (!isValidDate(data.date)) {
    return {
      error: "Please provide a valid date in YYYY-MM-DD format.",
    };
  }

  return { data };
};

// GET ALL GALLERY ITEMS
export const getAdminGallery = async (req, res) => {
  try {
    const galleryItems = await Gallery.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: galleryItems.length,
      data: galleryItems,
    });
  } catch (error) {
    console.error("Get gallery error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve gallery items.",
    });
  }
};

// GET GALLERY ITEMS WAITING FOR APPROVAL
export const getPendingAdminGallery = async (req, res) => {
  try {
    const pendingItems = await Gallery.find({
      $or: [
        { approvalStatus: "Pending" },
        { "pendingRevision.reviewStatus": "Pending" },
      ],
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: pendingItems.length,
      data: pendingItems,
    });
  } catch (error) {
    console.error("Get pending gallery items error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending gallery items.",
    });
  }
};

// CREATE GALLERY ITEM
export const createAdminGalleryItem = async (req, res) => {
  try {
    const { data, error } = prepareGalleryData(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const editor = isEditor(req);
    const actorId = getActorId(req);

    const newItem = await Gallery.create({
      id: `GAL${Date.now()}`,

      ...data,

      // New content is never published automatically.
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
        ? "Gallery item submitted for approval as a draft."
        : "Gallery item created successfully as a draft. It can be published separately.",
      data: newItem,
    });
  } catch (error) {
    console.error("Create gallery item error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create gallery item.",
    });
  }
};

// UPDATE GALLERY ITEM
export const updateAdminGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Publication must use the separate publication endpoint.
    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "publicationStatus"
      ) ||
      Object.prototype.hasOwnProperty.call(
        req.body,
        "status"
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Publication status cannot be changed through editing. Use the publication endpoint.",
      });
    }

    const existingItem = await Gallery.findOne({ id });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found.",
      });
    }

    const editor = isEditor(req);
    const actorId = getActorId(req);

    // PREVENT ADMINISTRATORS FROM OVERWRITING
    // A REVISION THAT IS ALREADY AWAITING APPROVAL
    if (
      !editor &&
      existingItem.pendingRevision?.reviewStatus === "Pending"
    ) {
      return res.status(409).json({
        success: false,
        message: "This gallery revision is awaiting approval.",
      });
    }

    const hasPendingRevision =
      existingItem.pendingRevision?.reviewStatus === "Pending";

    const hasRejectedRevision =
      existingItem.pendingRevision?.reviewStatus === "Rejected";

    const revisionBase =
      editor && (hasPendingRevision || hasRejectedRevision)
        ? existingItem.pendingRevision
        : existingItem;

    const { data, error } = prepareGalleryData(
      req.body,
      revisionBase
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    if (editor) {
      // NEW OR REJECTED SUBMISSION
      if (
        existingItem.approvalStatus !== "Approved" &&
        !existingItem.pendingRevision
      ) {
        const wasRejected =
          existingItem.approvalStatus === "Rejected";

        Object.assign(existingItem, data);

        existingItem.status = "Draft";
        existingItem.publicationStatus = "Draft";
        existingItem.approvalStatus = "Pending";

        existingItem.approvalHistory.push({
          action: wasRejected ? "Resubmitted" : "Submitted",
          submittedBy: actorId,
          date: new Date(),
        });
      } else {
        // UPDATE AN EXISTING PROPOSED REVISION
        // WITHOUT CHANGING THE EXISTING GALLERY ITEM
        existingItem.pendingRevision = {
          ...data,
          status: "Draft",
          submittedBy: actorId,
          submittedAt: new Date(),
          reviewStatus: "Pending",
          reviewedBy: null,
          reviewedAt: null,
          reviewComment: "",
        };

        existingItem.approvalHistory.push({
          action: hasRejectedRevision
            ? "Resubmitted"
            : "Submitted",
          submittedBy: actorId,
          date: new Date(),
        });
      }

      await existingItem.save();

      return res.status(200).json({
        success: true,
        message: "Gallery changes submitted for approval.",
        data: existingItem,
      });
    }

    // ADMINISTRATOR OR SUPER ADMIN CONTENT UPDATE
    // PUBLICATION STATUS IS LEFT UNCHANGED.
    Object.assign(existingItem, data);

    existingItem.approvalStatus = "Approved";
    existingItem.pendingRevision = null;

    await existingItem.save();

    return res.status(200).json({
      success: true,
      message: "Gallery content updated successfully.",
      data: existingItem,
    });
  } catch (error) {
    console.error("Update gallery item error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update gallery item.",
    });
  }
};

// PUBLISH OR UNPUBLISH GALLERY ITEM
export const publishAdminGalleryItem = async (req, res) => {
  try {
    if (!canPublish(req)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to publish or unpublish gallery items.",
      });
    }

    const { id } = req.params;
    const { publicationStatus } = req.body;

    if (
      !allowedPublicationStatuses.includes(publicationStatus)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Publication status must be Published or Draft.",
      });
    }

    const item = await Gallery.findOne({ id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found.",
      });
    }

    if (
      item.approvalStatus !== "Approved" ||
      item.pendingRevision?.reviewStatus === "Pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only approved gallery items without pending revisions can be published.",
      });
    }

    item.publicationStatus = publicationStatus;

    // Keep the old field synchronized for compatibility.
    item.status = publicationStatus;

    await item.save();

    return res.status(200).json({
      success: true,
      message:
        publicationStatus === "Published"
          ? "Gallery item published successfully."
          : "Gallery item unpublished successfully.",
      data: item,
    });
  } catch (error) {
    console.error("Publish gallery item error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update gallery publication status.",
    });
  }
};

// APPROVE GALLERY ITEM OR REVISION
export const approveAdminGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const actorId = getActorId(req);

    const item = await Gallery.findOne({ id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found.",
      });
    }

    let submittedBy = null;

    // APPROVE A PENDING REVISION
    if (item.pendingRevision?.reviewStatus === "Pending") {
      const revision = item.pendingRevision;

      submittedBy = revision.submittedBy;

      const approvedData = {
        title: revision.title,
        category: revision.category,
        mediaType: revision.mediaType,
        imageUrl: revision.imageUrl || "",
        videoUrl: revision.videoUrl || "",
        thumbnailUrl: revision.thumbnailUrl || "",
        date: revision.date,
      };

      Object.assign(item, approvedData);

      // Do not change publication status during approval.
      item.pendingRevision = null;
    } else if (item.approvalStatus === "Pending") {
      // APPROVE A NEW SUBMISSION
      const latestSubmission = [...(item.approvalHistory || [])]
        .reverse()
        .find((entry) =>
          ["Submitted", "Resubmitted"].includes(entry.action)
        );

      submittedBy = latestSubmission?.submittedBy || null;

      // First-time submissions remain unpublished.
      item.status = "Draft";
      item.publicationStatus = "Draft";
    } else {
      return res.status(400).json({
        success: false,
        message: "This gallery item is not waiting for approval.",
      });
    }

    item.approvalStatus = "Approved";

    item.approvalHistory.push({
      action: "Approved",
      submittedBy,
      reviewedBy: actorId,
      date: new Date(),
    });

    await item.save();

    return res.status(200).json({
      success: true,
      message:
        "Gallery item approved successfully. Publication must be done separately.",
      data: item,
    });
  } catch (error) {
    console.error("Approve gallery item error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve gallery item.",
    });
  }
};

// REJECT GALLERY ITEM OR REVISION
export const rejectAdminGalleryItem = async (req, res) => {
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

    const item = await Gallery.findOne({ id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found.",
      });
    }

    let submittedBy = null;

    // REJECT A PENDING REVISION
    if (item.pendingRevision?.reviewStatus === "Pending") {
      const revision = item.pendingRevision;

      submittedBy = revision.submittedBy;

      revision.reviewStatus = "Rejected";
      revision.reviewedBy = actorId;
      revision.reviewedAt = new Date();
      revision.reviewComment = comment;
    } else if (item.approvalStatus === "Pending") {
      // REJECT A NEW SUBMISSION
      const latestSubmission = [...(item.approvalHistory || [])]
        .reverse()
        .find((entry) =>
          ["Submitted", "Resubmitted"].includes(entry.action)
        );

      submittedBy = latestSubmission?.submittedBy || null;

      item.approvalStatus = "Rejected";
    } else {
      return res.status(400).json({
        success: false,
        message: "This gallery item is not waiting for approval.",
      });
    }

    item.approvalHistory.push({
      action: "Rejected",
      submittedBy,
      reviewedBy: actorId,
      comment,
      date: new Date(),
    });

    await item.save();

    return res.status(200).json({
      success: true,
      message: "Gallery submission rejected.",
      data: item,
    });
  } catch (error) {
    console.error("Reject gallery item error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject gallery item.",
    });
  }
};

// DELETE GALLERY ITEM
export const deleteAdminGalleryItem = async (req, res) => {
  try {
    if (isEditor(req)) {
      return res.status(403).json({
        success: false,
        message: "Editors cannot delete gallery items.",
      });
    }

    const { id } = req.params;

    const deletedItem = await Gallery.findOneAndDelete({ id });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Gallery item deleted successfully.",
      data: deletedItem,
    });
  } catch (error) {
    console.error("Delete gallery item error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete gallery item.",
    });
  }
};
