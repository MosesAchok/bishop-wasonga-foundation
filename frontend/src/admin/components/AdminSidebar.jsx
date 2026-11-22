
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Newspaper,
  Image,
  FileText,
  HeartHandshake,
  Mail,
  HandHeart,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const menuGroups = [
  {
    title: "MAIN MENU",
    items: [
      { name: "Overview", path: "/admin", icon: LayoutDashboard },
      { name: "Programs", path: "/admin/programs", icon: FolderKanban },
      { name: "Projects", path: "/admin/projects", icon: FolderKanban },
      { name: "News & Events", path: "/admin/news-events", icon: Newspaper },
      { name: "Gallery", path: "/admin/gallery", icon: Image },
      { name: "Team", path: "/admin/team", icon: Users },
      { name: "Reports", path: "/admin/reports", icon: FileText },
    ],
  },
  {
    title: "ENGAGEMENT",
    items: [
      { name: "Contact Messages", path: "/admin/messages", icon: Mail },
      { name: "Volunteers", path: "/admin/volunteers", icon: Users },
      { name: "Partnerships", path: "/admin/partnerships", icon: HeartHandshake },
      { name: "Donations", path: "/admin/donations", icon: HandHeart },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { name: "Impact Statistics", path: "/admin/impact", icon: BarChart3 },
      { name: "Administrators", path: "/admin/administrators", icon: Users },
      { name: "Settings", path: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar({ open = true, onClose }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-green-950 text-white shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* BRAND */}
        <div className="flex h-20 items-center justify-between border-b border-green-800 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-green-400 bg-green-800 text-xl font-extrabold">
              B
            </div>

            <div>
              <h2 className="text-base font-extrabold">Bishop Wasonga</h2>
              <p className="text-xs font-bold tracking-widest text-green-400">
                FOUNDATION
              </p>
              <p className="mt-0.5 text-[10px] text-green-200">
                Administration
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-green-200 hover:bg-green-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        {/* LOGGED-IN ADMINISTRATOR */}
        <div className="border-b border-green-800 px-5 py-4">
          <p className="text-xs text-green-400">Signed in as</p>
          <p className="mt-1 truncate text-sm font-semibold text-white">
            {admin?.name || "Administrator"}
          </p>
          <p className="mt-1 text-xs text-green-300">
            {admin?.role || "Administrator"}
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-green-400">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/admin"}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                          isActive
                            ? "bg-green-700 text-white shadow-sm"
                            : "text-green-100 hover:bg-green-900 hover:text-white"
                        }`
                      }
                    >
                      <Icon size={19} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="border-t border-green-800 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-green-200 transition hover:bg-red-700 hover:text-white"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
