"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function isActivePath(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

type NavLinkProps = ComponentProps<typeof Link> & { href: string };

function ActiveNavLink({ href, className, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        active ? "text-foreground" : "text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Navigation link with an active state. The pathname is runtime data on
 * dynamic routes (e.g. /dictionary/[id]), so under Cache Components the
 * active-state lookup is wrapped in Suspense: the static shell renders the
 * plain link and the active state streams in without blocking prerendering.
 */
export function NavLink({ href, className, ...props }: NavLinkProps) {
  return (
    <Suspense
      fallback={
        <Link
          href={href}
          className={cn("text-muted-foreground", className)}
          {...props}
        />
      }
    >
      <ActiveNavLink href={href} className={className} {...props} />
    </Suspense>
  );
}
