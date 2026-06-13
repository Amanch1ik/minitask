import Button from "../ui/Button.jsx";

export default function StatsPanel({ tasks, onCreate }) {
  const active = tasks.filter((t) => t.status !== "done").length;
  const done = tasks.filter((t) => t.status === "done").length;

  const byPriority = {
    high: tasks.filter((t) => t.priority === "high" && t.status !== "done").length,
    medium: tasks.filter((t) => t.priority === "medium" && t.status !== "done").length,
    low: tasks.filter((t) => t.priority === "low" && t.status !== "done").length,
  };

  return (
    <aside className="space-y-8 rounded-card bg-cream-dark/50 p-6 lg:sticky lg:top-8">
      <div>
        <p className="eyebrow mb-3">Today</p>
        <p className="font-display text-3xl leading-tight">
          <span className="tabular">{active}</span>{" "}
          <span className="text-charcoal-mute">active</span>
        </p>
        <p className="font-display text-3xl leading-tight text-charcoal-soft">
          <span className="tabular">{done}</span>{" "}
          <span className="text-charcoal-mute">done</span>
        </p>
      </div>

      <div className="space-y-2 text-sm">
        <p className="eyebrow mb-3">By priority</p>
        <PriorityRow label="high" count={byPriority.high} tone="bg-amber" />
        <PriorityRow label="medium" count={byPriority.medium} tone="bg-charcoal-mute" />
        <PriorityRow label="low" count={byPriority.low} tone="bg-cream-deeper" />
      </div>

      <Button onClick={onCreate} className="w-full">
        New task
        <span aria-hidden>+</span>
      </Button>
    </aside>
  );
}

function PriorityRow({ label, count, tone }) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-2 text-charcoal-soft">
        <span className={`h-1.5 w-1.5 rounded-full ${tone}`} />
        {label}
      </span>
      <span className="tabular text-charcoal">{count}</span>
    </div>
  );
}
