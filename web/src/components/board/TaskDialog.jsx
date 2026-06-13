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

  // Close on Esc.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
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
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/30 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-t-3xl bg-cream p-6 shadow-card sm:rounded-card sm:p-8"
            role="dialog"
            aria-modal="true"
          >
            <header className="mb-6 flex items-baseline justify-between">
              <div>
                <p className="eyebrow">{isEdit ? "Edit" : "Create"}</p>
                <h2 className="mt-1 font-display text-2xl leading-tight">
                  {isEdit ? "Update this task" : "A new task"}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-charcoal-mute hover:text-charcoal"
                aria-label="Close"
              >
                ✕
              </button>
            </header>

            <form onSubmit={submit} className="space-y-6">
              <Input
                label="Title"
                value={form.title}
                onChange={set("title")}
                required
                maxLength={200}
                autoFocus
              />

              <div>
                <label className="mb-2 block text-xs text-charcoal-mute" htmlFor="task-desc">
                  Description
                </label>
                <textarea
                  id="task-desc"
                  rows={4}
                  value={form.description}
                  onChange={set("description")}
                  className="block w-full resize-none rounded-card border border-cream-deeper bg-cream-dark/30 p-3 text-[15px] text-charcoal outline-none focus:border-charcoal/40"
                  placeholder="Anything to remember about this task…"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Pills
                  legend="Priority"
                  value={form.priority}
                  options={[
                    { v: "low", label: "low" },
                    { v: "medium", label: "medium" },
                    { v: "high", label: "high" },
                  ]}
                  onChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                />
                <div>
                  <label className="mb-2 block text-xs text-charcoal-mute" htmlFor="task-deadline">
                    Deadline
                  </label>
                  <input
                    id="task-deadline"
                    type="date"
                    value={form.deadline}
                    onChange={set("deadline")}
                    className="block h-11 w-full rounded-card border border-cream-deeper bg-cream-dark/30 px-3 text-[15px] tabular text-charcoal outline-none focus:border-charcoal/40"
                  />
                </div>
              </div>

              {isEdit && (
                <Pills
                  legend="Status"
                  value={form.status}
                  options={[
                    { v: "todo", label: "todo" },
                    { v: "in_progress", label: "in progress" },
                    { v: "done", label: "done" },
                  ]}
                  onChange={(v) => setForm((f) => ({ ...f, status: v }))}
                />
              )}

              {error && <p className="text-sm text-amber">{error}</p>}

              <div className="flex items-center justify-end gap-3 pt-2">
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

function Pills({ legend, value, options, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs text-charcoal-mute">{legend}</legend>
      <div className="inline-flex rounded-full bg-cream-dark/60 p-1">
        {options.map((opt) => (
          <button
            key={opt.v}
            type="button"
            onClick={() => onChange(opt.v)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              value === opt.v
                ? "bg-cream text-charcoal shadow-soft"
                : "text-charcoal-mute hover:text-charcoal"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
