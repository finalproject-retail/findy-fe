import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const imagesDir = path.join(root, "assets", "images");
const logoPng = path.join(imagesDir, "app-icon-logo.png");

const SIZE = 1024;
const SAFE = Math.round(SIZE * 0.72);
const PAD = Math.floor((SIZE - SAFE) / 2);

async function generateAppIcon() {
  await sharp(logoPng)
    .resize(SAFE, SAFE, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .extend({
      top: PAD,
      bottom: PAD,
      left: PAD,
      right: PAD,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(path.join(imagesDir, "app-icon.png"));
}

async function generateAdaptiveIcon() {
  const trimmed = await sharp(logoPng).trim().png().toBuffer();
  const meta = await sharp(trimmed).metadata();
  const scale = Math.min(
    SAFE / (meta.width ?? SAFE),
    SAFE / (meta.height ?? SAFE),
  );
  const width = Math.round((meta.width ?? SAFE) * scale);
  const height = Math.round((meta.height ?? SAFE) * scale);

  const foreground = await sharp(trimmed)
    .resize(width, height, { fit: "inside" })
    .png()
    .toBuffer();

  const left = Math.floor((SIZE - width) / 2);
  const top = Math.floor((SIZE - height) / 2);

  await sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: foreground, left, top }])
    .png()
    .toFile(path.join(imagesDir, "adaptive-icon.png"));
}

await mkdir(imagesDir, { recursive: true });
await generateAppIcon();
await generateAdaptiveIcon();

console.log("Generated assets/images/app-icon.png");
console.log("Generated assets/images/adaptive-icon.png");
