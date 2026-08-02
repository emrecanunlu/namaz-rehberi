import type { ImageSourcePropType } from "react-native";
import { IMAGES } from "@/constants/images";
import { t } from "@/lib/i18n";
import { PRAYER_POSE_IMAGES, type PrayerPoseId } from "@/data/prayer-poses";
import {
  buildGuideSteps,
  type PrayerSectionKind,
  type PrayerStep,
} from "@/data/prayer-build";
import { getPrayerText } from "@/data/prayer-texts";

export type { PrayerSectionKind, PrayerStep };
export type { PrayerVoiceId } from "@/data/prayer-build";

export type PrayerGuide = {
  id: "sabah" | "ogle" | "ikindi" | "aksam" | "yatsi";
  /** Liste rozeti: toplam rekat (tüm bölümler) */
  rakats: number;
  stepCount: number;
  steps: PrayerStep[];
};

function guide(
  id: PrayerGuide["id"],
  rakats: number,
  sections: Parameters<typeof buildGuideSteps>[0],
): PrayerGuide {
  const steps = buildGuideSteps(sections);
  return { id, rakats, steps, stepCount: steps.length };
}

/** Diyanet / Hanefi tam kılınış */
export const PRAYER_GUIDES: PrayerGuide[] = [
  guide("sabah", 4, [
    { section: "sunnah", rakatCount: 2, sureRakats: [1, 2] },
    { section: "fard", rakatCount: 2, sureRakats: [1, 2] },
  ]),
  guide("ogle", 10, [
    {
      section: "sunnah",
      rakatCount: 4,
      sureRakats: [1, 2],
      firstSittingAfter: 2,
    },
    {
      section: "fard",
      rakatCount: 4,
      sureRakats: [1, 2],
      firstSittingAfter: 2,
    },
    { section: "lastSunnah", rakatCount: 2, sureRakats: [1, 2] },
  ]),
  guide("ikindi", 8, [
    {
      section: "sunnah",
      rakatCount: 4,
      sureRakats: [1, 2],
      firstSittingAfter: 2,
    },
    {
      section: "fard",
      rakatCount: 4,
      sureRakats: [1, 2],
      firstSittingAfter: 2,
    },
  ]),
  guide("aksam", 5, [
    {
      section: "fard",
      rakatCount: 3,
      sureRakats: [1, 2],
      firstSittingAfter: 2,
    },
    { section: "lastSunnah", rakatCount: 2, sureRakats: [1, 2] },
  ]),
  guide("yatsi", 13, [
    {
      section: "sunnah",
      rakatCount: 4,
      sureRakats: [1, 2],
      firstSittingAfter: 2,
    },
    {
      section: "fard",
      rakatCount: 4,
      sureRakats: [1, 2],
      firstSittingAfter: 2,
    },
    { section: "lastSunnah", rakatCount: 2, sureRakats: [1, 2] },
    {
      section: "witr",
      rakatCount: 3,
      sureRakats: [1, 2, 3],
      firstSittingAfter: 2,
      kunutOnLast: true,
    },
  ]),
];

export type DailyDua = {
  id: string;
  arabic: string;
  latin: string;
};

