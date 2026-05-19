# Phaser 3 to Phaser 4 API Audit

Pre-sprint research, dated 2026-05-18. Verified against Phaser 4.1.0 "Salusa"
(released 2026-04-30) and the migration guide at
https://github.com/phaserjs/phaser/blob/master/changelog/v4/4.0/MIGRATION-GUIDE.md.

This audit covers only the API surface the locked Sprint 1 spec invokes. If
implementation surfaces deltas beyond this list, log them in DEVLOG with the
actual error/fix observed.

## Verdict

The Sprint 1 spec ports to Phaser 4 essentially verbatim. One game config line
(`roundPixels: true`) is the only required code-level change.

## API table

| API | v4 status | Notes |
|---|---|---|
| `this.load.atlasXML(key, png, xml)` | unchanged | Used in PreloadScene for terrain + buildings atlases. |
| `this.load.tilemapTiledJSON(key, json)` | unchanged | Used in PreloadScene for ahupuaa.json. |
| `this.load.atlas(key, png, json)` | unchanged | Not used in Sprint 1, but available. |
| `this.make.tilemap({ key })` | unchanged | Used in GameScene.create(). |
| `map.addTilesetImage(name, key)` | unchanged | Used in GameScene.create(). |
| `map.createLayer(layerId, tileset, x, y)` | unchanged | Use standard `TilemapLayer`. `TilemapGPULayer` does NOT support hex tilemaps. |
| `map.tileToWorldXY(col, row)` | unchanged | Same signature, same return shape, same coordinate origin. |
| `this.add.image(x, y, key, frame)` | unchanged | Used to stamp each tile. |
| `image.setTint(0xRRGGBB)` | unchanged | Standard tint behavior preserved. |
| `image.setTintFill(0xRRGGBB)` | REMOVED | Use `setTint().setTintMode(Phaser.TintModes.FILL)`. Sprint 1 does not use fill mode. |
| Game config (`type`, `parent`, `width`, `height`, `scene[]`) | unchanged | Standard config shape preserved. |
| `roundPixels` config flag | DEFAULT CHANGED | v3 default was `true`; v4 default is `false`. Set explicitly. |
| Scene lifecycle (`preload`, `create`, `update`) | unchanged | Hooks fire in the same order. |
| `pixelArt: true` shortcut | unchanged | Still toggles `antialias: false` + `roundPixels: true`. |

## Three deltas, only one applies to Sprint 1

1. **`setTintFill()` removed.** Sprint 1 only uses additive tint (`setTint`),
   so this is moot. Documented here in case Sprint 2+ needs fill mode.
2. **`roundPixels` default flipped.** Restore Sprint 1 behavior by setting
   `roundPixels: true` in the game config in `main.js`. Done.
3. **`TilemapGPULayer` does not support hex.** Sprint 1 already uses standard
   `TilemapLayer` via `map.createLayer(...)`, so this is moot. Listed here as
   a do-not-experiment-with note for future sprints.

## What this audit does NOT verify

These need actual observation during the sprint and should be recorded in
DEVLOG if any surprise:

- Whether `roundPixels: true` is sufficient to produce visually identical
  output to the Phaser 3 baseline (a behavioral verification only the running
  build can give us).
- Whether the Tiled object `properties` array-of-objects quirk (CLAUDE.md
  "Tiled object property format" section) still applies in Phaser 4. Not
  exercised by Sprint 1 but will be in Sprint 2.
- Whether the canvas DPR / scale handling diverges visually from Phaser 3.
- Frame-by-frame rendering performance vs. the Phaser 3 baseline.

## Source links

- Phaser 4.0.0 release: https://phaser.io/download/release/v4.0.0
- Phaser 4.1.0 "Salusa" release: https://phaser.io/news/2026/04/phaser-4-1-0-salusa-release
- Migration guide: https://github.com/phaserjs/phaser/blob/master/changelog/v4/4.0/MIGRATION-GUIDE.md
- Pixel Art Guide: https://github.com/phaserjs/phaser/blob/master/docs/Phaser%204%20Pixel%20Art%20Guide/Phaser%204%20Pixel%20Art%20Guide.md
- TilemapGPULayer docs (hex-unsupported note): https://docs.phaser.io/api-documentation/class/tilemaps-tilemapgpulayer
