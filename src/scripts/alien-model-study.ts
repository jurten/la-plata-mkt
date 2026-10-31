import { ACESFilmicToneMapping, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createRiggedAlien } from '../lib/alien/rigged-alien';
import { lightAlienStudio } from '../lib/alien/studio-lighting';

const canvas = document.querySelector<HTMLCanvasElement>('[data-model-study]');
const status = document.querySelector<HTMLElement>('[data-model-status]');
const button = document.querySelector<HTMLButtonElement>('[data-model-motion]');

async function enhanceStudy(canvas: HTMLCanvasElement, button: HTMLButtonElement, status: HTMLElement | null) {
  const context = canvas.getContext('webgl2', {
    alpha: false, antialias: true, depth: true, powerPreference: 'low-power',
  });
  if (!context) throw new Error('3D rendering unavailable');

  const renderer = new WebGLRenderer({ canvas, context, antialias: true });
  renderer.setClearColor(0x020307);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = .85;
  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, .01, 40);
  camera.position.set(0, .05, 1.9);
  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = false;
  controls.minPolarAngle = Math.PI * .28;
  controls.maxPolarAngle = Math.PI * .67;
  controls.target.set(0, 0, 0);
  controls.update();
  const environment = lightAlienStudio(scene, renderer);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  let alien: Awaited<ReturnType<typeof createRiggedAlien>> | undefined;
  let active = !reduced.matches;
  let inView = true;
  let suspended = false;
  let disposed = false;
  let frame = 0;
  button.disabled = true;

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  function canDraw() {
    return !disposed && !suspended && inView && !document.hidden && !context!.isContextLost();
  }
  function render(time = performance.now()) {
    frame = 0;
    if (!canDraw()) return;
    // The comparison uses exactly the same refined anatomy, skin and rig as home.
    // Orbit remains separate, so the complete head can be inspected while paused.
    if (alien && active) alien.pose(Math.sin(time * .00065) * .74, 0);
    renderer.render(scene, camera);
    if (active && alien) frame = requestAnimationFrame(render);
  }
  function redraw() {
    stop();
    render();
  }
  function syncButton() {
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? 'Pause movement' : 'Resume movement';
  }
  function resize() {
    if (disposed) return;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(1_600_000 / (bounds.width * bounds.height))));
    renderer.setSize(bounds.width, bounds.height, false);
    camera.aspect = bounds.width / bounds.height;
    camera.updateProjectionMatrix();
    redraw();
  }
  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver((entries) => {
    inView = entries.some((entry) => entry.isIntersecting);
    redraw();
  });
  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    listeners.abort();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    controls.removeEventListener('change', redraw);
    controls.dispose();
    alien?.dispose();
    environment.dispose();
    scene.clear();
    renderer.dispose();
    Reflect.deleteProperty(canvas, 'modelStudy');
  }

  controls.addEventListener('change', redraw);
  button.addEventListener('click', () => {
    active = !active;
    syncButton();
    redraw();
  }, { signal: listeners.signal });
  document.querySelector('[data-model-reset]')?.addEventListener('click', () => {
    stop();
    camera.position.set(0, .05, 1.9);
    controls.target.set(0, 0, 0);
    controls.update();
    redraw();
  }, { signal: listeners.signal });
  document.addEventListener('visibilitychange', redraw, { signal: listeners.signal });
  reduced.addEventListener('change', (event) => {
    if (!event.matches) return;
    active = false;
    syncButton();
    redraw();
  }, { signal: listeners.signal });
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    dispose();
    button.disabled = true;
    if (status) {
      status.hidden = false;
      status.textContent = '3D rendering is unavailable. The original portrait remains alongside.';
    }
  }, { signal: listeners.signal });
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) {
      suspended = true;
      stop();
    } else dispose();
  }, { signal: listeners.signal });
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    suspended = false;
    resize();
  }, { signal: listeners.signal });
  resizeObserver.observe(canvas);
  intersectionObserver.observe(canvas);
  syncButton();

  try {
    const photo = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => image.decode().then(() => resolve(image), reject);
      image.onerror = reject;
      image.src = canvas.dataset.skinPhoto!;
    });
    if (disposed) return;
    const loaded = await createRiggedAlien(photo);
    // A real navigation may finish before the model request. Release late arrivals.
    if (disposed) {
      loaded.dispose();
      return;
    }
    alien = loaded;
    scene.add(alien.root);
    if (status) status.hidden = true;
    button.disabled = false;
    // Local study/export access only; no debug property is attached on home.
    Object.assign(canvas, { modelStudy: { model: alien.model, scene, camera, renderer, controls } });
    resize();
  } catch (error) {
    dispose();
    throw error;
  }
}

if (canvas && button) {
  enhanceStudy(canvas, button, status).catch((error) => {
    button.disabled = true;
    if (status) {
      status.hidden = false;
      status.textContent = 'The 3D candidate could not load.';
    }
    console.error(error);
  });
}
