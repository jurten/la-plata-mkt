// Balatro-style advected cursor displacement, independently implemented on a
// small CPU grid so WebGL1 devices need no float framebuffer extensions.
// Reference: https://github.com/DavidHDev/react-bits/blob/main/src/content/Backgrounds/Balatro/Balatro.jsx
export class SmokeDisplacement {
 readonly width = 160;
 readonly height = 100;
 readonly pixels = new Uint8Array(this.width * this.height * 4);
 energy = 0;
 private x = new Float32Array(this.width * this.height);
 private y = new Float32Array(this.width * this.height);
 private nextX = new Float32Array(this.width * this.height);
 private nextY = new Float32Array(this.width * this.height);

 constructor() { this.clear(); }

 clear() {
  this.x.fill(0); this.y.fill(0); this.energy = 0;
  this.encode();
 }

 private sample(field: Float32Array, x: number, y: number) {
  x = Math.max(0, Math.min(this.width - 1, x));
  y = Math.max(0, Math.min(this.height - 1, y));
  const ix = Math.min(this.width - 2, Math.floor(x)), iy = Math.min(this.height - 2, Math.floor(y));
  const fx = x - ix, fy = y - iy, k = iy * this.width + ix;
  return (field[k] * (1 - fx) + field[k + 1] * fx) * (1 - fy)
   + (field[k + this.width] * (1 - fx) + field[k + this.width + 1] * fx) * fy;
 }

 step(dt: number, fromX: number, fromY: number, toX: number, toY: number, cssWidth: number, cssHeight: number) {
  const dx = (toX - fromX) * cssWidth, dy = (toY - fromY) * cssHeight;
  const lengthSquared = dx * dx + dy * dy;
  // Direct travel input, no cursor-follow spring. Cap each impulse, not the path.
  const gain = .65 * Math.min(1, 65 / Math.max(1, Math.sqrt(lengthSquared)));
  const radius = Math.min(105, cssWidth * .18);
  const decay = Math.exp(-dt / .24); // Balatro uses 1.6 seconds; smoke releases faster.
  let energy = 0;
  for (let j = 0; j < this.height; j++) for (let i = 0; i < this.width; i++) {
   const px = i / (this.width - 1), py = j / (this.height - 1);
   const rx = (px - fromX) * cssWidth, ry = (py - fromY) * cssHeight;
   const along = Math.max(0, Math.min(1, (rx * dx + ry * dy) / Math.max(.0001, lengthSquared)));
   const gx = rx - dx * along, gy = ry - dy * along;
   const influence = Math.exp(-(gx * gx + gy * gy) / (radius * radius));
   const pushX = dx * gain * influence / cssWidth, pushY = dy * gain * influence / cssHeight;
   const k = j * this.width + i;
   const sourceX = (px - pushX) * (this.width - 1), sourceY = (py - pushY) * (this.height - 1);
   this.nextX[k] = Math.max(-.15, Math.min(.15, (this.sample(this.x, sourceX, sourceY) + pushX) * decay));
   this.nextY[k] = Math.max(-.15, Math.min(.15, (this.sample(this.y, sourceX, sourceY) + pushY) * decay));
   energy = Math.max(energy, Math.abs(this.nextX[k]), Math.abs(this.nextY[k]));
  }
  [this.x, this.nextX] = [this.nextX, this.x];
  [this.y, this.nextY] = [this.nextY, this.y];
  this.energy = energy;
  if (energy < .00001) this.clear(); else this.encode();
 }

 private encode() {
  for (let k = 0; k < this.x.length; k++) {
   const x = Math.round((this.x[k] / .3 + .5) * 65535);
   const y = Math.round((this.y[k] / .3 + .5) * 65535);
   this.pixels[k * 4] = x >> 8; this.pixels[k * 4 + 1] = x & 255;
   this.pixels[k * 4 + 2] = y >> 8; this.pixels[k * 4 + 3] = y & 255;
  }
 }
}
