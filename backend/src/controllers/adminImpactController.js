
import ImpactStat from "../models/ImpactStat.js";

const allowedStatuses = ["Active", "Inactive"];

// GET ALL IMPACT STATISTICS
export const getAdminImpactStats = async (req, res) => {
  try {
    const impactStats = await ImpactStat.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: impactStats.length,
      data: impactStats,
    });
  } catch (error) {
    console.error("Get impact statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve impact statistics.",
    });
  }
};

// CREATE IMPACT STATISTIC
export const createAdminImpactStat = async (req, res) => {
  try {
    const { title, value, category, description } = req.body;

    const cleanTitle =
      typeof title === "string" ? title.trim() : "";

    const cleanValue =
      typeof value === "string" || typeof value === "number"
        ? String(value).trim()
        : "";

    const cleanCategory =
      typeof category === "string"
        ? category.trim()
        : "General";

    const cleanDescription =
      typeof description === "string"
        ? description.trim()
        : "";

    if (!cleanTitle || !cleanValue) {
      return res.status(400).json({
        success: false,
        message: "Title and value are required.",
      });
    }

    if (
      cleanTitle.length > 150 ||
      cleanValue.length > 50 ||
      cleanCategory.length > 100 ||
      cleanDescription.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    const newStat = await ImpactStat.create({
      id: `IMP${Date.now()}`,
      label: cleanTitle,
      title: cleanTitle,
      value: cleanValue,
      category: cleanCategory || "General",
      description: cleanDescription,
      status: "Active",
    });

    return res.status(201).json({
      success: true,
      message: "Impact statistic added successfully.",
      data: newStat,
    });
  } catch (error) {
    console.error("Create impact statistic error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create impact statistic.",
    });
  }
};

// UPDATE IMPACT STATISTIC
export const updateAdminImpactStat = async (req, res) => {
  try {
    const { id } = req.params;

    const existingStat = await ImpactStat.findOne({ id });

    if (!existingStat) {
      return res.status(404).json({
        success: false,
        message: "Impact statistic not found.",
      });
    }

    const { title, value, category, description, status } = req.body;

    const updatedStat = {
      title: existingStat.title,
      label: existingStat.label,
      value: existingStat.value,
      category: existingStat.category,
      description: existingStat.description,
      status: existingStat.status,
    };

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty.",
        });
      }

      updatedStat.title = title.trim();
      updatedStat.label = title.trim();
    }

    if (value !== undefined) {
      if (
        (typeof value !== "string" && typeof value !== "number") ||
        !String(value).trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Value cannot be empty.",
        });
      }

      updatedStat.value = String(value).trim();
    }

    if (category !== undefined) {
      if (typeof category !== "string") {
        return res.status(400).json({
          success: false,
          message: "Category must be text.",
        });
      }

      updatedStat.category = category.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          success: false,
          message: "Description must be text.",
        });
      }

      updatedStat.description = description.trim();
    }

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be Active or Inactive.",
        });
      }

      updatedStat.status = status;
    }

    if (
      updatedStat.title.length > 150 ||
      updatedStat.value.length > 50 ||
      updatedStat.category.length > 100 ||
      updatedStat.description.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    Object.assign(existingStat, updatedStat);

    await existingStat.save();

    return res.status(200).json({
      success: true,
      message: "Impact statistic updated successfully.",
      data: existingStat,
    });
  } catch (error) {
    console.error("Update impact statistic error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update impact statistic.",
    });
  }
};

// DELETE IMPACT STATISTIC
export const deleteAdminImpactStat = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStat = await ImpactStat.findOneAndDelete({ id });

    if (!deletedStat) {
      return res.status(404).json({
        success: false,
        message: "Impact statistic not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Impact statistic deleted successfully.",
      data: deletedStat,
    });
  } catch (error) {
    console.error("Delete impact statistic error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete impact statistic.",
    });
  }
};
