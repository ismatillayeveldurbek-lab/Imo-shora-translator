import { Logo } from "@/components/layout/logo";
import { MainNav } from "@/components/layout/main-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-1">
          <MainNav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
