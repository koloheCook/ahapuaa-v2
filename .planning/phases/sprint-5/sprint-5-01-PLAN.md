---
phase: sprint-5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/game/techs.js
  - src/game/gameState.js
autonomous: true
requirements:
  - TECH-01
  - TECH-02
  - STATE-01

must_haves:
  truths:
    - "src/game/techs.js exports checkTechUnlocks(state) with zero Phaser imports"
    - "checkTechUnlocks returns an array of newly-unlocked tech strings and mutates state.techs[]"
    - "Carpentry condition: haleCount >= 3 and !state.techs.includes('carpentry')"
    - "Masonry condition: state.resources.ike >= 3 and !state.techs.includes('masonry')"
    - "gameState.js initializes populationCap: 5"
  artifacts:
    - path: "src/game/techs.js"
      provides: "checkTechUnlocks(state) -- all tech unlock conditions in one Systems file"
      exports: ["checkTechUnlocks"]
    - path: "src/game/gameState.js"
      provides: "populationCap baseline fix"
      contains: "populationCap: 5"
  key_links:
    - from: "src/game/techs.js"
      to: "state.techs"
      via: "direct array push on state.techs"
      pattern: "state\\.techs\\.push"
    - from: "src/game/techs.js"
      to: "state.buildings"
      via: "Object.values(state.buildings).filter"
      pattern: "Object\\.values\\(state\\.buildings\\)"
---

<objective>
Create src/game/techs.js -- the Systems-layer owner of all tech unlock conditions -- and fix the populationCap start-state bug in gameState.js.

Purpose: Sprint 5 introduces Carpentry (Eureka on 3rd hale) and Masonry (ike threshold).
Both conditions must be evaluated in one place, returning an array of newly-unlocked tech
strings so GameScene.js can trigger feedback without knowledge of condition logic.

Output:
- src/game/techs.js with checkTechUnlocks(state), zero Phaser imports
- src/game/gameState.js with populationCap: 5 (was 0)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/sprint-5/sprint-5-CONTEXT.md

<interfaces>
<!-- Key contracts for this plan. Extracted from codebase. -->

From src/game/gameState.js (current -- line 5):
  populationCap: 0,   // <-- change to 5

From src/game/buildings.js (pattern to mirror for checkTechUnlocks):
  export function canPlace(tile, type, tier, state) { ... }
  export function placeBuilding(tile, type, tier, state) { ... }
  export function recalcPopCap(state) { ... }
  // recalcPopCap resets populationCap from scratch each call -- baseline 5 only matters
  // before the first hale is placed. That is the intended behavior per D-02.

From src/game/buildings.js -- existing state.techs consumers:
  tier === 1 && !state.techs.includes('carpentry')   // T2 hale gate
  tier === 2 && !(state.techs.includes('carpentry') && state.techs.includes('masonry'))  // T3 gate

From src/game/gameState.js -- state shape:
  state.resources.ike   // used by Masonry condition
  state.buildings       // used by Carpentry haleCount (Object.values -> filter b.type === 'hale')
  state.techs           // [] initially; checkTechUnlocks pushes to this array
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create src/game/techs.js with checkTechUnlocks(state)</name>
  <files>src/game/techs.js</files>
  <read_first>
    - src/game/buildings.js -- read the full file; study the export + state-mutation pattern
      (canPlace, placeBuilding, recalcPopCap all take state, mutate directly, return a value)
    - src/game/gameState.js -- confirm state shape: state.techs, state.resources.ike,
      state.buildings are all top-level fields
    - .planning/phases/sprint-5/sprint-5-CONTEXT.md -- D-03 through D-09
  </read_first>
  <action>
    Create src/game/techs.js as a Systems-layer file (zero Phaser imports -- no import from
    'phaser' anywhere in this file).

    Export a single named function: checkTechUnlocks(state)

    Implementation:

    1. Compute haleCount:
       const haleCount = Object.values(state.buildings).filter(b => b.type === 'hale').length;

    2. Collect newly-unlocked techs into an array: const newTechs = [];

    3. Carpentry condition (per D-06):
       if (haleCount >= 3 && !state.techs.includes('carpentry')) {
         state.techs.push('carpentry');
         newTechs.push('carpentry');
       }

    4. Masonry condition (per D-08 -- threshold 3 is a placeholder per D-08 commentary):
       if (state.resources.ike >= 3 && !state.techs.includes('masonry')) {
         state.techs.push('masonry');
         newTechs.push('masonry');
       }

    5. Return newTechs.

    Do NOT enforce Carpentry-before-Masonry in this function (per D-09 -- canPlace() is the
    gate). Both conditions check independently.

    Structure techs.js to make future conditions easy to add: new conditions follow the same
    pattern (check, push to state.techs, push to newTechs). Add a comment block at the top
    noting: "New tech conditions: add a check block here following the same pattern."

    The function signature mirrors the Systems-layer convention in this project:
      export function checkTechUnlocks(state) { ... }
  </action>
  <verify>
    <automated>node --input-type=module &lt;&lt;'EOF'
import { checkTechUnlocks } from './src/game/techs.js';

// Test 1: no unlock -- haleCount < 3, ike < 3
const s1 = { buildings: {}, resources: { ike: 0 }, techs: [] };
const r1 = checkTechUnlocks(s1);
console.assert(r1.length === 0, 'Test 1 FAIL: expected empty array');
console.assert(s1.techs.length === 0, 'Test 1 FAIL: state.techs should be empty');

