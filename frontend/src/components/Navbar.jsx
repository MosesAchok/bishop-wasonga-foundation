
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Heart, Leaf } from "lucide-react";

const links = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Programs", path: "/programs" },
  { name: "Projects", path: "/projects" },
  { name: "Our Impact", path: "/impact" },
  { name: "News & Events", path: "/news-events" },
  { name: "Gallery", path: "/gallery" },
  { name: "Reports", path: "/reports" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkStyle = ({ isActive }) =>
    `text-base font-semibold transition-colors duration-200 hover:text-green-700 ${
      isActive ? "text-green-800 font-bold" : "text-gray-700"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      {/* Top announcement bar */}
      <div className="bg-green-900 px-4 py-2.5 text-center text-sm font-medium text-white sm:text-base">
        Building stronger communities through sustainable development.
      </div>

      {/* Main navigation */}
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Foundation logo and name */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex min-w-0 shrink-0 items-center gap-3"
        >
          {/* Temporary foundation emblem */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-green-700 bg-green-800 text-white shadow-sm sm:h-14 sm:w-14">
            <Heart size={27} strokeWidth={2.2} />
            <Leaf
              size={15}
              className="absolute bottom-2 right-2 fill-green-300 text-green-200"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-base font-extrabold leading-tight text-green-900 sm:text-xl">
              Bishop Wasonga
            </h1>
            <p className="text-xs font-bold tracking-[0.18em] text-green-700 sm:text-sm">
              FOUNDATION
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-3 xl:flex 2xl:gap-4">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={linkStyle}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Desktop Get Involved button */}
        <Link
          to="/get-involved"
          className="hidden shrink-0 rounded-full bg-green-800 px-5 py-3 text-base font-bold text-white transition hover:bg-green-900 xl:inline-block"
        >
          Get Involved
        </Link>

        {/* Mobile and tablet menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-green-900 transition hover:bg-green-50 xl:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </nav>

      {/* Mobile and tablet navigation menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-5 py-5 shadow-lg xl:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-base font-semibold transition ${
                    isActive
                      ? "bg-green-50 text-green-800"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <Link
              to="/get-involved"
              onClick={() => setMenuOpen(false)}
              className="mt-3 rounded-full bg-green-800 px-5 py-3.5 text-center text-base font-bold text-white transition hover:bg-green-900"
            >
              Get Involved
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
