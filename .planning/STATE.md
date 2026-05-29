# STATE.md - Ahupuaa v2

## Project Reference

**Core value:** Browser-based Hawaiian land stewardship simulation -- player manages
ahupuaʻa from mountain to sea, balancing taro, fish, wood, stone, population, and ʻike
through seasonal cycles and traditional buildings.

**Current focus:** Sprint 5 context captured. Ready for /gsd-plan-phase sprint-5.

---

## Current Position

- **Sprint:** 5 of ~7 (estimated)
- **Status:** Context gathered -- ready to plan
- **Last completed:** sprint-4 (dual-clock + ike HUD wired, verified 7/7)
- **Progress:** [████████░░] ~65%

---

## Recent Decisions

- **Sprint 5 = tech unlocks + populationCap fix** -- Carpentry (build 3 hale Eureka,
  immediate), Masonry (ike >= 3, at End Turn). New `src/game/techs.js`. populationCap
  initialized to 5 in gameState.js.
- **checkTechUnlocks(state) returns new tech array** -- GameScene.js calls it after
  placeBuilding() AND after processTick(). Feedback: success.ogg + #rejection-reason fade.
- **Population growth deferred post-capstone** -- only starvation (decrease) is in game.
- **Masonry threshold = 3 ike (placeholder)** -- depends on unresolved ike collection
  cadence decision (annual current vs quarterly future).

---

## Open Design Questions (deferred)

- Population growth trigger: when/how does pop grow toward popCap?
- Quarterly ike collection cadence: 1 ike per 3 turns (4/year) vs current 1/year
- Resource collection mechanic: turn-based passive vs player-directed (Warcraft model)
- Village/event tech grants: map objects granting techs (future mechanic)

---

## Pending Human Actions

- `git push origin master` -- 14 commits from sprint-4 + sprint-5 context are unpushed (non-blocking)

---

## Session Continuity

Last session: 2026-05-29
Stopped at: Sprint 5 context gathered -- all 4 areas discussed, CONTEXT.md written.
Resume file: .planning/phases/sprint-5/sprint-5-CONTEXT.md
Stale checkpoint: .planning/phases/sprint-3/.continue-here.md (sprint-3 is complete; ignore)
