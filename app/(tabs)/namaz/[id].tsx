import { useLocalSearchParams, Stack } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import {
  PRAYER_GUIDES,
  getPrayerName,
  getPrayerStep,
  getPrayerSummary,
} from "@/data/content";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";

export default function PrayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale, resolvedTheme } = useAppSettings();
  const prayer = PRAYER_GUIDES.find((item) => item.id === id);
  const dark = resolvedTheme === "dark";

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
      <Stack.Screen
        options={{
          title: name,
          headerStyle: { backgroundColor: dark ? "#0f1a15" : "#1a2f25" },
          headerTintColor: "#f3efe6",
        }}
      />
      <ScrollView
        key={locale}
        className="flex-1 bg-sand-50 dark:bg-forest-950"
        contentContainerClassName="px-4 py-5 pb-12"
      >
        <View className="mb-5 rounded-2xl bg-forest-900 px-5 py-5 dark:bg-forest-900">
          <Text className="text-sm text-sand-200">
            {prayer.rakats} {t("common.rakat")}
          </Text>
          <Text className="mt-1 text-2xl font-bold text-sand-50">{name}</Text>
          <Text className="mt-2 text-base leading-6 text-sand-200">
            {getPrayerSummary(prayer.id)}
          </Text>
        </View>

        {prayer.steps.map((step, index) => {
          const text = getPrayerStep(prayer.id, index);
          return (
            <View
              key={`${prayer.id}-${index}`}
              className="mb-3 flex-row rounded-2xl border border-sand-200 bg-white p-4 dark:border-forest-700 dark:bg-forest-900"
            >
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-forest-700">
                <Text className="font-bold text-sand-50">{index + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-forest-900 dark:text-sand-50">
                  {text.title}
                </Text>
                <Text className="mt-1 text-sm leading-5 text-forest-500 dark:text-sand-200">
                  {text.detail}
                </Text>
                {step.arabic ? (
                  <Text className="mt-2 text-sm font-medium text-gold-500">
                    {step.arabic}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </>
  );
}
