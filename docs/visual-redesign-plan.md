# La Plata Marketing — visual redesign plan

Date: 2026-10-29. Status: planning brief based on the user's confirmed answers. No production UI changes are included in this deliverable.

Historical plan: the later blue extraterrestrial direction supersedes its light/warm visual choices. See `docs/alien-redesign.md` and the current `DESIGN.md`; product facts and preservation requirements continue to apply.

## 1. The agreed brief

Build a coherent, distinctive, light-first editorial experience for an Argentine audience. Communicate **creativity, confidence, and originality** through composition, typography, authored visuals, and precise interactions. Preserve the logo, existing palette, factual information, and working contact capabilities.

The website remains **one continuous page**, including About, Portfolio, and Contact. WhatsApp becomes the consistently emphasized primary action. Retain the supporting privacy route.

The offering has three pillars:

1. **Comunicación y marketing** — how the business presents itself and attracts interest.
2. **Tecnología** — the digital experiences and tools supporting that activity.
3. **La combinación de ambas** — connecting those capabilities into a working commercial journey.

These descriptions are planning explanations, not approved replacement website copy. Exact Spanish labels should be checked for fit during composition work.

The original presence, acquisition, and organization paths remain useful outcomes under these pillars. They should no longer compete with the three pillars as a second top-level classification.

## 2. Research evidence and its limits

Four primary reference websites were read. DMCG's homepage was also inspected visually in Firefox. Native browser automation then stopped because URL-policy enforcement is unsupported for that Windows browser. No attempt was made to bypass that restriction.

Mobbin, Pear, and Mac Moss findings below are based on their retrieved page content and structure. Their current rendered desktop/mobile layouts, precise materials, hover behavior, and animations have **not** been verified. Do not treat proposed adaptations as measured extractions of those visual details.

The local implementation, CSS tokens, theme definitions, contact flow markup, case-study definitions, privacy page, and representative existing tests were inspected. Historical local hero, portfolio, and mobile-contact captures dated September 2026 were inspected; they are useful baseline evidence, not a current live audit.

### Reference extraction

