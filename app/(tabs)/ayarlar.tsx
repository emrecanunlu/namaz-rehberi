import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Linking, Pressable, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { t } from "@/lib/i18n";
import { useAppSettings, type ThemePreference } from "@/lib/settings-context";
import type { Locale } from "@/locales/translations";
import { cityDisplayName } from "@/data/cities-tr";
import { fonts } from "@/constants/fonts";
import { switchColors, themeColors } from "@/constants/theme";
import { SliverTabScreen } from "@/components/sliver-tab-screen";
import { CityPickerSheet } from "@/components/city-picker-sheet";
import {
  SettingsCheckRow,
  SettingsRow,
  SettingsSection,
  SettingsSegmentRow,
} from "@/components/settings-ui";
import { hapticSelection, hapticSuccess } from "@/lib/haptics";
import { useNotifications } from "@/lib/notifications-context";
import {
  ALARM_SLOTS,
  getScheduledCount,
  LEAD_OPTIONS,
  NOTIFY_SLOTS,
  scheduledDayCount,
  sendTestNotification,
  type LeadMinutes,
} from "@/lib/prayer-notifications";
import { calculatePrayerTimes, formatTime } from "@/lib/prayer-times";
import {
  availableSounds,
  previewSound,
  stopPreview,
  type NotificationSound,
  type SoundKind,
} from "@/lib/notification-sounds";

