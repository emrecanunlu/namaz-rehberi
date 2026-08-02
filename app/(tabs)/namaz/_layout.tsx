import { Stack } from "expo-router";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";

export default function NamazLayout() {
  const { locale, resolvedTheme } = useAppSettings();
  const dark = resolvedTheme === "dark";

  return (
    <Stack
      key={locale}
      screenOptions={{
        headerStyle: { backgroundColor: dark ? "#0f1a15" : "#1a2f25" },
        headerTintColor: "#f3efe6",
        headerTitleStyle: { fontWeight: "600" },
        contentStyle: { backgroundColor: dark ? "#0f1a15" : "#faf8f4" },
      }}
    >
      <Stack.Screen name="index" options={{ title: t("prayer.guideTitle") }} />
      <Stack.Screen
        name="[id]"
        options={{ title: t("prayer.guideTitle"), headerBackTitle: t("common.back") }}
      />
    </Stack>
  );
}
