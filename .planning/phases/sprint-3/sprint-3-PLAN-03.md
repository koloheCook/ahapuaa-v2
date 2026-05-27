---
phase: sprint-3
plan: sprint-3-PLAN-03
type: execute
wave: 3
depends_on:
  - sprint-3-PLAN-02
files_modified:
  - index.html
  - src/scenes/GameScene.js
autonomous: false
requirements:
  - SPRINT3-TOOLTIP
  - SPRINT3-REJECTION-FEEDBACK
  - SPRINT3-D-KEY-TOGGLE
must_haves:
  truths:
    - Hovering over a valid tile shows a cursor-following HTML tooltip with terrain type, Wet/Dry status, and placed building if any
    - Tooltip is hidden when the pointer leaves the canvas area or lands on an out-of-bounds tile coordinate
    - Failed placement flashes the tile red for ~300ms then restores the original terrain tint
    - A player-friendly rejection reason appears in #rejection-reason at the bottom of the selector panel and fades out over 3 seconds
    - Pressing D on the keyboard toggles rejection reason text off/on; default is on
    - All timed canvas effects use this.time.delayedCall (not setTimeout)
---

<objective>
Add hover tooltip and rejection feedback to complete the Sprint 3 interaction loop.

Purpose: After the selector panel (Plan 02) players can choose what to build. This plan closes
the feedback loop: hovering shows tile info before committing, and failed placements report why
they failed with a red tile flash and a fading text reason in the panel.

Output:
- index.html with #tooltip div and no other structural changes
- GameScene.js with pointermove handler (tooltip), expanded pointerdown handler (rejection flash
  + reason text), and D-key toggle for the reason text display
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/sprint-3/sprint-3-CONTEXT.md
@.planning/phases/sprint-3/sprint-3-PLAN-02-SUMMARY.md

<interfaces>
<!-- Key identifiers and values from source files. Sourced from codebase reads. -->

From src/scenes/GameScene.js (read in planning session):
  TERRAIN_TO_TINT = { ocean: 0x2255bb, stream: 0x2255bb, forest: 0x1a5c1a }
  BUILDING_TINT = { hale: 0xffd700, loi: 0x00ffcc, 'loko-ia': 0x4488ff }
  this.tileImages[`${col},${row}`]  -- Phaser Image object for each tile
  state.tiles[col][row]             -- tile data: { terrainType, isWet, buildingId, ... }
  canPlace(tile, type, tier, state) returns { ok: boolean, reason: string }
  this.time.delayedCall(ms, callback) -- Phaser game-clock timer (use this, NOT setTimeout)
  updateSelector(scene) -- module-level function added by Plan 02

From src/game/buildings.js (canPlace reason strings -- map to player-friendly text):
  'tile already occupied'                                     -> 'Tile already occupied'
  'must harvest forest (forestLevel > 0) before building here' -> 'Clear forest first'
  'mountain tiles are not buildable'                          -> "Can't build on mountain"
  'hale requires land tile, got ocean'                        -> 'Hale needs land'
  (any 'hale requires land tile, got ...')                    -> 'Hale needs land'
  'loi requires wet tile'                                     -> 'Loi needs a wet tile'
  (any 'loi requires flat or stream tile, got ...')           -> 'Loi needs flat or stream'
  'loko-ia requires wet tile'                                 -> 'Loko-ia needs a wet tile'
  (any 'loko-ia requires shore or stream tile, got ...')      -> 'Loko-ia needs shore or stream'
  (any 'insufficient resources - need ...')                   -> parse cost object; e.g. 'Not enough wood (need 3)'
  'tier 1 hale requires carpentry tech'                       -> 'Requires Carpentry tech'
  'tier 2 hale requires carpentry + masonry'                  -> 'Requires Carpentry + Masonry'
  fallback (any unmatched reason)                             -> reason string verbatim

From state.buildings[buildingId]:
  { type: string, tier: number }  -- used to display "Hale T1" in tooltip

From index.html (existing element ids and style language):
  #hud, #end-turn, #selector-panel, #rejection-reason  -- all already in place after Plan 02
</interfaces>
</context>

<tasks>

<task id="T01" type="execute">
  <title>Add #tooltip div to index.html</title>
  <read_first>
    - index.html -- read the full file as updated by Plan 02; add tooltip div after #selector-panel
      and before the script tag
  </read_first>
  <action>
    Add a div with id="tooltip" inside body, positioned after the #selector-panel div and before
    the script tag.

    Inline style:
      position:fixed; display:none; pointer-events:none
      background:rgba(0,0,0,0.8); color:#e8d5a3; font-family:Georgia,serif; font-size:13px
      padding:8px 10px; border-radius:4px; line-height:1.6; max-width:160px
      white-space:nowrap; z-index:100

    Leave the div empty -- GameScene.js sets its innerHTML and top/left position at runtime.

    No other changes to index.html.
  </action>
  <acceptance_criteria>
    - index.html contains a div with id="tooltip" with display:none and pointer-events:none
    - The #tooltip div appears in the DOM after #selector-panel
    - No other existing elements are modified
  </acceptance_criteria>
