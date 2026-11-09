"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  NEXT_THEME,
  readThemePreference,
  setThemePreference,
  subscribeToTheme,
  type ThemePreference,
} from "@/lib/theme";

const LABELS: Record<ThemePreference, string> = {
  system: "Tizim mavzusi",
  light: "Yorug‘ mavzu",
  dark: "Qorong‘i mavzu",
};

const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;

export function ThemeToggle() {
  const preference = useSyncExternalStore(
    subscribeToTheme,
    readThemePreference,
    () => "system" as const,
  );
  const next = NEXT_THEME[preference];
  const Icon = ICONS[preference];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setThemePreference(next)}
      aria-label={`Joriy: ${LABELS[preference]}. ${LABELS[next]}ga o‘tish`}
      title={LABELS[preference]}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
