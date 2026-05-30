import Phaser from 'phaser';

// PreloadScene loads all assets with canonical keys (see CLAUDE.md "Asset Keys").
// Phaser 4 status: atlasXML() and tilemapTiledJSON() are unchanged from Phaser 3.
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // Terrain atlas (Kenney - Starling XML format).
    this.load.atlasXML(
      'terrain',
      'assets/terrain/hexagonTerrain_sheet.png',
      'assets/terrain/hexagonTerrain_sheet.xml'
    );

    // Buildings atlas (Kenney - Starling XML format). Loaded for Sprint 2; harmless in Sprint 1.
    this.load.atlasXML(
      'buildings',
      'assets/buildings/hexagonBuildings_sheet.png',
      'assets/buildings/hexagonBuildings_sheet.xml'
    );

    // Tiled hex tilemap JSON.
    this.load.tilemapTiledJSON('ahupuaa-map', 'maps/ahupuaa.json');

    // Audio (canonical keys from CLAUDE.md "Asset Keys").
    this.load.audio('click',   'assets/audio/click1.ogg');
    this.load.audio('success', 'assets/audio/success.ogg');
    this.load.audio('alert',   'assets/audio/alert.ogg');
    this.load.audio('ambient', 'assets/audio/forest-ambience.mp3');

    // Surface load errors loudly during Sprint 1 verification.
    this.load.on('loaderror', (file) => {
      console.error('[Preload] load error:', file.key, file.src);
    });
  }

  create() {
    console.log('[Preload] complete. Transitioning to GameScene.');
    this.scene.start('GameScene');
  }
}
