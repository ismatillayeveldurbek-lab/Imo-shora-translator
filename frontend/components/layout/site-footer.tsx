import Link from "next/link";

import { routes, siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const links = Object.values(routes).filter(
    (r) => r.available && r.href !== "/",
  );
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {siteConfig.name}. Imo-ishora tili ma’lumotlari faqat mutaxassislar
          tomonidan tasdiqlangan holda nashr etiladi.
        </p>
        {links.length > 0 && (
          <nav aria-label="Pastki navigatsiya">
            <ul className="flex gap-4">
              {links.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="hover:text-foreground">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </footer>
  );
}
