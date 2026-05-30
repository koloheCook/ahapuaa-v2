---
phase: sprint-5
plan: 02
status: complete
verified_by: human-checkpoint (user QA 2026-05-30)
commits:
  - 23387c7  feat(sprint-5-02): import + wire 2 call sites in GameScene.js
  - 053f6f9  feat(sprint-5-02): unlock helpers + updateSelector extension
  - 6aee067  fix(sprint-5-02): audio crash guard + building visual upgrade on tech unlock
  - ab8e42e  fix(sprint-5): audio loading in PreloadScene + tech HUD row + DevMode panel
  - eea71e0  fix(sprint-5): HUD timing, visual tier on placement, DevMode toggles
  - ce57551  fix(sprint-5): restore checkTechUnlocks in placement, auto-select highest tier
---

# Sprint 5 Plan 02 -- SUMMARY

## What Was Built

GameScene.js wired to the tech unlock system created in Plan 01.

### Core wiring
- `checkTechUnlocks(state)` called in **two places**:
  1. Pointerdown handler after `placeBuilding()` returns true (Carpentry Eureka path)
  2. End Turn handler after `processTick()` (Masonry threshold path)
- On unlock: `success.ogg` plays (guarded by `cache.audio.exists()`), unlock message
  fades in `#rejection-reason`, building visuals refresh, selector updates

### Unlock feedback
- `showUnlockMessage(techName)` -- reuses `#rejection-reason` element with 3s
  opacity fade (same pattern as placement rejection messages, per D-10)
- `flashNewTierButtons(newTechs)` -- 500ms background flash on newly-enabled tier
  button to draw player attention

### Tier selector behavior
- `updateSelector` extended: for hale, only the **highest unlocked tier** is enabled;
  lower tiers are dimmed (opacity 0.4, pointerEvents none) once superseded
  - No techs: T1 only
  - Carpentry: T2 only (T1 dims)
  - Masonry: T3 only (T1+T2 dim)
- `selectHighestAvailableTier(scene)` -- new helper; sets `scene.selectedTier` to the
  highest available tier; called before `updateSelector()` in all tech-change paths so
  selection auto-advances without player input

### Building visual upgrade (added during QA)
- `getVisualTier(building, techs)` -- computes visual tier: hale gains 1 visual tier
  per unlocked tech (carpentry, masonry), capped at 2
- `applyBuildingVisual(col, row, building, scene, overrideVisualTier)` -- applies tint
  from `BUILDING_TIER_TINT` + Phaser text label for tier 2+ buildings
  - `overrideVisualTier` param: pass `building.tier` on fresh placement so the
    building shows its selected tier; omit to apply tech-bonus visual tier
- `refreshAllBuildingVisuals(scene)` -- iterates all `state.buildings` and re-applies
  visual tier when a tech unlocks (existing buildings upgrade visually)

### Audio fix
- PreloadScene was not loading any audio files -- added 4 `this.load.audio()` calls
  for canonical keys (`click`, `success`, `alert`, `ambient`)

### DevMode panel (added during QA to unblock testing)
- Press `G` to toggle DevMode panel (hidden by default; remove before public demo)
- Resource buttons: `+10 Wood / Stone / Taro / Fish`, `+5 ike`
- Tech toggles: `Force / Remove Carpentry`, `Force / Remove Masonry` -- labels update
  via `updateDevMode()` called from `updateHUD()`

### HUD additions
- `Techs:` row shows active techs persistently (replaces reliance on 3s fade message)
- `updateDevMode()` syncs DevMode button labels whenever HUD updates

## Bugs Fixed During QA

| Bug | Root cause | Fix |
|-----|-----------|-----|
| Carpentry fired at End Turn, not placement | Bad edit replaced `const newTechs = checkTechUnlocks(state)` with `updateHUD()` | Restored declaration in placement handler |
| Sound never played | PreloadScene never loaded audio files | Added `this.load.audio()` calls |
| `Techs: none` after unlock | `updateHUD()` called before `checkTechUnlocks` | Moved `checkTechUnlocks` before `updateHUD()` |
| Newly-placed buildings showed wrong tier | `applyBuildingVisual` applied tech bonus to fresh placements | Added `overrideVisualTier` parameter |

## Verification Results (user QA 2026-05-30)

| Check | Result |
|-------|--------|
| Pop 5 / 5 at load | PASS |
| T2/T3 dimmed + `Techs: none` at start | PASS |
| 3rd hale triggers Carpentry immediately (message + sound + T2 auto-selects) | PASS |
| Techs: carpentry in HUD immediately on placement | PASS |
| Carpentry persists across End Turn | PASS |
| Masonry unlocks at End Turn when ike >= 3 | PASS |
| T2 hale placement works after Carpentry, no JS errors | PASS |
| loi / loko-ia T2/T3 still dimmed (unaffected) | PASS |
| DevMode tech toggles persist through End Turn | PASS |

## Exit Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | PASS (chunk warning is Phaser's own code, pre-existing) |
| `grep -c "checkTechUnlocks(state)" GameScene.js` returns 2 | PASS |
| import present | PASS |
| `populationCap: 5` in gameState.js | PASS |
| `grep "from 'phaser'" techs.js` returns 0 | PASS |

## Decisions Made During Sprint

- **Highest-tier-only selector**: After unlock, lower tiers dim entirely (not "all tiers
  available"). User feedback drove this -- preserves clarity about what the player is
  building with current tech level.
- **Visual tier formula**: existing buildings upgrade 1 visual tier per tech unlock;
  newly placed buildings show their actual selected tier. Separates "legacy upgrade"
  from "explicit choice."
- **DevMode as sprint artifact**: Built during QA to unblock testing, not in original
  scope. Panel is hidden by default. Marked for removal before public demo.
  Testing workflow (seed states + automated audit) captured as Sprint 6 scope.
