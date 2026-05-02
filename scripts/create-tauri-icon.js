const fs = require("node:fs");
const path = require("node:path");

const size = 32;
const pixels = new Uint8Array(size * size * 4);

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const index = (y * size + x) * 4;
  pixels[index] = b;
  pixels[index + 1] = g;
  pixels[index + 2] = r;
  pixels[index + 3] = a;
}

function fillRoundedRect(x, y, width, height, radius, color) {
  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      const dx = px < x + radius ? x + radius - px : px >= x + width - radius ? px - (x + width - radius - 1) : 0;
      const dy = py < y + radius ? y + radius - py : py >= y + height - radius ? py - (y + height - radius - 1) : 0;
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(px, py, ...color);
      }
    }
  }
}

function drawLine(x0, y0, x1, y1, color, thickness = 1) {
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;

  while (true) {
    for (let ty = -Math.floor(thickness / 2); ty <= Math.floor(thickness / 2); ty += 1) {
      for (let tx = -Math.floor(thickness / 2); tx <= Math.floor(thickness / 2); tx += 1) {
        setPixel(x0 + tx, y0 + ty, ...color);
      }
    }
    if (x0 === x1 && y0 === y1) break;
    const doubled = 2 * error;
    if (doubled >= dy) {
      error += dy;
      x0 += sx;
    }
    if (doubled <= dx) {
      error += dx;
      y0 += sy;
    }
  }
}

fillRoundedRect(0, 0, size, size, 7, [17, 133, 127, 255]);

const white = [255, 255, 255, 255];
const pale = [188, 238, 234, 255];
const top = [16, 6];
const rightTop = [25, 11];
const rightBottom = [25, 21];
const bottom = [16, 26];
const leftBottom = [7, 21];
const leftTop = [7, 11];
const center = [16, 16];

[
  [top, rightTop],
  [rightTop, rightBottom],
  [rightBottom, bottom],
  [bottom, leftBottom],
  [leftBottom, leftTop],
  [leftTop, top],
  [leftTop, center],
  [rightTop, center],
  [center, bottom]
].forEach(([start, end], index) => {
  drawLine(start[0], start[1], end[0], end[1], index < 6 ? white : pale, 2);
});

const dibHeaderSize = 40;
const pixelDataSize = size * size * 4;
const maskRowSize = Math.ceil(size / 32) * 4;
const maskSize = maskRowSize * size;
const imageSize = dibHeaderSize + pixelDataSize + maskSize;
const fileSize = 6 + 16 + imageSize;
const buffer = Buffer.alloc(fileSize);

let offset = 0;
buffer.writeUInt16LE(0, offset);
offset += 2;
buffer.writeUInt16LE(1, offset);
offset += 2;
buffer.writeUInt16LE(1, offset);
offset += 2;

buffer.writeUInt8(size, offset);
offset += 1;
buffer.writeUInt8(size, offset);
offset += 1;
buffer.writeUInt8(0, offset);
offset += 1;
buffer.writeUInt8(0, offset);
offset += 1;
buffer.writeUInt16LE(1, offset);
offset += 2;
buffer.writeUInt16LE(32, offset);
offset += 2;
buffer.writeUInt32LE(imageSize, offset);
offset += 4;
buffer.writeUInt32LE(22, offset);
offset += 4;

buffer.writeUInt32LE(dibHeaderSize, offset);
offset += 4;
buffer.writeInt32LE(size, offset);
offset += 4;
buffer.writeInt32LE(size * 2, offset);
offset += 4;
buffer.writeUInt16LE(1, offset);
offset += 2;
buffer.writeUInt16LE(32, offset);
offset += 2;
buffer.writeUInt32LE(0, offset);
offset += 4;
buffer.writeUInt32LE(pixelDataSize, offset);
offset += 4;
buffer.writeInt32LE(0, offset);
offset += 4;
buffer.writeInt32LE(0, offset);
offset += 4;
buffer.writeUInt32LE(0, offset);
offset += 4;
buffer.writeUInt32LE(0, offset);
offset += 4;

for (let y = size - 1; y >= 0; y -= 1) {
  const row = pixels.subarray(y * size * 4, (y + 1) * size * 4);
  row.copy ? row.copy(buffer, offset) : Buffer.from(row).copy(buffer, offset);
  offset += size * 4;
}

const iconPath = path.resolve(__dirname, "..", "src-tauri", "icons", "icon.ico");
fs.mkdirSync(path.dirname(iconPath), { recursive: true });
fs.writeFileSync(iconPath, buffer);
console.log(`Created ${iconPath}`);

