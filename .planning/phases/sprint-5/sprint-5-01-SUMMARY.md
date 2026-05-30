---
phase: sprint-5
plan: "01"
subsystem: game-logic
tags: [tech-unlocks, systems-layer, game-state, carpentry, masonry]
dependency_graph:
  requires: []
  provides: [checkTechUnlocks, populationCap-baseline]
  affects: [src/scenes/GameScene.js]
tech_stack:
  added: []
  patterns: [systems-layer-export, state-mutation-with-return, idempotent-guard]
key_files:
  created:
    - src/game/techs.js
  modified:
    - src/game/gameState.js
decisions:
  - "checkTechUnlocks(state) mutates state.techs[] directly and returns newly-unlocked array -- mirrors placeBuilding/processTick signature pattern"
  - "Masonry threshold 3 is a design placeholder tied to unresolved ike cadence decision"
  - "populationCap initialized to 5 to match population: 5 start value; recalcPopCap() still owns runtime updates"
metrics:
  duration: "3 minutes"
  completed: "2026-05-30"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 1
---

# Phase sprint-5 Plan 01: Tech Unlock System (Systems Layer) Summary

**One-liner:** Systems-layer `checkTechUnlocks(state)` with Carpentry (haleCount >= 3) and Masonry (ike >= 3) conditions, plus populationCap: 5 start-state fix.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create src/game/techs.js with checkTechUnlocks(state) | 98c4458 | src/game/techs.js (created) |
| 2 | Fix populationCap initialization in gameState.js | 827b60b | src/game/gameState.js (modified) |

---

## What Was Built

### src/game/techs.js (new)

The Systems-layer owner of all tech unlock conditions. Exports a single named function `checkTechUnlocks(state)` with zero Phaser imports, following the same export + state-mutation pattern as `buildings.js` and `resourceTick.js`.

- **Carpentry condition (D-06):** `haleCount >= 3 && !state.techs.includes('carpentry')` -- haleCount derived from `Object.values(state.buildings).filter(b => b.type === 'hale').length`
- **Masonry condition (D-08):** `state.resources.ike >= 3 && !state.techs.includes('masonry')` -- threshold 3 is a placeholder per D-08
- **Idempotent:** `!includes` guard prevents double-push on repeat calls
- **Extensible:** comment block at top documents the pattern for adding future conditions
- All 5 inline node tests pass (no-unlock, Carpentry Eureka, Masonry threshold, already-unlocked idempotency, zero Phaser imports)

### src/game/gameState.js (modified -- one line)

`populationCap: 0` changed to `populationCap: 5` with an inline comment. Fixes the HUD showing "Pop 5 / 0" on game start. `recalcPopCap()` in buildings.js still overwrites this baseline when the first hale is placed, which is the intended behavior (D-02).

---

## Deviations from Plan

None -- plan executed exactly as written. Both tasks implemented to spec with no auto-fix triggers.

---

## Verification Results

All 6 post-plan checks passed:
1. `node --check src/game/techs.js` -- PASS
2. `node --check src/game/gameState.js` -- PASS
3. `grep "from 'phaser'" src/game/techs.js` -- PASS (zero results)
4. `grep "populationCap: 5" src/game/gameState.js` -- PASS (1 match)
5. `grep "export function checkTechUnlocks" src/game/techs.js` -- PASS (1 match)
6. All 5 inline node tests -- PASS

---

## Known Stubs

One intentional design placeholder (not a UI stub):

| File | Line | Description |
|------|------|-------------|
| src/game/techs.js | 32 | Masonry threshold value `3` is a placeholder calibrated to the current annual ike model; linked to the unresolved "ike collection cadence" design decision (D-08). Will need re-evaluation when quarterly ike cadence is implemented. |

This placeholder does not block any plan goal -- the function is fully implemented and the value `3` is functional under the current model.

---

## Threat Flags

No new network endpoints, auth paths, or trust boundary changes introduced. Both files are pure game-logic in the Systems layer with no external surface.

---

## Integration Notes for Plan 02

`checkTechUnlocks` is now ready for wiring in `GameScene.js`. Per D-05, it must be called:
1. After `placeBuilding()` returns true in the pointerdown handler (Carpentry Eureka)
2. After `processTick()` in the End Turn handler (Masonry threshold)

On non-empty return: play `success.ogg` and write unlock message to `#rejection-reason` with the existing 3s fade-out pattern (D-10, D-11).

---

## Self-Check: PASSED

- src/game/techs.js: FOUND
- src/game/gameState.js: FOUND (modified)
- Commit 98c4458: FOUND
- Commit 827b60b: FOUND
