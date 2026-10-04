import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router, useIsFocused } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IslandScene, type PickInfo } from "@/components/island/island-scene";
import { IslandDevPanel } from "@/components/island/island-dev-panel";
import { fonts } from "@/constants/fonts";
import { cardShadow, themeColors } from "@/constants/theme";
import { t } from "@/lib/i18n";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import { playIslandSfx, useIslandAmbient, type AmbientLayer } from "@/lib/island/island-audio";
import { useIsland } from "@/lib/island/island-context";
import {
  PRAYERS_PER_DAY,
  STAGES_PER_ISLAND,
  findPlantSpot,
  hashString,
  visitorForDate,
  type Footprint,
} from "@/lib/island/progress";
import { islandBackdrop, skyPhaseFor, themeForIsland } from "@/lib/island/themes";
import { calculatePrayerTimes } from "@/lib/prayer-times";
import { useAppSettings } from "@/lib/settings-context";
import { useNow } from "@/lib/use-now";

/** Gölet 9. aşamada gelir; ördek ancak gölet varsa ziyarete gelir */
const POND_STAGE = 9;
/** Ağaç gençleşince kuşlar gelir */
const BIRDS_STAGE = 3;

function pickLabel(info: PickInfo) {
  if (info.kind === "visitor") {
    return t("island.pick.visitor", { name: t(`island.visitors.${info.detail}`) });
  }
  if (info.kind === "plant") {
    return info.detail === "sprout" || info.detail === "seedling"
      ? t(`island.pick.${info.detail}`)
      : t("island.pick.bloom", { name: t(`island.plants.${info.detail}`) });
  }
  return t(`island.items.${info.kind}`, { defaultValue: "" });
}

