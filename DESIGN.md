---
name: La Plata Marketing
description: An extraterrestrial perspective, cobalt presence, and a clear view of the complete client system.
colors:
  bg: '#eef2ff'
  surface: '#f8faff'
  ink: '#0b1430'
  muted: '#4f5e7d'
  blue: '#1536f1'
  blue-text: '#1536f1'
  blue-strong: '#0d2ccf'
  brand-cobalt: '#1536f1'
  brand-cobalt-hover: '#284bff'
  sky: '#b7d7ee'
  night: '#020307'
  on-night: '#eef2ff'
  fixed-ink: '#eef3ff'
  fixed-muted: '#b5c3df'
  nav-surface: '#0b1123'
  system-node: '#0c142b'
  aperture: '#102355'
  error: '#a62828'
  dark-bg: '#060917'
  dark-surface: '#0c142a'
  dark-ink: '#edf2ff'
  dark-muted: '#a8b6d0'
  dark-blue: '#254bff'
  dark-blue-text: '#91a5ff'
  dark-blue-strong: '#4563ed'
  dark-on-night: '#edf2ff'
  dark-error: '#ff8a82'
typography:
  display:
    fontFamily: Radio Canada Big, Arial, sans-serif
    fontSize: clamp(68px, 7.2vw, 96px)
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: -0.035em
  headline:
    fontFamily: Radio Canada Big, Arial, sans-serif
    fontSize: clamp(40px, 4.6vw, 64px)
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: -0.035em
  title:
    fontFamily: Radio Canada Big, Arial, sans-serif
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.03em
  pillar-title:
    fontFamily: Radio Canada Big, Arial, sans-serif
    fontSize: clamp(30px, 3vw, 44px)
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.03em
  title-small:
    fontFamily: Radio Canada Big, Arial, sans-serif
    fontSize: 23px
    fontWeight: 700
    lineHeight: 1.55
    letterSpacing: -0.02em
  body:
    fontFamily: IBM Plex Sans, Arial, sans-serif
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.55
  body-support:
    fontFamily: IBM Plex Sans, Arial, sans-serif
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.55
  body-compact:
    fontFamily: IBM Plex Sans, Arial, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  input:
    fontFamily: IBM Plex Sans, Arial, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  navigation:
    fontFamily: IBM Plex Sans, Arial, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  navigation-action:
    fontFamily: IBM Plex Sans, Arial, sans-serif
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.55
  button:
    fontFamily: IBM Plex Sans, Arial, sans-serif
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.35
  label:
    fontFamily: IBM Plex Mono, monospace
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.55
  metadata:
    fontFamily: IBM Plex Sans, Arial, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.55
  data:
    fontFamily: IBM Plex Mono, monospace
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.55
  brand-descriptor:
    fontFamily: IBM Plex Mono, monospace
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0
  editorial-emphasis:
    fontFamily: Newsreader Variable, Georgia, serif
    fontSize: clamp(24px, 2.3vw, 32px)
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: -0.025em
rounded:
  canvas: 4px
  field: 4px
  control: 8px
  small: 8px
  surface: 8px
  circle: 50%
spacing:
  xs: 8px
  sm: 12px
  md: 16px
  control: 20px
  lg: 24px
  copy: 28px
  xl: 32px
  surface: 36px
  wide: 40px
  group: 48px
  chapter-head: 56px
  major: 64px
  chapter: 80px
  dark-chapter: 88px
  section: clamp(88px, 9vw, 144px)
