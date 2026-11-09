import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Prose } from "@/components/layout/prose";
import { SettingsForm } from "@/features/settings/settings-form";

export const metadata: Metadata = {
  title: "Sozlamalar va qulaylik",
  description: "Mavzu, matn o‘lchami va animatsiya sozlamalari.",
};

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sozlamalar"
        title="Ko‘rinish va qulaylik"
        description="Interfeysni o‘zingizga qulay qilib sozlang. O‘zgarishlar darhol qo‘llanadi."
      />
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6">
        <SettingsForm />
        <section aria-labelledby="a11y-title">
          <Prose>
            <h2 id="a11y-title">
              Qulaylik (accessibility) bo‘yicha majburiyatlarimiz
            </h2>
            <ul>
              <li>
                Barcha funksiyalar faqat klaviatura bilan boshqariladi; fokus
                doim ko‘rinadi.
              </li>
              <li>
                Har bir sahifa boshida “Asosiy mazmunga o‘tish” havolasi bor
                (Tab tugmasini bosing).
              </li>
              <li>Tugma va maydonlar ekran o‘quvchilari uchun nomlangan.</li>
              <li>
                Ranglar o‘qilishi uchun WCAG AA kontrast talabiga muvofiq
                tanlangan.
              </li>
              <li>
                Imo-ishora videolari yonida doim matnli ekvivalent (o‘zbekcha
                so‘z va gloss) ko‘rsatiladi.
              </li>
              <li>
                Kamera va mikrofon ruxsatlari so‘ralishidan oldin ularning
                maqsadi tushuntiriladi.
              </li>
            </ul>
          </Prose>
        </section>
      </div>
    </>
  );
}
