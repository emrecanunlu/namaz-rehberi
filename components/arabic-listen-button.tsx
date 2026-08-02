import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "@/constants/fonts";
import { getDuaAudio } from "@/data/dua-audio";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";
import { speakDua, stopSpeaking } from "@/lib/speak-arabic";

type Props = {
  arabic: string;
  /** Kayıtlı ses için dua id (örn. "1") */
  duaId?: string;
  /** Koyu banner üzerinde (dualar hero) */
  light?: boolean;
};

export function ArabicListenButton({ arabic, duaId, light = false }: Props) {
  const { resolvedTheme } = useAppSettings();
  const [playing, setPlaying] = useState(false);
  const dark = resolvedTheme === "dark";

  useEffect(() => {
    return () => {
      void stopSpeaking();
    };
  }, []);

  useEffect(() => {
    void stopSpeaking();
    setPlaying(false);
  }, [arabic, duaId]);

  const onPress = async () => {
    if (playing) {
      await stopSpeaking();
      setPlaying(false);
      return;
    }

    await speakDua(arabic, {
      audio: duaId ? getDuaAudio(duaId) : undefined,
      onStart: () => setPlaying(true),
      onDone: () => setPlaying(false),
      onStopped: () => setPlaying(false),
      onError: () => setPlaying(false),
    });
  };

  const iconColor = light || dark ? "#d4a84b" : "#1f3a2e";
  const labelColor = light
    ? "text-sand-100"
    : "text-forest-800 dark:text-gold-400";
  const borderColor = light
    ? "border-sand-100/35"
    : "border-forest-700/40 dark:border-gold-400/50";

  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={playing ? t("duas.stopListen") : t("duas.listen")}
      className={`mt-4 flex-row items-center self-start border-b pb-0.5 active:opacity-60 ${borderColor}`}
    >
      <View className="mr-1.5">
        <Ionicons
          name={playing ? "stop-circle-outline" : "volume-medium-outline"}
          size={18}
          color={iconColor}
        />
      </View>
      <Text
        style={{ fontFamily: fonts.bodySemi }}
        className={`text-[14px] ${labelColor}`}
      >
        {playing ? t("duas.stopListen") : t("duas.listen")}
      </Text>
    </Pressable>
  );
}
