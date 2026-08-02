import { Pressable, ScrollView, Text, View } from "react-native";
import { t } from "@/lib/i18n";
import {
  useAppSettings,
  type ThemePreference,
} from "@/lib/settings-context";
import type { Locale } from "@/locales/translations";

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
  } = useAppSettings();

  const themes: { value: ThemePreference; label: string }[] = [
    { value: "system", label: t("settings.themeSystem") },
    { value: "light", label: t("settings.themeLight") },
    { value: "dark", label: t("settings.themeDark") },
  ];

  const languages: { value: Locale; label: string }[] = [
    { value: "tr", label: t("settings.languageTr") },
    { value: "en", label: t("settings.languageEn") },
  ];

  return (
    <ScrollView
      key={locale}
      className="flex-1 bg-sand-50 dark:bg-forest-950"
      contentContainerClassName="px-4 py-5 pb-10"
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

      <Text className="mb-2 text-lg font-bold text-forest-900 dark:text-sand-50">
        {t("settings.about")}
      </Text>
      <Text className="text-sm leading-6 text-forest-500 dark:text-sand-200">
        {t("settings.aboutText")}
      </Text>
    </ScrollView>
  );
}
