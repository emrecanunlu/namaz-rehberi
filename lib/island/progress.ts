/**
 * Ada ilerleme motoru — saf fonksiyonlar, RN bağımlılığı yok.
 * Kurallar: docs/ADA.md. Her şey günlük kayıtlardan türetilir; asla gerilemez.
 */

export const STAGES_PER_ISLAND = 12;
export const PRAYERS_PER_DAY = 5;

export const NUR = {
  prayer: 10,
  task: 5,
  fullDay: 20,
  streakStep: 2,
  streakCap: 10,
} as const;

export type DayActivity = {
  /** YYYY-MM-DD */
  date: string;
  /** Kılınan farz namaz sayısı (0–5) */
  prayers: number;
  /** Tamamlanan günlük görev sayısı */
  tasks: number;
};

export type PlantKind = "tulip" | "rose" | "lavender" | "sunflower" | "fruit";
export const PLANT_KINDS: PlantKind[] = [
  "tulip",
  "rose",
  "lavender",
  "sunflower",
  "fruit",
];

export type Plant = {
  id: string;
  kind: PlantKind;
  /** Hangi adaya ekildi (0 = ilk ada) */
  island: number;
  /** three.js koordinatı (y yukarı); ada merkezine göre */
  x: number;
  z: number;
  plantedOn: string;
};

export type PlantPhase = "sprout" | "seedling" | "bloom";

export type VisitorKind = "rabbit" | "bird" | "hedgehog" | "duck";

export type IslandProgress = {
  nur: number;
  level: number;
  /** Bu seviyede biriken / gereken nur */
  levelNur: number;
  levelCost: number;
  /** Takımadadaki aktif ada (0'dan başlar) */
  island: number;
  /** Aktif adanın aşaması (0–11) */
  stage: number;
  /** Bugün dahil art arda namaz kılınan günler (bugün henüz kılınmadıysa düne kadar) */
  streak: number;
  /** Bugün en az bir namaz kılındı mı (seri bugün güvende mi) */
  streakSafeToday: boolean;
  bestStreak: number;
  seedsEarned: number;
  fullDays: number;
  todayNur: number;
};

/** Seviye n → n+1 maliyeti */
export function levelCost(level: number) {
  return Math.min(60 + 20 * level, 300);
}

export function levelFromNur(nur: number) {
  let level = 0;
  let rest = nur;
  while (rest >= levelCost(level)) {
    rest -= levelCost(level);
    level += 1;
  }
  return { level, levelNur: rest, levelCost: levelCost(level) };
}

