import { describe, expect, it } from "vitest";

import {
  DEFAULT_PREFERENCES,
  PREFERENCES_INIT_SCRIPT,
  PREFERENCES_STORAGE_KEY,
  readPreferences,
  resetPreferences,
  updatePreferences,
} from "@/lib/preferences";

describe("preferences", () => {
  it("returns defaults when nothing is stored", () => {
    expect(readPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("ignores corrupt or unknown stored values", () => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, "{not json");
    expect(readPreferences()).toEqual(DEFAULT_PREFERENCES);
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ theme: "neon", textScale: "large", motion: 1 }),
    );
    expect(readPreferences()).toEqual({
      ...DEFAULT_PREFERENCES,
      textScale: "large",
    });
  });

  it("returns a stable snapshot while storage is unchanged", () => {
    expect(readPreferences()).toBe(readPreferences());
  });

  it("applies and persists updates to the document", () => {
    updatePreferences({ theme: "dark", textScale: "xlarge", motion: "reduce" });
    const root = document.documentElement;
    expect(root).toHaveClass("dark");
    expect(root.dataset.textScale).toBe("xlarge");
    expect(root.dataset.motion).toBe("reduce");

    resetPreferences();
    expect(root).not.toHaveClass("dark");
    expect(root.dataset.textScale).toBeUndefined();
    expect(root.dataset.motion).toBeUndefined();
    expect(localStorage.getItem(PREFERENCES_STORAGE_KEY)).toBeNull();
  });

  it("pre-paint script applies the same stored preferences", () => {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ theme: "dark", textScale: "large", motion: "reduce" }),
    );
    new Function(PREFERENCES_INIT_SCRIPT)();
    const root = document.documentElement;
    expect(root).toHaveClass("dark");
    expect(root.dataset.textScale).toBe("large");
    expect(root.dataset.motion).toBe("reduce");
  });
});
