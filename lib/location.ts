import * as Location from "expo-location";
import {
  DEFAULT_CITY_ID,
  findNearestCity,
  getCityById,
  type TurkeyCity,
} from "@/data/cities-tr";

export async function resolveCityFromDevice(): Promise<{
  city: TurkeyCity;
  granted: boolean;
}> {
  const { status } = await Location.requestForegroundPermissionsAsync();
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
