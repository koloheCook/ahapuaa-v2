---
phase: sprint-5
plan: 02
type: execute
wave: 2
depends_on:
  - sprint-5-01
files_modified:
  - src/scenes/GameScene.js
autonomous: false
requirements:
  - TECH-03
  - TECH-04
  - TECH-05
  - TECH-06

must_haves:
  truths:
    - "checkTechUnlocks is called after placeBuilding() returns true in the pointerdown handler"
    - "checkTechUnlocks is called after processTick() in the End Turn handler"
    - "When Carpentry unlocks: success.ogg plays once, 'Carpentry unlocked!' fades in #rejection-reason"
    - "When Masonry unlocks: success.ogg plays once, 'Masonry unlocked!' fades in #rejection-reason"
    - "updateSelector disables btn-tier-1 (opacity 0.4, pointerEvents none) when selectedType is 'hale' and carpentry not in state.techs"
    - "updateSelector disables btn-tier-2 (opacity 0.4, pointerEvents none) when selectedType is 'hale' and masonry not in state.techs"
    - "Newly-enabled tier button flashes for ~500ms after unlock"
    - "Non-hale types (loi, loko-ia) are unaffected by tech-gated tier logic"
  artifacts:
    - path: "src/scenes/GameScene.js"
      provides: "tech unlock wiring -- import, call sites, updateSelector extension, unlock feedback"
      contains: "checkTechUnlocks"
  key_links:
    - from: "pointerdown handler"
      to: "checkTechUnlocks(state)"
      via: "call after placeBuilding returns true"
      pattern: "checkTechUnlocks\\(state\\)"
    - from: "End Turn handler"
      to: "checkTechUnlocks(state)"
      via: "call after processTick"
      pattern: "checkTechUnlocks\\(state\\)"
    - from: "updateSelector"
      to: "state.techs"
      via: "state.techs.includes check for tier button opacity"
      pattern: "state\\.techs\\.includes"
---

<objective>
Wire checkTechUnlocks into GameScene.js at the two required call sites, extend updateSelector
to lock tech-gated tier buttons visually, and implement unlock feedback (success sound + fade
message + button flash).

Purpose: techs.js (Plan 01) has the logic; this plan wires the logic into the scene's input
and turn handlers so the player experiences Carpentry Eureka (immediate on 3rd hale) and
Masonry threshold (at End Turn when ike >= 3).

Output:
- GameScene.js with import for checkTechUnlocks
- pointerdown handler: calls checkTechUnlocks after successful placement
- End Turn handler: calls checkTechUnlocks after processTick
- updateSelector: tech-gated tier locking for hale
- Unlock feedback: success.ogg + #rejection-reason fade + button flash
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/sprint-5/sprint-5-CONTEXT.md
@.planning/phases/sprint-5/sprint-5-01-SUMMARY.md

<interfaces>
<!-- Key contracts extracted from codebase. Read these before touching GameScene.js. -->

From src/game/techs.js (created in Plan 01):
  export function checkTechUnlocks(state)
  // Returns string[] of newly-unlocked tech names (empty array if nothing changed).
  // Mutates state.techs[] directly.
  // Possible return values: [], ['carpentry'], ['masonry'], ['carpentry', 'masonry']

From src/scenes/GameScene.js -- current imports (line 1-7):
  import Phaser from 'phaser';
  import { COLS, ROWS, MT_DEPTH, SHORE_START, SHORE_END, TERRAIN } from '../game/constants.js';
  import { HexGrid } from '../game/HexGrid.js';
  import { buildWorld } from '../game/worldGen.js';
  import { state } from '../game/gameState.js';
  import { canPlace, placeBuilding } from '../game/buildings.js';
  import { processTick } from '../game/resourceTick.js';

From src/scenes/GameScene.js -- module-level constants (lines 28-30):
  const BUILDING_TINT = { hale: 0xffd700, loi: 0x00ffcc, 'loko-ia': 0x4488ff };
  const SINGLE_TIER_TYPES = new Set(['loi', 'loko-ia']);
  const SEASON_LABEL = { wet: 'Hoʻoilo', dry: 'Kauwela' };

