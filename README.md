# Handoff: Bookmark Search — Chrome Extension Popup

## Overview
A Chrome extension popup that lets users search and filter their bookmarks instantly, with a Google-search fallback when nothing matches. The UI is a premium frosted-glass ("glassmorphism") panel with automatic light/dark theming, full RTL support for Arabic bookmark titles, real website favicons, and keyboard shortcuts.

Target runtime: a Chrome extension popup (Manifest V3). The popup window is **380 × 500 px**.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes that show the intended look and behavior, not production code to copy directly. The DC (`.dc.html`) files use an internal prototyping runtime (`support.js`, `x-dc`, `renderVals()`); **do not port that runtime.** Instead, recreate these designs in the extension's real environment using its established patterns and libraries.

Recommended stack for a Chrome extension popup: **React + TypeScript + Vite** with the `chrome.bookmarks` and `chrome.tabs` APIs. If a codebase already exists, follow its conventions. The prototype logic lives in a class with a `renderVals()` method — treat that as pseudo-code for the component's state and derived values, and translate it to hooks (`useState`, `useEffect`, `useMemo`).

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, blur values, and interactions are all final and exact. Recreate the UI pixel-perfectly. Every concrete value is listed under **Design Tokens** below.

## Key differences from the prototype (important)
The prototype uses mock data and web shims. In the real extension:
- **Bookmarks** come from `chrome.bookmarks.getTree()` / `chrome.bookmarks.search()`, not the hardcoded `BOOKMARKS` array.
- **Favicons** in the prototype use `https://www.google.com/s2/favicons?domain=<d>&sz=128`. In an MV3 extension, prefer the extension favicon API: `chrome://favicon` is deprecated — use `chrome.runtime.getURL("/_favicon/?pageUrl=" + encodeURIComponent(url) + "&size=32")` (requires the `"favicon"` permission). Keep the letter-chip fallback for load failures.
- **Opening links**: the prototype uses `<a href>` / `window.open`. In the extension use `chrome.tabs.create({ url })` (or `chrome.tabs.update` for current tab), then `window.close()` the popup.
- **Theme**: driven by `window.matchMedia('(prefers-color-scheme: dark)')` — keep as is.

---

## Screens / Views

### 1. Popup (single view: `QuranPopup`)
**Purpose:** User types in the search box; the bookmark list filters live. If nothing fits, they hit the Google fallback row.

**Outer layout (top → bottom), fixed 380 × 500 px column, `display:flex; flex-direction:column`:**

The whole popup is a frosted-glass card:
- `border-radius: 16px`
- Dark: `background: rgba(20,24,33,0.45)`; `backdrop-filter: blur(24px) saturate(120%)`; `border: 1px solid rgba(255,255,255,0.07)`; `box-shadow: 0 24px 70px rgba(0,0,0,0.6)`
- Light: `background: rgba(255,255,255,0.75)`; `backdrop-filter: blur(20px) saturate(120%)`; `border: 1px solid rgba(255,255,255,0.5)`; `box-shadow: 0 24px 70px rgba(79,70,229,0.16)`
- Theme transitions animate over `0.4s ease` (background, border-color, box-shadow, color).

> Note: In an actual Chrome popup, `backdrop-filter` has nothing behind it to blur (the popup floats over the page). The glass effect reads against the popup's own gradient backdrop / ambient glow blobs. Keep the translucent background + a subtle internal gradient so the frosted look survives. The prototype's outer gradient stage (`radial-gradient(...)` + two blurred glow circles) is the ambient layer that makes the glass read — reproduce a lightweight version as the popup `body` background.

