import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
}) {
  return (
    <header className="border-b bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {eyebrow && (
          <p className="mb-3 text-sm font-medium text-primary">{eyebrow}</p>
        )}
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
