
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  FolderKanban,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  MessageSquareWarning,
} from "lucide-react";

const API_URL = "/admin/programs";
const PENDING_API_URL = "/admin/programs/pending";

const emptyForm = {
  title: "",
  category: "",
  description: "",
};

export default function Programs() {
  const { admin, loading: authLoading } = useAuth();

  const isSuperAdmin = admin?.role === "Super Admin";

  const hasPermission = (action) => {
    return (
      isSuperAdmin ||
      admin?.permissions?.programs?.[action] === true
    );
  };

  const canView = hasPermission("view");
  const canCreate = hasPermission("create");
  const canEdit = hasPermission("edit");
  const canDelete = hasPermission("delete");
  const canPublish = hasPermission("publish");
  const canApprove = hasPermission("approve");

  const [programs, setPrograms] = useState([]);
  const [pendingPrograms, setPendingPrograms] = useState([]);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("programs");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [loadingPending, setLoadingPending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // GET REJECTION COMMENT ONLY WHILE CORRECTION IS REQUIRED
  const getRejectionComment = (program) => {
    const revision = program.pendingRevision;

    if (
      revision?.reviewStatus === "Rejected" &&
      revision?.reviewComment
    ) {
      return revision.reviewComment;
    }

    if (program.approvalStatus === "Rejected") {
      const history = Array.isArray(program.approvalHistory)
        ? program.approvalHistory
        : [];

      const rejection = [...history]
        .reverse()
        .find(
          (item) =>
            item.action === "Rejected" &&
            item.comment &&
            item.comment.trim()
        );

      return rejection?.comment || "";
    }

    return "";
  };

  // CHECK WHETHER A PROGRAM IS WAITING FOR APPROVAL
  const isAwaitingApproval = (program) => {
    return (
      program.approvalStatus === "Pending" ||
      program.pendingRevision?.reviewStatus === "Pending"
    );
  };

  // CHECK WHETHER A PROGRAM CAN BE PUBLISHED OR UNPUBLISHED
  const canChangePublication = (program) => {
    return (
      canPublish &&
      program.approvalStatus === "Approved" &&
      program.pendingRevision?.reviewStatus !== "Pending"
    );
  };

  // LOAD PROGRAMS
  const fetchPrograms = useCallback(async () => {
    if (!canView) {
      setPrograms([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(API_URL);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to load programs."
        );
      }

      setPrograms(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to connect to the backend server."
      );
    } finally {
      setLoading(false);
    }
  }, [canView]);

  // LOAD PENDING APPROVALS
  const fetchPendingPrograms = useCallback(async () => {
    if (!canApprove) {
      setPendingPrograms([]);
      return;
    }

    try {
      setLoadingPending(true);

      const response = await api.get(PENDING_API_URL);

      setPendingPrograms(response.data.data || []);
    } catch (err) {
      setPendingPrograms([]);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load pending Program approvals."
      );
    } finally {
      setLoadingPending(false);
    }
  }, [canApprove]);

  // INITIAL LOAD
  useEffect(() => {
    if (authLoading) return;

    if (!canView) {
      setLoading(false);
      return;
    }

    fetchPrograms();
    fetchPendingPrograms();
  }, [
    authLoading,
    canView,
    fetchPrograms,
    fetchPendingPrograms,
  ]);

  // REFRESH BOTH LISTS
  const refreshLists = async () => {
    await Promise.all([
      fetchPrograms(),
      fetchPendingPrograms(),
    ]);
  };

  // SEARCH PROGRAMS
  const filteredPrograms = useMemo(() => {
    return programs.filter((program) =>
      `${program.title || ""} ${program.category || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [programs, search]);

  // SUMMARY COUNTS
  const activeCount = programs.filter(
    (program) => program.status === "Active"
  ).length;

  const inactiveCount = programs.filter(
    (program) => program.status !== "Active"
  ).length;

  // RESET FORM
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  // OPEN ADD FORM
  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // OPEN EDIT FORM
  const startEdit = (program) => {
    setEditingId(program.id || program._id);

    setForm({
      title: program.title || "",
      category: program.category || "",
      description: program.description || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // HANDLE FORM INPUTS
  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  // CREATE OR UPDATE PROGRAM
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const isEditing = editingId !== null;

      const response = isEditing
        ? await api.put(`${API_URL}/${editingId}`, form)
        : await api.post(API_URL, form);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Unable to save program."
        );
      }

      closeForm();

      await refreshLists();

      setSuccess(
        isEditing
          ? "Program updated successfully. Changes have been submitted for approval where required."
          : "Program created successfully. It will remain inactive until approved and separately activated."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // ACTIVATE OR DEACTIVATE PROGRAM
  const togglePublication = async (program) => {
    if (!canChangePublication(program)) {
      setError(
        "You cannot change this program's publication status. Check your publishing permission and approval status."
      );
      return;
    }

    const newStatus =
      program.status === "Active" ? "Inactive" : "Active";

    const confirmed = window.confirm(
      newStatus === "Active"
        ? `Activate "${program.title}" on the public website?`
        : `Deactivate "${program.title}" on the public website?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.put(
        `${API_URL}/${program.id || program._id}/publication`,
        {
          status: newStatus,
        }
      );

      await refreshLists();

      setSuccess(
        newStatus === "Active"
          ? `${program.title} has been activated successfully.`
          : `${program.title} has been deactivated successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update program publication status."
      );
    }
  };

  // DELETE PROGRAM
  const deleteProgram = async (program) => {
    if (!canDelete) {
      setError("You do not have permission to delete programs.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${program.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await api.delete(
        `${API_URL}/${program.id || program._id}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Unable to delete program."
        );
      }

      await refreshLists();

      setSuccess("Program deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong."
      );
    }
  };

  // APPROVE PROGRAM
  const handleApprove = async (program) => {
    if (!canApprove) {
      setError("You do not have permission to approve programs.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to approve "${program.title}"? Approval will not activate the program.`
    );

    if (!confirmed) return;

    const programId = program.id || program._id;

    try {
      setReviewingId(programId);
      setError("");
      setSuccess("");

      await api.put(`${API_URL}/${programId}/approve`);

      await refreshLists();

      setActiveTab("pending");

      setSuccess(
        `"${program.title}" has been approved. It remains inactive until separately activated by an authorized administrator.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to approve this submission."
      );
    } finally {
      setReviewingId(null);
    }
  };

  // REJECT PROGRAM
  const handleReject = async (program) => {
    if (!canApprove) {
      setError("You do not have permission to reject programs.");
      return;
    }

    const comment = window.prompt(
      `Enter the reason for rejecting "${program.title}":`
    );

    if (comment === null) return;

    if (!comment.trim()) {
      setError("A rejection comment is required.");
      return;
    }

    const programId = program.id || program._id;

    try {
      setReviewingId(programId);
      setError("");
      setSuccess("");

      await api.put(`${API_URL}/${programId}/reject`, {
        comment: comment.trim(),
      });

      await refreshLists();

      setActiveTab("pending");

      setSuccess(
        `"${program.title}" was rejected. The Editor can review the comment and resubmit.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to reject this submission."
      );
    } finally {
      setReviewingId(null);
    }
  };

  // GET PROPOSED CONTENT
  const getProposedContent = (program) => {
    return program.pendingRevision || program;
  };

  // GET SUBMISSION TYPE
  const getSubmissionType = (program) => {
    return program.pendingRevision
      ? "Content Revision"
      : "New Program";
  };

  if (authLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
        Loading administrator permissions...
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Access Restricted
        </h2>
        <p className="mt-2 text-sm text-red-700">
          You do not have permission to view Programs. Please contact the Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADING */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Programs Management
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create, update and manage foundation programs.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
          >
            <Plus size={18} />
            Add Program
          </button>
        )}
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {success}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Programs</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-800">
            {programs.length}
          </h3>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Programs</p>
          <h3 className="mt-2 text-3xl font-bold text-green-700">
            {activeCount}
          </h3>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive Programs</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-500">
            {inactiveCount}
          </h3>
        </div>
      </div>

      {/* MANAGEMENT TABS */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("programs");
            setError("");
            setSuccess("");
          }}
          className={`border-b-2 px-4 py-3 text-sm font-semibold ${
            activeTab === "programs"
              ? "border-green-700 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          All Programs
        </button>

        {canApprove && (
          <button
            onClick={() => {
              setActiveTab("pending");
              setError("");
              setSuccess("");
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
              activeTab === "pending"
                ? "border-green-700 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Clock size={16} />
            Pending Approvals

            {pendingPrograms.length > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                {pendingPrograms.length}
              </span>
            )}
          </button>
        )}

        <button
          onClick={refreshLists}
          disabled={loading || loadingPending}
          className="ml-auto inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-green-700 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={
              loading || loadingPending ? "animate-spin" : ""
            }
          />
          Refresh
        </button>
      </div>

      {/* ALL PROGRAMS TAB */}
      {activeTab === "programs" && (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-gray-800">
                  All Programs
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Manage the programs displayed on your website.
                </p>
              </div>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search programs..."
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-600 sm:w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Program</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Approval</th>
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
                        Loading programs...
                      </td>
                    </tr>
                  ) : (
                    filteredPrograms.map((program) => {
                      const pending = isAwaitingApproval(program);
                      const rejectionComment =
                        getRejectionComment(program);

                      return (
                        <tr
                          key={program.id || program._id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-green-100 p-2 text-green-700">
                                <FolderKanban size={20} />
                              </div>

                              <div>
                                <p className="font-semibold text-gray-800">
                                  {program.title}
                                </p>

                                <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                                  {program.description}
                                </p>
                              </div>
                            </div>

                            {rejectionComment && (
                              <div className="mt-3 max-w-md rounded-lg border border-red-200 bg-red-50 p-3">
                                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-red-800">
                                  <MessageSquareWarning size={15} />
                                  Administrator's Feedback
                                </div>

                                <p className="whitespace-pre-line text-xs text-red-700">
                                  {rejectionComment}
                                </p>
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {program.category}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                program.status === "Active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {program.status || "Inactive"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                pending
                                  ? "bg-orange-100 text-orange-700"
                                  : program.approvalStatus === "Rejected" ||
                                      program.pendingRevision?.reviewStatus === "Rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {program.pendingRevision?.reviewStatus === "Pending"
                                ? "Revision Pending"
                                : program.pendingRevision?.reviewStatus === "Rejected"
                                  ? "Changes Requested"
                                  : program.approvalStatus || "Approved"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              {canEdit && (
                                <button
                                  onClick={() => startEdit(program)}
                                  className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                  title="Edit program"
                                >
                                  <Pencil size={17} />
                                </button>
                              )}

                              {canChangePublication(program) && (
                                <button
                                  onClick={() => togglePublication(program)}
                                  className={`rounded-lg p-2 ${
                                    program.status === "Active"
                                      ? "text-yellow-700 hover:bg-yellow-50"
                                      : "text-green-700 hover:bg-green-50"
                                  }`}
                                  title={
                                    program.status === "Active"
                                      ? "Deactivate program"
                                      : "Activate program"
                                  }
                                >
                                  {program.status === "Active" ? (
                                    <EyeOff size={17} />
                                  ) : (
                                    <Eye size={17} />
                                  )}
                                </button>
                              )}

                              {canDelete && (
                                <button
                                  onClick={() => deleteProgram(program)}
                                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                  title="Delete program"
                                >
                                  <Trash2 size={17} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {!loading && filteredPrograms.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-12 text-center text-gray-500"
                      >
                        No programs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* PENDING APPROVALS TAB */}
      {activeTab === "pending" && canApprove && (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">
              Programs Approval Queue
            </h3>

            <p className="mt-1 text-sm text-blue-800">
              Review program submissions and proposed changes. Approval does not activate a program; activation is a separate permission.
            </p>
          </div>

          {loadingPending ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
              Loading pending approvals...
            </div>
          ) : pendingPrograms.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <CheckCircle
                className="mx-auto text-green-500"
                size={42}
              />

              <h3 className="mt-3 font-semibold text-gray-700">
                No Pending Approvals
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                There are currently no Program submissions waiting for review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {pendingPrograms.map((program) => {
                const proposed = getProposedContent(program);
                const programId = program.id || program._id;
                const isReviewing = reviewingId === programId;

                return (
                  <div
                    key={programId}
                    className="overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50 px-5 py-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-orange-800">
                        <Clock size={17} />
                        Awaiting Review
                      </div>

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                        {getSubmissionType(program)}
                      </span>
                    </div>

                    <div className="space-y-3 p-5">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-green-100 p-3 text-green-700">
                          <FolderKanban size={24} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-gray-800">
                            {proposed.title || program.title}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-green-700">
                            {proposed.category || program.category}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Program Description
                        </p>

                        <p className="whitespace-pre-line text-sm text-gray-700">
                          {proposed.description || program.description}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500">
                        Current program status:{" "}
                        <strong>
                          {program.pendingRevision
                            ? program.status || "Inactive"
                            : proposed.status || program.status || "Inactive"}
                        </strong>
                      </p>

                      <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                        <button
                          onClick={() => handleApprove(program)}
                          disabled={isReviewing}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          {isReviewing ? "Processing..." : "Approve"}
                        </button>

                        <button
                          onClick={() => handleReject(program)}
                          disabled={isReviewing}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {editingId ? "Edit Program" : "Add New Program"}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Enter the program information below.
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

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Program Name
                </label>

                <input
                  required
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter program name"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>

                <select
                  required
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-600"
                >
                  <option value="">Select category</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="Environment">Environment</option>
                  <option value="Community Development">
                    Community Development
                  </option>
                  <option value="Economic Empowerment">
                    Economic Empowerment
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  required
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this program..."
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-900">
                  Activation is managed separately
                </p>

                <p className="mt-1 text-xs text-blue-800">
                  Saving this form only creates or updates program content. It does not activate the program. Content requiring review must first be approved, and an authorized administrator must activate it separately.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
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
                  className="rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes / Resubmit"
                      : "Add Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
