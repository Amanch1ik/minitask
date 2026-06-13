import { useState } from "react";
import Avatar from "../ui/Avatar.jsx";

export default function TopBar({ email, onLogout, view = "board", onView }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-asana-border bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <p className="truncate text-[15px] font-semibold text-asana-ink">
          Моя доска
        </p>
        <span className="hidden h-4 w-px bg-asana-border sm:block" />
        <ViewTabs value={view} onChange={onView} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="hidden h-8 items-center gap-1.5 rounded-md border border-asana-border bg-white px-2.5 text-[13px] text-asana-muted hover:bg-asana-side-bg sm:inline-flex"
          aria-label="Поделиться"
        >
          <ShareIcon className="h-3.5 w-3.5" />
          Поделиться
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full p-0.5 hover:bg-asana-side-bg"
            aria-label="Меню пользователя"
          >
            <Avatar name={email ?? ""} size={28} />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-10 z-20 w-56 overflow-hidden rounded-lg border border-asana-border bg-white shadow-lift">
                <div className="border-b border-asana-border px-3 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-asana-subtle">
                    Вошёл как
                  </p>
                  <p className="mt-0.5 truncate text-[13px] font-medium text-asana-ink">
                    {email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="block w-full px-3 py-2 text-left text-[13px] text-asana-ink hover:bg-asana-side-bg"
                >
                  Выйти
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function ViewTabs({ value, onChange }) {
  const tabs = [
    { id: "list", label: "Список" },
    { id: "board", label: "Доска" },
    { id: "calendar", label: "Календарь" },
  ];
  return (
    <div className="hidden items-center gap-0.5 rounded-md p-0.5 sm:flex">
      {tabs.map((t) => {
        const active = t.id === value;
        const disabled = t.id !== "board";
        return (
          <button
            key={t.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(t.id)}
            className={`h-8 rounded-md px-3 text-[13px] transition-colors ${
              active
                ? "bg-asana-side-active text-asana-ink font-medium"
                : disabled
                  ? "text-asana-subtle/70 cursor-not-allowed"
                  : "text-asana-muted hover:bg-asana-side-bg"
            }`}
          >
            {t.label}
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
