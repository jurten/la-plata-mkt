# Alien iteration — verification record

Updated: 2026-10-31. Local preview target: `http://127.0.0.1:4321/`. This record describes local verification, not a production deployment or field-performance certification.

## Current homepage: supplied head and CRT transmission

The homepage now uses the user's `grey-alien-head-3d-model.zip`, with its own UVs and PBR maps, a 100,000-triangle web derivative, and a cursor-controlled CRT clearing beam. The older Grab3D model remains on `/alien-study/`. See `alien-transmission.md` for the current implementation and checks. The records below describe the preceding iterations.

## Previous implementation: refined licensed rig

The user selected the free downloaded model as the base and requested a better mesh over it. The live scene now uses the Grab3D alien under its packaged CC0 1.0 license. The head/upper-shoulder derivative has 41,111 vertices and 74,185 triangles, retains the actual skeleton and UV atlas, and loads three original PBR maps. `refine-head-geometry.ts` makes conservative cranial/cheek/nasal refinements and transports authored smooth normals through the deformation Jacobian's inverse transpose, retaining smooth shading across UV seams. `detail-skin.ts` adds a seamless cobalt skin material derived from the original portrait, with triplanar pigment, correlated roughness and shallow surface relief.

The face is real anatomy, with no full-photo face projection and no separate front shell. The live model is not pixel-identical to the portrait. The original portrait remains the semantic static fallback for reduced motion, missing JavaScript, unavailable WebGL2 and model/texture/module failures. Strict original-image pixel equivalence belongs to the retired depth reconstruction, not this model.

Head yaw is input times .38 radians for fine pointers and .28 for coarse input; the neck adds .045 radians. Head pitch is input times .11 radians, with .02 at the neck. The existing 2400 ms finite greeting, 110 ms smoothing, frozen-pose pause, idle/offscreen suspension, vertical touch scrolling and explicit optional sensor permission remain.

### Current iteration checks

Current skin-material update verified on 2026-10-31:

- 79 unit/integration tests passed across 16 files.
- 14/14 focused alien Chromium tests passed against the production preview, including actual textures at 390/700/701/1440 px, movement/pause/idle, reduced motion, texture/model/module failures, WebGL/context loss, touch scrolling and explicit sensor permission.
- Astro production check/build and configured-page verification passed: zero errors, two existing diagnostic hints and the existing deferred Three.js chunk-size advisory.
- Final desktop/mobile, turned head and orbit-back screenshots are stored in ignored artifacts/alien-resource-research/skin-final-*.png. The final capture reported no console or page errors.
- The full non-alien browser suite was not rerun for this material-only update. Physical-device performance and sensors remain unverified.

The generated skin asset and full built-in image-generation prompt are recorded in docs/alien-skin-material.md. This is a reference-derived texture, not an exact pixel extraction or measured material scan. Skin color, correlated roughness and shallow surface relief use bind-space triplanar coverage; eyes, nostrils, mouth and clothing retain their authored masks.

Current verification should cover:

- The actual GLB and all three same-origin PBR texture requests, indexed rendering, preserved rig/UV/topology, finite normals and nonzero XYZ volume.
- Real cranial/cheek changes without damaging the eyes, mouth, neck or skin weights; refinement must be idempotent.
- Detailed cobalt skin, dark eye regions, responsive face framing, clean turned anatomy and fixed title/CTA geometry at 390, 700, 701 and 1440 px.
- Movement, finite greeting/no replay, frozen visible pause, stopped idle/offscreen drawing, initial/dynamic reduced motion, unavailable graphics, failed model/detail/module loads and context loss.
- Touch scrolling and explicit sensor permission through simulated browser input. Physical-device behavior remains unverified.

## Historical completed suite: original portrait depth mesh

These results preceded the current licensed-model integration:

| Check | Historical result |
| --- | --- |
| Unit/integration | 76 tests passed across 15 files, including calibrated portrait-depth geometry and source-registration checks. |
| Chromium suite | 53/53 passed against the corrected production preview, including 12 original-portrait mesh and 3 retro-cursor cases. |
| Production build | Astro check/build and verification of both prerendered pages passed. |
| Image delivery | Actual portrait decode passed, with an eager/high-priority responsive image and explicit dimensions. |
| Responsive layout | Home/privacy tested at 320, 390, 560, 700, 768, 900, 1000, 1024, 1440 and 1920 px. |
| Accessibility scans | No axe violations detected in tested home/privacy light/dark states; manual review covered headings, focus and keyboard controls. This is not complete WCAG certification. |
| Form behavior | Local demo submission, mocked live success/failure, validation, normalization, consent and Turnstile reset passed. No production inquiries were sent. |
| Perspective | Keyboard/click exploration, piece/whole selection, announcements, initial/dynamic reduced motion and complete no-JavaScript presentation passed. |
| Product preservation | Existing services, seven journey stages, four method steps, six business problems, eight FAQs, contact destinations and anonymous portfolio restrictions remained. |
| Open Graph | 1200 × 630 PNG, 681024 bytes. Deterministic local generation verified byte for byte. Logo/favicon preserved. |
| Independent finish review | Ship verdict for that revision; the responsive word-boundary finding was resolved. |

