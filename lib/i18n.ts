import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import { translations, type Locale } from "@/locales/translations";

export const i18n = new I18n(translations);

i18n.enableFallback = true;
i18n.defaultLocale = "tr";

export function deviceLocale(): Locale {
  const code = Localization.getLocales()[0]?.languageCode?.toLowerCase();
  return code === "en" ? "en" : "tr";
}

export function setI18nLocale(locale: Locale) {
  i18n.locale = locale;
}

export function t(
  key: string,
  options?: Record<string, string | number>,
): string {
  return i18n.t(key, options);
}

export function formatDate(date = new Date(), locale: Locale = "tr"): string {
  return date.toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
