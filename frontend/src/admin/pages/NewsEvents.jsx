
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Newspaper,
  CalendarDays,
  MapPin,
  Clock,
  Image,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  RefreshCw,
} from "lucide-react";

const API_URL = "/admin/news-events";

const emptyForm = {
  title: "",
  type: "News",
  category: "",
  date: "",
  time: "",
  location: "",
  image: "",
  summary: "",
  description: "",
};

export default function NewsEvents() {
  const { admin, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
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
    admin?.permissions?.newsEvents?.[action] === true;

  const canView = hasPermission("view");
  const canCreate = hasPermission("create");
  const canEdit = hasPermission("edit");
  const canDelete = hasPermission("delete");
  const canPublish = hasPermission("publish");
  const canApprove = hasPermission("approve");

  // Prioritize the custom ID used by the backend controller.
  const getId = (item) => item.id || item._id;

  const getPublicationStatus = (item) =>
    item.publicationStatus || item.status || "Draft";

  const fetchItems = useCallback(async () => {
    if (!canView) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(API_URL);
      setItems(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load news and events."
      );
    } finally {
      setLoading(false);
    }
  }, [canView]);

  const fetchPendingItems = useCallback(async () => {
    if (!canApprove) {
      setPendingItems([]);
      return;
    }

    try {
      const response = await api.get(`${API_URL}/pending`);
      setPendingItems(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load pending approvals."
      );
    }
  }, [canApprove]);

  useEffect(() => {
    if (authLoading) return;

    fetchItems();
    fetchPendingItems();
  }, [authLoading, fetchItems, fetchPendingItems]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = `${item.title || ""} ${
        item.category || ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All" || item.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [items, search, typeFilter]);

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

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const startEdit = (item) => {
    setEditingId(getId(item));

    setForm({
      title: item.title || "",
      type: item.type || "News",
      category: item.category || "",
      date: item.date ? String(item.date).slice(0, 10) : "",
      time: item.time || "",
      location: item.location || "",
      image: item.image || "",
      summary: item.summary || "",
      description: item.description || "",
    });

    setShowForm(true);
    setError("");
    setSuccess("");
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

      await Promise.all([fetchItems(), fetchPendingItems()]);

      setSuccess(
        editingId
          ? "News or event updated and submitted for review where approval is required."
          : "News or event created successfully. It remains a draft until approved and published."
      );

      closeForm();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save item."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item) => {
    const id = getId(item);

    if (
      !window.confirm(
        `Are you sure you want to delete "${item.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`${API_URL}/${id}`);

      await Promise.all([fetchItems(), fetchPendingItems()]);

      setSuccess("News or event deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete item."
      );
    }
  };

  const changePublication = async (item) => {
    const currentStatus = getPublicationStatus(item);
    const newStatus =
      currentStatus === "Published" ? "Draft" : "Published";

    const message =
      newStatus === "Published"
        ? `Publish "${item.title}" on the public website?`
        : `Unpublish "${item.title}" from the public website?`;

    if (!window.confirm(message)) return;

    try {
      setError("");
      setSuccess("");

      await api.put(`${API_URL}/${getId(item)}/publication`, {
        publicationStatus: newStatus,
      });

      await fetchItems();

      setSuccess(
        newStatus === "Published"
          ? "News or event published successfully."
          : "News or event moved to Draft successfully."
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
    if (
      !window.confirm(
        `Approve "${item.title}"? Approval does not automatically publish it.`
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.put(`${API_URL}/${getId(item)}/approve`);

      await Promise.all([fetchItems(), fetchPendingItems()]);

      setSuccess(
        "Content approved successfully. It remains a draft until separately published."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to approve item."
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

      await api.put(`${API_URL}/${getId(item)}/reject`, {
        comment: comment.trim(),
      });

      await Promise.all([fetchItems(), fetchPendingItems()]);

      setSuccess(
        "Content rejected. The Editor can review your feedback and resubmit it."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to reject item."
      );
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-600";

  const labelClass =
    "mb-2 block text-sm font-medium text-gray-700";

  const getApprovalBadge = (item) => {
    if (item.pendingRevision?.reviewStatus === "Pending") {
      return "Revision Pending";
    }

    return item.approvalStatus || "Approved";
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

  const displayItems =
    activeTab === "pending" ? pendingItems : filteredItems;

  if (authLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-500">
        Checking administrator permissions...
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center">
        <Eye className="mx-auto mb-3 text-gray-400" size={32} />
        <h3 className="font-semibold text-gray-800">
          Access Restricted
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          You do not have permission to view News & Events.
          Please contact the Super Admin.
        </p>
      </div>
    );
  }

  const publishedCount = items.filter(
    (item) => getPublicationStatus(item) === "Published"
  ).length;

  const draftCount = items.filter(
    (item) => getPublicationStatus(item) === "Draft"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            News & Events Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage foundation news, event announcements and content approvals.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
          >
            <Plus size={18} />
            Add News / Event
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
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Items</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-800">
            {items.length}
          </h3>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Published</p>
          <h3 className="mt-2 text-3xl font-bold text-green-700">
            {publishedCount}
          </h3>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Drafts</p>
          <h3 className="mt-2 text-3xl font-bold text-orange-600">
            {draftCount}
          </h3>
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
          All News & Events ({items.length})
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
            Pending Approvals ({pendingItems.length})
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-bold text-gray-800">
              {activeTab === "pending"
                ? "News & Events Awaiting Approval"
                : "All News & Events"}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {activeTab === "pending"
                ? "Review submitted content before it can be published."
                : "Manage articles and event announcements."}
            </p>
          </div>

          {activeTab === "all" && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-600 sm:w-52"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600"
              >
                <option value="All">All Types</option>
                <option value="News">News</option>
                <option value="Event">Events</option>
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Approval</th>
                <th className="px-5 py-4">Publication</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Loading news and events...
                  </td>
                </tr>
              ) : displayItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    {activeTab === "pending"
                      ? "There are no pending approvals."
                      : "No news or events found."}
                  </td>
                </tr>
              ) : (
                displayItems.map((item) => {
                  const publicationStatus =
                    getPublicationStatus(item);

                  const approvalStatus =
                    getApprovalBadge(item);

                  const hasPendingRevision =
                    item.pendingRevision?.reviewStatus === "Pending";

                  const isApproved =
                    item.approvalStatus === "Approved" ||
                    !item.approvalStatus;

                  const canChangeThisPublication =
                    canPublish &&
                    isApproved &&
                    !hasPendingRevision;

                  return (
                    <tr
                      key={getId(item)}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-green-100 p-2 text-green-700">
                            {item.type === "Event" ? (
                              <CalendarDays size={20} />
                            ) : (
                              <Newspaper size={20} />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {item.category || "Uncategorized"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {item.type}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        <span className="flex items-center gap-2">
                          <CalendarDays size={15} />
                          {item.date
                            ? String(item.date).slice(0, 10)
                            : "Not set"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            approvalStatus
                          )}`}
                        >
                          {approvalStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            publicationStatus
                          )}`}
                        >
                          {publicationStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          {activeTab === "pending" && canApprove && (
                            <>
                              <button
                                onClick={() => approveItem(item)}
                                className="rounded-lg p-2 text-green-700 hover:bg-green-50"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>

                              <button
                                onClick={() => rejectItem(item)}
                                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}

                          {activeTab === "all" && (
                            <>
                              {canEdit && (
                                <button
                                  onClick={() => startEdit(item)}
                                  className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                  title="Edit item"
                                >
                                  <Pencil size={17} />
                                </button>
                              )}

                              {canChangeThisPublication && (
                                <button
                                  onClick={() =>
                                    changePublication(item)
                                  }
                                  className={`rounded-lg p-2 ${
                                    publicationStatus === "Published"
                                      ? "text-orange-600 hover:bg-orange-50"
                                      : "text-green-700 hover:bg-green-50"
                                  }`}
                                  title={
                                    publicationStatus === "Published"
                                      ? "Move to Draft"
                                      : "Publish item"
                                  }
                                >
                                  {publicationStatus === "Published" ? (
                                    <XCircle size={17} />
                                  ) : (
                                    <Send size={17} />
                                  )}
                                </button>
                              )}

                              {canDelete && (
                                <button
                                  onClick={() => deleteItem(item)}
                                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                  title="Delete item"
                                >
                                  <Trash2 size={17} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-gray-100 p-4">
          <button
            onClick={() => {
              fetchItems();
              fetchPendingItems();
            }}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {editingId
                    ? "Edit News / Event"
                    : "Add News / Event"}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Content will remain a draft until approved and separately published.
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
              className="max-h-[75vh] space-y-4 overflow-y-auto p-5"
            >
              <div>
                <label className={labelClass}>Title</label>
                <input
                  required
                  name="title"
                  maxLength={150}
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter title"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className={`${inputClass} bg-white`}
                  >
                    <option value="News">News</option>
                    <option value="Event">Event</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Category</label>
                  <input
                    required
                    name="category"
                    maxLength={100}
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. Education"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  {form.type === "News"
                    ? "Publication Date"
                    : "Event Date"}
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {form.type === "News" && (
                <>
                  <div>
                    <label className={labelClass}>
                      <span className="inline-flex items-center gap-2">
                        <Image size={16} />
                        News Image URL
                      </span>
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={form.image}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Paste a publicly accessible image URL.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Short Summary
                    </label>
                    <textarea
                      name="summary"
                      rows="2"
                      maxLength={500}
                      value={form.summary}
                      onChange={handleChange}
                      placeholder="Write a short introduction to the news..."
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {form.type === "Event" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      <span className="inline-flex items-center gap-2">
                        <Clock size={16} />
                        Event Time
                      </span>
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={16} />
                        Event Location
                      </span>
                    </label>
                    <input
                      name="location"
                      maxLength={200}
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Enter event location"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={labelClass}>
                  {form.type === "News"
                    ? "Full News Description"
                    : "Event Description"}
                </label>
                <textarea
                  required
                  name="description"
                  rows="5"
                  maxLength={5000}
                  value={form.description}
                  onChange={handleChange}
                  placeholder={
                    form.type === "News"
                      ? "Write the full news article..."
                      : "Write the event description..."
                  }
                  className={inputClass}
                />
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                Publication status is controlled separately by an administrator with publishing permission. Saving this form does not publish content.
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
