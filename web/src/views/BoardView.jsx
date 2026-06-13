import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../stores/auth.js";
import useTasks from "../hooks/useTasks.js";
import StatusColumn from "../components/board/StatusColumn.jsx";
import StatsPanel from "../components/board/StatsPanel.jsx";
import TaskDialog from "../components/board/TaskDialog.jsx";
import { todayLabel } from "../lib/format.js";

const STATUSES = ["todo", "in_progress", "done"];

export default function BoardView() {
  const { user, logout } = useAuth();
  const { tasks, loading, error, create, update, remove } = useTasks();
  const [editing, setEditing] = useState(null);

  const grouped = useMemo(() => {
    const acc = { todo: [], in_progress: [], done: [] };
    for (const t of tasks) acc[t.status].push(t);
    return acc;
  }, [tasks]);

  async function handleSubmit(payload) {
    if (editing && editing.id) {
      await update(editing.id, payload);
    } else {
      await create(payload);
    }
    setEditing(null);
  }

  async function handleMove(task, nextStatus) {
    await update(task.id, { status: nextStatus });
  }

  async function handleDelete(task) {
    if (!confirm("Delete this task?")) return;
    await remove(task.id);
  }

  return (
    <main className="relative min-h-screen">
      <div className="glow-corner pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <Header email={user?.email} onLogout={logout} />

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 mb-10"
        >
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] leading-tight">
            {todayLabel()}
          </h1>
          <p className="text-charcoal-mute text-sm tabular">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} on the board
          </p>
        </motion.section>

        {error && (
          <p className="mb-6 rounded-card bg-amber/10 px-4 py-3 text-sm text-amber">
            {error}
          </p>
        )}

        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          <StatsPanel tasks={tasks} onCreate={() => setEditing({})} />

          <div className="grid gap-8 sm:grid-cols-3">
            {STATUSES.map((status) => (
              <StatusColumn
                key={status}
                status={status}
                tasks={grouped[status]}
                onEdit={setEditing}
                onMove={handleMove}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        {loading && tasks.length === 0 && (
          <p className="mt-12 text-center text-xs text-charcoal-mute">loading…</p>
        )}
      </div>

      <TaskDialog
        open={editing !== null}
        initial={editing && editing.id ? editing : null}
        onClose={() => setEditing(null)}
        onSubmit={handleSubmit}
      />
    </main>
  );
}

function Header({ email, onLogout }) {
  return (
    <header className="flex items-center justify-between">
      <p className="eyebrow">Board</p>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-charcoal-mute sm:inline">{email}</span>
        <button
          type="button"
          onClick={onLogout}
          className="text-sm text-charcoal-mute underline-offset-4 hover:text-charcoal hover:underline"
        >
          sign out
        </button>
      </div>
    </header>
  );
}
