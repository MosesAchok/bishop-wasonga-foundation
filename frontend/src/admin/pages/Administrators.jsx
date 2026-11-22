
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  Copy,
  KeyRound,
  CheckCircle,
  Lock,
} from "lucide-react";

const API_URL = "/admin/administrators";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  role: "Administrator",
  status: "Active",
};

const editorModules = [
  "programs",
  "projects",
  "newsEvents",
  "gallery",
  "team",
  "reports",
];

// PERMISSION MATRIX
const permissionModules = [
  {
    key: "programs",
    label: "Programs",
    actions: ["view", "create", "edit", "delete", "publish", "approve"],
  },
  {
    key: "projects",
    label: "Projects",
    actions: ["view", "create", "edit", "delete", "publish", "approve"],
  },
  {
    key: "gallery",
    label: "Gallery",
    actions: ["view", "create", "edit", "delete", "publish", "approve"],
  },
  {
    key: "team",
    label: "Team",
    actions: ["view", "create", "edit", "delete", "publish", "approve"],
  },
  {
    key: "newsEvents",
    label: "News & Events",
    actions: ["view", "create", "edit", "delete", "publish", "approve"],
  },
  {
    key: "reports",
    label: "Reports",
    actions: ["view", "create", "edit", "delete", "publish", "approve"],
  },
  {
    key: "messages",
    label: "Messages",
    actions: ["view", "edit", "delete"],
  },
  {
    key: "volunteers",
    label: "Volunteers",
    actions: ["view", "edit", "delete"],
  },
  {
    key: "partnerships",
    label: "Partnerships",
    actions: ["view", "edit", "delete"],
  },
  {
    key: "donations",
    label: "Donations",
    actions: ["view", "edit", "delete"],
  },
  {
    key: "impact",
    label: "Impact",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "settings",
    label: "Settings",
    actions: ["view", "edit"],
  },
];

const permissionActions = [
  "view",
  "create",
  "edit",
  "delete",
  "publish",
  "approve",
];

// CREATE EMPTY PERMISSIONS
const createEmptyPermissions = () => {
  const permissions = {};

  permissionModules.forEach((module) => {
    permissions[module.key] = {
      view: false,
      create: false,
      edit: false,
      delete: false,
      publish: false,
      approve: false,
    };
  });

  return permissions;
};

// GET PERMISSIONS FOR AN ADMINISTRATOR
const getAdminPermissions = (admin) => {
  const permissions = createEmptyPermissions();

  permissionModules.forEach((module) => {
    if (
      admin?.role === "Editor" &&
      !editorModules.includes(module.key)
    ) {
      return;
    }

    module.actions.forEach((action) => {
      if (
        admin?.role === "Editor" &&
        !["view", "create", "edit"].includes(action)
      ) {
        return;
      }

      permissions[module.key][action] =
        admin?.permissions?.[module.key]?.[action] === true;
    });
  });

  return permissions;
};

// SANITIZE PERMISSIONS BEFORE SENDING TO BACKEND
const preparePermissionsForRole = (permissions, role) => {
  const cleanPermissions = createEmptyPermissions();

  permissionModules.forEach((module) => {
    if (
      role === "Editor" &&
      !editorModules.includes(module.key)
    ) {
      return;
    }

    module.actions.forEach((action) => {
      if (
        role === "Editor" &&
        !["view", "create", "edit"].includes(action)
      ) {
        return;
      }

      cleanPermissions[module.key][action] =
        permissions?.[module.key]?.[action] === true;
    });
  });

  return cleanPermissions;
};

