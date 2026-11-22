
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  UserRound,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MessageSquareWarning,
} from "lucide-react";

const API_URL = "/admin/team";
const PENDING_API_URL = "/admin/team/pending";

const emptyForm = {
  name: "",
  position: "",
  imageUrl: "",
  shortDescription: "",
  biography: "",
};

export default function Team() {
  const { admin, loading: authLoading } = useAuth();

  const isSuperAdmin = admin?.role === "Super Admin";

  const hasPermission = (action) => {
    return (
      isSuperAdmin ||
      admin?.permissions?.team?.[action] === true
    );
  };

  const canView = hasPermission("view");
  const canCreate = hasPermission("create");
  const canEdit = hasPermission("edit");
  const canDelete = hasPermission("delete");
  const canPublish = hasPermission("publish");
  const canApprove = hasPermission("approve");

  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("members");

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
  const getRejectionComment = (member) => {
    const revision = member.pendingRevision;

    if (
      revision?.reviewStatus === "Rejected" &&
      revision?.reviewComment
    ) {
      return revision.reviewComment;
    }

    if (member.approvalStatus === "Rejected") {
      const history = Array.isArray(member.approvalHistory)
        ? member.approvalHistory
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

  // CHECK WHETHER A REVISION WAS REJECTED
  const isRevisionRejected = (member) => {
    return member.pendingRevision?.reviewStatus === "Rejected";
  };

  // CHECK WHETHER CONTENT IS WAITING FOR APPROVAL
  const isAwaitingApproval = (member) => {
    return (
      member.approvalStatus === "Pending" ||
      member.pendingRevision?.reviewStatus === "Pending"
    );
  };

  // CHECK WHETHER A MEMBER CAN BE PUBLISHED
  const canChangePublication = (member) => {
    return (
      canPublish &&
      member.approvalStatus === "Approved" &&
      member.pendingRevision?.reviewStatus !== "Pending"
    );
  };

  // LOAD TEAM MEMBERS
  const fetchTeamMembers = useCallback(async () => {
    if (!canView) {
      setTeamMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(API_URL);

      setTeamMembers(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load team members."
      );
    } finally {
      setLoading(false);
    }
  }, [canView]);

  // LOAD PENDING APPROVALS
  const fetchPendingMembers = useCallback(async () => {
    if (!canApprove) {
      setPendingMembers([]);
      return;
    }

    try {
      setLoadingPending(true);

      const response = await api.get(PENDING_API_URL);

      setPendingMembers(response.data.data || []);
    } catch (err) {
      setPendingMembers([]);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load pending Team approvals."
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

    fetchTeamMembers();
    fetchPendingMembers();
  }, [
    authLoading,
    canView,
    fetchTeamMembers,
    fetchPendingMembers,
  ]);

  // REFRESH BOTH LISTS
  const refreshLists = async () => {
    await Promise.all([
      fetchTeamMembers(),
      fetchPendingMembers(),
    ]);
  };

  // SEARCH AND FILTER
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      const matchesSearch =
        (member.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (member.position || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || member.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [teamMembers, search, filter]);

  // SUMMARY COUNTS
  const publishedCount = teamMembers.filter(
    (member) => member.status === "Published"
  ).length;

  const draftCount = teamMembers.filter(
    (member) => member.status !== "Published"
  ).length;

  // OPEN ADD FORM
  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // OPEN EDIT FORM
  const openEditForm = (member) => {
    setEditingId(member.id || member._id);

    setForm({
      name: member.name || "",
      position: member.position || "",
      imageUrl: member.imageUrl || "",
      shortDescription: member.shortDescription || "",
      biography: member.biography || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // CLOSE FORM
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  // HANDLE FORM INPUTS
  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  // CREATE OR UPDATE TEAM MEMBER
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        if (!canEdit) {
          setError("You do not have permission to edit Team members.");
          return;
        }

        await api.put(`${API_URL}/${editingId}`, form);
      } else {
        if (!canCreate) {
          setError("You do not have permission to add Team members.");
          return;
        }

        await api.post(API_URL, form);
      }

      closeForm();

      await refreshLists();

      setSuccess(
        editingId
          ? "Team member updated successfully. Changes have been submitted for approval where required."
          : "Team member submitted successfully. It will remain unpublished until approved and separately published."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save team member."
      );
    } finally {
      setSaving(false);
    }
  };

  // PUBLISH OR UNPUBLISH TEAM MEMBER
  const togglePublication = async (member) => {
    if (!canChangePublication(member)) {
      setError(
        "You cannot change publication status. Check your publishing permission and approval status."
      );
      return;
    }

    const newStatus =
      member.status === "Published" ? "Draft" : "Published";

    const confirmed = window.confirm(
      newStatus === "Published"
        ? `Publish ${member.name} on the public website?`
        : `Unpublish ${member.name} from the public website?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.put(
        `${API_URL}/${member.id || member._id}/publication`,
        {
          status: newStatus,
        }
      );

      await refreshLists();

      setSuccess(
        newStatus === "Published"
          ? `${member.name} has been published successfully.`
          : `${member.name} has been unpublished successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update publication status."
      );
    }
  };

  // DELETE TEAM MEMBER
  const handleDelete = async (member) => {
    if (!canDelete) {
      setError("You do not have permission to delete Team members.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`${API_URL}/${member.id || member._id}`);

      await refreshLists();

      setSuccess("Team member deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete team member."
      );
    }
  };

  // APPROVE TEAM SUBMISSION
  const handleApprove = async (member) => {
    if (!canApprove) {
      setError("You do not have permission to approve Team submissions.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to approve ${member.name}? Approval will not publish the content.`
    );

    if (!confirmed) return;

    const memberId = member.id || member._id;

    try {
      setReviewingId(memberId);
      setError("");
      setSuccess("");

      await api.put(`${API_URL}/${memberId}/approve`);

      await refreshLists();

      setActiveTab("pending");
      setSuccess(
        `${member.name} has been approved. It remains a draft until separately published by an authorized administrator.`
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

  // REJECT TEAM SUBMISSION
  const handleReject = async (member) => {
    if (!canApprove) {
      setError("You do not have permission to reject Team submissions.");
      return;
    }

    const comment = window.prompt(
      `Enter the reason for rejecting ${member.name}'s submission:`
    );

    if (comment === null) return;

    if (!comment.trim()) {
      setError("A rejection comment is required.");
      return;
    }

    const memberId = member.id || member._id;

    try {
      setReviewingId(memberId);
      setError("");
      setSuccess("");

      await api.put(`${API_URL}/${memberId}/reject`, {
        comment: comment.trim(),
      });

      await refreshLists();

      setActiveTab("pending");

      setSuccess(
        `${member.name}'s submission was rejected. The Editor can review your comment and resubmit.`
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
  const getProposedContent = (member) => {
    return member.pendingRevision || member;
  };

  // GET SUBMISSION TYPE
  const getSubmissionType = (member) => {
    return member.pendingRevision
      ? "Content Revision"
      : "New Team Member";
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
          You do not have permission to view Team Management. Please contact the Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADING */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Team Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the people and leadership team displayed on the foundation website.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
          >
            <Plus size={18} />
            Add Team Member
          </button>
        )}
      </div>

      {/* SUCCESS AND ERROR MESSAGES */}
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

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Members</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-800">
            {teamMembers.length}
          </h2>
          <Users className="mt-2 text-green-700" size={22} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Published</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-800">
            {publishedCount}
          </h2>
          <Eye className="mt-2 text-blue-700" size={22} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Drafts</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-800">
            {draftCount}
          </h2>
          <EyeOff className="mt-2 text-yellow-700" size={22} />
        </div>
      </div>

      {/* MANAGEMENT TABS */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("members");
            setError("");
            setSuccess("");
          }}
          className={`border-b-2 px-4 py-3 text-sm font-semibold ${
            activeTab === "members"
              ? "border-green-700 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          All Team Members
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

            {pendingMembers.length > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                {pendingMembers.length}
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

      {/* ALL TEAM MEMBERS TAB */}
      {activeTab === "members" && (
        <>
          {/* SEARCH AND FILTER */}
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search by name or position..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-600"
            >
              <option value="All">All Members</option>
              <option value="Published">Published</option>
              <option value="Draft">Drafts</option>
            </select>
          </div>

          {/* TEAM MEMBERS GRID */}
          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
              Loading team members...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <Users className="mx-auto text-gray-400" size={40} />

              <h3 className="mt-3 font-semibold text-gray-700">
                No team members found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try another search or add a new team member if you have permission.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredMembers.map((member) => {
                const rejectionComment = getRejectionComment(member);
                const rejectedRevision = isRevisionRejected(member);
                const pendingApproval = isAwaitingApproval(member);

                return (
                  <div
                    key={member.id || member._id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                  >
                    {/* MEMBER IMAGE */}
                    <div className="relative flex h-56 items-center justify-center overflow-hidden bg-green-50">
                      <UserRound size={64} className="text-green-200" />

                      {member.imageUrl && (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      )}

                      <span
                        className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                          member.status === "Published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {member.status || "Draft"}
                      </span>

                      {rejectedRevision ? (
                        <span className="absolute left-3 top-3 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          Changes Requested
                        </span>
                      ) : member.pendingRevision?.reviewStatus === "Pending" ? (
                        <span className="absolute left-3 top-3 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                          Revision Pending
                        </span>
                      ) : member.approvalStatus === "Pending" ? (
                        <span className="absolute left-3 top-3 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                          Awaiting Approval
                        </span>
                      ) : member.approvalStatus === "Rejected" ? (
                        <span className="absolute left-3 top-3 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          Rejected
                        </span>
                      ) : null}
                    </div>

                    {/* MEMBER DETAILS */}
                    <div className="space-y-3 p-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {member.name}
                        </h3>

                        <p className="mt-1 text-sm font-medium text-green-700">
                          {member.position}
                        </p>

                        <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                          {member.shortDescription}
                        </p>
                      </div>

                      {/* REJECTION FEEDBACK */}
                      {rejectionComment && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-800">
                            <MessageSquareWarning size={17} />
                            Administrator's Feedback
                          </div>

                          <p className="whitespace-pre-line text-sm text-red-700">
                            {rejectionComment}
                          </p>

                          <p className="mt-2 text-xs font-medium text-red-600">
                            Please correct the submission and save your changes to resubmit.
                          </p>
                        </div>
                      )}

                      {/* ACTIONS */}
                      {(canEdit ||
                        canDelete ||
                        canChangePublication(member)) && (
                        <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3">
                          {canEdit && (
                            <button
                              onClick={() => openEditForm(member)}
                              className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
                            >
                              <Pencil size={16} />
                              Edit
                            </button>
                          )}

                          {canChangePublication(member) && (
                            <button
                              onClick={() => togglePublication(member)}
                              className={`inline-flex items-center gap-2 text-sm font-medium ${
                                member.status === "Published"
                                  ? "text-yellow-700 hover:text-yellow-900"
                                  : "text-green-700 hover:text-green-900"
                              }`}
                            >
                              {member.status === "Published" ? (
                                <>
                                  <EyeOff size={16} />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <Eye size={16} />
                                  Publish
                                </>
                              )}
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleDelete(member)}
                              className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          )}
                        </div>
                      )}

                      {pendingApproval && (
                        <p className="border-t border-gray-100 pt-3 text-xs text-orange-700">
                          This content is awaiting Administrator approval. Publication actions are unavailable until review is complete.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* PENDING APPROVALS TAB */}
      {activeTab === "pending" && canApprove && (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">
              Team Approval Queue
            </h3>

            <p className="mt-1 text-sm text-blue-800">
              Review submissions from Editors. Approving content does not publish it. Publishing requires separate permission.
            </p>
          </div>

          {loadingPending ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
              Loading pending approvals...
            </div>
          ) : pendingMembers.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <CheckCircle className="mx-auto text-green-500" size={42} />

              <h3 className="mt-3 font-semibold text-gray-700">
                No Pending Approvals
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                There are currently no Team submissions waiting for review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {pendingMembers.map((member) => {
                const proposed = getProposedContent(member);
                const memberId = member.id || member._id;
                const isReviewing = reviewingId === memberId;

                return (
                  <div
                    key={memberId}
                    className="overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50 px-5 py-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-orange-800">
                        <Clock size={17} />
                        Awaiting Review
                      </div>

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                        {getSubmissionType(member)}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex h-36 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-green-50 sm:w-32">
                          {proposed.imageUrl ? (
                            <img
                              src={proposed.imageUrl}
                              alt={proposed.name || member.name}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <UserRound size={48} className="text-green-200" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-2">
                          <h3 className="text-lg font-bold text-gray-800">
                            {proposed.name || member.name}
                          </h3>

                          <p className="font-medium text-green-700">
                            {proposed.position || member.position}
                          </p>

                          <p className="text-sm text-gray-600">
                            {proposed.shortDescription || member.shortDescription}
                          </p>

                          <p className="text-xs text-gray-500">
                            Publication status:{" "}
                            <strong>
                              {member.pendingRevision
                                ? member.status
                                : proposed.status || member.status || "Draft"}
                            </strong>
                          </p>
                        </div>
                      </div>

                      {proposed.biography && (
                        <div className="mt-4 rounded-lg bg-gray-50 p-3">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Biography
                          </p>

                          <p className="whitespace-pre-line text-sm text-gray-700">
                            {proposed.biography}
                          </p>
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                        <button
                          onClick={() => handleApprove(member)}
                          disabled={isReviewing}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          {isReviewing ? "Processing..." : "Approve"}
                        </button>

                        <button
                          onClick={() => handleReject(member)}
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

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editingId ? "Edit Team Member" : "Add Team Member"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the team member's information below.
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
              {/* REJECTION FEEDBACK */}
              {editingId &&
                (() => {
                  const member = teamMembers.find(
                    (item) =>
                      (item.id || item._id) === editingId
                  );

                  const comment = member
                    ? getRejectionComment(member)
                    : "";

                  return comment ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="mb-2 flex items-center gap-2 font-semibold text-red-800">
                        <MessageSquareWarning size={18} />
                        Administrator's Rejection Comment
                      </div>

                      <p className="whitespace-pre-line text-sm text-red-700">
                        {comment}
                      </p>

                      <p className="mt-2 text-xs text-red-600">
                        Correct the requested changes and save this form to resubmit.
                      </p>
                    </div>
                  ) : null;
                })()}

              {/* FULL NAME */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600"
                />
              </div>

              {/* POSITION */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Position / Title
                </label>

                <input
                  type="text"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Founder, Director, Treasurer"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600"
                />
              </div>

              {/* IMAGE URL */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Photograph URL
                </label>

                <input
                  type="url"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Paste a publicly accessible photograph link. This field is optional.
                </p>
              </div>

              {/* IMAGE PREVIEW */}
              {form.imageUrl && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Photograph Preview
                  </p>

                  <img
                    src={form.imageUrl}
                    alt="Team member preview"
                    className="h-48 w-40 rounded-lg border border-gray-200 object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* SHORT DESCRIPTION */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Short Description
                </label>

                <textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  required
                  rows="3"
                  maxLength="300"
                  placeholder="Write a short introduction displayed on the team card."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Maximum 300 characters.
                </p>
              </div>

              {/* FULL BIOGRAPHY */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Biography
                </label>

                <textarea
                  name="biography"
                  value={form.biography}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Enter the full biography shown when visitors click Read More."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600"
                />
              </div>

              {/* PUBLICATION INFORMATION */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-900">
                  Publication is managed separately
                </p>

                <p className="mt-1 text-xs text-blue-800">
                  Saving this form only creates or updates content. It does not publish the team member. Content requiring review must first be approved, and an authorized administrator must publish it separately.
                </p>
              </div>

              {/* FORM BUTTONS */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
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
                      ? "Save Changes / Resubmit"
                      : "Add Team Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
