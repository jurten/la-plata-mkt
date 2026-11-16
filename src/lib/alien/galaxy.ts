/*!
 * Galaxy — Copyright (c) 2026 David Haz / React Bits.
 * Adapted for this website from https://reactbits.dev/backgrounds/galaxy
 * MIT + Commons Clause; full copyright and license: /licenses/react-bits-galaxy.txt
 */
import {
  Color, HalfFloatType, LinearMipmapLinearFilter, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial,
  UnsignedByteType, Vector2, Vector3, WebGLRenderTarget, type WebGLRenderer,
} from 'three';

export interface GalaxyPointer { active: boolean; x: number; y: number }
export interface GalaxyMotion {
  time: number; depth: number; angle: number; reveal: number; boost: number;
  x: number; y: number; active: number; warp: number;
}

export function createGalaxyMotion(): GalaxyMotion {
  return { time: 0, depth: 0, angle: 0, reveal: 0, boost: 0, x: .5, y: .5, active: 0, warp: 0 };
}

/** The head approaches quickly with the opening flight, then settles at its full size. */
export function galaxyArrivalScale(motion: GalaxyMotion) {
  return .38 + .62 * (1 - (1 - motion.reveal) ** 3);
}

/** Same flight, warp and pointer damping as React Bits, on the shared hero clock. */
export function advanceGalaxy(motion: GalaxyMotion, elapsed: number, pointer: GalaxyPointer, warp: number) {
  const dt = Math.max(0, Math.min(elapsed, .12));
  if (warp !== motion.warp) { motion.boost = Math.min(1.6, motion.boost + 1); motion.warp = warp; }
  motion.reveal = Math.min(1, motion.reveal + dt / 2.2);
  if (motion.reveal < 1) motion.boost = Math.max(motion.boost, (1 - motion.reveal) ** 2 * 1.4);
  motion.time += dt;
  motion.depth += dt * .05 * (1 + motion.boost * 14);
  motion.angle += dt * .1;
  motion.boost *= Math.exp(-dt * 1.3);
  if (motion.boost < .001) motion.boost = 0;
  const follow = 1 - Math.exp(-dt / .325);
  if (pointer.active) {
    motion.x += (pointer.x - motion.x) * follow;
    motion.y += (pointer.y - motion.y) * follow;
    if (Math.abs(pointer.x - motion.x) < .0001) motion.x = pointer.x;
    if (Math.abs(pointer.y - motion.y) < .0001) motion.y = pointer.y;
  }
  const target = pointer.active ? 1 : 0;
  motion.active += (target - motion.active) * follow;
  if (Math.abs(target - motion.active) < .001) motion.active = target;
}