From src/scenes/GameScene.js -- pointerdown handler successful placement block (lines 189-193):
  if (placement.ok) {
    placeBuilding(tile, this.selectedType, this.selectedTier, state);
    const img = this.tileImages[`${col},${row}`];
    if (img) img.setTint(BUILDING_TINT[this.selectedType] ?? 0xffd700);
    updateHUD();
  }

From src/scenes/GameScene.js -- End Turn handler (lines 226-231):
  document.getElementById('end-turn').addEventListener('click', () => {
    state.turn++;
    processTick(state, state.tiles);
    updateHUD();
    updateSelector(this);
  });

From src/scenes/GameScene.js -- #rejection-reason fade-out pattern (lines 212-221):
  const rrEl = document.getElementById('rejection-reason');
  rrEl.textContent = friendlyReason(placement.reason);
  rrEl.style.transition = 'none';
  rrEl.style.opacity = '1';
  requestAnimationFrame(() => {
    rrEl.style.transition = 'opacity 3s';
    rrEl.style.opacity = '0';
  });

From src/scenes/GameScene.js -- updateSelector function (lines 253-284):
  function updateSelector(scene) {
    // ... type button highlight ...
    for (let i = 0; i < 3; i++) {
      const btn = document.getElementById(`btn-tier-${i}`);
      if (!btn) continue;
      // ... active highlight ...
      if (i > 0 && SINGLE_TIER_TYPES.has(scene.selectedType)) {
        btn.style.opacity      = '0.4';
        btn.style.pointerEvents = 'none';
      } else {
        btn.style.opacity      = '1';
        btn.style.pointerEvents = 'auto';
      }
    }
  }

Audio: this.sound.play('success')  -- 'success' key loaded by PreloadScene (success.ogg)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Import checkTechUnlocks and wire two call sites</name>
  <files>src/scenes/GameScene.js</files>
  <read_first>
    - src/scenes/GameScene.js -- read the FULL file before writing any changes
    - src/game/techs.js -- confirm export name is checkTechUnlocks
    - .planning/phases/sprint-5/sprint-5-CONTEXT.md -- D-04, D-05, D-07, D-10, D-11
  </read_first>
  <action>
    Make three changes to GameScene.js. Read the full file first; apply changes precisely
    to the existing code without restructuring anything else.

    **Change 1 -- Add import at line 7 (after existing imports):**

    Add this line after the `import { processTick } from '../game/resourceTick.js';` line:
      import { checkTechUnlocks } from '../game/techs.js';

    **Change 2 -- Wire call site in pointerdown handler (after successful placeBuilding):**

    The current successful placement block is:
      if (placement.ok) {
        placeBuilding(tile, this.selectedType, this.selectedTier, state);
        const img = this.tileImages[`${col},${row}`];
        if (img) img.setTint(BUILDING_TINT[this.selectedType] ?? 0xffd700);
        updateHUD();
      }

    Replace with:
      if (placement.ok) {
        placeBuilding(tile, this.selectedType, this.selectedTier, state);
        const img = this.tileImages[`${col},${row}`];
        if (img) img.setTint(BUILDING_TINT[this.selectedType] ?? 0xffd700);
        updateHUD();
        const newTechs = checkTechUnlocks(state);
        if (newTechs.length > 0) {
          this.sound.play('success');
          showUnlockMessage(newTechs[0]);
          updateSelector(this);
          flashNewTierButtons(newTechs);
        }
      }

    Note: showUnlockMessage and flashNewTierButtons are module-level helper functions
    you will add in Task 2. Define them BEFORE adding these call sites, or accept that
    the runtime will resolve them at call time (module-level function declarations are
    hoisted). Add a comment: "// helpers defined below at module scope".

    **Change 3 -- Wire call site in End Turn handler:**

    The current End Turn handler is:
      document.getElementById('end-turn').addEventListener('click', () => {
        state.turn++;
        processTick(state, state.tiles);
        updateHUD();
        updateSelector(this);
      });

    Replace with:
      document.getElementById('end-turn').addEventListener('click', () => {
        state.turn++;
        processTick(state, state.tiles);
        updateHUD();
        const newTechs = checkTechUnlocks(state);
        if (newTechs.length > 0) {
          this.sound.play('success');
          showUnlockMessage(newTechs[0]);
          flashNewTierButtons(newTechs);
        }
        updateSelector(this);
      });

    Note: updateSelector(this) remains the LAST call in the End Turn handler (per D-05
    integration point: "already called -- just add the check before it"). flashNewTierButtons
    runs after the selector re-renders because updateSelector fires in the same synchronous
    block, then flashNewTierButtons applies a 500ms overlay -- the flash appears on top of
    the re-rendered button state.
  </action>
  <verify>
    <automated>node --check src/scenes/GameScene.js</automated>
  </verify>
  <acceptance_criteria>
    - node --check src/scenes/GameScene.js passes (no syntax errors)
    - grep confirms "import { checkTechUnlocks } from '../game/techs.js';" exists in file
    - grep confirms "checkTechUnlocks(state)" appears exactly 2 times in the file
    - grep confirms "this.sound.play('success')" appears exactly 2 times (one per call site)
    - grep confirms "showUnlockMessage" appears in the file (called from both handlers)
    - grep confirms "flashNewTierButtons" appears in the file (called from both handlers)
    - The End Turn handler still calls updateSelector(this) as its last statement
    - The pointerdown handler calls updateSelector(this) inside the newTechs.length > 0 block
  </acceptance_criteria>
  <done>
    Import added. checkTechUnlocks called in exactly 2 places. node --check passes.
    Helper function names referenced in both call sites.
  </done>
