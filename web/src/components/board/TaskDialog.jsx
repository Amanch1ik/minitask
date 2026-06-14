import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
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

const spring = { type: "spring", stiffness: 360, damping: 32 };

export default function TaskDialog({
  open,
  initial,
  initialStatus = "todo",
  onClose,
  onSubmit,
}) {
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
        : { ...EMPTY, status: initialStatus },
    );
  }, [open, initial, initialStatus]);

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
      setError(err?.message ?? "Не удалось сохранить.");
    } finally {
      setBusy(false);
    }
  }

  const isEdit = Boolean(initial && initial.id);

  // Portal to <body> — the dialog can never get trapped inside a parent
  // stacking context, and AnimatePresence is the sole owner of mount/unmount.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="task-dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/45 px-4 backdrop-blur-[3px] sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 28, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={spring}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] rounded-t-2xl border border-asana-border bg-cream shadow-drag sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={isEdit ? "Редактировать задачу" : "Новая задача"}
          >
            <header className="flex items-center justify-between border-b border-asana-border px-5 py-4">
              <h2 className="font-display text-[19px] font-medium tracking-tight text-charcoal">
                {isEdit ? "Редактировать задачу" : "Новая задача"}
              </h2>
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={spring}
                className="grid h-8 w-8 place-items-center rounded-md text-asana-muted transition-colors hover:bg-cream-deep hover:text-charcoal focus:outline-none focus-visible:shadow-focus"
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" strokeWidth={2.2} />
              </motion.button>
            </header>

            <motion.form
              onSubmit={submit}
              className="space-y-4 p-5"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
              }}
            >
              <FormRow>
                <Input
                  label="Название"
                  required
                  value={form.title}
                  onChange={set("title")}
                  maxLength={200}
                  autoFocus
                  placeholder="Что нужно сделать?"
                />
              </FormRow>

              <FormRow>
                <label
                  htmlFor="task-desc"
                  className="mb-1.5 block text-[13px] font-medium text-charcoal"
                >
                  Описание
                </label>
                <textarea
                  id="task-desc"
                  rows={3}
                  value={form.description}
                  onChange={set("description")}
                  className="block w-full resize-none rounded-md border border-asana-border bg-white p-2.5 text-[14px] text-charcoal placeholder:text-asana-subtle transition-shadow focus:border-teal focus:shadow-focus focus:outline-none"
                  placeholder="Необязательно"
                />
              </FormRow>

              <FormRow>
                <div className="grid grid-cols-2 gap-4">
                  <Segmented
                    label="Приоритет"
                    value={form.priority}
                    options={[
                      { v: "low", label: "Низкий" },
                      { v: "medium", label: "Средн." },
                      { v: "high", label: "Высокий" },
                    ]}
                    onChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                    layoutKey="prio"
                  />
                  <div>
                    <label
                      htmlFor="task-deadline"
                      className="mb-1.5 block text-[13px] font-medium text-charcoal"
                    >
                      Дедлайн
                    </label>
                    <input
                      id="task-deadline"
                      type="date"
                      value={form.deadline}
                      onChange={set("deadline")}
                      className="block h-10 w-full rounded-md border border-asana-border bg-white px-2.5 text-[14px] tabular text-charcoal transition-shadow focus:border-teal focus:shadow-focus focus:outline-none"
                    />
                  </div>
                </div>
              </FormRow>

              <FormRow>
                <Segmented
                  label="Статус"
                  value={form.status}
                  options={[
                    { v: "todo", label: "К выполнению" },
                    { v: "in_progress", label: "В работе" },
                    { v: "done", label: "Готово" },
                  ]}
                  onChange={(v) => setForm((f) => ({ ...f, status: v }))}
                  layoutKey="status"
                />
              </FormRow>

              <AnimatePresence>
                {error && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={spring}
                    className="overflow-hidden rounded-md border border-clay/40 bg-clay-soft px-3 py-2 text-sm text-[#9c3a33]"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <FormRow className="flex items-center justify-end gap-2 border-t border-asana-border pt-4">
                <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
                  Отмена
                </Button>
                <Button type="submit" disabled={busy || !form.title.trim()}>
                  {busy ? "Сохраняем…" : isEdit ? "Сохранить" : "Создать"}
                </Button>
              </FormRow>
            </motion.form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function FormRow({ children, className = "" }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 6 },
        show: { opacity: 1, y: 0, transition: spring },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Segmented({ label, value, options, onChange, layoutKey = "seg" }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-charcoal">
        {label}
      </label>
      <div className="inline-flex w-full rounded-md border border-asana-border bg-cream-deep p-0.5">
        {options.map((opt) => {
          const active = value === opt.v;
          return (
            <button
              key={opt.v}
              type="button"
              onClick={() => onChange(opt.v)}
              className={`relative flex-1 rounded px-2 py-1.5 text-[12px] font-medium transition-colors ${
                active ? "text-charcoal" : "text-asana-muted hover:text-charcoal"
              }`}
            >
              {active && (
                <motion.span
                  layoutId={`seg-${layoutKey}`}
                  className="absolute inset-0 -z-0 rounded bg-white shadow-card"
                  transition={spring}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
