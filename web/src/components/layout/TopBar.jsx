import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LogOut } from "lucide-react";
import Avatar from "../ui/Avatar.jsx";
import { LogoMark } from "../ui/Logo.jsx";

const spring = { type: "spring", stiffness: 380, damping: 32 };

export default function TopBar({ email, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
      className="flex h-14 items-center justify-between border-b border-asana-border bg-cream/80 px-4 backdrop-blur-md sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="lg:hidden">
          <LogoMark size={24} />
        </span>
        <span className="eyebrow text-asana-subtle">Рабочее пространство</span>
        <span className="hidden h-4 w-px bg-asana-border sm:block" />
        <Tabs />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <motion.button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            whileTap={{ scale: 0.94 }}
            transition={spring}
            className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-cream-deep focus:outline-none focus-visible:shadow-focus"
            aria-label="Меню пользователя"
            aria-expanded={menuOpen}
          >
            <Avatar name={email ?? ""} size={28} />
          </motion.button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden
                />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 460, damping: 36 }}
                  style={{ transformOrigin: "top right" }}
                  className="absolute right-0 top-11 z-20 w-56 overflow-hidden rounded-xl border border-asana-border bg-white shadow-lift"
                >
                  <div className="border-b border-asana-border px-3 py-3">
                    <p className="eyebrow text-asana-subtle">Вошли как</p>
                    <p className="mt-1 truncate text-[13px] font-medium text-charcoal">
                      {email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-charcoal transition-colors hover:bg-clay-soft hover:text-clay"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={2} />
                    Выйти
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}

/**
 * Only the board view exists today. The other tabs are shown as clearly
 * disabled "soon" affordances rather than buttons that look live but do
 * nothing (a11y: empty-nav-state).
 */
function Tabs() {
  const tabs = [
    { id: "board", label: "Доска", live: true },
    { id: "list", label: "Список", live: false },
    { id: "calendar", label: "Календарь", live: false },
  ];
  return (
    <div className="hidden items-center gap-0.5 sm:flex">
      {tabs.map((t) =>
        t.live ? (
          <span
            key={t.id}
            className="relative flex h-8 items-center rounded-md px-3 text-[13px] font-semibold text-charcoal"
          >
            <motion.span
              layoutId="tab-pill"
              className="absolute inset-0 -z-0 rounded-md bg-cream-deep"
              transition={{ type: "spring", stiffness: 460, damping: 38 }}
            />
            <span className="relative z-10">{t.label}</span>
          </span>
        ) : (
          <span
            key={t.id}
            title="Скоро"
            className="flex h-8 cursor-not-allowed items-center gap-1.5 rounded-md px-3 text-[13px] text-asana-subtle/70"
          >
            {t.label}
            <span className="rounded bg-cream-deep px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-asana-subtle">
              скоро
            </span>
          </span>
        ),
      )}
    </div>
  );
}
