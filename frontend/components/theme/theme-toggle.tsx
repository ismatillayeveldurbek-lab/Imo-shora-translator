"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePreferences } from "@/hooks/use-preferences";
import {
  NEXT_THEME,
  updatePreferences,
  type ThemePreference,
} from "@/lib/preferences";

export const THEME_LABELS: Record<ThemePreference, string> = {
  system: "Tizim mavzusi",
  light: "Yorug‘ mavzu",
  dark: "Qorong‘i mavzu",
};

const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;

export function ThemeToggle() {
  const { theme } = usePreferences();
  const next = NEXT_THEME[theme];
  const Icon = ICONS[theme];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => updatePreferences({ theme: next })}
      aria-label={`Joriy: ${THEME_LABELS[theme]}. ${THEME_LABELS[next]}ga o‘tish`}
      title={THEME_LABELS[theme]}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
