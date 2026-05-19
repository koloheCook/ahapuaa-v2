// Ported from ahapuaa-game/src/data/constants.js + main.js per-column constants.
// TERRAIN_COLOR removed (replaced by atlas frame names in Phaser scenes).
export const COLS = 20;
export const ROWS = 56;

export const TERRAIN = {
  OCEAN:    'ocean',
  SHORE:    'shore',
  FLAT:     'flat',
  FOREST:   'forest',
  MOUNTAIN: 'mountain',
  STREAM:   'stream',
};

// Per-column map constraints (relocated from main.js). 3-peak valley/ridge ahupuaʻa geometry.
export const MT_DEPTH    = [10, 11, 10, 8, 6, 4, 3, 2, 2, 2, 2, 2, 3, 2, 4, 6, 8, 10, 11, 10];
export const SHORE_START = [42, 43, 41, 42, 43, 41, 43, 42, 41, 43, 42, 41, 43, 42, 41, 43, 41, 43, 42, 41];
export const SHORE_END   = [43, 44, 44, 43, 44, 44, 44, 44, 43, 44, 44, 43, 44, 44, 43, 44, 43, 44, 44, 43];
