# Free alien model research ? 2026-10-30

The user selected the downloaded free model as the base and requested a better mesh over it. The homepage now uses the refined rigged model; the original detailed portrait remains its semantic static fallback. The noindex `/alien-study/` route allows inspection alongside that original reference.

## Selected base: Grab3D Alien Grey

- Source: https://grab3d.com/models/characters/alien-grey/
- Original download: https://grab3d.com/dl/alien-grey-rigged/alien-grey-rigged.glb
- Primary license: https://grab3d.com/dl/alien-grey/LICENSE.txt
- License: CC0 1.0. The package states that Grab3D waived copyright/related rights in the model, textures and images.
- Origin disclosure: the package describes an AI-assisted Meshy base cleaned/refined/checked in Blender.
- Verified file: 13,114,140-byte GLB; one mesh, one skin, embedded texture maps, actual Head/neck/Spine bones, walk/run clips. The full source is retained only in ignored research artifacts.
- Web derivative: head and upper shoulders only; 74,185 triangles / 41,111 vertices, 3,037,036-byte GLB plus 748,158 bytes of original JPEG textures. Original skeleton retained, unrelated walk/run clips omitted. Textures externalized for same-origin loading under the existing CSP; security policy was not relaxed.
- Public source/license copies: `public/models/alien-grey-LICENSE.txt` and `alien-grey-source.json`. The GLB also records source/license and the trimming operation in its extras.
- Live refinement: `refine-head-geometry.ts` conservatively broadens the upper cranium and adds small cheek/nasal relief in the authored rest coordinates. It retains the existing topology, UV atlas, skin weights, core facial features and neck rather than replacing the model with primitives. Authored smooth normals are transported by the deformation Jacobian's inverse transpose to avoid UV-seam facets.
- Skin treatment: the original base-color, normal and roughness/metallic maps remain. `detail-skin.ts` adds a seamless cobalt skin tile derived from the original portrait, replacing skin pigment and supplying correlated roughness and shallow surface relief through bind-space triplanar mapping. The portrait's eyes or mouth are not painted onto the model, and no separate front shell is used.
- Three.js supplies the cobalt material, physical studio reflections and key/fill/rim lighting. The actual head/neck rig supports larger turns: head yaw is input times .38 radians on fine pointers and .28 on coarse input, plus .045 at the neck. The original portrait remains the complete reduced-motion/no-JavaScript/graphics-failure fallback.
- Study controls retain orbit inspection, pause/reset, reduced-motion and hidden/offscreen loop controls.

The model has real head volume and sides, and its anatomy differs from the original portrait. Its live rendered appearance is not pixel-identical to the artwork. Refinement preserves the cobalt/gaze direction while allowing the substantial movement the user requested. The downloaded source binary is kept unchanged in ignored research artifacts; the smaller web crop and conservative runtime deformation are the derivative used by the site.

## Other verified options

1. **Grey Alien Head ? Joel Dcosta**: https://sketchfab.com/3d-models/grey-alien-head-3d-model-915a6375927e4003a8790d8932655e76 . Public creator/API metadata identifies CC BY 4.0, downloadability, 499,964 triangles / 249,976 vertices. The best alternate head-shape match among inspected candidates. Official download requires a free Sketchfab login/OAuth. No viewer mesh extraction was attempted.
2. **Grey Alien Real Encounter ? Syed Inzamam Haseen**: https://sketchfab.com/3d-models/grey-alien-real-encounter-c30964136d24416daacc27e6cb5fe0ec . Public metadata identifies CC BY 4.0, downloadability, 185,468 triangles, no animations. Official download requires Sketchfab access.
3. **Gray Alien ? downshiftdx**: https://blendswap.com/blend/5758 . Creator lists CC-BY, IK rig, mouth mesh and color/bump/specular maps. Low-poly, dated appearance; a useful rig base rather than a visual-quality replacement. Official download requires sign-in.

Previews and public metadata were inspected; restricted account downloads were not bypassed. Research screenshots and downloaded source files are ignored in `artifacts/alien-resource-research/`.

## Verification status

The initial isolated comparison loaded its real color, normal and roughness/metallic textures without console/page errors. Head quaternion changed during animation and stayed frozen while paused. Reset worked; its 390px layout fit without horizontal overflow and started paused with reduced motion. Those checks preceded the current homepage refinement.

The 2026-10-31 skin-material update passed 79 unit/integration tests, all 14 focused alien browser cases and the production build. Desktop/mobile, turned-head and orbit-back captures reported no console/page errors. The full unrelated browser suite was not rerun for this material-only update. `docs/alien-validation.md` distinguishes those results from the historical portrait-depth suite. The existing CSP remains unchanged: model textures are same-origin files rather than blob URLs. No physical-device sensor or performance certification is claimed.

