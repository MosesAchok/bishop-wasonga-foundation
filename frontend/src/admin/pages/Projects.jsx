
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  MapPin,
  CalendarDays,
  FolderKanban,
  Image,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  MessageSquareWarning,
} from "lucide-react";

const API_URL = "/admin/projects";
const PENDING_API_URL = "/admin/projects/pending";

const emptyForm = {
  title: "",
  category: "",
  location: "",
  startDate: "",
  image: "",
  status: "Planning",
  description: "",
};

const statusStyle = {
  Planning: "bg-blue-100 text-blue-700",
  Ongoing: "bg-green-100 text-green-700",
  Completed: "bg-gray-100 text-gray-600",
  "On Hold": "bg-yellow-100 text-yellow-700",
};

export default function Projects() {
  const { admin, loading: authLoading } = useAuth();

  const isSuperAdmin = admin?.role === "Super Admin";

  const hasPermission = (action) =>
    isSuperAdmin ||
    admin?.permissions?.projects?.[action] === true;

  const canView = hasPermission("view");
  const canCreate = hasPermission("create");
  const canEdit = hasPermission("edit");
  const canDelete = hasPermission("delete");
  const canPublish = hasPermission("publish");
  const canApprove = hasPermission("approve");

  const [projects, setProjects] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("projects");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [loadingPending, setLoadingPending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // REJECTION COMMENT
  const getRejectionComment = (project) => {
    const revision = project.pendingRevision;

    if (
      revision?.reviewStatus === "Rejected" &&
      revision?.reviewComment
    ) {
      return revision.reviewComment;
    }

    if (project.approvalStatus === "Rejected") {
      const history = Array.isArray(project.approvalHistory)
        ? project.approvalHistory
        : [];

      const rejection = [...history]
        .reverse()
        .find(
          (item) =>
            item.action === "Rejected" &&
            item.comment?.trim()
        );

      return rejection?.comment || "";
    }

    return "";
  };

  // APPROVAL STATE
  const isAwaitingApproval = (project) =>
    project.approvalStatus === "Pending" ||
    project.pendingRevision?.reviewStatus === "Pending";

  // PUBLICATION PERMISSION
  const canChangePublication = (project) =>
    canPublish &&
    project.approvalStatus === "Approved" &&
    project.pendingRevision?.reviewStatus !== "Pending";

  // FETCH PROJECTS
  const fetchProjects = useCallback(async () => {
    if (!canView) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(API_URL);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Unable to load projects."
        );
      }

      setProjects(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  }, [canView]);

  // FETCH PENDING PROJECTS
  const fetchPendingProjects = useCallback(async () => {
    if (!canApprove) {
      setPendingProjects([]);
      return;
    }

    try {
      setLoadingPending(true);

      const response = await api.get(PENDING_API_URL);

      setPendingProjects(response.data.data || []);
    } catch (err) {
      setPendingProjects([]);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load pending project approvals."
      );
    } finally {
      setLoadingPending(false);
    }
  }, [canApprove]);

  useEffect(() => {
    if (authLoading) return;

    if (!canView) {
      setLoading(false);
      return;
    }

    fetchProjects();
    fetchPendingProjects();
  }, [
    authLoading,
    canView,
    fetchProjects,
    fetchPendingProjects,
  ]);

  const refreshLists = async () => {
    await Promise.all([
      fetchProjects(),
      fetchPendingProjects(),
    ]);
  };

  // SEARCH
  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      `${project.title || ""} ${project.category || ""} ${project.location || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [projects, search]);

  // SUMMARY
  const ongoingCount = projects.filter(
    (project) => project.status === "Ongoing"
  ).length;

  const completedCount = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  // FORM HELPERS
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const startEdit = (project) => {
    setEditingId(project.id || project._id);

    setForm({
      title: project.title || "",
      category: project.category || "",
      location: project.location || "",
      startDate: project.startDate
        ? String(project.startDate).slice(0, 10)
        : "",
      image: project.image || "",
      status: project.status || "Planning",
      description: project.description || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  // CREATE OR UPDATE
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
          response.data.message || "Unable to save project."
        );
      }

      closeForm();
      await refreshLists();

      setSuccess(
        isEditing
          ? "Project updated successfully. Changes have been submitted for approval where required."
          : "Project added successfully. It remains a draft until approved and separately published."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save project."
      );
    } finally {
      setSaving(false);
    }
  };

  // PUBLISH OR UNPUBLISH
  const togglePublication = async (project) => {
    if (!canChangePublication(project)) {
      setError(
        "You cannot change this project's publication status. Check your publishing permission and approval status."
      );
      return;
    }

    const newPublicationStatus =
      project.publicationStatus === "Published"
        ? "Draft"
        : "Published";

    const confirmed = window.confirm(
      newPublicationStatus === "Published"
        ? `Publish "${project.title}" on the public website?`
        : `Unpublish "${project.title}" from the public website?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.put(
        `${API_URL}/${project.id || project._id}/publication`,
        {
          publicationStatus: newPublicationStatus,
        }
      );

      await refreshLists();

      setSuccess(
        newPublicationStatus === "Published"
          ? "Project published successfully."
          : "Project unpublished successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update project publication status."
      );
    }
  };

  // DELETE
  const deleteProject = async (project) => {
    if (!canDelete) {
      setError("You do not have permission to delete projects.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await api.delete(
        `${API_URL}/${project.id || project._id}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Unable to delete project."
        );
      }

      await refreshLists();

      setSuccess("Project deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete project."
      );
    }
  };

  // APPROVE
  const handleApprove = async (project) => {
    if (!canApprove) return;

    const confirmed = window.confirm(
      `Approve "${project.title}"? Approval does not publish the project.`
    );

    if (!confirmed) return;

    const projectId = project.id || project._id;

    try {
      setReviewingId(projectId);
      setError("");
      setSuccess("");

      await api.put(`${API_URL}/${projectId}/approve`);

      await refreshLists();

      setActiveTab("pending");

      setSuccess(
        `"${project.title}" approved. Its publication status remains separate and must be changed by an authorized publisher.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to approve project."
      );
    } finally {
      setReviewingId(null);
    }
  };

  // REJECT
  const handleReject = async (project) => {
    if (!canApprove) return;

    const comment = window.prompt(
      `Enter the reason for rejecting "${project.title}":`
    );

    if (comment === null) return;

    if (!comment.trim()) {
      setError("A rejection comment is required.");
      return;
    }

    const projectId = project.id || project._id;

    try {
      setReviewingId(projectId);
      setError("");
      setSuccess("");

      await api.put(`${API_URL}/${projectId}/reject`, {
        comment: comment.trim(),
      });

      await refreshLists();

      setActiveTab("pending");

      setSuccess(
        `"${project.title}" was rejected. The Editor can review the comment and resubmit.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to reject project."
      );
    } finally {
      setReviewingId(null);
    }
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
          You do not have permission to view Projects. Please contact the Super Admin.
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
            Projects Management
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor foundation projects.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
          >
            <Plus size={18} />
            Add Project
          </button>
        )}
      </div>

      {/* MESSAGES */}
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

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Projects</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-800">
            {projects.length}
          </h3>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Ongoing Projects</p>
          <h3 className="mt-2 text-3xl font-bold text-green-700">
            {ongoingCount}
          </h3>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Completed Projects</p>
          <h3 className="mt-2 text-3xl font-bold text-blue-700">
            {completedCount}
          </h3>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("projects");
            setError("");
            setSuccess("");
          }}
          className={`border-b-2 px-4 py-3 text-sm font-semibold ${
            activeTab === "projects"
              ? "border-green-700 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          All Projects
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

            {pendingProjects.length > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                {pendingProjects.length}
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

      {/* ALL PROJECTS */}
      {activeTab === "projects" && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-gray-800">
                All Projects
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                View and manage foundation projects.
              </p>
            </div>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-600 sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Project</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Start Date</th>
                  <th className="px-5 py-4">Progress</th>
                  <th className="px-5 py-4">Publication</th>
                  <th className="px-5 py-4">Approval</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-gray-500">
                      Loading projects...
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => {
                    const pending = isAwaitingApproval(project);
                    const rejectionComment =
                      getRejectionComment(project);

                    return (
                      <tr
                        key={project.id || project._id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-2 text-green-700">
                              <FolderKanban size={20} />
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800">
                                {project.title}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {project.category}
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
                          <span className="flex items-center gap-2">
                            <MapPin size={15} />
                            {project.location}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          <span className="flex items-center gap-2">
                            <CalendarDays size={15} />
                            {project.startDate
                              ? String(project.startDate).slice(0, 10)
                              : "Not set"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyle[project.status] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              project.publicationStatus === "Published"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {project.publicationStatus || "Draft"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              pending
                                ? "bg-orange-100 text-orange-700"
                                : project.approvalStatus === "Rejected" ||
                                    project.pendingRevision?.reviewStatus === "Rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {project.pendingRevision?.reviewStatus === "Pending"
                              ? "Revision Pending"
                              : project.pendingRevision?.reviewStatus === "Rejected"
                                ? "Changes Requested"
                                : project.approvalStatus || "Approved"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {canEdit && (
                              <button
                                onClick={() => startEdit(project)}
                                className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                title="Edit project"
                              >
                                <Pencil size={17} />
                              </button>
                            )}

                            {canChangePublication(project) && (
                              <button
                                onClick={() => togglePublication(project)}
                                className={`rounded-lg p-2 ${
                                  project.publicationStatus === "Published"
                                    ? "text-yellow-700 hover:bg-yellow-50"
                                    : "text-green-700 hover:bg-green-50"
                                }`}
                                title={
                                  project.publicationStatus === "Published"
                                    ? "Unpublish project"
                                    : "Publish project"
                                }
                              >
                                {project.publicationStatus === "Published" ? (
                                  <EyeOff size={17} />
                                ) : (
                                  <Eye size={17} />
                                )}
                              </button>
                            )}

                            {canDelete && (
                              <button
                                onClick={() => deleteProject(project)}
                                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                title="Delete project"
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

                {!loading && filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-gray-500">
                      No projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PENDING APPROVALS */}
      {activeTab === "pending" && canApprove && (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">
              Projects Approval Queue
            </h3>

            <p className="mt-1 text-sm text-blue-800">
              Review new project submissions and proposed changes. Approval does not publish a project. Publication is a separate permission.
            </p>
          </div>

          {loadingPending ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
              Loading pending approvals...
            </div>
          ) : pendingProjects.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <CheckCircle
                className="mx-auto text-green-500"
                size={42}
              />

              <h3 className="mt-3 font-semibold text-gray-700">
                No Pending Approvals
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                There are currently no projects waiting for review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {pendingProjects.map((project) => {
                const proposed = project.pendingRevision || project;
                const projectId = project.id || project._id;
                const isReviewing = reviewingId === projectId;

                return (
                  <div
                    key={projectId}
                    className="overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50 px-5 py-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-orange-800">
                        <Clock size={17} />
                        Awaiting Review
                      </div>

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                        {project.pendingRevision
                          ? "Content Revision"
                          : "New Project"}
                      </span>
                    </div>

                    <div className="space-y-3 p-5">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-green-100 p-3 text-green-700">
                          <FolderKanban size={24} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-gray-800">
                            {proposed.title || project.title}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-green-700">
                            {proposed.category || project.category}
                          </p>
                        </div>
                      </div>

                      {proposed.image && (
                        <img
                          src={proposed.image}
                          alt={proposed.title || project.title}
                          className="h-40 w-full rounded-lg object-cover"
                        />
                      )}

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="mb-1 text-xs font-semibold text-gray-500">
                            Location
                          </p>
                          <p className="text-sm text-gray-800">
                            {proposed.location || project.location || "Not provided"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="mb-1 text-xs font-semibold text-gray-500">
                            Project Progress
                          </p>
                          <p className="text-sm text-gray-800">
                            {proposed.status || project.status || "Planning"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Project Description
                        </p>

                        <p className="whitespace-pre-line text-sm text-gray-700">
                          {proposed.description || project.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                        <button
                          onClick={() => handleApprove(project)}
                          disabled={isReviewing}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          {isReviewing ? "Processing..." : "Approve"}
                        </button>

                        <button
                          onClick={() => handleReject(project)}
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
                  {editingId ? "Edit Project" : "Add New Project"}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Enter the project details below.
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
                  Project Name
                </label>

                <input
                  required
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    Location
                  </label>

                  <input
                    required
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Project location"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Project Progress
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-600"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Project Image URL
                </label>

                <div className="relative">
                  <Image
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="url"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://example.com/project-image.jpg"
                    className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-green-600"
                  />
                </div>

                {form.image && (
                  <img
                    src={form.image}
                    alt="Project preview"
                    className="mt-3 h-36 w-full rounded-lg object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    onLoad={(event) => {
                      event.currentTarget.style.display = "block";
                    }}
                  />
                )}

                <p className="mt-1 text-xs text-gray-500">
                  Enter a publicly accessible image URL. Image uploads are not enabled yet.
                </p>
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
                  placeholder="Describe the project..."
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-900">
                  Progress and publication are separate
                </p>

                <p className="mt-1 text-xs text-blue-800">
                  Project progress describes the project's stage. Saving this form does not publish it. Content requiring review must first be approved, and publication must be performed separately by an authorized administrator.
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
                  className="rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes / Resubmit"
                      : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
