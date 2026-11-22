
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-green-950 text-white">

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-14 lg:px-8">

        {/* DESKTOP: FOUR COLUMNS */}
        <div className="hidden grid-cols-4 gap-10 md:grid">

          {/* SECTION 1: LOGO AND ABOUT */}
          <div>
            <Link to="/" className="mb-5 inline-block">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-green-500 bg-green-800 text-2xl font-bold">
                  B
                </div>

                <div>
                  <h2 className="text-lg font-extrabold">
                    Bishop Wasonga
                  </h2>
                  <p className="text-xs font-bold tracking-widest text-green-400">
                    FOUNDATION
                  </p>
                </div>
              </div>
            </Link>

            <p className="text-sm leading-7 text-green-100">
              Bishop Wasonga Foundation is committed to empowering
              communities through education, health, environmental
              conservation and sustainable development.
            </p>

            <p className="mt-4 text-sm font-semibold text-green-300">
              Together for a better tomorrow.
            </p>
          </div>

          {/* SECTION 2: QUICK LINKS */}
          <div>
            <h3 className="mb-5 text-lg font-bold">Quick Links</h3>

            <div className="flex flex-col gap-3 text-sm text-green-100">
              <Link to="/" className="hover:text-green-400">Home</Link>
              <Link to="/about" className="hover:text-green-400">About Us</Link>
              <Link to="/programs" className="hover:text-green-400">Our Programs</Link>
              <Link to="/projects" className="hover:text-green-400">Our Projects</Link>
              <Link to="/impact" className="hover:text-green-400">Our Impact</Link>
              <Link to="/news-events" className="hover:text-green-400">News & Events</Link>
              <Link to="/gallery" className="hover:text-green-400">Gallery</Link>
              <Link to="/contact" className="hover:text-green-400">Contact Us</Link>
            </div>
          </div>

          {/* SECTION 3: CONTACT */}
          <div>
            <h3 className="mb-5 text-lg font-bold">Contact Us</h3>

            <div className="space-y-4 text-sm text-green-100">
              <p>Location: Kenya</p>
              <p>Email: Contact details coming soon.</p>
              <p>Phone: Phone number coming soon.</p>
            </div>

            <Link
              to="/contact"
              className="mt-6 inline-block text-sm font-bold text-green-300 hover:text-white"
            >
              Contact our team →
            </Link>
          </div>

          {/* SECTION 4: SOCIAL LINKS */}
          <div>
            <h3 className="mb-5 text-lg font-bold">Connect With Us</h3>

            <p className="mb-5 text-sm leading-6 text-green-100">
              Follow our journey as we work towards stronger and more
              empowered communities.
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="#" className="rounded-full border border-green-700 bg-green-900 px-3 py-2 text-sm hover:bg-green-700">Facebook</a>
              <a href="#" className="rounded-full border border-green-700 bg-green-900 px-3 py-2 text-sm hover:bg-green-700">Instagram</a>
              <a href="#" className="rounded-full border border-green-700 bg-green-900 px-3 py-2 text-sm hover:bg-green-700">LinkedIn</a>
              <a href="#" className="rounded-full border border-green-700 bg-green-900 px-3 py-2 text-sm hover:bg-green-700">YouTube</a>
            </div>

            <Link
              to="/get-involved"
              className="mt-7 inline-block rounded-full bg-green-500 px-5 py-3 text-sm font-bold hover:bg-green-600"
            >
              Get Involved →
            </Link>
          </div>
        </div>

        {/* MOBILE: TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:hidden">

          <div>
            <h3 className="mb-4 text-base font-bold">Get Involved</h3>

            <p className="mb-4 text-xs leading-6 text-green-100">
              Be part of the change. Help us build stronger communities.
            </p>

            <Link
              to="/get-involved"
              className="inline-block rounded-full bg-green-500 px-3 py-2.5 text-xs font-bold hover:bg-green-600"
            >
              Get Involved →
            </Link>

            <Link to="/programs" className="mt-4 block text-xs text-green-300">
              Explore Programs →
            </Link>

            <Link to="/projects" className="mt-3 block text-xs text-green-300">
              View Our Projects →
            </Link>
          </div>

          <div>
            <h3 className="mb-4 text-base font-bold">Contact Us</h3>

            <div className="space-y-4 text-xs leading-5 text-green-100">
              <p>Location: Kenya</p>
              <p>Email: Contact details coming soon.</p>
              <p>Phone: Phone number coming soon.</p>
            </div>

            <Link to="/contact" className="mt-5 block text-xs font-bold text-green-300">
              Contact Us →
            </Link>
          </div>

          <div className="col-span-2">
            <h3 className="mb-4 text-base font-bold">Follow Our Journey</h3>

            <div className="flex flex-wrap gap-3">
              <a href="#" className="rounded-full border border-green-700 bg-green-900 px-3 py-2 text-xs hover:bg-green-700">Facebook</a>
              <a href="#" className="rounded-full border border-green-700 bg-green-900 px-3 py-2 text-xs hover:bg-green-700">Instagram</a>
              <a href="#" className="rounded-full border border-green-700 bg-green-900 px-3 py-2 text-xs hover:bg-green-700">LinkedIn</a>
              <a href="#" className="rounded-full border border-green-700 bg-green-900 px-3 py-2 text-xs hover:bg-green-700">YouTube</a>
            </div>
          </div>

        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-green-800 px-4 py-5 text-center">
        <p className="text-xs leading-6 text-green-200 sm:text-sm">
          © {new Date().getFullYear()} Bishop Wasonga Foundation.
          All rights reserved.
        </p>

        <p className="mt-1 text-xs text-green-400">
          Empowering Communities. Transforming Lives.
        </p>
      </div>

    </footer>
  );
}
