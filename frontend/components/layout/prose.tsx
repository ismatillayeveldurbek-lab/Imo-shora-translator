import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Readable long-form text container (articles, policies). */
export function Prose({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "max-w-3xl space-y-4 leading-7 text-pretty",
        "[&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight",
        "[&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold",
        "[&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:text-foreground",
        "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6",
        "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}
