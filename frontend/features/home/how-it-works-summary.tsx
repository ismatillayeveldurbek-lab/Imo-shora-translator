import { ArrowRight, BookOpen, Hand, Type } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/site-config";

const STEPS = [
  {
    icon: Type,
    title: "Kiriting",
    text: "Matn yozing, gapiring yoki kamera oldida imo-ishora ko‘rsating.",
  },
  {
    icon: BookOpen,
    title: "Tasdiqlangan lug‘at",
    text: "Tizim faqat mutaxassislar tasdiqlagan imo-ishoralar bilan ishlaydi.",
  },
  {
    icon: Hand,
    title: "Natija",
    text: "Imo-ishora videolari yoki o‘zbekcha matn. Ishonch past bo‘lsa, bu ochiq aytiladi.",
  },
];

export function HowItWorksSummary() {
  return (
    <section aria-labelledby="how-title" className="border-y bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="how-title"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Qanday ishlaydi
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Uch qadam — va har birida nima sodir bo‘layotgani ochiq.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={routes.howItWorks.href}>
              Batafsil <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
              >
                {index + 1}
              </span>
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  <Icon aria-hidden="true" className="size-4 text-primary" />
                  {title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
