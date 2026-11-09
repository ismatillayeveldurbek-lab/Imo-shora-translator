import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Callout } from "@/components/ui/callout";
import { PipelineSteps } from "@/features/content/pipeline-steps";
import {
  signToTextSteps,
  speechToSignSteps,
  textToSignSteps,
} from "@/features/content/pipelines";

export const metadata: Metadata = {
  title: "Qanday ishlaydi",
  description:
    "UzSign AI tarjima va aniqlash jarayonlari hamda ularning cheklovlari.",
};

const LEVELS = [
  {
    title: "Lug‘atga asoslangan tarjima",
    status: "MVP",
    text: "So‘z yoki ibora tasdiqlangan imo-ishora videosiga moslanadi. Imo-ishora tili grammatikasi (so‘z tartibi, yuz ifodalari, fazoviy munosabatlar) hisobga olinmaydi.",
  },
  {
    title: "Alohida imo-ishorani aniqlash",
    status: "MVP (o‘qitilgan model bilan)",
    text: "Kamera oldida ko‘rsatilgan bitta imo-ishora model biladigan cheklangan ro‘yxatdan aniqlanadi.",
  },
  {
    title: "Uzluksiz aniqlash",
    status: "Kelajakda",
    text: "Ketma-ket ko‘rsatilgan imo-ishoralar oqimini ajratib aniqlash. Katta va izohlangan ma’lumotlar to‘plami talab qilinadi.",
  },
  {
    title: "Gap darajasidagi tarjima",
    status: "Kelajakda",
    text: "Imo-ishora tili grammatikasini hisobga oluvchi to‘liq tarjima. Faqat lingvist mutaxassislar va yetarli ma’lumot bilan.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Qanday ishlaydi"
        title="Har bir jarayon ochiq va tushunarli"
        description="UzSign AI qaysi qadamlarni bajarishi, qaysi ma’lumotlar qayerda qayta ishlanishi va qanday cheklovlar borligi."
      />
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6">
        <section aria-labelledby="levels-title" className="space-y-6">
          <h2
            id="levels-title"
            className="text-2xl font-semibold tracking-tight"
          >
            Tarjima darajalari
          </h2>
          <p className="max-w-3xl text-muted-foreground">
            Imo-ishora tili — o‘z grammatikasi, yuz ifodalari va fazoviy
            tuzilishiga ega mustaqil til. U og‘zaki o‘zbek tilining so‘zma-so‘z
            ko‘rinishi emas. Shuning uchun biz imkoniyatlarni darajalarga
            ajratamiz va har birining holatini aniq aytamiz.
          </p>
          <dl className="grid gap-4 sm:grid-cols-2">
            {LEVELS.map((level) => (
              <div key={level.title} className="rounded-xl border bg-card p-5">
                <dt className="flex flex-wrap items-center justify-between gap-2 font-semibold">
                  {level.title}
                  <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {level.status}
                  </span>
                </dt>
                <dd className="mt-2 text-sm text-muted-foreground">
                  {level.text}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="text-title" className="space-y-6">
          <h2 id="text-title" className="text-2xl font-semibold tracking-tight">
            Matndan imo-ishoraga
          </h2>
          <PipelineSteps
            label="Matndan imo-ishoraga jarayoni"
            steps={textToSignSteps}
          />
        </section>

        <section aria-labelledby="sign-title" className="space-y-6">
          <h2 id="sign-title" className="text-2xl font-semibold tracking-tight">
            Imo-ishoradan matnga
          </h2>
          <PipelineSteps
            label="Imo-ishoradan matnga jarayoni"
            steps={signToTextSteps}
          />
          <Callout title="Video serverga yuborilmaydi">
            Kamera tasviri faqat brauzeringizda qayta ishlanadi. Serverga faqat
            qo‘l va tana nuqtalarining raqamli koordinatalari yuboriladi va ular
            saqlanmaydi.
          </Callout>
        </section>

        <section aria-labelledby="speech-title" className="space-y-6">
          <h2
            id="speech-title"
            className="text-2xl font-semibold tracking-tight"
          >
            Nutqdan imo-ishoraga
          </h2>
          <PipelineSteps
            label="Nutqdan imo-ishoraga jarayoni"
            steps={speechToSignSteps}
          />
          <Callout
            tone="warning"
            title="Nutqni aniqlash sifati modelga bog‘liq"
          >
            Barcha nutqni aniqlash modellari o‘zbek tilida bir xil ishlamaydi.
            Bu funksiya faqat o‘zbek nutqida sinovdan o‘tgan model ulanganda
            yoqiladi.
          </Callout>
        </section>
      </div>
    </>
  );
}
