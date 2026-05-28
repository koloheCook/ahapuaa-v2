---
phase: sprint-4
plan: sprint-4-03
subsystem: game-logic
tags: [dual-clock, wet-season, lono-multiplier, ike, resource-tick]
dependency_graph:
  requires: [sprint-4-02]
  provides: [processTick-dual-clock, isWetSeason-flag, ike-accumulation]
  affects: [state.month, state.year, state.resources.ike, loi-taro-yield]
tech_stack:
  added: []
  patterns: [month-derivation-from-turn, wet-season-gate, year-rollover-block]
key_files:
  created: []
  modified:
    - src/game/resourceTick.js
decisions:
  - "Month formula uses ((state.turn - 1) % 12) + 1 -- v2 End Turn pre-increments state.turn before processTick; (state.turn % 12) + 1 is the wrong P3 formula and must not be used"
  - "Wet season is months 11-12 and 1-4 (six months); dry season is months 5-10"
  - "Only loi gets the Lono multiplier (1.5x wet, 1.0x dry); loko-ia fish yield is unchanged per D-07"
  - "state.month assigned unconditionally every tick; year rollover then overrides to 1 on turn % 12 === 0"
  - "Taro floor Math.max(0, ...) was already present -- not duplicated (D-09)"
metrics:
  duration: "< 10 minutes"
  completed: "2026-05-28T19:09:28Z"
  tasks_completed: 1
  tasks_total: 1
---

# Phase sprint-4 Plan sprint-4-03: Dual-Clock and Lono Multiplier Summary

**One-liner:** Added month/year dual-clock, Hoʻoilo/Kauwela wet-season detection, and 1.5x Lono taro multiplier for loi buildings plus ike accumulation at year rollover in processTick.

## What Was Built

`src/game/resourceTick.js` -- `processTick` extended with:

1. **Month derivation** -- `const month = ((state.turn - 1) % 12) + 1;` at the top of the function. Produces month 1-12 correctly given that v2's End Turn handler pre-increments `state.turn` before calling `processTick`.

2. **Wet season flag** -- `const isWetSeason = month >= 11 || month <= 4;` covering the six-month Hoʻoilo season (November through April).

3. **Lono multiplier on loi taro** -- `Math.round((isWetSeason ? 1.5 : 1.0) * 3 * mult)`. Loko-ia fish yield is unchanged.

4. **Year/month rollover block** -- After the starvation check: `state.month = month` assigned every tick; `state.year++` and `state.month = 1` on turns divisible by 12; ike accumulates as `Math.max(0, state.resources.ike + heiauCount * 2 + 1)`.

## Smoke Test Result

Turn 12, no buildings, population 2, taro starts 10:
- `state.year === 2` PASS
- `state.month === 1` PASS
- `state.resources.ike === 1` PASS

## Decisions Made

- Month formula `((state.turn - 1) % 12) + 1` is correct for v2; the P3 formula `(state.turn % 12) + 1` is wrong because P3 did not pre-increment before tick.
- Taro floor (`Math.max(0, ...)`) preserved on line 14; no second call added (D-09).
- No Phaser imports -- `src/game/resourceTick.js` remains a pure JS module with zero engine dependencies.

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None. The heiau count filter (`b.type === 'heiau'`) will always return 0 in the current game because heiau placement is blocked (culturally mismatched asset -- `medieval_church.png`). This means the base +1 ike per year is the only path until the heiau asset gap is resolved post-capstone. This is documented in CLAUDE.md and the deferred items section of sprint-4-CONTEXT.md; it is not a stub in this plan's scope.

## Threat Flags

None. `processTick` operates on in-memory state with no external input paths. The ike arithmetic is bounded by integer heiau count and a `Math.max(0, ...)` floor (T-s4-04 -- accepted).

## Self-Check: PASSED

- `src/game/resourceTick.js` exists and contains `isWetSeason`, `state.month = month`, `state.resources.ike`, and year rollover block
- Commit `425b2af` confirmed in git log
- Smoke test logged PASS (turn 12 -> year 2, month 1, ike 1)
