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
import {
  DEFAULT_CITY_ID,
  getCityById,
  TURKEY_CITIES,
  type CitySource,
  type TurkeyCity,
} from "@/data/cities-tr";
import { resolveCityFromDevice } from "@/lib/location";

export type ThemePreference = "system" | "light" | "dark";

const THEME_KEY = "namaz_rehberi_theme";
const LOCALE_KEY = "namaz_rehberi_locale";
const CITY_ID_KEY = "namaz_rehberi_city_id";
const CITY_SOURCE_KEY = "namaz_rehberi_city_source";
const AUTO_IMAM_KEY = "namaz_rehberi_auto_imam";

type AppSettingsContextValue = {
  ready: boolean;
  themePreference: ThemePreference;
  resolvedTheme: "light" | "dark";
  locale: Locale;
  cityId: string;
  city: TurkeyCity;
  citySource: CitySource;
  locationGranted: boolean | null;
  autoImam: boolean;
  setThemePreference: (value: ThemePreference) => Promise<void>;
  setLocale: (value: Locale) => Promise<void>;
  setCityManual: (cityId: string) => Promise<void>;
  refreshLocation: () => Promise<void>;
  setAutoImam: (value: boolean) => Promise<void>;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [ready, setReady] = useState(false);
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");
  const [locale, setLocaleState] = useState<Locale>("tr");
  const [cityId, setCityIdState] = useState(DEFAULT_CITY_ID);
  const [citySource, setCitySourceState] = useState<CitySource>("auto");
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const [autoImam, setAutoImamState] = useState(false);
  const [, setTick] = useState(0);

  const resolvedTheme: "light" | "dark" =
    themePreference === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : themePreference;

  const city = useMemo(() => getCityById(cityId), [cityId]);

  useEffect(() => {
    let active = true;

    async function load() {
      const [themeValue, localeValue, storedCityId, storedSource, autoImamValue] =
        await Promise.all([
          AsyncStorage.getItem(THEME_KEY),
          AsyncStorage.getItem(LOCALE_KEY),
          AsyncStorage.getItem(CITY_ID_KEY),
          AsyncStorage.getItem(CITY_SOURCE_KEY),
          AsyncStorage.getItem(AUTO_IMAM_KEY),
        ]);
      if (!active) return;

      const nextTheme =
        themeValue === "light" ||
        themeValue === "dark" ||
        themeValue === "system"
          ? themeValue
          : "system";
      const nextLocale =
        localeValue === "en" || localeValue === "tr"
          ? localeValue
          : deviceLocale();

      setThemePreferenceState(nextTheme);
      setLocaleState(nextLocale);
      setI18nLocale(nextLocale);
      setAutoImamState(autoImamValue === "1");

      const source: CitySource =
        storedSource === "manual" || storedSource === "auto"
          ? storedSource
          : "auto";
      const validStoredCity =
        storedCityId && TURKEY_CITIES.some((c) => c.id === storedCityId)
          ? storedCityId
          : null;

      if (source === "manual" && validStoredCity) {
        setCityIdState(validStoredCity);
        setCitySourceState("manual");
        setReady(true);
        return;
      }

      // auto: konumdan il bul; yoksa kayıtlı veya İstanbul
      const { city: detected, granted } = await resolveCityFromDevice();
      if (!active) return;
      setLocationGranted(granted);
      const nextCityId = granted
        ? detected.id
        : (validStoredCity ?? DEFAULT_CITY_ID);
      setCityIdState(nextCityId);
      setCitySourceState("auto");
      await AsyncStorage.multiSet([
        [CITY_ID_KEY, nextCityId],
        [CITY_SOURCE_KEY, "auto"],
      ]);
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

  const setCityManual = useCallback(async (nextId: string) => {
    const next = getCityById(nextId);
    setCityIdState(next.id);
    setCitySourceState("manual");
    await AsyncStorage.multiSet([
      [CITY_ID_KEY, next.id],
      [CITY_SOURCE_KEY, "manual"],
    ]);
  }, []);

  const refreshLocation = useCallback(async () => {
    const { city: detected, granted } = await resolveCityFromDevice();
    setLocationGranted(granted);
    setCityIdState(detected.id);
    setCitySourceState("auto");
    await AsyncStorage.multiSet([
      [CITY_ID_KEY, detected.id],
      [CITY_SOURCE_KEY, "auto"],
    ]);
  }, []);

  const setAutoImam = useCallback(async (value: boolean) => {
    setAutoImamState(value);
    await AsyncStorage.setItem(AUTO_IMAM_KEY, value ? "1" : "0");
  }, []);

  const value = useMemo(
    () => ({
      ready,
      themePreference,
      resolvedTheme,
      locale,
      cityId,
      city,
      citySource,
      locationGranted,
      autoImam,
      setThemePreference,
      setLocale,
      setCityManual,
      refreshLocation,
      setAutoImam,
    }),
    [
      ready,
      themePreference,
      resolvedTheme,
      locale,
      cityId,
      city,
      citySource,
      locationGranted,
      autoImam,
      setThemePreference,
      setLocale,
      setCityManual,
      refreshLocation,
      setAutoImam,
    ],
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