</task>

<task id="T02" type="execute">
  <title>Add pointermove tooltip handler and expanded pointerdown rejection feedback to GameScene.js</title>
  <read_first>
    - src/scenes/GameScene.js -- read the full file as updated by Plan 02; locate the existing
      pointermove handler (lines ~102-106 in original; Pan logic only -- extend this block or add
      a second pointermove listener), the pointerdown handler block, and the module-level area after
      updateHUD where updateSelector was added
    - .planning/phases/sprint-3/sprint-3-CONTEXT.md -- confirms reason string -> display text mapping,
      delayedCall rule, CSS opacity transition rule for reason text, D-key toggle default (on)
  </read_first>
  <action>
    Make three additions to GameScene.js inside create() and one addition to the pointerdown
    handler. All are inside or appended to the existing create() method.

    --- ADDITION 1: Tooltip refs and showRejectionText flag (after selector wiring, before pointerdown) ---

    Add these two lines after the updateSelector(this) initialization call:
      const tooltipEl = document.getElementById('tooltip');
      this.showRejectionText = true;

    --- ADDITION 2: Second pointermove handler for tooltip ---

    Add a new this.input.on('pointermove', ...) handler after the existing camera-pan pointermove
    handler. Phaser allows multiple listeners on the same event. This handler must NOT be inside
    the camera-pan handler.

    Handler logic:
    a) Convert pointer screen position to world position:
         const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    b) Convert world position to tile:
         const tileXY = this.map.worldToTileXY(worldPoint.x, worldPoint.y);
    c) If tileXY is null or col/row is out of bounds (col < 0 || col >= COLS || row < 0 || row >= ROWS):
         set tooltipEl.style.display = 'none' and return.
    d) Read the tile:
         const col = tileXY.x, row = tileXY.y;
         const tile = state.tiles[col][row];
    e) Build tooltip HTML:
         First line: tile.terrainType (capitalize first letter)
         Second line: tile.isWet ? 'Wet' : 'Dry'
         Third line (only if tile.buildingId is not null):
           look up state.buildings[tile.buildingId];
           display as e.g. "Hale T" + (building.tier + 1)  (tier is 0-indexed internally)
         Concatenate with HTML br tags.
    f) Set tooltipEl.innerHTML to the built string.
    g) Position tooltip near pointer: tooltipEl.style.left = (pointer.x + 14) + 'px';
       tooltipEl.style.top = (pointer.y + 14) + 'px';
    h) Set tooltipEl.style.display = 'block'.

    Also add a this.input.on('pointerout', () => { tooltipEl.style.display = 'none'; }) handler
    to hide the tooltip when pointer leaves the canvas.

    --- ADDITION 3: D-key toggle ---

    Add a keyboard listener after the tooltip handler block:
      this.input.keyboard.on('keydown-D', () => {
        this.showRejectionText = !this.showRejectionText;
        if (!this.showRejectionText) {
          document.getElementById('rejection-reason').style.opacity = '0';
        }
      });

    --- ADDITION 4: Expand the existing pointerdown handler ---

    In the existing pointerdown handler, the current else branch is missing -- canPlace returning
    ok:false currently does nothing. Add an else branch to the canPlace check:

    When canPlace returns { ok: false, reason }:
    a) Red tint flash: get the tile image: const img = this.tileImages[`${col},${row}`];
       If img exists: call img.setTint(0xff0000).
       Then use this.time.delayedCall(300, () => {
         const origTint = TERRAIN_TO_TINT[tile.terrainType];
         if (origTint !== undefined) {
           img.setTint(origTint);
         } else {
           img.clearTint();
         }
       });

    b) Reason text: define a helper function friendlyReason(reason) at module level (after
       updateSelector) that maps canPlace reason strings to player-friendly text per the table
       in the context interfaces block above.
       Rules:
       - Exact match first.
       - Prefix match for variable-suffix reasons:
         - starts with 'hale requires land tile' -> 'Hale needs land'
         - starts with 'loi requires flat or stream tile' -> 'Loi needs flat or stream'
         - starts with 'loko-ia requires shore or stream tile' -> 'Loko-ia needs shore or stream'
       - starts with 'insufficient resources - need' -> parse the JSON object from the reason string.
         The format is: 'insufficient resources - need {"wood":3}' or '{"wood":5,"stone":2}'.
         Extract the JSON substring after 'need ', JSON.parse it, then format as:
         'Not enough [resource] (need [amount])' for each entry. If multiple resources, join with ' + '.
       - starts with 'tier 1 hale' -> 'Requires Carpentry tech'
       - starts with 'tier 2 hale' -> 'Requires Carpentry + Masonry'
       - fallback: return the reason string verbatim.

    c) Display in rejection-reason div:
       const rrEl = document.getElementById('rejection-reason');
       const msg = friendlyReason(reason);
       rrEl.textContent = msg;
       Set rrEl.style.transition = 'none'; then rrEl.style.opacity = '1'.
       Then use a requestAnimationFrame callback to set
       rrEl.style.transition = 'opacity 3s' and rrEl.style.opacity = '0' in the next frame.
       Only do this if this.showRejectionText is true. If false, leave rrEl untouched.

    Note on CSS transition approach: setting transition to 'none' then opacity to '1' in the
    same frame, followed by setting transition back and opacity to '0' in the next frame, forces
    the browser to snap to opacity:1 before starting the fade. This is the correct pattern for
    restart-on-retrigger. If a simpler approach is used (directly setting opacity:1 then opacity:0),
    the browser may batch them and skip the visible state. Use requestAnimationFrame to ensure the
    visible state is painted before fade begins.
  </action>
  <acceptance_criteria>
    - In the running game, mousing over a flat tile shows a tooltip with "Flat" (or "flat" -- exact casing
      is acceptable), "Dry" or "Wet", and no building line (unless a building is placed)
    - After placing a hale, hovering that tile shows "Hale T1" (or equivalent) in the tooltip
    - Tooltip moves with the cursor and disappears when pointer leaves the game area
    - Attempting to place on a mountain tile flashes the tile red briefly (~300ms) then restores stone tint
    - Attempting to place on an ocean tile without meeting requirements flashes red then restores ocean tint (0x2255bb)
    - #rejection-reason text appears ("Can't build on mountain" etc.) and fades out over ~3s
    - Pressing D hides rejection text; pressing D again re-enables it
    - No setTimeout calls introduced -- all timed canvas effects use this.time.delayedCall
    - No Phaser game objects created for tooltip or rejection text (both are HTML)
    - src/game/ files (buildings.js, worldGen.js, hydrology.js, etc.) are unchanged
  </acceptance_criteria>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| canPlace reason string -> DOM innerHTML | reason strings come from game logic (not user input), but are inserted into the DOM |
