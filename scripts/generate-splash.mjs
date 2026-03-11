import { mkdir } from "fs/promises";
import sharp from "sharp";

const BG_COLOR = { r: 239, g: 240, b: 250, alpha: 1 }; // #EFF0FA
const SOURCE = "./public/favicon-512x512.png";
const OUTPUT_DIR = "./public/splash";

const SIZES = [
  { name: "apple-splash-2048-2732", w: 2048, h: 2732 },
  { name: "apple-splash-1668-2388", w: 1668, h: 2388 },
  { name: "apple-splash-1640-2360", w: 1640, h: 2360 },
  { name: "apple-splash-1536-2048", w: 1536, h: 2048 },
  { name: "apple-splash-1320-2868", w: 1320, h: 2868 },
  { name: "apple-splash-1290-2796", w: 1290, h: 2796 },
  { name: "apple-splash-1206-2622", w: 1206, h: 2622 },
  { name: "apple-splash-1179-2556", w: 1179, h: 2556 },
  { name: "apple-splash-1170-2532", w: 1170, h: 2532 },
  { name: "apple-splash-1125-2436", w: 1125, h: 2436 },
  { name: "apple-splash-1080-1920", w: 1080, h: 1920 },
  { name: "apple-splash-828-1792", w: 828, h: 1792 },
  { name: "apple-splash-750-1334", w: 750, h: 1334 },
];

await mkdir(OUTPUT_DIR, { recursive: true });

for (const { name, w, h } of SIZES) {
  const logoSize = Math.floor(Math.min(w, h) * 0.25); // 30% padding 느낌

  const logo = await sharp(SOURCE)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: { width: w, height: h, channels: 4, background: BG_COLOR },
  })
    .composite([
      {
        input: logo,
        gravity: "centre",
      },
    ])
    .jpeg({ quality: 90 })
    .toFile(`${OUTPUT_DIR}/${name}.jpg`);

  console.log(`✅ ${name}`);
}

console.log("🎉 완료!");
