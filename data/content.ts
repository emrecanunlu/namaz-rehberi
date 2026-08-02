import type { ImageSourcePropType } from "react-native";
import { IMAGES } from "@/constants/images";
import { t } from "@/lib/i18n";

export type PrayerStep = {
  arabic?: string;
};

export type PrayerGuide = {
  id: "sabah" | "ogle" | "ikindi" | "aksam" | "yatsi";
  rakats: number;
  stepCount: number;
  steps: PrayerStep[];
};

export const PRAYER_GUIDES: PrayerGuide[] = [
  {
    id: "sabah",
    rakats: 2,
    stepCount: 8,
    steps: [
      {},
      { arabic: "Allahu Ekber" },
      {},
      { arabic: "Sübhane Rabbiyel Azîm" },
      {},
      { arabic: "Sübhane Rabbiyel A'lâ" },
      {},
      { arabic: "Esselamu aleykum ve rahmetullah" },
    ],
  },
  {
    id: "ogle",
    rakats: 4,
    stepCount: 4,
    steps: [{}, {}, {}, {}],
  },
  {
    id: "ikindi",
    rakats: 4,
    stepCount: 3,
    steps: [{}, {}, {}],
  },
  {
    id: "aksam",
    rakats: 3,
    stepCount: 3,
    steps: [{}, {}, {}],
  },
  {
    id: "yatsi",
    rakats: 4,
    stepCount: 3,
    steps: [{}, {}, {}],
  },
];

export type DailyDua = {
  id: string;
  arabic: string;
  latin: string;
};

export const DAILY_DUAS: DailyDua[] = [
  {
    id: "1",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
    latin: "Asbahna ve asbehal mülkü lillah...",
  },
  {
    id: "2",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ",
    latin: "Bismillahillezi la yedurru me'asmihi şey'un...",
  },
  {
    id: "3",
    arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ",
    latin: "Estağfirullaha'l-azîm",
  },
  {
    id: "4",
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    latin: "Elhamdü lillahi rabbil âlemîn",
  },
  {
    id: "5",
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    latin: "Rabbişrah li sadri ve yessir li emri",
  },
  {
    id: "6",
    arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    latin: "Ihdinas sıratal müstakîm",
  },
  {
    id: "7",
    arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ",
    latin: "Rabbena heb lena min ezvacina ve zürriyyatina kurrate a'yun",
  },
  {
    id: "8",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    latin: "Rabbi zidni ilma",
  },
  {
    id: "9",
    arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    latin: "La ilahe illa ente sübhaneke inni küntü minez zalimin",
  },
  {
    id: "10",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
    latin: "Amsayna ve amsel mülkü lillah...",
  },
  {
    id: "11",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    latin: "Bismike Allahümme emutu ve ahya",
  },
  {
    id: "12",
    arabic: "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    latin: "Rabbena zalemna enfusena...",
  },
  {
    id: "13",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا",
    latin: "Allahümme inni es'elüke ilman nafian ve rızkan tayyiben",
  },
  {
    id: "14",
    arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا",
    latin: "Rabbena efrig aleyna sabran",
  },
];

export function getDayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getTodaysDua(date = new Date()): DailyDua {
  const index = (getDayOfYear(date) - 1) % DAILY_DUAS.length;
  return DAILY_DUAS[index < 0 ? 0 : index];
}

export function getPrayerName(id: PrayerGuide["id"]) {
  return t(`prayers.${id}.name`);
}

export function getPrayerSummary(id: PrayerGuide["id"]) {
  return t(`prayers.${id}.summary`);
}

export function getPrayerStep(id: PrayerGuide["id"], index: number) {
  return {
    title: t(`prayers.${id}.steps.${index}.title`),
    detail: t(`prayers.${id}.steps.${index}.detail`),
  };
}

export function getDuaText(id: string) {
  return {
    title: t(`duaItems.${id}.title`),
    meaning: t(`duaItems.${id}.meaning`),
    occasion: t(`duaItems.${id}.occasion`),
  };
}

export type OnboardingSlideId = "welcome" | "prayer" | "dua" | "ready";

export const ONBOARDING_SLIDE_IDS: OnboardingSlideId[] = [
  "welcome",
  "prayer",
  "dua",
  "ready",
];

export const ONBOARDING_IMAGES: Record<OnboardingSlideId, ImageSourcePropType> = {
  welcome: IMAGES.onboardingWelcome,
  prayer: IMAGES.onboardingPrayer,
  dua: IMAGES.onboardingDua,
  ready: IMAGES.onboardingReady,
};

export const ONBOARDING_STORAGE_KEY = "namaz_rehberi_onboarding_done";
