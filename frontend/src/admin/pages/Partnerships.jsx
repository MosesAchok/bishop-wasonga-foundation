
import { useMemo, useState, useEffect } from "react";
import api from "../../services/api";

import {
  Handshake,
  Search,
  Eye,
  Trash2,
  X,
  Clock,
  CheckCircle,
  Building2,
  RefreshCw,
} from "lucide-react";

const API_URL = "/admin/partnerships";

export default function Partnerships() {
  const [partnerships, setPartnerships] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPartnership, setSelectedPartnership] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingId, setSavingId] = useState(null);

  // FETCH PARTNERSHIP ENQUIRIES
  const fetchPartnerships = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(API_URL);

      setPartnerships(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load partnership enquiries. Please check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerships();
  }, []);

  // SEARCH AND FILTER
  const filteredPartnerships = useMemo(() => {
    return partnerships.filter((partnership) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (partnership.organization || "").toLowerCase().includes(searchText) ||
        (partnership.contactPerson || "").toLowerCase().includes(searchText) ||
        (partnership.email || "").toLowerCase().includes(searchText) ||
        (partnership.partnershipType || "").toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        partnership.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [partnerships, search, statusFilter]);

  // SUMMARY COUNTS
  const pendingCount = partnerships.filter(
    (partnership) => partnership.status === "Pending"
  ).length;

  const reviewedCount = partnerships.filter(
    (partnership) => partnership.status === "Reviewed"
  ).length;

  const approvedCount = partnerships.filter(
    (partnership) => partnership.status === "Approved"
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

  // UPDATE PARTNERSHIP STATUS
  const updateStatus = async (id, status) => {
    try {
      setSavingId(id);
      setError("");
      setSuccess("");

      const response = await api.put(`${API_URL}/${id}`, {
        status,
      });

      const updatedPartnership = response.data.data;

      setPartnerships((previous) =>
        previous.map((partnership) =>
          String(partnership.id || partnership._id) === String(id)
            ? { ...partnership, ...updatedPartnership, status }
            : partnership
        )
      );

      setSelectedPartnership((previous) =>
        previous &&
        String(previous.id || previous._id) === String(id)
          ? { ...previous, ...updatedPartnership, status }
          : previous
      );

      setSuccess(`Partnership enquiry status updated to ${status}.`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update partnership enquiry status."
      );
    } finally {
      setSavingId(null);
    }
  };

  // DELETE PARTNERSHIP ENQUIRY
  const deletePartnership = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this partnership enquiry?"
    );

    if (!confirmed) return;

    try {
      setSavingId(id);
      setError("");
      setSuccess("");

      await api.delete(`${API_URL}/${id}`);

      setPartnerships((previous) =>
        previous.filter(
          (partnership) =>
            String(partnership.id || partnership._id) !== String(id)
        )
      );

      if (
        selectedPartnership &&
        String(selectedPartnership.id || selectedPartnership._id) ===
          String(id)
      ) {
        setSelectedPartnership(null);
      }

      setSuccess("Partnership enquiry deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete partnership enquiry."
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
            Partnerships Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review and manage organisations interested in partnering with the foundation.
          </p>
        </div>

        <button
          onClick={fetchPartnerships}
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
            onClick={fetchPartnerships}
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
            <p className="text-sm text-gray-500">Total Enquiries</p>
            <Handshake size={22} className="text-green-700" />
          </div>

          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {partnerships.length}
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
            <CheckCircle size={22} className="text-green-600" />
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
            placeholder="Search organisation, contact or partnership type..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600"
        >
          <option value="All">All Enquiries</option>
          <option value="Pending">Pending</option>
          <option value="Reviewed">Reviewed</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* PARTNERSHIPS TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Organisation</th>
                <th className="px-5 py-4">Contact Person</th>
                <th className="px-5 py-4">Partnership Type</th>
                <th className="px-5 py-4">Date Received</th>
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
                    Loading partnership enquiries...
                  </td>
                </tr>
              ) : (
                <>
                  {filteredPartnerships.map((partnership) => {
                    const partnershipId =
                      partnership.id || partnership._id;

                    return (
                      <tr
                        key={partnershipId}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-50 p-2 text-green-700">
                              <Building2 size={20} />
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800">
                                {partnership.organization}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {partnership.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {partnership.contactPerson}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {partnership.partnershipType}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {formatDate(
                            partnership.date || partnership.createdAt
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                              partnership.status
                            )}`}
                          >
                            {partnership.status || "Pending"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setSelectedPartnership(partnership)
                              }
                              title="View enquiry"
                              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              onClick={() =>
                                deletePartnership(partnershipId)
                              }
                              disabled={savingId === partnershipId}
                              title="Delete enquiry"
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredPartnerships.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-10 text-center text-gray-500"
                      >
                        No partnership enquiries found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PARTNERSHIP DETAILS MODAL */}
      {selectedPartnership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2 text-green-700">
                  <Handshake size={21} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-800">
                    Partnership Enquiry
                  </h2>

                  <p className="text-xs text-gray-500">
                    Received{" "}
                    {formatDate(
                      selectedPartnership.date ||
                        selectedPartnership.createdAt
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPartnership(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Organisation
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {selectedPartnership.organization}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Contact Person
                </p>

                <p className="mt-1 text-sm text-gray-800">
                  {selectedPartnership.contactPerson}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">
                    Email Address
                  </p>

                  <a
                    href={`mailto:${selectedPartnership.email}`}
                    className="mt-1 inline-block text-sm text-green-700 hover:underline"
                  >
                    {selectedPartnership.email}
                  </a>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">
                    Phone Number
                  </p>

                  {selectedPartnership.phone ? (
                    <a
                      href={`tel:${selectedPartnership.phone}`}
                      className="mt-1 inline-block text-sm text-green-700"
                    >
                      {selectedPartnership.phone}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Not provided
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Partnership Type
                </p>

                <p className="mt-1 text-sm text-gray-800">
                  {selectedPartnership.partnershipType}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Proposed Collaboration
                </p>

                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-7 text-gray-700">
                  {selectedPartnership.message}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase text-gray-500">
                  Update Enquiry Status
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
                          selectedPartnership.id || selectedPartnership._id,
                          item.label
                        )
                      }
                      disabled={
                        savingId ===
                          (selectedPartnership.id ||
                            selectedPartnership._id) ||
                        selectedPartnership.status === item.label
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
                    selectedPartnership.email
                  )}&su=${encodeURIComponent(
                    "Partnership Enquiry - Bishop Wasonga Foundation"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-green-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800"
                >
                  Contact Organisation
                </a>

                <button
                  onClick={() => setSelectedPartnership(null)}
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
