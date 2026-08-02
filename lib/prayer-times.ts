import {
  CalculationMethod,
  Coordinates,
  PrayerTimes,
} from "adhan";
import type { TurkeyCity } from "@/data/cities-tr";

export type PrayerSlotId =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

export type DayPrayerTimes = Record<PrayerSlotId, Date> & {
  cityId: string;
  dateKey: string;
};

export const PRAYER_SLOT_ORDER: PrayerSlotId[] = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function calculatePrayerTimes(
  city: TurkeyCity,
  date = new Date(),
): DayPrayerTimes {
  const coordinates = new Coordinates(city.lat, city.lng);
  const params = CalculationMethod.Turkey();
  const times = new PrayerTimes(coordinates, date, params);

  return {
    cityId: city.id,
    dateKey: dateKey(date),
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  };
}

export function formatTime(date: Date, locale: "tr" | "en") {
  return date.toLocaleTimeString(locale === "tr" ? "tr-TR" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function getNextPrayer(
  times: DayPrayerTimes,
  now = new Date(),
  tomorrowFajr?: Date,
): { id: PrayerSlotId; at: Date; isTomorrow?: boolean } | null {
  for (const id of PRAYER_SLOT_ORDER) {
    if (times[id].getTime() > now.getTime()) {
      return { id, at: times[id] };
    }
  }
  if (tomorrowFajr) {
    return { id: "fajr", at: tomorrowFajr, isTomorrow: true };
  }
  return null;
}

export function getRemainingParts(target: Date, now = new Date()) {
  const ms = Math.max(0, target.getTime() - now.getTime());
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { ms, hours, minutes, seconds };
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function getCurrentPrayer(
  times: DayPrayerTimes,
  now = new Date(),
): PrayerSlotId | null {
  let current: PrayerSlotId | null = null;
  for (const id of PRAYER_SLOT_ORDER) {
    if (times[id].getTime() <= now.getTime()) {
      current = id;
    }
  }
  return current;
}

/** Vakit slot → namaz rehberi id */
export const SLOT_TO_GUIDE_ID = {
  fajr: "sabah",
  sunrise: "sabah",
  dhuhr: "ogle",
  asr: "ikindi",
  maghrib: "aksam",
  isha: "yatsi",
} as const;

export type PrayerGuideId = (typeof SLOT_TO_GUIDE_ID)[PrayerSlotId];

/**
 * Namaza başla: içinde bulunulan vakit varsa o rehber,
 * değilse sıradaki namazın rehberi.
 */
export function getActiveGuideId(
  times: DayPrayerTimes,
  now = new Date(),
  next?: { id: PrayerSlotId; isTomorrow?: boolean } | null,
): PrayerGuideId {
  const current = getCurrentPrayer(times, now);
  const prayable: PrayerSlotId[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  if (current && prayable.includes(current)) {
    return SLOT_TO_GUIDE_ID[current];
  }

  const target: PrayerSlotId =
    !next || next.id === "sunrise" ? "fajr" : next.id;
  return SLOT_TO_GUIDE_ID[target];
}

