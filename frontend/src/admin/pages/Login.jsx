
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-green-800 text-white flex items-center justify-center shadow-lg">
            <ShieldCheck size={34} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-green-950">
            Bishop Wasonga Foundation
          </h1>

          <p className="mt-2 text-gray-600">
            Administrator Portal
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-7">
          <h2 className="text-xl font-bold text-gray-900">
            Administrator Login
          </h2>

          <p className="text-sm text-gray-500 mt-2 mb-6">
            Sign in to access the foundation management dashboard.
          </p>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="username"
                  className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-3 outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-3 outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-800 hover:bg-green-900 disabled:bg-green-500 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Authorized personnel only. Your access is protected.
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} Bishop Wasonga Foundation
        </p>
      </div>
    </div>
  );
}
