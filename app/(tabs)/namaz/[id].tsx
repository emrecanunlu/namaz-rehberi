import { useCallback, useMemo, useState } from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
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
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";
import { fonts } from "@/constants/fonts";

type Row =
  | { kind: "header"; section: PrayerStep["section"]; key: string }
  | {
      kind: "step";
      step: PrayerStep;
      index: number;
      key: string;
    };

export default function PrayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale } = useAppSettings();
  const prayer = PRAYER_GUIDES.find((item) => item.id === id);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const rows = useMemo<Row[]>(() => {
    if (!prayer) return [];
    const groups = groupStepsBySection(prayer.steps);
    const out: Row[] = [];
    for (const group of groups) {
      out.push({
        kind: "header",
        section: group.section,
        key: `h-${group.section}-${group.startIndex}`,
      });
      group.steps.forEach((step, localIndex) => {
        const index = group.startIndex + localIndex;
        out.push({
          kind: "step",
          step,
          index,
          key: `s-${prayer.id}-${index}`,
        });
      });
    }
    return out;
  }, [prayer]);

  const toggle = useCallback((index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const renderItem: ListRenderItem<Row> = useCallback(
    ({ item }) => {
      if (!prayer) return null;

      if (item.kind === "header") {
        return (
          <Text
            style={{ fontFamily: fonts.bodySemi }}
            className="mb-2 mt-4 text-[12px] uppercase tracking-[2px] text-gold-500"
          >
            {getSectionLabel(item.section)}
          </Text>
        );
      }

      const text = getPrayerStep(prayer.id, item.index);
      const isOpen = Boolean(expanded[item.index]);
      const rec = isOpen ? getStepRecitation(item.step.voiceId) : null;

      return (
        <Pressable
          onPress={() => toggle(item.index)}
          className="mb-3 overflow-hidden rounded-2xl border border-sand-200 bg-white active:opacity-90 dark:border-forest-700 dark:bg-forest-900"
        >
          <View className="flex-row p-3">
            <Image
              source={getStepImage(item.step.poseId)}
              style={{ width: 56, height: 56 }}
              className="rounded-md"
              resizeMode="cover"
            />
            <View className="ml-3 flex-1">
              <View className="flex-row items-center justify-between">
                <Text
                  style={{ fontFamily: fonts.bodySemi }}
                  className="text-[13px] text-forest-400 dark:text-sand-200/50"
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
                style={{ fontFamily: fonts.bodySemi }}
                className="mt-0.5 text-base text-forest-900 dark:text-sand-50"
              >
                {text.title}
              </Text>
              {text.detail ? (
                <Text
                  style={{ fontFamily: fonts.body }}
                  className="mt-1 text-sm leading-5 text-forest-500 dark:text-sand-200"
                  numberOfLines={isOpen ? undefined : 2}
                >
                  {text.detail}
                </Text>
              ) : null}
            </View>
          </View>

          {isOpen && rec ? (
            <View className="border-t border-sand-100 px-4 pb-4 pt-3 dark:border-forest-800">
              <Text
                style={{ fontFamily: fonts.displayMedium }}
                className="text-right text-base leading-7 text-forest-800 dark:text-gold-400"
              >
                {rec.arabic}
              </Text>
              <Text
                style={{ fontFamily: fonts.body }}
                className="mt-2 text-sm leading-5 text-forest-600 dark:text-sand-200/80"
              >
                {rec.latin}
              </Text>
              <Text
                style={{ fontFamily: fonts.bodyMedium }}
                className="mt-2 text-[11px] uppercase tracking-[1.5px] text-forest-400 dark:text-sand-200/45"
              >
                {t("session.meal")}
              </Text>
              <Text
                style={{ fontFamily: fonts.body }}
                className="mt-1 text-sm leading-5 text-forest-500 dark:text-sand-200/70"
              >
                {rec.meaning}
              </Text>
            </View>
          ) : null}

          {isOpen && !rec && item.step.arabic ? (
            <View className="border-t border-sand-100 px-4 pb-4 pt-3 dark:border-forest-800">
              <Text
                style={{ fontFamily: fonts.bodyMedium }}
                className="text-sm text-gold-500"
              >
                {item.step.arabic}
              </Text>
            </View>
          ) : null}
        </Pressable>
      );
    },
    [prayer, expanded, toggle],
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
      <FlatList
        key={locale}
        className="flex-1 bg-sand-50 dark:bg-forest-950"
        data={rows}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        contentContainerClassName="px-4 pb-12 pt-5"
        ListHeaderComponent={
          <View className="mb-2 rounded-2xl bg-forest-900 px-5 py-5">
            <Text
              style={{ fontFamily: fonts.body }}
              className="text-sm text-sand-200"
            >
              {prayer.rakats} {t("common.rakat")} · {prayer.steps.length}{" "}
              {t("session.stepsCount")}
            </Text>
            <Text
              style={{ fontFamily: fonts.displayBold }}
              className="mt-1 text-2xl text-sand-50"
            >
              {name}
            </Text>
            <Text
              style={{ fontFamily: fonts.body }}
              className="mt-2 text-base leading-6 text-sand-200"
            >
              {getPrayerSummary(prayer.id)}
            </Text>
            <Text
              style={{ fontFamily: fonts.body }}
              className="mt-3 text-[12px] text-sand-200/60"
            >
              {t("session.expandHint")}
            </Text>
          </View>
        }
      />
    </>
  );
}
