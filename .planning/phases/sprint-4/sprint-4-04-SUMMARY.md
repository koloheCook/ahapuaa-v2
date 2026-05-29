---
phase: sprint-4
plan: sprint-4-04
subsystem: ui
tags: [phaser4, hud, game-state, seasonal-calendar, dom]

# Dependency graph
requires:
  - phase: sprint-4
    provides: "sprint-4-02 state additions (month, year, ike), sprint-4-03 dual-clock and processTick Lono multiplier"
  - phase: sprint-3
    provides: "updateSelector module-level function in GameScene.js"
provides:
  - "4 new HUD span elements: hud-year, hud-month, hud-season, hud-ike in index.html"
  - "SEASON_LABEL module-level constant in GameScene.js with verified Hawaiian strings"
  - "updateHUD() extended to write year, month, season (isWet check), and ike on every tick"
  - "updateSelector(this) hook wired into End Turn handler as Sprint 5 call point"
affects: [sprint-5, sprint-4-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Module-level constant pattern: SEASON_LABEL follows BUILDING_TINT, SINGLE_TIER_TYPES placement"
    - "isWet computed inline in updateHUD using month range check (month >= 11 || month <= 4)"
    - "Hawaiian diacriticals sourced from CONTENT.md, never typed fresh"

key-files:
  created: []
  modified:
    - index.html
    - src/scenes/GameScene.js

key-decisions:
  - "D-01: Hoʻoilo and Kauwela strings copied verbatim from CONTENT.md (U+02BB ʻokina) -- not typed fresh"
  - "D-02: updateSelector(this) added as last call in End Turn handler, not wrapped in a guard -- Sprint 3 completion is a prerequisite and was verified before execution"
  - "D-03: isWet check uses month >= 11 || month <= 4 matching the wet-season definition from sprint-4-CONTEXT.md"

patterns-established:
  - "Season display pattern: isWet computed at render time from state.month, not stored on state"
  - "Sprint hook pattern: updateSelector(this) at end of End Turn handler is the established Sprint 5 call point"

requirements-completed:
  - SPRINT4-HUD-DISPLAY
  - SPRINT4-END-TURN-HOOK

# Metrics
duration: 10min
completed: 2026-05-29
---

# Phase Sprint-4 Plan 04: HUD Wiring Summary

**Seasonal calendar and ike count wired to HUD: year/month/season/ike spans added to index.html, SEASON_LABEL constant and isWet season logic added to GameScene.js, Sprint 5 updateSelector hook established in End Turn handler**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-05-29T04:06:00Z
- **Completed:** 2026-05-29T04:07:35Z
- **Tasks:** 2 implementation tasks + 1 browser checkpoint (approved)
- **Files modified:** 2

## Accomplishments

- Added 4 HUD spans (hud-year, hud-month, hud-season, hud-ike) to index.html above and below the existing Turn/Stone lines
- Declared SEASON_LABEL at module level in GameScene.js with verified Hawaiian strings Hoʻoilo and Kauwela (U+02BB ʻokina sourced from CONTENT.md)
- Extended updateHUD() with isWet season check and getElementById writes for all 4 new fields
- Added updateSelector(this) as last call in End Turn handler, establishing the Sprint 5 selector-refresh hook point
- Browser verification passed: all 9 checks approved by user -- correct season labels, year rollover at turn 12, Kauwela switch at month 5, Sprint 3 selector panel and building placement unaffected

## Task Commits

Each task was committed atomically:

1. **Task 1: Add year, month, season, and ike spans to index.html HUD** - `ca83b51` (feat)
2. **Task 2: Add SEASON_LABEL, extend updateHUD, and add updateSelector hook in GameScene.js** - `f85a199` (feat)

**Plan metadata:** (docs commit -- see final_commit step)

## Files Created/Modified

- `index.html` - Added hud-year, hud-month, hud-season spans before Turn line; added hud-ike span after Stone line; ʻokina U+02BB used in "ʻIke:" label
- `src/scenes/GameScene.js` - SEASON_LABEL module-level const; isWet check + 4 getElementById writes added to updateHUD(); updateSelector(this) added to End Turn handler

## Decisions Made

- Hoʻoilo and Kauwela string values copied verbatim from CONTENT.md to guarantee U+02BB ʻokina -- never typed fresh (project-wide Hawaiian term integrity rule).
- updateSelector(this) added unconditionally at end of End Turn handler. Sprint 3 completion is a verified prerequisite; no runtime guard is needed or appropriate here.
- isWet computed at render time (inline in updateHUD), not cached on state -- consistent with the existing pattern of deriving display values from canonical state in updateHUD.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Sprint 5 can call updateSelector(this) from the End Turn handler -- the hook is wired and verified.
- HUD now displays all Sprint 4 state fields: year, month, season, ike.
- No regressions to Sprint 2 (resource HUD, building placement) or Sprint 3 (selector panel) observed in browser verification.
- Heiau rendering remains blocked (cultural mismatched asset -- pre-existing deferred item, not introduced here).

## Self-Check: PASSED

- `index.html` confirmed to contain hud-year, hud-month, hud-season, hud-ike (via commit ca83b51 stats)
- `src/scenes/GameScene.js` confirmed to contain SEASON_LABEL, hud-season getElementById, updateSelector(this) (via commit f85a199 stats)
- Both commits verified in git log

---
*Phase: sprint-4*
*Completed: 2026-05-29*
