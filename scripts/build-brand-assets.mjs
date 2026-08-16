/**
 * Marka görsellerini tek bir kaynak amblemden türetir.
 *
 * Kaynak, düz zemin üzerine çizilmiş altın amblemdir; zemin rengi şeffaflaştırılıp
 * amblem kırpılır ve ikon / splash / adaptive icon kadrajlarına yeniden yerleştirilir.
 * Böylece her platformda birebir aynı amblem görünür.
 *
 * Kullanım: node scripts/build-brand-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const ASSETS = path.join(ROOT, "assets");
const SOURCE = path.join(ASSETS, "brand", "source-emblem.png");

const BRAND_BG = [0x1a, 0x2f, 0x25];
const BRAND_GOLD = [0xd4, 0xa8, 0x4b];

/** Zemine olan renk uzaklığına göre yumuşak alpha — kenar yumuşatması korunur */
const ALPHA_LOW = 26;
const ALPHA_HIGH = 78;

function readPng(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

function writePng(file, png) {
  fs.writeFileSync(file, PNG.sync.write(png));
  return file;
}

function createPng(width, height, fill = [0, 0, 0, 0]) {
  const png = new PNG({ width, height });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = fill[0];
    png.data[i + 1] = fill[1];
    png.data[i + 2] = fill[2];
    png.data[i + 3] = fill[3];
  }
  return png;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Düz zemini şeffaflaştırır; kenarlardaki zemin katkısı renkten arındırılır */
function keyOutBackground(src, bg) {
  const out = new PNG({ width: src.width, height: src.height });
  for (let i = 0; i < src.data.length; i += 4) {
    const r = src.data[i];
    const g = src.data[i + 1];
    const b = src.data[i + 2];
    const distance = Math.hypot(r - bg[0], g - bg[1], b - bg[2]);
    const alpha = clamp(
      (distance - ALPHA_LOW) / (ALPHA_HIGH - ALPHA_LOW),
      0,
      1,
    );

    if (alpha <= 0.02) {
      out.data[i] = 0;
      out.data[i + 1] = 0;
      out.data[i + 2] = 0;
      out.data[i + 3] = 0;
      continue;
    }

    // c_obs = a * c_fg + (1 - a) * bg  ->  c_fg
    out.data[i] = clamp(Math.round((r - (1 - alpha) * bg[0]) / alpha), 0, 255);
    out.data[i + 1] = clamp(
      Math.round((g - (1 - alpha) * bg[1]) / alpha),
      0,
      255,
    );
    out.data[i + 2] = clamp(
      Math.round((b - (1 - alpha) * bg[2]) / alpha),
      0,
      255,
    );
    out.data[i + 3] = Math.round(alpha * 255);
  }
  return out;
}

/** Görünür pikselleri saran kare kadraja kırpar */
function cropToSquare(src, padding = 0) {
  let minX = src.width;
  let minY = src.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < src.height; y += 1) {
    for (let x = 0; x < src.width; x += 1) {
      if (src.data[(y * src.width + x) * 4 + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) throw new Error("Kaynak amblemde görünür piksel bulunamadı");

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const size = Math.max(maxX - minX, maxY - minY) + padding * 2;
  const half = size / 2;
  const startX = Math.round(centerX - half);
  const startY = Math.round(centerY - half);
  const side = Math.round(size);

  const out = createPng(side, side);
  for (let y = 0; y < side; y += 1) {
    for (let x = 0; x < side; x += 1) {
      const sx = startX + x;
      const sy = startY + y;
      if (sx < 0 || sy < 0 || sx >= src.width || sy >= src.height) continue;
      const from = (sy * src.width + sx) * 4;
      const to = (y * side + x) * 4;
      out.data[to] = src.data[from];
      out.data[to + 1] = src.data[from + 1];
      out.data[to + 2] = src.data[from + 2];
      out.data[to + 3] = src.data[from + 3];
    }
  }
  return out;
}

/** Alan ortalamasıyla küçültme — alpha ile çarpılmış toplamlar renk taşmasını önler */
function resize(src, size) {
  const out = createPng(size, size);
  const ratio = src.width / size;

  for (let y = 0; y < size; y += 1) {
    const y0 = Math.floor(y * ratio);
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * ratio));
    for (let x = 0; x < size; x += 1) {
      const x0 = Math.floor(x * ratio);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * ratio));

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let sumA = 0;
      let count = 0;

      for (let sy = y0; sy < y1 && sy < src.height; sy += 1) {
        for (let sx = x0; sx < x1 && sx < src.width; sx += 1) {
          const index = (sy * src.width + sx) * 4;
          const alpha = src.data[index + 3] / 255;
          sumR += src.data[index] * alpha;
          sumG += src.data[index + 1] * alpha;
          sumB += src.data[index + 2] * alpha;
          sumA += alpha;
          count += 1;
        }
      }

      const target = (y * size + x) * 4;
      if (count === 0 || sumA === 0) continue;
      out.data[target] = clamp(Math.round(sumR / sumA), 0, 255);
      out.data[target + 1] = clamp(Math.round(sumG / sumA), 0, 255);
      out.data[target + 2] = clamp(Math.round(sumB / sumA), 0, 255);
      out.data[target + 3] = clamp(Math.round((sumA / count) * 255), 0, 255);
    }
  }
  return out;
}

