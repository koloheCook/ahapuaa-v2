---
phase: sprint-4
plan: sprint-4-03
type: execute
wave: 2
depends_on:
  - sprint-4-01
files_modified:
  - src/game/resourceTick.js
autonomous: true
requirements:
  - SPRINT4-DUAL-CLOCK
  - SPRINT4-LONO-MULTIPLIER
  - SPRINT4-IKE-ACCUMULATION
must_haves:
  truths:
    - processTick derives month from state.turn using the v2-correct formula
    - Wet season is defined as month >= 11 OR month <= 4 (six months)
    - loi taro yield applies a 1.5x multiplier during wet season; loko-ia fish yield is unchanged
    - state.month is updated every tick; state.year increments and state.month resets to 1 every 12 turns
    - ike accumulates at year rollover: +1 base + 2 per heiau placed
    - The taro floor (Math.max) is not duplicated
  artifacts:
    - path: "src/game/resourceTick.js"
      provides: "processTick with dual-clock and Lono multiplier"
      contains: "isWetSeason"
  key_links:
    - from: "src/game/resourceTick.js"
      to: "state.month"
      via: "state.month = month after starvation block"
      pattern: "state\\.month = month"
    - from: "src/game/resourceTick.js"
      to: "state.resources.ike"
      via: "year rollover block increments ike"
      pattern: "state\\.resources\\.ike"
---

<objective>
Add dual-clock logic (month derivation, wet/dry season, year rollover) and the Lono seasonal
multiplier for loi taro yield to resourceTick.js.

Purpose: The game needs time to feel like time. Month/year tracking drives the wet/dry season
toggle for the Lono agricultural multiplier and the ʻIke accumulation reward at year end.
Plans 02 and 03 run in parallel (Wave 2) -- they touch different files with no conflict.

Output: resourceTick.js with month formula, isWetSeason flag, Lono multiplier on loi, and
year rollover block including ike accumulation.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/sprint-4/sprint-4-CONTEXT.md
@src/game/resourceTick.js

<interfaces>
<!-- Current processTick -- read before editing. -->

From src/game/resourceTick.js (full file, 22 lines):
```js
export function processTick(state, tiles) {
  for (const building of Object.values(state.buildings)) {
    const tile = tiles[building.col][building.row];
    const mult = tile.nutrients / 100;

    if (building.type === 'loi') {
      state.resources.taro += Math.round(3 * mult);
    } else if (building.type === 'loko-ia') {
      state.resources.fish += Math.round(3 * mult);
    }
  }

  state.resources.taro -= state.population;
  state.resources.taro = Math.max(0, state.resources.taro);  // <-- taro floor, DO NOT ADD ANOTHER

  if (state.resources.taro < 0) {
    state.population = Math.max(0, state.population - 1);
  }

  console.log(`[Turn ${state.turn}] Resources:`, { ...state.resources }, '| Population:', state.population);
}
```

State shape after Plan 02 runs (fields this plan reads/writes):
  state.turn       -- pre-incremented by End Turn before processTick is called
  state.month      -- written by this plan (D-10: top-level field)
  state.year       -- written by this plan (D-10: top-level field)
  state.resources.ike -- written by this plan (D-11: inside resources)
  state.buildings  -- read to count heiau (D-08)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add month derivation and isWetSeason at top of processTick</name>
  <files>src/game/resourceTick.js</files>
  <read_first>
    - src/game/resourceTick.js -- read the full file before editing; understand the current structure
    - .planning/phases/sprint-4/sprint-4-CONTEXT.md -- D-05 (month formula), D-06 (wet season), D-07 (Lono multiplier), D-08 (rollover block), D-09 (do not duplicate taro floor)
  </read_first>
  <action>
    Edit src/game/resourceTick.js. The current file is 22 lines. Make the following additions in order.

    STEP 1 -- Add two const declarations at the TOP of the function body, before the for loop:

      const month = ((state.turn - 1) % 12) + 1;
      const isWetSeason = month >= 11 || month <= 4;

    IMPORTANT: The formula is ((state.turn - 1) % 12) + 1, NOT (state.turn % 12) + 1.
    The v2 End Turn handler increments state.turn BEFORE calling processTick, so turn 1
    produces month 1, turn 12 produces month 12, turn 13 produces month 1 again.
    The alternative formula (state.turn % 12 + 1) is from the Phaser 3 prototype where
    turn was NOT pre-incremented -- it is wrong for v2 and must not be used.

    STEP 2 -- Modify the loi production line inside the for loop:
    Change:
      state.resources.taro += Math.round(3 * mult);
    To:
      state.resources.taro += Math.round((isWetSeason ? 1.5 : 1.0) * 3 * mult);

    The loko-ia line is NOT changed. Fish yield has no seasonal multiplier (D-07).

    STEP 3 -- Add the year/month rollover block AFTER the existing taro floor line and
    AFTER the starvation population check block. The existing code after the for loop is:

      state.resources.taro -= state.population;
      state.resources.taro = Math.max(0, state.resources.taro);  // <-- taro floor

      if (state.resources.taro < 0) {
        state.population = Math.max(0, state.population - 1);
      }

    Add the following block AFTER the closing brace of the starvation if block:

      state.month = month;
      if (state.turn % 12 === 0) {
        state.year++;
        state.month = 1;
        const heiauCount = Object.values(state.buildings).filter(b => b.type === 'heiau').length;
        state.resources.ike = Math.max(0, state.resources.ike + heiauCount * 2 + 1);
      }

    CRITICAL CONSTRAINTS:
    - Do NOT add a second Math.max(0, state.resources.taro) call anywhere. The taro floor on
      line 14 already handles this (D-09). Adding a duplicate is a known risk -- do not do it.
    - The starvation check `if (state.resources.taro < 0)` was already unreachable after the
      Math.max(0, ...) floor but it exists in the original -- preserve it unchanged.
    - No Phaser imports. This file must remain import-free (CLAUDE.md architectural rule:
      src/game/ has zero Phaser imports).
    - No changes to the console.log line or any other existing logic.
  </action>
  <verify>
    <automated>node --input-type=module &lt;&lt;'EOF'
