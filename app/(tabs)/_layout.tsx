import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Easing, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "@/lib/i18n";
import { hapticSelection } from "@/lib/haptics";
import { useAppSettings } from "@/lib/settings-context";
import { fonts } from "@/constants/fonts";
import { softNavTheme } from "@/constants/nav-theme";

const TAB_BAR_CONTENT = 52;
const TAB_ICON_SIZE = 22;

type IconName = ComponentProps<typeof Ionicons>["name"];

function TabIcon({
  focused,
  color,
  active,
  inactive,
}: {
  focused: boolean;
  color: ColorValue;
  active: IconName;
  inactive: IconName;
}) {
  return (
    <Ionicons
      name={focused ? active : inactive}
      size={TAB_ICON_SIZE}
      color={color}
    />
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { locale, resolvedTheme } = useAppSettings();
  const dark = resolvedTheme === "dark";
  const nav = softNavTheme(dark);
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      key={`${locale}-${resolvedTheme}`}
      // Lazy detach + varsayılan beyaz sahne = geçişte flaş
      detachInactiveScreens={false}
      safeAreaInsets={{ bottom: 0 }}
      screenListeners={{
        tabPress: () => {
          hapticSelection();
        },
      }}
      screenOptions={{
        headerStyle: nav.headerStyle,
        headerTintColor: nav.headerTintColor,
        headerTitleStyle: nav.headerTitleStyle,
        headerShadowVisible: nav.headerShadowVisible,
        // Tabs: "none" | "fade" | "shift"
        animation: "fade",
        transitionSpec: {
          animation: "timing",
          config: {
            duration: 220,
            easing: Easing.out(Easing.cubic),
          },
        },
        sceneStyle: {
          backgroundColor: nav.contentBackground,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMedium,
          fontSize: 11,
          marginTop: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarStyle: {
          backgroundColor: nav.tabBarBackground,
          borderTopColor: nav.tabBarBorder,
          borderTopWidth: dark ? 1 : 0,
          height: TAB_BAR_CONTENT + bottomInset,
          paddingTop: 4,
          paddingBottom: bottomInset,
          elevation: dark ? 0 : 8,
          shadowColor: "#1a2f25",
          shadowOpacity: dark ? 0 : 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarActiveTintColor: nav.tabBarActive,
        tabBarInactiveTintColor: nav.tabBarInactive,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.today"),
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              active="sunny"
              inactive="sunny-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="namaz"
        options={{
          title: t("tabs.prayer"),
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              active="book"
              inactive="book-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="dualar"
        options={{
          title: t("tabs.duas"),
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              active="heart"
              inactive="heart-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="takip"
        options={{
          title: t("tabs.tracking"),
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              active="stats-chart"
              inactive="stats-chart-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ayarlar"
        options={{
          title: t("tabs.settings"),
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              active="settings"
              inactive="settings-outline"
            />
          ),
        }}
      />
      {/* Kıble: alt barda değil — anasayfadaki kısayoldan açılır */}
      <Tabs.Screen
        name="kible"
        options={{
          href: null,
          title: t("tabs.qibla"),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
