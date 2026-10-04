import { Children, Fragment, type ComponentProps, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts } from "@/constants/fonts";
import { cardShadow, themeColors } from "@/constants/theme";
import { useAppSettings } from "@/lib/settings-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

function useChrome() {
  const { resolvedTheme } = useAppSettings();
  const dark = resolvedTheme === "dark";
  return { dark, chrome: dark ? themeColors.dark : themeColors.light };
}

/** Gruplanmış kart: başlık + satırlar (aralarında ayraç) + alt not */
export function SettingsSection({
  title,
  footer,
  children,
}: {
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const { dark, chrome } = useChrome();
  const rows = Children.toArray(children).filter(Boolean);

  return (
    <View style={{ marginBottom: 28 }}>
      {title ? (
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: fonts.bodySemi,
            fontSize: 12,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: chrome.muted,
            marginBottom: 8,
            marginLeft: 4,
          }}
        >
          {title}
        </Text>
      ) : null}
      <View
        style={[
          {
            backgroundColor: chrome.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: chrome.border,
          },
          cardShadow(dark),
        ]}
      >
        <View style={{ borderRadius: 16, overflow: "hidden" }}>
          {rows.map((row, index) => (
            <Fragment key={index}>
              {index > 0 ? (
                <View
                  style={{
                    height: 1,
                    marginLeft: 60,
                    backgroundColor: chrome.border,
                  }}
                />
              ) : null}
              {row}
            </Fragment>
          ))}
        </View>
      </View>
      {footer ? (
        typeof footer === "string" ? (
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              lineHeight: 18,
              color: chrome.muted,
              marginTop: 8,
              marginHorizontal: 4,
            }}
          >
            {footer}
          </Text>
        ) : (
          footer
        )
      ) : null}
    </View>
  );
}

export function SettingsIcon({ name }: { name: IconName }) {
  const { dark, chrome } = useChrome();
  return (
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: dark
          ? "rgba(212,168,75,0.14)"
          : "rgba(42,74,57,0.09)",
      }}
    >
      <Ionicons name={name} size={18} color={chrome.tint} />
    </View>
  );
}

/** Tek satır: ikon + başlık/alt yazı + sağda değer veya kontrol */
export function SettingsRow({
  icon,
  label,
  hint,
  value,
  right,
  onPress,
  chevron = false,
  accessibilityLabel,
}: {
  icon?: IconName;
  label: string;
  hint?: string;
  value?: string;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  accessibilityLabel?: string;
}) {
  const { chrome } = useChrome();

  const content = (
    <View
      style={{
        minHeight: 56,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
      }}
    >
      {icon ? <SettingsIcon name={icon} /> : <View style={{ width: 32 }} />}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: fonts.bodyMedium,
            fontSize: 16,
            lineHeight: 21,
            color: chrome.text,
          }}
        >
          {label}
        </Text>
        {hint ? (
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              lineHeight: 18,
              color: chrome.muted,
              marginTop: 2,
            }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text
          numberOfLines={1}
          style={{
            fontFamily: fonts.body,
            fontSize: 15,
            color: chrome.muted,
            maxWidth: 150,
          }}
        >
          {value}
        </Text>
      ) : null}
      {right}
      {chevron ? (
        <Ionicons name="chevron-forward" size={18} color={chrome.muted} />
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? [label, value].filter(Boolean).join(", ")
      }
      android_ripple={{ color: "rgba(42,74,57,0.1)" }}
      className="active:opacity-60"
    >
      {content}
    </Pressable>
  );
}

/** iOS benzeri segment kontrol — tekli seçim */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}) {
  const { dark, chrome } = useChrome();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: "row",
        padding: 3,
        borderRadius: 12,
        backgroundColor: dark
          ? "rgba(243,239,230,0.07)"
          : "rgba(42,74,57,0.08)",
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            className="active:opacity-70"
            style={[
              {
                flex: 1,
                minHeight: 40,
                borderRadius: 9,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 6,
                backgroundColor: selected
                  ? dark
                    ? "#2f4a3d"
                    : "#fbf8f2"
                  : "transparent",
              },
              selected ? cardShadow(dark) : null,
            ]}
          >
            <Text
              numberOfLines={1}
              style={{
                fontFamily: selected ? fonts.bodySemi : fonts.bodyMedium,
                fontSize: 14,
                color: selected ? chrome.text : chrome.muted,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Kart içinde başlıklı segment satırı */
export function SettingsSegmentRow<T extends string | number>({
  icon,
  label,
  options,
  value,
  onChange,
}: {
  icon: IconName;
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { chrome } = useChrome();
  return (
    <View style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          marginBottom: 12,
        }}
      >
        <SettingsIcon name={icon} />
        <Text
          style={{
            fontFamily: fonts.bodyMedium,
            fontSize: 16,
            color: chrome.text,
          }}
        >
          {label}
        </Text>
      </View>
      <SegmentedControl
        options={options}
        value={value}
        onChange={onChange}
        accessibilityLabel={label}
      />
    </View>
  );
}

/** Çoklu seçim satırı: sağda onay işareti */
export function SettingsCheckRow({
  label,
  value,
  checked,
  onPress,
}: {
  label: string;
  value?: string;
  checked: boolean;
  onPress: () => void;
}) {
  const { chrome } = useChrome();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={[label, value].filter(Boolean).join(", ")}
      android_ripple={{ color: "rgba(42,74,57,0.1)" }}
      className="active:opacity-60"
    >
      <View
        style={{
          minHeight: 50,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <View style={{ width: 32, alignItems: "center" }}>
          <Ionicons
            name={checked ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={checked ? chrome.tint : chrome.muted}
          />
        </View>
        <Text
          style={{
            flex: 1,
            fontFamily: fonts.bodyMedium,
            fontSize: 16,
            color: chrome.text,
          }}
        >
          {label}
        </Text>
        {value ? (
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 15,
              color: chrome.muted,
              fontVariant: ["tabular-nums"],
            }}
          >
            {value}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
