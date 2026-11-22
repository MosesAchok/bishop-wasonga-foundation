
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Lightbulb,
  Handshake,
  Sprout,
  GraduationCap,
  Heart,
  House,
  Newspaper,
  CalendarDays,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Hero from "../components/Hero";

const focusAreas = [
  {
    title: "Education and Youth Empowerment",
    description:
      "Supporting access to education, skills development and opportunities that help young people build a better future.",
    icon: GraduationCap,
  },
  {
    title: "Community Health",
    description:
      "Promoting healthier communities through health awareness, prevention and community-based initiatives.",
    icon: Heart,
  },
  {
    title: "Environmental Conservation",
    description:
      "Encouraging environmental protection, sustainable resource use and community participation in conservation.",
    icon: Sprout,
  },
  {
    title: "Community Empowerment",
    description:
      "Strengthening communities through participation, skills development and sustainable livelihood initiatives.",
    icon: House,
  },
];

const approachAreas = [
  {
    title: "Community Participation",
    description:
      "We encourage communities to take an active role in identifying their needs and shaping solutions.",
    icon: Handshake,
  },
  {
    title: "Sustainable Solutions",
    description:
      "We support practical initiatives designed to create lasting positive change.",
    icon: Sprout,
  },
  {
    title: "Partnership and Collaboration",
    description:
      "We believe meaningful progress grows through cooperation with communities and development partners.",
    icon: Lightbulb,
  },
];

const peopleWeServe = [
  "Children and young people",
  "Women and families",
  "Vulnerable households",
  "Rural and underserved communities",
  "Community groups and local organisations",
];

const sectionPadding = "px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20";
const sectionContainer = "mx-auto w-full max-w-7xl";
const sectionTitle =
  "mt-3 text-2xl font-extrabold leading-tight text-green-950 sm:text-3xl md:text-4xl";
const sectionDescription =
  "mt-4 text-base leading-7 text-gray-600 sm:text-lg sm:leading-8";

