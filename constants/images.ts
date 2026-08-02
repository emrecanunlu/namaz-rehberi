import type { ImageSourcePropType } from "react-native";

export const IMAGES = {
  onboardingWelcome: require("../assets/images/onboarding-welcome.jpg"),
  onboardingPrayer: require("../assets/images/onboarding-prayer.jpg"),
  onboardingDua: require("../assets/images/onboarding-dua.jpg"),
  onboardingReady: require("../assets/images/onboarding-ready.jpg"),
  homeHero: require("../assets/images/home-hero.jpg"),
  homeHeroLight: require("../assets/images/light/home-hero.png"),
  dualarBanner: require("../assets/images/dualar-banner.jpg"),
  dualarBannerLight: require("../assets/images/light/dualar-banner.png"),
  namazBanner: require("../assets/images/namaz-banner.jpg"),
  namazBannerLight: require("../assets/images/light/namaz-banner.png"),
} as const;

type BannerKey = "homeHero" | "dualarBanner" | "namazBanner";

/** Light tema için ayrı, daha açık app bar görselleri */
export function bannerForTheme(
  key: BannerKey,
  dark: boolean,
): ImageSourcePropType {
  if (dark) return IMAGES[key];
  if (key === "homeHero") return IMAGES.homeHeroLight;
  if (key === "dualarBanner") return IMAGES.dualarBannerLight;
  return IMAGES.namazBannerLight;
}
