
import { Menu, Bell, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminHeader({
  onMenuClick,
  title = "Dashboard Overview",
  subtitle = "Manage your foundation activities",
}) {
  const { admin } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6 lg:px-8">
      {/* PAGE TITLE */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
            {title}
          </h1>
          <p className="hidden text-sm text-gray-500 sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* HEADER ACTIONS */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          title="Notifications"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
        >
          <Bell size={21} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2 border-l border-gray-200 pl-3 sm:pl-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-800">
            <UserRound size={21} />
          </div>

          <div className="hidden sm:block">
            <p className="max-w-40 truncate text-sm font-semibold text-gray-800">
              {admin?.name || "Administrator"}
            </p>
            <p className="text-xs text-gray-500">
              {admin?.role || "Foundation Admin"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
