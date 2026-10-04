# Namaz Rehberim

Expo (SDK 57) + React Native + NativeWind mobil uygulaması.

## Özellikler

- Adım adım namaz rehberi ve sesli kıldırıcı (bölüm bölüm)
- İl bazlı namaz vakitleri (Diyanet hesaplaması, cihazda) ve kıble bulucu
- Vakit bildirimleri: vakit girince ezan, önceden hatırlatma (yerel, sunucusuz)
- Günlük dua, namaz takibi ve paylaşılabilir rapor
- Açık / koyu tema, Türkçe / English

## Çalıştırma

```bash
npm install
npm start            # Expo Go (özel bildirim sesleri sistem sesine düşer)
npx expo run:ios     # development build (tam özellik)
```

## Marka görselleri

`assets/brand/source-emblem.png` kaynağından ikon, splash ve Android ikonları üretilir:

```bash
npm run brand:assets   # Pillow + numpy gerekir
```

## Yayın

Kontrol listesi: [`docs/RELEASE.md`](docs/RELEASE.md) · Gizlilik: [`docs/privacy-policy.md`](docs/privacy-policy.md)
