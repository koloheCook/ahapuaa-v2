---
phase: sprint-4
plan: sprint-4-04
type: execute
wave: 3
depends_on:
  - sprint-4-02
  - sprint-4-03
files_modified:
  - index.html
  - src/scenes/GameScene.js
autonomous: false
requirements:
  - SPRINT4-HUD-DISPLAY
  - SPRINT4-END-TURN-HOOK
must_haves:
  truths:
    - HUD shows Year and Month above the Turn line on every tick
    - HUD shows Season (Hoʻoilo or Kauwela) based on current month
    - HUD shows ʻIke count below Stone line
    - Season label strings exactly match CONTENT.md verified values
    - SEASON_LABEL is declared at module level in GameScene.js alongside BUILDING_TINT
    - End Turn handler calls updateSelector(this) after updateHUD()
    - Initial HUD state on game start shows Year 1, Month 1, Hoʻoilo (month 1 is wet)
  artifacts:
    - path: "index.html"
      provides: "HUD spans for year, month, season, ike"
      contains: "hud-year"
    - path: "src/scenes/GameScene.js"
      provides: "SEASON_LABEL constant and updateHUD extension"
      contains: "SEASON_LABEL"
  key_links:
    - from: "src/scenes/GameScene.js updateHUD"
      to: "index.html #hud-season"
      via: "document.getElementById('hud-season').textContent"
      pattern: "hud-season"
    - from: "src/scenes/GameScene.js End Turn handler"
      to: "updateSelector"
      via: "updateSelector(this) call after updateHUD()"
      pattern: "updateSelector\\(this\\)"
---

<objective>
Wire the Sprint 4 state additions to the HUD: add year/month/season/ike spans to index.html,
extend updateHUD() in GameScene.js to write those spans, declare SEASON_LABEL at module level,
and add the updateSelector(this) hook to the End Turn handler.

Purpose: Plans 02 and 03 built the state and logic. This plan makes the player-facing output
visible and adds the Sprint 5 hook point. autonomous: false because seasonal HUD display
requires browser verification -- correct season labels and month rollover must be visually
confirmed.

Output:
- index.html with 4 new HUD span elements
- GameScene.js with SEASON_LABEL constant, extended updateHUD(), and updateSelector(this) hook
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/sprint-4/sprint-4-CONTEXT.md
@index.html
@src/scenes/GameScene.js
@.planning/phases/sprint-3/sprint-3-PLAN-02.md

<interfaces>
<!-- Current HUD markup from index.html: -->
```html
<div id="hud" style="position:fixed;top:16px;left:16px;background:rgba(0,0,0,0.7);color:#e8d5a3;font-family:Georgia,serif;font-size:14px;padding:12px 16px;border-radius:6px;pointer-events:none;line-height:1.8;">
  Turn <span id="hud-turn">0</span><br>
  Pop <span id="hud-pop">0</span> / <span id="hud-popcap">0</span><br>
  Taro <span id="hud-taro">0</span> &nbsp;
  Fish <span id="hud-fish">0</span><br>
  Wood <span id="hud-wood">0</span> &nbsp;
  Stone <span id="hud-stone">0</span>
</div>
```

<!-- Current module-level constants in GameScene.js (Sprint 2 + Sprint 3 deliverables): -->
  const TERRAIN_TO_FRAME = { ... }   (line 11)
  const TERRAIN_TO_TINT = { ... }    (line 22)
  const BUILDING_TINT = { ... }      (line 28)
  [Sprint 3 adds: const SINGLE_TIER_TYPES = new Set([...])]

SEASON_LABEL follows this same module-level pattern. NOT inside create().

