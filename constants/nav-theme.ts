import { fonts } from "@/constants/fonts";
import { pageBackground, themeColors } from "@/constants/theme";

/** Soft, theme-aware navigation chrome (header + related). */
export function softNavTheme(dark: boolean) {
  const chrome = dark ? themeColors.dark : themeColors.light;
  return {
    headerStyle: {
      backgroundColor: chrome.pageSoft,
      elevation: dark ? 0 : 2,
      shadowOpacity: dark ? 0 : 0.06,
      shadowColor: "#1a2f25",
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 4,
      borderBottomWidth: dark ? 1 : 0,
      borderBottomColor: chrome.border,
    },
    headerTintColor: dark ? "#e8e2d6" : "#1a2f25",
    headerTitleStyle: {
      fontFamily: fonts.bodySemi,
      fontWeight: "600" as const,
      fontSize: 17,
      color: dark ? "#f3efe6" : "#1a2f25",
    },
    headerShadowVisible: !dark,
    contentBackground: pageBackground(dark),
    tabBarBackground: chrome.pageSoft,
    tabBarBorder: chrome.border,
    tabBarActive: dark ? "#d4a84b" : "#2a4a39",
    tabBarInactive: dark ? "rgba(194,215,203,0.45)" : "rgba(61,107,82,0.5)",
  };
}