That build reported no type errors or warnings and two hints: a pre-existing unused variable in ignored `artifacts/capture-orbit.mjs` and the deprecated `window.orientation` compatibility fallback. The deferred scene chunk was 536396 bytes minified; that is a historical measurement, not the current model's bundle size.

### Superseded portrait-depth reconstruction

After the user rejected the simplified procedural replacement, the original `lpm-visitor.png` was mapped to an indexed surface reconstructed from `lpm-visitor-depth.png`. A calibrated camera preserved source UVs at rest, and bounded skeletal turns avoided inventing hidden anatomy. That revision passed strict original-image comparisons at 390, 700, 701 and 1440 px: mean RGB difference below 5/255 and fewer than 4% of pixels differing by more than 32/255. Geometry tests covered depth, normals, row registration and source projection.

A standalone decoded image fixed GPU texture underallocation caused by responsive DOM density dimensions. Evidence: ignored `artifacts/portrait-restored/desktop-fixed.png`, `turn-confirmed.png` and `mobile-confirmed.png`. The current material-detail image also uses a standalone resource for its actual dimensions, but the previous pixel-match criteria no longer apply.

### Earlier experimental implementations

The earlier procedural Three.js head had actual closed geometry and a rig, but the user rejected its visual quality. Its topology/disposal tests and captures document that discarded revision, not the current licensed model. Before it, a spatial-photo treatment used a generated registered relative-depth map, not a measured scan. Those implementations are superseded.

The event-driven reduced-motion correction was verified during those iterations: the controller caches the initial preference and updates it from the change event. Reading the native query every animation frame interfered with delivery in the site's local preview. This is a documented site interaction, not a general browser compatibility claim.

## Preserved retro cursor

Native transparent 32 × 32 pixel arrow and hand PNG cursors use hotspots (4, 1) and (14, 1), on home and privacy. Fine-pointer hover devices receive the artwork; text selection/editing, disabled/wait states, forced colors and coarse pointers retain appropriate native behavior. Existing browser tests validate PNG signatures/dimensions, requested URLs/hotspots, control semantics and both appearances. There is no JavaScript cursor follower or animation loop.

## Static image optimization

The original generated PNG is approximately 1.66 MB. Previously verified quality-84 responsive WebP output:

| Width | Bytes |
| --- | --- |
| 640 px | 23048 |
| 960 px | 48338 |
| 1280 px | 85462 |
| 1536 px | 122140 |

The current skin layer separately requests a quality-92 1536 px derivative of lpm-alien-skin-albedo.png when motion is allowed. Its built-in image-generation prompt and provenance are recorded in docs/alien-skin-material.md. The artwork is visibly an extraterrestrial concept rather than documentary client evidence; its prompt is stored with the source PNG.

## Resolved site findings

- Cached image responses could carry immutable headers. Middleware now clones response metadata/headers before applying the unchanged security policy.
- The small “Convertir” label on the active cobalt stage received an opaque, high-contrast foreground.
- Responsive font size and padding fixed a long decorative word overflowing the technology artwork at 320 px.
- Explicit spaces around responsive heading breaks preserve natural word boundaries when a break is removed.
- The visitor test now selects the actual named secondary action rather than matching two intentional links to one section.
- An early local demo request completed near its deadline; the unchanged test later passed both in isolation and in the prior full suite. Cold compilation was a possible explanation, not a confirmed diagnosis; its timeout was not increased.

## Evidence and limits

Composition studies: `.impeccable/mocks/alien/`; selected composition: `encounter`, under the user's delegated direction. The record does not claim a separate comparison-board click. Earlier full-page evidence is in ignored `artifacts/redesign/alien-initial/` and `artifacts/redesign/alien-final/`. Current resource/refinement evidence is in ignored `artifacts/alien-resource-research/`.

Earlier full-page captures covered desktop/mobile, dark appearance, the combined pillar, perspective states, portfolio, About, Contact, menu and privacy. Only the external HubSpot loader was stubbed for deterministic captures; production markup remained and was separately tested. The design detector ran once; the updated design system records intentional palette/type/geometry changes.

No physical Safari/iOS or Android-device verification, real-user Core Web Vitals measurement, or new client-publication approval is claimed. The portfolio remains explicitly conceptual.

