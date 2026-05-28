---
phase: sprint-4
plan: sprint-4-02
type: execute
wave: 2
depends_on:
  - sprint-4-01
files_modified:
  - src/game/gameState.js
autonomous: true
requirements:
  - SPRINT4-STATE-ADDITIONS
must_haves:
  truths:
    - state.month and state.year exist at top level of state (not inside resources)
    - state.resources.ike exists inside the resources object alongside taro, fish, wood, stone, tools
    - All existing state fields are unchanged
  artifacts:
    - path: "src/game/gameState.js"
      provides: "State shape with month, year, ike"
      contains: "month: 1"
  key_links:
    - from: "src/game/gameState.js"
      to: "src/game/resourceTick.js"
      via: "processTick reads and writes state.month, state.year, state.resources.ike"
      pattern: "state\\.month"
    - from: "src/game/gameState.js"
      to: "src/scenes/GameScene.js updateHUD"
      via: "updateHUD reads state.year, state.month, state.resources.ike"
      pattern: "state\\.resources\\.ike"
---

<objective>
Add month, year, and ike fields to gameState.js so processTick and updateHUD have the state
shape they need in Sprint 4.

Purpose: Plans 03 and 04 read and write state.month, state.year, and state.resources.ike.
Those fields must exist on the initial state object before those plans run. D-10, D-11, D-12
specify exact placement.

Output: gameState.js with three new fields: month and year at top level, ike inside resources.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/sprint-4/sprint-4-CONTEXT.md
@src/game/gameState.js

<interfaces>
<!-- Current state shape -- read before editing. -->

From src/game/gameState.js (full file, 9 lines):
```js
export const state = {
  resources: { taro: 10, fish: 10, wood: 10, stone: 10, tools: 10 },
  population: 5,
  populationCap: 0,
  buildings: {},
  turn: 0,
  techs: [],
};
```

Sprint 4 adds three fields (D-10, D-11, D-12):
- month: 1     -- top level, after techs
- year: 1      -- top level, after month
- ike: 0       -- inside resources, after tools

MUST NOT add ike at top level. MUST NOT nest month/year inside resources.
MUST NOT change any existing field name or value.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add month, year to state top level and ike to state.resources</name>
  <files>src/game/gameState.js</files>
  <read_first>
    - src/game/gameState.js -- read the full file (9 lines) before editing; confirm current field names and order
    - .planning/phases/sprint-4/sprint-4-CONTEXT.md -- D-10, D-11, D-12 specify exact placement and nesting rules
  </read_first>
  <action>
    Edit src/game/gameState.js. The file is 9 lines. Make exactly two targeted additions:

    ADDITION 1 -- resources object:
    Change the resources line from:
      resources: { taro: 10, fish: 10, wood: 10, stone: 10, tools: 10 },
    To:
      resources: { taro: 10, fish: 10, wood: 10, stone: 10, tools: 10, ike: 0 },

    ADDITION 2 -- top-level fields:
    After the `techs: [],` line, add two new lines:
      month: 1,
      year: 1,

    Result after both additions:
      export const state = {
        resources: { taro: 10, fish: 10, wood: 10, stone: 10, tools: 10, ike: 0 },
        population: 5,
        populationCap: 0,
        buildings: {},
        turn: 0,
        techs: [],
        month: 1,
        year: 1,
      };

    No other changes. Do not add comments. Do not change any existing field value.
    Do not import anything new -- this file has zero imports and must stay that way (D-12, CLAUDE.md architectural rule).
  </action>
  <verify>
    <automated>node -e "import('/Users/scottywright-ahsam/Desktop/Archived/Pioneer\ Species/Projects/ahapuaa-v2/src/game/gameState.js').then(m => { const s = m.state; console.assert(s.month === 1, 'month missing'); console.assert(s.year === 1, 'year missing'); console.assert(s.resources.ike === 0, 'ike missing'); console.assert(s.resources.taro === 10, 'taro broken'); console.log('PASS'); }).catch(e => console.error('FAIL', e))"</automated>
  </verify>
  <done>
    - state.month === 1 at top level (not inside resources)
    - state.year === 1 at top level (not inside resources)
    - state.resources.ike === 0 (inside resources, alongside taro/fish/wood/stone/tools)
    - state.resources.taro, fish, wood, stone, tools all retain original values (10)
    - state.population, populationCap, buildings, turn, techs all unchanged
    - File has zero imports (CLAUDE.md architectural rule maintained)
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| gameState module -> consumers | State is a module singleton; consumers read/write directly; no external input |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-s4-02 | Tampering | state.resources.ike | accept | ike is written only by processTick heiau count logic (deterministic); no user input reaches it directly |
| T-s4-03 | Information Disclosure | state shape | accept | Browser game; no PII; state is display-only data |
</threat_model>

<verification>
Node import test (see automated verify block) must log "PASS".
Manual check: grep the file to confirm "ike: 0" appears inside the resources object line,
and "month: 1" and "year: 1" appear at top level -- NOT inside resources.
</verification>

<success_criteria>
- gameState.js exports state with three new fields: month, year (top level) and ike (in resources)
- All pre-existing fields and values are unchanged
- File remains import-free (zero Phaser imports -- architectural rule preserved)
</success_criteria>

<output>
After completion, create .planning/phases/sprint-4/sprint-4-02-SUMMARY.md
</output>
