# Enfoque: marketing → tecnología → LPM

## Smooth motion and idle playback, 2026-11-16

The latest refinement keeps the same eye sequence and adds a 480ms eased catch-up to scroll progress. Text leaves and enters with opacity and a short vertical movement instead of rectangular article masks. The eye remains transparent CSS geometry with its contents clipped to its own rounded contour; the final logo is the original SVG. No raster rectangle or blurred image background is introduced. The convergence, compression and logo arrival now have gentler easing and more room to settle. These changes supersede the older masking and transition timing below.

A visible six-second countdown advances from marketing to the technology reading stop, then from technology to the method stop. Each automatic transition takes 2.8 seconds through the same native scroll positions and reversible timeline. It stops at the final composition without looping, changing the URL or scrolling into the following section. Local scene links use a 1.6-second transition.

Wheel, touch, pointer input, scroll keys, scrollbar drags and external scroll changes interrupt playback and restart the idle countdown. The visitor can pause or resume with the countdown control. Reading-link focus, a hidden document, an inert main element/menu, or an offscreen stage suspends automatic playback. Reduced motion, forced colors, shared pause and short screens retain the static articles and hide playback controls. The countdown uses the existing GSAP ticker only while needed. Timers, smoothing, navigation, observers, events and component-owned styles are removed on teardown.

Initial fragment arrival waits for document loading and fonts and has its own animation-frame handle, so a resize or font refresh cannot cancel navigation to a reading stop. Section headings omit final periods.

`tests/e2e/approach-playback.spec.ts` covers the complete finite sequence on desktop/mobile, interruption, countdown reset, pause/resume, focus, menu inert state, offscreen suspension and reduced motion. Updated viewport captures are in the ignored `artifacts/approach-refinement/` directory.

Validation: all 16 approach/controls/playback browser tests and the production build passed. Rendered captures at 1440×1000, 390×844, 320×844, 768×900, 1440×620, 390×740 and 320×780 show no horizontal overflow or overlap between reading content and the bottom index. Dark appearance and the reduced-motion articles were also inspected. The wider legacy hero/layout run has eight pre-existing failures against removed CRT/alien elements, former service disclosures/hero links, and the intentionally screen-reader-only approach heading; those fixtures remain outside this refinement.

## Single-screen refinement

The user's subsequent annotated screenshot removes both introductory slogans and all below-stage content from this section. Each discipline now includes its relevant service summary and contact action inside its scene. Repetitive capability and starting-point disclosures are removed. The scene still follows native scroll, but the three local controls animate the scroll position through the same timeline over 1.2 seconds, intercepting their clicks before the television navigation. Wheel/touch interruption cancels that movement. Only the current panel's links are interactive. Reduced motion and no script preserve the normal-flow articles with their integrated information. This supersedes the earlier notes about separate disclosures below the track.

Implemented on 2026-11-16 from the user's approved plan.

The reference is [Codrops — On-Scroll Shape Morph](https://tympanus.net/Development/OnScrollShapeMorph/) ([upstream source](https://github.com/codrops/OnScrollShapeMorph)). LPM's implementation is authored locally using the existing eye geometry, official logo, GSAP and ScrollTrigger; no source, imagery, font or additional dependency from the demo is imported.

## Sequence

- 0–20%: communication eye on the left, existing marketing copy on the right.
- 20–47%: the eye crosses to the right; masked copy reveals technology on the left. The filled Aa contour becomes an outlined eye with the existing code icon.
- 47–65%: technology remains readable.
- 65–84%: marketing's eye returns, copy clears, both contours move toward the centre.
- 84–91%: compression and contraction reveal the unmodified official LPM logo and the existing connection description under “Nuestro método”.
- 91–100%: hold the final composition, then leave the sticky track normally.

The track adds three viewport heights of scroll to a one-viewport sticky stage. Its three native links land at 10%, 55% and 95%, update history and can be used by keyboard. The same absolute timeline poses run in reverse. Content after the track is always in normal flow: service disclosures, capabilities and solution paths, followed by the existing complete system.

The enhanced CSS itself defines the initial marketing pose, including the eye position, contour, symbols and hidden later panels. GSAP may not render its zero-time sets before the stage starts, or after invalidation at exactly zero: the hero handoff must still expose marketing alone. Browser regressions cover that boundary on desktop and mobile, including reverse scroll and resize.

## Ownership and fallback

- `src/components/ServicesSection.astro`: semantic content, decorative eye layers, official `BrandLogo` and service disclosures.
- `src/styles/approach.css`: composition, both themes, static articles and responsive layouts.
- `src/scripts/approach.ts`: timeline, reading stops, measurement, media preferences and teardown.
- `src/scripts/hero-reveal.ts`: delegates scene reading stops and permits the current optical hero without a portrait.
- `src/scripts/text-reveal.ts`: excludes scene-owned text from its independent line entrance.

Animation requires normal motion, ordinary colours and at least 620px desktop height or 740px mobile height. Other cases use all three articles in normal flow. Mobile places the eye above copy and shortens horizontal travel. Logo size is bounded by viewport height; eye lettering follows the contour size. Pause and dynamic preference changes revert the scene. Teardown clears only component-owned inline styles, including after repeated resizing. No animation frame loop is added.

## Validation

`tests/e2e/approach.spec.ts` covers forward and reverse scroll on desktop and mobile, fast seeks, repeated resizing, static restoration, direct hashes, history, keyboard navigation, service disclosures, hero handoff, pause, reduced motion, forced colours and no JavaScript. Layout regressions check document overflow at 320–1920px. Captures for desktop, mobile, tablet, a short desktop, reduced motion and dark appearance are stored locally in the ignored `artifacts/approach/` directory.

Production build and Astro diagnostics passed. The existing unit suite has a pre-existing favicon assertion failure: `public/favicon.svg` in HEAD is white, while `tests/unit/brand-assets.test.ts` expects cobalt as well. The same expectation occurs in the existing contact/brand browser test. These assets and assertions are outside this change and have not been altered.
