#!/usr/bin/env node
/**
 * Generates Versaly Core's visual assets from code:
 *   - liquid-glass background art (dark + light)  → public/backgrounds/
 *   - app icon, favicons, PWA + Apple icons       → public/ and src/app/
 *
 *   npm run brand:assets
 *
 * Edit the palette or shapes below and re-run to restyle everything at once.
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const file = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));

for (const dir of ["public/backgrounds", "public/icons"]) mkdirSync(file(dir), { recursive: true });

// ---------------------------------------------------------------------------
// Palette: restrained midnight navy with a single indigo accent
// ---------------------------------------------------------------------------
const C = {
  ink: "#05060b",
  navy: "#0b1020",
  slate: "#1a2547",
  indigo: "#4f5bd5",
  accent: "#7c86ff",
};

// ---------------------------------------------------------------------------
// Background art: dark topographic contours with one soft spotlight
// ---------------------------------------------------------------------------
function contourPaths(W, H, count, phase, color, opacity, width) {
  const paths = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const baseY = H * (0.05 + t * 1.0);
    const amp = 90 + 150 * Math.sin(t * Math.PI);
    let d = "";
    const steps = 48;
    for (let j = 0; j <= steps; j++) {
      const x = (j / steps) * (W + 400) - 200;
      const y =
        baseY +
        Math.sin(x / 380 + phase + t * 3.1) * amp * 0.55 +
        Math.sin(x / 190 + phase * 1.7 + t * 5.2) * amp * 0.22 -
        t * 120;
      d += (j === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " ";
    }
    const fade = 0.35 + 0.65 * Math.sin(t * Math.PI);
    paths.push(`<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${(opacity * fade).toFixed(3)}" stroke-width="${width}"/>`);
  }
  return paths.join("\n    ");
}

function backgroundSvg(mode) {
  const dark = mode === "dark";
  const W = 2400;
  const H = 1500;
  const line = dark ? "#aab4ff" : "#4b57c9";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="soft" filterUnits="userSpaceOnUse" x="-800" y="-800" width="${W + 1600}" height="${H + 1600}"><feGaussianBlur stdDeviation="160"/></filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <radialGradient id="vignette" cx="50%" cy="40%" r="80%">
      <stop offset="45%" stop-color="${dark ? "#000" : "#fff"}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${dark ? "#000" : "#cfd5ee"}" stop-opacity="${dark ? 0.7 : 0.55}"/>
    </radialGradient>
    <linearGradient id="base" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="${dark ? "#0c1224" : "#f3f5fb"}"/>
      <stop offset="100%" stop-color="${dark ? "#05060b" : "#e4e8f4"}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#base)"/>

  <!-- one soft spotlight, upper right -->
  <g filter="url(#soft)">
    <ellipse cx="1750" cy="260" rx="720" ry="420" fill="${C.indigo}" opacity="${dark ? 0.38 : 0.2}"/>
    <ellipse cx="500" cy="1250" rx="620" ry="320" fill="${C.slate}" opacity="${dark ? 0.55 : 0.15}"/>
  </g>

  <!-- fine contour lines -->
  <g>
    ${contourPaths(W, H, 26, 0.6, line, dark ? 0.1 : 0.12, 1.4)}
  </g>
  <g>
    ${contourPaths(W, H, 9, 2.1, line, dark ? 0.16 : 0.18, 2.2)}
  </g>

  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="${dark ? 0.07 : 0.05}" style="mix-blend-mode:overlay"/>
</svg>`;
}

// Backgrounds are only regenerated on request, so a photo applied with
// `npm run brand:photo` is never overwritten when icons are rebuilt.
for (const mode of process.argv.includes("--backgrounds") ? ["dark"] : []) {
  await sharp(Buffer.from(backgroundSvg(mode)))
    .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(file(`public/backgrounds/aurora-${mode}.jpg`));
}

// ---------------------------------------------------------------------------
// App icon: glass "V" crystal on an aurora tile
// ---------------------------------------------------------------------------
/**
 * @param {{ maskable?: boolean }} opts
 *  maskable: full-bleed square with the mark inside the safe zone (platforms
 *  crop it into their own shape).
 */