/**
 * Alpha'ya ayrılabilir max filtresi uygular; ince çizgiler küçük ikon
 * boyutlarında kaybolmasın diye amblemi bir miktar kalınlaştırır.
 */
function thicken(src, radius) {
  const { width, height } = src;
  const horizontal = new Uint8Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let best = 0;
      for (let dx = -radius; dx <= radius; dx += 1) {
        const sx = x + dx;
        if (sx < 0 || sx >= width) continue;
        const alpha = src.data[(y * width + sx) * 4 + 3];
        if (alpha > best) best = alpha;
      }
      horizontal[y * width + x] = best;
    }
  }

  const out = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let best = 0;
      for (let dy = -radius; dy <= radius; dy += 1) {
        const sy = y + dy;
        if (sy < 0 || sy >= height) continue;
        const alpha = horizontal[sy * width + x];
        if (alpha > best) best = alpha;
      }
      const index = (y * width + x) * 4;
      out.data[index] = src.data[index];
      out.data[index + 1] = src.data[index + 1];
      out.data[index + 2] = src.data[index + 2];
      out.data[index + 3] = best;
    }
  }
  return out;
}

/** Kaynak alpha'sını koruyarak tek renge boyar */
function tint(src, color) {
  const out = new PNG({ width: src.width, height: src.height });
  for (let i = 0; i < src.data.length; i += 4) {
    out.data[i] = color[0];
    out.data[i + 1] = color[1];
    out.data[i + 2] = color[2];
    out.data[i + 3] = src.data[i + 3];
  }
  return out;
}

function compositeCenter(base, overlay) {
  const offsetX = Math.round((base.width - overlay.width) / 2);
  const offsetY = Math.round((base.height - overlay.height) / 2);

  for (let y = 0; y < overlay.height; y += 1) {
    for (let x = 0; x < overlay.width; x += 1) {
      const bx = offsetX + x;
      const by = offsetY + y;
      if (bx < 0 || by < 0 || bx >= base.width || by >= base.height) continue;

      const from = (y * overlay.width + x) * 4;
      const to = (by * base.width + bx) * 4;
      const alpha = overlay.data[from + 3] / 255;
      if (alpha === 0) continue;

      const baseAlpha = base.data[to + 3] / 255;
      const outAlpha = alpha + baseAlpha * (1 - alpha);
      for (let channel = 0; channel < 3; channel += 1) {
        const top = overlay.data[from + channel];
        const bottom = base.data[to + channel];
        base.data[to + channel] = Math.round(
          (top * alpha + bottom * baseAlpha * (1 - alpha)) / outAlpha,
        );
      }
      base.data[to + 3] = Math.round(outAlpha * 255);
    }
  }
  return base;
}

/** Amblemi verilen tuvale, istenen doluluk oranıyla yerleştirir */
function place(emblem, canvasSize, ratio, background) {
  const canvas = createPng(
    canvasSize,
    canvasSize,
    background ? [...background, 255] : [0, 0, 0, 0],
  );
  const scaled = resize(emblem, Math.round(canvasSize * ratio));
  return compositeCenter(canvas, scaled);
}

const source = readPng(SOURCE);
const emblem = tint(
  thicken(cropToSquare(keyOutBackground(source, BRAND_BG), 16), 3),
  BRAND_GOLD,
);
writePng(path.join(ASSETS, "brand", "emblem.png"), emblem);

const outputs = [
  // iOS/genel ikon — köşe yuvarlama sistem tarafından uygulanır
  ["icon.png", place(emblem, 1024, 0.68, BRAND_BG)],
  // Splash: zemin app.json'daki backgroundColor'dan gelir
  ["splash-icon.png", place(emblem, 1024, 0.92, null)],
  // Adaptive icon güvenli alanı merkezdeki ~%66'dır
  ["android-icon-foreground.png", place(emblem, 1024, 0.52, null)],
  [
    "android-icon-monochrome.png",
    tint(place(emblem, 1024, 0.52, null), [0xff, 0xff, 0xff]),
  ],
  ["favicon.png", place(emblem, 48, 0.62, BRAND_BG)],
];

for (const [name, png] of outputs) {
  const file = writePng(path.join(ASSETS, name), png);
  console.log(`${path.relative(ROOT, file)}  ${png.width}x${png.height}`);
}
