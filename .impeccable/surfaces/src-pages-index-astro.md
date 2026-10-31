---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/pages/privacidad.astro"]
---

# Otra perspectiva â€” La Plata Marketing

Mode: Persuade. Primary route: `src/pages/index.astro`; supporting route: `src/pages/privacidad.astro`.

Cursor follow-up, 2026-10-31: text selection and editing now use a matching 32px cobalt/white retro I-beam, hotspot (16,16), with native `text` fallback. Arrow/hand behavior, forced-color and touch fallbacks remain. Shared by home and privacy.

Latest ring direction, 2026-10-31: make the contour crazier while preserving its reduced base size and 1100ms slow organic morph. Twelve random anchors, amplified folds and overlapping lobes create deep bays and tendrils along a smooth 192-point contour. Remove the vertical light shaft completely. All illumination hugs the neon ring: cobalt corona, cyan bloom and hot core, clipped outside the fully clear interior. The existing CRT intensity and cadence remain.

Latest tuning, 2026-10-31: ray diameter/radius and glow are halved. Eight broad random radial lobes use continuous cubic B-splines in angle and time, replacing sharp tips and edge jitter. Morphing is 60% slower: 1100ms target intervals instead of 440ms. Increase CRT displacement, static, scanline depth and tracking-band/tear strength without changing its 24fps cadence or temporal speeds. Full clearing, pause, mobile scrolling and accessibility behavior remain.

Latest follow-up, 2026-10-31: extend CRT interference across the full site's background, intensify it, and make the beam destroy all interference inside a randomly changing irregular area. `SiteTransmission` is a fixed full-viewport effect on home and privacy: real live-backdrop displacement plus stronger canvas static, scanlines and tracking bands. A shared 96-point inverse path clears both layers completely. Sixteen random radial anchors morph to fresh targets every 440ms. A cyan rim and shaft are clipped to the outside of the clear area. The effect persists below the hero and has a global pause button synchronized with the hero. Reduced motion, hidden-page suspension, touch scrolling and pointer-events-free overlays remain. This supersedes the earlier canvas-only effect below.

Latest update, 2026-10-31: the user supplied `grey-alien-head-3d-model.zip` at the project root and requested a horror-film CRT distortion that clears around a neon alien-ray cursor. The homepage now uses this Joel Dcosta head (CC BY 4.0, linked footer attribution), preserving its own UVs and four maps in a 100,000-triangle web derivative. A cached 3D frame feeds a 24fps transmission shader with scanlines, tracking tears, RGB separation and noise. A cyan ring and tapered shaft reveal a clear cursor patch. Pause, hidden/offscreen suspension and static accessibility/failure fallbacks remain. This explicitly permits the new cursor-controlled beam and supersedes the earlier homepage rig/idle-rendering description below; the old Grab3D scene remains isolated to `/alien-study/`. See `docs/alien-transmission.md`.

The latest user direction replaces the former predominantly light editorial art direction. The user supplied a blue extraterrestrial face and asked for a distinctive, mysterious, visually arresting blue identity that expresses a different way of understanding client problems. This is an implementation request, with artistic exploration delegated to the agent; no new commercial claims, client approvals, or service scope are implied.

## Concept

**Ideas de otro planeta. Para problemas de acÃ¡.**

The alien is the visual expression of a way of thinking: take distance, ask different questions, understand the whole, and connect communication with technology. The site keeps the concrete offer visible alongside the unfamiliar image. WhatsApp remains a direct human action.

## Composition decision

Three code-rendered compositions use the same original raster portrait and real site content:

- `encounter`: black, full-bleed portrait at right, editorial offer and action in its negative space.
- `blue-poster`: a saturated cobalt field with an elliptical portrait window.
- `close-up`: a stark reading/portrait diptych.

The selected `encounter` composition best combines the requested mystery, immediate visual recognition, and commercial clarity. It is selected by the agent under the user's instruction to find and implement the distinctive direction; it is not a claimed user click on a comparison board. Evidence: `.impeccable/mocks/alien/`.

Direction seed: `b1a8d2c7`; the user's explicitly pinned alien/blue direction governs over unrelated catalog challengers. The provided alien image is a mood reference. The final portrait is a new original generated asset, not a photograph of an actual person or a client.

## Material inventory

