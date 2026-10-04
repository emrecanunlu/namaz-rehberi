# Ada — günlük döngü tasarımı

Kullanıcı namaz kıldıkça ve günlük görevleri tamamladıkça büyüyen 3D ada.
İlke: **asla gerilemez, suçluluk yok; her gün açmak için yeni bir sebep var, sonu yok.**

## Para birimi: Nur
| Kaynak | Nur |
|---|---|
| Kılınan farz namaz | 10 |
| Günlük görev | 5 |
| Tam gün (5/5 namaz) | +20 ve 1 tohum |
| Seri bonusu (o gün ≥1 namaz) | 2 × min(seri, 10) |

Nur kayıtlardan türetilir (namaz günlüğü + görev günlüğü); ayrı bir sayaç tutulmaz.
Bir namazın işaretini kaldırmak düzeltmedir, ceza değildir.

## Seviye (sonsuz)
Seviye n → n+1 maliyeti: `min(60 + 20n, 300)` nur. Yoğun bir gün yaklaşık 90–100 nur
getirir. İlk 12 seviye ilk adayı 2–3 haftada tamamlar, sonrasında her seviye birkaç gün sürer.

- Ada içi aşama = seviye % 12 (0–11): fidan → ağaç, ada büyür, öğeler eklenir.
- Her 12 seviyede bir **takımadaya yeni ada** eklenir. Temalar döner: Bahar, Sonbahar,
  Kış, Sakura, Vaha, ardından ton kaydırılmış tekrarlar. Böylece sonsuz çeşitlilik çıkar.
  Model aynıdır, renkleri uygulama temaya göre değiştirir.

## Her gün geri getirenler
1. **Tohum:** her tam gün bir tohum verir. Ekilen tohum gerçek günlerle büyür:
   filiz → fide → çiçek/ağaççık (lale, gül, lavanta, ayçiçeği, meyve fidanı). Sadece o gün
   en az bir namaz kılındıysa büyür ("sulanmış" sayılır). Kılınmayan gün bitki bekler, solmaz.
2. **Gökyüzü vakti izler:** imsak'ta şafak, öğlede açık mavi, ikindide sıcak tonlar,
   akşamda turuncu-mor, yatsıda yıldızlı gece ve yanan fenerler. Her vakitte ada başka görünür.
3. **Günün ziyaretçisi:** tarihe göre seçilen bir hayvan (tavşan, kuş, kirpi, ördek).
   O gün ilk namaz kılınınca gelir; o zamana kadar "bir ziyaretçi yolda" yazar.
4. **Günlük görevler:** her gün havuzdan tarihe göre 3 görev seçilir; Cuma'ya özel görev de var.
5. **Seri:** art arda günler. Seri bonusu 10 günde tavana ulaşır, seri bozulunca hiçbir şey kaybolmaz.

## Teknik
- Model: `scripts/island/build_island.py` → `assets/models/island.glb`.
  `sNN-MM__ad` aşama öğeleridir. `plant__tür__evre` ve `visitor__ad` uygulamanın kopyaladığı şablonlardır.
- Motor: `lib/island/` içinde saf fonksiyonlar (nur, seviye, seri, tohum evresi).
- Görünüm: `@react-three/fiber/native` + `expo-gl` + `three`; ekran `app/(tabs)/ada.tsx`.
