import { vi } from "vitest";

/** Mutable stand-in for next/navigation state used by tests. */
export const navigation = {
  pathname: "/",
  search: "",
  replace: vi.fn((href: string) => {
    const url = new URL(href, "http://localhost");
    navigation.pathname = url.pathname;
    navigation.search = url.search.replace(/^\?/, "");
  }),
  push: vi.fn(),
  reset(pathname = "/", search = "") {
    navigation.pathname = pathname;
    navigation.search = search;
    navigation.replace.mockClear();
    navigation.push.mockClear();
  },
};
