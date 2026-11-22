
import { Link } from "react-router-dom";
import { HandHeart } from "lucide-react";

const DonateButton = () => {
  return (
    <Link
      to="/donate"
      aria-label="Donate to Bishop Wasonga Foundation"
      title="Support our mission - Donate"
      className="fixed bottom-6 left-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#F4B400] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#D99D00] sm:h-16 sm:w-16"
    >
      <HandHeart size={32} strokeWidth={2.5} />

      <span className="absolute -right-1 -top-1 flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-200 opacity-75"></span>
        <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-yellow-500"></span>
      </span>
    </Link>
  );
};

export default DonateButton;
