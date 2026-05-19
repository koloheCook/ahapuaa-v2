// generateTiledMap.js
// Run once before Sprint 1: node scripts/generateTiledMap.js
// Outputs public/maps/ahupuaa.json -- the Tiled hex map Phaser loads.
//
// Tile dimensions confirmed by Spike A + Spike C (Kenney Hexagon Pack):
//   tileWidth: 54, tileHeight: 46, hexsidelength: 23
//   stagger-axis: y, stagger-index: odd (odd rows shift right by tileWidth/2)
//
// Sprint 1 note: all tiles initialized to index 1. worldGen.js stamps terrain
// types at runtime by updating tile indices. The tileset entry named "terrain"
// must match the key passed to map.addTilesetImage('terrain', ...) in Phaser.

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const COLS = 20;
const ROWS = 56;
const TILE_WIDTH = 54;
const TILE_HEIGHT = 46;
const HEX_SIDE = 23;

// Row-major order: index = row * COLS + col
// All tiles set to 1 (first tileset entry -- worldGen overwrites at runtime)
const tileData = new Array(COLS * ROWS).fill(1);

const map = {
  compressionlevel: -1,
  height: ROWS,
  hexsidelength: HEX_SIDE,
  infinite: false,
  layers: [
    {
      data: tileData,
      height: ROWS,
      id: 1,
      name: 'terrain',
      opacity: 1,
      type: 'tilelayer',
      visible: true,
      width: COLS,
      x: 0,
      y: 0
    }
  ],
  nextlayerid: 2,
  nextobjectid: 1,
  orientation: 'hexagonal',
  renderorder: 'right-down',
  staggeraxis: 'y',
  staggerindex: 'odd',
  tiledversion: '1.10.2',
  tileheight: TILE_HEIGHT,
  tilesets: [
    {
      columns: 1,
      firstgid: 1,
      // Path is relative to the JSON file location (public/maps/).
      // Phaser ignores this path -- it uses the texture key from addTilesetImage.
      image: '../assets/terrain/hexagonTerrain_sheet.png',
      imageheight: TILE_HEIGHT,
      imagewidth: TILE_WIDTH,
      margin: 0,
      name: 'terrain',
      spacing: 0,
      tilecount: 1,
      tileheight: TILE_HEIGHT,
      tilewidth: TILE_WIDTH
    }
  ],
  tilewidth: TILE_WIDTH,
  type: 'map',
  version: '1.10',
  width: COLS
};

const outputDir = join(__dirname, '..', 'public', 'maps');
mkdirSync(outputDir, { recursive: true });

const outputPath = join(outputDir, 'ahupuaa.json');
writeFileSync(outputPath, JSON.stringify(map, null, 2));

console.log(`Generated: ${outputPath}`);
console.log(`  Grid: ${COLS}x${ROWS} hexagonal`);
console.log(`  Stagger: axis=y index=odd (odd rows shift right)`);
console.log(`  Tile: ${TILE_WIDTH}x${TILE_HEIGHT}px, hexsidelength=${HEX_SIDE}`);
console.log(`  Tiles: ${COLS * ROWS} total, all initialized to index 1`);
console.log(`  Load in Phaser: this.load.tilemapTiledJSON('ahupuaa-map', 'maps/ahupuaa.json')`);
