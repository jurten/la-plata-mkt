import {
  HalfFloatType, Mesh, OrthographicCamera, PlaneGeometry, Scene,
  ShaderMaterial, UnsignedByteType, Vector2, Vector4, WebGLRenderTarget,
  type Camera, type WebGLRenderer,
} from 'three';

export interface AlienSignal {
  enabled: boolean;
  present?: boolean;
  phase: 'locked' | 'tracking' | 'collapse';
  frame: number;
  beam: { active: boolean; x: number; y: number; radii: Float32Array };
}

const edges = [
  [0, .12, .17, .3, .35, .44, .48, .65, .72, .83, .89, 1],
  [0, .06, .23, .27, .4, .43, .57, .64, .7, .88, .93, 1],
  [0, .18, .22, .34, .52, .56, .62, .77, .8, .85, .94, 1],
];
const rows = [.18, .54, .37, .72, .46, .91, .62, .26, .79, .42, .68];
const spans = [.015, .09, -.05, .008, .11, -.025, .035, .005, -.07, .02, .012];
const stretch = [.1, -.4, .035, .45, -.12, .02, .7, -.22, .08, -.06, .3];
const shifts = [-.18, .1, -.04, .16, -.12, .06, -.22, .13, -.07, .2, -.02];

/** Corrupt the actual frame, independently of CSS backdrop-filter support. */
export function createSignalPass(renderer: WebGLRenderer, context: WebGL2RenderingContext) {
  const target = new WebGLRenderTarget(1, 1, {
    type: context.getExtension('EXT_color_buffer_float') ? HalfFloatType : UnsignedByteType,
    depthBuffer: true,
  });
  const uniforms = {
    uPicture: { value: target.texture },
    uPhase: { value: 0 },
    uFrame: { value: 0 },
    uBands: { value: new Float32Array(44) },
    uStretch: { value: new Float32Array(11) },
    uPortrait: { value: new Vector4(0, 0, 1, 1) },
    uBeamActive: { value: false },
    uBeamCenter: { value: new Vector2() },
    uBeamRadii: { value: new Float32Array(192) },
  };
  const material = new ShaderMaterial({
    uniforms, depthTest: false, depthWrite: false, toneMapped: true,
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uPicture;
      uniform float uPhase;
      uniform float uFrame;
      uniform vec4 uBands[11];
      uniform float uStretch[11];
      uniform vec4 uPortrait;
      uniform bool uBeamActive;
      uniform vec2 uBeamCenter;
      uniform float uBeamRadii[192];
      varying vec2 vUv;
      vec3 picture(vec2 p) {
        return texture2D(uPicture, vec2(clamp(p.x, .015, .985), 1.0 - clamp(p.y, .015, .985))).rgb;
      }
      bool insideBeam(vec2 p) {
        if (!uBeamActive) return false;
        vec2 delta = uPortrait.xy + p * uPortrait.zw - uBeamCenter;
        float angle = fract(atan(delta.y, delta.x) / 6.28318530718 + 1.0) * 192.0;
        int index = int(floor(angle));
        int next = index == 191 ? 0 : index + 1;
        float radius = mix(uBeamRadii[index], uBeamRadii[next], fract(angle));
        return length(delta) < radius - 1.0;
      }
      void main() {
        vec2 p = vec2(vUv.x, 1.0 - vUv.y);
        vec3 basePicture = texture2D(uPicture, vUv).rgb;
        vec3 signal = basePicture;
        if (uPhase > 1.5 && !insideBeam(p)) {
          float start = 0.0;
          vec2 sampleAt = p;
          for (int band = 0; band < 11; band++) {
            vec4 mapping = uBands[band];
            if (p.y <= mapping.x || band == 10) {
              float within = (p.y - start) / max(.001, mapping.x - start);
              sampleAt = vec2(mapping.w + (p.x - .5) * uStretch[band], mapping.y + (within - .5) * mapping.z);
              break;
            }
            start = mapping.x;
          }
          sampleAt.x += sin(floor(p.y * 90.0) * 2.7 + uFrame * 4.1) * .012;
          signal = vec3(picture(sampleAt + vec2(.028, -.006)).r,
                        picture(sampleAt).g,
                        picture(sampleAt + vec2(-.022, .009)).b);
        } else if (uPhase > .5 && !insideBeam(p)) {
          vec2 sampleAt = p + vec2(sin(p.y * 90.0 + uFrame * 3.0) * .012, .004 * (uFrame - 1.0));
          signal = vec3(picture(sampleAt + vec2(.009, 0.0)).r,
                        picture(sampleAt).g,
                        picture(sampleAt - vec2(.008, 0.0)).b);
        }
        gl_FragColor = vec4(signal, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const geometry = new PlaneGeometry(2, 2);
  const quad = new Mesh(geometry, material);
  quad.frustumCulled = false;
  const output = new Scene();
  output.add(quad);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  let ready = false, needsPresent = true, phase = 0, frame = -1, beamActive = false;

  function present() {
    if (!ready || !needsPresent) return false;
    renderer.setRenderTarget(null);
    renderer.render(output, camera);
    needsPresent = false;
    return true;
  }
  return {
    setPortrait(portrait: Vector4) {
      if (uniforms.uPortrait.value.equals(portrait)) return;
      uniforms.uPortrait.value.copy(portrait);
      needsPresent = true;
    },
    resize(width: number, height: number, portrait: Vector4) {
      target.setSize(width, height);
      uniforms.uPortrait.value.copy(portrait);
      frame = -2;
      needsPresent = true;
    },
    render(scene: Scene, sceneCamera: Camera) {
      renderer.setRenderTarget(target);
      try { renderer.render(scene, sceneCamera); }
      finally { renderer.setRenderTarget(null); }
      ready = true; needsPresent = true;
    },
    present,
    signal(signal: AlienSignal, drawAllowed: boolean) {
      const nextPhase = !signal.enabled ? 0 : signal.phase === 'collapse' ? 2 : signal.phase === 'tracking' ? 1 : 0;
      const nextFrame = nextPhase ? Math.max(0, Math.min(2, signal.frame)) : -1;
      const changed = nextPhase !== phase || nextFrame !== frame || (nextPhase > 0 && (signal.beam.active || beamActive));
      if (changed) {
        phase = nextPhase; frame = nextFrame; beamActive = signal.beam.active;
        uniforms.uPhase.value = phase;
        uniforms.uFrame.value = Math.max(0, frame);
        uniforms.uBeamActive.value = signal.beam.active;
        uniforms.uBeamCenter.value.set(signal.beam.x, signal.beam.y);
        uniforms.uBeamRadii.value.set(signal.beam.radii);
        if (phase === 2) {
          const center = uniforms.uPortrait.value.z <= 700 ? .5 : .74;
          for (let band = 0; band < 11; band++) {
            const index = (band + frame * 4) % 11;
            uniforms.uBands.value.set([edges[frame][band + 1], rows[index], spans[(index + frame) % 11], center + shifts[index]], band * 4);
            uniforms.uStretch.value[band] = stretch[(index + frame * 2) % 11];
          }
        }
        needsPresent = true;
      }
      return drawAllowed && present();
    },
    dispose() { target.dispose(); geometry.dispose(); material.dispose(); output.clear(); },
  };
}
