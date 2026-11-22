
import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import {
  Users,
  FolderKanban,
  HandHeart,
  Mail,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

const API_URL = "/admin";

const initialData = {
  programs: [],
  projects: [],
  messages: [],
  volunteers: [],
  partnerships: [],
  donations: [],
  impact: [],
};

const endpoints = [
  { key: "programs", module: "programs", url: `${API_URL}/programs` },
  { key: "projects", module: "projects", url: `${API_URL}/projects` },
  { key: "messages", module: "messages", url: `${API_URL}/messages` },
  { key: "volunteers", module: "volunteers", url: `${API_URL}/volunteers` },
  { key: "partnerships", module: "partnerships", url: `${API_URL}/partnerships` },
  { key: "donations", module: "donations", url: `${API_URL}/donations` },
  { key: "impact", module: "impact", url: `${API_URL}/impact` },
];

function getRecords(response) {
  return response?.data?.data || [];
}

function formatDate(dateValue) {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Overview() {
  const { admin } = useAuth();

  const [dashboardData, setDashboardData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isSuperAdmin = admin?.role === "Super Admin";

  const canViewModule = useCallback(
    (module) => {
      if (isSuperAdmin) return true;

      return admin?.permissions?.[module]?.view === true;
    },
    [admin, isSuperAdmin]
  );

  const loadDashboardData = useCallback(async () => {
    if (!admin) {
      setDashboardData(initialData);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const permittedEndpoints = endpoints.filter((endpoint) =>
      canViewModule(endpoint.module)
    );

    const updatedData = { ...initialData };

    if (permittedEndpoints.length === 0) {
      setDashboardData(updatedData);
      setLoading(false);
      return;
    }

    try {
      const results = await Promise.allSettled(
        permittedEndpoints.map((endpoint) => api.get(endpoint.url))
      );

      let failedRequests = 0;

      results.forEach((result, index) => {
        const key = permittedEndpoints[index].key;

        if (result.status === "fulfilled") {
          updatedData[key] = getRecords(result.value);
        } else {
          failedRequests++;
          console.error(
            `Dashboard request failed for ${key}:`,
            result.reason
          );
        }
      });

      setDashboardData(updatedData);

      if (failedRequests > 0) {
        setError(
          "Some information you are authorized to view could not be loaded. Please refresh or contact the Super Admin if the problem continues."
        );
      }
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError("Unable to load dashboard information. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [admin, canViewModule]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const allStatistics = [
    {
      module: "programs",
      title: "Total Programs",
      value: dashboardData.programs.length,
      description: "Programs managed",
      icon: FolderKanban,
      color: "bg-blue-100 text-blue-700",
    },
    {
      module: "projects",
      title: "Total Projects",
      value: dashboardData.projects.length,
      description: "Projects managed",
      icon: TrendingUp,
      color: "bg-green-100 text-green-700",
    },
    {
      module: "messages",
      title: "Contact Messages",
      value: dashboardData.messages.length,
      description: "Messages received",
      icon: Mail,
      color: "bg-blue-100 text-blue-700",
    },
    {
      module: "volunteers",
      title: "Volunteers",
      value: dashboardData.volunteers.length,
      description: "Volunteer applications",
      icon: Users,
      color: "bg-purple-100 text-purple-700",
    },
    {
      module: "partnerships",
      title: "Partnerships",
      value: dashboardData.partnerships.length,
      description: "Partnership enquiries",
      icon: HandHeart,
      color: "bg-orange-100 text-orange-700",
    },
    {
      module: "donations",
      title: "Donation Enquiries",
      value: dashboardData.donations.length,
      description: "Donation enquiries received",
      icon: HandHeart,
      color: "bg-orange-100 text-orange-700",
    },
    {
      module: "impact",
      title: "Impact Statistics",
      value: dashboardData.impact.length,
      description: "Statistics managed",
      icon: TrendingUp,
      color: "bg-green-100 text-green-700",
    },
  ];

  const statistics = allStatistics.filter((stat) =>
    canViewModule(stat.module)
  );

  const activities = [
    ...dashboardData.messages.map((item) => ({
      id: `message-${item.id}`,
      title: "New contact message",
      description: `${item.name || "A visitor"} sent a message through the website.`,
      date: item.createdAt || item.date,
      icon: Mail,
      color: "bg-blue-100 text-blue-700",
    })),

    ...dashboardData.volunteers.map((item) => ({
      id: `volunteer-${item.id}`,
      title: "New volunteer application",
      description: `${item.name || item.fullName || "A visitor"} submitted a volunteer application.`,
      date: item.createdAt || item.date,
      icon: Users,
      color: "bg-purple-100 text-purple-700",
    })),

    ...dashboardData.partnerships.map((item) => ({
      id: `partnership-${item.id}`,
      title: "New partnership enquiry",
      description: `${item.organization || "An organization"} submitted a partnership enquiry.`,
      date: item.createdAt || item.date,
      icon: HandHeart,
      color: "bg-orange-100 text-orange-700",
    })),

    ...dashboardData.donations.map((item) => ({
      id: `donation-${item.id}`,
      title: "New donation enquiry",
      description: `${item.name || "A visitor"} submitted a donation enquiry.`,
      date: item.createdAt || item.date,
      icon: HandHeart,
      color: "bg-orange-100 text-orange-700",
    })),

    ...dashboardData.projects.map((item) => ({
      id: `project-${item.id}`,
      title: "Project added or updated",
      description: `${item.title || item.name || "A project"} is managed in the dashboard.`,
      date: item.updatedAt || item.createdAt,
      icon: FolderKanban,
      color: "bg-green-100 text-green-700",
    })),
  ];

  activities.sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();

    return dateB - dateA;
  });

  const recentActivities = activities.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* WELCOME SECTION */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Dashboard Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Welcome to the Bishop Wasonga Foundation administration dashboard.
            Here's a summary of the activities you are authorized to view.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Data
        </button>
      </section>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STATISTICS CARDS */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">
            Foundation Summary
          </h3>

          <span className="text-xs text-green-700">
            Authorized dashboard data
          </span>
        </div>

        {statistics.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-sm">
            You currently do not have permission to view dashboard statistics.
            Please contact the Super Admin.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {statistics.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {stat.title}
                      </p>

                      <h4 className="mt-3 text-3xl font-bold text-gray-800">
                        {loading ? "..." : stat.value}
                      </h4>

                      <p className="mt-2 text-xs text-gray-400">
                        {stat.description}
                      </p>
                    </div>

                    <div className={`rounded-xl p-3 ${stat.color}`}>
                      <Icon size={23} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* LOWER DASHBOARD SECTION */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* RECENT ACTIVITIES */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800">
                Recent Activities
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Latest activities from modules you can view
              </p>
            </div>

            <Clock size={20} className="text-gray-400" />
          </div>

          <div className="space-y-5">
            {loading ? (
              <p className="text-sm text-gray-500">
                Loading recent activities...
              </p>
            ) : recentActivities.length === 0 ? (
              <p className="text-sm text-gray-500">
                No recent activities are available in your permitted modules.
              </p>
            ) : (
              recentActivities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4"
                  >
                    <div className={`rounded-lg p-3 ${activity.color}`}>
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-gray-800">
                        {activity.title}
                      </h4>

                      <p className="mt-1 text-xs text-gray-500">
                        {activity.description}
                      </p>
                    </div>

                    <span className="whitespace-nowrap text-xs text-gray-400">
                      {formatDate(activity.date)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* QUICK SUMMARY */}
        <div className="rounded-xl bg-green-950 p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Foundation Status</h3>

            <CheckCircle size={22} className="text-green-400" />
          </div>

          <p className="mt-3 text-sm leading-6 text-green-100">
            Your administration dashboard displays information according to
            your assigned access permissions.
          </p>

          <div className="mt-6 border-t border-green-800 pt-5">
            <p className="text-xs text-green-300">
              Dashboard data connection
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  loading
                    ? "bg-yellow-400"
                    : error
                      ? "bg-red-400"
                      : "bg-green-400"
                }`}
              />

              <span className="text-sm text-green-100">
                {loading
                  ? "Loading data..."
                  : error
                    ? "Some data unavailable"
                    : "Dashboard ready"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-green-300">
            <ArrowUpRight size={17} />
            <span>Bishop Wasonga Foundation</span>
          </div>
        </div>
      </section>
    </div>
  );
}
