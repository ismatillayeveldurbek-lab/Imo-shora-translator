import { NavLink } from "@/components/layout/nav-link";
import { availableOnly, mainNav } from "@/lib/site-config";

export function MainNav() {
  return (
    <nav aria-label="Asosiy navigatsiya" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {availableOnly(mainNav).map((item) => (
          <li key={item.href}>
            <NavLink
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted"
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
