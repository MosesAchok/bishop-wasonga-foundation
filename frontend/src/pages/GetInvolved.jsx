
import { useState } from "react";
import {
  HeartHandshake,
  HandHeart,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
  Send,
  Clock,
  AlertCircle,
  Wallet,
  LoaderCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const opportunities = [
  {
    title: "Volunteer With Us",
    description:
      "Give your time, skills and experience to support community development activities.",
    icon: HandHeart,
    link: "#volunteer-form",
  },
  {
    title: "Become a Partner",
    description:
      "Work with us through institutional partnerships and collaborative initiatives.",
    icon: Building2,
    link: "#partnership-form",
  },
  {
    title: "Support Our Work",
    description:
      "Contribute resources and other forms of support to advance our mission.",
    icon: HeartHandshake,
    link: "#donation-form",
  },
  {
    title: "Engage Your Community",
    description:
      "Help identify local needs and encourage meaningful community participation.",
    icon: Users,
    link: "#partnership-form",
  },
];

const benefits = [
  "Contribute to meaningful community initiatives.",
  "Share your professional skills and experience.",
  "Build relationships with community members and partners.",
  "Support sustainable development and local empowerment.",
];

const volunteerInitial = {
  name: "",
  email: "",
  phone: "",
  interest: "",
  skills: "",
  availability: "",
  message: "",
};

const partnershipInitial = {
  organization: "",
  contactPerson: "",
  email: "",
  phone: "",
  partnershipType: "",
  message: "",
};

const donationInitial = {
  name: "",
  email: "",
  amount: "",
  message: "",
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100";

function FormStatus({ status }) {
  if (!status.message) return null;

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-xl p-4 ${
        status.type === "success"
          ? "bg-green-50 text-green-800"
          : "bg-red-50 text-red-700"
      }`}
    >
      {status.type === "success" ? (
        <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={20} className="mt-0.5 shrink-0" />
      )}

      <p className="text-sm leading-6">{status.message}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-8">
      <p className="font-bold uppercase tracking-widest text-green-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-extrabold text-green-950 md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 leading-7 text-gray-600">{description}</p>
      )}
    </div>
  );
}

export default function GetInvolved() {
  const [volunteer, setVolunteer] = useState(volunteerInitial);
  const [partnership, setPartnership] = useState(partnershipInitial);
  const [donation, setDonation] = useState(donationInitial);

  const [volunteerStatus, setVolunteerStatus] = useState({
    type: "",
    message: "",
  });

  const [partnershipStatus, setPartnershipStatus] = useState({
    type: "",
    message: "",
  });

  const [donationStatus, setDonationStatus] = useState({
    type: "",
    message: "",
  });

  const [volunteerLoading, setVolunteerLoading] = useState(false);
  const [partnershipLoading, setPartnershipLoading] = useState(false);
  const [donationLoading, setDonationLoading] = useState(false);

  const handleChange = (event, setter) => {
    const { name, value } = event.target;

    setter((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const submitForm = async (
    event,
    endpoint,
    data,
    setData,
    initialData,
    setStatus,
    setLoading,
    successMessage
  ) => {
    event.preventDefault();

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await api.post(endpoint, data);

      setStatus({
        type: "success",
        message: response.data.message || successMessage,
      });

      setData(initialData);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Your submission could not be completed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* PAGE HEADER */}
      <section className="bg-green-950 px-5 py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="font-bold uppercase tracking-widest text-green-300">
            Be Part of the Change
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            Get Involved
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-100">
            Join Bishop Wasonga Foundation in supporting communities,
            creating opportunities and building a more sustainable future.
          </p>

          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 font-bold text-green-900 transition hover:bg-green-100"
          >
            Contact Our Team <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="bg-white px-5 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-bold uppercase tracking-widest text-green-700">
            Together We Can Do More
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-green-950 md:text-4xl">
            Your Participation Makes a Difference
          </h2>

          <p className="mt-6 leading-8 text-gray-600">
            Strong communities are built through shared responsibility
            and collective action. Whether you are an individual,
            organisation, professional or community group, there are
            different ways to contribute to our work.
          </p>
        </div>
      </section>

      {/* OPPORTUNITIES */}
      <section className="bg-green-50 px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="font-bold uppercase tracking-widest text-green-700">
              Ways to Participate
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-green-950 md:text-4xl">
              How You Can Get Involved
            </h2>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {opportunities.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  href={item.link}
                  key={item.title}
                  className="rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Icon size={28} />
                  </div>

                  <h3 className="text-xl font-bold text-green-950">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600">
                    {item.description}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 font-bold text-green-700">
                    Get started <ArrowRight size={16} />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* VOLUNTEER FORM */}
      <section id="volunteer-form" className="scroll-mt-24 bg-white px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <SectionHeading
              eyebrow="Volunteer With Us"
              title="Make Your Time and Skills Count"
              description="We welcome individuals who are passionate about community development and making a positive difference. Complete the application form to express your interest."
            />

            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <HeartHandshake
                  size={26}
                  className="shrink-0 text-green-700"
                />
                <div>
                  <h3 className="font-bold text-green-950">
                    Meaningful Contribution
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Participate in initiatives that support communities
                    and sustainable development.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Users size={26} className="shrink-0 text-green-700" />
                <div>
                  <h3 className="font-bold text-green-950">
                    Community Engagement
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Work with people, organisations and community partners.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock size={26} className="shrink-0 text-green-700" />
                <div>
                  <h3 className="font-bold text-green-950">
                    Flexible Participation
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Tell us about your availability and areas of interest.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl md:p-10 lg:col-span-3">
            <h3 className="text-2xl font-bold text-green-950">
              Volunteer Application
            </h3>

            <p className="mt-2 text-gray-600">
              Please provide your details below.
            </p>

            <FormStatus status={volunteerStatus} />

            <form
              onSubmit={(event) =>
                submitForm(
                  event,
                  "/volunteers",
                  volunteer,
                  setVolunteer,
                  volunteerInitial,
                  setVolunteerStatus,
                  setVolunteerLoading,
                  "Your volunteer application has been received."
                )
              }
              className="mt-8 space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={volunteer.name}
                    onChange={(event) => handleChange(event, setVolunteer)}
                    placeholder="Your full name"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={volunteer.email}
                    onChange={(event) => handleChange(event, setVolunteer)}
                    placeholder="you@example.com"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={volunteer.phone}
                    onChange={(event) => handleChange(event, setVolunteer)}
                    placeholder="e.g. 0712345678"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Area of Interest *
                  </label>
                  <select
                    name="interest"
                    value={volunteer.interest}
                    onChange={(event) => handleChange(event, setVolunteer)}
                    required
                    className={inputClass}
                  >
                    <option value="">Select an area</option>
                    <option value="Education">
                      Education and Youth Empowerment
                    </option>
                    <option value="Health">Community Health</option>
                    <option value="Environment">
                      Environmental Conservation
                    </option>
                    <option value="Community">
                      Community Empowerment
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Skills and Experience
                </label>
                <textarea
                  name="skills"
                  value={volunteer.skills}
                  onChange={(event) => handleChange(event, setVolunteer)}
                  rows="3"
                  placeholder="Tell us about your skills, qualifications or experience..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Your Availability *
                </label>
                <select
                  name="availability"
                  value={volunteer.availability}
                  onChange={(event) => handleChange(event, setVolunteer)}
                  required
                  className={inputClass}
                >
                  <option value="">Select your availability</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Weekends">Weekends</option>
                  <option value="Occasionally">Occasionally</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Why Would You Like to Volunteer? *
                </label>
                <textarea
                  name="message"
                  value={volunteer.message}
                  onChange={(event) => handleChange(event, setVolunteer)}
                  rows="4"
                  placeholder="Tell us why you would like to join us..."
                  required
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={volunteerLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-green-700 px-8 py-4 font-bold text-white transition hover:bg-green-800 disabled:opacity-60"
              >
                {volunteerLoading ? "Submitting..." : "Submit Volunteer Application"}
                {volunteerLoading ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* PARTNERSHIP FORM */}
      <section id="partnership-form" className="scroll-mt-24 bg-green-50 px-5 py-20">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Become a Partner"
            title="Let's Build Stronger Partnerships"
            description="We welcome enquiries from organisations, institutions, businesses and individuals interested in collaborating with Bishop Wasonga Foundation."
          />

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl md:p-10">
            <h3 className="text-2xl font-bold text-green-950">
              Partnership Enquiry
            </h3>

            <p className="mt-2 text-gray-600">
              Tell us about your organisation and the partnership you have in mind.
            </p>

            <div className="mt-6">
              <FormStatus status={partnershipStatus} />
            </div>

            <form
              onSubmit={(event) =>
                submitForm(
                  event,
                  "/partnerships",
                  partnership,
                  setPartnership,
                  partnershipInitial,
                  setPartnershipStatus,
                  setPartnershipLoading,
                  "Your partnership enquiry has been received."
                )
              }
              className="mt-6 space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Organisation / Company Name *
                  </label>
                  <input
                    name="organization"
                    value={partnership.organization}
                    onChange={(event) => handleChange(event, setPartnership)}
                    placeholder="Organisation name"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Contact Person *
                  </label>
                  <input
                    name="contactPerson"
                    value={partnership.contactPerson}
                    onChange={(event) => handleChange(event, setPartnership)}
                    placeholder="Full name"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={partnership.email}
                    onChange={(event) => handleChange(event, setPartnership)}
                    placeholder="you@example.com"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={partnership.phone}
                    onChange={(event) => handleChange(event, setPartnership)}
                    placeholder="e.g. 0712345678"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Type of Partnership *
                </label>
                <select
                  name="partnershipType"
                  value={partnership.partnershipType}
                  onChange={(event) => handleChange(event, setPartnership)}
                  required
                  className={inputClass}
                >
                  <option value="">Select partnership type</option>
                  <option value="Funding Partnership">Funding Partnership</option>
                  <option value="Programme Collaboration">Programme Collaboration</option>
                  <option value="Corporate Partnership">Corporate Partnership</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Institutional Partnership">Institutional Partnership</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tell Us About Your Proposal *
                </label>
                <textarea
                  name="message"
                  value={partnership.message}
                  onChange={(event) => handleChange(event, setPartnership)}
                  rows="5"
                  placeholder="Describe your organisation and how you would like to work with us..."
                  required
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={partnershipLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-green-700 px-8 py-4 font-bold text-white transition hover:bg-green-800 disabled:opacity-60"
              >
                {partnershipLoading ? "Submitting..." : "Submit Partnership Enquiry"}
                {partnershipLoading ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* DONATION / SUPPORT ENQUIRY */}
      <section id="donation-form" className="scroll-mt-24 bg-white px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <SectionHeading
              eyebrow="Support Our Mission"
              title="Your Support Can Make a Difference"
              description="Your contribution can help support education, community health, environmental conservation and community empowerment initiatives."
            />

            <div className="rounded-2xl bg-green-50 p-6">
              <Wallet size={35} className="mb-4 text-green-700" />
              <h3 className="text-xl font-bold text-green-950">
                Support the Foundation
              </h3>
              <p className="mt-3 leading-7 text-gray-600">
                If you would like to support our work financially, please
                submit an enquiry. Our team can follow up with you about
                the available contribution arrangements.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-green-100 p-6">
              <p className="font-bold text-green-950">
                Online payments coming later
              </p>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                Secure online donations through Paystack will be introduced
                after the website development is complete.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl md:p-10 lg:col-span-3">
            <h3 className="text-2xl font-bold text-green-950">
              Donation / Support Enquiry
            </h3>

            <p className="mt-2 text-gray-600">
              Leave your details and let us know how you would like to support us.
            </p>

            <div className="mt-6">
              <FormStatus status={donationStatus} />
            </div>

            <form
              onSubmit={(event) =>
                submitForm(
                  event,
                  "/donations",
                  donation,
                  setDonation,
                  donationInitial,
                  setDonationStatus,
                  setDonationLoading,
                  "Thank you for your interest in supporting our foundation."
                )
              }
              className="mt-6 space-y-6"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={donation.name}
                  onChange={(event) => handleChange(event, setDonation)}
                  placeholder="Your full name"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={donation.email}
                  onChange={(event) => handleChange(event, setDonation)}
                  placeholder="you@example.com"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Intended Contribution Amount (Optional)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={donation.amount}
                  onChange={(event) => handleChange(event, setDonation)}
                  min="1"
                  placeholder="Enter amount in KSh"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Message
                </label>
                <textarea
                  name="message"
                  value={donation.message}
                  onChange={(event) => handleChange(event, setDonation)}
                  rows="5"
                  placeholder="Tell us how you would like to support the Foundation..."
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={donationLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-green-700 px-8 py-4 font-bold text-white transition hover:bg-green-800 disabled:opacity-60"
              >
                {donationLoading ? "Submitting..." : "Submit Support Enquiry"}
                {donationLoading ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>

              <p className="text-center text-xs text-gray-500">
                This form submits an enquiry only. It does not process payments.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* WHY PARTICIPATE */}
      <section className="bg-green-50 px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-bold uppercase tracking-widest text-green-700">
              Make Your Contribution Count
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-green-950 md:text-4xl">
              Why Get Involved?
            </h2>

            <p className="mt-5 leading-8 text-gray-600">
              Your contribution can help strengthen communities and support
              initiatives that respond to real needs. Every contribution,
              whether through time, skills, partnerships or resources,
              can play a valuable role.
            </p>

            <div className="mt-7 space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-1 shrink-0 text-green-700"
                    size={20}
                  />
                  <p className="leading-7 text-gray-600">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-green-950 p-8 text-white md:p-10">
            <HeartHandshake size={48} className="mb-6 text-green-300" />

            <h3 className="text-2xl font-bold">Let's Work Together</h3>

            <p className="mt-4 leading-8 text-green-100">
              We welcome conversations with individuals, organisations,
              institutions and community groups interested in contributing
              to sustainable development.
            </p>

            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-bold text-green-900 transition hover:bg-green-100"
            >
              Send an Enquiry <Send size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-white px-5 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold text-green-950 md:text-4xl">
            Ready to Make a Difference?
          </h2>

          <p className="mt-5 leading-8 text-gray-600">
            Get in touch with Bishop Wasonga Foundation and discover
            how we can work together.
          </p>

          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-green-700 px-7 py-3 font-bold text-white transition hover:bg-green-800"
          >
            Contact Us <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
