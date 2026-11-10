interface Star {
  x: number;
  y: number;
  radius: number;
  brightness: number;
  layer: number;
}

export interface ConstellationField {
  seed: number;
  stars: Star[];
}

/** One seed reproduces the same sky through resizing and delayed model loading. */
export function generateConstellations(seed: number): ConstellationField {
  let state = seed >>> 0;
  const random = () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ state >>> 15, 1 | state);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
  const stars: Star[] = [];
  while (stars.length < 300) {
    stars.push({
      x: .015 + random() * .97, y: .025 + random() * .95,
      radius: .56 + random() ** 2 * 1.44,
      brightness: .09 + random() ** 2 * .34,
      layer: Math.floor(random() * 3),
    });
  }
  return { seed, stars };
}

let pageField: ConstellationField | undefined;
export function getConstellationField() {
  return pageField ??= generateConstellations(crypto.getRandomValues(new Uint32Array(1))[0]);
}

export function paintConstellations(
  context: CanvasRenderingContext2D, width: number, height: number,
  field: ConstellationField, pointerX = 0, pointerY = 0,
) {
  const compact = width <= 700;
  const stars = field.stars.slice(0, compact ? 128 : 300);
  context.fillStyle = '#020307';
  context.fillRect(0, 0, width, height);
  const points = stars.map(star => {
    const depth = (star.layer + 1) / 3;
    const x = star.x * width - pointerX * depth * 11;
    const y = star.y * height - pointerY * depth * 7;
    const reading = !compact
      ? Math.exp(-(((star.x - .21) / .25) ** 4) - ((star.y - .52) / .29) ** 4)
      : 0;
    return { x, y, opacity: star.brightness * (1 - reading * .65) };
  });
  stars.forEach((star, index) => {
    const point = points[index];
    if (star.radius > 1.25) {
      const halo = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, 6);
      halo.addColorStop(0, `rgba(135,180,255,${point.opacity * .25})`);
      halo.addColorStop(1, 'rgba(135,180,255,0)');
      context.fillStyle = halo;
      context.fillRect(point.x - 6, point.y - 6, 12, 12);
    }
    context.fillStyle = `rgba(195,216,248,${point.opacity})`;
    context.beginPath();
    context.arc(point.x, point.y, star.radius, 0, Math.PI * 2);
    context.fill();
  });
}
