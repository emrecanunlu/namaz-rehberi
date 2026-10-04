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
 *   değiştirilemez → her ses için ayrı kanal.
 */

export type NotificationSound =
  | "adhan"
  | "sparkle"
  | "chime"
  | "system"
  | "silent";

/** Kaynak ve lisanslar: assets/sounds/CREDITS.md */
const PREVIEWS: Partial<Record<NotificationSound, number>> = {
  adhan: require("../assets/sounds/adhan_short.wav"),
  sparkle: require("../assets/sounds/reminder_sparkle.wav"),
  chime: require("../assets/sounds/reminder_chime.wav"),
};

const SOUND_FILES: Partial<Record<NotificationSound, string>> = {
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

export function availableSounds(kind?: "at" | "lead"): NotificationSound[] {
  if (kind === "at") return AT_SOUNDS;
  if (kind === "lead") return LEAD_SOUNDS;
  return ["adhan", "sparkle", "chime", "system", "silent"];
}

/** Seçim bu tür için geçerli değilse güvenli karşılık */
export function resolveSound(
  sound: NotificationSound,
  fallback: NotificationSound,
  kind?: "at" | "lead",
): NotificationSound {
  return availableSounds(kind).includes(sound) ? sound : fallback;
}

/** Bildirim içeriğindeki `sound` alanı (iOS) */
export function contentSound(sound: NotificationSound): string | false {
  if (sound === "silent") return false;
  if (IN_EXPO_GO) return "default";
  return SOUND_FILES[sound] ?? "default";
}

export function channelIdFor(sound: NotificationSound) {
  return `prayer-${sound}`;
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
}

let previewPlayer: AudioPlayer | null = null;

/** Ayarlar'da seçim yapılınca sesi dinlet (sistem/sessiz için çalmaz) */
export function previewSound(sound: NotificationSound) {
  const source = PREVIEWS[sound] ?? null;
  try {
    previewPlayer?.remove();
  } catch {
    // ignore
  }
  previewPlayer = null;
  if (!source) return;
  try {
    previewPlayer = createAudioPlayer(source);
    previewPlayer.volume = 0.8;
    previewPlayer.play();
  } catch {
    // ses çalınamıyorsa sessizce geç
  }
}
