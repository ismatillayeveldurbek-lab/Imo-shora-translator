"use client";

import { useSyncExternalStore } from "react";

import {
  getServerPreferences,
  readPreferences,
  subscribeToPreferences,
  type Preferences,
} from "@/lib/preferences";

export function usePreferences(): Preferences {
  return useSyncExternalStore(
    subscribeToPreferences,
    readPreferences,
    getServerPreferences,
  );
}
