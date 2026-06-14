import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import ShinyText from "./ShinyText.jsx";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4";

const NAV_LINKS = [
  "Home",
  "About Us",
  "Courses",
  "Instructors",
  "Testimonials",
  "Blog",
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

/**
 * Full-screen hero for the DesignPro design-education platform.
 *
 * A looping muted video (an animated figure) sits behind everything via
 * `object-cover` + centred positioning, so the subject stays framed and
 * undistorted at any aspect ratio. A soft top/bottom dark gradient keeps the
 * nav and copy legible without hiding the figure.
 *
 * @param {() => void} [onApply] fired by the primary CTA
 */
export default function DesignProHero({ onApply }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black font-sans">
      {/* Video background — fills the viewport, subject kept centred. */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center" }}
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      {/* Legibility overlay — darker at the edges, clear through the middle. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-5 sm:px-6 lg:px-8">
        <Nav menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((v) => !v)} />

        <TopSection />

        <HeroCenter onApply={onApply} />
      </div>
    </section>
  );
}

function Nav({ menuOpen, onToggleMenu }) {
  return (
    <nav className="flex items-center justify-between gap-4 py-5">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white">
          <span className="h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        <span className="text-base font-medium tracking-tight text-white">
          DesignPro
        </span>
      </div>

      {/* Desktop links in a rounded pill */}
      <div className="hidden items-center gap-1 rounded-full border border-gray-700 px-2 py-1.5 lg:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href="#"
            className="rounded-full px-3 py-1.5 text-sm text-white/80 transition-colors hover:text-white"
          >
            {link}
          </a>
        ))}
        <a
          href="#"
          className="ml-1 flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/80 transition-colors hover:text-white"
        >
          Contact us
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onToggleMenu}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 text-white/80 transition-colors hover:text-white lg:hidden"
      >
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile menu sheet */}
      {menuOpen && (
        <div className="absolute left-5 right-5 top-16 z-20 rounded-2xl border border-gray-700 bg-black/90 p-2 backdrop-blur lg:hidden">
          {[...NAV_LINKS, "Contact us"].map((link) => (
            <a
              key={link}
              href="#"
              className="block rounded-xl px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

function TopSection() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.12 } } }}
      className="grid gap-4 pt-6 lg:grid-cols-2 lg:gap-8"
    >
      <motion.p
        variants={fadeUp}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md text-sm text-white/80 md:text-base"
      >
        We deliver transformative programs that empower emerging product
        designers with cutting-edge expertise and vision to thrive globally.
      </motion.p>
      <motion.p
        variants={fadeUp}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-sm text-white/80 md:text-base lg:text-right"
      >
        8000+ Talented Designers Launched !
      </motion.p>
    </motion.div>
  );
}

function HeroCenter({ onApply }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center pb-10 text-center">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-5 text-xs uppercase tracking-tight text-white/80 md:text-sm"
      >
        Seats for Next Program Opening Soon
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="text-5xl font-medium tracking-tighter text-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
        style={{ lineHeight: 0.85 }}
      >
        <span className="block">Become</span>
        <ShinyText className="block" speed={3} spread={100}>
          Product Leader.
        </ShinyText>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-10"
      >
        <button
          type="button"
          onClick={onApply}
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black px-6 py-3 text-sm text-white transition-colors hover:bg-gray-900 md:px-8 md:py-4 md:text-base"
        >
          Apply for Next Enrollment
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  );
}
