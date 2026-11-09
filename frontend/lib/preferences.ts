/**
 * User display preferences (stored only in this browser's localStorage).
 *
 * - theme:     "system" follows the OS; "light"/"dark" are explicit.
 * - textScale: root font-size multiplier; all spacing/typography is rem-based.
 * - motion:    "system" follows prefers-reduced-motion; "reduce" forces it.
 *
 * PREFERENCES_INIT_SCRIPT applies them before first paint (no flash).
 */
export type ThemePreference = "system" | "light" | "dark";
export type TextScale = "normal" | "large" | "xlarge";
export type MotionPreference = "system" | "reduce";

export type Preferences = {
  theme: ThemePreference;
  textScale: TextScale;
  motion: MotionPreference;
};

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "system",
  textScale: "normal",
  motion: "system",
};

export const PREFERENCES_STORAGE_KEY = "uzsign-preferences";
const CHANGE_EVENT = "uzsign-preferences-change";

const ALLOWED: { [K in keyof Preferences]: readonly Preferences[K][] } = {
  theme: ["system", "light", "dark"],
  textScale: ["normal", "large", "xlarge"],
  motion: ["system", "reduce"],
};

// Kept in sync with applyPreferences(); runs before React hydrates.
export const PREFERENCES_INIT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem("${PREFERENCES_STORAGE_KEY}")||"{}");var r=document.documentElement;var t=p.theme;var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);r.classList.toggle("dark",d);if(p.textScale==="large"||p.textScale==="xlarge")r.dataset.textScale=p.textScale;if(p.motion==="reduce")r.dataset.motion="reduce"}catch(e){}})()`;

function sanitize(raw: unknown): Preferences {
  const result = { ...DEFAULT_PREFERENCES };
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    for (const key of Object.keys(ALLOWED) as (keyof Preferences)[]) {
      const value = record[key];
      if ((ALLOWED[key] as readonly unknown[]).includes(value)) {
        (result as Record<keyof Preferences, unknown>)[key] = value;
      }
    }
  }
  return result;
}

// useSyncExternalStore requires referentially stable snapshots.
let cachedRaw: string | null | undefined;
let cachedPreferences: Preferences = DEFAULT_PREFERENCES;

export function readPreferences(): Preferences {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
  } catch {
    // Storage unavailable (e.g. privacy mode): fall back to defaults.
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    let parsed: unknown = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }
    cachedPreferences = sanitize(parsed);
  }
  return cachedPreferences;
}

export function getServerPreferences(): Preferences {
  return DEFAULT_PREFERENCES;
}

export function applyPreferences(prefs: Preferences): void {
  const root = document.documentElement;
  const dark =
    prefs.theme === "dark" ||
    (prefs.theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  if (prefs.textScale === "normal") delete root.dataset.textScale;
  else root.dataset.textScale = prefs.textScale;
  if (prefs.motion === "reduce") root.dataset.motion = "reduce";
  else delete root.dataset.motion;
}

export function updatePreferences(patch: Partial<Preferences>): void {
  const next = { ...readPreferences(), ...patch };
  try {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Not persisted, but still applied for this page view.
    cachedRaw = undefined;
    cachedPreferences = next;
  }
  applyPreferences(next);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function resetPreferences(): void {
  try {
    window.localStorage.removeItem(PREFERENCES_STORAGE_KEY);
  } catch {
    // ignore
  }
  applyPreferences(DEFAULT_PREFERENCES);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeToPreferences(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemThemeChange = () => {
    applyPreferences(readPreferences());
    onChange();
  };
  media.addEventListener("change", onSystemThemeChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  // Keep multiple tabs in sync.
  const onStorage = (event: StorageEvent) => {
    if (event.key === PREFERENCES_STORAGE_KEY || event.key === null) {
      applyPreferences(readPreferences());
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    media.removeEventListener("change", onSystemThemeChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export const NEXT_THEME: Record<ThemePreference, ThemePreference> = {
  system: "light",
  light: "dark",
  dark: "system",
};