/** YYYY-MM-DD → UTC gün sayısı (saat dilimi kaymasız fark için) */
export function dayNumber(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function dayNur(day: DayActivity, streakAtDay: number) {
  const prayers = Math.min(day.prayers, PRAYERS_PER_DAY);
  let nur = prayers * NUR.prayer + day.tasks * NUR.task;
  if (prayers >= PRAYERS_PER_DAY) nur += NUR.fullDay;
  if (prayers > 0) nur += NUR.streakStep * Math.min(streakAtDay, NUR.streakCap);
  return nur;
}

export function computeProgress(
  days: DayActivity[],
  today: string,
): IslandProgress {
  const sorted = [...days]
    .filter((d) => d.date <= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  let nur = 0;
  let streak = 0;
  let bestStreak = 0;
  let prevPrayerDay: number | null = null;
  let fullDays = 0;
  let todayNur = 0;

  for (const day of sorted) {
    const n = dayNumber(day.date);
    let streakAtDay = 0;
    if (day.prayers > 0) {
      streak = prevPrayerDay !== null && n - prevPrayerDay === 1 ? streak + 1 : 1;
      prevPrayerDay = n;
      streakAtDay = streak;
      bestStreak = Math.max(bestStreak, streak);
    }
    if (day.prayers >= PRAYERS_PER_DAY) fullDays += 1;
    const earned = dayNur(day, streakAtDay);
    nur += earned;
    if (day.date === today) todayNur = earned;
  }

  // Seri: bugün ya da dün kılındıysa sürüyor; daha eskiyse sıfır
  const todayN = dayNumber(today);
  const gap = prevPrayerDay === null ? Infinity : todayN - prevPrayerDay;
  const currentStreak = gap <= 1 ? streak : 0;

  const { level, levelNur, levelCost: cost } = levelFromNur(nur);
  return {
    nur,
    level,
    levelNur,
    levelCost: cost,
    island: Math.floor(level / STAGES_PER_ISLAND),
    stage: level % STAGES_PER_ISLAND,
    streak: currentStreak,
    streakSafeToday: gap === 0,
    bestStreak,
    seedsEarned: fullDays,
    fullDays,
    todayNur,
  };
}

/** Geliştirme hızlandırıcısı: ek nur'u seviyeye yansıt (yalnız __DEV__) */
export function withBonusNur(progress: IslandProgress, bonus: number): IslandProgress {
  if (bonus <= 0) return progress;
  const nur = progress.nur + bonus;
  const { level, levelNur, levelCost: cost } = levelFromNur(nur);
  return {
    ...progress,
    nur,
    level,
    levelNur,
    levelCost: cost,
    island: Math.floor(level / STAGES_PER_ISLAND),
    stage: level % STAGES_PER_ISLAND,
  };
}

/** Bir sonraki seviyeye / adaya geçmek için gereken nur */
export function nurToReachLevel(nur: number, targetLevel: number) {
  let total = 0;
  for (let l = 0; l < targetLevel; l++) total += levelCost(l);
  return Math.max(0, total - nur);
}

/**
 * Bitki evresi: ekildikten sonraki (ekim günü hariç, bugün dahil)
 * en az bir namaz kılınan her gün "sulanmış" sayılır.
 * `bonusDays` yalnız geliştirme hızlandırıcısı içindir.
 */
export function plantPhase(
  plant: Plant,
  wateredDates: ReadonlySet<string>,
  today: string,
  bonusDays = 0,
): PlantPhase {
  let watered = bonusDays;
  if (watered >= 2) return "bloom";
  const start = dayNumber(plant.plantedOn);
  const end = dayNumber(today);
  for (const date of wateredDates) {
    const n = dayNumber(date);
    if (n > start && n <= end) {
      watered += 1;
      if (watered >= 2) return "bloom";
    }
  }
  return watered === 1 ? "seedling" : "sprout";
}

/** Tarihten deterministik tamsayı (FNV-1a) */
export function hashString(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Tohumla deterministik rastgele sayı üreteci (mulberry32) */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Günün ziyaretçisi; gölet yoksa ördek gelmez */
export function visitorForDate(date: string, hasPond: boolean): VisitorKind {
  const pool: VisitorKind[] = hasPond
    ? ["rabbit", "bird", "hedgehog", "duck"]
    : ["rabbit", "bird", "hedgehog"];
  return pool[hashString(`visitor:${date}`) % pool.length];
}

export function plantKindForSeed(seedIndex: number): PlantKind {
  return PLANT_KINDS[hashString(`seed:${seedIndex}`) % PLANT_KINDS.length];
}

export type Footprint = { x: number; z: number; r: number };

/**
 * Bitki için boş yer bul: ada sınırı içinde, öğelerden ve diğer bitkilerden uzak.
 * Altın açı sarmalı + küçük sapma; ilk uygun nokta.
 */
export function findPlantSpot(
  radius: number,
  occupied: Footprint[],
  seed: number,
  plantRadius = 0.12,
): { x: number; z: number } | null {
  const rand = seededRandom(seed);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const offset = rand() * Math.PI * 2;
  const count = 240;
  for (let i = 1; i < count; i++) {
    const r = Math.sqrt(i / count) * radius;
    const a = i * golden + offset;
    const x = Math.cos(a) * r + (rand() - 0.5) * 0.05;
    const z = Math.sin(a) * r + (rand() - 0.5) * 0.05;
    const free = occupied.every(
      (o) => Math.hypot(o.x - x, o.z - z) >= o.r + plantRadius,
    );
    if (free) return { x, z };
  }
  return null;
}
