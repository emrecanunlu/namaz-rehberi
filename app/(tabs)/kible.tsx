import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cityDisplayName } from "@/data/cities-tr";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";
import {
  distanceKm,
  KAABA,
  normalizeDegrees,
  qiblaBearing,
  qiblaOffset,
  smoothAngle,
} from "@/lib/qibla";
import { fonts } from "@/constants/fonts";
import { pageBackground } from "@/constants/theme";
import { StackAppHeader } from "@/components/tab-hero-header";
import {
  hapticLight,
  hapticSuccess,
  hapticWarning,
} from "@/lib/haptics";

const ALIGN_DEG = 8;
/** Etiket state güncellemesi — pusula animasyonundan ayrı */
const UI_THROTTLE_MS = 120;
/** Heading yumuşatma (düşük = daha yumuşak, yüksek = daha hızlı) */
const HEADING_ALPHA = 0.28;

const TICK_ANGLES = Array.from({ length: 36 }, (_, i) => i * 10);

const DialFace = memo(function DialFace({
  dialSize,
  dark,
  gold,
  muted,
}: {
  dialSize: number;
  dark: boolean;
  gold: string;
  muted: string;
}) {
  return (
    <View
      collapsable={false}
      style={{ width: dialSize, height: dialSize }}
      pointerEvents="none"
    >
      {TICK_ANGLES.map((angle) => {
        const major = angle % 30 === 0;
        return (
          <View
            key={angle}
            style={{
              position: "absolute",
              width: dialSize,
              height: dialSize,
              transform: [{ rotate: `${angle}deg` }],
              alignItems: "center",
            }}
          >
            <View
              style={{
                marginTop: 12,
                width: major ? 2 : 1,
                height: major ? 14 : 7,
                backgroundColor: major
                  ? dark
                    ? "rgba(212,168,75,0.55)"
                    : "rgba(42,74,57,0.35)"
                  : dark
                    ? "rgba(243,239,230,0.18)"
                    : "rgba(42,74,57,0.15)",
              }}
            />
          </View>
        );
      })}

      {(
        [
          ["N", 0],
          ["E", 90],
          ["S", 180],
          ["W", 270],
        ] as const
      ).map(([label, angle]) => (
        <View
          key={label}
          style={{
            position: "absolute",
            width: dialSize,
            height: dialSize,
            transform: [{ rotate: `${angle}deg` }],
            alignItems: "center",
          }}
        >
          <Text
            style={{
              marginTop: 28,
              fontFamily: fonts.bodySemi,
              fontSize: label === "N" ? 16 : 13,
              color: label === "N" ? gold : muted,
              transform: [{ rotate: `${-angle}deg` }],
            }}
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
});

function shortestStep(current: number, target: number) {
  let delta = target - current;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return current + delta;
}

export default function QiblaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { locale, city, resolvedTheme } = useAppSettings();
  const dark = resolvedTheme === "dark";
  const pageBg = pageBackground(dark);
  const dialSize = Math.min(width - 48, 320);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [usingGps, setUsingGps] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [headingReady, setHeadingReady] = useState(false);
  const [uiHeading, setUiHeading] = useState<number | null>(null);

  const headingRef = useRef<number | null>(null);
  const dialContinuous = useRef(0);
  const needleContinuous = useRef(0);
  const lastUiAt = useRef(0);
  const bearingRef = useRef<number | null>(null);
  const headingReadyRef = useRef(false);

  const dialRot = useSharedValue(0);
  const needleRot = useSharedValue(0);
  const pulse = useSharedValue(0);

  const bearing = useMemo(() => {
    if (!coords) return null;
    return qiblaBearing(coords.lat, coords.lng);
  }, [coords]);

  useEffect(() => {
    bearingRef.current = bearing;
  }, [bearing]);

  const km = useMemo(() => {
    if (!coords) return null;
    return distanceKm(coords.lat, coords.lng, KAABA.lat, KAABA.lng);
  }, [coords]);

  const offset =
    bearing != null && uiHeading != null
      ? qiblaOffset(bearing, uiHeading)
      : null;
  const aligned = offset != null && Math.abs(offset) <= ALIGN_DEG;

  const refreshLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setPermissionDenied(true);
      setUsingGps(false);
      setCoords({ lat: city.lat, lng: city.lng });
      hapticWarning();
      return;
    }
    setPermissionDenied(false);
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
      setUsingGps(true);
    } catch {
      setUsingGps(false);
      setCoords({ lat: city.lat, lng: city.lng });
    }
  }, [city.lat, city.lng]);

  useEffect(() => {
    void refreshLocation();
  }, [refreshLocation]);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let active = true;

    void (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!active || status !== "granted") return;

      sub = await Location.watchHeadingAsync((data) => {
        const raw =
          data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
        if (raw < 0) return;

        const prev = headingRef.current;
        const next =
          prev == null
            ? normalizeDegrees(raw)
            : smoothAngle(prev, raw, HEADING_ALPHA);
        headingRef.current = next;

        const dialTarget = -next;
        dialContinuous.current = shortestStep(
          dialContinuous.current,
          dialTarget,
        );
        dialRot.value = dialContinuous.current;

        const b = bearingRef.current;
        if (b != null) {
          const needleTarget = b - next;
          needleContinuous.current = shortestStep(
            needleContinuous.current,
            needleTarget,
          );
          needleRot.value = needleContinuous.current;
        }

        const now = Date.now();
        if (!headingReadyRef.current) {
          headingReadyRef.current = true;
          setHeadingReady(true);
        }
        if (now - lastUiAt.current >= UI_THROTTLE_MS) {
          lastUiAt.current = now;
          setUiHeading(next);
        }
      });
    })();

    return () => {
      active = false;
      sub?.remove();
    };
  }, [dialRot, needleRot]);

  const wasAligned = useRef(false);

  useEffect(() => {
    if (aligned && !wasAligned.current) {
      hapticSuccess();
    }
    wasAligned.current = aligned;
  }, [aligned]);

  useEffect(() => {
    cancelAnimation(pulse);
    if (!aligned) {
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0, { duration: 900 }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(pulse);
  }, [aligned, pulse]);

  const dialStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${dialRot.value}deg` }],
  }));

  const needleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${needleRot.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + pulse.value * 0.6,
    transform: [{ scale: 1 + pulse.value * 0.03 }],
  }));

  const gold = dark ? "#d4a84b" : "#b8892e";
  const forest = dark ? "#f3efe6" : "#1a2f25";
  const muted = dark ? "rgba(243,239,230,0.55)" : "rgba(42,74,57,0.55)";
  const ring = dark ? "rgba(212,168,75,0.35)" : "rgba(42,74,57,0.18)";
  const dialBg = dark ? "#15241c" : "#f3efe6";
  const cityName = cityDisplayName(city, locale);

  return (
    <View className="flex-1" style={{ backgroundColor: pageBg }}>
      <StackAppHeader
        title={t("qibla.title")}
        subtitle={t("qibla.hint")}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace("/(tabs)");
        }}
      />

      <View className="flex-1 items-center justify-center px-6">
        <View style={{ marginBottom: 10, alignItems: "center" }}>
          <Ionicons name="caret-down" size={22} color={gold} />
        </View>

        <View
          style={{
            width: dialSize,
            height: dialSize,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {aligned ? (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  width: dialSize + 18,
                  height: dialSize + 18,
                  borderRadius: (dialSize + 18) / 2,
                  borderWidth: 2,
                  borderColor: gold,
                },
                pulseStyle,
              ]}
            />
          ) : null}

          <View
            style={{
              width: dialSize,
              height: dialSize,
              borderRadius: dialSize / 2,
              backgroundColor: dialBg,
              borderWidth: 1.5,
              borderColor: ring,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Animated.View
              style={[
                {
                  position: "absolute",
                  width: dialSize,
                  height: dialSize,
                },
                dialStyle,
              ]}
            >
              <DialFace
                dialSize={dialSize}
                dark={dark}
                gold={gold}
                muted={muted}
              />
            </Animated.View>

            <Animated.View
              style={[
                {
                  position: "absolute",
                  width: dialSize,
                  height: dialSize,
                  alignItems: "center",
                  paddingTop: 26,
                },
                needleStyle,
              ]}
            >
              <View
                style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: 10,
                  borderRightWidth: 10,
                  borderBottomWidth: 22,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderBottomColor: gold,
                }}
              />
              <View
                style={{
                  marginTop: 4,
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: dark ? "#24352c" : "#e8efe9",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: gold,
                }}
              >
                <Ionicons name="moon" size={18} color={gold} />
              </View>
            </Animated.View>

            <View
              style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                backgroundColor: dark ? "#1a2f25" : "#ebe4d4",
                borderWidth: 1,
                borderColor: ring,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.displayBold,
                  fontSize: 22,
                  color: forest,
                }}
              >
                {bearing != null ? `${Math.round(bearing)}°` : "—"}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 10,
                  letterSpacing: 1,
                  color: muted,
                  marginTop: 2,
                }}
              >
                {t("qibla.bearing")}
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={{
            fontFamily: fonts.bodySemi,
            fontSize: 16,
            color: aligned ? gold : forest,
            marginTop: 22,
            textAlign: "center",
          }}
        >
          {!headingReady
            ? t("qibla.calibrating")
            : aligned
              ? t("qibla.aligned")
              : offset != null
                ? t("qibla.turn", {
                    direction:
                      offset > 0 ? t("qibla.right") : t("qibla.left"),
                    degrees: Math.round(Math.abs(offset)),
                  })
                : t("qibla.calibrating")}
        </Text>

        {km != null ? (
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: muted,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {t("qibla.distance", {
              km: Math.round(km).toLocaleString(locale),
            })}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 12) + 8,
        }}
      >
        <View className="flex-row items-center justify-between border border-sand-200/80 bg-sand-50 px-4 py-3 dark:border-forest-700 dark:bg-forest-900">
          <View className="mr-3 flex-1">
            <Text
              style={{ fontFamily: fonts.bodySemi }}
              className="text-[15px] text-forest-900 dark:text-sand-50"
            >
              {usingGps ? t("qibla.gpsOn") : cityName}
            </Text>
            <Text
              style={{ fontFamily: fonts.body }}
              className="mt-0.5 text-[12px] text-forest-500 dark:text-sand-200/60"
            >
              {permissionDenied
                ? t("qibla.permissionDenied")
                : usingGps
                  ? t("qibla.gpsHint")
                  : t("qibla.cityFallback")}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              hapticLight();
              void refreshLocation();
            }}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center bg-forest-100 active:opacity-70 dark:bg-forest-800"
          >
            <Ionicons name="locate-outline" size={20} color={gold} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
