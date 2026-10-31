# Redesign verification

Historical verification of the editorial iteration. The current alien iteration is recorded in `docs/alien-redesign.md` and `docs/alien-validation.md`.

Date: 2026-10-29. The site runs locally at `http://127.0.0.1:4321` after implementation. This record describes local verification, not a production deployment or a field-performance certification.

| Check | Result |
| --- | --- |
| Unit and integration suite | 74 tests passed across 14 files. |
| Chromium end-to-end suite | 37 tests passed after the final corrections. |
| Production build | Astro check/build and two prerendered-page verifications passed. One pre-existing unused-variable hint remains in an ignored historical capture script. |
| Accessibility automation | No axe violations detected on home/privacy in tested light and dark states. This is not a claim of full manual WCAG conformance. |
| Responsive geometry | Home/privacy checked at 320, 390, 560, 700, 768, 900, 1000, 1024, 1440, and 1920 px; no document/body overflow or clipped tested headings/fields. |
| Functional coverage | WhatsApp destinations, preserved services, anonymous concept labels, mobile navigation, keyboard focus, native FAQs, reduced motion, system-theme updates, explicit appearance persistence, and basic no-JavaScript reading/contact access passed. |
| Contact | Real local demo endpoint validated; mocked live success and failed delivery, optional-phone validation, consent, normalization, and Turnstile reset paths passed. No production inquiries were sent. |
| Mechanical design detector | One run returned an empty findings list. |
| Independent media audit | SVG/HTML/CSS are appropriate for the precise geometry and illustrative interfaces; no raster assets required. |
| Independent finish review | Final disposition: **ship**. Four material findings and one capture-timing regression resolved. |

## Finish-review verdict

| Finding | Final result |
| --- | --- |
| Mobile contact heading joined words | Resolved with explicit spaces around responsive line breaks. |
| Hero loop had a diagonal spur | Resolved with an exact clipped duplicate of the capsule contour. |
| Portfolio/form metadata preceded headings | Resolved; project labels and helper copy now follow their headings. |
| Submit arrow differed from SVG system | Resolved with the shared authored Icon component. |
| Dark note missing in a transient capture | Resolved after waiting for paint and scroll-observer updates; icon/text are visible. |
| Floating action over the contact form | Confirmation capture shows it hidden while Contact is in view. |

## Evidence and practical limits

Screenshots and machine summaries are saved in ignored `artifacts/redesign/initial/` and `artifacts/redesign/final/`. The capture script stubs only HubSpot's external loader for deterministic screenshots; the production integration remains in both pages. The browser suite independently checks the loader's presence.

Native Safari/iOS and physical Android devices were not tested. Real-user Core Web Vitals were not measured. Current rendered inspection of Mobbin, Pear, and Mac Moss remains a reference-research limitation from planning; their content/structural principles informed the brief. The local redesigned site received its own screenshot and browser checks.

No approved client names, testimonials, results, or screenshots were supplied. The portfolio remains explicitly conceptual. `DESIGN.md` and its machine-readable companion record the implemented system; `PRODUCT.md` records the confirmed product commitments.
