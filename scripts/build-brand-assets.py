"""
Marka görsellerini tek kaynak amblemden üretir (ikon, iOS koyu/tinted ikon,
splash, Android adaptive ikon, favicon).

Kaynak: assets/brand/source-emblem.png — düz koyu yeşil zemin üzerinde altın
amblem. Zemine renk uzaklığından maske çıkarılır; maske 8x büyütülüp
yumuşatılarak eşiklenir → her boyutta keskin, pürüzsüz kenar.

Kullanım: npm run brand:assets   (Pillow + numpy gerekir)
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
SOURCE = ASSETS / "brand" / "source-emblem.png"

BRAND_BG = np.array((0x1A, 0x2F, 0x25), dtype=np.float32)
GOLD_TOP = (232, 198, 112)
GOLD_BOTTOM = (196, 148, 47)
SIZE = 1024
SUPERSAMPLE = 8


def emblem_mask() -> Image.Image:
    src = np.asarray(Image.open(SOURCE).convert("RGB")).astype(np.float32)
    dist = np.linalg.norm(src - BRAND_BG, axis=2)
    alpha = np.clip((dist - 26) / (78 - 26), 0, 1)
    mask = Image.fromarray((alpha * 255).astype(np.uint8))
    mask = mask.crop(mask.getbbox())
    big = mask.resize(
        (mask.width * SUPERSAMPLE, mask.height * SUPERSAMPLE), Image.BICUBIC
    ).filter(ImageFilter.GaussianBlur(SUPERSAMPLE * 0.9))
    arr = np.asarray(big).astype(np.float32) / 255
    return Image.fromarray((np.clip((arr - 0.20) * 6 + 0.5, 0, 1) * 255).astype(np.uint8))


MASK = emblem_mask()


def sized_mask(height: int) -> Image.Image:
    width = round(MASK.width * height / MASK.height)
    return MASK.resize((width, height), Image.LANCZOS)


def vertical_gradient(size, top, bottom) -> Image.Image:
    w, h = size
    g = np.linspace(0, 1, h)[:, None, None]
    c = np.array(top) * (1 - g) + np.array(bottom) * g
    return Image.fromarray(np.repeat(c, w, axis=1).astype(np.uint8), "RGB")


def radial_background(inner=(38, 68, 50), outer=(15, 30, 23), cy=0.44) -> Image.Image:
    y, x = np.mgrid[0:SIZE, 0:SIZE] / SIZE
    r = np.clip(np.sqrt((x - 0.5) ** 2 + (y - cy) ** 2) / 0.75, 0, 1) ** 1.3
    c = np.array(inner) * (1 - r)[..., None] + np.array(outer) * r[..., None]
    return Image.fromarray(c.astype(np.uint8), "RGB")


def place(canvas: Image.Image, mask: Image.Image, fill: Image.Image, dy=0):
    x = (SIZE - mask.width) // 2
    y = (SIZE - mask.height) // 2 + dy
    layer = fill.convert("RGBA")
    layer.putalpha(mask)
    canvas.alpha_composite(layer, (x, y))
    return x, y


def transparent() -> Image.Image:
    return Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))


def main():
    # iOS/genel ikon — RGB, alfa kanalı YOK (App Store şartı)
    m = sized_mask(int(SIZE * 0.64))
    icon = radial_background().convert("RGBA")
    glow = Image.new("L", (SIZE, SIZE), 0)
    glow.paste(m, ((SIZE - m.width) // 2, (SIZE - m.height) // 2 + 10))
    glow = glow.filter(ImageFilter.GaussianBlur(38)).point(lambda v: int(v * 0.30))
    icon = Image.composite(Image.new("RGBA", (SIZE, SIZE), (212, 168, 75, 255)), icon, glow)
    place(icon, m, vertical_gradient(m.size, GOLD_TOP, GOLD_BOTTOM), dy=10)
    icon = icon.convert("RGB")
    icon.save(ASSETS / "icon.png")
    icon.resize((196, 196), Image.LANCZOS).save(ASSETS / "favicon.png")

    # iOS 18 koyu ikon (şeffaf zemin, sistem koyu zemin koyar) ve tinted (gri ton)
    dark = transparent()
    place(dark, m, vertical_gradient(m.size, (236, 204, 120), (206, 160, 62)), dy=10)
    dark.save(ASSETS / "icon-ios-dark.png")
    tinted = transparent()
    place(tinted, m, Image.new("RGB", m.size, (255, 255, 255)), dy=10)
    tinted.save(ASSETS / "icon-ios-tinted.png")

    # Splash — app.json'da imageWidth ile ölçeklenir
    m = sized_mask(int(SIZE * 0.80))
    splash = transparent()
    place(splash, m, vertical_gradient(m.size, GOLD_TOP, GOLD_BOTTOM))
    splash.save(ASSETS / "splash-icon.png")

    # Android adaptive: amblem güvenli alanda (çapı %66)
    m = sized_mask(int(SIZE * 0.46))
    fg = transparent()
    place(fg, m, vertical_gradient(m.size, GOLD_TOP, GOLD_BOTTOM))
    fg.save(ASSETS / "android-icon-foreground.png")
    mono = transparent()
    place(mono, m, Image.new("RGB", m.size, (255, 255, 255)))
    mono.save(ASSETS / "android-icon-monochrome.png")
    radial_background().save(ASSETS / "android-icon-background.png")

    print("brand assets →", ASSETS)


if __name__ == "__main__":
    main()
