
import Project from "../models/Project.js";

const allowedStatuses = [
  "Planning",
  "Ongoing",
  "Completed",
  "On Hold",
];

const allowedPublicationStatuses = ["Draft", "Published"];

const getActorId = (req) =>
  req.admin?._id || req.admin?.id || null;

const isEditor = (req) =>
  req.admin?.role === "Editor";

const canPublish = (req) =>
  req.admin?.role === "Super Admin" ||
  req.admin?.permissions?.projects?.publish === true;

const isValidDate = (value) => {
  if (!value) return true;

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

const isValidImageUrl = (value) => {
  if (!value) return true;

  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const validateProjectData = (data) => {
  if (
    !data.title ||
    !data.category ||
    !data.location ||
    !data.description
  ) {
    return "Title, category, location and description are required.";
  }

  if (
    data.title.length > 150 ||
    data.category.length > 100 ||
    data.location.length > 150 ||
    data.description.length > 5000 ||
    (data.image || "").length > 2048
  ) {
    return "One or more fields exceed the allowed length.";
  }

  if (!isValidDate(data.startDate)) {
    return "Please provide a valid project start date.";
  }

  if (!isValidImageUrl(data.image || "")) {
    return "Please provide a valid HTTP or HTTPS image URL.";
  }

  if (!allowedStatuses.includes(data.status)) {
    return "Status must be Planning, Ongoing, Completed or On Hold.";
  }

  return null;
};

const getProjectData = (body, existing = {}) => ({
  title:
    typeof body.title === "string"
      ? body.title.trim()
      : existing.title || "",

  category:
    typeof body.category === "string"
      ? body.category.trim()
      : existing.category || "",

  location:
    typeof body.location === "string"
      ? body.location.trim()
      : existing.location || "",

  startDate:
    body.startDate !== undefined
      ? body.startDate
      : existing.startDate || "",

  image:
    body.image !== undefined
      ? typeof body.image === "string"
        ? body.image.trim()
        : ""
      : existing.image || "",

  status:
    body.status !== undefined
      ? body.status
      : existing.status || "Planning",

  description:
    typeof body.description === "string"
      ? body.description.trim()
      : existing.description || "",
});

// GET ALL PROJECTS
export const getAdminProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve projects.",
    });
  }
};

// GET PROJECTS WAITING FOR APPROVAL
export const getPendingAdminProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { approvalStatus: "Pending" },
        { "pendingRevision.reviewStatus": "Pending" },
      ],
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Get pending projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending projects.",
    });
  }
};

// CREATE A PROJECT
export const createAdminProject = async (req, res) => {
  try {
    const projectData = getProjectData(req.body);

    const validationError = validateProjectData(projectData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const editorSubmission = isEditor(req);
    const actorId = getActorId(req);

    const requestedPublication =
      req.body.publicationStatus;

    if (
      requestedPublication !== undefined &&
      !allowedPublicationStatuses.includes(requestedPublication)
    ) {
      return res.status(400).json({
        success: false,
        message: "Publication status must be Draft or Published.",
      });
    }

    const publicationStatus =
      !editorSubmission &&
      canPublish(req) &&
      requestedPublication === "Published"
        ? "Published"
        : "Draft";

    const newProject = await Project.create({
      id: `PRJ${Date.now()}`,
      ...projectData,
      publicationStatus,

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
        ? "Project submitted for Administrator approval as a Draft."
        : "Project created successfully.",
      data: newProject,
    });
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create project.",
    });
  }
};

