import { Hand } from "lucide-react";
import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-lg font-semibold tracking-tight"
    >
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground"
      >
        <Hand className="size-4" />
      </span>
      <span>{siteConfig.name}</span>
    </Link>
  );
}
