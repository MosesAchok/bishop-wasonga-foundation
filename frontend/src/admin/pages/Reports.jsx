
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Send,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const API_URL = "/admin/reports";

const emptyForm = {
  title: "",
  category: "Annual Report",
  period: "",
  publicationDate: "",
  description: "",
  fileUrl: "",
};

export default function Reports() {
  const { admin } = useAuth();

  const [reports, setReports] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // PERMISSIONS
  // ==========================================

  const isSuperAdmin = admin?.role === "Super Admin";

  const hasPermission = (action) => {
    if (isSuperAdmin) return true;

    return admin?.permissions?.reports?.[action] === true;
  };

  const canView = hasPermission("view");
  const canCreate = hasPermission("create");
  const canEdit = hasPermission("edit");
  const canDelete = hasPermission("delete");
  const canPublish = hasPermission("publish");
  const canApprove = hasPermission("approve");

  // ==========================================
  // FETCH ALL REPORTS
  // ==========================================

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(API_URL);

      setReports(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to retrieve reports."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH PENDING APPROVALS
  // ==========================================

  const fetchPendingReports = async () => {
    if (!canApprove) return;

    try {
      setPendingLoading(true);

      const response = await api.get(`${API_URL}/pending`);

      setPendingReports(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to retrieve pending reports."
      );
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (canApprove) {
      fetchPendingReports();
    } else {
      setPendingReports([]);
    }
  }, [admin]);

  // ==========================================
  // REFRESH DATA
  // ==========================================

  const refreshReports = async () => {
    await fetchReports();

    if (canApprove) {
      await fetchPendingReports();
    }
  };

  // ==========================================
  // FILTER REPORTS
  // ==========================================

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        (report.title || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (report.category || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const publicationStatus =
        report.publicationStatus || report.status || "Draft";

      const matchesStatus =
        statusFilter === "All" ||
        publicationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  const publishedCount = reports.filter(
    (report) =>
      (report.publicationStatus || report.status) === "Published"
  ).length;

  const draftCount = reports.filter(
    (report) =>
      (report.publicationStatus || report.status) !== "Published"
  ).length;

  // ==========================================
  // FORM HANDLING
  // ==========================================

  const openAddForm = () => {
    setEditingReport(null);
    setFormData(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (report) => {
    setEditingReport(report);

    setFormData({
      title: report.title || "",
      category: report.category || "Annual Report",
      period: report.period || "",
      publicationDate: report.publicationDate || "",
      description: report.description || "",
      fileUrl: report.fileUrl || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingReport(null);
    setFormData(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // CREATE OR UPDATE REPORT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingReport) {
        await api.put(
          `${API_URL}/${editingReport.id}`,
          formData
        );

        setSuccess(
          admin?.role === "Editor"
            ? "Your changes have been submitted for approval."
            : "Report updated successfully."
        );
      } else {
        await api.post(API_URL, formData);

        setSuccess(
          admin?.role === "Editor"
            ? "Report submitted successfully and is waiting for approval."
            : "Report created successfully as a Draft."
        );
      }

      closeForm();
      await refreshReports();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save report."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // PUBLISH / UNPUBLISH REPORT
  // ==========================================

  const togglePublication = async (report) => {
    const currentStatus =
      report.publicationStatus || report.status || "Draft";

    const nextStatus =
      currentStatus === "Published" ? "Draft" : "Published";

    const confirmed = window.confirm(
      nextStatus === "Published"
        ? `Publish "${report.title}"?`
        : `Unpublish "${report.title}"?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(report.id);
      setError("");
      setSuccess("");

      await api.put(
        `${API_URL}/${report.id}/publication`,
        {
          publicationStatus: nextStatus,
        }
      );

      setSuccess(
        nextStatus === "Published"
          ? "Report published successfully."
          : "Report unpublished successfully."
      );

      await refreshReports();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to change publication status."
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==========================================
  // APPROVE REPORT
  // ==========================================

  const approveReport = async (report) => {
    const confirmed = window.confirm(
      `Approve "${report.pendingRevision?.title || report.title}"?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(report.id);
      setError("");
      setSuccess("");

      await api.put(`${API_URL}/${report.id}/approve`);

      setSuccess(
        "Report approved successfully. It remains a Draft until separately published."
      );

      await refreshReports();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to approve report."
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==========================================
  // REJECT REPORT
  // ==========================================

  const rejectReport = async (report) => {
    const comment = window.prompt(
      "Enter the reason for rejecting this report. The Editor will see this comment:"
    );

    if (comment === null) return;

    if (!comment.trim()) {
      setError("A rejection comment is required.");
      return;
    }

    if (comment.trim().length > 2000) {
      setError("The rejection comment cannot exceed 2000 characters.");
      return;
    }

    try {
      setActionLoading(report.id);
      setError("");
      setSuccess("");

      await api.put(`${API_URL}/${report.id}/reject`, {
        comment: comment.trim(),
      });

      setSuccess(
        "Report rejected. The Editor can now review the comment and resubmit."
      );

      await refreshReports();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to reject report."
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==========================================
  // DELETE REPORT
  // ==========================================

  const deleteReport = async (id, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${title}"?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);
      setError("");
      setSuccess("");

      await api.delete(`${API_URL}/${id}`);

      setSuccess("Report deleted successfully.");

      await refreshReports();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete report."
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==========================================
  // STATUS BADGES
  // ==========================================

  const getPublicationStatus = (report) =>
    report.publicationStatus || report.status || "Draft";

  const getApprovalStatus = (report) => {
    if (report.pendingRevision?.reviewStatus === "Pending") {
      return "Revision Pending";
    }

    return report.approvalStatus || "Approved";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Published":
      case "Approved":
        return "bg-green-100 text-green-700";

      case "Pending":
      case "Revision Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  // ==========================================
  // REPORT ROW
  // ==========================================

  const renderReportRow = (report, isPending = false) => {
    const displayedReport =
      isPending && report.pendingRevision
        ? report.pendingRevision
        : report;

    const publicationStatus = getPublicationStatus(report);
    const approvalStatus = getApprovalStatus(report);

    const hasPendingRevision =
      report.pendingRevision?.reviewStatus === "Pending";

    const canChangePublication =
      canPublish &&
      report.approvalStatus === "Approved" &&
      !hasPendingRevision;

    return (
      <tr key={report.id} className="hover:bg-gray-50">
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2 text-green-700">
              <FileText size={20} />
            </div>

            <div>
              <p className="font-medium text-gray-800">
                {displayedReport.title}
              </p>

              <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                {displayedReport.description || "No description"}
              </p>

              {isPending && report.pendingRevision && (
                <p className="mt-1 text-xs font-medium text-yellow-700">
                  Proposed revision
                </p>
              )}

              {report.approvalStatus === "Rejected" && (
                <p className="mt-1 text-xs text-red-600">
                  Rejected:{" "}
                  {report.approvalHistory
                    ?.filter((item) => item.action === "Rejected")
                    .slice(-1)[0]?.comment || "See review history"}
                </p>
              )}

              {report.pendingRevision?.reviewStatus === "Rejected" && (
                <p className="mt-1 text-xs text-red-600">
                  Revision rejected:{" "}
                  {report.pendingRevision.reviewComment}
                </p>
              )}
            </div>
          </div>
        </td>

        <td className="px-5 py-4 text-gray-600">
          {displayedReport.category || "—"}
        </td>

        <td className="px-5 py-4 text-gray-600">
          {displayedReport.period || "—"}
        </td>

        <td className="px-5 py-4 text-gray-600">
          {displayedReport.publicationDate || "—"}
        </td>

        <td className="px-5 py-4">
          <div className="flex flex-col items-start gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                publicationStatus
              )}`}
            >
              {publicationStatus}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                approvalStatus
              )}`}
            >
              {approvalStatus}
            </span>
          </div>
        </td>

        <td className="px-5 py-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {displayedReport.fileUrl && (
              <a
                href={displayedReport.fileUrl}
                target="_blank"
                rel="noreferrer"
                title="View report"
                className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
              >
                <Eye size={17} />
              </a>
            )}

            {displayedReport.fileUrl && (
              <a
                href={displayedReport.fileUrl}
                download
                title="Download report"
                className="rounded-lg p-2 text-green-700 hover:bg-green-50"
              >
                <Download size={17} />
              </a>
            )}

            {!isPending && canEdit && (
              <button
                onClick={() => openEditForm(report)}
                title="Edit report"
                className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
              >
                <Pencil size={17} />
              </button>
            )}

            {!isPending && canChangePublication && (
              <button
                onClick={() => togglePublication(report)}
                disabled={actionLoading === report.id}
                title={
                  publicationStatus === "Published"
                    ? "Unpublish report"
                    : "Publish report"
                }
                className="rounded-lg p-2 text-green-700 hover:bg-green-50 disabled:opacity-50"
              >
                <Send size={17} />
              </button>
            )}

            {!isPending && canDelete && (
              <button
                onClick={() => deleteReport(report.id, report.title)}
                disabled={actionLoading === report.id}
                title="Delete report"
                className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={17} />
              </button>
            )}

            {isPending && canApprove && (
              <>
                <button
                  onClick={() => approveReport(report)}
                  disabled={actionLoading === report.id}
                  title="Approve report"
                  className="rounded-lg p-2 text-green-700 hover:bg-green-50 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                </button>

                <button
                  onClick={() => rejectReport(report)}
                  disabled={actionLoading === report.id}
                  title="Reject report"
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle size={18} />
                </button>
              </>
            )}

            {actionLoading === report.id && (
              <RefreshCw
                size={16}
                className="animate-spin text-gray-400"
              />
            )}
          </div>
        </td>
      </tr>
    );
  };

  // ==========================================
  // PAGE
  // ==========================================

  if (!canView) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">
          Access Restricted
        </h2>

        <p className="mt-2 text-sm text-red-600">
          You do not have permission to view Reports. Please contact the
          Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Reports Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage foundation reports, submissions and publications.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"
          >
            <Plus size={18} />
            Add Report
          </button>
        )}
      </div>

      {/* FEEDBACK */}

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="shrink-0"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <span>{success}</span>

          <button
            onClick={() => setSuccess("")}
            className="shrink-0"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Reports</p>
            <FileText className="text-green-700" size={22} />
          </div>

          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {reports.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Published Reports</p>

          <h2 className="mt-3 text-2xl font-bold text-green-700">
            {publishedCount}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Draft Reports</p>

          <h2 className="mt-3 text-2xl font-bold text-orange-600">
            {draftCount}
          </h2>
        </div>
      </div>

      {/* TABS */}

      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            activeTab === "all"
              ? "border-green-700 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          All Reports
        </button>

        {canApprove && (
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === "pending"
                ? "border-green-700 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Pending Approvals

            {pendingReports.length > 0 && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                {pendingReports.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* SEARCH AND FILTER */}

      {activeTab === "all" && (
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      )}

      {/* REPORTS TABLE */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Report</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Reporting Period</th>
                <th className="px-5 py-4">Publication Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {activeTab === "all" ? (
                loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      Loading reports...
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredReports.map((report) =>
                      renderReportRow(report)
                    )}

                    {filteredReports.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-5 py-10 text-center text-gray-500"
                        >
                          No reports found.
                        </td>
                      </tr>
                    )}
                  </>
                )
              ) : pendingLoading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    Loading pending reports...
                  </td>
                </tr>
              ) : (
                <>
                  {pendingReports.map((report) =>
                    renderReportRow(report, true)
                  )}

                  {pendingReports.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-10 text-center text-gray-500"
                      >
                        No reports are waiting for approval.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT FORM */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {editingReport ? "Edit Report" : "Add New Report"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {admin?.role === "Editor"
                    ? "Your changes will be submitted for approval."
                    : "Enter the report details below."}
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Report Title *
                </label>

                <input
                  type="text"
                  name="title"
                  required
                  maxLength={200}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter report title"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Category *
                  </label>

                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600"
                  >
                    <option>Annual Report</option>
                    <option>Programme Report</option>
                    <option>Financial Report</option>
                    <option>Research Report</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Reporting Period
                  </label>

                  <input
                    type="text"
                    name="period"
                    maxLength={100}
                    value={formData.period}
                    onChange={handleChange}
                    placeholder="e.g. January - December 2026"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Publication Date
                </label>

                <input
                  type="date"
                  name="publicationDate"
                  value={formData.publicationDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Report Description
                </label>

                <textarea
                  name="description"
                  rows="3"
                  maxLength={5000}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Write a short description of this report"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Document URL
                </label>

                <input
                  type="url"
                  name="fileUrl"
                  maxLength={2048}
                  value={formData.fileUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/report.pdf"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Add a link to the report document. File uploads will be
                  configured later.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingReport
                      ? "Save Changes"
                      : "Add Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
