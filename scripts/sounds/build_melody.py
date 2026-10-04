"""Vakit sesi "Huzur" melodisini sentezler → assets/sounds/melody.wav

Ney'i andıran yumuşak üflemeli tını (hafif nefes + gecikmeli vibrato),
altında D–A drone ve oda yankısı. ~24 sn; iOS bildirim sesi sınırı 30 sn.
Çalıştır: python3 scripts/sounds/build_melody.py  (numpy gerekir)
"""

from pathlib import Path
import wave

import numpy as np

RATE = 44100
OUT = Path(__file__).resolve().parents[2] / "assets" / "sounds" / "melody.wav"
RNG = np.random.default_rng(7)

D4 = 293.66
# Yarım ton adımları D4'ten (D dorian/pentatonik çevresi)
NOTE = {
    "D4": 0, "E4": 2, "F4": 3, "G4": 5, "A4": 7,
    "C5": 10, "D5": 12, "E5": 14,
}
# (nota, süre sn) — iki soru-cevap cümlesi, son nota uzun
PHRASES = [
    [("A4", 1.1), ("D5", 1.6), ("C5", 0.7), ("A4", 0.9), ("G4", 0.7), ("A4", 2.2)],
    [("F4", 0.9), ("G4", 0.7), ("A4", 1.2), ("G4", 0.7), ("F4", 0.7), ("E4", 0.8), ("D4", 2.6)],
    [("A4", 0.9), ("C5", 0.9), ("D5", 1.0), ("E5", 0.8), ("D5", 0.9), ("A4", 3.2)],
]
GAP = 0.45
TAIL = 2.2


def freq(name: str) -> float:
    return D4 * 2 ** (NOTE[name] / 12)


def ney(f: float, length: float) -> np.ndarray:
    n = int(RATE * length)
    t = np.arange(n) / RATE
    # Vibrato notanın ortasında yavaşça girer
    vib_depth = 0.006 * np.clip((t - 0.35) / 0.6, 0, 1)
    phase = 2 * np.pi * np.cumsum(f * (1 + vib_depth * np.sin(2 * np.pi * 5.0 * t))) / RATE
    tone = np.sin(phase) + 0.22 * np.sin(2 * phase) + 0.08 * np.sin(3 * phase)
    # Nefes: tonla birlikte salınan filtrelenmiş gürültü
    noise = RNG.standard_normal(n)
    noise = np.convolve(noise, np.ones(18) / 18, mode="same")
    tone += 0.10 * noise * (0.6 + 0.4 * np.sin(phase))
    attack = np.clip(t / 0.18, 0, 1) ** 1.5
    release = np.clip((length - t) / 0.35, 0, 1)
    return tone * attack * release


def main() -> None:
    melody_len = sum(d for p in PHRASES for _, d in p) + GAP * len(PHRASES)
    total_len = melody_len + 0.6 + TAIL
    total = int(RATE * total_len)
    lead = np.zeros(total)

    cursor = 0.6
    for phrase in PHRASES:
        for i, (name, dur) in enumerate(phrase):
            # Notalar hafif üst üste biner → legato
            overlap = 0.08 if i < len(phrase) - 1 else 0.0
            note = ney(freq(name), dur + overlap)
            a = int(RATE * cursor)
            b = min(total, a + len(note))
            lead[a:b] += note[: b - a]
            cursor += dur
        cursor += GAP

    t = np.arange(total) / RATE
    drone = (
        0.5 * np.sin(2 * np.pi * (D4 / 2) * t)
        + 0.3 * np.sin(2 * np.pi * (D4 * 0.75) * t)
        + 0.12 * np.sin(2 * np.pi * D4 * t)
    )
    drone *= (0.85 + 0.15 * np.sin(2 * np.pi * 0.11 * t))
    drone *= np.clip(t / 2.5, 0, 1) * np.clip((total_len - t) / 3.0, 0, 1)

    mix = 0.75 * lead + 0.16 * drone

    # Basit oda yankısı: azalan çoklu gecikme
    wet = np.zeros_like(mix)
    for delay, gain in [(0.071, 0.32), (0.113, 0.26), (0.167, 0.2), (0.241, 0.15), (0.337, 0.1)]:
        k = int(RATE * delay)
        wet[k:] += gain * mix[:-k]
    wet = np.convolve(wet, np.ones(40) / 40, mode="same")
    mix = mix + 0.55 * wet

    fade = np.clip((total_len - t) / 1.2, 0, 1)
    mix *= fade
    mix = mix / np.max(np.abs(mix)) * 0.85

    with wave.open(str(OUT), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes((mix * 32767).astype("<i2").tobytes())
    print(f"{OUT} ({total_len:.1f} sn)")


if __name__ == "__main__":
    main()
