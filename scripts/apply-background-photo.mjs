#!/usr/bin/env node
/**
 * Turns any photo into Versaly Core's background, graded to the app's navy
 * palette and dimmed/softened so text on the glass cards stays readable.
 *
 *   npm run brand:photo -- path/to/photo.jpg
 *
 * Writes public/backgrounds/aurora-dark.jpg.
 * Options:
 *   --dim 0.5       minimum navy darkening (more is applied automatically for bright photos)
 *   --target 30     average brightness to aim for, 0-255 (lower = darker; 30 suits white text)
 *   --blur 3        softening in pixels (0 = sharp)
 *   --out <dir>     write somewhere else (for previews)
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const input = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
if (!input) {
  console.error("Usage: npm run brand:photo -- path/to/photo.jpg [--dim 0.55] [--blur 3]");
  process.exit(1);
}

const dim = Math.min(0.9, Math.max(0.2, Number(opt("dim", 0.5))));
const target = Math.min(90, Math.max(12, Number(opt("target", 30))));
const blur = Math.max(0, Number(opt("blur", 3)));
const outDir = opt("out") ? resolve(opt("out")) : fileURLToPath(new URL("../public/backgrounds/", import.meta.url));
mkdirSync(outDir, { recursive: true });

const W = 2400;
const H = 1500;

const base = () =>
  sharp(resolve(input))
    .rotate() // respect camera orientation
    .resize(W, H, { fit: "cover", position: "attention" });

const overlay = (svg) => ({ input: Buffer.from(svg), top: 0, left: 0 });
const solid = (rgba, blend = "over") => ({
  input: { create: { width: W, height: H, channels: 4, background: rgba } },
  blend,
});

// --- Dark: desaturate, tint navy, dim, soften, vignette ---------------------
let dark = base().modulate({ saturation: 0.3, brightness: 0.85 });
if (blur) dark = dark.blur(blur);
const graded = await dark.toBuffer();

// Measure how bright the photo is, then dim it just enough to hit the target
// (navy is ~24/255 bright), so bright offices and dark skylines end up equally
// readable under white text.
const { channels } = await sharp(graded).stats();
const mean = (channels[0].mean + channels[1].mean + channels[2].mean) / 3;
const NAVY_LUM = 24;
const needed = mean > target ? (mean - target) / (mean - NAVY_LUM) : 0;
const wash = Math.min(0.92, Math.max(dim, needed));

const darkBuf = await sharp(graded)
  .composite([
    solid({ r: 14, g: 24, b: 64, alpha: wash }), // navy wash (tint + darken)
    solid({ r: 79, g: 91, b: 213, alpha: 0.12 }, "soft-light"), // indigo accent
    overlay(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs><radialGradient id="v" cx="50%" cy="42%" r="80%">
        <stop offset="45%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.6"/>
      </radialGradient></defs>
      <rect width="100%" height="100%" fill="url(#v)"/></svg>`),
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toBuffer();
await sharp(darkBuf).toFile(join(outDir, "aurora-dark.jpg"));

console.log(`Background written to ${outDir} (photo brightness ${Math.round(mean)}, navy wash ${wash.toFixed(2)}, blur ${blur}).`);
