---
phase: sprint-3
plan: sprint-3-PLAN-02
type: execute
wave: 2
depends_on:
  - sprint-3-PLAN-01
files_modified:
  - index.html
  - src/scenes/GameScene.js
autonomous: false
requirements:
  - SPRINT3-SELECTOR-PANEL
  - SPRINT3-ACTIVE-STATE
  - SPRINT3-TIER-DISABLE
must_haves:
  truths:
    - A fixed right-side selector panel is visible in the game UI with type buttons (Hale / Loi / Loko-ia) and a tier row (T1 / T2 / T3)
    - Clicking a type button updates this.selectedType in GameScene and highlights the clicked button with gold border (#a07840) and lighter bg
    - Clicking a tier button updates this.selectedTier (0-indexed) in GameScene and highlights the clicked button
    - When loi or loko-ia is selected, T2 and T3 tier buttons show opacity:0.4 and are pointer-events:none
    - When hale is selected, all three tier buttons are fully active
    - Panel style matches HUD exactly: rgba(0,0,0,0.7) bg, #e8d5a3 text, Georgia serif font
---

<objective>
Add the building selector panel to the right side of the screen and wire it to GameScene's
selectedType and selectedTier properties.

Purpose: Sprint 2 hardcoded this.selectedType = 'hale' and this.selectedTier = 0. This plan
makes selection interactive. Players can choose which building type to place and which tier
(where applicable). The panel uses the same inline-style HTML pattern as the existing HUD and
End Turn button -- no CSS file, no framework.

Output:
- index.html with a #selector-panel div containing type and tier buttons
- GameScene.js with wiring functions that connect button clicks to this.selectedType and
  this.selectedTier, and a reusable updateSelector() function (called by Plan 03's rejection feedback)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/sprint-3/sprint-3-CONTEXT.md
@.planning/phases/sprint-3/sprint-3-PLAN-01-SUMMARY.md

<interfaces>
<!-- Key values the executor must match exactly. Sourced from codebase reads. -->

From index.html (existing HUD style to match):
  position:fixed; top:16px; left:16px
  background:rgba(0,0,0,0.7)
  color:#e8d5a3
  font-family:Georgia,serif
  font-size:14px
  padding:12px 16px
  border-radius:6px
  pointer-events:none
  line-height:1.8

From index.html (End Turn button style reference for border color):
  border:1px solid #a07840
  background:#3a2a10
  color:#e8d5a3
  font-family:Georgia,serif

From src/game/buildings.js (PLACEMENT_COSTS -- hardcode these values in button labels):
  hale tier 0: { wood: 3 }
  hale tier 1: { wood: 5, stone: 2 }
  hale tier 2: { wood: 5, stone: 5 }
  loi tier 0:  { wood: 2 }
  loko-ia tier 0: { stone: 3 }

From src/scenes/GameScene.js (state being wired):
  this.selectedType = 'hale'   (line 114, currently hardcoded)
  this.selectedTier = 0        (line 115, currently hardcoded)
  BUILDING_TINT = { hale: 0xffd700, loi: 0x00ffcc, 'loko-ia': 0x4488ff }
</interfaces>
</context>

<tasks>

<task id="T01" type="execute">
  <title>Add #selector-panel HTML to index.html</title>
  <read_first>
    - index.html -- read the full file before editing; match the inline style pattern exactly
    - .planning/phases/sprint-3/sprint-3-CONTEXT.md -- confirms panel position, style spec, button labels, tier disable rules
  </read_first>
  <action>
    Add a new div with id="selector-panel" inside the body, after the #end-turn button and before
    the script tag.

    Panel layout and style:
    - position:fixed; top:50%; right:16px; transform:translateY(-50%)
    - background:rgba(0,0,0,0.7); color:#e8d5a3; font-family:Georgia,serif; font-size:14px
    - padding:12px 16px; border-radius:6px; min-width:140px
    - All inline styles. No CSS file or style block changes.

    Panel inner structure (use plain divs and buttons):

    Section label "Build" as a div with font-size:11px; text-transform:uppercase;
    letter-spacing:1px; margin-bottom:8px; opacity:0.7.

    Three type buttons, each a button element, stacked vertically (display:block; width:100%):
      id="btn-type-hale"   -- label: "Hale"
      id="btn-type-loi"    -- label: "Loi (2 wood)"
      id="btn-type-loko-ia" -- label: "Loko-ia (3 stone)"

    Hale does not show a single cost on the type button because cost varies by tier.
    The tier buttons show cost instead (see tier section below).

    Base button style (apply to all three type buttons via inline style):
      display:block; width:100%; margin-bottom:6px; padding:6px 8px
      background:#3a2a10; color:#e8d5a3; font-family:Georgia,serif; font-size:13px
      border:1px solid #5a4a30; border-radius:3px; cursor:pointer; text-align:left

    Active type button style (class name "sel-active", applied via JS -- do not use :hover CSS):
      border-color:#a07840; background:rgba(80,60,20,0.7)

    Divider: a div with border-top:1px solid #5a4a30; margin:10px 0.

    Section label "Tier" as a div with same style as "Build" label above.

    Tier row: a div with display:flex; gap:6px.
    Three tier buttons side by side:
      id="btn-tier-0" -- label: "T1 (3w)"
      id="btn-tier-1" -- label: "T2 (5w 2s)"
      id="btn-tier-2" -- label: "T3 (5w 5s)"

    Tier button base style (inline):
      flex:1; padding:5px 4px; background:#3a2a10; color:#e8d5a3
      font-family:Georgia,serif; font-size:11px; border:1px solid #5a4a30
      border-radius:3px; cursor:pointer; text-align:center

    Active tier button (class "sel-active") -- same: border-color:#a07840; background:rgba(80,60,20,0.7).

    Disabled tier button (for T2 and T3 when loi/loko-ia selected) -- add inline style
    override via JS: opacity:0.4; pointer-events:none; cursor:default.
    Do not use the HTML disabled attribute -- inline style override is sufficient and matches
    the existing feature-flag pattern.

    A rejection reason div at the bottom of the panel:
      id="rejection-reason"
      style: margin-top:10px; font-size:12px; color:#ff6b6b; min-height:16px;
      opacity:0; transition:opacity 3s
    Leave this div empty for now -- Plan 03 populates it.
  </action>
  <acceptance_criteria>
    - index.html contains a div with id="selector-panel"
    - Panel contains buttons with ids: btn-type-hale, btn-type-loi, btn-type-loko-ia, btn-tier-0, btn-tier-1, btn-tier-2
    - Panel contains a div with id="rejection-reason" with opacity:0 and transition:opacity 3s
    - No new style block or external CSS file added
    - Existing HUD, end-turn button, and game div are unchanged (grep for id="hud" and id="end-turn" returns original markup)
  </acceptance_criteria>
</task>

<task id="T02" type="execute">
  <title>Wire selector panel to GameScene.selectedType and selectedTier</title>
  <read_first>
    - src/scenes/GameScene.js -- read all 154 lines; understand the create() lifecycle and where
      this.selectedType/this.selectedTier are set (lines 113-115) before adding wiring code
    - index.html -- confirms the button ids added in T01
  </read_first>
  <action>
    In src/scenes/GameScene.js, make the following additions inside the create() method,
    after the existing selectedType/selectedTier assignments (after line 115) and before the
    pointerdown handler block (before line 117).

    Step 1 -- define SINGLE_TIER_TYPES constant at MODULE LEVEL:
    Add a const at module level, alongside BUILDING_TINT (before the class declaration),
    NOT inside create():
      const SINGLE_TIER_TYPES = new Set(['loi', 'loko-ia']);
    This placement is required so updateSelector(scene) -- a module-level function --
    can reference it. Do not declare it inside create().

    Step 2 -- define updateSelector function (module-level, after updateHUD):
    Add a new module-level function named updateSelector that accepts no arguments and reads
    this.selectedType and this.selectedTier from the scene instance. Because this is a
    module-level function, pass the scene instance as a parameter named scene:
      function updateSelector(scene)

    updateSelector(scene) must:
    a) Remove class "sel-active" from all six selector buttons
       (btn-type-hale, btn-type-loi, btn-type-loko-ia, btn-tier-0, btn-tier-1, btn-tier-2).
    b) Add class "sel-active" to the matching type button:
       btn-type-${scene.selectedType} -- note loko-ia button id is btn-type-loko-ia.
    c) Add class "sel-active" to the matching tier button:
       btn-tier-${scene.selectedTier}.
    d) For each tier button (btn-tier-1 and btn-tier-2 -- that is T2 and T3, index 1 and 2):
       If scene.selectedType is in SINGLE_TIER_TYPES, set inline style opacity:0.4 and
       pointer-events:none on those two buttons.
       Otherwise restore them: opacity:1 and pointer-events:auto.

    The "sel-active" class is not declared in a stylesheet -- apply the active styles as inline
    style properties directly in updateSelector instead of using classList. This keeps all styling
    in JS inline-style assignments, consistent with the no-CSS-file rule.

    Revised updateSelector approach (inline styles, no className):
    Instead of "sel-active" class, directly set borderColor and background on each button:
    - Active type button: borderColor = '#a07840', background = 'rgba(80,60,20,0.7)'
    - Inactive type button: borderColor = '#5a4a30', background = '#3a2a10'
    - Same pair for tier buttons.
    - Disabled tier button (T2/T3 when single-tier): opacity = '0.4', pointerEvents = 'none'
    - Enabled tier button: opacity = '1', pointerEvents = 'auto'

    Step 3 -- attach click handlers inside create(), after the SINGLE_TIER_TYPES declaration:

    For each type button, use document.getElementById('btn-type-hale').addEventListener('click', () => {
      this.selectedType = 'hale';
      if (SINGLE_TIER_TYPES.has('hale')) { /* never true, but keeps pattern */ }
      else { this.selectedTier = Math.min(this.selectedTier, 2); }
      updateSelector(this);
    });
    Repeat for loi (this.selectedType = 'loi'; this.selectedTier = 0; updateSelector(this);)
    and loko-ia (this.selectedType = 'loko-ia'; this.selectedTier = 0; updateSelector(this);).
    For loi and loko-ia: force this.selectedTier = 0 on type change because they are single-tier.

    For each tier button (0, 1, 2): document.getElementById('btn-tier-0').addEventListener('click', () => {
      this.selectedTier = 0; updateSelector(this);
    });
    Repeat for btn-tier-1 (selectedTier = 1) and btn-tier-2 (selectedTier = 2).

    Step 4 -- call updateSelector(this) once at the end of the selector wiring block, before
    the pointerdown handler, to initialize the panel state visually on game start.

    updateSelector is module-level. Plan 03 calls it directly as updateSelector(this) from
    inside GameScene.js -- do not expose it on the scene instance.

    No changes to the pointerdown handler, camera code, End Turn listener, or updateHUD function.
  </action>
  <acceptance_criteria>
    - GameScene.js contains a module-level function updateSelector(scene) after the updateHUD function
    - create() attaches click listeners to all 6 selector buttons (3 type + 3 tier)
    - Clicking btn-type-loi in a running game sets this.selectedType to 'loi' (verify via browser console: scene.selectedType after click)
    - Clicking btn-type-loi sets this.selectedTier to 0
    - T2 and T3 buttons have pointerEvents:'none' and opacity:'0.4' after selecting loi or loko-ia
    - T2 and T3 buttons return to pointerEvents:'auto' and opacity:'1' after selecting hale
    - Initial render shows hale and T1 highlighted on game start
    - No changes to pointerdown handler, camera wiring, End Turn listener, or updateHUD
  </acceptance_criteria>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| User click -> DOM event -> GameScene state | Button clicks mutate this.selectedType and this.selectedTier; no external data enters |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-s3-02 | Tampering | selectedType mutation | accept | Only predefined string literals ('hale','loi','loko-ia') are assigned in click handlers; no user-supplied string ever reaches selectedType |
