import {
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "info" | "warning" | "success";

const TONES: Record<
  Tone,
  { icon: LucideIcon; className: string; iconClass: string }
> = {
  info: {
    icon: Info,
    className: "border-primary/20 bg-primary/5",
    iconClass: "text-primary",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-warning/30 bg-warning/10",
    iconClass: "text-warning",
  },
  success: {
    icon: CheckCircle2,
    className: "border-success/30 bg-success/10",
    iconClass: "text-success",
  },
};

export function Callout({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const { icon: Icon, className: toneClass, iconClass } = TONES[tone];
  return (
    <aside
      className={cn("flex gap-4 rounded-xl border p-5", toneClass, className)}
    >
      <Icon
        aria-hidden="true"
        className={cn("mt-0.5 size-5 shrink-0", iconClass)}
      />
      <div className="space-y-1.5 text-sm">
        <p className="font-semibold">{title}</p>
        <div className="text-muted-foreground [&_strong]:text-foreground">
          {children}
        </div>
      </div>
    </aside>
  );
}
