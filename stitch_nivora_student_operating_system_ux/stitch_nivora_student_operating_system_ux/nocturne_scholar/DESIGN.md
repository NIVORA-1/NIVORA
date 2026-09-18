---
name: Nocturne Scholar
colors:
  surface: '#0c1418'
  surface-dim: '#0c1418'
  surface-bright: '#323a3f'
  surface-container-lowest: '#070f13'
  surface-container-low: '#151d21'
  surface-container: '#192125'
  surface-container-high: '#232b2f'
  surface-container-highest: '#2e363a'
  on-surface: '#dbe4e9'
  on-surface-variant: '#c0c9c1'
  inverse-surface: '#dbe4e9'
  inverse-on-surface: '#293236'
  outline: '#8a938c'
  outline-variant: '#404943'
  surface-tint: '#9cd2b4'
  primary: '#aae1c2'
  on-primary: '#003824'
  primary-container: '#8fc5a7'
  on-primary-container: '#1e533b'
  inverse-primary: '#35684f'
  secondary: '#a5d0b7'
  on-secondary: '#0e3725'
  secondary-container: '#2a513d'
  on-secondary-container: '#98c2a9'
  tertiary: '#efd28e'
  on-tertiary: '#3e2e00'
  tertiary-container: '#d2b675'
  on-tertiary-container: '#5a4711'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b7efcf'
  primary-fixed-dim: '#9cd2b4'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#1b5039'
  secondary-fixed: '#c1edd2'
  secondary-fixed-dim: '#a5d0b7'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#274e3b'
  tertiary-fixed: '#fedf9b'
  tertiary-fixed-dim: '#e0c381'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#58440e'
  background: '#0c1418'
  on-background: '#dbe4e9'
  surface-variant: '#2e363a'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-quote:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-mono-wide:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1em
  label-tag:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.08em
  button-text:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 2.5rem
  space-4xl: 3.5rem
  sidebar-width: 260px
  gutter: 1.25rem
  card-padding: 1.25rem
---

## Brand & Style

This design system embodies an editorial, focused, and deeply calm academic operating environment. Tailored for high-performing students, researchers, and knowledge workers, it balances analytical rigor with mindful design. The aesthetic combines elements of modern minimalism with high-end editorial software: low-fatigue slate-cyan dark surfaces, disciplined 1px borders, precise mono-tracked meta labels, and organic sage-green focal points.

The interface prioritizes clarity and executive focus over gamification. Rather than jarring alert states or aggressive color accents, it employs muted earth-tinted darks and sage highlights to preserve cognitive energy during sustained work sessions. The typography establishes an intentional hierarchy: literary serif accents for reflective moments, clinical sans-serif geometry for interactive components, and tracked monospaced typography for systems status and taxonomy.

## Colors

The color palette is built on a deep, oceanic slate foundation that eliminates blue-light strain while retaining atmospheric depth.

### Palette Roles & Values

- **Background Canvas (`#0F171B`)**: Base canvas for full-bleed shell, sidebar backgrounds, and structural frames.
- **Primary Surface (`#172329`)**: Default container tone for cards, actionable modules, and content panes.
- **Secondary Surface (`#1C2A30`)**: Elevated or nested surface tier used for subtle inner wells, input backgrounds, active navigational items, and card header elements.
- **Surface Hover / Highlight (`#22323A`)**: Interactive state color for secondary surfaces and list row highlights.
- **Structural Border (`#29383D`)**: Precise 1px hairline border applied to define cards, section dividers, and pill tags.
- **Primary Accent / Sage Green (`#8FC5A7`)**: Main interactive color used for primary CTA buttons, progress bars, active indicator pips, and key data highlights.
- **Accent Dark (`#527A64`)**: Deeper botanical green used for low-emphasis borders, active state glows, and icon containers.
- **Warning (`#D5B978`)**: Warm parchment-amber for soft alerts, timing warnings, and caution pills.
- **Danger (`#C98282`)**: Desaturated dusty crimson for missed deadlines, critical limits, and negative state warnings.

### Typography & Iconography Tones
- **Primary Text (`#F1F0E8`)**: Chalk white with high legibility for headlines, card titles, and active buttons.
- **Secondary Text (`#A6ADA9`)**: Cool celadon-gray for secondary metadata, descriptions, and standard icons.
- **Muted Text (`#747F7B`)**: Slate neutral for tracking-wider microcopy, inactive tags, key shortcuts, and disabled actions.

## Typography

The typographic system harmonizes three distinct typefaces to construct a disciplined editorial rhythm:

1. **Plus Jakarta Sans** serves as the primary system interface face. It handles main user headings, operational UI strings, primary card titles, and interactive control labels. Its clear apertures and sturdy geometry maintain legibility on dark surfaces.
2. **Newsreader** delivers literary cadence for editorial reflections, motivational quotes, insight card lead-ins, and ambient narrative passages. Always set with natural serif italicization and generous line heights.
3. **JetBrains Mono** powers academic discipline and systemic structure. All uppercase section anchors (`TODAY'S FOCUS`, `NEXT UP`, `DAILY PROGRESS`), telemetry metrics, and keyboard shortcuts utilize this monospaced family with deliberate letter-spacing (`0.08em` to `0.1em`) to anchor the interface visually without screaming.

## Layout & Spacing

