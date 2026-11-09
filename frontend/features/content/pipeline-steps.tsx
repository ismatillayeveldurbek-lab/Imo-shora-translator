import type { LucideIcon } from "lucide-react";

export type PipelineStep = {
  icon: LucideIcon;
  title: string;
  description: string;
};

/** Ordered, accessible visualisation of a processing pipeline. */
export function PipelineSteps({
  label,
  steps,
}: {
  label: string;
  steps: PipelineStep[];
}) {
  return (
    <ol aria-label={label} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map(({ icon: Icon, title, description }, index) => (
        <li
          key={title}
          className="relative flex gap-4 rounded-xl border bg-card p-5"
        >
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
          >
            <Icon className="size-4" />
          </span>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {index + 1}-qadam
            </p>
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
