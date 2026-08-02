# Image attribution

## Onboarding / banners (legacy)

| File | Slide | Source / subject |
|------|--------|------------------|
| `onboarding-welcome.jpg` | Hoş geldin | Unsplash — Kabe |
| `onboarding-prayer.jpg` | Namaz nasıl kılınır | Oluşturulmuş — namazgâh / cami içi |
| `onboarding-dua.jpg` | Her gün farklı dua | Oluşturulmuş — dua eden eller |
| `onboarding-ready.jpg` | Hazırsın | Unsplash — şafak manzarası |
| `home-hero.jpg`, `dualar-banner.jpg`, `namaz-banner.jpg` | UI banners | Project assets |

Unsplash License: https://unsplash.com/license

## Prayer step & dua art (original — no third-party stock)

All files under `prayer-steps/` and `duas/` were created specifically for Namaz Rehberi
as flat silhouette illustrations. No stock photography, no Unsplash, no licensed clipart.

| Path | Purpose |
|------|---------|
| `prayer-steps/niyet.png` | Intention / standing |
| `prayer-steps/tekbir.png` | Opening takbir |
| `prayer-steps/kiyam.png` | Standing with folded hands |
| `prayer-steps/ruku.png` | Bowing |
| `prayer-steps/kavme.png` | Rising after ruku |
| `prayer-steps/secde.png` | Prostration |
| `prayer-steps/oturma.png` | Sitting between sujuds |
| `prayer-steps/teshehhud.png` | Tashahhud sitting |
| `prayer-steps/kunut.png` | Qunut / hands raised |
| `prayer-steps/selam.png` | Salam |
| `duas/card.png` | Shared dua card background |

Copyright: Namaz Rehberi project. Free to use within this app.

## Dua audio

| Path | Source | Notes |
|------|--------|-------|
| `../audio/duas/5,6,7,8,9,12,14.mp3` | Mishary Alafasy / EveryAyah | Quran ayahs |
| `../audio/duas/1,2,3,4,10,11,13.mp3` | Edge neural `ar-SA-HamedNeural` | Sunnah adhkar — bundled MP3, not on-device TTS |

Playback uses `expo-audio` only (`lib/speak-arabic.ts`).


