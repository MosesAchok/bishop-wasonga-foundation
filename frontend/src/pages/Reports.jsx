
import { useEffect, useState } from "react";
import axios from "axios";

import {
  FileText,
  Download,
  CalendarDays,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Loader2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/reports";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(API_URL);

        setReports(response.data.data || []);
      } catch (err) {
        console.error("Error fetching reports:", err);

        setError(
          "We could not load our reports at the moment. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Date not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-green-950 px-5 py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-green-300">
            <FileText size={18} />
            <span>REPORTS & PUBLICATIONS</span>
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            Transparency, Accountability and Impact
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-green-100">
            Explore our reports and publications to understand
            our work, progress and commitment to responsible
            community development.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <BookOpen size={30} />
          </div>

          <h2 className="text-3xl font-bold text-green-950 md:text-4xl">
            Our Reports and Publications
          </h2>

          <p className="mt-5 leading-8 text-gray-600">
            We believe that transparency and accountability are
            essential to building trust with our communities,
            partners, supporters and stakeholders.
          </p>
        </div>
      </section>

      {/* Reports */}
      <section className="bg-gray-50 px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-green-950">
              Available Publications
            </h2>

            <p className="mt-3 text-gray-600">
              Access information about our programs and activities.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-green-700">
              <Loader2 size={35} className="animate-spin" />
              <p className="mt-4 text-gray-600">
                Loading reports...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && reports.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
              <FileText
                size={45}
                className="mx-auto text-gray-400"
              />

              <h3 className="mt-5 text-xl font-bold text-green-950">
                No Publications Available Yet
              </h3>

              <p className="mt-3 text-gray-600">
                Our reports and publications will appear here
                once they are published.
              </p>
            </div>
          )}

          {/* Reports List */}
          {!loading && !error && reports.length > 0 && (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-700">
                      <FileText size={27} />
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                      Published
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-green-700">
                    {report.category || "Foundation Report"}
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-green-950">
                    {report.title}
                  </h3>

                  <p className="mt-4 leading-7 text-gray-600">
                    {report.description}
                  </p>

                  <div className="mt-7 space-y-3 border-t border-gray-100 pt-5">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CalendarDays size={17} />
                      <span>
                        Period: {report.period || "Not specified"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CalendarDays size={17} />
                      <span>
                        Published: {formatDate(report.publicationDate)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-gray-100 pt-5">
                    {report.fileUrl ? (
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-semibold text-green-700 transition hover:text-green-900"
                      >
                        <Download size={18} />
                        Download Report
                      </a>
                    ) : (
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-400">
                        <Download size={17} />
                        Document not available
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Accountability Section */}
      <section className="px-5 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <span className="font-semibold text-green-700">
              OUR COMMITMENT
            </span>

            <h2 className="mt-4 text-3xl font-bold leading-tight text-green-950 md:text-4xl">
              Building Trust Through Accountability
            </h2>

            <p className="mt-6 leading-8 text-gray-600">
              Bishop Wasonga Foundation is committed to responsible
              stewardship of resources, meaningful partnerships
              and transparent communication about its activities.
            </p>

            <p className="mt-4 leading-8 text-gray-600">
              We aim to make relevant information accessible to
              stakeholders and demonstrate how our initiatives
              contribute to sustainable community development.
            </p>
          </div>

          <div className="rounded-3xl bg-green-950 p-8 text-white md:p-12">
            <ShieldCheck
              size={48}
              className="mb-6 text-green-300"
            />

            <h3 className="text-2xl font-bold">
              Our Accountability Principles
            </h3>

            <ul className="mt-7 space-y-5">
              {[
                "Responsible use of resources",
                "Transparent communication",
                "Community participation",
                "Monitoring and evaluation",
                "Continuous improvement",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm">
                    ✓
                  </span>
                  <span className="text-green-50">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-green-50 px-5 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-green-950">
            Need More Information?
          </h2>

          <p className="mt-5 leading-8 text-gray-600">
            Contact our team for enquiries about our programs,
            publications and organizational activities.
          </p>

          <a
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-green-700 px-8 py-4 font-bold text-white transition hover:bg-green-800"
          >
            Contact Us
            <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </div>
  );
}
