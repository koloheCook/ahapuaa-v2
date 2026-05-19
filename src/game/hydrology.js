// Random walk from first grey mountain row toward ocean.
// Uses Even-O offset neighbor math via HexGrid.getNeighbors().
// shoreEnd: per-column array of first ocean row.
// mtDepth:  per-column mountain depth — used to find the correct grey start row.
export function generateStream(grid, shoreEnd, mtDepth) {
  // Valid start positions: first visible grey mountain tile per column (cols 6–13).
  // mtDepth=1 → row 0 is peak-tip (black); no grey mountain — skip.
  // mtDepth=2 → row 0 is peak-upper (dark), row 1 is grey mountain.
  // mtDepth≥3 → row 0 is grey mountain.
  const validStarts = [];
  for (let c = 6; c <= 13; c++) {
    const d = mtDepth ? mtDepth[c] : 3;
    if (d >= 3)      validStarts.push([c, 0]);
    else if (d === 2) validStarts.push([c, 1]);
    // d === 1: skip — no grey mountain row visible
  }
  if (!validStarts.length) validStarts.push([10, 1]); // fallback, should not fire

  const MIN_PATH = 70;
  let path, startCol, startRow, endCol;
  let attempts = 0;

  do {
    attempts++;
    path = new Set();

    [startCol, startRow] = validStarts[Math.floor(Math.random() * validStarts.length)];
    let col = startCol;
    let row = startRow;
    let lastDelta = 0;
    path.add(`${col},${row}`);

    while (row < grid.rows - 1) {
      const neighbors = grid.getNeighbors(col, row).filter(([nc, nr]) => {
        if (nr < row) return false; // never upward
        // Lateral moves must not cross into ocean (shoreEnd varies per column)
        if (shoreEnd && nr === row && nr >= shoreEnd[nc]) return false;
        return true;
      });
      if (!neighbors.length) break;

      // Wall proximity — suppress inertia into the wall, add repulsion away from it
      const nearLeft  = col <= 2;
      const nearRight = col >= grid.cols - 3;

      const weights = neighbors.map(([nc, nr]) => {
        const dr = nr - row;
        const dc = nc - col;
        let w = 1.0;
        if (dr > 0) w += 1.0; // mild downward preference

        // Directional inertia — kills hugging by suppressing inertia toward walls
        if (dc !== 0 && dc === lastDelta) {
          const intoWall = (dc < 0 && nearLeft) || (dc > 0 && nearRight);
          if (!intoWall) w += 2.5;
        }

        // Explicit repulsion when already pressed against an edge
        if (dc > 0 && col <= 1)              w += 2.0; // push right near left wall
        if (dc < 0 && col >= grid.cols - 2)  w += 2.0; // push left near right wall

        return w;
      });

      const total = weights.reduce((s, w) => s + w, 0);
      let rand = Math.random() * total;
      let chosen = neighbors[neighbors.length - 1];
      for (let i = 0; i < neighbors.length; i++) {
        rand -= weights[i];
        if (rand <= 0) { chosen = neighbors[i]; break; }
      }

      const [nc, nr] = chosen;
      lastDelta = nc - col;
      col = nc;
      row = nr;
      path.add(`${col},${row}`);

      // Stop at first ocean row — this is the river mouth (1 blue tile in ocean)
      if (shoreEnd && row >= shoreEnd[col]) break;
    }

    endCol = col;
  } while (path.size < MIN_PATH && attempts < 15);

  if (path.size < MIN_PATH) {
    console.warn(`[Stream] min path ${MIN_PATH} not reached after ${attempts} attempts (got ${path.size})`);
  }

  console.log(`[Stream] start (${startCol},${startRow}), end col: ${endCol}, path: ${path.size} tiles, attempts: ${attempts}`);
  return { path, startCol, endCol };
}

export function isStreamTile(col, row, streamPath) {
  return streamPath.has(`${col},${row}`);
}

// Sets isWet = true on stream tiles AND their flat/forest neighbors (loi adjacency).
// grid is required for getNeighbors() — passes the locked Even-O math.
export function propagateWater(tiles, streamPath, grid) {
  for (const key of streamPath) {
    const [col, row] = key.split(',').map(Number);
    if (tiles[col]?.[row]) tiles[col][row].isWet = true;
  }

  for (const key of streamPath) {
    const [col, row] = key.split(',').map(Number);
    for (const [nc, nr] of grid.getNeighbors(col, row)) {
      const t = tiles[nc]?.[nr];
      if (t && (t.terrainType === 'flat' || t.terrainType === 'forest')) {
        t.isWet = true;
      }
    }
  }
}

// Returns true only when the tile is wet and can support a Loʻi Kalo.
export function canPlaceLoi(tile) {
  return tile.isWet === true &&
    (tile.terrainType === 'flat' || tile.terrainType === 'stream');
}
