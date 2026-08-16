import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PRAYER_GUIDES, getPrayerName } from "@/data/content";
import { formatDate, t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";
import { usePrayerLog } from "@/lib/prayer-log-context";
import { fonts } from "@/constants/fonts";
import { pageBackground } from "@/constants/theme";
import { StackAppHeader } from "@/components/tab-hero-header";

function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function ReportScreen() {
  const router = useRouter();
  const { locale, resolvedTheme } = useAppSettings();
  const {
    dayReports,
    todayKey,
    todayRakats,
    todayCompletedIds,
    isPrayerDoneToday,
    togglePrayerManual,
  } = usePrayerLog();
  const dark = resolvedTheme === "dark";
  const pageBg = pageBackground(dark);

  const history = dayReports.filter(
    (day) => day.date !== todayKey || day.entryCount > 0,
  );
  const hasHistory = history.some((r) => r.entryCount > 0);

  return (
    <View className="flex-1" style={{ backgroundColor: pageBg }}>
      <StackAppHeader
        title={t("report.title")}
        subtitle={t("report.subtitle")}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace("/(tabs)");
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{ fontFamily: fonts.bodySemi }}
          className="mt-6 text-[12px] uppercase tracking-[2px] text-gold-500"
        >
          {t("report.todayMark")}
        </Text>
        <Text
          style={{ fontFamily: fonts.body }}
          className="mt-1 text-[13px] text-forest-500 dark:text-sand-200/60"
        >
          {t("report.todayMarkHint")}
        </Text>
        <Text
          style={{ fontFamily: fonts.displayBold }}
          className="mt-2 text-[20px] text-forest-900 dark:text-sand-50"
        >
          {t("report.todaySummary", {
            done: todayCompletedIds.length,
            total: PRAYER_GUIDES.length,
            rakats: todayRakats,
          })}
        </Text>

        <View className="mt-4">
          {PRAYER_GUIDES.map((guide) => {
            const done = isPrayerDoneToday(guide.id);
            return (
              <Pressable
                key={guide.id}
                onPress={() => void togglePrayerManual(guide.id)}
                className="mb-2 flex-row items-center border border-sand-200/80 bg-sand-50 px-3 py-3 active:opacity-80 dark:border-forest-700 dark:bg-forest-900"
              >
                <Ionicons
                  name={done ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={
                    done
                      ? dark
                        ? "#d4a84b"
                        : "#2a4a39"
                      : dark
                        ? "rgba(243,239,230,0.35)"
                        : "rgba(42,74,57,0.35)"
                  }
                />
                <Text
                  style={{ fontFamily: fonts.bodySemi }}
                  className={`ml-3 flex-1 text-[16px] ${
                    done
                      ? "text-forest-800 dark:text-sand-50"
                      : "text-forest-700 dark:text-sand-200"
                  }`}
                >
                  {getPrayerName(guide.id)}
                </Text>
                <Text
                  style={{ fontFamily: fonts.body }}
                  className="text-[12px] text-forest-500/70 dark:text-sand-200/45"
                >
                  {done ? t("report.markDone") : t("report.markTodo")}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text
          style={{ fontFamily: fonts.bodySemi }}
          className="mt-10 text-[12px] uppercase tracking-[2px] text-gold-500"
        >
          {t("report.history")}
        </Text>

        {!hasHistory ? (
          <Text
            style={{ fontFamily: fonts.body }}
            className="mt-4 text-[15px] leading-6 text-forest-500 dark:text-sand-200/70"
          >
            {t("report.empty")}
          </Text>
        ) : (
          history.map((day) => {
            const isToday = day.date === todayKey;
            const dateLabel = isToday
              ? t("report.today")
              : formatDate(parseDateKey(day.date), locale);

            return (
              <View
                key={day.date}
                className="mt-5 border-b border-sand-200/80 pb-5 dark:border-forest-800"
              >
                <View className="flex-row items-baseline justify-between">
                  <Text
                    style={{ fontFamily: fonts.displayBold }}
                    className="text-xl text-forest-900 dark:text-sand-50"
                  >
                    {dateLabel}
                  </Text>
                  <Text
                    style={{ fontFamily: fonts.bodySemi }}
                    className="text-[13px] text-gold-500"
                  >
                    {t("report.rakats", { count: day.totalRakats })}
                  </Text>
                </View>

                {day.completedPrayerIds.length === 0 ? (
                  <Text
                    style={{ fontFamily: fonts.body }}
                    className="mt-2 text-[14px] text-forest-500/70 dark:text-sand-200/45"
                  >
                    {t("report.none")}
                  </Text>
                ) : (
                  <>
                    <Text
                      style={{ fontFamily: fonts.body }}
                      className="mt-1 text-[13px] text-forest-500 dark:text-sand-200/60"
                    >
                      {t("report.prayersDone", {
                        count: day.completedPrayerIds.length,
                      })}
                    </Text>
                    <View className="mt-3 gap-2">
                      {PRAYER_GUIDES.filter((g) =>
                        day.completedPrayerIds.includes(g.id),
                      ).map((g) => (
                        <View
                          key={g.id}
                          className="flex-row items-center gap-2"
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={dark ? "#d4a84b" : "#2a4a39"}
                          />
                          <Text
                            style={{ fontFamily: fonts.bodySemi }}
                            className="text-[15px] text-forest-800 dark:text-sand-100"
                          >
                            {getPrayerName(g.id)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
