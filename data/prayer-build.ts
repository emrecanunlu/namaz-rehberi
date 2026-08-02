import type { PrayerPoseId } from "@/data/prayer-poses";
import { PRAYER_TEXTS } from "@/data/prayer-texts";

export type PrayerSectionKind = "sunnah" | "fard" | "lastSunnah" | "witr";

export type PrayerVoiceId =
  | "niyet"
  | "tekbir"
  | "subhaneke"
  | "fatiha"
  | "ihlas"
  | "ruku"
  | "semiallah"
  | "rabbena"
  | "secde"
  | "selam"
  | "kunut"
  | "ettehiyyatu"
  | "salavat"
  | "rabbenaAtina";

export type PrayerStep = {
  poseId: PrayerPoseId;
  section: PrayerSectionKind;
  rakat?: number;
  /** Latin gösterim — tercih: PRAYER_TEXTS */
  arabic?: string;
  voiceId?: PrayerVoiceId;
  /** i18n: session.cues.* */
  cueKey?: string;
  /** Kıyamda Fatiha + sure mi */
  withSure?: boolean;
  sittingKind?: "first" | "last";
};

function latin(voiceId: PrayerVoiceId) {
  return PRAYER_TEXTS[voiceId].latin;
}

function step(
  poseId: PrayerPoseId,
  section: PrayerSectionKind,
  extra: Omit<PrayerStep, "poseId" | "section"> = {},
): PrayerStep {
  return { poseId, section, ...extra };
}

function niyet(section: PrayerSectionKind): PrayerStep {
  return step("niyet", section, {
    cueKey: "niyet",
    arabic: latin("niyet"),
    voiceId: "niyet",
  });
}

function iftitah(section: PrayerSectionKind, rakat: number): PrayerStep[] {
  return [
    step("tekbir", section, {
      rakat,
      arabic: latin("tekbir"),
      voiceId: "tekbir",
      cueKey: "tekbir",
    }),
  ];
}

function kiyam(
  section: PrayerSectionKind,
  rakat: number,
  opts: { withSure: boolean; includeSubhaneke?: boolean },
): PrayerStep[] {
  const steps: PrayerStep[] = [];
  if (opts.includeSubhaneke) {
    steps.push(
      step("kiyam", section, {
        rakat,
        arabic: latin("subhaneke"),
        voiceId: "subhaneke",
        cueKey: "subhaneke",
        withSure: opts.withSure,
      }),
    );
  }
  steps.push(
    step("kiyam", section, {
      rakat,
      arabic: latin("fatiha"),
      voiceId: "fatiha",
      cueKey: "kiyamFatiha",
      withSure: opts.withSure,
    }),
  );
  if (opts.withSure) {
    steps.push(
      step("kiyam", section, {
        rakat,
        arabic: latin("ihlas"),
        voiceId: "ihlas",
        cueKey: "kiyamSure",
        withSure: true,
      }),
    );
  }
  return steps;
}

function rukuCycle(section: PrayerSectionKind, rakat: number): PrayerStep[] {
  return [
    step("ruku", section, {
      rakat,
      arabic: latin("ruku"),
      voiceId: "ruku",
      cueKey: "ruku",
    }),
    step("kavme", section, {
      rakat,
      arabic: latin("semiallah"),
      voiceId: "semiallah",
      cueKey: "kavme",
    }),
    step("kavme", section, {
      rakat,
      arabic: latin("rabbena"),
      voiceId: "rabbena",
      cueKey: "rabbena",
    }),
    step("secde", section, {
      rakat,
      arabic: latin("secde"),
      voiceId: "secde",
      cueKey: "secde",
    }),
    step("oturma", section, {
      rakat,
      cueKey: "oturma",
    }),
    step("secde", section, {
      rakat,
      arabic: latin("secde"),
      voiceId: "secde",
      cueKey: "secde2",
    }),
  ];
}

function sitting(
  section: PrayerSectionKind,
  rakat: number,
  kind: "first" | "last",
): PrayerStep[] {
  const first: PrayerStep[] = [
    step("teshehhud", section, {
      rakat,
      arabic: latin("ettehiyyatu"),
      voiceId: "ettehiyyatu",
      cueKey: kind === "first" ? "teshehhudFirst" : "teshehhudLast",
      sittingKind: kind,
    }),
  ];
  if (kind === "first") return first;

  return [
    ...first,
    step("teshehhud", section, {
      rakat,
      arabic: latin("salavat"),
      voiceId: "salavat",
      cueKey: "salavat",
      sittingKind: "last",
    }),
    step("teshehhud", section, {
      rakat,
      arabic: latin("rabbenaAtina"),
      voiceId: "rabbenaAtina",
      cueKey: "rabbenaAtina",
      sittingKind: "last",
    }),
  ];
}

function selam(section: PrayerSectionKind, rakat: number): PrayerStep {
  return step("selam", section, {
    rakat,
    arabic: latin("selam"),
    voiceId: "selam",
    cueKey: "selam",
  });
}

/**
 * Diyanet / Hanefi: sürekli rekatlar.
 * - sureRakats: sure okunan rekatlar (1-based)
 * - firstSittingAfter: ilk oturuşun yapıldığı rekat (örn. 2)
 * - kunutOnLast: vitir 3. rekatta rükudan önce kunut
 */
export function buildSection(opts: {
  section: PrayerSectionKind;
  rakatCount: number;
  sureRakats: number[];
  firstSittingAfter?: number;
  kunutOnLast?: boolean;
}): PrayerStep[] {
  const {
    section,
    rakatCount,
    sureRakats,
    firstSittingAfter,
    kunutOnLast = false,
  } = opts;
  const out: PrayerStep[] = [];

  out.push(niyet(section));

  for (let rakat = 1; rakat <= rakatCount; rakat++) {
    const withSure = sureRakats.includes(rakat);
    const isFirst = rakat === 1;
    const isLast = rakat === rakatCount;

    if (isFirst) {
      out.push(...iftitah(section, rakat));
    }

    out.push(
      ...kiyam(section, rakat, {
        withSure,
        includeSubhaneke: isFirst,
      }),
    );

    if (kunutOnLast && isLast) {
      out.push(
        step("tekbir", section, {
          rakat,
          arabic: latin("tekbir"),
          voiceId: "tekbir",
          cueKey: "kunutTekbir",
        }),
        step("kunut", section, {
          rakat,
          arabic: latin("kunut"),
          voiceId: "kunut",
          cueKey: "kunut",
        }),
      );
    }

    out.push(...rukuCycle(section, rakat));

    if (firstSittingAfter && rakat === firstSittingAfter && !isLast) {
      out.push(...sitting(section, rakat, "first"));
    }

    if (isLast) {
      out.push(...sitting(section, rakat, "last"));
      out.push(selam(section, rakat));
    }
  }

  return out;
}

export function buildGuideSteps(
  sections: Parameters<typeof buildSection>[0][],
): PrayerStep[] {
  return sections.flatMap(buildSection);
}
