---
phase: sprint-3
plan: sprint-3-PLAN-03
subsystem: ui
tags: [tooltip, rejection-feedback, phaser4, html-overlay]

requires:
  - phase: sprint-3-PLAN-02
    provides: updateSelector(), #selector-panel, #rejection-reason, SINGLE_TIER_TYPES

provides:
  - Cursor-following HTML tooltip showing terrain type, Wet/Dry status, placed building (type + tier), and (col,row) coordinates
  - Red tint flash (300ms via this.time.delayedCall) on failed placement, restoring building tint or terrain tint
  - Player-friendly rejection reason text in #rejection-reason with CSS opacity fade-out over 3s
  - D-key toggle for rejection text display (default on)
  - friendlyReason() module-level function mapping canPlace reason strings to display text
  - cap() module-level utility function

affects: [sprint-4, any future plan touching pointerdown handler or canPlace reason strings]

tech-stack:
  added: []
  patterns:
    - CSS transition restart via transition:none -> opacity:1 -> rAF -> transition:opacity 3s -> opacity:0
    - canvas-relative pointer coords corrected to viewport coords via canvasRect.getBoundingClientRect()

key-files:
  created: []
  modified:
    - index.html (T01 -- #tooltip div, committed cb3434a)
    - src/scenes/GameScene.js (T02 -- tooltip handler, rejection feedback, D-key toggle)

key-decisions:
  - "canvasRect cached at create() time and used to offset pointer.x/y to viewport coordinates for position:fixed tooltip"
  - "delayedCall tint restore checks tile.buildingId first; restores BUILDING_TINT if occupied, TERRAIN_TO_TINT or clearTint if not"
  - "col/row coordinates included in tooltip (user request from Plan 02 checkpoint)"
  - "tooltip innerHTML is safe -- all dynamic values are internal game enums (terrainType, building.type) and integer coords"
  - "rejection-reason uses textContent (not innerHTML) per threat model T-s3-05"

patterns-established:
  - "Tooltip positioning: cache canvasRect in create(), add to pointer.x/y for position:fixed placement"
  - "Tint restore priority: building tint > terrain tint > clearTint()"

bugs-fixed-post-plan:
  - "Tooltip offset: pointer.x is canvas-relative; position:fixed needs viewport coords (canvasLeft was -222.5px)"
  - "Occupied tile re-click: red flash was calling clearTint() on loi/hale tiles; fixed to restore building tint"
---

## What was built

Sprint 3 Plan 03 closes the interaction feedback loop started by Plan 02.

**Tooltip** (`#tooltip` div, cursor-following):
- Terrain type (capitalized), Wet/Dry, placed building if any, and `(col,row)` coordinates
- Follows cursor via `pointer.x/y + canvasRect offset`, hidden on `pointerout`

**Rejection feedback** (failed placements):
- Red tint flash on the tile for 300ms via `this.time.delayedCall` (no setTimeout)
- `friendlyReason()` maps all documented `canPlace` reason strings to player-friendly text
- Reason text appears in `#rejection-reason` and fades out over 3s via CSS opacity transition

**D-key toggle**: `this.showRejectionText` flag; pressing D hides/restores rejection text display

## Commits

- `b0fab45` -- feat(sprint-3-plan-03): tooltip handler, rejection feedback, D-key toggle
- `fccdb59` -- fix(sprint-3-plan-03): tooltip viewport offset and building tint restore