components:
  button-primary:
    backgroundColor: '{colors.blue}'
    textColor: '#fff'
    typography: '{typography.button}'
    rounded: '{rounded.small}'
    padding: 14px 22px
  button-primary-hover:
    backgroundColor: '{colors.blue-strong}'
  button-outline:
    backgroundColor: transparent
    textColor: '{colors.ink}'
    typography: '{typography.button}'
    rounded: '{rounded.small}'
    padding: 14px 22px
  button-outline-hover:
    backgroundColor: '{colors.surface}'
  button-text:
    backgroundColor: transparent
    textColor: '{colors.ink}'
    typography: '{typography.button}'
    padding: 14px 0
  button-text-hover:
    textColor: '{colors.blue-text}'
  nav-cta:
    backgroundColor: '{colors.blue}'
    textColor: '#fff'
    typography: '{typography.navigation-action}'
    rounded: '{rounded.small}'
    padding: 10px 16px
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    typography: '{typography.input}'
    rounded: '{rounded.field}'
    padding: 12px 14px
  concept-label:
    backgroundColor: transparent
    textColor: '{colors.blue-text}'
    typography: '{typography.data}'
    padding: 0
  form-surface:
    backgroundColor: transparent
    textColor: '{colors.ink}'
    padding: 32px 0 0
  perspective-choice:
    backgroundColor: transparent
    textColor: '#c2ceea'
    typography: '{typography.navigation}'
    rounded: '{rounded.field}'
    padding: 10px 18px
  perspective-choice-selected:
    backgroundColor: '{colors.brand-cobalt}'
    textColor: '#fff'
---

# Design System: La Plata Marketing

## Generative hero sky, 2026-11-10

The latest user refinement requires only independent stars, with no constellation groups or connecting lines. Density is doubled to 300 blue-white stars on desktop and 128 on mobile; star radii are 60% larger. Each full page reload generates a fresh sky. This supersedes the previous prohibition on starfields and the blank-black background fallback, while the alien itself remains 3D-only. A page-scoped random seed preserves the arrangement through resizing and delayed 3D loading; no stored seed or HTTP-cache invalidation is involved. Three subtle depth layers respond to pointer input through the existing renderer. The cached scene passes through the existing CRT and clear ray. A static 2D version of the same sky remains during loading, reduced motion and graphics failures, and is hidden in forced colors. No new continuous animation loop or dependency is added.

## Overview

**Creative North Star: "Otra perspectiva"**

An unfamiliar blue gaze expresses a different way of understanding real client problems. The opening uses the user's supplied Joel Dcosta alien head with physically lit cobalt skin, a hero-scoped CRT transmission, and the irregular cyan clearing ray. Black brand fields, optical geometry, and cool reading surfaces carry the identity. Show only the actual 3D canvas when available; its image area remains black in loading, no-JavaScript, reduced-motion, and failure states. Use the supplied official LPM logo, preserving the native retro cursor and television channel menu.

The alien supplies mystery; clear Spanish copy, visible service summaries, and direct contact supply confidence. Light and dark appearances share a continuous reading field after the opening. Dark interactive scenes sit inside that field as objects. Radio Canada Big headings, open service rows, shared preview frames, and restrained controls organize the content without replacing the alien world. The 2026-11-09 source refinement merges the user's approved cleanup after the identity-removing redesign was rejected; Zentry informs hierarchy and restraint within the established world.

The supplied-brand update was checked against current captures in `artifacts/brand-update/` and `report.json`: fonts loaded, no horizontal overflow at widths (320/390/768/900/1024/1440/1920px), the hero begins at the top, and initial navigation stays transparent. The header, footer, privacy route, and link preview were visually inspected. All (79) unit tests, (21) browser tests, and the production build passed. The sidecar remains a partial source refresh, not a new computed-style extraction; historical captures of the rejected design do not verify this update.

**Key Characteristics:**

- The supplied cobalt 3D extraterrestrial, hero-scoped CRT collapse, and cursor-controlled neon clearing ray; no raster alien fallback on the homepage.
- Continuous cold-light and midnight reading fields around fixed black brand objects.
- Radio Canada Big messages at weight (700), quiet Plex explanations, mono labels, editorial italic emphasis, and native disclosures for detail.
- Eye-shaped apertures, three open service rows, consistent preview frames, and a clear contact path.
- Native retro cursors and a numbered station index preserve the established retro identity.
- Purposeful interactions with readable live content, direct actions, and accessible static behavior.

## Colors

Cold blue neutrals support reading; cobalt establishes presence and sky opens the optical forms.

### Primary

- **Cobalt action** (`blue`, `blue-strong`): theme-aware filled controls and hover. **Cobalt text** (`blue-text`) is independently lightened for dark-mode links.
- **Encounter cobalt** (`brand-cobalt`, `brand-cobalt-hover`): fixed artwork, opening action, perspective selection, team signal, and floating contact. Contact shares the active reading field and uses a theme-aware cobalt WhatsApp action.

