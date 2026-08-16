import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  TURKEY_CITIES,
  cityDisplayName,
  type TurkeyCity,
} from "@/data/cities-tr";
import { fonts } from "@/constants/fonts";
import { t } from "@/lib/i18n";
import { useAppSettings } from "@/lib/settings-context";
import { hapticMedium, hapticSuccess } from "@/lib/haptics";

type Props = {
  visible: boolean;
  onClose: () => void;
};

/** Minimal il seçici — RN Modal (gorhom/worklets crash’inden kaçınır). */
export function CityPickerSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { locale, cityId, setCityManual, refreshLocation, resolvedTheme } =
    useAppSettings();

  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const dark = resolvedTheme === "dark";
  const sheetH = Math.min(height * 0.72, 560);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return TURKEY_CITIES;
    return TURKEY_CITIES.filter(
      (c) =>
        c.nameTr.toLocaleLowerCase("tr-TR").includes(q) ||
        c.nameEn.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setQuery("");
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }
    if (!mounted) return;
    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, mounted, progress]);

  const selectCity = async (city: TurkeyCity) => {
    hapticSuccess();
    await setCityManual(city.id);
    onClose();
  };

  const useLocation = async () => {
    hapticMedium();
    setLocating(true);
    try {
      await refreshLocation();
      onClose();
    } finally {
      setLocating(false);
    }
  };

  if (!mounted) return null;

  const bg = dark ? "#121c17" : "#ebe4d4";
  const text = dark ? "#f3efe6" : "#1a2f25";
  const muted = dark ? "rgba(194,215,203,0.45)" : "rgba(61,107,82,0.4)";
  const line = dark ? "rgba(42,74,57,0.45)" : "rgba(230,220,200,0.95)";
  const field = dark ? "#0f1a15" : "#ffffff";

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "#000",
                opacity: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.48],
                }),
              },
            ]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetH,
              backgroundColor: bg,
              paddingBottom: Math.max(insets.bottom, 12),
              borderColor: line,
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [sheetH * 0.35, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.handleWrap}>
            <View
              style={[
                styles.handle,
                {
                  backgroundColor: dark
                    ? "rgba(243,239,230,0.28)"
                    : "rgba(26,47,37,0.2)",
                },
              ]}
            />
          </View>

          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { fontFamily: fonts.displayBold, color: text },
              ]}
            >
              {t("settings.city")}
            </Text>
            <Pressable
              onPress={() => void useLocation()}
              disabled={locating}
              hitSlop={8}
              style={styles.locateBtn}
              accessibilityLabel={t("settings.useLocation")}
            >
              {locating ? (
                <ActivityIndicator size="small" color="#d4a84b" />
              ) : (
                <Ionicons name="locate-outline" size={20} color="#d4a84b" />
              )}
            </Pressable>
          </View>

          <View
            style={[styles.search, { backgroundColor: field, borderColor: line }]}
          >
            <Ionicons name="search" size={15} color={muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t("settings.citySearch")}
              placeholderTextColor={muted}
              autoCorrect={false}
              autoCapitalize="none"
              style={[styles.searchInput, { fontFamily: fonts.body, color: text }]}
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <Ionicons name="close" size={15} color={muted} />
              </Pressable>
            ) : null}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            windowSize={8}
            ItemSeparatorComponent={() => (
              <View style={[styles.sep, { backgroundColor: line }]} />
            )}
            ListEmptyComponent={
              <Text
                style={{
                  fontFamily: fonts.body,
                  color: muted,
                  textAlign: "center",
                  paddingVertical: 32,
                }}
              >
                {t("common.notFound")}
              </Text>
            }
            renderItem={({ item }) => {
              const selected = item.id === cityId;
              return (
                <Pressable
                  onPress={() => void selectCity(item)}
                  style={styles.row}
                >
                  <Text
                    style={{
                      fontFamily: selected ? fonts.bodySemi : fonts.body,
                      fontSize: 16,
                      color: selected ? "#d4a84b" : text,
                    }}
                  >
                    {cityDisplayName(item, locale)}
                  </Text>
                  {selected ? (
                    <Ionicons name="checkmark" size={18} color="#d4a84b" />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
  },
  locateBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    marginHorizontal: 20,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 20,
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