const fragmentShader = `
#define PALETTE
#define REPEL
#define WARP
precision highp float;
precision highp int;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uGloss;
uniform float uDepth;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uStarGlow;
uniform float uFlareGain;
uniform float uSquash;
uniform float uSaturation;
uniform float uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationAngle;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform int uLayers;
uniform vec3 uColors[4];
uniform int uColorCount;
uniform float uWarp;
uniform float uReveal;
uniform float uMode;
uniform vec3 uBackground;
uniform float uOpacity;
uniform float uSeed;
varying vec2 vUv;

#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare, vec2 radial, float invReach) {
#ifdef WARP
  float along = dot(uv, radial);
  float d = sqrt(max(dot(uv, uv) - uSquash * along * along, 0.0));
#else
  float d = length(uv);
#endif
  float m = uStarGlow / max(d, 0.0001);
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uFlareGain;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uFlareGain;
  m *= smoothstep(1.0, 0.2, d * invReach);
#ifdef WARP
  m *= mix(1.0, smoothstep(1.0, 0.55, length(uv) * invReach), min(uWarp * 4.0, 1.0));
#endif
  return m;
}

vec3 StarLayer(vec2 uv, vec2 radial, vec2 repelAt, float pushCells, float spread) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      // Thin the existing cells rather than enlarging the remaining stars.
      if (Hash21(si + 19.73) > .42) continue;
      float size = fract(seed * 345.32);
      float glossLocal = tri(uGloss / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

#ifdef PALETTE
      float pick = Hash21(si + 7.0) * float(uColorCount);
      vec3 base = uColors[int(min(floor(pick), float(uColorCount - 1)))];
#else
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));
#endif

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      vec2 shift = vec2(0.0);
      float invReach = 1.0;
#ifdef REPEL
      vec2 away = si + 0.5 + pad - repelAt;
      float dist = length(away);
      float q = dist * spread;
      float cells = pushCells * exp(-q * q);
      float moved = cells * inversesqrt(1.0 + cells * cells * 2.78);
      shift = away * (moved / max(dist, 0.0001));
      invReach = 1.0 / (1.0 - moved);
#endif
      float star = Star(gv - offset - pad - shift, flareSize, radial, invReach);
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      col += star * twinkle * size * base;
    }
  }
  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution;
  vec2 uv = (gl_FragCoord.xy - focalPx) / uResolution.y;
  vec2 mouseNorm = uMouse - vec2(0.5);

  vec2 repelAt = vec2(0.0);
  float strength = 0.0;
  float push = 0.0;
  if (uAutoCenterRepulsion > 0.0) {
    strength = uAutoCenterRepulsion;
    push = strength * 0.05;
  } else if (uMouseRepulsion > 0.5) {
    repelAt = (uMouse * uResolution - focalPx) / uResolution.y;
    strength = max(uRepulsionStrength, 0.0);
    push = strength * 0.05 * uMouseActiveFactor;
  } else {
    uv += mouseNorm * 0.1 * uMouseActiveFactor;
  }
  float radius = 0.16 + 0.04 * strength;

  vec2 radial = length(uv) > 0.0001 ? normalize(uv) : vec2(1.0, 0.0);
  float angle = uRotationAngle;
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;
  radial = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * radial;
  radial = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * radial;
  repelAt = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * repelAt;
  repelAt = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * repelAt;

  vec3 col = vec3(0.0);
  float layers = float(uLayers);
  for (int k = 0; k < 4; k++) {
    if (k >= uLayers) break;
    float i = float(k) / layers;
    float depth = fract(i + uDepth);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    vec2 offset = vec2(i * 453.32 + uSeed);
    col += StarLayer(uv * scale + offset, radial, repelAt * scale + offset, push * scale, 1.0 / (scale * radius)) * fade;
  }
  float reading = uResolution.x / uResolution.y > 1.3
    ? exp(-pow((vUv.x - .21) / .25, 4.0) - pow((1.0 - vUv.y - .52) / .29, 4.0)) : 0.0;
  col *= uReveal * (1.0 - reading * .65);

  if (uMode > 1.5) {
    vec3 lit = col * smoothstep(0.0, 0.3, length(col));
    float energy = max(max(lit.r, lit.g), lit.b);
    vec3 tint = lit / max(energy, 0.0001);
    vec3 ink = tint * (0.16 / max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 0.16));
    float coverage = pow(min(energy * 1.3, 1.0), 1.3) * 0.92 * uOpacity;
    gl_FragColor = uMode > 2.5 ? vec4(ink * coverage, coverage) : vec4(mix(uBackground, ink, coverage), 1.0);
  } else if (uMode > 0.5) {
    float alpha = min(smoothstep(0.0, 0.3, length(col)), 1.0) * uOpacity;
    gl_FragColor = vec4(col * alpha, alpha);
  } else {
    gl_FragColor = vec4(mix(uBackground, col, uOpacity), 1.0);
  }
}`;

