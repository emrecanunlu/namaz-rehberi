import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import * as SystemUI from "expo-system-ui";
import { deviceLocale, setI18nLocale } from "@/lib/i18n";
import type { Locale } from "@/locales/translations";

export type ThemePreference = "system" | "light" | "dark";

const THEME_KEY = "namaz_rehberi_theme";
const LOCALE_KEY = "namaz_rehberi_locale";

type AppSettingsContextValue = {
  ready: boolean;
  themePreference: ThemePreference;
  resolvedTheme: "light" | "dark";
  locale: Locale;
  setThemePreference: (value: ThemePreference) => Promise<void>;
  setLocale: (value: Locale) => Promise<void>;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [ready, setReady] = useState(false);
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");
  const [locale, setLocaleState] = useState<Locale>("tr");
  const [, setTick] = useState(0);

  const resolvedTheme: "light" | "dark" =
    themePreference === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : themePreference;

  useEffect(() => {
    let active = true;

    async function load() {
      const [themeValue, localeValue] = await Promise.all([
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(LOCALE_KEY),
      ]);
      if (!active) return;

      const nextTheme =
        themeValue === "light" || themeValue === "dark" || themeValue === "system"
          ? themeValue
          : "system";
      const nextLocale =
        localeValue === "en" || localeValue === "tr"
          ? localeValue
          : deviceLocale();

      setThemePreferenceState(nextTheme);
      setLocaleState(nextLocale);
      setI18nLocale(nextLocale);
      setReady(true);
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    setColorScheme(themePreference === "system" ? "system" : themePreference);
    void SystemUI.setBackgroundColorAsync(
      resolvedTheme === "dark" ? "#0f1a15" : "#faf8f4",
    );
  }, [ready, themePreference, resolvedTheme, setColorScheme]);

  const setThemePreference = useCallback(async (value: ThemePreference) => {
    setThemePreferenceState(value);
    await AsyncStorage.setItem(THEME_KEY, value);
  }, []);

  const setLocale = useCallback(async (value: Locale) => {
    setLocaleState(value);
    setI18nLocale(value);
    setTick((n) => n + 1);
    await AsyncStorage.setItem(LOCALE_KEY, value);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      themePreference,
      resolvedTheme,
      locale,
      setThemePreference,
      setLocale,
    }),
    [ready, themePreference, resolvedTheme, locale, setThemePreference, setLocale],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return context;
}
