
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import DonateButton from "../components/DonateButton";

export default function MainLayout() {
  return (
    <div>
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />

      {/* Floating Action Buttons */}
      <DonateButton />
      <WhatsAppButton />
    </div>
  );
}
