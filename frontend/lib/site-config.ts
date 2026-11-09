/**
 * Single source of truth for navigation. A route is only linked once its page
 * exists (`available: true`), so the UI never shows dead links.
 */
export type AppRoute = {
  href: string;
  label: string;
  available: boolean;
};

export const siteConfig = {
  name: "UzSign AI",
  tagline: "Til va imo-ishora o‘rtasidagi ko‘prik",
  description:
    "O‘zbek tili va imo-ishora tili o‘rtasida tarjima qilishga yordam beruvchi sun’iy intellekt platformasi.",
} as const;

export const routes = {
  home: { href: "/", label: "Bosh sahifa", available: true },
  textToSign: {
    href: "/translate/text",
    label: "Matndan imo-ishoraga",
    available: false,
  },
  signToText: {
    href: "/recognize",
    label: "Imo-ishoradan matnga",
    available: false,
  },
  speechToSign: {
    href: "/translate/speech",
    label: "Nutqdan imo-ishoraga",
    available: false,
  },
  dictionary: { href: "/dictionary", label: "Lug‘at", available: false },
  about: { href: "/about", label: "Biz haqimizda", available: false },
  privacy: { href: "/privacy", label: "Maxfiylik siyosati", available: false },
} satisfies Record<string, AppRoute>;

export const mainNav: AppRoute[] = [
  routes.home,
  { ...routes.textToSign, label: "Tarjimon" },
  routes.dictionary,
  routes.about,
];
