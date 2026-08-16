# Image attribution

## Onboarding / banners (legacy)

| File                                                                       | Slide               | Source / subject                   |
| -------------------------------------------------------------------------- | ------------------- | ---------------------------------- |
| `onboarding-welcome.jpg`                                                   | Hoş geldin          | Unsplash — Kabe                    |
| `onboarding-prayer.jpg`                                                    | Namaz nasıl kılınır | Oluşturulmuş — namazgâh / cami içi |
| `onboarding-dua.jpg`                                                       | Her gün farklı dua  | Oluşturulmuş — dua eden eller      |
| `onboarding-ready.jpg`                                                     | Hazırsın            | Unsplash — şafak manzarası         |
| `home-hero.jpg`, `dualar-banner.jpg`, `namaz-banner.jpg`                   | UI banners (dark)   | Project assets                     |
| `light/home-hero.png`, `light/dualar-banner.png`, `light/namaz-banner.png` | UI banners (light)  | Generated for light theme          |

Unsplash License: https://unsplash.com/license

## Prayer step art (original — no third-party stock)

All files under `prayer-steps/` were created specifically for Namaz Rehberim
as photorealistic pose illustrations. No stock photography for step art.

| Path                         | Purpose                    |
| ---------------------------- | -------------------------- |
| `prayer-steps/niyet.png`     | Intention / standing       |
| `prayer-steps/tekbir.png`    | Opening takbir             |
| `prayer-steps/kiyam.png`     | Standing with folded hands |
| `prayer-steps/ruku.png`      | Bowing                     |
| `prayer-steps/kavme.png`     | Rising after ruku          |
| `prayer-steps/secde.png`     | Prostration                |
| `prayer-steps/oturma.png`    | Sitting between sujuds     |
| `prayer-steps/teshehhud.png` | Tashahhud sitting          |
| `prayer-steps/kunut.png`     | Qunut / hands raised       |
| `prayer-steps/selam.png`     | Salam                      |

Copyright: Namaz Rehberim project. Free to use within this app.

## Dua audio

| Path                                 | Source                          | Notes                                          |
| ------------------------------------ | ------------------------------- | ---------------------------------------------- |
| `../audio/duas/5,6,7,8,9,12,14.mp3`  | Mishary Alafasy / EveryAyah     | Quran ayahs                                    |
| `../audio/duas/1,2,3,4,10,11,13.mp3` | Edge neural `ar-SA-HamedNeural` | Sunnah adhkar — bundled MP3, not on-device TTS |

Playback uses `expo-audio` only (`lib/speak-arabic.ts`).