<!-- Current updateHUD in GameScene.js: -->
```js
function updateHUD() {
  document.getElementById('hud-turn').textContent   = state.turn;
  document.getElementById('hud-pop').textContent    = state.population;
  document.getElementById('hud-popcap').textContent = state.populationCap;
  document.getElementById('hud-taro').textContent   = state.resources.taro;
  document.getElementById('hud-fish').textContent   = state.resources.fish;
  document.getElementById('hud-wood').textContent   = state.resources.wood;
  document.getElementById('hud-stone').textContent  = state.resources.stone;
}
```

<!-- Current End Turn handler (inside create()): -->
```js
document.getElementById('end-turn').addEventListener('click', () => {
  state.turn++;
  processTick(state, state.tiles);
  updateHUD();
});
```

<!-- updateSelector(scene) -- Sprint 3 Plan 02 deliverable: -->
Module-level function in GameScene.js. Sprint 4 calls it as updateSelector(this) from the
End Turn handler. Sprint 4 does NOT define or modify this function.
If Sprint 3 has not yet run, updateSelector will be absent -- executor must note this as a
dependency and verify Sprint 3 Plan 02 is complete before executing this plan.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add year, month, season, and ike spans to index.html HUD</name>
  <files>index.html</files>
  <read_first>
    - index.html -- read the full file before editing; locate the exact content of #hud to find insertion points
    - .planning/phases/sprint-4/sprint-4-CONTEXT.md -- D-13 (year/month/season above Turn line), D-14 (ike after Stone line)
    - CONTENT.md -- confirm the ʻokina character in "ʻIke" label (must be U+02BB, not straight apostrophe)
  </read_first>
  <action>
    Edit index.html. Make exactly two targeted insertions inside the #hud div. Do not change
    the HUD div's style attribute, the game div, the end-turn button, or the script tag.

    INSERTION 1 -- BEFORE the "Turn" line:
    Add these two lines immediately before "Turn <span id="hud-turn">0</span><br>":

      Year: <span id="hud-year">1</span>, Month: <span id="hud-month">1</span><br>
      Season: <span id="hud-season">--</span><br>

    INSERTION 2 -- AFTER the "Stone" line:
    Add this line immediately after "Stone <span id="hud-stone">0</span>":

      <br>
      ʻIke: <span id="hud-ike">0</span><br>

    The ʻokina in "ʻIke:" is U+02BB (modifier letter apostrophe). Copy from CONTENT.md -- do not
    type a straight apostrophe. The exact label text must be "ʻIke:" matching CONTENT.md.

    The resulting #hud inner content (in order) after both insertions:
      Year: [hud-year], Month: [hud-month]
      Season: [hud-season]
      Turn [hud-turn]
      Pop [hud-pop] / [hud-popcap]
      Taro [hud-taro]  Fish [hud-fish]
      Wood [hud-wood]  Stone [hud-stone]
      ʻIke: [hud-ike]
  </action>
  <verify>
    <automated>grep -c "hud-year" /Users/scottywright-ahsam/Desktop/Archived/Pioneer\ Species/Projects/ahapuaa-v2/index.html && grep -c "hud-season" /Users/scottywright-ahsam/Desktop/Archived/Pioneer\ Species/Projects/ahapuaa-v2/index.html && grep -c "hud-ike" /Users/scottywright-ahsam/Desktop/Archived/Pioneer\ Species/Projects/ahapuaa-v2/index.html</automated>
  </verify>
  <done>
    - index.html contains span id="hud-year" and span id="hud-month" on the same line, above Turn
    - index.html contains span id="hud-season" above Turn
    - index.html contains span id="hud-ike" below Stone
    - "ʻIke:" label uses U+02BB ʻokina (verify visually or with hex dump)
    - All existing HUD spans (hud-turn, hud-pop, hud-popcap, hud-taro, hud-fish, hud-wood, hud-stone) still present and unchanged
    - No style block or external CSS added
  </done>
</task>

