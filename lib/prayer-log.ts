import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PRAYER_GUIDES,
  getSectionSummaries,
  type PrayerGuide,
  type PrayerSectionKind,
} from "@/data/content";
import { dateKey } from "@/lib/prayer-times";

export type PrayerGuideId = PrayerGuide["id"];

export type PrayerLogSource = "guided" | "manual";

export type PrayerLogEntry = {
  id: string;
  /** YYYY-MM-DD (cihaz yerel) */
  date: string;
  prayerId: PrayerGuideId;
  /** Bölüm; elle tam namaz için "all" */
  section: PrayerSectionKind | "all";
  rakats: number;
  source: PrayerLogSource;
  completedAt: string;
};

const STORAGE_KEY = "namaz_rehberi_prayer_log_v1";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function loadPrayerLog(): Promise<PrayerLogEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PrayerLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function savePrayerLog(entries: PrayerLogEntry[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getGuide(prayerId: PrayerGuideId) {
  return PRAYER_GUIDES.find((g) => g.id === prayerId);
}

export function getSectionRakat(
  prayerId: PrayerGuideId,
  section: PrayerSectionKind,
): number {
  const guide = getGuide(prayerId);
  if (!guide) return 0;
  const summary = getSectionSummaries(guide.steps).find(
    (s) => s.section === section,
  );
  return summary?.rakatCount ?? 0;
}

const NO_ENTRIES: PrayerLogEntry[] = [];

/**
 * Kayıt listeleri değişmez (her değişiklik yeni dizi üretir);
 * bu yüzden tarih indeksi dizi başına bir kez kurulup önbellekte tutulur.
 * Takvim yüzlerce günü sorguladığında her sorgu tüm listeyi taramasın.
 */
const dateIndexCache = new WeakMap<
  PrayerLogEntry[],
  Map<string, PrayerLogEntry[]>
>();

export function entriesForDate(entries: PrayerLogEntry[], date: string) {
  let index = dateIndexCache.get(entries);
  if (!index) {
    index = new Map();
    for (const entry of entries) {
      const list = index.get(entry.date);
      if (list) list.push(entry);
      else index.set(entry.date, [entry]);
    }
    dateIndexCache.set(entries, index);
  }
  return index.get(date) ?? NO_ENTRIES;
}

export function isSectionDone(
  entries: PrayerLogEntry[],
  date: string,
  prayerId: PrayerGuideId,
  section: PrayerSectionKind,
) {
  const day = entriesForDate(entries, date).filter(
    (e) => e.prayerId === prayerId,
  );
  if (day.some((e) => e.section === "all")) return true;
  return day.some((e) => e.section === section);
}

/**
 * Namaz "kılındı" sayılır: farz bitmişse yeterli.
 * Sünnet ve vitir rekat toplamına eklenir ama şart değildir.
 */
export function isPrayerDone(
  entries: PrayerLogEntry[],
  date: string,
  prayerId: PrayerGuideId,
) {
  const guide = getGuide(prayerId);
  if (!guide) return false;
  const day = entriesForDate(entries, date).filter(
    (e) => e.prayerId === prayerId,
  );
  if (day.some((e) => e.section === "all")) return true;

  const sections = getSectionSummaries(guide.steps).map((s) => s.section);
  if (sections.includes("fard")) {
    return day.some((e) => e.section === "fard");
  }
  return sections.every((section) => day.some((e) => e.section === section));
}

/** O gün bu namaz için kaydedilmiş rekat (çift saymadan) */
export function rakatsForPrayerOnDate(
  entries: PrayerLogEntry[],
  date: string,
  prayerId: PrayerGuideId,
) {
  const guide = getGuide(prayerId);
  if (!guide) return 0;
  const day = entriesForDate(entries, date).filter(
    (e) => e.prayerId === prayerId,
  );
  if (day.some((e) => e.section === "all")) return guide.rakats;

  const seen = new Set<string>();
  let total = 0;
  for (const entry of day) {
    if (entry.section === "all" || seen.has(entry.section)) continue;
    seen.add(entry.section);
    total += entry.rakats;
  }
  return total;
}

/** Bölüm ilerlemesi — kısmi kılınan namazları göstermek için */
export function sectionProgressForPrayer(
  entries: PrayerLogEntry[],
  date: string,
  prayerId: PrayerGuideId,
) {
  const guide = getGuide(prayerId);
  if (!guide) return { done: 0, total: 0 };
  const sections = getSectionSummaries(guide.steps).map((s) => s.section);
  const day = entriesForDate(entries, date).filter(
    (e) => e.prayerId === prayerId,
  );
  if (day.some((e) => e.section === "all")) {
    return { done: sections.length, total: sections.length };
  }
  const done = sections.filter((section) =>
    day.some((e) => e.section === section),
  ).length;
  return { done, total: sections.length };
}

/** Gün için rekat toplamı (çift saymadan) */
export function totalRakatsForDate(entries: PrayerLogEntry[], date: string) {
  const dayEntries = entriesForDate(entries, date);
  if (dayEntries.length === 0) return 0;
  let total = 0;
  for (const guide of PRAYER_GUIDES) {
    const day = dayEntries.filter(
      (e) => e.prayerId === guide.id,
    );
    if (day.length === 0) continue;
    if (day.some((e) => e.section === "all")) {
      total += guide.rakats;
      continue;
    }
    const seen = new Set<string>();
    for (const e of day) {
      if (e.section === "all" || seen.has(e.section)) continue;
      seen.add(e.section);
      total += e.rakats;
    }
  }
  return total;
}

export function completedPrayerIdsForDate(
  entries: PrayerLogEntry[],
  date: string,
): PrayerGuideId[] {
  if (entriesForDate(entries, date).length === 0) return [];
  return PRAYER_GUIDES.filter((g) => isPrayerDone(entries, date, g.id)).map(
    (g) => g.id,
  );
}

export function markSectionInList(
  entries: PrayerLogEntry[],
  prayerId: PrayerGuideId,
  section: PrayerSectionKind,
  source: PrayerLogSource,
  at = new Date(),
): PrayerLogEntry[] {
  const date = dateKey(at);
  if (isSectionDone(entries, date, prayerId, section)) return entries;
  const rakats = getSectionRakat(prayerId, section);
  const next: PrayerLogEntry = {
    id: uid(),
    date,
    prayerId,
    section,
    rakats,
    source,
    completedAt: at.toISOString(),
  };
  return [...entries, next];
}

/** Elle tek bölüm işaretle / kaldır (farz, sünnet, vitir ayrı ayrı) */
export function toggleSectionManualInList(
  entries: PrayerLogEntry[],
  prayerId: PrayerGuideId,
  section: PrayerSectionKind,
  at = new Date(),
): PrayerLogEntry[] {
  const date = dateKey(at);
  const guide = getGuide(prayerId);
  if (!guide) return entries;

  const summaries = getSectionSummaries(guide.steps);
  if (!summaries.some((item) => item.section === section)) return entries;

  const day = entriesForDate(entries, date).filter(
    (entry) => entry.prayerId === prayerId,
  );

  // Tam namaz elle işaretliyse, seçilen bölüm dışındaki bölümlere dönüştür.
  if (day.some((entry) => entry.section === "all")) {
    const withoutDayPrayer = entries.filter(
      (entry) => !(entry.date === date && entry.prayerId === prayerId),
    );
    const remaining = summaries
      .filter((item) => item.section !== section)
      .map<PrayerLogEntry>((item) => ({
        id: uid(),
        date,
        prayerId,
        section: item.section,
        rakats: item.rakatCount,
        source: "manual",
        completedAt: at.toISOString(),
      }));
    return [...withoutDayPrayer, ...remaining];
  }

  if (day.some((entry) => entry.section === section)) {
    return entries.filter(
      (entry) =>
        !(
          entry.date === date &&
          entry.prayerId === prayerId &&
          entry.section === section
        ),
    );
  }

  return markSectionInList(entries, prayerId, section, "manual", at);
}

/** Elle: namazı bugün tamamlandı olarak işaretle / kaldır */
export function togglePrayerManualInList(
  entries: PrayerLogEntry[],
  prayerId: PrayerGuideId,
  at = new Date(),
): PrayerLogEntry[] {
  const date = dateKey(at);
  const guide = getGuide(prayerId);
  if (!guide) return entries;

  if (isPrayerDone(entries, date, prayerId)) {
    return entries.filter((e) => !(e.date === date && e.prayerId === prayerId));
  }

  const next: PrayerLogEntry = {
    id: uid(),
    date,
    prayerId,
    section: "all",
    rakats: guide.rakats,
    source: "manual",
    completedAt: at.toISOString(),
  };
  // Aynı güne ait kısmi guided kayıtları temizle — tek "all" kalsın
  const cleaned = entries.filter(
    (e) => !(e.date === date && e.prayerId === prayerId),
  );
  return [...cleaned, next];
}

export type DayReport = {
  date: string;
  totalRakats: number;
  completedPrayerIds: PrayerGuideId[];
  entryCount: number;
};

export function buildDayReports(
  entries: PrayerLogEntry[],
  daysBack = 30,
): DayReport[] {
  const reports: DayReport[] = [];
  const now = new Date();
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = dateKey(d);
    const dayEntries = entriesForDate(entries, key);
    if (dayEntries.length === 0 && i > 0) {
      // Boş geçmiş günleri atla (bugün her zaman göster)
      continue;
    }
    reports.push({
      date: key,
      totalRakats: totalRakatsForDate(entries, key),
      completedPrayerIds: completedPrayerIdsForDate(entries, key),
      entryCount: dayEntries.length,
    });
  }
  // Bugün boşsa da ekle
  const today = dateKey(now);
  if (!reports.some((r) => r.date === today)) {
    reports.unshift({
      date: today,
      totalRakats: 0,
      completedPrayerIds: [],
      entryCount: 0,
    });
  }
  return reports;
}
