import { Link } from "expo-router";
import {
  ImageBackground,
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import { IMAGES } from "@/constants/images";
import {
  PRAYER_GUIDES,
  getPrayerName,
  getPrayerSummary,
} from "@/data/content";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";

export default function NamazListScreen() {
  const { locale } = useAppSettings();

  return (
    <ScrollView
      key={locale}
      className="flex-1 bg-sand-50 dark:bg-forest-950"
      contentContainerClassName="pb-10"
    >
      <ImageBackground
        source={IMAGES.namazBanner}
        className="mb-4"
        resizeMode="cover"
      >
        <View className="bg-forest-950/65 px-4 py-8">
          <Text className="text-2xl font-bold text-sand-50">
            {t("prayer.guideTitle")}
          </Text>
          <Text className="mt-2 text-sm leading-5 text-sand-200">
            {t("prayer.intro")}
          </Text>
        </View>
      </ImageBackground>

      <View className="px-4">
        {PRAYER_GUIDES.map((prayer) => (
          <Link key={prayer.id} href={`/namaz/${prayer.id}`} asChild>
            <Pressable className="mb-3 flex-row items-center rounded-2xl border border-sand-200 bg-white px-4 py-4 active:bg-sand-100 dark:border-forest-700 dark:bg-forest-900 dark:active:bg-forest-700">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-forest-100 dark:bg-forest-700">
                <Text className="text-lg font-bold text-forest-700 dark:text-sand-50">
                  {prayer.rakats}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-forest-900 dark:text-sand-50">
                  {getPrayerName(prayer.id)}
                </Text>
                <Text className="mt-1 text-sm text-forest-500 dark:text-sand-200">
                  {getPrayerSummary(prayer.id)}
                </Text>
              </View>
              <Text className="text-forest-500 dark:text-sand-200">›</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}
