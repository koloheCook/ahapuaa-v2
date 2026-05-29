# Phase sprint-5: Tech Unlock System - Context

**Gathered:** 2026-05-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Add Carpentry and Masonry tech unlocks to `state.techs[]`. Carpentry auto-unlocks when
3 hale are built (Eureka, immediate). Masonry auto-unlocks when `state.resources.ike >= 3`
(threshold, evaluated at End Turn and on placement). Both unlocks enable hale T2 and T3
through the existing `canPlace()` gates and `updateSelector()` visual layer.

Fix `populationCap` start-state oddity: initialize `populationCap: 5` in `gameState.js`
so the HUD shows `Pop 5 / 5` on game start rather than `Pop 5 / 0`.

**In scope:**
- `src/game/techs.js` (new) -- `checkTechUnlocks(state)` evaluating all unlock conditions
- `src/game/gameState.js` -- `populationCap: 5` initialization fix
- `src/scenes/GameScene.js` -- call `checkTechUnlocks(state)` after `placeBuilding()` and
  after `processTick()`; play `success.ogg` and write unlock message to `#rejection-reason`
  when techs are newly added

**Out of scope:**
- Population growth mechanic (deferred post-capstone)
- Quarterly ike collection cadence change (deferred -- separate design decision)
- Heiau cultural asset resolution (blocked, post-capstone)
- Village/event tech grants (future mechanic, not Sprint 5)
- Any changes to `canPlace()`, `placeBuilding()`, `updateSelector()` logic (already correct)
- Shore/water/forest sprites

</domain>

<decisions>
## Implementation Decisions

### Scope

- **D-01:** Sprint 5 = tech unlocks (Carpentry + Masonry) + populationCap start fix.
  Population growth mechanic (pop growing toward popCap) is deferred post-capstone.
- **D-02:** `populationCap` initialized to `5` in `gameState.js`. Matches `population: 5`
  starting value. The existing `recalcPopCap()` in buildings.js already accumulates
  from placed hale -- this just sets the baseline so `Pop 5 / 0` never shows.

### Tech Architecture

- **D-03:** New `src/game/techs.js` -- a Systems file (zero Phaser imports, like
  `resourceTick.js` and `buildings.js`). Exports `checkTechUnlocks(state)`. This is
  the single owner of all tech unlock conditions: building-count Eureka, ike threshold,
  and future event grants all live here.
- **D-04:** `checkTechUnlocks(state)` returns an array of newly-unlocked tech strings
  (empty array if nothing changed). GameScene.js uses the return value to trigger
  feedback (play sound, show message). The function mutates `state.techs[]` directly.
- **D-05:** `checkTechUnlocks` is called from TWO places in GameScene.js:
  1. After `placeBuilding()` returns true (in the pointerdown handler) -- so Carpentry
     Eureka unlocks immediately when the 3rd hale is placed; player can use T2 that turn
  2. After `processTick()` in the End Turn handler -- so Masonry ike threshold is
     evaluated each turn

### Carpentry Eureka

- **D-06:** Carpentry condition: `haleCount >= 3 && !state.techs.includes('carpentry')`.
  `haleCount = Object.values(state.buildings).filter(b => b.type === 'hale').length`.
- **D-07:** Immediate unlock (Civ6 model): if the 3rd hale placement triggers Carpentry,
  `updateSelector(scene)` is called immediately after `checkTechUnlocks` returns --
  T2 tier button becomes available in the same click session. No End Turn required.

### Masonry Threshold

- **D-08:** Masonry condition: `state.resources.ike >= 3 && !state.techs.includes('masonry')`.
  Threshold value `3` is a PLACEHOLDER -- linked to the unresolved "ike collection
  cadence" design decision (annual vs quarterly). The number works for the current
  annual model (3 ike = ~3 years) and should be revisited when cadence is defined.
- **D-09:** Masonry requires Carpentry: `canPlace()` in buildings.js already enforces
  `state.techs.includes('carpentry') && state.techs.includes('masonry')` for tier 2.
  `checkTechUnlocks` does NOT need to enforce Carpentry-first -- `canPlace()` handles
  the gate. Masonry can be pushed to state.techs[] regardless of whether Carpentry
  is already there; the canPlace gate is the authoritative rule.

### Unlock Feedback

- **D-10:** On unlock: play `success.ogg` (existing audio key). Write a brief message
  to the existing `#rejection-reason` DOM element using the same fade-out pattern as
  placement rejection messages (transition: opacity 0 over 3s). No new DOM elements.
  Example messages: `"Carpentry unlocked!"`, `"Masonry unlocked!"`.
- **D-11:** If multiple techs unlock in the same check (unlikely but possible), show
  the first one. Playing success.ogg once per check call is sufficient.
- **D-12:** Flash the newly-enabled tier button(s): after `updateSelector()` enables
  a button, briefly highlight it (CSS transition or inline style change ~500ms) so the
  player's eye is drawn to the newly-available option.

### Existing Gates (Carry Forward -- Do Not Modify)

- **D-13:** `canPlace()` in `buildings.js` already blocks tier 1 hale without carpentry
  and tier 2 hale without carpentry+masonry. Sprint 5 does NOT touch these checks.
- **D-14:** `friendlyReason()` in `GameScene.js` already returns "Requires Carpentry tech"
  and "Requires Carpentry + Masonry" for rejected tier placements. No changes needed.
- **D-15:** `SINGLE_TIER_TYPES` in `GameScene.js` handles loi/loko-ia T2/T3 disabling
  via opacity/pointerEvents. The tech-based tier lock for hale uses the same pattern.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Rules and Architecture
- `CLAUDE.md` -- coordinate system, Hawaiian term integrity rule, `src/game/` zero Phaser
  imports rule, session protocol, advisory mode terms (Systems, Spike, Canonical source)
