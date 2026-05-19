import Phaser from 'phaser';
import { COLS, ROWS, MT_DEPTH, SHORE_START, SHORE_END, TERRAIN } from '../game/constants.js';
import { HexGrid } from '../game/HexGrid.js';
import { buildWorld } from '../game/worldGen.js';

// Atlas frame mapping per CLAUDE.md "Terrain frame -> game terrain mapping".
// Tints are programmatic placeholders for ocean/stream/forest (no native water/forest sprite).
const TERRAIN_TO_FRAME = {
  [TERRAIN.FLAT]:     'grass_01.png',
  [TERRAIN.MOUNTAIN]: 'stone_01.png',
  'peak-tip':         'stone_01.png',
  'peak-upper':       'stone_01.png',
  [TERRAIN.SHORE]:    'sand_01.png',
  [TERRAIN.OCEAN]:    'grass_01.png',
  [TERRAIN.STREAM]:   'grass_01.png',
  [TERRAIN.FOREST]:   'grass_01.png',
};

const TERRAIN_TO_TINT = {
  [TERRAIN.OCEAN]:  0x2255bb,
  [TERRAIN.STREAM]: 0x2255bb,
  [TERRAIN.FOREST]: 0x1a5c1a,
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // 1. Tilemap from the Tiled JSON loaded by PreloadScene.
    const map = this.make.tilemap({ key: 'ahupuaa-map' });

    // 2. Bind atlas texture to the tileset name declared in the JSON.
    const tileset = map.addTilesetImage('terrain', 'terrain');

    // 3. Create the terrain layer. Kept around for Sprint 2 input/camera work, but hidden:
    //    the Kenney atlas is a sprite sheet (tilecount: 1, frames are arbitrary-sized SubTextures),
    //    not a uniform tilegrid, so layer rendering produces noise. We stamp Images per-tile below.
    const layer = map.createLayer('terrain', tileset, 0, 0);
    layer.setVisible(false);

    // Kenney hexagonTerrain atlas frames are 120x140 px native. The Tiled JSON cell
    // footprint is 54x46. Scale uniformly by cell-width / frame-width so each hex
    // tessellates inside its cell. (Not in original Phaser 3 spec; logged as v2 delta.)
    const TILE_SCALE = 54 / 120;

    // 4. Build world state via the ported pipeline. tiles[col][row] is the canonical store.
    const grid = new HexGrid(COLS, ROWS);
    const { tiles, streamPath } = buildWorld(grid, {
      mtDepth: MT_DEPTH,
      shoreStart: SHORE_START,
      shoreEnd: SHORE_END,
    });

    // 5. Stamp each tile: position from map.tileToWorldXY, sprite from atlas, tint where applicable.
    let stamped = 0;
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const tile = tiles[col][row];
        const frame = TERRAIN_TO_FRAME[tile.terrainType] || 'grass_01.png';
        const { x, y } = map.tileToWorldXY(col, row);
        const img = this.add.image(x, y, 'terrain', frame);
        img.setScale(TILE_SCALE);

        const tint = TERRAIN_TO_TINT[tile.terrainType];
        if (tint !== undefined) img.setTint(tint);

        stamped++;
      }
    }

    // 6. Verification console output (Sprint 1 exit criteria 5 + 6).
    console.log(
      'tileToWorldXY test:',
      map.tileToWorldXY(0, 0),
      map.tileToWorldXY(10, 28),
      map.tileToWorldXY(19, 55)
    );
    console.log(
      'tiles spot check:',
      tiles[0][0].terrainType,
      tiles[10][28].terrainType,
      tiles[19][55].terrainType
    );
    console.log(`[GameScene] stamped ${stamped} tiles; stream path length: ${streamPath.size}`);
  }
}
