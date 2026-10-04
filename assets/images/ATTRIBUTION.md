# Image attribution

## Onboarding / banners (legacy)

| File                                                                       | Slide               | Source / subject                   |
| -------------------------------------------------------------------------- | ------------------- | ---------------------------------- |
| `onboarding-welcome.jpg`                                                   | Hoş geldin          | Unsplash — Kabe                    |
| `onboarding-prayer.jpg`                                                    | Namaz nasıl kılınır | Oluşturulmuş — namazgâh / cami içi |
| `onboarding-dua.jpg`                                                       | Her gün farklı dua  | Oluşturulmuş — dua eden eller      |
| `onboarding-ready.jpg`                                                     | Hazırsın            | Unsplash — şafak manzarası         |
| `home-hero.jpg`, `dualar-banner.jpg`, `namaz-banner.jpg`                   | UI banners (dark)   | Project assets                     |
| `light/home-hero.jpg`, `light/dualar-banner.jpg`, `light/namaz-banner.jpg` | UI banners (light)  | Generated for light theme          |

Unsplash License: https://unsplash.com/license

## Prayer step art (original — no third-party stock)

All files under `prayer-steps/` were created specifically for Namaz Rehberim
as photorealistic pose illustrations. No stock photography for step art.

| Path                         | Purpose                    |
| ---------------------------- | -------------------------- |
| `prayer-steps/niyet.jpg`     | Intention / standing       |
| `prayer-steps/tekbir.jpg`    | Opening takbir             |
| `prayer-steps/kiyam.jpg`     | Standing with folded hands |
| `prayer-steps/ruku.jpg`      | Bowing                     |
| `prayer-steps/kavme.jpg`     | Rising after ruku          |
| `prayer-steps/secde.jpg`     | Prostration                |
| `prayer-steps/oturma.jpg`    | Sitting between sujuds     |
| `prayer-steps/teshehhud.jpg` | Tashahhud sitting          |
| `prayer-steps/kunut.jpg`     | Qunut / hands raised       |
| `prayer-steps/selam.jpg`     | Salam                      |

Copyright: Namaz Rehberim project. Free to use within this app.

## Dua audio

| Path                                 | Source                          | Notes                                          |
| ------------------------------------ | ------------------------------- | ---------------------------------------------- |
| `../audio/duas/5,6,7,8,9,12,14.mp3`  | Mishary Alafasy / EveryAyah     | Quran ayahs                                    |
| `../audio/duas/1,2,3,4,10,11,13.mp3` | Edge neural `ar-SA-HamedNeural` | Sunnah adhkar — bundled MP3, not on-device TTS |

Playback uses `expo-audio` only (`lib/speak-arabic.ts`).
