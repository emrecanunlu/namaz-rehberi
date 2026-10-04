/**
 * Takımada temaları ve vakte göre gökyüzü.
 * Model renkleri materyal adlarına (scripts/island/build_island.py PALETTE) göre değiştirilir.
 */
import type { DayPrayerTimes } from "@/lib/prayer-times";

export type IslandThemeId = "spring" | "autumn" | "winter" | "sakura" | "oasis";

export type IslandTheme = {
  id: IslandThemeId;
  /** materyal adı → sRGB hex */
  colors: Record<string, string>;
};

const THEMES: IslandTheme[] = [
  { id: "spring", colors: {} },
  {
    id: "autumn",
    colors: {
      grass: "#93ad4c",
      grass_soft: "#a8b957",
      grass_light: "#c2c463",
      grass_dark: "#6f8a3a",
      leaf: "#e07a2c",
      leaf_light: "#f2a640",
      pine: "#3f6b3f",
    },
  },
  {
    id: "winter",
    colors: {
      grass: "#eef3f7",
      grass_soft: "#dde7ee",
      grass_light: "#ffffff",
      grass_dark: "#c7d6e0",
      leaf: "#e3ecf2",
      leaf_light: "#ffffff",
      pine: "#2f5d4e",
      dirt: "#7d6c60",
      water: "#bfe3f2",
      lily: "#d9e8f0",
    },
  },
  {
    id: "sakura",
    colors: {
      grass: "#7cc26a",
      grass_soft: "#90d07c",
      leaf: "#f2a2bd",
      leaf_light: "#f9c6d7",
    },
  },
  {
    id: "oasis",
    colors: {
      grass: "#e3c584",
      grass_soft: "#ead199",
      grass_light: "#f0dcaa",
      grass_dark: "#c9a866",
      dirt: "#bf9656",
      rock: "#c79f70",
      rock_dark: "#a9825a",
      leaf: "#4f9a4a",
      leaf_light: "#69b35a",
      pine: "#3d8a55",
    },
  },
];

export function themeForIsland(index: number): IslandTheme & { cycle: number } {
  return { ...THEMES[index % THEMES.length], cycle: Math.floor(index / THEMES.length) };
}

/** Bir tema turu bittikten sonra yaprak ve çiçek tonları kaydırılır (sonsuz çeşitlilik) */
export const HUE_SHIFTED_MATERIALS = new Set([
  "leaf",
  "leaf_light",
  "petal_pink",
  "petal_purple",
  "petal_yellow",
  "dome",
  "wing_orange",
  "wing_blue",
]);
export const HUE_STEP = 0.11;

// ---------------------------------------------------------------------------
// Gökyüzü
// ---------------------------------------------------------------------------

export type SkyPhase = "night" | "dawn" | "day" | "afternoon" | "dusk";

export type Sky = {
  phase: SkyPhase;
  top: string;
  bottom: string;
  sun: string;
  sunIntensity: number;
  ambient: number;
  /** 0–1: fenerlerin parlaklığı ve yıldızların görünürlüğü */
  night: number;
};

export const SKIES: Record<SkyPhase, Sky> = {
  night: { phase: "night", top: "#0a1430", bottom: "#34477a", sun: "#b4c4ff", sunIntensity: 1.0, ambient: 0.95, night: 1 },
  dawn: { phase: "dawn", top: "#46549a", bottom: "#f3b0a2", sun: "#ffc6a6", sunIntensity: 1.3, ambient: 0.75, night: 0.4 },
  day: { phase: "day", top: "#5fa9e9", bottom: "#d4ecf8", sun: "#fffaf0", sunIntensity: 2.4, ambient: 0.95, night: 0 },
  afternoon: { phase: "afternoon", top: "#6b9fdb", bottom: "#f6d9a8", sun: "#ffdcaa", sunIntensity: 2.0, ambient: 0.85, night: 0 },
  dusk: { phase: "dusk", top: "#3d3170", bottom: "#f08d60", sun: "#ff9f70", sunIntensity: 1.1, ambient: 0.7, night: 0.6 },
};

export function skyPhaseFor(times: DayPrayerTimes, now = new Date()): SkyPhase {
  const t = now.getTime();
  if (t < times.fajr.getTime()) return "night";
  if (t < times.sunrise.getTime()) return "dawn";
  if (t < times.asr.getTime()) return "day";
  if (t < times.maghrib.getTime()) return "afternoon";
  if (t < times.isha.getTime()) return "dusk";
  return "night";
}

// ---------------------------------------------------------------------------
// Uygulama temasıyla bütünleşik arka plan
// ---------------------------------------------------------------------------

/** Ada sahnesinin arka planı ve ışığı: uygulamanın light/dark paletinden, vakit yalnız hafif ton */
export type Backdrop = Sky & { fog: string; stars: number };

function mix(a: string, b: string, k: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => {
    const x = (pa >> shift) & 255;
    const y = (pb >> shift) & 255;
    return Math.round(x + (y - x) * k);
  };
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
}

/** Palet: constants/theme.ts (light: sıcak kum, dark: orman gecesi) */
const BACKDROP_BASE = {
  light: { top: "#f7f3ea", bottom: "#e4dcc8" },
  dark: { top: "#0b140f", bottom: "#1f352b" },
} as const;

export function islandBackdrop(dark: boolean, phase: SkyPhase): Backdrop {
  const sky = SKIES[phase];
  if (dark) {
    const top = mix(BACKDROP_BASE.dark.top, sky.top, 0.12);
    const bottom = mix(BACKDROP_BASE.dark.bottom, sky.bottom, 0.1);
    return {
      phase,
      top,
      bottom,
      fog: bottom,
      sun: "#c9d6ff",
      sunIntensity: 1.15,
      ambient: 0.95,
      night: 1,
      stars: 0.9,
    };
  }
  const top = mix(BACKDROP_BASE.light.top, sky.top, 0.14);
  const bottom = mix(BACKDROP_BASE.light.bottom, sky.bottom, 0.16);
  return {
    phase,
    top,
    bottom,
    fog: bottom,
    sun: sky.sun,
    sunIntensity: Math.max(1.6, sky.sunIntensity),
    ambient: Math.max(0.85, sky.ambient),
    night: sky.night * 0.5,
    stars: 0,
  };
}
