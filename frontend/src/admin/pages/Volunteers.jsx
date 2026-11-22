
import { useMemo, useState, useEffect } from "react";
import api from "../../services/api";

import {
  Users,
  Search,
  Eye,
  Trash2,
  X,
  Clock,
  UserCheck,
  RefreshCw,
} from "lucide-react";

const API_URL = "/admin/volunteers";

export default function Volunteers() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingId, setSavingId] = useState(null);

  // FETCH VOLUNTEER APPLICATIONS
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(API_URL);

      setApplications(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load volunteer applications. Please check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // SEARCH AND FILTER
  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (application.name || "").toLowerCase().includes(searchText) ||
        (application.email || "").toLowerCase().includes(searchText) ||
        (application.interest || "").toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  // SUMMARY COUNTS
  const pendingCount = applications.filter(
    (application) => application.status === "Pending"
  ).length;

  const reviewedCount = applications.filter(
    (application) => application.status === "Reviewed"
  ).length;

  const approvedCount = applications.filter(
    (application) => application.status === "Approved"
  ).length;

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // UPDATE APPLICATION STATUS
  const updateStatus = async (id, status) => {
    try {
      setSavingId(id);
      setError("");
      setSuccess("");

      const response = await api.put(`${API_URL}/${id}`, {
        status,
      });

      const updatedApplication = response.data.data;

      setApplications((previous) =>
        previous.map((application) =>
          String(application.id) === String(id)
            ? { ...application, ...updatedApplication, status }
            : application
        )
      );

      setSelectedApplication((previous) =>
        previous && String(previous.id) === String(id)
          ? { ...previous, ...updatedApplication, status }
          : previous
      );

      setSuccess(`Application status updated to ${status}.`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update application status."
      );
    } finally {
      setSavingId(null);
    }
  };

  // DELETE APPLICATION
  const deleteApplication = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this volunteer application?"
    );

    if (!confirmed) return;

    try {
      setSavingId(id);
      setError("");
      setSuccess("");

      await api.delete(`${API_URL}/${id}`);

      setApplications((previous) =>
        previous.filter(
          (application) => String(application.id) !== String(id)
        )
      );

      if (
        selectedApplication &&
        String(selectedApplication.id) === String(id)
      ) {
        setSelectedApplication(null);
      }

      setSuccess("Volunteer application deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete volunteer application."
      );
    } finally {
      setSavingId(null);
    }
  };

  // STATUS STYLES
  const getStatusStyle = (status) => {
    const styles = {
      Pending: "bg-orange-100 text-orange-700",
      Reviewed: "bg-blue-100 text-blue-700",
      Approved: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
    };

    return styles[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Volunteer Applications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review and manage people interested in volunteering with the foundation.
          </p>
        </div>

        <button
          onClick={fetchApplications}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <p>{error}</p>

          <button
            onClick={fetchApplications}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Applications</p>
            <Users size={22} className="text-green-700" />
          </div>

          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {applications.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Pending</p>
            <Clock size={22} className="text-orange-600" />
          </div>

          <h2 className="mt-3 text-2xl font-bold text-orange-600">
            {pendingCount}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Reviewed</p>
            <Eye size={22} className="text-blue-600" />
          </div>

          <h2 className="mt-3 text-2xl font-bold text-blue-700">
            {reviewedCount}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Approved</p>
            <UserCheck size={22} className="text-green-600" />
          </div>

          <h2 className="mt-3 text-2xl font-bold text-green-700">
            {approvedCount}
          </h2>
        </div>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email or interest..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600"
        >
          <option value="All">All Applications</option>
          <option value="Pending">Pending</option>
          <option value="Reviewed">Reviewed</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* APPLICATIONS TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Applicant</th>
                <th className="px-5 py-4">Area of Interest</th>
                <th className="px-5 py-4">Availability</th>
                <th className="px-5 py-4">Date Applied</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    Loading volunteer applications...
                  </td>
                </tr>
              ) : (
                <>
                  {filteredApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">
                          {application.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {application.email}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {application.phone}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {application.interest}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {application.availability || "Not provided"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(
                          application.date || application.createdAt
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                            application.status
                          )}`}
                        >
                          {application.status || "Pending"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              setSelectedApplication(application)
                            }
                            title="View application"
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            onClick={() =>
                              deleteApplication(application.id)
                            }
                            disabled={savingId === application.id}
                            title="Delete application"
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredApplications.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-10 text-center text-gray-500"
                      >
                        No volunteer applications found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLICATION DETAILS MODAL */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Volunteer Application
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Submitted{" "}
                  {formatDate(
                    selectedApplication.date ||
                      selectedApplication.createdAt
                  )}
                </p>
              </div>

              <button
                onClick={() => setSelectedApplication(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">
                    Full Name
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {selectedApplication.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">
                    Phone Number
                  </p>

                  <a
                    href={`tel:${selectedApplication.phone}`}
                    className="mt-1 inline-block text-sm text-green-700"
                  >
                    {selectedApplication.phone}
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Email Address
                </p>

                <a
                  href={`mailto:${selectedApplication.email}`}
                  className="mt-1 inline-block text-sm text-green-700 hover:underline"
                >
                  {selectedApplication.email}
                </a>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">
                    Area of Interest
                  </p>

                  <p className="mt-1 text-sm text-gray-800">
                    {selectedApplication.interest}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">
                    Availability
                  </p>

                  <p className="mt-1 text-sm text-gray-800">
                    {selectedApplication.availability || "Not provided."}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Previous Experience
                </p>

                <p className="mt-2 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  {selectedApplication.experience || "Not provided."}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Applicant's Message
                </p>

                <p className="mt-2 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  {selectedApplication.message || "No message provided."}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase text-gray-500">
                  Update Application Status
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: "Pending",
                      style:
                        "border-orange-200 text-orange-700 hover:bg-orange-50",
                    },
                    {
                      label: "Reviewed",
                      style:
                        "border-blue-200 text-blue-700 hover:bg-blue-50",
                    },
                    {
                      label: "Approved",
                      style:
                        "border-green-200 text-green-700 hover:bg-green-50",
                    },
                    {
                      label: "Rejected",
                      style:
                        "border-red-200 text-red-700 hover:bg-red-50",
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() =>
                        updateStatus(
                          selectedApplication.id,
                          item.label
                        )
                      }
                      disabled={
                        savingId === selectedApplication.id ||
                        selectedApplication.status === item.label
                      }
                      className={`rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${item.style}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-between">
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                    selectedApplication.email
                  )}&su=${encodeURIComponent(
                    "Volunteer Application - Bishop Wasonga Foundation"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-green-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800"
                >
                  Contact Applicant
                </a>

                <button
                  onClick={() => setSelectedApplication(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
