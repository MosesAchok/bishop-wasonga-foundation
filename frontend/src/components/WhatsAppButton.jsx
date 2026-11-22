
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const whatsappLink =
    "https://wa.me/254758031413?text=Hello";

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Bishop Wasonga Foundation on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#20BA5A] sm:h-16 sm:w-16"
    >
      <MessageCircle size={32} strokeWidth={2.5} />

      <span className="absolute -right-1 -top-1 flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75"></span>
        <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-green-500"></span>
      </span>
    </a>
  );
};

export default WhatsAppButton;
