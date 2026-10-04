import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioSource,
  type AudioStatus,
} from "expo-audio";

type SpeakCallbacks = {
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: () => void;
};

let player: AudioPlayer | null = null;
let statusSub: { remove: () => void } | null = null;
let playToken = 0;
let safetyTimer: ReturnType<typeof setTimeout> | null = null;
let probeTimer: ReturnType<typeof setTimeout> | null = null;

function clearSafetyTimer() {
  if (safetyTimer) {
    clearTimeout(safetyTimer);
    safetyTimer = null;
  }
}

function clearProbeTimer() {
  if (probeTimer) {
    clearTimeout(probeTimer);
    probeTimer = null;
  }
}

async function releasePlayer() {
  clearSafetyTimer();
  clearProbeTimer();
  statusSub?.remove();
  statusSub = null;
  if (!player) return;
  try {
    player.pause();
    player.remove();
  } catch {
    // ignore
  }
  player = null;
}

export async function stopSpeaking() {
  playToken += 1;
  await releasePlayer();
}

export async function isSpeakingArabic() {
  return Boolean(player && !player.paused && player.isLoaded);
}

/** Yerel MP3 — expo-audio. Cihaz TTS yok. */
export async function speakDua(
  _arabic: string,
  options?: SpeakCallbacks & {
    audio?: AudioSource | null;
    playbackRate?: number;
  },
) {
  if (!options?.audio) {
    options?.onError?.();
    return;
  }

  await stopSpeaking();
  const token = playToken;
  let finished = false;
  let safetyArmed = false;

  const finish = (kind: "done" | "error") => {
    if (finished || token !== playToken) return;
    finished = true;
    void releasePlayer().then(() => {
      if (token !== playToken) return;
      if (kind === "done") options?.onDone?.();
      else options?.onError?.();
    });
  };

  const armSafety = (durationSec: number) => {
    if (safetyArmed) return;
    safetyArmed = true;
    clearSafetyTimer();
    const ms = Math.max(1500, Math.ceil(durationSec * 1000) + 600);
    safetyTimer = setTimeout(() => {
      if (finished || token !== playToken) return;
      finish("done");
    }, ms);
  };

  options?.onStart?.();

  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      shouldPlayInBackground: false,
      interruptionMode: "duckOthers",
      shouldRouteThroughEarpiece: false,
    });

    if (token !== playToken) return;

    player = createAudioPlayer(options.audio, { updateInterval: 100 });

    const rate = options.playbackRate ?? 1;
    if (rate > 0 && rate !== 1) {
      try {
        player.setPlaybackRate?.(rate);
      } catch {
        // ignore
      }
    }

    // expo-modules-core iç içe kurulu olduğundan SharedObject tipi
    // expo-audio tarafında çözülmüyor; çalışma anında addListener mevcut.
    const emitter = player as unknown as {
      addListener: (
        event: "playbackStatusUpdate",
        listener: (status: AudioStatus) => void,
      ) => { remove: () => void };
    };
    statusSub = emitter.addListener(
      "playbackStatusUpdate",
      (status: AudioStatus) => {
        if (token !== playToken || finished) return;

        if (status.isLoaded && status.duration > 0) {
          armSafety(status.duration);
        }

        if (status.didJustFinish) {
          finish("done");
        }
      },
    );

    player.play();

    // Süre henüz yoksa yüklemeyi bekle; sonra yedek süre
    probeTimer = setTimeout(() => {
      if (finished || token !== playToken || !player) return;
      try {
        armSafety(player.duration > 0 ? player.duration : 45);
      } catch {
        armSafety(45);
      }
    }, 500);
  } catch {
    finish("error");
  }
}

export async function speakArabic(
  text: string,
  options?: SpeakCallbacks & { audio?: AudioSource | null },
) {
  return speakDua(text, options);
}
