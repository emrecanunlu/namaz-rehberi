import { Link, router } from "expo-router";
import { useMemo, useState, useEffect } from "react";
import { Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { bannerForTheme } from "@/constants/images";
import { PRAYER_GUIDES, getPrayerName, getPrayerSummary } from "@/data/content";
import { t } from "@/lib/i18n";
import { fonts } from "@/constants/fonts";
import { cardShadow, themeColors } from "@/constants/theme";
import { useAppSettings } from "@/lib/settings-context";
import { SliverTabScreen } from "@/components/sliver-tab-screen";
import { hapticMedium } from "@/lib/haptics";
import {
  calculatePrayerTimes,
  getActiveGuideId,
  getNextPrayer,
} from "@/lib/prayer-times";

export default function NamazListScreen() {
  const { resolvedTheme, city } = useAppSettings();
  const dark = resolvedTheme === "dark";
  const chrome = dark ? themeColors.dark : themeColors.light;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const times = useMemo(() => calculatePrayerTimes(city), [city]);
  const tomorrowTimes = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return calculatePrayerTimes(city, d);
  }, [city]);
  const next = useMemo(
    () => getNextPrayer(times, now, tomorrowTimes.fajr),
    [times, tomorrowTimes.fajr, now],
  );
  const guideId = useMemo(
    () => getActiveGuideId(times, now, next),
    [times, now, next],
  );
  const guideName = getPrayerName(guideId);

  return (
    <SliverTabScreen
      image={bannerForTheme("namazBanner", dark)}
      eyebrow={t("tabs.prayer")}
      title={t("prayer.guideTitle")}
      subtitle={t("prayer.intro")}
      compactSubtitle={t("tabs.prayer")}
      expandedContent={200}
      contentContainerStyle={{ paddingHorizontal: 12 }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t("prayer.startSession")}: ${guideName}`}
        onPress={() => {
          hapticMedium();
          router.push(`/namaza-basla/${guideId}`);
        }}
        android_ripple={{ color: "rgba(42,74,57,0.12)" }}
        style={({ pressed }) => ({
          opacity: pressed ? 0.85 : 1,
          marginTop: 16,
          marginBottom: 18,
          backgroundColor: chrome.surface,
          ...cardShadow(dark),
        })}
        className="px-3.5 py-4"
      >
        <Text
          style={{ fontFamily: fonts.bodySemi }}
          className="text-[11px] uppercase tracking-[1.8px] text-gold-600 dark:text-gold-400"
        >
          {t("prayer.startSession")}
        </Text>
        <Text
          style={{ fontFamily: fonts.displayBold }}
          className="mt-1.5 text-[22px] text-forest-900 dark:text-sand-50"
        >
          {guideName}
        </Text>
        <Text
          style={{ fontFamily: fonts.body }}
          className="mt-1 text-[13px] leading-5 text-forest-500 dark:text-sand-200/65"
        >
          {t("prayer.startSessionHint", { prayer: guideName })}
        </Text>
        <View className="mt-3 flex-row items-center">
          <Ionicons name="play-circle-outline" size={18} color={chrome.tint} />
          <Text
            style={{ fontFamily: fonts.bodySemi }}
            className="ml-1.5 text-[14px] text-forest-800 dark:text-gold-400"
          >
            {t("home.startPrayerCta")} →
          </Text>
        </View>
      </Pressable>

      <View>
        {PRAYER_GUIDES.map((prayer) => (
          <View
            key={prayer.id}
            style={{
              marginBottom: 14,
              backgroundColor: chrome.surface,
              ...cardShadow(dark),
            }}
          >
            <Link href={`/namaz/${prayer.id}`} asChild>
              <Pressable
                accessibilityRole="link"
                android_ripple={{ color: "rgba(42,74,57,0.12)" }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.78 : 1,
                })}
                className="flex-row items-center px-3.5 py-4"
              >
                <View className="mr-4 h-12 w-12 items-center justify-center bg-forest-100 dark:bg-forest-800">
                  <Text
                    style={{ fontFamily: fonts.displayBold }}
                    className="text-lg text-forest-700 dark:text-gold-400"
                  >
                    {prayer.rakats}
                  </Text>
                </View>
                <View className="flex-1 pr-2">
                  <Text
                    style={{ fontFamily: fonts.bodySemi, lineHeight: 22 }}
                    className="text-[16px] text-forest-900 dark:text-sand-50"
                  >
                    {getPrayerName(prayer.id)}
                  </Text>
                  <Text
                    style={{ fontFamily: fonts.body, lineHeight: 20 }}
                    className="mt-1.5 text-[13px] text-forest-500 dark:text-sand-200/65"
                  >
                    {getPrayerSummary(prayer.id)}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={chrome.muted}
                />
              </Pressable>
            </Link>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t("prayer.startThis")}: ${getPrayerName(prayer.id)}`}
              onPress={() => {
                hapticMedium();
                router.push(`/namaza-basla/${prayer.id}`);
              }}
              android_ripple={{ color: "rgba(42,74,57,0.1)" }}
              className="min-h-[44px] flex-row items-center border-t border-sand-200/70 px-3.5 py-3 active:opacity-70 dark:border-forest-800"
            >
              <Ionicons name="play" size={16} color={chrome.tint} />
              <Text
                style={{ fontFamily: fonts.bodySemi }}
                className="ml-2 text-[13px] text-forest-800 dark:text-gold-400"
              >
                {t("prayer.startThis")}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </SliverTabScreen>
  );
}
