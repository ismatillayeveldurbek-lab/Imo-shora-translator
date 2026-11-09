import { ChevronDown } from "lucide-react";

export const FAQ_ITEMS = [
  {
    q: "UzSign AI imo-ishora tili tarjimonining o‘rnini bosadimi?",
    a: "Yo‘q. Bu o‘rganish va oddiy muloqot uchun yordamchi vosita. Rasmiy, tibbiy yoki huquqiy vaziyatlarda malakali imo-ishora tili tarjimoniga murojaat qiling.",
  },
  {
    q: "Matnni imo-ishoraga tarjima qilish qanchalik aniq?",
    a: "MVP so‘zma-so‘z lug‘at qidiruvidan foydalanadi: har bir so‘z tasdiqlangan imo-ishora videosiga moslanadi. Imo-ishora tili grammatikasi (so‘z tartibi, yuz ifodalari) hali hisobga olinmaydi va lug‘atda yo‘q so‘zlar alohida belgilanadi.",
  },
  {
    q: "Imo-ishoralar qayerdan olinadi?",
    a: "Faqat imo-ishora tili mutaxassislari tekshirib tasdiqlagan videolar nashr etiladi. Biz imo-ishoralarni o‘ylab topmaymiz va avtomatik yaratmaymiz.",
  },
  {
    q: "Kamera tasvirim serverga yuboriladimi?",
    a: "Yo‘q. Tasvir brauzeringizda qayta ishlanadi, serverga faqat qo‘l va tana nuqtalarining raqamli koordinatalari boradi va ular saqlanmaydi.",
  },
  {
    q: "Nega ba’zi funksiyalar hali ishlamaydi?",
    a: "Imo-ishorani aniqlash va nutqni tanib olish haqiqiy ma’lumotlarda o‘qitilgan modellarni talab qiladi. Model tayyor bo‘lmaguncha funksiya o‘chiq turadi — biz soxta natija ko‘rsatmaymiz.",
  },
  {
    q: "Qanday imo-ishoralarni aniqlash mumkin?",
    a: "Faqat model o‘qitilgan cheklangan ro‘yxatdagi alohida imo-ishoralarni. Model ishonchi past bo‘lsa, “Noma’lum imo-ishora” deb ko‘rsatiladi.",
  },
];

/** Native <details> disclosure: keyboard and screen-reader accessible without JavaScript. */
export function Faq() {
  return (
    <section
      aria-labelledby="faq-title"
      className="mx-auto max-w-3xl px-4 py-16 sm:px-6"
    >
      <h2
        id="faq-title"
        className="text-center text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        Ko‘p beriladigan savollar
      </h2>
      <div className="mt-8 divide-y rounded-xl border bg-card">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="px-5 pb-5 text-sm leading-6 text-muted-foreground">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
