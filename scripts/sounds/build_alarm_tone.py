"""Vakit alarmı sesini sentezler → assets/sounds/alarm_tone.wav

iOS bildirim sesi 30 sn'den kısa olmalı; ton ~28 sn. Üç notalı çan motifi
1.6 sn arayla tekrar eder, ses ilk 12 sn'de yumuşaktan güçlüye çıkar.
Çalıştır: python3 scripts/sounds/build_alarm_tone.py  (numpy gerekir)
"""

from pathlib import Path
import wave

import numpy as np

RATE = 44100
DURATION = 28.0
PERIOD = 1.6
# D5 – F#5 – A5 (D majör üçlü), son nota bir oktav üstte yankılanır
MOTIF = [(587.33, 0.0), (739.99, 0.18), (880.0, 0.36)]
OUT = Path(__file__).resolve().parents[2] / "assets" / "sounds" / "alarm_tone.wav"


def bell(freq: float, length: float) -> np.ndarray:
    t = np.arange(int(RATE * length)) / RATE
    partials = [(1.0, 1.0, 2.2), (2.0, 0.45, 3.4), (3.01, 0.22, 5.0), (4.2, 0.1, 7.0)]
    tone = sum(a * np.exp(-d * t) * np.sin(2 * np.pi * freq * m * t) for m, a, d in partials)
    attack = np.minimum(1.0, t / 0.004)
    return tone * attack


def main() -> None:
    total = int(RATE * DURATION)
    out = np.zeros(total)
    start = 0.0
    while start < DURATION - 1.2:
        for freq, offset in MOTIF:
            note = bell(freq, 1.4)
            i = int(RATE * (start + offset))
            j = min(total, i + len(note))
            out[i:j] += note[: j - i]
        start += PERIOD

    t = np.arange(total) / RATE
    ramp = 0.35 + 0.65 * np.clip(t / 12.0, 0.0, 1.0)
    fade = np.clip((DURATION - t) / 0.8, 0.0, 1.0)
    out *= ramp * fade
    out = out / np.max(np.abs(out)) * 0.89

    with wave.open(str(OUT), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes((out * 32767).astype("<i2").tobytes())
    print(f"{OUT} ({DURATION:.0f} sn)")


if __name__ == "__main__":
    main()
