# Phase sprint-4: Dual-Clock / ʻIke Accumulation - Context

**Gathered:** 2026-05-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Add month/year tracking, wet/dry season detection (Hoʻoilo/Kauwela), Lono seasonal
multiplier for loi taro yield during wet months, and ʻIke resource accumulation at
year rollover. Engine-agnostic game logic additions + HUD display only.

**In scope:** gameState.js, resourceTick.js, index.html (HUD spans), GameScene.js
(SEASON_LABEL constant + updateHUD extension + End Turn hook).

**Out of scope:** Tech unlock logic (Sprint 5), tech tree UI, ike-spending mechanic,
any changes to canPlace/worldGen/hydrology, shore/forest/water sprites.

</domain>

<decisions>
## Implementation Decisions

### Season Names (CONTENT.md Plan 01)

- **D-01:** CONTENT.md must be updated BEFORE any code references season strings.
  Sprint 4 Plan 01 is a CONTENT.md-only update. No code changes in Plan 01.
- **D-02:** Terms to add: Hoʻoilo (wet season, months 11-12 and 1-4) and Kauwela
  (dry season, months 5-10). Add under Events > Seasonal variation section.
  Add terms only -- no full cultural description needed in Sprint 4.
  Correct diacriticals are mandatory: ʻokina (U+02BB) in Hoʻoilo.
- **D-03:** Code references these as string literals sourced from CONTENT.md (not
  generated or guessed). SEASON_LABEL constant in GameScene.js uses the CONTENT.md
  verified values: `{ wet: 'Hoʻoilo', dry: 'Kauwela' }`.
- **D-04:** ʻIke HUD label: use `ʻIke:` (with ʻokina, sourced from CONTENT.md
  "ʻIke -- Knowledge / game information" entry). Match the exact casing and character.

### Dual-Clock Logic (resourceTick.js)

- **D-05:** Month formula (turn pre-incremented before processTick in End Turn handler):
  `const month = ((state.turn - 1) % 12) + 1;`
- **D-06:** Wet season definition: `const isWetSeason = month >= 11 || month <= 4;`
  (six-month wet season -- months 11, 12, 1, 2, 3, 4).
- **D-07:** Lono seasonal multiplier for loi taro: `Math.round((isWetSeason ? 1.5 : 1.0) * 3 * mult)`
  Only loi gets the multiplier. Loko-ia fish yield is unchanged.
- **D-08:** Year/month rollover after starvation block:
  ```js
  state.month = month;
  if (state.turn % 12 === 0) {
    state.year++;
    state.month = 1;
    const heiauCount = Object.values(state.buildings).filter(b => b.type === 'heiau').length;
    state.resources.ike = Math.max(0, state.resources.ike + heiauCount * 2 + 1);
  }
  ```
- **D-09:** Taro floor (`Math.max(0, state.resources.taro)`) already present in v2 --
  preserve it. Do NOT add a second floor call.

### State Additions (gameState.js)

- **D-10:** Add `month: 1` and `year: 1` at TOP LEVEL of state (not inside resources).
- **D-11:** Add `ike: 0` INSIDE the resources object (alongside taro, fish, wood, stone, tools).
- **D-12:** All existing fields unchanged. New fields appended in position order.

### HUD (index.html + GameScene.js)

- **D-13:** New HUD spans go ABOVE the existing Turn line inside `#hud`:
  `Year: <span id="hud-year">1</span>, Month: <span id="hud-month">1</span><br>`
  `Season: <span id="hud-season">--</span><br>`
- **D-14:** ʻIke span goes AFTER the Stone line:
  `ʻIke: <span id="hud-ike">0</span><br>`
- **D-15:** updateHUD() extended to set hud-year, hud-month, hud-season, hud-ike.
  Season label: `const isWet = state.month >= 11 || state.month <= 4;`
  then `SEASON_LABEL.wet` or `SEASON_LABEL.dry`.
- **D-16:** SEASON_LABEL declared at MODULE LEVEL in GameScene.js (alongside BUILDING_TINT,
  SINGLE_TIER_TYPES). Not inside create().

### End Turn Hook for Sprint 5

- **D-17:** Sprint 4 adds `updateSelector(this)` after `updateHUD()` in the End Turn
  click handler. This is a one-line hook so Sprint 5 can implement Eureka/ike tech
  unlocks in processTick without touching the End Turn handler.
- **D-18:** Sprint 4 does NOT implement any tech unlock logic. state.techs[] is untouched
  (it exists in gameState.js from Sprint 2 as an empty array).

### Sprint 5 Design (captured for planning reference -- not Sprint 4 scope)

- **D-19 (Sprint 5 preview):** Tech unlock system is hybrid Eureka + ike accumulation,
  modeled on Civ6:
  - Carpentry: Eureka unlock -- auto-unlocks when player has built 3 hale.
    Sprint 5 adds the check inside processTick (or building placement handler -- TBD Sprint 5).
  - Masonry: ike threshold unlock -- auto-unlocks when ike >= [TBD threshold].
    Sprint 5 discuss-phase decides the threshold.
  - Both unlocks add the tech string to state.techs[] automatically (no player action).
