import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  PRAYER_GUIDES,
  filterStepsBySections,
  getPrayerName,
  getSectionLabel,
  getSectionSummaries,
  getStepImage,
  getStepRecitation,
  resolvePrayerStep,
  type PrayerSectionKind,
  type PrayerVoiceId,
} from "@/data/content";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";
import { usePrayerLog } from "@/lib/prayer-log-context";
import { fonts } from "@/constants/fonts";
import { pageBackground, switchColors } from "@/constants/theme";
import { useReducedMotion } from "react-native-reanimated";
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from "expo-keep-awake";
import { PoseImageLightbox } from "@/components/pose-image-lightbox";
import {
  speakPrayerStep,
  stopPrayerVoice,
  getAdvanceDelayMs,
} from "@/lib/prayer-voice";
import {
  hapticLight,
  hapticMedium,
  hapticSelection,
  hapticSuccess,
} from "@/lib/haptics";

const SURAH_VOICE_IDS: PrayerVoiceId[] = ["fatiha", "ihlas"];

function splitReadingLines(latin: string) {
  return latin
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

const SECTION_KINDS: PrayerSectionKind[] = [
  "sunnah",
  "fard",
  "lastSunnah",
  "witr",
];

export default function StartPrayerSessionScreen() {
  const { id, section: sectionParam } = useLocalSearchParams<{
    id: string;
    section?: string;
  }>();
  /** Rota bölüm içeriyorsa oynatıcı, içermiyorsa bölüm seçimi (hub) */
  const routeSection: PrayerSectionKind | null = SECTION_KINDS.includes(
    sectionParam as PrayerSectionKind,
  )
    ? (sectionParam as PrayerSectionKind)
    : null;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { locale, autoImam, setAutoImam, resolvedTheme } = useAppSettings();
  const { isSectionDoneToday, markSectionGuided, todayKey } = usePrayerLog();
  const dark = resolvedTheme === "dark";
  const pageBg = pageBackground(dark);
  const iconPrimary = dark ? "#f3efe6" : "#1a2f25";
  const playIcon = dark ? "#d4a84b" : "#2a4a39";
  const playIconBg = dark ? "#24352c" : "#e0ebe4";
  const switchTrack = switchColors(dark).track;
  const switchThumb = switchColors(dark).thumb;
  const reduceMotion = useReducedMotion();

  const prayer = useMemo(
    () => PRAYER_GUIDES.find((item) => item.id === id),
    [id],
  );

  const sectionSummaries = useMemo(
    () => (prayer ? getSectionSummaries(prayer.steps) : []),
    [prayer],
  );

  const phase: "hub" | "active" = routeSection ? "active" : "hub";
  const activeSection = routeSection;
  const [completed, setCompleted] = useState<
    Partial<Record<PrayerSectionKind, boolean>>
  >({});
  const [stepIndex, setStepIndex] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [poseLightboxOpen, setPoseLightboxOpen] = useState(false);

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceBarAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const stepIndexRef = useRef(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const advanceBar = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const steps = useMemo(() => {
    if (!prayer || !activeSection) return [];
    return filterStepsBySections(prayer.steps, [activeSection]);
  }, [prayer, activeSection]);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    advanceBarAnimRef.current?.stop();
    advanceBarAnimRef.current = null;
    advanceBar.stopAnimation();
    advanceBar.setValue(0);
    setIsAdvancing(false);
  }, [advanceBar]);

  const exitScreen = useCallback(() => {
    clearAdvanceTimer();
    void stopPrayerVoice();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, [router, clearAdvanceTimer]);

  const returnToHub = useCallback(() => {
    clearAdvanceTimer();
    void stopPrayerVoice();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/namaza-basla/${id}`);
    }
  }, [clearAdvanceTimer, router, id]);

  // Kalıcı kayıt: bugün tamamlanan bölümleri hub’da göster
  useEffect(() => {
    if (!prayer) return;
    const next: Partial<Record<PrayerSectionKind, boolean>> = {};
    for (const item of sectionSummaries) {
      if (isSectionDoneToday(prayer.id, item.section)) {
        next[item.section] = true;
      }
    }
    setCompleted(next);
  }, [prayer, sectionSummaries, isSectionDoneToday, todayKey]);

  const finishSection = useCallback(() => {
    if (activeSection && prayer) {
      setCompleted((prev) => ({ ...prev, [activeSection]: true }));
      void markSectionGuided(prayer.id, activeSection);
      hapticSuccess();
    }
    returnToHub();
  }, [activeSection, prayer, markSectionGuided, returnToHub]);

  const animateStepIn = useCallback(() => {
    if (reduceMotion) {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      scaleAnim.setValue(1);
      return;
    }
    fadeAnim.setValue(0);
    slideAnim.setValue(14);
    scaleAnim.setValue(0.985);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim, reduceMotion]);

  const goTo = useCallback(
    (next: number) => {
      clearAdvanceTimer();
      void stopPrayerVoice();
      stepIndexRef.current = next;
      setStepIndex(next);
      animateStepIn();
    },
    [clearAdvanceTimer, animateStepIn],
  );

  const scheduleAdvance = useCallback(
    (fromIndex: number) => {
      const fromStep = steps[fromIndex];
      const delayMs = fromStep ? getAdvanceDelayMs(fromStep) : 1100;

      clearAdvanceTimer();
      setIsAdvancing(true);
      advanceBar.setValue(0);
      advanceBarAnimRef.current = Animated.timing(advanceBar, {
        toValue: 1,
        duration: delayMs,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      advanceBarAnimRef.current.start();

      advanceTimer.current = setTimeout(() => {
        if (stepIndexRef.current !== fromIndex) {
          clearAdvanceTimer();
          return;
        }
        const atEnd = fromIndex >= steps.length - 1;
        clearAdvanceTimer();
        if (atEnd) {
          finishSection();
          return;
        }
        goTo(fromIndex + 1);
      }, delayMs);
    },
    [clearAdvanceTimer, finishSection, goTo, steps, advanceBar],
  );

  const skipCountdown = useCallback(() => {
    if (!isAdvancing) return;
    const current = stepIndexRef.current;
    const atEnd = current >= steps.length - 1;
    clearAdvanceTimer();
    hapticLight();
    if (atEnd) {
      finishSection();
      return;
    }
    goTo(current + 1);
  }, [isAdvancing, clearAdvanceTimer, finishSection, goTo, steps.length]);

  useEffect(() => {
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);

  useEffect(() => {
    if (phase !== "active" || steps.length === 0) return;
    Animated.timing(progressAnim, {
      toValue: (stepIndex + 1) / steps.length,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [phase, steps.length, stepIndex, progressAnim]);

  useEffect(() => {
    if (phase !== "active" || !autoImam || steps.length === 0 || !prayer) {
      void stopPrayerVoice();
      clearAdvanceTimer();
      return;
    }

    const step = steps[stepIndex];
    if (!step) return;

    let active = true;
    const current = stepIndex;
    // Arapça kaydı olan adımlarda kıraat zaten yönlendirme yerine geçiyor;
    // sadece sessiz adımlarda (niyet, oturuş) seçili dilde cümle okunur.
    const guidanceText =
      step.poseId === "niyet"
        ? resolvePrayerStep(prayer.id, step).detail
        : !step.voiceId && step.cueKey
          ? t(`session.cues.${step.cueKey}`)
          : undefined;

    void speakPrayerStep(step, {
      guidanceText,
      locale,
      onDone: () => {
        if (!active) return;
        scheduleAdvance(current);
      },
    });

    return () => {
      active = false;
      clearAdvanceTimer();
      void stopPrayerVoice();
    };
  }, [
    phase,
    steps,
    stepIndex,
    autoImam,
    prayer,
    locale,
    scheduleAdvance,
    clearAdvanceTimer,
  ]);

  useEffect(() => {
    return () => {
      clearAdvanceTimer();
      void stopPrayerVoice();
    };
  }, [clearAdvanceTimer]);

  const startSection = useCallback(
    (section: PrayerSectionKind) => {
      clearAdvanceTimer();
      void stopPrayerVoice();
      hapticMedium();
      if (!autoImam) {
        void setAutoImam(true);
      }
      // Bölüm oynatıcısı ayrı yığın ekranı: sağdan gelir, kaydırarak geri
      router.push(`/namaza-basla/${id}/${section}`);
    },
    [clearAdvanceTimer, autoImam, setAutoImam, router, id],
  );

  // Namaz sırasında ekran kararıp kilitlenmesin (telefon yerde dururken)
  useEffect(() => {
    if (!routeSection) return;
    const tag = `prayer-session-${id}-${routeSection}`;
    void activateKeepAwakeAsync(tag).catch(() => undefined);
    return () => {
      deactivateKeepAwake(tag).catch(() => undefined);
    };
  }, [routeSection, id]);

  // Oynatıcı ekranı açılınca ilk adımı canlandır
  useEffect(() => {
    if (routeSection) animateStepIn();
  }, [routeSection, animateStepIn]);

  if (!prayer) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: pageBg }}
      >
        <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
        <Text
          style={{ fontFamily: fonts.body }}
          className="text-forest-500 dark:text-sand-200"
        >
          {t("common.notFound")}
        </Text>
        <Pressable
          onPress={exitScreen}
          accessibilityRole="button"
          className="mt-6 min-h-[44px] justify-center active:opacity-70"
        >
          <Text
            style={{ fontFamily: fonts.bodySemi }}
            className="text-gold-600 dark:text-gold-400"
          >
            {t("session.close")}
          </Text>
        </Pressable>
      </View>
    );
  }

  const name = getPrayerName(prayer.id);

  if (phase === "hub") {
    const doneCount = sectionSummaries.filter(
      (item) => completed[item.section],
    ).length;

    return (
      <View
        key={`hub-${locale}-${resolvedTheme}`}
        className="flex-1"
        style={{ paddingTop: insets.top, backgroundColor: pageBg }}
      >
        <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
        <View className="flex-row items-center px-4 pb-2 pt-1">
          <Pressable
            onPress={exitScreen}
            hitSlop={10}
            className="h-11 w-11 items-center justify-center active:opacity-50"
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <Ionicons name="chevron-back" size={24} color={iconPrimary} />
          </Pressable>
          <View className="flex-1 items-center px-2">
            <Text
              style={{ fontFamily: fonts.bodyMedium }}
              className="text-[12px] tracking-[1.5px] text-gold-600 dark:text-gold-400/90"
            >
              {name}
            </Text>
          </View>
          <View className="w-11" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 pt-5"
          showsVerticalScrollIndicator={false}
        >
          <Text
            accessibilityRole="header"
            style={{ fontFamily: fonts.displayBold }}
            className="text-[28px] leading-9 text-forest-900 dark:text-sand-50"
          >
            {t("session.sectionPickTitle")}
          </Text>
          <Text
            style={{ fontFamily: fonts.body }}
            className="mt-2 text-[14px] leading-5 text-forest-500 dark:text-sand-200/70"
          >
            {t("session.sectionPickHint")}
          </Text>

          {doneCount > 0 ? (
            <Text
              style={{ fontFamily: fonts.body }}
              className="mt-3 text-[13px] text-gold-600 dark:text-gold-400/90"
            >
              {doneCount}/{sectionSummaries.length} ·{" "}
              {t("session.sectionCompleted")}
            </Text>
          ) : null}

          <View className="mt-6 gap-3">
            {sectionSummaries.map((item) => {
              const isDone = Boolean(completed[item.section]);
              return (
                <Pressable
                  key={item.section}
                  onPress={() => startSection(item.section)}
                  accessibilityRole="button"
                  accessibilityState={{ checked: isDone }}
                  accessibilityLabel={`${getSectionLabel(item.section)}, ${
                    isDone
                      ? t("session.sectionCompleted")
                      : t("session.sectionReady")
                  }`}
                  className={`border px-4 py-4 active:opacity-75 ${
                    isDone
                      ? "border-gold-400/40 bg-gold-400/10"
                      : "border-sand-200 bg-sand-100 dark:border-sand-200/15 dark:bg-forest-900"
                  }`}
                >
                  <View className="flex-row items-center">
                    <View
                      className="mr-3 h-9 w-9 items-center justify-center"
                      style={{
                        backgroundColor: isDone
                          ? "rgba(212,168,75,0.2)"
                          : playIconBg,
                      }}
                    >
                      <Ionicons
                        name={isDone ? "checkmark" : "play"}
                        size={18}
                        color={isDone ? (dark ? "#d4a84b" : "#7a5812") : playIcon}
                      />
                    </View>

                    <View className="flex-1 pr-2">
                      <Text
                        style={{ fontFamily: fonts.bodySemi }}
                        className="text-[16px] text-forest-900 dark:text-sand-50"
                      >
                        {getSectionLabel(item.section)}
                      </Text>
                      <Text
                        style={{ fontFamily: fonts.body }}
                        className="mt-0.5 text-[13px] text-forest-500 dark:text-sand-200/70"
                      >
                        {t("session.sectionRakat", {
                          count: String(item.rakatCount),
                        })}
                        {" · "}
                        {item.stepCount} {t("session.stepsCount")}
                      </Text>
                    </View>

                    <View className="items-end">
                      {isDone ? (
                        <Text
                          style={{ fontFamily: fonts.bodyMedium }}
                          className="text-[12px] text-gold-600 dark:text-gold-400"
                        >
                          {t("session.sectionCompleted")}
                        </Text>
                      ) : null}
                      <Text
                        style={{ fontFamily: fonts.body }}
                        className={`text-[13px] ${
                          isDone
                            ? "mt-1 text-forest-400 dark:text-sand-200/65"
                            : "text-gold-600 dark:text-gold-400"
                        }`}
                      >
                        {isDone
                          ? t("session.sectionReplay")
                          : t("session.sectionReady")}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-8 flex-row items-center justify-between border-t border-sand-200/70 pt-5 dark:border-sand-200/10">
            <View className="mr-4 flex-1">
              <Text
                style={{ fontFamily: fonts.bodySemi }}
                className="text-[14px] text-forest-800 dark:text-sand-100"
              >
                {t("session.autoImam")}
              </Text>
              <Text
                style={{ fontFamily: fonts.body }}
                className="mt-1 text-[12px] leading-4 text-forest-500 dark:text-sand-200/65"
              >
                {t("session.autoImamHint")}
              </Text>
            </View>
            <Switch
              accessibilityLabel={t("session.autoImam")}
              value={autoImam}
              onValueChange={(v) => {
                hapticSelection();
                void setAutoImam(v);
              }}
              trackColor={switchTrack}
              thumbColor={switchThumb}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (steps.length === 0 || !activeSection) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: pageBg }}
      >
        <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
        <Text
          style={{ fontFamily: fonts.body }}
          className="text-forest-500 dark:text-sand-200"
        >
          {t("common.notFound")}
        </Text>
        <Pressable
          onPress={returnToHub}
          accessibilityRole="button"
          className="mt-6 min-h-[44px] justify-center active:opacity-70"
        >
          <Text
            style={{ fontFamily: fonts.bodySemi }}
            className="text-gold-600 dark:text-gold-400"
          >
            {t("session.backToSections")}
          </Text>
        </Pressable>
      </View>
    );
  }

  const total = steps.length;
  const step = steps[stepIndex];
  if (!step) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: pageBg }}
      >
        <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
        <Pressable
          onPress={returnToHub}
          accessibilityRole="button"
          className="min-h-[44px] justify-center active:opacity-70"
        >
          <Text
            style={{ fontFamily: fonts.bodySemi }}
            className="text-gold-600 dark:text-gold-400"
          >
            {t("session.backToSections")}
          </Text>
        </Pressable>
      </View>
    );
  }
  const text = resolvePrayerStep(prayer.id, step);
  const recitation = getStepRecitation(step.voiceId);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;
  const isSurah = !!step.voiceId && SURAH_VOICE_IDS.includes(step.voiceId);
  const readingLines = recitation ? splitReadingLines(recitation.latin) : [];
  const imageHeight = Math.min(
    height * (recitation ? (isSurah ? 0.22 : 0.26) : 0.32),
    recitation ? 220 : 280,
  );
  const sectionLabel = step.rakat
    ? t("session.sectionLabel", {
        section: getSectionLabel(step.section),
        rakat: String(step.rakat),
      })
    : t("session.sectionOnly", { section: getSectionLabel(step.section) });


  return (
    <>
      <View
        key={`${locale}-${resolvedTheme}`}
        className="flex-1"
        style={{ paddingTop: insets.top, backgroundColor: pageBg }}
      >
        <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
        <View className="flex-row items-center px-4 pb-1 pt-1">
          <Pressable
            onPress={returnToHub}
            hitSlop={10}
            className="h-11 w-11 items-center justify-center active:opacity-50"
            accessibilityRole="button"
            accessibilityLabel={t("session.backToSections")}
          >
            <Ionicons name="chevron-back" size={22} color={iconPrimary} />
          </Pressable>

          <View className="flex-1 items-center px-2">
            <Text
              style={{ fontFamily: fonts.bodyMedium }}
              className="text-[11px] tracking-[1.5px] text-gold-600 dark:text-gold-400/90"
            >
              {name}
            </Text>
            <Text
              style={{ fontFamily: fonts.body }}
              className="mt-0.5 text-[13px] text-forest-500 dark:text-sand-200/70"
              numberOfLines={1}
            >
              {sectionLabel}
            </Text>
          </View>

          <Text
            accessibilityLabel={t("session.stepOf", {
              current: stepIndex + 1,
              total,
            })}
            style={{ fontFamily: fonts.body }}
            className="min-w-11 text-right tabular-nums text-[13px] text-forest-400 dark:text-sand-200/65"
          >
            {stepIndex + 1}/{total}
          </Text>
        </View>

        <View className="mx-4 mt-1 h-[2px] overflow-hidden rounded-full bg-forest-200 dark:bg-forest-800">
          <Animated.View
            className="h-full rounded-full bg-gold-400/85"
            style={{
              width: "100%",
              transformOrigin: "left",
              transform: [{ scaleX: progressAnim }],
            }}
          />
        </View>

        {isAdvancing ? (
          <Pressable
            onPress={skipCountdown}
            className="mx-4 mt-3 min-h-[44px] justify-center active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel={t("session.skipWait")}
          >
            <View className="flex-row items-center justify-between pb-1.5">
              <Text
                style={{ fontFamily: fonts.bodyMedium }}
                className="text-[12px] tracking-[0.4px] text-gold-600 dark:text-gold-400/90"
              >
                {isLast ? t("session.finishIn") : t("session.nextIn")}
              </Text>
              <Text
                style={{ fontFamily: fonts.body }}
                className="text-[12px] text-forest-400 dark:text-sand-200/65"
              >
                {t("session.skipWait")}
              </Text>
            </View>
            <View className="h-[3px] overflow-hidden rounded-full bg-forest-200 dark:bg-forest-800">
              <Animated.View
                className="h-full rounded-full bg-gold-400"
                style={{
                  width: "100%",
                  transformOrigin: "left",
                  transform: [{ scaleX: advanceBar }],
                }}
              />
            </View>
          </Pressable>
        ) : (
          <View className="mx-4 mt-3 min-h-[44px] flex-row items-center justify-between">
            <Text
              style={{ fontFamily: fonts.body }}
              className="text-[13px] text-forest-500 dark:text-sand-200/70"
            >
              {t("session.autoImam")}
            </Text>
            <Switch
              accessibilityLabel={t("session.autoImam")}
              value={autoImam}
              onValueChange={(v) => {
                hapticSelection();
                void setAutoImam(v);
              }}
              trackColor={switchTrack}
              thumbColor={switchThumb}
            />
          </View>
        )}

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-6 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
          >
            <Pressable
              onPress={() => setPoseLightboxOpen(true)}
              accessibilityRole="imagebutton"
              accessibilityLabel={t("session.poseTapHint")}
              className="overflow-hidden bg-sand-100 dark:bg-forest-900"
              style={{ height: imageHeight, width: "100%", borderRadius: 2 }}
            >
              <Image
                source={getStepImage(step.poseId)}
                style={{ height: "100%", width: "100%" }}
                resizeMode="contain"
              />
            </Pressable>

            <Text
              style={{ fontFamily: fonts.displayBold }}
              className="mt-4 text-[22px] leading-7 text-forest-900 dark:text-sand-50"
            >
              {text.title}
            </Text>

            {text.detail ? (
              <Text
                style={{ fontFamily: fonts.body }}
                className="mt-1.5 text-[13px] leading-5 text-forest-500 dark:text-sand-200/70"
              >
                {text.detail}
              </Text>
            ) : null}

            {recitation ? (
              <View className="mt-5">
                <View className="border border-gold-400/30 bg-gold-400/[0.08] px-4 py-4 dark:border-gold-400/25 dark:bg-gold-400/[0.07]">
                  <Text
                    style={{ fontFamily: fonts.bodyMedium }}
                    className="text-[11px] uppercase tracking-[1.6px] text-gold-600 dark:text-gold-400"
                  >
                    {t("session.reading")}
                  </Text>
                  <Text
                    style={{ fontFamily: fonts.body }}
                    className="mt-1 text-[12px] leading-4 text-forest-500 dark:text-sand-200/65"
                  >
                    {t("session.readingHint")}
                  </Text>

                  <View className="mt-3 gap-2.5">
                    {readingLines.map((line, index) => (
                      <Text
                        key={`${index}-${line.slice(0, 12)}`}
                        style={{
                          fontFamily: isSurah
                            ? fonts.bodySemi
                            : fonts.bodyMedium,
                        }}
                        className={`leading-7 text-forest-900 dark:text-sand-50 ${
                          isSurah ? "text-[19px]" : "text-[17px]"
                        }`}
                      >
                        {line}
                      </Text>
                    ))}
                  </View>
                </View>

                <Text
                  selectable
                  style={{ writingDirection: "rtl", textAlign: "right", lineHeight: 36 }}
                  className="mt-5 text-[20px] text-gold-600 dark:text-gold-400/90"
                >
                  {recitation.arabic}
                </Text>

                <Text
                  style={{ fontFamily: fonts.bodyMedium }}
                  className="mt-5 text-[11px] uppercase tracking-[1.5px] text-forest-400 dark:text-sand-200/65"
                >
                  {t("session.meal")}
                </Text>
                <Text
                  style={{ fontFamily: fonts.body }}
                  className="mt-1 text-[14px] leading-6 text-forest-500 dark:text-sand-200/70"
                >
                  {recitation.meaning}
                </Text>
              </View>
            ) : null}
          </Animated.View>
        </ScrollView>

        <View
          className="flex-row items-center justify-between border-t border-sand-200/70 px-6 dark:border-sand-200/10"
          style={{
            paddingBottom: Math.max(insets.bottom, 12) + 4,
            paddingTop: 12,
          }}
        >
          <Pressable
            onPress={() => {
              hapticSelection();
              goTo(Math.max(0, stepIndex - 1));
            }}
            disabled={isFirst}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityState={{ disabled: isFirst }}
            className={`min-h-[48px] flex-row items-center gap-1 pr-3 active:opacity-50 ${
              isFirst ? "opacity-40" : ""
            }`}
          >
            <Ionicons name="chevron-back" size={18} color={iconPrimary} />
            <Text
              style={{ fontFamily: fonts.body }}
              className="text-[15px] text-forest-800 dark:text-sand-100"
            >
              {t("session.prev")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              if (isAdvancing) {
                skipCountdown();
                return;
              }
              if (isLast) {
                finishSection();
                return;
              }
              hapticSelection();
              goTo(stepIndex + 1);
            }}
            accessibilityRole="button"
            className="min-h-[48px] flex-row items-center gap-1.5 rounded-full bg-forest-700 px-6 active:opacity-80 dark:bg-gold-400"
          >
            <Text
              style={{ fontFamily: fonts.bodySemi }}
              className="text-[15px] text-sand-50 dark:text-forest-950"
            >
              {isAdvancing
                ? t("session.skipWait")
                : isLast
                  ? t("session.finish")
                  : t("session.next")}
            </Text>
            {!isLast && !isAdvancing ? (
              <Ionicons
                name="chevron-forward"
                size={18}
                color={dark ? "#0f1a15" : "#f3efe6"}
              />
            ) : null}
          </Pressable>
        </View>
      </View>
      <PoseImageLightbox
        visible={poseLightboxOpen}
        source={getStepImage(step.poseId)}
        title={text.title}
        onClose={() => setPoseLightboxOpen(false)}
      />
    </>
  );
}
