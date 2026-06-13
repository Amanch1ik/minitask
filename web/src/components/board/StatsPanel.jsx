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
    <aside className="rounded-card bg-cream-dark/50 p-5 sm:p-6 lg:sticky lg:top-8 lg:space-y-8">
      {/* On mobile, counters + priority chips lay out horizontally so the
          panel doesn't push the actual board down too far. From lg up it
          becomes the editorial vertical rail. */}
      <div className="flex items-end justify-between gap-6 lg:block">
        <div>
          <p className="eyebrow mb-2 lg:mb-3">Today</p>
          <p className="font-display text-2xl leading-tight lg:text-3xl">
            <span className="tabular">{active}</span>{" "}
            <span className="text-charcoal-mute">active</span>
          </p>
          <p className="font-display text-2xl leading-tight text-charcoal-soft lg:text-3xl">
            <span className="tabular">{done}</span>{" "}
            <span className="text-charcoal-mute">done</span>
          </p>
        </div>

        <div className="hidden gap-1.5 text-xs sm:flex lg:hidden">
          <PriorityChip count={byPriority.high} tone="bg-amber" label="high" />
          <PriorityChip count={byPriority.medium} tone="bg-charcoal-mute" label="med" />
          <PriorityChip count={byPriority.low} tone="bg-cream-deeper" label="low" />
        </div>
      </div>

      <div className="mt-6 space-y-2 text-sm lg:mt-0 hidden lg:block">
        <p className="eyebrow mb-3">By priority</p>
        <PriorityRow label="high" count={byPriority.high} tone="bg-amber" />
        <PriorityRow label="medium" count={byPriority.medium} tone="bg-charcoal-mute" />
        <PriorityRow label="low" count={byPriority.low} tone="bg-cream-deeper" />
      </div>

      <Button onClick={onCreate} className="mt-6 w-full lg:mt-0">
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

function PriorityChip({ label, count, tone }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-charcoal-soft">
      <span className={`h-1.5 w-1.5 rounded-full ${tone}`} />
      {label}
      <span className="tabular text-charcoal">{count}</span>
    </span>
  );
}
