# STATE.md - Ahupuaa v2

## Project Reference

**Core value:** Browser-based Hawaiian land stewardship simulation -- player manages
ahupuaʻa from mountain to sea, balancing taro, fish, wood, stone, population, and ʻike
through seasonal cycles and traditional buildings.

**Current focus:** Sprint 4 COMPLETE. Ready for Sprint 5 discuss-phase.

---

## Current Position

- **Sprint:** 4 of ~7 (estimated)
- **Status:** Between phases -- all Sprint 4 plans executed and verified
- **Last plan completed:** sprint-4-04 (HUD wiring + browser checkpoint)
- **Progress:** [████████░░] ~60%

---

## Recent Decisions

- **Hale raises popCap only** -- no direct taro effect. Taro changes at End Turn via
  loi production and population consumption. No Sprint 4 requirement defined hale-to-taro.
- **Month formula is `((state.turn - 1) % 12) + 1`** -- v2 End Turn handler
  pre-increments `state.turn` before calling `processTick`. P3 formula is wrong for v2.
- **SEASON_LABEL at module scope** -- consistent with TERRAIN_TO_FRAME, TERRAIN_TO_TINT,
  BUILDING_TINT pattern. Required for updateHUD() to reference without parameter passing.
- **Population growth deferred** -- only starvation (decrease) implemented. Growth
  mechanic undefined, deferred post-capstone.

---

## Open Questions (Sprint 5 Discuss)

- Population growth trigger: when/how does pop grow toward popCap?
- Carpentry Eureka trigger location: processTick vs placement handler?
- `Pop 5 / 0` display oddity at game start (popCap=0 until first hale placed) -- low
  priority, log for cleanup sprint.

---

## Pending Human Actions

- `git push origin master` -- 13 commits from sprint-4 are unpushed (non-blocking)
- Run `/gsd-extract-learnings sprint-4` -- capture design decisions before they're lost

---

## Session Continuity

Last session: 2026-05-29
Stopped at: Sprint 4 LEARNINGS extracted (7 decisions, 4 lessons, 5 patterns, 3 surprises).
Next: /gsd-discuss-phase sprint-5
Resume file: .planning/HANDOFF.json (one-shot artifact -- delete after reading)
Stale checkpoint: .planning/phases/sprint-3/.continue-here.md (sprint-3 is complete; ignore)
