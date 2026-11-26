// Render denim textures, wash swatches and the social-share image.
// Run from jeans-export/:  node tools/render.js   (needs Playwright + Chromium, and python3 with Pillow)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const IMG = path.join(ROOT, 'website', 'assets', 'img');
fs.mkdirSync(IMG, { recursive: true });

function denimSVG(o) {
  const { w, h, base, seed = 1, streak = 0.2, cloud = 0.1, grain = 0.18, twLight = 0.07, twDark = 0.22,
    streakColor = 1, streakFreq = '0.42 0.006', tile = true } = o;
  const st = tile ? 'stitchTiles="stitch"' : '';
  const sc = streakColor;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <pattern id="tw" width="4" height="8" patternUnits="userSpaceOnUse">
      <path d="M-4,8 L0,0 M0,8 L4,0 M4,8 L8,0" stroke="rgba(255,255,255,${twLight})" stroke-width="1.2"/>
      <path d="M-2,8 L2,0 M2,8 L6,0 M-6,8 L-2,0" stroke="rgba(0,0,0,${twDark})" stroke-width="0.9"/>
    </pattern>
    <filter id="cloud" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.0045" numOctaves="3" seed="${seed + 7}" ${st}/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${(cloud * 3.2).toFixed(3)} 0 0 0 ${(-cloud * 1.25).toFixed(3)}"/>
    </filter>
    <filter id="streak" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="${streakFreq}" numOctaves="2" seed="${seed}" ${st}/>
      <feColorMatrix type="matrix" values="0 0 0 0 ${sc}  0 0 0 0 ${sc}  0 0 0 0 ${sc}  ${(streak * 3.4).toFixed(3)} 0 0 0 ${(-streak * 1.35).toFixed(3)}"/>
    </filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="${seed + 3}" ${st}/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${(grain * 2.6).toFixed(3)} 0 0 0 ${(-grain * 1.05).toFixed(3)}"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="${base}"/>
  <rect width="${w}" height="${h}" filter="url(#cloud)"/>
  <rect width="${w}" height="${h}" filter="url(#streak)"/>
  <rect width="${w}" height="${h}" fill="url(#tw)"/>
  <rect width="${w}" height="${h}" filter="url(#grain)"/>
</svg>`;
}

const WASHES = [
  { id: 'rinse', base: '#1a2744', seed: 3, streak: 0.06, cloud: 0.03 },
  { id: 'dark-stone', base: '#253a63', seed: 5, streak: 0.13, cloud: 0.08 },
  { id: 'mid-vintage', base: '#41608f', seed: 9, streak: 0.2, cloud: 0.17 },
  { id: 'light-bleach', base: '#8ba3c6', seed: 12, streak: 0.22, cloud: 0.2, twDark: 0.16 },
  { id: 'washed-black', base: '#2b2c31', seed: 15, streak: 0.13, cloud: 0.1 },
  { id: 'ecru', base: '#e6dcc8', seed: 18, streak: 0.12, cloud: 0.0, streakColor: 0, twLight: 0.25, twDark: 0.1, grain: 0.1 },
];

async function shot(page, svg, w, h, out) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  const png = out.replace(/\.(webp|png)$/, '.tmp.png');
  await page.screenshot({ path: png, clip: { x: 0, y: 0, width: w, height: h } });
  if (out.endsWith('.webp')) {
    execFileSync('python3', ['-I', '-c',
      'import sys;from PIL import Image;Image.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"WEBP",quality=int(sys.argv[3]),method=6)',
      png, out, String(out.includes('wash-') ? 84 : 80)]);
    fs.unlinkSync(png);
  } else fs.renameSync(png, out);
  console.log('wrote', path.relative(ROOT, out), fs.statSync(out).size, 'bytes');
}

(async () => {
  const only = process.argv[2];
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  if (!only || only === 'textures') {
    await shot(page, denimSVG({ w: 800, h: 800, base: '#16223d', seed: 21, streak: 0.09, cloud: 0.05, grain: 0.2 }), 800, 800, path.join(IMG, 'denim-indigo.webp'));
    for (const wsh of WASHES) {
      await shot(page, denimSVG({ w: 600, h: 750, tile: false, ...wsh }), 600, 750, path.join(IMG, `wash-${wsh.id}.webp`));
    }
  }
  if (!only || only === 'og') {
    const og = path.join(__dirname, 'og.html');
    if (fs.existsSync(og)) {
      await page.setViewportSize({ width: 1200, height: 630 });
      await page.goto('file://' + og, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(IMG, 'og-image.png') });
      console.log('wrote og-image.png');
    }
  }
  await browser.close();
})();
