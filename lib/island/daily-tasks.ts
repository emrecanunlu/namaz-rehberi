/**
 * Günlük görevler: her gün havuzdan tarihe göre 3 görev; Cuma'ya özel görev eklenir.
 * Metinler locales/translations.ts → island.tasks.<id>.
 */
import { hashString, seededRandom } from "@/lib/island/progress";

export type DailyTask = {
  id: string;
  icon: string;
};

export const DAILY_TASKS_PER_DAY = 3;

export const TASK_POOL: DailyTask[] = [
  { id: "ayetelkursi", icon: "book-outline" },
  { id: "tesbih33", icon: "ellipse-outline" },
  { id: "istigfar", icon: "water-outline" },
  { id: "salavat", icon: "heart-outline" },
  { id: "dua", icon: "hand-left-outline" },
  { id: "quranPage", icon: "reader-outline" },
  { id: "kindness", icon: "people-outline" },
  { id: "family", icon: "call-outline" },
  { id: "sadaka", icon: "gift-outline" },
  { id: "gratitude", icon: "sparkles-outline" },
  { id: "ihlas3", icon: "repeat-outline" },
  { id: "mulk", icon: "moon-outline" },
  { id: "morningDhikr", icon: "sunny-outline" },
  { id: "learnMeaning", icon: "bulb-outline" },
  { id: "smile", icon: "happy-outline" },
];

export const FRIDAY_TASK: DailyTask = { id: "kehf", icon: "star-outline" };

function isFriday(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).getDay() === 5;
}

export function tasksForDate(date: string): DailyTask[] {
  const rand = seededRandom(hashString(`tasks:${date}`));
  const pool = [...TASK_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = pool.slice(0, DAILY_TASKS_PER_DAY);
  return isFriday(date) ? [FRIDAY_TASK, ...picked] : picked;
}

/** Görev günlüğü: tarih → tamamlanan görev id'leri */
export type TaskLog = Record<string, string[]>;

/** Sadece o günün görev listesinde olanlar sayılır */
export function completedTaskCount(log: TaskLog, date: string) {
  const done = log[date];
  if (!done?.length) return 0;
  const valid = new Set(tasksForDate(date).map((t) => t.id));
  return done.filter((id) => valid.has(id)).length;
}