</task>

<task type="auto">
  <name>Task 2: Add module-level helpers -- showUnlockMessage, flashNewTierButtons, and extend updateSelector</name>
  <files>src/scenes/GameScene.js</files>
  <read_first>
    - src/scenes/GameScene.js -- read the current file state after Task 1 edits
    - .planning/phases/sprint-5/sprint-5-CONTEXT.md -- D-10, D-11, D-12, D-15
  </read_first>
  <action>
    Add three module-level functions to GameScene.js and extend updateSelector.
    Place the new functions after the existing module-level functions (after friendlyReason).

    **New function 1 -- showUnlockMessage(techName):**

    Reuses the #rejection-reason DOM element and the same opacity fade pattern as placement
    rejection messages (per D-10). Text content is an English game term, not a Hawaiian string.

    function showUnlockMessage(techName) {
      const messages = {
        carpentry: 'Carpentry unlocked!',
        masonry: 'Masonry unlocked!',
      };
      const msg = messages[techName] ?? `${techName} unlocked!`;
      const rrEl = document.getElementById('rejection-reason');
      rrEl.textContent = msg;
      rrEl.style.transition = 'none';
      rrEl.style.opacity = '1';
      requestAnimationFrame(() => {
        rrEl.style.transition = 'opacity 3s';
        rrEl.style.opacity = '0';
      });
    }

    **New function 2 -- flashNewTierButtons(newTechs):**

    Briefly highlights the newly-enabled tier button(s) for ~500ms (per D-12). This runs
    AFTER updateSelector has re-rendered buttons (i.e., the button is already opacity 1 /
    pointerEvents auto). The flash uses an inline style overlay then restores.

    The tech-to-button mapping:
    - 'carpentry' unlocks btn-tier-1 (tier index 1 = T2 hale)
    - 'masonry' unlocks btn-tier-2 (tier index 2 = T3 hale)

    function flashNewTierButtons(newTechs) {
      const techToTierIndex = { carpentry: 1, masonry: 2 };
      for (const tech of newTechs) {
        const tierIdx = techToTierIndex[tech];
        if (tierIdx === undefined) continue;
        const btn = document.getElementById(`btn-tier-${tierIdx}`);
        if (!btn) continue;
        const prevBg = btn.style.background;
        btn.style.background = 'rgba(160,120,50,0.9)';
        setTimeout(() => {
          btn.style.background = prevBg;
        }, 500);
      }
    }

    **Extend updateSelector -- tech-gated tier locking for hale (per D-15):**

    The current tier loop in updateSelector ends with:
      if (i > 0 && SINGLE_TIER_TYPES.has(scene.selectedType)) {
        btn.style.opacity      = '0.4';
        btn.style.pointerEvents = 'none';
      } else {
        btn.style.opacity      = '1';
        btn.style.pointerEvents = 'auto';
      }

    Replace the ENTIRE if/else block inside the for loop with this expanded logic:

      if (i > 0 && SINGLE_TIER_TYPES.has(scene.selectedType)) {
        // loi and loko-ia have only one tier -- disable T2 and T3 for these types
        btn.style.opacity       = '0.4';
        btn.style.pointerEvents = 'none';
      } else if (scene.selectedType === 'hale' && i === 1 && !state.techs.includes('carpentry')) {
        // hale T2 requires Carpentry tech
        btn.style.opacity       = '0.4';
        btn.style.pointerEvents = 'none';
      } else if (scene.selectedType === 'hale' && i === 2 && !state.techs.includes('masonry')) {
        // hale T3 requires Masonry tech
        btn.style.opacity       = '0.4';
        btn.style.pointerEvents = 'none';
      } else {
        btn.style.opacity       = '1';
        btn.style.pointerEvents = 'auto';
      }

    This preserves SINGLE_TIER_TYPES behavior for loi/loko-ia (unchanged). For hale,
    tier buttons 1 and 2 are gated by state.techs. Tier 0 (T1 hale) is always enabled
    (no tech gate -- T1 hale requires no tech in canPlace).

    Note: state is imported at module scope (line 5). updateSelector can read state directly.
    No parameter change needed.
  </action>
  <verify>
    <automated>node --check src/scenes/GameScene.js</automated>
  </verify>
  <acceptance_criteria>
    - node --check src/scenes/GameScene.js passes
    - grep confirms "function showUnlockMessage" exists in file
    - grep confirms "function flashNewTierButtons" exists in file
    - grep confirms "Carpentry unlocked!" string exists in showUnlockMessage
    - grep confirms "Masonry unlocked!" string exists in showUnlockMessage
    - grep confirms "state.techs.includes('carpentry')" appears in updateSelector
    - grep confirms "state.techs.includes('masonry')" appears in updateSelector
    - grep confirms "techToTierIndex" exists in flashNewTierButtons (carpentry: 1, masonry: 2 mapping)
    - The SINGLE_TIER_TYPES branch is still present and unchanged (loi/loko-ia still disable T2/T3)
    - updateSelector does NOT import from phaser (it is a module-level function reading state directly)
  </acceptance_criteria>
  <done>
    showUnlockMessage and flashNewTierButtons defined at module scope. updateSelector extended
    with tech-gated tier logic for hale. node --check passes.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Full tech unlock wiring in GameScene.js:
    - checkTechUnlocks called after placeBuilding (Carpentry Eureka)
    - checkTechUnlocks called after processTick (Masonry threshold)
    - updateSelector disables hale T2 without carpentry, T3 without masonry
    - Unlock message fades in #rejection-reason element, success.ogg plays
    - Newly-enabled tier button flashes for 500ms on unlock
    - gameState.js starts with populationCap: 5 (HUD shows Pop 5 / 5 at game start)
  </what-built>
  <how-to-verify>
    Run: npm run dev (from /Users/scottywright-ahsam/Desktop/Archived/Pioneer\ Species/Projects/ahapuaa-v2/)
    Open: http://localhost:5173

    Check 1 -- populationCap fix:
    - On game load, HUD shows: Pop 5 / 5 (not Pop 5 / 0)

    Check 2 -- updateSelector tech gates at game start:
    - Building selector visible. Type = Hale selected by default.
    - Tier T2 button: opacity ~0.4, not clickable (carpentry not unlocked)
    - Tier T3 button: opacity ~0.4, not clickable (masonry not unlocked)
    - Tier T1 button: fully visible and clickable
    - Switch to Loi type: T2, T3 buttons dimmed (SINGLE_TIER_TYPES behavior, unchanged)

    Check 3 -- Carpentry Eureka:
    - Set selector to Hale T1. Place 2 hale on flat tiles (anywhere with resources).
    - Place 3rd hale. On the 3rd placement:
      a. "Carpentry unlocked!" appears in the rejection-reason element (bottom of UI?) and fades out over 3 seconds
      b. success.ogg sound plays once
      c. Tier T2 button brightens (flash ~500ms) and becomes fully enabled (opacity 1)
      d. Tier T3 button remains dimmed (masonry not yet unlocked)

    Check 4 -- Carpentry persists across End Turn:
    - Click End Turn. T2 button remains enabled. No re-locking.

    Check 5 -- Masonry threshold (ike >= 3):
    - Advance turns until ike accumulates to 3+ (ike shows in HUD; 1 ike per year rollover)
    - At End Turn when ike crosses 3:
      a. "Masonry unlocked!" appears and fades
      b. success.ogg plays
      c. Tier T3 button flashes and becomes enabled

    Check 6 -- Tier buttons functional after unlock:
    - Select Hale T2 (after Carpentry unlocked). Place a hale. Confirm placement works.
    - Open browser console: no JS errors.

    Check 7 -- loi/loko-ia types unaffected:
    - Select Loi type. T2 and T3 still dimmed (same as before Sprint 5).
    - Select Loko-ia type. T2 and T3 still dimmed.
  </how-to-verify>
  <resume-signal>
    Type "approved" if all 7 checks pass.
    Or describe any check that failed (e.g. "Check 3a: no unlock message appeared").
  </resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| DOM element writes | showUnlockMessage writes to #rejection-reason textContent (not innerHTML -- no XSS risk since techName is a hardcoded string from the local messages map) |
