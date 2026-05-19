# Extract Sprint 2 Spec from Phaser 3
# Paste this into a Claude Code session opened in the ahapuaa-game/ directory.
# Goal: read what Sprint 2 actually built, write a clean spec to ahapuaa-v2/SPRINT_2_PROMPT.md.
# This session writes one file. No code changes.

---

## Opening Protocol

1. You are in the ahapuaa-game/ directory (Phaser 3 build, Sprint 2 complete).
2. Read the following files before writing anything:
   - `CLAUDE.md` (full file -- architectural rules and data schemas)
   - `src/scenes/GameScene.js` (Sprint 2 implementation -- this is the primary source)
   - `src/game/buildings.js` (canPlace, placeBuilding -- Sprint 2 wired these)
   - `src/game/gameState.js` (state shape -- Sprint 2 references it throughout)
   - `src/game/constants.js` (COLS, ROWS, TERRAIN, MT_DEPTH, SHORE_START, SHORE_END)
   - `index.html` (HUD markup added in Sprint 2)
3. Do NOT read or modify any other files.
4. State in one sentence what Sprint 2 shipped, then proceed.

---

## Your Task

Synthesize a Sprint 2 execution prompt for the Phaser 4 build (ahapuaa-v2).

The output file is:
`../ahapuaa-v2/SPRINT_2_PROMPT.md`

(That is a sibling directory, one level up from ahapuaa-game and then into ahapuaa-v2.)

The prompt you write must follow the format used in ahapuaa-v2/SPRINT_1_PROMPT.md
(which you have not read, but the format is described below).

---

## Output Format

Write the file as a Sprint session prompt -- the same kind of document a developer
would paste into Claude Code to open a build session. Structure:

### Section 1: Opening Protocol
Tell the Sprint 2 Claude Code session to read:
- `CLAUDE.md` in ahapuaa-v2/ (Phaser 4 version -- note: engine is Phaser 4.1.0)
- `DEVLOG.md` last entry in ahapuaa-v2/
- Every file the session will modify, before touching it

### Section 2: Context
One paragraph. State:
- Sprint 1 shipped: hex tilemap, all terrain types, TILE_SCALE fix, Sprint 1 exit criteria all pass
- Sprint 2 goal: the features listed in the Phaser 3 GameScene.js implementation
- Key v4 notes to carry forward (from PHASER_4_AUDIT.md if you know it; otherwise just note
  that the v4 audit lives there and any surprises should be logged in DEVLOG)

### Section 3: What Sprint 2 builds (ordered task list)

Reverse-engineer the task list from the Phaser 3 GameScene.js. Each task must be:
- Named the same thing the Phaser 3 PR named it (if visible in comments)
- Scoped to exactly what the Phaser 3 implementation did -- no gold-plating
- Written as implementation instructions, not as a description of what P3 did

Phaser 4-specific notes to include in the tasks:
- setOrigin question: Phaser 3 Sprint 2 used `img.setOrigin(0,0)`. Phaser 4 Sprint 1
  used default center origin (0.5, 0.5) with TILE_SCALE applied. In Sprint 2,
  empirically verify which origin setting produces correct tile alignment after
  adding the tileImages registry and the click handler. Log the result in DEVLOG
  using the observation logging convention.
- buildings.js: already exists in ahapuaa-v2/src/game/ from the Sprint 1 scaffold.
  Do NOT re-port it. Verify it matches the Phaser 3 version before using it.
- TILE_SCALE: already defined in GameScene.js from Sprint 1. Apply it to any new
  image stamps added in Sprint 2 (building tints use the same tile images -- no new
  stamps needed, just tint updates).
- worldToTileXY: this is called in the P3 click handler. Confirm the method name
  and signature are unchanged in Phaser 4.1.0. If behavior differs, log it as
  an observed delta in DEVLOG (engine-behavior classification).

### Section 4: Architectural constraints (active this sprint)

Copy the relevant constraints from the Phaser 3 CLAUDE.md that apply to this sprint:
- src/game/ zero Phaser imports rule
- Canvas is map only; all UI in HTML/CSS
- tiles[col][row] column-first
- No building state on tile object
- Do not implement anything beyond Sprint 2 scope

### Section 5: Out of scope

List explicitly what Sprint 3+ owns. Base this on what Phaser 3 CLAUDE.md defers.

### Section 6: Exit criteria

Mirror the Phaser 3 Sprint 2 test plan (from the PR description or GameScene comments),
adapted for Phaser 4. Include:
- npm run dev starts cleanly
- npm run build passes
- Hex grid renders with correct terrain tints (Sprint 1 regression)
- Camera pan and zoom work
- Building placement works (at minimum: Hale on flat tile places and tints correctly)
- Rejection cases work (ocean tile: nothing placed)
- End Turn: turn counter increments, HUD updates
- grep -r "from 'phaser'" src/game/ returns empty
- DEVLOG updated with any observed deltas

### Section 7: DEVLOG observation logging reminder

Include this block verbatim at the end of the Sprint 2 prompt so the executing
Claude Code session knows to use it:

```
When behavior differs from expected, log in DEVLOG.md using this format:

### Observed delta: [short description]
Expected: [what the spec / audit / P3 behavior predicted]
Actual: [what Phaser 4 actually did]
Classification: spec-gap | engine-behavior | bug | expected
Fix applied: [what was done, or "none"]
P3 parity: same-as-P3 | different-from-P3 | unknown
```

---

## Constraints on what you write

- Do not add features that Phaser 3 Sprint 2 did not ship. If you are uncertain
  whether something was in Sprint 2 or Sprint 3, omit it and add a comment flagging
  the ambiguity.
- Do not write Phaser 3 code. The output spec should describe the behavior to implement,
  not copy the Phaser 3 syntax. The Phaser 4 session will write its own code.
- Do not guess at Phaser 4 API differences. Where P3 and P4 might diverge, flag it
  with an "empirically verify" note and the DEVLOG logging instruction.
- Hawaiian terms: source from CONTENT.md only. Do not generate or guess diacriticals.

---

## After writing the file

Report:
1. The path you wrote to (confirm it is ../ahapuaa-v2/SPRINT_2_PROMPT.md)
2. The task list you extracted (one line per task)
3. Any ambiguities you found -- features you were unsure belong to Sprint 2 vs Sprint 3

Do not update any DEVLOG or commit anything. This session is read + write one file only.