<task type="auto">
  <name>Task 2: Add SEASON_LABEL, extend updateHUD, and add updateSelector hook in GameScene.js</name>
  <files>src/scenes/GameScene.js</files>
  <read_first>
    - src/scenes/GameScene.js -- read the full file before editing; locate module-level constants (lines 11-28), the End Turn handler (lines 225-229), and the updateHUD function (lines 236-244)
    - .planning/phases/sprint-4/sprint-4-CONTEXT.md -- D-15 (updateHUD extension), D-16 (SEASON_LABEL module-level), D-17 (updateSelector hook), D-18 (no tech logic)
    - CONTENT.md -- confirm exact spelling of Hoʻoilo and Kauwela (copy characters from file; do not type fresh)
    - .planning/phases/sprint-3/sprint-3-PLAN-02.md -- confirms updateSelector(scene) is a module-level function; Sprint 4 calls it as updateSelector(this)
  </read_first>
  <action>
    Edit src/scenes/GameScene.js. Make three targeted additions. Do not change any existing
    logic, the camera code, the pointerdown handler, the tile stamping loop, or any Sprint 3 deliverables.

    ADDITION 1 -- SEASON_LABEL at MODULE LEVEL:
    Add the following const after BUILDING_TINT (currently around line 28, before the class declaration):

      const SEASON_LABEL = { wet: 'Hoʻoilo', dry: 'Kauwela' };

    This declaration must be at module scope -- NOT inside create(), NOT inside a function.
    It must sit alongside TERRAIN_TO_FRAME, TERRAIN_TO_TINT, BUILDING_TINT (and SINGLE_TIER_TYPES
    if Sprint 3 has already been executed).

    The string values 'Hoʻoilo' and 'Kauwela' must match CONTENT.md exactly:
    - ʻokina in Hoʻoilo: U+02BB between Ho and oilo
    - Kauwela has no diacriticals

    ADDITION 2 -- extend updateHUD():
    Add 4 new lines to the updateHUD function body, after the existing state.resources.stone line:

      const isWet = state.month >= 11 || state.month <= 4;
      document.getElementById('hud-year').textContent    = state.year;
      document.getElementById('hud-month').textContent   = state.month;
      document.getElementById('hud-season').textContent  = isWet ? SEASON_LABEL.wet : SEASON_LABEL.dry;
      document.getElementById('hud-ike').textContent     = state.resources.ike;

    updateHUD is a module-level function and SEASON_LABEL is module-level -- the reference is valid.
    state.month starts at 1 (from gameState.js). Month 1 satisfies isWet (month <= 4), so the initial
    HUD render on game start will show Hoʻoilo. This is correct behavior.

    ADDITION 3 -- updateSelector(this) hook in End Turn handler:
    The current End Turn handler body is:
      state.turn++;
      processTick(state, state.tiles);
      updateHUD();

    Add ONE line after updateHUD():
      updateSelector(this);

    The result:
      state.turn++;
      processTick(state, state.tiles);
      updateHUD();
      updateSelector(this);

    updateSelector is the module-level function defined by Sprint 3 Plan 02. Sprint 4 does NOT
    define updateSelector -- it only calls it. If Sprint 3 has not run, this call will throw a
    ReferenceError at runtime -- executor must confirm Sprint 3 Plan 02 is complete first.

    No tech unlock logic. state.techs[] is not touched (D-18).
    No other changes to create(), pointerdown handler, camera wiring, or any other function.
  </action>
  <verify>
    <automated>grep -c "SEASON_LABEL" /Users/scottywright-ahsam/Desktop/Archived/Pioneer\ Species/Projects/ahapuaa-v2/src/scenes/GameScene.js && grep -c "hud-season" /Users/scottywright-ahsam/Desktop/Archived/Pioneer\ Species/Projects/ahapuaa-v2/src/scenes/GameScene.js && grep -c "updateSelector(this)" /Users/scottywright-ahsam/Desktop/Archived/Pioneer\ Species/Projects/ahapuaa-v2/src/scenes/GameScene.js</automated>
  </verify>
  <done>
    - SEASON_LABEL declared at module level with values 'Hoʻoilo' and 'Kauwela' (U+02BB ʻokina)
    - SEASON_LABEL appears before the class declaration, not inside create()
    - updateHUD() contains isWet calculation and sets hud-year, hud-month, hud-season, hud-ike
    - End Turn handler calls updateSelector(this) as its last statement after updateHUD()
    - No other changes to existing code
    - grep "SEASON_LABEL" returns at least 2 matches (declaration + usage in updateHUD)
    - grep "updateSelector(this)" returns at least 1 match in End Turn handler
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Sprint 4 HUD additions: year/month/season/ike spans in index.html; SEASON_LABEL constant,
    updateHUD extension, and updateSelector hook in GameScene.js.
  </what-built>
  <how-to-verify>
    1. Run: npm run dev (from /Users/scottywright-ahsam/Desktop/Archived/Pioneer\ Species/Projects/ahapuaa-v2)
    2. Open localhost:5173 in the browser.
    3. Check HUD top-left. Expected on game start:
         Year: 1, Month: 1
         Season: Hoʻoilo
         Turn 0
         Pop ... / ...
         Taro ... Fish ...
         Wood ... Stone ...
         ʻIke: 0
    4. Click End Turn once. Expected:
         Year: 1, Month: 1 (turn 1, month 1)
         Season: Hoʻoilo
         Turn 1
         ʻIke: 0 (no year rollover yet)
    5. Click End Turn until Turn reaches 11. Expected:
         Month: 11
         Season: Hoʻoilo (month 11 is wet)
    6. Click End Turn once more (Turn 12). Expected:
         Year: 2, Month: 1
         Season: Hoʻoilo
         ʻIke: 1 (base +1, no heiau placed)
    7. Click End Turn to Turn 17 (month 5 of year 2). Expected:
         Month: 5
         Season: Kauwela (month 5 is dry)
    8. Verify the selector panel (Sprint 3) still works: click Loi, confirm T2/T3 dim.
    9. Verify building placement still works: place a Hale, confirm HUD Taro and Pop update.
  </how-to-verify>
  <resume-signal>Type "approved" if all checks pass, or describe any discrepancy</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| state -> DOM | updateHUD writes integer/string values to textContent; no user input reflected |
