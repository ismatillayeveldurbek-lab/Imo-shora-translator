/**
 * Theme preference: "system" follows the OS; "light"/"dark" are explicit.
 * The effective theme is applied as a `dark` class on <html>. An inline script
 * (THEME_INIT_SCRIPT) applies it before first paint to avoid a flash.
 */
export type ThemePreference = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "uzsign-theme";
const THEME_EVENT = "uzsign-theme-change";

export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");var d=p==="dark"||((!p||p==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

function isPreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function readThemePreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isPreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(preference: ThemePreference): void {
  const dark =
    preference === "dark" ||
    (preference === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function setThemePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage unavailable (private mode): the theme still applies for this page view.
  }
  applyTheme(preference);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function subscribeToTheme(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (readThemePreference() === "system") applyTheme("system");
    onChange();
  };
  media.addEventListener("change", onSystemChange);
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export const NEXT_THEME: Record<ThemePreference, ThemePreference> = {
  system: "light",
  light: "dark",
  dark: "system",
};