### Secondary

- **Optical sky** (`sky`): fixed geometry, emphasis on dark brand fields, and concept artwork. The declared theme-specific sky override is not consumed by this artwork.

### Tertiary

- **Error red** (`error`, `dark-error`): validation and failed-submission feedback.

### Neutral

- **Cold reading field** (`bg`), **blue-white surface** (`surface`), **midnight ink** (`ink`), and **quiet slate** (`muted`) form the light appearance. Their `dark-` counterparts form the midnight appearance.
- **Encounter black** (`night`) and **on-night** are the dark editorial field and reading roles; the latter has a dark counterpart.
- **Fixed pale ink** (`fixed-ink`) and **fixed slate** (`fixed-muted`) support the home header, union, and perspective scene. Navigation, node, and aperture colors are distinct dark tonal layers.
- Components consume active CSS roles. Fixed brand artwork remains independent. Unused pulse and signal declarations are not normative visual roles. Homepage selection uses cobalt with white text; yellow is not a decorative accent in the current refinement.

### Named Rules

**The Fixed Encounter Rule.** Keep the portrait opening and bounded perspective scene dark in both appearances. Theme changes apply to the continuous reading field and active control roles.

**The Two Blues Rule.** Use blue for theme-aware filled actions and blue-text for theme-aware links. Fixed brand artwork uses brand-cobalt and sky, independent of dark-theme overrides.

## Typography

The supplied November 2026 brand guide now owns logo and typography. Radio Canada Big Bold (700) is the heading voice; its exact embedded 500/700 font files are served locally. IBM Plex Sans Regular/Semibold remains the reading voice. IBM Plex Mono Medium (500) sets the full brand descriptor, with Regular/Medium for labels and data. Newsreader Variable Italic (400) supplies editorial emphasis, including the supporting hero phrase.

The official LPM initials and inclined contour are one inseparable vector in `public/brand/lpm-logo.svg`, extracted unchanged from the supplied HTML guide. `BrandLogo.astro` supplies horizontal, stacked and compact signatures. The supplied profile PNG remains unchanged as `public/brand/lpm-profile.png`. Previous L/ marks are superseded; the alien, continuous CRT, transparent initial navigation and existing colors remain.

**Display Font:** Radio Canada Big, with Arial and sans-serif fallbacks.

**Body Font:** IBM Plex Sans, with Arial and sans-serif fallbacks.

**Label/Mono Font:** IBM Plex Mono, with monospace fallback. The full descriptor uses Medium (500); form labels, conceptual status, service tags, and system markers use Regular (400).

**Editorial Font:** Newsreader Variable Italic, with Georgia and serif fallbacks. The frontmatter editorial-emphasis role is always italic in the source.

**Character:** Broad, tightly tracked display forms deliver the idea; practical sentence-case copy explains it. Balanced headline wrapping and intentional line breaks preserve complete words.

### Hierarchy

- **Display:** the frontmatter role describes the desktop alien headline. At and below (1100px), it uses `clamp(60px, 7.3vw, 80px)`; at (700px), `clamp(46px, 11.8vw, 72px)`; and at (500px), `clamp(42px, 11.8vw, 60px)`. The legal display uses weight (700) and a fluid (48-80px) role.
- **Editorial emphasis:** the supporting hero phrase uses the italic editorial-emphasis role, stepping to (26px) and (24px) at the existing breakpoints. Emphasized phrases on the privacy route also use Newsreader Italic (400).
- **Headline:** home section messages use the frontmatter role. Contact uses a fluid (48-76px) range. Team headings use weight (700) and fluid (36-52px) sizing.
- **Title:** portfolio names use title. Service headings use pillar-title at weight (700), stepping to (30px) at (700px) and (32px) at (500px). Method, capability, and smaller headings keep the established contextual (23-26px) family.
- **Body:** default reading text uses body; project, method, FAQ, and capability explanations use body-support; compact explanations and status use body-compact. Hero copy uses (17px), then (16px) at (1000px). Reading measures include hero (36ch desktop), service summaries (52ch), concepts (50ch), and legal introduction (65ch).
- **Controls:** primary actions retain the button role, and form values use input. Masthead text links are regular Plex Sans at (14px); action links retain their stronger interface weight. Native service summaries use (14px) and section disclosures use (16px), with minimum targets (44px). Form labels use label; publication status uses mono data while consent remains sans metadata. Compact spatial controls retain their regular (12px) role and line-height (1.4).
- **Small print:** informational captions use regular Plex (13px). Decorative concept canvases contain miniature artwork lettering; the footer retains its compact legal line (11px). These are not defaults for new body copy or controls.

