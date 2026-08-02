import { Platform, type ViewStyle } from "react-native";

/** Sayfa / chrome yüzeyleri — light biraz daha sıcak, beyaz değil */
export const themeColors = {
  light: {
    page: "#ebe4d4",
    pageSoft: "#e4dcc8",
    surface: "#f3efe6",
    surfaceRaised: "#f7f3ea",
    border: "rgba(42,74,57,0.12)",
    compactBar: "rgba(235,228,212,0.96)",
    compactTitle: "#1a2f25",
    compactMuted: "#2a4a39",
    heroTitle: "#1a2f25",
    heroSubtitle: "rgba(26,47,37,0.72)",
    heroEyebrow: "#9a7424",
    heroOverlay: [
      "rgba(235,228,212,0.42)",
      "rgba(235,228,212,0.62)",
      "rgba(232,224,208,0.82)",
    ] as const,
    todayDua: ["#f7f3ea", "#efe8d8", "#e4dcc8"] as const,
  },
  dark: {
    page: "#0f1a15",
    pageSoft: "#121c17",
    surface: "#1a2f25",
    surfaceRaised: "#1f352b",
    border: "rgba(42,74,57,0.55)",
    compactBar: "rgba(15,26,21,0.92)",
    compactTitle: "#ebe6dc",
    compactMuted: "#d4a84b",
    heroTitle: "#f3efe6",
    heroSubtitle: "rgba(243,239,230,0.72)",
    heroEyebrow: "#d4a84b",
    heroOverlay: [
      "rgba(15,26,21,0.52)",
      "rgba(15,26,21,0.72)",
      "rgba(15,26,21,0.86)",
    ] as const,
    todayDua: ["#1f352b", "#15241d", "#0f1a15"] as const,
  },
} as const;

export function pageBackground(dark: boolean) {
  return dark ? themeColors.dark.page : themeColors.light.page;
}

export function pageFadeColors(dark: boolean) {
  if (dark) {
    return ["rgba(15,26,21,0)", "rgba(15,26,21,0.35)", "#0f1a15"] as const;
  }
  return ["rgba(235,228,212,0)", "rgba(235,228,212,0.5)", "#ebe4d4"] as const;
}

export function heroOverlayColors(dark: boolean) {
  return dark ? themeColors.dark.heroOverlay : themeColors.light.heroOverlay;
}

/** Kart / liste gölgesi — light yumuşak, dark hafif derinlik */
export function cardShadow(dark: boolean): ViewStyle {
  if (dark) {
    return Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: { elevation: 5 },
      default: {},
    }) as ViewStyle;
  }

  return Platform.select({
    ios: {
      shadowColor: "#1a2f25",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: { elevation: 3 },
    default: {},
  }) as ViewStyle;
}