**A. Header** — `flex:none; padding:16px 16px 12px`
- A single pill-shaped search field: `height:42px; border-radius:999px; padding:0 14px; display:flex; align-items:center; gap:9px`.
  - Dark bg `rgba(255,255,255,0.05)`, border `1px solid rgba(255,255,255,0.1)`. Light bg `rgba(255,255,255,0.6)`, border `1px solid rgba(15,23,42,0.09)`.
  - Left: magnifier icon, 16×16, `opacity:0.6`, `currentColor`.
  - Middle: text `<input>`, transparent, no border/outline, `font-size:14px; font-weight:500`, `dir="auto"`. Placeholder `"Search bookmarks..."`.
  - Right (only when query non-empty): a circular clear button "✕", 20×20, `border-radius:999px`, muted color. Clears the query.
- There is **no theme toggle button** — theme is automatic via `prefers-color-scheme`.

**B. Results list** — `flex:1; overflow-y:auto; padding:2px 8px 6px; min-height:0`
- Custom scrollbar: width 6px, transparent track, thumb `rgba(255,255,255,0.14)` (dark) / `rgba(15,23,42,0.16)` (light), `border-radius:10px`.
- Each result row is a link, `display:flex; align-items:center; gap:11px; padding:9px 10px; border-radius:12px`. Hover background: dark `rgba(255,255,255,0.06)`, light `rgba(255,255,255,0.85)`. Rows fade in with a `qtFade` keyframe (opacity 0→1, translateY 4px→0, 0.25s ease).
  - **Favicon chip (left):** 32×32, `border-radius:9px`, `overflow:hidden`, border `1px solid rgba(255,255,255,0.14)` (dark) / `rgba(255,255,255,0.7)` (light), `box-shadow:0 2px 8px rgba(0,0,0,0.16)`.
    - If a favicon is available: white background `#ffffff`, `<img>` 20×20 `object-fit:contain`.
    - Fallback (no icon / load error): background is a per-domain gradient (see gradient list in tokens), centered uppercase first letter in white, `font-size:13px; font-weight:600`.
  - **Text column (middle):** `flex:1; min-width:0`. `text-align` is `right` for Arabic titles, else `left`.
    - Title: `font-size:13.5px; font-weight:500; line-height:1.35`, single line, ellipsis truncation (`white-space:nowrap; overflow:hidden; text-overflow:ellipsis`), `dir="auto"`.
    - Domain subtitle: `font-size:11px; line-height:1.35`, muted color, ellipsis truncated, `margin-top:1px`. `dir` is `rtl` for Arabic-titled rows, else `ltr` (so the whole row reads naturally RTL).
  - **Shortcut badge (right):** shown for the first 9 results, labeled `1`–`9`. `min-width:22px; height:22px; padding:0 6px; border-radius:7px; font-size:11px; font-weight:600`. Dark: bg `rgba(255,255,255,0.08)`, text `rgba(255,255,255,0.9)`. Light: bg `rgba(15,23,42,0.05)`, text `rgba(30,41,59,0.6)`.
