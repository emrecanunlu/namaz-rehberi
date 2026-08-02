import type { PrayerStep, PrayerVoiceId } from "@/data/prayer-build";
import { getPrayerAudio } from "@/data/prayer-audio";
import { speakDua, stopSpeaking } from "@/lib/speak-arabic";

type VoiceCallbacks = {
  onDone?: () => void;
  onError?: () => void;
};

let cancelled = false;
let generation = 0;
let holdTimer: ReturnType<typeof setTimeout> | null = null;

function repeatCount(voiceId: PrayerVoiceId | undefined) {
  return voiceId === "ruku" || voiceId === "secde" ? 3 : 1;
}

function holdAfterVoiceMs(step: PrayerStep) {
  switch (step.poseId) {
    case "niyet":
      return 1800;
    case "tekbir":
      return 1400;
    case "ruku":
    case "secde":
      return 1200;
    case "kavme":
      return 1200;
    case "oturma":
      return 2200;
    case "kiyam":
      return 1000;
    case "teshehhud":
      return 1200;
    case "kunut":
      return 1200;
    case "selam":
      return 1800;
    default:
      return 1200;
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
  await stopSpeaking();
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
  let played = 0;

  const playOnce = () => {
    if (cancelled || gen !== generation) return;
    played += 1;

    void speakDua(step.arabic ?? "", {
      audio,
      playbackRate: 1,
      onDone: () => {
        if (cancelled || gen !== generation) return;
        if (played < times) {
          setTimeout(() => {
            if (cancelled || gen !== generation) return;
            playOnce();
          }, 650);
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

/** Yerel MP3 kıldırıcı — expo-speech yok. */
export async function speakPrayerStep(
  step: PrayerStep,
  options?: VoiceCallbacks,
) {
  const gen = ++generation;
  cancelled = false;
  clearHoldTimer();

  await stopSpeaking();

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

  setTimeout(() => {
    if (cancelled || gen !== generation) return;
    startArabic();
  }, step.cueKey ? 450 : 120);
}
