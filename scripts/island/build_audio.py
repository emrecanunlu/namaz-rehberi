"""Ada ambiyans katmanlarını ve ses efektlerini sentezler → assets/audio/island/*.m4a

Çalıştırma: python3 scripts/island/build_audio.py   (numpy + ffmpeg gerekir)

Katmanlar (uygulamada adanın içeriğine göre açılıp kapanır, hepsi kusursuz döngü):
  pad       yumuşak pentatonik pad + seyrek müzik kutusu notaları (her zaman)
  wind      hafif rüzgâr (her zaman)
  birds     seyrek kuş cıvıltıları (ağaç büyüyünce)
  water     dere / gölet şırıltısı (gölet gelince)
  crickets  cırcır böcekleri (gece / dark tema)
Efektler: magic (sihirli belirme), vanish (puf), tap (dokunma)
"""

import os
import subprocess
import wave

import numpy as np

SR = 44100
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "assets", "audio", "island")
rng = np.random.default_rng(7)


# ---------------------------------------------------------------------------
# Yardımcılar
# ---------------------------------------------------------------------------


def t_axis(seconds):
    return np.arange(int(seconds * SR)) / SR


def fft_filter(x, low=None, high=None, tilt=0.0):
    """Frekans uzayında yumuşak bant geçiren + eğim (tilt<0 → pembe/kahverengi)."""
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    gain = np.ones_like(f)
    if low:
        gain *= 1 / (1 + (low / np.maximum(f, 1)) ** 4)
    if high:
        gain *= 1 / (1 + (f / high) ** 4)
    if tilt:
        gain *= (np.maximum(f, 20) / 1000.0) ** tilt
    return np.fft.irfft(spec * gain, n=len(x))


def reverb(x, seconds=2.5, mix=0.35, damp=3000):
    n = int(seconds * SR)
    tail = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    tail = fft_filter(tail, high=damp)
    tail /= np.sqrt(np.sum(tail**2))
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(tail, size), size)[: len(x) + n]
    out = np.concatenate([x, np.zeros(n)]) * (1 - mix) + wet * mix
    return out


def loopify(x, length, fade=2.0):
    """Uzun sinyali `length` saniyelik kusursuz döngüye çevirir: kuyruk başa bindirilir."""
    n = int(length * SR)
    f = int(fade * SR)
    x = x[: n + f] if len(x) >= n + f else np.concatenate([x, np.zeros(n + f - len(x))])
    head, tail = x[:n].copy(), x[n : n + f]
    ramp = np.linspace(0, 1, f)
    head[:f] = head[:f] * ramp + tail * (1 - ramp)
    return head


def normalize(x, peak=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def write(name, x, peak=0.9, fade_edges=False):
    os.makedirs(OUT, exist_ok=True)
    x = normalize(x, peak)
    if fade_edges:
        e = int(0.01 * SR)
        x[:e] *= np.linspace(0, 1, e)
        x[-e:] *= np.linspace(1, 0, e)
    wav = os.path.join(OUT, f"{name}.wav")
    with wave.open(wav, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    m4a = os.path.join(OUT, f"{name}.m4a")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-c:a", "aac", "-b:a", "96k", m4a], check=True)
    os.remove(wav)
    print(f"[audio] {name}.m4a {os.path.getsize(m4a) / 1024:.0f} KB")


def note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# ---------------------------------------------------------------------------
# Katmanlar
# ---------------------------------------------------------------------------

LOOP = 64.0  # saniye; akor döngüsü bunu tam böler


def pad():
    """D majör pentatonik, 4 akor × 16 sn; yavaş atak, nefes alan LFO, yumuşak müzik kutusu."""
    total = LOOP + 4
    t = t_axis(total)
    out = np.zeros_like(t)
    chords = [[50, 57, 62, 66, 69], [47, 54, 59, 62, 66], [43, 50, 55, 59, 62], [45, 52, 57, 61, 64]]
    seg = LOOP / len(chords)
    for k in range(len(chords) + 1):
        chord = chords[k % len(chords)]
        start = k * seg - 2
        env = np.clip((t - start) / 5.0, 0, 1) * np.clip((start + seg + 4 - t) / 5.0, 0, 1)
        env = np.sin(env * np.pi / 2) ** 2
        for i, m in enumerate(chord):
            f = note(m)
            for det in (-0.12, 0.12):
                ff = f * 2 ** (det / 12)
                phase = rng.uniform(0, 2 * np.pi)
                tone = np.sin(2 * np.pi * ff * t + phase) + 0.18 * np.sin(4 * np.pi * ff * t + phase)
                out += tone * env * (0.55 if i == 0 else 0.32)
    out *= 0.8 + 0.2 * np.sin(2 * np.pi * t / 8.0)
    out = fft_filter(out, high=2200)

    # Müzik kutusu: seyrek, yüksek pentatonik notalar
    bells = np.zeros_like(t)
    scale = [74, 76, 78, 81, 83, 86, 88]
    time = 1.5
    while time < LOOP - 1:
        f = note(int(rng.choice(scale)))
        n = int(3.0 * SR)
        s = int(time * SR)
        tt = np.arange(n) / SR
        b = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 6)) * np.exp(-tt * 1.6)
        b *= np.clip(tt / 0.005, 0, 1)
        bells[s : s + n] += b[: len(bells) - s] * 0.22
        time += rng.uniform(2.5, 5.5)
    mix = out / np.max(np.abs(out)) * 0.8 + bells
    return loopify(reverb(mix, 3.5, 0.45, 2500), LOOP, 3.0)


