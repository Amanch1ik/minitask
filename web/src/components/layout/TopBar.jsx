import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu } from "lucide-react";
import Avatar from "../ui/Avatar.jsx";
import useDismiss from "../../hooks/useDismiss.js";

const spring = { type: "spring", stiffness: 380, damping: 32 };

export default function TopBar({ email, onLogout, view = "board", onView, onMenu, title = "Моя доска" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const userRef = useRef(null);

  useDismiss(userRef, menuOpen, () => setMenuOpen(false));

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
      className="flex h-14 items-center justify-between border-b border-asana-border bg-white px-4 sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <motion.button
          type="button"
          onClick={onMenu}
          whileTap={{ scale: 0.92 }}
          transition={spring}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-asana-muted hover:bg-asana-side-bg hover:text-asana-ink lg:hidden"
          aria-label="Открыть меню навигации"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </motion.button>
        <p className="truncate text-[15px] font-semibold text-asana-ink">
          {title}
        </p>
        <span className="hidden h-4 w-px bg-asana-border sm:block" />
        <ViewTabs value={view} onChange={onView} />
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          transition={spring}
          className="hidden h-8 items-center gap-1.5 rounded-md border border-asana-border bg-white px-2.5 text-[13px] text-asana-muted hover:bg-asana-side-bg sm:inline-flex"
          aria-label="Поделиться"
        >
          <ShareIcon className="h-3.5 w-3.5" />
          Поделиться
        </motion.button>

        <div ref={userRef} className="relative">
          <motion.button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            whileTap={{ scale: 0.94 }}
            transition={spring}
            className="flex items-center gap-2 rounded-full p-0.5 hover:bg-asana-side-bg"
            aria-label="Меню пользователя"
          >
            <Avatar name={email ?? ""} size={28} />
          </motion.button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 460, damping: 36 }}
                style={{ transformOrigin: "top right" }}
                className="absolute right-0 top-10 z-20 w-56 overflow-hidden rounded-lg border border-asana-border bg-white shadow-lift"
              >
                  <div className="border-b border-asana-border px-3 py-3">
                    <p className="text-[11px] uppercase tracking-wider text-asana-subtle">
                      Вошёл как
                    </p>
                    <p className="mt-0.5 truncate text-[13px] font-medium text-asana-ink">
                      {email}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={onLogout}
                    whileHover={{ x: 2 }}
                    transition={spring}
                    className="block w-full px-3 py-2 text-left text-[13px] text-asana-ink hover:bg-asana-side-bg"
                  >
                    Выйти
                  </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}

function ViewTabs({ value, onChange }) {
  const tabs = [
    { id: "board", label: "Доска" },
    { id: "today", label: "Сегодня" },
    { id: "calendar", label: "Календарь" },
  ];
  return (
    <div className="hidden items-center gap-0.5 p-0.5 sm:flex">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange?.(t.id)}
            className={`relative h-8 rounded-md px-3 text-[13px] transition-colors ${
              active
                ? "text-asana-ink font-medium"
                : "text-asana-muted hover:text-asana-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 -z-0 rounded-md bg-asana-side-active"
                transition={{ type: "spring", stiffness: 460, damping: 38 }}
              />
            )}
            <span className="relative z-10">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ShareIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <circle cx="4" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="4" r="1.8" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="1.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="m5.6 7.2 4.8-2.4M5.6 8.8l4.8 2.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