function SectionLabel({ children, light = false }) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-widest sm:text-sm ${
        light ? "text-green-300" : "text-green-700"
      }`}
    >
      {children}
    </p>
  );
}

function LoadingMessage({ children }) {
  return (
    <p className="py-8 text-center text-base text-gray-500 sm:text-lg">
      {children}
    </p>
  );
}

export default function Home() {
  const [programs, setPrograms] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState([]);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [expandedTeamMember, setExpandedTeamMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [
          programResponse,
          projectResponse,
          impactResponse,
          newsResponse,
          eventResponse,
          teamResponse,
        ] = await Promise.all([
          api.get("/programs"),
          api.get("/projects"),
          api.get("/impact"),
          api.get("/news"),
          api.get("/events"),
          api.get("/team"),
        ]);

        setPrograms(programResponse.data.data || []);
        setProjects(projectResponse.data.data || []);
        setStats(impactResponse.data.data || []);
        setNews(newsResponse.data.data || []);
        setEvents(eventResponse.data.data || []);
        setTeamMembers(teamResponse.data.data || []);
      } catch (error) {
        console.error("Unable to load homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="w-full overflow-hidden">
      {/* Hero */}
      <Hero />

      {/* Introduction */}
      <section className={`bg-white ${sectionPadding}`}>
        <div className={`${sectionContainer} grid items-center gap-8 md:grid-cols-2 md:gap-12`}>
          <div className="min-w-0">
            <SectionLabel>
              Welcome to Bishop Wasonga Foundation
            </SectionLabel>

            <h2 className={sectionTitle}>
              Building stronger communities and creating opportunities for all
            </h2>

            <p className={sectionDescription}>
              Bishop Wasonga Foundation is committed to supporting community
              development through education, health, environmental conservation
              and empowerment initiatives. We believe that lasting change
              begins when communities participate in shaping their own future.
            </p>

            <Link
              to="/about"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-6 py-3 text-base font-semibold text-white transition hover:bg-green-800 sm:mt-7 sm:w-auto"
            >
              Learn More About Us <ArrowRight size={18} />
            </Link>
          </div>

          <div className="rounded-2xl bg-green-50 p-6 sm:rounded-3xl sm:p-8 lg:p-10">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-700 text-white">
              <Heart size={30} />
            </div>

            <h3 className="text-xl font-bold text-green-950 sm:text-2xl">
              Our Commitment
            </h3>

            <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              We work towards a future where individuals and families have
              access to opportunities, essential services and the resources
              they need to thrive.
            </p>
          </div>
        </div>
      </section>

      {/* Areas of Focus */}
      <section className={`bg-green-50 ${sectionPadding}`}>
        <div className={sectionContainer}>
          <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12">
            <SectionLabel>What We Do</SectionLabel>

            <h2 className={sectionTitle}>Our Areas of Focus</h2>

            <p className={sectionDescription}>
              Our work focuses on important areas that contribute to healthier,
              stronger and more resilient communities.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {focusAreas.map((area) => {
              const Icon = area.icon;

              return (
                <div
                  key={area.title}
                  className="h-full rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Icon size={28} />
                  </div>

                  <h3 className="text-lg font-bold leading-snug text-green-950 sm:text-xl">
                    {area.title}
                  </h3>

                  <p className="mt-3 text-base leading-7 text-gray-600">
                    {area.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className={`bg-white ${sectionPadding}`}>
        <div className={sectionContainer}>
          <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12">
            <SectionLabel>How We Work</SectionLabel>

            <h2 className={sectionTitle}>
              Our Approach to Community Development
            </h2>

            <p className={sectionDescription}>
              We believe sustainable development is achieved through inclusive
              participation, practical solutions and strong partnerships.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-7">
            {approachAreas.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="h-full rounded-2xl border border-green-100 p-6 transition hover:border-green-300 hover:shadow-lg sm:p-8"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <Icon size={28} />
                  </div>

                  <h3 className="text-lg font-bold leading-snug text-green-950 sm:text-xl">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-base leading-7 text-gray-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      

      {/* Programs */}
      <section className={`bg-green-50 ${sectionPadding}`}>
        <div className={sectionContainer}>
          <div className="mb-9 flex flex-col justify-between gap-5 sm:mb-12 md:flex-row md:items-end">
            <div>
              <SectionLabel>Our Work</SectionLabel>

              <h2 className={sectionTitle}>Our Programs</h2>

              <p className={`${sectionDescription} max-w-2xl`}>
                Explore the key areas through which we support community
                development.
              </p>
            </div>

            <Link
              to="/programs"
              className="inline-flex min-h-11 w-fit items-center gap-2 font-bold text-green-700 hover:text-green-900"
            >
              View All Programs <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <LoadingMessage>Loading programs...</LoadingMessage>
          ) : programs.length === 0 ? (
            <LoadingMessage>
              Programs will be displayed here soon.
            </LoadingMessage>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {programs.slice(0, 4).map((program) => (
                <div
                  key={program.id || program._id || program.title}
                  className="h-full rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-lg sm:p-7"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Sprout size={25} />
                  </div>

                  <h3 className="text-lg font-bold leading-snug text-green-950">
                    {program.title}
                  </h3>

                  <p className="mt-3 text-base leading-7 text-gray-600">
                    {program.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Projects */}
      <section className={`bg-white ${sectionPadding}`}>
        <div className={sectionContainer}>
          <div className="mb-9 text-center sm:mb-12">
            <SectionLabel>Making a Difference</SectionLabel>

            <h2 className={sectionTitle}>Featured Projects</h2>
          </div>

          {loading ? (
            <LoadingMessage>Loading projects...</LoadingMessage>
          ) : projects.length === 0 ? (
            <LoadingMessage>
              Project information will be available soon.
            </LoadingMessage>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 3).map((project) => (
                <article
                  key={project.id || project._id || project.title}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg"
                >
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="h-48 w-full object-cover sm:h-52"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-green-100 text-green-700 sm:h-52">
                      <Sprout size={48} />
                    </div>
                  )}

                  <div className="p-6 sm:p-7">
                    <h3 className="text-lg font-bold leading-snug text-green-950 sm:text-xl">
                      {project.title}
                    </h3>

                    <p className="mt-3 text-base leading-7 text-gray-600">
                      {project.description}
                    </p>

                    <Link
                      to="/projects"
                      className="mt-5 inline-flex min-h-10 items-center gap-2 font-semibold text-green-700 hover:text-green-900"
                    >
                      Learn More <ArrowRight size={17} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-9 text-center sm:mt-10">
            <Link
              to="/projects"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-green-700 px-6 py-3 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white sm:w-auto"
            >
              Explore All Projects <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className={`bg-green-950 text-white ${sectionPadding}`}>
        <div className={`${sectionContainer} grid gap-8 md:grid-cols-2 md:items-center md:gap-12`}>
          <div>
            <SectionLabel light>Our Communities</SectionLabel>

            <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl">
              Who We Serve
            </h2>

            <p className="mt-5 text-base leading-7 text-green-100 sm:text-lg sm:leading-8">
              Our work is centred on people and communities. We seek to support
              those who can benefit from inclusive opportunities, stronger
              services and sustainable development initiatives.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {peopleWeServe.map((person) => (
              <div
                key={person}
                className="flex min-h-16 items-center gap-3 rounded-xl border border-green-800 bg-green-900/60 p-4 sm:p-5"
              >
                <Heart className="shrink-0 text-green-300" size={21} />
                <span className="text-base font-medium text-green-50">
                  {person}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className={`bg-green-50 ${sectionPadding}`}>
        <div className={sectionContainer}>
          <div className="mb-9 text-center sm:mb-12">
            <SectionLabel>Our Progress</SectionLabel>

            <h2 className={sectionTitle}>Our Impact</h2>

            <p className={sectionDescription}>
              A look at the areas in which we aim to make a difference.
            </p>
          </div>

          {loading ? (
            <LoadingMessage>Loading impact information...</LoadingMessage>
          ) : stats.length === 0 ? (
            <LoadingMessage>
              Impact information will be available soon.
            </LoadingMessage>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.id || stat._id || stat.label}
                  className="flex h-full flex-col justify-center rounded-2xl bg-white p-4 text-center shadow-sm sm:p-7"
                >
                  <h3 className="text-3xl font-extrabold text-green-700 sm:text-4xl">
                    {stat.value}
                  </h3>

                  <p className="mt-3 text-sm font-semibold leading-snug text-green-950 sm:text-base">
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

      {/* Impact Stories */}
      <section className={`bg-white ${sectionPadding}`}>
        <div className={sectionContainer}>
          <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12">
            <SectionLabel>Voices and Experiences</SectionLabel>

            <h2 className={sectionTitle}>Stories of Change</h2>

            <p className={sectionDescription}>
              Every community initiative should be measured by the positive
              difference it makes in people's lives.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7">
            <div className="rounded-2xl bg-green-50 p-6 sm:p-8">
              <Heart className="mb-5 text-green-700" size={30} />

              <h3 className="text-xl font-bold text-green-950">
                Community Voices
              </h3>

              <p className="mt-3 text-base leading-7 text-gray-600">
                We value the experiences and perspectives of the communities
                we work alongside. Their voices help shape meaningful and
                sustainable initiatives.
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-6 sm:p-8">
              <Handshake className="mb-5 text-amber-700" size={30} />

              <h3 className="text-xl font-bold text-green-950">
                Shared Progress
              </h3>

              <p className="mt-3 text-base leading-7 text-gray-600">
                Lasting progress grows when community members, organisations
                and partners work together towards shared goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className={`bg-green-50 ${sectionPadding}`}>
        <div className={sectionContainer}>
          <div className="mb-9 flex flex-col justify-between gap-4 sm:mb-12 md:flex-row md:items-end">
            <div>
              <SectionLabel>Stay Informed</SectionLabel>

              <h2 className={sectionTitle}>Latest News</h2>
            </div>

            <Link
              to="/news-events"
              className="inline-flex min-h-11 w-fit items-center gap-2 font-bold text-green-700 hover:text-green-900"
            >
              View All News <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <LoadingMessage>Loading news...</LoadingMessage>
          ) : news.length === 0 ? (
            <LoadingMessage>
              News and updates will appear here soon.
            </LoadingMessage>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {news.slice(0, 3).map((item) => (
                <article
                  key={item.id || item._id || item.title}
                  className="h-full rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-lg sm:p-7"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Newspaper size={25} />
                  </div>

                  <p className="text-sm font-semibold text-green-700">
                    {item.date || "Latest update"}
                  </p>

                  <h3 className="mt-3 text-lg font-bold leading-snug text-green-950 sm:text-xl">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-base leading-7 text-gray-600">
                    {item.summary || item.description}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className={`bg-white ${sectionPadding}`}>
        <div className={sectionContainer}>
          <div className="mb-9 text-center sm:mb-12">
            <SectionLabel>Get Involved</SectionLabel>

            <h2 className={sectionTitle}>Upcoming Events</h2>

            <p className={sectionDescription}>
              Find out about activities and opportunities to participate.
            </p>
          </div>

          {loading ? (
            <LoadingMessage>Loading events...</LoadingMessage>
          ) : events.length === 0 ? (
            <LoadingMessage>
              Upcoming events will be announced here.
            </LoadingMessage>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              {events.slice(0, 2).map((event) => (
                <article
                  key={event.id || event._id || event.title}
                  className="flex flex-col gap-4 rounded-2xl border border-green-100 p-5 sm:flex-row sm:gap-5 sm:p-7"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700 sm:h-16 sm:w-16">
                    <CalendarDays size={30} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold leading-snug text-green-950 sm:text-xl">
                      {event.title}
                    </h3>

                    <p className="mt-3 text-base leading-7 text-gray-600">
                      {event.description}
                    </p>

                    <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:flex-wrap sm:gap-4">
                      {event.date && (
                        <span className="flex items-center gap-2">
                          <CalendarDays size={16} className="shrink-0" />
                          {event.date}
                        </span>
                      )}

                      {event.time && (
                        <span className="flex items-center gap-2">
                          <Clock size={16} className="shrink-0" />
                          {event.time}
                        </span>
                      )}

                      {event.location && (
                        <span className="flex items-center gap-2">
                          <MapPin size={16} className="shrink-0" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* Ways to Support Us */}
      <section className={`bg-green-50 ${sectionPadding}`}>
        <div className={`${sectionContainer} text-center`}>
          <SectionLabel>Be Part of the Change</SectionLabel>

          <h2 className={sectionTitle}>Ways to Support Our Work</h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
            Positive change is possible when people and organisations come
            together. You can support community development through
            volunteering, partnerships and contributions.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-9 sm:flex-row sm:gap-4">
            <Link
              to="/get-involved"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-green-700 px-7 py-3 font-semibold text-white transition hover:bg-green-800 sm:w-auto"
            >
              Become a Volunteer
            </Link>

            <Link
              to="/contact"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-green-700 px-7 py-3 font-semibold text-green-700 transition hover:bg-green-700 hover:text-white sm:w-auto"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </section>



          {/* Meet Our Team */}
      <section className={`bg-white ${sectionPadding}`}>
        <div className={sectionContainer}>
          <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-12">
            <SectionLabel>The People Behind Our Work</SectionLabel>

            <h2 className={sectionTitle}>Meet Our Team</h2>

            <p className={sectionDescription}>
              Meet the dedicated people working together to strengthen
              communities and create lasting positive change.
            </p>
          </div>

          {loading ? (
            <LoadingMessage>Loading team members...</LoadingMessage>
          ) : teamMembers.length === 0 ? (
            <LoadingMessage>
              Our team profiles will be displayed here soon.
            </LoadingMessage>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {teamMembers.map((member) => {
                const memberId = member.id || member._id || member.name;
                const isExpanded = expandedTeamMember === memberId;

                return (
                  <article
                    key={memberId}
                    className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:shadow-lg"
                  >
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="h-36 w-full object-cover sm:h-52"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center bg-green-100 text-green-700 sm:h-52">
                        <Users size={48} />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-3 sm:p-5">
                      <h3 className="break-words text-base font-bold leading-snug text-green-950 sm:text-lg">
                        {member.name}
                      </h3>

                      <p className="mt-1 text-xs font-semibold text-green-700 sm:text-sm">
                        {member.position}
                      </p>

                      <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
                        {member.shortDescription}
                      </p>

                      {isExpanded && (
                        <div className="mt-4 border-t border-green-100 pt-3">
                          <p className="whitespace-pre-line text-sm leading-6 text-gray-600">
                            {member.biography}
                          </p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTeamMember(isExpanded ? null : memberId)
                        }
                        aria-expanded={isExpanded}
                        className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-green-700 transition hover:text-green-900"
                      >
                        {isExpanded ? "Read Less" : "Read More"}
                        <ArrowRight
                          size={16}
                          className={`transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      
      {/* Final Call to Action */}
      <section className={`bg-green-950 text-center text-white ${sectionPadding}`}>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl">
            Together, We Can Build a Better Future
          </h2>

          <p className="mt-5 text-base leading-7 text-green-100 sm:text-lg sm:leading-8">
            Join us in creating opportunities, strengthening communities and
            supporting sustainable development.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4">
            <Link
              to="/get-involved"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-white px-7 py-3 font-bold text-green-900 transition hover:bg-green-100 sm:w-auto"
            >
              Get Involved
            </Link>

            <Link
              to="/contact"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-white px-7 py-3 font-bold text-white transition hover:bg-white hover:text-green-900 sm:w-auto"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
