import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

beforeEach(async () => {
  const { navigation } = await import("./navigation-mock");
  navigation.reset();
  localStorage.clear();
  const root = document.documentElement;
  root.className = "";
  delete root.dataset.textScale;
  delete root.dataset.motion;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// jsdom does not implement matchMedia.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
});

// next/navigation is only available inside the Next runtime.
vi.mock("next/navigation", async () => {
  const { navigation } = await import("./navigation-mock");
  return {
    usePathname: () => navigation.pathname,
    useSearchParams: () => new URLSearchParams(navigation.search),
    useRouter: () => ({ replace: navigation.replace, push: navigation.push }),
  };
});
