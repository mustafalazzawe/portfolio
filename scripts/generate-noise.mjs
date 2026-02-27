/**
 * Generates a 200x200 noise PNG tile with ~10% max alpha.
 * Zero external dependencies — uses only built-in node:zlib.
 *
 * Run: bun run scripts/generate-noise.mjs
 * Output: public/images/noise-200x200.png
 */

import { deflateSync } from "node:zlib";

const WIDTH = 200;
const HEIGHT = 200;

// ── Build raw pixel data (RGBA) with PNG row filters ──────────
// Each row: 1 filter byte (0 = None) + WIDTH * 4 bytes (RGBA)
const rowSize = 1 + WIDTH * 4;
const rawData = new Uint8Array(rowSize * HEIGHT);

for (let y = 0; y < HEIGHT; y++) {
  const rowOffset = y * rowSize;
  rawData[rowOffset] = 0; // filter byte: None

  for (let x = 0; x < WIDTH; x++) {
    const px = rowOffset + 1 + x * 4;
    rawData[px] = 255; // R — white
    rawData[px + 1] = 255; // G — white
    rawData[px + 2] = 255; // B — white
    rawData[px + 3] = Math.floor(Math.random() * 26); // A — 0-25 (~0-10% of 255)
  }
}

// ── PNG helpers ───────────────────────────────────────────────
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBytes = new TextEncoder().encode(type);
  const len = new Uint8Array(4);
  new DataView(len.buffer).setUint32(0, data.length);

  const crcInput = new Uint8Array(typeBytes.length + data.length);
  crcInput.set(typeBytes);
  crcInput.set(data, typeBytes.length);

  const crc = new Uint8Array(4);
  new DataView(crc.buffer).setUint32(0, crc32(crcInput));

  return Buffer.concat([len, typeBytes, data, crc]);
}

// ── Construct PNG ─────────────────────────────────────────────
const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

// IHDR: width, height, bit depth 8, color type 6 (RGBA), compression 0, filter 0, interlace 0
const ihdrData = new Uint8Array(13);
const ihdrView = new DataView(ihdrData.buffer);
ihdrView.setUint32(0, WIDTH);
ihdrView.setUint32(4, HEIGHT);
ihdrData[8] = 8; // bit depth
ihdrData[9] = 6; // color type: RGBA
ihdrData[10] = 0; // compression
ihdrData[11] = 0; // filter
ihdrData[12] = 0; // interlace

const idatData = deflateSync(Buffer.from(rawData));
const iendData = new Uint8Array(0);

const png = Buffer.concat([
  signature,
  makeChunk("IHDR", ihdrData),
  makeChunk("IDAT", idatData),
  makeChunk("IEND", iendData),
]);

await Bun.write("public/images/noise-200x200.png", png);
console.log(`Noise tile generated: public/images/noise-200x200.png (${png.length} bytes)`);