| Reference | Observed basis | Transferable principle | Proposed LPM adaptation | Required verification |
| --- | --- | --- | --- | --- |
| [DMCG](https://dmcg.co/) | Rendered opening: white field, small distributed navigation, centered office identity, an isolated scooter image, quiet peripheral labels; page text offers project/catalog views. | Confidence through a decisive artifact and very little surrounding chrome. | Give the integrated offering one authored visual at meaningful scale; let the interface frame it. Build a similarly disciplined portfolio presentation. | Scroll behavior, alternative project views, mobile hierarchy, and keyboard behavior. |
| [Mobbin](https://mobbin.com/) | Retrieved content introduces the product directly, uses extensive screen examples, separates library capabilities, and provides customer stories and repeated actions. | Make the thing being offered visible; pair explanation with recognizable examples and a clear action. | Show what a web/marketing/system connection does, then place a consistent WhatsApp action near the relevant explanation. | Current typography, page density, screen choreography, surfaces, mobile navigation, and actual motion. |
| [Pear](https://pear.no/) | Retrieved structure uses chapters, a tightly stated positioning, explicit terms, an application, and FAQs. | A strong point of view can organize the whole visitor journey. | Give each section a distinct role: understand the pillars, see their connection, evaluate the approach, start a conversation. | Current layout, type, color, transitions, chapter behavior, and mobile presentation. |
| [Mac Moss Studio](https://macmoss.studio/) | Retrieved page pairs a compact studio introduction with a sequence of image-led work and a direct contact address. | Let authored creative work carry personality; keep supporting prose economical. | Use a considered gallery and custom visual language rather than repeated generic service cards. | Current artwork, layout rhythm, motion, image crops, navigation, and mobile behavior. |

The references contribute different principles. They do not establish a license to reuse their artwork, copy, code, or proprietary brand treatments. Pear's commercial model, for example, is not an LPM claim.

### Apple/iPhone interpretation

The user asked for an Apple-inspired experience. The intended adaptation is precise hierarchy, generous breathing room, tangible layering, clear controls, and restrained transitions. This is a proposed material language, not an audit of a specific Apple website or operating-system release.

LPM's logo and existing colors remain authoritative. Glass belongs to a small number of functional layers; the portfolio and offering must carry their own visual substance.

## 3. What the current implementation suggests

| Finding | Evidence | Design response |
| --- | --- | --- |
| The identity already contains strong ingredients. | Cobalt, warm light surfaces, bold display type, and deliberate dark sections exist in source and historical captures. | Recompose their roles and hierarchy while retaining their values. A new palette is unnecessary. |
| The opening explains its mechanism mainly through words. | Current hero is headline + paragraph + actions; the system diagram appears later. | Bring a concise visual demonstration of the connection into the opening sequence. Keep the offer and action readable immediately. |
| Repetition can flatten the experience. | Many sections use a numbered eyebrow, a large heading, explanatory text, and boxed/grid content. | Vary section structure and density within one spacing/type system. Give each section a specific editorial job. |
| Portfolio graphics do not show the deliverable. | Historical captures and current markup use an orbit diagram and a verification-style badge. | Use purpose-made concept illustrations with useful detail and explicit labeling. A decorative badge must not imply independent verification. |
| There are competing classifications. | Presence/acquisition/organization paths and Web/Captación/Sistemas/Estrategia capability groups coexist. | Organize both under the user's three pillars, with outcomes and capabilities as subordinate information. |
| WhatsApp is visible but not the opening's principal destination. | Hero and service actions currently link to the form section; a floating WhatsApp control is separate. | Make the principal action consistently open the existing approved WhatsApp destination, retaining form and email as alternatives. |
| Small-screen contact requires particular attention. | A historical mobile capture includes sticky-header/focus artifacts across the section. | Retest sticky positioning, focus scrolling, and capture behavior. This is a validation target, not a confirmed current defect. |
| Dark mode expands the quality scope. | The implementation follows system appearance and stores explicit light/dark selection. | Design semantic token pairs and verify both modes. A dark section on a light page is a separate concern from whole-site dark mode. |

## 4. Proposed visual thesis

**Show how communication and technology become more useful when connected.**

The page should feel like a confident creative studio with technical fluency. Use broad editorial composition, an unmistakable cobalt presence, tactile light surfaces, and one controlled visual demonstration that belongs to LPM's actual offering.

### First viewport

- Existing logo and compact navigation at the top, with one visible WhatsApp action.
- Existing core headline and factual explanation retain their meaning and receive an intentional desktop/mobile type composition.
- A distinctive visual shows communication and technology as two understandable contributors to a combined journey. Text labels explain the relationship without relying on animation.
- Two actions maximum in the hero: primary WhatsApp, secondary exploration of the three pillars or work.
- The primary action remains available before the visitor watches or scrolls through the signature demonstration.

Use an asymmetric editorial composition on wide screens; on phones, place the offer and primary action before a compact version of the demonstration. Avoid shrinking a desktop composition until its labels become unreadable.

### Signature animation

Communication and technology start as distinct, clearly labeled elements. They connect into an illustrative flow using existing information: discovery/advertising, website, inquiry, WhatsApp, CRM, follow-up. A sale can appear only as a possible business outcome, never as a guaranteed result or a fabricated conversion metric.

This demonstration is the single major animated moment. It must work in a static version, remain legible during intermediate states, and complete or settle without forcing prolonged scrolling. Native scrolling and normal navigation remain available. No automatic sound, cursor replacement, or essential pointer-only behavior.

## 5. Continuous-page architecture and content preservation

| Section | Visitor's question | Content and experience | Main next action |
| --- | --- | --- | --- |
| Opening | What does LPM do, and why care? | Core proposition, Argentina context from existing information, clear offer, signature visual. | WhatsApp or explore pillars. |
| Three pillars | Where can LPM help me? | Communication/marketing, technology, and their combination. Explain distinct roles and connection. | Relevant section or WhatsApp. |
| The combined system | Why work on these together? | Existing system explanation, readable illustrative flow, and relevant business problems. | View examples or discuss a need. |
| Portfolio | What would this approach look like? | A small curated set of explicitly conceptual studies. Use only existing capability information. | Discuss a similar need. |
| About | How does LPM think and work? | Existing philosophy, diagnostic approach, and four method steps. No invented team history, headcount, awards, or credentials. | Understand the process or contact. |
| Capabilities and practical questions | Can LPM address my situation? | Existing capabilities grouped under the pillars; existing eight FAQs remain accessible. | WhatsApp. |
| Contact | How do I start? | WhatsApp first, existing email and form secondary; retain existing expectations about the initial conversation. | Start WhatsApp or submit form. |
| Footer | Where can I go next? | Logo, section links, contact destinations, privacy, copyright. | Navigation or contact. |

Recommended navigation: **Enfoque · Portfolio · Nosotros · Contacto**, plus a clear WhatsApp action. Labels are proposals. The original services and method stay reachable through page content and appropriate deep links.

### Information migration ledger

- Hero proposition and explanatory paragraph → opening.
- Six business problems → pillar explanations and combined-system narrative, preserving every distinct point.
- Three current solution paths → outcome examples below the pillars.
- Current system copy and seven stages → integrated-system demonstration and its static text equivalent.
- Existing conceptual case information → labeled concept studies; no named publication approval inferred.
- Four method steps → About.
- Four capability groups → three-pillar capability mapping, without losing any service.
- Eight FAQs → practical-questions section.
- WhatsApp, email, contact fields, consent, status messages → Contact and shared actions.
- Privacy information → existing supporting route, brought into the same visual system.
- Existing anchors → preserve where practical, or supply meaningful replacements so old links remain useful.

### Portfolio without approved work

Use a visible heading such as **Portfolio — estudios conceptuales** and a label on each study. These are illustrations of an approach, not evidence of client outcomes. Exact naming remains a copy decision; its conceptual status is mandatory.

Use anonymous existing sectors only as concept contexts. Do not publish client names, logos, screenshots, testimonials, results, or verification claims. If any illustration could be mistaken for a real dashboard or campaign, label it as illustrative within its immediate context.

A concept can show an editorial web composition, a communication sequence, or a simplified inquiry/follow-up interface. Each should explain a different part of the three-pillar model. Avoid building filter controls or case-detail pages for a tiny gallery with no approved underlying content.

## 6. Design-system specification to produce

This is the specification for the system to be designed and validated. It is not a claim that the system has been implemented. Final production values and exceptions should be documented from the completed interface in `DESIGN.md`.

### Palette and semantic roles

Preserve the existing light palette:

| Existing color | Value | Proposed role |
| --- | --- | --- |
| Ink | `#111318` | Main text; occasional dark chapter. |
| Muted ink | `#56595F` | Supporting text on verified light backgrounds. |
| Warm background | `#F3EFE5` | Main page field. |
| Light surface | `#FFFDF7` | Elevated reading and interface surfaces. |
| Cobalt | `#1536F1` | Primary actions, selected states, decisive brand moments. |
| Sky | `#B7D7EE` | Supporting visual field and technology demonstrations. |
| Signal yellow | `#F4C430` | Deliberate emphasis in diagrams or selected editorial details. |
| Pulse red | `#F0442D` | Sparse visual emphasis; semantic errors use verified error tokens. |

Avoid a visible competition among all accents in every viewport. Assign each a job and document which combinations are permitted. Keeping a color does not require using it equally often.

Define semantic tokens for page, surface, elevated surface, glass surface, text, secondary text, border, action, focus, error, success, selection, and text on a dark/brand surface. Centralize the currently duplicated CSS/TypeScript theme definitions or enforce parity. Retain the existing dark palette as the starting constraint rather than silently replacing it.

### Material system

1. **Base:** opaque page fields for comfortable reading and stable contrast.
2. **Raised surface:** opaque or near-opaque content surfaces; one border/shadow vocabulary.
3. **Glass:** navigation and, only if useful, a compact mobile contact layer or small foreground control in the demonstration.

For glass, specify tint, minimum opacity, blur, border, highlight, shadow, and backdrop rules as a single component recipe. Start with a modest blur range and high enough tint to keep type stable; tune against actual backgrounds rather than prescribing opacity in isolation.

Do not stack glass panels. Do not place small reading text over a busy animated backdrop. Use an opaque fallback when backdrop filters are unavailable or transparency is reduced. Verify contrast in the most demanding underlying animation frame and during scrolling. Forms and long reading passages use stable surfaces.

### Typography

- Audit the existing Bricolage Grotesque, Newsreader, IBM Plex Sans, and IBM Plex Mono together before choosing the retained roles. Fonts are not pinned; logo, colors, and information are.
- Establish one display voice and one reading voice. Any additional face must serve a named role.
- Specify hero, section heading, subsection, body, caption, navigation, button, and form-label styles, including weight, line height, tracking, width, and responsive bounds.
- Starting composition ranges: hero 72–112 px on wide screens and 40–56 px on phones; body 17–18 px. These are trial ranges, not approved tokens.
- Design Spanish line breaks intentionally. Check accents, punctuation, long email addresses, narrow screens, and 200% zoom.
- Keep reading copy around 55–70 characters per line where the layout allows. Avoid using small tracked uppercase text for necessary explanations.
- Use locally served fonts with deliberate loading behavior and minimal layout shift. Do not copy proprietary Apple fonts as website assets.

### Layout and spacing

- Begin with the existing 1280 px maximum content width; validate a wider editorial composition only if it improves the actual content.
- Establish an 8 px spacing foundation with 4 px for optical adjustments.
- Define page gutters, reading-column widths, section spacing, content-group spacing, and component padding separately.
- Trial gutters: 20–24 px on phones, 32 px on intermediate widths, 48–64 px on wide screens, adjusted to real breakpoints.
- Use large section intervals purposefully, then tighten relationships within a section. Do not apply one oversized gap to every relationship.
- Establish three radius roles at most, with consistently nested corners. Verify the final radius values visually against the existing logo.
- Align text baselines, repeated actions, captions, and image edges. Variation in section composition must not create arbitrary alignment rules.

### Imagery and illustration

- Give each visual a content role: explain a pillar, demonstrate a connection, or communicate a concept study.
- Build diagrams and interface illustrations as accessible SVG/HTML/CSS when practical; this gives exact labels, crisp scaling, and controllable motion.
- No generic stock team photographs in About. No invented client-branded mockups.
- Define aspect ratios, image crops, caption positions, conceptual labels, loading behavior, and mobile variants.
- Reserve image dimensions; optimize eventual raster imagery. A visual must still explain something when motion is disabled.

### Components and state coverage

| Component | Required coverage |
| --- | --- |
| Header and mobile menu | Top/scrolled, open/closed, keyboard focus, active section if used, Escape, focus return, scroll locking and recovery. |
| WhatsApp action | Default, hover, focus, active, long label, mobile placement, safe-area spacing, existing destination. |
| Secondary action and text link | Consistent hierarchy, visited where appropriate, focus, external destination clarity. |
| Pillar presentation | All three readable without hover, selected/expanded states if used, equal conceptual standing, meaningful integrated relationship. |
| Signature demonstration | Initial, intermediate, settled, reduced motion, unavailable JS, small screen, offscreen pause. |
| Concept study | Default, hover/focus, image unavailable, long title, conceptual label, static alternative to animation. |
| Method steps | Ordered reading, desktop/mobile, visible descriptions without animation. |
| FAQ | Open/closed, focus, expanded answer spacing, reduced motion, long answer. |
| Contact form | Empty, filled, autofill, focus, invalid, submitting, success, demo, server failure, network failure, anti-spam unavailable/expired. |
| Appearance control | System initialization, explicit light/dark, persistence, readable icons/labels, no disruptive flash. |
| Footer and privacy page | Long text, narrow width, clear privacy route, same type/material/link grammar. |

Do not add inert buttons or decorative controls that suggest unsupported capabilities. Concept interfaces must not be confused with functioning site controls.

### Motion and interaction

- One signature animation. Begin other interaction trials around 120–200 ms for controls and 250–450 ms for quiet entrances; validate pacing with real content.
- Prefer transform and opacity changes. Animate layout only when justified and tested.
- Content is visible by default; failure to load scripts must not hide the offer, links, or explanations.
- `prefers-reduced-motion` gets a complete static narrative, not a blank visual.
- Essential information remains available without hover. No scrolling technique may trap the visitor or obscure the primary action.

### Voice and action hierarchy

- Retain Argentine Spanish and existing factual meaning.
- Use one consistent primary action label, likely **Hablemos por WhatsApp**; final wording should be checked alongside existing copy.
- State what the initial conversation involves using current information. Do not invent response times, availability, fees, guarantees, or results.
- Preserve form and email as alternatives. The primary journey is direct WhatsApp, independent of the contact form.

## 7. Implementation sequence and reviewable deliverables

| Phase | Work | Deliverable / completion criterion |
| --- | --- | --- |
| 1. Close research gaps | Visually inspect the remaining reference pages through a supported browser when available; capture the current LPM baseline on desktop/mobile. | Evidence board with annotated observations, clear source attribution, and explicit distinctions between observed details and LPM adaptations. |
| 2. Content and structure | Build the information ledger; map the old service classifications into the three pillars; allocate every current fact to its new section. | One-page outline, anchor/navigation map, and no unexplained content omissions. |
| 3. Visual concept | Develop the opening, three pillars, portfolio concept treatment, and contact section together. Present two or three compositions within the agreed light/editorial/cobalt direction. | Comparable desktop and mobile compositions using real existing text; review typography, visual character, glass, and content density before a full implementation. |
| 4. System and component sample | Establish tokens and render representative header, actions, pillar, concept tile, form states, and appearance variants. | A reusable style specimen covering light/dark, opaque/glass surfaces, spacing, icons, type, and interaction states. |
| 5. Full page | Implement every section, the privacy-page styling, and the signature animation. Keep Astro and existing contact infrastructure. | Complete responsive page with preserved information and functioning journeys. |
| 6. Verification | Run one batched visual review across desktop/mobile and the relevant functional checks. Batch material fixes, then perform a confirmation review. | Evidence of resolved layout, content, state, accessibility, and functional issues; disclose remaining issues precisely. |
| 7. Handoff | Document the built system and remaining content needs. | `DESIGN.md`, component/state inventory, updated visual captures, content ledger, and an accurate verification record. |

This planning deliverable does not include deployment. Any future deployment follows the user's instructions for that implementation task.

## 8. Validation plan and definition of done

### Visual checks

Inspect representative widths around 320, 390, 768, 1024, 1440, and 1920 px, with detailed paired captures at desktop and phone sizes. Inspect each section at legible scale; a full-page thumbnail cannot establish craft quality.

The first batch covers both appearances where supported, navigation open/closed, the signature animation at meaningful stages, contact errors/success, and reduced motion. Fix material findings together, then verify the fixes in one confirmation batch. Functional failures remain blockers to completion; report any unresolved visual finding instead of repeatedly making unbounded micro-edits.

Check line wraps, optical alignment, inconsistent gaps, image crops, nested corners, glass edges, icon stroke/size, contrast over changing backdrops, sticky-layer collisions, floating-contact obstruction, safe areas, and zoom behavior.

### Usability and accessibility checks

- A first-time visitor can identify the three pillars, understand the combined offer, and locate WhatsApp from the opening sequence.
- Target [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) for relevant criteria: text contrast, focus visibility, keyboard use, semantics, labels, errors, reflow, and motion controls. Automated checks support rather than replace manual review.
- Target at least 44 × 44 CSS px for primary touch controls, as a design criterion.
- No required hover, horizontal overflow, sticky element covering focused content, or body-scroll trap.
- Verify skip links, anchors, mobile-menu focus behavior, native accordions, form feedback, and screen-reader announcements.

### Functional and regression checks

- Preserve the existing WhatsApp destination and test links from the hero, relevant sections, floating/mobile action, and footer.
- Exercise form validation, consent, pending state, successful receipt, demo wording, server/network errors, and Turnstile failure in an appropriate test environment. Do not send real production inquiries for visual QA.
- Preserve existing publication controls; default and approved-case states must not leak unapproved client information.
- Keep privacy navigation, canonical metadata, sitemap behavior, structured data, and appearance persistence intact.
- Update tests that intentionally encode the retired layout. Preserve tests of actual user outcomes and contact/publication behavior.
- Run the project's relevant unit/integration tests, browser checks, and production build once UI implementation exists. Planning documents do not require running the application test suite.
- Current Windows PowerShell blocks `npm.ps1`; use the existing `npm.cmd` executable when running project commands in this environment.

### Performance checks

- Suggested field targets: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile, following [Core Web Vitals guidance](https://web.dev/articles/vitals). These are goals, not measured results for this site.
- During development, use repeatable lab checks on a documented mobile profile. Field percentiles require real traffic data and cannot be certified from a local build.
- Measure the cost of fonts, glass, animation, and existing third-party scripts. Current source includes HubSpot; include it in measurement rather than assuming the README fully describes the active scripts.
- Avoid adding a large animation library unless the approved interaction needs it. Limit expensive blur to small or stable areas and stop unnecessary offscreen work.
- Verify on actual Safari/iOS and Android Chrome when devices or appropriate test services are available; emulation does not prove physical-device behavior.

### Completion means

The three pillars are clear; the page feels like one designed experience; every retained fact has a destination; all work shown is accurately labeled; WhatsApp is easy to use; the major states work; the relevant checks pass; and the final system is documented from the actual implementation.

## 9. Decisions already answered and remaining boundaries

| Topic | Decision |
| --- | --- |
| Market and primary action | Argentina; WhatsApp. |
| Brand to preserve | Existing logo, colors, and information. |
| Brand qualities | Creativity, confidence, originality. |
| Overall direction | Mostly light editorial pages, bold typography, selective glass. |
| Scope | One continuous page with About, Portfolio, Contact; supporting privacy route retained. |
| Offering structure | Communication/marketing; technology; their combination. |
| Portfolio evidence | No approved work available. Use transparently labeled concepts until real work is approved. |
| Motion | One signature animation, restrained transitions. |
| About material | Use existing approach and method. |
| Deadline | Not provided; no schedule commitment invented. |
| Research limitation | Three references still need rendered visual verification through supported browser access. |

No further preference interview is required to begin composition work. Any later question should address a concrete conflict or new factual content, rather than reopening these decisions.