| Element | Medium | Reason |
| --- | --- | --- |
| Live alien | Refined CC0 Grab3D rigged head with physical skin detail in Three.js | Real head volume and a retained skeleton support larger turns; conservative shape refinement and PBR detail carry the cobalt identity. |
| Static alien | Original generated PNG source, Astro responsive WebP output | The complete semantic fallback works without motion, JavaScript or WebGL2. |
| Hero type and actions | Semantic HTML and local fonts | Live text stays sharp, accessible, responsive, and available before image load. |
| Eye/aperture motif | Exact CSS/SVG geometry | Extends the brand beyond a single picture without imitating a figure as vectors. |
| Three pillars | Two disciplines plus a full-width union | Makes the third pillar visibly the combination of the first two. |
| Perspective scene | Semantic stages, CSS clipping and SVG geometry | A user-controlled expansion of the visual field explains the complete journey. |
| Portfolio | Existing labeled HTML/CSS concept studies | No client identities, testimonials, or results have been approved. |
| Link preview | Deterministic local HTML/font/portrait render | Carries the same identity into shared links without network dependencies. |

The PNG source and embedded prompt live at `src/assets/lpm-visitor.png` and `src/assets/lpm-visitor.prompt.txt`. The original generated file remains intact outside the workspace. Site consumers use Astro's responsive image pipeline with explicit dimensions, eager loading, and high fetch priority.

## Behavior and continuity

- Black/cobalt opening in both reading appearances; cool blue light surfaces and midnight dark surfaces elsewhere.
- Existing logo preserved. Cobalt and sky remain primary brand colors.
- Existing system preference, light/dark controls, and `lpm-theme` persistence remain.
- A one-time 2400 ms greeting introduces the refined rigged 3D head, pointer/touch exploration and optional secure-context phone tilt. Pause freezes the visible 3D pose. Reduced motion, no JavaScript and graphics failures show the original image; GPU work stops while idle, offscreen or hidden. The scene chunk is deferred until visible with motion allowed. Live copy and actions stay fixed.
- The interactive perspective begins with one piece when motion is allowed. Reduced motion and no JavaScript provide the complete static journey.
- All seven stages stay readable. The animation changes the field of attention, not the availability of service information.
- The user's later old-school cursor request adds native pixel arrow/hand cursors across home and privacy, preserving editing and accessibility affordances. No starfield, arbitrary coordinates, fake telemetry, terminal cosplay, sound, cursor followers or hijacked scrolling.
- Existing capabilities, business problems, method, FAQs, contact endpoints, privacy, and anonymous portfolio constraints remain.

## Engineering detail

Responsive image requests exposed an existing middleware assumption: cached image responses can have immutable headers. The middleware now re-wraps body/status/headers before applying the unchanged security policy. The actual image decode is included in browser regression checks.

The design detector was run once during this replacement. It reports advisory type/color/radius differences against the prior `DESIGN.md`; these are not treated as a reason to restore the discarded palette. The final documenter records intentional new roles from rendered source. Functional contrast, clipping, image delivery, form behavior, and keyboard checks remain separate gates.

## Current Three.js alien: refined licensed rig

The user selected the downloaded free model as the base and requested a better mesh over it. The live head now uses the Grab3D alien under its packaged CC0 1.0 license. Its web derivative contains 41,111 vertices and 74,185 triangles, retains the original skeleton and UVs, and loads the original base-color, normal and roughness/metallic maps from same-origin JPEG files. See `docs/alien-model-resources.md` for provenance and derivative details.

`refine-head-geometry.ts` broadens the upper cranium and adds restrained cheek/nasal relief while preserving topology, rig data and core features. Authored smooth normals are transported by the deformation Jacobian's inverse transpose to preserve UV-seam shading. `detail-skin.ts` layers a seamless cobalt skin material derived from the original artwork, with triplanar base color, correlated roughness and shallow surface relief. Eyes, nose and mouth remain the model's actual anatomy: there is no full-face photo projection or separate front shell. Studio lighting and reflections reveal real surface volume during larger turns. The live model is not pixel-identical to the original portrait.

Head yaw reaches input times .38 radians for fine pointers and .28 for coarse input; the neck adds .045 radians. Head pitch reaches .11 radians, with .02 at the neck, and head roll reaches -.025 times horizontal input. The controller keeps its 110 ms smoothing, one finite 2400 ms greeting, frozen-pose pause, touch scrolling and explicit optional sensor permission. The original image remains the semantic fallback for reduced motion, absent JavaScript and graphics/model/texture failures. Initial reduced motion does not load the scene, GLB or extra skin-detail image. GPU drawing stops when settled, offscreen or document-hidden.

The earlier original-image pixel-match gate applied to the superseded portrait-depth reconstruction. Current validation targets the actual indexed model, preserved rig/UV data, detailed cobalt skin, readable eyes, responsive framing, clean turned anatomy and stable copy/actions. Current iteration test/build results are recorded separately in `docs/alien-validation.md`; no physical-device validation is implied.