### Named Rules

**The Expressive Head, Quiet Body Rule.** Use Radio Canada Big for headings, Plex Sans for reading and actions, Plex Mono for the descriptor and labels/data, and Newsreader Italic for editorial emphasis. Keep complete word boundaries at narrow widths.

## Layout

Home compositions use the full viewport width with fluid gutters `clamp(24px, 4.2vw, 80px)`. The television masthead separately uses (32px) gutters at (1100px) and (20px) at (700px). Reading sections retain the fluid root gutter in the current cascade. Visual grids remain uncapped; individual copy blocks keep readable measures. Legal reading content alone caps at (1056px). Minimum page width is (320px); anchor scrolling reserves (120px) above targets.

One continuous theme-aware reading field connects services, the system introduction, portfolio, About/team, contact, and footer. Fine dividers organize content. Services form three open horizontal rows, each pairing a small optical mark with summary and native disclosure. The perspective scene is a bounded black object within the field. Portfolio uses equal columns with matching frames; contact pairs direct actions with the form.

Reading chapters use the frontmatter section spacing. System and contact introduce their content with a fine rule and (64px) inner top space, reducing to (48px) at (700px). Service headings leave (56px), then (36px). Service rows use (36px) vertical padding, then (28px). These are observed contextual relationships, not a uniform grid imposed on every component.

At (1000px), masthead links yield to the menu, the seven-stage system becomes vertical, method/capabilities use two columns, and contact becomes one outer column. At (760px), the team loses its sticky desktop pairing and each specialty shows its explanation in flow. At (700px), editorial pairs and portfolio stack; the portrait follows opening copy and actions. Service rows retain an optical-mark column until (500px), when their marks sit above the copy and the primary hero action fills its width. At (430px), form fields and method steps become one column. The (1100px) and (1600px) rules tune hero/service density.

## Elevation & Depth

Tonal layers, physically lit head geometry, and optical forms carry depth. Open reading content, service rows, and the transparent form container remain flat. The television masthead is frameless with no shadow or blur; its scrolled field and full-screen index remain dark. The current homepage markup exposes no spatial-portrait control surface; earlier glass-control treatments are historical rather than primitives for new screens.

### Shadow Vocabulary

- **Floating contact:** `0 6px 22px rgba(17,19,24,.2)` separates the persistent circular action.
- Legacy shared navigation elevation remains in the base stylesheet but is not the current home masthead treatment.


## Shapes

The signature eye uses unequal elliptical corners (78% 18% 78% 18%) and slight rotation. The three service marks express communication, technology, and their union within this same optical vocabulary. An elliptical clipping field expands the perspective scene. The irregular clearing ray remains an authored signature, not a shape for ordinary interface containers.

The common home radius is gently squared (8px): buttons, preview frames, system nodes, and the perspective container share it. Inputs, inset perspective choices, concept canvases, and the small union mark use compact (4px) corners. Open rows, the masthead, publication-status text, and the transparent form container are unboxed. Stage markers and floating contact remain circular.

Dividers mix active ink at (16%) with transparency; field borders strengthen that share to (35%). Fixed-dark objects use pale blue hairlines. Inline SVG icons normally use (21px), stroke (1.7), and rounded ends/joins; service disclosure icons use (18px). Theme icons use (20px) and stroke (1.6). Logo lettering and decorative typography remain identity/artwork.

## Components

### Brand Signatures

