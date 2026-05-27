---
phase: sprint-3
plan: sprint-3-PLAN-01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/scenes/GameScene.js
autonomous: true
requirements:
  - SPRINT3-TILE-SCALE
must_haves:
  truths:
    - TILE_SCALE constant in GameScene.js is set to 54 / 96 (not 54 / 120)
    - Running the game at localhost:5173 shows hex polygons visually filling their cells with no visible transparent gap between hex rows
---

<objective>
Increase the Kenney hex sprite scale so the visible hex polygon fills the tile cell.

Purpose: The current TILE_SCALE of 54/120 uses the full frame height (120px) as the denominator,
but the actual hex polygon in the Kenney frame is roughly 96px tall. The remaining ~24px are
transparent margin. After scaling, the visible polygon is undersized and a gap is visible between
hex rows. Increasing the scale to 54/96 makes the polygon fill the cell so rows tessellate cleanly.

Output: GameScene.js with TILE_SCALE updated to 54 / 96. No other files change.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/phases/sprint-3/sprint-3-CONTEXT.md
</context>

<tasks>

<task id="T01" type="execute">
  <title>Update TILE_SCALE from 54/120 to 54/96</title>
  <read_first>
    - src/scenes/GameScene.js -- line 51 has the TILE_SCALE constant; read before editing
    - .planning/phases/sprint-3/sprint-3-CONTEXT.md -- confirms 54/96 as the starting value and the constraint to not touch map.tileToWorldXY
  </read_first>
  <action>
    In src/scenes/GameScene.js, locate the constant declaration on line 51:

      const TILE_SCALE = 54 / 120;

    Change the denominator from 120 to 96:

      const TILE_SCALE = 54 / 96;

    That is the only change in this file. Do not alter map.tileToWorldXY, the tile stamp loop,
    tiles[col][row] indexing, or any other line. The comment on line 50 ("Kenney hexagonTerrain
    atlas frames are 120x140 px native...") should also be updated to reflect the actual polygon
    height insight -- change "Scale uniformly by cell-width / frame-width" to
    "Scale by cell-width / polygon-height (~96px) so the hex polygon fills the cell without
    transparent-margin gaps. Frame native size is 120x140px; polygon occupies ~96px of that."

    After the edit, verify the constant is correct by reading the updated line back.
    Do not run the dev server -- browser verification is handled by the checkpoint in Plan 02.
  </action>
  <acceptance_criteria>
    - src/scenes/GameScene.js line 51 reads: const TILE_SCALE = 54 / 96;
    - No other lines in GameScene.js are changed (git diff shows only the TILE_SCALE line and the updated comment)
    - The file still imports cleanly (no syntax errors introduced): node --input-type=module does not apply here, but the edit must not break the import chain
  </acceptance_criteria>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| none | This plan edits one constant in a local JS file. No network, no user input, no external data. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-s3-01 | Tampering | TILE_SCALE constant | accept | Constant is compile-time; no runtime attack surface. |
</threat_model>

<verification>
After executing T01:
- Run: grep "TILE_SCALE" src/scenes/GameScene.js
- Expected output contains: const TILE_SCALE = 54 / 96;
- Run: grep -c "54 / 120" src/scenes/GameScene.js
- Expected: 0 (old value fully replaced)
</verification>

<success_criteria>
TILE_SCALE = 54 / 96 is present in GameScene.js and the old value 54 / 120 is absent.
When the game loads (verified in Plan 02's checkpoint), hex rows show no visible gap between sprites.
</success_criteria>

<output>
After completion, create .planning/phases/sprint-3/sprint-3-PLAN-01-SUMMARY.md
</output>
