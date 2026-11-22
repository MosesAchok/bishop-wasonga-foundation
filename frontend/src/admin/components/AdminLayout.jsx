
import { Menu, Bell, ChevronDown, Search } from "lucide-react";

export default function AdminHeader({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 className="text-lg font-bold text-gray-800 sm:text-xl">
            Administration
          </h1>
          <p className="hidden text-xs text-gray-500 sm:block">
            Manage Bishop Wasonga Foundation
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* SEARCH ICON */}
        <button
          type="button"
          className="hidden rounded-full p-2 text-gray-500 hover:bg-gray-100 sm:block"
          aria-label="Search"
          title="Search functionality will be added later"
        >
          <Search size={20} />
        </button>

        {/* NOTIFICATIONS */}
        <button
          type="button"
          className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Notifications"
          title="Notifications will be added later"
        >
          <Bell size={21} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* ADMIN PROFILE */}
        <div className="flex items-center gap-2 border-l border-gray-200 pl-3 sm:pl-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">
            BW
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">
              Administrator
            </p>
            <p className="text-xs text-gray-500">
              System Admin
            </p>
          </div>

          <ChevronDown size={17} className="hidden text-gray-500 sm:block" />
        </div>
      </div>
    </header>
  );
}
