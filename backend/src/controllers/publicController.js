
import Program from "../models/Program.js";
import Project from "../models/Project.js";
import NewsEvent from "../models/NewsEvent.js";
import Gallery from "../models/Gallery.js";
import ImpactStat from "../models/ImpactStat.js";
import Report from "../models/Report.js";
import TeamMember from "../models/TeamMember.js";

// PUBLIC PROGRAMS - MONGODB
export const getPrograms = async (req, res) => {
  try {
    const publicPrograms = await Program.find({
      status: "Active",
      $or: [
        { approvalStatus: "Approved" },
        { approvalStatus: { $exists: false } },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: publicPrograms.length,
      data: publicPrograms,
    });
  } catch (error) {
    console.error("Get public programs error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve programs.",
    });
  }
};

// PUBLIC PROJECTS - MONGODB
export const getProjects = async (req, res) => {
  try {
    const publicProjects = await Project.find({
      status: { $in: ["Ongoing", "Completed"] },
      $and: [
        {
          $or: [
            { approvalStatus: "Approved" },
            { approvalStatus: { $exists: false } },
          ],
        },
        {
          $or: [
            { publicationStatus: "Published" },
            { publicationStatus: { $exists: false } },
          ],
        },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: publicProjects.length,
      data: publicProjects,
    });
  } catch (error) {
    console.error("Get public projects error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve projects.",
    });
  }
};

// PUBLIC NEWS - MONGODB
export const getNews = async (req, res) => {
  try {
    const publicNews = await NewsEvent.find({
      type: "News",
      $and: [
        {
          $or: [
            { approvalStatus: "Approved" },
            { approvalStatus: { $exists: false } },
          ],
        },
        {
          $or: [
            { publicationStatus: "Published" },
            {
              publicationStatus: { $exists: false },
              status: "Published",
            },
          ],
        },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: publicNews.length,
      data: publicNews,
    });
  } catch (error) {
    console.error("Get public news error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve news.",
    });
  }
};

// PUBLIC EVENTS - MONGODB
export const getEvents = async (req, res) => {
  try {
    const publicEvents = await NewsEvent.find({
      type: "Event",
      $and: [
        {
          $or: [
            { approvalStatus: "Approved" },
            { approvalStatus: { $exists: false } },
          ],
        },
        {
          $or: [
            { publicationStatus: "Published" },
            {
              publicationStatus: { $exists: false },
              status: "Published",
            },
          ],
        },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: publicEvents.length,
      data: publicEvents,
    });
  } catch (error) {
    console.error("Get public events error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve events.",
    });
  }
};

// PUBLIC GALLERY - MONGODB
export const getGallery = async (req, res) => {
  try {
    const publicGallery = await Gallery.find({
      $and: [
        {
          $or: [
            { approvalStatus: "Approved" },
            { approvalStatus: { $exists: false } },
          ],
        },
        {
          $or: [
            { publicationStatus: "Published" },
            {
              publicationStatus: { $exists: false },
              status: "Published",
            },
          ],
        },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: publicGallery.length,
      data: publicGallery,
    });
  } catch (error) {
    console.error("Get public gallery error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve gallery items.",
    });
  }
};

// PUBLIC TEAM MEMBERS - MONGODB
export const getTeam = async (req, res) => {
  try {
    const publicTeamMembers = await TeamMember.find({
      status: "Published",
      $or: [
        { approvalStatus: "Approved" },
        { approvalStatus: { $exists: false } },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: publicTeamMembers.length,
      data: publicTeamMembers,
    });
  } catch (error) {
    console.error("Get public team members error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve team members.",
    });
  }
};

// PUBLIC REPORTS - MONGODB
export const getReports = async (req, res) => {
  try {
    const publicReports = await Report.find({
      $and: [
        {
          $or: [
            { approvalStatus: "Approved" },
            { approvalStatus: { $exists: false } },
          ],
        },
        {
          $or: [
            { publicationStatus: "Published" },
            {
              publicationStatus: { $exists: false },
              status: "Published",
            },
          ],
        },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: publicReports.length,
      data: publicReports,
    });
  } catch (error) {
    console.error("Get public reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve reports.",
    });
  }
};

// PUBLIC IMPACT STATISTICS - MONGODB
export const getImpact = async (req, res) => {
  try {
    const publicStats = await ImpactStat.find({
      status: "Active",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: publicStats.length,
      data: publicStats,
    });
  } catch (error) {
    console.error("Get public impact statistics error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve impact statistics.",
    });
  }
};
