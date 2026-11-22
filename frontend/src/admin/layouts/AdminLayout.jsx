
import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* MAIN CONTENT AREA */}
      <div className="min-h-screen lg:pl-72">
        {/* HEADER */}
        <AdminHeader onMenuClick={openSidebar} />

        {/* PAGE CONTENT */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
