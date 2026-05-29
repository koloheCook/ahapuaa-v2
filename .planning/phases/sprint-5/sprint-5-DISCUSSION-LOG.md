# Phase sprint-5: Tech Unlock System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-05-29
**Phase:** sprint-5 -- Tech Unlock System
**Areas discussed:** Sprint 5 scope, Eureka trigger location, Masonry ike threshold, Unlock feedback

---

## Sprint 5 Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Deferred post-capstone | Sprint 5 = tech unlocks only. Pop growth needs its own discussion. | ✓ |
| In scope for Sprint 5 | Define growth trigger and implement alongside tech unlocks. | |
| Fix Pop 5/0 display only | No growth, just fix the start-state cosmetic oddity. | |

**User's choice:** Deferred post-capstone
**Notes:** No follow-up on pop growth scope.

---

### Pop 5/0 Display Fix (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| No -- log for cleanup sprint | Scope discipline. Non-blocking. | |
| Yes -- small fix, worth doing now | One-line change to gameState.js. | ✓ |

**User's choice:** Yes -- fix it in Sprint 5

---

### Pop Fix Implementation

| Option | Description | Selected |
|--------|-------------|----------|
| Set populationCap: 5 in gameState.js | Matches starting pop. One-line change. | ✓ |
| Hide until first hale placed | Conditional display logic in updateHUD. | |

**User's choice:** Set populationCap: 5 in gameState.js

---

## Eureka Trigger Location

| Option | Description | Selected |
|--------|-------------|----------|
| Inside processTick | All auto-unlocks in one place. Consistent. | |
| Inside placement handler | More responsive, immediate on 3rd hale. | |

**User's free-text response:** "I haven't decided how many techs will unlock this way, but
it will be more than 1 and they all won't be tied to a particular building. As soon as they
unlock the tech, they should be able to spend it that turn. For example, in Civ6, random
villages can grant different technologies, and the player can immediately take advantage."

---

### Immediate vs End Turn (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| Yes -- immediate, same placement session | Civ6 feel. Placement handler triggers unlock + updateSelector. | ✓ |
| No -- available at next End Turn | Simpler. All unlocks in processTick. | |

**User's choice:** Yes -- immediate

---

### Tech Logic Location

User asked about Phaser 4 native functionality, Civ6 architecture, and industry terminology
for game layers before selecting. Claude explained:
- `/src/game/` = Game Core / Systems layer (zero Phaser, pure logic)
- `/src/scenes/` = Renderer/View (Phaser, reads state)
- Civ6 fires events from game core to UI; this project uses a simpler direct-call pattern
- A `checkTechUnlocks(state)` function in a new `techs.js` is the right Systems-layer approach

| Option | Description | Selected |
|--------|-------------|----------|
| New src/game/techs.js | Matches Systems pattern. Scales for future unlock types. | ✓ |
| Add to buildings.js | Simpler, one fewer file. Mixes concerns. | |

**User's choice:** New src/game/techs.js

---

## Masonry Ike Threshold

| Option | Description | Selected |
|--------|-------------|----------|
| 3 ike (~3 years) | Reachable. Good demo progression arc. | chosen as placeholder |
| 5 ike (~5 years) | Longer arc. May be too long for demo. | |
| Placeholder + playtest | Set 3 now, adjust later. | |

**User's free-text response:** "Use a placeholder value of 3 so that we can unblock.
Make a note this decision connects to the open decision on how the resource collection
mechanics works (turn X building determines how much is collected VS the player directing
units to collect like in Warcraft). In my mind ike collection could be 1 ike per quarter
of a year, 2 seasons per year = 4 ike/year. Reason: splits the 2 seasons into more
opportunities for the player to interact with the ahapuaa and extend the rhythm of the
game to be less binary. The formal demo day presentations have passed, but I would like
to aim for the working demo since that is part of what I'd share in my portfolio."

---

### Quarterly Ike Cadence (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| Deferred -- note it, don't change cadence in Sprint 5 | Keep annual ike gain. Sprint 5 focused. | ✓ |
| Sprint 5 scope -- change ike cadence now | More changes, trickier verification. | |

**User's choice:** Deferred

---

## Unlock Feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Visual + audio -- button flash + success.ogg | Uses existing assets. Player notices change. | ✓ |
| HUD notification message | Explicit text but new DOM element + timed removal. | |
| Silent | Simplest. Player may miss it. | |

**User's choice:** Visual + audio

---

### Button flash vs HUD label (follow-up)

User asked: "How are building placement messages displayed? Can the handler also display
the Carpentry unlocked message?"

Claude explained: `#rejection-reason` DOM element with fade-out already exists (GameScene.js:212-221).
Used for placement rejections. Can be reused for positive unlock notifications -- same element,
different text. This is the standard "non-diegetic UI notification / toast" pattern.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes -- reuse #rejection-reason element | No new HTML. Consistent pattern. | ✓ |
| New dedicated element for unlock notifications | Separate visual. More HTML. | |

**User's choice:** Reuse #rejection-reason

---

## Claude's Discretion

- Flash implementation detail on newly-enabled tier button (CSS transition vs inline style,
  duration ~500ms) -- within established Phaser/HTML patterns
- `checkTechUnlocks` internal structure (function body, how conditions are enumerated)

## Deferred Ideas

- Population growth mechanic (when/how pop grows toward popCap)
- Quarterly ike collection cadence (1 ike per 3 turns = 4/year)
- Resource collection mechanic: turn-based passive vs player-directed unit collection
- Village/event tech grants (map objects granting techs)
- More than 2 tech unlock types (confirmed by user -- future sprints)
