import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { routes } from "@/lib/site-config";

const APP_DIR = join(__dirname, "..", "app");

function pageExists(href: string): boolean {
  const segment = href === "/" ? "" : href.replace(/^\//, "");
  return existsSync(join(APP_DIR, segment, "page.tsx"));
}

describe("route availability", () => {
  it.each(Object.entries(routes))(
    "%s: `available` matches whether a page exists",
    (_, route) => {
      // Linking an unavailable page would produce a dead link; an existing page
      // marked unavailable would be unreachable from navigation.
      expect(pageExists(route.href)).toBe(route.available);
    },
  );
});