// Test 2: Carpentry Eureka -- 3 hale placed
const s2 = {
  buildings: { 'hale-0-0': { type: 'hale' }, 'hale-1-0': { type: 'hale' }, 'hale-2-0': { type: 'hale' } },
  resources: { ike: 0 },
  techs: []
};
const r2 = checkTechUnlocks(s2);
console.assert(r2.length === 1, 'Test 2 FAIL: expected 1 unlock');
console.assert(r2[0] === 'carpentry', 'Test 2 FAIL: expected carpentry');
console.assert(s2.techs.includes('carpentry'), 'Test 2 FAIL: state.techs missing carpentry');

// Test 3: Masonry threshold -- ike >= 3
const s3 = { buildings: {}, resources: { ike: 3 }, techs: [] };
const r3 = checkTechUnlocks(s3);
console.assert(r3.length === 1, 'Test 3 FAIL: expected 1 unlock');
console.assert(r3[0] === 'masonry', 'Test 3 FAIL: expected masonry');

// Test 4: already unlocked -- no duplicates
const s4 = {
  buildings: { 'hale-0-0': { type: 'hale' }, 'hale-1-0': { type: 'hale' }, 'hale-2-0': { type: 'hale' } },
  resources: { ike: 5 },
  techs: ['carpentry', 'masonry']
};
const r4 = checkTechUnlocks(s4);
console.assert(r4.length === 0, 'Test 4 FAIL: already unlocked should return empty');
console.assert(s4.techs.length === 2, 'Test 4 FAIL: state.techs should still have 2 items');

// Test 5: zero Phaser imports -- file must not import from phaser
import { readFileSync } from 'fs';
const src = readFileSync('./src/game/techs.js', 'utf8');
console.assert(!src.includes("from 'phaser'"), 'FAIL: Phaser import detected in techs.js');
console.assert(!src.includes('from "phaser"'), 'FAIL: Phaser import detected in techs.js');

console.log('All tests passed');
EOF</automated>
  </verify>
  <acceptance_criteria>
    - src/game/techs.js exists
    - File contains zero occurrences of "from 'phaser'" or 'from "phaser"'
    - checkTechUnlocks is a named export (grep confirms: "export function checkTechUnlocks")
    - Return value is an array ([] for no new unlocks, ['carpentry'] on 3rd hale, ['masonry'] on ike>=3)
    - state.techs.push('carpentry') fires exactly when haleCount >= 3 and carpentry not already in techs
    - state.techs.push('masonry') fires exactly when state.resources.ike >= 3 and masonry not already in techs
    - Calling checkTechUnlocks twice on same state does not double-push (idempotency via !includes guard)
  </acceptance_criteria>
  <done>techs.js exists, exports checkTechUnlocks, has zero Phaser imports, passes all 5 node inline tests</done>
</task>

<task type="auto">
  <name>Task 2: Fix populationCap initialization in gameState.js</name>
  <files>src/game/gameState.js</files>
  <read_first>
    - src/game/gameState.js -- read the full file before editing
    - src/game/buildings.js -- confirm recalcPopCap resets populationCap from scratch each call
      (so the baseline 5 only persists until the first hale is placed -- that is expected per D-02)
    - .planning/phases/sprint-5/sprint-5-CONTEXT.md -- D-02
  </read_first>
  <action>
    In src/game/gameState.js, change:
      populationCap: 0,
    to:
      populationCap: 5,

    This is a one-line change. The comment "Ported verbatim from ahapuaa-game..." is no longer
    fully accurate for this field -- add an inline comment on the populationCap line:
      populationCap: 5, // baseline (Sprint 5 fix: matches population: 5 start value; recalcPopCap overwrites on first hale)

    Do not change any other field. Do not change the comment block at the top of the file.
  </action>
  <verify>
    <automated>grep -n "populationCap: 5" /Users/scottywright-ahsam/Desktop/Archived/Pioneer\ Species/Projects/ahapuaa-v2/src/game/gameState.js</automated>
  </verify>
  <acceptance_criteria>
    - grep confirms "populationCap: 5" appears exactly once in gameState.js
    - "populationCap: 0" does NOT appear in the file
    - All other fields (taro, fish, wood, stone, tools, ike, population, buildings, turn, techs, month, year) are unchanged
    - File is valid JS (node --check src/game/gameState.js passes)
  </acceptance_criteria>
  <done>gameState.js has populationCap: 5; node --check passes; no other fields modified</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| state mutation | checkTechUnlocks mutates state.techs[] directly -- caller trusts the return value accurately reflects what was pushed |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-sprint5-01 | Tampering | state.techs[] | accept | Client-side only; no server; no user-exploitable benefit from injecting fake techs (canPlace enforces the real gates) |
| T-sprint5-02 | Information Disclosure | checkTechUnlocks console logging | accept | No PII; haleCount and ike values are non-sensitive game state |
</threat_model>

<verification>
After both tasks complete:

1. node --check src/game/techs.js -- must pass (valid JS, no syntax errors)
2. node --check src/game/gameState.js -- must pass
3. grep "from 'phaser'" src/game/techs.js -- must return empty (zero results)
4. grep "populationCap: 5" src/game/gameState.js -- must return 1 match
5. grep "export function checkTechUnlocks" src/game/techs.js -- must return 1 match
6. Run the node inline test from Task 1 verify block -- all 5 assertions must pass
</verification>

<success_criteria>
- src/game/techs.js exists with checkTechUnlocks(state) as a named export
- Zero Phaser imports in techs.js (invariant)
- Carpentry condition fires on haleCount >= 3 and not already unlocked
- Masonry condition fires on ike >= 3 and not already unlocked
- Both conditions are idempotent (calling twice does not double-push)
- gameState.js has populationCap: 5
- Both files pass node --check
</success_criteria>

<output>
After completion, create .planning/phases/sprint-5/sprint-5-01-SUMMARY.md
</output>
