
import { Routes, Route } from "react-router-dom";

// AUTHENTICATION
import AdminLogin from "./admin/pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// PUBLIC WEBSITE
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Programs from "./pages/Programs";
import Projects from "./pages/Projects";
import Impact from "./pages/Impact";
import GetInvolved from "./pages/GetInvolved";
import NewsEvents from "./pages/NewsEvents";
import Gallery from "./pages/Gallery";
import Reports from "./pages/Reports";
import Contact from "./pages/Contact";
import Donate from "./pages/Donate";

// ADMIN DASHBOARD
import AdminLayout from "./admin/layouts/AdminLayout";
import Overview from "./admin/pages/Overview";
import AdminPrograms from "./admin/pages/Programs";
import AdminProjects from "./admin/pages/Projects";
import AdminNewsEvents from "./admin/pages/NewsEvents";
import AdminGallery from "./admin/pages/Gallery";
import AdminTeam from "./admin/pages/Team";
import AdminReports from "./admin/pages/Reports";
import AdminMessages from "./admin/pages/Messages";
import AdminVolunteers from "./admin/pages/Volunteers";
import AdminPartnerships from "./admin/pages/Partnerships";
import AdminDonations from "./admin/pages/Donations";
import AdminImpact from "./admin/pages/Impact";
import AdminAdministrators from "./admin/pages/Administrators";
import AdminSettings from "./admin/pages/Settings";

export default function App() {
  return (
    <Routes>
      {/* PUBLIC WEBSITE */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/get-involved" element={<GetInvolved />} />
        <Route path="/news-events" element={<NewsEvents />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donate" element={<Donate />} />
      </Route>

      {/* ADMIN LOGIN - PUBLIC ACCESS */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* PROTECTED ADMIN DASHBOARD */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="programs" element={<AdminPrograms />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="news-events" element={<AdminNewsEvents />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="volunteers" element={<AdminVolunteers />} />
          <Route path="partnerships" element={<AdminPartnerships />} />
          <Route path="donations" element={<AdminDonations />} />
          <Route path="impact" element={<AdminImpact />} />
          <Route path="administrators" element={<AdminAdministrators />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}
