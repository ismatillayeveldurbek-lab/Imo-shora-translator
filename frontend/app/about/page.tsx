import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Prose } from "@/components/layout/prose";
import { routes } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Biz haqimizda",
  description: "UzSign AI loyihasining maqsadi, tamoyillari va hozirgi holati.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Biz haqimizda"
        title="Kar va eshituvchi odamlar o‘rtasidagi muloqotni osonlashtirish"
        description="UzSign AI — o‘zbek tili va O‘zbekistonda qo‘llaniladigan imo-ishora tili o‘rtasida yordamchi vosita yaratish bo‘yicha ochiq loyiha."
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Prose>
          <h2>Maqsad</h2>
          <p>
            Platforma kar va eshitishida nuqsoni bo‘lgan insonlar, imo-ishora
            tilini o‘rganuvchilar, o‘qituvchilar va tarjimonlar uchun
            mo‘ljallangan. U imo-ishora tili tarjimonining o‘rnini bosmaydi — u
            o‘rganish va kundalik oddiy muloqot uchun yordamchi vositadir.
          </p>

          <h2>Tamoyillarimiz</h2>
          <ul>
            <li>
              <strong>Lingvistik to‘g‘rilik.</strong> Imo-ishora tili mustaqil
              til. Biz uning grammatikasini so‘zma-so‘z tarjima bilan almashtira
              olamiz deb da’vo qilmaymiz.
            </li>
            <li>
              <strong>Faqat tasdiqlangan ma’lumot.</strong> Har bir imo-ishora
              videosi va uning ma’nosi nashrdan oldin imo-ishora tili
              mutaxassisi tomonidan tekshiriladi. Imo-ishoralar o‘ylab
              topilmaydi.
            </li>
            <li>
              <strong>Halollik.</strong> Model yoki ma’lumot mavjud bo‘lmasa,
              ilova buni ochiq ko‘rsatadi. Soxta natijalar yoki tasdiqlanmagan
              aniqlik ko‘rsatkichlari e’lon qilinmaydi.
            </li>
            <li>
              <strong>Maxfiylik.</strong> Kamera va mikrofon faqat aniq
              ruxsatingiz bilan ishlaydi; kamera tasviri serverga yuborilmaydi.
            </li>
            <li>
              <strong>Hamjamiyat ishtiroki.</strong> Ma’lumotlar to‘plami faqat
              ongli rozilik bergan ishtirokchilar bilan yaratiladi va ular o‘z
              materiallarini o‘chirishni so‘rashi mumkin.
            </li>
          </ul>

          <h2>Hozirgi holat</h2>
          <p>
            Loyiha faol ishlab chiqilmoqda. Platforma asosi tayyor;
            imo-ishoralar lug‘ati, tarjima va aniqlash funksiyalari tasdiqlangan
            ma’lumotlar va o‘qitilgan modellar ulangan sari bosqichma-bosqich
            yoqiladi. Har bir funksiyaning texnik tafsilotlari{" "}
            <Link href={routes.howItWorks.href}>“Qanday ishlaydi”</Link>{" "}
            sahifasida.
          </p>

          <h2>Imo-ishora tili varianti</h2>
          <p>
            Platforma O‘zbekistonda qo‘llaniladigan, hamjamiyat tomonidan
            tasdiqlangan aniq bir imo-ishora tili variantiga asoslanadi. Har bir
            lug‘at yozuvi qaysi variantga tegishli ekanligi bilan saqlanadi, bu
            kelajakda boshqa variantlarni qo‘shish imkonini beradi.
          </p>
        </Prose>
      </div>
    </>
  );
}
