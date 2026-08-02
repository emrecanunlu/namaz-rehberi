import "../global.css";
import "react-native-gesture-handler";
import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  OnboardingProvider,
  useOnboarding,
} from "@/lib/onboarding-context";
import { AppSettingsProvider, useAppSettings } from "@/lib/settings-context";
import { fontAssets } from "@/constants/fonts";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const { ready: onboardingReady, seenOnboarding } = useOnboarding();
  const { ready: settingsReady, resolvedTheme } = useAppSettings();
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  const ready =
    onboardingReady && settingsReady && (fontsLoaded || Boolean(fontError));

  useEffect(() => {
    if (!ready) return;
    void SplashScreen.hideAsync();
  }, [ready]);

  // Splash açık kalsın — hazır olmadan Stack render etme (flash yok)
  if (!ready) {
    return <View className="flex-1 bg-forest-900" />;
  }

  return (
    <>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 280,
        }}
      >
        <Stack.Protected guard={!seenOnboarding}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        <Stack.Protected guard={seenOnboarding}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppSettingsProvider>
      <OnboardingProvider>
        <RootNavigator />
      </OnboardingProvider>
    </AppSettingsProvider>
  );
}
