import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { fonts } from "@/constants/fonts";
import { cardShadow } from "@/constants/theme";
import { t } from "@/lib/i18n";
import { hapticSelection } from "@/lib/haptics";
import { useIsland } from "@/lib/island/island-context";
import { themeForIsland } from "@/lib/island/themes";

/** Bugün ekranında adaya giriş: seviye, ilerleme ve adayı bugün açmak için bir sebep */
export function IslandHomeCard({ dark }: { dark: boolean }) {
  const { ready, progress, todayPrayers, seedsAvailable, lastSeenLevel } = useIsland();
  if (!ready) return null;

  const hasNews = progress.level > lastSeenLevel;
  const themeName = t(`island.themes.${themeForIsland(progress.island).id}`);
  const ratio = progress.levelNur / progress.levelCost;

  // Kartın alt satırı: en çekici bekleyen şey
  const teaser = hasNews
    ? t("island.card.news")
    : seedsAvailable > 0
      ? t("island.card.seeds", { count: seedsAvailable })
      : todayPrayers === 0
        ? t("island.card.visitor")
        : progress.streak > 1
          ? t("island.streak", { count: progress.streak })
          : t("island.nurToNext", { nur: progress.levelCost - progress.levelNur });

  const colors = dark ? (["#24402f", "#162a20"] as const) : (["#2f5641", "#1a2f25"] as const);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t("island.title")}, ${t("island.level", { level: progress.level + 1 })}`}
      onPress={() => {
        hapticSelection();
        router.push("/ada");
      }}
      className="mx-5 mt-5 active:opacity-90"
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          { borderRadius: 22, padding: 16, borderWidth: 1, borderColor: dark ? "rgba(212,168,75,0.35)" : "rgba(212,168,75,0.25)" },
          cardShadow(dark),
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Ada rozeti */}
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              backgroundColor: "rgba(212,168,75,0.16)",
              borderWidth: 1.5,
              borderColor: "#d4a84b",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="leaf" size={24} color="#e9c46a" />
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: "#f3efe6", marginTop: -1 }}>
              {progress.level + 1}
            </Text>
            {hasNews ? (
              <View style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: "#e8902a", borderWidth: 2, borderColor: colors[0] }} />
            ) : null}
          </View>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.4, color: "#d4a84b", textTransform: "uppercase" }}>
              {t("island.islandName", { theme: themeName })}
            </Text>
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 22, color: "#f3efe6", marginTop: 1 }}>
              {t("island.card.title", { level: progress.level + 1 })}
            </Text>
            <View style={{ height: 5, borderRadius: 3, backgroundColor: "rgba(243,239,230,0.18)", marginTop: 7, overflow: "hidden" }}>
              <View style={{ width: `${Math.round(ratio * 100)}%`, height: 5, borderRadius: 3, backgroundColor: "#e9c46a" }} />
            </View>
            <Text numberOfLines={1} style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(243,239,230,0.8)", marginTop: 6 }}>
              {teaser}
            </Text>
          </View>

          <View style={{ marginLeft: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: "#d4a84b", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="arrow-forward" size={18} color="#1a2f25" />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