| T-s3-03 | Denial of Service | DOM event listeners | accept | Listeners are attached once in create(); no unbounded listener accumulation |
</threat_model>

<verification>
Manual checkpoint after Plan 02 executes (autonomous: false because visual confirmation is needed):

1. Start dev server: npm run dev -> open localhost:5173
2. Confirm tile gap: hex polygons should visually fill cells with no transparent strip between rows (Plan 01 change)
3. Confirm selector panel visible on right side: three type buttons, three tier buttons, matching HUD style
4. Click "Loi (2 wood)" button -- confirm it becomes highlighted (darker bg, gold border) and T2/T3 buttons dim
5. Click "T1" -- confirm it remains active
6. Click "Hale" -- confirm T2/T3 re-enable and previously active Loi button loses highlight
7. Click "T2" -- confirm T2 becomes highlighted, T1 loses highlight
8. Open browser console, type: window.__game_scene and check selectedType/selectedTier match last clicks
   (If scene is not on window, temporarily add window.__gs = this at end of create() for this verification)
</verification>

<success_criteria>
- Right-side selector panel renders with correct style
- Type and tier button clicks update this.selectedType and this.selectedTier
- Single-tier types (loi, loko-ia) force selectedTier = 0 and disable T2/T3
- Active selection is visually distinct via inline style (gold border + lighter bg)
- Tile gap improved: hex rows tessellate with no visible transparent margin gap
</success_criteria>

<output>
After completion, create .planning/phases/sprint-3/sprint-3-PLAN-02-SUMMARY.md
</output>
