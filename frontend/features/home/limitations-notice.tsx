import { Info } from "lucide-react";

export function LimitationsNotice() {
  return (
    <section
      aria-labelledby="limitations-title"
      className="mx-auto max-w-6xl px-4 pb-16 sm:px-6"
    >
      <div className="flex gap-4 rounded-xl border border-primary/20 bg-primary/5 p-6">
        <Info
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-primary"
        />
        <div className="space-y-2 text-sm">
          <h2 id="limitations-title" className="font-semibold">
            Cheklovlar haqida ochiq ma’lumot
          </h2>
          <p className="text-muted-foreground">
            Imo-ishora tili — o‘z grammatikasi, yuz ifodalari va tuzilishiga ega
            mustaqil til. MVP bosqichida matndan imo-ishoraga tarjima{" "}
            <strong>so‘zma-so‘z lug‘at qidiruvi</strong> asosida ishlaydi va
            to‘liq gap darajasidagi lingvistik tarjima emas. Imo-ishorani
            aniqlash faqat o‘qitilgan model qo‘llab-quvvatlaydigan alohida
            imo-ishoralar uchun ishlaydi.
          </p>
        </div>
      </div>
    </section>
  );
}
