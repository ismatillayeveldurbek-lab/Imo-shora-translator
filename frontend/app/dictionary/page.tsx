import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { DictionaryBrowser } from "@/features/dictionary/dictionary-browser";

export const metadata: Metadata = {
  title: "Imo-ishoralar lug‘ati",
  description:
    "Mutaxassislar tomonidan tasdiqlangan imo-ishoralarni qidiring va ko‘ring.",
};

export default function DictionaryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Lug‘at"
        title="Imo-ishoralar lug‘ati"
        description="Faqat mutaxassislar tasdiqlagan va videosi tekshirilgan imo-ishoralar. Qidiring, toifa yoki harf bo‘yicha ko‘ring."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* The browser reads URL search params, so it renders on the client. */}
        <Suspense
          fallback={
            <div
              aria-label="Yuklanmoqda"
              className="h-96 animate-pulse rounded-xl bg-muted/60"
            />
          }
        >
          <DictionaryBrowser />
        </Suspense>
      </div>
    </>
  );
}