// Minimal state mock to test processTick logic
const state = {
  resources: { taro: 10, fish: 10, wood: 10, stone: 10, tools: 10, ike: 0 },
  population: 2,
  populationCap: 0,
  buildings: {},
  turn: 12,
  techs: [],
  month: 1,
  year: 1,
};
const tiles = {};

import('/Users/scottywright-ahsam/Desktop/Archived/Pioneer\ Species/Projects/ahapuaa-v2/src/game/resourceTick.js').then(({ processTick }) => {
  processTick(state, tiles);
  // turn 12 -> year rollover -> state.year should be 2, state.month should be 1
  console.assert(state.year === 2, 'year rollover FAIL: ' + state.year);
  console.assert(state.month === 1, 'month reset FAIL: ' + state.month);
  // ike: no heiau, so +1 base
  console.assert(state.resources.ike === 1, 'ike base FAIL: ' + state.resources.ike);
  console.log('PASS');
}).catch(e => console.error('FAIL', e));
EOF</automated>
  </verify>
  <done>
    - processTick begins with: const month = ((state.turn - 1) % 12) + 1;
    - processTick begins with: const isWetSeason = month >= 11 || month <= 4;
    - loi taro line uses: Math.round((isWetSeason ? 1.5 : 1.0) * 3 * mult)
    - loko-ia fish line is unchanged
    - Year rollover block exists after the starvation check block: increments state.year, resets state.month to 1, adds ike
    - state.month = month is assigned every tick (before the rollover check overrides it on turn 12 multiples)
    - No second Math.max(0, state.resources.taro) call added
    - No Phaser imports in file
    - Turn 12 smoke test: year increments to 2, month resets to 1, ike becomes 1 (no heiau)
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| processTick -> state | Pure function over in-memory state; no external input reaches this code |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-s4-04 | Tampering | state.resources.ike arithmetic | accept | ike computed from heiau count (integer) and base +1; Math.max(0,...) ensures non-negative; no user-controlled value enters |
| T-s4-05 | Denial of Service | Object.values(state.buildings) heiau filter | accept | state.buildings is bounded by user placements in a turn-based game; linear scan is safe |
</threat_model>

<verification>
Node smoke test (see automated verify block in Task 1) must log "PASS".

Additional manual checks after Plan 04 runs (HUD visible):
- After turn 1 (first End Turn click): hud-month shows 1, hud-season shows Hoʻoilo (month 1 is wet)
- After turn 11 (eleventh click): hud-month shows 11, hud-season shows Hoʻoilo (month 11 is wet)
- After turn 12 (twelfth click): hud-year shows 2, hud-month shows 1, hud-ike shows 1
- After turn 5: hud-month shows 5, hud-season shows Kauwela (month 5 is dry)
</verification>

<success_criteria>
- processTick correctly derives month 1-12 from state.turn using ((state.turn - 1) % 12) + 1
- Wet season covers months 11-12 and 1-4; dry season covers months 5-10
- loi taro yield is 1.5x during wet season; loko-ia fish yield is unchanged
- state.month and state.year update correctly each tick; state.resources.ike accumulates at year rollover
- No architectural violations: zero Phaser imports, no duplicate taro floor
</success_criteria>

<output>
After completion, create .planning/phases/sprint-4/sprint-4-03-SUMMARY.md
</output>
