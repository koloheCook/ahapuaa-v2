import { COLS, ROWS, TERRAIN } from './constants.js';
import { generateStream, propagateWater } from './hydrology.js';

// BFS flood-fill forest clumps on flat/mountain tiles at or below the tree line.
// Tree line is per-column: FOREST_MIN_ROW[col] = mtDepth[col] + 2.
// The initial terrain band (assignTerrain) places visual forest above the tree line, but
// those tiles carry forestLevel 0 (no harvestable wood) unless set by a deity event.
// Each generated clump gets a random density level (1–3) shared by all its tiles.
// Returns array of clump tile arrays for console logging and future use (e.g. generateBirds).
export function generateForests(tiles, grid, mtDepth) {
  const FOREST_MIN_ROW = mtDepth.map(d => d + 2);

  const candidates = [];
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const tile = tiles[col][row];
      if (
        (tile.terrainType === TERRAIN.FLAT || tile.terrainType === TERRAIN.MOUNTAIN) &&
        tile.row >= FOREST_MIN_ROW[col]
      ) {
        candidates.push(tile);
      }
    }
  }

  const targetClumps = 4 + Math.floor(Math.random() * 4); // 4–7
  const allClumps = [];
  const claimedKeys = new Set();

  for (let i = 0; i < targetClumps; i++) {
    let placed = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      const available = candidates.filter(t => !claimedKeys.has(`${t.col},${t.row}`));
      if (available.length === 0) break;

      const seed = available[Math.floor(Math.random() * available.length)];
      const clumpKeys = new Set([`${seed.col},${seed.row}`]);
      const clumpTiles = [seed];
      const queue = [seed];

      while (queue.length > 0 && clumpTiles.length < 8) {
        const current = queue.shift();
        for (const [nc, nr] of grid.getNeighbors(current.col, current.row)) {
          const key = `${nc},${nr}`;
          if (clumpKeys.has(key) || claimedKeys.has(key)) continue;
          if (nr < FOREST_MIN_ROW[nc]) continue;
          const neighbor = tiles[nc][nr];
          const t = neighbor.terrainType;
          if (t === TERRAIN.STREAM || t === TERRAIN.SHORE || t === TERRAIN.OCEAN) continue;
          clumpKeys.add(key); // mark visited to avoid repeat probability rolls
          if (Math.random() < 0.7) {
            clumpTiles.push(neighbor);
            queue.push(neighbor);
          }
        }
      }

      if (clumpTiles.length >= 3) {
        placed = clumpTiles;
        break;
      }
    }

    if (placed) {
      allClumps.push(placed);
      for (const tile of placed) claimedKeys.add(`${tile.col},${tile.row}`);
    }
  }

  // Stamp: each clump gets one random density level shared by all its tiles.
  // originalTerrain (flat or mountain) is already set on the tile from Pass 2 and is preserved.
  for (const clump of allClumps) {
    const level = 1 + Math.floor(Math.random() * 3); // 1, 2, or 3
    for (const tile of clump) {
      const t = tiles[tile.col][tile.row];
      t.terrainType = TERRAIN.FOREST;
      t.forestLevel = level;
    }
  }

  const sizes = allClumps.map(c => c.length);
  const total = sizes.reduce((s, n) => s + n, 0);
  console.log(`[Forests] ${allClumps.length} clumps placed — sizes: [${sizes.join(', ')}] — total: ${total} tiles`);

  return allClumps;
}

// Derives a tile's terrain type from map constraints and the stream path.
// Stream tiles override all other terrain — checked first.
function assignTerrain(col, row, streamPath, mtDepth, shoreStart, shoreEnd) {
  if (streamPath.has(`${col},${row}`)) return TERRAIN.STREAM;
  const d = mtDepth[col];
  if (row === 0 && d === 1) return 'peak-tip';
  if (row === 0 && d === 2) return 'peak-upper';
  if (row < d)              return TERRAIN.MOUNTAIN;
  if (row < d + 4)          return TERRAIN.FOREST;
  if (row >= shoreEnd[col]) return TERRAIN.OCEAN;
  if (row >= shoreStart[col]) return TERRAIN.SHORE;
  return TERRAIN.FLAT;
}

// Generation pipeline. Each pass is independent: generators return geometry,
// stamp functions apply it to tiles. Add new passes (forests, birds, etc.) here
// in the order they should run — later passes can read state set by earlier ones.
export function buildWorld(grid, { mtDepth, shoreStart, shoreEnd }) {
  // Pass 1: stream geometry
  const { path: streamPath } = generateStream(grid, shoreEnd, mtDepth);

  // Pass 2: initialize tile grid — terrain type is resolved here so every
  // downstream pass reads a fully typed tile, not a partially built one.
  const tiles = [];
  for (let col = 0; col < COLS; col++) {
    tiles[col] = [];
    for (let row = 0; row < ROWS; row++) {
      const terrainType = assignTerrain(col, row, streamPath, mtDepth, shoreStart, shoreEnd);
      // The initial assignTerrain forest band returns 'forest' but underlies flat land.
      // originalTerrain must reflect what the tile reverts to when forestLevel hits 0,
      // so forest-band tiles revert to 'flat', not back to 'forest'.
      const originalTerrain = terrainType === TERRAIN.FOREST ? TERRAIN.FLAT : terrainType;
      tiles[col][row] = {
        col,
        row,
        terrainType,
        originalTerrain,
        isWet: false,
        nutrients: 50,
        forestLevel: 0,
        buildingId: null,
        hasLava: false,
      };
    }
  }

  // Pass 3: water propagation — stream tiles + flat/forest neighbors
  propagateWater(tiles, streamPath, grid);

  // Pass 3b: all ocean tiles are inherently wet (enables loko iʻa placement)
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      if (tiles[col][row].terrainType === TERRAIN.OCEAN) {
        tiles[col][row].isWet = true;
      }
    }
  }

  // Pass 4: forest generation — must run after water propagation so isWet is settled
  generateForests(tiles, grid, mtDepth);

  // Future passes go here, in build order:
  // Pass 5: generateBirds() → stampBirds(tiles, birdSpawns)

  return { tiles, streamPath };
}
