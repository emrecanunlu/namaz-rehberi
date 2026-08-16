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
    id: "15",
    arabic:
      "اَللّٰهُ لَٓا اِلٰهَ اِلَّا هُوَۚ اَلْحَيُّ الْقَيُّومُۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌۜ لَهُ مَا فِي السَّمٰوَاتِ وَمَا فِي الْاَرْضِۜ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُٓ اِلَّا بِاِذْنِهٖۜ يَعْلَمُ مَا بَيْنَ اَيْدِيهِمْ وَمَا خَلْفَهُمْۚ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهٖٓ اِلَّا بِمَا شَٓاءَۚ وَسِعَ كُرْسِيُّهُ السَّمٰوَاتِ وَالْاَرْضَۚ وَلَا يَؤُ۫دُهُ حِفْظُهُمَاۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ.",
    latin:
      "Allâhü lâ ilâhe illâ hüvel-hayyül-kayyûm. Lâ te’huzühû sinetün ve lâ nevm. Lehû mâ fis-semâvâti ve mâ fil-ard. Men zellezî yeşfeu indehû illâ bi-iznih. Ya’lemü mâ beyne eydîhim ve mâ halfehüm. Ve lâ yuhîtûne bi-şey’in min ilmihî illâ bimâ şâ’. Vesia kürsiyyühüs-semâvâti vel-ard. Ve lâ yeûdühû hıfzuhümâ ve hüvel-aliyyül-azîm.",
  },
  {
    id: "16",
    arabic:
      "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ. قُلْ هُوَ اللّٰهُ اَحَدٌۚ اَللّٰهُ الصَّمَدُۚ لَمْ يَلِدْ وَلَمْ يُولَدْۙ وَلَمْ يَكُنْ لَهُ كُفُوًا اَحَدٌ.",
    latin:
      "Bismillâhirrahmânirrahîm. Kul hüvallâhü ehad. Allâhüs-samed. Lem yelid ve lem yûled. Ve lem yekün lehû küfüven ehad.",
  },
  {
    id: "17",
    arabic:
      "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ. قُلْ اَعُوذُ بِرَبِّ الْفَلَقِۙ مِنْ شَرِّ مَا خَلَقَۙ وَمِنْ شَرِّ غَاسِقٍ اِذَا وَقَبَۙ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِۙ وَمِنْ شَرِّ حَاسِدٍ اِذَا حَسَدَ.",
    latin:
      "Bismillâhirrahmânirrahîm. Kul eûzü bi-rabbil-felak. Min şerri mâ halak. Ve min şerri gâsikın izâ vekab. Ve min şerrin-neffâsâti fil-ukad. Ve min şerri hâsidin izâ hased.",
  },
  {
    id: "18",
    arabic:
      "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ. قُلْ اَعُوذُ بِرَبِّ النَّاسِۙ مَلِكِ النَّاسِۙ اِلٰهِ النَّاسِۙ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِۙ اَلَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِۙ مِنَ الْجِنَّةِ وَالنَّاسِ.",
    latin:
      "Bismillâhirrahmânirrahîm. Kul eûzü bi-rabbin-nâs. Melikin-nâs. İlâhin-nâs. Min şerril-vesvâsil-hannâs. Ellezî yüvesvisü fî sudûrin-nâs. Minel-cinneti ven-nâs.",
  },
  {
    id: "19",
    arabic:
      "وَاِنْ يَكَادُ الَّذِينَ كَفَرُوا لَيُزْلِقُونَكَ بِاَبْصَارِهِمْ لَمَّا سَمِعُوا الذِّكْرَ وَيَقُولُونَ اِنَّهُ لَمَجْنُونٌ. وَمَا هُوَ اِلَّا ذِكْرٌ لِلْعَالَمِينَ.",
    latin:
      "Ve in yekâdüllezîne keferû le-yüzlikûneke bi-ebsârihim lemmâ semiûz-zikra ve yekûlûne innehû le-mecnûn. Ve mâ hüve illâ zikrun lil-âlemîn.",
  },
  {
    id: "1",
    arabic:
      "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
    latin:
      "Asbahnâ ve asbahal-mülkü lillâh, vel-hamdü lillâh, lâ ilâhe illallâhü vahdehû lâ şerîke leh, lehül-mülkü ve lehül-hamdü ve hüve alâ külli şey’in kadîr. Rabbi es’elüke hayra mâ fî hâzel-yevmi ve hayra mâ ba’dehû, ve eûzü bike min şerri mâ fî hâzel-yevmi ve şerri mâ ba’dehû. Rabbi eûzü bike minel-keseli ve sû’il-kiber. Rabbi eûzü bike min azâbin fin-nâri ve azâbin fil-kabr.",
  },
  {
    id: "2",
    arabic:
      "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
    latin:
      "Bismillâhillezî lâ yedurru me’asmihî şey’ün fil-ardı ve lâ fis-semâ’i ve hüves-semî’ul-alîm.",
  },
  {
    id: "3",
    arabic:
      "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ.",
    latin:
      "Estağfirullâhel-azîmellezî lâ ilâhe illâ hüvel-hayyül-kayyûmu ve etûbu ileyh.",
  },
  {
    id: "4",
    arabic:
      "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.",
    latin:
      "Allâhümme mâ asbeha bî min ni’metin ev bi ehadin min halkıke fe minke vahdeke lâ şerîke lek, fe lekel-hamdü ve lekeş-şükr.",
  },
  {
    id: "5",
    arabic:
      "قَالَ رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي.",
    latin:
      "Kâle: Rabbişrah lî sadrî, ve yessir lî emrî, vahlül ukdeten min lisânî yefkahû kavlî.",
  },
  {
    id: "6",
    arabic:
      "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ.",
    latin:
      "Ihdinas-sırâtal-müstakîm, sırâtellezîne en’amte aleyhim gayril-magdûbi aleyhim ve led-dâllîn.",
  },
  {
    id: "7",
    arabic:
      "وَالَّذِينَ يَقُولُونَ رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا.",
    latin:
      "Vellezîne yekûlûne: Rabbenâ heb lenâ min ezvâcinâ ve zürriyyâtinâ kurrate a’yunin vec’alnâ lil-mütteqîne imâmâ.",
  },
  {
    id: "8",
    arabic:
      "فَتَعَالَى اللَّهُ الْمَلِكُ الْحَقُّ وَلَا تَعْجَلْ بِالْقُرْآنِ مِنْ قَبْلِ أَنْ يُقْضَى إِلَيْكَ وَحْيُهُ وَقُلْ رَبِّ زِدْنِي عِلْمًا.",
    latin:
      "Feteâlâllâhü’l-melikü’l-hakk. Ve lâ ta’cel bil-Kur’âni min kabli en yukdâ ileyke vahyuhû, ve kul: Rabbi zidnî ilmâ.",
  },
  {
    id: "9",
    arabic:
      "وَذَا النُّونِ إِذْ ذَهَبَ مُغَاضِبًا فَظَنَّ أَنْ لَنْ نَقْدِرَ عَلَيْهِ فَنَادَى فِي الظُّلُمَاتِ أَنْ لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ.",
    latin:
      "Ve zen-nûni iz zehebe mugâdıben fe zanne en len nakdira aleyhi fe nâdâ fiz-zulümâti en lâ ilâhe illâ ente sübhâneke innî küntü minez-zâlimîn.",
  },
  {
    id: "10",
    arabic:
      "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
    latin:
      "Amsaynâ ve amsel-mülkü lillâh, vel-hamdü lillâh, lâ ilâhe illallâhü vahdehû lâ şerîke leh, lehül-mülkü ve lehül-hamdü ve hüve alâ külli şey’in kadîr. Rabbi es’elüke hayra mâ fî hâzihil-leyleti ve hayra mâ ba’dehâ, ve eûzü bike min şerri mâ fî hâzihil-leyleti ve şerri mâ ba’dehâ. Rabbi eûzü bike minel-keseli ve sû’il-kiber. Rabbi eûzü bike min azâbin fin-nâri ve azâbin fil-kabr.",
  },
  {
    id: "11",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.",
    latin: "Bismike Allâhümme emûtu ve ahyâ.",
  },
  {
    id: "12",
    arabic:
      "قَالَا رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ.",
    latin:
      "Kâlâ: Rabbenâ zalemnâ enfusenâ ve in lem tagfir lenâ ve terhamnâ lenekûnenne minel-hâsirîn.",
  },
  {
    id: "13",
    arabic:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا.",
    latin:
      "Allâhümme innî es’elüke ilmen nâfi’an ve rızkan tayyiben ve amelen mütekabbelâ.",
  },
  {
    id: "14",
    arabic:
      "وَمَا تَنْقِمُ مِنَّا إِلَّا أَنْ آمَنَّا بِآيَاتِ رَبِّنَا لَمَّا جَاءَتْنَا رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ.",
    latin:
      "Ve mâ tenkimu minnâ illâ en âmennâ bi âyâti rabbinâ lemmâ câetnâ. Rabbenâ efrig aleynâ sabran ve teveffenâ müslimîn.",
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
    const rakatCount = Math.max(0, ...sectionSteps.map((s) => s.rakat ?? 0));
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
