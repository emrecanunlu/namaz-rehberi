/** Kâbe — Mescid-i Haram (WGS84) */
export const KAABA = {
  lat: 21.422487,
  lng: 39.826206,
} as const;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

/** 0–360 aralığına getir */
export function normalizeDegrees(deg: number) {
  const n = deg % 360;
  return n < 0 ? n + 360 : n;
}

/**
 * İki nokta arası başlangıç yönü (true north’a göre, derece).
 * Kullanıcı → Kâbe kıble açısı için.
 */
export function bearingBetween(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
) {
  const φ1 = toRad(fromLat);
  const φ2 = toRad(toLat);
  const Δλ = toRad(toLng - fromLng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return normalizeDegrees(toDeg(Math.atan2(y, x)));
}

export function qiblaBearing(lat: number, lng: number) {
  return bearingBetween(lat, lng, KAABA.lat, KAABA.lng);
}

/** Cihazın üst kenarına göre kıble sapması (−180…180) */
export function qiblaOffset(qiblaDeg: number, headingDeg: number) {
  return ((qiblaDeg - headingDeg + 540) % 360) - 180;
}

/** Haversine mesafe (km) */
export function distanceKm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
) {
  const R = 6371;
  const dφ = toRad(toLat - fromLat);
  const dλ = toRad(toLng - fromLng);
  const a =
    Math.sin(dφ / 2) ** 2 +
    Math.cos(toRad(fromLat)) *
      Math.cos(toRad(toLat)) *
      Math.sin(dλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Heading yumuşatma — en kısa açısal yol */
export function smoothAngle(prev: number, next: number, alpha = 0.22) {
  let delta = next - prev;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return normalizeDegrees(prev + delta * alpha);
}
