import "../global.css";
import "react-native-gesture-handler";

import { useEffect, useMemo, useRef } from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  Stack,
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
  router,
  type ErrorBoundaryProps,
} from "expo-router";
import * as Notifications from "expo-notifications";

import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { OnboardingProvider, useOnboarding } from "@/lib/onboarding-context";
import { AppSettingsProvider, useAppSettings } from "@/lib/settings-context";
import { PrayerLogProvider } from "@/lib/prayer-log-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { IslandProvider } from "@/lib/island/island-context";

import { fontAssets } from "@/constants/fonts";
import { pageBackground } from "@/constants/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * Beklenmedik hata ekranı — provider'ların dışında render edilir,
 * bu yüzden yalnız sistem temasına bakar.
 */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  const dark = useColorScheme() === "dark";
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        backgroundColor: pageBackground(dark),
      }}
    >
      <Text
        accessibilityRole="header"
        style={{
          fontSize: 22,
          fontWeight: "700",
          textAlign: "center",
          color: dark ? "#f3efe6" : "#1a2f25",
        }}
      >
        Bir şeyler ters gitti
      </Text>
      <Text
        style={{
          marginTop: 10,
          fontSize: 15,
          lineHeight: 22,
          textAlign: "center",
          color: dark ? "rgba(221,210,188,0.75)" : "rgba(42,74,57,0.85)",
        }}
      >
        Something went wrong. Uygulamayı yeniden yüklemeyi dene.
      </Text>
      <Pressable
        onPress={() => void retry()}
        accessibilityRole="button"
        style={{
          marginTop: 24,
          minHeight: 48,
          paddingHorizontal: 28,
          borderRadius: 999,
          justifyContent: "center",
          backgroundColor: dark ? "#d4a84b" : "#2a4a39",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: dark ? "#0f1a15" : "#f3efe6",
          }}
        >
          Tekrar dene · Retry
        </Text>
      </Pressable>
    </View>
  );
}

/** Vakit bildirimine dokununca ilgili namaz oturumunu aç */
function useNotificationNavigation(enabled: boolean) {
  const response = Notifications.useLastNotificationResponse();
  const handledId = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !response) return;
    const id = response.notification.request.identifier;
    if (handledId.current === id) return;
    handledId.current = id;
    const url = response.notification.request.content.data?.url;
    if (typeof url === "string" && url.startsWith("/")) {
      router.push(url as never);
    }
    void Notifications.clearLastNotificationResponseAsync();
  }, [enabled, response]);
}

function RootNavigator() {
  const { ready: onboardingReady, seenOnboarding } = useOnboarding();
  const { ready: settingsReady, resolvedTheme } = useAppSettings();

  const [fontsLoaded, fontError] = useFonts(fontAssets);

  const ready =
    onboardingReady && settingsReady && (fontsLoaded || Boolean(fontError));

  useNotificationNavigation(ready && seenOnboarding);

  const backgroundColor = pageBackground(resolvedTheme === "dark");

  const navigationTheme = useMemo(() => {
    const base = resolvedTheme === "dark" ? DarkTheme : DefaultTheme;

    return {
      ...base,
      dark: resolvedTheme === "dark",
      colors: {
        ...base.colors,
        background: backgroundColor,
        card: backgroundColor,
        border:
          resolvedTheme === "dark"
            ? "rgba(42,74,57,0.45)"
            : "rgba(230,220,200,0.9)",
        primary: resolvedTheme === "dark" ? "#d4a84b" : "#2a4a39",
        text: resolvedTheme === "dark" ? "#f3efe6" : "#1a2f25",
      },
    };
  }, [backgroundColor, resolvedTheme]);

  useEffect(() => {
    if (!ready) return;

    void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) {
    return <View className="flex-1 bg-forest-900" />;
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor,
          },
          animation: "slide_from_right",
          animationDuration: 300,
          gestureEnabled: true,
        }}
      >
        <Stack.Protected guard={!seenOnboarding}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        <Stack.Protected guard={seenOnboarding}>
          <Stack.Screen name="(tabs)" />

          {/* Normal yığın ekranları: sağdan gelir, kenardan kaydırıp geri dönülür */}
          <Stack.Screen name="namaza-basla/[id]/index" />
          <Stack.Screen name="namaza-basla/[id]/[section]" />
          <Stack.Screen name="kible" />
          <Stack.Screen name="ada" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppSettingsProvider>
        <OnboardingProvider>
          <PrayerLogProvider>
            <IslandProvider>
              <NotificationsProvider>
                <RootNavigator />
              </NotificationsProvider>
            </IslandProvider>
          </PrayerLogProvider>
        </OnboardingProvider>
      </AppSettingsProvider>
    </GestureHandlerRootView>
  );
}
