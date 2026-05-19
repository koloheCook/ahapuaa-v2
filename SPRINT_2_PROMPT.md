# Sprint 2 Session Prompt -- Ahupuaa Phaser 4 Rebuild
*Paste this entire file as your opening message in the Sprint 2 Claude Code session.*

---

## Opening Protocol (execute before writing any code)

1. Read `CLAUDE.md` in `ahapuaa-v2/` -- the entire file. It is authoritative for the
   Phaser 4.1.0 build. Engine is Phaser 4.1.0, not Phaser 3.
2. Read `DEVLOG.md` -- last entry only. State current sprint and last DEVLOG entry in
   one sentence before writing any code.
3. Read `PHASER_4_AUDIT.md` -- this documents confirmed v4 API deltas from Sprint 1.
   Any surprise behavior this sprint goes back into PHASER_4_AUDIT.md and DEVLOG.
4. Read every file you will modify before touching it:
   - `src/scenes/GameScene.js` (primary file -- extend Sprint 1 scaffolding)
   - `index.html` (add HUD markup and End Turn button)
   - `src/game/buildings.js` (verify it matches the Phaser 3 reference before calling it)
   - `src/game/gameState.js` (state shape -- resource tick and HUD read from it)
5. Do not write any code until steps 1-4 are complete.

---

## Context

Sprint 1 shipped: hex tilemap rendering all terrain types with Kenney atlas frames,
TILE_SCALE fix verified, all Sprint 1 exit criteria passing. `state.tiles[col][row]`
is initialized from the ported worldGen pipeline. `map.tileToWorldXY(col, row)` is
confirmed correct for Phaser 4.1.0 (see PHASER_4_AUDIT.md for any confirmed deltas).

Sprint 2 goal: add camera controls, tile image reference registry, building placement
click handler, HTML resource HUD, and End Turn wired to `processTick`.

Key Phaser 4 notes:
- Any API surface that differs from Phaser 3 should be logged in DEVLOG as an observed
  delta (see Section 7 below). Do not guess -- verify against actual behavior.
- `PHASER_4_AUDIT.md` documents confirmed deltas from Sprint 1. Check it before
  assuming any Phaser 3 pattern works unchanged.
- `TILE_SCALE` is already defined in `src/scenes/GameScene.js` from Sprint 1. Apply it
  to any new image stamps added in Sprint 2. Building tints use existing tile images
  (via `setTint`) -- no new image stamps are needed for Sprint 2.

---

## What Sprint 2 Builds (ordered task list)

Work through these in order. Do not start the next task until the current one runs
without errors.

### Task 0 -- Port two missing game-logic files to src/game/

ahapuaa-v2 has no `src/systems/` directory. Both of these files must live in
`src/game/` (zero Phaser imports rule). Port them before writing any scene code.

**buildings.js**
Copy from the Phaser 3 reference: `ahapuaa-game/src/game/buildings.js`
Destination: `src/game/buildings.js`
Verify zero Phaser imports after copy:
```bash
grep "from 'phaser'" src/game/buildings.js
```
Expected: empty.

**resourceTick.js**
Copy from the Phaser 3 reference: `ahapuaa-game/src/systems/resourceTick.js`
Destination: `src/game/resourceTick.js`  (note: src/game/, not src/systems/)
Verify zero Phaser imports after copy:
```bash
grep "from 'phaser'" src/game/resourceTick.js
```
Expected: empty.

Run the full game-logic import check before proceeding:
```bash
grep -r "from 'phaser'" src/game/
```
Expected: empty across all files.

Do NOT proceed to Task 1 until both files exist and the grep check is clean.

### Task 1 -- Add `BUILDING_TINT` constant to GameScene.js

At module scope (top of the file, alongside `FRAME_MAP`), add:

```js
const BUILDING_TINT = { hale: 0xffd700, loi: 0x00ffcc, 'loko-ia': 0x4488ff };
```

This will be consumed by the click handler in Task 4.

### Task 2 -- Add `this.map` ref and `tileImages` registry; extend tile loop

In `create()`, after creating the tilemap layer, store:

```js
this.map = map;
this.tileImages = {};
```

Extend the existing tile rendering loop (which already stamps images from Sprint 1)
to also store each image reference into the registry:

```js
this.tileImages[`${col},${row}`] = img;
```

The full loop iterates `col 0..COLS-1`, `row 0..ROWS-1`. For each tile:
1. Get pixel position: `const { x, y } = map.tileToWorldXY(col, row)`
2. Choose frame from `FRAME_MAP` keyed by `tile.terrainType`, defaulting to `'grass_01.png'`
3. Stamp image: `const img = this.add.image(x, y, 'terrain', frame)`
4. **Origin:** `img.setOrigin(0, 0)` -- empirically verify this produces correct tile
   alignment with TILE_SCALE applied. If tiles are offset or misaligned, test
   `setOrigin(0.5, 0.5)` as an alternative and log the result in DEVLOG using the
   observation format in Section 7. Log which setting was chosen and why.
