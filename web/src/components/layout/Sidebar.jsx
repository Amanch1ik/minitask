import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import Logo from "../ui/Logo.jsx";
import { PROJECTS } from "../../lib/projects.js";

const navItems = [
  { id: "board", label: "Моя доска", icon: BoardIcon },
  { id: "today", label: "На сегодня", icon: SunIcon },
  { id: "calendar", label: "Календарь", icon: CalendarIcon },
  { id: "archive", label: "Архив", icon: ArchiveIcon },
];

const spring = { type: "spring", stiffness: 320, damping: 34 };

/**
 * Renders the persistent desktop rail (lg+) plus a slide-in drawer for mobile
 * (< lg), driven by `open` / `onClose`. Same nav content powers both so there's
 * a single source of truth.
 */
export default function Sidebar({
  open = false,
  onClose,
  view = "board",
  onView,
  activeProject = null,
  onProject,
}) {
  const navProps = { view, onView, activeProject, onProject };
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* desktop rail */}
      <motion.aside
        initial={{ x: -28, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 32, delay: 0.05 }}
        className="hidden w-[240px] shrink-0 flex-col border-r border-asana-border bg-asana-side-bg lg:flex"
      >
        <div className="flex h-14 items-center gap-2 border-b border-asana-border px-4">
          <Logo size={26} withWord />
        </div>
        <SidebarNav {...navProps} />
        <SidebarFooter />
      </motion.aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, pointerEvents: "auto" }}
              exit={{ opacity: 0, pointerEvents: "none" }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="absolute inset-0 bg-asana-ink/40 backdrop-blur-[1px]"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
              className="absolute inset-y-0 left-0 flex w-[268px] max-w-[82vw] flex-col border-r border-asana-border bg-asana-side-bg shadow-lift"
            >
              <div className="flex h-14 items-center justify-between border-b border-asana-border px-4">
                <Logo size={26} withWord />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Закрыть меню"
                  className="grid h-8 w-8 place-items-center rounded-md text-asana-muted hover:bg-asana-side-hover hover:text-asana-ink"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              <SidebarNav {...navProps} onNavigate={onClose} />
              <SidebarFooter />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarNav({ view, onView, activeProject, onProject, onNavigate }) {
  function pickView(id) {
    onView?.(id);
    onNavigate?.();
  }
  function pickProject(id) {
    onProject?.(activeProject === id ? null : id);
    onNavigate?.();
  }

  return (
    <motion.nav
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
      }}
      className="flex-1 overflow-y-auto px-2 py-4"
    >
      <ul className="space-y-0.5">
        {navItems.map((item) => {
          const active = view === item.id && !activeProject;
          return (
            <motion.li
              key={item.id}
              variants={{
                hidden: { opacity: 0, x: -8 },
                show: { opacity: 1, x: 0, transition: spring },
              }}
            >
              <motion.button
                type="button"
                onClick={() => pickView(item.id)}
                whileHover={{ x: 1 }}
                whileTap={{ scale: 0.98 }}
                transition={spring}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors ${
                  active
                    ? "text-asana-ink font-medium"
                    : "text-asana-muted hover:bg-asana-side-hover hover:text-asana-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-0 rounded-md bg-asana-side-active"
                    transition={{ type: "spring", stiffness: 380, damping: 36 }}
                  />
                )}
                <item.icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            </motion.li>
          );
        })}
      </ul>

      <div className="mt-7 mb-2 flex items-center justify-between px-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-asana-subtle">
          Проекты
        </p>
      </div>
      <ul className="space-y-0.5">
        {PROJECTS.map((p) => {
          const active = activeProject === p.id;
          return (
            <motion.li
              key={p.id}
              variants={{
                hidden: { opacity: 0, x: -8 },
                show: { opacity: 1, x: 0, transition: spring },
              }}
            >
              <motion.button
                type="button"
                onClick={() => pickProject(p.id)}
                whileHover={{ x: 2 }}
                transition={spring}
                className={`flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors ${
                  active
                    ? "bg-asana-side-active font-medium text-asana-ink"
                    : "text-asana-muted hover:bg-asana-side-hover hover:text-asana-ink"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-[3px]"
                  style={{ backgroundColor: p.color }}
                />
                <span className="flex-1 text-left">{p.label}</span>
                {active && <span className="text-[11px] text-asana-subtle">✓</span>}
              </motion.button>
            </motion.li>
          );
        })}
      </ul>
    </motion.nav>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-asana-border px-3 py-3 text-[12px] text-asana-subtle">
      <p>Бесплатный план · v0.1</p>
    </div>
  );
}

function BoardIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2.5" width="3.5" height="11" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="6.25" y="2.5" width="3.5" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10.5" y="2.5" width="3.5" height="9" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function SunIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1.5v1.5M8 13v1.5M14.5 8H13M3 8H1.5M12.6 3.4l-1.05 1.05M4.45 11.55 3.4 12.6M12.6 12.6l-1.05-1.05M4.45 4.45 3.4 3.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function CalendarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 6.5h12M5.5 1.8v2.4M10.5 1.8v2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function ArchiveIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="1.8" y="3" width="12.4" height="3" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3 6.4V13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6.4M6.5 9h3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
