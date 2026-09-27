import { Text, View, type TextStyle } from "react-native";
import { fonts } from "@/constants/fonts";
import { t } from "@/lib/i18n";

type Props = {
  arabic: string;
  latin: string;
  meaning: string;
  /** Koyu kart üzerinde (bugünün duası hero) */
  light?: boolean;
  size?: "md" | "lg";
};

/**
 * Arapça Latin fontla basılmamalı — glifler eksik/bozuk çıkar.
 * Sistem Arapça fontu + RTL + bol satır aralığı.
 */
const arabicBase: TextStyle = {
  // Cormorant/DM Sans Arapça desteklemez; sistem fontuna bırak
  writingDirection: "rtl",
  textAlign: "right",
};

export function DuaBody({
  arabic,
  latin,
  meaning,
  light = false,
  size = "md",
}: Props) {
  const labelClass = light
    ? "text-[11px] uppercase tracking-[1.5px] text-gold-400"
    : "text-[11px] uppercase tracking-[1.5px] text-forest-400 dark:text-sand-200/65";
  const arabicClass =
    size === "lg"
      ? light
        ? "text-[26px] text-sand-100"
        : "text-[24px] text-forest-800 dark:text-sand-100"
      : light
        ? "text-[22px] text-sand-100"
        : "text-[20px] text-forest-800 dark:text-sand-100";
  const latinClass = light
    ? "text-[15px] italic leading-6 text-sand-200"
    : "text-[15px] italic leading-6 text-forest-500 dark:text-sand-200";
  const meaningClass = light
    ? "text-[15px] leading-6 text-sand-50"
    : "text-[15px] leading-6 text-forest-800 dark:text-sand-100";

  const arabicLineHeight = size === "lg" ? 46 : 40;

  return (
    <View>
      <Text style={{ fontFamily: fonts.bodyMedium }} className={labelClass}>
        {t("duas.arabicLabel")}
      </Text>
      <Text
        selectable
        style={[arabicBase, { lineHeight: arabicLineHeight, marginTop: 8 }]}
        className={arabicClass}
      >
        {arabic}
      </Text>

      <Text
        style={{ fontFamily: fonts.bodyMedium }}
        className={`mt-4 ${labelClass}`}
      >
        {t("duas.readingLabel")}
      </Text>
      <Text
        selectable
        style={{ fontFamily: fonts.body }}
        className={`mt-1.5 ${latinClass}`}
      >
        {latin}
      </Text>

      <Text
        style={{ fontFamily: fonts.bodyMedium }}
        className={`mt-4 ${labelClass}`}
      >
        {t("duas.meaningLabel")}
      </Text>
      <Text
        selectable
        style={{ fontFamily: fonts.body }}
        className={`mt-1.5 ${meaningClass}`}
      >
        {meaning}
      </Text>
    </View>
  );
}
