---
phase: sprint-4
phase_name: "Dual-Clock System + ʻIke Accumulation"
project: "Ahupuaa: The Living Land (Phaser 4 Rebuild)"
generated: "2026-05-29"
counts:
  decisions: 7
  lessons: 4
  patterns: 5
  surprises: 3
missing_artifacts:
  - "sprint-4-UAT.md (no separate UAT file -- browser verification folded into sprint-4-04-SUMMARY and sprint-4-VERIFICATION)"
---

# Phase Sprint-4 Learnings: Dual-Clock System + ʻIke Accumulation

---

## Decisions

### D-01: CONTENT.md updated before any code references Hawaiian strings

Season names (Hoʻoilo, Kauwela) and ʻIke were added to CONTENT.md in Plan 01 (commit
0a253c2) before Plans 02-04 touched any code file. This is an enforced project rule, not
a judgment call -- but the sprint made it explicit as a sequencing constraint in the wave
structure.

**Rationale:** Hawaiian term integrity rule in CLAUDE.md and CONTENT.md: no Hawaiian string
may appear in code unless it exists in CONTENT.md first. Sequencing the content commit
before code commits makes this verifiable via git log.
**Source:** sprint-4-01-PLAN.md, sprint-4-VERIFICATION.md

---

### D-02: Month formula is `((state.turn - 1) % 12) + 1` -- not the P3 formula

The Phaser 3 prototype used `(state.turn % 12) + 1`. That formula is wrong for v2 because
v2's End Turn handler pre-increments `state.turn` before calling `processTick`, while P3
did not. The v2 formula ensures turn 1 -> month 1, turn 12 -> month 12, turn 13 -> month 1.

**Rationale:** P3 and v2 have different state mutation timing around the tick. Porting the
formula verbatim would produce month-off-by-one errors (turn 1 would display month 2).
**Source:** sprint-4-03-PLAN.md, sprint-4-03-SUMMARY.md

---

### D-03: ike inside resources, month and year at top level of state

`state.resources.ike` -- inside the resources object alongside taro/fish/wood/stone/tools.
`state.month` and `state.year` -- at top level of state, alongside population and buildings.

**Rationale:** ike is a player resource with the same display and tick semantics as taro/fish.
Month and year are time-tracking fields, not player resources -- they live at state top level
like `turn` and `population`, not inside the resources bag.
**Source:** sprint-4-02-PLAN.md, sprint-4-CONTEXT.md D-10/D-11

---

### D-04: SEASON_LABEL declared at module scope, not inside create()

`const SEASON_LABEL = { wet: 'Hoʻoilo', dry: 'Kauwela' };` sits at module level alongside
`TERRAIN_TO_FRAME`, `TERRAIN_TO_TINT`, and `BUILDING_TINT` -- before the class declaration.

**Rationale:** `updateHUD()` is a module-level function and needs access to SEASON_LABEL
without receiving it as a parameter. Module-level declaration is consistent with existing
constant patterns in GameScene.js and avoids either a parameter or a create()-scoped variable
that updateHUD() could not reach.
**Source:** sprint-4-04-PLAN.md, sprint-4-04-SUMMARY.md

---

### D-05: Only loi gets the Lono wet-season multiplier -- loko-ia fish yield unchanged

`loi` taro yield: `Math.round((isWetSeason ? 1.5 : 1.0) * 3 * mult)`. Loko-ia fish yield:
`Math.round(3 * mult)` -- no multiplier applied.

**Rationale:** Lono is the Hawaiian god associated with rain and agriculture, not fishponds.
The seasonal multiplier applies to rain-fed cultivation (loi kalo) only. Loko-ia are coastal
systems less directly affected by the wet/dry cycle in this model.
**Source:** sprint-4-03-PLAN.md D-07, sprint-4-CONTEXT.md

---

### D-06: isWet computed at render time in updateHUD, not cached on state

`updateHUD()` computes `const isWet = state.month >= 11 || state.month <= 4;` inline each
call. There is no `state.isWetSeason` field.

**Rationale:** Derived values should not be stored on state when they can be computed
deterministically from existing state fields. Caching `isWetSeason` would create a second
source of truth that could diverge. Consistent with the existing pattern of computing display
values from state in updateHUD.
**Source:** sprint-4-04-PLAN.md, sprint-4-04-SUMMARY.md decisions

---