export default function Administrators() {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [permissions, setPermissions] = useState(createEmptyPermissions);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [temporaryPasswordEmail, setTemporaryPasswordEmail] = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // FETCH ADMINISTRATORS
  const fetchAdministrators = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(API_URL);
      setAdmins(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load administrator records. Please check the backend server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdministrators();
  }, [fetchAdministrators]);

  // FILTER ADMINISTRATORS
  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (admin.name || "").toLowerCase().includes(searchText) ||
        (admin.email || "").toLowerCase().includes(searchText) ||
        (admin.phone || "").includes(searchText);

      const matchesRole =
        roleFilter === "All" || admin.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || admin.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [admins, search, roleFilter, statusFilter]);

  const activeCount = admins.filter(
    (admin) => admin.status === "Active"
  ).length;

  const inactiveCount = admins.filter(
    (admin) => admin.status === "Inactive"
  ).length;

  // OPEN ADD MODAL
  const openAddModal = () => {
    setEditingAdmin(null);
    setFormData({ ...emptyForm });
    setPermissions(createEmptyPermissions());
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // OPEN EDIT MODAL
  const openEditModal = (admin) => {
    setEditingAdmin(admin);

    setFormData({
      name: admin.name || "",
      email: admin.email || "",
      phone: admin.phone || "",
      role: admin.role || "Administrator",
      status: admin.status || "Active",
    });

    setPermissions(getAdminPermissions(admin));
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // HANDLE FORM INPUTS
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "role") {
      setPermissions((previous) =>
        preparePermissionsForRole(previous, value)
      );
    }
  };

  // HANDLE PERMISSION CHECKBOXES
  const handlePermissionChange = (module, action, checked) => {
    setPermissions((previous) => ({
      ...previous,
      [module]: {
        ...previous[module],
        [action]: checked,
      },
    }));
  };

  // SELECT OR CLEAR ALL AVAILABLE PERMISSIONS
  const setAllPermissions = (checked) => {
    const updatedPermissions = createEmptyPermissions();

    permissionModules.forEach((module) => {
      if (
        formData.role === "Editor" &&
        !editorModules.includes(module.key)
      ) {
        return;
      }

      module.actions.forEach((action) => {
        if (
          formData.role === "Editor" &&
          !["view", "create", "edit"].includes(action)
        ) {
          return;
        }

        updatedPermissions[module.key][action] = checked;
      });
    });

    setPermissions(updatedPermissions);
  };

  // COUNT ASSIGNED PERMISSIONS
  const permissionCount = useMemo(() => {
    return permissionModules.reduce((total, module) => {
      return (
        total +
        module.actions.filter(
          (action) => permissions[module.key]?.[action] === true
        ).length
      );
    }, 0);
  }, [permissions]);

  // FORMAT PERMISSION LABELS
  const formatAction = (action) => {
    const labels = {
      view: "View",
      create: "Create",
      edit: "Edit",
      delete: "Delete",
      publish: "Publish / Unpublish",
      approve: "Approve / Reject",
    };

    return labels[action] || action;
  };

  // ADD OR UPDATE ADMINISTRATOR
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please enter the administrator's name and email.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const cleanPermissions = preparePermissionsForRole(
        permissions,
        formData.role
      );

      if (editingAdmin) {
        const payload = {
          ...formData,
        };

        if (editingAdmin.role !== "Super Admin") {
          payload.permissions = cleanPermissions;
        }

        const response = await api.put(
          `${API_URL}/${editingAdmin.id}`,
          payload
        );

        const updatedAdmin = response.data.data;

        setAdmins((previous) =>
          previous.map((admin) =>
            admin.id === editingAdmin.id ? updatedAdmin : admin
          )
        );

        setSelectedAdmin((previous) =>
          previous?.id === editingAdmin.id ? updatedAdmin : previous
        );

        setSuccess("Administrator updated successfully.");
      } else {
        const response = await api.post(API_URL, formData);
        let newAdmin = response.data.data;

        const generatedPassword = response.data.temporaryPassword;

        if (formData.role !== "Super Admin") {
          const permissionResponse = await api.put(
            `${API_URL}/${newAdmin.id}`,
            {
              permissions: cleanPermissions,
            }
          );

          newAdmin = permissionResponse.data.data;
        }

        setAdmins((previous) => [newAdmin, ...previous]);

        if (generatedPassword) {
          setTemporaryPassword(generatedPassword);
          setTemporaryPasswordEmail(newAdmin.email);
          setCopiedPassword(false);
          setShowPasswordModal(true);
        }

        setSuccess("Administrator added successfully.");
      }

      setShowModal(false);
      setEditingAdmin(null);
      setFormData({ ...emptyForm });
      setPermissions(createEmptyPermissions());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save administrator. Please try again."
      );

      fetchAdministrators();
    } finally {
      setSubmitting(false);
    }
  };

  // COPY TEMPORARY PASSWORD
  const copyTemporaryPassword = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopiedPassword(true);
    } catch {
      setError(
        "Unable to copy automatically. Please select and copy the password manually."
      );
    }
  };

  // CLOSE TEMPORARY PASSWORD MODAL
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setTemporaryPassword("");
    setTemporaryPasswordEmail("");
    setCopiedPassword(false);
  };

  // DELETE ADMINISTRATOR
  const deleteAdmin = async (id) => {
    const admin = admins.find((item) => item.id === id);

    if (admin?.role === "Super Admin") {
      setError("The Super Admin record cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this administrator record?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`${API_URL}/${id}`);

      setAdmins((previous) =>
        previous.filter((item) => item.id !== id)
      );

      setSelectedAdmin((previous) =>
        previous?.id === id ? null : previous
      );

      setSuccess("Administrator deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete administrator."
      );
    }
  };

  // ACTIVATE OR DEACTIVATE ADMINISTRATOR
  const toggleStatus = async (id) => {
    const admin = admins.find((item) => item.id === id);

    if (!admin || admin.role === "Super Admin") return;

    const newStatus =
      admin.status === "Active" ? "Inactive" : "Active";

    try {
      setError("");
      setSuccess("");

      const response = await api.put(`${API_URL}/${id}`, {
        status: newStatus,
      });

      const updatedAdmin = response.data.data;

      setAdmins((previous) =>
        previous.map((item) => (item.id === id ? updatedAdmin : item))
      );

      setSelectedAdmin((previous) =>
        previous?.id === id ? updatedAdmin : previous
      );

      setSuccess(
        `Administrator account ${newStatus.toLowerCase()} successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update administrator status."
      );
    }
  };

  // ROLE COLORS
  const roleStyle = (role) => {
    switch (role) {
      case "Super Admin":
        return "bg-purple-100 text-purple-700";
      case "Editor":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  const permissionColumns = [
    "view",
    "create",
    "edit",
    "delete",
    "publish",
    "approve",
  ];

  return (
    <div className="space-y-6">
      {/* HEADING */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Administrators
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage administrator accounts and their individual access permissions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchAdministrators}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"
          >
            <Plus size={18} />
            Add Administrator
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <span>{success}</span>
          <button onClick={() => setSuccess("")}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Administrators</p>
            <Users className="text-blue-600" size={23} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {admins.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Active Accounts</p>
            <UserCheck className="text-green-600" size={23} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {activeCount}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Inactive Accounts</p>
            <UserX className="text-red-600" size={23} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-800">
            {inactiveCount}
          </h2>
        </div>
      </div>

      {/* ROLES INFORMATION */}
      <div className="rounded-xl border border-green-100 bg-green-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 text-green-700" size={24} />

          <div className="flex-1">
            <h3 className="font-semibold text-green-900">
              Administrator Access Levels
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-green-800">Super Admin</p>
                <p className="mt-1 text-xs text-green-700">
                  Unrestricted access to all modules and administrator management.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-green-800">Administrator</p>
                <p className="mt-1 text-xs text-green-700">
                  Access to assigned modules and individually assigned actions, including publishing, deleting and reviewing.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-green-800">Editor</p>
                <p className="mt-1 text-xs text-green-700">
                  Can create and edit assigned website content and submit changes for approval.
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-green-800">
              Role labels do not automatically grant module access. Individual permissions determine what each account can do.
            </p>
          </div>
        </div>
      </div>

      {/* ADMINISTRATOR TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">Administrator Records</h2>
            <p className="mt-1 text-sm text-gray-500">
              View and manage administrator information.
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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search administrators..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-green-600 sm:w-56"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-600"
            >
              <option value="All">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Administrator">Administrator</option>
              <option value="Editor">Editor</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-600"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Administrator</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Date Added</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-gray-500">
                    Loading administrator records...
                  </td>
                </tr>
              ) : (
                <>
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">{admin.name}</p>
                        <p className="mt-1 text-xs text-gray-500">{admin.email}</p>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleStyle(admin.role)}`}>
                          {admin.role}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {admin.phone || "Not provided"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {admin.dateAdded || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleStatus(admin.id)}
                          disabled={admin.role === "Super Admin"}
                          title={admin.role === "Super Admin" ? "Super Admin cannot be deactivated" : "Change account status"}
                          className={`rounded-full px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-70 ${
                            admin.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {admin.status}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedAdmin(admin)}
                            title="View administrator"
                            className="rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                          >
                            View
                          </button>

                          <button
                            onClick={() => openEditModal(admin)}
                            title="Edit administrator"
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => deleteAdmin(admin.id)}
                            disabled={admin.role === "Super Admin"}
                            title={admin.role === "Super Admin" ? "Super Admin cannot be deleted" : "Delete administrator"}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredAdmins.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-5 py-12 text-center text-gray-500">
                        No administrator records found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500">
          Showing {filteredAdmins.length} of {admins.length} administrators
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {editingAdmin ? "Edit Administrator" : "Add Administrator"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Manage account information and individual permissions.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-5">
              {/* ACCOUNT INFORMATION */}
              <div>
                <h3 className="mb-4 font-semibold text-gray-800">
                  Account Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      maxLength={100}
                      placeholder="Enter full name"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      maxLength={150}
                      placeholder="Enter email address"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={20}
                      placeholder="Enter phone number"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Administrator Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={editingAdmin?.role === "Super Admin"}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-green-600 disabled:bg-gray-100"
                    >
                      {editingAdmin?.role === "Super Admin" && (
                        <option value="Super Admin">Super Admin</option>
                      )}
                      <option value="Administrator">Administrator</option>
                      <option value="Editor">Editor</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      The role label does not automatically grant module access.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Account Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={editingAdmin?.role === "Super Admin"}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-green-600 disabled:bg-gray-100"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PERMISSIONS */}
              {formData.role !== "Super Admin" && (
                <div className="border-t border-gray-100 pt-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Module Permissions
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Select exactly what this administrator is allowed to do.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAllPermissions(true)}
                        className="rounded-lg border border-green-200 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50"
                      >
                        Select All
                      </button>

                      <button
                        type="button"
                        onClick={() => setAllPermissions(false)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <Lock size={16} />
                      <span>
                        {permissionCount} permission(s) selected. Unselected actions will be denied.
                      </span>
                    </div>
                  </div>

                  {formData.role === "Administrator" && (
                    <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
                      <strong>Important:</strong> Publish and Approve are separate permissions. Grant Approve to reviewers and Publish to administrators responsible for making approved content public.
                    </div>
                  )}

                  {formData.role === "Editor" && (
                    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                      Editors can access only the six content modules listed below. They cannot delete, publish, unpublish, approve or reject submissions.
                    </div>
                  )}

                  <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full min-w-[850px] text-sm">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                          <th className="px-4 py-3 text-left">Module</th>
                          {permissionColumns.map((action) => (
                            <th key={action} className="px-3 py-3 text-center">
                              {action === "publish"
                                ? "Publish"
                                : action === "approve"
                                  ? "Approve"
                                  : action}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {permissionModules
                          .filter(
                            (module) =>
                              formData.role !== "Editor" ||
                              editorModules.includes(module.key)
                          )
                          .map((module) => (
                            <tr key={module.key} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-700">
                                {module.label}
                              </td>

                              {permissionColumns.map((action) => (
                                <td key={action} className="px-3 py-3 text-center">
                                  {module.actions.includes(action) &&
                                  !(
                                    formData.role === "Editor" &&
                                    !["view", "create", "edit"].includes(action)
                                  ) ? (
                                    <input
                                      type="checkbox"
                                      checked={
                                        permissions[module.key]?.[action] === true
                                      }
                                      onChange={(event) =>
                                        handlePermissionChange(
                                          module.key,
                                          action,
                                          event.target.checked
                                        )
                                      }
                                      aria-label={`${formatAction(action)} ${module.label}`}
                                      className="h-4 w-4 cursor-pointer accent-green-700"
                                    />
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    Administrator management is reserved for the Super Admin and cannot be assigned through this permissions matrix.
                  </p>
                </div>
              )}

              {/* SUPER ADMIN INFORMATION */}
              {formData.role === "Super Admin" && (
                <div className="rounded-lg border border-purple-100 bg-purple-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={22} className="mt-0.5 text-purple-700" />
                    <div>
                      <p className="font-semibold text-purple-900">
                        Unrestricted Super Admin Access
                      </p>
                      <p className="mt-1 text-sm text-purple-800">
                        Super Admin automatically has access to every module and action, including administrator management and approval. Individual permissions are not required.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* FORM ACTIONS */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError("");
                  }}
                  disabled={submitting}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : editingAdmin
                      ? "Save Changes"
                      : "Create Administrator"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800">
                Administrator Details
              </h2>
              <button
                onClick={() => setSelectedAdmin(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="mt-1 font-medium text-gray-800">{selectedAdmin.name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="mt-1 break-all font-medium text-gray-800">{selectedAdmin.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                <p className="mt-1 font-medium text-gray-800">
                  {selectedAdmin.phone || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="mt-1 font-medium text-gray-800">{selectedAdmin.role}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Date Added</p>
                <p className="mt-1 font-medium text-gray-800">
                  {selectedAdmin.dateAdded || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Account Status</p>
                <p className="mt-1 font-medium text-gray-800">{selectedAdmin.status}</p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="mb-3 font-semibold text-gray-800">
                  Access Permissions
                </h3>

                {selectedAdmin.role === "Super Admin" ? (
                  <div className="rounded-lg border border-purple-100 bg-purple-50 p-3 text-sm text-purple-800">
                    <ShieldCheck size={17} className="mr-2 inline" />
                    Unrestricted access to all system modules and actions.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {permissionModules
                      .filter(
                        (module) =>
                          selectedAdmin.role !== "Editor" ||
                          editorModules.includes(module.key)
                      )
                      .map((module) => {
                        const grantedActions = module.actions.filter(
                          (action) =>
                            selectedAdmin.permissions?.[module.key]?.[action] === true
                        );

                        return (
                          <div
                            key={module.key}
                            className="flex flex-col gap-1 border-b border-gray-100 pb-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <span className="text-sm font-medium text-gray-700">
                              {module.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {grantedActions.length > 0
                                ? grantedActions.map(formatAction).join(", ")
                                : "No access"}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 p-5">
              <button
                onClick={() => setSelectedAdmin(null)}
                className="rounded-lg bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPORARY PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-3">
                  <KeyRound size={23} className="text-green-700" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">
                    Administrator Created
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Temporary login credentials
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                  <CheckCircle size={17} />
                  Account created successfully
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">Administrator email</p>
                <p className="mt-1 break-all text-sm font-medium text-gray-800">
                  {temporaryPasswordEmail}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-gray-600">
                  Temporary Password
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={temporaryPassword}
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 font-mono text-sm text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={copyTemporaryPassword}
                    className="flex items-center gap-2 rounded-lg bg-green-700 px-3 py-3 text-sm font-medium text-white hover:bg-green-800"
                  >
                    {copiedPassword ? (
                      <CheckCircle size={17} />
                    ) : (
                      <Copy size={17} />
                    )}
                    {copiedPassword ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <p className="text-xs leading-5 text-red-600">
                Important: Copy and securely share this password with the administrator. It will not be displayed again after you close this window.
              </p>
            </div>

            <div className="flex justify-end border-t border-gray-100 p-5">
              <button
                onClick={closePasswordModal}
                className="rounded-lg bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800"
              >
                I Have Saved the Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
