import {
  HalfFloatType, Mesh, MeshNormalMaterial, OrthographicCamera, PlaneGeometry, Scene,
  ShaderMaterial, UnsignedByteType, Vector4, WebGLRenderTarget,
  type Camera, type Texture, type WebGLRenderer,
} from 'three';

export interface AlienSignal {
  enabled: boolean;
  present?: boolean;
  time: number;
  warp: number;
  pointer: { active: boolean; x: number; y: number };
}

/** Relight cached head geometry with the actual animated Galaxy radiance. */
export function createSignalPass(renderer: WebGLRenderer, context: WebGL2RenderingContext, sky: Texture) {
  const target = new WebGLRenderTarget(1, 1, {
    type: context.getExtension('EXT_color_buffer_float') ? HalfFloatType : UnsignedByteType,
    depthBuffer: true,
  });
  const surface = new WebGLRenderTarget(1, 1, { depthBuffer: true });
  const normals = new MeshNormalMaterial();
  const uniforms = {
    uPicture: { value: target.texture },
    uSurface: { value: surface.texture },
    uSky: { value: sky },
    uHeadFrame: { value: new Vector4(0, 0, 1, 1) },
    uHeadScale: { value: .38 },
    uStarLight: { value: 1 },
  };
  const material = new ShaderMaterial({
    uniforms, depthTest: false, depthWrite: false, toneMapped: true,
    vertexShader: `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uPicture;
      uniform sampler2D uSurface;
      uniform sampler2D uSky;
      uniform vec4 uHeadFrame;
      uniform float uHeadScale;
      uniform float uStarLight;
      varying vec2 vUv;
      vec3 starRadiance(vec2 uv, float blur) {
        return max(textureLod(uSky, clamp(uv, vec2(.001), vec2(.999)), blur).rgb - vec3(.001), vec3(0.0));
      }
      vec3 lightHead(vec4 alien, vec2 headUv) {
        vec3 normal = normalize(texture2D(uSurface, headUv).rgb * 2.0 - 1.0);
        float skin = smoothstep(.015, .1, max(max(alien.r, alien.g), alien.b));
        // Broad illumination follows the surface normal; the darker lenses
        // reflect a sharper sky. Mips filter the same sky used behind the head.
        vec2 diffuseUv = .5 + normal.xy * .45;
        vec3 irradiance = starRadiance(diffuseUv, 5.5);
        vec3 reflected = reflect(vec3(0.0, 0.0, -1.0), normal);
        vec3 radiance = starRadiance(.5 + reflected.xy * .48, mix(1.5, 4.5, skin));
        float fresnel = .15 + .85 * pow(1.0 - max(normal.z, 0.0), 3.0);
        vec3 diffuse = alien.rgb * irradiance * 6.0;
        vec3 specular = radiance * mix(.55, .08, skin) * fresnel;
        return alien.rgb + (diffuse + specular) * uStarLight;
      }
      vec3 composite(vec2 uv) {
        vec2 headUv = (uv - uHeadFrame.xy) / uHeadFrame.zw;
        headUv = (headUv - .5) / uHeadScale + .5;
        vec4 alien = vec4(0.0);
        if (all(greaterThanEqual(headUv, vec2(0.0))) && all(lessThanEqual(headUv, vec2(1.0)))) {
          alien = texture2D(uPicture, headUv);
          if (alien.a > .001) alien.rgb = lightHead(alien, headUv);
        }
        vec3 sky = texture2D(uSky, uv).rgb;
        return mix(sky, alien.rgb, alien.a);
      }
      void main() {
        gl_FragColor = vec4(composite(vUv), 1.0);
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
  let ready = false, needsPresent = true;

  function present() {
    if (!ready || !needsPresent) return false;
    renderer.setRenderTarget(null);
    renderer.render(output, camera);
    needsPresent = false;
    return true;
  }
  return {
    resize(width: number, height: number, frame: Vector4) {
      target.setSize(width, height);
      surface.setSize(width, height);
      uniforms.uHeadFrame.value.copy(frame);
      needsPresent = true;
    },
    arrival(scale: number) {
      if (uniforms.uHeadScale.value === scale) return;
      uniforms.uHeadScale.value = scale;
      needsPresent = true;
    },
    starlight(enabled: boolean) {
      const strength = enabled ? 1 : 0;
      if (uniforms.uStarLight.value === strength) return;
      uniforms.uStarLight.value = strength;
      needsPresent = true;
    },
    render(scene: Scene, sceneCamera: Camera) {
      const previous = scene.overrideMaterial;
      renderer.setRenderTarget(target);
      try {
        renderer.render(scene, sceneCamera);
        renderer.setRenderTarget(surface);
        scene.overrideMaterial = normals;
        renderer.render(scene, sceneCamera);
      } finally { scene.overrideMaterial = previous; renderer.setRenderTarget(null); }
      ready = true; needsPresent = true;
    },
    present,
    invalidate() { needsPresent = true; },
    dispose() { target.dispose(); surface.dispose(); normals.dispose(); geometry.dispose(); material.dispose(); output.clear(); },
  };
}
