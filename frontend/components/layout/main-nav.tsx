"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNav } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();
  const items = mainNav.filter((item) => item.available);

  return (
    <nav aria-label="Asosiy navigatsiya">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
