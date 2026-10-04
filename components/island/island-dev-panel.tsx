import { Pressable, Text, View } from "react-native";
import { fonts } from "@/constants/fonts";
import type { themeColors } from "@/constants/theme";
import type { IslandDevActions } from "@/lib/island/island-context";
import type { IslandProgress } from "@/lib/island/progress";

type Chrome = (typeof themeColors)["dark"] | (typeof themeColors)["light"];

/** Yalnız __DEV__: ada gelişimini hızlandırma (metinler çevrilmez, geliştirici aracı) */
export function IslandDevPanel({
  dev,
  progress,
  chrome,
  onReplay,
}: {
  dev: IslandDevActions;
  progress: IslandProgress;
  chrome: Chrome;
  onReplay: () => void;
}) {
  const actions: [string, () => void][] = [
    ["+1 seviye", dev.addLevel],
    ["+1 ada", dev.addIsland],
    ["+1 tohum", dev.addSeed],
    ["Bitkiler +1 gün", dev.growPlants],
    ["Tekrar oynat", onReplay],
    ["Sıfırla", dev.reset],
  ];
  return (
    <View
      style={{
        marginTop: 8,
        backgroundColor: chrome.surfaceRaised,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: chrome.border,
        padding: 10,
      }}
    >
      <Text style={{ fontFamily: fonts.body, fontSize: 11, color: chrome.muted, marginBottom: 8 }}>
        nur {progress.nur} (+{dev.boost.nur}) · ada {progress.island + 1} · aşama {progress.stage} · tohum +{dev.boost.seeds} · büyüme +
        {dev.boost.growDays}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {actions.map(([label, run]) => (
          <Pressable
            key={label}
            onPress={run}
            style={{ backgroundColor: chrome.tint, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}
          >
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: chrome.page }}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