- `CONTENT.md` -- canonical source for Hawaiian terms; unlock message strings ("Carpentry",
  "Masonry") are English game terms, NOT Hawaiian -- do not look them up in CONTENT.md

### Current Code State (Sprint 4 complete)
- `src/game/gameState.js` -- current state shape; Sprint 5 changes `populationCap: 0` to
  `populationCap: 5`
- `src/game/buildings.js` -- `canPlace()` tech gates at lines 32-36; `placeBuilding()`;
  `recalcPopCap()`; PLACEMENT_COSTS. READ BEFORE writing techs.js.
- `src/scenes/GameScene.js` -- pointerdown handler (lines 180-223); End Turn handler
  (lines 225-231); `updateSelector()` (lines 253-284); `#rejection-reason` fade-out
  pattern (lines 212-221); module-level constant pattern (lines 28-29)

### Sprint 4 Deliverables (Sprint 5 integration points)
- `.planning/phases/sprint-4/sprint-4-CONTEXT.md` -- D-17 (updateSelector hook in End Turn),
  D-18 (state.techs untouched in Sprint 4), D-19/D-20 (Sprint 5 preview decisions)
- `.planning/phases/sprint-4/sprint-4-LEARNINGS.md` -- L-01 (P3/v2 formula divergence
  warning -- verify any port from P3)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `#rejection-reason` DOM element + 3s fade-out pattern (GameScene.js:212-221) -- reuse
  for unlock notification messages. Same opacity transition, different text content.
- `success.ogg` audio key -- loaded in PreloadScene; play with `this.sound.play('success')`
- `updateSelector(scene)` -- module-level function; already handles tier enable/disable via
  opacity/pointerEvents; Sprint 5 extends implicitly by making `state.techs` non-empty
- `state.techs = []` -- exists in gameState.js since Sprint 2; Sprint 5 first populates it

### Established Patterns
- Module-level constant pattern in GameScene.js: TERRAIN_TO_FRAME, TERRAIN_TO_TINT,
  BUILDING_TINT, SINGLE_TIER_TYPES, SEASON_LABEL -- any new lookup tables follow this pattern
- Zero Phaser imports in `/src/game/` -- `techs.js` must have zero Phaser imports
- `checkTechUnlocks(state)` mirrors the signature of `processTick(state, tiles)`: takes state,
  returns a value, mutates state directly
- Sprint 4 P-01: CONTENT.md-first commit for new Hawaiian strings. Sprint 5 introduces no new
  Hawaiian strings (unlock messages are English game terms) -- skip CONTENT.md plan

### Integration Points
- Pointerdown handler (GameScene.js:188-193): after `placeBuilding()` returns true, add
  `const newTechs = checkTechUnlocks(state);` then handle feedback + `updateSelector(this)`
- End Turn handler (GameScene.js:225-231): after `processTick()`, add
  `const newTechs = checkTechUnlocks(state);` then handle feedback, then `updateSelector(this)`
  (already called -- just add the check before it)
- `buildings.js` exports to study: `canPlace`, `placeBuilding`, `recalcPopCap` --
  `checkTechUnlocks` follows the same export + state-mutation pattern

</code_context>

<specifics>
## Specific Ideas

- **Civ6 Eureka model:** User explicitly referenced this. "As soon as you unlock the tech,
  you should be able to spend it that turn." Placement-time check (not End Turn) is required
  for Eureka to feel responsive. Masonry is ike-threshold and evaluates at End Turn, which
  is acceptable since ike only changes at year rollover anyway.
- **Systems layer terminology:** User asked about game architecture layers during discussion.
  Framing that resonated: `/src/game/` = Game Core / Systems layer (pure logic); `/src/scenes/`
  = Renderer/View (reads state, draws, handles input). `techs.js` is a System.
- **Ike collection cadence (future design):** User envisions 1 ike per quarter-year
  (4/year instead of current 1/year), splitting each season into 2 shorter arcs for
  more player interaction. This is a meaningful rhythm change deferred to a future sprint.
  The masonry threshold of 3 is calibrated to the CURRENT annual model; it will need
  re-evaluation when cadence changes.
- **Resource collection mechanic (open design question):** User flagged an unresolved
  question: turn-based passive collection (current) vs player-directed unit collection
  (Warcraft model). Not Sprint 5 scope but relevant to future sprint planning.
- **More tech types coming:** User confirmed there will be more than 2 tech unlocks
  total. Not all will be building-count Eureka. Village grants (map objects granting techs)
  are a future mechanic. `techs.js` should be structured to make adding new conditions easy.

</specifics>

<deferred>
## Deferred Ideas

- **Population growth mechanic:** When/how does `state.population` grow toward `populationCap`?
  Currently starvation-only. Sprint 6+ design decision.
- **Quarterly ike collection cadence:** 1 ike per 3 turns (4/year) instead of 1/year at year
  rollover. User's preferred rhythm. Requires rethinking the Masonry threshold and processTick
  ike block. Deferred to its own sprint.
- **Resource collection mechanic:** Turn-based passive vs player-directed unit collection.
  Open architectural question. Post-capstone scope.
- **Village/event tech grants:** Map objects granting techs (e.g., discovering a coastal
  village grants Fishing). Future mechanic; `techs.js` architecture should make this addable.
- **Pop 5/0 cleanup:** Addressed in Sprint 5 with populationCap: 5 initialization. No further
  action needed.
- **Heiau cultural rendering:** Blocked post-capstone. Sprint 5 ike logic already accounts
  for heiauCount=0 as the baseline case (no code change needed).

</deferred>

---

*Phase: sprint-5 -- Tech Unlock System*
*Context gathered: 2026-05-29*
