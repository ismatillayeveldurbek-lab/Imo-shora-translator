import { Eye, Keyboard, Settings, Subtitles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/site-config";

const ITEMS = [
  {
    icon: Keyboard,
    title: "Klaviatura",
    text: "Barcha funksiyalar sichqonchasiz, ko‘rinadigan fokus bilan.",
  },
  {
    icon: Eye,
    title: "O‘qilishi oson",
    text: "Yuqori kontrast, matnni kattalashtirish, yorug‘ va qorong‘i mavzu.",
  },
  {
    icon: Subtitles,
    title: "Matnli ekvivalent",
    text: "Har bir video yonida so‘z va gloss yozuvi.",
  },
  {
    icon: Settings,
    title: "Harakatni kamaytirish",
    text: "Animatsiyalarni bir tugma bilan o‘chirish mumkin.",
  },
];

export function AccessibilitySection() {
  return (
    <section
      aria-labelledby="a11y-home-title"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div>
          <h2
            id="a11y-home-title"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Hamma uchun qulay
          </h2>
          <p className="mt-3 text-muted-foreground">
            Platforma kar va eshitishida nuqsoni bo‘lgan foydalanuvchilar bilan
            birga, qulaylik talablarini birinchi o‘ringa qo‘yib
            loyihalashtirilgan.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href={routes.settings.href}>
              <Settings aria-hidden="true" /> Qulaylik sozlamalari
            </Link>
          </Button>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-xl border bg-card p-5">
              <Icon
                aria-hidden="true"
                className="size-5 text-accent-foreground"
              />
              <p className="mt-3 font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