// UPDATE A PROJECT
export const updateAdminProject = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProject = await Project.findOne({ id });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Publication must be changed through the dedicated endpoint.
    if (req.body.publicationStatus !== undefined) {
      return res.status(403).json({
        success: false,
        message:
          "Use the separate publication action to publish or unpublish a project.",
      });
    }

    const editorSubmission = isEditor(req);
    const actorId = getActorId(req);

    if (
      !editorSubmission &&
      existingProject.pendingRevision?.reviewStatus === "Pending"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This project has a pending revision awaiting approval. Review it before making further changes.",
      });
    }

    // EDITOR SUBMISSIONS
    if (editorSubmission) {
      const currentData =
        existingProject.pendingRevision?.reviewStatus === "Pending" ||
        existingProject.pendingRevision?.reviewStatus === "Rejected"
          ? existingProject.pendingRevision
          : existingProject;

      const proposedData = getProjectData(
        req.body,
        currentData
      );

      const validationError =
        validateProjectData(proposedData);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      const hadPreviousRevision =
        Boolean(existingProject.pendingRevision);

      // EDIT A NEW OR REJECTED PROJECT
      if (
        existingProject.approvalStatus !== "Approved" &&
        !existingProject.pendingRevision
      ) {
        const wasRejected =
          existingProject.approvalStatus === "Rejected";

        Object.assign(existingProject, proposedData);

        existingProject.publicationStatus = "Draft";
        existingProject.approvalStatus = "Pending";

        existingProject.approvalHistory.push({
          action: wasRejected ? "Resubmitted" : "Submitted",
          submittedBy: actorId,
          date: new Date(),
        });
      } else {
        // STORE CHANGES AS A SEPARATE PENDING REVISION
        existingProject.pendingRevision = {
          ...proposedData,
          submittedBy: actorId,
          submittedAt: new Date(),
          reviewStatus: "Pending",
          reviewedBy: null,
          reviewedAt: null,
          reviewComment: "",
        };

        existingProject.approvalHistory.push({
          action: hadPreviousRevision
            ? "Resubmitted"
            : "Submitted",
          submittedBy: actorId,
          date: new Date(),
        });
      }

      await existingProject.save();

      return res.status(200).json({
        success: true,
        message:
          "Project changes submitted for Administrator approval. Publication status has not been changed.",
        data: existingProject,
      });
    }

    // ADMINISTRATOR OR SUPER ADMIN CONTENT UPDATE
    const updatedProject = getProjectData(
      req.body,
      existingProject
    );

    const validationError =
      validateProjectData(updatedProject);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    Object.assign(existingProject, updatedProject);

    await existingProject.save();

    return res.status(200).json({
      success: true,
      message:
        "Project updated successfully. Publication status was not changed.",
      data: existingProject,
    });
  } catch (error) {
    console.error("Update project error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update project.",
    });
  }
};

// PUBLISH OR UNPUBLISH A PROJECT
export const publishAdminProject = async (req, res) => {
  try {
    if (!canPublish(req)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to publish or unpublish projects.",
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

    const project = await Project.findOne({ id });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (
      project.approvalStatus !== "Approved" ||
      project.pendingRevision?.reviewStatus === "Pending"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This project must have approved content and no pending revision before it can be published or unpublished.",
      });
    }

    project.publicationStatus = publicationStatus;

    await project.save();

    return res.status(200).json({
      success: true,
      message:
        publicationStatus === "Published"
          ? "Project published successfully."
          : "Project unpublished successfully.",
      data: project,
    });
  } catch (error) {
    console.error("Publish project error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update project publication status.",
    });
  }
};

// APPROVE A PROJECT OR PENDING REVISION
export const approveAdminProject = async (req, res) => {
  try {
    const { id } = req.params;
    const actorId = getActorId(req);

    const project = await Project.findOne({ id });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (project.pendingRevision?.reviewStatus === "Pending") {
      const revision = project.pendingRevision;

      const approvedData = {
        title: revision.title,
        category: revision.category,
        location: revision.location,
        startDate: revision.startDate,
        image: revision.image,
        status: revision.status,
        description: revision.description,
      };

      Object.assign(project, approvedData);

      project.pendingRevision = null;
      project.approvalStatus = "Approved";

      project.approvalHistory.push({
        action: "Approved",
        submittedBy: revision.submittedBy,
        reviewedBy: actorId,
        date: new Date(),
      });
    } else if (project.approvalStatus === "Pending") {
      project.approvalStatus = "Approved";
    } else {
      return res.status(400).json({
        success: false,
        message: "This project has no pending submission to approve.",
      });
    }

    await project.save();

    return res.status(200).json({
      success: true,
      message:
        "Project approved successfully. It remains a Draft until separately published by an authorized administrator.",
      data: project,
    });
  } catch (error) {
    console.error("Approve project error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve project.",
    });
  }
};

// REJECT A PROJECT OR PENDING REVISION
export const rejectAdminProject = async (req, res) => {
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
        message: "The rejection comment cannot exceed 2000 characters.",
      });
    }

    const project = await Project.findOne({ id });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (project.pendingRevision?.reviewStatus === "Pending") {
      const revision = project.pendingRevision;

      revision.reviewStatus = "Rejected";
      revision.reviewedBy = actorId;
      revision.reviewedAt = new Date();
      revision.reviewComment = comment;

      project.approvalHistory.push({
        action: "Rejected",
        submittedBy: revision.submittedBy,
        reviewedBy: actorId,
        comment,
        date: new Date(),
      });
    } else if (project.approvalStatus === "Pending") {
      project.approvalStatus = "Rejected";

      project.approvalHistory.push({
        action: "Rejected",
        reviewedBy: actorId,
        comment,
        date: new Date(),
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "This project has no pending submission to reject.",
      });
    }

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Project submission rejected.",
      data: project,
    });
  } catch (error) {
    console.error("Reject project error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject project.",
    });
  }
};

// DELETE A PROJECT
export const deleteAdminProject = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProject = await Project.findOneAndDelete({ id });

    if (!deletedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
      data: deletedProject,
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete project.",
    });
  }
};
