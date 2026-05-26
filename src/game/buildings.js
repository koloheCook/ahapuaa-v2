const PLACEMENT_COSTS = {
  hale:     [{ wood: 3 }, { wood: 5, stone: 2 }, { wood: 5, stone: 5 }],
  loi:      [{ wood: 2 }],
  'loko-ia':[{ stone: 3 }],
};

const LAND_TERRAIN  = new Set(['flat', 'forest', 'mountain']);
const LOI_TERRAIN   = new Set(['flat', 'stream']);
const LOKO_TERRAIN  = new Set(['shore', 'stream', 'ocean']);

function hasFunds(resources, cost) {
  return Object.entries(cost).every(([res, amt]) => (resources[res] ?? 0) >= amt);
}

export function canPlace(tile, type, tier, state) {
  if (tile.buildingId !== null) {
    return { ok: false, reason: 'tile already occupied' };
  }

  if (tile.forestLevel > 0) {
    return { ok: false, reason: 'must harvest forest (forestLevel > 0) before building here' };
  }

  if (tile.terrainType === 'mountain') {
    return { ok: false, reason: 'mountain tiles are not buildable' };
  }

  if (type === 'hale') {
    if (!LAND_TERRAIN.has(tile.terrainType)) {
      return { ok: false, reason: `hale requires land tile, got ${tile.terrainType}` };
    }
    if (tier === 1 && !state.techs.includes('carpentry')) {
      return { ok: false, reason: 'tier 1 hale requires carpentry tech' };
    }
    if (tier === 2 && !(state.techs.includes('carpentry') && state.techs.includes('masonry'))) {
      return { ok: false, reason: 'tier 2 hale requires carpentry + masonry' };
    }
  } else if (type === 'loi') {
    if (!tile.isWet) {
      return { ok: false, reason: 'loi requires wet tile' };
    }
    if (!LOI_TERRAIN.has(tile.terrainType)) {
      return { ok: false, reason: `loi requires flat or stream tile, got ${tile.terrainType}` };
    }
  } else if (type === 'loko-ia') {
    if (!tile.isWet) {
      return { ok: false, reason: 'loko-ia requires wet tile' };
    }
    if (!LOKO_TERRAIN.has(tile.terrainType)) {
      return { ok: false, reason: `loko-ia requires shore or stream tile, got ${tile.terrainType}` };
    }
  } else {
    return { ok: false, reason: `unknown building type: ${type}` };
  }

  const costs = PLACEMENT_COSTS[type];
  const cost  = costs[Math.min(tier, costs.length - 1)];
  if (!hasFunds(state.resources, cost)) {
    return { ok: false, reason: `insufficient resources - need ${JSON.stringify(cost)}` };
  }

  return { ok: true, reason: '' };
}

export function placeBuilding(tile, type, tier, state) {
  const check = canPlace(tile, type, tier, state);
  if (!check.ok) {
    console.log(`[Place] REJECTED ${type} tier${tier} at (${tile.col},${tile.row}): ${check.reason}`);
    return false;
  }

  const costs = PLACEMENT_COSTS[type];
  const cost  = costs[Math.min(tier, costs.length - 1)];

  for (const [res, amt] of Object.entries(cost)) {
    state.resources[res] -= amt;
  }

  const id = `${type}-${tile.col}-${tile.row}`;
  state.buildings[id] = { id, type, tier, col: tile.col, row: tile.row, laborCost: 1, output: {} };
  tile.buildingId = id;

  if (type === 'hale') recalcPopCap(state);

  console.log(
    `[Place] ${type} tier${tier} at (${tile.col},${tile.row}) | cost: ${JSON.stringify(cost)}` +
    ` | populationCap: ${state.populationCap} | resources:`, { ...state.resources }
  );
  return true;
}

export function removeBuilding(tile, state) {
  if (!tile.buildingId) return;
  delete state.buildings[tile.buildingId];
  tile.buildingId = null;
  recalcPopCap(state);
}

export function recalcPopCap(state) {
  const tierBonus = [5, 10, 15];
  let cap = 0;
  for (const b of Object.values(state.buildings)) {
    if (b.type === 'hale') cap += tierBonus[b.tier] ?? 5;
  }
  state.populationCap = cap;
}
