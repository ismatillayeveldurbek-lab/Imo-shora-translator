import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { availableOnly, footerNav, siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const groups = footerNav
    .map((group) => ({ ...group, items: availableOnly(group.items) }))
    .filter((group) => group.items.length > 0);

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            {siteConfig.description}
          </p>
        </div>
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-sm font-semibold">{group.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          © {siteConfig.name}. Imo-ishora tili ma’lumotlari faqat mutaxassislar
          tomonidan tasdiqlangan holda nashr etiladi.
        </p>
      </div>
    </footer>
  );
}