export default function AdaScreen() {
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const { city, resolvedTheme } = useAppSettings();
  const dark = resolvedTheme === "dark";
  const chrome = dark ? themeColors.dark : themeColors.light;
  const {
    ready,
    progress,
    todayKey,
    todayPrayers,
    plants,
    seedsAvailable,
    wateredDates,
    plantSeed,
    lastSeenLevel,
    markLevelSeen,
    soundOn,
    toggleSound,
    growBonus,
    dev,
  } = useIsland();

  const now = useNow(60_000);
  const backdrop = useMemo(
    () => islandBackdrop(dark, skyPhaseFor(calculatePrayerTimes(city, now), now)),
    [dark, city, now],
  );

  const hasPond = progress.island > 0 || progress.stage >= POND_STAGE;
  const hasTrees = progress.island > 0 || progress.stage >= BIRDS_STAGE;
  const ambient = useMemo(() => {
    const layers: AmbientLayer[] = ["pad", "wind"];
    if (hasTrees && !dark) layers.push("birds");
    if (hasPond) layers.push("water");
    if (dark || backdrop.night >= 0.5) layers.push("crickets");
    return layers;
  }, [hasTrees, hasPond, dark, backdrop.night]);
  useIslandAmbient(focused && ready && soundOn, ambient);

  // Açılışta: kullanıcı yokken eklenen öğeler bir kez belirir (görülen seviyeden sonrası).
  // Sahne açıkken gelen yeni öğeleri ada kendisi fark eder ve yalnız onları belirtir.
  const [popFromLevel, setPopFromLevel] = useState<number | null>(null);
  const [popToken, setPopToken] = useState(0);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);
  const shownLevel = useRef<number | null>(null);
  /** Sahne, açılışta neyin belireceğine karar verildikten sonra kurulur */
  const [sceneOpen, setSceneOpen] = useState(false);

  const announce = useCallback(
    (fromLevel: number) => {
      const fromIsland = Math.floor(fromLevel / STAGES_PER_ISLAND);
      const themeName = t(`island.themes.${themeForIsland(progress.island).id}`);
      setToast(
        progress.island > fromIsland
          ? { title: t("island.newIsland"), body: t("island.newIslandBody", { theme: themeName }) }
          : { title: t("island.levelUp"), body: t("island.levelUpBody", { level: progress.level + 1 }) },
      );
      hapticSuccess();
    },
    [progress.island, progress.level],
  );

  useEffect(() => {
    if (!ready || !focused) {
      if (!focused) {
        shownLevel.current = null;
        setSceneOpen(false);
      }
      return;
    }
    if (shownLevel.current === null) {
      // Ekran (yeniden) açıldı: sahne bu noktadan kurulur
      shownLevel.current = progress.level;
      setPopFromLevel(progress.level > lastSeenLevel ? lastSeenLevel : null);
      setSceneOpen(true);
      if (progress.level > lastSeenLevel) announce(lastSeenLevel);
      return;
    }
    if (progress.level > shownLevel.current) {
      announce(shownLevel.current);
      shownLevel.current = progress.level;
    }
    // lastSeenLevel kasıtlı olarak dışarıda: yalnız açılış anındaki değer önemli
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, focused, progress.level, announce]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  // İlk açılışta kısa ipucu
  const [showHint, setShowHint] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setShowHint(false), 4500);
    return () => clearTimeout(id);
  }, []);

  const onPopsDone = useCallback(() => {
    markLevelSeen();
  }, [markLevelSeen]);

  const onMagic = useCallback(
    (kind: "appear" | "vanish") => {
      if (soundOn) playIslandSfx(kind === "appear" ? "magic" : "vanish", kind === "appear" ? 0.55 : 0.4);
    },
    [soundOn],
  );

  const bodyInfo = useRef<{ radius: number; footprints: Footprint[] } | null>(null);
  const onBody = useCallback((info: { radius: number; footprints: Footprint[] }) => {
    bodyInfo.current = info;
  }, []);

  const [notice, setNotice] = useState<{ text: string; key: number } | null>(null);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(id);
  }, [notice]);
  const say = useCallback((text: string) => setNotice({ text, key: Date.now() }), []);

  const onPick = useCallback(
    (info: PickInfo) => {
      hapticLight();
      if (soundOn) playIslandSfx("tap", 0.45);
      setShowHint(false);
      const label = pickLabel(info);
      if (label) say(label);
    },
    [say, soundOn],
  );

  const onPlant = useCallback(() => {
    const info = bodyInfo.current;
    if (!info || seedsAvailable <= 0) return;
    const spot = findPlantSpot(info.radius, info.footprints, hashString(`${todayKey}:${plants.length}`));
    if (!spot) {
      say(t("island.noSpace"));
      return;
    }
    plantSeed(spot);
    hapticSuccess();
    say(t("island.planted"));
  }, [seedsAvailable, todayKey, plants.length, plantSeed, say]);

  const [devOpen, setDevOpen] = useState(false);

  const visitor = todayPrayers > 0 ? visitorForDate(todayKey, hasPond) : null;
  const theme = themeForIsland(progress.island);
  const islandName = t("island.islandName", { theme: t(`island.themes.${theme.id}`) });
  const levelRatio = progress.levelNur / progress.levelCost;
  const fullDay = todayPrayers >= PRAYERS_PER_DAY;

  const pill = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: chrome.surfaceRaised,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: chrome.border,
  };

  return (
    <View style={{ flex: 1, backgroundColor: backdrop.bottom }}>
      {ready && focused && sceneOpen ? (
        <IslandScene
          island={progress.island}
          stage={progress.stage}
          popFromLevel={popFromLevel}
          popToken={popToken}
          plants={plants}
          wateredDates={wateredDates}
          today={todayKey}
          growBonus={growBonus}
          visitor={visitor}
          backdrop={backdrop}
          onBody={onBody}
          onPopsDone={onPopsDone}
          onPick={onPick}
          onMagic={onMagic}
        />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={chrome.tint} />
        </View>
      )}

      {/* Üst bilgi */}
      <View pointerEvents="box-none" style={{ position: "absolute", top: insets.top + 8, left: 18, right: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            style={[pill, { paddingHorizontal: 7, marginRight: 10 }]}
          >
            <Ionicons name="chevron-back" size={18} color={chrome.tint} />
          </Pressable>
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, letterSpacing: 1.4, color: chrome.heroEyebrow, textTransform: "uppercase" }}>
            {islandName}
            {progress.island > 0 ? ` · ${t("island.islandNumber", { n: progress.island + 1 })}` : ""}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 30, color: chrome.heroTitle }}>
            {t("island.level", { level: progress.level + 1 })}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={pill}>
              <Ionicons name="flame" size={15} color={progress.streakSafeToday ? "#e8902a" : chrome.muted} />
              <Text style={{ fontFamily: fonts.bodySemi, color: chrome.text, fontSize: 13, marginLeft: 4 }}>
                {t("island.streak", { count: progress.streak })}
              </Text>
            </View>
            <Pressable
              onPress={toggleSound}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={soundOn ? t("island.soundOff") : t("island.soundOn")}
              style={pill}
            >
              <Ionicons name={soundOn ? "musical-notes" : "volume-mute-outline"} size={15} color={chrome.tint} />
            </Pressable>
          </View>
        </View>
        <View pointerEvents="none">
          <View style={{ height: 6, borderRadius: 3, backgroundColor: chrome.border, marginTop: 6, overflow: "hidden" }}>
            <View style={{ width: `${Math.round(levelRatio * 100)}%`, height: 6, borderRadius: 3, backgroundColor: chrome.accent }} />
          </View>
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: chrome.heroSubtitle, marginTop: 4 }}>
            {t("island.nurToNext", { nur: progress.levelCost - progress.levelNur })}
            {progress.todayNur > 0 ? `  ·  ${t("island.nurToday", { nur: progress.todayNur })}` : ""}
          </Text>
        </View>
        {dev ? (
          <Pressable onPress={() => setDevOpen((v) => !v)} hitSlop={8} style={[pill, { alignSelf: "flex-end", marginTop: 6, paddingVertical: 3 }]}>
            <Ionicons name="construct-outline" size={13} color={chrome.tint} />
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11, color: chrome.tint, marginLeft: 4 }}>DEV</Text>
          </Pressable>
        ) : null}
        {dev && devOpen ? (
          <IslandDevPanel
            dev={dev}
            progress={progress}
            chrome={chrome}
            onReplay={() => {
              // Mevcut adanın tüm öğelerini baştan belirt
              setPopFromLevel(progress.island * STAGES_PER_ISLAND - 1);
              setPopToken((n) => n + 1);
            }}
          />
        ) : null}
      </View>

      {/* Ortadaki bildirimler */}
      <View pointerEvents="none" style={{ position: "absolute", left: 24, right: 24, bottom: insets.bottom + 150, alignItems: "center" }}>
        {toast ? (
          <Animated.View entering={FadeInDown} exiting={FadeOutUp} style={[{ backgroundColor: chrome.surfaceRaised, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 10, alignItems: "center" }, cardShadow(dark)]}>
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 20, color: chrome.text }}>{toast.title}</Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 13, color: chrome.muted }}>{toast.body}</Text>
          </Animated.View>
        ) : notice ? (
          <Animated.View key={notice.key} entering={FadeInDown.duration(180)} exiting={FadeOut.duration(150)} style={[{ backgroundColor: chrome.surfaceRaised, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: chrome.border }, cardShadow(dark)]}>
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: chrome.text, textAlign: "center" }}>{notice.text}</Text>
          </Animated.View>
        ) : showHint && ready ? (
          <Animated.View entering={FadeIn.delay(600)} exiting={FadeOut} style={{ backgroundColor: chrome.compactBar, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7 }}>
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: chrome.muted }}>{t("island.hint")}</Text>
          </Animated.View>
        ) : null}
      </View>

      {/* Alt panel */}
      <View pointerEvents="box-none" style={{ position: "absolute", left: 12, right: 12, bottom: insets.bottom + 8 }}>
        <View style={[{ backgroundColor: chrome.surfaceRaised, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, borderWidth: dark ? 1 : 0, borderColor: chrome.border }, cardShadow(dark)]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1, flexDirection: "row", gap: 5 }}>
              {Array.from({ length: PRAYERS_PER_DAY }, (_, i) => (
                <View key={i} style={{ flex: 1, height: 7, borderRadius: 4, backgroundColor: i < todayPrayers ? chrome.tint : chrome.border }} />
              ))}
            </View>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 13, color: chrome.text, marginLeft: 10 }}>
              {t("island.prayersToday", { done: todayPrayers })}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 9 }}>
            <Ionicons name={visitor ? "paw" : "paw-outline"} size={15} color={chrome.tint} />
            <Text numberOfLines={1} style={{ flex: 1, fontFamily: fonts.body, fontSize: 13, color: chrome.muted, marginLeft: 6 }}>
              {visitor
                ? t("island.visitorHere", { name: t(`island.visitors.${visitor}`) })
                : t("island.visitorWaiting")}
            </Text>
            {seedsAvailable > 0 ? (
              <Pressable
                onPress={onPlant}
                accessibilityRole="button"
                hitSlop={8}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: chrome.tint, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 6, marginLeft: 8 }}
              >
                <Ionicons name="flower-outline" size={14} color={chrome.page} />
                <Text style={{ fontFamily: fonts.bodySemi, color: chrome.page, fontSize: 13, marginLeft: 5 }}>
                  {t("island.plantShort", { count: seedsAvailable })}
                </Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: chrome.muted, marginTop: 6 }}>
            {fullDay ? t("island.fullDayDone") : t("island.fullDayHint")}
          </Text>
        </View>
      </View>
    </View>
  );
}
