import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DAILY_DUAS,
  getDayOfYear,
  getDuaText,
  getTodaysDua,
} from "@/data/content";
import { bannerForTheme } from "@/constants/images";
import { ArabicListenButton } from "@/components/arabic-listen-button";
import { Collapsible } from "@/components/collapsible";
import { DuaBody } from "@/components/dua-body";
import {
  SliverTabScreen,
  SLIVER_COLLAPSED,
  type SliverTabScreenRef,
} from "@/components/sliver-tab-screen";
import { t } from "@/lib/i18n";
import { fonts } from "@/constants/fonts";
import { cardShadow, themeColors } from "@/constants/theme";
import { useAppSettings } from "@/lib/settings-context";
import { stopSpeaking } from "@/lib/speak-arabic";
import { hapticSelection } from "@/lib/haptics";

export default function DualarScreen() {
  const today = getTodaysDua();
  const todayText = getDuaText(today.id);
  const dayIndex = (getDayOfYear() - 1) % DAILY_DUAS.length;
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useAppSettings();
  const dark = resolvedTheme === "dark";
  const sliverRef = useRef<SliverTabScreenRef>(null);
  const itemRefs = useRef<Record<string, View | null>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const scrollItemToTop = useCallback(
    (id: string) => {
      const node = itemRefs.current[id];
      if (!node || !sliverRef.current) return;
      node.measureInWindow((_x, windowY) => {
        const targetY = insets.top + SLIVER_COLLAPSED + 10;
        const delta = windowY - targetY;
        if (Math.abs(delta) < 4) return;
        const next = sliverRef.current!.getScrollY() + delta;
        sliverRef.current!.scrollTo({ y: next, animated: true });
      });
    },
    [insets.top],
  );

  useEffect(() => {
    if (!expandedId) return;
    const id = expandedId;
    const t1 = setTimeout(() => scrollItemToTop(id), 70);
    const t2 = setTimeout(() => scrollItemToTop(id), 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [expandedId, scrollItemToTop]);

  const toggle = useCallback((id: string) => {
    void stopSpeaking();
    hapticSelection();
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <SliverTabScreen
      ref={sliverRef}
      image={bannerForTheme("dualarBanner", dark)}
      eyebrow={t("tabs.duas")}
      title={t("duas.headerTitle")}
      subtitle={t("duas.allHint")}
      compactSubtitle={t("tabs.duas")}
      expandedContent={196}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      <LinearGradient
        colors={[...(dark ? themeColors.dark.todayDua : themeColors.light.todayDua)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[{ marginBottom: 20 }, cardShadow(dark)]}
      >
        <View className="px-5 py-5">
          <Text
            style={{ fontFamily: fonts.bodyMedium }}
            className={`text-[11px] uppercase tracking-[1.6px] ${
              dark ? "text-gold-400" : "text-gold-500"
            }`}
          >
            {t("duas.todayLabel", {
              current: dayIndex + 1,
              total: DAILY_DUAS.length,
            })}
          </Text>
          <Text
            style={{ fontFamily: fonts.displayBold }}
            className={`mt-2 text-xl ${
              dark ? "text-sand-50" : "text-forest-900"
            }`}
          >
            {todayText.title}
          </Text>
          <Text
            style={{ fontFamily: fonts.body }}
            className={`mt-1 text-sm ${
              dark ? "text-sand-200/80" : "text-forest-500"
            }`}
          >
            {todayText.occasion}
          </Text>
          <View className="mt-4">
            <DuaBody
              arabic={today.arabic}
              latin={today.latin}
              meaning={todayText.meaning}
              light={dark}
              size="lg"
            />
          </View>
          <ArabicListenButton
            arabic={today.arabic}
            duaId={today.id}
            light={dark}
          />
        </View>
      </LinearGradient>

      <Text
        style={{ fontFamily: fonts.displayBold }}
        className="mb-1 text-lg text-forest-900 dark:text-sand-50"
      >
        {t("duas.allTitle")}
      </Text>
      <Text
        style={{ fontFamily: fonts.body }}
        className="mb-3 text-[12px] text-forest-500 dark:text-sand-200/55"
      >
        {t("duas.expandHint")}
      </Text>

      {DAILY_DUAS.map((dua, index) => {
        const text = getDuaText(dua.id);
        const isToday = dua.id === today.id;
        const isOpen = expandedId === dua.id;

        return (
          <View
            key={dua.id}
            ref={(node) => {
              itemRefs.current[dua.id] = node;
            }}
            collapsable={false}
            style={[
              {
                marginBottom: 12,
                backgroundColor: dark ? "#1a2f25" : "#f3efe6",
                borderWidth: isToday ? 1.5 : 0,
                borderColor: isToday ? "#d4a84b" : "transparent",
              },
              cardShadow(dark),
            ]}
          >
            <Pressable
              onPress={() => toggle(dua.id)}
              android_ripple={{ color: "rgba(42,74,57,0.12)" }}
              style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
            >
              <View className="px-4 py-4">
                <View className="mb-1 flex-row items-center justify-between">
                  <Text
                    style={{ fontFamily: fonts.bodySemi }}
                    className="mr-2 flex-1 text-base text-forest-900 dark:text-sand-50"
                  >
                    {index + 1}. {text.title}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    {isToday ? (
                      <Text
                        style={{ fontFamily: fonts.bodySemi }}
                        className="bg-gold-400/20 px-2 py-0.5 text-xs text-gold-500"
                      >
                        {t("common.today")}
                      </Text>
                    ) : null}
                    <Text
                      style={{ fontFamily: fonts.body }}
                      className="text-[13px] text-forest-400 dark:text-sand-200/45"
                    >
                      {isOpen ? "−" : "+"}
                    </Text>
                  </View>
                </View>

                {!isOpen ? (
                  <Text
                    selectable={false}
                    style={{
                      writingDirection: "rtl",
                      textAlign: "right",
                      lineHeight: 28,
                    }}
                    className="mt-1 text-[15px] text-forest-700 dark:text-sand-100"
                    numberOfLines={2}
                  >
                    {dua.arabic}
                  </Text>
                ) : null}

                <Collapsible open={isOpen}>
                  <View className="pt-3">
                    <DuaBody
                      arabic={dua.arabic}
                      latin={dua.latin}
                      meaning={text.meaning}
                    />
                    <ArabicListenButton
                      arabic={dua.arabic}
                      duaId={dua.id}
                      className="mt-3.5"
                    />
                  </View>
                </Collapsible>
              </View>
            </Pressable>
          </View>
        );
      })}
    </SliverTabScreen>
  );
}
