import * as Location from "expo-location";
import {
  DEFAULT_CITY_ID,
  findNearestCity,
  getCityById,
  type TurkeyCity,
} from "@/data/cities-tr";

/**
 * Konumdan en yakın ili bulur (hesap cihazda; konum dışarı gönderilmez).
 * `request: false` iken izin istenmez — ilk açılışta izin onboarding
 * sonunda, bağlamıyla birlikte istenir.
 */
export async function resolveCityFromDevice({
  request = true,
}: { request?: boolean } = {}): Promise<{
  city: TurkeyCity;
  granted: boolean;
}> {
  const { status } = request
    ? await Location.requestForegroundPermissionsAsync()
    : await Location.getForegroundPermissionsAsync();
  if (status !== "granted") {
    return { city: getCityById(DEFAULT_CITY_ID), granted: false };
  }

  try {
    const position = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("location-timeout")), 8000),
      ),
    ]);
    const city = findNearestCity(
      position.coords.latitude,
      position.coords.longitude,
    );
    return { city, granted: true };
  } catch {
    return { city: getCityById(DEFAULT_CITY_ID), granted: false };
  }
}
