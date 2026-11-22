
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  Search,
  Eye,
  X,
  Banknote,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  RefreshCw,
  Ban,
  ShieldCheck,
} from "lucide-react";

const API_URL = "/admin/donations";

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // FETCH DONATIONS
  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(API_URL);

      setDonations(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load donation records. Please check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // SEARCH AND FILTER
  const filteredDonations = useMemo(() => {
    return donations.filter((donation) => {
      const searchText = search.toLowerCase();

      const donorName = donation.name || donation.donor || "";
      const email = donation.email || "";
      const reference = donation.reference || "";

      const matchesSearch =
        donorName.toLowerCase().includes(searchText) ||
        email.toLowerCase().includes(searchText) ||
        reference.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        (donation.status || "Pending") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [donations, search, statusFilter]);

  // SUMMARY STATISTICS
  const totalAmount = donations
    .filter((donation) => donation.status === "Completed")
    .reduce(
      (total, donation) => total + (Number(donation.amount) || 0),
      0
    );

  const pendingCount = donations.filter(
    (donation) => (donation.status || "Pending") === "Pending"
  ).length;

  const completedCount = donations.filter(
    (donation) => donation.status === "Completed"
  ).length;

  const failedCount = donations.filter(
    (donation) => donation.status === "Failed"
  ).length;

  const cancelledCount = donations.filter(
    (donation) => donation.status === "Cancelled"
  ).length;

  // CANCEL PENDING DONATION
  const cancelDonation = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this pending donation?"
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      setError("");
      setSuccess("");

      const response = await api.put(`${API_URL}/${id}`, {
        status: "Cancelled",
      });

      const updatedDonation = response.data.data;

      setDonations((previous) =>
        previous.map((donation) =>
          donation.id === id ? updatedDonation : donation
        )
      );

      setSelectedDonation(updatedDonation);
      setSuccess("Pending donation cancelled successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to cancel this donation."
      );
    } finally {
      setCancelling(false);
    }
  };

  // STATUS STYLING
  const statusStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Failed":
        return "bg-red-100 text-red-700";
      case "Cancelled":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // DISPLAY DATE
  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Donations Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage donations received by the foundation.
          </p>
        </div>

        <button
          onClick={fetchDonations}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* FEEDBACK */}
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

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Received</p>
            <Banknote className="text-green-600" size={22} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {formatAmount(totalAmount)}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Completed donations only
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Records</p>
            <Banknote className="text-blue-600" size={22} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {donations.length}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            All donation records
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Pending</p>
            <Clock className="text-yellow-600" size={22} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {pendingCount}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Awaiting payment confirmation
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Payment Outcomes</p>
            <CheckCircle className="text-green-600" size={22} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {completedCount} / {failedCount}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Completed / Failed
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Cancelled: {cancelledCount}
          </p>
        </div>
      </div>

      {/* DONATION RECORDS */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">
              Donation Records
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Review donor information and payment status.
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
                placeholder="Search donations..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-green-600 sm:w-64"
              />
            </div>

            <div className="relative">
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:border-green-600 sm:w-40"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Donor</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Payment Method</th>
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Loading donation records...
                  </td>
                </tr>
              ) : (
                filteredDonations.map((donation) => (
                  <tr
                    key={donation.id || donation._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">
                        {donation.name || donation.donor}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {donation.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {formatAmount(donation.amount)}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {donation.method || "Not provided"}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {donation.reference || "Not provided"}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(donation.date || donation.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle(
                          donation.status || "Pending"
                        )}`}
                      >
                        {donation.status || "Pending"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setSelectedDonation(donation)}
                          title="View donation"
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!loading && filteredDonations.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No donation records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500">
          Showing {filteredDonations.length} of {donations.length} donation records
        </div>
      </div>

      {/* DONATION DETAILS MODAL */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-800">
                Donation Details
              </h2>

              <button
                onClick={() => setSelectedDonation(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm text-green-700">
                  Donation Amount
                </p>
                <p className="mt-1 text-2xl font-bold text-green-800">
                  {formatAmount(selectedDonation.amount)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Donor Name</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {selectedDonation.name || selectedDonation.donor}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="mt-1 break-all font-medium text-gray-800">
                    {selectedDonation.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {selectedDonation.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {selectedDonation.method || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Transaction Reference</p>
                  <p className="mt-1 break-all font-medium text-gray-800">
                    {selectedDonation.reference || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Donation Date</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {formatDate(
                      selectedDonation.date || selectedDonation.createdAt
                    )}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">Donor Message</p>
                <p className="mt-1 text-sm text-gray-700">
                  {selectedDonation.message || "No message provided."}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="mb-2 text-xs text-gray-500">
                  Payment Status
                </p>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle(
                    selectedDonation.status || "Pending"
                  )}`}
                >
                  {selectedDonation.status || "Pending"}
                </span>

                {selectedDonation.status === "Pending" && (
                  <div className="mt-4">
                    <button
                      onClick={() =>
                        cancelDonation(
                          selectedDonation.id || selectedDonation._id
                        )
                      }
                      disabled={cancelling}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Ban size={17} />
                      {cancelling
                        ? "Cancelling..."
                        : "Cancel Pending Donation"}
                    </button>
                    <p className="mt-2 text-xs text-gray-500">
                      Only pending donations can be cancelled. This action
                      cannot be reversed.
                    </p>
                  </div>
                )}

                {selectedDonation.status === "Completed" && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-green-700">
                    <ShieldCheck size={17} />
                    Payment completed. This status is protected by payment verification.
                  </p>
                )}

                {selectedDonation.status === "Failed" && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle size={17} />
                    This payment was unsuccessful.
                  </p>
                )}

                {selectedDonation.status === "Cancelled" && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <Ban size={17} />
                    This donation has been cancelled.
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                Donation records are permanent and cannot be deleted.
                This protects the foundation's financial history.
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 p-5">
              <button
                onClick={() => setSelectedDonation(null)}
                className="rounded-lg bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