export const DAILY_DUAS: DailyDua[] = [
  {
    id: "1",
    arabic:
      "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    latin:
      "Asbahna ve asbehal mülkü lillah, velhamdü lillah, la ilahe illallahü vahdehu la şerike leh, lehül mülkü ve lehül hamdü ve hüve ala külli şey'in kadir. Rabbi es'elüke hayra ma fi hazel yevmi ve hayra ma ba'dehu, ve euzu bike min şerri ma fi hazel yevmi ve şerri ma ba'dehu. Rabbi euzu bike minel keseli ve sui'l-kiber. Rabbi euzu bike min azabin fin-nari ve azabin fil-kabr",
  },
  {
    id: "2",
    arabic:
      "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    latin:
      "Bismillahillezi la yedurru me'asmihi şey'ün fil-ardi ve la fis-sema'i ve hüves-semi'ul-alim",
  },
  {
    id: "3",
    arabic:
      "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    latin:
      "Estağfirullaha'l-azimellezi la ilahe illa hüvel-hayyül-kayyumu ve etubu ileyh",
  },
  {
    id: "4",
    arabic:
      "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
    latin:
      "Allahümme ma asbeha bi min ni'metin ev bi ehadin min halkıke fe minke vahdeke la şerike lek fe lekel-hamdü ve lekeş-şükr",
  },
  {
    id: "5",
    arabic:
      "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي",
    latin:
      "Rabbişrah li sadri ve yessir li emri vahlül ukdeten min lisani yefkahu kavli",
  },
  {
    id: "6",
    arabic:
      "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    latin:
      "Ihdinas sıratal müstakîm, sıratallezine en'amte aleyhim gayril magdubi aleyhim ve lad-dallin",
  },
  {
    id: "7",
    arabic:
      "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    latin:
      "Rabbena heb lena min ezvacina ve zürriyyatina kurrate a'yunin vec'alna lil-müttekin imama",
  },
  {
    id: "8",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    latin: "Rabbi zidni ilma",
  },
  {
    id: "9",
    arabic:
      "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    latin: "La ilahe illa ente sübhaneke inni küntü minez-zalimin",
  },
  {
    id: "10",
    arabic:
      "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    latin:
      "Amsayna ve amsel mülkü lillah, velhamdü lillah, la ilahe illallahü vahdehu la şerike leh, lehül mülkü ve lehül hamdü ve hüve ala külli şey'in kadir. Rabbi es'elüke hayra ma fi hazihil-leyleti ve hayra ma ba'deha, ve euzu bike min şerri ma fi hazihil-leyleti ve şerri ma ba'deha. Rabbi euzu bike minel keseli ve sui'l-kiber. Rabbi euzu bike min azabin fin-nari ve azabin fil-kabr",
  },
  {
    id: "11",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    latin: "Bismike Allahümme emutu ve ahya",
  },
  {
    id: "12",
    arabic:
      "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    latin:
      "Rabbena zalemna enfusena ve in lem tagfir lena ve terhamna lenekunenne minel-hasirin",
  },
  {
    id: "13",
    arabic:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا",
    latin:
      "Allahümme inni es'elüke ilman nafian ve rızkan tayyiben ve amelen mütekabbelen",
  },
  {
    id: "14",
    arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ",
    latin: "Rabbena efrig aleyna sabran ve teveffena müslimin",
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

export function getSectionLabel(section: PrayerSectionKind) {
  return t(`session.section.${section}`);
}

export function resolvePrayerStep(
  id: PrayerGuide["id"],
  step: PrayerStep | undefined,
) {
  if (!step) {
    return { title: "", detail: "" };
  }

  if (step.poseId === "niyet") {
    return {
      title: t("session.poses.niyet.title"),
      detail: t(`prayers.${id}.niyet.${step.section}`),
    };
  }

  if (step.voiceId) {
    let detail = "";
    if (step.poseId === "kiyam") {
      detail = step.withSure
        ? t("session.poses.kiyam.detailSure")
        : t("session.poses.kiyam.detailFatiha");
    } else if (step.poseId === "teshehhud") {
      detail =
        step.sittingKind === "first"
          ? t("session.poses.teshehhud.detailFirst")
          : t("session.poses.teshehhud.detailLast");
    } else if (
      step.poseId === "ruku" ||
      step.poseId === "secde" ||
      step.poseId === "kavme" ||
      step.poseId === "tekbir" ||
      step.poseId === "selam" ||
      step.poseId === "kunut"
    ) {
      detail = t(`session.poses.${step.poseId}.detail`);
    }
    return {
      title: t(`session.texts.${step.voiceId}.title`),
      detail,
    };
  }

  const title = step.rakat
    ? t(`session.poses.${step.poseId}.titleWithRakat`, {
        rakat: String(step.rakat),
      })
    : t(`session.poses.${step.poseId}.title`);

  let detail = t(`session.poses.${step.poseId}.detail`);
  if (step.poseId === "oturma") {
    detail = t("session.poses.oturma.detail");
  }

  return { title, detail };
}

export function getPrayerStep(id: PrayerGuide["id"], index: number) {
  const guide = PRAYER_GUIDES.find((item) => item.id === id);
  return resolvePrayerStep(id, guide?.steps[index]);
}

export function getAvailableSections(steps: PrayerStep[]): PrayerSectionKind[] {
  const seen = new Set<PrayerSectionKind>();
  const order: PrayerSectionKind[] = ["sunnah", "fard", "lastSunnah", "witr"];
  for (const s of steps) seen.add(s.section);
  return order.filter((section) => seen.has(section));
}

export function filterStepsBySections(
  steps: PrayerStep[],
  sections: readonly PrayerSectionKind[],
) {
  const allowed = new Set(sections);
  return steps.filter((s) => allowed.has(s.section));
}

export function getSectionSummaries(steps: PrayerStep[]) {
  return getAvailableSections(steps).map((section) => {
    const sectionSteps = filterStepsBySections(steps, [section]);
    const rakatCount = Math.max(
      0,
      ...sectionSteps.map((s) => s.rakat ?? 0),
    );
    return {
      section,
      stepCount: sectionSteps.length,
      rakatCount,
    };
  });
}

export function getStepRecitation(voiceId: PrayerStep["voiceId"]) {
  if (!voiceId) return null;
  const text = getPrayerText(voiceId);
  if (!text) return null;
  return {
    arabic: text.arabic,
    latin: text.latin,
    meaning: t(`session.texts.${voiceId}.meaning`),
  };
}

export function getStepImage(poseId: PrayerPoseId): ImageSourcePropType {
  return PRAYER_POSE_IMAGES[poseId];
}

export function getDuaText(id: string) {
  return {
    title: t(`duaItems.${id}.title`),
    meaning: t(`duaItems.${id}.meaning`),
    occasion: t(`duaItems.${id}.occasion`),
  };
}

export function groupStepsBySection(steps: PrayerStep[]) {
  const groups: {
    section: PrayerSectionKind;
    steps: PrayerStep[];
    startIndex: number;
  }[] = [];
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const last = groups[groups.length - 1];
    if (!last || last.section !== s.section) {
      groups.push({ section: s.section, steps: [s], startIndex: i });
    } else {
      last.steps.push(s);
    }
  }
  return groups;
}

export type OnboardingSlideId = "welcome" | "prayer" | "dua" | "ready";

export const ONBOARDING_SLIDE_IDS: OnboardingSlideId[] = [
  "welcome",
  "prayer",
  "dua",
  "ready",
];

export const ONBOARDING_IMAGES: Record<OnboardingSlideId, ImageSourcePropType> =
  {
    welcome: IMAGES.onboardingWelcome,
    prayer: IMAGES.onboardingPrayer,
    dua: IMAGES.onboardingDua,
    ready: IMAGES.onboardingReady,
  };
