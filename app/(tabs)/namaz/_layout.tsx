import { Stack } from "expo-router";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";
import { softNavTheme } from "@/constants/nav-theme";

export default function NamazLayout() {
  const { locale, resolvedTheme } = useAppSettings();
  const dark = resolvedTheme === "dark";
  const nav = softNavTheme(dark);

  return (
    <Stack
      key={`${locale}-${resolvedTheme}`}
      screenOptions={{
        headerStyle: nav.headerStyle,
        headerTintColor: nav.headerTintColor,
        headerTitleStyle: nav.headerTitleStyle,
        headerShadowVisible: nav.headerShadowVisible,
        contentStyle: { backgroundColor: nav.contentBackground },
        animation: "slide_from_right",
        animationDuration: 300,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: t("prayer.guideTitle") }} />
      <Stack.Screen
        name="[id]"
        options={{
          title: t("prayer.guideTitle"),
          headerBackTitle: t("common.back"),
        }}
      />
    </Stack>
  );
}
