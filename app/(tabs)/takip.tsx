import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutChangeEvent,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from "react-native";
import * as Sharing from "expo-sharing";
import Animated, {
  Easing,
  FadeIn,
  runOnJS,
  useAnimatedProps,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { captureRef } from "react-native-view-shot";
import { SliverTabScreen } from "@/components/sliver-tab-screen";
import { fonts } from "@/constants/fonts";
import { bannerForTheme } from "@/constants/images";
import { cardShadow, themeColors } from "@/constants/theme";
import {
  PRAYER_GUIDES,
  getPrayerName,
  getSectionLabel,
  getSectionSummaries,
  type PrayerSectionKind,
} from "@/data/content";
import { t } from "@/lib/i18n";
import { hapticSelection, hapticSuccess } from "@/lib/haptics";
import { playMarkDoneSound } from "@/lib/ui-sound";
import {
  completedPrayerIdsForDate,
  totalRakatsForDate,
  type PrayerGuideId,
} from "@/lib/prayer-log";
import { usePrayerLog } from "@/lib/prayer-log-context";
import { dateKey } from "@/lib/prayer-times";
import { useAppSettings } from "@/lib/settings-context";

type Period = "daily" | "weekly" | "monthly";

type ThemeChrome = (typeof themeColors)["dark"] | (typeof themeColors)["light"];

const PERIODS: Period[] = ["daily", "weekly", "monthly"];
const TOTAL_PRAYERS = PRAYER_GUIDES.length;
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

type DaySnapshot = {
  date: Date;
  key: string;
  completed: number;
  rakats: number;
};

function atStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function shiftDay(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function calculateStreak(days: DaySnapshot[]) {
  let streak = 0;
  for (const day of [...days].reverse()) {
    if (day.completed !== TOTAL_PRAYERS) break;
    streak += 1;
  }
  return streak;
}

/** Karuselde geriye doğru gezilebilecek ay sayısı */
const MONTH_WINDOW = 24;
const MONTH_GAP = 16;
/** Takvim gövdesi 5/6 satırlık aylarda aynı yüksekliği korusun */
const CALENDAR_BODY_HEIGHT = 6 * 48;

/**
 * Gün hücresi rengi — 0..5 tamamlanan namaza göre basamaklı.
 * 5/5 (tam gün) altın; ara seviyeler yeşil yoğunluk.
 */
function dayCellFill(completed: number, dark: boolean, isFuture: boolean) {
  if (isFuture) return "transparent";
  const level = Math.max(0, Math.min(TOTAL_PRAYERS, completed));
  if (level === TOTAL_PRAYERS) return "#d4a84b";
  if (level === 0) {
    return dark ? "rgba(243,239,230,0.06)" : "rgba(42,74,57,0.06)";
  }
  // 1..4 → net basamaklar (oran değil, okunabilir seviye)
  const steps = dark
    ? [0, 0.32, 0.48, 0.66, 0.88]
    : [0, 0.18, 0.34, 0.55, 0.78];
  const alpha = steps[level] ?? steps[steps.length - 1];
  return dark
    ? `rgba(77,119,97,${alpha})`
    : `rgba(42,74,57,${alpha})`;
}

function legendSwatch(level: number, dark: boolean) {
  if (level === TOTAL_PRAYERS) return "#d4a84b";
  if (level === 0) {
    return dark ? "rgba(243,239,230,0.1)" : "rgba(42,74,57,0.1)";
  }
  return dayCellFill(level, dark, false);
}

function monthKeyOf(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

/** Bir ayın özeti — her sayfa kendi değerlerini taşısın diye ayrı tutulur */
function statsForMonth(days: DaySnapshot[], today: Date) {
  const elapsed = days.filter((day) => day.date.getTime() <= today.getTime());
  const fullDays = elapsed.filter(
    (day) => day.completed === TOTAL_PRAYERS,
  ).length;

  let best = 0;
  let running = 0;
  for (const day of elapsed) {
    if (day.completed === TOTAL_PRAYERS) {
      running += 1;
      best = Math.max(best, running);
    } else {
      running = 0;
    }
  }

  const completed = days.reduce((sum, day) => sum + day.completed, 0);
  const target = elapsed.length * TOTAL_PRAYERS;
  const consistency =
    target === 0 ? 0 : Math.round((completed / target) * 100);

  return { fullDays, bestStreak: best, consistency };
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Dairesel ilerleme halkası — dolum animasyonlu */
function ProgressRing({
  size,
  thickness,
  progress,
  track,
  tint,
  children,
}: {
  size: number;
  thickness: number;
  progress: number;
  track: string;
  tint: string;
  children?: React.ReactNode;
}) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const sweep = useSharedValue(0);

  useEffect(() => {
    sweep.value = withDelay(
      140,
      withTiming(Math.max(0, Math.min(1, progress)), {
        duration: 900,
        easing: EASE,
      }),
    );
  }, [progress, sweep]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - sweep.value),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={track}
          strokeWidth={thickness}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tint}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </View>
    </View>
  );
}

function AnimatedBar({
  ratio,
  index,
  color,
  track,
}: {
  ratio: number;
  index: number;
  color: string;
  track: string;
}) {
  const grow = useSharedValue(0);

  useEffect(() => {
    grow.value = withDelay(
      index * 60,
      withTiming(ratio, { duration: 620, easing: EASE }),
    );
  }, [ratio, index, grow]);

  const style = useAnimatedStyle(() => ({
    height: `${grow.value * 100}%`,
  }));

  return (
    <View
      style={{
        width: 24,
        height: 92,
        borderRadius: 12,
        overflow: "hidden",
        justifyContent: "flex-end",
        backgroundColor: track,
      }}
    >
      <Animated.View
        style={[{ borderRadius: 12, backgroundColor: color }, style]}
      />
    </View>
  );
}

const PRAYER_ICONS: Record<
  PrayerGuideId,
  ComponentProps<typeof Ionicons>["name"]
> = {
  sabah: "partly-sunny-outline",
  ogle: "sunny-outline",
  ikindi: "cloudy-outline",
  aksam: "moon-outline",
  yatsi: "star-outline",
};

function PrayerRow({
  prayerId,
  rakats,
  doneRakats,
  done,
  partial,
  sections,
  index,
  onToggle,
  onToggleSection,
  colors,
  dark,
  tint,
}: {
  prayerId: PrayerGuideId;
  rakats: number;
  doneRakats: number;
  done: boolean;
  partial: boolean;
  sections: {
    section: PrayerSectionKind;
    rakats: number;
    done: boolean;
  }[];
  index: number;
  onToggle: () => void;
  onToggleSection: (section: PrayerSectionKind, wasDone: boolean) => void;
  colors: ThemeChrome;
  dark: boolean;
  tint: string;
}) {
  const press = useSharedValue(1);
  const check = useSharedValue(done ? 1 : 0);

  useEffect(() => {
    check.value = withTiming(done ? 1 : 0, { duration: 260, easing: EASE });
  }, [done, check]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    opacity: check.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    backgroundColor: done
      ? tint
      : dark
        ? "rgba(243,239,230,0.08)"
        : "rgba(42,74,57,0.07)",
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: check.value,
    transform: [{ scale: 0.6 + check.value * 0.4 }],
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(index * 40).duration(260)}
      style={[{ marginBottom: 10 }, rowStyle]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={getPrayerName(prayerId)}
        onPressIn={() => {
          press.value = withTiming(0.985, { duration: 110, easing: EASE });
        }}
        onPressOut={() => {
          press.value = withTiming(1, { duration: 160, easing: EASE });
        }}
        onPress={onToggle}
        style={{
          minHeight: 74,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: done
            ? tint
            : partial
              ? dark
                ? "rgba(212,168,75,0.45)"
                : "rgba(42,74,57,0.35)"
              : colors.border,
          backgroundColor: colors.surface,
          overflow: "hidden",
          ...cardShadow(dark),
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: dark
                ? "rgba(212,168,75,0.08)"
                : "rgba(42,74,57,0.05)",
            },
            fillStyle,
          ]}
        />

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Animated.View
            style={[
              {
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
              },
              badgeStyle,
            ]}
          >
            <Ionicons
              name={PRAYER_ICONS[prayerId]}
              size={21}
              color={done ? (dark ? "#17291f" : "#f3efe6") : tint}
            />
          </Animated.View>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text
              style={{
                fontFamily: fonts.displayBold,
                fontSize: 19,
                color: colors.compactTitle,
              }}
            >
              {getPrayerName(prayerId)}
            </Text>
            <Text
              style={{
                marginTop: 2,
                fontFamily: fonts.bodyMedium,
                fontSize: 12,
                color:
                  done || partial ? colors.heroEyebrow : colors.compactMuted,
              }}
            >
              {t("report.rakatProgress", { done: doneRakats, total: rakats })} ·{" "}
              {done
                ? t("report.markDone")
                : partial
                  ? t("report.markPartial")
                  : t("report.markTodo")}
            </Text>
          </View>

          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              borderWidth: done ? 0 : 1.5,
              borderColor: partial
                ? tint
                : dark
                  ? "rgba(243,239,230,0.28)"
                  : "rgba(42,74,57,0.28)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {partial && !done ? (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: tint,
                }}
              />
            ) : null}
            <Animated.View style={[{ position: "absolute" }, checkStyle]}>
              <Ionicons name="checkmark-circle" size={28} color={tint} />
            </Animated.View>
          </View>
        </View>

        <View
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 7,
          }}
        >
          {sections.map((item) => (
            <Pressable
              key={item.section}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.done }}
              accessibilityLabel={`${getPrayerName(prayerId)} ${getSectionLabel(item.section)}, ${item.rakats} ${t("common.rakat")}`}
              onPress={(event) => {
                event.stopPropagation();
                onToggleSection(item.section, item.done);
              }}
              hitSlop={4}
              style={{
                minHeight: 36,
                paddingHorizontal: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: item.done ? tint : colors.border,
                backgroundColor: item.done
                  ? dark
                    ? "rgba(212,168,75,0.14)"
                    : "rgba(42,74,57,0.09)"
                  : "transparent",
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Ionicons
                name={item.done ? "checkmark-circle" : "ellipse-outline"}
                size={15}
                color={item.done ? tint : colors.compactMuted}
              />
              <Text
                style={{
                  fontFamily: fonts.bodySemi,
                  fontSize: 12,
                  color: item.done ? colors.compactTitle : colors.compactMuted,
                }}
              >
                {getSectionLabel(item.section)} · {item.rakats}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** Takvimin üstündeki hızlı atlama düğmesi */
function JumpPill({
  icon,
  label,
  colors,
  dark,
  tint,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  colors: ThemeChrome;
  dark: boolean;
  tint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: dark
          ? "rgba(243,239,230,0.08)"
          : "rgba(42,74,57,0.08)",
      }}
    >
      <Ionicons name={icon} size={15} color={tint} />
      <Text
        style={{
          fontFamily: fonts.bodySemi,
          fontSize: 12,
          color: colors.compactTitle,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type ShareCardProps = {
  period: Period;
  locale: string;
  dailyDone: number;
  dailyRakats: number;
  dailyPrayerIds: PrayerGuideId[];
  week: DaySnapshot[];
  weekDone: number;
  weekRakats: number;
  month: DaySnapshot[];
  monthDone: number;
  monthRakats: number;
  monthLabel: string;
};

/** Ekrandan bağımsız, paylaşım için tasarlanmış sabit rapor şablonu. */
function ShareReportCard({
  period,
  locale,
  dailyDone,
  dailyRakats,
  dailyPrayerIds,
  week,
  weekDone,
  weekRakats,
  month,
  monthDone,
  monthRakats,
  monthLabel,
}: ShareCardProps) {
  const gold = "#d4a84b";
  const cream = "#f3efe6";
  const green = "#1a2f25";
  const softGreen = "#2a4a39";
  const dateLocale = locale === "en" ? "en-US" : "tr-TR";
  const periodTitle = t(`report.share${period[0].toUpperCase()}${period.slice(1)}`);
  const subtitle =
    period === "daily"
      ? new Date().toLocaleDateString(dateLocale, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : period === "weekly"
        ? t("report.weekSummary")
        : monthLabel;
  const completed =
    period === "daily" ? dailyDone : period === "weekly" ? weekDone : monthDone;
  const rakats =
    period === "daily"
      ? dailyRakats
      : period === "weekly"
        ? weekRakats
        : monthRakats;

  return (
    <View
      style={{
        width: 340,
        minHeight: 460,
        padding: 26,
        overflow: "hidden",
        backgroundColor: green,
      }}
    >
      <View
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: 130,
          right: -110,
          top: -100,
          backgroundColor: "rgba(212,168,75,0.13)",
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 190,
          height: 190,
          borderRadius: 95,
          left: -100,
          bottom: -80,
          backgroundColor: "rgba(243,239,230,0.06)",
        }}
      />

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: gold,
          }}
        >
          <Ionicons name="moon" size={21} color={green} />
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text
            style={{
              fontFamily: fonts.displayBold,
              fontSize: 19,
              color: cream,
            }}
          >
            {t("report.shareBrand")}
          </Text>
          <Text
            style={{
              marginTop: 1,
              fontFamily: fonts.bodyMedium,
              fontSize: 10,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: gold,
            }}
          >
            {periodTitle}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 28 }}>
        <Text
          style={{
            fontFamily: fonts.displayBold,
            fontSize: 30,
            textTransform: "capitalize",
            color: cream,
          }}
        >
          {subtitle}
        </Text>
        <Text
          style={{
            marginTop: 5,
            fontFamily: fonts.body,
            fontSize: 13,
            color: "rgba(243,239,230,0.68)",
          }}
        >
          {t("report.shareSummary", { done: completed, rakats })}
        </Text>
      </View>

      {period === "daily" ? (
        <View style={{ marginTop: 28, gap: 9 }}>
          {PRAYER_GUIDES.map((prayer) => {
            const done = dailyPrayerIds.includes(prayer.id);
            return (
              <View
                key={prayer.id}
                style={{
                  minHeight: 46,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: done
                    ? "rgba(212,168,75,0.16)"
                    : "rgba(243,239,230,0.06)",
                  borderWidth: 1,
                  borderColor: done
                    ? "rgba(212,168,75,0.42)"
                    : "rgba(243,239,230,0.08)",
                }}
              >
                <Ionicons
                  name={done ? "checkmark-circle" : "ellipse-outline"}
                  size={20}
                  color={done ? gold : "rgba(243,239,230,0.42)"}
                />
                <Text
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    fontFamily: fonts.bodySemi,
                    fontSize: 13,
                    color: cream,
                  }}
                >
                  {getPrayerName(prayer.id)}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.bodyMedium,
                    fontSize: 11,
                    color: done ? gold : "rgba(243,239,230,0.46)",
                  }}
                >
                  {done ? t("report.markDone") : t("report.markTodo")}
                </Text>
              </View>
            );
          })}
        </View>
      ) : period === "weekly" ? (
        <View
          style={{
            marginTop: 32,
            height: 190,
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 8,
          }}
        >
          {week.map((day) => (
            <View key={day.key} style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  marginBottom: 7,
                  fontFamily: fonts.bodySemi,
                  fontSize: 11,
                  color: cream,
                }}
              >
                {day.completed}
              </Text>
              <View
                style={{
                  width: "72%",
                  height: Math.max(12, (day.completed / TOTAL_PRAYERS) * 130),
                  borderRadius: 8,
                  backgroundColor:
                    day.completed === TOTAL_PRAYERS ? gold : "#4d7761",
                }}
              />
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: fonts.bodyMedium,
                  fontSize: 9,
                  textTransform: "uppercase",
                  color: "rgba(243,239,230,0.58)",
                }}
              >
                {day.date
                  .toLocaleDateString(dateLocale, { weekday: "short" })
                  .slice(0, 2)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: "row", marginBottom: 7 }}>
            {Array.from({ length: 7 }, (_, index) => (
              <Text
                key={index}
                style={{
                  width: "14.285%",
                  textAlign: "center",
                  fontFamily: fonts.bodySemi,
                  fontSize: 8,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  color: "rgba(243,239,230,0.5)",
                }}
              >
                {new Date(2024, 0, 1 + index)
                  .toLocaleDateString(dateLocale, { weekday: "short" })
                  .slice(0, 2)}
              </Text>
            ))}
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {Array.from({
              length: month[0] ? (month[0].date.getDay() + 6) % 7 : 0,
            }).map((_, index) => (
              <View key={`blank-${index}`} style={{ width: "14.285%" }} />
            ))}
            {month.map((day) => {
              const isFuture = day.date.getTime() > Date.now();
              return (
            <View
              key={day.key}
              style={{
                width: "14.285%",
                paddingVertical: 3,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 40,
                  borderRadius: 9,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: dayCellFill(
                    day.completed,
                    true,
                    isFuture,
                  ),
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.bodySemi,
                    fontSize: 10,
                    color:
                      day.completed === TOTAL_PRAYERS ? green : cream,
                  }}
                >
                  {day.date.getDate()}
                </Text>
                {!isFuture ? (
                  <Text
                    style={{
                      marginTop: 1,
                      fontFamily: fonts.bodySemi,
                      fontSize: 7,
                      lineHeight: 8,
                      color:
                        day.completed === TOTAL_PRAYERS
                          ? "rgba(23,41,31,0.65)"
                          : day.completed === 0
                            ? "rgba(243,239,230,0.35)"
                            : "rgba(243,239,230,0.72)",
                    }}
                  >
                    {day.completed}/{TOTAL_PRAYERS}
                  </Text>
                ) : null}
              </View>
            </View>
              );
            })}
          </View>
        </View>
      )}

      <View
        style={{
          marginTop: "auto",
          paddingTop: 22,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: fonts.bodyMedium,
            fontSize: 10,
            color: "rgba(243,239,230,0.46)",
          }}
        >
          {t("report.shareFooter")}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: gold,
            }}
          />
          <Text
            style={{
              fontFamily: fonts.bodySemi,
              fontSize: 10,
              color: gold,
            }}
          >
            {period === "daily" ? `${completed}/${TOTAL_PRAYERS}` : completed}
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Karuselin tek bir sayfası — başlık, gün ızgarası ve yoğunluk göstergesi */
const MonthStatsRow = memo(function MonthStatsRow({
  stats,
  cardStyle,
  colors,
  tint,
}: {
  stats: ReturnType<typeof statsForMonth> | null;
  cardStyle: ViewStyle[];
  colors: ThemeChrome;
  tint: string;
}) {
  if (!stats) return <View style={{ height: 112 }} />;

  const cards = [
    {
      icon: "calendar-clear" as const,
      value: `${stats.fullDays}`,
      label: t("report.fullDays"),
    },
    {
      icon: "flame" as const,
      value: `${stats.bestStreak}`,
      label: t("report.bestStreak"),
    },
    {
      icon: "trending-up" as const,
      value: `%${stats.consistency}`,
      label: t("report.consistency"),
    },
  ];

  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      {cards.map((card) => (
        <View
          key={card.label}
          style={[...cardStyle, { flex: 1, minHeight: 112, padding: 14 }]}
        >
          <Ionicons name={card.icon} size={20} color={tint} />
          <Text
            style={{
              marginTop: 10,
              fontFamily: fonts.displayBold,
              fontSize: 24,
              lineHeight: 30,
              height: 30,
              color: colors.compactTitle,
            }}
          >
            {card.value}
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontFamily: fonts.bodyMedium,
              fontSize: 11,
              color: colors.compactMuted,
            }}
          >
            {card.label}
          </Text>
        </View>
      ))}
    </View>
  );
});

