/**
 * Publishes the brand assets from the committed outline SVGs in scripts/brand/:
 * favicon.svg is copied as is; the apple-touch icon and OG card are rasterised with sharp.
 *
 * To change the lettering, edit and rerun scripts/brand/build_glyphs.py (see its docstring).
 */
import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const brand = (name: string) => fileURLToPath(new URL(`./brand/${name}`, import.meta.url));
const pub = (name: string) => fileURLToPath(new URL(`../public/${name}`, import.meta.url));

copyFileSync(brand("favicon.svg"), pub("favicon.svg"));

const raster = [
  { from: "apple-touch-icon.svg", to: "apple-touch-icon.png", width: 180, height: 180 },
  { from: "og.svg", to: "og.png", width: 1200, height: 630 },
];

for (const { from, to, width, height } of raster) {
  await sharp(brand(from), { density: 144 })
    .resize(width, height)
    .png({ compressionLevel: 9, palette: false })
    .toFile(pub(to));
}

console.log("Wrote public/favicon.svg, public/apple-touch-icon.png, public/og.png");
