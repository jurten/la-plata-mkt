# Supplied alien and CRT transmission

Updated 2026-10-31.

## Current: full-site interference and random clearing

The follow-up request extends the effect across the whole site's background and makes it more pronounced. `SiteTransmission.astro` now appears on home and privacy, with a fixed viewport layer that continues through all sections. A native SVG displacement filter processes the live page backdrop, including the actual alien canvas, with drifting horizontal turbulence. This is real backdrop deformation, not an image of the page. A 2D canvas supplies denser phosphor noise, dark scanlines, tracking tears and a broad rolling band. The previous alien-only CRT shader has been removed so the effect is consistent across the entire page.

Latest contour update: keep the reduced base radius and slow 1100ms morphing, but use twelve random radial anchors with a wider range, amplified folds and overlapping five-/nine-lobe waves. Smooth temporal/angular cubic B-splines and a bounded tanh envelope produce deep bays and stretched tendrils without corners or rapid jitter. The contour is sampled at 192 points. Remove the top-to-cursor shaft entirely: all light now follows the boundary as a broad cobalt corona, cyan bloom and hot neon core. Every light pass is clipped to the exterior of the clearing, preserving an untouched center. The same inverse path still clears both backdrop displacement and static. Mobile touch and scrolling remain unchanged.

The latest ring-only update passed the production build and four focused Chromium checks covering clear core pixels, changing contour/full-viewport coverage, pause/navigation, privacy/reduced motion and mobile touch/scroll. Desktop/mobile captures show the more extreme ring, surrounding neon glow and no vertical shaft, with zero page errors or horizontal overflow.

CRT intensity increases through displacement (desktop base 12 to 23, coarse 7 to 14), denser static, deeper scanlines, stronger rolling-band contrast and thicker tears. Temporal cadence remains unchanged: 24fps, rolling-band travel 54px/s, warp modulation 2.3rad/s and drift .31rad/s. This increases strength without accelerating the CRT animation.

The previous radius/speed tuning passed the production build and six focused Chromium checks: clean core pixels, changing contour/full-viewport coverage, synchronized pause, idle head rendering, privacy/reduced motion and mobile touch/scroll. Desktop/mobile captures show the smaller smooth ray and heavier interference with zero page errors or horizontal overflow. The broader 18-case run and 79 unit tests below preceded this parameter/contour update.

The full-page interference renders at 24fps with canvas DPR capped at 1.25 and 1.4 million physical pixels. The original head now draws only while its pose changes. A fixed Spanish pause control is available after leaving the hero and synchronizes with the hero's control. Pausing removes interference and freezes the alien. Hidden pages, pagehide, reduced motion and forced colors stop or hide the effect. If backdrop URL filtering is unavailable, the independently drawn noise/scanline/clearing layer remains available. Native SVG backdrop displacement was verified in Chromium before implementation.

The initial full-site implementation passed its production build, all 79 unit tests and all 18 focused Chromium checks. Desktop/mobile captures show the effect above and below the hero, with zero page errors and no horizontal overflow, under `artifacts/transmission-global/`. The new full-page browser checks confirm fixed viewport coverage after scrolling, continually changing contours, pixel-identical core clearing compared with disabling the effect, working navigation through the overlay, the privacy route, synchronized global pause, reduced motion, and touch clearing without trapping mobile scroll. The 15 alien regression checks also pass after moving the interference out of its renderer. Other browsers and physical-device GPU performance remain unverified.

## Previous: alien-only CRT shader

The homepage uses `source/Alien.glb` from the root-level `grey-alien-head-3d-model.zip`. Its asset copyright is `joel_shanky`; the previously researched source is Joel Dcosta's Grey Alien Head on Sketchfab, CC BY 4.0. Linked creator/license attribution is visible below the site footer and recorded in `public/models/supplied-alien-CREDITS.txt` and the GLB extras. The source archive remains untouched.

`scripts/prepare-supplied-alien.mjs` reads the extracted source in `artifacts/alien-source`, simplifies the original 499,964 triangles to 100,000 (67,070 vertices), and externalizes its four maps as same-origin JPEGs. The mesh is 3,348,436 bytes. UVs and authored normals remain. The compacting routine rewrites triangle indices in place; only vertex attributes receive its remap afterward. This avoids double-remapping and corrupting the head.

`supplied-alien.ts` centers and normalizes the actual supplied mesh. It has no bones, so exploration rotates the complete head. Its real material maps remain under a cobalt tint and physical studio lights. The previous rig and detail skin remain available to the historical model study route.

The previous `crt-transmission.ts` applied scanlines, restrained film noise, barrel drift, RGB separation and narrow tracking tears within the alien canvas. It was replaced by the full-page treatment above.

The transmission renders at 24fps while visible. The expensive head render is cached until its pose or viewport changes. Pause freezes the pose and transmission, removing the beam. Hidden/offscreen/paused states stop the animation; reduced motion and graphics/module/model/map failures show the existing semantic static portrait. Initial reduced motion does not fetch the scene, model or maps. Context restoration can initialize a fresh scene. Existing pointer, optional phone tilt and one-time greeting behavior remain.

The requested Peaches reference could not be loaded through either the web reader or browser host during this session. The effect follows the user's described CRT and alien-ray interaction.

Validation: production Astro check/build passed (zero errors; existing diagnostic hints and Three.js chunk advisory), and all 79 unit/integration tests passed. Desktop and mobile production captures loaded the new GLB and all four maps with zero browser errors and no horizontal overflow. Artifacts are under `artifacts/transmission/`.

All 15 focused Chromium regression cases passed across the main run and targeted confirmation. The main run passed 13 cases and caught two missing-map fallback failures: GLTFLoader can resolve with null texture maps. Explicit material-map validation and disposal now recover the static image. Both failure cases and the cursor pixel check passed on the final build. The cursor check measures temporal pixel variation inside/outside the clearing region, demonstrating a stable clear patch and live interference outside it. Other coverage includes responsive eyes/textures at 390/700/701/1440px, one-time greeting, fixed text/actions, pause/resume, stopped offscreen drawing, initial/dynamic reduced motion, module/model/context failure, touch scrolling and explicit sensor permission. The full unrelated browser suite and physical-device GPU performance were not tested.

The production-only verification preview is served at `http://127.0.0.1:4330/` because an existing server at 4321 retained stale HTML. Verification used the built assets under the existing same-origin image policy, without enabling blob textures or weakening production security headers. The shipped model and maps total 3,642,910 bytes, compared with the original 22,192,100-byte GLB.
