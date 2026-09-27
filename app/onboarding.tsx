import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  ONBOARDING_IMAGES,
  ONBOARDING_SLIDE_IDS,
  type OnboardingSlideId,
} from "@/data/content";
import { useOnboarding } from "@/lib/onboarding-context";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";
import { fonts } from "@/constants/fonts";
import { hapticSelection, hapticSuccess } from "@/lib/haptics";

const SLIDE_COUNT = ONBOARDING_SLIDE_IDS.length;
const softEase = Easing.bezier(0.33, 1, 0.28, 1);
const TRANSITION_MS = 720;

function Dots({ index }: { index: number }) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t("common.slidePosition", {
        current: index + 1,
        total: ONBOARDING_SLIDE_IDS.length,
      })}
      className="flex-row items-center justify-center gap-1.5"
    >
      {ONBOARDING_SLIDE_IDS.map((slide, i) => (
        <Dot key={slide} active={i === index} />
      ))}
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: active ? 1 : 0,
      duration: 420,
      easing: softEase,
      useNativeDriver: false,
    }).start();
  }, [active, progress]);

  const dotWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 20],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <Animated.View
      style={{
        width: dotWidth,
        height: 6,
        borderRadius: 999,
        marginHorizontal: 3,
        backgroundColor: "#d4a84b",
        opacity,
      }}
    />
  );
}

function SlideContent({
  item,
  index,
  translateX,
  width,
  height,
  textBottom,
}: {
  item: OnboardingSlideId;
  index: number;
  translateX: Animated.Value;
  width: number;
  height: number;
  textBottom: number;
}) {
  const input = [-(index + 1) * width, -index * width, -(index - 1) * width];

  // Görsel: yavaş kayar + soft zoom (parallax arka plan)
  const imageShift = translateX.interpolate({
    inputRange: input,
    outputRange: [-width * 0.18, 0, width * 0.18],
    extrapolate: "clamp",
  });
  const imageScale = translateX.interpolate({
    inputRange: input,
    outputRange: [1.12, 1.04, 1.12],
    extrapolate: "clamp",
  });

  // Yazı katmanları: farklı hızlarda (staggered parallax)
  const accentOpacity = translateX.interpolate({
    inputRange: input,
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });
  const accentX = translateX.interpolate({
    inputRange: input,
    outputRange: [width * 0.12, 0, -width * 0.12],
    extrapolate: "clamp",
  });
  const accentY = translateX.interpolate({
    inputRange: input,
    outputRange: [18, 0, 18],
    extrapolate: "clamp",
  });

  const titleOpacity = translateX.interpolate({
    inputRange: input,
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });
  const titleX = translateX.interpolate({
    inputRange: input,
    outputRange: [width * 0.2, 0, -width * 0.2],
    extrapolate: "clamp",
  });
  const titleY = translateX.interpolate({
    inputRange: input,
    outputRange: [28, 0, 28],
    extrapolate: "clamp",
  });

  const bodyOpacity = translateX.interpolate({
    inputRange: input,
    outputRange: [0, 1, 0],
    extrapolate: "clamp",
  });
  const bodyX = translateX.interpolate({
    inputRange: input,
    outputRange: [width * 0.28, 0, -width * 0.28],
    extrapolate: "clamp",
  });
  const bodyY = translateX.interpolate({
    inputRange: input,
    outputRange: [36, 0, 36],
    extrapolate: "clamp",
  });

  const imageWidth = width * 1.28;

  return (
    <View
      style={{ width, height, overflow: "hidden", backgroundColor: "#000" }}
    >
      <Animated.View
        style={{
          position: "absolute",
          left: -(imageWidth - width) / 2,
          top: 0,
          width: imageWidth,
          height,
          transform: [{ translateX: imageShift }, { scale: imageScale }],
        }}
      >
        <Image
          source={ONBOARDING_IMAGES[item]}
          style={{ width: imageWidth, height }}
          resizeMode="cover"
        />
      </Animated.View>

      <LinearGradient
        colors={[
          "rgba(0,0,0,0.25)",
          "transparent",
          "rgba(0,0,0,0.35)",
          "rgba(0,0,0,0.82)",
          "rgba(0,0,0,0.94)",
        ]}
        locations={[0, 0.28, 0.52, 0.78, 1]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.88)"]}
        locations={[0, 0.45, 1]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: height * 0.48,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          bottom: textBottom,
        }}
      >
        <Animated.Text
          style={{
            fontFamily: fonts.bodyMedium,
            fontSize: 11,
            letterSpacing: 2.5,
            textTransform: "uppercase",
            color: "#d4a84b",
            opacity: accentOpacity,
            transform: [{ translateX: accentX }, { translateY: accentY }],
          }}
        >
          {t(`onboarding.slides.${item}.accent`)}
        </Animated.Text>

        <Animated.Text
          style={{
            fontFamily: fonts.displayBold,
            fontSize: 34,
            lineHeight: 40,
            color: "#ffffff",
            marginTop: 12,
            opacity: titleOpacity,
            transform: [{ translateX: titleX }, { translateY: titleY }],
          }}
        >
          {t(`onboarding.slides.${item}.title`)}
        </Animated.Text>

        <Animated.Text
          style={{
            fontFamily: fonts.body,
            fontSize: 15,
            lineHeight: 24,
            color: "rgba(255,255,255,0.75)",
            marginTop: 12,
            opacity: bodyOpacity,
            transform: [{ translateX: bodyX }, { translateY: bodyY }],
          }}
        >
          {t(`onboarding.slides.${item}.description`)}
        </Animated.Text>
      </View>
    </View>
  );
}

