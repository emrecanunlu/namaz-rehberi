import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { TurkeyCity } from "@/data/cities-tr";
import { cityDisplayName } from "@/data/cities-tr";
import { t } from "@/lib/i18n";
import type { Locale } from "@/locales/translations";
import {
  calculatePrayerTimes,
  formatTime,
  SLOT_TO_GUIDE_ID,
  type PrayerSlotId,
} from "@/lib/prayer-times";
import {
  channelIdFor,
  contentSound,
  ensureSoundChannels,
  resolveSound,
  type NotificationSound,
} from "@/lib/notification-sounds";

/**
 * Yerel (cihazda planlanan) vakit bildirimleri — sunucu / APNs gerekmez.
 * iOS en fazla 64 bekleyen bildirim tutar; pencereyi bu sınıra göre
 * kısaltıp uygulama her açıldığında yeniden planlarız.
 */

export const NOTIFY_SLOTS: PrayerSlotId[] = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

export const LEAD_OPTIONS = [0, 10, 15, 30] as const;
export type LeadMinutes = (typeof LEAD_OPTIONS)[number];

export type NotificationPrefs = {
  enabled: boolean;
  slots: Record<PrayerSlotId, boolean>;
  leadMinutes: LeadMinutes;
  /** Vakit girdiğinde */
  atSound: NotificationSound;
  /** Vakit yaklaşırken (ön hatırlatma) */
  leadSound: NotificationSound;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  enabled: false,
  slots: {
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  leadMinutes: 0,
  atSound: "adhan",
  leadSound: "sparkle",
};

/** iOS sınırı 64; birkaç yuva boşta kalsın */
const MAX_PENDING = 60;
const MAX_DAYS = 14;

let handlerConfigured = false;

export function configureNotificationHandler() {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}


export type PermissionState = "granted" | "denied" | "undetermined";

export async function getPermissionState(): Promise<PermissionState> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as PermissionState;
}

export async function requestPermission(): Promise<PermissionState> {
  await ensureSoundChannels();
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return "granted";
  if (!current.canAskAgain) return "denied";
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return status as PermissionState;
}

/** Günde kaç bildirim düşeceğine göre planlanan gün sayısı */
export function scheduledDayCount(prefs: NotificationPrefs) {
  const perDay = notificationsPerDay(prefs);
  if (perDay === 0) return 0;
  return Math.max(1, Math.min(MAX_DAYS, Math.floor(MAX_PENDING / perDay)));
}

function notificationsPerDay(prefs: NotificationPrefs) {
  let count = 0;
  for (const slot of NOTIFY_SLOTS) {
    if (!prefs.slots[slot]) continue;
    count += 1;
    // Güneş doğuşu namaz değil; ön hatırlatma yalnız namaz vakitlerine
    if (prefs.leadMinutes > 0 && slot !== "sunrise") count += 1;
  }
  return count;
}

/**
 * iOS başlık / alt başlık / gövde gösterir; Android alt başlığı göstermez,
 * bu yüzden şehir·saat bilgisi Android'de gövdenin sonuna eklenir.
 */
function composeContent(
  title: string,
  meta: string,
  body: string,
): Pick<Notifications.NotificationContentInput, "title" | "subtitle" | "body"> {
  return Platform.OS === "ios"
    ? { title, subtitle: meta, body }
    : { title, body: `${body}\n${meta}` };
}

type PlannedNotification = {
  at: Date;
  kind: "at" | "lead";
  sound: NotificationSound;
  content: Notifications.NotificationContentInput;
};

