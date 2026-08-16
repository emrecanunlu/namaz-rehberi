import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

const canHaptic = Platform.OS === "ios" || Platform.OS === "android";

/** Hafif dokunuş — buton, atla, dinle */
export function hapticLight() {
  if (!canHaptic) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

/** Orta — önemli CTA (namaza başla, bölüm başlat) */
export function hapticMedium() {
  if (!canHaptic) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
    () => undefined,
  );
}

/** Seçim — chip, switch, accordion, adım ileri/geri */
export function hapticSelection() {
  if (!canHaptic) return;
  void Haptics.selectionAsync().catch(() => undefined);
}

/** Başarı — bölüm bitti, kıble hizalandı, onboarding tamam */
export function hapticSuccess() {
  if (!canHaptic) return;
  void Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success,
  ).catch(() => undefined);
}

/** Uyarı — izin reddi vb. */
export function hapticWarning() {
  if (!canHaptic) return;
  void Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Warning,
  ).catch(() => undefined);
}