const MonthCalendarCard = memo(function MonthCalendarCard({
  days,
  monthDate,
  today,
  colors,
  dark,
  tint,
  weekdayLabels,
  monthLabel,
  completed,
  rakats,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  days: DaySnapshot[];
  monthDate: Date;
  today: Date;
  colors: ThemeChrome;
  dark: boolean;
  tint: string;
  weekdayLabels: string[];
  monthLabel: string;
  completed: number;
  rakats: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const offset = (new Date(monthDate).getDay() + 6) % 7;
  const arrowStyle = {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: dark ? "rgba(243,239,230,0.08)" : "rgba(42,74,57,0.08)",
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 20,
          padding: 18,
        },
        cardShadow(dark),
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("report.prevMonth")}
          disabled={!canPrev}
          accessibilityState={{ disabled: !canPrev }}
          onPress={onPrev}
          hitSlop={10}
          style={[arrowStyle, { opacity: canPrev ? 1 : 0.28 }]}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={colors.compactTitle}
          />
        </Pressable>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontFamily: fonts.displayBold,
              fontSize: 24,
              textTransform: "capitalize",
              color: colors.compactTitle,
              textAlign: "center",
            }}
          >
            {monthLabel}
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.compactMuted,
              textAlign: "center",
            }}
          >
            {t("report.monthSummary", { done: completed, rakats })}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("report.nextMonth")}
          disabled={!canNext}
          accessibilityState={{ disabled: !canNext }}
          onPress={onNext}
          hitSlop={10}
          style={[arrowStyle, { opacity: canNext ? 1 : 0.28 }]}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.compactTitle}
          />
        </Pressable>
      </View>

      <View style={{ marginTop: 20, flexDirection: "row" }}>
        {weekdayLabels.map((label, index) => (
          <Text
            key={`${label}-${index}`}
            style={{
              width: "14.285%",
              textAlign: "center",
              fontFamily: fonts.bodySemi,
              fontSize: 11,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: colors.compactMuted,
            }}
          >
            {label}
          </Text>
        ))}
      </View>

      <View
        style={{
          marginTop: 8,
          minHeight: CALENDAR_BODY_HEIGHT,
          flexDirection: "row",
          flexWrap: "wrap",
          alignContent: "flex-start",
        }}
      >
        {Array.from({ length: offset }).map((_, index) => (
          <View key={`blank-${index}`} style={{ width: "14.285%" }} />
        ))}
        {days.map((day) => {
          const isFuture = day.date.getTime() > today.getTime();
          const isToday = day.key === dateKey(today);
          const done = Math.max(0, Math.min(TOTAL_PRAYERS, day.completed));
          const isFull = done === TOTAL_PRAYERS;
          return (
            <View
              key={day.key}
              accessible
              accessibilityLabel={`${day.date.getDate()} ${monthLabel}${
                isFuture ? "" : `: ${done}/${TOTAL_PRAYERS}`
              }`}
              style={{
                width: "14.285%",
                paddingVertical: 4,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 40,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: isToday ? 1.5 : 0,
                  borderColor: tint,
                  backgroundColor: dayCellFill(done, dark, isFuture),
                  paddingTop: !isFuture ? 2 : 0,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.bodySemi,
                    fontSize: 12,
                    lineHeight: 14,
                    color: isFull
                      ? "#17291f"
                      : isFuture
                        ? dark
                          ? "rgba(243,239,230,0.4)"
                          : "rgba(42,74,57,0.45)"
                        : colors.compactTitle,
                  }}
                >
                  {day.date.getDate()}
                </Text>
                {!isFuture ? (
                  <Text
                    style={{
                      marginTop: 1,
                      fontFamily: fonts.bodySemi,
                      fontSize: 10,
                      lineHeight: 12,
                      color: isFull
                        ? "rgba(23,41,31,0.8)"
                        : done === 0
                          ? dark
                            ? "rgba(243,239,230,0.55)"
                            : "rgba(42,74,57,0.6)"
                          : dark
                            ? "rgba(243,239,230,0.75)"
                            : "rgba(42,74,57,0.7)",
                    }}
                  >
                    {done}/{TOTAL_PRAYERS}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      <View
        style={{
          marginTop: 18,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          gap: 10,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.bodyMedium,
            fontSize: 11,
            color: colors.compactMuted,
            textAlign: "center",
          }}
        >
          {t("report.colorLegend")}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {Array.from({ length: TOTAL_PRAYERS + 1 }, (_, level) => (
            <View key={level} style={{ alignItems: "center", gap: 4, flex: 1 }}>
              <View
                style={{
                  width: 22,
                  height: 14,
                  borderRadius: 4,
                  backgroundColor: legendSwatch(level, dark),
                  borderWidth: level === 0 ? 1 : 0,
                  borderColor: colors.border,
                }}
              />
              <Text
                style={{
                  fontFamily: fonts.bodySemi,
                  fontSize: 11,
                  color: colors.compactMuted,
                }}
              >
                {level}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});

export default function PrayerTrackingScreen() {
  const [period, setPeriod] = useState<Period>("daily");
  const [segmentWidth, setSegmentWidth] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [monthIndex, setMonthIndex] = useState(MONTH_WINDOW - 1);
  const [shareOpen, setShareOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const shareCardRef = useRef<View>(null);
  const {
    entries,
    todayCompletedIds,
    todayRakats,
    togglePrayerManual,
    toggleSectionManual,
    isSectionDoneToday,
    todayPrayerRakats,
    todaySectionProgress,
  } = usePrayerLog();
  const { locale, resolvedTheme } = useAppSettings();
  const { width: screenWidth } = useWindowDimensions();
  const dark = resolvedTheme === "dark";
  const colors = dark ? themeColors.dark : themeColors.light;
  // Referansı sabit tut ki alt bileşenler her karede yeniden çizilmesin
  const today = useMemo(() => atStartOfDay(new Date()), []);
  const tint = dark ? "#d4a84b" : "#2a4a39";
  const track = dark ? "rgba(243,239,230,0.1)" : "rgba(42,74,57,0.1)";

  const indicator = useSharedValue(0);
  // Uzak aylara atlarken şeridi kısaca soldurmak için
  const jump = useSharedValue(1);
  // Takvim ve özet şeridi aynı kaydırma konumundan sürülür
  const scrollX = useSharedValue(0);
  const liveIndex = useSharedValue(MONTH_WINDOW - 1);

  const week = useMemo<DaySnapshot[]>(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = shiftDay(today, index - 6);
        const key = dateKey(date);
        return {
          date,
          key,
          completed: completedPrayerIdsForDate(entries, key).length,
          rakats: totalRakatsForDate(entries, key),
        };
      }),
    [entries, today.getTime()],
  );

  // Karusel sayfaları: bugünden geriye MONTH_WINDOW ay
  const monthPages = useMemo(
    () =>
      Array.from(
        { length: MONTH_WINDOW },
        (_, index) =>
          new Date(
            today.getFullYear(),
            today.getMonth() - (MONTH_WINDOW - 1 - index),
            1,
          ),
      ),
    [today.getFullYear(), today.getMonth()],
  );

  // Gezilen aylar önbellekte kalsın; ileri geri kaydırırken yeniden hesap yapılmasın
  const monthCache = useRef(new Map<string, DaySnapshot[]>());
  const entriesRef = useRef(entries);
  if (entriesRef.current !== entries) {
    entriesRef.current = entries;
    monthCache.current = new Map();
  }

  const buildMonth = useCallback((monthDate: Date): DaySnapshot[] => {
    const cacheKey = monthKeyOf(monthDate);
    const cached = monthCache.current.get(cacheKey);
    if (cached) return cached;

    const year = monthDate.getFullYear();
    const index = monthDate.getMonth();
    const count = new Date(year, index + 1, 0).getDate();
    const days = Array.from({ length: count }, (_, dayIndex) => {
      const date = new Date(year, index, dayIndex + 1);
      const key = dateKey(date);
      return {
        date,
        key,
        completed: completedPrayerIdsForDate(entriesRef.current, key).length,
        rakats: totalRakatsForDate(entriesRef.current, key),
      };
    });
    monthCache.current.set(cacheKey, days);
    return days;
  }, []);

  // Yalnızca görünen sayfa ve iki komşusu hesaplanır
  const visibleMonths = useMemo(() => {
    const map = new Map<number, DaySnapshot[]>();
    for (const offset of [-3, -2, -1, 0, 1, 2, 3]) {
      const index = monthIndex + offset;
      if (index < 0 || index >= monthPages.length) continue;
      map.set(index, buildMonth(monthPages[index]));
    }
    return map;
  }, [buildMonth, entries, monthIndex, monthPages]);

  const weekCompleted = week.reduce((sum, day) => sum + day.completed, 0);
  const weekRakats = week.reduce((sum, day) => sum + day.rakats, 0);
  const month = visibleMonths.get(monthIndex) ?? [];
  const monthCompleted = month.reduce((sum, day) => sum + day.completed, 0);
  const monthRakats = month.reduce((sum, day) => sum + day.rakats, 0);
  const monthFormatter = useCallback(
    (date: Date) =>
      date.toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
        month: "long",
        year: "numeric",
      }),
    [locale],
  );

  // İlk kare ölçülene kadar ekran genişliğinden tahmin et ki sayfalar hizalı doğsun
  const cardWidth = pageWidth || Math.max(0, screenWidth - 40);
  const pageStep = cardWidth + MONTH_GAP;
  /**
   * Karusel platformun kendi yatay kaydırmasıyla sürülür.
   * Sekme değişiminde bölüm unmount olduğu için özel bir hareket
   * algılayıcısı kopuk kalıyordu; native kaydırma her mount'ta taze kurulur.
   */
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      scrollRef.current?.scrollTo({ x: index * pageStep, y: 0, animated });
    },
    [pageStep],
  );

  const monthIndexRef = useRef(monthIndex);
  monthIndexRef.current = monthIndex;
  // Titreşim yalnızca ay gerçekten değişince çalsın
  const hapticIndexRef = useRef(monthIndex);

  // Bölüme her dönüşte şerit aktif aya hizalanır; hizalanana dek görünmez kalır
  useEffect(() => {
    if (period !== "monthly") return;
    jump.value = 0;
    const id = requestAnimationFrame(() => {
      scrollToIndex(monthIndexRef.current, false);
      scrollX.value = monthIndexRef.current * pageStep;
      liveIndex.value = monthIndexRef.current;
      jump.value = withTiming(1, { duration: 180, easing: EASE });
    });
    return () => cancelAnimationFrame(id);
  }, [jump, liveIndex, pageStep, period, scrollToIndex, scrollX]);

  // Kaydırma sürerken sayfa değişimini anında yansıt; veriler geride kalmasın
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      if (pageStep <= 0) return;
      const raw = Math.round(event.contentOffset.x / pageStep);
      const next = Math.max(0, Math.min(MONTH_WINDOW - 1, raw));
      if (next !== liveIndex.value) {
        liveIndex.value = next;
        runOnJS(setMonthIndex)(next);
      }
    },
  });

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageStep <= 0) return;
      const raw = Math.round(event.nativeEvent.contentOffset.x / pageStep);
      const next = Math.max(0, Math.min(MONTH_WINDOW - 1, raw));
      setMonthIndex(next);
      if (next !== hapticIndexRef.current) {
        hapticIndexRef.current = next;
        hapticSelection();
      }
    },
    [pageStep],
  );

  const stepToMonth = useCallback(
    (delta: number) => {
      // Referanstan okunur ki ok düğmeleri her ay değişiminde yeniden doğmasın
      const current = monthIndexRef.current;
      const next = Math.max(0, Math.min(MONTH_WINDOW - 1, current + delta));
      if (next === current) return;
      hapticSelection();
      hapticIndexRef.current = next;
      monthIndexRef.current = next;
      liveIndex.value = next;
      setMonthIndex(next);
      scrollToIndex(next, true);
    },
    [liveIndex, scrollToIndex],
  );

  const goPrevMonth = useCallback(() => stepToMonth(-1), [stepToMonth]);
  const goNextMonth = useCallback(() => stepToMonth(1), [stepToMonth]);

  const applyJump = useCallback(
    (target: number) => {
      setMonthIndex(target);
      hapticIndexRef.current = target;
      monthIndexRef.current = target;
      liveIndex.value = target;
      scrollX.value = target * pageStep;
      scrollToIndex(target, false);
      jump.value = withTiming(1, { duration: 240, easing: EASE });
    },
    [jump, liveIndex, pageStep, scrollToIndex, scrollX],
  );

  /** Uzak aylara atlama — aradaki sayfaları taramak yerine yumuşak geçiş */
  const jumpToPage = useCallback(
    (target: number) => {
      if (target === monthIndex) return;
      hapticSelection();
      jump.value = withTiming(
        0,
        { duration: 150, easing: EASE },
        (finished) => {
          if (finished) runOnJS(applyJump)(target);
        },
      );
    },
    [applyJump, jump, monthIndex],
  );

  // En eski kayıtlı ay — hiç kayıt yoksa atlama düğmesi gösterilmez
  const oldestIndex = useMemo(() => {
    let oldest: string | null = null;
    for (const entry of entries) {
      if (!oldest || entry.date < oldest) oldest = entry.date;
    }
    if (!oldest) return null;

    const [year, month] = oldest.split("-").map(Number);
    const distance =
      (today.getFullYear() - year) * 12 + (today.getMonth() - (month - 1));
    return Math.max(0, MONTH_WINDOW - 1 - distance);
  }, [entries, today]);

  const goToCurrentMonth = useCallback(
    () => jumpToPage(MONTH_WINDOW - 1),
    [jumpToPage],
  );
  const goToOldestMonth = useCallback(
    () => jumpToPage(oldestIndex ?? 0),
    [jumpToPage, oldestIndex],
  );

  const showTodayJump = monthIndex < MONTH_WINDOW - 1;
  const showOldestJump = oldestIndex !== null && monthIndex > oldestIndex;

  const trackStyle = useAnimatedStyle(() => ({ opacity: jump.value }));
  const statsTrackStyle = useAnimatedStyle(() => ({
    opacity: jump.value,
    transform: [{ translateX: -scrollX.value }],
  }));

  const weekdayLabels = useMemo(() => {
    // 2024-01-01 pazartesi — kısa gün adlarını yerelden üret
    return Array.from({ length: 7 }, (_, index) =>
      new Date(2024, 0, 1 + index)
        .toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
          weekday: "short",
        })
        .slice(0, 2),
    );
  }, [locale]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicator.value }],
  }));

  const selectPeriod = (next: Period) => {
    if (next === period) return;
    hapticSelection();
    setPeriod(next);
    indicator.value = withTiming(PERIODS.indexOf(next) * segmentWidth, {
      duration: 260,
      easing: EASE,
    });
  };

  const onSegmentLayout = (event: LayoutChangeEvent) => {
    const width = (event.nativeEvent.layout.width - 8) / PERIODS.length;
    setSegmentWidth(width);
    indicator.value = PERIODS.indexOf(period) * width;
  };

  const togglePrayer = async (prayerId: PrayerGuideId) => {
    const wasDone = todayCompletedIds.includes(prayerId);
    await togglePrayerManual(prayerId);
    if (wasDone) {
      hapticSelection();
      return;
    }
    hapticSuccess();
    playMarkDoneSound();
  };

  const toggleSection = async (
    prayerId: PrayerGuideId,
    section: PrayerSectionKind,
    wasDone: boolean,
  ) => {
    await toggleSectionManual(prayerId, section);
    if (wasDone) {
      hapticSelection();
      return;
    }
    hapticSuccess();
    playMarkDoneSound();
  };

  const openSharePreview = () => {
    hapticSelection();
    setShareOpen(true);
  };

  const shareReportImage = async () => {
    if (!shareCardRef.current || sharing) return;
    setSharing(true);
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert(t("report.shareUnavailable"));
        return;
      }
      const uri = await captureRef(shareCardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        UTI: "public.png",
        dialogTitle: t("report.shareReport"),
      });
    } catch {
      Alert.alert(t("report.shareError"));
    } finally {
      setSharing(false);
    }
  };

  const cardStyle = [
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 20,
    },
    cardShadow(dark),
  ];

  return (
    <>
      <SliverTabScreen
      image={bannerForTheme("takipBanner", dark)}
      eyebrow={t("tabs.tracking")}
      title={t("report.title")}
      subtitle={t("report.subtitle")}
      compactSubtitle={t("tabs.tracking")}
      expandedContent={196}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
    >
      <View
        accessibilityRole="tablist"
        onLayout={onSegmentLayout}
        style={{
          flexDirection: "row",
          padding: 4,
          borderRadius: 16,
          backgroundColor: dark
            ? "rgba(243,239,230,0.07)"
            : "rgba(42,74,57,0.08)",
        }}
      >
        {segmentWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                left: 4,
                top: 4,
                bottom: 4,
                width: segmentWidth,
                borderRadius: 12,
                backgroundColor: colors.surfaceRaised,
              },
              cardShadow(dark),
              indicatorStyle,
            ]}
          />
        ) : null}

        {PERIODS.map((item) => {
          const active = period === item;
          return (
            <Pressable
              key={item}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => selectPeriod(item)}
              style={{
                minHeight: 44,
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: active ? fonts.bodySemi : fonts.bodyMedium,
                  fontSize: 13,
                  color: active
                    ? colors.compactTitle
                    : dark
                      ? "rgba(243,239,230,0.58)"
                      : "rgba(42,74,57,0.62)",
                }}
              >
                {t(`report.${item}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: 14, alignItems: "flex-end" }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("report.shareReport")}
          onPress={openSharePreview}
          style={{
            minHeight: 40,
            paddingHorizontal: 15,
            borderRadius: 999,
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            backgroundColor: tint,
          }}
        >
          <Ionicons
            name="share-social-outline"
            size={17}
            color={dark ? "#17291f" : "#f3efe6"}
          />
          <Text
            style={{
              fontFamily: fonts.bodySemi,
              fontSize: 12,
              color: dark ? "#17291f" : "#f3efe6",
            }}
          >
            {t("report.shareReport")}
          </Text>
        </Pressable>
      </View>

      {period === "daily" ? (
        <Animated.View key="daily" entering={FadeIn.duration(240)}>
          <Animated.View
            entering={FadeIn.duration(280)}
            style={[
              ...cardStyle,
              {
                marginTop: 20,
                padding: 20,
                flexDirection: "row",
                alignItems: "center",
              },
            ]}
          >
            <ProgressRing
              size={92}
              thickness={8}
              progress={todayCompletedIds.length / TOTAL_PRAYERS}
              track={track}
              tint={tint}
            >
              <Text
                style={{
                  fontFamily: fonts.displayBold,
                  fontSize: 26,
                  color: colors.compactTitle,
                }}
              >
                {todayCompletedIds.length}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.bodyMedium,
                  fontSize: 11,
                  color: colors.compactMuted,
                }}
              >
                / {TOTAL_PRAYERS}
              </Text>
            </ProgressRing>

            <View style={{ flex: 1, marginLeft: 18 }}>
              <Text
                style={{
                  fontFamily: fonts.bodySemi,
                  fontSize: 12,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: colors.heroEyebrow,
                }}
              >
                {t("report.today")}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: fonts.displayBold,
                  fontSize: 24,
                  color: colors.compactTitle,
                }}
              >
                {t("report.rakats", { count: todayRakats })}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: fonts.body,
                  fontSize: 13,
                  lineHeight: 18,
                  color: colors.compactMuted,
                }}
              >
                {t("report.todaySummary", {
                  done: todayCompletedIds.length,
                  total: TOTAL_PRAYERS,
                  rakats: todayRakats,
                })}
              </Text>
            </View>
          </Animated.View>

          <Text
            style={{
              marginTop: 26,
              marginBottom: 10,
              fontFamily: fonts.bodySemi,
              fontSize: 12,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: colors.heroEyebrow,
            }}
          >
            {t("report.todayMark")}
          </Text>

          {PRAYER_GUIDES.map((prayer, index) => {
            const progress = todaySectionProgress(prayer.id);
            const isDone = todayCompletedIds.includes(prayer.id);
            const sections = getSectionSummaries(prayer.steps).map((item) => ({
              section: item.section,
              rakats: item.rakatCount,
              done: isSectionDoneToday(prayer.id, item.section),
            }));
            return (
              <PrayerRow
                key={prayer.id}
                prayerId={prayer.id}
                rakats={prayer.rakats}
                doneRakats={todayPrayerRakats(prayer.id)}
                done={isDone}
                partial={!isDone && progress.done > 0}
                sections={sections}
                index={index}
                onToggle={() => void togglePrayer(prayer.id)}
                onToggleSection={(section, wasDone) =>
                  void toggleSection(prayer.id, section, wasDone)
                }
                colors={colors}
                dark={dark}
                tint={tint}
              />
            );
          })}
        </Animated.View>
      ) : null}

      {period === "weekly" ? (
        <Animated.View key="weekly" entering={FadeIn.duration(240)}>
          <Animated.View
            entering={FadeIn.duration(280)}
            style={[...cardStyle, { marginTop: 20, padding: 20 }]}
          >
            <Text
              style={{
                fontFamily: fonts.displayBold,
                fontSize: 26,
                color: colors.compactTitle,
              }}
            >
              {t("report.weekSummary")}
            </Text>

            <View
              style={{
                marginTop: 20,
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              {week.map((day, index) => (
                <View key={day.key} style={{ flex: 1, alignItems: "center" }}>
                  <Text
                    style={{
                      marginBottom: 6,
                      fontFamily: fonts.bodySemi,
                      fontSize: 11,
                      color: colors.compactMuted,
                    }}
                  >
                    {day.completed}
                  </Text>
                  <AnimatedBar
                    ratio={day.completed / TOTAL_PRAYERS}
                    index={index}
                    track={track}
                    color={
                      day.completed === TOTAL_PRAYERS
                        ? "#d4a84b"
                        : dark
                          ? "#4d7761"
                          : "#2a4a39"
                    }
                  />
                  <Text
                    style={{
                      marginTop: 8,
                      fontFamily: fonts.bodyMedium,
                      fontSize: 11,
                      color: colors.compactMuted,
                    }}
                  >
                    {day.date
                      .toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
                        weekday: "short",
                      })
                      .slice(0, 3)}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <View style={{ marginTop: 14, flexDirection: "row", gap: 12 }}>
            {[
              {
                icon: "checkmark-done-circle" as const,
                value: `${weekCompleted}/${TOTAL_PRAYERS * 7}`,
                label: t("report.completed"),
              },
              {
                icon: "flame" as const,
                value: String(calculateStreak(week)),
                label: t("report.streak"),
              },
              {
                icon: "repeat" as const,
                value: String(weekRakats),
                label: t("report.rakatsShort"),
              },
            ].map((stat, index) => (
              <Animated.View
                key={stat.label}
                entering={FadeIn.delay(80 + index * 50).duration(260)}
                style={[...cardStyle, { flex: 1, minHeight: 112, padding: 14 }]}
              >
                <Ionicons name={stat.icon} size={20} color={tint} />
                <Text
                  style={{
                    marginTop: 10,
                    fontFamily: fonts.displayBold,
                    fontSize: 24,
                    color: colors.compactTitle,
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontFamily: fonts.bodyMedium,
                    fontSize: 11,
                    color: colors.compactMuted,
                  }}
                >
                  {stat.label}
                </Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      ) : null}

      {period === "monthly" ? (
        <Animated.View entering={FadeIn.duration(240)}>
          {showOldestJump || showTodayJump ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={{
                marginTop: 16,
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              {showOldestJump ? (
                <JumpPill
                  icon="play-skip-back-outline"
                  label={t("report.oldestMonth")}
                  colors={colors}
                  dark={dark}
                  tint={tint}
                  onPress={goToOldestMonth}
                />
              ) : null}
              {showTodayJump ? (
                <JumpPill
                  icon="today-outline"
                  label={t("report.backToToday")}
                  colors={colors}
                  dark={dark}
                  tint={tint}
                  onPress={goToCurrentMonth}
                />
              ) : null}
            </Animated.View>
          ) : null}

          <Animated.View
            onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}
            style={[
              { marginTop: showOldestJump || showTodayJump ? 12 : 20 },
              trackStyle,
            ]}
          >
            <Animated.ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={pageStep}
              snapToAlignment="start"
              directionalLockEnabled
              scrollEventThrottle={16}
              onScroll={scrollHandler}
              onMomentumScrollEnd={handleMomentumEnd}
              contentContainerStyle={{ alignItems: "flex-start" }}
            >
              {monthPages.map((pageMonth, index) => {
                const days = visibleMonths.get(index);
                return (
                  <View
                    key={monthKeyOf(pageMonth)}
                    style={{
                      width: cardWidth,
                      marginRight:
                        index === MONTH_WINDOW - 1 ? 0 : MONTH_GAP,
                    }}
                  >
                    {days ? (
                      <MonthCalendarCard
                        days={days}
                        monthDate={pageMonth}
                        today={today}
                        colors={colors}
                        dark={dark}
                        tint={tint}
                        weekdayLabels={weekdayLabels}
                        monthLabel={monthFormatter(pageMonth)}
                        completed={days.reduce(
                          (sum, day) => sum + day.completed,
                          0,
                        )}
                        rakats={days.reduce((sum, day) => sum + day.rakats, 0)}
                        canPrev={index > 0}
                        canNext={index < MONTH_WINDOW - 1}
                        onPrev={goPrevMonth}
                        onNext={goNextMonth}
                      />
                    ) : null}
                  </View>
                );
              })}
            </Animated.ScrollView>
          </Animated.View>

          {/* Özet şeridi takvimle aynı kaydırma konumundan sürülür */}
          <View style={{ marginTop: 14, overflow: "hidden" }}>
            <Animated.View style={[{ flexDirection: "row" }, statsTrackStyle]}>
              {monthPages.map((pageMonth, index) => {
                const days = visibleMonths.get(index);
                return (
                  <View
                    key={monthKeyOf(pageMonth)}
                    style={{
                      width: cardWidth,
                      marginRight: index === MONTH_WINDOW - 1 ? 0 : MONTH_GAP,
                    }}
                  >
                    <MonthStatsRow
                      stats={days ? statsForMonth(days, today) : null}
                      cardStyle={cardStyle}
                      colors={colors}
                      tint={tint}
                    />
                  </View>
                );
              })}
            </Animated.View>
          </View>
        </Animated.View>
      ) : null}
      </SliverTabScreen>

      <Modal
        visible={shareOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => !sharing && setShareOpen(false)}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingVertical: 28,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(5,10,7,0.82)",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 380,
              maxHeight: "92%",
              padding: 14,
              borderRadius: 24,
              backgroundColor: colors.surface,
            }}
          >
            <View
              style={{
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: fonts.displayBold,
                    fontSize: 22,
                    color: colors.compactTitle,
                  }}
                >
                  {t("report.sharePreview")}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    fontFamily: fonts.body,
                    fontSize: 12,
                    color: colors.compactMuted,
                  }}
                >
                  {t(`report.${period}`)}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("common.close")}
                disabled={sharing}
                onPress={() => setShareOpen(false)}
                hitSlop={10}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: dark
                    ? "rgba(243,239,230,0.08)"
                    : "rgba(42,74,57,0.08)",
                }}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={colors.compactTitle}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: "center" }}
            >
              <View ref={shareCardRef} collapsable={false}>
                <ShareReportCard
                  period={period}
                  locale={locale}
                  dailyDone={todayCompletedIds.length}
                  dailyRakats={todayRakats}
                  dailyPrayerIds={todayCompletedIds}
                  week={week}
                  weekDone={weekCompleted}
                  weekRakats={weekRakats}
                  month={month}
                  monthDone={monthCompleted}
                  monthRakats={monthRakats}
                  monthLabel={monthFormatter(monthPages[monthIndex])}
                />
              </View>
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              disabled={sharing}
              onPress={() => void shareReportImage()}
              style={{
                minHeight: 50,
                marginTop: 14,
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                opacity: sharing ? 0.7 : 1,
                backgroundColor: tint,
              }}
            >
              {sharing ? (
                <ActivityIndicator
                  size="small"
                  color={dark ? "#17291f" : "#f3efe6"}
                />
              ) : (
                <Ionicons
                  name="share-social"
                  size={19}
                  color={dark ? "#17291f" : "#f3efe6"}
                />
              )}
              <Text
                style={{
                  fontFamily: fonts.bodySemi,
                  fontSize: 14,
                  color: dark ? "#17291f" : "#f3efe6",
                }}
              >
                {sharing
                  ? t("report.preparingShare")
                  : t("report.shareAsImage")}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