- **D-20 (Sprint 5 preview):** updateSelector(scene) will be extended in Sprint 5 to
  lock/unlock hale T2 (btn-tier-1) and T3 (btn-tier-2) based on state.techs[].
  The disable pattern already exists in Sprint 3 (SINGLE_TIER_TYPES logic).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Rules and Architecture
- `CLAUDE.md` -- coordinate system, Hawaiian term integrity rule (Hawaiian strings from CONTENT.md only), `src/game/` zero Phaser imports rule, session protocol
- `CONTENT.md` -- canonical source for Hawaiian terms; Plan 01 updates this file; Season label strings MUST come from here

### Current Code State (Sprint 2 -- Sprint 3 not yet executed)
- `src/game/gameState.js` -- current state shape; Sprint 4 adds month, year, ike
- `src/game/resourceTick.js` -- current processTick; Sprint 4 adds dual-clock + Lono multiplier
- `src/scenes/GameScene.js` -- current updateHUD() and End Turn handler; Sprint 4 extends both
- `index.html` -- current HUD markup; Sprint 4 adds year/month/season/ike spans

### Reference Implementation
- `../ahapuaa-game/prompt mds/sprint4_prompt.md` -- Phaser 3 Sprint 4 reference. Direct port with one adjustment: month formula uses `((state.turn - 1) % 12) + 1` (v2 End Turn pre-increments before processTick). The taro floor fix is already in v2 -- do not add it again.

### Sprint 3 Deliverables (Sprint 4 hook targets)
- `.planning/phases/sprint-3/sprint-3-PLAN-02.md` -- defines updateSelector(scene) signature and module-level placement; Sprint 4 calls this function from End Turn handler
- `.planning/phases/sprint-3/sprint-3-PLAN-03.md` -- defines friendlyReason() and SINGLE_TIER_TYPES; Sprint 4 does not modify these

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `updateSelector(scene)` -- module-level function (Sprint 3 Plan 02 deliverable). Sprint 4 calls it from End Turn handler as `updateSelector(this)`. No changes to the function itself.
- `updateHUD()` -- module-level function in GameScene.js. Sprint 4 extends it with 4 new DOM writes (year, month, season, ike). Pattern: direct `document.getElementById().textContent =` assignment.
- `state.techs[]` -- empty array, exists in gameState.js since Sprint 2. Sprint 4 does not touch it. Sprint 5 pushes tech strings into it on unlock.
- `state.buildings` -- object map of `{buildingId: {type, tier, col, row, ...}}`. Sprint 4 reads it in processTick to count heiau: `Object.values(state.buildings).filter(b => b.type === 'heiau').length`.

### Established Patterns
- Module-level constants in GameScene.js: BUILDING_TINT, SINGLE_TIER_TYPES (Sprint 3), TERRAIN_TO_FRAME, TERRAIN_TO_TINT. SEASON_LABEL follows this pattern.
- Inline styles for all HUD elements -- no CSS file. New HUD spans follow existing `#hud` markup pattern (see index.html).
- `src/game/` zero Phaser imports -- resourceTick.js and gameState.js have zero Phaser imports; Sprint 4 additions must maintain this.

### Integration Points
- End Turn handler (GameScene.js create()): `state.turn++; processTick(state, state.tiles); updateHUD(); updateSelector(this);` -- Sprint 4 adds the last call.
- processTick reads state.turn (pre-incremented) to derive month. No argument changes needed.
- updateHUD() reads state.year, state.month, and state.resources.ike (all new in Sprint 4).

</code_context>

<specifics>
## Specific Ideas

- **Civ6 Eureka model for Sprint 5:** User explicitly referenced this mechanic. Carpentry = "build 3 hale" Eureka (mirrors Civ6's "build X to unlock Y"). This is a recognized game design pattern -- building actions trigger tech progress passively.
- **Long-term vision noted (deferred):** User mentioned chapters guiding the player through the Hawaiian monarchy, navigating geopolitics, and the overthrow. This is post-capstone scope -- captured here for roadmap awareness, not Sprint 4-5 scope.
- **Month formula confirmed:** The v2 formula (`((state.turn - 1) % 12) + 1`) differs from the naive P3 version (`(state.turn % 12) + 1`) because v2's End Turn increments turn BEFORE processTick. Planner must not copy P3 formula blindly.

</specifics>

<deferred>
## Deferred Ideas

- **Heiau cultural rendering:** heiau building type exists in canPlace() logic but is blocked from rendering (medieval_church.png is culturally inappropriate). Sprint 4 adds ike award via heiau count -- if no heiau are placed, base ike = 1/year. Heiau asset gap logged; no Sprint 4 action.
- **Chapter system / monarchy progression:** Long-term game narrative vision. Post-capstone scope. Not Sprint 4 or Sprint 5.
- **Masonry ike threshold:** Specific value to be decided in Sprint 5 discuss-phase. Sprint 4 CONTEXT.md notes the mechanism (ike threshold auto-unlock) but does not set the number.
- **Eureka trigger location:** Should carpentry Eureka check run in processTick or in the building placement handler? To be decided in Sprint 5 discuss-phase. Both are valid; placement handler is more responsive (immediate unlock on 3rd hale placed).

</deferred>

---

*Phase: sprint-4 -- Dual-Clock / ʻIke Accumulation*
*Context gathered: 2026-05-27*