/** Expo Go özel bildirim seslerini çalamaz */
const IN_EXPO_GO =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export default function SettingsScreen() {
  const {
    locale,
    themePreference,
    setLocale,
    setThemePreference,
    city,
    citySource,
    autoImam,
    setAutoImam,
    resolvedTheme,
  } = useAppSettings();
  const dark = resolvedTheme === "dark";
  const chrome = dark ? themeColors.dark : themeColors.light;
  const switchTheme = switchColors(dark);
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const notifications = useNotifications();
  const notifyPrefs = notifications.prefs;
  const notifyDenied =
    notifications.permission === "denied" && !notifyPrefs.enabled;
  const todayTimes = useMemo(() => calculatePrayerTimes(city), [city]);
  const cityName = cityDisplayName(city, locale);
  const days = scheduledDayCount(notifyPrefs);
  const [scheduledCount, setScheduledCount] = useState<number | null>(null);

  // Sekmeden çıkınca önizleme sesi kesilsin
  useFocusEffect(useCallback(() => stopPreview, []));

  // Geliştirme: kaç bildirimin planlandığını göster (yeniden planlama async)
  useEffect(() => {
    if (!__DEV__ || !notifyPrefs.enabled) return;
    const id = setTimeout(() => {
      void getScheduledCount().then(setScheduledCount);
    }, 800);
    return () => clearTimeout(id);
  }, [notifyPrefs, city, locale]);

  const themes: { value: ThemePreference; label: string }[] = [
    { value: "system", label: t("settings.themeSystem") },
    { value: "light", label: t("settings.themeLight") },
    { value: "dark", label: t("settings.themeDark") },
  ];

  const languages: { value: Locale; label: string }[] = [
    { value: "tr", label: t("settings.languageTr") },
    { value: "en", label: t("settings.languageEn") },
  ];

  const leadOptions: { value: LeadMinutes; label: string }[] =
    LEAD_OPTIONS.map((minutes) => ({
      value: minutes,
      label:
        minutes === 0
          ? t("notifications.leadNone")
          : t("notifications.leadMinutes", { minutes }),
    }));

  const version = Constants.expoConfig?.version ?? "1.0.0";

  const soundOptions = (kind: SoundKind) =>
    availableSounds(kind).map((sound) => ({
      value: sound,
      label: t(`notifications.sounds.${sound}`),
    }));
  const showLeadSound =
    notifyPrefs.leadMinutes > 0 || notifyPrefs.slots.sunrise;

  const anyAlarm = ALARM_SLOTS.some((slot) => notifyPrefs.alarms[slot]);

  const pickSound = (kind: SoundKind, value: NotificationSound) => {
    hapticSelection();
    previewSound(value);
    void notifications.setSound(kind, value);
  };

  return (
    <>
      <SliverTabScreen
        eyebrow={t("tabs.settings")}
        title={t("settings.title")}
        subtitle={t("settings.aboutText")}
        expandedContent={196}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SettingsSection title={t("settings.appearance")}>
          <SettingsSegmentRow
            icon="contrast-outline"
            label={t("settings.theme")}
            options={themes}
            value={themePreference}
            onChange={(value) => {
              hapticSelection();
              void setThemePreference(value);
            }}
          />
          <SettingsSegmentRow
            icon="language-outline"
            label={t("settings.language")}
            options={languages}
            value={locale}
            onChange={(value) => {
              hapticSelection();
              void setLocale(value);
            }}
          />
        </SettingsSection>

        <SettingsSection
          title={t("notifications.section")}
          footer={
            notifyDenied ? (
              <View
                accessibilityLiveRegion="polite"
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingHorizontal: 4,
                }}
              >
                <Ionicons
                  name="notifications-off-outline"
                  size={18}
                  color={chrome.accent}
                />
                <Text
                  style={{
                    flex: 1,
                    fontFamily: fonts.body,
                    fontSize: 13,
                    lineHeight: 18,
                    color: chrome.muted,
                  }}
                >
                  {t("notifications.denied")}
                </Text>
                <Pressable
                  onPress={() => void Linking.openSettings()}
                  accessibilityRole="button"
                  hitSlop={8}
                  className="min-h-[44px] justify-center active:opacity-60"
                >
                  <Text
                    style={{
                      fontFamily: fonts.bodySemi,
                      fontSize: 14,
                      color: chrome.accent,
                    }}
                  >
                    {t("notifications.openSettings")}
                  </Text>
                </Pressable>
              </View>
            ) : notifyPrefs.enabled && days > 0 ? (
              [
                t("notifications.refreshHint", { days }),
                IN_EXPO_GO ? t("notifications.soundHint") : null,
              ]
                .filter(Boolean)
                .join(" ")
            ) : (
              t("notifications.enableHint")
            )
          }
        >
          <SettingsRow
            icon="notifications-outline"
            label={t("notifications.enable")}
            right={
              <Switch
                accessibilityLabel={t("notifications.enable")}
                accessibilityHint={t("notifications.enableHint")}
                value={notifyPrefs.enabled}
                onValueChange={(v) => {
                  hapticSelection();
                  void notifications.setEnabled(v).then((ok) => {
                    if (ok && v) hapticSuccess();
                  });
                }}
                trackColor={switchTheme.track}
                thumbColor={switchTheme.thumb}
              />
            }
          />
          {notifyPrefs.enabled
            ? NOTIFY_SLOTS.map((slot) => (
                <SettingsCheckRow
                  key={slot}
                  label={t(`prayerTimes.${slot}`)}
                  value={formatTime(todayTimes[slot], locale)}
                  checked={notifyPrefs.slots[slot]}
                  onPress={() => {
                    hapticSelection();
                    void notifications.toggleSlot(slot);
                  }}
                />
              ))
            : null}
          {__DEV__ && notifyPrefs.enabled ? (
            <SettingsRow
              icon="flask-outline"
              label="Test bildirimi (5 / 12 sn)"
              hint={
                scheduledCount != null
                  ? `Planlı bildirim: ${scheduledCount}`
                  : undefined
              }
              chevron
              onPress={() => {
                hapticSuccess();
                void sendTestNotification(city, notifyPrefs, locale).then(() =>
                  getScheduledCount().then(setScheduledCount),
                );
              }}
            />
          ) : null}
          {notifyPrefs.enabled ? (
            <SettingsSegmentRow
              icon="time-outline"
              label={t("notifications.lead")}
              options={leadOptions}
              value={notifyPrefs.leadMinutes}
              onChange={(value) => {
                hapticSelection();
                void notifications.setLeadMinutes(value);
              }}
            />
          ) : null}
          {notifyPrefs.enabled ? (
            <SettingsSegmentRow
              icon="volume-high-outline"
              label={t("notifications.atSound")}
              options={soundOptions("at")}
              value={notifyPrefs.atSound}
              onChange={(value) => pickSound("at", value)}
            />
          ) : null}
          {notifyPrefs.enabled && showLeadSound ? (
            <SettingsSegmentRow
              icon="musical-note-outline"
              label={t("notifications.leadSound")}
              options={soundOptions("lead")}
              value={notifyPrefs.leadSound}
              onChange={(value) => pickSound("lead", value)}
            />
          ) : null}
        </SettingsSection>

        {notifyPrefs.enabled ? (
          <SettingsSection
            title={t("notifications.alarmSection")}
            footer={t(
              notifications.alarmAuth === "authorized"
                ? "notifications.alarmFooterNative"
                : notifications.alarmAuth === "denied"
                  ? "notifications.alarmFooterDenied"
                  : "notifications.alarmFooter",
            )}
          >
            {ALARM_SLOTS.map((slot) => (
              <SettingsCheckRow
                key={slot}
                label={t(`prayerTimes.${slot}`)}
                value={formatTime(todayTimes[slot], locale)}
                checked={notifyPrefs.alarms[slot]}
                onPress={() => {
                  hapticSelection();
                  void notifications.toggleAlarm(slot);
                }}
              />
            ))}
            {anyAlarm ? (
              <SettingsSegmentRow
                icon="alarm-outline"
                label={t("notifications.alarmSound")}
                options={soundOptions("alarm")}
                value={notifyPrefs.alarmSound}
                onChange={(value) => pickSound("alarm", value)}
              />
            ) : null}
          </SettingsSection>
        ) : null}

        <SettingsSection
          title={t("settings.location")}
          footer={t("prayerTimes.methodHint")}
        >
          <SettingsRow
            icon="location-outline"
            label={t("settings.city")}
            hint={
              citySource === "manual"
                ? t("settings.cityManual")
                : t("settings.cityAuto")
            }
            value={cityName}
            chevron
            onPress={() => setCitySheetOpen(true)}
            accessibilityLabel={t("common.changeCity", { city: cityName })}
          />
        </SettingsSection>

        <SettingsSection
          title={t("settings.sessionSection")}
          footer={t("session.autoImamHint")}
        >
          <SettingsRow
            icon="mic-outline"
            label={t("session.autoImam")}
            right={
              <Switch
                accessibilityLabel={t("session.autoImam")}
                accessibilityHint={t("session.autoImamHint")}
                value={autoImam}
                onValueChange={(v) => {
                  hapticSelection();
                  void setAutoImam(v);
                }}
                trackColor={switchTheme.track}
                thumbColor={switchTheme.thumb}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title={t("settings.about")}>
          <SettingsRow
            icon="information-circle-outline"
            label={t("appName")}
            value={`${t("settings.version")} ${version}`}
          />
        </SettingsSection>
      </SliverTabScreen>

      <CityPickerSheet
        visible={citySheetOpen}
        onClose={() => setCitySheetOpen(false)}
      />
    </>
  );
}
