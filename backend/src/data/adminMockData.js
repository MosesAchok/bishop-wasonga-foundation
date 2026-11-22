
import { impactStats } from "./mockData.js";

export const adminPrograms = [
  {
    id: "PRG001",
    title: "Education Support",
    category: "Education",
    description:
      "Supporting children from vulnerable families to access quality education.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "PRG002",
    title: "Community Health",
    category: "Health",
    description:
      "Improving access to healthcare and promoting healthy communities.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "PRG003",
    title: "Environmental Conservation",
    category: "Environment",
    description:
      "Promoting environmental protection and sustainable natural resource management.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const adminProjects = [];
export const adminNews = [];
export const adminEvents = [];
export const adminGallery = [];
export const adminReports = [];
export const adminMessages = [];
export const adminVolunteers = [];
export const adminPartnerships = [];
export const adminDonations = [];

// Team members managed through the Admin Dashboard.
export const adminTeamMembers = [
  // Team members will be added through the Admin Dashboard.
  // Each member will have:
  // id, name, position, imageUrl, shortDescription,
  // biography, status, createdAt, updatedAt.
];


// Initialize Admin Impact Statistics using existing public statistics.
export const adminImpactStats = impactStats.map((stat) => ({
  id: stat.id,
  label: stat.label,
  title: stat.label,
  value: stat.value,
  category: "General",
  description: "",
  status: "Active",
  createdAt: new Date().toISOString(),
}));

export const adminAdministrators = [
  {
    id: "ADM001",
    name: "Foundation Super Admin",
    email: "admin@bishopwasongafoundation.org",
    role: "Super Admin",
    phone: "+254712345678",
    status: "Active",
    dateAdded: "2026-10-01",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ADM002",
    name: "Communications Officer",
    email: "communications@bishopwasongafoundation.org",
    role: "Editor",
    phone: "+254723456789",
    status: "Active",
    dateAdded: "2026-10-05",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ADM003",
    name: "Programme Coordinator",
    email: "programmes@bishopwasongafoundation.org",
    role: "Administrator",
    phone: "+254734567890",
    status: "Inactive",
    dateAdded: "2026-10-12",
    createdAt: new Date().toISOString(),
  },
];
