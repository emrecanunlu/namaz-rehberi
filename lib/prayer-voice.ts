import type { PrayerStep, PrayerVoiceId } from "@/data/prayer-build";
import { getPrayerAudio } from "@/data/prayer-audio";
import { speakDua, stopSpeaking } from "@/lib/speak-arabic";
import * as Speech from "expo-speech";
import type { Locale } from "@/locales/translations";

type VoiceCallbacks = {
  onDone?: () => void;
  onError?: () => void;
  guidanceText?: string;
  locale?: Locale;
};

let cancelled = false;
let generation = 0;
let holdTimer: ReturnType<typeof setTimeout> | null = null;

/** Rüku/secde: 3 kez; kısa zikirler daha sıkı aralıkla */
function repeatCount(voiceId: PrayerVoiceId | undefined) {
  return voiceId === "ruku" || voiceId === "secde" ? 3 : 1;
}

function gapBetweenRepeatsMs(voiceId: PrayerVoiceId | undefined) {
  if (voiceId === "ruku" || voiceId === "secde") return 320;
  return 500;
}

function playbackRateFor(voiceId: PrayerVoiceId | undefined) {
  // Kısa zikirler hafif hızlı; uzun okuyuşlar doğal tempo
  switch (voiceId) {
    case "ruku":
    case "secde":
    case "tekbir":
    case "semiallah":
    case "rabbena":
      return 1.08;
    case "fatiha":
    case "ihlas":
    case "subhaneke":
    case "kunut":
    case "ettehiyyatu":
    case "salavat":
    case "rabbenaAtina":
      return 1;
    default:
      return 1.02;
  }
}

/** Ses bittikten sonra advance bar başlamadan önce kısa nefes */
function holdAfterVoiceMs(step: PrayerStep) {
  switch (step.voiceId) {
    case "ruku":
    case "secde":
      return 280;
    case "tekbir":
    case "semiallah":
    case "rabbena":
      return 350;
    case "fatiha":
    case "ihlas":
      return 700;
    case "subhaneke":
    case "kunut":
    case "ettehiyyatu":
    case "salavat":
    case "rabbenaAtina":
      return 600;
    case "selam":
      return 900;
    default:
      break;
  }

  switch (step.poseId) {
    case "oturma":
      return 900;
    case "kavme":
      return 400;
    case "kiyam":
      return 450;
    default:
      return 500;
  }
}

/**
 * Ses + hold bittikten sonra sonraki adıma geçiş süresi.
 * Rüku/secde kısa; uzun dualar / oturuş daha uzun.
 */
export function getAdvanceDelayMs(step: PrayerStep) {
  switch (step.voiceId) {
    case "ruku":
    case "secde":
      return 850;
    case "tekbir":
      return 700;
    case "semiallah":
    case "rabbena":
      return 750;
    case "fatiha":
      return 2200;
    case "ihlas":
      return 1800;
    case "subhaneke":
      return 2000;
    case "kunut":
      return 2400;
    case "ettehiyyatu":
      return 2200;
    case "salavat":
      return 2000;
    case "rabbenaAtina":
      return 2000;
    case "selam":
      return 1600;
    default:
      break;
  }

  switch (step.poseId) {
    case "oturma":
      return 1400;
    case "kavme":
      return 800;
    case "kiyam":
      return 900;
    default:
      return 1100;
  }
}

function clearHoldTimer() {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
}

export async function stopPrayerVoice() {
  cancelled = true;
  generation += 1;
  clearHoldTimer();
  await Promise.all([stopSpeaking(), Speech.stop()]);
}

function finishWithHold(
  step: PrayerStep,
  gen: number,
  options?: VoiceCallbacks,
) {
  if (cancelled || gen !== generation) return;
  clearHoldTimer();
  holdTimer = setTimeout(() => {
    if (cancelled || gen !== generation) return;
    options?.onDone?.();
  }, holdAfterVoiceMs(step));
}

function playArabicPhrase(
  step: PrayerStep,
  gen: number,
  onComplete: () => void,
  onFail: () => void,
) {
  if (cancelled || gen !== generation) return;

  const audio = getPrayerAudio(step.voiceId);
  if (!audio) {
    onComplete();
    return;
  }

  const times = repeatCount(step.voiceId);
  const gap = gapBetweenRepeatsMs(step.voiceId);
  const rate = playbackRateFor(step.voiceId);
  let played = 0;

  const playOnce = () => {
    if (cancelled || gen !== generation) return;
    played += 1;

    void speakDua(step.arabic ?? "", {
      audio,
      playbackRate: rate,
      onDone: () => {
        if (cancelled || gen !== generation) return;
        if (played < times) {
          setTimeout(() => {
            if (cancelled || gen !== generation) return;
            playOnce();
          }, gap);
          return;
        }
        onComplete();
      },
      onError: () => {
        if (cancelled || gen !== generation) return;
        onFail();
      },
    });
  };

  playOnce();
}

function playLocalizedGuidance(
  text: string | undefined,
  locale: Locale | undefined,
  gen: number,
  onComplete: () => void,
) {
  if (!text?.trim()) {
    onComplete();
    return;
  }

  Speech.speak(text, {
    language: locale === "en" ? "en-US" : "tr-TR",
    rate: locale === "en" ? 0.88 : 0.9,
    pitch: 1,
    useApplicationAudioSession: false,
    onDone: () => {
      if (cancelled || gen !== generation) return;
      onComplete();
    },
    onStopped: () => {
      if (cancelled || gen !== generation) return;
      onComplete();
    },
    onError: () => {
      if (cancelled || gen !== generation) return;
      onComplete();
    },
  });
}

/** Seçili dilde yönlendirme + yerel Arapça MP3 kıraat. */
export async function speakPrayerStep(
  step: PrayerStep,
  options?: VoiceCallbacks,
) {
  const gen = ++generation;
  cancelled = false;
  clearHoldTimer();

  await Promise.all([stopSpeaking(), Speech.stop()]);

  const complete = () => finishWithHold(step, gen, options);

  const fail = () => {
    if (cancelled || gen !== generation) return;
    options?.onError?.();
    complete();
  };

  const startArabic = () => {
    if (cancelled || gen !== generation) return;
    if (!step.voiceId) {
      complete();
      return;
    }
    playArabicPhrase(step, gen, complete, fail);
  };

  playLocalizedGuidance(
    options?.guidanceText,
    options?.locale,
    gen,
    () => {
      const introMs = options?.guidanceText ? 220 : 80;
      setTimeout(() => {
        if (cancelled || gen !== generation) return;
        startArabic();
      }, introMs);
    },
  );
}
