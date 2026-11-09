import { Settings } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-1">
          <MainNav />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
          >
            <Link
              href={routes.settings.href}
              aria-label="Sozlamalar va qulaylik"
              title="Sozlamalar"
            >
              <Settings aria-hidden="true" />
            </Link>
          </Button>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
