# STATE.md - Ahupuaa v2

## Project Reference

**Core value:** Browser-based Hawaiian land stewardship simulation -- player manages
ahupuaʻa from mountain to sea, balancing taro, fish, wood, stone, population, and ʻike
through seasonal cycles and traditional buildings.

**Current focus:** Sprint 5 complete. Ready for Sprint 6 planning.

---

## Current Position

- **Sprint:** 5 of ~7 (estimated)
- **Status:** Complete -- verified 9/9 checks (user QA 2026-05-30)
- **Last completed:** sprint-5 (tech unlocks + populationCap fix + DevMode panel)
- **Progress:** [█████████░] ~75%

---

## Recent Decisions

- **Sprint 5 shipped:** Carpentry (build 3 hale, immediate Eureka), Masonry (ike >= 3
  at End Turn). `src/game/techs.js` owns all unlock conditions. GameScene.js wired at
  2 call sites. Unlock feedback: success.ogg + #rejection-reason fade + building visual
  upgrade.
- **Highest-tier-only selector:** After unlock, lower tiers dim entirely. Carpentry ->
  T2 only; Masonry -> T3 only. `selectHighestAvailableTier(scene)` auto-advances
  `scene.selectedTier` before each `updateSelector()` call.
- **Visual tier formula (hale):** Existing buildings gain 1 visual tier per tech unlock
  (darker tint + tier number). Newly placed buildings always show their selected tier.
- **DevMode panel:** `G` key toggles resource injection (+10 wood/stone/taro/fish, +5
  ike) and tech force/remove buttons. Hidden by default; remove before public demo.
- **Testing workflow (Sprint 6 candidate):** User proposed seed-state loader + agent
  audit -- preload game with specific start conditions, auto-verify, then run tests.
  Captured for Sprint 6.

---

## Open Design Questions (deferred)

- Population growth trigger: when/how does pop grow toward popCap?
- Quarterly ike collection cadence: 1 ike per 3 turns (4/year) vs current 1/year
- Resource collection mechanic: turn-based passive vs player-directed (Warcraft model)
- Village/event tech grants: map objects granting techs (future mechanic)
- Masonry threshold (3 ike): placeholder -- revisit when ike cadence is defined

---

## Pending Human Actions

- `git push origin master` -- sprint-5 commits unpushed (non-blocking)

---

## Session Continuity

Last session: 2026-05-30
Stopped at: Sprint 5 complete (verified). Testing workflow proposal captured.
Next: Sprint 6 planning -- testing workflow (seed states + audit) and next game feature.
Resume file: .planning/phases/sprint-5/sprint-5-02-SUMMARY.md
Stale checkpoint: .planning/phases/sprint-3/.continue-here.md (sprint-3 is complete; ignore)
