// src/game/techs.js -- Systems layer (zero Phaser imports -- do not add any)
//
// Owns all tech unlock conditions for the Ahupuaa game.
// New tech conditions: add a check block here following the same pattern:
//   if (<condition> && !state.techs.includes('<techName>')) {
//     state.techs.push('<techName>');
//     newTechs.push('<techName>');
//   }

/**
 * Evaluates all tech unlock conditions against current state.
 * Mutates state.techs[] directly by pushing newly-unlocked tech strings.
 * Returns an array of newly-unlocked tech strings (empty array if none changed).
 * Idempotent: calling multiple times does not double-push (guarded by !includes check).
 *
 * @param {object} state - game state (state.buildings, state.resources.ike, state.techs)
 * @returns {string[]} newly-unlocked tech names
 */
export function checkTechUnlocks(state) {
  const newTechs = [];

  // Carpentry Eureka (D-06): unlocks when 3 or more hale have been built.
  // Immediate unlock -- GameScene calls this after placeBuilding() so the
  // player can use T2 hale in the same click session (Civ6 model, D-07).
  const haleCount = Object.values(state.buildings).filter(b => b.type === 'hale').length;
  if (haleCount >= 3 && !state.techs.includes('carpentry')) {
    state.techs.push('carpentry');
    newTechs.push('carpentry');
  }

  // Masonry threshold (D-08): unlocks when ike accumulates to 3 or more.
  // Threshold 3 is a placeholder calibrated to the current annual ike model;
  // re-evaluate when ike collection cadence changes (quarterly design question).
  if (state.resources.ike >= 3 && !state.techs.includes('masonry')) {
    state.techs.push('masonry');
    newTechs.push('masonry');
  }

  return newTechs;
}
