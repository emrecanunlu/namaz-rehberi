import "../global.css";
import "react-native-gesture-handler";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  OnboardingProvider,
  useOnboarding,
} from "@/lib/onboarding-context";
import { AppSettingsProvider, useAppSettings } from "@/lib/settings-context";
import { PrayerLogProvider } from "@/lib/prayer-log-context";
import { fontAssets } from "@/constants/fonts";
import { pageBackground } from "@/constants/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const { ready: onboardingReady, seenOnboarding } = useOnboarding();
  const { ready: settingsReady, resolvedTheme } = useAppSettings();
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  const ready =
    onboardingReady && settingsReady && (fontsLoaded || Boolean(fontError));

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
          contentStyle: { backgroundColor },
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
          <Stack.Screen
            name="namaza-basla/[id]"
            options={{
              presentation: "fullScreenModal",
              animation: "slide_from_bottom",
              gestureEnabled: true,
            }}
          />
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
            <RootNavigator />
          </PrayerLogProvider>
        </OnboardingProvider>
      </AppSettingsProvider>
    </GestureHandlerRootView>
  );
}
