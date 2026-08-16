import { useEffect, useMemo, useRef, useState } from "react";
import { Link, router } from "expo-router";
import {
  Animated,
  Easing,
  ImageBackground,
  Text,
  View,
  Pressable,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bannerForTheme } from "@/constants/images";
import { getDuaText, getTodaysDua, getPrayerName } from "@/data/content";
import { cityDisplayName } from "@/data/cities-tr";
import { formatDate, t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";
import { fonts } from "@/constants/fonts";
import {
  heroOverlayColors,
  pageBackground,
  pageFadeColors,
  themeColors,
} from "@/constants/theme";
import { ArabicListenButton } from "@/components/arabic-listen-button";
import { DuaBody } from "@/components/dua-body";
import { CityPickerSheet } from "@/components/city-picker-sheet";
import {
  calculatePrayerTimes,
  formatTime,
  getActiveGuideId,
  getNextPrayer,
  getRemainingParts,
  pad2,
  PRAYER_SLOT_ORDER,
  type PrayerSlotId,
} from "@/lib/prayer-times";
import { hapticMedium, hapticSelection } from "@/lib/haptics";

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const tickEase = Easing.bezier(0.33, 1, 0.68, 1);
/** Collapsed bar (safe area hariç) — iki satır için */
const COLLAPSED_CONTENT = 64;
/** Expanded hero (safe area hariç) — countdown + alt dissolve payı */
const EXPANDED_CONTENT = 248;

function AnimatedDigit({ digit, color }: { digit: string; color: string }) {
  const anim = useRef(new Animated.Value(1)).current;
  const prev = useRef(digit);

  useEffect(() => {
    if (prev.current === digit) return;
    prev.current = digit;
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      easing: tickEase,
      useNativeDriver: true,
    }).start();
  }, [digit, anim]);

  return (
    <View style={{ height: 46, overflow: "hidden", justifyContent: "center" }}>
      <Animated.Text
        style={{
          fontFamily: fonts.displayBold,
          fontSize: 38,
          lineHeight: 42,
          color,
          textAlign: "center",
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        }}
      >
        {digit}
      </Animated.Text>
    </View>
  );
}