### D-07: Hale raises populationCap only -- no direct taro effect

Placing a hale raises `state.populationCap` by 5. It does not affect taro. Taro changes only
at End Turn via loi production and starvation consumption in `processTick`.

**Rationale:** Confirmed against design intent during sprint-4 execution. No Sprint 4
requirement defined a hale-to-taro relationship. The design separates settlement capacity
(hale) from food production (loi).
**Source:** sprint-4-04-SUMMARY.md, HANDOFF.json decisions

---

## Lessons

### L-01: P3 and v2 have divergent state mutation timing -- always re-verify ported formulas

The P3 `processTick` formula `(state.turn % 12) + 1` is wrong for v2 because v2 pre-increments
`state.turn++` in the End Turn handler before calling `processTick`. P3 did not pre-increment.
This divergence is invisible unless you trace the full call sequence; the formula looks plausible
on its face.

**Context:** Before porting any formula from P3 that depends on `state.turn`, verify whether
the End Turn call order differs. The month formula is the first confirmed case of this.
**Source:** sprint-4-03-PLAN.md, sprint-4-03-SUMMARY.md

---

### L-02: Existing CONTENT.md entries use U+0027 (straight apostrophe) -- new entries must use U+02BB

CONTENT.md predates the ʻokina integrity rule. Pre-existing entries use a straight apostrophe
(U+0027) where U+02BB is correct. Sprint 4 added new entries using U+02BB (verified via
python3 byte check) but left existing entries unchanged as out of scope.

**Context:** A future Hawaiian string audit sprint will need to audit and fix the pre-existing
straight apostrophe entries. Do not assume all existing CONTENT.md ʻokina are correct -- only
Sprint 4 additions (ʻIke, Hoʻoilo) are verified U+02BB.
**Source:** sprint-4-01-SUMMARY.md decisions

---

### L-03: The starvation check is unreachable after the taro floor -- a pre-existing code smell

