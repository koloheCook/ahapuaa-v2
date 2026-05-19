import Phaser from 'phaser';
import PreloadScene from './src/scenes/PreloadScene.js';
import GameScene from './src/scenes/GameScene.js';

// Phaser 4 note: roundPixels default flipped from true (v3) to false (v4).
// Set explicitly to restore Sprint 1 expected behavior. See PHASER_4_AUDIT.md.
const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1200,
  height: 900,
  backgroundColor: '#1a1a2e',
  roundPixels: true,
  scene: [PreloadScene, GameScene],
};

new Phaser.Game(config);
