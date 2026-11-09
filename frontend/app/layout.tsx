import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { Providers } from "@/app/providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { siteConfig } from "@/lib/site-config";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbfc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1421" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The pre-paint script may add the `dark` class, so the attribute can differ from SSR.
    <html lang="uz" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <SkipLink />
        <Providers>
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
