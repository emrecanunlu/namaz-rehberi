import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";

export type AlarmAuthorization =
  | "authorized"
  | "denied"
  | "notDetermined"
  | "unavailable";

export type NativeAlarmItem = {
  /** Unix ms */
  timestamp: number;
  title: string;
  /** iOS 26.0'da durdurma düğmesi metni (26.1+ sistem kendi koyar) */
  stopLabel: string;
  /** Uygulama paketindeki ses dosyası; boşsa sistem alarm sesi */
  sound: string;
};

type PrayerAlarmNative = {
  isAvailable(): boolean;
  getAuthorizationStatus(): AlarmAuthorization;
  requestAuthorization(): Promise<AlarmAuthorization>;
  scheduleAlarms(items: NativeAlarmItem[], replace: boolean): Promise<number>;
  cancelAll(): Promise<void>;
};

/** Expo Go ve modülü içermeyen eski build'lerde null */
const native =
  Platform.OS === "ios"
    ? requireOptionalNativeModule<PrayerAlarmNative>("PrayerAlarm")
    : null;

/** iOS 26+ ve modül build'de var mı */
export function isNativeAlarmAvailable() {
  try {
    return native?.isAvailable() === true;
  } catch {
    return false;
  }
}

export function getAlarmAuthorization(): AlarmAuthorization {
  if (!isNativeAlarmAvailable()) return "unavailable";
  return native!.getAuthorizationStatus();
}

export async function requestAlarmAuthorization(): Promise<AlarmAuthorization> {
  if (!isNativeAlarmAvailable()) return "unavailable";
  try {
    return await native!.requestAuthorization();
  } catch {
    return "denied";
  }
}

/** replace: uygulamanın önceki tüm alarmlarını silip yeniden kurar */
export async function scheduleNativeAlarms(
  items: NativeAlarmItem[],
  replace = true,
): Promise<number> {
  if (getAlarmAuthorization() !== "authorized") return 0;
  return native!.scheduleAlarms(items, replace);
}

export async function cancelNativeAlarms() {
  if (getAlarmAuthorization() !== "authorized") return;
  await native!.cancelAll();
}
