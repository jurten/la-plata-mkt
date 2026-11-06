# Alien skin material — 2026-10-31

## Current homepage: matte supplied head

`supplied-skin.ts` refines the supplied Joel Dcosta head with nonmetallic skin,
reduced specular/environment intensity and a shader roughness floor of .80–.96.
The authored map previously multiplied down the material's roughness, leaving
near-polished highlights despite the higher scalar setting.

Object-space noise layers add broad blue-gray/teal pigment variation, restrained
violet mottling, irregular freckles and fine pore relief. Coordinates are
normalized to the mesh height, so pigmentation follows turns without UV seams
or new texture downloads. The original color and normal maps remain underneath;
a brightness mask preserves the dark eyes, nostrils and mouth. Dark features keep
a separate .28 minimum roughness. Geometry and interaction remain unchanged.

This material is authored in code; no new generated image is used. Desktop/mobile
and turned-head captures are saved in ignored `artifacts/matte-skin/`.

Validation: production check/build passed with zero errors and the existing two
diagnostic hints/chunk-size advisory. Desktop/mobile captures reported no browser
errors or horizontal overflow. The existing alien suite passed 13 checks on its
first production run; the responsive rendering and idle-drawing checks passed
when rerun in isolation (60-second overall timeout for the four-viewport check).
Initial development-server attempts were blocked by a stale optimized-module
cache, so the browser checks used the built files served locally on port 4335.

## Earlier rigged study: generated albedo

Built-in image_gen, reference: src/assets/lpm-visitor.png.
Saved asset: src/assets/lpm-alien-skin-albedo.png.

Prompt: Create a production 3D PBR ALBEDO SKIN TEXTURE TILE derived from the blue alien in the reference. Output one square full-bleed seamless tile of ONLY its organic cobalt-blue skin, viewed orthographically flat. Preserve reference's complex fine pores, tiny leathery wrinkles, soft branching organic striations, subtle dark-blue mottling and blue pigmentation. Remove all directional illumination, cast shadows, specular highlights, cyan rim lights, and large brightness gradients: this is evenly lit diffuse BASE COLOR, medium blue, intended to receive real 3D lighting. No face, eyes, mouth, nose, anatomy silhouettes, borders, labels, panels, text, scales or reptile plates. Fine natural humanoid alien dermis, elegant realistic film creature skin, not rocky/cracked ground. Entire image continuous skin material, smoothly tileable left/right top/bottom. Reference is material/style source, not composition to preserve.

The generated tile is a reference-derived material, not a measured scan or an exact de-lighting of the original pixels. The live shader replaces skin pigment, derives correlated roughness and shallow surface-gradient relief, and uses bind-space triplanar mapping for continuous coverage during skeletal turns. Original UV-mapped eyes, nostrils, mouth and clothing remain masked. No additional face is painted over the geometry. Normal-map strength from the downloaded model is reduced to let the new dermis read.
