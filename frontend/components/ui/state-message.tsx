import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Centered empty / error / not-found state. */
export function StateMessage({
  icon: Icon,
  title,
  children,
  action,
  role,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <div
      role={role}
      className="flex flex-col items-center rounded-xl border border-dashed bg-card px-6 py-14 text-center"
    >
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <Icon className="size-6" />
      </span>
      <p className="mt-4 text-lg font-semibold">{title}</p>
      {children && (
        <div className="mt-2 max-w-md text-sm text-muted-foreground">
          {children}
        </div>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
