
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  GraduationCap,
  HeartPulse,
  Leaf,
  TrendingUp,
} from "lucide-react";

const API_URL = "/admin/impact";

const emptyForm = {
  title: "",
  value: "",
  category: "Community",
  description: "",
  status: "Active",
};

export default function Impact() {
  const [stats, setStats] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingStat, setEditingStat] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch impact statistics from backend
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(API_URL);

      const formattedStats = (response.data.data || []).map((stat) => ({
        ...stat,
        title: stat.title || stat.label || "",
        label: stat.label || stat.title || "",
        category: stat.category || "General",
        description: stat.description || "",
        value: String(stat.value ?? ""),
        status: stat.status || "Active",
      }));

      setStats(formattedStats);
    } catch (err) {
      console.error("Error fetching impact statistics:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load impact statistics. Please check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const filteredStats = useMemo(() => {
    return stats.filter((stat) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        stat.title.toLowerCase().includes(searchText) ||
        stat.category.toLowerCase().includes(searchText) ||
        stat.description.toLowerCase().includes(searchText) ||
        stat.value.toLowerCase().includes(searchText);

      const matchesCategory =
        categoryFilter === "All" ||
        stat.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        stat.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [stats, search, categoryFilter, statusFilter]);

  const activeCount = stats.filter(
    (stat) => stat.status === "Active"
  ).length;

  const inactiveCount = stats.filter(
    (stat) => stat.status === "Inactive"
  ).length;

  const openAddModal = () => {
    setEditingStat(null);
    setFormData(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (stat) => {
    setEditingStat(stat);

    setFormData({
      title: stat.title,
      value: stat.value,
      category: stat.category,
      description: stat.description,
      status: stat.status,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStat(null);
    setFormData(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add or update statistic
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.value.trim()) {
      setError("Please enter a statistic title and value.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingStat) {
        await api.put(
          `${API_URL}/${editingStat.id || editingStat._id}`,
          formData
        );

        setSuccess("Impact statistic updated successfully.");
      } else {
        const response = await api.post(API_URL, formData);

        // Apply Inactive status if selected during creation.
        if (formData.status === "Inactive") {
          const newStat = response.data.data;

          await api.put(
            `${API_URL}/${newStat.id || newStat._id}`,
            { status: "Inactive" }
          );
        }

        setSuccess("Impact statistic added successfully.");
      }

      await fetchStats();

      closeModal();
    } catch (err) {
      console.error("Error saving impact statistic:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save statistic. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete statistic
  const deleteStat = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this impact statistic?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`${API_URL}/${id}`);

      setSuccess("Impact statistic deleted successfully.");

      await fetchStats();
    } catch (err) {
      console.error("Error deleting impact statistic:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete statistic. Please try again."
      );
    }
  };

  // Activate or deactivate statistic
  const toggleStatus = async (stat) => {
    const newStatus =
      stat.status === "Active" ? "Inactive" : "Active";

    try {
      setError("");
      setSuccess("");

      await api.put(`${API_URL}/${stat.id || stat._id}`, {
        status: newStatus,
      });

      setSuccess(`Statistic marked as ${newStatus}.`);

      await fetchStats();
    } catch (err) {
      console.error("Error updating statistic status:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update statistic status."
      );
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case "Education":
        return "bg-blue-100 text-blue-700";
      case "Health":
        return "bg-red-100 text-red-700";
      case "Environment":
        return "bg-green-100 text-green-700";
      case "Development":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Impact Statistics
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the foundation's achievements and impact figures.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"
        >
          <Plus size={18} />
          Add Statistic
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Statistics</p>
            <TrendingUp className="text-blue-600" size={22} />
          </div>

          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {stats.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Active Statistics</p>
            <Users className="text-green-600" size={22} />
          </div>

          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {activeCount}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Inactive Statistics</p>
            <TrendingUp className="text-orange-600" size={22} />
          </div>

          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {inactiveCount}
          </h2>
        </div>
      </div>

      {/* Category overview */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <GraduationCap className="mb-3 text-blue-600" size={25} />
          <p className="text-sm font-medium text-gray-700">Education</p>
          <p className="mt-1 text-xs text-gray-500">
            Learning and school support
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <HeartPulse className="mb-3 text-red-600" size={25} />
          <p className="text-sm font-medium text-gray-700">Health</p>
          <p className="mt-1 text-xs text-gray-500">
            Health and wellbeing
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <Leaf className="mb-3 text-green-600" size={25} />
          <p className="text-sm font-medium text-gray-700">Environment</p>
          <p className="mt-1 text-xs text-gray-500">
            Conservation initiatives
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <Users className="mb-3 text-orange-600" size={25} />
          <p className="text-sm font-medium text-gray-700">Community</p>
          <p className="mt-1 text-xs text-gray-500">
            Community empowerment
          </p>
        </div>
      </div>

      {/* Statistics table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">
              All Impact Statistics
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add, edit and manage impact figures.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search statistics..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-green-600 sm:w-56"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-600"
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="Community">Community</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Environment">Environment</option>
              <option value="Development">Development</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-600"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Statistic</th>
                <th className="px-5 py-4">Value</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Loading impact statistics...
                  </td>
                </tr>
              ) : (
                <>
                  {filteredStats.map((stat) => (
                    <tr
                      key={stat.id || stat._id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {stat.title}
                        </p>

                        <p className="mt-1 max-w-xs text-xs text-gray-500">
                          {stat.description || "No description provided."}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-lg font-bold text-gray-800">
                        {stat.value}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getCategoryStyle(
                            stat.category
                          )}`}
                        >
                          {stat.category}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleStatus(stat)}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            stat.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {stat.status}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(stat)}
                            title="Edit statistic"
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() =>
                              deleteStat(stat.id || stat._id)
                            }
                            title="Delete statistic"
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredStats.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-12 text-center text-gray-500"
                      >
                        No impact statistics found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500">
          Showing {filteredStats.length} of {stats.length} statistics
        </div>
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingStat ? "Edit Statistic" : "Add New Statistic"}
              </h2>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Statistic Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. People Reached"
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Statistic Value *
                </label>

                <input
                  type="text"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder="e.g. 5,000+"
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-green-600"
                >
                  <option value="Community">Community</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="Environment">Environment</option>
                  <option value="Development">Development</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe what this statistic represents..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-green-600"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingStat
                      ? "Save Changes"
                      : "Add Statistic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
