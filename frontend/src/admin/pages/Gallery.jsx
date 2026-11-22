
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import {
  Image,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Eye,
  Images,
  CheckCircle,
  XCircle,
  Send,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

const API_URL = "/admin/gallery";

const emptyForm = {
  title: "",
  category: "Community",
  imageUrl: "",
  date: new Date().toISOString().split("T")[0],
};

export default function Gallery() {
  const { admin, loading: authLoading } = useAuth();

  const [gallery, setGallery] = useState([]);
  const [pendingGallery, setPendingGallery] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isSuperAdmin = admin?.role === "Super Admin";

  const hasPermission = (action) =>
    isSuperAdmin ||
    admin?.permissions?.gallery?.[action] === true;

  const canView = hasPermission("view");
  const canCreate = hasPermission("create");
  const canEdit = hasPermission("edit");
  const canDelete = hasPermission("delete");
  const canPublish = hasPermission("publish");
  const canApprove = hasPermission("approve");

  // Use the custom Gallery ID first because the backend
  // controller searches Gallery records using the "id" field.
  const getId = (item) => item.id || item._id;

  const getPublicationStatus = (item) =>
    item.publicationStatus || item.status || "Draft";

  const getApprovalStatus = (item) => {
    if (item.pendingRevision?.reviewStatus === "Pending") {
      return "Revision Pending";
    }

    return item.approvalStatus || "Approved";
  };

  const fetchGallery = useCallback(async () => {
    if (!canView) {
      setGallery([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(API_URL);
      setGallery(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load gallery."
      );
    } finally {
      setLoading(false);
    }
  }, [canView]);

  const fetchPendingGallery = useCallback(async () => {
    if (!canApprove) {
      setPendingGallery([]);
      return;
    }

    try {
      const response = await api.get(`${API_URL}/pending`);
      setPendingGallery(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load pending gallery approvals."
      );
    }
  }, [canApprove]);

  useEffect(() => {
    if (authLoading) return;

    fetchGallery();
    fetchPendingGallery();
  }, [authLoading, fetchGallery, fetchPendingGallery]);

  const filteredGallery = useMemo(() => {
    const source =
      activeTab === "pending" ? pendingGallery : gallery;

    return source.filter((item) => {
      const matchesSearch =
        (item.title || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (item.category || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        activeTab === "pending" ||
        filter === "All" ||
        getPublicationStatus(item) === filter;

      return matchesSearch && matchesFilter;
    });
  }, [gallery, pendingGallery, search, filter, activeTab]);

  const publishedCount = gallery.filter(
    (item) => getPublicationStatus(item) === "Published"
  ).length;

  const draftCount = gallery.filter(
    (item) => getPublicationStatus(item) === "Draft"
  ).length;

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(getId(item));

    setForm({
      title: item.title || "",
      category: item.category || "Community",
      imageUrl: item.imageUrl || "",
      date: item.date
        ? String(item.date).slice(0, 10)
        : "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        await api.put(`${API_URL}/${editingId}`, form);
      } else {
        await api.post(API_URL, form);
      }

      await Promise.all([
        fetchGallery(),
        fetchPendingGallery(),
      ]);

      setSuccess(
        editingId
          ? "Gallery item updated successfully. If approval is required, the changes have been submitted for review."
          : "Gallery item added successfully. It remains a draft until approved and separately published."
      );

      closeForm();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save gallery item."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`${API_URL}/${getId(item)}`);

      await Promise.all([
        fetchGallery(),
        fetchPendingGallery(),
      ]);

      setSuccess("Gallery item deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete gallery item."
      );
    }
  };

  const changePublication = async (item) => {
    const currentStatus = getPublicationStatus(item);

    const newStatus =
      currentStatus === "Published"
        ? "Draft"
        : "Published";

    const confirmed = window.confirm(
      newStatus === "Published"
        ? `Publish "${item.title}" on the public website?`
        : `Unpublish "${item.title}" from the public website?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.put(
        `${API_URL}/${getId(item)}/publication`,
        {
          publicationStatus: newStatus,
        }
      );

      await fetchGallery();

      setSuccess(
        newStatus === "Published"
          ? "Gallery item published successfully."
          : "Gallery item moved to Draft successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update publication status."
      );
    }
  };

  const approveItem = async (item) => {
    const confirmed = window.confirm(
      `Approve "${item.title}"? Approval will not automatically publish it.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.put(
        `${API_URL}/${getId(item)}/approve`
      );

      await Promise.all([
        fetchGallery(),
        fetchPendingGallery(),
      ]);

      setSuccess(
        "Gallery item approved. It remains a draft until separately published."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to approve gallery item."
      );
    }
  };

  const rejectItem = async (item) => {
    const comment = window.prompt(
      `Provide a reason for rejecting "${item.title}". The Editor will see this feedback:`
    );

    if (comment === null) return;

    if (!comment.trim()) {
      setError("A rejection comment is required.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.put(
        `${API_URL}/${getId(item)}/reject`,
        {
          comment: comment.trim(),
        }
      );

      await Promise.all([
        fetchGallery(),
        fetchPendingGallery(),
      ]);

      setSuccess(
        "Gallery item rejected. The Editor can review the feedback and resubmit."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to reject gallery item."
      );
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Published" || status === "Approved") {
      return "bg-green-100 text-green-700";
    }

    if (
      status === "Pending" ||
      status === "Revision Pending"
    ) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "Rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-orange-100 text-orange-700";
  };

  if (authLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
        Checking administrator permissions...
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <Eye className="mx-auto mb-3 text-gray-400" size={32} />
        <h3 className="font-semibold text-gray-800">
          Access Restricted
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          You do not have permission to view Gallery.
          Please contact the Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gallery Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage photographs and images displayed on the foundation website.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
          >
            <Plus size={18} />
            Add Gallery Item
          </button>
        )}
      </div>

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Images</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {gallery.length}
              </h2>
            </div>
            <div className="rounded-lg bg-green-100 p-3 text-green-700">
              <Images size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Published</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {publishedCount}
              </h2>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
              <Eye size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Drafts</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {draftCount}
              </h2>
            </div>
            <div className="rounded-lg bg-yellow-100 p-3 text-yellow-700">
              <Image size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold ${
            activeTab === "all"
              ? "border-green-700 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          All Gallery Items ({gallery.length})
        </button>

        {canApprove && (
          <button
            onClick={() => setActiveTab("pending")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold ${
              activeTab === "pending"
                ? "border-green-700 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Pending Approvals ({pendingGallery.length})
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search gallery..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        {activeTab === "all" && (
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-600"
          >
            <option value="All">All Items</option>
            <option value="Published">Published</option>
            <option value="Draft">Drafts</option>
          </select>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          Loading gallery items...
        </div>
      ) : filteredGallery.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <Images className="mx-auto text-gray-400" size={40} />
          <h3 className="mt-3 font-semibold text-gray-700">
            {activeTab === "pending"
              ? "No pending gallery approvals"
              : "No gallery items found"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === "pending"
              ? "Submitted gallery content will appear here for review."
              : "Try another search or add a new gallery item."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredGallery.map((item) => {
            const publicationStatus = getPublicationStatus(item);
            const approvalStatus = getApprovalStatus(item);

            const isApproved =
              item.approvalStatus === "Approved" ||
              !item.approvalStatus;

            const hasPendingRevision =
              item.pendingRevision?.reviewStatus === "Pending";

            const canChangeThisPublication =
              canPublish && isApproved && !hasPendingRevision;

            return (
              <div
                key={getId(item)}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title || "Gallery image"}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src =
                        "https://placehold.co/600x400?text=Image+Unavailable";
                    }}
                  />

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                      publicationStatus
                    )}`}
                  >
                    {publicationStatus}
                  </span>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      {item.category}
                    </p>

                    <h3 className="mt-1 font-semibold text-gray-800">
                      {item.title}
                    </h3>

                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <CalendarDays size={13} />
                      {item.date
                        ? String(item.date).slice(0, 10)
                        : "Date not set"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                          approvalStatus
                        )}`}
                      >
                        {approvalStatus}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                          publicationStatus
                        )}`}
                      >
                        {publicationStatus}
                      </span>
                    </div>
                  </div>

                  {activeTab === "pending" && canApprove ? (
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <button
                        onClick={() => approveItem(item)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-900"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>

                      <button
                        onClick={() => rejectItem(item)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      {canEdit && (
                        <button
                          onClick={() => openEditForm(item)}
                          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                      )}

                      {canChangeThisPublication && (
                        <button
                          onClick={() => changePublication(item)}
                          className={`inline-flex items-center gap-2 text-sm font-medium ${
                            publicationStatus === "Published"
                              ? "text-orange-600 hover:text-orange-800"
                              : "text-green-700 hover:text-green-900"
                          }`}
                        >
                          {publicationStatus === "Published" ? (
                            <XCircle size={16} />
                          ) : (
                            <Send size={16} />
                          )}

                          {publicationStatus === "Published"
                            ? "Unpublish"
                            : "Publish"}
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => handleDelete(item)}
                          className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            fetchGallery();
            fetchPendingGallery();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editingId
                    ? "Edit Gallery Item"
                    : "Add Gallery Item"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the image details below.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-5"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Image Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  placeholder="Enter image title"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600"
                >
                  <option>Community</option>
                  <option>Education</option>
                  <option>Healthcare</option>
                  <option>Environment</option>
                  <option>Events</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Image URL
                </label>

                <input
                  type="url"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  required
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Paste a publicly accessible image link.
                </p>
              </div>

              {form.imageUrl && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Image Preview
                  </p>

                  <img
                    src={form.imageUrl}
                    alt="Gallery preview"
                    className="h-40 w-full rounded-lg border border-gray-200 object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                Publication status is managed separately by an administrator with publishing permission. Saving this form does not publish the image.
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-100 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Image"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
