---
name: Emon Material Admin
colors:
  surface: '#f7f9ff'
  surface-dim: '#d7dae0'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4fa'
  surface-container: '#ebeef4'
  surface-container-high: '#e5e8ee'
  surface-container-highest: '#dfe3e8'
  on-surface: '#181c20'
  on-surface-variant: '#414754'
  inverse-surface: '#2d3135'
  inverse-on-surface: '#eef1f7'
  outline: '#727785'
  outline-variant: '#c1c6d6'
  surface-tint: '#005bc0'
  primary: '#005bbf'
  on-primary: '#ffffff'
  primary-container: '#1a73e8'
  on-primary-container: '#ffffff'
  inverse-primary: '#adc7ff'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#8df5e4'
  on-secondary-container: '#007165'
  tertiary: '#6833ea'
  on-tertiary: '#ffffff'
  tertiary-container: '#8155ff'
  on-tertiary-container: '#060021'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc7ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#8df5e4'
  secondary-fixed-dim: '#70d8c8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#e8deff'
  tertiary-fixed-dim: '#cdbdff'
  on-tertiary-fixed: '#20005f'
  on-tertiary-fixed-variant: '#4f00d0'
  background: '#f7f9ff'
  on-background: '#181c20'
  surface-variant: '#dfe3e8'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-sm: 0.75rem
  gutter-lg: 1.5rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system synthesizes the bold, information-first typography and structured modularity of Microsoft Metro with the refined elevation, tactile feedback, and accessible ergonomics of Google Material 3. Designed for enterprise power users, analysts, and operators, the interface eliminates decorative clutter in favor of high-density clarity, rhythm, and chromatic intent.

Key style attributes:
- **Modular Live Tile Cadence**: High-order metric widgets and actionable modules arranged with deliberate, balanced grid geometry inspired by Metro hubs.
- **Material 3 Surface Logic**: Layered, light-gray neutral canvases with intentional tonal contrast and diffused ambient drop shadows to communicate focal hierarchy without visual heaviness.
- **Intentional Chromatic Signaling**: Saturated accent cues—anchored by vivid digital blue, balanced with active teal, warm amber, coral alerts, and deep purple context badges—applied strictly for status, action, and categorical distinction.

## Colors

The palette leverages a crisp, structured baseline where neutral structural tones recede, allowing primary system indicators and data metrics to command attention.

### Palette Architecture
- **Primary (`#1a73e8`)**: Direct Google Blue; governs primary calls-to-action, active navigational links, primary metric callouts, and key interaction states.
- **Secondary (`#00897b`)**: Deep Teal; drives system health, positive delta trends, secondary analytical series, and affirmative states.
- **Tertiary (`#7c4dff`)**: Vivid Iris Purple; reserved for multi-dimensional data tags, analytical classifications, and feature badges.
- **Status & Warning Accents**:
  - **Coral / Critical (`#ea4335`)**: Error messaging, threshold breaches, down-trending warnings, and destructive actions.
  - **Amber / Caution (`#f9ab00`)**: Pending operations, system throttles, and moderate performance cautions.
- **Neutral Stack**:
  - Canvas / Background: `#f8f9fa` (Clean light-gray background preventing optical glare).
  - Surface Default: `#ffffff` (Elevated cards and tile modules).
  - Surface Dim / Muted: `#edf2f7` (Field backdrops, subtle dividers, and hover fills).
  - Border Subdued: `#dadce0` (Structural separators and non-elevated outlines).
  - Text Primary: `#202124` (High-contrast, authoritative dark slate).
  - Text Secondary: `#5f6368` (Supporting metadata, captions, and table headers).

## Typography

The typographical hierarchy is engineered for immediate visual digestion:
- **Headlines & Metrics (Plus Jakarta Sans)**: Delivers clean geometric forms reminiscent of early Swiss and Metro designs, coupled with modern humanist proportions for high-impact metric counters and dashboard tile titles.
- **Body, Inputs & Structural Data (Inter)**: Built for neutral, tabular legibility across complex data grids, dense analytical tables, and form configurations.

### Usage Standards
- Metric indicators inside cards pair `display-lg` numbers with `label-md` uppercase unit descriptors.
- Card titles utilize `headline-md` or `title-md` with strict tracking adjustments to ensure zero truncation in multi-column dashboards.
- Numeric metrics must activate tabular figures (`font-feature-settings: "tnum"`) to eliminate layout jitter during real-time data updates.

## Layout & Spacing

The layout model draws directly from Metro's live tile grid systematization, executed through a strict 12-column responsive fluid grid.

### Grid Rhythm & Layout Principles
- **Grid Architecture**: 12-column fluid grid. Desktop layouts use `gutter-lg` (`1.5rem` / 24px) for wide separation between modular widget cards, collapsing to `gutter` (`1.25rem` / 20px) on tablet and `gutter-sm` (`0.75rem` / 12px) on mobile.
- **Outer Canvas Margins**: Standard desktop margins remain at `1.5rem` (24px) around the viewport perimeter, stepping down to `1rem` (16px) on mobile viewports.
- **Modular Tile Sizing**: Components span predictable modular units:
  - KPI Hero Metrics: 3-column span (Desktop), 6-column (Tablet), 12-column (Mobile).
  - Primary Visualizations / Data Grids: 8-column or 12-column spans.
  - Secondary Context Feeds: 4-column span.
