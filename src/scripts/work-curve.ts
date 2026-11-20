import { Renderer, Program, Mesh, Triangle, Texture, Transform } from 'ogl';

// Original implementation of a viewport-bottom curve, informed by Ragged Edge.
// Every source image remains in normal flow; WebGL only enhances its presentation.
const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0., 1.);
}`;
const fragment = `
precision highp float;
uniform sampler2D uImage;
uniform vec2 uFit;
uniform vec4 uRect;
uniform vec2 uViewport;
uniform float uClipTop;
varying vec2 vUv;
void main() {
  vec2 pixel = vec2(vUv.x, 1. - vUv.y) * uViewport;
  if (pixel.y < uClipTop) discard;
  float lowerEdge = pow(clamp(pixel.y / uViewport.y, 0., 1.), 34.);
  pixel.x = mix(uViewport.x * .5, pixel.x, 1. - .1 * lowerEdge);
  vec2 local = (pixel - uRect.xy) / uRect.zw;
  if (local.x < 0. || local.x > 1. || local.y < 0. || local.y > 1.) discard;
  vec2 sampleUv = (vec2(local.x, 1. - local.y) - .5) * uFit + .5;
  gl_FragColor = texture2D(uImage, sampleUv);
}`;

const allowed = matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)');
let release: (() => void) | undefined;
function configureCurve() {
  release?.(); release = undefined;
  if (!allowed.matches) return;
  const images = [...document.querySelectorAll<HTMLImageElement>('img[data-work-media]')];
  if (!images.length) return;
  let renderer: Renderer;
  const canvas = document.createElement('canvas');
  canvas.className = 'work-curve-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  // Event-driven drawing must retain its buffer between native scroll events.
  try { renderer = new Renderer({ canvas, alpha: true, depth: false, antialias: true, preserveDrawingBuffer: true, dpr: Math.min(devicePixelRatio, 2) }); }
  catch { return; }
  const gl = renderer.gl;
  if (!gl) return;
  document.body.append(canvas);
  const scene = new Transform();
  const geometry = new Triangle(gl);
  const entries: { image: HTMLImageElement; mesh: Mesh; program: Program; texture: Texture }[] = [];
  let frame = 0;
  let disposed = false;
  let swapping = false;
  let visible = true;
  const restoreImages = () => images.forEach(image => image.removeAttribute('data-work-curved'));
  const draw = () => {
    frame = 0;
    if (disposed || document.hidden || swapping) return;
    const paused = Boolean(document.querySelector('main[inert]'));
    canvas.hidden = paused || !visible;
    if (canvas.hidden) { restoreImages(); return; }
    const width = innerWidth, height = innerHeight;
    // Composite above fixed UI and clip explicitly. Some WebGL compositors
    // invert the occluded rectangle when a sticky bar sits above the canvas.
    const header = document.querySelector('[data-tv-navigation]')?.getBoundingClientRect();
    const chapters = document.querySelector('.work-chapters')?.getBoundingClientRect();
    const clipTop = Math.max(0, header?.bottom ?? 0, chapters && chapters.top <= 93 ? chapters.bottom : 0);
    if (canvas.width !== Math.round(width * renderer.dpr) || canvas.height !== Math.round(height * renderer.dpr)) renderer.setSize(width, height);
    for (const entry of entries) {
      const box = entry.image.getBoundingClientRect();
      entry.mesh.visible = box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < height;
      if (!entry.mesh.visible) { entry.image.removeAttribute('data-work-curved'); continue; }
      entry.program.uniforms.uRect.value = [box.left, box.top, box.width, box.height];
      entry.program.uniforms.uViewport.value = [width, height];
      entry.program.uniforms.uClipTop.value = clipTop;
      const imageAspect = entry.image.naturalWidth / entry.image.naturalHeight;
      const boxAspect = box.width / box.height;
      entry.program.uniforms.uFit.value = boxAspect > imageAspect ? [1, imageAspect / boxAspect] : [boxAspect / imageAspect, 1];
    }
    try {
      renderer.render({ scene });
      for (const entry of entries) if (entry.mesh.visible) entry.image.setAttribute('data-work-curved', '');
    } catch { release?.(); }
  };
  const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(draw); };
  const abort = new AbortController();
  const resize = new ResizeObserver(schedule);
  images.forEach(image => {
    resize.observe(image);
    void image.decode().then(() => {
      if (disposed) return;
      const texture = new Texture(gl, { image, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR });
      const program = new Program(gl, { vertex, fragment, transparent: true, depthTest: false, depthWrite: false, cullFace: false, uniforms: { uImage: { value: texture }, uRect: { value: [0,0,1,1] }, uViewport: { value: [innerWidth,innerHeight] }, uFit: { value: [1,1] }, uClipTop: { value: 0 } } });
      const mesh = new Mesh(gl, { geometry, program }); mesh.setParent(scene);
      entries.push({ image, texture, program, mesh }); schedule();
    }).catch(() => { /* Failed media keeps its ordinary image fallback. */ });
  });
  const observed = new Set<Element>();
  const visibleTargets = new Set<Element>();
  const onScreen = new IntersectionObserver(list => {
    list.forEach(entry => { if (entry.isIntersecting) visibleTargets.add(entry.target); else visibleTargets.delete(entry.target); });
    visible = visibleTargets.size > 0; schedule();
  }, { rootMargin: '100px' });
  images.forEach(image => { if (!observed.has(image)) { observed.add(image); onScreen.observe(image); } });
  const mutations = new MutationObserver(schedule);
  const main = document.querySelector('main');
  if (main) mutations.observe(main, { attributes: true, attributeFilter: ['inert'] });
  for (const type of ['scroll','resize','lpm:work-layout']) window.addEventListener(type, schedule, { passive: true, signal: abort.signal });
  document.addEventListener('visibilitychange', schedule, { signal: abort.signal });
  // Keep shared-element snapshots as real media, without a canvas copy above them.
  window.addEventListener('pageswap', () => { swapping = true; canvas.hidden = true; restoreImages(); }, { signal: abort.signal });
  window.addEventListener('pagereveal', () => { swapping = false; schedule(); }, { signal: abort.signal });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); release?.(); }, { signal: abort.signal });
  release = () => {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(frame); abort.abort(); resize.disconnect(); onScreen.disconnect(); mutations.disconnect(); restoreImages();
    for (const entry of entries) { entry.program.remove(); gl.deleteTexture(entry.texture.texture); }
    geometry.remove(); canvas.remove(); gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
  schedule();
}
allowed.addEventListener('change', configureCurve);
window.addEventListener('pagehide', () => release?.());
window.addEventListener('pageshow', event => { if (event.persisted) configureCurve(); });
document.addEventListener('astro:before-swap', () => release?.(), { once: true });
configureCurve();
