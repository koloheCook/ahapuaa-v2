# Sprint 3 -- Context
**Phase:** Sprint 3 -- Polish + Building Selector UI
**Date:** 2026-05-27
**Status:** Ready for planning

---

## Domain

Wiring up the building selector UI and adding polish to the existing map interaction loop.
Sprint 2 left `this.selectedType = 'hale'` and `this.selectedTier = 0` hardcoded in
`GameScene.js`. Sprint 3 makes these dynamic, adds a hover tooltip, rejection feedback,
and reduces the tile gap between hex sprites.

**This sprint is UI-only.** No changes to `canPlace`, `processTick`, hydrology, or worldGen.

---

## Scope Boundary

**In:** selector panel, hover tooltip, rejection feedback, tile gap polish.
**Out:** dual-clock/ike system (Sprint 4), shore/water/forest sprites (post-capstone),
heiau building type (culturally blocked), tech tree, river path switching.

---

## Decisions

### Building Selector Panel

- **Position:** Fixed right-side panel. Full-height or tall partial, anchored to right edge.
- **Style:** Match existing HUD exactly.
  - Background: `rgba(0,0,0,0.7)`
  - Text color: `#e8d5a3`
  - Font: Georgia, serif
  - Same visual language as HUD panel (top-left) and End Turn button (bottom-right)
- **Active state:** Gold border (`#a07840`) + slightly lighter background on the selected button.
  - Consistent with End Turn button's border color.
- **Type buttons:** One button per building type -- hale, loi, loko-ia.
  - Each button includes placement cost: e.g., "Hale T1 -- 3 wood", "Loi -- 2 wood"
  - Costs sourced from `PLACEMENT_COSTS` in `src/game/buildings.js`
- **Tier row:** Always visible (tiers 1 / 2 / 3 buttons).
  - When loi or loko-ia is selected (single-tier), tiers 2 and 3 are disabled/greyed out.
  - No layout shift on type change.
- **Wiring:** Clicking a type button sets `this.selectedType` in GameScene.
  Clicking a tier button sets `this.selectedTier` (0-indexed: 0 = tier 1, 1 = tier 2, 2 = tier 3).

### Hover Tooltip

- **Implementation:** HTML `div` overlay, cursor-following.
  - Positioned near the pointer via `mousemove` JS event listener.
  - `pointer-events: none` so it does not intercept clicks.
  - Consistent with all existing UI (HUD, End Turn, selector = HTML).
- **Content (minimal -- match CLAUDE.md spec):**
  - Terrain type (e.g., flat, stream, shore)
  - Wet or Dry (from `tile.isWet`)
  - Placed building if any: type + tier (e.g., "Hale T1")
  - No placement eligibility hints -- tooltip is informational only
- **Position:** Follows cursor. Small offset (e.g., 12px right/down) so it does not obscure the tile.
- **Show/hide:** Visible when pointer is over a valid tile; hidden when pointer leaves the canvas.

### Rejection Feedback

- **Visual (tile flash):**
  - On failed `canPlace`, set tile image tint to red (`0xff0000`).
  - Restore original tint after ~300ms using `this.time.delayedCall(300, callback)`.
  - Do NOT use `setTimeout` -- Phaser's game-clock timer (`this.time.delayedCall`) pauses
    with the game and integrates cleanly with scene lifecycle (Check Phaser 4 first rule).
  - Original tint = terrain tint if the tile has one (ocean/stream/forest), otherwise clear tint.
    Building tint only applies on successful placement.

- **Reason text (dev-mode):**
  - Fixed zone at the bottom of the right-side selector panel.
  - Appears immediately on rejection with player-friendly text.
  - Fades out after ~3 seconds (CSS `opacity` transition, not a Phaser tween -- this is HTML).
  - **Toggle:** Keyboard shortcut `D` toggles reason text on/off.
    Consistent with existing feature-flag pattern (`debugMode`, `devHideForest`).
    Default: on during dev sessions.

- **Reason text format -- player-friendly (not raw `canPlace` strings):**

  | canPlace reason | Display text |
  |---|---|
  | `"tile already occupied"` | `"Tile already occupied"` |
  | `"must harvest forest (forestLevel > 0) before building here"` | `"Clear forest first"` |
  | `"mountain tiles are not buildable"` | `"Can't build on mountain"` |
  | `"hale requires land tile, got ocean"` | `"Hale needs land"` |
  | `"loi requires wet tile"` | `"Loi needs a wet tile"` |
  | `"loi requires flat or stream tile, got ..."` | `"Loi needs flat or stream"` |
  | `"loko-ia requires wet tile"` | `"Loko-ia needs a wet tile"` |
  | `"loko-ia requires shore or stream tile, got ..."` | `"Loko-ia needs shore or stream"` |
  | `"insufficient resources - need {"wood":3}"` | `"Not enough wood (need 3)"` -- parse cost object |
  | `"tier 1 hale requires carpentry tech"` | `"Requires Carpentry tech"` |
  | `"tier 2 hale requires carpentry + masonry"` | `"Requires Carpentry + Masonry"` |

### Tile Gap Polish

- **Root cause:** `TILE_SCALE = 54 / 120` scales Kenney hex sprites to cell width.
  The hex polygon in the frame is ~96px tall (not 120px) -- the remaining ~24px are
  transparent margin. After scaling, the visible polygon is ~43px tall inside a 63px frame,
  leaving a visible gap between hex rows.
- **Fix:** Increase `TILE_SCALE` to approximately `54 / 96` so the polygon fills the cell.
  Sprites will overlap slightly at edges -- gap disappears.
- **Empirical tuning:** Exact value may need browser verification.
  Try `54/96 = 0.5625` first; adjust if overlap is too aggressive.
- **Constraint:** Do NOT change `map.tileToWorldXY` -- it is canonical and locked.
  Do NOT change tile data indexing (`tiles[col][row]` column-first).

---

## Architectural Constraints (carry forward)

- `src/game/` has zero Phaser imports. Do not violate.
- Canvas is map only. All UI (selector panel, tooltip, rejection text) is HTML.
- `map.tileToWorldXY(col, row)` is the only correct way to get pixel centers.
- `this.time.delayedCall` over `setTimeout` for any timed canvas-side action (Phaser game-clock).
- Building selector wires to `this.selectedType` and `this.selectedTier` in GameScene -- do not
  move selection state into a separate module.

---

## Canonical Refs

- `CLAUDE.md` -- coordinate system, asset keys, Sprint 3 done-when criteria, "Check Phaser 4 first" rule
- `src/scenes/GameScene.js` -- current state (`this.selectedType`, `BUILDING_TINT`, `TILE_SCALE = 54/120`, `updateHUD`)
- `src/game/buildings.js` -- `canPlace()` reason strings, `PLACEMENT_COSTS` (cost display source)
- `index.html` -- existing HUD + End Turn button markup/style reference (match this style)

---

## Code Context (reusable assets)

- `BUILDING_TINT` map in `GameScene.js` -- `{ hale: 0xffd700, loi: 0x00ffcc, 'loko-ia': 0x4488ff }` -- reuse for active selection tint hints if needed
- `PLACEMENT_COSTS` in `buildings.js` -- `{ hale: [{wood:3}, {wood:5,stone:2}, {wood:5,stone:5}], loi: [{wood:2}], 'loko-ia': [{stone:3}] }` -- source for button cost labels
- `this.tileImages[${col},${row}]` -- registry of all stamped Image objects, used for tint operations
- Existing HUD inline styles in `index.html` -- copy these for selector panel (no CSS file; inline styles only)

---

## Deferred Ideas

None.
