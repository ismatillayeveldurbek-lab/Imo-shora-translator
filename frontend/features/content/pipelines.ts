import {
  AudioLines,
  BookOpen,
  Brain,
  Camera,
  CheckCircle2,
  Filter,
  Hand,
  ListOrdered,
  Mic,
  PlayCircle,
  ScanText,
  SpellCheck,
  Type,
  Waves,
} from "lucide-react";

import type { PipelineStep } from "@/features/content/pipeline-steps";

export const textToSignSteps: PipelineStep[] = [
  {
    icon: Type,
    title: "Matn kiritish",
    description: "O‘zbekcha matn (lotin yozuvida) kiritiladi va tekshiriladi.",
  },
  {
    icon: SpellCheck,
    title: "Normalizatsiya",
    description:
      "Harflar va turli apostrof belgilari (‘ ’ ʻ ' ʼ) yagona shaklga keltiriladi.",
  },
  {
    icon: ListOrdered,
    title: "Tokenizatsiya",
    description: "Matn so‘z va iboralarga ajratiladi.",
  },
  {
    icon: BookOpen,
    title: "Lug‘at qidiruvi",
    description:
      "Har bir so‘z yoki ibora tasdiqlangan imo-ishora yozuviga moslashtiriladi.",
  },
  {
    icon: CheckCircle2,
    title: "Tasdiqlangan imo-ishoralar",
    description:
      "Faqat mutaxassis tasdiqlagan yozuvlar ishlatiladi. Topilmagan so‘zlar alohida ko‘rsatiladi.",
  },
  {
    icon: PlayCircle,
    title: "Video ketma-ketligi",
    description: "Mos videolar ketma-ket ijro etiladi.",
  },
];

export const signToTextSteps: PipelineStep[] = [
  {
    icon: Camera,
    title: "Kamera",
    description:
      "Faqat sizning ruxsatingiz bilan, faqat shu sahifada yoqiladi.",
  },
  {
    icon: Hand,
    title: "Landmarklar",
    description:
      "Qo‘l va tana nuqtalari (koordinatalar) brauzerning o‘zida aniqlanadi.",
  },
  {
    icon: Waves,
    title: "Ketma-ketlik buferi",
    description:
      "Bir necha kadrdagi koordinatalar cheklangan buferda yig‘iladi va normallashtiriladi.",
  },
  {
    icon: Brain,
    title: "O‘qitilgan model",
    description:
      "Serverdagi model faqat raqamli koordinatalarni qabul qiladi, video emas.",
  },
  {
    icon: Filter,
    title: "Ishonch filtri",
    description:
      "Ishonch past bo‘lsa, natija o‘rniga “Noma’lum imo-ishora” ko‘rsatiladi.",
  },
  {
    icon: ScanText,
    title: "O‘zbekcha matn",
    description: "Aniqlangan imo-ishora matn sifatida chiqadi.",
  },
];

export const speechToSignSteps: PipelineStep[] = [
  {
    icon: Mic,
    title: "Mikrofon",
    description:
      "Yozib olish faqat tugmani bosganingizda va ko‘rinadigan holatda.",
  },
  {
    icon: AudioLines,
    title: "Nutqni aniqlash",
    description: "Sozlangan o‘zbek tili ASR modeli nutqni matnga aylantiradi.",
  },
  {
    icon: SpellCheck,
    title: "Tahrirlash",
    description:
      "Transkripsiyani tarjimadan oldin ko‘rib, tuzatishingiz mumkin.",
  },
  {
    icon: PlayCircle,
    title: "Imo-ishora videolari",
    description: "Matn “matndan imo-ishoraga” jarayonidan o‘tadi.",
  },
];
