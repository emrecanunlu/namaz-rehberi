import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  Animated,
  ImageBackground,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
  type ScrollViewProps,
  StatusBar,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts } from "@/constants/fonts";
import {
  heroOverlayColors,
  pageBackground,
  pageFadeColors,
  themeColors,
} from "@/constants/theme";
import { useAppSettings } from "@/lib/settings-context";

/** Collapsed toolbar yüksekliği (safe area hariç) */
export const SLIVER_COLLAPSED = 56;

export type SliverTabScreenRef = {
  scrollTo: (options: { y: number; animated?: boolean }) => void;
  getScrollY: () => number;
};

type SliverTabScreenProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  /** Collapsed bar alt satırı (altın) */
  compactSubtitle?: string;
  image?: ImageSourcePropType;
  /** Safe area hariç expanded hero yüksekliği */
  expandedContent?: number;
  children: ReactNode;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
} & Omit<
  ScrollViewProps,
  "onScroll" | "scrollEventThrottle" | "contentContainerStyle"
>;

/**
 * Home’daki gibi collapsing (sliver) app bar:
 * hero kayar, üstte sabit compact bar belirir.
 */
export const SliverTabScreen = forwardRef<
  SliverTabScreenRef,
  SliverTabScreenProps
>(function SliverTabScreen(
  {
    title,
    subtitle,
    eyebrow,
    compactSubtitle,
    image,
    expandedContent = 188,
    children,
    contentContainerStyle,
    ...scrollProps
  },
  ref,
) {
  const insets = useSafeAreaInsets();
  const { resolvedTheme, locale } = useAppSettings();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const scrollYValue = useRef(0);

  useImperativeHandle(ref, () => ({
    scrollTo: ({ y, animated = true }) => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y), animated });
    },
    getScrollY: () => scrollYValue.current,
  }));

  const collapseRange = Math.max(1, expandedContent - SLIVER_COLLAPSED);
  const expandedHeight = insets.top + expandedContent;
  const dark = resolvedTheme === "dark";
  const pageBg = pageBackground(dark);
  const pageBgFade = useMemo(() => pageFadeColors(dark), [dark]);
  const overlay = heroOverlayColors(dark);
  const chrome = dark ? themeColors.dark : themeColors.light;

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, collapseRange],
    outputRange: [0, -collapseRange],
    extrapolate: "clamp",
  });

  const flexibleOpacity = scrollY.interpolate({
    inputRange: [0, collapseRange * 0.45, collapseRange],
    outputRange: [1, 0.35, 0],
    extrapolate: "clamp",
  });

  const compactOpacity = scrollY.interpolate({
    inputRange: [collapseRange * 0.55, collapseRange],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const titleBlockShift = scrollY.interpolate({
    inputRange: [collapseRange * 0.55, collapseRange],
    outputRange: [compactSubtitle ? 6 : 0, 0],
    extrapolate: "clamp",
  });

  const compactSlide = scrollY.interpolate({
    inputRange: [collapseRange * 0.55, collapseRange],
    outputRange: [-4, 0],
    extrapolate: "clamp",
  });

  const barBgOpacity = scrollY.interpolate({
    inputRange: [0, collapseRange * 0.7, collapseRange],
    outputRange: [0, 0.55, 0.96],
    extrapolate: "clamp",
  });

  const heroBody = (
    <Animated.View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 18,
        justifyContent: "flex-start",
        opacity: flexibleOpacity,
      }}
    >
      {eyebrow ? (
        <Text
          style={{
            fontFamily: fonts.bodyMedium,
            fontSize: 11,
            letterSpacing: 1.8,
            textTransform: "uppercase",
            color: chrome.heroEyebrow,
          }}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Text
        style={{
          fontFamily: fonts.displayBold,
          fontSize: 28,
          lineHeight: 34,
          color: chrome.heroTitle,
          marginTop: eyebrow ? 6 : 0,
        }}
        numberOfLines={2}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            lineHeight: 18,
            color: chrome.heroSubtitle,
            marginTop: 6,
            maxWidth: 340,
          }}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      ) : null}
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: pageBg }}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />

      {/* Collapsing hero */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: expandedHeight,
          zIndex: 10,
          overflow: "hidden",
          transform: [{ translateY: headerTranslate }],
        }}
      >
        {image ? (
          <ImageBackground
            source={image}
            style={{ flex: 1 }}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[...overlay]}
              locations={[0, 0.5, 1]}
              style={{
                flex: 1,
                paddingTop: insets.top + SLIVER_COLLAPSED,
              }}
            >
              <LinearGradient
                pointerEvents="none"
                colors={[...pageBgFade]}
                locations={[0, 0.45, 1]}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 22,
                }}
              />
              {heroBody}
            </LinearGradient>
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={
              dark
                ? (["#1a2f25", "#15241d", "#121c17"] as const)
                : (["#e8e0d0", "#ddd4c0", "#d4cbb6"] as const)
            }
            locations={[0, 0.55, 1]}
            style={{
              flex: 1,
              paddingTop: insets.top + SLIVER_COLLAPSED,
            }}
          >
            <LinearGradient
              pointerEvents="none"
              colors={[...pageBgFade]}
              locations={[0, 0.45, 1]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 22,
              }}
            />
            {heroBody}
          </LinearGradient>
        )}
      </Animated.View>

      {/* Sabit compact app bar */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          paddingTop: insets.top,
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: chrome.compactBar,
            opacity: barBgOpacity,
          }}
        />
        <View
          style={{
            height: SLIVER_COLLAPSED,
            paddingHorizontal: 20,
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{ transform: [{ translateY: titleBlockShift }] }}
          >
            <Text
              style={{
                fontFamily: fonts.bodyMedium,
                fontSize: 15,
                lineHeight: 19,
                letterSpacing: 0.15,
                color: chrome.compactTitle,
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {compactSubtitle ? (
              <Animated.Text
                style={{
                  marginTop: 2,
                  fontFamily: fonts.body,
                  fontSize: 11,
                  lineHeight: 14,
                  color: dark ? "#d4a84b" : chrome.compactMuted,
                  opacity: compactOpacity,
                  transform: [{ translateY: compactSlide }],
                }}
                numberOfLines={1}
              >
                {compactSubtitle}
              </Animated.Text>
            ) : null}
          </Animated.View>
        </View>
      </View>

      <Animated.ScrollView
        key={locale}
        ref={scrollRef}
        style={{ flex: 1 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
              scrollYValue.current = e.nativeEvent.contentOffset.y;
            },
          },
        )}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
        contentContainerStyle={[
          {
            paddingTop: expandedHeight,
            paddingBottom: 48,
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
});