The layout is constructed on an asynchronous, multi-pane productivity grid:

- **Navigation Rail / Sidebar**: Fixed at 260px on desktop screens, housing hierarchical category groups (`MAIN`, `LEARN`, `ACADEMICS`, `LIFE`, `GROWTH`, `COMMUNITY`) set off with 8px vertical link padding and 12px horizontal inset.
- **Main Working Canvas**: Fluid horizontal grid with a maximum content container of 1440px. The central workspace divides into:
  - Primary task feed (approx. 62%–65% width) focusing on queued obligations, action cards, and progress timelines.
  - Contextual intelligence panel (approx. 35%–38% width) hosting advisory cards, immediate next steps, and progress bars.
- **Vertical Rhythm**: 4px base increment. Macro section headers receive 32px to 40px top clearance and 16px bottom separation. List modules stack with 12px to 16px row gaps.
- **Breakpoints**:
  - `Desktop (>= 1200px)`: Full dual-column workspace with persistent left sidebar.
  - `Tablet (768px - 1199px)`: Sidebar collapses to 64px icon rail; intelligence panel drops below the primary action list into a continuous single stack.
  - `Mobile (< 768px)`: Sidebar recedes behind an off-canvas drawer; intelligence cards flow into a unified vertical column with 16px outer horizontal gutters.

## Elevation & Depth

Visual hierarchy is achieved strictly through tonal layering and razor-sharp border delineation rather than simulated drop shadows.

- **Base Canvas Layer (`#0F171B`)**: The deepest plain. Carries the overall screen canvas and passive non-clickable zones.
- **Tier 1 Containers (`#172329`)**: Actionable cards, banner notifications, and side panels sit one shade up, bound by a crisp hairline 1px border in `#29383D`. No heavy shadow is cast; the contrast provides crisp tactile separation.
- **Tier 2 Interactive Wells (`#1C2A30`)**: Inset containers, unselected button pills, nested code or prompt boxes, and active sidebar item backgrounds.
- **Ambient Focal Glows**: Subtle, low-opacity emerald/sage glows are reserved exclusively for critical active badges or selected indicator pips: `0 0 12px rgba(143, 197, 167, 0.15)`.
- **Dividers & Hairlines**: Horizontal rule dividers between table items or summary sections use `#29383D` set to 1px thickness with zero shadow.

## Shapes

The design system employs a refined modern geometry characterized by moderate curvature balanced with structural rectangular anchors:

- **Primary Cards & Intelligence Panels**: Formed with `16px` (`rounded-xl` to `rounded-2xl`) corner radius, delivering a contemporary software presence.
- **Interactive Action Buttons & Inputs**: Standardized at `8px` (`rounded-md` or `rounded-lg`) corner radius to maintain an intentional, tool-grade feel.
- **Badges, Tags, & Status Pills**: Full capsule pills (`9999px`) for metadata markers (`REBOOT`, `3 priorities`, `On Campus`, `Beta`).
- **Indicator Rings & Avatar Icons**: Circular geometry (`50%` / `rounded-full`) for profile pictures, active status nodes, and task radio bullets.

## Components

### Buttons
- **Primary Sage CTA**: Solid `#8FC5A7` background with `#0F171B` text, `rounded-md` (8px), padding `8px 16px`, `font-weight: 600`. Hover shifts to `#A2D4B9`.
- **Secondary Ghost / Outline**: `#1C2A30` background, 1px `#29383D` border, `#F1F0E8` text with subtle hover brightening to `#22323A` and border to `#527A64`.
- **Action Links**: Plain text in `#8FC5A7` or `#A6ADA9` accompanied by directional arrow glyphs (`→`), shifting on hover with a 2px horizontal slide.

### Action Cards & Modules
- Structured in `#172329` with `16px` border-radius and 1px border in `#29383D`.
- Left-edge accent strips (e.g. 3px vertical `#8FC5A7` bar) indicate queued or prioritized assignments.
- Card interiors integrate a padded header with mono-uppercase tracking badges, a bold `Plus Jakarta Sans` title, and a discrete right-aligned action trigger button.

### Badges & Status Chips
- Pill silhouette (`rounded-full`) using `#1C2A30` fill with 1px hairline `#29383D` outline.
- Text rendered in `JetBrains Mono` at `10px` or `11px`, fully uppercase with `0.08em` letter spacing.
- Variant: Active Insight tag combines an inner active dot (`#8FC5A7`, 6px) with an accompanying muted text label.

### Form Inputs & Search Fields
- Enclosed in `#172329` with `#29383D` borders and `8px` radius.
- Leading icons rendered in muted slate (`#747F7B`), with dynamic trailing keyboard shortcuts (e.g. `⌘K` or `/`) encapsulated inside a subtle secondary `#1C2A30` box.

### Lists & Priority Queues
- Grouped rows separated by subtle 1px divider lines or 8px vertical gaps.
- Numeric indexes displayed in monospaced secondary text (`01`, `02`, `03`).
- Subtext displays meta parameters (e.g., `Due tomorrow at 11:59 PM · Est. time: 35 min`) in `#A6ADA9`.

### Progress & Telemetry Bars
- Track: 4px or 6px tall channel filled with `#1C2A30`.
- Indicator: Continuous pill-capped bar filled with primary sage `#8FC5A7`.