| user click -> End Turn handler | Increments state.turn by 1; no user-controlled value enters processTick |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-s4-06 | Tampering | HUD textContent writes | accept | Values written are computed from integer arithmetic on game state; no user-supplied string reaches textContent |
| T-s4-07 | Spoofing | SEASON_LABEL string values | accept | Strings are module-level constants; sourced from CONTENT.md verified terms; not user-configurable |
| T-s4-08 | Information Disclosure | HUD visibility | accept | HUD shows game state only; no PII; same trust level as existing HUD fields |
</threat_model>

<verification>
Browser verification checkpoint (Task 3) confirms:
- Correct season labels display (Hoʻoilo for wet months, Kauwela for dry months)
- Year increments at turn 12, month resets to 1
- ʻIke accumulates at year rollover (+1 base, +2 per heiau)
- Sprint 3 selector panel still functional after End Turn hook addition
- Building placement and HUD resource fields still update correctly
</verification>

<success_criteria>
- HUD displays Year, Month, Season, and ʻIke on every turn update
- Season label switches between Hoʻoilo (months 11-12, 1-4) and Kauwela (months 5-10)
- Diacriticals are correct: ʻokina (U+02BB) in Hoʻoilo and ʻIke
- SEASON_LABEL is module-level -- not defined inside create()
- End Turn handler calls updateSelector(this) -- Sprint 5 hook point established
- No regressions to Sprint 2 (resource HUD, building placement) or Sprint 3 (selector panel)
</success_criteria>

<output>
After completion, create .planning/phases/sprint-4/sprint-4-04-SUMMARY.md
</output>