function iconSvg({ maskable = false } = {}) {
  const S = 512;
  const radius = maskable ? 0 : 118;
  // Mark is drawn on the original 64-unit grid, then centred and scaled.
  const markScale = maskable ? 5.2 : 6.6;
  const markSize = 64 * markScale;
  const tx = (S - markSize) / 2;
  const ty = (S - markSize) / 2 + (maskable ? 6 : 8);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#242a63"/>
      <stop offset="55%" stop-color="#141a3d"/>
      <stop offset="100%" stop-color="#090c1d"/>
    </linearGradient>
    <radialGradient id="glowCyan" cx="82%" cy="12%" r="60%">
      <stop offset="0%" stop-color="${C.accent}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowMagenta" cx="12%" cy="92%" r="60%">
      <stop offset="0%" stop-color="${C.indigo}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${C.indigo}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.98"/>
      <stop offset="100%" stop-color="#e0e7ff" stop-opacity="0.62"/>
    </linearGradient>
    <linearGradient id="glassDeep" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#a5b4fc" stop-opacity="0.3"/>
    </linearGradient>
    <linearGradient id="jewel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e0e7ff"/>
      <stop offset="100%" stop-color="${C.accent}"/>
    </linearGradient>
    <filter id="drop" filterUnits="userSpaceOnUse" x="-64" y="-64" width="640" height="640">
      <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#14054a" flood-opacity="0.55"/>
    </filter>
    <clipPath id="tileClip"><rect width="${S}" height="${S}" rx="${radius}"/></clipPath>
  </defs>

  <g clip-path="url(#tileClip)">
    <rect width="${S}" height="${S}" fill="url(#tile)"/>
    <rect width="${S}" height="${S}" fill="url(#glowCyan)"/>
    <rect width="${S}" height="${S}" fill="url(#glowMagenta)"/>
    <!-- glass sheen across the top half -->
    <ellipse cx="${S * 0.42}" cy="${-S * 0.12}" rx="${S * 0.78}" ry="${S * 0.5}" fill="url(#sheen)"/>
    ${maskable ? "" : `<rect x="3" y="3" width="${S - 6}" height="${S - 6}" rx="${radius - 3}" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="6"/>`}

    <!-- "V" mark -->
    <g transform="translate(${tx} ${ty}) scale(${markScale})" filter="url(#drop)">
      <path d="M14 18 L24 18 L32 38 L40 18 L50 18 L34 46 L30 46 Z" fill="url(#glassDeep)"/>
      <path d="M14 17 L23 17 L32 39 L25 39 Z" fill="url(#glass)"/>
      <path d="M50 17 L41 17 L32 39 L37 39 Z" fill="url(#glass)"/>
      <polygon points="21,27 28,27 32,35 25,35" fill="#fff" opacity="0.55"/>
      <polygon points="43,27 36,27 32,35 39,35" fill="#fff" opacity="0.4"/>
      <polygon points="32,22 36,29 32,36 28,29" fill="url(#jewel)"/>
      <polygon points="32,22 36,29 32,29" fill="#fff" opacity="0.55"/>
      <polygon points="28,40 36,40 32,47" fill="#fff" opacity="0.85"/>
    </g>
  </g>
</svg>`;
}

const iconPng = (size, opts) => sharp(Buffer.from(iconSvg(opts)), { density: 384 }).resize(size, size).png({ compressionLevel: 9 });

const rounded = iconSvg();
writeFileSync(file("public/icon.svg"), rounded);
writeFileSync(file("src/app/icon.svg"), rounded);

const targets = [
  ["public/icons/icon-192.png", 192, {}],
  ["public/icons/icon-512.png", 512, {}],
  ["public/icons/icon-maskable-192.png", 192, { maskable: true }],
  ["public/icons/icon-maskable-512.png", 512, { maskable: true }],
  ["public/icons/apple-touch-icon.png", 180, { maskable: true }], // iOS rounds the corners itself
  ["public/icons/favicon-32x32.png", 32, {}],
  ["public/icons/favicon-16x16.png", 16, {}],
];
for (const [path, size, opts] of targets) await iconPng(size, opts).toFile(file(path));

// Root-level copies that older links still point at
copyFileSync(file("public/icons/icon-192.png"), file("public/icon-192.png"));
copyFileSync(file("public/icons/icon-512.png"), file("public/icon-512.png"));
copyFileSync(file("public/icons/apple-touch-icon.png"), file("public/apple-touch-icon.png"));

// favicon.ico: PNG images wrapped in an ICO container (16, 32, 48)
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map((s) => iconPng(s).toBuffer()));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = 6 + 16 * pngs.length;
const entries = pngs.map((buf, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(icoSizes[i], 0);
  e.writeUInt8(icoSizes[i], 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(buf.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += buf.length;
  return e;
});
writeFileSync(file("src/app/favicon.ico"), Buffer.concat([header, ...entries, ...pngs]));

console.log("Brand assets generated.");
