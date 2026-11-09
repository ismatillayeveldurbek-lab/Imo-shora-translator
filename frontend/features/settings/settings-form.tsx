"use client";

import { Monitor, Moon, RotateCcw, Sun } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { THEME_LABELS } from "@/components/theme/theme-toggle";
import { OptionGroup } from "@/features/settings/option-group";
import { usePreferences } from "@/hooks/use-preferences";
import {
  resetPreferences,
  updatePreferences,
  type MotionPreference,
  type Preferences,
  type TextScale,
  type ThemePreference,
} from "@/lib/preferences";

export function SettingsForm() {
  const preferences = usePreferences();
  const [announcement, setAnnouncement] = useState("");

  function change(patch: Partial<Preferences>, message: string) {
    updatePreferences(patch);
    setAnnouncement(message);
  }

  return (
    <Card>
      <CardContent className="space-y-10 pt-6">
        <OptionGroup<ThemePreference>
          legend="Mavzu"
          description="Tizim mavzusi qurilmangiz sozlamasiga moslashadi."
          name="theme"
          value={preferences.theme}
          options={[
            { value: "system", label: "Tizim", icon: Monitor },
            { value: "light", label: "Yorug‘", icon: Sun },
            { value: "dark", label: "Qorong‘i", icon: Moon },
          ]}
          onChange={(theme) =>
            change({ theme }, `${THEME_LABELS[theme]} tanlandi.`)
          }
        />

        <OptionGroup<TextScale>
          legend="Matn o‘lchami"
          description="Butun interfeys mutanosib ravishda kattalashadi."
          name="textScale"
          value={preferences.textScale}
          options={[
            { value: "normal", label: "Oddiy", description: "100%" },
            { value: "large", label: "Katta", description: "112,5%" },
            { value: "xlarge", label: "Juda katta", description: "125%" },
          ]}
          onChange={(textScale) =>
            change({ textScale }, "Matn o‘lchami o‘zgartirildi.")
          }
        />

        <OptionGroup<MotionPreference>
          legend="Animatsiya"
          description="Harakatga sezgir foydalanuvchilar uchun animatsiya va o‘tishlarni o‘chiradi."
          name="motion"
          value={preferences.motion}
          options={[
            {
              value: "system",
              label: "Tizim bo‘yicha",
              description:
                "Qurilmadagi “harakatni kamaytirish” sozlamasiga amal qiladi",
            },
            {
              value: "reduce",
              label: "Kamaytirilgan",
              description: "Animatsiyalar doim o‘chiq",
            },
          ]}
          onChange={(motion) =>
            change({ motion }, "Animatsiya sozlamasi o‘zgartirildi.")
          }
        />

        <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Sozlamalar faqat shu brauzerda saqlanadi va serverga yuborilmaydi.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              resetPreferences();
              setAnnouncement("Sozlamalar standart holatga qaytarildi.");
            }}
          >
            <RotateCcw aria-hidden="true" /> Standart holatga qaytarish
          </Button>
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </CardContent>
    </Card>
  );
}
