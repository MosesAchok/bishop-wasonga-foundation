
import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Search,
  Eye,
  Trash2,
  X,
  CheckCircle,
  Clock,
  MessageSquare,
} from "lucide-react";
import api from "../../services/api";

const API_URL = "/admin/messages";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // FETCH CONTACT MESSAGES
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(API_URL);

      if (response.data.success === false) {
        throw new Error(
          response.data.message || "Failed to load contact messages."
        );
      }

      setMessages(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to connect to the messages API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // SEARCH AND FILTER
  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        message.name?.toLowerCase().includes(searchText) ||
        message.email?.toLowerCase().includes(searchText) ||
        message.subject?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        message.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [messages, search, statusFilter]);

  // SUMMARY COUNTS
  const unreadCount = messages.filter(
    (message) => message.status === "Unread"
  ).length;

  const readCount = messages.filter(
    (message) => message.status === "Read"
  ).length;

  const repliedCount = messages.filter(
    (message) => message.status === "Replied"
  ).length;

  // UPDATE MESSAGE STATUS
  const updateStatus = async (id, status) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(`${API_URL}/${id}`, { status });

      if (response.data.success === false) {
        throw new Error(
          response.data.message || "Failed to update message status."
        );
      }

      setMessages((previous) =>
        previous.map((message) =>
          String(message.id) === String(id)
            ? { ...message, ...response.data.data, status }
            : message
        )
      );

      setSelectedMessage((previous) =>
        previous && String(previous.id) === String(id)
          ? { ...previous, ...response.data.data, status }
          : previous
      );

      setSuccess("Message status updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update message status."
      );
    } finally {
      setSaving(false);
    }
  };

  // OPEN MESSAGE
  const openMessage = (message) => {
    setSelectedMessage(message);

    if (message.status === "Unread") {
      updateStatus(message.id, "Read");
    }
  };

  // DELETE MESSAGE
  const deleteMessage = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.delete(`${API_URL}/${id}`);

      if (response.data.success === false) {
        throw new Error(
          response.data.message || "Failed to delete message."
        );
      }

      setMessages((previous) =>
        previous.filter(
          (message) => String(message.id) !== String(id)
        )
      );

      if (
        selectedMessage &&
        String(selectedMessage.id) === String(id)
      ) {
        setSelectedMessage(null);
      }

      setSuccess("Message deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete message."
      );
    } finally {
      setSaving(false);
    }
  };

  // DATE FORMATTING
  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // STATUS STYLING
  const getStatusStyle = (status) => {
    if (status === "Unread") {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "Replied") {
      return "bg-green-100 text-green-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Contact Messages
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage messages submitted through the foundation website.
        </p>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
          <button
            onClick={fetchMessages}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Unread Messages
            </p>
            <Mail size={22} className="text-blue-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-blue-700">
            {unreadCount}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Read Messages
            </p>
            <Eye size={22} className="text-gray-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {readCount}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Replied Messages
            </p>
            <CheckCircle size={22} className="text-green-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-green-700">
            {repliedCount}
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
            placeholder="Search by name, email or subject..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600"
        >
          <option value="All">All Messages</option>
          <option value="Unread">Unread</option>
          <option value="Read">Read</option>
          <option value="Replied">Replied</option>
        </select>
      </div>

      {/* MESSAGES TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Sender</th>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    Loading contact messages...
                  </td>
                </tr>
              ) : (
                filteredMessages.map((message) => (
                  <tr
                    key={message.id}
                    className={`hover:bg-gray-50 ${
                      message.status === "Unread"
                        ? "bg-blue-50/40"
                        : ""
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">
                        {message.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {message.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-700">
                      {message.subject}
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {formatDate(message.date || message.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                          message.status
                        )}`}
                      >
                        {message.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openMessage(message)}
                          title="View message"
                          disabled={saving}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => deleteMessage(message.id)}
                          title="Delete message"
                          disabled={saving}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!loading && filteredMessages.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MESSAGE DETAILS MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2 text-green-700">
                  <MessageSquare size={21} />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-800">
                    Message Details
                  </h2>
                  <p className="text-xs text-gray-500">
                    Received{" "}
                    {formatDate(
                      selectedMessage.date || selectedMessage.createdAt
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Sender
                </p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedMessage.name}
                </p>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="mt-1 inline-block text-sm text-green-700 hover:underline"
                >
                  {selectedMessage.email}
                </a>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Subject
                </p>
                <p className="mt-1 font-medium text-gray-800">
                  {selectedMessage.subject}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Message
                </p>
                <div className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-7 text-gray-700">
                  {selectedMessage.message}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase text-gray-500">
                  Update Message Status
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      updateStatus(selectedMessage.id, "Unread")
                    }
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                  >
                    <Mail size={15} />
                    Unread
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(selectedMessage.id, "Read")
                    }
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Clock size={15} />
                    Read
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(selectedMessage.id, "Replied")
                    }
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg border border-green-200 px-3 py-2 text-sm text-green-700 hover:bg-green-50 disabled:opacity-50"
                  >
                    <CheckCircle size={15} />
                    Replied
                  </button>
                </div>

                {saving && (
                  <p className="mt-2 text-xs text-gray-500">
                    Saving changes...
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-between">
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                    selectedMessage.email
                  )}&su=${encodeURIComponent(
                    `Re: ${selectedMessage.subject}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-green-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800"
                >
                  Reply by Email
                </a>

                <button
                  onClick={() => setSelectedMessage(null)}
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
