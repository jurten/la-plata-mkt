---
name: Kinetic Minimalist
colors:
  surface: '#faf9f9'
  surface-dim: '#dadada'
  surface-bright: '#faf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f3'
  surface-container: '#efeeee'
  surface-container-high: '#e9e8e8'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f0f0'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#ea5505'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#7ca2b8'
  on-secondary: '#ffffff'
  secondary-container: '#dce8ef'
  on-secondary-container: '#20323b'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#dce8ef'
  secondary-fixed-dim: '#9bb9c9'
  on-secondary-fixed: '#1c1b1a'
  on-secondary-fixed-variant: '#314c5b'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#faf9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e3e2e2'
  krieg-blue: '#7ca2b8'
  krieg-orange: '#ea5505'
typography:
  display-2xl:
    fontFamily: manrope
    fontSize: 80px
    fontWeight: '200'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-lg:
    fontFamily: manrope
    fontSize: 48px
    fontWeight: '300'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: manrope
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-caps:
    fontFamily: manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 32px
  margin-edge: 64px
  section-gap: 160px
  animation-duration-fast: 200ms
  animation-duration-standard: 500ms
  animation-easing: cubic-bezier(0.22, 1, 0.36, 1)
---

## Brand & Style

The design system is anchored in a philosophy of **Extreme Minimalism** and **Editorial Elegance**. Designed for a high-end marketing agency, it prioritizes content and case studies over decorative UI. The goal is to evoke a sense of quiet confidence, precision, and architectural order.

The aesthetic draws from the Swiss Style (International Typographic Style), utilizing a strict grid, asymmetrical layouts, and significant whitespace to create a "gallery" feel. Interaction is where the personality emerges: motion should feel fluid, intentional, and expensive—employing staggered entries and soft easing to guide the user's eye without friction.

## Colors

The palette is deliberately near-monochrome so typography, spacing, and work imagery remain the focal point. Color is limited to two Krieg-inspired accents: a muted Horizon Blue for quiet structure, and a bright Jokaero Orange for active signals.

- **Primary Black (#000000):** Used for headlines and heavy structural elements in light mode, and as the infinite background in dark mode.
- **Charcoal (#2A2928):** Acts as a softer alternative to pure black for secondary text or card backgrounds in dark mode to provide subtle depth.
- **Off-White (#EEEDED):** The primary canvas for light mode. It is softer on the eyes than pure white, providing a premium, "paper-like" quality.
- **Krieg Blue (#7CA2B8):** A muted Horizon Blue reference for grid lines, section counters, and restrained structural accents.
- **Krieg Orange (#EA5505):** A bright Jokaero Orange reference for typewriter text, focus states, progress, and CTA hover states.

In dark mode, the roles reverse: the background becomes near black, and text utilizes the off-white for high legibility. Krieg Orange is lifted slightly for contrast, while Krieg Blue stays muted.

## Typography

Typography is the primary design element in this design system. We utilize **Manrope** for its balanced, modern neo-grotesk characteristics, which echo the requested Neue Haas Grotesk aesthetic.

- **Display Hierarchy:** Use thin weights (200-300) for large-scale headlines to achieve a sophisticated, editorial look. 
- **Tracking:** Tighten letter spacing for large display text to create a compact, high-impact visual. Increase tracking for labels and small caps to ensure legibility and a sense of luxury.
- **Line Height:** Generous leading is applied to body text to maintain the "airy" feel of the brand, while headlines are kept tight to maintain structural integrity.

## Layout & Spacing

This design system utilizes a **12-column fixed grid** with large margins and wide gutters to emphasize a premium feeling. 

- **Sectioning:** Vertical rhythm is defined by large gaps (160px+) between major sections to allow the content to breathe.
- **Transitions:** All state changes and page entries must use the defined "standard" duration with a custom cubic-bezier (Quintic Out) for a smooth, high-end "gliding" effect. 
- **Whitespace:** Never crowd the edges. The `margin-edge` should be respected as a minimum safety zone for all interactive elements.

## Elevation & Depth

To maintain a minimalist aesthetic, this design system avoids traditional shadows. Instead, depth is communicated through **Tonal Layers** and **Spatial Contrast**.

- **Tonal Tiers:** In dark mode, use the Charcoal (#2A2928) surface to elevate elements above the pure black background.
- **Borders:** Use hairline borders (0.5px - 1px) in a slightly higher or lower contrast version of the background color for subtle definition of input fields or cards.
- **Motion Depth:** Depth is also conveyed through scale. Interactive elements (like project thumbnails) should subtly scale up (e.g., 1.02x) on hover, paired with a slight opacity shift, rather than casting a shadow.

## Shapes

The shape language is strictly **Sharp (0px)**. 

Sharp corners reinforce the architectural and professional nature of the agency. They align with the grid more precisely than rounded corners and communicate a sense of "cut" precision. This applies to buttons, input fields, image containers, and cards. Only icons may contain organic or rounded curves to ensure they remain legible and friendly.

## Components

### Buttons
Buttons should be rectangular with no radius. Primary buttons are solid black (light mode) or solid off-white (dark mode). The text is always the inverse of the background. Hover and focus states may use Krieg Orange, but the default button system should stay monochrome.

### Input Fields
Inputs are defined by a bottom border only (1px). Focus states should animate the border thickness or color with a smooth transition. Labels are always `label-caps` positioned above the input.

### Cards & Project Tiles
Project tiles should be full-bleed images within their grid columns. On hover, a subtle overlay or the appearance of text (using a staggered upward slide) should provide context. No shadows or borders are used on cards.

### Navigation
The navigation should be minimal, utilizing large amounts of whitespace. Use a "ghost" header that becomes solid or hides/reveals based on scroll direction to maximize screen real estate.

### Chips & Tags
Tags are rendered as simple text in `label-caps` style, perhaps enclosed in a thin 1px border. They should not look "bubbly"—keep them integrated into the typographic flow.
