import { fonts } from "@/constants/fonts";

/** Soft, theme-aware navigation chrome (header + related). */
export function softNavTheme(dark: boolean) {
  return {
    headerStyle: {
      backgroundColor: dark ? "#121c17" : "#faf8f4",
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: dark ? "rgba(42,74,57,0.45)" : "rgba(230,220,200,0.9)",
    },
    headerTintColor: dark ? "#e8e2d6" : "#1a2f25",
    headerTitleStyle: {
      fontFamily: fonts.bodySemi,
      fontWeight: "600" as const,
      fontSize: 17,
      color: dark ? "#f3efe6" : "#1a2f25",
    },
    headerShadowVisible: false,
    contentBackground: dark ? "#0f1a15" : "#faf8f4",
    tabBarBackground: dark ? "#121c17" : "#faf8f4",
    tabBarBorder: dark ? "rgba(42,74,57,0.45)" : "rgba(230,220,200,0.9)",
    tabBarActive: dark ? "#d4a84b" : "#2a4a39",
    tabBarInactive: dark ? "rgba(194,215,203,0.45)" : "rgba(61,107,82,0.45)",
  };
}
