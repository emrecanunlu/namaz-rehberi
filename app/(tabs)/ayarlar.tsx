import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { t } from "@/lib/i18n";
import {
  useAppSettings,
  type ThemePreference,
} from "@/lib/settings-context";
import type { Locale } from "@/locales/translations";
import { TURKEY_CITIES, cityDisplayName } from "@/data/cities-tr";
import { fonts } from "@/constants/fonts";

function OptionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 mb-2 rounded-full px-4 py-2 ${
        selected
          ? "bg-forest-700 dark:bg-gold-400"
          : "bg-sand-100 dark:bg-forest-900"
      }`}
    >
      <Text
        className={`text-sm font-semibold ${
          selected
            ? "text-sand-50 dark:text-forest-950"
            : "text-forest-700 dark:text-sand-200"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const {
    locale,
    themePreference,
    setLocale,
    setThemePreference,
    cityId,
    citySource,
    locationGranted,
    setCityManual,
    refreshLocation,
    autoImam,
    setAutoImam,
  } = useAppSettings();
  const [query, setQuery] = useState("");

  const themes: { value: ThemePreference; label: string }[] = [
    { value: "system", label: t("settings.themeSystem") },
    { value: "light", label: t("settings.themeLight") },
    { value: "dark", label: t("settings.themeDark") },
  ];

  const languages: { value: Locale; label: string }[] = [
    { value: "tr", label: t("settings.languageTr") },
    { value: "en", label: t("settings.languageEn") },
  ];

  const filteredCities = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return TURKEY_CITIES;
    return TURKEY_CITIES.filter(
      (c) =>
        c.nameTr.toLocaleLowerCase("tr-TR").includes(q) ||
        c.nameEn.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <ScrollView
      key={locale}
      className="flex-1 bg-sand-50 dark:bg-forest-950"
      contentContainerClassName="px-4 py-5 pb-10"
      keyboardShouldPersistTaps="handled"
    >
      <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-forest-500 dark:text-sand-200">
        {t("settings.appearance")}
      </Text>
      <Text className="mb-3 text-lg font-bold text-forest-900 dark:text-sand-50">
        {t("settings.theme")}
      </Text>
      <View className="mb-8 flex-row flex-wrap">
        {themes.map((item) => (
          <OptionChip
            key={item.value}
            label={item.label}
            selected={themePreference === item.value}
            onPress={() => void setThemePreference(item.value)}
          />
        ))}
      </View>

      <Text className="mb-3 text-lg font-bold text-forest-900 dark:text-sand-50">
        {t("settings.language")}
      </Text>
      <View className="mb-8 flex-row flex-wrap">
        {languages.map((item) => (
          <OptionChip
            key={item.value}
            label={item.label}
            selected={locale === item.value}
            onPress={() => void setLocale(item.value)}
          />
        ))}
      </View>

      <View className="mb-8 flex-row items-center justify-between">
        <View className="mr-4 flex-1">
          <Text className="text-lg font-bold text-forest-900 dark:text-sand-50">
            {t("session.autoImam")}
          </Text>
          <Text
            style={{ fontFamily: fonts.body }}
            className="mt-1 text-sm text-forest-500 dark:text-sand-200"
          >
            {t("session.autoImamHint")}
          </Text>
        </View>
        <Switch
          value={autoImam}
          onValueChange={(v) => void setAutoImam(v)}
          trackColor={{ false: "#cfc6b6", true: "#d4a84b" }}
          thumbColor="#faf8f4"
        />
      </View>

      <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-forest-500 dark:text-sand-200">
        {t("settings.location")}
      </Text>
      <Text className="mb-2 text-lg font-bold text-forest-900 dark:text-sand-50">
        {t("settings.city")}
      </Text>
      <Text
        style={{ fontFamily: fonts.body }}
        className="mb-3 text-sm text-forest-500 dark:text-sand-200"
      >
        {citySource === "manual"
          ? t("settings.cityManual")
          : t("settings.cityAuto")}
        {locationGranted === false ? ` · ${t("settings.locationDenied")}` : ""}
      </Text>

      <Pressable
        onPress={() => void refreshLocation()}
        className="mb-3 self-start rounded-full bg-forest-700 px-4 py-2 active:opacity-80 dark:bg-gold-400"
      >
        <Text
          style={{ fontFamily: fonts.bodySemi }}
          className="text-sm text-sand-50 dark:text-forest-950"
        >
          {t("settings.useLocation")}
        </Text>
      </Pressable>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t("settings.citySearch")}
        placeholderTextColor="#8a9a90"
        className="mb-3 rounded-xl border border-sand-200 bg-white px-4 py-3 text-base text-forest-900 dark:border-forest-700 dark:bg-forest-900 dark:text-sand-50"
      />

      <View className="mb-8 max-h-64 overflow-hidden rounded-2xl border border-sand-200 dark:border-forest-700">
        <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {filteredCities.map((c) => {
            const selected = c.id === cityId;
            return (
              <Pressable
                key={c.id}
                onPress={() => void setCityManual(c.id)}
                className={`border-b border-sand-100 px-4 py-3 dark:border-forest-800 ${
                  selected ? "bg-sand-100 dark:bg-forest-800" : "bg-white dark:bg-forest-900"
                }`}
              >
                <Text
                  style={{ fontFamily: selected ? fonts.bodySemi : fonts.body }}
                  className={
                    selected
                      ? "text-forest-900 dark:text-gold-400"
                      : "text-forest-700 dark:text-sand-100"
                  }
                >
                  {cityDisplayName(c, locale)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Text className="mb-2 text-lg font-bold text-forest-900 dark:text-sand-50">
        {t("settings.about")}
      </Text>
      <Text className="text-sm leading-6 text-forest-500 dark:text-sand-200">
        {t("settings.aboutText")}
      </Text>
    </ScrollView>
  );
}
