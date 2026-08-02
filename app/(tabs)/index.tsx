import { useEffect, useRef } from "react";
import { Link } from "expo-router";
import {
  Animated,
  Easing,
  ImageBackground,
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import { IMAGES } from "@/constants/images";
import { getDuaText, getTodaysDua } from "@/data/content";
import { formatDate, t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";
import { fonts } from "@/constants/fonts";

const ease = Easing.bezier(0.22, 1, 0.36, 1);

export default function HomeScreen() {
  const { locale } = useAppSettings();
  const dua = getTodaysDua();
  const duaText = getDuaText(dua.id);
  const dateLabel = formatDate(new Date(), locale);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(20);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 520,
        easing: ease,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 520,
        easing: ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide, locale]);

  return (
    <ScrollView
      key={locale}
      className="flex-1 bg-sand-50 dark:bg-forest-950"
      contentContainerClassName="pb-10"
    >
      <Animated.View style={{ opacity: fade }}>
        <ImageBackground
          source={IMAGES.homeHero}
          className="overflow-hidden"
          resizeMode="cover"
        >
          <View className="bg-forest-950/70 px-5 pb-14 pt-6">
            <Text
              style={{ fontFamily: fonts.bodyMedium }}
              className="text-sm uppercase tracking-widest text-sand-200/80"
            >
              {t("appName")}
            </Text>
            <Text
              style={{ fontFamily: fonts.displayBold }}
              className="mt-2 text-[34px] leading-10 text-sand-50"
            >
              {dateLabel}
            </Text>
            <Text
              style={{ fontFamily: fonts.body }}
              className="mt-2 text-base text-sand-200"
            >
              {t("home.subtitle")}
            </Text>
          </View>
        </ImageBackground>
      </Animated.View>

      <Animated.View
        style={{ opacity: fade, transform: [{ translateY: slide }] }}
        className="-mt-5 mx-4 overflow-hidden rounded-2xl border border-sand-200 bg-sand-100 px-5 py-5 dark:border-forest-700 dark:bg-forest-900"
      >
        <Text
          style={{ fontFamily: fonts.bodySemi }}
          className="text-xs uppercase tracking-wider text-gold-500"
        >
          {t("home.todaysDua")} · {duaText.occasion}
        </Text>
        <Text
          style={{ fontFamily: fonts.displayBold }}
          className="mt-2 text-[26px] text-forest-900 dark:text-sand-50"
        >
          {duaText.title}
        </Text>
        <Text
          style={{ fontFamily: fonts.displayMedium }}
          className="mt-4 text-right text-2xl leading-10 text-forest-700 dark:text-sand-100"
        >
          {dua.arabic}
        </Text>
        <Text
          style={{ fontFamily: fonts.body }}
          className="mt-3 text-base italic text-forest-500 dark:text-sand-200"
        >
          {dua.latin}
        </Text>
        <Text
          style={{ fontFamily: fonts.body }}
          className="mt-3 text-base leading-6 text-forest-900 dark:text-sand-100"
        >
          {duaText.meaning}
        </Text>

        <Link href="/dualar" asChild>
          <Pressable className="mt-5 self-start rounded-full bg-forest-700 px-4 py-2 active:opacity-80 dark:bg-gold-500">
            <Text
              style={{ fontFamily: fonts.bodySemi }}
              className="text-sand-50 dark:text-forest-950"
            >
              {t("home.allDuas")}
            </Text>
          </Pressable>
        </Link>
      </Animated.View>

      <Animated.View
        style={{ opacity: fade, transform: [{ translateY: slide }] }}
        className="mx-4 mt-6"
      >
        <Text
          style={{ fontFamily: fonts.displayBold }}
          className="mb-3 text-[22px] text-forest-900 dark:text-sand-50"
        >
          {t("home.quickStart")}
        </Text>
        <Link href="/namaz" asChild>
          <Pressable className="mb-3 rounded-2xl border border-sand-200 bg-white px-5 py-4 active:bg-sand-100 dark:border-forest-700 dark:bg-forest-900 dark:active:bg-forest-700">
            <Text
              style={{ fontFamily: fonts.bodySemi }}
              className="text-base text-forest-900 dark:text-sand-50"
            >
              {t("home.howToPray")}
            </Text>
            <Text
              style={{ fontFamily: fonts.body }}
              className="mt-1 text-sm text-forest-500 dark:text-sand-200"
            >
              {t("home.howToPrayHint")}
            </Text>
          </Pressable>
        </Link>
        <Link href="/namaz/sabah" asChild>
          <Pressable className="rounded-2xl border border-sand-200 bg-white px-5 py-4 active:bg-sand-100 dark:border-forest-700 dark:bg-forest-900 dark:active:bg-forest-700">
            <Text
              style={{ fontFamily: fonts.bodySemi }}
              className="text-base text-forest-900 dark:text-sand-50"
            >
              {t("home.fajrGuide")}
            </Text>
            <Text
              style={{ fontFamily: fonts.body }}
              className="mt-1 text-sm text-forest-500 dark:text-sand-200"
            >
              {t("home.fajrHint")}
            </Text>
          </Pressable>
        </Link>
      </Animated.View>
    </ScrollView>
  );
}
