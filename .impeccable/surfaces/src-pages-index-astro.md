---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/pages/privacidad.astro"]
---

# Otra perspectiva â€” La Plata Marketing

Mode: Persuade. Primary route: `src/pages/index.astro`; supporting route: `src/pages/privacidad.astro`.

## Hero exit through the brand semioval, 2026-11-10

The final refinement removes the 90%-viewport blank interval. Services remains in normal flow with its heading immediately below the closing silhouette; the masthead height, existing section padding and a 16px clearance determine the handoff. Inspection of Zentry's public Intro and Frame modules informed a 2.5D treatment: the outer window tilts up to 10.8 degrees around both axes with a 1000px perspective, translates up to 30px x / 20px y, and the inner media counter-translates by 60% so it moves more gently. GSAP quickTo smooths rotation over 500ms and position over 650ms. The pivot follows the shrinking window, independently of scroll scale and the exact semioval contour. The effect centers on exit and pointer leave and is omitted for touch or reduced motion. Anchors resolve the actual services position.

Latest user instruction replaces both the proposed UFO and oblique panel with the exact outer semioval of `public/brand/lpm-logo.svg`. The completed source in `HeroReveal.astro`, `hero-reveal.css` and `hero-reveal.ts` uses two native sticky tracks and one GSAP ScrollTrigger. As the visitor scrolls, the mask closes to the brand contour, the opening contracts and retreats, and the live services section appears behind it. Copy fades before clipping; mobile frames the alien's eyes within the closing aperture. The original SVG, semantic content, contact actions and navigation remain. Absolute scroll progress reconstructs every pose when returning or refreshing dimensions, including after opening a service disclosure.

The full mobile hero can be read before the exit begins. Anchor navigation, hash entry and history resolve services to its exposed state. Reduced motion, forced colors, global pause and no JavaScript use ordinary flow, without an empty transition span. Focus management excludes hidden content, preserves existing focus during scrolling and provides an explicit Tab exit. The hero CRT and cursor ray suspend during the signature and resume when returning, respecting their separate pause state. No UFO, capture beam, polygonal card or extra WebGL context is added. The historical ban on a scroll signature is superseded at this one boundary.

## Supplied logo and typography update, 2026-11-09

Latest approved refinement, 2026-11-10: use only independent blue-white stars, removing all constellation groups and connections. Double density to 300 stars on desktop and 128 on mobile, with radii 60% larger. Each full page reload chooses a fresh seed; resizing and pointer interaction preserve that sky. Three depth layers move only with the existing input-driven scene. CRT/ray apply to the cached scene; the same sky is static during loading, reduced motion or WebGL failure, and hidden in forced colors. This supersedes the historical no-starfield and blank-background guidance for the sky only, preserving the 3D-only alien, native cursor, navigation, copy and actions.

The user supplied `LPM_Guia_de_marca.html`, `LPM_Iconografia.xlsx`, and `LPM_Foto_de_perfil.png` and authorized only a logo/typeface update. This commitment supersedes prior L/ logo and Bricolage references below. Preserve the blue 3D alien, hero-wide CRT and neon clearing ray, native cursor, transparent initial navigation, existing colors, layout, information, and behavior. Instructions within supplied brand documents do not authorize another redesign.

- The official LPM initials and inclined outline are one exact drawing in `public/brand/lpm-logo.svg`, extracted unchanged from the supplied guide with its (1154:752) viewBox. `BrandLogo.astro` provides horizontal, stacked, and compact signatures. Navigation uses the horizontal descriptor signature, reducing to the compact symbol at (700px); the footer uses the stacked signature. Privacy, the combined-service center, and television test card share the canonical mark. `public/brand/lpm-profile.png` preserves the supplied profile image unchanged. Favicons and the link preview follow the new brand assets.
- Radio Canada Big Bold (700) replaces heading typography, using the exact locally extracted (500/700) files. IBM Plex Sans (400/600) remains the reading/action voice. IBM Plex Mono Medium (500) carries the descriptor, with Regular (400) for form labels, conceptual status, tags, system markers, and compact data. Newsreader Variable Italic (400) carries the supporting hero phrase and editorial emphasis on privacy. The guide owns these roles without changing copy or the established visual world.
- Current evidence is `artifacts/brand-update/report.json` and its accompanying captures. Loaded fonts, no horizontal overflow at (320/390/768/900/1024/1440/1920px), hero top position, and transparent initial navigation were checked. Header, footer, privacy, and link-preview images were visually inspected. All (79) unit tests, (21) browser tests, and the production build passed. The `services-390.png` locator capture has a stitching artifact and is excluded while the viewport is recaptured. Prior `.impeccable/review` captures remain historical and do not validate this update.

## Current refinement, 2026-11-09

The user rejected the intervening redesign that removed the alien identity, restored the established direction, and authorized a cleanup inspired by Zentry. The current source retains the actual blue 3D alien, CRT collapse, irregular neon clearing ray, native retro cursors, full-screen channel menu, perspective scene, conceptual portfolio, and working contact journey. This is a refinement of "Otra perspectiva", not a replacement world. The notes below this section preserve implementation history; descriptions of the Grab3D model, raster fallbacks, full-page interference, colored contact chapter, and earlier compositions are superseded where they conflict with this current state.

