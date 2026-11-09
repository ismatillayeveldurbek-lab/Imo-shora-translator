import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { TextTranslateForm } from "@/features/translate/text-translate-form";

export const metadata: Metadata = {
  title: "Matndan imo-ishoraga",
  description:
    "O‘zbekcha matnni tasdiqlangan imo-ishora videolari ketma-ketligiga aylantirish.",
};

export default function TextToSignPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tarjimon"
        title="Matndan imo-ishoraga"
        description="O‘zbekcha matn kiriting: har bir so‘z uchun tasdiqlangan imo-ishora videosi ketma-ket ko‘rsatiladi."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <TextTranslateForm />
      </div>
    </>
  );
}
