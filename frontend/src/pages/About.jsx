
import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Heart,
  Users,
  BookOpen,
  Handshake,
  Leaf,
  ArrowRight,
} from "lucide-react";

const values = [
  {
    title: "Integrity",
    description:
      "We are committed to honesty, accountability, transparency and responsible leadership.",
    icon: Heart,
  },
  {
    title: "Community Participation",
    description:
      "We believe communities should actively participate in decisions that affect their lives.",
    icon: Users,
  },
  {
    title: "Empowerment",
    description:
      "We promote opportunities that enable individuals and communities to reach their potential.",
    icon: BookOpen,
  },
  {
    title: "Sustainability",
    description:
      "We encourage lasting solutions that protect people, resources and the environment.",
    icon: Leaf,
  },
  {
    title: "Partnership",
    description:
      "We value collaboration with communities, institutions and development partners.",
    icon: Handshake,
  },
];

export default function About() {
  return (
    <>
      {/* Page Hero */}
      <section className="bg-green-950 px-5 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-bold uppercase tracking-widest text-green-300">
            Who We Are
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold sm:text-6xl">
            About Bishop Wasonga Foundation
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-100">
            Building stronger communities through empowerment,
            opportunity and sustainable development.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center">
        <div>
          <span className="font-bold uppercase tracking-widest text-green-700">
            Our Foundation
          </span>

          <h2 className="mt-4 text-3xl font-extrabold text-green-950 sm:text-4xl">
            Working Towards a Better Tomorrow
          </h2>

          <p className="mt-6 leading-8 text-gray-600">
            Bishop Wasonga Foundation is committed to supporting
            community development through initiatives that promote
            education, health, environmental conservation and
            community empowerment.
          </p>

          <p className="mt-4 leading-8 text-gray-600">
            We believe that every community deserves opportunities
            to grow, develop and build a sustainable future.
            Through collaboration and community participation,
            we seek to contribute to meaningful and lasting change.
          </p>
        </div>

        <div>
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=85"
            alt="People working together in a community"
            className="h-96 w-full rounded-3xl object-cover shadow-lg"
          />
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="bg-green-50 px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-9 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-800">
              <Target size={30} />
            </div>

            <h2 className="mt-6 text-2xl font-extrabold text-green-950">
              Our Mission
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              To empower communities through inclusive initiatives
              that promote education, health, environmental
              conservation and sustainable development.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-9 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-800">
              <Eye size={30} />
            </div>

            <h2 className="mt-6 text-2xl font-extrabold text-green-950">
              Our Vision
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              A society where empowered communities enjoy improved
              quality of life, equal opportunities and a sustainable
              future.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="font-bold uppercase tracking-widest text-green-700">
            What Guides Us
          </span>

          <h2 className="mt-3 text-3xl font-extrabold text-green-950 sm:text-4xl">
            Our Core Values
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            These principles guide our commitment to responsible
            community development.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <div
                key={value.title}
                className="rounded-2xl border border-gray-100 p-7 shadow-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-800">
                  <Icon size={28} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-green-950">
                  {value.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Objectives */}
      <section className="bg-stone-50 px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2">
          <div>
            <span className="font-bold uppercase tracking-widest text-green-700">
              Our Purpose
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-green-950">
              Our Development Objectives
            </h2>

            <p className="mt-5 leading-8 text-gray-600">
              We seek to support meaningful development through
              initiatives that address community needs and create
              opportunities for lasting progress.
            </p>
          </div>

          <ul className="space-y-5">
            {[
              "Promote access to education and learning opportunities.",
              "Support community health awareness and wellbeing.",
              "Encourage environmental conservation and sustainability.",
              "Strengthen community participation and empowerment.",
              "Build partnerships that support sustainable development.",
            ].map((objective) => (
              <li key={objective} className="flex gap-3 leading-7 text-gray-700">
                <span className="font-bold text-green-700">✓</span>
                {objective}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-green-900 px-5 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Join Us in Making a Difference
          </h2>

          <p className="mt-5 leading-8 text-green-100">
            Together, we can create opportunities, strengthen
            communities and contribute to sustainable development.
          </p>

          <Link
            to="/get-involved"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-500 px-7 py-4 font-bold text-white hover:bg-green-600"
          >
            Get Involved <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
