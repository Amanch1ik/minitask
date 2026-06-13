import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import { toDateInput } from "../../lib/format.js";

const EMPTY = {
  title: "",
  description: "",
  priority: "medium",
  deadline: "",
  status: "todo",
};

export default function TaskDialog({ open, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      initial
        ? {
            title: initial.title ?? "",
            description: initial.description ?? "",
            priority: initial.priority ?? "medium",
            deadline: toDateInput(initial.deadline),
            status: initial.status ?? "todo",
          }
        : EMPTY,
    );
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        status: form.status,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err?.message ?? "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  const isEdit = Boolean(initial && initial.id);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/30 px-4 sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-xl border border-zinc-200 bg-white p-5 sm:rounded-xl sm:p-6"
            role="dialog"
            aria-modal="true"
          >
            <header className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-zinc-900">
                  {isEdit ? "Edit task" : "New task"}
                </h2>
                <p className="mt-0.5 text-sm text-zinc-500">
                  {isEdit
                    ? "Update the details and save."
                    : "A short title is enough to start."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-7 w-7 place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="Close"
              >
                ✕
              </button>
            </header>

            <form onSubmit={submit} className="space-y-4">
              <Input
                label="Title"
                value={form.title}
                onChange={set("title")}
                required
                maxLength={200}
                autoFocus
                placeholder="Write the docs"
              />

              <div>
                <label
                  htmlFor="task-desc"
                  className="mb-1.5 block text-sm font-medium text-zinc-800"
                >
                  Description
                </label>
                <textarea
                  id="task-desc"
                  rows={3}
                  value={form.description}
                  onChange={set("description")}
                  className="block w-full resize-none rounded-md border border-zinc-200 bg-white p-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-900/15"
                  placeholder="Optional"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Segmented
                  label="Priority"
                  value={form.priority}
                  options={[
                    { v: "low", label: "Low" },
                    { v: "medium", label: "Med" },
                    { v: "high", label: "High" },
                  ]}
                  onChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                />
                <div>
                  <label
                    htmlFor="task-deadline"
                    className="mb-1.5 block text-sm font-medium text-zinc-800"
                  >
                    Deadline
                  </label>
                  <input
                    id="task-deadline"
                    type="date"
                    value={form.deadline}
                    onChange={set("deadline")}
                    className="block h-9 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-sm tabular font-mono text-zinc-900 focus:outline-none focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-900/15"
                  />
                </div>
              </div>

              {isEdit && (
                <Segmented
                  label="Status"
                  value={form.status}
                  options={[
                    { v: "todo", label: "Todo" },
                    { v: "in_progress", label: "In progress" },
                    { v: "done", label: "Done" },
                  ]}
                  onChange={(v) => setForm((f) => ({ ...f, status: v }))}
                />
              )}

              {error && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy || !form.title.trim()}>
                  {busy ? "…" : isEdit ? "Save" : "Create"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Segmented({ label, value, options, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-800">{label}</label>
      <div className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5">
        {options.map((opt) => (
          <button
            key={opt.v}
            type="button"
            onClick={() => onChange(opt.v)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              value === opt.v
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