The LPM initials and inclined outline are one exact vector drawing, never typeset lettering or a separately redrawn contour. Shared signatures consume `public/brand/lpm-logo.svg`; preserve its (1154:752) viewBox and aspect ratio. Horizontal navigation pairs a (96px) symbol with the Medium mono descriptor, separated by a fine vertical rule. At and below (700px), navigation hides the descriptor for the compact signature. The footer uses the stacked signature with a (170px) symbol and the full descriptor beneath. The combined-service center and television test card use the same canonical symbol. The supplied profile PNG is retained unchanged for image-based brand uses; favicon derivatives and the link preview follow these current assets and fonts.

### Buttons

Confident, readable actions with restrained color changes.

- Primary and outline variants have minimum height (52px), padding (14px 22px), and internal gap (24px). Home buttons do not lift on hover; primary fill darkens and outline hover introduces the active surface. The supporting privacy route retains its separate base hover treatment.
- Text actions remove horizontal padding, use an icon gap (14px), and hover to blue-text. The opening uses fixed pale text with sky hover.
- Navigation actions keep minimum targets (44px). Shared keyboard focus remains visible; scene and station controls use their specific sky indicators.
- Contact uses an active cobalt WhatsApp action with white text, direct email, and a labeled form on the same reading field.

### Native Disclosures

Service summaries reveal the existing service lists with native `details`/`summary`, so they remain usable without JavaScript. A blue-text summary and an (18px) plus icon identify the action; opening rotates the icon (45deg) over (180ms). All-capability and starting-path disclosures use full-width, divided rows with minimum height (76px). Preserve content in the HTML and native keyboard behavior.

### Chips

Publication status is unboxed blue-text metadata in the current portfolio. Keep the conceptual status visible and noninteractive; it is not an action or decorative badge.

### Cards / Containers

Ordinary service and team text remains on the continuous reading field. Portfolio frames use the active surface, a fine border, and common radius with (32px) padding, reducing to (24px) at (700px) and (18px) at (500px). The perspective scene is a bounded black container with (32px) padding, then (24px 20px) on mobile. The form container is transparent and square, starting after a fine top rule with (32px) inner top space, then (24px) at (700px); it has no shadow.

### Inputs / Fields

Visible labels sit above fields with a gap (8px). Fields use the active surface, active ink, compact field radius, stronger fine border, and the input type role. Focus changes the border to blue-text and preserves the shared indicator. Textareas resize vertically with minimum height (128px). Keep consent, validation, status, and sending states semantic and visible; errors use the error role.

### Navigation

The home navigation now uses a compact, frameless television masthead, superseding the earlier home-island layout and glass treatment. It sits at the top edge, spans the viewport, and overlays the hero transparently with the cobalt logo and fixed pale links in either appearance. The existing dark field applies after scrolling or while the station menu is open. Redundant compact channel metadata is hidden in the masthead; the full-screen index keeps its numbered destinations. Its inner layout is uncapped and follows the shared fluid page gutters, with minimum height (92px); below (700px), height becomes (80px) with (20px) gutters. Links and controls retain minimum targets (44px). Main links use regular Plex Sans; station-index channel numbers and television labels use Plex Mono. Hover and active links gain a fine underline. The masthead retains the shared dark focus outline and pale halo; the station index uses a sky outline (2px), offset (5px).

The menu opens a full-screen dark station index with large Radio Canada Big section links, numbered channels, direct WhatsApp access, and an optional power-on replay. A geometric (4:3) television test card previews the focused or hovered channel beside the links; it is decorative and hides below (700px). At (1000px), the masthead's inline links yield to the menu control. Opening focuses the active channel, keeps background content inert, and contains keyboard focus in the masthead and index. Escape and the menu control close it and restore control focus; choosing a destination closes it and focuses the destination heading for menu or keyboard navigation.

Channels remain real section anchors in the continuous page. Active links expose `aria-current="location"`, and a polite status announces a selected destination. Enhancement preserves destination hashes and browser history; without JavaScript, the regular links remain visible in flow. System preference sets the initial appearance; explicit light/dark choices persist and apply before content paint.

