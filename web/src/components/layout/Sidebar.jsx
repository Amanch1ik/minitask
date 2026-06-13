import Logo from "../ui/Logo.jsx";

const navItems = [
  { id: "board", label: "Моя доска", icon: BoardIcon, active: true },
  { id: "today", label: "На сегодня", icon: SunIcon },
  { id: "calendar", label: "Календарь", icon: CalendarIcon },
  { id: "archive", label: "Архив", icon: ArchiveIcon },
];

const projects = [
  { id: "p1", label: "Личное", color: "#f472b6" },
  { id: "p2", label: "Работа", color: "#60a5fa" },
  { id: "p3", label: "Учёба", color: "#34d399" },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-asana-border bg-asana-side-bg lg:flex">
      <div className="flex h-14 items-center gap-2 border-b border-asana-border px-4">
        <Logo size={26} withWord />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors ${
                  item.active
                    ? "bg-asana-side-active text-asana-ink font-medium"
                    : "text-asana-muted hover:bg-asana-side-hover hover:text-asana-ink"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-7 mb-2 flex items-center justify-between px-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-asana-subtle">
            Проекты
          </p>
          <button
            type="button"
            className="grid h-5 w-5 place-items-center rounded text-asana-muted hover:bg-asana-side-hover hover:text-asana-ink"
            aria-label="Новый проект"
          >
            +
          </button>
        </div>
        <ul className="space-y-0.5">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] text-asana-muted hover:bg-asana-side-hover hover:text-asana-ink"
              >
                <span
                  className="h-2.5 w-2.5 rounded-[3px]"
                  style={{ backgroundColor: p.color }}
                />
                <span>{p.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-asana-border px-3 py-3 text-[12px] text-asana-subtle">
        <p>Бесплатный план · v0.1</p>
      </div>
    </aside>
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
