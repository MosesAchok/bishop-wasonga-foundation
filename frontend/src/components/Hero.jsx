
import { Link } from "react-router-dom";
import { ArrowRight, HeartHandshake } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-green-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-green-950 via-green-900/95 to-green-800/60" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-2 items-center gap-3 px-3 py-8 sm:gap-6 sm:px-6 sm:py-14 md:gap-10 md:py-20 lg:px-8">

        {/* LEFT SIDE: TEXT CONTENT */}
        <div className="min-w-0">
          <span className="mb-3 inline-flex items-center gap-1 rounded-full border border-green-300/40 bg-white/10 px-2 py-1 text-[9px] leading-tight text-green-100 sm:gap-2 sm:px-3 sm:text-xs">
            <HeartHandshake size={13} />
            Together for a better tomorrow
          </span>

          <h1 className="text-xl font-extrabold leading-tight sm:text-3xl lg:text-5xl">
            Empowering Communities.
            <span className="mt-1 block text-green-300">
              Transforming Lives.
            </span>
          </h1>

          <p className="mt-3 text-[11px] leading-5 text-green-100 sm:text-sm sm:leading-7 lg:text-base">
            Bishop Wasonga Foundation works to support stronger,
            healthier and more empowered communities through education,
            health, environmental conservation and sustainable development.
          </p>

          <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap">
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-1 rounded-full bg-green-500 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-green-600 sm:px-5 sm:py-3 sm:text-sm"
            >
              Discover Our Work
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/get-involved"
              className="inline-flex items-center justify-center rounded-full border border-white/70 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-white hover:text-green-950 sm:px-5 sm:py-3 sm:text-sm"
            >
              Get Involved
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE: IMAGE */}
        <div className="relative min-w-0">
          <div className="rounded-xl border border-white/20 bg-white/10 p-1.5 shadow-xl backdrop-blur-sm sm:rounded-2xl sm:p-2">
            <img
              src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1100&q=85"
              alt="Community members participating in a group activity"
              className="h-40 w-full rounded-lg object-cover sm:h-64 md:h-80"
            />
          </div>

          <div className="absolute -bottom-4 right-1 max-w-[95%] rounded-lg bg-white p-2 text-green-950 shadow-lg sm:-bottom-5 sm:right-3 sm:rounded-xl sm:p-4">
            <p className="text-[9px] font-semibold text-gray-500 sm:text-xs">
              Our commitment
            </p>
            <p className="mt-0.5 text-xs font-extrabold sm:text-lg">
              Stronger Communities
            </p>
            <p className="mt-0.5 text-[9px] leading-tight text-gray-600 sm:text-xs">
              Creating opportunities for lasting change.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