The user-requested retro-to-new treatment adds finite television transitions: power-on opens from a central point through a horizontal line over (720ms), and section changes use a tuning sweep with channel identification over (460ms). These are navigation feedback, not a new global visual world or a scroll-driven sequence. Reduced motion, forced colors, global pause, and hidden-page state bypass or cancel the effect while completing the requested destination. Direct hash arrivals skip the opening, and the replay control is disabled when motion is unavailable.

### Perspective Scene

The complete semantic journey stays readable in both states. Segmented controls select "Una pieza" or "El sistema" with pressed state; a text action toggles the same choice and a live caption explains it. The whole view is the server-rendered default. With motion allowed, JavaScript starts at one piece, then enables the scene. There is no autoplay loop or scroll takeover.

Clipping and orbit transform transition over (1000ms) with `cubic-bezier(.16, 1, .3, 1)`; orbit opacity and node color use (600ms). Desktop attention widens horizontally; the vertical mobile journey changes the aperture direction and removes the orbit. No JavaScript and reduced motion show the complete static journey. A change to reduced motion restores the whole view. The 3D alien below is the additional user-requested motion treatment.

### 3D Alien

Use `grey-alien-head-3d-model.zip` supplied at the project root as the homepage's 3D base. Joel Dcosta's Grey Alien Head is CC BY 4.0; retain the visible linked credit and `public/models/supplied-alien-CREDITS.txt`. The web derivative has 67,070 vertices and 100,000 triangles and preserves its own UVs, normals and four PBR maps. The supplied head has no skeleton: rotate its centered volume instead of assuming head/neck bones. The user's later direction removes the raster alien from every homepage state. Retain original portrait assets as historical/source material, without rendering them as a fallback. The canvas has a semantic image role and description when the 3D scene is available; it remains hidden from assistive technology otherwise.

`supplied-alien.ts` loads the new mesh with its original base color, normal, metallic/roughness and specular maps. A cobalt tint and physical studio lighting carry the site identity. The previous Grab3D rig, refinement and skin modules remain isolated to the historical `/alien-study/` route.

`alien-scene.ts` uses a perspective camera, ACES tone mapping, studio reflections, and hemisphere/key/fill/rim lights. Yaw is horizontal input times (.32rad fine, .23rad coarse), pitch is vertical input times (.10rad), and roll is negative horizontal input times (.018rad). Camera travel is (.018 world units horizontal) and (.012 vertical). Input smoothing remains (110ms).

One finite (2400ms) greeting runs on first visible initialization and is interrupted by input. It does not replay on resize or re-entry.

The latest user direction confines `SiteTransmission` to the `#inicio` hero and requires full signal collapse, briefly making the alien unrecognizable. Its absolute layer fills the whole hero, including the text-side background, with no portrait-only clipping. The transparent top masthead lets that continuous scene show through. It does not continue beyond the hero into reading sections or the privacy route. This restores the user-confirmed full-width effect after the rejected portrait-only crop. At 24fps, a quieter coherent picture gives way to a (1080ms) failure in each (6800ms) cycle. Three (120ms) broken frames repeat three times, then the coherent view returns in one frame. The cycle also has a (600ms) tracking phase.

