# Disco Grid Layout Widths

Package: `@ta-interaktiv/react-disco-grid`

Containers that mimic the Tages-Anzeiger disco article grid. Use these for layout widths so content aligns with the CMS article.

```tsx
import {
  TextWidth,
  TextWidthExtended,
  TextWidthExtendedFullMobile,
  ContentWidth,
  ArticleWidth,
  Grid,
  FullWidth, // alias of Centered outer wrapper
} from '@ta-interaktiv/react-disco-grid'
```

## Available containers (narrow → wide)

| Component | CSS class | Typical use | Grid span (≥768px) | Mobile behavior |
| --- | --- | --- | --- | --- |
| `TextWidth` | `text-width` | Body text, captions | cols **3–10** (`3 / span 8`) | centered, `max-width: 540px` |
| `TextWidthExtended` | `text-width-extended` | Charts, slightly wider than text | cols **2–11** (`2 / span 10`) | full content padding, no bleed |
| `TextWidthExtendedFullMobile` | `text-width-extended-full-mobile` | Charts that should edge-to-edge on phone | cols **2–11** (`2 / span 10`) | bleeds ±2rem (`width: calc(100% + 4rem)`) |
| `ContentWidth` | `content-width` | Full content column (widest in-grid) | cols **1–12** (`1 / -1`) | full content area, padding reset ≤712px |
| `ArticleWidth` | `article-width` | Almost article-bleed visuals | cols **1–12** + ±4rem bleed ≥712px | same as ContentWidth on small screens |
| `FullWidth` / `Centered` | `centered` | Outer page centering shell | outer 3-col shell (see below) | — |
| `Grid` | wraps `.content` | Low-level 12-col grid | — | — |

### Width hierarchy (mental model)

```
TextWidth  <  TextWidthExtended  ≤  TextWidthExtendedFullMobile  <  ContentWidth  <  ArticleWidth  <  viewport
     8/12              10/12                         10/12 (+ mobile bleed)         12/12         12/12 + side bleed
```

## Outer grid (`Centered` / `FullWidth`)

Centers the content column. Max content width is **1100px** from `1222px` viewport upward.

| Viewport | Outer columns |
| --- | --- |
| < 1222px | `0 1fr` (content in col 2) |
| ≥ 1222px | `1fr 1100px 1fr` |

## Inner 12-column grid (`.content`)

Activated from **768px**. Column gap: `2.4rem` (≥768px), `3.2rem` (≥1222px). Side padding grows with breakpoints (2rem → 2.7rem → 2.4rem → 4rem).

## Props (all width containers)

Shared optional props: `children`, `style`, `className`.

`Grid` also accepts `disableInnerGrid?: boolean`.

## Usage notes for this repo

- Prefer package containers over custom max-widths so the MF matches disco articles.
- In `Chart`, `frameWidth` / `contentWidth` accept the names above plus a local `FullWidth` (`width: 100%`) — that local `FullWidth` is **not** the package export.
- Do not nest width containers unnecessarily; each container already wraps its own `Grid`.
