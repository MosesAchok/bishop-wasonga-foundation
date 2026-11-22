
import mongoose from "mongoose";
import dotenv from "dotenv";
import Administrator from "./src/models/Administrator.js";

dotenv.config();

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const admins = await Administrator.find(
    { role: { $in: ["Editor", "Administrator"] } },
    "name email role permissions"
  ).lean();

  console.log(JSON.stringify(admins.map(admin => ({
    name: admin.name,
    email: admin.email,
    role: admin.role,
    programs: admin.permissions?.programs,
    projects: admin.permissions?.projects,
    gallery: admin.permissions?.gallery,
    team: admin.permissions?.team,
    newsEvents: admin.permissions?.newsEvents,
    reports: admin.permissions?.reports
  })), null, 2));

} catch (error) {
  console.error("Diagnostic failed:", error.message);
} finally {
  await mongoose.disconnect();
}