function ControlButton({
  label,
  onPress,
  muted,
  icon,
  iconPosition = "left",
}: {
  label: string;
  onPress: () => void;
  muted?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
}) {
  const color = muted ? "rgba(255,255,255,0.75)" : "#ffffff";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={14}
      className="flex-row items-center gap-1.5 px-1 py-2 active:opacity-55"
    >
      {iconPosition === "left" ? (
        <Ionicons name={icon} size={18} color={color} />
      ) : null}
      <Text
        style={{ fontFamily: muted ? fonts.body : fonts.bodyMedium }}
        className={`text-[15px] ${muted ? "text-white/75" : "text-white"}`}
      >
        {label}
      </Text>
      {iconPosition === "right" ? (
        <Ionicons name={icon} size={18} color={color} />
      ) : null}
    </Pressable>
  );
}

/** Son sayfa kontrolleri — her mount'ta kendi animasyonu (paylaşılan value kilidi yok) */
function StartControls({
  onBack,
  onStart,
}: {
  onBack: () => void;
  onStart: () => void;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 450,
      easing: softEase,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return (
    <Animated.View
      style={{
        // Opacity yok — parent fadeIn + native opacity kilidi butonları gizliyordu
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [18, 0],
            }),
          },
        ],
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
        <ControlButton
          label={t("common.back")}
          onPress={onBack}
          icon="chevron-back"
          iconPosition="left"
        />
        <View style={{ width: 40 }} />
      </View>
      <Pressable
        onPress={onStart}
        accessibilityRole="button"
        className="active:opacity-85"
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderRadius: 999,
          backgroundColor: "#d4a84b",
          minHeight: 52,
          paddingVertical: 14,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.bodySemi,
            fontSize: 16,
            color: "#0f1a15",
          }}
        >
          {t("common.start")}
        </Text>
        <Ionicons name="arrow-forward" size={18} color="#0f1a15" />
      </Pressable>
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const { completeOnboarding } = useOnboarding();
  const { locale } = useAppSettings();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const dragX = useRef(0);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const animating = useRef(false);
  const widthRef = useRef(width);
  const animateToRef = useRef<(next: number) => void>(() => undefined);

  const isFirst = index === 0;
  const isLast = index === SLIDE_COUNT - 1;
  const footerPad = Math.max(insets.bottom, 16) + 8;
  const textBottomNormal = footerPad + 88;
  const textBottomLast = footerPad + 168;

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    widthRef.current = width;
    translateX.setValue(-indexRef.current * width);
  }, [width, translateX]);

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 640,
      easing: softEase,
      useNativeDriver: true,
    }).start();
  }, [fadeIn]);

  async function finish() {
    hapticSuccess();
    await completeOnboarding();
  }

  function animateTo(next: number) {
    const w = widthRef.current;
    const clamped = Math.max(0, Math.min(SLIDE_COUNT - 1, next));

    translateX.stopAnimation();
    animating.current = true;
    setIndex(clamped);

    Animated.timing(translateX, {
      toValue: -clamped * w,
      duration: TRANSITION_MS,
      easing: softEase,
      useNativeDriver: true,
    }).start(({ finished }) => {
      animating.current = false;
      if (!finished) return;
      translateX.setValue(-clamped * w);
    });
  }

  animateToRef.current = animateTo;

  function goNext() {
    if (isLast) return;
    hapticSelection();
    animateTo(index + 1);
  }

  function goBack() {
    if (index <= 0) return;
    hapticSelection();
    animateTo(index - 1);
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 8 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          animating.current = false;
          translateX.stopAnimation((value) => {
            dragX.current = value;
          });
        },
        onPanResponderMove: (_, gesture) => {
          const w = widthRef.current;
          const next = dragX.current + gesture.dx;
          const min = -(SLIDE_COUNT - 1) * w;
          const max = 0;
          const resisted =
            next > max
              ? max + (next - max) * 0.18
              : next < min
                ? min + (next - min) * 0.18
                : next;
          translateX.setValue(resisted);
        },
        onPanResponderRelease: (_, gesture) => {
          const w = widthRef.current;
          const currentOffset = dragX.current + gesture.dx;
          const nearest = Math.round(-currentOffset / w);
          let target = Math.max(0, Math.min(SLIDE_COUNT - 1, nearest));

          if (gesture.dx < -w * 0.12 || gesture.vx < -0.35) {
            target = Math.min(indexRef.current + 1, SLIDE_COUNT - 1);
          } else if (gesture.dx > w * 0.12 || gesture.vx > 0.35) {
            target = Math.max(indexRef.current - 1, 0);
          }

          animateToRef.current(target);
        },
        onPanResponderTerminate: () => {
          animateToRef.current(indexRef.current);
        },
      }),
    [translateX],
  );

  return (
    <View key={locale} className="flex-1 bg-black" style={{ width, height }}>
      <StatusBar style="light" />

      <View
        className="flex-1"
        style={{ width, height, overflow: "hidden" }}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={{
            flexDirection: "row",
            width: width * SLIDE_COUNT,
            height,
            transform: [{ translateX }],
          }}
        >
          {ONBOARDING_SLIDE_IDS.map((item, i) => (
            <SlideContent
              key={item}
              item={item}
              index={i}
              translateX={translateX}
              width={width}
              height={height}
              textBottom={
                i === SLIDE_COUNT - 1 ? textBottomLast : textBottomNormal
              }
            />
          ))}
        </Animated.View>
      </View>

      <Animated.View
        pointerEvents="box-none"
        style={{
          opacity: fadeIn,
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
        }}
      >
        <View
          className="absolute left-0 right-0 flex-row items-center justify-end px-6"
          style={{ top: insets.top + 8 }}
        >
          {!isLast ? (
            <Pressable
              onPress={() => void finish()}
              accessibilityRole="button"
              hitSlop={14}
              className="px-1 py-2 active:opacity-55"
            >
              <Text
                style={{ fontFamily: fonts.body }}
                className="text-[14px] text-white/75"
              >
                {t("common.skip")}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View
          className="absolute left-0 right-0 px-6"
          style={{ bottom: footerPad }}
        >
          <Dots index={index} />

          <View style={{ marginTop: isLast ? 16 : 20 }}>
            {!isLast ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ minWidth: 84 }}>
                  {!isFirst ? (
                    <ControlButton
                      label={t("common.back")}
                      onPress={goBack}
                      icon="chevron-back"
                      iconPosition="left"
                    />
                  ) : null}
                </View>

                <ControlButton
                  label={t("common.next")}
                  onPress={goNext}
                  icon="chevron-forward"
                  iconPosition="right"
                />
              </View>
            ) : (
              <StartControls onBack={goBack} onStart={() => void finish()} />
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
