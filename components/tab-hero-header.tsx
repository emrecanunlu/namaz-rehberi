import type { ReactNode } from "react";
import { Pressable, StatusBar, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts } from "@/constants/fonts";
import { themeColors } from "@/constants/theme";
import { useAppSettings } from "@/lib/settings-context";

type StackAppHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
};

/** Namaz detay vb. stack ekranları — tema uyumlu bar */
export function StackAppHeader({
  title,
  subtitle,
  onBack,
  right,
}: StackAppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useAppSettings();
  const dark = resolvedTheme === "dark";
  const chrome = dark ? themeColors.dark : themeColors.light;

  return (
    <View
      style={{
        backgroundColor: chrome.pageSoft,
        paddingTop: insets.top,
        borderBottomWidth: dark ? 1 : 0,
        borderBottomColor: chrome.border,
        shadowColor: "#1a2f25",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: dark ? 0 : 0.06,
        shadowRadius: 4,
        elevation: dark ? 0 : 2,
      }}
    >
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <View
        style={{
          minHeight: 56,
          paddingHorizontal: 8,
          paddingBottom: 10,
          paddingTop: 6,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            accessibilityRole="button"
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={chrome.compactTitle}
            />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}

        <View style={{ flex: 1, paddingHorizontal: 4 }}>
          <Text
            style={{
              fontFamily: fonts.displayBold,
              fontSize: 20,
              lineHeight: 24,
              color: chrome.compactTitle,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 12,
                lineHeight: 16,
                color: dark ? "rgba(212,168,75,0.9)" : chrome.compactMuted,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right ?? <View style={{ width: 40 }} />}
      </View>
    </View>
  );
}
