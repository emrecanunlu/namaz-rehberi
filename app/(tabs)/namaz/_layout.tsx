import { Stack, useRouter } from "expo-router";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";
import { softNavTheme } from "@/constants/nav-theme";
import { StackAppHeader } from "@/components/tab-hero-header";

export default function NamazLayout() {
  const { locale, resolvedTheme } = useAppSettings();
  const router = useRouter();
  const dark = resolvedTheme === "dark";
  const nav = softNavTheme(dark);

  return (
    <Stack
      key={`${locale}-${resolvedTheme}`}
      screenOptions={{
        contentStyle: { backgroundColor: nav.contentBackground },
        animation: "slide_from_right",
        animationDuration: 300,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          title: t("prayer.guideTitle"),
          header: ({ options }) => (
            <StackAppHeader
              title={String(options.title ?? t("prayer.guideTitle"))}
              subtitle={t("tabs.prayer")}
              onBack={() => {
                if (router.canGoBack()) router.back();
              }}
            />
          ),
        }}
      />
    </Stack>
  );
}
