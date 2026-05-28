export function processTick(state, tiles) {
  const month = ((state.turn - 1) % 12) + 1;
  const isWetSeason = month >= 11 || month <= 4;

  for (const building of Object.values(state.buildings)) {
    const tile = tiles[building.col][building.row];
    const mult = tile.nutrients / 100;

    if (building.type === 'loi') {
      state.resources.taro += Math.round((isWetSeason ? 1.5 : 1.0) * 3 * mult);
    } else if (building.type === 'loko-ia') {
      state.resources.fish += Math.round(3 * mult);
    }
  }

  state.resources.taro -= state.population;
  state.resources.taro = Math.max(0, state.resources.taro);

  if (state.resources.taro < 0) {
    state.population = Math.max(0, state.population - 1);
  }

  state.month = month;
  if (state.turn % 12 === 0) {
    state.year++;
    state.month = 1;
    const heiauCount = Object.values(state.buildings).filter(b => b.type === 'heiau').length;
    state.resources.ike = Math.max(0, state.resources.ike + heiauCount * 2 + 1);
  }

  console.log(`[Turn ${state.turn}] Resources:`, { ...state.resources }, '| Population:', state.population);
}