`signal-pass.ts` caches the actual 3D scene in a `WebGLRenderTarget` and presents it through a full-screen `ShaderMaterial`. Eleven explicit UV bands enlarge, mirror, compress, and relocate distant parts of that rendered frame, with RGB splitting and tracking jumps. The former SVG backdrop-filter path is removed: Firefox can ignore SVG URL backdrop filters, as documented in [Mozilla bug 1961378](https://bugzilla.mozilla.org/show_bug.cgi?id=1961378). The target uses half-float color when supported, otherwise unsigned-byte color; tone mapping and output color conversion happen once in the final shader.

Signal-only changes reuse the cached scene without redrawing the 3D mesh. The output pass presents changed phases/frames and active beam updates, while unchanged settled output stays idle. `site-transmission.ts` sends `lpm:signal-frame` to the portrait controller; presentation state attributes update only after the renderer draws. The separate 2D CRT noise, scanlines, and tracking bands continue at 24fps even while the head pose is held. The cursor aperture restores the coherent live 3D view and motion; pause also restores coherent output before holding the pose. Offscreen and hidden states do no output work.

A cyan ion rim surrounds a fully clear irregular hole. The ray keeps half the original base diameter. Twelve random radial anchors, amplified folds and overlapping lobes produce a more extreme organic contour using cubic B-splines in angle and time. All light follows the neon ring as a cobalt/cyan corona; there is no vertical shaft. Target intervals are 1100ms instead of 440ms, reducing morph speed by 60%, sampled into a 192-point contour. The same 192 radii map the hero-space aperture into the portrait shader and remove the 2D static; all beam light stays outside the hole, with the hero's CSS clipping containing both layers. The beam's core is pixel-identical to disabling the effect.

The scripts retain a shared pause-event listener that removes interference and freezes the head. The current markup has no visible pause control or dispatcher; earlier descriptions of that control are historical and this source drift is not canonized as an approved removal. Intersection observers suspend the transmission and head when their regions leave view; the head also stops drawing when settled. Hidden pages suspend both, and reduced motion stops animation. Forced colors hides the CRT layer. Reduced motion, absent JavaScript, loading, unavailable graphics, and failed alien assets leave a blank black image area with live text and actions intact; never substitute a raster alien. Initial reduced motion requests no 3D scene, model, maps, or WebGL context.

Desktop places the head to the right of live copy; mobile centers it below the opening actions. Validate responsive framing, detailed cobalt skin, readable dark eyes, clean anatomy during turns, and stable text/actions. Original-image pixel equivalence is a retired depth-reconstruction check. Touch preserves vertical pan and pinch zoom. The current controller supports pointer/touch input but exposes no device-tilt action; the earlier inclination-control description is historical. The native pixel cursor remains.

### Native Pixel Cursor

The user-requested old-school treatment uses native PNG cursors (32px), shared by the homepage and privacy route when a fine pointer can hover and forced colors are off. The arrow hotspot is (4px, 1px); interactive targets use the pixel hand with hotspot (14px, 1px). Selectable text and editable fields use the matching cobalt/white pixel I-beam with hotspot (16px, 16px). Each URL includes its standard `default` or `pointer` fallback. Coarse pointers and forced-colors mode retain native cursors.

Reading text and editable fields use the retro I-beam PNG with the native `text` cursor as fallback. Disabled controls retain native wait or not-allowed affordances, and busy regions use progress. This specific pixel cursor is allowed; it introduces no JavaScript follower, trails, hidden pointer, or animation-frame work.

## Do's and Don'ts

### Do:

- **Do** use the supplied inseparable LPM vector and approved type roles, preserving fixed cobalt/sky artwork and separate active theme roles.
- **Do** carry the gaze into optical geometry instead of relying on the portrait alone.
- **Do** pair expressive headings with readable Plex copy, bounded measures, native disclosures, and open content groups.
- **Do** keep the complete system readable in both perspective states and preserve live content without motion or JavaScript; the alien's fallback is a blank black image area.
- **Do** preserve visible labels, consent, status feedback, keyboard focus, and direct WhatsApp access.
- **Do** label illustrative portfolio work as conceptual until client material is approved for publication.
- **Do** keep common home corners at (8px), fields at (4px), and reading chapters on one theme-aware field.
- **Do** scope the native pixel cursor to fine hover pointers and preserve editing, waiting, disabled, and forced-colors affordances.

### Don't:

- **Don't** restore the retired warm-paper editorial world when extending this identity.
- **Don't** add fake telemetry, arbitrary coordinates, terminal styling, sound, cursor followers, trails, `cursor: none`, or hijacked scrolling. The faint generative hero sky is explicitly approved.
- **Don't** apply glass to reading or form surfaces.
- **Don't** reintroduce decorative yellow, tilted service cards, or unrelated colored chapters into this approved refinement.
- **Don't** add looping autoplay or unrelated animation sequences beyond the finite alien greeting, input-driven 3D character, hero-scoped CRT interference, perspective scene, and finite television power-on/channel transitions.
- **Don't** present concept imagery as approved client projects, results, or testimonials.
- **Don't** promote miniature text inside decorative concept artwork into a reading or control type role.

