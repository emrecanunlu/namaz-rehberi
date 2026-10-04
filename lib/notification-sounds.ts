import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { t } from "@/lib/i18n";

/**
 * Bildirim sesleri.
 *
 * - Dosyalar `app.json` → expo-notifications `sounds` ile uygulamaya gömülür;
 *   bu yüzden özel sesler Expo Go'da değil, development/production build'de
 *   çalar (Expo Go sistem sesine düşer).
 * - iOS: bildirim sesi ≤ 30 sn olmalı, yoksa sistem sesi çalar.
 * - Android: ses bildirim kanalına bağlıdır ve kanal oluşturulduktan sonra
 *   değiştirilemez → her ses için ayrı kanal. Alarmlar ayrı kanallarda,
 *   alarm ses akışında çalar ve Rahatsız Etmeyin'i geçer.
 */

export type NotificationSound =
  | "alarm"
  | "adhan"
  | "sparkle"
  | "chime"
  | "system"
  | "silent";

/** Kaynak ve lisanslar: assets/sounds/CREDITS.md */
const PREVIEWS: Partial<Record<NotificationSound, number>> = {
  alarm: require("../assets/sounds/alarm_tone.wav"),
  adhan: require("../assets/sounds/adhan_short.wav"),
  sparkle: require("../assets/sounds/reminder_sparkle.wav"),
  chime: require("../assets/sounds/reminder_chime.wav"),
};

const SOUND_FILES: Partial<Record<NotificationSound, string>> = {
  alarm: "alarm_tone.wav",
  adhan: "adhan_short.wav",
  sparkle: "reminder_sparkle.wav",
  chime: "reminder_chime.wav",
};

/** Expo Go uygulamaya gömülü sesleri bulamaz → sistem sesi */
const IN_EXPO_GO =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const AT_SOUNDS: NotificationSound[] = [
  "adhan",
  "chime",
  "system",
  "silent",
];
export const LEAD_SOUNDS: NotificationSound[] = [
  "sparkle",
  "chime",
  "system",
  "silent",
];

/** Alarm sessiz olamaz; vakit sesi yerine çalar */
export const ALARM_SOUNDS: NotificationSound[] = ["alarm", "adhan"];

export type SoundKind = "at" | "lead" | "alarm";

export function availableSounds(kind?: SoundKind): NotificationSound[] {
  if (kind === "at") return AT_SOUNDS;
  if (kind === "lead") return LEAD_SOUNDS;
  if (kind === "alarm") return ALARM_SOUNDS;
  return ["adhan", "sparkle", "chime", "system", "silent"];
}

/** Seçim bu tür için geçerli değilse güvenli karşılık */
export function resolveSound(
  sound: NotificationSound,
  fallback: NotificationSound,
  kind?: SoundKind,
): NotificationSound {
  return availableSounds(kind).includes(sound) ? sound : fallback;
}

/** Bildirim içeriğindeki `sound` alanı (iOS) */
export function contentSound(sound: NotificationSound): string | false {
  if (sound === "silent") return false;
  if (IN_EXPO_GO) return "default";
  return SOUND_FILES[sound] ?? "default";
}

/** Uygulama paketindeki ses dosyası (native alarm); yoksa boş → sistem sesi */
export function soundFileFor(sound: NotificationSound) {
  return SOUND_FILES[sound] ?? "";
}

export function channelIdFor(sound: NotificationSound) {
  return `prayer-${sound}`;
}

export function alarmChannelIdFor(sound: NotificationSound) {
  return `prayer-alarm-${sound}`;
}

/** Android: her ses için bir kanal (idempotent) */
export async function ensureSoundChannels() {
  if (Platform.OS !== "android") return;
  for (const sound of availableSounds()) {
    await Notifications.setNotificationChannelAsync(channelIdFor(sound), {
      name: `${t("notifications.channelName")} · ${t(`notifications.sounds.${sound}`)}`,
      importance:
        sound === "silent"
          ? Notifications.AndroidImportance.DEFAULT
          : Notifications.AndroidImportance.HIGH,
      sound:
        sound === "silent"
          ? null
          : IN_EXPO_GO
            ? "default"
            : (SOUND_FILES[sound] ?? "default"),
      vibrationPattern: sound === "silent" ? null : [0, 250, 150, 250],
      enableVibrate: sound !== "silent",
    });
  }
  for (const sound of ALARM_SOUNDS) {
    await Notifications.setNotificationChannelAsync(alarmChannelIdFor(sound), {
      name: `${t("notifications.alarmChannelName")} · ${t(`notifications.sounds.${sound}`)}`,
      importance: Notifications.AndroidImportance.MAX,
      bypassDnd: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: IN_EXPO_GO ? "default" : (SOUND_FILES[sound] ?? "default"),
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
      vibrationPattern: [0, 600, 300, 600, 300, 600],
      enableVibrate: true,
    });
  }
}

/** Önizleme yalnız bir kesit çalar; uzun sesler (ezan, alarm) sonuna kadar sürmesin */
const PREVIEW_MS = 4500;
const PREVIEW_FADE_MS = 700;
const PREVIEW_VOLUME = 0.8;

let previewPlayer: AudioPlayer | null = null;
let previewTimers: ReturnType<typeof setTimeout>[] = [];

/** Çalan önizlemeyi hemen durdur (ekrandan çıkınca, yeni seçimde) */
export function stopPreview() {
  previewTimers.forEach(clearTimeout);
  previewTimers = [];
  try {
    previewPlayer?.remove();
  } catch {
    // ignore
  }
  previewPlayer = null;
}

/** Ayarlar'da seçim yapılınca sesi kısa dinlet (sistem/sessiz için çalmaz) */
export function previewSound(sound: NotificationSound) {
  stopPreview();
  const source = PREVIEWS[sound] ?? null;
  if (!source) return;
  try {
    const player = createAudioPlayer(source);
    previewPlayer = player;
    player.volume = PREVIEW_VOLUME;
    player.play();
    // Kesitin sonunda sesi adım adım kısıp durdur
    const steps = 7;
    for (let i = 1; i <= steps; i++) {
      previewTimers.push(
        setTimeout(
          () => {
            if (previewPlayer !== player) return;
            if (i === steps) stopPreview();
            else player.volume = PREVIEW_VOLUME * (1 - i / steps);
          },
          PREVIEW_MS - PREVIEW_FADE_MS + (PREVIEW_FADE_MS / steps) * i,
        ),
      );
    }
  } catch {
    // ses çalınamıyorsa sessizce geç
  }
}
