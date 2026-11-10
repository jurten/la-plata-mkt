import { getConstellationField, paintConstellations } from '../lib/alien/constellations';

// Static during loading and when motion or WebGL is unavailable; no animation loop.
for (const canvas of document.querySelectorAll<HTMLCanvasElement>('[data-constellation-sky]')) {
  const context = canvas.getContext('2d');
  const portrait = canvas.parentElement;
  if (!context || !portrait) continue;
  const field = getConstellationField();
  canvas.dataset.skySeed = String(field.seed);
  const draw = () => {
    const { width, height } = portrait.getBoundingClientRect();
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    paintConstellations(context, width, height, field);
  };
  draw();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(draw).observe(portrait);
  else window.addEventListener('resize', draw, { passive: true });
}
