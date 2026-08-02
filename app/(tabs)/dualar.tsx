import { ImageBackground, ScrollView, Text, View } from "react-native";
import { IMAGES } from "@/constants/images";
import {
  DAILY_DUAS,
  getDayOfYear,
  getDuaText,
  getTodaysDua,
} from "@/data/content";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";

export default function DualarScreen() {
  const { locale } = useAppSettings();
  const today = getTodaysDua();
  const todayText = getDuaText(today.id);
  const dayIndex = (getDayOfYear() - 1) % DAILY_DUAS.length;

  return (
    <ScrollView
      key={locale}
      className="flex-1 bg-sand-50 dark:bg-forest-950"
      contentContainerClassName="px-4 py-5 pb-10"
    >
      <ImageBackground
        source={IMAGES.dualarBanner}
        className="mb-5 overflow-hidden rounded-2xl"
        resizeMode="cover"
      >
        <View className="bg-forest-950/75 px-5 py-5">
          <Text className="text-xs font-semibold uppercase tracking-wider text-gold-400">
            {t("duas.todayLabel", {
              current: dayIndex + 1,
              total: DAILY_DUAS.length,
            })}
          </Text>
          <Text className="mt-2 text-xl font-bold text-sand-50">
            {todayText.title}
          </Text>
          <Text className="mt-1 text-sm text-sand-200">{todayText.occasion}</Text>
          <Text className="mt-4 text-right text-2xl leading-10 text-sand-100">
            {today.arabic}
          </Text>
          <Text className="mt-3 text-base italic text-sand-200">{today.latin}</Text>
          <Text className="mt-3 text-base leading-6 text-sand-50">
            {todayText.meaning}
          </Text>
        </View>
      </ImageBackground>

      <Text className="mb-3 text-lg font-bold text-forest-900 dark:text-sand-50">
        {t("duas.allTitle")}
      </Text>
      <Text className="mb-4 text-sm text-forest-500 dark:text-sand-200">
        {t("duas.allHint")}
      </Text>

      {DAILY_DUAS.map((dua, index) => {
        const text = getDuaText(dua.id);
        const isToday = dua.id === today.id;
        return (
          <View
            key={dua.id}
            className={`mb-3 rounded-2xl border px-4 py-4 ${
              isToday
                ? "border-gold-400 bg-sand-100 dark:bg-forest-900"
                : "border-sand-200 bg-white dark:border-forest-700 dark:bg-forest-900"
            }`}
          >
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-forest-900 dark:text-sand-50">
                {index + 1}. {text.title}
              </Text>
              {isToday ? (
                <Text className="rounded-full bg-gold-400/20 px-2 py-0.5 text-xs font-semibold text-gold-500">
                  {t("common.today")}
                </Text>
              ) : null}
            </View>
            <Text className="text-right text-lg text-forest-700 dark:text-sand-100">
              {dua.arabic}
            </Text>
            <Text className="mt-2 text-sm italic text-forest-500 dark:text-sand-200">
              {dua.latin}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-forest-900 dark:text-sand-100">
              {text.meaning}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
