# Yayın kontrol listesi

## Hazır (kodda)

- [x] Uygulama adı TR/EN yerelleştirildi (`locales/native/*.json`)
- [x] İkon: 1024×1024, RGB, alfa kanalı yok · iOS 18 koyu + tinted varyant
- [x] Android adaptive ikon (ön plan güvenli alanda, gradyan arka plan, monokrom)
- [x] Splash: açık/koyu zemin, keskin amblem
- [x] Marka görselleri tek komutla: `npm run brand:assets`
- [x] İzinler sadeleşti: mikrofon, arka plan konumu, arka plan ses, harici depolama kapalı
- [x] Konum izni onboarding sonunda, bağlamıyla isteniyor; izin metni TR/EN
- [x] Yerel bildirimler + özel sesler (ezan CC0, ışıltı/zil projeye ait) — `assets/sounds/CREDITS.md`
- [x] Namaz oturumunda ekran açık kalıyor (keep-awake)
- [x] Root hata ekranı (ErrorBoundary)
- [x] Görseller sıkıştırıldı (~16 MB → ~4 MB)
- [x] `tsc` temiz, `expo-doctor` 18/18
- [x] iPad desteği kapalı (`supportsTablet: false`) — iPad ekran görüntüsü gerekmez

## Hesaplar (senin tarafında)

- [ ] **Apple Developer Program** (yıllık 99 $) — TestFlight ve App Store için şart.
      Ücretsiz Apple ID ile yalnız kendi cihazına Xcode'dan kurulum (7 günde bir yenilenir).
- [ ] **Google Play Console** (tek sefer 25 $) — dahili test kanalı hızlı başlangıç için ideal.

## Mağaza bilgileri

- [ ] Gizlilik politikası URL'si — metin hazır: `docs/privacy-policy.md`
      (GitHub Pages / Notion gibi herkese açık bir yerde yayınla, iletişim e-postasını doldur)
- [ ] App Privacy (nutrition label): **Data Not Collected**
- [ ] Yaş sınırı: 4+ · Kategori: Referans / Yaşam Tarzı
- [ ] Açıklama, alt başlık (30 karakter), anahtar kelimeler (TR + EN)
- [ ] Ekran görüntüleri: iPhone 6.9" (1320×2868) — en az 3; Android telefon
- [ ] Destek URL'si

## Derleme

```bash
# Simülatör development build
npx expo run:ios

# Kendi iPhone'una (ücretsiz Apple ID, Xcode'da Personal Team)
npx expo run:ios --device

# Mağaza / TestFlight (Apple Developer hesabı gerekir)
eas build --platform ios --profile production
eas submit --platform ios

# Android dahili test
eas build --platform android --profile production
```

## Bilinen notlar

- Android 12+ kesin zamanlı bildirim için `SCHEDULE_EXACT_ALARM` izni istenir;
  kullanıcı reddederse bildirim birkaç dakika gecikebilir.
- iOS en fazla 64 bekleyen bildirim tutar → uygulama 5–12 günlük pencere planlar,
  her açılışta yeniler.
