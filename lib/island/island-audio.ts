/**
 * Ada ambiyansı (katmanlı, adanın içeriğine göre) ve sihir efektleri.
 * Sesler: scripts/island/build_audio.py ile sentezlenir.
 */
import { useEffect } from "react";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

export type AmbientLayer = "pad" | "wind" | "birds" | "water" | "crickets";

const SOURCES: Record<AmbientLayer, number> = {
  pad: require("../../assets/audio/island/pad.m4a"),
  wind: require("../../assets/audio/island/wind.m4a"),
  birds: require("../../assets/audio/island/birds.m4a"),
  water: require("../../assets/audio/island/water.m4a"),
  crickets: require("../../assets/audio/island/crickets.m4a"),
};

/** Katman başına hedef ses (0–1) */
const LEVELS: Record<AmbientLayer, number> = {
  pad: 0.45,
  wind: 0.22,
  birds: 0.3,
  water: 0.28,
  crickets: 0.16,
};

const SFX = {
  magic: require("../../assets/audio/island/magic.m4a"),
  vanish: require("../../assets/audio/island/vanish.m4a"),
  tap: require("../../assets/audio/island/tap.m4a"),
};

const FADE_MS = 1600;
const STEP_MS = 80;

const players = new Map<AmbientLayer, AudioPlayer>();
const targets = new Map<AmbientLayer, number>();
let fadeTimer: ReturnType<typeof setInterval> | null = null;

function player(layer: AmbientLayer) {
  let p = players.get(layer);
  if (!p) {
    p = createAudioPlayer(SOURCES[layer]);
    p.loop = true;
    p.volume = 0;
    players.set(layer, p);
  }
  return p;
}

function runFades() {
  if (fadeTimer) return;
  const step = STEP_MS / FADE_MS;
  fadeTimer = setInterval(() => {
    let moving = false;
    for (const [layer, target] of targets) {
      const p = players.get(layer);
      if (!p) continue;
      const v = p.volume;
      const next = Math.abs(target - v) <= step ? target : v + Math.sign(target - v) * step;
      if (next !== v) {
        p.volume = next;
        moving = true;
      }
      if (next > 0 && !p.playing) p.play();
      if (next === 0 && target === 0 && p.playing) p.pause();
    }
    if (!moving && fadeTimer) {
      clearInterval(fadeTimer);
      fadeTimer = null;
    }
  }, STEP_MS);
}

function setAmbient(active: AmbientLayer[]) {
  for (const layer of Object.keys(SOURCES) as AmbientLayer[]) {
    const on = active.includes(layer);
    if (on) player(layer);
    if (on || players.has(layer)) targets.set(layer, on ? LEVELS[layer] : 0);
  }
  runFades();
}

/**
 * Ekran odaktayken ve ses açıkken katmanları yumuşakça açar; aksi hâlde kısar.
 * Sessiz modda çalmaz, diğer uygulamaların sesiyle karışır.
 */
export function useIslandAmbient(enabled: boolean, layers: AmbientLayer[]) {
  const key = layers.join(",");
  useEffect(() => {
    if (!enabled) {
      setAmbient([]);
      return;
    }
    void setAudioModeAsync({
      playsInSilentMode: false,
      shouldPlayInBackground: false,
      interruptionMode: "mixWithOthers",
    }).catch(() => undefined);
    try {
      setAmbient(key ? (key.split(",") as AmbientLayer[]) : []);
    } catch {
      // ses cihazda kullanılamıyorsa sessizce geç
    }
    return () => setAmbient([]);
  }, [enabled, key]);
}

const sfxPlayers = new Map<keyof typeof SFX, AudioPlayer>();
let lastSfx = 0;

/** Kısa efekt; üst üste binen belirmelerde 140 ms'de bir çalar */
export function playIslandSfx(name: keyof typeof SFX, volume = 0.6) {
  const now = Date.now();
  if (name !== "tap" && now - lastSfx < 140) return;
  lastSfx = now;
  try {
    let p = sfxPlayers.get(name);
    if (!p) {
      p = createAudioPlayer(SFX[name]);
      sfxPlayers.set(name, p);
    }
    p.volume = volume;
    p.seekTo(0);
    p.play();
  } catch {
    // ignore
  }
}
