
let foundationSettings = {
  foundationName: "Bishop Wasonga Foundation",
  email: "info@bishopwasongafoundation.org",
  phone: "",
  address: "Kenya",
  website: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  maintenanceMode: false,
  showNewsletter: true,
};

// SETTINGS FIELD LENGTH LIMITS
const fieldLimits = {
  foundationName: 150,
  email: 150,
  phone: 30,
  address: 300,
  website: 300,
  facebook: 300,
  instagram: 300,
  linkedin: 300,
  youtube: 300,
};

// NORMALIZE AND VALIDATE OPTIONAL URLS
const normalizeUrl = (value) => {
  if (!value) return "";

  let normalizedValue = value.trim();

  // Automatically add HTTPS when no protocol is provided.
  if (!/^https?:\/\//i.test(normalizedValue)) {
    normalizedValue = `https://${normalizedValue}`;
  }

  try {
    const url = new URL(normalizedValue);

    if (
      !["http:", "https:"].includes(url.protocol) ||
      !url.hostname.includes(".") ||
      !url.hostname.split(".").every(Boolean)
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
};

// GET WEBSITE SETTINGS
export const getAdminSettings = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: foundationSettings,
    });
  } catch (error) {
    console.error("Get admin settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve website settings.",
    });
  }
};

// UPDATE WEBSITE SETTINGS
export const updateAdminSettings = (req, res) => {
  try {
    const allowedFields = [
      "foundationName",
      "email",
      "phone",
      "address",
      "website",
      "facebook",
      "instagram",
      "linkedin",
      "youtube",
      "maintenanceMode",
      "showNewsletter",
    ];

    const submittedFields = Object.keys(req.body);

    if (submittedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one setting to update.",
      });
    }

    const invalidFields = submittedFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Unsupported setting field: ${invalidFields.join(", ")}`,
      });
    }

    const updatedSettings = { ...foundationSettings };

    const urlFields = [
      "website",
      "facebook",
      "instagram",
      "linkedin",
      "youtube",
    ];

    for (const field of submittedFields) {
      const value = req.body[field];

      // BOOLEAN SETTINGS
      if (
        field === "maintenanceMode" ||
        field === "showNewsletter"
      ) {
        if (typeof value !== "boolean") {
          return res.status(400).json({
            success: false,
            message: `${field} must be true or false.`,
          });
        }

        updatedSettings[field] = value;
        continue;
      }

      // TEXT SETTINGS
      if (typeof value !== "string") {
        return res.status(400).json({
          success: false,
          message: `${field} must be text.`,
        });
      }

      const cleanValue = value.trim();

      // REQUIRED SETTINGS
      if (
        field === "foundationName" ||
        field === "email"
      ) {
        if (!cleanValue) {
          return res.status(400).json({
            success: false,
            message: `${field} cannot be empty.`,
          });
        }
      }

      // FIELD LENGTH VALIDATION
      if (cleanValue.length > fieldLimits[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} exceeds the maximum allowed length.`,
        });
      }

      // EMAIL VALIDATION
      if (field === "email") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanValue)) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid email address.",
          });
        }

        updatedSettings[field] = cleanValue.toLowerCase();
        continue;
      }

      // WEBSITE AND SOCIAL MEDIA URL VALIDATION
      if (urlFields.includes(field)) {
        if (!cleanValue) {
          updatedSettings[field] = "";
          continue;
        }

        const normalizedUrl = normalizeUrl(cleanValue);

        if (!normalizedUrl) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a valid HTTP or HTTPS URL.`,
          });
        }

        updatedSettings[field] = normalizedUrl;
        continue;
      }

      updatedSettings[field] = cleanValue;
    }

    foundationSettings = updatedSettings;

    return res.status(200).json({
      success: true,
      message: "Website settings updated successfully.",
      data: foundationSettings,
    });
  } catch (error) {
    console.error("Update admin settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update website settings.",
    });
  }
};