- **Component Padding Scale**: Internal card paddings follow `space-lg` (`1.5rem`) for standard cards and `space-md` (`1rem`) for dense analytical lists and compact tables.

## Elevation & Depth

Visual hierarchy combines the planar flat surfaces of Metro with the tonal ambient layering of Material 3. Rather than aggressive drop shadows, depth is achieved via controlled, low-contrast shadows paired with micro-borders.

### Elevation Levels
- **Level 0 (Flat Canvas)**: Neutral foundation `#f8f9fa`. No shadow. Hosts non-interactive layout containers and structural column guides.
- **Level 1 (Data Cards & Standard Tiles)**: `#ffffff` surface, bounded by a 1px border of `#dadce0` (opacity 0.6) and a diffuse ambient shadow:
  - `box-shadow: 0 1px 3px rgba(32, 33, 36, 0.04), 0 1px 2px rgba(32, 33, 36, 0.06);`
- **Level 2 (Hovered Tiles & Interactive Triggers)**: Elevated state when users focus or hover over interactive metric blocks or table rows:
  - `box-shadow: 0 4px 12px rgba(32, 33, 36, 0.08), 0 2px 4px rgba(32, 33, 36, 0.04);`
  - Subtle upward transition of `-1px`.
- **Level 3 (Flyouts, Menus & Dropdowns)**: `#ffffff` surface with crisp edge separation:
  - `box-shadow: 0 10px 24px -4px rgba(32, 33, 36, 0.12), 0 4px 8px -2px rgba(32, 33, 36, 0.06);`
- **Level 4 (Modals & Command Palettes)**: Floating centered surfaces with backdrop scrim:
  - `box-shadow: 0 20px 32px -8px rgba(32, 33, 36, 0.18), 0 8px 16px -4px rgba(32, 33, 36, 0.08);`
  - Scrim: `rgba(32, 33, 36, 0.4)` with 4px backdrop blur.

## Shapes

The geometric personality balances Metro's structured rectangular framing with Material 3's rounded touchpoints and pill indicators:

- **Cards & Data Modules**: Base corner radius set to `0.5rem` (8px). This creates sharp structural alignment across rows while softening hard corners.
- **Interactive Controls (Inputs, Dropdowns, Segmented Tabs)**: Uniform `0.5rem` (8px) radius to maintain cohesive grid lines.
- **Status Badges, Chips & Filter Pills**: Fully rounded pill shapes (`9999px` or `rounded-full`) providing a direct visual departure from rectangular metric tiles.
- **Action Buttons**: Standard buttons utilize `0.5rem` (8px) for balanced enterprise utility, while floating action buttons (FABs) and quick-action chips take full pill rounding.

## Components

### Buttons
- **Primary Action**: Solid `#1a73e8` background, white text (`label-lg`), 8px border-radius. Padding: `0.625rem 1.25rem`. Transitions smoothly on hover to `#1557b0` with Level 2 elevation.
- **Secondary Action**: `#ffffff` background with 1px border `#dadce0`, `#202124` text. On hover, background shifts to `#edf2f7`.
- **Destructive Action**: `#ea4335` background, white text, matching primary button proportions.

### Data Cards & Live Tiles
- **Structure**: Clean `#ffffff` fill, 8px radius, Level 1 elevation.
- **Header**: Contains title (`title-md`), optional trailing context pill, and a secondary action icon.
- **Metrics Display**: Prominent `display-lg` metric value paired with an inline pill badge indicating performance percentage (e.g., green pill with secondary accent `#00897b` for positive trend).
- **Footer**: Optional micro-trend sparkline or descriptive caption (`body-sm` in `#5f6368`).

### Chips & Badges
- **Status Badges**: Full pill rounding (`9999px`), `0.25rem 0.625rem` padding, `label-sm` font weight. Uses a low-opacity tinted background (12% opacity) paired with high-contrast text:
  - *Active / Healthy*: Tinted `#00897b` background, `#00695c` text.
  - *Warning*: Tinted `#f9ab00` background, `#b06000` text.
  - *Error*: Tinted `#ea4335` background, `#c5221f` text.
  - *Category / Role*: Tinted `#7c4dff` background, `#5b2fc9` text.
- **Filter Chips**: Pill-shaped with a 1px border of `#dadce0`, supporting dismiss icons and selection states filled with `#1a73e8` tint.

### Input Fields & Controls
- **Text Inputs**: Height 40px, 8px radius, `#ffffff` surface with a 1px `#dadce0` border. Active focus state transitions to a 2px outer outline of `#1a73e8` without layout jump.
- **Checkboxes & Radios**: 18px bounding box, 4px radius (checkboxes) and circular (radios). Active fill in `#1a73e8` with crisp white selection glyph.

### Tables & Data Grids
- **Header Row**: `#f8f9fa` background, border-bottom 1px solid `#dadce0`. Text in `label-md`, uppercase, tracking +0.04em, `#5f6368`.
- **Data Rows**: `#ffffff` background, height 48px, border-bottom 1px solid `#f1f3f4`. Hover state applies `#f8f9fa` with an optional 3px left-edge accent border in `#1a73e8`.