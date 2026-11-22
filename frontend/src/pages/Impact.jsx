
import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  GraduationCap,
  HeartPulse,
  Sprout,
  HandHeart,
  Target,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const impactAreas = [
  {
    title: "Education",
    description:
      "Supporting learning opportunities, skills development and a brighter future for children and young people.",
    icon: GraduationCap,
  },
  {
    title: "Community Health",
    description:
      "Promoting health awareness, prevention and access to community-based health initiatives.",
    icon: HeartPulse,
  },
  {
    title: "Environmental Conservation",
    description:
      "Encouraging environmental protection and responsible management of natural resources.",
    icon: Sprout,
  },
  {
    title: "Community Empowerment",
    description:
      "Supporting individuals and families through participation, partnerships and sustainable development.",
    icon: HandHeart,
  },
];

export default function Impact() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const response = await api.get("/impact");
        setStats(response.data.data || []);
      } catch (err) {
        console.error("Unable to load impact information:", err);
        setError("Impact information could not be loaded. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchImpact();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <section className="bg-green-950 px-5 py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="font-bold uppercase tracking-widest text-green-300">
            Creating Meaningful Change
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            Our Impact
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-100">
            We believe that strong communities are built through
            opportunity, participation and sustainable development.
            Discover the areas where Bishop Wasonga Foundation
            seeks to make a difference.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-bold uppercase tracking-widest text-green-700">
              Why Our Work Matters
            </p>

            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-green-950 md:text-4xl">
              Building a Better Future Together
            </h2>

            <p className="mt-6 leading-8 text-gray-600">
              Meaningful development is about improving people's
              lives and creating opportunities that last. Our work
              focuses on addressing community priorities through
              education, health, environmental conservation and
              empowerment.
            </p>

            <p className="mt-4 leading-8 text-gray-600">
              We value community participation, transparency and
              collaboration as important foundations for lasting
              progress.
            </p>

            <Link
              to="/about"
              className="mt-7 inline-flex items-center gap-2 font-bold text-green-700 hover:text-green-900"
            >
              Learn About Our Foundation <ArrowRight size={18} />
            </Link>
          </div>

          <div className="rounded-3xl bg-green-50 p-9">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-700 text-white">
              <TrendingUp size={34} />
            </div>

            <h3 className="text-2xl font-bold text-green-950">
              Our Vision for Impact
            </h3>

            <p className="mt-4 leading-8 text-gray-600">
              We aim to contribute to resilient communities where
              people can access opportunities, participate in
              development and build sustainable livelihoods.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="bg-green-50 px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="font-bold uppercase tracking-widest text-green-700">
              Measuring Progress
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-green-950 md:text-4xl">
              Our Impact at a Glance
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              These indicators will help communicate our activities
              and progress as verified information becomes available.
            </p>
          </div>

          {loading && (
            <p className="py-10 text-center text-gray-500">
              Loading impact information...
            </p>
          )}

          {!loading && error && (
            <p className="rounded-xl bg-white p-6 text-center text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && stats.length === 0 && (
            <p className="rounded-xl bg-white p-8 text-center text-gray-600">
              Verified impact statistics will be published here.
            </p>
          )}

          {!loading && !error && stats.length > 0 && (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.id || stat._id || stat.label}
                  className="rounded-2xl bg-white p-7 text-center shadow-sm"
                >
                  <h3 className="text-4xl font-extrabold text-green-700">
                    {stat.value}
                  </h3>

                  <p className="mt-3 font-bold text-green-950">
                    {stat.label}
                  </p>

                  {stat.description && (
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {stat.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Areas of Impact */}
      <section className="bg-white px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="font-bold uppercase tracking-widest text-green-700">
              Our Development Priorities
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-green-950 md:text-4xl">
              Where We Aim to Make a Difference
            </h2>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {impactAreas.map((area) => {
              const Icon = area.icon;

              return (
                <div
                  key={area.title}
                  className="rounded-2xl border border-green-100 p-7 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Icon size={28} />
                  </div>

                  <h3 className="text-xl font-bold text-green-950">
                    {area.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600">
                    {area.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="bg-green-950 px-5 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-bold uppercase tracking-widest text-green-300">
              Our Commitment
            </p>

            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
              Accountability, Transparency and Sustainability
            </h2>

            <p className="mt-5 leading-8 text-green-100">
              We recognise the importance of responsible stewardship
              and clear communication. As our initiatives grow, we
              aim to document activities, outcomes and lessons
              learned to help communities and partners understand
              the progress being made.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-green-800 bg-green-900 p-6">
              <Target className="mb-4 text-green-300" size={30} />
              <h3 className="text-lg font-bold">Clear Objectives</h3>
              <p className="mt-2 text-sm leading-7 text-green-100">
                Focusing on community priorities and meaningful goals.
              </p>
            </div>

            <div className="rounded-2xl border border-green-800 bg-green-900 p-6">
              <Users className="mb-4 text-green-300" size={30} />
              <h3 className="text-lg font-bold">Community Voice</h3>
              <p className="mt-2 text-sm leading-7 text-green-100">
                Encouraging participation and shared responsibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-white px-5 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold text-green-950 md:text-4xl">
            Be Part of the Difference
          </h2>

          <p className="mt-5 leading-8 text-gray-600">
            Join us in supporting initiatives that create opportunities
            and contribute to stronger, healthier and more sustainable
            communities.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/get-involved"
              className="rounded-lg bg-green-700 px-7 py-3 font-bold text-white transition hover:bg-green-800"
            >
              Get Involved
            </Link>

            <Link
              to="/contact"
              className="rounded-lg border border-green-700 px-7 py-3 font-bold text-green-700 transition hover:bg-green-700 hover:text-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
