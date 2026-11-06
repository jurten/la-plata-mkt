import { Vector3, type BufferGeometry, type MeshPhysicalMaterial } from 'three';

/** Object-space pigment follows the head without seams in the authored UV atlas. */
export function refineSuppliedSkin(geometry: BufferGeometry, material: MeshPhysicalMaterial) {
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox!;
  const center = bounds.getCenter(new Vector3());
  const height = Math.max(bounds.max.y - bounds.min.y, .001);

  material.color.set('#819cc7');
  material.metalness = 0;
  material.roughness = .88;
  material.specularIntensity = .32;
  material.clearcoat = 0;
  material.normalScale.set(.8, .8);
  material.envMapIntensity = .45;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.lpmSkinCenter = { value: center };
    shader.uniforms.lpmSkinHeight = { value: height };
    shader.vertexShader = `
      uniform vec3 lpmSkinCenter;
      uniform float lpmSkinHeight;
      varying vec3 vLpmSkinPosition;
    ` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vLpmSkinPosition = (position - lpmSkinCenter) / lpmSkinHeight;
    `);
    shader.fragmentShader = `
      varying vec3 vLpmSkinPosition;
      float lpmSkinHash(vec3 p) {
        p = fract(p * .1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }
      float lpmSkinNoise(vec3 p) {
        vec3 i = floor(p), f = fract(p);
        f = f * f * (3. - 2. * f);
        return mix(
          mix(mix(lpmSkinHash(i), lpmSkinHash(i + vec3(1,0,0)), f.x),
              mix(lpmSkinHash(i + vec3(0,1,0)), lpmSkinHash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(lpmSkinHash(i + vec3(0,0,1)), lpmSkinHash(i + vec3(1,0,1)), f.x),
              mix(lpmSkinHash(i + vec3(0,1,1)), lpmSkinHash(i + vec3(1,1,1)), f.x), f.y), f.z);
      }
    ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      #include <map_fragment>
      // Preserve the authored dark eyes, nostrils and mouth.
      float lpmSkinMask = smoothstep(.018, .095, max(max(diffuseColor.r, diffuseColor.g), diffuseColor.b));
      vec3 lpmP = vLpmSkinPosition;
      float lpmCloud = lpmSkinNoise(lpmP * 7. + 4.7);
      float lpmMottle = lpmSkinNoise(lpmP * 24. + lpmCloud * 2.);
      float lpmSpotNoise = lpmSkinNoise(lpmP * 165. + lpmMottle * 1.8);
      float lpmSpotAA = max(fwidth(lpmSpotNoise), .025);
      float lpmSpots = smoothstep(.60 - lpmSpotAA, .85 + lpmSpotAA, lpmSpotNoise);
      float lpmPores = lpmSkinNoise(lpmP * 310.);
      vec3 lpmPigment = mix(vec3(.55,.66,.86), vec3(.95,1.08,1.03), smoothstep(.28,.70,lpmCloud));
      lpmPigment = mix(lpmPigment, vec3(.68,.59,.85), smoothstep(.48,.77,lpmMottle) * .42);
      lpmPigment *= 1. - lpmSpots * .30;
      lpmPigment *= .94 + lpmPores * .12;
      diffuseColor.rgb *= mix(vec3(1.), lpmPigment, lpmSkinMask);
    `);
    shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', `
      #include <roughnessmap_fragment>
      // A matte dermis floor overrides the near-polished areas of the source map.
      // Dark eye lenses keep a small, softer reflection of their own.
      roughnessFactor = mix(max(roughnessFactor, .28),
        clamp(.8 + lpmMottle * .12 + lpmSpots * .06, .8, .96), lpmSkinMask);
    `);
    shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `
      #include <normal_fragment_maps>
      // Fine relief supplements the source wrinkles without changing silhouette.
      vec3 lpmDx = dFdx(-vViewPosition), lpmDy = dFdy(-vViewPosition);
      vec3 lpmR1 = cross(lpmDy, normal), lpmR2 = cross(normal, lpmDx);
      float lpmDet = dot(lpmDx, lpmR1) * faceDirection;
      vec2 lpmGradient = vec2(dFdx(lpmPores), dFdy(lpmPores)) * .00016 * lpmSkinMask;
      if (abs(lpmDet) > 1.e-12) {
        normal = normalize(abs(lpmDet) * normal - sign(lpmDet) * (lpmGradient.x * lpmR1 + lpmGradient.y * lpmR2));
      }
    `);
  };
  material.customProgramCacheKey = () => 'lpm-supplied-matte-skin-v1';
  material.needsUpdate = true;
}