def wind():
    total = 40 + 3
    t = t_axis(total)
    x = fft_filter(rng.standard_normal(len(t)), low=120, high=900, tilt=-0.8)
    swell = 0.55 + 0.3 * np.sin(2 * np.pi * t / 11 + 1) + 0.15 * np.sin(2 * np.pi * t / 4.3)
    return loopify(x * swell, 40, 3.0)


def chirp(f0, f1, dur, wobble=0.0):
    tt = np.arange(int(dur * SR)) / SR
    f = np.linspace(f0, f1, len(tt)) * (1 + wobble * np.sin(2 * np.pi * 35 * tt))
    ph = 2 * np.cumsum(f) * np.pi / SR
    env = np.sin(np.pi * tt / dur) ** 2
    return np.sin(ph) * env


def birds():
    total = 48 + 3
    out = np.zeros(int(total * SR))
    time = 1.0
    while time < 46:
        # Bir "cümle": 2-6 cıvıltı
        base = rng.uniform(2600, 4200)
        k = time
        for _ in range(rng.integers(2, 7)):
            dur = rng.uniform(0.05, 0.14)
            c = chirp(base * rng.uniform(0.9, 1.1), base * rng.uniform(1.15, 1.5), dur, wobble=rng.uniform(0, 0.03))
            s = int(k * SR)
            out[s : s + len(c)] += c * rng.uniform(0.4, 1.0)
            k += dur + rng.uniform(0.03, 0.12)
        time = k + rng.uniform(3.0, 7.0)
    return loopify(reverb(out, 1.8, 0.3, 6000), 48, 3.0)


def water():
    total = 30 + 3
    t = t_axis(total)
    base = fft_filter(rng.standard_normal(len(t)), low=300, high=3500, tilt=-0.4)
    base *= 0.7 + 0.3 * np.abs(fft_filter(rng.standard_normal(len(t)), high=6))
    bub = np.zeros_like(t)
    for _ in range(int(total * 14)):
        f0 = rng.uniform(500, 1600)
        dur = rng.uniform(0.02, 0.06)
        c = chirp(f0, f0 * rng.uniform(1.3, 2.0), dur)
        s = rng.integers(0, len(t) - len(c))
        bub[s : s + len(c)] += c * rng.uniform(0.05, 0.25)
    return loopify(reverb(base * 0.6 + bub, 1.2, 0.25, 5000), 30, 3.0)


def crickets():
    total = 24 + 3
    t = t_axis(total)
    out = np.zeros_like(t)
    for voice in range(3):
        f = rng.uniform(4300, 5200)
        rate = rng.uniform(14, 20)
        carrier = np.sin(2 * np.pi * f * t)
        pulses = (np.sin(2 * np.pi * rate * t) > 0.3).astype(float)
        bursts = (np.sin(2 * np.pi * t / rng.uniform(1.2, 2.2) + voice) > -0.2).astype(float)
        env = fft_filter(pulses * bursts, high=200)
        out += carrier * env * rng.uniform(0.4, 1.0)
    return loopify(reverb(out, 1.5, 0.35, 7000), 24, 3.0)


# ---------------------------------------------------------------------------
# Efektler
# ---------------------------------------------------------------------------


def magic():
    """Sihirli belirme: yükselen parıltılı arpej + hafif nefes."""
    total = 2.4
    t = t_axis(total)
    out = np.zeros_like(t)
    for i, m in enumerate([78, 81, 85, 88, 90, 93]):
        s = int(i * 0.055 * SR)
        n = len(t) - s
        tt = np.arange(n) / SR
        f = note(m)
        tone = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * f * 3.01 * tt) * np.exp(-tt * 8)) * np.exp(-tt * 3.2)
        out[s:] += tone * np.clip(tt / 0.004, 0, 1) * (0.5 + 0.1 * i)
    shimmer = fft_filter(rng.standard_normal(len(t)), low=5000, high=12000) * np.exp(-t * 4) * np.clip(t / 0.05, 0, 1)
    out += shimmer * 0.35
    return reverb(out, 1.6, 0.4, 8000)


def vanish():
    """Puf: kısa, yumuşak, alçalan hava + küçük çan."""
    total = 0.7
    t = t_axis(total)
    air = fft_filter(rng.standard_normal(len(t)), low=600, high=4000) * np.exp(-t * 9) * np.clip(t / 0.01, 0, 1)
    tone = np.sin(2 * np.pi * np.cumsum(np.linspace(1400, 700, len(t))) / SR) * np.exp(-t * 10) * 0.4
    return reverb(air + tone, 0.8, 0.3, 6000)


def tap():
    """Dokunma: tahta-çan arası yumuşak tıkırtı."""
    total = 0.5
    t = t_axis(total)
    f = note(84)
    out = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.4 * t) * np.exp(-t * 30)) * np.exp(-t * 14)
    return reverb(out * np.clip(t / 0.002, 0, 1), 0.6, 0.2, 7000)


if __name__ == "__main__":
    write("pad", pad(), 0.8)
    write("wind", wind(), 0.7)
    write("birds", birds(), 0.7)
    write("water", water(), 0.7)
    write("crickets", crickets(), 0.6)
    write("magic", magic(), 0.85, fade_edges=True)
    write("vanish", vanish(), 0.7, fade_edges=True)
    write("tap", tap(), 0.7, fade_edges=True)
