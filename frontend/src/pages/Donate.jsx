
import { useState } from "react";
import { Heart, Loader2, Smartphone, CheckCircle, AlertCircle } from "lucide-react";
import api from "../services/api";

export default function Donate() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const amount = Number(formData.amount);

    if (!Number.isSafeInteger(amount) || amount < 1) {
      setFeedback({
        type: "error",
        message: "Please enter a valid whole-number donation amount.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/donations", {
        ...formData,
        amount,
      });

      if (response.data.success) {
        setFeedback({
          type: "success",
          message:
            response.data.message ||
            "Payment request received. Please check your phone.",
        });

        setFormData({
          name: "",
          email: "",
          phone: "",
          amount: "",
          message: "",
        });
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          "We could not process your request. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      <section className="bg-green-900 px-4 py-16 text-center text-white">
        <Heart className="mx-auto mb-4 h-12 w-12 text-green-300" />
        <h1 className="mb-4 text-4xl font-bold">Support Our Mission</h1>
        <p className="mx-auto max-w-2xl text-lg text-green-100">
          Your generosity helps us strengthen communities through education,
          healthcare, environmental conservation and sustainable development.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-green-950">
              Make a Difference
            </h2>
            <p className="leading-7 text-gray-600">
              Every contribution makes a difference. Your donation supports
              programmes and projects that improve lives and create
              opportunities for communities.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-xl font-semibold text-green-900">
              Secure M-Pesa Donation
            </h3>
            <p className="leading-7 text-gray-600">
              Enter your details and donation amount. If payment initiation is
              available, you will receive an M-Pesa payment prompt on your
              phone. Enter your M-Pesa PIN only on your phone.
            </p>
            <div className="mt-5 flex items-center gap-3 text-green-800">
              <Smartphone className="h-6 w-6" />
              <span className="font-medium">Safaricom M-Pesa</span>
            </div>
          </div>

          <div className="rounded-2xl bg-green-100 p-6">
            <h3 className="mb-2 font-semibold text-green-950">
              Thank You for Your Support
            </h3>
            <p className="text-sm leading-6 text-green-900">
              We appreciate every donation, regardless of size. Together, we
              can build stronger and more resilient communities.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <h2 className="mb-2 text-2xl font-bold text-green-950">
            Donation Details
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Complete the form below to proceed.
          </p>

          {feedback && (
            <div
              className={`mb-5 flex gap-3 rounded-lg p-4 text-sm ${
                feedback.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0" />
              )}
              <p>{feedback.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength={150}
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                M-Pesa Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="e.g. 0712345678"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Donation Amount (KES) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="1"
                step="1"
                placeholder="Enter amount in KES"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Message (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                maxLength={3000}
                placeholder="Leave us a message..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-6 py-4 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="h-5 w-5" />
                  Donate with M-Pesa
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-500">
              Your payment will only be complete after Safaricom confirms it.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