5. Apply terrain tint if needed (ocean or stream: `0x2255bb`; forest: `0x1a5c1a`)
6. Store: `this.tileImages[\`${col},${row}\`] = img`

**Note on TILE_SCALE:** Sprint 1 defined `TILE_SCALE` and applied it to image stamps.
Apply the same scale to every new image placed in this loop -- do not change the
existing scale behavior.

### Task 3 -- Camera pan (drag) and scroll zoom

Set camera bounds to the full map extent:

```js
this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
```

Add drag-pan on `pointermove` when pointer is held down. Divide the delta by
`this.cameras.main.zoom` to keep panning speed consistent at all zoom levels.

Add scroll zoom on `wheel` event. Clamp zoom between 0.5 and 2.0. Zoom step
should feel light -- a deltaY multiplier of 0.001 is correct.

**Verify:** pan and zoom should both work before proceeding to Task 4.

### Task 4 -- Building placement state and click handler

Initialize building selection state on the scene in `create()`:

```js
this.selectedType = 'hale';
this.selectedTier = 0;
```

This is a hardcoded default. Building selector UI (the HTML buttons that let the
player choose type/tier) is Sprint 3 scope -- do not build it here.

Add a `pointerdown` listener. The handler must:

1. Ignore right-button clicks: `if (pointer.rightButtonDown()) return`
2. Convert screen coords to world coords:
   `const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)`
3. Convert world coords to tile coords:
   `const tileXY = this.map.worldToTileXY(worldPoint.x, worldPoint.y)`

   **Empirically verify** that `worldToTileXY` exists on the Phaser 4.1.0 tilemap
   and returns `{ x, y }` (where `x` = col, `y` = row). If the method name or return
   shape differs in Phaser 4.1.0, log it in DEVLOG as an engine-behavior delta.

4. Guard invalid coords: return if `tileXY` is falsy, or if `col < 0 || col >= COLS
   || row < 0 || row >= ROWS`
5. Look up tile: `const tile = state.tiles[col][row]`
6. Attempt placement:
   ```js
   if (canPlace(tile, this.selectedType, this.selectedTier, state).ok) {
     placeBuilding(tile, this.selectedType, this.selectedTier, state);
     const img = this.tileImages[`${col},${row}`];
     if (img) img.setTint(BUILDING_TINT[this.selectedType] ?? 0xffd700);
     updateHUD();
   }
   ```
   `canPlace` and `placeBuilding` are imported from `src/game/buildings.js` --
   see note in Section 4 about verifying this file before use.

### Task 5 -- `updateHUD()` function

Add as a module-level function in `GameScene.js` (not a class method):

```js
function updateHUD() {
  document.getElementById('hud-turn').textContent   = state.turn;
  document.getElementById('hud-pop').textContent    = state.population;
  document.getElementById('hud-popcap').textContent = state.populationCap;
  document.getElementById('hud-taro').textContent   = state.resources.taro;
  document.getElementById('hud-fish').textContent   = state.resources.fish;
  document.getElementById('hud-wood').textContent   = state.resources.wood;
  document.getElementById('hud-stone').textContent  = state.resources.stone;
}
```

This function reads directly from `state` (imported from `src/game/gameState.js`).
It is called: (a) at the end of `create()` for the initial render, (b) inside the
building placement handler after a successful placement, and (c) inside the End Turn
handler after `processTick` runs.

### Task 6 -- HTML HUD markup (index.html)

Add a `#hud` div and an `#end-turn` button to `index.html`. Both are positioned
with CSS `position: fixed` and must not be inside the Phaser canvas element.

The `#hud` div is a resource panel (pointer-events: none so it doesn't intercept
canvas clicks). It must contain span elements with these IDs:
`hud-turn`, `hud-pop`, `hud-popcap`, `hud-taro`, `hud-fish`, `hud-wood`, `hud-stone`

The `#end-turn` button is clickable (pointer-events: auto). Position it so it does
not overlap the HUD.

Style is plain CSS -- dark background, legible text. Use Georgia serif to match the
game aesthetic. Exact colors and padding are at your discretion within that constraint.

### Task 7 -- End Turn event listener

In `create()`, wire the End Turn button after the DOM elements exist:

```js
document.getElementById('end-turn').addEventListener('click', () => {
  state.turn++;
  processTick(state, state.tiles);
  updateHUD();
});
```

`processTick` is imported from `src/game/resourceTick.js` (ported in Task 0).
Verify the import resolves before calling it.

