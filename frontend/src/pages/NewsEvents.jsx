
import { useEffect, useState } from "react";
import {
  Newspaper,
  CalendarDays,
  Clock,
  MapPin,
  ArrowRight,
  Megaphone,
  CalendarCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function NewsEvents() {
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNewsAndEvents = async () => {
      try {
        const [newsResponse, eventsResponse] = await Promise.all([
          api.get("/news"),
          api.get("/events"),
        ]);

        setNews(newsResponse.data.data || []);
        setEvents(eventsResponse.data.data || []);
      } catch (err) {
        console.error("Unable to load news and events:", err);
        setError("We could not load news and events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsAndEvents();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <section className="bg-green-950 px-5 py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="font-bold uppercase tracking-widest text-green-300">
            Stay Connected
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            News & Events
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-100">
            Keep up with the latest updates, announcements,
            activities and events from Bishop Wasonga Foundation.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white px-5 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-bold uppercase tracking-widest text-green-700">
            What's Happening
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-green-950">
            Stories, Updates and Community Activities
          </h2>

          <p className="mt-5 leading-8 text-gray-600">
            Follow our work and stay informed about initiatives,
            community activities and opportunities to participate
            in sustainable development.
          </p>
        </div>
      </section>

      {/* News Section */}
      <section className="bg-green-50 px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-700 text-white">
              <Newspaper size={28} />
            </div>

            <div>
              <p className="font-bold uppercase tracking-widest text-green-700">
                Latest Updates
              </p>

              <h2 className="text-3xl font-extrabold text-green-950">
                Foundation News
              </h2>
            </div>
          </div>

          {loading && (
            <p className="py-10 text-center text-gray-500">
              Loading news...
            </p>
          )}

          {!loading && error && (
            <p className="rounded-xl bg-white p-6 text-center text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && news.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <Newspaper
                size={45}
                className="mx-auto text-green-700"
              />

              <h3 className="mt-5 text-xl font-bold text-green-950">
                No News Published Yet
              </h3>

              <p className="mt-3 text-gray-600">
                Foundation news and announcements will appear here.
              </p>
            </div>
          )}

          {!loading && !error && news.length > 0 && (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <article
                  key={item.id || item._id || item.title}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title || "Foundation news"}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-green-100 text-green-700">
                      <Megaphone size={48} />
                    </div>
                  )}

                  <div className="p-7">
                    <p className="text-sm font-semibold text-green-700">
                      {item.date || "Foundation Update"}
                    </p>

                    <h3 className="mt-3 text-xl font-bold text-green-950">
                      {item.title}
                    </h3>

                    <p className="mt-3 leading-7 text-gray-600">
                      {item.summary || item.description}
                    </p>

                    {item.category && (
                      <span className="mt-5 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                        {item.category}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Events Section */}
      <section className="bg-white px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-700 text-white">
              <CalendarDays size={28} />
            </div>

            <div>
              <p className="font-bold uppercase tracking-widest text-green-700">
                Mark Your Calendar
              </p>

              <h2 className="text-3xl font-extrabold text-green-950">
                Upcoming Events
              </h2>
            </div>
          </div>

          {!loading && !error && events.length === 0 && (
            <div className="rounded-2xl bg-green-50 p-12 text-center">
              <CalendarCheck
                size={45}
                className="mx-auto text-green-700"
              />

              <h3 className="mt-5 text-xl font-bold text-green-950">
                No Upcoming Events
              </h3>

              <p className="mt-3 text-gray-600">
                New event announcements will be shared here.
              </p>
            </div>
          )}

          {loading && (
            <p className="py-10 text-center text-gray-500">
              Loading events...
            </p>
          )}

          {!loading && !error && events.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {events.map((event) => (
                <article
                  key={event.id || event._id || event.title}
                  className="flex flex-col gap-6 rounded-2xl border border-green-100 bg-white p-7 shadow-sm transition hover:shadow-lg sm:flex-row"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                    <CalendarDays size={30} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-950">
                      {event.title}
                    </h3>

                    <p className="mt-3 leading-7 text-gray-600">
                      {event.description}
                    </p>

                    <div className="mt-5 flex flex-col gap-3 text-sm text-gray-500">
                      {event.date && (
                        <span className="flex items-center gap-2">
                          <CalendarDays size={17} />
                          {event.date}
                        </span>
                      )}

                      {event.time && (
                        <span className="flex items-center gap-2">
                          <Clock size={17} />
                          {event.time}
                        </span>
                      )}

                      {event.location && (
                        <span className="flex items-center gap-2">
                          <MapPin size={17} />
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

      {/* Get Involved CTA */}
      <section className="bg-green-950 px-5 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            Be Part of Our Activities
          </h2>

          <p className="mt-5 leading-8 text-green-100">
            Participate in our initiatives, volunteer your skills
            or partner with us to support community development.
          </p>

          <Link
            to="/get-involved"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 font-bold text-green-900 transition hover:bg-green-100"
          >
            Get Involved <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
