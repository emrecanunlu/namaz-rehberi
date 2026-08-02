import { Tabs } from "expo-router";
import { Text, useColorScheme } from "react-native";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";
import { fonts } from "@/constants/fonts";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      className={`text-[10px] font-semibold ${
        focused
          ? "text-forest-700 dark:text-gold-400"
          : "text-forest-500/50 dark:text-sand-200/40"
      }`}
    >
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const { locale, resolvedTheme } = useAppSettings();
  const scheme = useColorScheme();
  const dark = resolvedTheme === "dark" || scheme === "dark";

  return (
    <Tabs
      key={locale}
      screenOptions={{
        headerStyle: { backgroundColor: dark ? "#0f1a15" : "#1a2f25" },
        headerTintColor: "#f3efe6",
        headerTitleStyle: {
          fontFamily: fonts.bodySemi,
          fontWeight: "600",
        },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: dark ? "#0f1a15" : "#faf8f4",
          borderTopColor: dark ? "#2a4a39" : "#e6dcc8",
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: dark ? "#d4a84b" : "#2a4a39",
        tabBarInactiveTintColor: dark ? "#c2d7cb80" : "#3d6b5280",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.today"),
          tabBarIcon: ({ focused }) => <TabIcon label="◉" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="namaz"
        options={{
          title: t("tabs.prayer"),
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon label="▣" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="dualar"
        options={{
          title: t("tabs.duas"),
          headerTitle: t("duas.headerTitle"),
          tabBarIcon: ({ focused }) => <TabIcon label="✦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ayarlar"
        options={{
          title: t("tabs.settings"),
          headerTitle: t("settings.title"),
          tabBarIcon: ({ focused }) => <TabIcon label="⚙" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
