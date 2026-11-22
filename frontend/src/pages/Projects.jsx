
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sprout,
  MapPin,
  CalendarDays,
  FolderOpen,
} from "lucide-react";
import api from "../services/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/projects");
        setProjects(response.data.data || []);
      } catch (err) {
        console.error("Unable to load projects:", err);
        setError("We could not load projects at the moment. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <section className="bg-green-950 px-5 py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="font-bold uppercase tracking-widest text-green-300">
            Our Work in Action
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            Our Projects
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-100">
            Discover the initiatives through which Bishop Wasonga
            Foundation seeks to support communities and create
            opportunities for sustainable development.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white px-5 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-bold uppercase tracking-widest text-green-700">
            Creating Lasting Change
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-green-950">
            Turning Community Priorities into Action
          </h2>

          <p className="mt-5 leading-8 text-gray-600">
            Our projects are designed to respond to community
            priorities in areas such as education, health,
            environmental conservation and community empowerment.
            We believe in working alongside communities to support
            practical and sustainable solutions.
          </p>
        </div>
      </section>

      {/* Projects List */}
      <section className="bg-green-50 px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="font-bold uppercase tracking-widest text-green-700">
              Featured Initiatives
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-green-950 md:text-4xl">
              Explore Our Projects
            </h2>
          </div>

          {loading && (
            <div className="py-16 text-center text-gray-500">
              Loading projects...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl bg-white p-8 text-center text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
              <FolderOpen
                size={45}
                className="mx-auto text-green-700"
              />

              <h3 className="mt-5 text-xl font-bold text-green-950">
                Projects Coming Soon
              </h3>

              <p className="mx-auto mt-3 max-w-lg leading-7 text-gray-600">
                Project information will be published here as
                foundation initiatives are documented and verified.
              </p>
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <article
                  key={project.id || project._id || project.title}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title || "Foundation project"}
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-green-100 text-green-700">
                      <Sprout size={55} />
                    </div>
                  )}

                  <div className="p-7">
                    {project.category && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                        {project.category}
                      </span>
                    )}

                    <h3 className="mt-4 text-xl font-bold text-green-950">
                      {project.title}
                    </h3>

                    <p className="mt-3 leading-7 text-gray-600">
                      {project.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-500">
                      {project.location && (
                        <span className="flex items-center gap-2">
                          <MapPin size={16} />
                          {project.location}
                        </span>
                      )}

                      {project.startDate && (
  <span className="flex items-center gap-2">
    <CalendarDays size={16} />
    {project.startDate}
  </span>
)}
                    </div>

                    {project.status && (
                      <p className="mt-4 text-sm font-semibold text-green-700">
                        Status: {project.status}
                      </p>
                    )}

                    <div className="mt-6 border-t border-gray-100 pt-5">
                      <span className="inline-flex items-center gap-2 font-semibold text-green-700">
                        Foundation Initiative
                        <ArrowRight size={17} />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-white px-5 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-green-950 px-7 py-14 text-center text-white md:px-14">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            Would You Like to Support Our Projects?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-green-100">
            Work with us to support initiatives that strengthen
            communities and contribute to sustainable development.
          </p>

          <a
            href="/get-involved"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 font-bold text-green-900 transition hover:bg-green-100"
          >
            Get Involved <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </div>
  );
}