- **Empty state** (no matches): centered, static text **"No bookmarks found"** — do NOT echo the query (it's already visible in the input and Google row). `padding:26px 16px 12px; font-size:12.5px`, muted color.

**C. Google fallback row (sticky footer)** — `flex:none; padding:10px 12px 12px; border-top:1px solid <divider>`
- A link row, `display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:12px; position:relative; overflow:hidden`.
  - Dark bg `rgba(255,255,255,0.035)`, hover `rgba(255,255,255,0.08)`. Light bg `rgba(255,255,255,0.55)`, hover `rgba(255,255,255,0.9)`. Border = divider color.
  - **Left accent bar:** a 3px-wide vertical strip, `linear-gradient(180deg,#4285F4 0%,#EA4335 33%,#FBBC05 66%,#34A853 100%)` (Google brand colors), absolutely positioned at the left edge.
  - **Google glyph chip:** 30×30, `border-radius:9px`, bg = badge bg, contains the 4-color Google "G" SVG at 16×16.
  - **Label:** `font-size:13px; font-weight:500`, ellipsis truncated, `dir="auto"`. Reads: `Search Google for "<query>"` where the query span is colored (dark `#c9a97e` warm gold, light `#2563eb` blue), `font-weight:600`. When query is empty, the label shows `"bookmarks"` as the placeholder term.
  - **"G" shortcut badge:** same styling as the 1–9 badges (per-theme), label `G`, positioned just left of the arrow icon.
  - **Arrow icon:** 14×14 up-right arrow ("open external"), `opacity:0.5`, `currentColor`.
- **Disabled/empty behavior:** When the search input is **empty**, this whole row is `opacity:0.4; pointer-events:none` (visible but non-interactive, so layout height stays constant). When the query is non-empty, it's `opacity:1; pointer-events:auto`. Opacity animates `0.2s ease`.

---

## Interactions & Behavior
- **Live filtering:** on every input change, filter bookmarks case-insensitively by title OR domain containing the trimmed query. Empty query → show all bookmarks.
- **Clear button:** appears only when query is non-empty; clears the query and refocuses input.
- **Row click:** opens the bookmark URL (extension: `chrome.tabs.create({url})` then `window.close()`).
- **Google row click:** opens `https://www.google.com/search?q=<encodeURIComponent(query)>`. Disabled when query empty.
- **"G" keyboard shortcut:** pressing `g`/`G` (no modifier keys) triggers the Google search for the current query — **but only if** the query is non-empty AND focus is not in an input/textarea/contentEditable (so typing "g" in the search box never triggers it). `preventDefault()` when it fires.
- **Number shortcuts (1–9):** the prototype displays these badges but does not yet wire the keypress. Recommended to implement in the real extension: pressing `1`–`9` (when not typing in the field) opens the corresponding visible result. Confirm desired behavior with the team.
- **Theme:** read `prefers-color-scheme` on mount and subscribe to its `change` event; swap the full token set. Transitions animate at 0.4s.
- **Favicon error handling:** track failed domains in state; on `<img> onError`, mark that domain failed and render the gradient letter-chip fallback instead.

## State Management
- `query: string` — current search text.
- `prefersDark: boolean` — from `matchMedia('(prefers-color-scheme: dark)')`; also listen for changes.
- `failed: Record<string, boolean>` — domains whose favicon failed to load (→ use letter fallback).
- Derived (memoize): `filtered` bookmark list; per-item view model (`title, url, domain, initial, isRtl, showIcon, iconUrl, badgeBg, shortcut`); `hasQuery`; Google row `opacity`/`pointerEvents`; `googleHref`; theme token object `t`.
- A `theme` prop with values `'auto' | 'light' | 'dark'` (default `'auto'`) selects fixed vs. system theme — used by the comparison sheet to force each mode. The real extension only needs `'auto'`.

## Design Tokens

### Dark theme
- Container bg `rgba(20,24,33,0.45)`; blur `blur(24px) saturate(120%)`; border `rgba(255,255,255,0.07)`; shadow `0 24px 70px rgba(0,0,0,0.6)`
- Ambient stage bg `radial-gradient(130% 90% at 18% 0%, #2a2724 0%, #1c1a18 48%, #100f0e 100%)`; glow blobs `#4a4540` and `#3a3632`
- Text `#f2efec`; muted `rgba(235,230,224,0.5)`
- Search bg `rgba(255,255,255,0.05)`, border `rgba(255,255,255,0.1)`
- Row hover `rgba(255,255,255,0.06)`
- Badge bg `rgba(255,255,255,0.08)`, badge text `rgba(255,255,255,0.9)`
- Divider `rgba(255,255,255,0.07)`; favicon ring `rgba(255,255,255,0.14)`
- Google row bg `rgba(255,255,255,0.035)`, hover `rgba(255,255,255,0.08)`, query text `#c9a97e`
- Scrollbar thumb `rgba(255,255,255,0.14)`

### Light theme
- Container bg `rgba(255,255,255,0.75)`; blur `blur(20px) saturate(120%)`; border `rgba(255,255,255,0.5)`; shadow `0 24px 70px rgba(79,70,229,0.16)`
- Ambient stage bg `radial-gradient(130% 90% at 82% 0%, #dbe4ff 0%, #eef2ff 42%, #f5f3ff 100%)`; glow blobs `#a5b4fc` and `#c4b5fd`
- Text `#1e293b`; muted `rgba(30,41,59,0.5)`
- Search bg `rgba(255,255,255,0.6)`, border `rgba(15,23,42,0.09)`
- Row hover `rgba(255,255,255,0.85)`
- Badge bg `rgba(15,23,42,0.05)`, badge text `rgba(30,41,59,0.6)`
- Divider `rgba(15,23,42,0.08)`; favicon ring `rgba(255,255,255,0.7)`
- Google row bg `rgba(255,255,255,0.55)`, hover `rgba(255,255,255,0.9)`, query text `#2563eb`
- Scrollbar thumb `rgba(15,23,42,0.16)`

### Favicon fallback gradients (pick by hashing the domain, modulo list length)
`linear-gradient(135deg,#6366f1,#8b5cf6)`, `(#0ea5e9,#2563eb)`, `(#10b981,#059669)`, `(#f59e0b,#d97706)`, `(#ec4899,#a855f7)`, `(#06b6d4,#3b82f6)`, `(#f43f5e,#e11d48)`, `(#14b8a6,#0d9488)` — all `135deg`.

### Geometry & type
- Popup: 380 × 500 px. Card radius 16px. Row radius 12px. Chip radius 9px. Badge radius 7px. Search pill radius 999px.
- Fonts: **Poppins** (400/500/600) for Latin, **Cairo** (400/500/600/700) for Arabic — loaded from Google Fonts. Stack: `'Poppins','Cairo',system-ui,sans-serif`. Arabic falls back to Cairo automatically.
- Sizes: title 13.5px/500, domain 11px, badge 11px/600, Google label 13px/500, empty state 12.5px, input 14px/500.
- Keyframe `qtFade`: `from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:none }`, 0.25s ease.

### RTL detection
A title is RTL if it matches `/[\u0600-\u06FF]/` (Arabic Unicode block). RTL rows: text column `text-align:right`, domain `dir="rtl"`. All titles use `dir="auto"` so mixed content aligns naturally.

## Assets
- **Fonts:** Poppins + Cairo via `https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Poppins:wght@400;500;600&display=swap`. In an extension, bundle these locally (don't hit a CDN from a popup for offline/perf/CSP reasons).
- **Favicons:** runtime, per bookmark (see "Key differences" — use the extension favicon API).
- **Google "G" logo:** inline 4-path SVG (colors `#4285F4 / #34A853 / #FBBC05 / #EA4335`) — see the Google row markup in `QuranPopup.dc.html`.
- **Icons:** magnifier, up-right arrow, clear "✕", theme sun/moon — all inline SVG in the prototype. The Nocturne design system specifies **Phosphor icons**; use those in the real build.
- **Extension icon (logo):** see `Extension Icon.dc.html` / `ExtIcon.dc.html` — a frosted-glass squircle combining a magnifying glass + bookmark, in charcoal/navy tones. Note this is a live `backdrop-filter` design; for the shipped PNG icon assets (16/32/48/128) it must be **baked/rasterized** — the transparent glass won't render in flat PNGs without a background. Ask the design team for exported PNGs, or flatten over a solid tile.

## Files
- `QuranPopup.dc.html` — **the popup component** (template + logic). This is the primary reference. Read the `renderVals()` method and `THEMES`/`BOOKMARKS`/`GRADIENTS` constants at the bottom.
- `Quran Tab Bookmark Popup.dc.html` — the presentation sheet showing Light + Dark side by side (not a shippable screen; a comparison canvas).
- `Extension Icon.dc.html` — extension logo presentation sheet (sizes + toolbar mocks).
- `ExtIcon.dc.html` — the extension icon component itself.

The design also nominally uses the **Nocturne** design system (dark, compact, Inter + Phosphor icons, accent `#9184d9`). The popup itself uses its own Poppins/Cairo glass treatment per the product brief; if your codebase already has Nocturne primitives, reuse them for shared chrome, but match the exact glass tokens above for this popup.
