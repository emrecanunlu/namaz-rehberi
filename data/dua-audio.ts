import type { AudioSource } from "expo-audio";

/**
 * Tüm günlük duaların yerel sesleri.
 * Kur’an ayetleri (5–9, 12, 14): Mishary Alafasy — EveryAyah
 * Ezkar (1–4, 10, 11, 13): gömülü stüdyo Arapça MP3
 */
export const DUA_AUDIO: Record<string, AudioSource> = {
  "1": require("../assets/audio/duas/1.mp3"),
  "2": require("../assets/audio/duas/2.mp3"),
  "3": require("../assets/audio/duas/3.mp3"),
  "4": require("../assets/audio/duas/4.mp3"),
  "5": require("../assets/audio/duas/5.mp3"),
  "6": require("../assets/audio/duas/6.mp3"),
  "7": require("../assets/audio/duas/7.mp3"),
  "8": require("../assets/audio/duas/8.mp3"),
  "9": require("../assets/audio/duas/9.mp3"),
  "10": require("../assets/audio/duas/10.mp3"),
  "11": require("../assets/audio/duas/11.mp3"),
  "12": require("../assets/audio/duas/12.mp3"),
  "13": require("../assets/audio/duas/13.mp3"),
  "14": require("../assets/audio/duas/14.mp3"),
};

export function getDuaAudio(id: string): AudioSource | undefined {
  return DUA_AUDIO[id];
}
