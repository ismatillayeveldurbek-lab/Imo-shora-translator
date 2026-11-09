import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Prose } from "@/components/layout/prose";
import { Callout } from "@/components/ui/callout";
import { routes } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Maxfiylik siyosati",
  description:
    "UzSign AI kamera, mikrofon va boshqa ma’lumotlarni qanday qayta ishlaydi.",
};

const SECTIONS = [
  { id: "kamera", title: "Kamera" },
  { id: "mikrofon", title: "Mikrofon va nutq" },
  { id: "matn", title: "Kiritilgan matn va tarix" },
  { id: "brauzer", title: "Brauzerda saqlanadigan ma’lumotlar" },
  { id: "dataset", title: "Ma’lumotlar to‘plamiga hissa qo‘shish" },
  { id: "xavfsizlik", title: "Xavfsizlik" },
  { id: "huquqlar", title: "Sizning huquqlaringiz" },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Maxfiylik siyosati"
        title="Ma’lumotlaringiz qanday qayta ishlanadi"
        description="Biz faqat funksiya ishlashi uchun zarur bo‘lgan minimal ma’lumotni qayta ishlaymiz va yashirin yozib olish qilmaymiz."
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[220px_1fr]">
        <nav
          aria-label="Bo‘limlar"
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <p className="text-sm font-semibold">Bo‘limlar</p>
          <ul className="mt-3 space-y-2 text-sm">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-8">
          <Callout tone="warning" title="Loyiha holatidagi hujjat">
            Bu siyosat platformaning texnik ishlash tartibini tasvirlaydi.
            Rasmiy ishga tushirishdan oldin u O‘zbekiston Respublikasining
            shaxsga doir ma’lumotlar to‘g‘risidagi qonunchiligi bo‘yicha yurist
            tomonidan ko‘rib chiqilishi kerak. Ayrim funksiyalar hali ishga
            tushirilmagan; ular yoqilganda shu qoidalar asosida ishlaydi.
          </Callout>

          <Prose>
            <h2 id="kamera">Kamera</h2>
            <ul>
              <li>
                Kamera faqat “Imo-ishoradan matnga” sahifasida, siz aniq ruxsat
                berganingizdan va tugmani bosganingizdan keyin yoqiladi.
              </li>
              <li>Kamera ishlayotganda bu ekranda doim ko‘rinib turadi.</li>
              <li>
                Video tasvir <strong>faqat brauzeringizda</strong> qayta
                ishlanadi. Serverga faqat qo‘l va tana nuqtalarining raqamli
                koordinatalari yuboriladi.
              </li>
              <li>
                Koordinatalar faqat bashorat uchun ishlatiladi va{" "}
                <strong>saqlanmaydi</strong>.
              </li>
              <li>
                Sahifadan chiqqaningizda yoki “To‘xtatish”ni bosganingizda
                kamera o‘chadi.
              </li>
            </ul>

            <h2 id="mikrofon">Mikrofon va nutq</h2>
            <ul>
              <li>
                Mikrofon faqat aniq ruxsatingiz va “Yozishni boshlash” tugmasi
                bilan ishlaydi.
              </li>
              <li>Yozib olish holati doim ekranda ko‘rsatiladi.</li>
              <li>
                Audio faqat matnga aylantirish uchun serverga yuboriladi.
                Standart holatda u transkripsiyadan so‘ng{" "}
                <strong>saqlanmaydi</strong>.
              </li>
              <li>
                Agar tashqi nutqni aniqlash xizmati ulansa, uning nomi va
                ma’lumotlarni qayta ishlash shartlari shu yerda alohida
                ko‘rsatiladi.
              </li>
            </ul>

            <h2 id="matn">Kiritilgan matn va tarix</h2>
            <ul>
              <li>
                Tarjima uchun kiritilgan matn faqat so‘rovni bajarish uchun
                ishlatiladi.
              </li>
              <li>
                Tarjima tarixi <strong>faqat siz rozilik bersangiz</strong>{" "}
                saqlanadi (standart holatda o‘chirilgan), cheklangan muddat
                davomida turadi va keyin avtomatik o‘chiriladi.
              </li>
              <li>Tarixda hech qachon audio yoki video saqlanmaydi.</li>
            </ul>

            <h2 id="brauzer">Brauzerda saqlanadigan ma’lumotlar</h2>
            <p>
              <Link href={routes.settings.href}>Sozlamalar</Link> (mavzu, matn
              o‘lchami, animatsiya) faqat brauzeringizning mahalliy xotirasida
              saqlanadi va serverga yuborilmaydi. Biz reklama yoki kuzatuv
              cookie fayllaridan foydalanmaymiz.
            </p>

            <h2 id="dataset">Ma’lumotlar to‘plamiga hissa qo‘shish</h2>
            <ul>
              <li>
                Modelni o‘qitish uchun videolar faqat yozma, ongli rozilik
                bergan ishtirokchilardan to‘planadi. Oddiy foydalanish paytida
                hech qanday ma’lumot o‘qitish uchun to‘planmaydi.
              </li>
              <li>
                Ishtirokchi istalgan vaqtda o‘z materiallarini o‘chirishni
                so‘rashi mumkin.
              </li>
              <li>Xom videolar ochiq repozitoriylarda nashr etilmaydi.</li>
            </ul>

            <h2 id="xavfsizlik">Xavfsizlik</h2>
            <ul>
              <li>
                Productionda barcha aloqa shifrlangan (HTTPS / WSS) kanal orqali
                amalga oshadi.
              </li>
              <li>
                Boshqaruv paneli faqat vakolatli xodimlar uchun, rolga
                asoslangan kirish bilan.
              </li>
              <li>
                Maxfiy kalitlar kodda emas, muhit o‘zgaruvchilarida saqlanadi.
              </li>
            </ul>

            <h2 id="huquqlar">Sizning huquqlaringiz</h2>
            <p>
              Siz kamera va mikrofon ruxsatlarini istalgan vaqtda brauzer
              sozlamalarida bekor qilishingiz, saqlangan tarixingizni
              o‘chirishni va o‘zingizga tegishli ma’lumotlar haqida ma’lumot
              olishni so‘rashingiz mumkin.
            </p>
          </Prose>
        </div>
      </div>
    </>
  );
}