function CountdownUnit({
  value,
  label,
  color,
  muted,
}: {
  value: string;
  label: string;
  color: string;
  muted: string;
}) {
  return (
    <View style={{ minWidth: 64, alignItems: "center" }}>
      <View style={{ flexDirection: "row" }}>
        {value.split("").map((digit, i) => (
          <AnimatedDigit key={i} digit={digit} color={color} />
        ))}
      </View>
      <Text
        style={{
          fontFamily: fonts.body,
          marginTop: 4,
          fontSize: 11,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: muted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { locale, city, resolvedTheme } = useAppSettings();
  const dark = resolvedTheme === "dark";
  const pageBg = pageBackground(dark);
  const pageBgFade = pageFadeColors(dark);
  const overlay = heroOverlayColors(dark);
  const chrome = dark ? themeColors.dark : themeColors.light;
  const dua = getTodaysDua();
  const duaText = getDuaText(dua.id);
  const dateLabel = formatDate(new Date(), locale);
  const cityName = cityDisplayName(city, locale);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [now, setNow] = useState(() => new Date());
  const [citySheetOpen, setCitySheetOpen] = useState(false);

  const expandedHeight = insets.top + EXPANDED_CONTENT;
  const collapseRange = EXPANDED_CONTENT - COLLAPSED_CONTENT;

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

  const remaining = useMemo(
    () => (next ? getRemainingParts(next.at, now) : null),
    [next, now],
  );

  const guideId = useMemo(
    () => getActiveGuideId(times, now, next),
    [times, now, next],
  );
  const guideName = getPrayerName(guideId);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fade.setValue(0);
    scrollY.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 480,
      easing: ease,
      useNativeDriver: true,
    }).start();
  }, [fade, scrollY, locale, city.id]);

  // Hero yukarı kayar; toolbar ayrı sabit katmanda
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, collapseRange],
    outputRange: [0, -collapseRange],
    extrapolate: "clamp",
  });

  const flexibleOpacity = scrollY.interpolate({
    inputRange: [0, collapseRange * 0.45, collapseRange],
    outputRange: [1, 0.35, 0],
    extrapolate: "clamp",
  });

  const compactOpacity = scrollY.interpolate({
    inputRange: [collapseRange * 0.55, collapseRange],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Expanded’da tek satır optik ortada; collapsed’da iki satır blok
  const titleBlockShift = scrollY.interpolate({
    inputRange: [collapseRange * 0.55, collapseRange],
    outputRange: [7, 0],
    extrapolate: "clamp",
  });

  const compactSlide = scrollY.interpolate({
    inputRange: [collapseRange * 0.55, collapseRange],
    outputRange: [-4, 0],
    extrapolate: "clamp",
  });

  const barBgOpacity = scrollY.interpolate({
    inputRange: [0, collapseRange * 0.7, collapseRange],
    outputRange: [0, 0.45, 0.88],
    extrapolate: "clamp",
  });

  const nextLabel = next
    ? next.isTomorrow
      ? t("home.tomorrowFajr")
      : t(`prayerTimes.${next.id}` as `prayerTimes.${PrayerSlotId}`)
    : "";

  return (
    <View className="flex-1" style={{ backgroundColor: pageBg }}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />

      {/* Collapsing hero */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: expandedHeight,
          zIndex: 10,
          overflow: "hidden",
          transform: [{ translateY: headerTranslate }],
        }}
      >
        <ImageBackground
          source={bannerForTheme("homeHero", dark)}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[...overlay]}
            locations={[0, 0.5, 1]}
            style={{
              flex: 1,
              paddingTop: insets.top + COLLAPSED_CONTENT,
            }}
          >
            <LinearGradient
              pointerEvents="none"
              colors={[...pageBgFade]}
              locations={[0, 0.45, 1]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 28,
              }}
            />

            <Animated.View
              style={{
                flex: 1,
                paddingHorizontal: 20,
                paddingTop: 4,
                paddingBottom: 22,
                justifyContent: "flex-start",
                opacity: flexibleOpacity,
              }}
            >
              {next && remaining ? (
                <View>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 13,
                      color: chrome.heroSubtitle,
                    }}
                  >
                    {t("home.nextPrayer")}
                  </Text>
                  <View
                    style={{
                      marginTop: 2,
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fonts.displayBold,
                        fontSize: 26,
                        color: chrome.heroTitle,
                      }}
                    >
                      {nextLabel}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.body,
                        fontSize: 15,
                        color: chrome.heroEyebrow,
                      }}
                    >
                      {formatTime(next.at, locale)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      marginTop: 10,
                      fontSize: 11,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: chrome.heroSubtitle,
                    }}
                  >
                    {t("home.untilPrayer")}
                  </Text>
                  <View
                    style={{
                      marginTop: 6,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 2,
                    }}
                  >
                    <CountdownUnit
                      value={pad2(remaining.hours)}
                      label={t("home.hoursShort")}
                      color={chrome.heroTitle}
                      muted={chrome.heroSubtitle}
                    />
                    <Text
                      style={{
                        fontFamily: fonts.displayBold,
                        fontSize: 26,
                        color: dark
                          ? "rgba(243,239,230,0.35)"
                          : "rgba(26,47,37,0.28)",
                        paddingBottom: 16,
                      }}
                    >
                      :
                    </Text>
                    <CountdownUnit
                      value={pad2(remaining.minutes)}
                      label={t("home.minutesShort")}
                      color={chrome.heroTitle}
                      muted={chrome.heroSubtitle}
                    />
                    <Text
                      style={{
                        fontFamily: fonts.displayBold,
                        fontSize: 26,
                        color: dark
                          ? "rgba(243,239,230,0.35)"
                          : "rgba(26,47,37,0.28)",
                        paddingBottom: 16,
                      }}
                    >
                      :
                    </Text>
                    <CountdownUnit
                      value={pad2(remaining.seconds)}
                      label={t("home.secondsShort")}
                      color={chrome.heroTitle}
                      muted={chrome.heroSubtitle}
                    />
                  </View>
                </View>
              ) : null}
            </Animated.View>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>

      {/* Sabit app bar — counter-translate yok */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          paddingTop: insets.top,
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: chrome.compactBar,
            opacity: barBgOpacity,
          }}
        />
        <View
          style={{
            height: COLLAPSED_CONTENT,
            paddingHorizontal: 18,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flex: 1,
              paddingRight: 12,
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{ transform: [{ translateY: titleBlockShift }] }}
            >
              <Text
                style={{
                  fontFamily: fonts.bodyMedium,
                  fontSize: 14,
                  lineHeight: 18,
                  letterSpacing: 0.15,
                  color: chrome.compactTitle,
                }}
                numberOfLines={1}
              >
                {dateLabel}
              </Text>
              <Animated.Text
                style={{
                  marginTop: 2,
                  fontFamily: fonts.body,
                  fontSize: 11,
                  lineHeight: 14,
                  color: dark ? "#d4a84b" : chrome.compactMuted,
                  opacity: compactOpacity,
                  transform: [{ translateY: compactSlide }],
                }}
                numberOfLines={1}
              >
                {next && remaining
                  ? `${nextLabel} · ${formatTime(next.at, locale)} · ${pad2(remaining.hours)}:${pad2(remaining.minutes)}:${pad2(remaining.seconds)}`
                  : " "}
              </Animated.Text>
            </Animated.View>
          </View>

          <Pressable
            onPress={() => setCitySheetOpen(true)}
            hitSlop={10}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingVertical: 6,
              paddingLeft: 4,
            }}
          >
            <Ionicons
              name="location-outline"
              size={14}
              color={dark ? "#d4a84b" : "#2a4a39"}
            />
            <Text
              style={{
                fontFamily: fonts.bodyMedium,
                fontSize: 13,
                color: chrome.compactTitle,
                maxWidth: 110,
              }}
              numberOfLines={1}
            >
              {cityName}
            </Text>
            <Ionicons
              name="chevron-down"
              size={12}
              color={dark ? "rgba(212,168,75,0.85)" : "rgba(42,74,57,0.7)"}
            />
          </Pressable>
        </View>
      </View>

      <Animated.ScrollView
        key={`${locale}-${city.id}`}
        className="flex-1"
        contentContainerStyle={{
          paddingTop: expandedHeight,
          paddingBottom: 48,
        }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fade }}>
          {/* Namaz vakitleri — tipografik grid */}
          <View className="mx-5 mt-5">
            <View className="mb-5 flex-row items-baseline justify-between">
              <Text
                style={{ fontFamily: fonts.bodySemi }}
                className="text-[12px] uppercase tracking-[2px] text-gold-500"
              >
                {t("home.prayerTimes")}
              </Text>
              <Pressable onPress={() => setCitySheetOpen(true)} hitSlop={6}>
                <Text
                  style={{ fontFamily: fonts.body }}
                  className="text-[11px] text-forest-500/70 dark:text-sand-200/45"
                >
                  {cityName}
                </Text>
              </Pressable>
            </View>

            <View>
              {[0, 1].map((row) => (
                <View
                  key={row}
                  className={`flex-row justify-between ${row === 0 ? "mb-5" : ""}`}
                >
                  {PRAYER_SLOT_ORDER.slice(row * 3, row * 3 + 3).map(
                    (slot, col) => {
                      const isNext = next?.id === slot && !next.isTomorrow;
                      const isPast =
                        times[slot].getTime() <= now.getTime() && !isNext;
                      const align =
                        col === 0 ? "flex-start" : col === 1 ? "center" : "flex-end";
                      const textAlign =
                        col === 0 ? "left" : col === 1 ? "center" : "right";

                      return (
                        <View
                          key={slot}
                          style={{ flex: 1, alignItems: align }}
                        >
                          <Text
                            style={{
                              fontFamily: fonts.body,
                              textAlign,
                            }}
                            className={`text-[11px] tracking-[0.6px] ${
                              isNext
                                ? "text-gold-500"
                                : isPast
                                  ? "text-forest-500/45 dark:text-sand-200/30"
                                  : "text-forest-500 dark:text-sand-200/55"
                            }`}
                          >
                            {t(
                              `prayerTimes.${slot}` as `prayerTimes.${PrayerSlotId}`,
                            )}
                          </Text>
                          <Text
                            style={{
                              fontFamily: isNext
                                ? fonts.displayBold
                                : fonts.displayMedium,
                              textAlign,
                            }}
                            className={`mt-1 text-[22px] tabular-nums ${
                              isNext
                                ? "text-gold-500"
                                : isPast
                                  ? "text-forest-500/45 dark:text-sand-200/30"
                                  : "text-forest-900 dark:text-sand-50"
                            }`}
                          >
                            {formatTime(times[slot], locale)}
                          </Text>
                        </View>
                      );
                    },
                  )}
                </View>
              ))}
            </View>

            {next?.isTomorrow ? (
              <View className="mt-5 flex-row items-baseline justify-between">
                <Text
                  style={{ fontFamily: fonts.body }}
                  className="text-[12px] text-forest-500 dark:text-sand-200/55"
                >
                  {t("home.tomorrowFajr")}
                </Text>
                <Text
                  style={{ fontFamily: fonts.displayMedium }}
                  className="text-[18px] tabular-nums text-gold-500"
                >
                  {formatTime(next.at, locale)}
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              hapticSelection();
              router.push("/(tabs)/kible");
            }}
            className="mx-5 mt-8 self-start active:opacity-70"
            hitSlop={8}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="compass-outline"
                size={18}
                color={dark ? "#d4a84b" : "#2a4a39"}
              />
              <Text
                style={{ fontFamily: fonts.bodySemi }}
                className="border-b border-forest-700 pb-0.5 text-[14px] text-forest-800 dark:border-gold-400 dark:text-gold-400"
              >
                {t("home.openQibla")}
              </Text>
            </View>
          </Pressable>

          {/* Namaza başla — sıradaki / aktif vakit rehberi */}
          <Pressable
            onPress={() => {
              hapticMedium();
              router.push(`/namaza-basla/${guideId}`);
            }}
            className="mx-5 mt-8 active:opacity-80"
          >
            <Text
              style={{ fontFamily: fonts.bodySemi }}
              className="text-[12px] uppercase tracking-[2px] text-gold-500"
            >
              {t("home.startPrayer")}
            </Text>
            <Text
              style={{ fontFamily: fonts.displayBold }}
              className="mt-2 text-[26px] text-forest-900 dark:text-sand-50"
            >
              {guideName}
            </Text>
            <Text
              style={{ fontFamily: fonts.body }}
              className="mt-1 text-[14px] leading-5 text-forest-500 dark:text-sand-200/70"
            >
              {t("home.startPrayerHint", { prayer: guideName })}
            </Text>
            <View className="mt-4 self-start border-b border-forest-700 pb-0.5 dark:border-gold-400">
              <Text
                style={{ fontFamily: fonts.bodySemi }}
                className="text-[14px] text-forest-800 dark:text-gold-400"
              >
                {t("home.startPrayerCta")} →
              </Text>
            </View>
          </Pressable>

          <View className="mx-5 mt-10">
            <Text
              style={{ fontFamily: fonts.bodySemi }}
              className="text-[12px] uppercase tracking-[2px] text-gold-500"
            >
              {t("home.todaysDua")} · {duaText.occasion}
            </Text>
            <Text
              style={{ fontFamily: fonts.displayBold }}
              className="mt-2 text-[28px] text-forest-900 dark:text-sand-50"
            >
              {duaText.title}
            </Text>
            <View className="mt-5">
              <DuaBody
                arabic={dua.arabic}
                latin={dua.latin}
                meaning={duaText.meaning}
                size="lg"
              />
            </View>
            <ArabicListenButton arabic={dua.arabic} duaId={dua.id} />

            <Link href="/dualar" asChild>
              <Pressable className="mt-5 self-start border-b border-forest-700 pb-0.5 active:opacity-60 dark:border-gold-400">
                <Text
                  style={{ fontFamily: fonts.bodySemi }}
                  className="text-[14px] text-forest-800 dark:text-gold-400"
                >
                  {t("home.allDuas")} →
                </Text>
              </Pressable>
            </Link>
          </View>
        </Animated.View>
      </Animated.ScrollView>

      <CityPickerSheet
        visible={citySheetOpen}
        onClose={() => setCitySheetOpen(false)}
      />
    </View>
  );
}
