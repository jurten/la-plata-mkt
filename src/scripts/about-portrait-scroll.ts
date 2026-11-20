import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';

// A viewport-centred lens bends only the portrait layer. Native scrolling and
// all DOM text stay untouched. The radial falloff follows the Monopo reference.
const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;
const fragment = `
precision highp float;
varying vec2 vUv;
uniform vec2 uViewport;
uniform float uStrength;
uniform sampler2D uPhoto0;
uniform sampler2D uPhoto1;
uniform sampler2D uPhoto2;
uniform vec4 uRect0;
uniform vec4 uRect1;
uniform vec4 uRect2;
uniform vec4 uFit0;
uniform vec4 uFit1;
uniform vec4 uFit2;

bool containsPoint(vec2 p, vec4 r) {
  return r.z > 0.0 && p.x >= r.x && p.y >= r.y && p.x < r.x + r.z && p.y < r.y + r.w;
}
vec2 photoUv(vec2 p, vec4 r, vec4 fit) {
  vec2 uv = ((p - r.xy) / r.zw) * fit.xy + fit.zw;
  return vec2(uv.x, 1.0 - uv.y);
}
void main() {
  vec2 point = vec2(vUv.x, 1.0 - vUv.y) * uViewport;
  vec2 centre = uViewport * 0.5;
  vec2 distanceFromCentre = point - centre;
  float radius = uViewport.x * (2.0 / 3.0);
  float radial = min(length(distanceFromCentre) / radius, 1.0);
  float falloff = 1.0 - smoothstep(0.0, 1.0, radial * radial);
  vec2 source = centre + distanceFromCentre * (1.0 - uStrength * 0.75 * falloff);
  vec4 color = vec4(0.0);
  if (containsPoint(source, uRect0)) color = texture2D(uPhoto0, photoUv(source, uRect0, uFit0));
  else if (containsPoint(source, uRect1)) color = texture2D(uPhoto1, photoUv(source, uRect1, uFit1));
  else if (containsPoint(source, uRect2)) color = texture2D(uPhoto2, photoUv(source, uRect2, uFit2));
  gl_FragColor = color;
}`;