export function planNotifications(
  city: TurkeyCity,
  prefs: NotificationPrefs,
  locale: Locale,
  now = new Date(),
): PlannedNotification[] {
  if (!prefs.enabled) return [];
  const days = scheduledDayCount(prefs);
  const cityName = cityDisplayName(city, locale);
  const atSound = resolveSound(prefs.atSound, "adhan", "at");
  const leadSound = resolveSound(prefs.leadSound, "sparkle", "lead");
  const planned: PlannedNotification[] = [];

  for (let offset = 0; offset < days + 1; offset++) {
    const day = new Date(now);
    day.setDate(day.getDate() + offset);
    const times = calculatePrayerTimes(city, day);

    for (const slot of NOTIFY_SLOTS) {
      if (!prefs.slots[slot]) continue;
      const at = times[slot];
      const time = formatTime(at, locale);
      const meta = t("notifications.meta", { city: cityName, time });
      const prayer = t(`notifications.prayerNames.${slot}`);
      const url = `/namaza-basla/${SLOT_TO_GUIDE_ID[slot]}`;

      if (slot === "sunrise") {
        // Güneş doğuşu namaz vakti değil: ezan yerine hatırlatma sesi
        planned.push({
          at,
          kind: "lead",
          sound: leadSound,
          content: {
            ...composeContent(
              t("notifications.sunriseTitle"),
              meta,
              t("notifications.sunriseBody"),
            ),
            sound: contentSound(leadSound),
            data: { slot },
          },
        });
        continue;
      }

      planned.push({
        at,
        kind: "at",
        sound: atSound,
        content: {
          ...composeContent(
            t("notifications.atTitle", { prayer }),
            meta,
            `${t(`notifications.atBodies.${slot}`)} ${t("notifications.atAction")}`,
          ),
          sound: contentSound(atSound),
          data: { slot, url },
        },
      });

      if (prefs.leadMinutes > 0) {
        planned.push({
          at: new Date(at.getTime() - prefs.leadMinutes * 60_000),
          kind: "lead",
          sound: leadSound,
          content: {
            ...composeContent(
              t("notifications.leadTitle", {
                prayer,
                minutes: prefs.leadMinutes,
              }),
              meta,
              t("notifications.leadBody"),
            ),
            sound: contentSound(leadSound),
            data: { slot, url },
          },
        });
      }
    }
  }

  return planned
    .filter((item) => item.at.getTime() > now.getTime() + 5_000)
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(0, MAX_PENDING);
}

let queue: Promise<void> = Promise.resolve();

/**
 * Tüm vakit bildirimlerini baştan planlar. Uygulama başka bildirim
 * kullanmadığı için hepsini iptal etmek güvenli. Çağrılar sıraya alınır;
 * hızlı ayar değişiklikleri yarışmaz.
 */
export function reschedulePrayerNotifications(
  city: TurkeyCity,
  prefs: NotificationPrefs,
  locale: Locale,
): Promise<void> {
  queue = queue
    .catch(() => undefined)
    .then(async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (!prefs.enabled) return;
      if ((await getPermissionState()) !== "granted") return;
      await ensureSoundChannels();

      for (const item of planNotifications(city, prefs, locale)) {
        await Notifications.scheduleNotificationAsync({
          content: item.content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: item.at,
            channelId: channelIdFor(item.sound),
          },
        });
      }
    });
  return queue;
}

/** Planlı vakit bildirimi sayısı (Ayarlar'daki test satırı için) */
export async function getScheduledCount() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.length;
}

/**
 * Geliştirme: seçili seslerle sıradaki gerçek bildirimlerin aynısını gönderir —
 * önce ön hatırlatma (5 sn), sonra vakit bildirimi (12 sn).
 * Uygulamayı arka plana al → banner + ses; dokun → oturum açılır.
 */
export async function sendTestNotification(
  city: TurkeyCity,
  prefs: NotificationPrefs,
  locale: Locale,
) {
  await ensureSoundChannels();
  const planned = planNotifications(
    city,
    { ...prefs, enabled: true, leadMinutes: prefs.leadMinutes || 10 },
    locale,
  );
  const lead = planned.find((item) => item.kind === "lead");
  const at = planned.find((item) => item.kind === "at");
  const tests: [PlannedNotification | undefined, number][] = [
    [lead, 5],
    [at, 12],
  ];
  for (const [item, seconds] of tests) {
    if (!item) continue;
    await Notifications.scheduleNotificationAsync({
      content: item.content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        channelId: channelIdFor(item.sound),
      },
    });
  }
}
