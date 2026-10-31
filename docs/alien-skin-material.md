# Alien skin material — 2026-10-31

Built-in image_gen, reference: src/assets/lpm-visitor.png.
Saved asset: src/assets/lpm-alien-skin-albedo.png.

Prompt: Create a production 3D PBR ALBEDO SKIN TEXTURE TILE derived from the blue alien in the reference. Output one square full-bleed seamless tile of ONLY its organic cobalt-blue skin, viewed orthographically flat. Preserve reference's complex fine pores, tiny leathery wrinkles, soft branching organic striations, subtle dark-blue mottling and blue pigmentation. Remove all directional illumination, cast shadows, specular highlights, cyan rim lights, and large brightness gradients: this is evenly lit diffuse BASE COLOR, medium blue, intended to receive real 3D lighting. No face, eyes, mouth, nose, anatomy silhouettes, borders, labels, panels, text, scales or reptile plates. Fine natural humanoid alien dermis, elegant realistic film creature skin, not rocky/cracked ground. Entire image continuous skin material, smoothly tileable left/right top/bottom. Reference is material/style source, not composition to preserve.

The generated tile is a reference-derived material, not a measured scan or an exact de-lighting of the original pixels. The live shader replaces skin pigment, derives correlated roughness and shallow surface-gradient relief, and uses bind-space triplanar mapping for continuous coverage during skeletal turns. Original UV-mapped eyes, nostrils, mouth and clothing remain masked. No additional face is painted over the geometry. Normal-map strength from the downloaded model is reduced to let the new dermis read.
