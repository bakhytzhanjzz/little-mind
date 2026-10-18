// Renders the app icons from the same blob geometry the app uses.
// Run: npm run icons
import sharp from "sharp";
import { FACES, blobPath } from "../src/lib/blob";

const BG = "#f2f3f7";
const FILL = "#c98712"; // --mood-great
const INK = "#1b1e33";

function svg(size: number, scale: number) {
  const f = FACES.great;
  const s = (size / 200) * scale;
  const offset = (size - 200 * s) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <g transform="translate(${offset} ${offset}) scale(${s})">
    <path d="${blobPath("great")}" fill="${FILL}"/>
    <g fill="${INK}" stroke="${INK}">
      <circle cx="80" cy="${f.eyeY}" r="6.5"/><circle cx="120" cy="${f.eyeY}" r="6.5"/>
      <path d="${f.mouth}" fill="none" stroke-width="7" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;
}

const out = [
  ["public/icon-192.png", 192, 0.92],
  ["public/icon-512.png", 512, 0.92],
  ["public/apple-touch-icon.png", 180, 0.86],
  // Maskable icons get cropped to a circle-ish safe zone, so keep the face small.
  ["public/icon-maskable.png", 512, 0.66],
] as const;

for (const [file, size, scale] of out) {
  await sharp(Buffer.from(svg(size, scale))).png().toFile(file);
  console.log("wrote", file);
}
await sharp(Buffer.from(svg(48, 0.95))).resize(32, 32).png().toFile("src/app/icon.png");
console.log("wrote src/app/icon.png");
