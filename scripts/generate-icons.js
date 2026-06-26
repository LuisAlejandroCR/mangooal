// One-time PWA icon generator — converts public/icon.svg → icon-192.png + icon-512.png
// Run once before deploying: npm run icons
// Requires: npm install --save-dev @resvg/resvg-js
import { readFileSync, writeFileSync } from "fs";
import { Resvg } from "@resvg/resvg-js";

const svg = readFileSync(new URL("../public/icon.svg", import.meta.url));

for (const size of [192, 512]) {
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
  const png = resvg.render().asPng();
  writeFileSync(new URL(`../public/icon-${size}.png`, import.meta.url), png);
  console.log(`✓ public/icon-${size}.png  (${(png.byteLength / 1024).toFixed(1)} KB)`);
}
