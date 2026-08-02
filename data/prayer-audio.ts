import type { AudioSource } from "expo-audio";
import type { PrayerVoiceId } from "@/data/prayer-build";

/**
 * Namaz sesleri — yerel MP3 (cihaz TTS / expo-speech yok).
 *
 * - alafasy: Kur’an (EveryAyah / Mishary Alafasy)
 * - wikimedia: CC BY-SA insan sesi
 * - studio: gömülü Arapça ses (açık kari paketi yoksa; cihaz TTS değil)
 */
export type PrayerAudioSourceKind = "alafasy" | "wikimedia" | "studio";

export const PRAYER_AUDIO: Record<PrayerVoiceId, AudioSource> = {
  niyet: require("../assets/audio/prayer/niyet.mp3"),
  tekbir: require("../assets/audio/prayer/tekbir.mp3"),
  subhaneke: require("../assets/audio/prayer/subhaneke.mp3"),
  fatiha: require("../assets/audio/prayer/fatiha.mp3"),
  ihlas: require("../assets/audio/prayer/ihlas.mp3"),
  ruku: require("../assets/audio/prayer/ruku.mp3"),
  semiallah: require("../assets/audio/prayer/semiallah.mp3"),
  rabbena: require("../assets/audio/prayer/rabbena.mp3"),
  secde: require("../assets/audio/prayer/secde.mp3"),
  selam: require("../assets/audio/prayer/selam.mp3"),
  kunut: require("../assets/audio/prayer/kunut.mp3"),
  ettehiyyatu: require("../assets/audio/prayer/ettehiyyatu.mp3"),
  salavat: require("../assets/audio/prayer/salavat.mp3"),
  rabbenaAtina: require("../assets/audio/prayer/rabbenaAtina.mp3"),
};

export function getPrayerAudio(
  voiceId: PrayerVoiceId | undefined,
): AudioSource | undefined {
  if (!voiceId) return undefined;
  return PRAYER_AUDIO[voiceId];
}
