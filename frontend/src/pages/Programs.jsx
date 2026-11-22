
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  HeartPulse,
  Leaf,
  Users,
  ArrowRight,
  HandHeart,
} from "lucide-react";
import api from "../services/api";

const icons = {
  Education: BookOpen,
  Health: HeartPulse,
  Environment: Leaf,
  Empowerment: Users,
};

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await api.get("/programs");
        setPrograms(response.data.data || []);
      } catch (err) {
        console.error("Programs loading error:", err);
        setError("Unable to load programs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <>
      <section className="bg-green-950 px-5 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-bold uppercase tracking-widest text-green-300">
            What We Do
          </p>
          <h1 className="mt-5 text-4xl font-extrabold sm:text-6xl">
            Our Programs
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-100">
            Our programs focus on empowering individuals and
            strengthening communities through sustainable initiatives.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="font-bold uppercase tracking-widest text-green-700">
            Our Areas of Work
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-green-950 sm:text-4xl">
            Creating Opportunities for Communities
          </h2>
          <p className="mt-5 leading-8 text-gray-600">
            We work towards improving quality of life through
            initiatives that address important community needs.
          </p>
        </div>

        {loading && (
          <p className="py-12 text-center text-gray-500">
            Loading programs...
          </p>
        )}

        {error && (
          <p className="py-12 text-center text-red-600">{error}</p>
        )}

        {!loading && !error && programs.length === 0 && (
          <p className="py-12 text-center text-gray-500">
            No programs have been published yet.
          </p>
        )}

        {!loading && !error && programs.length > 0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => {
              const Icon = icons[program.category] || HandHeart;

              return (
                <article
                  key={program.id}
                  className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                    <Icon size={32} />
                  </div>

                  <span className="mt-6 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">
                    {program.category}
                  </span>

                  <h3 className="mt-4 text-xl font-extrabold text-green-950">
                    {program.title}
                  </h3>

                  <p className="mt-4 leading-7 text-gray-600">
                    {program.description}
                  </p>

                  <p className="mt-5 text-sm font-semibold text-green-700">
                    Status: {program.status}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-green-50 px-5 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <HandHeart className="mx-auto text-green-800" size={48} />
          <h2 className="mt-5 text-3xl font-extrabold text-green-950">
            Support Our Programs
          </h2>
          <p className="mt-4 leading-8 text-gray-600">
            Partner with us and help support initiatives that
            contribute to sustainable community development.
          </p>
          <Link
            to="/get-involved"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-800 px-7 py-4 font-bold text-white hover:bg-green-900"
          >
            Get Involved <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
