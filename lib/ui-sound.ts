import { createAudioPlayer, type AudioPlayer } from "expo-audio";

const MARK_DONE = require("../assets/audio/ui/mark-done.wav");

let markPlayer: AudioPlayer | null = null;

/** Namaz işaretlendiğinde çalan kısa onay tonu */
export function playMarkDoneSound() {
  try {
    if (!markPlayer) {
      markPlayer = createAudioPlayer(MARK_DONE);
      markPlayer.volume = 0.55;
    }
    markPlayer.seekTo(0);
    markPlayer.play();
  } catch {
    // ses cihazda kullanılamıyorsa sessizce geç
  }
}

export function releaseUiSounds() {
  try {
    markPlayer?.remove();
  } catch {
    // ignore
  }
  markPlayer = null;
}