| Pointer world coordinates -> tile lookup | pointer position is read from Phaser input, converted to tile; no external data |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-s3-04 | Information Disclosure | Tooltip showing tile data | accept | Tile data is single-player game state; no privacy concern |
| T-s3-05 | Tampering | reason string -> DOM | mitigate | Use textContent (not innerHTML) when inserting friendlyReason output into #rejection-reason to prevent XSS if reason strings ever change. For tooltip, use textContent per line with createElement or concatenate with br literals (no user-controlled HTML) |
| T-s3-06 | Denial of Service | requestAnimationFrame in rejection flow | accept | Single rAF per rejection event; no accumulation possible in normal gameplay |
</threat_model>

<verification>
Manual checkpoint after Plan 03 executes:

1. Start dev server: npm run dev -> open localhost:5173
2. Hover over several tiles across terrain types -- confirm tooltip appears near cursor with
   terrain, wet/dry status. Move cursor quickly across tile boundaries -- tooltip updates.
3. Move cursor off the canvas -- confirm tooltip hides.
4. Place a hale building. Hover that tile -- confirm tooltip shows "Hale T1".
5. Attempt to place on a mountain tile -- confirm:
   a) Red flash on the tile for ~300ms then stone tint restores
   b) "Can't build on mountain" appears in the selector panel bottom zone then fades out
6. Select "Loi" and attempt to place on a dry flat tile -- confirm "Loi needs a wet tile" reason text
7. Press D -- confirm reason text no longer appears on next failed placement
8. Press D again -- confirm reason text reappears on next failed placement
9. Open console -- confirm no setTimeout calls (search source for setTimeout with grep:
   grep -n "setTimeout" src/scenes/GameScene.js -- expect 0 results)
10. Confirm src/game/ files unchanged: git diff src/game/ -- expect empty output
</verification>

<success_criteria>
- Cursor-following tooltip shows terrain type, Wet/Dry, and placed building on every valid tile
- Failed placements give red tile flash (300ms via this.time.delayedCall) + fading reason text
- Player-friendly reason text maps all documented canPlace reason strings
- D-key toggles reason text display
- No setTimeout in GameScene.js
- No modifications to any file in src/game/
</success_criteria>

<output>
After completion, create .planning/phases/sprint-3/sprint-3-PLAN-03-SUMMARY.md
</output>
