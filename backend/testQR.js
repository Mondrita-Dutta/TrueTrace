const fs = require('fs');
const PNG = require('pngjs').PNG;
const jsQR = require('jsqr');

const qrPath = './uploads/qrcodes/qr-TT-2026-000104.png';
const buffer = fs.readFileSync(qrPath);
const png = PNG.sync.read(buffer);

const code = jsQR(Uint8ClampedArray.from(png.data), png.width, png.height);

if (code) {
  console.log("Found QR code", code.data);
} else {
  console.log("No QR code found in the image.");
}
