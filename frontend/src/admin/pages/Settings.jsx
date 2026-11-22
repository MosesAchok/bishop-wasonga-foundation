
import { useEffect, useState } from "react";
import api from "../../services/api";
import { Save, Settings as SettingsIcon } from "lucide-react";

const API_URL = "/admin/settings";

const initialSettings = {
  foundationName: "Bishop Wasonga Foundation",
  email: "info@bishopwasongafoundation.org",
  phone: "",
  address: "Kenya",
  website: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  maintenanceMode: false,
  showNewsletter: true,
};

export default function Settings() {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // LOAD SETTINGS FROM THE BACKEND
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(API_URL);

        setSettings({
          ...initialSettings,
          ...(response.data.data || {}),
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load website settings. Please check your backend server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // HANDLE FORM CHANGES
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSaved(false);
    setError("");
  };

  // SAVE SETTINGS TO THE BACKEND
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const response = await api.put(API_URL, settings);

      setSettings({
        ...initialSettings,
        ...(response.data.data || settings),
      });

      setSaved(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-gray-600">Loading website settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <SettingsIcon className="text-green-700" size={28} />
          <h1 className="text-2xl font-bold text-gray-800">
            Website Settings
          </h1>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Manage your foundation information and website preferences.
        </p>
      </div>

      {saved && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Settings saved successfully.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* FOUNDATION INFORMATION */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Foundation Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Foundation Name
              </label>

              <input
                name="foundationName"
                value={settings.foundationName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Website Address
              </label>

              <input
                name="website"
                value={settings.website}
                onChange={handleChange}
                placeholder="https://example.org"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone Number
              </label>

              <input
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                placeholder="+254..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Physical Address
              </label>

              <textarea
                name="address"
                value={settings.address}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>
          </div>
        </section>

        {/* SOCIAL MEDIA */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Social Media Links
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              ["facebook", "Facebook URL"],
              ["instagram", "Instagram URL"],
              ["linkedin", "LinkedIn URL"],
              ["youtube", "YouTube URL"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {label}
                </label>

                <input
                  type="url"
                  name={name}
                  value={settings[name]}
                  onChange={handleChange}
                  placeholder="https://"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                />
              </div>
            ))}
          </div>
        </section>

        {/* WEBSITE PREFERENCES */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Website Preferences
          </h2>

          <div className="space-y-5">
            <label className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-800">
                  Maintenance Mode
                </p>

                <p className="text-sm text-gray-500">
                  Prepare the website for temporary maintenance.
                </p>
              </div>

              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="h-5 w-5 accent-green-700"
              />
            </label>

            <div className="border-t border-gray-100" />

            <label className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-800">
                  Newsletter Subscription
                </p>

                <p className="text-sm text-gray-500">
                  Enable newsletter subscription features.
                </p>
              </div>

              <input
                type="checkbox"
                name="showNewsletter"
                checked={settings.showNewsletter}
                onChange={handleChange}
                className="h-5 w-5 accent-green-700"
              />
            </label>
          </div>
        </section>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-green-700 px-6 py-3 font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