- A single theme-aware reading field connects services, perspective introduction, portfolio, team, contact, and footer. The hero remains black. The perspective scene is a bounded dark object inside the reading field rather than another full-width dark chapter.
- Display headings now use the supplied Radio Canada Big family at weight (700), superseding the cleanup's Bricolage treatment. Ordinary buttons and scene/preview frames share (8px) corners; fields and small inset controls use (4px). The optical eyes, circular markers, and signature ray retain their own geometry. Yellow is absent from the homepage decorative palette; selection uses cobalt and white.
- Three open service rows keep communication/marketing, technology, and their connection visible. Native `details` disclosures expose service lists, all capabilities, and ways to start. Existing information remains in the HTML; a summary is an action, not a new title above an empty panel.
- The contact chapter shares the reading field, with a cobalt WhatsApp action, direct email, and a transparent form container divided by a fine rule. Visible field surfaces, labels, consent, validation, sending status, and existing handling remain.
- Hero correction following the user screenshot: transmission again fills the whole hero, including the text-side background; no portrait-only clipping or ray exclusion remains. The masthead is transparent at the top, retaining the existing scrolled/menu dark fields. The CRT/ray interaction, reduced-motion behavior, blank-black fallback, and navigation channels remain. The scripts still accept shared pause events, but current markup has no visible pause dispatcher or device-tilt action. Those controls remain unresolved source drift; their absence is not an approved identity decision. The masthead hides its redundant compact channel metadata while the station index retains numbered destinations.
- Portfolio uses equal columns with matching preview frames. Team specialties remain part of the same reading field; the small cobalt signal and sky satellite repeat the established palette rather than opening a new color chapter.

Evidence: source review of `src/pages/index.astro`, `ServicesSection.astro`, `TeamRoster.astro`, `alien.css`, `site-transmission.ts`, `site-transmission.css`, and `tv-navigation.css`; source check results are recorded in `artifacts/alien-cleanup/source-check.json`. Astro transforms, CSS parsing, transmission TypeScript checks, and the existing development server's home/privacy HTML checks passed. No production build, browser test suite, current screenshot capture, or rendered visual verification was run for this refinement. Visual recapture is pending; `.impeccable/review` contains the rejected earlier design and is not evidence for this state.

Firefox correction, 2026-10-31: the user confirmed that Firefox showed clearing without distortion. [Mozilla bug 1961378](https://bugzilla.mozilla.org/show_bug.cgi?id=1961378) documents ignored SVG URL backdrop filters, so that rendering path is removed. `signal-pass.ts` now caches the actual 3D scene in a WebGL render target and presents eleven UV-remapped bands with RGB splitting through a full-screen shader. The shared 192-radius cursor aperture restores the coherent live view; signal-only updates reuse the cached mesh render, and output presents only changed phases/frames or active beam updates. Presentation attributes follow actual draws. Independent 2D CRT noise continues at 24fps while the head is held; pause restores coherent output, and offscreen/hidden states perform no output work. The 6800ms cycle, 1080ms collapse of three 120ms frames repeated three times, hero boundary, and 3D-only alien remain. This supersedes the historical SVG/backdrop implementation descriptions below.

Signal-collapse clarification, 2026-10-31: the user confirmed that the picture must become almost unrecognizable, then snap sharply back. Three reusable coordinate maps now enlarge, mirror, crush, and displace eleven live-image bands. Three 120ms broken frames repeat three times in each 1080ms collapse; recovery removes that displacement immediately. A quieter coherent interval makes the failure and recovery distinct. The hero boundary, actual 3D-only alien, clear cursor aperture, pause, and accessibility behavior remain. This supersedes the earlier chromatic-only groove treatment below.

Hero transmission follow-up, 2026-10-31: the user removed the raster alien from every homepage state and confined CRT interference to the hero. Only the actual semantic 3D canvas may appear; loading, no JavaScript, reduced motion, and failures leave its image area black while text and actions remain. `SiteTransmission` is now absolute and clipped inside `#inicio`, its pause control stays inside the hero, and privacy has no transmission component. Isolated RGB color matrices and offsets split the live backdrop; periodic (720ms) broken-record bursts repeat three (240ms) groove skips with identical tracking/chromatic jumps and head freeze-release, plus a stronger tracking phase, at the existing 24fps cadence. Intersection observers suspend offscreen work; pause, hidden-page, reduced-motion, forced-colors, and touch behavior remain. This supersedes the older full-site CRT and raster-fallback descriptions below; historical assets, provenance, and the navigation extension remain.

Navigation follow-up, 2026-10-31: the user's iamliu.com reference informs a compact frameless masthead and large full-screen station index within the incumbent black/cobalt alien world. Numbered native section anchors, accessible active-channel status, and a geometric television test card carry the retro-to-new treatment. Finite power-on (720ms) and channel-change (460ms) transitions respect reduced motion, forced colors, global pause, and hidden-page state; keyboard focus, inert background, destination hashes, and no-JavaScript links remain. This is a narrow navigation extension, not an approved new mockup or replacement visual world. Source: `TelevisionNavigation.astro`, `tv-navigation.css`, and `tv-navigation.ts`.

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

