/**
 * Single source of truth for navigation. A route is only linked once its page
 * exists and works (`available: true`), so the UI never shows dead links.
 * tests/routes.test.ts verifies this against the app/ directory.
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
    available: true,
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
  dictionary: { href: "/dictionary", label: "Lug‘at", available: true },
  howItWorks: {
    href: "/how-it-works",
    label: "Qanday ishlaydi",
    available: true,
  },
  about: { href: "/about", label: "Biz haqimizda", available: true },
  privacy: { href: "/privacy", label: "Maxfiylik siyosati", available: true },
  settings: { href: "/settings", label: "Sozlamalar", available: true },
  admin: { href: "/admin", label: "Boshqaruv paneli", available: false },
} satisfies Record<string, AppRoute>;

export const mainNav: AppRoute[] = [
  routes.home,
  { ...routes.textToSign, label: "Tarjimon" },
  routes.dictionary,
  routes.howItWorks,
  routes.about,
];

export const footerNav: { title: string; items: AppRoute[] }[] = [
  {
    title: "Platforma",
    items: [
      routes.textToSign,
      routes.signToText,
      routes.speechToSign,
      routes.dictionary,
    ],
  },
  {
    title: "Ma’lumot",
    items: [routes.howItWorks, routes.about, routes.privacy],
  },
  { title: "Qulaylik", items: [routes.settings] },
];

export function availableOnly(items: AppRoute[]): AppRoute[] {
  return items.filter((item) => item.available);
}