export function initPortraitScroll(root: HTMLElement) {
  const portraits = [...root.querySelectorAll<HTMLElement>('.about-person__portrait')];
  if (portraits.length !== 3) return () => {};
  const photos = portraits.map(portrait => portrait.querySelector('img')!);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  const visible = new Set<Element>();
  const loaded = photos.map(() => false);
  let renderer: Renderer | undefined;
  let program: Program | undefined;
  let geometry: Triangle | undefined;
  let mesh: Mesh | undefined;
  let textures: Texture[] = [];
  let canvas: HTMLCanvasElement | undefined;
  let frame = 0, lastTime = 0, smoothScroll = scrollY, strength = 0;
  let disposed = false, failed = false;
  const rectangles = portraits.map(() => new Float32Array(4));
  const fits = portraits.map(() => new Float32Array([1, 1, 0, 0]));
  const viewport = new Float32Array([innerWidth, innerHeight]);
  const allowed = () => !disposed && !failed && !reduced.matches && !forced.matches && !document.hidden;
  const fallback = () => {
    cancelAnimationFrame(frame); frame = 0;
    portraits.forEach(portrait => portrait.removeAttribute('data-scroll-portrait-ready'));
    if (canvas) canvas.hidden = true;
  };
  const onContextLost = () => { failed = true; fallback(); };

  function createRenderer() {
    if (renderer) return true;
    try {
      renderer = new Renderer({ alpha: true, depth: false, stencil: false, antialias: true, dpr: Math.min(devicePixelRatio || 1, 1.5), powerPreference: 'low-power', webgl: 1 });
      const gl = renderer.gl;
      canvas = gl.canvas;
      canvas.className = 'about-portrait-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      canvas.addEventListener('webglcontextlost', onContextLost);
      root.append(canvas);
      gl.clearColor(0, 0, 0, 0);
      textures = photos.map(photo => new Texture(gl, { image: photo.complete && photo.naturalWidth ? photo : undefined, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE }));
      program = new Program(gl, { vertex, fragment, transparent: true, depthTest: false, depthWrite: false, uniforms: {
        uViewport: { value: viewport }, uStrength: { value: 0 },
        ...Object.fromEntries(textures.map((texture, index) => [`uPhoto${index}`, { value: texture }])),
        ...Object.fromEntries(rectangles.map((rect, index) => [`uRect${index}`, { value: rect }])),
        ...Object.fromEntries(fits.map((fit, index) => [`uFit${index}`, { value: fit }])),
      } });
      if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) throw new Error('Portrait shader unavailable');
      geometry = new Triangle(gl);
      mesh = new Mesh(gl, { geometry, program });
      renderer.setSize(innerWidth, innerHeight);
      return true;
    } catch {
      failed = true;
      fallback();
      return false;
    }
  }

  function draw() {
    if (!renderer || !program || !mesh || !canvas || !allowed()) return;
    portraits.forEach((portrait, index) => {
      const rect = portrait.getBoundingClientRect();
      const photo = photos[index];
      const ready = loaded[index] && rect.width > 0 && rect.height > 0;
      rectangles[index].set([rect.left, rect.top, ready ? rect.width : 0, ready ? rect.height : 0]);
      if (!ready) return;
      const scale = Math.max(rect.width / photo.naturalWidth, rect.height / photo.naturalHeight);
      const width = photo.naturalWidth * scale, height = photo.naturalHeight * scale;
      const position = getComputedStyle(photo).objectPosition.split(' ').map(value => parseFloat(value) / 100);
      fits[index].set([rect.width / width, rect.height / height, (1 - rect.width / width) * position[0], (1 - rect.height / height) * (position[1] ?? position[0])]);
      if (textures[index].image !== photo) { textures[index].image = photo; textures[index].needsUpdate = true; }
    });
    program.uniforms.uStrength.value = strength;
    renderer.render({ scene: mesh });
    canvas.hidden = false;
    // Keep the semantic images as the fallback until the first successful draw.
    portraits.forEach((portrait, index) => portrait.toggleAttribute('data-scroll-portrait-ready', loaded[index]));
    const state = strength > 0.00005 ? 'moving' : 'idle';
    if (canvas.dataset.scrollState !== state) canvas.dataset.scrollState = state;
  }

  function tick(now: number) {
    frame = 0;
    if (!allowed() || visible.size === 0) return;
    const dt = Math.min(Math.max(now - lastTime, 1), 64);
    lastTime = now;
    const follow = 1 - Math.exp(-dt / 158);
    smoothScroll += (scrollY - smoothScroll) * follow;
    const target = Math.min(Math.abs(scrollY - smoothScroll) / 2000, 0.3);
    strength += (target - strength) * follow;
    const settled = Math.abs(scrollY - smoothScroll) < 0.02 && strength < 0.00005;
    if (settled) { smoothScroll = scrollY; strength = 0; }
    draw();
    if (!settled) frame = requestAnimationFrame(tick);
  }

  function wake() {
    if (!allowed() || visible.size === 0) { fallback(); smoothScroll = scrollY; strength = 0; return; }
    if (!createRenderer()) return;
    if (!frame) { lastTime = performance.now(); frame = requestAnimationFrame(tick); }
  }
  function resize() {
    viewport.set([innerWidth, innerHeight]);
    renderer?.setSize(innerWidth, innerHeight);
    smoothScroll = scrollY; strength = 0;
    wake();
  }
  const onLoad = photos.map((photo, index) => () => { loaded[index] = photo.naturalWidth > 0; wake(); });
  photos.forEach((photo, index) => {
    loaded[index] = photo.complete && photo.naturalWidth > 0;
    photo.addEventListener('load', onLoad[index]);
  });
  const intersection = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    wake();
  }, { rootMargin: '120px 0px' });
  portraits.forEach(portrait => intersection.observe(portrait));
  const layout = new ResizeObserver(resize);
  portraits.forEach(portrait => layout.observe(portrait));
  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', wake);
  reduced.addEventListener('change', wake);
  forced.addEventListener('change', wake);

  return () => {
    disposed = true;
    fallback();
    intersection.disconnect(); layout.disconnect();
    window.removeEventListener('scroll', wake);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', wake);
    reduced.removeEventListener('change', wake); forced.removeEventListener('change', wake);
    photos.forEach((photo, index) => photo.removeEventListener('load', onLoad[index]));
    canvas?.removeEventListener('webglcontextlost', onContextLost);
    geometry?.remove(); program?.remove();
    textures.forEach(texture => renderer?.gl.deleteTexture(texture.texture));
    renderer?.gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas?.remove();
  };
}