### Task 8 -- Initial HUD render

At the end of `create()`, call `updateHUD()` once to populate the HUD with the
initial state values before the player takes any action.

---

## Architectural Constraints (active this sprint)

- **`/src/game/` zero Phaser imports.** `buildings.js`, `gameState.js`, `constants.js`,
  and `worldGen.js` must have zero Phaser imports. Verify with:
  `grep -r "from 'phaser'" src/game/`
  Output must be empty.
- **Canvas is map only.** All UI lives in HTML/CSS. The HUD and End Turn button are
  DOM elements -- not Phaser Text objects, not drawn to canvas.
- **`tiles[col][row]` is column-first.** Do not invert.
- **No building state on the tile object.** `tile.buildingId` is a string key into
  `state.buildings`. Never store yield, level, or any other mutable building data on
  the tile.
- **Do not implement building selector UI.** `this.selectedType` and `this.selectedTier`
  are hardcoded defaults this sprint. Selector UI is Sprint 3.
- **Do not implement anything beyond Sprint 2 scope** (see Out of Scope below).

---

## `buildings.js` Verification

`src/game/buildings.js` is ported in Task 0 of this sprint (it was not present in
the Sprint 1 scaffold). Before calling `canPlace` or `placeBuilding`, verify:

1. The file exists at `src/game/buildings.js`
2. It exports `canPlace(tile, type, tier, state)` and `placeBuilding(tile, type, tier, state)`
3. The placement cost table matches the Phaser 3 reference:
   - hale tier 0: `{ wood: 3 }`
   - hale tier 1: `{ wood: 5, stone: 2 }`
   - hale tier 2: `{ wood: 5, stone: 5 }`
   - loi tier 0: `{ wood: 2 }`
   - loko-ia tier 0: `{ stone: 3 }`
4. `canPlace` returns `{ ok: boolean, reason: string }`

If the file differs from the Phaser 3 version, log it as an observed delta in DEVLOG
before proceeding. Do not re-port or rewrite the file in this session -- fix only what
is broken.

---

## Out of Scope

These belong to Sprint 3 or later. Do not begin any of them:

- **Building selector UI** -- HTML buttons for choosing building type and tier.
  The `selectedType`/`selectedTier` state is hardcoded to `'hale'`/`0` this sprint.
- **Tile misalignment fix** -- CLAUDE.md notes this as a Sprint 3 task. If
  misalignment is visible but does not block the exit criteria, log it in DEVLOG
  and proceed.
- **Debug overlay / hover tooltip** -- Phase 5a feature from the Phaser 3 prototype.
  Not on the Sprint 2 task list.
- **Tech tree UI** -- Phase 5d in the Phaser 3 prototype. Post-capstone.
- **Procedural worldGen improvements** -- keep using the current ported pipeline.
- **River path rendering** -- deferred per CLAUDE.md.
- **Akua events** -- Phase 7.
- **Audio playback** -- assets are loaded in PreloadScene; playback is post-capstone.
- **Mobile layout** -- post-capstone.
- **Hoa Kaua integration** -- Phase 8.
- **generateBirds()** -- prototype backlog; not on capstone path.

---

## Exit Criteria

Sprint 2 is done when ALL of the following are true:

- [ ] `npm run dev` starts cleanly, no error output in terminal
- [ ] `npm run build` completes without error
- [ ] Hex grid renders with all terrain types visually distinct (Sprint 1 regression check)
- [ ] Camera drag-pan works: hold and drag moves the viewport
- [ ] Camera scroll zoom works: mousewheel zooms in/out, clamped to 0.5x–2.0x
- [ ] Placing a Hale on a flat tile: tile turns gold (`0xffd700` tint), HUD wood count
  decreases by 3, `state.buildings` contains the new entry
- [ ] Placing on an ocean tile: nothing happens (canPlace returns ok: false, no visual change,
  no resource deducted)
- [ ] Placing on a tile already occupied: nothing happens
- [ ] End Turn button: clicking increments turn counter in HUD, resource values update
- [ ] HUD span IDs are all present in the DOM and show initial state values on load
- [ ] `grep -r "from 'phaser'" src/game/` returns empty (no Phaser imports in game logic)
- [ ] DEVLOG updated with: what was built, any observed v4 deltas, open questions,
  Sprint 3 goal

---

## DEVLOG Observation Logging

When behavior differs from expected, log in DEVLOG.md using this format:

```
### Observed delta: [short description]
Expected: [what the spec / audit / P3 behavior predicted]
Actual: [what Phaser 4 actually did]
Classification: spec-gap | engine-behavior | bug | expected
Fix applied: [what was done, or "none"]
P3 parity: same-as-P3 | different-from-P3 | unknown
```
