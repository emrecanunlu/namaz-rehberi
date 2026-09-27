import { useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { t } from "@/lib/i18n";
import { useAppSettings, type ThemePreference } from "@/lib/settings-context";
import type { Locale } from "@/locales/translations";
import { cityDisplayName } from "@/data/cities-tr";
import { fonts } from "@/constants/fonts";
import { SliverTabScreen } from "@/components/sliver-tab-screen";
import { CityPickerSheet } from "@/components/city-picker-sheet";
import { hapticSelection } from "@/lib/haptics";
import { switchColors, themeColors } from "@/constants/theme";

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
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      className={`mb-2 mr-2 min-h-[44px] justify-center px-4 active:opacity-70 ${
        selected
          ? "bg-forest-700 dark:bg-gold-400"
          : "bg-sand-100 dark:bg-forest-900"
      }`}
    >
      <Text
        style={{ fontFamily: fonts.bodySemi }}
        className={`text-sm ${
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
    city,
    autoImam,
    setAutoImam,
    resolvedTheme,
  } = useAppSettings();
  const chrome = resolvedTheme === "dark" ? themeColors.dark : themeColors.light;
  const [citySheetOpen, setCitySheetOpen] = useState(false);

  const themes: { value: ThemePreference; label: string }[] = [
    { value: "system", label: t("settings.themeSystem") },
    { value: "light", label: t("settings.themeLight") },
    { value: "dark", label: t("settings.themeDark") },
  ];

  const languages: { value: Locale; label: string }[] = [
    { value: "tr", label: t("settings.languageTr") },
    { value: "en", label: t("settings.languageEn") },
  ];

  const cityName = cityDisplayName(city, locale);

  return (
    <>
      <SliverTabScreen
        eyebrow={t("tabs.settings")}
        title={t("settings.title")}
        subtitle={t("settings.aboutText")}
        compactSubtitle={t("tabs.settings")}
        expandedContent={168}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{ fontFamily: fonts.bodyMedium }}
          className="mb-2 text-[12px] uppercase tracking-[1.6px] text-forest-500 dark:text-gold-400/80"
        >
          {t("settings.appearance")}
        </Text>
        <Text
          style={{ fontFamily: fonts.displayBold }}
          className="mb-3 text-xl text-forest-900 dark:text-sand-50"
        >
          {t("settings.theme")}
        </Text>
        <View accessibilityRole="radiogroup" className="mb-8 flex-row flex-wrap">
          {themes.map((item) => (
            <OptionChip
              key={item.value}
              label={item.label}
              selected={themePreference === item.value}
              onPress={() => {
                hapticSelection();
                void setThemePreference(item.value);
              }}
            />
          ))}
        </View>

        <Text
          style={{ fontFamily: fonts.displayBold }}
          className="mb-3 text-xl text-forest-900 dark:text-sand-50"
        >
          {t("settings.language")}
        </Text>
        <View accessibilityRole="radiogroup" className="mb-8 flex-row flex-wrap">
          {languages.map((item) => (
            <OptionChip
              key={item.value}
              label={item.label}
              selected={locale === item.value}
              onPress={() => {
                hapticSelection();
                void setLocale(item.value);
              }}
            />
          ))}
        </View>

        <View className="mb-8 flex-row items-center justify-between border border-sand-200/80 bg-sand-50 px-4 py-4 dark:border-forest-700 dark:bg-forest-900">
          <View className="mr-4 flex-1">
            <Text
              style={{ fontFamily: fonts.bodySemi }}
              className="text-base text-forest-900 dark:text-sand-50"
            >
              {t("session.autoImam")}
            </Text>
            <Text
              style={{ fontFamily: fonts.body }}
              className="mt-1 text-sm text-forest-500 dark:text-sand-200/70"
            >
              {t("session.autoImamHint")}
            </Text>
          </View>
          <Switch
            accessibilityLabel={t("session.autoImam")}
            accessibilityHint={t("session.autoImamHint")}
            value={autoImam}
            onValueChange={(v) => {
              hapticSelection();
              void setAutoImam(v);
            }}
            trackColor={switchColors(resolvedTheme === "dark").track}
            thumbColor={switchColors(resolvedTheme === "dark").thumb}
          />
        </View>

        <Text
          style={{ fontFamily: fonts.bodyMedium }}
          className="mb-2 text-[12px] uppercase tracking-[1.6px] text-forest-500 dark:text-gold-400/80"
        >
          {t("settings.location")}
        </Text>
        <Text
          style={{ fontFamily: fonts.displayBold }}
          className="mb-3 text-xl text-forest-900 dark:text-sand-50"
        >
          {t("settings.city")}
        </Text>

        <Pressable
          onPress={() => setCitySheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={t("common.changeCity", { city: cityName })}
          className="mb-8 flex-row items-center border border-sand-200/80 bg-sand-50 px-4 py-4 active:opacity-80 dark:border-forest-700 dark:bg-forest-900"
        >
          <View className="mr-3 h-10 w-10 items-center justify-center bg-forest-100 dark:bg-forest-800">
            <Ionicons name="location-outline" size={20} color={chrome.tint} />
          </View>
          <Text
            style={{ fontFamily: fonts.bodySemi }}
            className="flex-1 text-base text-forest-900 dark:text-sand-50"
          >
            {cityName}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={chrome.muted} />
        </Pressable>

        <Text
          style={{ fontFamily: fonts.displayBold }}
          className="mb-2 text-xl text-forest-900 dark:text-sand-50"
        >
          {t("settings.about")}
        </Text>
        <Text
          style={{ fontFamily: fonts.body }}
          className="text-sm leading-6 text-forest-500 dark:text-sand-200/70"
        >
          {t("settings.aboutText")}
        </Text>
      </SliverTabScreen>

      <CityPickerSheet
        visible={citySheetOpen}
        onClose={() => setCitySheetOpen(false)}
      />
    </>
  );
}