| Audio | this.sound.play('success') plays a preloaded local asset -- no external URL |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-sprint5-03 | Tampering | showUnlockMessage DOM write | accept | techName sourced from hardcoded local messages map; textContent (not innerHTML) prevents XSS |
| T-sprint5-04 | Denial of Service | flashNewTierButtons setTimeout | accept | Single 500ms timeout per unlock event; no loop risk; negligible overhead |
| T-sprint5-05 | Information Disclosure | console.log in placeBuilding | accept | Existing behavior; no PII; dev-only context |
</threat_model>

<verification>
After checkpoint approval:

1. npm run build -- build must succeed (no import errors, no missing module)
2. grep -c "checkTechUnlocks(state)" src/scenes/GameScene.js -- must return 2
3. grep "import { checkTechUnlocks }" src/scenes/GameScene.js -- must return 1 match
4. grep "state.techs.includes" src/scenes/GameScene.js -- must return 2 matches (carpentry + masonry in updateSelector)
5. grep "populationCap: 5" src/game/gameState.js -- must return 1 match
6. grep "from 'phaser'" src/game/techs.js -- must return 0 matches
7. Browser: HUD shows Pop 5 / 5 at load
8. Browser: 3rd hale triggers Carpentry message + T2 button activation
9. Browser: No JS console errors during normal play
</verification>

<success_criteria>
- Carpentry unlocks immediately when 3rd hale is placed (no End Turn required)
- T2 hale tier button becomes interactive after Carpentry unlock
- Masonry unlocks at End Turn when ike >= 3
- T3 hale tier button becomes interactive after Masonry unlock
- Unlock messages appear in #rejection-reason and fade over 3 seconds
- success.ogg plays once per unlock event
- Newly-enabled buttons flash ~500ms to draw player attention
- loi and loko-ia tier locking behavior is unchanged from Sprint 4
- populationCap HUD shows 5/5 at game start (not 5/0)
- npm run build succeeds
- No JS errors in browser console during play
</success_criteria>

<output>
After checkpoint approval and verification, create .planning/phases/sprint-5/sprint-5-02-SUMMARY.md
</output>
