import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { capitalizeFirst } from "../../lib/format.js";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const monthFmt = new Intl.DateTimeFormat("ru", { month: "long", year: "numeric" });
const spring = { type: "spring", stiffness: 320, damping: 32 };

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
function sameDay(a, b) {
  return dayKey(a) === dayKey(b);
}

const chipTone = {
  high: "bg-asana-coral-soft text-asana-coral-dark",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-asana-side-bg text-asana-muted",
};

/**
 * "Календарь" — a month grid that places each task on its deadline. Click a chip
 * to edit; navigate months; today is ringed. Undated tasks list below the grid.
 */
export default function CalendarView({ tasks, onEdit }) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const byDay = useMemo(() => {
    const map = {};
    for (const t of tasks) {
      if (!t.deadline) continue;
      const k = dayKey(new Date(t.deadline));
      (map[k] ??= []).push(t);
    }
    return map;
  }, [tasks]);

  const undated = tasks.filter((t) => !t.deadline && t.status !== "done");

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // make Monday the first column
    const startDate = new Date(first);
    startDate.setDate(first.getDate() - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return d;
    });
  }, [cursor]);

  function shiftMonth(delta) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-asana-ink">
          {capitalizeFirst(monthFmt.format(cursor))}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="mr-1 h-8 rounded-md border border-asana-border bg-white px-2.5 text-[13px] text-asana-muted hover:bg-asana-side-bg hover:text-asana-ink"
          >
            Сегодня
          </button>
          <NavBtn onClick={() => shiftMonth(-1)} label="Предыдущий месяц">
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </NavBtn>
          <NavBtn onClick={() => shiftMonth(1)} label="Следующий месяц">
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </NavBtn>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-asana-border bg-white">
        <div className="grid grid-cols-7 border-b border-asana-border bg-asana-side-bg/50">
          {WEEKDAYS.map((w) => (
            <div key={w} className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-asana-subtle">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            const inMonth = date.getMonth() === cursor.getMonth();
            const isToday = sameDay(date, today);
            const items = byDay[dayKey(date)] ?? [];
            return (
              <div
                key={i}
                className={`min-h-[88px] border-b border-r border-asana-border p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0 ${
                  inMonth ? "bg-white" : "bg-asana-side-bg/30"
                }`}
              >
                <div className="mb-1 flex justify-end">
                  <span
                    className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1 text-[11px] tabular ${
                      isToday
                        ? "bg-asana-coral font-semibold text-white"
                        : inMonth
                          ? "text-asana-muted"
                          : "text-asana-subtle/60"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>
                <div className="space-y-1">
                  {items.slice(0, 3).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onEdit(t)}
                      className={`block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] leading-tight transition-opacity hover:opacity-80 ${
                        t.status === "done" ? "bg-chip-green/15 text-asana-subtle line-through" : chipTone[t.priority]
                      }`}
                      title={t.title}
                    >
                      {t.title}
                    </button>
                  ))}
                  {items.length > 3 && (
                    <span className="block px-1.5 text-[11px] text-asana-subtle">
                      +{items.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {undated.length > 0 && (
        <div>
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-asana-subtle">
            Без срока · {undated.length}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {undated.map((t) => (
              <motion.button
                key={t.id}
                type="button"
                onClick={() => onEdit(t)}
                whileHover={{ y: -1 }}
                transition={spring}
                className={`rounded-md border border-asana-border px-2 py-1 text-[12px] text-asana-ink hover:border-asana-border-strong ${chipTone[t.priority]}`}
              >
                {t.title}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ onClick, label, children }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={spring}
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-md border border-asana-border bg-white text-asana-muted hover:bg-asana-side-bg hover:text-asana-ink"
    >
      {children}
    </motion.button>
  );
}
