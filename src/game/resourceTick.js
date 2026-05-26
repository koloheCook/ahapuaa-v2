export function processTick(state, tiles) {
  for (const building of Object.values(state.buildings)) {
    const tile = tiles[building.col][building.row];
    const mult = tile.nutrients / 100;

    if (building.type === 'loi') {
      state.resources.taro += Math.round(3 * mult);
    } else if (building.type === 'loko-ia') {
      state.resources.fish += Math.round(3 * mult);
    }
  }

  state.resources.taro -= state.population;
  state.resources.taro = Math.max(0, state.resources.taro);

  if (state.resources.taro < 0) {
    state.population = Math.max(0, state.population - 1);
  }

  console.log(`[Turn ${state.turn}] Resources:`, { ...state.resources }, '| Population:', state.population);
}
