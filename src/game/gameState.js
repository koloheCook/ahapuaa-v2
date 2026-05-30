// Ported verbatim from ahapuaa-game/src/core/gameState.js. Zero modifications.
export const state = {
  resources: { taro: 10, fish: 10, wood: 10, stone: 10, tools: 10, ike: 0 },
  population: 5,
  populationCap: 5, // baseline (Sprint 5 fix: matches population: 5 start value; recalcPopCap overwrites on first hale)
  buildings: {},
  turn: 0,
  techs: [],
  month: 1,
  year: 1,
};