`src/game/resourceTick.js` has this sequence:
```js
state.resources.taro = Math.max(0, state.resources.taro);  // floor at 0
if (state.resources.taro < 0) { ... }                       // unreachable
```
The `if` block can never fire because the floor already prevents `taro < 0`. This was
present in the P3 prototype and carried forward unchanged. Sprint 4 preserved it rather
than removing it (scope discipline: do not fix things outside the sprint's scope).

**Context:** Flag for a cleanup sprint. The starvation block should either be removed or
the floor should be moved below it. Current state is logically harmless but misleading.
**Source:** sprint-4-03-PLAN.md D-09, sprint-4-03-SUMMARY.md

---

### L-04: Heiau ike accumulation is dormant until the cultural asset gap is resolved

`processTick` correctly computes `heiauCount * 2 + 1` ike per year rollover. But heiau
placement is blocked by a cultural asset mismatch (`medieval_church.png` is forbidden for
Hawaiian sacred sites -- see CLAUDE.md). In practice, heiauCount is always 0, and the
effective ike gain is +1 base per year regardless of buildings.

**Context:** The formula is correct and will activate automatically once the heiau asset
gap is resolved post-capstone. No code change needed -- the path is tested and verified
via the smoke test (no-heiau case). The gap is cultural/design, not technical.
**Source:** sprint-4-03-SUMMARY.md known stubs, CLAUDE.md heiau cultural flag

---

## Patterns

### P-01: CONTENT.md-first commit pattern for Hawaiian strings

When a sprint introduces new Hawaiian terms (season names, building names, cultural
concepts), add them to CONTENT.md in a dedicated first plan/commit before any code
file references those strings. This makes the "strings sourced from canonical file"
invariant verifiable via git log.

**When to use:** Every sprint that introduces a new Hawaiian string to the UI or game
logic. The pattern is enforced by CLAUDE.md's Hawaiian term integrity rule.
**Source:** sprint-4-01-PLAN.md, sprint-4-VERIFICATION.md

---

### P-02: Wave-based parallel execution for independent files in the same sprint

Sprint 4 ran Plans 02 and 03 in parallel (Wave 2) because they modified different files
(`gameState.js` and `resourceTick.js`) with no shared write conflicts. Plan 01 was Wave 1
(prerequisite: CONTENT.md). Plan 04 was Wave 3 (requires both 02 and 03 complete).

**When to use:** When multiple plans in a sprint modify non-overlapping files. Map
dependencies first; if Plan A writes no file that Plan B reads, they can run in parallel.
This is the GSD wave model -- declare `depends_on` in PLAN.md frontmatter to make
dependency structure explicit.
**Source:** sprint-4-03-PLAN.md wave frontmatter, HANDOFF.json completed_tasks

---

### P-03: Module-level constant pattern for scene-wide lookup tables

`TERRAIN_TO_FRAME`, `TERRAIN_TO_TINT`, `BUILDING_TINT`, `SINGLE_TIER_TYPES`, and now
`SEASON_LABEL` are all declared at module scope in GameScene.js before the class
declaration. This makes them available to all module-level functions (updateHUD,
updateSelector, etc.) without passing them as parameters.

**When to use:** Any lookup table or constant set that is referenced by more than one
function in the scene module. Do not declare inside `create()` unless the value is
scene-instance-specific.
**Source:** sprint-4-04-PLAN.md, sprint-4-04-SUMMARY.md patterns-established

---

### P-04: Sprint hook point pattern -- wire the call first, define the behavior next sprint

`updateSelector(this)` was added to the End Turn handler at the end of Sprint 4 as a
call point. Sprint 3 already defined the function; Sprint 4 just wired it in. Sprint 5
will add the Eureka/tech unlock checks inside `updateSelector` or `processTick` without
touching the End Turn handler again.

**When to use:** When the next sprint's behavior needs a trigger point that already exists
in the current sprint's code. Wire the call now so the next sprint only needs to implement
the called function, not modify the calling location.
**Source:** sprint-4-04-PLAN.md D-17, sprint-4-CONTEXT.md

---

### P-05: Derived-at-render-time pattern for display flags

`isWet` is computed inline in `updateHUD()` from `state.month` on every render call. It is
not stored on state. This keeps state as the single source of truth -- display flags are
computed from state, not stored alongside it.

**When to use:** Any boolean or display-only derived value that can be computed
deterministically from existing state fields. Storing derived values on state creates a
second source of truth and risks divergence. Compute at read time instead.
**Source:** sprint-4-04-PLAN.md, sprint-4-04-SUMMARY.md decisions

---

## Surprises

### S-01: P3 month formula is wrong for v2 -- a silent regression risk

The Phaser 3 prototype's formula `(state.turn % 12) + 1` produces month 2 on turn 1 in v2
(because v2 pre-increments turn before the tick). This would have been a silent bug:
the month counter would appear to work but would be off by one for the entire game.
The formula divergence was caught during planning because the sprint plan explicitly
compared the v2 call order to P3.

**Impact:** If discovered post-capstone this would have required a CONTENT.md audit to
check whether any month-gated logic (Lono multiplier, ike rollover, season labels) was
producing incorrect results for prior sessions. Caught early -- no impact.
**Source:** sprint-4-03-PLAN.md, sprint-4-03-SUMMARY.md

---

### S-02: autonomous: false for Plan 04 was the right call -- browser verification caught display timing edge case

Plan 04 was marked `autonomous: false` because seasonal HUD display requires human
verification of correct label rendering. The browser checkpoint surfaced one edge case:
the initial HUD shows `Season: --` before the first `updateHUD()` call (the span
defaults to "--"), then immediately shows `Hoʻoilo` on game start. This behavior is
acceptable but would not have been detectable from static code analysis alone.

**Impact:** Low -- the "--" flash is imperceptible. But the pattern confirms that
human verification checkpoints catch display-timing nuances that automated checks miss.
Use `autonomous: false` for plans where the "correct" result is visual.
**Source:** sprint-4-04-SUMMARY.md, sprint-4-VERIFICATION.md human verification section

---

### S-03: Population growth is undefined -- starvation-only system for the entire v2 build so far

`state.population` can decrease (starvation: pop - 1 when taro < 0 post-floor) but never
increases. `populationCap` is set by hale placement, but there is no mechanic that grows
pop toward popCap. This gap was not discovered during Sprint 4 planning -- it emerged
during sprint execution when verifying the End Turn flow.

**Impact:** Players who survive to high popCap will not benefit from it. The `Pop 5 / 0`
display oddity at game start (pop starts at 5, popCap at 0 until a hale is placed) is a
related symptom. Sprint 5 discuss-phase should define the population growth trigger.
**Source:** sprint-4-04-SUMMARY.md open questions, HANDOFF.json context_notes
