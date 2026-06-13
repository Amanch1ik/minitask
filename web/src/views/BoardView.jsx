import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../stores/auth.js";
import useTasks from "../hooks/useTasks.js";
import Button from "../components/ui/Button.jsx";
import Logo from "../components/ui/Logo.jsx";
import StatusColumn from "../components/board/StatusColumn.jsx";
import TaskDialog from "../components/board/TaskDialog.jsx";

const STATUSES = ["todo", "in_progress", "done"];
const ease = [0.16, 1, 0.3, 1];

export default function BoardView() {
  const { user, logout } = useAuth();
  const { tasks, loading, error, create, update, remove } = useTasks();
  const [editing, setEditing] = useState(null);

  const grouped = useMemo(() => {
    const acc = { todo: [], in_progress: [], done: [] };
    for (const t of tasks) acc[t.status].push(t);
    return acc;
  }, [tasks]);

  const active = tasks.filter((t) => t.status !== "done").length;
  const done = tasks.length - active;

  async function handleSubmit(payload) {
    if (editing && editing.id) await update(editing.id, payload);
    else await create(payload);
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
    <div className="relative min-h-screen">
      <Header email={user?.email} onLogout={logout} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="mb-8 flex flex-wrap items-end justify-between gap-3"
        >
          <div>
            <h1 className="display text-5xl text-zinc-900 sm:text-6xl">
              Your <em>tasks</em>
            </h1>
            <p className="mt-2 text-sm text-zinc-500 tabular">
              <span className="font-medium text-zinc-800">{active}</span>{" "}
              active ·{" "}
              <span className="font-medium text-zinc-800">{done}</span> done
            </p>
          </div>
          <Button onClick={() => setEditing({})}>
            <span aria-hidden>+</span>
            New task
          </Button>
        </motion.div>

        {error && (
          <p className="mb-4 rounded-md border border-rose-200 bg-rose-50/80 px-3 py-2 text-sm text-rose-700 backdrop-blur-sm">
            {error}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-3 sm:gap-5">
          {STATUSES.map((status, i) => (
            <StatusColumn
              key={status}
              status={status}
              tasks={grouped[status]}
              index={i}
              onEdit={setEditing}
              onMove={handleMove}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {loading && tasks.length === 0 && (
          <p className="mt-8 text-center text-xs text-zinc-400">Loading…</p>
        )}
      </main>

      <TaskDialog
        open={editing !== null}
        initial={editing && editing.id ? editing : null}
        onClose={() => setEditing(null)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function Header({ email, onLogout }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className="sticky top-0 z-30 border-b border-zinc-200/60 bg-white/60 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo size={28} withWord />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-500 sm:inline">{email}</span>
          <button
            type="button"
            onClick={onLogout}
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Sign out
          </button>
        </div>
      </div>
    </motion.header>
  );
}