export function createGalaxySky(renderer: WebGLRenderer, context: WebGL2RenderingContext, seed: number) {
  const target = new WebGLRenderTarget(1, 1, {
    type: context.getExtension('EXT_color_buffer_float') ? HalfFloatType : UnsignedByteType,
    depthBuffer: false, minFilter: LinearMipmapLinearFilter, generateMipmaps: true,
  });
  const motion = createGalaxyMotion();
  const uniforms = {
    uTime: { value: 0 }, uResolution: { value: new Vector2(1, 1) },
    uFocal: { value: new Vector2(.5, .5) }, uRotation: { value: new Vector2(1, 0) },
    uGloss: { value: 0 }, uDepth: { value: 0 }, uDensity: { value: 1 },
    uHueShift: { value: 140 }, uSpeed: { value: 1 }, uMouse: { value: new Vector2(.5, .5) },
    uStarGlow: { value: .015 }, uFlareGain: { value: .3 }, uSquash: { value: 0 },
    uSaturation: { value: 0 }, uMouseRepulsion: { value: 1 }, uTwinkleIntensity: { value: .3 },
    uRotationAngle: { value: 0 }, uRepulsionStrength: { value: 2 }, uMouseActiveFactor: { value: 0 },
    uAutoCenterRepulsion: { value: 0 }, uLayers: { value: 4 },
    uColors: { value: [new Vector3(.62, .77, 1), new Vector3(.82, .9, 1), new Vector3(.35, .55, 1), new Vector3(.7, .85, 1)] },
    uColorCount: { value: 4 }, uWarp: { value: 0 }, uReveal: { value: 0 },
    uMode: { value: 0 }, uBackground: { value: new Color('#020307') }, uOpacity: { value: .8 },
    uSeed: { value: (seed >>> 0) / 4294967296 * 1000 },
  };
  const material = new ShaderMaterial({
    uniforms, fragmentShader, depthTest: false, depthWrite: false, toneMapped: false,
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  });
  material.name = 'React Bits Galaxy';
  const geometry = new PlaneGeometry(2, 2);
  const quad = new Mesh(geometry, material);
  quad.frustumCulled = false;
  const scene = new Scene(); scene.add(quad);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  let lastTime: number | undefined;
  let hidden = false;
  let cssWidth = 1, cssHeight = 1, pixelBudget = 500_000;
  let lastWallTime = 0, slowFrames = 0;
  const sizeTarget = () => {
    const ratio = Math.min(1, Math.sqrt(pixelBudget / (cssWidth * cssHeight)));
    target.setSize(Math.max(1, Math.round(cssWidth * ratio)), Math.max(1, Math.round(cssHeight * ratio)));
    uniforms.uResolution.value.set(target.width, target.height);
  };
  const render = () => {
    uniforms.uTime.value = motion.time;
    uniforms.uGloss.value = motion.time * .05;
    uniforms.uDepth.value = motion.depth;
    uniforms.uRotationAngle.value = motion.angle;
    uniforms.uMouse.value.set(motion.x, motion.y);
    uniforms.uMouseActiveFactor.value = motion.active;
    const stretch = 1 + motion.boost * 5;
    uniforms.uStarGlow.value = .015 / stretch ** .6;
    uniforms.uSquash.value = 1 - 1 / (stretch * stretch);
    uniforms.uWarp.value = motion.boost;
    const fade = Math.min(1, motion.reveal / .35);
    uniforms.uReveal.value = hidden ? 0 : fade * fade * (3 - 2 * fade);
    renderer.setRenderTarget(target);
    try { renderer.render(scene, camera); }
    finally { renderer.setRenderTarget(null); }
  };
  return {
    texture: target.texture,
    motion,
    resize(width: number, height: number, compact: boolean) {
      // The original procedural shader runs below the mesh's pixel budget.
      cssWidth = width; cssHeight = height;
      sizeTarget();
      uniforms.uLayers.value = compact ? 3 : 4;
      render();
    },
    update(time: number, enabled: boolean, pointer: GalaxyPointer, warp: number, hide: boolean) {
      const changed = enabled || motion.active !== 0 || hidden !== hide;
      hidden = hide;
      if (enabled) {
        const now = performance.now();
        // Reduce only the background after sustained sub-7fps presentation.
        // Keep text and alien resolution intact, and ignore suspended time.
        if (lastWallTime) slowFrames = now - lastWallTime > 150 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
        lastWallTime = now;
        if (slowFrames >= 4 && pixelBudget > 125_000) {
          pixelBudget = Math.max(125_000, Math.floor(pixelBudget * .6));
          sizeTarget(); slowFrames = 0;
        }
        advanceGalaxy(motion, lastTime === undefined ? 1 / 24 : time - lastTime, pointer, warp);
        lastTime = time;
      } else { lastTime = undefined; lastWallTime = 0; slowFrames = 0; motion.active = 0; motion.warp = warp; }
      if (changed) render();
      return changed;
    },
    suspend() { lastTime = undefined; lastWallTime = 0; slowFrames = 0; },
    dispose() { target.dispose(); geometry.dispose(); material.dispose(); scene.clear(); },
  };
}
