import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, Stack, router } from "expo-router";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SectionList,
  Text,
  View,
  type ImageSourcePropType,
  type SectionListData,
  type SectionListRenderItem,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  PRAYER_GUIDES,
  getPrayerName,
  getPrayerStep,
  getPrayerSummary,
  getSectionLabel,
  getStepImage,
  getStepRecitation,
  groupStepsBySection,
  type PrayerStep,
} from "@/data/content";
import { getPrayerAudio } from "@/data/prayer-audio";
import { ArabicListenButton } from "@/components/arabic-listen-button";
import { Collapsible } from "@/components/collapsible";
import { PoseImageLightbox } from "@/components/pose-image-lightbox";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";
import { fonts } from "@/constants/fonts";
import { stopSpeaking } from "@/lib/speak-arabic";

type StepRow = {
  step: PrayerStep;
  index: number;
};

type Section = {
  title: string;
  section: PrayerStep["section"];
  data: StepRow[];
};

type LightboxState = {
  source: ImageSourcePropType;
  title: string;
} | null;

export default function PrayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale, resolvedTheme } = useAppSettings();
  const prayer = PRAYER_GUIDES.find((item) => item.id === id);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const listRef = useRef<SectionList<StepRow, Section>>(null);
  const listAnchorRef = useRef<View>(null);
  const itemRefs = useRef<Record<number, View | null>>({});
  const scrollYRef = useRef(0);

  /** Sticky section header yaklaşık yüksekliği */
  const STICKY_HEADER_H = 48;

  const sections = useMemo<Section[]>(() => {
    if (!prayer) return [];
    return groupStepsBySection(prayer.steps).map((group) => ({
      title: getSectionLabel(group.section),
      section: group.section,
      data: group.steps.map((step, localIndex) => ({
        step,
        index: group.startIndex + localIndex,
      })),
    }));
  }, [prayer, locale]);

  const scrollItemToTop = useCallback((stepIndex: number) => {
    const item = itemRefs.current[stepIndex];
    const list = listAnchorRef.current;
    if (!item || !list) return;

    list.measureInWindow((_lx, listTop) => {
      item.measureInWindow((_ix, itemTop) => {
        const targetY = listTop + STICKY_HEADER_H + 6;
        const delta = itemTop - targetY;
        if (Math.abs(delta) < 3) return;
        const nextY = Math.max(0, scrollYRef.current + delta);
        scrollYRef.current = nextY;
        const list = listRef.current as SectionList<StepRow, Section> & {
          scrollToOffset?: (opts: { offset: number; animated?: boolean }) => void;
        };
        if (list.scrollToOffset) {
          list.scrollToOffset({ offset: nextY, animated: true });
        } else {
          list.getScrollResponder()?.scrollTo({ y: nextY, animated: true });
        }
      });
    });
  }, []);

  useEffect(() => {
    if (expandedIndex == null) return;
    const index = expandedIndex;
    // Dualar’daki gibi: açılınca + layout sonrası bir kez daha hizala
    const t1 = setTimeout(() => scrollItemToTop(index), 60);
    const t2 = setTimeout(() => scrollItemToTop(index), 180);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [expandedIndex, scrollItemToTop]);

  const toggle = useCallback((index: number) => {
    void stopSpeaking();
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

  const openPose = useCallback((source: ImageSourcePropType, title: string) => {
    setLightbox({ source, title });
  }, []);

  const renderItem: SectionListRenderItem<StepRow, Section> = useCallback(
    ({ item }) => {
      if (!prayer) return null;

      const text = getPrayerStep(prayer.id, item.index);
      const isOpen = expandedIndex === item.index;
      const rec = isOpen ? getStepRecitation(item.step.voiceId) : null;
      const audio = getPrayerAudio(item.step.voiceId);
      const poseSource = getStepImage(item.step.poseId);

      return (
        <View
          ref={(node) => {
            itemRefs.current[item.index] = node;
          }}
          collapsable={false}
        >
          <Pressable
            onPress={() => toggle(item.index)}
            android_ripple={{ color: "rgba(42,74,57,0.12)" }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.78 : 1,
            })}
            className="overflow-hidden border border-sand-200/80 bg-sand-50 dark:border-forest-700 dark:bg-forest-900"
          >
          <View className="flex-row px-3.5 py-3.5">
            <Pressable
              onPress={() => openPose(poseSource, text.title)}
              accessibilityRole="imagebutton"
              accessibilityLabel={t("session.poseTapHint")}
              className="h-14 w-14 overflow-hidden bg-sand-100 dark:bg-forest-950"
            >
              <Image
                source={poseSource}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            </Pressable>
            <View className="ml-3.5 flex-1">
              <View className="flex-row items-center justify-between">
                <Text
                  style={{ fontFamily: fonts.bodySemi }}
                  className="text-[12px] text-forest-400 dark:text-sand-200/50"
                >
                  {item.index + 1}
                </Text>
                <Text
                  style={{ fontFamily: fonts.body }}
                  className="text-[12px] text-forest-400 dark:text-sand-200/45"
                >
                  {isOpen ? "−" : "+"}
                </Text>
              </View>
              <Text
                style={{ fontFamily: fonts.bodySemi, lineHeight: 22 }}
                className="mt-1.5 text-[15px] text-forest-900 dark:text-sand-50"
              >
                {text.title}
              </Text>
              {text.detail ? (
                <Text
                  style={{ fontFamily: fonts.body, lineHeight: 20 }}
                  className="mt-1.5 text-[13px] text-forest-500 dark:text-sand-200/70"
                  numberOfLines={isOpen ? undefined : 2}
                >
                  {text.detail}
                </Text>
              ) : null}
            </View>
          </View>

          <Collapsible open={isOpen && Boolean(rec)}>
            <View className="border-t border-sand-200/70 px-4 pb-4 pt-3.5 dark:border-forest-800">
              <Pressable
                onPress={() => openPose(poseSource, text.title)}
                accessibilityRole="imagebutton"
                accessibilityLabel={t("session.poseTapHint")}
                className="mb-3.5 overflow-hidden bg-sand-100 dark:bg-forest-950"
              >
                <Image
                  source={poseSource}
                  style={{ width: "100%", height: 200 }}
                  resizeMode="contain"
                />
                <Text
                  style={{ fontFamily: fonts.body }}
                  className="px-3 py-2 text-center text-[11px] text-forest-400 dark:text-sand-200/50"
                >
                  {t("session.poseTapHint")}
                </Text>
              </Pressable>
              <Text
                style={{ fontFamily: fonts.displayMedium }}
                className="text-right text-base leading-7 text-forest-800 dark:text-gold-400"
              >
                {rec?.arabic}
              </Text>
              <Text
                style={{ fontFamily: fonts.body, lineHeight: 21 }}
                className="mt-2.5 text-[13px] text-forest-600 dark:text-sand-200/80"
              >
                {rec?.latin}
              </Text>
              <Text
                style={{ fontFamily: fonts.bodyMedium }}
                className="mt-3 text-[11px] uppercase tracking-[1.5px] text-forest-400 dark:text-sand-200/45"
              >
                {t("session.meal")}
              </Text>
              <Text
                style={{ fontFamily: fonts.body, lineHeight: 20 }}
                className="mt-1.5 text-[13px] text-forest-500 dark:text-sand-200/70"
              >
                {rec?.meaning}
              </Text>
              {audio && rec ? (
                <ArabicListenButton
                  arabic={rec.arabic}
                  audio={audio}
                  className="mt-3.5"
                />
              ) : null}
            </View>
          </Collapsible>

          <Collapsible open={isOpen && !rec && Boolean(item.step.arabic)}>
            <View className="border-t border-sand-200/70 px-4 pb-4 pt-3.5 dark:border-forest-800">
              <Pressable
                onPress={() => openPose(poseSource, text.title)}
                accessibilityRole="imagebutton"
                accessibilityLabel={t("session.poseTapHint")}
                className="mb-3.5 overflow-hidden bg-sand-100 dark:bg-forest-950"
              >
                <Image
                  source={poseSource}
                  style={{ width: "100%", height: 200 }}
                  resizeMode="contain"
                />
                <Text
                  style={{ fontFamily: fonts.body }}
                  className="px-3 py-2 text-center text-[11px] text-forest-400 dark:text-sand-200/50"
                >
                  {t("session.poseTapHint")}
                </Text>
              </Pressable>
              <Text
                style={{ fontFamily: fonts.bodyMedium }}
                className="text-sm text-gold-500"
              >
                {item.step.arabic}
              </Text>
              {audio && item.step.arabic ? (
                <ArabicListenButton
                  arabic={item.step.arabic}
                  audio={audio}
                  className="mt-3.5"
                />
              ) : null}
            </View>
          </Collapsible>
        </Pressable>
        </View>
      );
    },
    [prayer, expandedIndex, toggle, openPose],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionListData<StepRow, Section> }) => {
      const dark = resolvedTheme === "dark";
      return (
        <View
          style={dark ? { backgroundColor: "#0f1a15" } : undefined}
          className="border-b border-sand-200/60 pb-2.5 pt-4 dark:border-forest-800"
        >
          <Text
            style={{ fontFamily: fonts.bodySemi }}
            className="text-[12px] uppercase tracking-[2px] text-gold-500"
          >
            {section.title}
          </Text>
        </View>
      );
    },
    [resolvedTheme],
  );

  if (!prayer) {
    return (
      <View className="flex-1 items-center justify-center bg-sand-50 dark:bg-forest-950">
        <Text className="text-forest-500 dark:text-sand-200">
          {t("common.notFound")}
        </Text>
      </View>
    );
  }

  const name = getPrayerName(prayer.id);

  return (
    <>
      <Stack.Screen options={{ title: name }} />
      <View ref={listAnchorRef} collapsable={false} className="flex-1">
        <SectionList
          ref={listRef}
          key={locale}
          className="flex-1 bg-sand-50 dark:bg-forest-950"
          sections={sections}
          keyExtractor={(item) => `${prayer.id}-${item.index}`}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={false}
          contentContainerClassName="px-4 pb-12 pt-5"
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
          onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
            scrollYRef.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          ListHeaderComponent={
            <View>
              <View
                className={`mb-3 border px-5 py-5 ${
                  resolvedTheme === "dark"
                    ? "border-gold-400/20 bg-forest-900"
                    : "border-sand-200 bg-sand-100"
                }`}
              >
                <Text
                  style={{ fontFamily: fonts.bodyMedium }}
                  className={`text-[11px] uppercase tracking-[1.6px] ${
                    resolvedTheme === "dark" ? "text-gold-400" : "text-gold-500"
                  }`}
                >
                  {prayer.rakats} {t("common.rakat")} · {prayer.steps.length}{" "}
                  {t("session.stepsCount")}
                </Text>
                <Text
                  style={{ fontFamily: fonts.body }}
                  className={`mt-2 text-base leading-6 ${
                    resolvedTheme === "dark"
                      ? "text-sand-200/80"
                      : "text-forest-700"
                  }`}
                >
                  {getPrayerSummary(prayer.id)}
                </Text>
                <Text
                  style={{ fontFamily: fonts.body }}
                  className={`mt-3 text-[12px] ${
                    resolvedTheme === "dark"
                      ? "text-sand-200/50"
                      : "text-forest-500"
                  }`}
                >
                  {t("session.expandHint")}
                </Text>
              </View>

              <Pressable
                onPress={() => router.push(`/namaza-basla/${prayer.id}`)}
                android_ripple={{ color: "rgba(42,74,57,0.12)" }}
                className={`mb-4 flex-row items-center px-4 py-3.5 active:opacity-80 ${
                  resolvedTheme === "dark"
                    ? "border border-gold-400/30 bg-gold-400/10"
                    : "border border-forest-700/20 bg-forest-100"
                }`}
              >
                <Ionicons
                  name="play-circle-outline"
                  size={22}
                  color={resolvedTheme === "dark" ? "#d4a84b" : "#2a4a39"}
                />
                <View className="ml-3 flex-1">
                  <Text
                    style={{ fontFamily: fonts.bodySemi }}
                    className="text-[15px] text-forest-900 dark:text-sand-50"
                  >
                    {t("prayer.startThis")}
                  </Text>
                  <Text
                    style={{ fontFamily: fonts.body }}
                    className="mt-0.5 text-[12px] text-forest-500 dark:text-sand-200/55"
                  >
                    {t("prayer.startSession")}
                  </Text>
                </View>
                <Text className="text-forest-500/70 dark:text-gold-400">›</Text>
              </Pressable>
            </View>
          }
        />
      </View>

      <PoseImageLightbox
        visible={Boolean(lightbox)}
        source={lightbox?.source ?? null}
        title={lightbox?.title}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}
