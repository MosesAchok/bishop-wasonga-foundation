
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await api.post("/contact", formData);

      setStatus({
        type: "success",
        message:
          response.data.message ||
          "Your message has been submitted successfully. Thank you for contacting us!",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "We could not submit your message. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-green-950 px-5 py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-green-300">
            <MessageSquare size={18} />
            <span>CONTACT US</span>
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            Let's Connect and Create Positive Change
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-100">
            Have a question, partnership idea or would like to
            support our work? We would love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-5">

          {/* Contact Information */}
          <div className="lg:col-span-2">
            <span className="font-semibold text-green-700">
              GET IN TOUCH
            </span>

            <h2 className="mt-4 text-3xl font-bold leading-tight text-green-950">
              We Are Here to Listen
            </h2>

            <p className="mt-5 leading-8 text-gray-600">
              Whether you are interested in our programs,
              volunteering, partnerships or supporting our
              initiatives, our team welcomes your enquiry.
            </p>

            <div className="mt-10 space-y-7">

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Mail size={23} />
                </div>

                <div>
                  <h3 className="font-bold text-green-950">
                    Email Enquiries
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Send us a message using the contact form.
                    Our team will get back to you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Phone size={23} />
                </div>

                <div>
                  <h3 className="font-bold text-green-950">
                    Phone Enquiries
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    You can share your phone number in the
                    contact form for follow-up.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <MapPin size={23} />
                </div>

                <div>
                  <h3 className="font-bold text-green-950">
                    Our Location
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Kenya
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-10 rounded-2xl bg-green-950 p-7 text-white">
              <h3 className="text-xl font-bold">
                Working Together for Change
              </h3>

              <p className="mt-3 text-sm leading-7 text-green-100">
                Strong partnerships and community participation
                help us build sustainable solutions and brighter
                futures.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl md:p-10 lg:col-span-3">
            <h2 className="text-2xl font-bold text-green-950">
              Send Us a Message
            </h2>

            <p className="mt-2 text-gray-600">
              Complete the form below and we will receive your enquiry.
            </p>

            {status.message && (
              <div
                className={`mt-6 flex items-start gap-3 rounded-xl p-4 ${
                  status.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
                ) : (
                  <AlertCircle className="mt-0.5 shrink-0" size={20} />
                )}

                <p className="text-sm leading-6">
                  {status.message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email Address *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 07XXXXXXXX"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Subject *
                  </label>

                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is your enquiry about?"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Your Message *
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Write your message here..."
                  required
                  className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-green-700 px-8 py-4 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending Message..." : "Send Message"}
                <Send size={18} />
              </button>

              <p className="text-center text-xs text-gray-500">
                Fields marked with * are required.
              </p>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
}
