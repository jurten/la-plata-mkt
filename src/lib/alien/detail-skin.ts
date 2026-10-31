import {
  Float32BufferAttribute, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace,
  Texture, type BufferGeometry,
} from 'three';

/** Evenly lit skin pigment, mapped in bind space so it follows the real rig.
 * Triplanar blending covers the sides/back without inheriting the portrait's
 * painted lighting or projecting a second set of facial features. */
export function createDetailSkin(image: HTMLImageElement) {
  const texture = new Texture(image);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return {
    apply(geometry: BufferGeometry, material: MeshStandardMaterial) {
      const position = geometry.getAttribute('position');
      const normal = geometry.getAttribute('normal');
      geometry.setAttribute('skinRest', new Float32BufferAttribute(new Float32Array(position.array), 3));
      geometry.setAttribute('skinRestNormal', new Float32BufferAttribute(new Float32Array(normal.array), 3));
      material.onBeforeCompile = (shader) => {
        shader.uniforms.lpmSkinTexture = { value: texture };
        shader.vertexShader = `attribute vec3 skinRest;
          attribute vec3 skinRestNormal;
          varying vec3 vSkinRest;
          varying vec3 vSkinRestNormal;
        ` + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <uv_vertex>', `#include <uv_vertex>
          vSkinRest = skinRest;
          vSkinRestNormal = skinRestNormal;
        `);
        shader.fragmentShader = `uniform sampler2D lpmSkinTexture;
          varying vec3 vSkinRest;
          varying vec3 vSkinRestNormal;
          vec3 alienDermis() {
            vec3 weights = pow(abs(normalize(vSkinRestNormal)), vec3(4.));
            weights /= max(weights.x + weights.y + weights.z, .0001);
            vec3 p = vSkinRest * 8.;
            return texture2D(lpmSkinTexture, p.zy).rgb * weights.x
              + texture2D(lpmSkinTexture, p.xz + vec2(.31,.17)).rgb * weights.y
              + texture2D(lpmSkinTexture, p.xy).rgb * weights.z;
          }
        ` + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
          // The authored map supplies a feature mask: retain the dark lenses,
          // nostrils and mouth. The collar also keeps its original material.
          float lpmSkinMask = smoothstep(.012,.10,max(max(diffuseColor.r,diffuseColor.g),diffuseColor.b))
            * smoothstep(1.10,1.16,vSkinRest.y);
          vec3 lpmDermis = alienDermis();
          float lpmRelief = dot(lpmDermis,vec3(.2126,.7152,.0722)) * 4.;
          diffuseColor.rgb = mix(diffuseColor.rgb,lpmDermis,lpmSkinMask * .96);
        `);
        shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
          roughnessFactor = mix(roughnessFactor,clamp(.52-lpmRelief*.14,.35,.54),lpmSkinMask);
        `);
        shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
          // Surface-gradient bump in view space. The material responds to real
          // scene light; no highlights from the reference are painted onto it.
          vec3 sx = dFdx(-vViewPosition), sy = dFdy(-vViewPosition);
          vec3 r1 = cross(sy,normal), r2 = cross(normal,sx);
          float determinant = dot(sx,r1) * faceDirection;
          vec2 reliefGradient = vec2(dFdx(lpmRelief),dFdy(lpmRelief)) * .00035 * lpmSkinMask;
          if(abs(determinant) > 1.e-12) {
            normal = normalize(abs(determinant)*normal-sign(determinant)*(reliefGradient.x*r1+reliefGradient.y*r2));
          }
        `);
      };
      material.customProgramCacheKey = () => 'lpm-original-dermis-v2';
      material.needsUpdate = true;
    },
    dispose() { texture.dispose(); },
  };
}

