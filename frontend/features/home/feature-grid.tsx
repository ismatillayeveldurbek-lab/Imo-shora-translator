import { BookOpen, Camera, Mic, Type, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes, type AppRoute } from "@/lib/site-config";

type Feature = { route: AppRoute; icon: LucideIcon; description: string };

const FEATURES: Feature[] = [
  {
    route: routes.textToSign,
    icon: Type,
    description:
      "O‘zbekcha matnni kiriting va tasdiqlangan imo-ishora videolarini ketma-ket ko‘ring.",
  },
  {
    route: routes.signToText,
    icon: Camera,
    description:
      "Kamera orqali qo‘llab-quvvatlanadigan alohida imo-ishoralarni aniqlash (o‘qitilgan model talab qilinadi).",
  },
  {
    route: routes.speechToSign,
    icon: Mic,
    description:
      "O‘zbek nutqini matnga aylantirib, mos imo-ishora videolarini ko‘rsatish (ASR modeli talab qilinadi).",
  },
  {
    route: routes.dictionary,
    icon: BookOpen,
    description:
      "Mutaxassislar tasdiqlagan imo-ishoralarni qidiring, toifalar bo‘yicha ko‘ring.",
  },
];

export function FeatureGrid() {
  return (
    <section
      aria-labelledby="features-title"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
    >
      <h2
        id="features-title"
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        Imkoniyatlar
      </h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Har bir modul faqat haqiqiy ma’lumotlar va o‘qitilgan modellar mavjud
        bo‘lganda faollashadi.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {FEATURES.map(({ route, icon: Icon, description }) => {
          const content = (
            <Card className="h-full transition-colors group-hover:border-primary/40">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
                  >
                    <Icon className="size-5" />
                  </span>
                  {!route.available && (
                    <Badge variant="outline">Keyingi bosqichda</Badge>
                  )}
                </div>
                <CardTitle className="mt-4 text-lg">{route.label}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          );
          return (
            <li key={route.href}>
              {route.available ? (
                <Link
                  href={route.href}
                  className="group block h-full rounded-xl"
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
