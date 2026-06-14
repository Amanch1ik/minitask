import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useAuth } from "../stores/auth.js";
import useTasks from "../hooks/useTasks.js";
import { todayLabel } from "../lib/format.js";
import Sidebar from "../components/layout/Sidebar.jsx";
import TopBar from "../components/layout/TopBar.jsx";
import StatusColumn from "../components/board/StatusColumn.jsx";
import TaskDialog from "../components/board/TaskDialog.jsx";
import { TaskCardView } from "../components/board/TaskCard.jsx";
import AnimatedCounter from "../components/ui/AnimatedCounter.jsx";

const STATUSES = ["todo", "in_progress", "done"];
const ease = [0.22, 1, 0.36, 1];

export default function BoardView() {
  const { user, logout } = useAuth();
  const { tasks, loading, error, create, update, remove } = useTasks();
  const [editing, setEditing] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    // 6px travel before a drag starts → a plain click still opens the editor.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const grouped = useMemo(() => {
    const acc = { todo: [], in_progress: [], done: [] };
    for (const t of tasks) acc[t.status].push(t);
    return acc;
  }, [tasks]);

  const total = tasks.length;
  const done = grouped.done.length;
  const active = total - done;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  async function handleSubmit(payload) {
    if (editing && editing.id) await update(editing.id, payload);
    else await create(payload);
    setEditing(null);
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const task = tasks.find((t) => t.id === active.id);
    const nextStatus = over.id; // droppable id === status
    if (task && STATUSES.includes(nextStatus) && task.status !== nextStatus) {
      await update(task.id, { status: nextStatus });
    }
  }

  function handleToggleDone(task) {
    update(task.id, { status: task.status === "done" ? "todo" : "done" });
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar email={user?.email} onLogout={logout} />

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {/* Board header — eyebrow + title + progress + primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className="mb-6 flex flex-wrap items-end justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="eyebrow text-teal">Сегодня · {todayLabel()}</p>
              <h1 className="mt-1 font-display text-[28px] font-medium leading-tight tracking-tight text-charcoal sm:text-[34px]">
                Моя доска
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <p className="text-[13px] text-asana-muted tabular">
                  <span className="font-semibold text-charcoal">
                    <AnimatedCounter value={active} />
                  </span>{" "}
                  в работе ·{" "}
                  <span className="font-semibold text-charcoal">
                    <AnimatedCounter value={done} />
                  </span>{" "}
                  готово
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <motion.button
                type="button"
                onClick={() => setEditing({})}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.18, ease }}
                className="inline-flex items-center gap-1.5 rounded-full bg-teal px-5 py-2.5 text-[14px] font-semibold text-white shadow-teal transition-shadow hover:shadow-teal-lg focus:outline-none focus-visible:shadow-focus"
              >
                <Plus className="h-4 w-4" strokeWidth={2.4} />
                Новая задача
              </motion.button>
              <ProgressBar pct={pct} />
            </div>
          </motion.div>

          {error && (
            <p className="mb-4 rounded-md border border-clay/40 bg-clay-soft px-3 py-2 text-sm text-[#9c3a33]">
              {error}
            </p>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              {STATUSES.map((status, i) => (
                <StatusColumn
                  key={status}
                  status={status}
                  tasks={grouped[status]}
                  owner={user?.email}
                  index={i}
                  onEdit={setEditing}
                  onToggleDone={handleToggleDone}
                  onDelete={(t) => remove(t.id)}
                  onAdd={() => setEditing({ status })}
                />
              ))}
            </div>

            <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.22,1,0.36,1)" }}>
              {activeTask ? (
                <div className="w-full rotate-2">
                  <TaskCardView task={activeTask} owner={user?.email} overlay />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {loading && tasks.length === 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {STATUSES.map((s) => (
                <ColumnSkeleton key={s} />
              ))}
            </div>
          )}
        </main>
      </div>

      <TaskDialog
        open={editing !== null}
        initial={editing && editing.id ? editing : null}
        initialStatus={editing && !editing.id ? editing.status : "todo"}
        onClose={() => setEditing(null)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function ProgressBar({ pct }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-cream-dark">
        <motion.div
          className="h-full rounded-full bg-teal"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 26 }}
        />
      </div>
      <span className="text-[12px] font-semibold tabular text-asana-muted">{pct}%</span>
    </div>
  );
}

function ColumnSkeleton() {
  return (
    <div className="rounded-xl border border-asana-border bg-cream-deep/50 p-2">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="relative mb-2 h-20 overflow-hidden rounded-lg border border-asana-border bg-white/70"
        >
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      ))}
    </div>
  );
}
